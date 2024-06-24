"use client";
import { Link, Navigate, useNavigate } from "react-router-dom";
import React, { useContext, useEffect, useState } from "react";
import { TelemetryTable } from "../components/Table";
import TimeSlider from "../components/TimeSlider";
import { Map } from "../components/Map";
import { Path } from "../components/Path";
import { droneVisualJSX } from "../components/Drone";
import Database from "../database/Database";
import DataCastHelper from "../helpers/DataCastHelper";
import { secondsToHms } from "../helpers/FormatHelper";
import {
  FlightLogFromDB,
  ICoordinate,
  IFlightData,
  IFlightLog,
} from "../interfaces/Objects";
import { GlobalContext } from "../providers/GlobalProvider";
import DroneConfigBanner from "../components/DroneConfigBanner";
import { NavigationBar } from "../components/NavigationBar";
import { useRouter, useSearchParams } from "next/navigation";
import "semantic-ui-css/semantic.min.css";

/**
 * Properties for each row in the table.
 * @property {string} firstColumn - The text for the first column.
 * @property {string} secondColumn - The text for the second column.
 * @property {string} thirdColumn - The text for the third column.
 * @property {string} fourthColumn - The text for the fourth column.
 */
interface RowProps {
  firstColumn: string;
  secondColumn: string;
  thirdColumn: string;
  fourthColumn: string;
}

/**
 * Properties for each mission row in the table.
 * @property {FlightLogFromDB} mission - The mission data.
 * @property {RowProps} row - The row data.
 * @property {string} icon - The icon for the row.
 */
interface TableRowProps {
  mission: FlightLogFromDB;
  row: RowProps;
  icon: string;
}

/**
 * Component for displaying previous missions.
 * @param {Object} props - The component properties.
 * @param {TableRowProps[]} props.rows - The rows to display.
 * @param {Function} props.handleClick - The click handler for rows.
 */
function Missions(props: {
  rows: TableRowProps[];
  handleClick: (mission: FlightLogFromDB) => void;
}) {
  const [hoveredRowIndex, setHoveredRowIndex] = useState<number | null>(null);

  return (
    <div className="ui container">
      <h2 style={{ paddingTop: "10px" }} className="header">
        Previous Missions
      </h2>
      <table className="ui celled table">
        <thead>
          <tr>
            <th>Drone ID</th>
            <th>Took Off</th>
            <th>Landed</th>
            <th>Mission Length</th>
          </tr>
        </thead>
        <tbody>
          {props.rows.map((row, index) => (
            <tr
              key={index}
              onClick={() => props.handleClick(row.mission)}
              onMouseEnter={() => setHoveredRowIndex(index)}
              onMouseLeave={() => setHoveredRowIndex(null)}
              style={{
                backgroundColor: hoveredRowIndex === index ? "#f9f9f9" : "inherit",
              }}
            >
              <td>{row.row.firstColumn}</td>
              <td>{row.row.secondColumn}</td>
              <td>{row.row.thirdColumn}</td>
              <td>{row.row.fourthColumn}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

let currentFlyingDrone: IFlightData;
let missionCoordinates: ICoordinate[];
let missions: FlightLogFromDB[];

/**
 * Wrapper component for the data page.
 */
function DataPageWrapper() {
  const router = useRouter();
  const searchParams = new URLSearchParams(window.location.search);
  const {
    selectedDrone,
    setSelectedDrone,
    allRegisteredDrones,
  } = useContext(GlobalContext).droneContext;

  if (allRegisteredDrones.length === 0) {
    return <></>;
  }

  useEffect(() => {
    if (!searchParams.has("droneID")) {
      searchParams.set("droneID", selectedDrone.droneID);
      const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
      router.push(newUrl);
    } else if (droneIDExists(searchParams.get("droneID"), allRegisteredDrones)) {
      const droneID = searchParams.get("droneID");
      if (selectedDrone.droneID !== droneID) {
        setSelectedDrone(
          allRegisteredDrones.find(
            (drone) => drone.droneID === droneID
          ) as IFlightData
        );
      }
    } else {
      searchParams.set("droneID", selectedDrone.droneID);
      const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
      router.push(newUrl);
    }
  }, []);

  useEffect(() => {
    if (selectedDrone.droneID !== "Placeholder") {
      searchParams.set("droneID", selectedDrone.droneID);
      const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
      router.push(newUrl);
    }
  }, [selectedDrone]);

  if (selectedDrone === undefined || selectedDrone.droneID === "Placeholder") {
    return <></>;
  } else {
    return <DataPage />;
  }
}

/**
 * Main component for the data page.
 */
function DataPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const {
    selectedDrone,
    setSelectedDrone,
    allRegisteredDrones,
  } = useContext(GlobalContext).droneContext;

  const [selectedMission, setSelectedMission] = useState<IFlightLog>();
  const [isLive, setIsLive] = useState(true);
  const [time, setTime] = useState(0);

  useEffect(() => {
    setIsLive(true);
    currentFlyingDrone = selectedDrone;
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const flightLogs = await Database.getNonRealTimeData(selectedDrone.droneID);
      missions = flightLogs;
      const mission = missions[0] as FlightLogFromDB;
      setSelectedMission(DataCastHelper.flightLogFromDBToFlightLog(mission));
      setTime(0);
      // @ts-ignore
      missionCoordinates = selectedMission?.flightLog;
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedMission) {
      setSelectedDrone(selectedMission.flightLog[time]);
    }
  }, [time]);

  useEffect(() => {
    if (isLive) {
      setSelectedDrone(currentFlyingDrone);
    } else {
      const mission = missions[0] as FlightLogFromDB;
      setSelectedMission(DataCastHelper.flightLogFromDBToFlightLog(mission));
      setTime(0);
      setSelectedDrone((selectedMission as IFlightLog).flightLog[time]);
      missionCoordinates = DataCastHelper.pathArrayFromFlightLog(selectedMission as IFlightLog);
    }
  }, [isLive]);

  useEffect(() => {
    if (selectedMission && !isLive) {
      setTime(0);
      setSelectedDrone((selectedMission as IFlightLog).flightLog[time]);
      missionCoordinates = DataCastHelper.pathArrayFromFlightLog(selectedMission as IFlightLog);
    }
  }, [selectedMission]);

  /**
   * Toggles live mode on or off.
   */
  function toggleLive(): void {
    setIsLive(!isLive);
  }

  if (
    isLive ||
    missions.length === 0 ||
    missions === undefined ||
    selectedMission === undefined
  ) {
    return (
      <div className="ui container">
        <div className="flight-info">
          <h2
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "10px",
              paddingLeft: "20px",
            }}
            id="flightNumber"
          >
            <span
              onClick={() => {
                
              }}
              onMouseOver={() => {
                document.body.style.cursor = "pointer";
              }}
              onMouseLeave={() => {
                document.body.style.cursor = "default";
              }}
              style={{ color: "#0563C1" }}
            >
              {selectedDrone.droneID}
            </span>

            <NavigationBar floatLeft={false} router={router} />

            <button
              onClick={toggleLive}
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "10px",
                backgroundColor: "transparent",
                border: "none",
              }}
              className={`ui icon button ${
                isLive ? "live-button" : "not-live-button"
              }`}
            >
              <i
                style={{ display: "flex", justifyContent: "center" }}
                className={`ui big ${isLive ? "green" : "red"} circle icon`}
              ></i>
            </button>

            <style jsx>{`
              .live-button:hover i {
                color: darkgreen !important;
              }
              .not-live-button:hover i {
                color: darkred !important;
              }
            `}</style>
          </h2>
          <p style={{ textAlign: "center", color: "gray" }}>
          {isLive
            ? "You are currently viewing live data. Click the green button to view previous missions."
            : "You are viewing previous missions. Click the red button to go back to live data."}
        </p>
          <Map
            latLng={selectedDrone.coordinate}
            zoom={7}
            mapContainerClassName={"dataMap"}
          >
            {droneVisualJSX(
              allRegisteredDrones,
              setSelectedDrone,
              true,
              selectedDrone
            )}
          </Map>
          <DroneConfigBanner
            readyForFlight={false}
            frequency={180}
            droneID={selectedDrone.droneID}
          />
          <TelemetryTable showLastLink={true} flightData={selectedDrone} />
        </div>
      </div>
    );
  } else {
    return (
      <div className="ui container">
        <div className="flight-info">
          <h2
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "10px",
              paddingLeft: "20px",
            }}
            id="flightNumber"
          >
            {selectedDrone.droneID}

            <NavigationBar
              floatLeft={false}
              whenClicked={() => setSelectedDrone(currentFlyingDrone)}
              router={router}
            />
            <button
              onClick={toggleLive}
              style={{
                justifyContent: "center",
                paddingRight: "0px",
                backgroundColor: "transparent",
                border: "none",
              }}
              className="ui icon button invisible"
            >
              <i
                style={{ display: "flex", justifyContent: "center" }}
                className={`ui big ${isLive ? "green" : "red"} circle icon`}
              ></i>
            </button>
          </h2>
          <p style={{ textAlign: "center", color: "gray" }}>
          {isLive
            ? "You are currently viewing live data. Click the green button to view previous missions."
            : "You are viewing previous missions. Click the red button to go back to live data."}
        </p>
          <Map
            latLng={selectedDrone.coordinate}
            zoom={7}
            mapContainerClassName={"dataMap"}
          >
            {droneVisualJSX(
              allRegisteredDrones,
              setSelectedDrone,
              true,
              selectedDrone
            )}
            <Path path={missionCoordinates} />
          </Map>

          {selectedMission && selectedMission.flightLog.length > 0 ? (
            <TimeSlider
              min={0}
              max={selectedMission.flightLog.length}
              step={1}
              width={"100%"}
              time={time}
              setTime={setTime}
              mission={selectedMission}
            />
          ) : null}

          <TelemetryTable showLastLink={false} flightData={selectedDrone} />
          {missions && missions.length > 0 ? (
            <Missions
              rows={missions.map((mission) => {
                if (!mission.flightLog[mission.flightLog.length - 1].flightTime) {
                  repairFlightLog(mission);
                }

                const flightTime: string = secondsToHms(
                  mission.flightLog[mission.flightLog.length - 1].flightTime
                );
                const takeOffDate: Date = new Date(mission.flightLog[0].uploadTime);
                const landingDate: Date = new Date(
                  mission.flightLog[mission.flightLog.length - 1].uploadTime
                );

                const takeOffTime: string =
                  `${takeOffDate.getFullYear()}-${takeOffDate.getMonth() + 1}-${takeOffDate.getDate()} ` +
                  `${takeOffDate.getHours()}:${takeOffDate.getMinutes()}:${takeOffDate.getSeconds()}`;
                const landingTime: string =
                  `${landingDate.getFullYear()}-${landingDate.getMonth() + 1}-${landingDate.getDate()} ` +
                  `${landingDate.getHours()}:${landingDate.getMinutes()}:${landingDate.getSeconds()}`;

                return {
                  mission,
                  row: {
                    firstColumn: mission.droneID,
                    secondColumn: takeOffTime,
                    thirdColumn: landingTime,
                    fourthColumn: flightTime,
                  },
                  icon: "plane",
                };
              })}
              handleClick={(mission) => {
                setSelectedMission(
                  DataCastHelper.flightLogFromDBToFlightLog(mission)
                );
                setTime(0);
              }}
            />
          ) : null}
        </div>
      </div>
    );
  }
}

/**
 * Checks if the given drone ID exists in the list of drones.
 * @param {string | null} droneID - The drone ID to check.
 * @param {IFlightData[]} drones - The list of drones.
 * @returns {boolean} True if the drone ID exists, false otherwise.
 */
function droneIDExists(droneID: string | null, drones: IFlightData[]): boolean {
  if (droneID === null) {
    return false;
  }
  return drones.some((drone) => drone.droneID === droneID);
}

/**
 * Repairs the flight log for the given mission by calculating flight time and upload time.
 * @param {any} mission - The mission to repair.
 */
function repairFlightLog(mission: any) {
  const firstLogTime = mission.flightLog[0].timeStamp.seconds;
  mission.flightLog.forEach((log: any) => {
    log.flightTime = log.timeStamp.seconds - firstLogTime;
    log.uploadTime = log.timeStamp.seconds * 1000;
  });
}

export default DataPageWrapper;
