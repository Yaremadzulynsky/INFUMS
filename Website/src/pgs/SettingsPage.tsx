"use client"
import React, {FormEvent, useContext} from 'react';
import {Checkbox} from 'semantic-ui-react';
import {Navigate} from "react-router-dom";
import {GlobalContext} from "../providers/GlobalProvider";
import {NavigationBar} from "../components/NavigationBar";
import {AuthorizationRequired} from "../components/AuthCheck";
import { useRouter } from 'next/navigation';

/**
 * The SettingsPage component.
 * @returns {JSX.Element} A component containing checkboxes for the user to customize display options.
 */
export default function SettingsPage() {

    const router = useRouter();

    // TURN OFF AUTHENTICATION FOR PUBLIC FACING
    // If the user is not authenticated, redirects to the login page.
    // const {user} = useContext(GlobalContext).authContext;
    // if (user === null || user === undefined) {
    //     return <Navigate to="/login"/>;
    // }

    const {displayOptions, setDisplayOptions} = useContext(GlobalContext).optionsContext;

    /**
     * Handles the change event of the checkboxes and updates the state with the new value of the changed option.
     * @param {React.FormEvent<HTMLInputElement>} event - The event object generated when the checkbox is changed.
     */
    function onCheckboxChange(event: React.FormEvent<HTMLInputElement>) {

        //@ts-ignore
        const optionName = event.target["id"];

        const newOptions = displayOptions.map((option) =>
            option.name === optionName ? {...option, value: !option.value} : option
        );
        setDisplayOptions(newOptions);
    }


    // Return the JSX for the SettingsPage
    return (
        <AuthorizationRequired>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'left'}}>


                <NavigationBar floatLeft={true} router={router}/>
                <h1 style={{fontSize: '2rem', margin: '2rem'}}>
                    Settings
                </h1>

                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', margin: '1rem'}}>
                    {/* Map through displayOptions to render checkboxes */}
                    {displayOptions.map((option) => (


                        // <div key={option.name} style={{display: 'flex', alignItems: 'left', margin: '1rem 0'}}>
                        <div key={option.name} style={{display: 'flex', margin: '1rem 0'}}>
                            <Checkbox
                                id={option.name}
                                label={option.name}
                                toggle
                                checked={option.value}
                                onChange={(event) => {
                                    onCheckboxChange(event);
                                }}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </AuthorizationRequired>
    );
}
