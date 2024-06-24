/**
* @File: ConfigResponsePacket.cpp
* @Author: Yarema Dzulynsky
* @Date: 2023-04-23
* @Description: This code defines the ConfigResponsePacket class, which is responsible for creating a response string
 * with a specific format. The createResponse() method generates a response string that begins with "config,". The
 * method can be extended to include more information in the response if needed.
*/

#include "ConfigResponsePacket.h"

String ConfigResponsePacket::createResponse(bool gpsFix) {
    String response = "config,";
    response += "GPSFix=";
    response += gpsFix ? "true" : "false";
    response += ",";

    return response;
}
