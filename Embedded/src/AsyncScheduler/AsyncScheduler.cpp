/*********
 * @author Yarema Dzulynsky
 * @Date April 23rd, 2022
 * @description This file contains the implementation of the AsyncTimeScheduler class
 *********/

#include "AsyncTimeScheduler.h"

AsyncTimeScheduler::AsyncTimeScheduler(long interval, std::function<void()> func) {
    // Initialize variables
    this->interval = interval;
    this->func = func;
    prevTimeStamp = millis();
}

void AsyncTimeScheduler::run() {
    // Check if the interval has passed
    if (millis() - prevTimeStamp > interval) {

        // Run the function
        func();
        // Update the previous timestamp
        prevTimeStamp = millis();
    }
}