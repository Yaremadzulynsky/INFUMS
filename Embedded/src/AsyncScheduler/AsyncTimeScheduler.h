/**
* @File: AsyncTimeScheduler.h
* @Author: Yarema Dzulynsky
* @Date: 2023-04-23
* @Description: This header file defines a class called AsyncTimeScheduler, which can be used to schedule a
 * function to be executed periodically at a specified interval (in milliseconds). The class provides
 * a method named run() that checks if the interval has passed and executes the scheduled function
 * if needed, also resetting the timer. This class is part of the AeroRadarEmbedded project and
 * is designed for use in embedded systems.
*/

#ifndef AERORADAREMBEDDED_ASYNCTIMESCHEDULER_H
#define AERORADAREMBEDDED_ASYNCTIMESCHEDULER_H

#include <functional>
#include <api/Common.h>

/**
 * Class that schedules a function to be executed every interval milliseconds.
 * The function is executed in the run() method.
 */
class AsyncTimeScheduler {

public:
    /**
     * Constructor
     */
    AsyncTimeScheduler() = default;

    /**
     * Constructor
     * @param interval - interval in milliseconds
     * @param func - function to be executed
     */
    AsyncTimeScheduler(long interval, std::function<void()> func);

    /**
     * Run the scheduler meaning check if the interval has passed and execute the function if it has as well as
     * reset the timer.
     */
    void run();

private:
    // Interval in milliseconds
    long interval{};

    // Function to be executed
    std::function<void()> func;

    // Previous timestamp
    unsigned long prevTimeStamp{};
};

#endif //AERORADAREMBEDDED_ASYNCTIMESCHEDULER_H