"use client";
import { AuthorizationRequired } from "../components/AuthCheck";
import { droneVisualJSX } from "../components/Drone";
import React, { useContext, useEffect } from "react";
import SearchBar from "../components/SearchBar";
import { TelemetryTable } from "../components/Table";
import { Map } from "../components/Map";
import { GlobalContext, useGlobalContext } from "../providers/GlobalProvider";
import { IFlightData } from "../interfaces/Objects";
import { NavigationBar } from "../components/NavigationBar";
import { useRouter } from "next/navigation";
import "semantic-ui-css/semantic.min.css";

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

/**
 * @function HomePageBoilerplate
 * @description Functional component that displays the Home Page Boilerplate
 * @param {object} props - React props
 * @property {ReactNode} [props.children] - Child element(s) to render within component
 * @returns {JSX.Element} - Rendered Home Page Boilerplate component
 */
function HomePageBoilerplate(props: { children?: JSX.Element }): JSX.Element {
  return (
    <div style={{ paddingLeft: "2.25%" }}>
      <div
        style={{ height: "800px", padding: "0%" }}
        className="ui column four wide"
      >
        <div className="ui grid">
          {/*<LogoutButton />*/}
          <div style={{ height: "600px" }} className="row">
            {props.children}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * @function LeftColumnWrapper
 * @description Functional component that displays the left column wrapper
 * @param {object} props - React props
 * @property {ReactNode} [props.children] - Child element(s) to render within component
 * @returns {JSX.Element} - Rendered Left Column Wrapper component
 */
function LeftColumnWrapper(props: { children?: JSX.Element }): JSX.Element {
  return (
    <div style={{ height: "800px" }} className="ui column four wide">
      {/* This section displays information about the selected drone and contains the menu buttons */}
      <div className={"flight-info"}>{props.children}</div>
    </div>
  );
}

/**
 * @function RightColumnWrapper
 * @description Functional component that displays the right column wrapper
 * @param {object} props - React props
 * @property {ReactNode} [props.children] - Child element(s) to render within component
 * @returns {JSX.Element} - Rendered Right Column Wrapper component
 */
function RightColumnWrapper(props: { children?: JSX.Element }): JSX.Element {
  return (
    <div id="map" className="ui column twelve wide">
      {props.children}
    </div>
  );
}

/**
 * The HomePage component displays the home page of the application, which contains a map
 * showing all registered drones, telemetry data, and a search bar to search for a specific drone.
 * @returns {JSX.Element} The rendered home page.
 */
export default function HomePage(): JSX.Element {
  // const router = useRouter();

  const router = useRouter();
  const searchParams = new URLSearchParams(window.location.search);

  const {
    selectedDrone,
    setSelectedDrone,
    allRegisteredDrones,
    droneIsolated,
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
      setSelectedDrone(allRegisteredDrones.find((drone) => drone.droneID === "Nimbus") as IFlightData);;
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

  const dronesToRender: IFlightData[] = [...allRegisteredDrones];

  return (
    <AuthorizationRequired>
      <HomePageBoilerplate>
        <>
          <LeftColumnWrapper>
            <>
              <h2>
                {/* <Link to="/data">{selectedDrone.droneID}</Link> */}
                <text
                  onClick={() => {
                    console.log(selectedDrone);
                    //find current search params
                    

                    router.push(`/drone?droneID=${selectedDrone.droneID}`);
                  }}
                  onMouseOver={() => {
                    //make the mouse pointer a hand when hovering over the text
                    document.body.style.cursor = "pointer";
                    //add some kind of emphasis on the text when hover
                  }}
                  // <Link></Link>
                  onMouseLeave={() => {
                    //change the mouse pointer back to the default when not hovering over the text
                    document.body.style.cursor = "default";
                  }}
                  style={{ color: "#0563C1" }}
                >
                  {selectedDrone.droneID}
                </text>
                <NavigationBar floatLeft={false} router={router} />
              </h2>
              {/*<LogoutButton />*/}
              {/*<Menu/>*/}

              <h3 style={{ marginBottom: "14px" }}>Telemetry Data</h3>

              {/* This section displays the telemetry data in a table format */}
              <TelemetryTable showLastLink={true} flightData={selectedDrone} />

              {/* This section allows users to search for a specific drone */}
              <SearchBar />
              <p style={{padding: 0, margin: 0, marginTop: 12, fontSize: 12, textAlign: "center", color: "gray" }}>
                  For more details on the telemetry data & flight logs, click on the drone name at the top left of the screen!
                </p>
            </>
          </LeftColumnWrapper>
          <RightColumnWrapper>
            {/* This section displays the map with all registered drones */}
            <Map
              mapContainerClassName={"map"}
              zoom={7}
              latLng={{ lat: 0, lng: 0 }}
            >
              {droneVisualJSX(
                dronesToRender,
                setSelectedDrone,
                droneIsolated,
                selectedDrone
              )}
            </Map>
          </RightColumnWrapper>
        </>
      </HomePageBoilerplate>
    </AuthorizationRequired>
  );
}
