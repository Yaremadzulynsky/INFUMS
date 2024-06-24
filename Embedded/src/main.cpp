/**
* @File: main.cpp
* @Author: Yarema Dzulynsky
* @Date: 2023-04-23
* @Description: This Arduino code is designed for a Blackbox module communicates with the Iridium
 * satellite network and a Pixhawk flight controller. It collects flight data such as attitude and global position from
 * the Pixhawk, processes it, and periodically sends it via the Iridium network. The code also handles communication
 * with the Iridium 9602N satellite modem, processing of incoming configuration messages, and control of the onboard
 * RGB LED for status indication.
*/
#include <main.h>
#include "Iridium9602N/Iridium9602N.h"
#include "MavlinkInterpreter/MavlinkInterpreter.h"
#include "AsyncScheduler/AsyncTimeScheduler.h"
#include "DistanceScheduler/AsyncDistanceScheduler.h"
#include "DiagnosticTools/RGBLED.h"
#include "DiagnosticTools/GlobalDiagnosticLED.h"

/**
 * Setup pins on the Arduino MKR
 */
void setupPins();

/**
 * Setup serial communication between:
 * \n Arduino MKR and the Iridium 9602N
 * \n Arduino MKR and the Pixhawk 6C
 */
void setupSerial();

/**
 * Setup objects that are used in the program
 */
void setupObjects();

/**
 * Setup async processes. This includes:
 * \n - Parsing and queuing Mavlink messages
 * \n - Requesting Mavlink messages
 * \n - Blinking the MKR LED
 * \n - Receiving configuration messages from the Iridium 9602N
 */
void setupAsyncProcesses();

/**
 * Interpret Iridium error and success messages and set the appropriate LED states.
 * @param message - the message to interpret.
 */
void interpretIridiumMessage(String &message);

// Global variables
MavlinkInterpreter mavlinkInterpreter;
Iridium9602N iridium9602N(SerialSAT, SLEEP_PIN, RING_PIN);
//Iridium9602NMock iridium9602N(SerialSAT, SLEEP_PIN, RING_PIN);

RGBLED rgbLED(7, 8, 9, RGBLED::START_DELAY);

// Global async time schedulers
AsyncTimeScheduler *parseAndQueueMavlinkScheduler;
AsyncTimeScheduler *requestMavlinkScheduler;
AsyncTimeScheduler *blinkMKRLed;
AsyncTimeScheduler *receiveConfigurationScheduler;


// Global async distance schedulers
AsyncDistanceScheduler *pushViaSatDistanceScheduler;

void setup() {

    // Initialize pins
    setupPins();

    // Setup serial communication
    setupSerial();


    // **Setup objects before async processes**
    setupObjects();

    prevFuncTime = millis();
    //Set the rgbLED state to indicate that the program is currently within the start delay.
    rgbLED.setState(RGBLED::START_DELAY);
    while (millis() < (prevFuncTime + startDelayMillis)) {
        rgbLED.asyncRun();
        delay(100);
    }

    prevFuncTime = millis();
    //Set the rgbLED state to indicate that the program is currently waiting for a GPS lock.
    rgbLED.setState(RGBLED::WAITING_FOR_GPS_LOCK);
    mavlink_message_t message;
    do {
        mavlinkInterpreter.requestMavlinkMessage(MAVLINK_MSG_ID_GLOBAL_POSITION_INT);
        message = mavlinkInterpreter.receiveMavlinkMessage(MAVLINK_MSG_ID_GLOBAL_POSITION_INT);
        rgbLED.asyncLEDDelay(100);

        if (message.len != 0) {
            iridium9602N.gpsFix = true;

        }
        if (millis() > (prevFuncTime + gpsLockTimeoutMillis)) {
            break;
        }
    } while (message.len == 0);

    // Attach interrupt to ring pin
    attachInterrupt(digitalPinToInterrupt(RING_PIN), []() {
        iridium9602N.ringInterrupt = true;
        Serial.println("Ring interrupt triggered");
    }, FALLING);

    //Set the rgbLED state to indicate that the program is currently attempting to send a boot up message.
    rgbLED.setState(RGBLED::SENDING_BOOTUP_MESSAGE);
    // Try to send boot up message until it is successfully sent
    while (!iridium9602N.sendBootUpMessage()) {
        rgbLED.asyncRun();
        delay(100);
    }


    //Set the rgbLED state to indicate that the program is currently attempting to receive a configuration message.
    rgbLED.setState(RGBLED::SEND_RECEIVE_CONFIG);

    //void any previous pin interrupts that may have been somehow triggered
    iridium9602N.ringInterrupt = false;


    prevFuncTime = millis();
    //create a response packet
    ConfigResponsePacket responsePacket;
//    responsePacket.GPSFix = gpsLock;
    while (!iridium9602N.receiveConfigurationMode(responsePacket, uploadData, uploadIntervalMillis)) {
        rgbLED.asyncRun();

        //break out of the loop if the configTimoutMillis has been reached
        if (millis() > (prevFuncTime + configTimoutMillis)) {
            break;
        }
        delay(100);
    }


    if (!iridium9602N.configReceived) {
        //Set the rgbLED state to indicate that the configuration timout has been reached.
        rgbLED.setState(RGBLED::CONFIG_TIMOUT);
        //delay for 5 seconds while blinking the led
        rgbLED.asyncLEDDelay(5 * 1000ul);
    }

    // Setup async processes
    setupAsyncProcesses();

    // Request Mavlink messages
    mavlinkInterpreter.requestMavlinkMessages({MAVLINK_MSG_ID_ATTITUDE, MAVLINK_MSG_ID_GLOBAL_POSITION_INT});

    //determine the specific operational state of the Blackbox
    if (iridium9602N.configReceived && uploadData) {
        rgbLED.setState(RGBLED::IN_FLIGHT);
    } else if (!uploadData) {
        rgbLED.setState(RGBLED::IN_FLIGHT_NO_UPLOAD);
    } else {
        rgbLED.setState(RGBLED::IN_FLIGHT_DEFAULT);
    }
}

void loop() {
    //blink the MKR LED every 1000 ms
    blinkMKRLed->run();
    //request Mavlink messages every 10000 ms
    requestMavlinkScheduler->run();
    //Actively filter the Pixhawk serial stream to try to receive the requested Mavlink messages then parse and queue
    // them in the Iridium9602N object.
    parseAndQueueMavlinkScheduler->run();

    /**
     * This is essentially an inline AsyncTimeScheduler, however, I am not using the AsyncTimeScheduler class because the
     * upload interval is not a constant. This is because the upload interval is determined by the configuration message
     * received from the Iridium 9602N. Doing it this way, I can change the upload interval during runtime and it will
     * be memory safe.
     */
    if (uploadData && millis() - prevSatUpdateTime > uploadIntervalMillis) {

        /**
         * Try to send a complete telemetry message via the Iridium 9602N. If the message is not successfully sent,
         * then check to see if it is because the Pixhawk GPS does not have a fix by checking if the attitude
         * information is present, as with attitude information present the only thing that could cause
         * iridium9602N.verifyAndPushOutSatQueue() to be false is if the Global position int message is missing due to
         * a GPS fix error. If the Pixhawk GPS does not have a fix, then set the rgbLED state to indicate that the
         * Pixhawk GPS does not have a fix.
         */

        if (!iridium9602N.verifyAndPushOutSatQueue() && iridium9602N.attitudeInQueue) {
            rgbLED.setState(RGBLED::NO_GPS_FIX);
            rgbLED.asyncLEDDelay(1000ul);
            Serial.println("No GPS fix. Not sending telemetry message.");
        }

        //reset the prevSatUpdateTime
        prevSatUpdateTime = millis();

        //determine the specific operational state of the Blackbox
        if (iridium9602N.configReceived && uploadData) {
            rgbLED.setState(RGBLED::IN_FLIGHT);
        } else if (!uploadData) {
            rgbLED.setState(RGBLED::IN_FLIGHT_NO_UPLOAD);
        } else {
            rgbLED.setState(RGBLED::IN_FLIGHT_DEFAULT);
        }
    }

    //check to see if a ring alert has been received from the Iridium 9602N. if so receive the message.
    receiveConfigurationScheduler->run();

    //blink the MKR LED every 1000 ms
    rgbLED.asyncRun();
}

void setupPins() {
    // Set pins to output
    pinMode(LED_BUILTIN, OUTPUT);
    pinMode(SLEEP_PIN, OUTPUT);
    pinMode(DTR_PIN, OUTPUT);
    pinMode(RTS_PIN, OUTPUT);

    // Set pins to input
    pinMode(RING_PIN, INPUT_PULLUP);

    // Set pins to default state
    digitalWrite(SLEEP_PIN, HIGH);
    digitalWrite(DTR_PIN, LOW);
    digitalWrite(RTS_PIN, LOW);
    digitalWrite(LED_BUILTIN, LOW);
}

void setupSerial() {
    // Initialize serial communication at the selected BAUD_RATE
    Serial.begin(BAUD_RATE);

    // Wait for serial port to connect
#if !PRODUCTION_ENV
    while (!Serial);
    Serial.println("Serial initialized");
#endif

    // Initialize serial communication with the Iridium satellite modem
    SerialSAT.begin(19200);

    // Assign the RX and TX pins to the SERCOM peripheral
    pinPeripheral(1, PIO_SERCOM); // Assign RX function to pin 1
    pinPeripheral(0, PIO_SERCOM); // Assign TX function to pin 0
}

void setupObjects() {
    mavlinkInterpreter = MavlinkInterpreter(BAUD_RATE);
    iridium9602N.setup();
}

void setupAsyncProcesses() {

    // Parse and queue Mavlink messages
    parseAndQueueMavlinkScheduler = new AsyncTimeScheduler(1000, []() {
        // Receive Mavlink messages and insert them into the satellite queue
        std::vector<mavlink_message_t> fulfilledMsgRequests = mavlinkInterpreter.receiveMavlinkMessages();


        /**
         * Loop through each fulfilled message request and insert it into the satellite queue.
         */
        for (mavlink_message_t message: fulfilledMsgRequests) {
            Serial.println(mavlinkInterpreter.toANSI(message));
            iridium9602N.insertIntoSatQueue(message);
        }

            tm time = {0, 0, 0, 0, 0, 0};
            iridium9602N.modem.getSystemTime(time);
            iridium9602N.currentMeasurementUnixTime = mktime(&time);

        //determine the specific operational state of the Blackbox
        if (iridium9602N.configReceived && uploadData) {
            rgbLED.setState(RGBLED::IN_FLIGHT);
        } else if (!uploadData) {
            rgbLED.setState(RGBLED::IN_FLIGHT_NO_UPLOAD);
        } else {
            rgbLED.setState(RGBLED::IN_FLIGHT_DEFAULT);
        }
    });

// Request Mavlink messages
    requestMavlinkScheduler = new AsyncTimeScheduler(10000, []() {
        // Request Mavlink messages from the Pixhawk
        mavlinkInterpreter.requestMavlinkMessages({MAVLINK_MSG_ID_ATTITUDE, MAVLINK_MSG_ID_GLOBAL_POSITION_INT});
    });

// Blink onboard LED
    blinkMKRLed = new AsyncTimeScheduler(1000, []() {
        // Toggle the LED state
        ledState = !ledState;
        // Write the LED state to the onboard LED
        digitalWrite(LED_BUILTIN, ledState);
    });

// Receive configuration
    receiveConfigurationScheduler = new AsyncTimeScheduler(1000, []() {

        // Check to see if a ring alert has been received from the Iridium 9602N. If so, receive the message.
        ConfigResponsePacket responsePacket;
        if (iridium9602N.receiveConfigurationMode(responsePacket, uploadData, uploadIntervalMillis)) {
            Serial.println("configurationReceived: " + String(iridium9602N.configReceived));
            Serial.println("uploadData: " + String(uploadData));
            Serial.println("uploadIntervalMillis: " + String(uploadIntervalMillis));

            //determine the specific operational state of the Blackbox
            if (!uploadData) {
                rgbLED.setState(RGBLED::IN_FLIGHT_NO_UPLOAD);
            } else {
                rgbLED.setState(RGBLED::IN_FLIGHT);
            }
        }
    });

/**
 * Push data via satellite based on distance traveled
 * CURRENTLY NOT IN USE AS I WAS NOT ABLE TO PROPERLY TEST THIS.
 */
    pushViaSatDistanceScheduler = new AsyncDistanceScheduler(0.01, []() {
        Serial.println("pushViaSatDistanceScheduler");
    });
}

void interpretIridiumMessage(String &message) {

    //Store the current Blackbox operational state.
    RGBLED::States prevState = rgbLED.getState();

    //Parse the message from the Iridium 9602N and determine the appropriate action/state. Then reset the previous state.
    if (message.startsWith("Waiting for SBDIX retry...")) {
        rgbLED.setState(RGBLED::IN_FLIGHT_SBD_FAILED);
        rgbLED.asyncLEDDelay(5000);
        rgbLED.setState(prevState);
    } else if (message.startsWith("SBDIX success")) {
        rgbLED.setState(RGBLED::IN_FLIGHT_SBD_SUCCESS);
        rgbLED.asyncLEDDelay(5000);
        rgbLED.setState(prevState);
    }
    //Reset the message buffer.
    message = "";
}

// ISBD callback function
bool ISBDCallback() {
    //blink the MKR LED every 1000 ms
    blinkMKRLed->run();
    //blink the RGB LED based on the current operational state of the Blackbox
    rgbLED.asyncRun();
    return true;
}


// Buffer to store the received message
String ISBDConsoleCallbackBuffer = "";
String ISBDDiagsCallbackBuffer = "";

void ISBDConsoleCallback(IridiumSBD *device, char c) {
    Serial.write(c);

    // Accumulate characters in the buffer
    if (c != '\n') {
        ISBDConsoleCallbackBuffer += c;
    } else {
        interpretIridiumMessage(ISBDConsoleCallbackBuffer);
    }
//blink the MKR LED every 1000 ms
    blinkMKRLed->run();
    //blink the RGB LED based on the current operational state of the Blackbox
    rgbLED.asyncRun();
}

// ISBD diagnostics callback function (development environment)
void ISBDDiagsCallback(IridiumSBD *device, char c) {
    Serial.write(c);

    // Accumulate characters in the buffer
    if (c != '\n') {
        ISBDDiagsCallbackBuffer += c;
    } else {
        interpretIridiumMessage(ISBDDiagsCallbackBuffer);
    }
//blink the MKR LED every 1000 ms
    blinkMKRLed->run();
    //blink the RGB LED based on the current operational state of the Blackbox
    rgbLED.asyncRun();

}