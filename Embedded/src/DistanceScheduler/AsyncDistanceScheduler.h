//
// Created by Yarema Dzulynsky on 2023-04-17.
//

#ifndef AERORADAREMBEDDED_ASYNCDISTANCESCHEDULER_H
#define AERORADAREMBEDDED_ASYNCDISTANCESCHEDULER_H


#include <functional>
#include "MavlinkInterpreter/MavlinkInterpreter.h"

class AsyncDistanceScheduler {

public:
    AsyncDistanceScheduler() = default;
    AsyncDistanceScheduler(float kmPerTrigger, std::function<void()> func);

    void run(float groundSpeed);

    std::function<void()> func;
    unsigned long prevTimeStamp;
    unsigned long kmPerTrigger;
    float prevSpeed;
    float distanceTraveled;

};


#endif //AERORADAREMBEDDED_ASYNCDISTANCESCHEDULER_H
