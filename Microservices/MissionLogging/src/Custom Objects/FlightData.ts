/**
 * This is the object that will be used to store the flight data
 */

class FlightData {

    /**
     * Constructor for FlightData.
     * @param droneID - the id of the drone.
     * @param latitude - the latitude of the drone.
     * @param longitude - the longitude of the drone.
     * @param altitude - the altitude of the drone in m.
     * @param groundSpeed - the ground speed of the drone in kph.
     * @param heading - the heading of the drone in degrees.
     */
    constructor(droneID: string, latitude: number, longitude: number, altitude: number, groundSpeed: number, heading: number) {
        this.droneID = droneID;
        this.latitude = latitude;
        this.longitude = longitude;
        this.altitude = altitude;
        this.groundSpeed = groundSpeed;
        this.heading = heading;
        this.timeStamp = new Date();

    }
    droneID: string;
    latitude: number;
    longitude: number;
    altitude: number;
    groundSpeed: number;
    heading: number;
    timeStamp: Date;
}
export default FlightData;