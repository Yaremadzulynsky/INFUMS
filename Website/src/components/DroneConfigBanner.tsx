"use client"
import React, {useEffect, useState} from "react";
import {DroneConfigProps} from "../interfaces/PropArguments";
import {Button, Input, Segment} from "semantic-ui-react";
import Database from "../database/Database";
import {sendMessageURL} from "../credentials/APICredentials";

export default function DroneConfigBanner(props: DroneConfigProps): JSX.Element {
    const [config, setConfig] = useState({
        frequency: props.frequency,
        online: false,
        ready: false,
        receivedConfig: false,
        lastHandshake: 0,
    });
    const [inFlight, setInFlight] = useState(false);

    useEffect(() => {
        Database.monitorConfigChanges(
            `Config/${props.droneID}`,
            (data) => {
                if (data) {
                    setConfig(data);
                }
            }
        );
        Database.monitorInFlightBooleanChanges(
            `Live/${props.droneID}/inFlight`,
            (data) => {
                if (data) {
                    setInFlight(data);
                }
            }
        );

        return () => {

        };
    }, [props.droneID]);

    function toggleReady() {

        if (!config.ready) {
            Database.setData(`Config/${props.droneID}/receivedConfig`, false);

            const sendString = `${config.online ? "1" : "0"},${config.frequency},`;
            const hexString = stringToHexString(sendString);

            const options = {method: 'POST', headers: {accept: 'text/plain'}};


            // fetch(sendMessageURL(hexString), options)
            //     .then(response => response.json())
            //     .then(response => console.log(response))
            //     .catch(err => console.error(err));
            setTimeout(() => {
                Database.setData(`Config/${props.droneID}/receivedConfig`, true);
            }, 5000);
        }

        Database.setData(`Config/${props.droneID}/ready`, !config.ready);
    }

    function toggleStreaming() {

        Database.setData(`Config/${props.droneID}/online`, !config.online);
    }

    function handleFrequencyChange(e: React.ChangeEvent<HTMLInputElement>) {
        const newFrequency = parseInt(e.target.value, 10);
    
        Database.setData(`Config/${props.droneID}/frequency`, newFrequency);
    }

    function stringToHexString(input: string): string {
        return input
            .split("")
            .map((char) => char.charCodeAt(0).toString(16))
            .join("");
    }

    const bannerStyle = {
        backgroundColor: "#f9f9f9",
        borderRadius: "5px",
        padding: "20px",
        boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.1)",
    };

    const contentStyle = {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "10px",
        width: "100%",
    };

    const buttonStyle = {
        display: "flex",
    };

    const inputStyle = {
        flex: 1,
    };

    const isTimeout = (Date.now() - new Date(config.lastHandshake).getTime()) < (1000 * 60 * 5);

    return (
        <Segment style={bannerStyle} raised>
            <div style={contentStyle}>
                <Button
                    onClick={toggleReady}
                    style={buttonStyle}
                    color={
                        config.ready
                            ? config.receivedConfig
                                ? (isTimeout ? "green" : (inFlight ? "blue" : "grey"))
                                : "yellow"
                            : "red"
                    }
                    disabled={config.ready && !config.receivedConfig}
                >
                    {config.ready
                        ? config.receivedConfig
                            ? isTimeout ? "Cleared" : (inFlight ? "In Flight" : "Timeout")
                            : "Sending..."
                        : "Send"}
                </Button>

                <Button
                    onClick={toggleStreaming}
                    style={buttonStyle}
                    color={config.online ? "green" : "red"}
                    disabled={config.ready}
                >
                    {config.online ? "Online" : "Offline"}
                </Button>

                <div style={inputStyle}>
                    <Input
                        label="Upload Interval in Seconds:"
                        type="number"
                        value={config.frequency}
                        onChange={handleFrequencyChange}
                        disabled={config.ready}
                        fluid
                    />
                </div>
            </div>
        </Segment>
    );
}
