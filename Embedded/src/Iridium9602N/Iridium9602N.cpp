/**
* @File: Iridium9602N.cpp
* @Author: Yarema Dzulynsky
* @Date: 2023-04-23
* @Description: This code is for the Iridium9602N class which is responsible for handling communication with the
 * Iridium satellite modem. The class allows you to insert MAVLink messages into a satellite queue, verify and push
 * the messages out of the queue to the satellite, and receive and parse configuration messages from the server. It
 * also provides functionality for sending a bootup message to the server, setting up the modem, and checking the
 * signal quality of the modem.
*/

#include "Iridium9602N.h"
#include "DiagnosticTools/GlobalDiagnosticLED.h"

void Iridium9602N::insertIntoSatQueue(mavlink_message_t msg) {

    //check if the message has a valid length
    if (msg.len > 0) {
        //check if the message is MAVLINK_MSG_ID_GLOBAL_POSITION_INT
        if (msg.msgid == MAVLINK_MSG_ID_GLOBAL_POSITION_INT) {
            //save the message and flag it as in queue
            globalPositionIntMsg = msg;
            globalPositionIntInQueue = true;

        }
            // check if the message is MAVLINK_MSG_ID_ATTITUDE
        else if (msg.msgid == MAVLINK_MSG_ID_ATTITUDE) {
            //save the message and flag it as in queue
            attitudeMsg = msg;
            attitudeInQueue = true;
        }
    }

}

bool Iridium9602N::verifyAndPushOutSatQueue() {

    //check if both messages are in queue
    if (globalPositionIntInQueue && attitudeInQueue) {

        rgbLED.setState(RGBLED::SENDING_TELEMETRY);
        // Get the length of each message and create a buffer for each
        uint16_t attitudeLen = mavlink_msg_get_send_buffer_length(&attitudeMsg);
        uint16_t globalPositionIntLen = mavlink_msg_get_send_buffer_length(&globalPositionIntMsg);
        uint8_t attitudeBuffer[attitudeLen];
        uint8_t globalPositionIntBuffer[globalPositionIntLen];


        // Insert each message into the buffer created above
        mavlink_msg_to_send_buffer(attitudeBuffer, &attitudeMsg);
        mavlink_msg_to_send_buffer(globalPositionIntBuffer, &globalPositionIntMsg);

        // Calculate the total length and create a combined buffer
        uint16_t combinedLen = attitudeLen + globalPositionIntLen;
        uint8_t combinedBuffer[combinedLen];

        // Copy the contents of both buffers into the combined buffer
        memcpy(combinedBuffer, attitudeBuffer, attitudeLen);
        memcpy(combinedBuffer + attitudeLen, globalPositionIntBuffer, globalPositionIntLen);

        //put unix time into a buffer and add it to the combined buffer
        uint8_t unixTimeBuffer[4];
        memcpy(unixTimeBuffer, &currentMeasurementUnixTime, 4);
        memcpy(combinedBuffer + combinedLen, unixTimeBuffer, 4);
        combinedLen += 4;

        // Reset the flags
        attitudeInQueue = false;
        globalPositionIntInQueue = false;

        // Push the combined buffer to the satellite
        pushViaSatellite(combinedBuffer, combinedLen);
        return true;
    }
    return false;

}

int Iridium9602N::pushViaSatellite(uint8_t *buffer, uint16_t bufferLength) {

//    rgbLED.setState(RGBLED::SENDING_TELEMETRY);

    // Check if the message is too long
    if (bufferLength > maxMessageSize) {
        Serial.println("Message too long!");
        delay(100);
        return -1;
    }

    //Send the buffer. The sendSBDBinary will try to send the message ~10 times before giving up.
    int err = modem.sendReceiveSBDBinary(buffer, bufferLength, bufferIn, bufferInSize);




    if (err != ISBD_SUCCESS) {
        Serial.print("Send failed: error ");
        Serial.println(err);
        bufferInSize = 200;
        return err;
    }


    //print the rx message
    Serial.print("RX: ");
    String message = String((char *) bufferIn);
    Serial.println(message);
    Serial.println("RX size: " + String(bufferInSize));

    if(bufferInSize != 0 && bufferInSize != 200)    {
        inBufferFilled = true;
    }
    bufferInSize = 200;
    return 0;
}

void Iridium9602N::setup() {


    Serial.println("Starting modem...");
    int err = modem.begin();
    if (err != ISBD_SUCCESS) {
        Serial.print("Begin failed: error ");
        Serial.println(err);
        if (err == ISBD_NO_MODEM_DETECTED)
            Serial.println("No modem detected: check wiring.");
        return;

    }

    int signalQuality = -1;
    err = modem.getSignalQuality(signalQuality);
    if (err != ISBD_SUCCESS) {
        Serial.print("SignalQuality failed: error ");
        Serial.println(err);
        return;
    }


}


bool
Iridium9602N::receiveConfigurationMode(ConfigResponsePacket &response, bool &uploadData, long &uploadIntervalMillis) {

    int err;

    //check if the modem has a message waiting
    bool ring = modem.hasRingAsserted();


    //if there is a message waiting, read it
    if (ring || modem.getWaitingMessageCount() > 0 || err != ISBD_SUCCESS || inBufferFilled || ringInterrupt) {

        Serial.println("inBufferFilled" + String(inBufferFilled));
        Serial.println("ringInterrupt" + String(ringInterrupt));
        Serial.println("ring" + String(ring));
        Serial.println("modem.getWaitingMessageCount()" + String(modem.getWaitingMessageCount()));


        rgbLED.setState(RGBLED::SEND_RECEIVE_CONFIG);

        //create a buffer to store the incoming message.
        uint8_t buffer[200];
        size_t bufferSize = 200;

        //read the message into the buffer and send a response.
        err = modem.sendReceiveSBDText(response.createResponse(gpsFix).c_str(), buffer, bufferSize);

        if (err != ISBD_SUCCESS) {
            Serial.print("sendReceiveSBDBinary failed: error ");
            Serial.println(err);
            return false;
        }

        if(inBufferFilled)    {
            //cast the buffer to a string
            String message = String((char *) bufferIn);
            Serial.println(message);


            if (message.startsWith("1") || message.startsWith("0")) {
                //parse the message
                if (message.startsWith("1")) {
                    uploadData = true;
                } else if (message.startsWith("0")) {
                    uploadData = false;
                }
                int indexOfUploadInterval = message.indexOf(",");
                message = message.substring(indexOfUploadInterval + 1);
                //set the upload interval using the received message data
                unsigned long intervalPreCheck = message.substring(0, message.indexOf(",")).toInt() * 1000ul;

                //make sure the requested interval is more than 15 seconds
                if(intervalPreCheck > 15000)    {
                    uploadIntervalMillis = intervalPreCheck;
                }
                else {
                    uploadIntervalMillis = 60000;
                }
                Serial.println("Upload data: " + String(uploadData));
                Serial.println("Upload interval: " + String(uploadIntervalMillis));
            } else{

                Serial.println("Invalid message received");
            }

            //reset buffers and flags
            bufferInSize = 200;
            inBufferFilled = false;
        }
        else {
            //cast the buffer to a string
            String message = String((char *) buffer);
            Serial.println(message);


            if (message.startsWith("1") || message.startsWith("0")) {
                //parse the message
                if (message.startsWith("1")) {
                    uploadData = true;
                } else if (message.startsWith("0")) {
                    uploadData = false;
                }
                int indexOfUploadInterval = message.indexOf(",");
                message = message.substring(indexOfUploadInterval + 1);
                //set the upload interval using the received message data
                uploadIntervalMillis = message.substring(0, message.indexOf(",")).toInt() * 1000ul;
                Serial.println("Upload data: " + String(uploadData));
                Serial.println("Upload interval: " + String(uploadIntervalMillis));
            } else{
                Serial.println("Invalid message received");
            }
        }

        /*
         * DO NOT REMOVE
         * IF YOU DON'T RUN modem.hasRingAsserted()
         * AFTER DOWNLOADING THE MESSAGE,
         * THE RING PIN WILL REMAIN LOW (ACTIVE)
         * AND READ IN AN EMPTY MESSAGE BOTH COSTING
         * MONEY AND BREAKING THE CODE WHEN PARSED.
         *
         */
        modem.hasRingAsserted();


        //reset buffers and flags
        ringInterrupt = false;
        configReceived = true;
        return true;
    }

    //if there is no message waiting, return false
    return false;
}

bool Iridium9602N::sendBootUpMessage() {
    rgbLED.setState(RGBLED::SENDING_BOOTUP_MESSAGE);

    int err;
    //send a bootup message to the server
    err = modem.sendReceiveSBDText("bootup,", bufferIn, bufferInSize);

    if (err != ISBD_SUCCESS) {
        Serial.print("Send failed: error ");
        Serial.println(err);
        bufferInSize = 200;
        return false;
    }

    if(bufferInSize != 0)    {
        inBufferFilled = true;
    }

    Serial.print("Sent bootup message");
    return true;
}



