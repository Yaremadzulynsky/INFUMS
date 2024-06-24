import { Database } from "../Database/Database";
import FlightData from "./FlightData";
import { Drone } from "./Drone";

/**
 * This class is used to store mission data.
 */
export class Mission {
  //mission id
  ID: string;

  //drone id
  droneID: string;

  //drone object that is associated with the mission
  drone: Drone;

  //flight log of the mission
  flightLog: Array<FlightData>;

  /**
   * Constructor for the mission class
   * @param missionID - The id of the mission
   * @param drone - The drone object that is associated with the mission
   */
  constructor(missionID: string, drone: Drone) {
    this.ID = missionID;
    //@ts-ignore
    this.droneID = null;
    this.drone = drone;
    //initialize the flight log
    this.flightLog = [];
  }

  /**
   * IM LOWKEY CONFUSED ON THIS ONE FIX LATER LMAO
   * @param flightData
   */
  update(flightData: FlightData): void {
    this.flightLog.push(flightData);
    if (this.droneID === null) {
      this.droneID = flightData.droneID;
      console.log("droneID: " + this.droneID);
    }
    console.log(this.flightLog);
  }

  /**
   * uploads the mission to the database.
   */
  upload(): void {
    console.log("uploading mission");
    console.log(this);
    //to avoid a circular dependency we need to set the drone to null here
    //@ts-ignore
    this.drone = null;
    Database.uploadMission(this, this.droneID);
  }
}
