/**
 * Object types for the telemetry data received from the IoT device
 *
 * @typedef {Object} SatToFirebase
 * @property {number} rollSpeed - Roll speed of the drone in degrees per second
 * @property {number} pitchSpeed - Pitch speed of the drone in degrees per second
 * @property {number} yawSpeed - Yaw speed of the drone in degrees per second
 * @property {number} altitude - Altitude of the drone in meters
 * @property {string} droneID - Unique identifier of the drone
 * @property {number} flightTime - Time in seconds since the drone took off
 * @property {number} groundSpeed - Ground speed of the drone in meters per second
 * @property {number} heading - Heading of the drone in degrees
 * @property {number} latitude - Latitude of the drone in degrees
 * @property {number} longitude - Longitude of the drone in degrees
 * @property {number} pitch - Pitch angle of the drone in degrees
 * @property {number} relativeAltitude - Relative altitude of the drone in meters
 * @property {number} roll - Roll angle of the drone in degrees
 * @property {object} uploadTime - Timestamp of the data upload
 * @property {number} vx - Velocity of the drone in the x-axis in meters per second
 * @property {number} vy - Velocity of the drone in the y-axis in meters per second
 * @property {number} vz - Velocity of the drone in the z-axis in meters per second
 * @property {number} yaw - Yaw angle of the drone in degrees
 * @property {boolean} inFlight - Whether the drone is in flight
 */
export type SatToFirebase = {
    rollSpeed: number;
    pitchSpeed: number;
    yawSpeed: number;
    altitude: number;
    droneID: string;
    flightTime: number;
    groundSpeed: number;
    heading: number;
    latitude: number;
    longitude: number;
    pitch: number;
    relativeAltitude: number;
    roll: number;
    uploadTime: number/*object*/;
    vx: number;
    vy: number;
    vz: number;
    yaw: number;
    inFlight: boolean;

}


/**
 * Object types for the RockBlock message received from the IoT device
 *
 * @typedef {Object} RockBlockMessage
 * @property {string} JWT - JSON Web Token of the message
 * @property {string} data - Hexadecimal string of the message data
 * @property {string} device_type - Type of the IoT device
 * @property {string} imei - IMEI of the IoT device
 * @property {number} iridium_cep - Circular Error Probability (CEP) of the Iridium satellite signal
 * @property {number} iridium_latitude - Latitude of the Iridium satellite
 * @property {number} iridium_longitude - Longitude of the Iridium satellite
 * @property {number} momsn - Mobile-Originated Message Sequence Number (MOMSN) of the message
 * @property {number} serial - Serial number of the message
 * @property {string} transmit_time - Time the message was transmitted
 */
export type RockBlockMessage = {
    JWT: string;
    data: string;
    device_type: string;
    imei: string;
    iridium_cep: number;
    iridium_latitude: number;
    iridium_longitude: number;
    momsn: number;
    serial: number;
    transmit_time: string;
}