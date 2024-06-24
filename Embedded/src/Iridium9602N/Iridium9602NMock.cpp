//
// Created by Yarema Dzulynsky on 2023-04-10.
//

#include "Iridium9602NMock.h"
#include "DiagnosticTools/GlobalDiagnosticLED.h"

void Iridium9602NMock::insertIntoSatQueue(mavlink_message_t msg) {



}

bool Iridium9602NMock::verifyAndPushOutSatQueue() {

    rgbLED.setState(RGBLED::SENDING_TELEMETRY);

    rgbLED.asyncLEDDelay(1*5*1000);
    return true;
}

int Iridium9602NMock::pushViaSatellite(uint8_t *buffer, uint16_t bufferLength) {


    return 0;
}

void Iridium9602NMock::setup() {





}



bool firstConfigCall = true;
bool Iridium9602NMock::receiveConfigurationMode(ConfigResponsePacket &response, bool &uploadData, long &uploadIntervalMillis) {


    //get a random number form 1 to 10
    int randomNum = random(1, 10);
    if(randomNum == 1 || firstConfigCall) {
        //if the random number is 1, return false

        rgbLED.setState(RGBLED::SEND_RECEIVE_CONFIG);
        rgbLED.asyncLEDDelay(5*1*1000);

        firstConfigCall = false;
        return true;
    }
    //if there is no message waiting, return false
    return false;

}

bool Iridium9602NMock::sendBootUpMessage() {

    rgbLED.setState(RGBLED::SENDING_BOOTUP_MESSAGE);
    rgbLED.asyncLEDDelay(1*5*1000);
    return true;
}



