//
//  Hello World server in C++
//  Binds REP socket to tcp://*:5555
//  Expects "Hello" from client, replies with "World"
//
#include <zmq.hpp>
// #include <boost>
#include <string>
#include <boost/program_options.hpp>
#include <iostream>
#include <sstream>
#include "config.h"

#ifdef _WIN32
#include <windows.h>
#define sleep(n)    Sleep(n)
#else
#include <unistd.h>
#endif

std::string parseRequest(zmq::message_t& request) {
    std::cout << "Received request: " << request.str() << std::endl;

    return request.str();
}

[[noreturn]] void processZmqMessages(config::data &theConfig) {
    //  Prepare our context and socket
    zmq::context_t context(1);
    zmq::socket_t socket(context, ZMQ_REP);
    std::string address = "tcp://*:";
    const std::string dataPortName = "BMSDataService.data.port";

    if (!theConfig.hasKey((dataPortName))) {
        std::ostringstream errMsg;
        errMsg << "ERROR - missing property " << dataPortName << " in " << theConfig["InFile"] << std::endl;
        throw std::runtime_error (errMsg.str().c_str());
    }

    int dataPort = std::stoi(theConfig[dataPortName]);
    address += std::to_string(dataPort);
    //socket.bind("tcp://*:5555");
    socket.bind(address.c_str());

    while (true) {
        zmq::message_t request;

        //  Wait for next request from client
        socket.recv(request);
        std::string replyString = parseRequest(request);

        //  Send reply back to client
        zmq::message_t reply(replyString.length());

        memcpy(reply.data(), replyString.c_str(), replyString.length());
        socket.send(reply, zmq::send_flags::none);

        //  Sleep .1 sec before waiting for next request
        // usleep(100000);
    }
}

int main () {

    const std::string configFile = "/opt/config/BMSServer.properties";
    config::data theConfig;
    config::readConfigFile(configFile.c_str(), theConfig);
    processZmqMessages(theConfig);

    return 0;
}

