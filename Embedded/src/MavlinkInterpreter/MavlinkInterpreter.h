/**
* @File: MavlinkInterpreter.h
* @Author: Yarema Dzulynsky
* @Date: 2023-04-23
* @Description: The MavlinkInterpreter class is designed for communication with the Pixhawk 6C via serial connection.
 * The class allows users to request specific Mavlink messages from the Pixhawk, receive and decode them. It provides
 * methods to request individual or multiple messages, receive messages individually or in a vector, and convert the
 * messages into a human-readable JSON format for debugging purposes. Note that only a subset of Mavlink messages can
 * be decoded; additional cases can be added to the switch statement as needed.
*/


#ifndef AERORADARV1_MAVLINKINTERPRETER_H
#define AERORADARV1_MAVLINKINTERPRETER_H

#include "Arduino.h"

#undef F

#include "standard/mavlink.h"

#undef F

#include <functional>
#include <vector>
#include <sstream>
#include <iomanip>
#include "mavlink_types.h"

/**
 * @description The MavlinkInterpreter class is responsible for communicating with the Pixhawk 6C via serial.
 */
class MavlinkInterpreter {

public:

    /**
     * Constructor for the MavlinkInterpreter class.
     */
    MavlinkInterpreter();

    /**
     * Determines if the message with the given ID has been requested.
     * @param value - the ID of the message to check.
     * @return boolean - true if the message has been requested, false otherwise.
     */
    boolean messageRequested(int value);

    /**
     * @description Mavlink Interpreter which initializes the serial connection between the arduino and Pixhawk.
     * @param baudRate - the baud rate of the serial connection, default Pixhawk baud rate is 57600.
     */
    explicit MavlinkInterpreter(long baudRate);

    /**
     * @description Request a mavlink message from the Pixhawk.
     * @param messageID - the ID of the message to request.
     */
    void requestMavlinkMessage(uint8_t messageID);

    /**
     * @description Decode a mavlink message into a json string. It is important to note that this message is only
     * capable of decoding a subset of mavlink messages. To add more, simply add more cases to the switch statement.
     * This method is to be used for debugging purposes only.
     * @param msg - the mavlink message to decode.
     * @return String - A JSON string representation of the mavlink message.
     */
    String toANSI(mavlink_message_t msg);


    /**
     * Request a list of mavlink messages from the Pixhawk.
     * @param messageIDs - the vector of message IDs to request.
     */
    void requestMavlinkMessages(std::vector<uint8_t> messageIDs);


    /**
     * Wait for the previously requested messages to be received and return them in a vector. if a message is not
     * received within ~10 attempts, it is assumed that the message will not be received and an empty message is
     * added to the vector.
     * @return std::vector<mavlink_message_t> - a vector of mavlink messages.
     */
    std::vector<mavlink_message_t> receiveMavlinkMessages();

    /**
     * Wait for a specific message to be received and return it. If the message is not received within ~10 attempts,
     * an empty message is returned.
     * @param messageID - the ID of the message to wait for.
     * @return mavlink_message_t - the mavlink message received.
     */
    mavlink_message_t receiveMavlinkMessage(uint32_t messageID);
};

#endif //AERORADARV1_MAVLINKINTERPRETER_H
