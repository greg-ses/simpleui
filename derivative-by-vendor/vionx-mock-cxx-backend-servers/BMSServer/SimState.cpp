//
// Created by jscarsdale on 4/16/20.
//
#include <stdio.h>
#include <stdlib.h>
#include "time.h"
#include "SimState.h"

using namespace std;
namespace fs = boost::filesystem;

/*
 *
int initSim(SimState& simState, const char *xmlInputFileName)
{
    try
    {
        string sXmlInputFileName = xmlInputFileName;
        simState.initXmlTemplate(sXmlInputFileName, 3);
    }
    catch (exception &e)
    {
        cerr << "Error: " << e.what() << "\n";
    }
    return 0;
}

 */
SimState::SimState() {
    xmlReader = new XmlReader();
}

SimState::~SimState() {
    delete xmlReader;
}

bool SimState::init(const std::string &xmlSimFile) {
    xmlFileName = xmlSimFile;
    stateXmlTree = XmlReader::loadXmlTree(xmlFileName);
    auto initOK = false;
    try {
        if (stateXmlTree != nullptr) {
            backendConfigFileName = stateXmlTree->get<string>("state.backend-config-file");
            if (backendConfigFileName.empty()) {
                ostringstream errMsg;
                errMsg << "ERROR - missing property \"backend-config-file\" in " << getXmlFileName() << "\n";
                throw runtime_error(errMsg.str().c_str());
            } else {
                pt::ini_parser::read_ini(backendConfigFileName, backendConfig);
            }
        }
    } catch(boost::exception &e) {
        std::cerr << "Error: " << boost::diagnostic_information(e) << "\n";
    } catch(std::exception &e) {
        std::cerr << "Error: " << e.what() << "\n";
    }

    try {
        // auto sims = stateXmlTree->get_child("state.backend-message-sims");
        for (auto v: stateXmlTree->get_child("state.backend-message-sims")) {
            if (v.first != "backend-message-sim") {
                continue;
            }
            SimState::BackendMessageSim sim = {
                    // v.second.get<std::string>("backend-message-sim.port"),
                    v.second.get<std::string>("port"),
                    v.second.get<std::string>("type"),
                    v.second.get<std::string>("num-files"),
                    v.second.get<std::string>("file-template-update-algorithm"),
                    v.second.get<std::string>("file-template"),
                    1
            };
            backendMessageSims.emplace_back(sim);
        }
    } catch(std::exception &e) {
        std::cerr << "Error: " << e.what() << "\n";
    }

    for (auto sim : backendMessageSims) {
        setFileNameTemplate(sim.port, sim.fileTemplate, sim.numFiles);
    }

    return stateXmlTree != nullptr;
}

std::string SimState::getXmlFileName() const {
    return xmlFileName;
}

std::string SimState::getBackendConfigValue(const std::string& key) const {
    // auto retVal = backendConfig.get<string>(key);
    std::string retVal;
    for (auto v: backendConfig.get_child("")) {
        if (v.first == key) {
            retVal = v.second.data();
            break;
        }
    }
    return retVal;
}

pt::ptree* SimState::getXmlTree() {
    return XmlReader::getXmlTree(xmlFileName);
}

std::string SimState::getDataPort() const {
    std::string dataPort = "-1";
    const std::string dataPortName = stateXmlTree->get<string>("state.zmq-listener-port-property-name");
    if (dataPortName.empty()) {
        ostringstream errMsg;
        errMsg << "ERROR - missing property \"zmq-listener-port-property-name\" in " << getXmlFileName() << "\n";
        throw runtime_error(errMsg.str().c_str());
    } else {
        dataPort = getBackendConfigValue(dataPortName);
        if (dataPort.empty()) {
            ostringstream errMsg;
            errMsg << "ERROR - missing property \"" << dataPortName << "\" in " << getBackendConfigFileName() << "\n";
            throw runtime_error(errMsg.str().c_str());
        }
    }

    return dataPort;
}

/*
std::string SimState::getNthTemplateFileName(int nthTemplate, int nthFile) const {
    std::string fileName = "";
    std::pair<std::string, int> pair = fileNameTemplates.get<find(nthTemplate);
    if (itr != fileNameTemplates.end) {
        auto pair = itr.second;
        fileName = pair.first.replace("{{index}}", stoa(nthFile));
    }

    return fileName;
}
*/

void SimState::setFileNameTemplate(const std::string& port, const std::string& fileTemplate, const std::string& numFiles /* = "1" */) {
    try {
        char buf[10];
        std::string fileName;
        int nFiles = atoi(numFiles.c_str());
        for (int i = 0; i < nFiles; i++) {
            sprintf(buf, "%d", i);
            std::string s = buf;
            fileName = std::regex_replace(fileTemplate, std::regex("\\{\\{index}}"), s);
            if (! fs::is_regular_file(fileName)) {
                cerr << "In SimState::setFileNameTemplate(port: " << port << ", fileTemplate: " << fileTemplate << ", numFiles: " << numFiles << ", fileTemplate:" << fileTemplate << "," << numFiles << ")\n"
                    << "  file #" << i << ", " << fileName << " was NOT FOUND.\n";
                return;
            }
            XmlReader::loadXmlTree(fileName);
        }
    } catch(std::exception &e) {
        std::cerr << "Error: " << e.what() << "\n";
    }

}

/*
std::string SimState::getNextXmlFileName(int index) {
    auto sNumFiles = backendConfig.get<string>("template");
    if (key ==
    <num-files>1</num-files>
                  <template-update-algorithm>sequential</template-update-algorithm>
                                                                 <template>/var/www/bms/mock-data/gm-bms-dashboard-sample-a.{{index}}.xml</template>
}
*/

SimState::BackendMessageSim * SimState::findBackendMessageSim(const std::string& port) {
    SimState::BackendMessageSim *sim = nullptr;
    for (auto s : backendMessageSims) {
        if (s.port == port) {
            sim = &s;
        }
    }
    return sim;
}

std::string SimState::getSimulatedResponse(const std::string& port, const std::string& sType) {
    BackendMessageSim sim;
    std::string response;

    for (const auto& s : backendMessageSims) {
        if (s.port == port && s.type == sType) {
            sim = s;
            break;
        }
    }

    if (sim.port == "0") {
        cerr << "Undefined BackendMessageSim - no port in SimState.xml matched port " << port << "\n";
    } else {
        if (sim.type == "data" || sim.type == "cmd") {
            response = getXmlStr(sim);
        } else {
            cerr << "Invalid value \"" << sim.type << "\" for BackendMessageSim with port " << sim.port << "\n";
        }
    }

    return response;
}

std::string SimState::getSimIndex(BackendMessageSim& sim) {
    char buf[10];
    int maxIndex = stoi(sim.numFiles) - 1;
    int numFiles = stoi(sim.numFiles);

    if (sim.fileTemplateUpdateAlgorithm == "sequential") {
        sim.nextFileIndex++;
    }

    if (sim.fileTemplateUpdateAlgorithm == "random") {
        time_t t = time(NULL);
        sim.nextFileIndex = t % numFiles;
    }

    if (sim.nextFileIndex < 1 || sim.nextFileIndex > maxIndex) {
        sim.nextFileIndex = 1;
    }

    sprintf(buf, "%d", sim.nextFileIndex);
    string index = buf;

    return index;
}


std::string SimState::getXmlStr(BackendMessageSim& sim) {
    std::stringstream ss;
    try
    {
        std::string fileName = sim.fileTemplate;
        fileName = std::regex_replace(sim.fileTemplate, std::regex("\\{\\{index}}"), getSimIndex(sim));

        pt::ptree* xmlTree = XmlReader::loadXmlTree(fileName);

        std::ostringstream timeStamp;
        auto timeSinceEpoch = std::chrono::system_clock::now().time_since_epoch();
        timeStamp  << std::chrono::duration_cast<std::chrono::milliseconds>(timeSinceEpoch).count();

        xmlTree->put("Data_Summary.timeStamp", timeStamp.str());

        pt::write_xml(ss, *xmlTree);
    }
    catch (std::exception &e)
    {
        std::cerr << "Error: " << e.what() << "\n";
    }

    return ss.str();
}

std::string SimState::getBackendConfigFileName() const {
    return backendConfigFileName;
}