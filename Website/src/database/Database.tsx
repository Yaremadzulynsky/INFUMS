"use client"
/**
 * @module Database
 *  This module provides a method to interact with the firebase database.
 *  It uses the firebase library to communicate with the database and provides a class to perform the database
 *  operations
 */

import {initializeApp} from 'firebase/app';
import {child, get, getDatabase, onValue, push, ref, set} from "firebase/database";
import {collection, getDocs, getFirestore, limit, query, where} from "firebase/firestore";
import {firebaseConfigOptions} from "../credentials/APICredentials";
import {DroneFromDB, FlightLogFromDB, IFlightData} from "../interfaces/Objects";

interface ConfigData {
    frequency: number;
    lastHandshake: number;
    online: boolean;
    ready: boolean;
    receivedConfig: boolean;
    GPSFix: boolean;
}

/**
 * @class Database
 *  This class provides methods to interact with the firebase database, such as getting and pushing data, monitoring
 *  database changes and getting non-real time data.
 */
class Database {

    /**
     * Firebase app instance
     * @type {FirebaseApp}
     */
    static firebaseApp = initializeApp(firebaseConfigOptions);


    /**
     Get data from the firebase database
     @param {string} path - The missionFlightPath of the data in the database.
     @return {Promise<JSON>} - A promise that resolves with the data from the database.
     */
    static async getData(path: string): Promise<JSON> {
        //pull data from firebase
        const db = getDatabase(this.firebaseApp);
        const dbRef = ref(db);
        const dbChild = child(dbRef, path);
        return await get(dbChild).then((snapshot) => {
            return snapshot.val();
        }).catch((error) => {
            console.error(error);
            console.error(error);
        });
    }

    /**
     * Pushes data to the Firebase database at the specified missionFlightPath.
     * @param {string} path - the missionFlightPath to the location in the Firebase database where data is to be pushed.
     * @param {JSON} data - the data to be pushed to the Firebase database.
     */
    static pushData(path: string, data: JSON): void {
//push data to firebase
        const db = getDatabase(this.firebaseApp);
        const dbRef = ref(db);
        const dbChild = child(dbRef, path);
        push(dbChild, data);
    }

    static setData(path: string, data: any): void {
//push data to firebase
        const db = getDatabase(this.firebaseApp);
        const dbRef = ref(db);
        const dbChild = child(dbRef, path);
        set(dbChild, data);
    }

    /**
     * Gets a JSON representation of the data at the specified missionFlightPath in the Firebase database.
     * @return {Promise<JSON>} - a promise that resolves to the JSON representation of the data at the specified missionFlightPath
     * in the Firebase database.
     */
    static async getDrones(): Promise<JSON> {
        return Database.getData("/Live");
    }

    /**
     * Retrieves non-real-time data from the Firebase Firestore database.
     * @param {string} droneID - the droneID of the drone whose data is to be retrieved.
     * @return {Promise<FlightLogFromDB[]>} - a promise that resolves to an array of FlightLogFromDB objects.
     */
    static async getNonRealTimeData(droneID: string): Promise<FlightLogFromDB[]> {


        const db = getFirestore();
        const colRef = collection(db, "Missions");
        const q = query(colRef, where("droneID", "==", droneID), limit(25));
        // const orderedQ = query(q, orderBy("droneID", "desc"), limit(25));
        return await getDocs(q)
            .then((querySnapshot) => {

                querySnapshot.forEach(() => {

                });


                return querySnapshot.docs.map((doc) => doc.data())
            }) as FlightLogFromDB[];

    }


    /**
     * Monitors changes in data at the specified missionFlightPath in the Firebase database, and triggers a callback function when
     * changes occur.
     * @param {string} path - the missionFlightPath to the location in the Firebase database to be monitored for changes.
     * @param {((flightData: FlightData[]) => void)} callback - the callback function that is triggered when changes
     * occur in the data at the specified missionFlightPath in the Firebase database.
     */
    static monitorChanges(path: string, callback: ((flightData: IFlightData[]) => void)): void {
        const db = getDatabase(this.firebaseApp);
        const dbRef = ref(db);
        const dbChild = child(dbRef, path);
        onValue(dbChild, (snapshot) => {
            const data: DroneFromDB[] = snapshot.val();
            let flightDataArray: IFlightData[] = [];

            for (let drone in data) {

                const flightDataObj: IFlightData = {
                    altitude: data[drone].altitude,
                    droneID: data[drone].droneID,
                    heading: data[drone].heading,
                    coordinate: {
                        lat: data[drone].latitude,
                        lng: data[drone].longitude
                    },
                    speed: data[drone].groundSpeed,
                    roll: data[drone].roll,
                    pitch: data[drone].pitch,
                    yaw: data[drone].yaw,
                    time: new Date(data[drone].uploadTime),
                    flightStatus: data[drone].groundSpeed > 10 ? "Flying" : "Grounded",
                    flightTime: data[drone].flightTime,
                    verticalSpeed: data[drone].vz,
                }

                for(let key in flightDataObj)   {
                    if(flightDataObj[key] === null || flightDataObj[key] === undefined) {
                        flightDataObj[key] = -1;
                    }
                }
                flightDataArray.push(flightDataObj);
            }

            callback(flightDataArray);
        });
    }

    static monitorConfigChanges(path: string, callback: ((data: ConfigData) => void)): void {
        const db = getDatabase(this.firebaseApp);
        const dbRef = ref(db);
        const dbChild = child(dbRef, path);
        onValue(dbChild, (snapshot) => {
            const data: ConfigData = snapshot.val();
            callback(data);
        });
    }

    static monitorInFlightBooleanChanges(path: string, callback: ((data: boolean) => void)): void {
        const db = getDatabase(this.firebaseApp);
        const dbRef = ref(db);
        const dbChild = child(dbRef, path);
        onValue(dbChild, (snapshot) => {
            const data: boolean = snapshot.val();
            callback(data);
        });
    }

}







export default Database;