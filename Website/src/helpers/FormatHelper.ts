/**

 Converts a given number of seconds into a formatted string representing the hours, minutes and seconds.

 @param {number} seconds - The number of seconds to convert.

 @returns {string} - A formatted string representing the hours, minutes and seconds of the given number of seconds.
 */
export function secondsToHms(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor((seconds % 60));

    let formattedHours = `${hours}`
    let formattedMinutes = `${minutes}`;
    let formattedSeconds = `${remainingSeconds}`;
    if(hours < 10) {
        formattedHours = `0${hours}`;
    }
    ;
    if(minutes < 10) {
        formattedMinutes = `0${minutes}`;
    }

    if(remainingSeconds < 10) {
        formattedSeconds = `0${remainingSeconds}`;
    }

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;

}