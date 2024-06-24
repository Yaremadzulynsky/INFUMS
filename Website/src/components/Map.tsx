"use client"
import React, {useContext, useMemo} from "react";
import {GoogleMap, useLoadScript} from '@react-google-maps/api';
import {googleMapsApiKey} from "../credentials/APICredentials";
import {GlobalContext} from "../providers/GlobalProvider";
import {MapProps} from "../interfaces/PropArguments";
import {config} from "dotenv";
// import { CloudCredentials } from "@/credentials/CloudCredentials";




/**
 * The Map component.
 *
 * @param {MapProps} props - Properties for the component.
 * @returns {JSX.Element} - A GoogleMap component with the allRegisteredDrones drawn on it.
 */
export function Map(props: MapProps): JSX.Element {
    config()
    // Get the selected drone from the GlobalContext's droneContext.
    const {selectedDrone} = useContext(GlobalContext).droneContext;
    // Use the selected drone's coordinate as the center of the map.
    const latLng = useMemo(() => selectedDrone.coordinate, [selectedDrone]);

    // console.log("Google Maps API Key: ", {googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY as string});
    // Use the useLoadScript hook to load the Google Maps API.
    // CloudCredentials.load()
    // console.log(CloudCredentials.googleMapsApiKey)

    // const {isLoaded} = useLoadScript(CloudCredentials.googleMapsApiKey);
    const {isLoaded} = useLoadScript(googleMapsApiKey);


    // If the Google Maps API is not loaded, display a loading message.
    if (!isLoaded) {
        return <div>Loading...</div>;
    }

    /**
     * Returns a GoogleMap component with the center and zoom specified in the props,
     * and the allRegisteredDrones drawn on the map.
     *
     * @returns {JSX.Element} - A GoogleMap component.
     */
    return (
        <>
            <GoogleMap
                options={{
                    //ADD STYLING OPTIONS
                    // styles: styles[0],
                }}
                mapContainerClassName={props.mapContainerClassName}
                center={latLng}
                zoom={props.zoom}
            >
                {props.children}
            </GoogleMap>
        </>
    );
}
