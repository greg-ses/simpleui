//
// Created by jscarsdale on 5/11/20.
//

#include "ZmqWrapper.h"

string ZmqWrapper::parseRequest(zmq::message_t& request) {
    cout << logger::getLogTime() << " parseRequest: " << request.str() << "\n";

    std::string response = "<empty></empty>";

    std::string requestType = "data"; // TODO - get from the request
    std::string port = "20901"; // TODO - get from the request

    if (requestType == "data") {
        response = simState->getSimulatedResponse(port, "data");
    } else if (requestType == "cmd") {
        response = simState->getSimulatedResponse(port, "cmd");
    }

    return response;
}

[[noreturn]] void ZmqWrapper::listenForRequests(SimState* inSimState) {
    simState = inSimState;
    //config::data &theConfig, SimState& simState, const char* dataPortName

    //  Prepare our context and socketq
    zmq::context_t context(1);
    zmq::socket_t socket(context, ZMQ_REP);

    std::string dataPort = simState->getDataPort();
    if (dataPort == "-1") {
        ostringstream errMsg;
        errMsg << "ERROR - invalid data port (-1) in " << simState->getBackendConfigFileName() << "\n";
        throw runtime_error (errMsg.str().c_str());
    }

    string address = "tcp://*:";
    address += dataPort;
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
