/**
* @File: LED.cpp
* @Author: Yarema Dzulynsky
* @Date: 2023-04-23
* @Description: This code defines the LED class, which is responsible for controlling a single LED with customizable
 * color values. The class provides methods for turning the LED on and off, as well as toggling its state. When the LED
 * is turned on, it is set to the color values provided during its instantiation, and when turned off, the color values
 * are set to zero. The class uses the Arduino's analogWrite function to set the appropriate color values for the LED's
 * red, green, and blue pins.
*/

#include "LED.h"


LED::LED(int redPin, int greenPin, int bluePin, int redValue, int greenValue, int blueValue): redValue(redValue), greenValue(greenValue), blueValue(blueValue) {
    this->redPin = redPin;
    this->greenPin = greenPin;
    this->bluePin = bluePin;
    currentRedValue = 0;
    currentGreenValue = 0;
    currentBlueValue = 0;

}

void LED::toggle() {
    if (currentRedValue == 0 && currentGreenValue == 0 && currentBlueValue == 0) {
        on();
    } else {
        off();
    }
}

void LED::off() {

    currentRedValue = 0;
    currentGreenValue = 0;
    currentBlueValue = 0;



    analogWrite(redPin, currentRedValue);
    analogWrite(greenPin, currentGreenValue);
    analogWrite(bluePin, currentBlueValue);
}

void LED::on() {

    currentRedValue = redValue;
    currentGreenValue = greenValue;
    currentBlueValue = blueValue;

    analogWrite(redPin, currentRedValue);
    analogWrite(greenPin, currentGreenValue);
    analogWrite(bluePin, currentBlueValue);
}
