import {Dispatch, ReactNode, SetStateAction} from "react";
import {FlightLogFromDB, IFlightData, IFlightLog} from "./Objects";
import {TableRowProps} from "semantic-ui-react";
/**

 @interface MapProps
 @description The properties for the Map component.
 @property {Object} latLng - Object with latitude and longitude of the map center.
 @property {number} latLng.lat - The latitude of the map center.
 @property {number} latLng.lng - The longitude of the map center.
 @property {number} zoom - The zoom level for the map.
 @property {string} mapContainerClassName - The class name for the map container.
 @property {ReactNode} [children] - The children of the Map component.
 */
export interface MapProps {
    latLng: {
        lat: number;
        lng: number;
    }
    zoom: number;
    mapContainerClassName: string;
    children?: ReactNode;
}
/**

 @interface TimeSliderProps
 @description The properties for the TimeSlider component.
 @property {number} min - The minimum value of the slider.
 @property {number} max - The maximum value of the slider.
 @property {number} step - The increment value of the slider.
 @property {string} width - The width of the slider.
 @property {Dispatch<SetStateAction<number>>} setTime - The function to update the time state.
 */
export interface TimeSliderProps {
    min: number;
    max: number;
    step: number;
    width: string;
    time: number;
    setTime: Dispatch<SetStateAction<number>>;
    mission: IFlightLog;
};
/**

 @interface MissionTableProps
 @description The properties for the MissionTable component.
 @property {TableRowProps[]} rows - The rows of the table.
 @property {(mission: FlightLogFromDB) => void} handleClick - The function to handle click events.
 */
export interface MissionTableProps {
    rows: TableRowProps[];
    handleClick: (mission: FlightLogFromDB) => void;
}
/**

 @interface TelemetryTableProps
 @description The properties for the TelemetryTable component.
 @property {boolean} showLastLink - Flag to indicate whether data is on the current page.
 @property {IFlightData} flightData - The flight data to display.
 @property {JSX.Element[]} [children] - The children of the TelemetryTable component.
 */
export interface TelemetryTableProps {
    showLastLink: boolean;
    flightData: IFlightData;
    children?: JSX.Element[];
}
/**

 @interface Children
 @description The children of a component.
 @property {ReactNode} [children] - The children of the component.
 */
export interface Children {
    children?: ReactNode;
}
/**

 @interface PathProps
 @description The properties for the Path component.
 @property {{lat: number, lng: number}[]} path - The array of coordinates for the path.
 @property {number} path.lat - The latitude of the coordinate.
 @property {number} path.lng - The longitude of the coordinate.
 */
export interface PathProps {
    path: {lat: number, lng: number}[];
}

export interface DroneConfigProps {
    readyForFlight: boolean;
    droneID: string;
    frequency: number;
}