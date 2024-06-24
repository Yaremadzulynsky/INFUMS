import {FlightLogFromDB, IFlightData, IFlightLog} from "../interfaces/Objects";

/**

 @class DataCastHelper

 This class provides helper methods to convert data between different formats.
 */
class DataCastHelper {

    /**

     Converts a FlightLogFromDB object to an IFlightLog object.

     @param {FlightLogFromDB} dbFlightLog - The FlightLogFromDB object to be converted.

     @returns {IFlightLog} - The IFlightLog object created from the converted data.
     */
    static flightLogFromDBToFlightLog(dbFlightLog: FlightLogFromDB): IFlightLog {

        let flightLog: IFlightLog = {
            flightLog: [],
        }

        for (let key in dbFlightLog.flightLog) {
            let lat = Math.abs(dbFlightLog.flightLog[key].latitude) > 360 ? dbFlightLog.flightLog[key].latitude / 10000000 : dbFlightLog.flightLog[key].latitude;
            let lng = Math.abs(dbFlightLog.flightLog[key].longitude) > 360 ? dbFlightLog.flightLog[key].longitude / 10000000 : dbFlightLog.flightLog[key].longitude;

            flightLog.flightLog.push({
                altitude: dbFlightLog.flightLog[key].altitude,
                coordinate: {
                    lat: lat,
                    lng: lng,
                },
                droneID: dbFlightLog.droneID,
                flightStatus: dbFlightLog.flightLog[key].groundSpeed > 10 ? "In Flight" : "Grounded",
                heading: dbFlightLog.flightLog[key].heading,
                pitch: dbFlightLog.flightLog[key].pitch,
                roll: dbFlightLog.flightLog[key].roll,
                speed: dbFlightLog.flightLog[key].groundSpeed,
                time: new Date(dbFlightLog.flightLog[key].uploadTime),
                yaw: dbFlightLog.flightLog[key].yaw,
                flightTime: dbFlightLog.flightLog[key].flightTime,
                verticalSpeed: dbFlightLog.flightLog[key].vz,
            })
        }

        return flightLog;
    }

    /**

     Converts an IFlightLog object to an array of coordinates.
     @param {IFlightLog} flightLog - The IFlightLog object to be converted.
     @returns {Array<{ lat: number, lng: number }>} - An array of objects representing the coordinates in the IFlightLog object.
     */
    static pathArrayFromFlightLog(flightLog: IFlightLog): Array<{ lat: number, lng: number }> {
        let pathArray: Array<{ lat: number, lng: number }> = [];
        for (let key in flightLog.flightLog) {
            pathArray.push(flightLog.flightLog[key].coordinate);
        }
        return pathArray;
    }

    static pathArrayFromMission(mission: IFlightLog): Array<{ lat: number, lng: number }> {
        let pathArray: Array<{ lat: number, lng: number }> = [];
        for (let key in mission.flightLog) {
            pathArray.push(mission.flightLog[key].coordinate);
        }
        return pathArray;
    }

}


export default DataCastHelper;