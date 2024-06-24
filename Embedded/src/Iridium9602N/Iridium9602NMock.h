//
// Created by Yarema Dzulynsky on 2023-04-22.
//

#ifndef AERORADAREMBEDDED_IRIDIUM9602NMOCK_H
#define AERORADAREMBEDDED_IRIDIUM9602NMOCK_H
#include <Uart.h>
#include "MavlinkInterpreter/MavlinkInterpreter.h"
#include "IridiumSBD.h"
#include "ConfigResponsePacket/ConfigResponsePacket.h"



class Iridium9602NMock {

public:
    /**
     * Constructor for the Iridium9602N object.
     * @param uart The UART object to be used for the Iridium9602N module.
     * @param sleepPin The pin to be used for the sleep mode.
     * @param ringPin The pin to be used for the ring indicator.
     */
    Iridium9602NMock(Uart &uart, int sleepPin, int ringPin){

    };

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
//    IridiumSBD modem;

    //Mavlink messages to be sent via satellite
    mavlink_message_t globalPositionIntMsg;
    mavlink_message_t attitudeMsg;


    //Flags to indicate if a message is in the queue
    bool globalPositionIntInQueue = false;
    bool attitudeInQueue = false;

    //Maximum message size
    const int maxMessageSize = 100;

    bool configReceived = false;

};

#endif //AERORADAREMBEDDED_IRIDIUM9602NMOCK_H
