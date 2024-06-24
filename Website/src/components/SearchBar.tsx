"use client"
import React, {ChangeEvent, useContext, useState} from 'react';
import {Search} from 'semantic-ui-react';
import {GlobalContext} from "../providers/GlobalProvider";
import {IFlightData} from "../interfaces/Objects";

/**
 * A component that renders a search bar to filter drones.
 * @returns {JSX.Element} - A search bar component.
 */
function SearchBar() {
    // Accessing the drone context and allRegisteredDrones array using the useContext hook
    const {allRegisteredDrones, setSelectedDrone} = useContext(GlobalContext).droneContext;
    // Initializing search results and search term using useState hook
    const [searchResults, setSearchResults] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Mapping allRegisteredDrones array to source array containing droneID as title and an empty description
    const source = allRegisteredDrones.map((drone: IFlightData) => {
        return {
            title: drone.droneID,
            description: ""
        }
    });

    /**
     * Handles when a search result is clicked, and sets the selected drone to the clicked drone.
     * @param {React.MouseEvent<HTMLDivElement>} event - The click event.
     * @param {any} data - The data associated with the clicked result.
     */
    const handleResultClick = (event: React.MouseEvent<HTMLDivElement>, data: any) => {
        setSelectedDrone(allRegisteredDrones.filter(drone => drone.droneID === data.result.title)[0]);
    }

    /**
     * Handles the search event and sets the search results.
     * @param {React.ChangeEvent<HTMLInputElement>} event - The change event.
     */
    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
        setSearchResults(
            // Filtering the source array based on the search term entered by the user
            // @ts-ignore
            source.filter(drone => drone.title.toLowerCase().includes(event.target.value.toLowerCase()))
        );
    }

    /**
     * Handles the key down event and sets the selected drone if the Enter key is pressed and a drone exists with the search term.
     * @param {React.KeyboardEvent<HTMLInputElement>} event - The key down event.
     */
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            // Calling the handleSearch function to update the searchResults array with matching drones
            // @ts-ignore
            handleSearch(event as ChangeEvent<HTMLInputElement>)
            // Checking if a drone exists with the search term entered by the user
            let droneExists = allRegisteredDrones.filter(drone => drone.droneID === searchTerm).length === 1 ;
            // Setting the selected drone to the drone with the entered search term
            if(droneExists) {
                setSelectedDrone(allRegisteredDrones.filter(drone => drone.droneID === searchTerm)[0]);
            }
        }
    }

    return (
        <Search
            // Setting styles for the search bar
            style={{marginTop: "14px"}}
            // Setting search results to the searchResults array
            results={searchResults}
            // Calling handleResultClick function on search result selection
            onResultSelect={handleResultClick}
            // Calling handleSearch function on search term change
            // @ts-ignore
            onSearchChange={handleSearch}
            input={{icon: 'search', iconPosition: 'right', placeholder: 'Search drones...', onKeyDown: handleKeyDown}}
        />
    );
};

// Exporting SearchBar component as the default export
export default SearchBar;
