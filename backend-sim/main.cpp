/*
 * simserver - a C++ server used for testing the SimpleUI JavaScript library.
 *
 * Starting program:
 *   simserver -f xmlStateFile
 *
 * Operation:
 *   1. xmlStateFile is read and parsed into xmlSimState.
 *      It is assumed that, at minimum, it contains the elements shown
 *      in the example file "SimState.xml"
 *
 *   2. SimpleUI assumes that there will be a "server configuration",
 *      which is specified by a "config file" containing "key = value" pairs.
 *      This "server configuration" is read by both this server as well as
 *      the JavaScript side of SimpleUI.
 *      A sanitized version from a company that utilizes SimpleUI is shown
 *      in the file SimBackendServer.properties.
 *
 *   3. Key/Value pairs such as the following specify the shared resources
 *      that the JavaScript and C++ sides of SimpleUI use to communicate:
 *          DatabaseMgr.MYSQL_HOST
 *          DatabaseMgr.MYSQL_DB
 *          xxxSERVER_PORT
 *          xxxSERVER_DATA_SERVICE_ENABLED
 *
 *   4, This simulator server reads the "server configuration" specified by the
 *      "<config-file>" element contained in xmlSimState.
 *
 *   5. For each backendMessageSim of "<backend-message-sim>", this server will
 *      listen for requests on the port specified by backendMessageSim.port
 *      Each responses will be created by reading a filename constructed from the
 *      backendMessageSim element, with some tweaks to the static contents of
 *      the .xml file.
 */

#include <zmq.hpp>
// #include <boost>
#include <string>
#include <boost/program_options.hpp>
#include <iostream>
#include <sstream>
#include "logger.h"
#include "XmlReader.h"
#include "SimState.h"
#include "ZmqWrapper.h"

#ifdef _WIN32
#include <windows.h>
#define sleep(n)    Sleep(n)
#else
#include <unistd.h>
#endif

using namespace std;

int main (int argc, char **argv) {

    if ( ! ((argc == 3) && (0 == strcmp(argv[1], "-f")))) {
        cerr
            << "Usage:\n"
            << "    server -f SIM_STATE_XML_FILE\n";
        return -1;
    }

    std::string xmlSimStateFile = argv[2];
    SimState simState;
    if (!simState.init(xmlSimStateFile)) {
        std::cerr << "Failed to initialize xmlSimState.\n";
        return 1;
    }

    ZmqWrapper zmqWrapper;
    zmqWrapper.listenForRequests(&simState);

    return 0;
}

