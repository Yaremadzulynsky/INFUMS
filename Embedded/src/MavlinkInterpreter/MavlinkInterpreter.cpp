/**
* @File: MavlinkInterpreter.cpp
* @Author: Yarema Dzulynsky
* @Date: 2023-04-23
* @Description: This code provides a class called MavlinkInterpreter that simplifies the process of requesting,
 * receiving, and decoding MAVLink messages from a Pixhawk flight controller via an Arduino. The class establishes a
 * serial connection with the Pixhawk, sends requests for specific MAVLink messages, receives the messages, and decodes
 * them into human-readable formats. It supports MAVLink messages with IDs 30 (ATTITUDE) and 33 (GLOBAL_POSITION_INT),
 * converting their data into JSON-like strings.
*/

#include "MavlinkInterpreter.h"

//create a buffer to hold the mavlink message
uint8_t defaultBuffer[MAVLINK_MAX_PACKET_LEN];

//create a vector to hold the IDs of requested messages
std::vector<uint8_t> messageIDVector = {};


//define the serial connection between the arduino and Pixhawk
#define SerialMAV Serial1


boolean MavlinkInterpreter::messageRequested(int value) {

    //loop through the vector of requested message IDs
    for (int id: messageIDVector) {
        //if the ID is found, return true
        if (id == value) {
            return true;
        }
    }

    //if the ID is not found, return false
    return false;
}

MavlinkInterpreter::MavlinkInterpreter() {
    // implementation of default constructor
}

MavlinkInterpreter::MavlinkInterpreter(long baudRate) {

    //initialize the serial connection between the arduino and Pixhawk
    SerialMAV.begin(baudRate);
    Serial.println("MavlinkInterpreter initialized");

}

void MavlinkInterpreter::requestMavlinkMessages(std::vector<uint8_t> messageIDs) {

    //loop through the vector of message IDs and request each one
    for (uint8_t messageID: messageIDs) {

        //request the message
        requestMavlinkMessage(messageID);
    }

}

void MavlinkInterpreter::requestMavlinkMessage(uint8_t messageID) {

    //if the message has not previously been requested, add it to the vector of requested messages
    if (!messageRequested(messageID)) {
        messageIDVector.push_back(messageID);
    }

    //create a mavlink message and length variable
    mavlink_message_t msg;
    uint16_t len;

    //pack the message and send it to the Pixhawk
    mavlink_msg_request_data_stream_pack(1, 200, &msg, 1, 1, messageID, 1, 1);
    len = mavlink_msg_to_send_buffer(defaultBuffer, &msg);
    SerialMAV.write(defaultBuffer, len);

}

String MavlinkInterpreter::toANSI(mavlink_message_t msg) {

    //if the message is empty, return an empty string
    if (msg.len == 0) {
        return "Empty Message";
    }

    //create a string to hold the JSON
    String json = "not implemented";


    //switch on the message ID
    switch (msg.msgid) {
        //if the message ID is 30, decode it as a MAVLINK_MSG_ID_ATTITUDE message
        case MAVLINK_MSG_ID_ATTITUDE: {

            //decode the message
            mavlink_attitude_t attitude;
            mavlink_msg_attitude_decode(&msg, &attitude);

            //create the JSON string
            json = "\"roll\": " + String(attitude.roll, 5) + ", \"pitch\": " + String(attitude.pitch, 5) +
                   ", \"yaw\": " + String(attitude.yaw, 5) + "";
            break;
        }
        //if the message ID is 33, decode it as a MAVLINK_MSG_ID_GLOBAL_POSITION_INT message
        case MAVLINK_MSG_ID_GLOBAL_POSITION_INT: {
            //decode the message
            mavlink_global_position_int_t global_position_int;
            mavlink_msg_global_position_int_decode(&msg, &global_position_int);

            //create the JSON string
            json = "\"heading\":" + String(global_position_int.hdg / 100.0) +
                   ",\"altitude\":" + String(global_position_int.alt / 1000.0) + ",\"latitude\":" +
                   String(double(global_position_int.lat)) + ",\"longitude\":" +
                   String(double(global_position_int.lon)) + ",\"relative_altitude\":" +
                   String(global_position_int.relative_alt / 1000.0) + ",\"groundSpeed\":" +
                   String(global_position_int.vx / 100.0) + ",\"vy\":" +
                   String(global_position_int.vy / 100.0) +
                   ",\"vz\":" + String(global_position_int.vz / 100.0) + ",\"flightTime\":" +
                   String(global_position_int.time_boot_ms / 1000.0) + "";
            break;
        }
    }

    //return the JSON string
    return json;
}

std::vector<mavlink_message_t> MavlinkInterpreter::receiveMavlinkMessages() {

    //create an empty vector to hold the messages
    std::vector<mavlink_message_t> messages = {};

    //loop through the vector of requested message IDs
    for (uint8_t messageID: messageIDVector) {
        //wait for and receive the message. If the message is not received, the function will return an empty message
        mavlink_message_t msg = receiveMavlinkMessage(messageID);
        //add the message to the vector
        messages.push_back(msg);
    }

    //return the vector of messages
    return messages;
}

mavlink_message_t MavlinkInterpreter::receiveMavlinkMessage(uint32_t messageID) {

    //create a boolean to hold whether a message has been received
    bool messageReceived = false;
    //create a constant to hold the maximum number of attempts to receive a message
    const int maxAttempts = 10;
    //create an integer to hold the number of attempts to receive a message
    int attempts = 0;


    //loop until a message is received or the maximum number of attempts is reached
    while (!messageReceived && attempts < maxAttempts) {

        //create a mavlink message and status variable
        mavlink_message_t msg;
        mavlink_status_t status;

        // create a long to hold the start time using the arduino millis function.
        long start = millis();

        //loop while the serial connection is open, the pixhawk is streaming, and a message has not been received
        //THIS MAY BE REDUNDANT AND CAN BE REMOVED ASSUMING TESTING SHOWS IT IS NOT NEEDED
        while (SerialMAV.available()) {


            //loop through the serial connection and parse the bytes into a mavlink message
            while (SerialMAV.available()) {

                //read the next byte from the serial connection
                uint8_t c = SerialMAV.read();

                //parse the byte into a mavlink message
                if (mavlink_parse_char(MAVLINK_COMM_0, c, &msg, &status)) {

                    //if the message is the requested message, return it
                    if (messageRequested(msg.msgid) && msg.msgid == messageID) {
                        return msg;
                    }
                    /*
                     * if the message is not the requested message, increment the attempts counter and break out
                     * of the loop.
                     */
                    else {
                        attempts++;
                        break;
                    }
                }

                //if the loop has been running for more than 10 seconds, break out of the loop
                if (millis() - start > 10000) {
                    break;
                }
            }


        }

        //return an empty message
        return mavlink_message_t{};
    }
}


