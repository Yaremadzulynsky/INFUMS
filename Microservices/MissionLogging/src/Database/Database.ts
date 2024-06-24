import {
  getFirestore,
  collection,
  addDoc,
  Firestore,
  CollectionReference,
  DocumentData,
} from "firebase/firestore";
import {
  ref,
  getDatabase,
  get,
  set,
  child,
  push,
  onValue,
  DatabaseReference,
} from "firebase/database";
import { Mission } from "../Custom Objects/Mission";
import FlightData from "../Custom Objects/FlightData";
import { firebaseApp } from "./FirebaseObj";
/**
 * This interface is used to define the structure of the data that is stored in the database.
 */
interface MissionData {
  // The name of the drone that is being used for the mission.
  droneID: string;

  //A list of all the flight data objects captured that is associated with the mission.
  flightLog: Array<FlightData>;
}

/**
 * This class is used to interact with the database.
 */
export class Database {
  /**
   * This method is used to upload a mission profile to the database.
   * @param mission {Mission} - the mission to be pushed to the database.
   * @param droneID {string} - the droneID of the drone that was used for the mission.
   */
  static uploadMission(mission: Mission, droneID: string): void {
    //The data that will be pushed to the database.
    let missionData: MissionData = {
      droneID: mission.droneID,
      flightLog: mission.flightLog,
    };

    //create Firestore instance
    const db: Firestore = getFirestore();
    //create a reference to the collection
    const colRef: CollectionReference<DocumentData> = collection(
      db,
      "Missions"
    );

    //upload the mission to the database then log if it was successful.
    addDoc(colRef, missionData).then(() => {
      console.log("Document successfully written!");
    });
  }

  /**
   * This method is used called to monitor the database for any changes.
   * @param path {string} - the path to the data that is being monitored.
   * @param callback {Function} - the function that is called when the data is changed.
   */
  static monitorChanges(path: string, callback: Function): void {
    //create a database instance.
    const db = getDatabase(firebaseApp);
    //create a reference to the path.
    const dbRef: DatabaseReference = ref(db);
    //create a reference to the child of the path.
    const dbChild: DatabaseReference = child(dbRef, path);
    //monitor the child for any changes.
    onValue(dbChild, (snapshot) => {
      //call the callback function with the new data.
      callback(snapshot.val());
    });
  }
}
