"use client"
import React from "react";
import {PolylineF} from "@react-google-maps/api";
import {PathProps} from "../interfaces/PropArguments";

/**
 * The Path component.
 *
 * @param {PathProps} props - The properties for the component.
 * @returns {JSX.Element} - A PolylineF component representing the path.
 */
export function Path(props: PathProps): JSX.Element {
    // Destructure the path array from the props.
    const {path} = props;

    // Create an empty array to hold the path coordinates.
    let pathArray: {lat: number, lng: number}[] = [];

    // Iterate over the path array and push each coordinate into the pathArray.
    for (let key in path) {
        if ((key as unknown as number) < path.length - 1) {
            pathArray.push({lat: path[key].lat, lng: path[key].lng});
        }
    }

    // Return a PolylineF component with the pathArray and stroke options.
    return (
        <PolylineF
            path={pathArray}
            options={{
                strokeColor: "blue",
                strokeWeight: 3,
                strokeOpacity: 0.5,
            }}
        />
    );
}
