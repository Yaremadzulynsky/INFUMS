"use client";

/**
 This module exports the GlobalProvider functional component, which serves as the provider for the application's global context.
 It also exports several interface and type definitions used throughout the application.
 The GlobalProvider component initializes several Firebase objects and state hooks, and subscribes to Firebase auth state changes and database changes using the useEffect hook.
 It then creates the global context object and returns a GlobalContext.Provider JSX element that wraps around the child components.
 */

import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
  useContext,
} from "react";
import type { Auth } from "firebase/auth";
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { firebaseConfigOptions } from "../credentials/APICredentials";
import firebase from "firebase/compat/app";
// import {useNavigate} from "react-router-dom";
import { IFlightData } from "../interfaces/Objects";
import { telemetryMappings } from "../assets/TelemetryMappings";
import Database from "../database/Database";
import { config } from "dotenv";

/**

 The properties for the GlobalProvider component.
 @interface
 @property {React.ReactNode} [children] - The child components of the GlobalProvider.
 */
interface GlobalProviderProps {
  children?: React.ReactNode;
}
/**

 The properties for the authentication context object.
 @interface
 @property {User | null} user - The current user object, or null if no user is signed in.
 @property {React.Dispatch<React.SetStateAction<User | null>>} setUser - A state hook for updating the current user object.
 @property {Auth} auth - The Firebase authentication object.
 @property {firebase.auth.AuthProvider} provider - The Google authentication provider object.
 */
export interface AuthContextProps {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  auth: Auth;
  provider: firebase.auth.AuthProvider;
}
/**

 The properties for the drone context object.
 @interface
 @property {IFlightData} selectedDrone - The currently selected drone.
 @property {Dispatch<React.SetStateAction<IFlightData>>} setSelectedDrone - A state hook for updating the selected drone.
 @property {IFlightData[]} allRegisteredDrones - An array of all registered drones.
 @property {Dispatch<React.SetStateAction<IFlightData[]>>} setAllRegisteredDrones - A state hook for updating the array of all registered drones.
 @property {boolean} droneIsolated - A boolean value indicating whether the selected drone is isolated.
 @property {Dispatch<React.SetStateAction<boolean>>} setDroneIsolated - A state hook for updating the droneIsolated value.
 */
export interface DroneContextProps {
  selectedDrone: IFlightData;
  setSelectedDrone: Dispatch<React.SetStateAction<IFlightData>>;
  allRegisteredDrones: IFlightData[];
  setAllRegisteredDrones: Dispatch<React.SetStateAction<IFlightData[]>>;
  droneIsolated: boolean;
  setDroneIsolated: Dispatch<React.SetStateAction<boolean>>;
}
/**

 The properties for the options context object.
 @typedef {Object} OptionsContextProps
 @property {Array<{ name: string, value: boolean }>} displayOptions - An array of telemetry data options to display in the table.
 @property {Dispatch<SetStateAction<Array<{ name: string, value: boolean }>>>} setDisplayOptions - A state hook for updating the displayOptions array.
 */
interface OptionsContextProps {
  displayOptions: { name: string; value: boolean }[];
  setDisplayOptions: Dispatch<
    SetStateAction<{ name: string; value: boolean }[]>
  >;
}
/**

 The properties for the global context object.
 @interface
 @property {firebase.app.App} app - The Firebase app object.
 @property {AuthContextProps} authContext - The authentication context object.
 @property {DroneContextProps} droneContext - The dr6one context object.
 @property {OptionsContextProps} optionsContext - The options context object.
 */
export interface GlobalContextProps {
  app: firebase.app.App;
  authContext: AuthContextProps;
  droneContext: DroneContextProps;
  optionsContext: OptionsContextProps;
}

/**

 The global context provider.
 @typedef {React.FC<GlobalProviderProps>} GlobalProvider
 @param {GlobalProviderProps} children - The child components to render.
 @returns {JSX.Element} The global context provider JSX element that wraps around the child components.
 */
export const GlobalContext = React.createContext<GlobalContextProps>(
  {} as GlobalContextProps
);

/**
 * A functional component that serves as the provider for the application's global context.
 *
 * @param {GlobalProviderProps} props - The props object containing the children components.
 * @returns {JSX.Element} The JSX element that wraps the children components in a GlobalContext.Provider.
 */
export const GlobalProvider: React.FC<GlobalProviderProps> = ({ children }) => {
  config();

  // console.log(process.env)
  // useEffect(() => {

  // firebaseConfigOptions.apiKey = process.env.FIREBASE_API_KEY || "";
  // firebaseConfigOptions.authDomain = process.env.FIREBASE_AUTH_DOMAIN || "";
  // firebaseConfigOptions.databaseURL = process.env.FIREBASE_DATABASE_URL || "";
  // firebaseConfigOptions.projectId = process.env.FIREBASE_PROJECT_ID || "";
  // firebaseConfigOptions.storageBucket = process.env.FIREBASE_STORAGE_BUCKET || "";
  // firebaseConfigOptions.messagingSenderId = process.env.FIREBASE_MESSAGING_SENDER_ID || "";
  // firebaseConfigOptions.appId = process.env.FIREBASE_APP_ID || "";

  // console.log(firebaseConfigOptions);

  // });

  //init firebase objects
  try {
    const app = firebase.initializeApp(firebaseConfigOptions);
    // Your Firebase initialization code

    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();

    //init all useState hooks
    const [user, setUser] = useState<User | null>(null);
    const [selectedDrone, setSelectedDrone] = useState<IFlightData>({
      droneID: "Placeholder",
      speed: 0,
      altitude: 0,
      pitch: 0,
      roll: 0,
      yaw: 0,
      flightStatus: "Placeholder",
      coordinate: {
        lat: 0,
        lng: 0,
      },
      heading: 0,
      time: new Date(),
    } as IFlightData);
    const [allRegisteredDrones, setAllRegisteredDrones] = useState<
      IFlightData[]
    >([]);
    const [droneIsolated, setDroneIsolated] = useState<boolean>(false);
    const [displayOptions, setDisplayOptions] = useState<
      { name: string; value: boolean }[]
    >([]);

    //init useNavigate hooks
    // const navigate = useNavigate();

    //init all useEffect hooks
    // useEffect(() => {
    //     if (user) {
    //         navigate("/");
    //     }
    // }, [user]);

    useEffect(() => {
      // Subscribe to Firebase auth state changes
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
      });

      // Unsubscribe from Firebase auth state changes when component is unmounted
      return () => {
        unsubscribe();
      };
    }, [auth]);

    useEffect(() => {
      let newDisplayOptions: { name: string; value: boolean }[] = [];

      // Maps each telemetry data key from TelemetryMappings to an object with its name and an initial value of true
      Object.keys(telemetryMappings).forEach((key: string) => {
        newDisplayOptions.push({ name: key, value: true });
      });

      setDisplayOptions(newDisplayOptions);
    }, []);
    useEffect(() => {
      Database.monitorChanges("/Live", (drones: IFlightData[]) => {
        // Deconstruct the drones array into a new array of IFlightData objects
        let newDrones: IFlightData[] = [];
        drones.forEach((newDrone: IFlightData) => {
          newDrones.push({
            droneID: newDrone.droneID,
            coordinate: newDrone.coordinate,
            heading: newDrone.heading,
            speed: newDrone.speed,
            altitude: newDrone.altitude,
            time: newDrone.time,

            pitch: newDrone.pitch,
            roll: newDrone.roll,
            yaw: newDrone.yaw,
            flightStatus: newDrone.flightStatus,
            flightTime: newDrone.flightTime,
            verticalSpeed: newDrone.verticalSpeed,
          });
        });

        setAllRegisteredDrones(newDrones);
      });
    }, []);

    // Use the useEffect hook to set the selected drone to the first registered drone after the all
    useEffect(() => {
      if (allRegisteredDrones.length > 0) {
        if (selectedDrone.droneID === "Placeholder") {
          setSelectedDrone(allRegisteredDrones[0]);
        } else {
          allRegisteredDrones.forEach((newDrone: IFlightData) => {
            if (newDrone.droneID === selectedDrone.droneID) {
              setSelectedDrone(newDrone);
            }
          });
        }
      }
    }, [allRegisteredDrones]);

    // Create the global context object
    const props: GlobalContextProps = {
      app: app,
      authContext: {
        user: user,
        setUser: setUser,
        auth: auth,
        provider: provider,
      },
      droneContext: {
        selectedDrone: selectedDrone,
        setSelectedDrone: setSelectedDrone,
        allRegisteredDrones: allRegisteredDrones,
        setAllRegisteredDrones: setAllRegisteredDrones,
        droneIsolated: droneIsolated,
        setDroneIsolated: setDroneIsolated,
      },
      optionsContext: {
        displayOptions: displayOptions,
        setDisplayOptions: setDisplayOptions,
      },
    };

    // Returns the DroneContext.Provider JSX element that wraps around the child components
    return (
      <GlobalContext.Provider value={props}>{children}</GlobalContext.Provider>
    );
  } catch (error) {
    console.error("Firebase initialization error:", error);
    // Optionally set a flag to ignore Firebase functionality
  }
};

// src/providers/GlobalProvider.tsx
// import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define the shape of the context
// interface GlobalContextProps {
//   count: number;
//   setCount: React.Dispatch<React.SetStateAction<number>>;
// }

// Create the context with default values
// const GlobalContext = createContext<GlobalContextProps | undefined>(undefined);

// Define the provider component
// interface GlobalProviderProps {
//   children: ReactNode;
// }

// export const GlobalProvider: React.FC<GlobalProviderProps> = ({ children }) => {
//   const [count, setCount] = useState(0);

//   return (
//     <GlobalContext.Provider value={{ count, setCount }}>
//       {children}
//     </GlobalContext.Provider>
//   );
// };

// Custom hook to use the GlobalContext
export const useGlobalContext = () => {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error("useGlobalContext must be used within a GlobalProvider");
  }
  return context;
};
