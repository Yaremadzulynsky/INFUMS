import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { config } from "dotenv";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, DatabaseReference } from "firebase/database";
import readline from "readline";
import Bottleneck from "bottleneck";

// Load environment variables from a .env file into process.env
config();

let prevLanded: boolean = false;
let landed: boolean = false;

const maxTransmissions = 1000;
let transmissionCount: number = 0;

const limiter = new Bottleneck({
  minTime: 1000, // Minimum time between each request (1 second)
  maxConcurrent: 1, // Maximum number of concurrent requests
  reservoir: 28, // Initial amount of requests
  reservoirRefreshAmount: 28, // Number of requests to add
  reservoirRefreshInterval: 60 * 60 * 24 * 1000, // Refresh every day
});

// Listen for various events
limiter.on("error", (error) => {
  console.error("Error occurred:", error);
});

limiter.on("failed", (error, jobInfo) => {
  console.error("Job failed:", error);
  console.log("Job info:", jobInfo);
});

// limiter.on('done', (result, jobInfo) => {
//   console.log('Job done:', result);
//   console.log('Job info:', jobInfo);
// });

limiter.on("retry", (error, jobInfo) => {
  console.log("Job retry:", jobInfo);
  console.error("Retry error:", error);
});

limiter.on("depleted", () => {
  console.warn("Reservoir depleted");
});

limiter.on("dropped", (droppedJob) => {
  console.error("Job dropped due to rate limiting:", droppedJob);
});

// Parse Firebase configuration from environment variable
const firebaseConfig = process.env.FIREBASE_CONFIG
  ? JSON.parse(process.env.FIREBASE_CONFIG)
  : {};

// Initialize Firebase app with the configuration
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Default transmission interval (20 minutes in milliseconds)
let transmissionInterval: number = 20 * 60 * 1000;
let nextTransmissionTime: number = 0;
let airplaneHex: string = "4b187a";
let intervalHandle: NodeJS.Timeout;

// Track the last few transmission timestamps
const transmissionTimestamps: number[] = [];

// Main function to handle CLI input and scheduling transmissions
async function main() {
  // Create readline interface for CLI input
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.setPrompt("Enter command: ");
  rl.prompt();

  // Event listener for CLI input lines
  rl.on("line", async (line) => {
    const [command, ...args] = line.trim().split(" ");
    switch (command) {
      case "update":
        await updateTransmission();
        console.log("Transmission updated");
        break;
      case "exit":
        console.log("Exiting...");
        rl.close();
        process.exit(0);
      case "status":
        console.log("CLI is running");
        break;
      case "next":
        showNextTransmissionTime();
        break;
      case "setHex":
        if (args.length === 1) {
          airplaneHex = args[0];
          console.log(`Airplane hex set to ${airplaneHex}`);
        } else {
          console.log("Usage: set hex <hex_code>");
        }
        break;
      case "set":
        if (args.length === 1) {
          const newInterval = parseInt(args[0], 10);
          if (!isNaN(newInterval) && newInterval >= 1) {
            setTransmissionInterval(newInterval);
            console.log(`Transmission interval set to ${newInterval} minutes`);
          } else {
            console.log(
              "Invalid interval. Please enter a number greater than or equal to 1."
            );
          }
        } else {
          console.log("Usage: set <interval_in_minutes>");
        }
        break;
      default:
        console.log(`Unknown command: ${line.trim()}`);
        break;
    }
    rl.prompt();
  });

  // Initial transmission update and scheduling
  await updateTransmission();
  scheduleNextTransmission();
}

// Function to update transmission with latest airplane data
async function updateTransmission() {
  const now = Date.now();

  // Check if more than one request has been sent in the past 15 minutes
  const fifteenMinutes = 5 * 60 * 1000;
  const recentTransmissions = transmissionTimestamps.filter(
    (timestamp) => now - timestamp < fifteenMinutes
  );

  if (recentTransmissions.length > 10) {
    console.log(
      "More than 10 transmissions detected in the past 5 minutes. Exiting..."
    );
    process.exit(0);
    return;
  }

  // Record the current transmission timestamp
  transmissionTimestamps.push(now);
  // Keep only the relevant timestamps
  while (transmissionTimestamps.length > maxTransmissions) {
    transmissionTimestamps.shift();
  }

  if (transmissionCount >= maxTransmissions) {
    console.log("Max transmissions reached! Exiting...");
    process.exit(0);
    return;
  }
  transmissionCount++;
  prevLanded = landed;

  const response = await limitGetAirplaneData(airplaneHex);
  let data: any;
  if ((response as AxiosResponse<any>).data.ac === undefined) {
    data = (response as AxiosResponse<any>).data;
  } else if ((response as AxiosResponse<any>).data.ac[0] !== undefined) {
    data = (response as AxiosResponse<any>).data.ac[0];
  }
  console.log("data: ", (response as AxiosResponse<any>).data);

  if (data === undefined || data.alt_baro === "ground") {
    console.log("Plane not flying");
    landed = true;
    if (prevLanded !== landed) {
      console.log("Landed status changed to: ", landed);
      updateTransmission();
    }
  } else {
    if (data !== "error") {
      landed = false;
      const formattedData = formatData(data);
      uploadToFirebase(
        formattedData,
        ref(database, `Live/${formattedData.droneID}`)
      );
    }
  }
}

// Function to schedule the next transmission
function scheduleNextTransmission() {
  if (intervalHandle) {
    clearTimeout(intervalHandle);
  }
  nextTransmissionTime = Date.now() + transmissionInterval;
  intervalHandle = setTimeout(async () => {
    await updateTransmission();
    console.log("Scheduled transmission updated");
    scheduleNextTransmission();
  }, transmissionInterval);
}

// Function to set the transmission interval
function setTransmissionInterval(minutes: number) {
  transmissionInterval = minutes * 60 * 1000; // Convert minutes to milliseconds
  scheduleNextTransmission();
}

// Function to show the time remaining until the next transmission
function showNextTransmissionTime() {
  const now = Date.now();
  const remainingTime = nextTransmissionTime - now;
  const minutes = Math.floor(remainingTime / 60000);
  const seconds = Math.floor((remainingTime % 60000) / 1000);
  console.log(
    `Time until next transmission: ${minutes} minutes and ${seconds} seconds`
  );
}

// Function to get airplane data from the API
async function getAirplaneData(hex: string) {
  let options: AxiosRequestConfig;
  if (landed) {
    options = {
      method: "GET",
      url: `https://adsbexchange-com1.p.rapidapi.com/v2/hex/${hex}/`,
      headers: {
        "x-rapidapi-key": process.env.API_KEY,
        "x-rapidapi-host": "adsbexchange-com1.p.rapidapi.com",
      },
    };
  } else {
    options = {
      method: "GET",
      url: `https://adsbexchange-com1.p.rapidapi.com/v2/icao/${hex}/`,
      headers: {
        "x-rapidapi-key": process.env.API_KEY,
        "x-rapidapi-host": "adsbexchange-com1.p.rapidapi.com",
      },
    };
  }

  try {
    const response = await axios.request(options);
    return response;
  } catch (error) {
    console.error(error);
    return "error";
  }
}

// Function to convert knots to kilometers per hour
function knotsToKph(knots: number) {
  return knots * 1.852;
}

// Function to convert feet to meters
function ftToM(ft: number) {
  return ft * 0.3048;
}

// Function to format data for Firebase upload
function formatData(data: any) {
  // const inFlight = data.gs > 10;
  // const groundSpeed = inFlight ? knotsToKph(data.gs) : 0;
  let inFlight: boolean;
  let groundSpeed: number;

  if (data.lat === undefined || data.lon === undefined) {
    data.lat = data.lastPosition.lat;
    data.lon = data.lastPosition.lon;
  }

  // let prevLanded: boolean = landed;

  if (data.alt_baro === "ground" || data === undefined) {
    data.alt_baro = 0;
    inFlight = false;
    groundSpeed = 0;
    // landed = true;
  } else {
    inFlight = true;
    groundSpeed = knotsToKph(data.gs);
    // landed = false;
  }

  if (prevLanded !== landed) {
    console.log("Landed status changed to: ", landed);
    limitGetAirplaneData(airplaneHex);
  }

  return {
    altitude: inFlight ? ftToM(data.alt_baro).toFixed(2) || 7377 : 0,
    droneID: airplaneHex || "UnknownFlight",
    flight: data.flight || "",
    groundSpeed: groundSpeed.toFixed(2) || 0,
    heading: inFlight ? data.track || 220.9 : 0,
    inFlight: inFlight,
    latitude: data.lat,
    longitude: data.lon,
    squawk: data.squawk || "",
    relativeAltitude: inFlight ? ftToM(data.alt_geom) || 7013 : 0,
    uploadTime: data.seen
      ? (Date.now() - data.seen * 1000) / 1000
      : Date.now() / 1000,
    pitch: inFlight ? data.pitch || -1.03 : 0,
    pitchSpeed: inFlight ? data.pitchSpeed || -0.12 : 0,
    roll: inFlight ? data.roll || -1 : 0,
    rollSpeed: inFlight ? data.rollSpeed || 0.07 : 0,
    vx: inFlight ? data.vx || -0.04 : 0,
    vy: inFlight ? data.vy || 0.01 : 0,
    vz: inFlight ? data.vz || 0 : 0,
    yaw: inFlight ? data.yaw || -159.1 : 0,
    yawSpeed: inFlight ? data.yawSpeed || 0 : 0,
  };
}

// Function to upload formatted data to Firebase
function uploadToFirebase(data: any, ref: DatabaseReference) {
  set(ref, data)
    .then(() => {
      console.log("Data uploaded successfully:", data);
    })
    .catch((error) => {
      console.error("Error uploading data:", error);
    });
}

const limitGetAirplaneData = limiter.wrap(getAirplaneData);

// Start the CLI and scheduling
main();
