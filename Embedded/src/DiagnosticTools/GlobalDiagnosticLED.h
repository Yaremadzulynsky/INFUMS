/**
* @File: ConfigResponsePacket.h
* @Author: Yarema Dzulynsky
* @Date: 2023-04-23
* @Description: This header file declares a global instance of the RGBLED class, named rgbLED, which is used as a
 * diagnostic LED for the AeroRadarEmbedded project. The global diagnostic LED allows for easy access and control of
 * the LED from various parts of the code, making it convenient for indicating system status or errors. The RGBLED
 * class should be defined separately and provide methods for controlling the LED's color and brightness.
 */

#ifndef AERORADAREMBEDDED_GLOBALDIAGNOSTICLED_H
#define AERORADAREMBEDDED_GLOBALDIAGNOSTICLED_H

#include "RGBLED.h"

// Global diagnostic LED
extern RGBLED rgbLED;

#endif //AERORADAREMBEDDED_GLOBALDIAGNOSTICLED_H
