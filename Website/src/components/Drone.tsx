"use client"
import React, {Dispatch, SetStateAction} from "react";
import {MarkerProps} from "@react-google-maps/api";
import {PlaneIcon} from "../assets/PlaneIcon";
import {IFlightData} from "../interfaces/Objects";

/**
 * A component that displays a drone marker on a Google Map.
 *
 * @param {Object} props - The properties of the component.
 * @param {IFlightData} props.drone - The drone to display on the map.
 * @param {MarkerProps} props.markerProps - The properties for the Google Map marker.
 * @returns {JSX.Element} - A Google Map marker with an airplane icon for the drone.
 */
function Drone(props: { drone: IFlightData, markerProps?: MarkerProps }): JSX.Element {
    return (
        <div>
            <PlaneIcon drone={props.drone} markerProps={props.markerProps}/>
        </div>
    );
}

/**
 * A function that returns a JSX element with a list of drone markers on a Google Map.
 *
 * @param {IFlightData[] | null} dronesToRender - The drones to display on the map.
 * @param {Dispatch<SetStateAction<IFlightData>>} setSelectedDrone - A function to set the selected drone.
 * @param {boolean} droneIsolated - Whether a drone is isolated.
 * @param {IFlightData} selectedDrone - The selected drone.
 * @returns {JSX.Element} - A list of drone markers to display on the Google Map.
 */
export function droneVisualJSX(dronesToRender: IFlightData[] | null, setSelectedDrone: Dispatch<SetStateAction<IFlightData>>, droneIsolated: boolean, selectedDrone: IFlightData): JSX.Element {
    // If droneIsolated is true, only show the selected drone. Otherwise, show all drones.
    if (droneIsolated) {
        dronesToRender = [selectedDrone];
    }
    dronesToRender = dronesToRender || [];

    /**
     * A function to handle the onClick event for a drone marker.
     *
     * @param {IFlightData} clickedDrone - The drone that was clicked on.
     * @param {Dispatch<SetStateAction<IFlightData>>} setSelectedDrone - A function to set the selected drone.
     */
    function onClick(clickedDrone: IFlightData, setSelectedDrone: Dispatch<SetStateAction<IFlightData>>): void {
        setSelectedDrone(clickedDrone);
    }

    return (
        <>
            {dronesToRender.map((drone: IFlightData) => {
                return (
                    <Drone
                        drone={drone}
                        markerProps={{
                            position: drone.coordinate,
                            onClick: () => {
                                onClick(drone, setSelectedDrone);
                            }
                        }}
                        key={drone.droneID}
                    />
                );
            })}
        </>
    );
}
