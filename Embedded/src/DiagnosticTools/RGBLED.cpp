/**
* @File: RGBLED.cpp
* @Author: Yarema Dzulynsky
* @Date: 2023-04-23
* @Description: This code defines the RGBLED class, which is responsible for controlling an RGB LED with multiple
 * colors and states. The class provides methods for turning individual colors on or off, toggling colors, and setting
 * the LED state. The LED can be in one of several states, each associated with a specific blinking pattern. The
 * asyncRun() method is responsible for executing the blinking pattern based on the current state. Additionally, the
 * class provides an asynchronous delay method to run the LED pattern for a specified duration.
 */

#include "RGBLED.h"

RGBLED::RGBLED(int redPin, int greenPin, int bluePin, RGBLED::States startingState) :

        red(redPin, greenPin, bluePin, colorMap[RED][0], colorMap[RED][1], colorMap[RED][2]),
        green(redPin, greenPin, bluePin, colorMap[GREEN][0], colorMap[GREEN][1], colorMap[GREEN][2]),
        blue(redPin, greenPin, bluePin, colorMap[BLUE][0], colorMap[BLUE][1], colorMap[BLUE][2]),
        orange(redPin, greenPin, bluePin, colorMap[ORANGE][0], colorMap[ORANGE][1], colorMap[ORANGE][2]),
        purple(redPin, greenPin, bluePin, colorMap[PURPLE][0], colorMap[PURPLE][1], colorMap[PURPLE][2]),
        yellow(redPin, greenPin, bluePin, colorMap[YELLOW][0], colorMap[YELLOW][1], colorMap[YELLOW][2]),
        white(redPin, greenPin, bluePin, colorMap[WHITE][0], colorMap[WHITE][1], colorMap[WHITE][2]) {
        state = startingState;
}

void RGBLED::setState(States state) {
    this->state = state;
}

RGBLED::States RGBLED::getState() {
    return state;
}


void RGBLED::asyncLEDDelay(long timeMillis) {
    long startTime = millis();
    while (millis() - startTime < timeMillis) {
        this->asyncRun();
        delay(50);
    }

}

void RGBLED::allOff() {
    red.off();
    green.off();
    blue.off();
    orange.off();
    purple.off();
    yellow.off();
    white.off();
}

void RGBLED::redOn() {
    allOff();
    red.on();
}

void RGBLED::greenOn() {
    allOff();
    green.on();
}

void RGBLED::blueOn() {
    allOff();
    blue.on();
}

void RGBLED::orangeOn() {
    allOff();
    orange.on();
}

void RGBLED::purpleOn() {
    allOff();
    purple.on();
}

void RGBLED::yellowOn() {
    allOff();
    yellow.on();
}

void RGBLED::whiteOn() {
    allOff();
    white.on();
}

void RGBLED::redOff() {
    red.off();
}

void RGBLED::greenOff() {
    green.off();
}

void RGBLED::blueOff() {
    blue.off();
}

void RGBLED::orangeOff() {
    orange.off();
}

void RGBLED::purpleOff() {
    purple.off();
}

void RGBLED::yellowOff() {
    yellow.off();
}

void RGBLED::whiteOff() {
    white.off();
}

void RGBLED::toggleRed() {
    red.toggle();
}

void RGBLED::toggleGreen() {
    green.toggle();
}

void RGBLED::toggleBlue() {
    blue.toggle();
}

void RGBLED::toggleOrange() {
    orange.toggle();
}

void RGBLED::togglePurple() {
    purple.toggle();
}

void RGBLED::toggleYellow() {
    yellow.toggle();
}

void RGBLED::toggleWhite() {
    white.toggle();
}

void RGBLED::asyncRun() {
    //switch case to determine the state and execute the correct blinking pattern.
    switch (state) {
        case 0:
            startDelay.run(*this);
            break;
        case 1:
            inFlight.run(*this);
            break;
        case 2:
            waitingForGPSLock.run(*this);
            break;
        case 3:
            sendingBootupMessage.run(*this);
            break;
        case 4:
            sendReceiveConfig.run(*this);
            break;
        case 5:
            readyForTakeoff.run(*this);
            break;
        case 6:
            sendingTelemetry.run(*this);
            break;
        case 7:
            configTimout.run(*this);
            break;
        case 8:
            inFlightDefault.run(*this);
            break;
        case 9:
            inFlightNoUpload.run(*this);
            break;
        case 10:
            inFlightSBDFailed.run(*this);
            break;
        case 11:
            inFlightSBDSuccess.run(*this);
            break;
        case 12:
            noGPSFix.run(*this);
            break;

        default:
            allOff();
            break;
    }
}