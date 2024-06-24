import { Drone } from "./Custom Objects/Drone";
import { Database } from "./Database/Database";
import FlightData from "./Custom Objects/FlightData";

//this is an array of drones that have been pulled from the database.
let drones: Array<Drone> = [];

/**
 * This function is called to update the drone's flight data.
 * If the drone is not in the array, it is added to the array.
 * @param flightData
 */
function updateDrones(flightData: FlightData) {
  flightData.latitude = flightData.latitude;
  flightData.longitude = flightData.longitude;

  //this boolean is used to avoid adding the same drone twice.
  let createNewDrone: boolean = true;
  drones.forEach((drone) => {

    //update the drone's flight data if it is already in the array.
    if (drone.droneID === flightData.droneID) {
      drone.update(flightData);
      //set the boolean too false to avoid adding the drone twice.
      createNewDrone = false;
      return;
    }
  });
  //if the drone is not in the array, add it.
  if (createNewDrone) {
    //create a new drone object
    drones.push(new Drone(flightData, flightData.droneID));

    //update the new drone's flight data
    drones.forEach((drone) => {
      if (drone.droneID === flightData.droneID) {
        drone.update(flightData);
        return;
      }
    });
  }
}

/**
 * This function is called to react to database changes.
 * The database changes when new flight information becomes available.
 * The path is /Live because that is where the flight data is stored.
 */
Database.monitorChanges("/Live", function (data: Array<FlightData>) {
  for (let dataPacketIndex in data) {
    //call the update function to update the drone's flight
    //data and/or create a new drone if it does not exist in the drones array.
    updateDrones(data[dataPacketIndex]);
  }
});

