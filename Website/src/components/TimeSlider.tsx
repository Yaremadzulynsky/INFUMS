"use client"
/**
 A component that renders a time slider input
 @param {TimeSliderProps} props - The props object containing the slider's properties
 @param {number} props.min - The minimum value of the slider
 @param {number} props.max - The maximum value of the slider
 @param {number} props.step - The step value of the slider
 @param {string} props.width - The width of the slider
 @param {Function} props.setTime - A callback function to set the current time when the slider is changed
 @returns {JSX.Element} - A JSX element that renders a time slider input
 */
import React, {useEffect, useState} from 'react';
import {TimeSliderProps} from "../interfaces/PropArguments";

const Slider: React.FC<TimeSliderProps> = (props: TimeSliderProps) => {

    /**
     * A callback function to handle changes to the slider's value
     *
     * @param {React.ChangeEvent<HTMLInputElement>} event - The event object representing a change in the slider's value
     * @returns {void}
     */
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const newValue = Number(event.target.value);
        props.setTime(newValue);
    };


    /**
     * A function to format the time value of the slider in minutes and seconds
     *
     * @param {number} time - The time value in seconds
     * @returns {string} - A formatted string in the format of "mm:ss"
     */
    const formatTime = (time: number): JSX.Element => {

      let _time = props.mission.flightLog[time].flightTime

        const hours = Math.floor(_time / 3600);
        _time %= 3600;
        const minutes = Math.floor(_time / 60);
        _time %= 60;
        const seconds = _time % 60;
        return <div>{`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}</div>;
    };

    const thumbHeight = '20px';
    const thumbWidth = '20px';
    const trackHeight = '10px';
    return (
        <div style={{width: props.width}}>
            <style>{`
    .ui.slider .thumb {
      height: ${thumbHeight};
      width: ${thumbWidth};
    }

    .ui.slider .track {
      height: ${trackHeight};
    }
  `}</style>
            <input type="range" min={props.min} max={props.max - 1} step={props.step} value={props.time} onChange={handleChange}
                   style={{width: props.width}}/>

            {/* {formatTime(props.time)} */}

        </div>
    );
};

export default Slider;