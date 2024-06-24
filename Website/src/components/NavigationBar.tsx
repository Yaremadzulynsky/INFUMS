"use client";
import React, { useContext } from "react";
import { GlobalContext } from "../providers/GlobalProvider";
import { useNavigate } from "react-router-dom";
// import firebase from "firebase/compat";
// import functions = firebase.functions;
import { IFlightData } from "../interfaces/Objects";
import { useRouter } from "next/navigation";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

/**
 * The NavigationBar component.
 *
 * @returns {JSX.Element} - Navigation buttons to navigate to home and settings pages.
 */
export function NavigationBar(props: {
  router: AppRouterInstance;
  floatLeft: boolean;
  whenClicked?: () => void;
}): JSX.Element {
  // Get the navigate function from the useNavigate hook.
  // const navigate = useNavigate();

  // let router = useRouter()

  // Define the button styles.
  const buttonStyles = {
    float: props.floatLeft ? "left" : "right",
    justifyContent: "center",
    paddingRight: "0px",
    backgroundColor: "transparent", // Add this line
    border: "none", // Add this line
  };

  // Return two buttons that navigate to the home and settings pages when clicked.
  return (
    <>
      <button
        onClick={() => {
          const searchParams = new URLSearchParams(window.location.search);
          props.router.push(`map?${searchParams.toString()}`);
          // if (props.whenClicked) {
          //   props.whenClicked();
          // }
        }}
        style={{
          float: props.floatLeft ? "left" : "right",
          justifyContent: "center",
          paddingRight: "0px",
          backgroundColor: "transparent",
          border: "none",
        }}
        className="ui icon button invisible"
      >
        <i
          style={{
            float: props.floatLeft ? "left" : "right",
            justifyContent: "center",
          }}
          className="ui big home icon"
        ></i>
      </button>
      {/* <button
        onClick={() => {
          if (props.whenClicked) {
            props.whenClicked();
          }
          // navigate('/settings');
          props.router.push("settings");
        }}
        //@ts-ignore
        style={{
          float: props.floatLeft ? "left" : "right",
          justifyContent: "center",
          paddingRight: "0px",
          backgroundColor: "transparent",
          border: "none",
        }}
        className="ui icon button invisible"
      > */}
      {/* <i
          style={{
            float: props.floatLeft ? "left" : "right",
            justifyContent: "center",
          }}
          className="ui big cog icon"
        ></i>
      </button> */}
    </>
  );
}
