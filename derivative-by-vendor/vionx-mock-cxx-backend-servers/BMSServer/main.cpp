//
//  Hello World server in C++
//  Binds REP socket to tcp://*:5555
//  Expects "Hello" from client, replies with "World"
//
#include <zmq.hpp>
// #include <boost>
#include <string>
#include <boost/program_options.hpp>
#include <ctime>
#include <chrono>
#include <iostream>
#include <sstream>
#include "config.h"
#include "logger.h"
#include "SimState.h"

#ifdef _WIN32
#include <windows.h>
#define sleep(n)    Sleep(n)
#else
#include <unistd.h>
#endif

using namespace std;

string parseRequest(zmq::message_t& request, SimState& simState) {
    cout << logger::getLogTime() << "Received request: " << request.str() << "\n";
    return simState.getXmlStr();
}

[[noreturn]] void processZmqMessages(config::data &theConfig, SimState& simState) {
    //  Prepare our context and socketq
    zmq::context_t context(1);
    zmq::socket_t socket(context, ZMQ_REP);
    string address = "tcp://*:";
    const string dataPortName = "BMSDataService.data.port";

    if (!theConfig.hasKey((dataPortName))) {
        ostringstream errMsg;
        errMsg << "ERROR - missing property " << dataPortName << " in " << theConfig["InFile"] << endl;
        throw runtime_error (errMsg.str().c_str());
    }

    int dataPort = stoi(theConfig[dataPortName]);
    address += to_string(dataPort);
    //socket.bind("tcp://*:5555");
    socket.bind(address.c_str());

    while (true) {
        zmq::message_t request;

        //  Wait for next request from client
        socket.recv(request);
        string replyString = parseRequest(request, simState);

        //  Send reply back to client
        zmq::message_t reply(replyString.length());

        memcpy(reply.data(), replyString.c_str(), replyString.length());
        socket.send(reply, zmq::send_flags::none);

        //  Sleep .1 sec before waiting for next request
        // usleep(100000);
    }
}

int initSim(SimState& simState)
{
    try
    {
        string xmlInputFileNameTemplate = "/var/www/bms/mock-data/gm-bms-dashboard-sample-a.{{index}}.xml";
        simState.initXmlTemplate(xmlInputFileNameTemplate, 3);
    }
    catch (exception &e)
    {
        cerr << "Error: " << e.what() << "\n";
    }
    return 0;
}


int main () {

    SimState simState;
    initSim(simState);
    //  cout << "XML Read:\n" << simState.getXmlStr() << "\n";

    const string configFile = "/opt/config/BMSServer.properties";

    config::data theConfig;
    config::readConfigFile(configFile.c_str(), theConfig);
    processZmqMessages(theConfig, simState);

    return 0;
}

