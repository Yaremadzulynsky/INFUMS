import FlightData from "./FlightData";
import { Mission } from "./Mission";

/**
 * This is the Drone class. It is used to represent a drone.
 * It contains all the information about a drone.
 * It also contains methods to update the drone's flight data and render the drone on the map.
 * It also contains methods to test whether the drone is flying. Finally, it contains touchdown and takeoff procedures.
 */

export class Drone {
  //@ts-ignore
  mission: Mission = null;

  flightData: FlightData;

  inFlight: boolean = false;

  droneID: string;

  takeoffSpeed: number = 65;

  /**
   * This function is called to create a new drone object.
   * @param flightData - the drone's initial flight data.
   * @param droneID - the drone's ID.
   */
  constructor(flightData: FlightData, droneID: string) {
    this.flightData = flightData;
    this.droneID = droneID;
  }

  /**
   * This function is called to update the drone's flight data.
   * @param flightData - the new flight data.
   */
  update(flightData: FlightData): void {
    // console.log("updating drone" + this.index);
    this.flightData = flightData;

    //checking if a mission is in progress
    if (this.mission == null) {
      //checking if the drone has taken off
      this.testTakeoffTrigger().then((result) => {
        //if the drone has taken off
        if (result) {
          //call takeoff procedure
          this.takeoff();
        }
      });
    }
    //if a mission is in progress
    else if (this.mission != null) {
      //add the new flight data to the mission
      this.mission.update(flightData);

      //check if the drone has landed
      this.testTouchdownTrigger().then((result) => {
        //if the drone has landed
        if (result) {
          //call touchdown procedure
          this.touchdown();
        }
      });
    }
  }

  /**
   * This function is called to determine whether the drone has taken off.
   */
  async testTakeoffTrigger(): Promise<boolean> {
    let hasLanded: boolean =
      this.flightData.groundSpeed >=
      this.takeoffSpeed; /* || this.flightData.altitude >= 10*/
    return hasLanded;
  }

  /**
   * This function is called to determine whether the drone has landed.
   */
  async testTouchdownTrigger(): Promise<boolean> {
    let hasLanded: boolean =
      this.flightData.groundSpeed <
      this.takeoffSpeed; /* || this.flightData.altitude < 10*/
    return hasLanded;
  }

  /**
   * This function is called when the drone takes off.
   * @Description This function is called when the drone takes off.
   * It creates a new mission object and sets the drone's inFlight property to true.
   */
  takeoff(): void {
    this.mission = new Mission(
      this.droneID +
        ":" +
        new Date().getMinutes() +
        ":" +
        new Date().getSeconds(),
      this
    );
    this.inFlight = true;
  }

  /**
   * This function is called when the drone lands.
   * @Description This function is called when the drone lands. It sets the drone's
   * inFlight property to false and uploads the mission to the server.
   */
  touchdown(): void {
    this.mission.upload();
    //@ts-ignore
    this.mission = null;
    this.inFlight = false;
  }
}
