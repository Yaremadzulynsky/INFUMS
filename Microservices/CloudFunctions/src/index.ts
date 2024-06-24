/**
 * This module receives RockBlock messages from a drone, extracts telemetry data from it,
 * converts it into a readable format and pushes it to Firebase Realtime Database.
 *
 * @module receiveRockBlockMessage
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { PassThrough } from "stream";
import { SatToFirebase, RockBlockMessage } from "./TypeDefinitions";
import {
    common,
    MavLinkPacketParser,
    MavLinkPacketRegistry,
    MavLinkPacketSplitter
} from "node-mavlink";

// Define registry for MAVLink packet protocol
const REGISTRY: MavLinkPacketRegistry = {
    ...common.REGISTRY,
};

// Initialize Firebase Admin SDK
admin.initializeApp();

// Permitted IP addresses
const allowedIPAddresses: string[] = ['<IP ADDRESSES>'];

// Map to store device IDs and their respective drone IDs
const imeiToDroneID: Map<string, string> = new Map<string, string>();
imeiToDroneID.set('<MODEM SERIAL NUMBER>', '<DRONE ID>');

/**
 * Cloud Function to receive RockBlock messages from IoT device.
 *
 * @function
 * @async
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 */
exports.receiveRockBlockMessage = functions.https.onRequest(async (req, res) => {
    // Get the IP address of the incoming request
    const ipAddress = req.ip;

    console.log('Request from IP address: ' + ipAddress);

    // Check if the request is from an allowed IP address
    if (!allowedIPAddresses.includes(ipAddress)) {
        console.log('Forbidden request from IP address: ' + ipAddress);
        res.status(403).send('Forbidden');
    }

    // Parse the incoming message
    let message = req.body;
    let rockBlockMessage: RockBlockMessage = {
        JWT: '',
        data: '',
        device_type: '',
        imei: '',
        iridium_cep: 0,
        iridium_latitude: 0,
        iridium_longitude: 0,
        momsn: 0,
        serial: 0,
        transmit_time: ''
    };

    // Initialize data object to push to Firebase
    let dataToPushToFirebase: SatToFirebase = {
        pitchSpeed: 0,
        rollSpeed: 0,
        yawSpeed: 0,
        altitude: 0,
        droneID: "",
        flightTime: 0,
        groundSpeed: 0,
        heading: 0,
        latitude: 0,
        longitude: 0,
        pitch: 0,
        relativeAltitude: 0,
        roll: 0,
        uploadTime: (new Date(0)).getTime() / 1000, // Firebase server timestamp
        vx: 0,
        vy: 0,
        vz: 0,
        yaw: 0,
        inFlight: false
    };

    let attitudeSet = false;
    let globalPositionIntSet = false;

    console.log(imeiToDroneID.get(message.imei) + ' sent a message');

    try {
        // Ensure message.data is defined and is a valid JSON string
        if (message && message.data) {
            console.log('Message received: ' + JSON.stringify(message));

            // Assign incoming message data to RockBlock message object
            rockBlockMessage = {
                JWT: message.JWT,
                data: message.data,
                device_type: message.device_type,
                imei: message.imei,
                iridium_cep: message.iridium_cep,
                iridium_latitude: message.iridium_latitude,
                iridium_longitude: message.iridium_longitude,
                momsn: message.momsn,
                serial: message.serial,
                transmit_time: message.transmit_time
            };

            // Convert message data from hex to a buffer
            const buffer = Buffer.from(message.data, 'hex');

            // Check if it's a config message
            const configMessage = buffer.toString('utf8');
            console.log('Config message: ' + configMessage);

            if (configMessage.includes('config,')) {
                // Process configuration message
                const messages = configMessage.split(',');

                for (let i = 0; i < messages.length; i++) {
                    if (messages[i].includes('GPSFix')) {
                        console.log('Message: ' + String(messages[i]));
                        const start = messages[i].indexOf('=') + 1;
                        if (messages[i].includes('GPSFix')) {
                            const parseGPSFixString = messages[i].substring(start, messages[i].length);
                            const GPSFix = parseGPSFixString === 'true' ? true : false;
                            await admin.database().ref('Config/' + imeiToDroneID.get(message.imei) + "/GPSFix").set(GPSFix).then();
                        }
                    }
                    await admin.database().ref('Config/' + imeiToDroneID.get(message.imei) + "/receivedConfig").set(true).then();
                    await admin.database().ref('Config/' + imeiToDroneID.get(message.imei) + "/lastHandshake").set(Date.now()).then();
                    res.status(200).send("Config message received");
                    return;
                }
            } else if (configMessage.includes('bootup')) {
                // Process bootup message
                await admin.database().ref('Config/' + imeiToDroneID.get(message.imei) + "/ready").set(false);
                await admin.database().ref('Config/' + imeiToDroneID.get(message.imei) + "/receivedConfig").set(false);
                res.status(200).send("Bootup message received");
                return;
            }

            // Instantiate MAVLink packet splitter and parser
            let splitter = new MavLinkPacketSplitter();
            let parser = new MavLinkPacketParser();

            // Pipe the parser through the splitter
            splitter.pipe(parser);

            // Listen to the 'data' event of the parser
            parser.on('data', (mavlinkPacket) => {
                // Get the message class associated with the message ID
                const clazz = REGISTRY[mavlinkPacket.header.msgid];
                if (clazz) {
                    // Parse the message payload using the associated message class
                    const data = mavlinkPacket.protocol.data(mavlinkPacket.payload, clazz);

                    // If the message is an attitude message
                    if (clazz.MSG_NAME == "ATTITUDE") {
                        let attitude = data as common.Attitude;
                        dataToPushToFirebase.pitch = parseFloat((attitude.pitch * (180 / Math.PI)).toFixed(2));
                        dataToPushToFirebase.roll = parseFloat((attitude.roll * (180 / Math.PI)).toFixed(2));
                        dataToPushToFirebase.yaw = parseFloat((attitude.yaw * (180 / Math.PI)).toFixed(2));
                        dataToPushToFirebase.rollSpeed = parseFloat((attitude.rollspeed * (180 / Math.PI)).toFixed(2));
                        dataToPushToFirebase.pitchSpeed = parseFloat((attitude.pitchspeed * (180 / Math.PI)).toFixed(2));
                        dataToPushToFirebase.yawSpeed = parseFloat((attitude.yawspeed * (180 / Math.PI)).toFixed(2));
                        attitudeSet = true;
                    } 
                    // If the message is a global position int message
                    else if (clazz.MSG_NAME == "GLOBAL_POSITION_INT") {
                        let globalPositionInt = data as common.GlobalPositionInt;

                        // Calculate the ground speed of the aircraft and round to the nearest 1 decimal place
                        const groundSpeed = Math.round(Math.sqrt(Math.pow(globalPositionInt.vx, 2) + Math.pow(globalPositionInt.vy, 2)));

                        dataToPushToFirebase.latitude = globalPositionInt.lat / 10000000;
                        dataToPushToFirebase.longitude = globalPositionInt.lon / 10000000;
                        dataToPushToFirebase.altitude = globalPositionInt.alt / 1000;
                        dataToPushToFirebase.relativeAltitude = globalPositionInt.relativeAlt / 1000;
                        dataToPushToFirebase.vx = globalPositionInt.vx / 100;
                        dataToPushToFirebase.groundSpeed = groundSpeed / 100;
                        dataToPushToFirebase.vy = globalPositionInt.vy / 100;
                        dataToPushToFirebase.vz = globalPositionInt.vz / 100;
                        dataToPushToFirebase.heading = globalPositionInt.hdg / 100;
                        dataToPushToFirebase.flightTime = globalPositionInt.timeBootMs / 1000;
                        dataToPushToFirebase.inFlight = (globalPositionInt.vx / 100) > 65;
                        globalPositionIntSet = true;
                    }
                }
            });

            // Pipe the buffer through the splitter
            let passThrough = new PassThrough();
            passThrough.pipe(splitter);
            passThrough.write(buffer);
            passThrough.end();

            // Assign drone ID to data object from the map
            dataToPushToFirebase.droneID = imeiToDroneID.get(message.imei) as string;

            // Check if both attitude and global position int are set
            if (!attitudeSet && !globalPositionIntSet) {
                console.error('Message incomplete:', message);
                res.status(400).send(`Attitude and Global Position Int not set`);
                return;
            } else if (!attitudeSet) {
                console.error('Message incomplete:', message);
                res.status(400).send(`Attitude not set`);
                return;
            } else if (!globalPositionIntSet) {
                console.error('Message incomplete:', message);
                res.status(400).send(`Global Position Int not set`);
                return;
            }

            // Write payload to Firebase Realtime Database

            // Extract the last 4 bytes of the buffer to create a new buffer
            let buffer2 = Buffer.alloc(4);
            buffer.copy(buffer2, 0, buffer.length - 4, buffer.length);

            // Convert the new buffer to Unix time
            let unixTime = buffer2.readUInt32LE(0);

            dataToPushToFirebase.uploadTime = (new Date(unixTime * 1000).getTime()) / 1000;

            // Write the processed data to Firebase Realtime Database
            await admin.database().ref('Live/' + dataToPushToFirebase.droneID).set(dataToPushToFirebase);

            // Send the processed data back as the response
            res.status(200).send(dataToPushToFirebase);
        } else {
            console.error('Invalid rockblock message:', message);
            res.status(400).send(`Invalid rockblock message`);
            return;
        }
    } catch (err) {
        console.error('Error handling rockblock message:', err);
        res.status(400).send('Error handling rockblock message');
        // Write error message to Firebase Realtime Database
        await admin.database().ref('error').set(rockBlockMessage);
        return;
    }
});

// CORS middleware for handling cross-origin requests
const cors = require("cors")({ origin: true });

// Proxy function for Rock7 API
exports.proxyRock7API = functions.https.onRequest(async (req, res) => {
    cors(req, res, async () => {
        const { modemIMEI, hexString, usernameEncoded, usernameNonEncoded, password } = req.query;

        // Check for missing required query parameters
        if (!modemIMEI || !hexString || !usernameEncoded || !usernameNonEncoded || !password) {
            res.status(400).send("Missing required query parameters.");
            return;
        }

        try {
            // Fetch data from Rock7 API
            const response = await fetch(
                `https://rockblock.rock7.com/rockblock/MT?imei=${modemIMEI}&username=${usernameEncoded}&username=${usernameNonEncoded}&password=${password}&data=${hexString}`,
                { method: "POST", headers: { accept: "text/plain" } }
            );

            const data = await response;
            res.json(data);
        } catch (error) {
            console.error(error);
            res.status(500).send("Error while fetching data from Rock7 API.");
        }
    });
});
