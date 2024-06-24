/**
 * This module exports an object called `telemetryMappings`, which contains mappings of telemetry attributes to their
 * corresponding icons. The `IconMap` interface defines an object type with a key of string and a value of `Option` type,
 * which specifies the `icon`, `droneAttributeName`, and `suffix` properties.
 *
 * The exported `telemetryMappings` object contains properties for each telemetry attribute, with the key being the name
 * of the attribute and the value being an object with the corresponding `icon`, `droneAttributeName`, and `suffix`.
 * These properties are defined using the `Option` interface.
 *
 * For example, the "Ground Speed" attribute has an icon of "tachometer alternate", a `droneAttributeName` of "speed",
 * and a `suffix` of "km/h". The `telemetryMappings` object is typed as an `IconMap`, so any properties added to it
 * must adhere to the `Option` interface.
 *
 * @module TelemetryMappings
 */


/**
 * The properties for a telemetry attribute icon mapping.
 * @typedef {Object} Option
 * @property {string} icon - The name of the Semantic UI icon to use for the telemetry attribute.
 * @property {string} droneAttributeName - The name of the corresponding attribute in the drone object.
 * @property {string} suffix - The string to append after the attribute value when displaying it in the UI.
 */
interface Option {
    icon: string;
    droneAttributeName: string;
    suffix: string;
}

/**
 * An object containing mappings of telemetry attributes to their corresponding icons.
 * @typedef {Object} IconMap
 * @property {Option} [key: string] - An object containing the icon, droneAttributeName, and suffix for the telemetry attribute.
 */
interface IconMap {
    [key: string]: Option;
}

/**
 * An object containing mappings of telemetry attributes to their corresponding icons.
 * @type {IconMap}
 */
export const telemetryMappings: IconMap = {
    "Flight Status": {
        icon: "info circle",
        droneAttributeName: "flightStatus",
        suffix: "",
    },
    "Ground Speed": {
        icon: "tachometer alternate",
        droneAttributeName: "speed",
        suffix: "km/h",
    },
    "V-Speed": {
        icon: "arrow circle up",
        droneAttributeName: "verticalSpeed",
        suffix: "m/s",
    },
    "Altitude": {
        icon: "arrow circle up",
        droneAttributeName: "altitude",
        suffix: "m",
    },
    "Heading": {
        icon: "compass",
        droneAttributeName: "heading",
        suffix: "°",
    },
    "Pitch": {
        icon: "sort",
        droneAttributeName: "pitch",
        suffix: "°",
    },
    "Roll": {
        icon: "redo alternate",
        droneAttributeName: "roll",
        suffix: "°",
    },
    "Yaw": {
        icon: "sync",
        droneAttributeName: "yaw",
        suffix: "°",
    },
    "Last Link": {
        icon: "wifi",
        droneAttributeName: "time",
        suffix: "",
    },
    "Flight Time": {
        icon: "clock",
        droneAttributeName: "flightTime",
        suffix: "",
    },

};
