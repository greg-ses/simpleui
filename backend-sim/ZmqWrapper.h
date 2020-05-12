//
// Created by jscarsdale on 5/11/20.
//

#ifndef BACKEND_SIM_ZMQWRAPPER_H
#define BACKEND_SIM_ZMQWRAPPER_H

#include <zmq.hpp>
#include <string>
#include <boost/program_options.hpp>
#include <ctime>
#include <chrono>
#include <iostream>
#include <sstream>
#include "logger.h"
#include "XmlReader.h"
#include "SimState.h"

#ifdef _WIN32
#include <windows.h>
#define sleep(n)    Sleep(n)
#else
#include <unistd.h>
#endif

using namespace std;

class ZmqWrapper {
public:
    ZmqWrapper() = default;
    void setSimState(SimState* inSimState) {simState = inSimState;}
    [[noreturn]] void listenForRequests(SimState* inSimState);

protected:
    string parseRequest(zmq::message_t& request);

private:
    SimState* simState;
};

#endif //BACKEND_SIM_ZMQWRAPPER_H
