/**
 @interface ICoordinate
 @description The ICoordinate interface defines the structure for a coordinate object.
 @property {number} lat - The latitude of the coordinate.
 @property {number} lng - The longitude of the coordinate.
 */
export interface ICoordinate {
    lat: number;
    lng: number;
}

/**
 @interface IFlightData
 @description The IFlightData interface defines the structure for a FlightData object.
 @property {string} droneID - The unique identifier of the selectedDrone.
 @property {ICoordinate} coordinate - The coordinate of the selectedDrone.
 @property {number} heading - The heading of the selectedDrone in degrees.
 @property {number} speed - The speed of the selectedDrone in m/s.
 @property {number} altitude - The altitude of the selectedDrone in meters.
 @property {number} roll - The roll of the selectedDrone in degrees.
 @property {number} pitch - The pitch of the selectedDrone in degrees.
 @property {number} yaw - The yaw of the selectedDrone in degrees.
 @property {Date} time - The time that the FlightData was received.
 @property {string} flightStatus - The flight status of the selectedDrone.
 */
export interface IFlightData {
    [key: string]: string | number | Date | ICoordinate;

    droneID: string;
    coordinate: ICoordinate;
    heading: number;
    speed: number;
    altitude: number;
    roll: number;
    pitch: number;
    yaw: number;
    time: Date;
    flightStatus: string;
    flightTime: number;
    verticalSpeed: number;
}



export interface FlightLogFromDB {
    droneID: string,
    flightLog: { pitch: number, droneID: string, longitude: number, groundSpeed: number, roll: number, altitude: number, heading: number, latitude: number, vy: number, vz: number, relative_altitude: number, yaw: number, flightTime: number, uploadTime: number }[]
}


export interface IFlightLog {
    flightLog: IFlightData[];
}

/**
 @interface DroneFromDB
 @description Defines the structure of the DroneFromDB object.
 @property {number} altitude - The altitude of the selectedDrone in meters.
 @property {string} droneID - The unique identifier of the selectedDrone.
 @property {number} heading - The heading of the selectedDrone in degrees.
 @property {number} latitude - The latitude of the selectedDrone's current location.
 @property {number} longitude - The longitude of the selectedDrone's current location.
 @property {number} groundSpeed - The speed of the selectedDrone in m/s.
 @property {number} roll - The roll of the selectedDrone in degrees.
 @property {number} pitch - The pitch of the selectedDrone in degrees.
 @property {number} yaw - The yaw of the selectedDrone in degrees.
 @property {number} flightTime - The time that the selectedDrone has been flying in seconds.

 */
export interface DroneFromDB {
    altitude: number;
    droneID: string;
    heading: number;
    latitude: number;
    longitude: number;
    groundSpeed: number;
    roll: number;
    pitch: number;
    yaw: number;
    flightTime: number;
    uploadTime: number;
    vz: number;
}
