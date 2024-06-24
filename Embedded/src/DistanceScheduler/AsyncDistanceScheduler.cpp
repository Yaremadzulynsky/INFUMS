//
// Created by Yarema Dzulynsky on 2023-04-17.
//

#include "AsyncDistanceScheduler.h"

AsyncDistanceScheduler::AsyncDistanceScheduler(float kmPerTrigger, std::function<void()> func) {
    this->kmPerTrigger = kmPerTrigger;
    this->func = func;
    prevTimeStamp = millis();
    prevSpeed = 0;
    distanceTraveled = 0;
}



void AsyncDistanceScheduler::run(float groundSpeed) {

    double timeInHours = (millis() - prevTimeStamp) / ((double)3600000);
    long averageSpeed = (prevSpeed + groundSpeed) / 2;
    distanceTraveled += averageSpeed * timeInHours;

    Serial.print("Distance traveled: ");
    Serial.println(distanceTraveled);

    if (distanceTraveled >= kmPerTrigger) {
        func();
        distanceTraveled = 0;
    }
    prevTimeStamp = millis();
}