import * as fs from "fs-extra";
import * as path from "path";
import csv from "csv-parser";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, DatabaseReference } from "firebase/database";
import { config } from "dotenv";

const inputFolder =
  "/Users/yaremadzulynsky/Software/Major_Projects/AeroRadarPublic/Microservices/MockData/csv-files"; // Folder containing CSV files
const jsonFolder =
  "/Users/yaremadzulynsky/Software/Major_Projects/AeroRadarPublic/Microservices/MockData/json-files"; // Folder to save JSON files
const combinedJsonFile =
  "/Users/yaremadzulynsky/Software/Major_Projects/AeroRadarPublic/Microservices/MockData/combined-data.json"; // File to save combined JSON data
// Initialize Firebase app with the configuration

config();

const firebaseConfig = process.env.FIREBASE_CONFIG
  ? JSON.parse(process.env.FIREBASE_CONFIG)
  : {};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

async function convertCsvToJson() {
  try {
    const files = await fs.readdir(inputFolder);

    // Ensure the output folder exists
    await fs.ensureDir(jsonFolder);

    for (const file of files) {
      const filePath = path.join(inputFolder, file);
      const ext = path.extname(file);
      if (ext === ".csv") {
        const results: any[] = [];
        const baseFileName = path.basename(file, ext).split("_")[0];
        let entryCount = 0;
        fs.createReadStream(filePath)
          .pipe(csv())
          .on("data", (data: any) => {
            if (entryCount % 1 === 0) {
              // Add filename field and convert UTC to Date object
              data.hex = baseFileName;
              data.UTC = new Date(data.UTC);

              let latLngPair = data.Position.split(",");
              data.lat = parseFloat(latLngPair[0]);
              data.lng = parseFloat(latLngPair[1]);

              delete data.Position;

              results.push(data);
            }
            entryCount++;
          })
          .on("end", async () => {
            const jsonFileName = path.basename(file, ext) + ".json";
            const jsonFilePath = path.join(jsonFolder, jsonFileName);

            await fs.writeJson(jsonFilePath, results, { spaces: 2 });
            console.log(`Converted ${file} to ${jsonFileName}`);
          });
      }
    }
  } catch (error) {
    console.error("Error reading files:", error);
  }
}

async function combineJsonFiles() {
  try {
    const files = await fs.readdir(jsonFolder);
    let combinedData: any[] = [];

    for (const file of files) {
      const filePath = path.join(jsonFolder, file);
      const ext = path.extname(file);
      if (ext === ".json") {
        const data = await fs.readJson(filePath);
        combinedData = combinedData.concat(data);
      }
    }

    // Sort the combined array by the 'UTC' field
    combinedData.sort(
      (a, b) => new Date(a.UTC).getTime() - new Date(b.UTC).getTime()
    );

    // Write the combined and sorted array to a new JSON file
    await fs.writeJson(combinedJsonFile, combinedData, { spaces: 2 });
    console.log(`Combined JSON file saved as ${combinedJsonFile}`);
  } catch (error) {
    console.error("Error reading or combining JSON files:", error);
  }
}

interface Event {
  Timestamp: number;
  UTC: Date;
  Callsign: string;
  lat: number;
  lng: number;
  Altitude: number;
  Speed: number;
  Direction: number;
  hex: string;
}

async function playbackEvents(callback: (event: Event) => void) {
  try {
    const events: Event[] = await fs.readJson(combinedJsonFile);

    // Ensure the events are sorted by UTC
    events.sort(
      (a, b) => new Date(a.UTC).getTime() - new Date(b.UTC).getTime()
    );

    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      let delay = 0;

      if (i > 0) {
        const previousEvent = events[i - 1];
        delay =
          new Date(event.UTC).getTime() - new Date(previousEvent.UTC).getTime();
      }
      delay = delay / 60;

      setTimeout(() => {
        callback(event);
      }, delay);
    }
  } catch (error) {
    console.error("Error reading or playing back events:", error);
  }
}

let eventNumber = 0;
// Example callback function
function eventCallback(event: Event) {
  //   if (eventNumber % 100/ === 0) {
  console.log(`Event at ${event.UTC}:`, event);
  //   }
  eventNumber++;
}
function uploadToFirebase(data: any, ref: DatabaseReference) {
  set(ref, data)
    .then(() => {
      console.log("Data uploaded successfully:", data);
    })
    .catch((error) => {
      console.error("Error uploading data:", error);
    });
}

// Start playback
async function main() {
  // await convertCsvToJson();
  // await combineJsonFiles();
  playbackEvents((event: Event) => {
    let formattedData = {
      altitude: event.Altitude,
      droneID: event.hex,
      flight: event.Callsign,
      groundSpeed: event.Speed,
      heading: event.Direction,
      inFlight: event.Speed > 0,
      latitude: event.lat,
      longitude: event.lng,
      // squawk: data.squawk || "",
      // relativeAltitude: inFlight ? ftToM(data.alt_geom) || 7013 : 0,
      uploadTime: (Date.now() - event.Timestamp * 1000),
      // pitch: inFlight ? data.pitch || -1.03 : 0,
      // pitchSpeed: inFlight ? data.pitchSpeed || -0.12 : 0,
      // roll: inFlight ? data.roll || -1 : 0,
      // rollSpeed: inFlight ? data.rollSpeed || 0.07 : 0,
      // vx: inFlight ? data.vx || -0.04 : 0,
      // vy: inFlight ? data.vy || 0.01 : 0,
      // vz: inFlight ? data.vz || 0 : 0,
      // yaw: inFlight ? data.yaw || -159.1 : 0,
      // yawSpeed: inFlight ? data.yawSpeed || 0 : 0,
    };
    console.log(formattedData);
    // uploadToFirebase(
    //   formattedData,
    //   ref(database, `Live/${formattedData.droneID}`)
    // );
  });
}

main();
