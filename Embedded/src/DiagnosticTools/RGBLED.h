/**
* @File: RGBLED.h
* @Author: Yarema Dzulynsky
* @Date: 2023-04-23
* @Description: The RGBLED class is designed to control an RGB LED status light for a Blackbox system. It provides
* various LED patterns to indicate different states and events, such as startup, sending and receiving messages,
* in-flight operation, and system errors. The class manages the state of the Blackbox and allows for asynchronous
* LED control, ensuring that the LED patterns run correctly without blocking other tasks.
*
* The class includes an enumeration, Colors, to represent the supported colors, and a 2D array, colorMap, that stores
* the RGB values for each color. It also includes a struct, LEDPattern, which serves as a template for all LED patterns.
* Various LED patterns are defined within the class to indicate different system states and events.
*
* The RGBLED class has a constructor that takes the pin numbers for the red, green, and blue LEDs, as well as the
* starting state for the Blackbox. It also has getters and setters for the Blackbox state, and a method, asyncLEDDelay,
* for waiting a specified amount of time while still blinking the current LED pattern.
*
* There are methods to turn individual LEDs on and off, as well as to toggle their state. The asyncRun method runs the
* current LED pattern asynchronously, using timers to manage the blinking of the LEDs. This allows the LED patterns to
* run without blocking other tasks, as long as the method is called frequently enough.
*
* Overall, the RGBLED class provides a comprehensive solution for managing an RGB LED status light on a Blackbox system,
* offering a range of LED patterns to represent various system states and events.
 */

#ifndef RGBLEDSTATUSLIGHT_RGBLED_H
#define RGBLEDSTATUSLIGHT_RGBLED_H


#include "LED.h"

/**
 * @enum Colors - the colors that the RGB LED can be set to.
 */
class RGBLED {
    enum Colors {
        RED = 0,
        GREEN = 1,
        BLUE = 2,
        ORANGE = 3,
        PURPLE = 4,
        YELLOW = 5,
        WHITE = 6,
        OFF = 7

    };

    /**
     * A 2D array that stores the RGB values for each color in the Colors enum.
     */
    int colorMap[8][3] = {
            {255, 0,   0},
            {0,   255, 0},
            {0,   0,   255},
            {255, 165, 0},
            {128, 0,   128},
            {255, 255, 0},
            {255, 255, 255},
            {0,   0,   0}
    };


    //This struct is used as a template for all LED patterns.
    struct LEDPattern {

        //How many times the LED has blinked
        long blinkIndex = 0;
        //The last time the LED blinked
        long lastBlink = 0;

        /**
         * The default constructor for the LEDPattern struct.
         */
        LEDPattern() {}

        /**
         * The function that is called to run the LED pattern.
         * @param rgbLED - the RGBLED object that the pattern is being run on.
         */
        virtual void run(RGBLED rgbLED);
    };

    /**
     * The LED pattern that is run on startup
     * \Pattern The LED runs through all colors at 4hz.
     */
    struct StartDelay : LEDPattern {
        void run(RGBLED rgbLED) override {

            //run through all colors at high speed
            switch (blinkIndex % 6) {
                case 0:
                    if (millis() - lastBlink > 250) {
                        rgbLED.redOn();
                        lastBlink = millis();
                        blinkIndex++;
                    }

                    break;
                case 1:
                    if (millis() - lastBlink > 250) {
                        rgbLED.greenOn();
                        lastBlink = millis();
                        blinkIndex++;
                    }

                    break;
                case 2:
                    if (millis() - lastBlink > 250) {
                        rgbLED.blueOn();
                        lastBlink = millis();
                        blinkIndex++;
                    }

                    break;
                case 3:
                    if (millis() - lastBlink > 250) {
                        rgbLED.orangeOn();
                        lastBlink = millis();
                        blinkIndex++;
                    }

                    break;
                case 4:
                    if (millis() - lastBlink > 250) {
                        rgbLED.purpleOn();
                        lastBlink = millis();
                        blinkIndex++;
                    }

                    break;
                case 5:
                    if (millis() - lastBlink > 250) {
                        rgbLED.purpleOff();
                        rgbLED.yellowOn();
                        lastBlink = millis();
                        blinkIndex++;
                    }

                    break;
                case 6:
                    if (millis() - lastBlink > 250) {
                        rgbLED.whiteOn();
                        lastBlink = millis();
                        blinkIndex++;
                    }

                    break;
            }
        }

    };

    /**
     * The LED pattern that is run when the Blackbox is sending a bootup message.
     * \Pattern The LED blinks red at 1Hz.
     */
    struct SendingBootupMessage : LEDPattern {
        void run(RGBLED rgbLED) override {
            switch (blinkIndex % 2) {
                case 0:
                    if (millis() - lastBlink > 500) {
                        rgbLED.redOff();
                        lastBlink = millis();
                        blinkIndex++;
                    }

                    break;
                case 1:
                    if (millis() - lastBlink > 500) {
                        rgbLED.redOn();
                        lastBlink = millis();
                        blinkIndex++;
                    }
                    break;
            }
        }
    };

    /**
     * The LED pattern that is run when the Blackbox is receiving a configuration message.
     * \Pattern The LED blinks yellow at 1Hz.
     */
    struct SendReceiveConfig : LEDPattern {
        void run(RGBLED rgbLED) override {
            switch (blinkIndex % 2) {
                case 0:
                    if (millis() - lastBlink > 500) {
                        rgbLED.yellowOff();
                        lastBlink = millis();
                        blinkIndex++;
                    }

                    break;
                case 1:
                    if (millis() - lastBlink > 500) {
                        rgbLED.yellowOn();
                        lastBlink = millis();
                        blinkIndex++;
                    }
                    break;
            }
        }
    };

    /**
     * The LED pattern that is run when the Blackbox has not received a configuration message within the timeout period.
     * \Pattern The LED blinks red at 10Hz.
     */
    struct ConfigTimout : LEDPattern {

        void run(RGBLED rgbLED) override {
            switch (blinkIndex % 2) {
                case 0:
                    if (millis() - lastBlink > 50) {
                        rgbLED.redOn();
                        lastBlink = millis();
                        blinkIndex++;
                    }

                    break;
                case 1:
                    if (millis() - lastBlink > 50) {
                        rgbLED.redOff();
                        lastBlink = millis();
                        blinkIndex++;
                    }
                    break;
            }
        }
    };

    /**
     * The LED pattern that is run when a satellite transmission fails.
     * \Pattern The LED blinks red at 10Hz.
     */
    struct InFlightSBDFailed : LEDPattern {
        void run(RGBLED rgbLED) override {
            switch (blinkIndex % 2) {
                case 0:
                    if (millis() - lastBlink > 50) {
                        rgbLED.redOn();
                        lastBlink = millis();
                        blinkIndex++;
                    }

                    break;
                case 1:
                    if (millis() - lastBlink > 50) {
                        rgbLED.redOff();
                        lastBlink = millis();
                        blinkIndex++;
                    }
                    break;
            }
        }
    };

    /**
     * The LED pattern that is run when a telemetry transmission fails due to a GPS Fix error (ie the gps has
     * not received a location fix).
     * \Pattern The LED blinks yellow at 10Hz.
     */
    struct NoGPSFix : LEDPattern {
        void run(RGBLED rgbLED) override {
            switch (blinkIndex % 2) {
                case 0:
                    if (millis() - lastBlink > 50) {
                        rgbLED.yellowOn();
                        lastBlink = millis();
                        blinkIndex++;
                    }

                    break;
                case 1:
                    if (millis() - lastBlink > 50) {
                        rgbLED.yellowOff();
                        lastBlink = millis();
                        blinkIndex++;
                    }
                    break;
            }
        }
    };

    /**
     * The LED pattern that is run when a satellite transmission succeeds.
     * \Pattern The LED blinks green at 10Hz.
     */
    struct InFlightSBDSuccess : LEDPattern {
        void run(RGBLED rgbLED) override {
            switch (blinkIndex % 2) {
                case 0:
                    if (millis() - lastBlink > 50) {
                        rgbLED.greenOn();
                        lastBlink = millis();
                        blinkIndex++;
                    }

                    break;
                case 1:
                    if (millis() - lastBlink > 50) {
                        rgbLED.greenOff();
                        lastBlink = millis();
                        blinkIndex++;
                    }
                    break;
            }
        }
    };

    /**
     * The LED patter that is run when the Blackbox is ready for takeoff.
     * \Pattern The LED blinks green at 1Hz.
     */
    struct ReadyForTakeoff : LEDPattern {
        void run(RGBLED rgbLED) override {
            switch (blinkIndex % 2) {
                case 0:
                    if (millis() - lastBlink > 500) {
                        rgbLED.greenOn();
                        lastBlink = millis();
                        blinkIndex++;
                    }

                    break;
                case 1:
                    if (millis() - lastBlink > 500) {
                        rgbLED.greenOff();
                        lastBlink = millis();
                        blinkIndex++;
                    }
                    break;
            }
        }
    };

    /**
     * The LED pattern that is run when the Blackbox is operational in flight.
     * \Pattern The LED blinks blue for 850ms then white for 150ms.
     */
    struct InFlight : LEDPattern {
        void run(RGBLED rgbLED) override {
            switch (blinkIndex % 2) {
                case 0:
                    if (millis() - lastBlink > 850) {
                        rgbLED.whiteOn();
                        lastBlink = millis();
                        blinkIndex++;
                    }

                    break;
                case 1:
                    if (millis() - lastBlink > 150) {
                        rgbLED.blueOn();
                        lastBlink = millis();
                        blinkIndex++;
                    }
                    break;
            }
        }
    };

    /**
     * The LED pattern that is run when the Blackbox is operational in flight but has not received a
     * configuration message.
     * \Pattern The LED blinks blue for 850ms then purple for 150ms.
     */
    struct InFlightDefault : LEDPattern {
        void run(RGBLED rgbLED) override {
            switch (blinkIndex % 2) {
                case 0:
                    if (millis() - lastBlink > 850) {
                        rgbLED.purpleOn();
                        lastBlink = millis();
                        blinkIndex++;
                    }

                    break;
                case 1:
                    if (millis() - lastBlink > 150) {
                        rgbLED.blueOn();
                        lastBlink = millis();
                        blinkIndex++;
                    }
                    break;
            }
        }
    };

    /**
     * The LED pattern that is run when the Blackbox is operational in flight but has been configured not to upload
     * data.
     * \Pattern The LED blinks blue for 850ms then red for 150ms.
     */
    struct InFlightNoUpload : LEDPattern {
        void run(RGBLED rgbLED) override {
            switch (blinkIndex % 2) {
                case 0:
                    if (millis() - lastBlink > 850) {
                        rgbLED.redOn();
                        lastBlink = millis();
                        blinkIndex++;
                    }

                    break;
                case 1:
                    if (millis() - lastBlink > 150) {
                        rgbLED.blueOn();
                        lastBlink = millis();
                        blinkIndex++;
                    }
                    break;
            }
        }
    };

    /**
     * The LED patter that is run when the Blackbox is attempting to send a telemetry transmission.
     * \Pattern The LED blinks purple at 1Hz.
     */
    struct SendingTelemetry : LEDPattern {
        void run(RGBLED rgbLED) override {
            switch (blinkIndex % 2) {
                case 0:
                    if (millis() - lastBlink > 500) {
                        rgbLED.purpleOn();
                        lastBlink = millis();
                        blinkIndex++;
                    }

                    break;
                case 1:
                    if (millis() - lastBlink > 500) {
                        rgbLED.purpleOff();
                        lastBlink = millis();
                        blinkIndex++;
                    }
                    break;
            }
        }
    };

    /**
     * The LED pattern that is run when the Blackbox is trying to acquire a GPS lock.
     */
    struct WaitingForGPSLock : LEDPattern {
        void run(RGBLED rgbLED) override {
            switch (blinkIndex % 2) {
                case 0:
                    if (millis() - lastBlink > 500) {
                        rgbLED.blueOn();
                        lastBlink = millis();
                        blinkIndex++;
                    }

                    break;
                case 1:
                    if (millis() - lastBlink > 500) {
                        rgbLED.blueOff();
                        lastBlink = millis();
                        blinkIndex++;
                    }
                    break;
            }
        }
    };


public:

    //An enum representing possible states of the Blackbox.
    enum States {
        START_DELAY = 0,
        IN_FLIGHT = 1,
        WAITING_FOR_GPS_LOCK = 2,
        SENDING_BOOTUP_MESSAGE = 3,
        SEND_RECEIVE_CONFIG = 4,
        READY_FOR_TAKEOFF = 5,
        SENDING_TELEMETRY = 6,
        CONFIG_TIMOUT = 7,
        IN_FLIGHT_DEFAULT = 8,
        IN_FLIGHT_NO_UPLOAD = 9,
        IN_FLIGHT_SBD_FAILED = 10,
        IN_FLIGHT_SBD_SUCCESS = 11,
        NO_GPS_FIX = 12,
//        WAITING_FOR_GPS_LOCK = 13
    };

private:
    States state = START_DELAY;

public:
    /**
     * The constructor for the RGBLED class.
     * @param redPin - The pin that the red LED is connected to.
     * @param greenPin - The pin that the green LED is connected to.
     * @param bluePin - The pin that the blue LED is connected to.
     * @param startingState - The state that the Blackbox should start in.
     */
    RGBLED(int redPin, int greenPin, int bluePin, RGBLED::States startingState);

    //The LED patterns that are used by the Blackbox.
    StartDelay startDelay;
    InFlight inFlight;
    SendingBootupMessage sendingBootupMessage;
    SendReceiveConfig sendReceiveConfig;
    ReadyForTakeoff readyForTakeoff;
    SendingTelemetry sendingTelemetry;
    ConfigTimout configTimout;
    InFlightDefault inFlightDefault;
    InFlightNoUpload inFlightNoUpload;
    InFlightSBDFailed inFlightSBDFailed;
    InFlightSBDSuccess inFlightSBDSuccess;
    NoGPSFix noGPSFix;
    WaitingForGPSLock waitingForGPSLock;

    //The LED objects that are used by the Blackbox.
    LED red;
    LED green;
    LED blue;
    LED orange;
    LED purple;
    LED yellow;
    LED white;

    /**
     * Getter for the state of the Blackbox.
     * @return - The state of the Blackbox.
     */
    States getState();

    /**
     * Sets the state of the Blackbox.
     * @param state - The state to set the Blackbox to.
     */
    void setState(States state);

    /**
     * Waits a specified amount of time while still blinking the current LED patter.
     * @param timeMillis - The amount of time to wait in milliseconds.
     */
    void asyncLEDDelay(long timeMillis);

    /**
     * Turns all LEDs off.
     */
    void allOff();

    /**
     * Runs the current LED pattern asynchronously. It can be called anytime in a loop and uses timers to keep track of
     * when to blink the LEDs. However, if it is not called frequently enough, the LED pattern will not run correctly.
     */
    void asyncRun();

    //Methods to turn LEDs on and off.
    void redOn();

    void greenOn();

    void blueOn();

    void orangeOn();

    void purpleOn();

    void yellowOn();

    void whiteOn();

    void redOff();

    void greenOff();

    void blueOff();

    void orangeOff();

    void purpleOff();

    void yellowOff();

    void whiteOff();


    //Methods to toggle LEDs on or off.
    void toggleRed();

    void toggleGreen();

    void toggleBlue();

    void toggleOrange();

    void togglePurple();

    void toggleYellow();

    void toggleWhite();


};


#endif //RGBLEDSTATUSLIGHT_RGBLED_H
