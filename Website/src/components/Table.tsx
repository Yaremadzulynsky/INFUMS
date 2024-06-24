"use client";
import React, { useContext, useEffect, useState } from "react";
import { telemetryMappings } from "../assets/TelemetryMappings";
import { TableRowProps } from "semantic-ui-react";
import { IFlightData } from "../interfaces/Objects";
import { secondsToHms } from "../helpers/FormatHelper";
import { GlobalContext } from "../providers/GlobalProvider";
import {
  MissionTableProps,
  TelemetryTableProps,
} from "../interfaces/PropArguments";

/**
 * A row in the telemetry table.
 * @function TableRow
 * @param {TableRowProps} props - The properties for the TableRow component.
 * @returns {JSX.Element} - The row in the telemetry table.
 */
function TableRow(props: TableRowProps): JSX.Element {
  return (
    <tr>
      <td className="header" style={props.style}>
        <i className={"ui " + props.icon + " icon"}></i>
        {props.leftColumn}
      </td>
      <td id={props.leftColumn}>{props.rightColumn}</td>
    </tr>
  );
}

/**
 * A React component that renders a telemetry table for a given drone.
 * @function TelemetryTable
 * @param {TelemetryTableProps} props - The properties to configure the TelemetryTable component.
 * @param {IFlightData} props.flightData - The data for the drone to display in the telemetry table.
 * @param {JSX.Element[]} [props.children] - The child elements to render within the telemetry table.
 * @returns {JSX.Element} - The TelemetryTable component.
 */
export function TelemetryTable(props: TelemetryTableProps): JSX.Element {
  // Get the display options from the global context
  const { displayOptions } = useContext(GlobalContext).optionsContext;
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 15000);
    return () => {
      clearInterval(timer);
    };
  }, []);

  // Iterate over the telemetry mappings to build the table rows.
  const tableRowsJSX = (
    <>
      {Object.keys(telemetryMappings).map((key) => {
        if (
          props.flightData[telemetryMappings[key].droneAttributeName] !== -1 &&
          displayOptions.find((option) => option.name === key)?.value === true
        ) {
          if (
            props.flightData[telemetryMappings[key].droneAttributeName] ===
            undefined
          ) {
            return <></>;
          } else if (key === "Last Link") {
            const lastLinkTime =
              props.flightData[telemetryMappings[key].droneAttributeName];

            const timeDiff =
              currentTime - (lastLinkTime as Date).getTime() * 1000;
            const timeDiffInSeconds = Math.floor(timeDiff / 1000);
            const timeDiffInMinutes = Math.floor(timeDiffInSeconds / 60);

            let timeAgo = "";
            if (timeDiffInSeconds < 15) {
              timeAgo = "just now";
            } else if (timeDiffInSeconds < 60) {
              timeAgo = `${timeDiffInSeconds} ${
                timeDiffInSeconds === 1 ? "second" : "secs"
              } ago`;
            } else if (timeDiffInMinutes < 60) {
              timeAgo = `${timeDiffInMinutes} ${
                timeDiffInMinutes === 1 ? "minute" : "mins"
              } ago`;
            } else if (timeDiffInMinutes < 1440) {
              const timeDiffInHours = Math.floor(timeDiffInMinutes / 60);
              timeAgo = `${timeDiffInHours} ${
                timeDiffInHours === 1 ? "hour" : "hrs"
              } ago`;
            } else {
              const timeDiffInDays = Math.floor(timeDiffInMinutes / 1440);
              timeAgo = `${timeDiffInDays} ${
                timeDiffInDays === 1 ? "day" : "days"
              } ago`;
            }

            if (!props.showLastLink) {
              return <></>;
            }
            return (
              <TableRow
                leftColumn={key}
                rightColumn={`${timeAgo} ${telemetryMappings[key].suffix}`}
                icon={telemetryMappings[key].icon}
                key={key}
              />
            );
          } else if (key == "Flight Time") {
            const formattedTime = secondsToHms(
              props.flightData[
                telemetryMappings[key].droneAttributeName
              ] as number
            );
            return (
              <TableRow
                leftColumn={key}
                rightColumn={`${formattedTime} ${telemetryMappings[key].suffix}`}
                icon={telemetryMappings[key].icon}
                key={key}
              />
            );
          } else if (key == "Roll") {
            const unfilteredRoll = props.flightData[
              telemetryMappings[key].droneAttributeName
            ] as number;
            const filteredRoll = Math.abs(unfilteredRoll);

            let rollColor = "black";
            let rollIcon = telemetryMappings[key].icon;

            if (filteredRoll > 10) {
              rollColor = "red";
            }
            if (unfilteredRoll < 0) {
              rollIcon += " flipped";
            }
            return (
              <TableRow
                leftColumn={key}
                rightColumn={`${filteredRoll} ${telemetryMappings[key].suffix}`}
                icon={rollIcon}
                key={key}
                style={{ color: rollColor }}
              />
            );
          } else if (key == "Yaw") {
            const unfilteredYaw = props.flightData[
              telemetryMappings[key].droneAttributeName
            ] as number;
            const filteredYaw = Math.abs(unfilteredYaw);

            let rollIcon = telemetryMappings[key].icon;

            if (unfilteredYaw < 0) {
              rollIcon += " flipped";
            }
            return (
              <TableRow
                leftColumn={key}
                rightColumn={`${filteredYaw} ${telemetryMappings[key].suffix}`}
                icon={rollIcon}
                key={key}
              />
            );
          } else if (key == "Pitch") {
            const pitch = props.flightData[
              telemetryMappings[key].droneAttributeName
            ] as number;

            let pitchColor = "black";
            if (Math.abs(pitch) > 10) {
              pitchColor = "red";
            }
            return (
              <TableRow
                leftColumn={key}
                rightColumn={`${pitch} ${telemetryMappings[key].suffix}`}
                icon={telemetryMappings[key].icon}
                key={key}
                style={{ color: pitchColor }}
              />
            );
          } else if (key == "V-Speed") {
            const unfilteredVSpeed = props.flightData[
              telemetryMappings[key].droneAttributeName
            ] as number;
            // const filteredVSpeed = Math.abs(unfilteredVSpeed);

            let vSpeedIcon = telemetryMappings[key].icon;
            if (unfilteredVSpeed < 0) {
              vSpeedIcon = "arrow circle down";
            }
            return (
              <TableRow
                leftColumn={key}
                rightColumn={`${unfilteredVSpeed} ${telemetryMappings[key].suffix}`}
                icon={vSpeedIcon}
                key={key}
              />
            );
          } else {
            return (
              <TableRow
                leftColumn={key}
                rightColumn={`${
                  props.flightData[telemetryMappings[key].droneAttributeName]
                } ${telemetryMappings[key].suffix}`}
                icon={telemetryMappings[key].icon}
                key={key}
              />
            );
          }
        }
      })}
    </>
  );

  return (
    <div>
      {props.children}
      <table className="ui celled table">
        <tbody>{tableRowsJSX}</tbody>
      </table>
    </div>
  );
}

/**

 MissionTable Component displays a table of previous drone missions, including details such as drone ID, takeoff time,
 landing time and mission duration. It accepts a rows prop which is an array of objects representing each row of the table.
 It also has a handleClick prop which is a function that is called when a row is clicked.
 @param {MissionTableProps} props - The props of the MissionTable component.
 @param {Array<Object>} props.rows - The rows of the table, each containing an object with four properties representing the four columns.
 @param {Function} props.handleClick - The function called when a row is clicked.
 @returns {JSX.Element} - A JSX element that represents the MissionTable component.
 */
export function MissionTable(props: MissionTableProps): JSX.Element {
  /**

 State variable for the hovered row index.
 */
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
