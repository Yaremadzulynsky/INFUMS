/**
* @File: Iridium9602N.h
* @Author: Yarema Dzulynsky
* @Date: 2023-04-23
* @Description: This file provides the Iridium9602N class for handling communication with the Iridium 9602N satellite
 * module. The class is responsible for sending and receiving satellite messages to and from the module, setting up the
 * module, managing a queue for Mavlink messages, and handling configuration settings received from the server. It
 * also includes methods to send boot-up messages, push data via satellite, and manage telemetry uploads. The class
 * maintains the current state of the queue and other communication flags for efficient handling of messages.
*/

#ifndef AERORADAREMBEDDED_IRIDIUM9602N_H
#define AERORADAREMBEDDED_IRIDIUM9602N_H


#include <Uart.h>
#include "MavlinkInterpreter/MavlinkInterpreter.h"
#include "IridiumSBD.h"
#include "ConfigResponsePacket/ConfigResponsePacket.h"



/**
 * @description The Iridium9602N class is responsible for communicating with the Iridium 9602N satellite module.
 * This includes sending and receiving satellite messages to and from the module.
 */
class Iridium9602N {

public:
    /**
     * Constructor for the Iridium9602N object.
     * @param uart The UART object to be used for the Iridium9602N module.
     * @param sleepPin The pin to be used for the sleep mode.
     * @param ringPin The pin to be used for the ring indicator.
     */
    Iridium9602N(Uart &uart, int sleepPin, int ringPin) : modem(uart, sleepPin, ringPin) {}

public:

    /**
     * Sets up the Iridium9602N module.
     */
    void setup();

    /**
     * Inserts a mavlink message (Position or Attitude) into the satellite queue.
     * @param msg The mavlink message to be inserted into the satellite queue.
     */
    void insertIntoSatQueue(mavlink_message_t msg);

    /**
     * Verifies if there are both attitude and position messages in the satellite queue and if so,
     * pushes them out to the server.
     * @return true if the messages were sent, false otherwise.
     */
    bool verifyAndPushOutSatQueue();

    /**
     * Pushes a buffer of data to the server via satellite and is sent as a binary packet.
     * @param buffer The buffer to be sent.
     * @param bufferLength The length of the buffer.
     * @return The number of bytes sent, -1 if the message is too long.
     */
    int pushViaSatellite(uint8_t *buffer, uint16_t bufferLength);

    /**
     * Receives a settings configuration mode packet from the server. This packet is then parsed and the response is
     * sent back to the server.
     * @param response The response packet to be sent back to the server. This can contain any data that may be
     * needed before flight.
     * @param uploadData  A flag to indicate if the device should telemetry upload data or not.
     * @param uploadIntervalMillis  The interval in milliseconds between telemetry uploads.
     * @return true if the packet was received/sent successfully, false otherwise.
     */
    bool receiveConfigurationMode(ConfigResponsePacket &response, bool &uploadData, long &uploadIntervalMillis);

    /**
     * Sends a boot up message to the server to indicate that the device has started.
     * @return true if the message was sent successfully, false otherwise.
     */
    bool sendBootUpMessage();


public:
    //IridiumSBD modem Object
    IridiumSBD modem;

    //Mavlink messages to be sent via satellite
    mavlink_message_t globalPositionIntMsg{};
    mavlink_message_t attitudeMsg{};

    /**
     * A buffer to store Mavlink messages which are received while
     * the modem is attempting to send a telemetry update to the server.
     */
    uint8_t bufferIn[200]{};
    size_t bufferInSize = 200;

    //A boolean to indicate if the buffer was filled during the last outgoing telemetry transmission.
    bool inBufferFilled = false;

    //Flags to indicate if a message is in the queue
    bool globalPositionIntInQueue = false;
    bool attitudeInQueue = false;

    /**
     * maximum buffer size for outgoing messages. This is essentially a safety check to ensure that
     * the message is not too large/too expensive. The absolute maximum size is 340 bytes, but this
     * variable is set to 100 bytes to just be enough to send the 80 byte telemetry update.
     */
    const int maxMessageSize = 100;

    //A boolean to indicate if the configuration mode packet has been received.
    bool configReceived = false;

    //A boolean which indicates whether a ring interrupt has occurred.
    volatile bool ringInterrupt = false;

    //A time_t variable to store the time of the last telemetry measurement.
    time_t currentMeasurementUnixTime = 0;

    //A boolean to indicate if the device has a GPS fix.
    bool gpsFix = false;

};

#endif //AERORADAREMBEDDED_IRIDIUM9602N_H
