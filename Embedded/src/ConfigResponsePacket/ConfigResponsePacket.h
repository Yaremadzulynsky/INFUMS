/**
* @File: ConfigResponsePacket.h
* @Author: Yarema Dzulynsky
* @Date: 2023-04-23
* @Description: This header file defines a class called ConfigResponsePacket, which is used for creating a response
 * packet to send to the Iridium 9602N satellite communication device. The class provides a method named
 * createResponse() that generates a response string based on the current configuration, such as whether the GPS is
 * fixed. This class is part of the AeroRadarEmbedded project and is designed for use in embedded systems.
 */

#ifndef AERORADAREMBEDDED_CONFIGRESPONSEPACKET_H
#define AERORADAREMBEDDED_CONFIGRESPONSEPACKET_H


#include <cstdint>
#include "Arduino.h"
/**
 * This class is used to create a response packet to send to the Iridium 9602N.
 */
class ConfigResponsePacket {

    public:
    /**
     * Default constructor.
     */
    ConfigResponsePacket() = default;

public:

    /**
     * A response string to send to the Iridium 9602N.
     * @return String - the response string.
     */
    String createResponse(bool gpsFix);

};


#endif //AERORADAREMBEDDED_CONFIGRESPONSEPACKET_H
