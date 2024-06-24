/**
* @File: main.h
* @Author: Yarema Dzulynsky
* @Date: 2023-04-23
* @Description: This header file contains the definitions and configurations for the AeroRadar Embedded project. It
 * sets up the serial interface and baud rate for MAVLink telemetry, pin assignments for the satellite module, and
 * various settings for the device, such as upload intervals and timeouts. Additionally, it defines flags for the
 * production environment, LED state, GPS lock, and whether the device is uploading data. The file also provides an
 * external declaration for the RGBLED object and an interrupt handler for the satellite module's serial interface.
*/


#ifndef AERORADAREMBEDDED_MAIN_H
#define AERORADAREMBEDDED_MAIN_H

#include <Arduino.h>
#include <wiring_private.h>
#undef F
#include <common/mavlink.h>
#undef F
#include <sstream>
#include <iomanip>
#include "DiagnosticTools/RGBLED.h"


//The serial interface for the MAVLink telemetry.
#define SerialMAV Serial1
//The baud rate for the MAVLink telemetry.
#define BAUD_RATE 57600

//Satellite sleep pin assignment on the Arduino.
#define SLEEP_PIN 4
//Satellite ring pin assignment on the Arduino.
#define RING_PIN 5
//Satellite dtr pin assignment on the Arduino.
#define DTR_PIN 3
//Satellite rts pin assignment on the Arduino.
#define RTS_PIN 2

//Flag to indicate if the device is in production or development environment.
#define PRODUCTION_ENV true

//a boolean representing the onboard LED state.
bool ledState = false;

//the time in milliseconds between each telemetry upload.
long uploadIntervalMillis = 2 * 60 * 1000ul;

//a boolean representing whether the device is currently uploading data or has been set not too.
bool uploadData = true;

//The time in milliseconds that the device should wait for on startup.
long startDelayMillis = 1 * 15 * 1000ul;

//The time in milliseconds that the device should wait for the satellite module to receive configuration information.
long configTimoutMillis = 2 * 60 * 1000ul;

//The time in milliseconds that the device should wait for the Pixhawk 6C to receive a GPS fix.
long gpsLockTimeoutMillis = 5 * 60 * 1000ul;

//The last time since bootup that a telemetry message was transmitted.
long prevSatUpdateTime = 0;


long prevFuncTime = 0;

//A UART object for the satellite module.
Uart SerialSAT(&sercom3, 1, 0, SERCOM_RX_PAD_1, UART_TX_PAD_0);

//An RGBLED object for the RGB LED.
extern RGBLED rgbLED;

//the pin interrupt handler for the satellite module serial interface.
void SERCOM3_Handler() {
    SerialSAT.IrqHandler();
}

#endif //AERORADAREMBEDDED_MAIN_H
