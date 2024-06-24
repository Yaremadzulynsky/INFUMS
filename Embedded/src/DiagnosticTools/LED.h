/**
* @File: LED.h
* @Author: Yarema Dzulynsky
* @Date: 2023-04-23
* @Description: This library provides an LED class for controlling an RGB LED status light with Arduino. The LED class
 * allows users to create an RGB LED object with specified pin assignments and RGB values. It offers methods to turn
 * the LED on, off, or toggle its state. The class also stores the current state of the LED and its desired RGB values
 * to achieve the correct color.
*/

#ifndef RGBLEDSTATUSLIGHT_LED_H
#define RGBLEDSTATUSLIGHT_LED_H

#include "Arduino.h"

/**
 * A class that represents an LED.
 */
class LED {

public:
    /**
     * Construct an LED with the given pins and values.
     * @param redPin - the pin that the red LED is connected to.
     * @param greenPin - the pin that the green LED is connected to.
     * @param bluePin - the pin that the blue LED is connected to.
     * @param redValue - the RGB value (0 - 255) that the red LED should be set to.
     * @param greenValue - the RGB value (0 - 255) that the green LED should be set to.
     * @param blueValue - the RGB value (0 - 255) that the blue LED should be set to.
     */
    LED(int redPin, int greenPin, int bluePin, int redValue, int greenValue, int blueValue);

    //toggle the LED.
    void toggle();
    void off();
    void on();

    //pin assignments
    int redPin;
    int greenPin;
    int bluePin;

    //The current RGB values of the LED
    int currentRedValue;
    int currentGreenValue;
    int currentBlueValue;

    //RGB values to get the correct color
    const int redValue;
    const int blueValue;
    const int greenValue;
};


#endif //RGBLEDSTATUSLIGHT_LED_H
