"use client"

// Import necessary modules and interfaces
import {MarkerF, MarkerProps} from "@react-google-maps/api";
import React from "react";
import {IFlightData} from "../interfaces/Objects";

/**
 * A function component that returns a Google Map marker for a selected drone, in the form of a plane SVG icon.
 * @function
 * @param {Object} props - The properties for the Google Map marker, including the drone object and optional marker properties.
 * @param {IFlightData} props.drone - The drone object containing the drone's coordinates and heading information.
 * @param {MarkerProps} [props.markerProps] - Optional marker properties to override the default settings.
 * @returns {JSX.Element} A Google Map marker in the form of a plane SVG icon.
 * @example
 * const myDrone = { droneID: "001", coordinate: { lat: 32.7749, lng: -22.4194 }, heading: 45 };
 * <PlaneIcon drone={myDrone} markerProps={{ position: { lat: 32.7749, lng: -22.4194 } }} />
 */
export function PlaneIcon(props: { drone: IFlightData, markerProps?: MarkerProps }): JSX.Element {
    // Define the SVG path for the plane icon
    const PLANE_SVG = 'M0.972,0.028 c-0.038,-0.038,-0.1,-0.038,-0.138,0.001 L0.629,0.243 L0.129,0.078 L0.024,0.183 l0.417,0.257 L0.23,0.659 l-0.135,-0.022 L0,0.732 l0.199,0.07 L0.268,1 l0.095,-0.095 l-0.022,-0.135 l0.22,-0.211 L0.817,0.976 l0.105,-0.105 l-0.165,-0.5 L0.97,0.166 C1,0.129,1,0.066,0.972,0.028';

    // Define the options for the marker outlined in the Google Maps API
    const markerOptions: google.maps.MarkerOptions = {
        icon: {
            path: PLANE_SVG, // Use the plane SVG path
            scale: 25,
            strokeColor: "black",
            strokeWeight: 2,
            anchor: new google.maps.Point(0.5, 0.5),
            origin: new google.maps.Point(0, 0),
            rotation: props.drone.heading - 45, // Set the rotation of the marker to match the drone's heading
            fillColor: "white",
            fillOpacity: 1,
        },
    };

    // Renders a Google Map marker for the selected drone
    return (
        <>
            {/* Use the MarkerF component from the @react-google-maps/api library */}
            <MarkerF
                {...props.markerProps} // Pass any additional marker properties
                position={props.drone.coordinate} // Set the position of the marker to the drone's coordinates
                options={{ ...markerOptions }} // Override the default marker options with custom ones
            />
        </>
    );
}
