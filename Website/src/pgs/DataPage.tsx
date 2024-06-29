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
// import timeSlider from "../components/TimeSlider";
import { NavigationBar } from "../components/NavigationBar";
import { useRouter, useSearchParams } from "next/navigation";
import "semantic-ui-css/semantic.min.css";
import { set } from "firebase/database";

/**
 * Properties for each row in the table.
 * @property {string} leftColumn - The text for the left column.
 * @property {string} rightColumn - The text for the right column.
 * @property {string} icon - The semantic ui icon class name for
 * the icon to display in the left column.
 */
interface TableRowProps {
  mission: FlightLogFromDB;
  row: RowProps;
  icon: string;
}

interface RowProps {
  firstColumn: string;
  secondColumn: string;
  thirdColumn: string;
  fourthColumn: string;
}

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
        <tbody id="missionDetails" />
        <td className="header">
          <i className={"header"} />
          Drone ID
        </td>
        <td className="header">Took Off</td>
        <td className={"header"}>Landed</td>
        <td className="header">
          <i className={"header"} />
          Mission Length
        </td>
        {props.rows.map((row, index) => (
          <tr
            key={index}
            onClick={() => {
              props.handleClick(row.mission);
            }}
            onMouseEnter={() => {
              setHoveredRowIndex(index);
            }}
            onMouseLeave={() => {
              setHoveredRowIndex(null);
            }}
            style={{
              backgroundColor:
                hoveredRowIndex === index ? "#f9f9f9" : "inherit",
            }}
          >
            <td>{row.row.firstColumn}</td>
            <td>{row.row.secondColumn}</td>
            <td>{row.row.thirdColumn}</td>
            <td>{row.row.fourthColumn}</td>
          </tr>
        ))}
      </table>
    </div>
  );
}

let currentFlyingDrone: IFlightData;
let missionCoordinates: ICoordinate[];
let missions: FlightLogFromDB[];

function DataPageWrapper() {
  const router = useRouter();
  const searchParams = new URLSearchParams(window.location.search);

  const {
    selectedDrone,
    setSelectedDrone,
    allRegisteredDrones,
    //   droneIsolated,
  } = useContext(GlobalContext).droneContext;

  if (allRegisteredDrones.length === 0) {
    return <></>;
  }
  useEffect(() => {
    // console.log(selectedDrone);
    if (!searchParams.has("droneID")) {
      searchParams.set("droneID", selectedDrone.droneID);
      const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
      router.push(newUrl);
    } else if (
      droneIDExists(searchParams.get("droneID"), allRegisteredDrones)
    ) {
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
  //   console.log({ selectedDrone, setSelectedDrone, allRegisteredDrones });
  if (selectedDrone === undefined || selectedDrone.droneID === "Placeholder") {
    return <></>;
  } else {
    return <DataPage></DataPage>;
  }
}
function DataPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const {
    selectedDrone,
    setSelectedDrone,
    allRegisteredDrones,
    //   droneIsolated,
  } = useContext(GlobalContext).droneContext;

  const [selectedMission, setSelectedMission] = useState<IFlightLog>();
  const [isLive, setIsLive] = useState(true);
  const [time, setTime] = useState(0);

  //   console.log({ selectedDrone, setSelectedDrone, allRegisteredDrones });
  useEffect(() => {
    setIsLive(true);
    currentFlyingDrone = selectedDrone;
  }, []);

  useEffect(() => {
    const asyncFunc = async () => {
      const flightLogs = await Database.getNonRealTimeData(
        selectedDrone.droneID
      );
      missions = flightLogs;
      //   if (selectedMission === undefined) {
      const mission = missions[0] as FlightLogFromDB;
      // console.log(selectedMission);
      // setTime(0);
      setSelectedMission(DataCastHelper.flightLogFromDBToFlightLog(mission));
      //   setSelectedDrone((missions[0] as unknown as IFlightLog)[time]);
      setTime(0);

      //@ts-ignore
      missionCoordinates = selectedMission?.flightLog
      //   }
    };
    asyncFunc();
  }, []);

  useEffect(() => {
    if (selectedMission) {
      setSelectedDrone(selectedMission.flightLog[time]);
    }
  }, [time]);

  useEffect(() => {
    if (isLive) {
      //find the drone that is currently flying
      setSelectedDrone(currentFlyingDrone);
    } else {
      const mission = missions[0] as FlightLogFromDB;
      // console.log(selectedMission);
      // setTime(0);
      setSelectedMission(DataCastHelper.flightLogFromDBToFlightLog(mission));
      //   setSelectedDrone((missions[0] as unknown as IFlightLog)[time]);
      setTime(0);
      setSelectedDrone((selectedMission as IFlightLog).flightLog[time]);
      
      missionCoordinates = DataCastHelper.pathArrayFromFlightLog(selectedMission as IFlightLog);
    }
    //   else if (missions && missions.length > 0){
    //     // setSelectedMission(missions[0]);
    //     // console.log(missions[0]);
    // setTime(0);
    // }
  }, [isLive]);

  function toggleLive(): void {
    setIsLive(!isLive);
  }

  //   return <></>
  if (
    isLive ||
    missions.length === 0 ||
    missions === undefined ||
    selectedMission === undefined
  ) {
    //   if (false) {
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
            {/* <Link to="/data">{selectedDrone.droneID} </Link> */}
            {/* <h2> */}
            {/* <Link to="/data">{selectedDrone.droneID}</Link> */}
            <text
              onClick={() => {
                // console.log(selectedDrone);
                // router.push("/Data");
              }}
              onMouseOver={() => {
                //make the mouse pointer a hand when hovering over the text
                document.body.style.cursor = "pointer";
                //add some kind of emphasis on the text when hover
              }}
            //   <Link></Link>
              onMouseLeave={() => {
                //change the mouse pointer back to the default when not hovering over the text
                document.body.style.cursor = "default";
              }}
              style={{ color: "#0563C1" }}
            >
              {selectedDrone.droneID}
            </text>

            <NavigationBar floatLeft={false} router={router}></NavigationBar>
            {/* <button
              onClick={() => {
                toggleLive();
              }}
              style={{
                display: "flex",
                justifyContent: "left",
                padding: "10px",
              }}
              className="ui icon button invisible"
            >
              <i
                style={{ display: "flex", justifyContent: "center" }}
                className={`ui big ${isLive ? "green" : "red"} circle icon`}
              ></i>
            </button> */}
            <button
              onClick={() => {
                toggleLive();
              }}
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
            {/* <Link to="/data">{selectedDrone.droneID} </Link> */}

            <NavigationBar
              floatLeft={false}
              whenClicked={() => {

                setSelectedDrone(currentFlyingDrone);
              }}
              router={router}
            ></NavigationBar>
            <button
              onClick={() => {
                toggleLive();
              }}
              style={{
                // float: props.floatLeft ? 'left' : 'right',
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
              max={selectedMission?.flightLog.length as number}
              step={1}
              width={"100%"}
              time={time}
              setTime={setTime}
              mission={selectedMission}
            />
          ) : (
            <></>
          )}

          <TelemetryTable showLastLink={false} flightData={selectedDrone} />
          {missions && missions.length > 0 ? (
            <Missions
              rows={missions.map((mission) => {
                mission = {
                  droneID: selectedDrone.droneID,
                  flightLog: mission.flightLog,
                };
                if (
                  mission.flightLog[mission.flightLog.length - 1].flightTime ===
                  undefined
                ) {
                  repairFlightLog(mission);
                }

                const flightTime: String = secondsToHms(
                  mission.flightLog[mission.flightLog.length - 1]
                    .flightTime as number
                );
                const takeOffDate: Date = new Date(
                  mission.flightLog[0].uploadTime
                );
                const landingDate: Date = new Date(
                  mission.flightLog[mission.flightLog.length - 1].uploadTime
                );

                const takeOffTime: String =
                  takeOffDate.getFullYear() +
                  "-" +
                  takeOffDate.getMonth() +
                  "-" +
                  takeOffDate.getDate() +
                  " " +
                  takeOffDate.getHours() +
                  ":" +
                  takeOffDate.getMinutes() +
                  ":" +
                  takeOffDate.getSeconds();
                const landingTime: String =
                  landingDate.getFullYear() +
                  "-" +
                  landingDate.getMonth() +
                  "-" +
                  landingDate.getDate() +
                  " - " +
                  landingDate.getHours() +
                  ":" +
                  landingDate.getMinutes() +
                  ":" +
                  landingDate.getSeconds();

                return {
                  mission: mission,
                  row: {
                    firstColumn: mission.droneID,
                    secondColumn: String(takeOffTime),
                    thirdColumn: String(landingTime),
                    fourthColumn: String(flightTime),
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
          ) : (
            <></>
          )}
        </div>
      </div>
    );
  }
}

function droneIDExists(droneID: string | null, drones: IFlightData[]): boolean {
  if (droneID === null) {
    return false;
  }
  for (let i = 0; i < drones.length; i++) {
    if (drones[i].droneID === droneID) {
      return true;
    }
  }
  return false;
}

function repairFlightLog(mission: any) {
  // console.log(mission);

  const firstLogTime = mission.flightLog[0].timeStamp.seconds;
  mission.flightLog.forEach((log: any) => {
    log.flightTime = log.timeStamp.seconds - firstLogTime;
    log.uploadTime = log.timeStamp.seconds * 1000;
  });
}

export default DataPageWrapper;
