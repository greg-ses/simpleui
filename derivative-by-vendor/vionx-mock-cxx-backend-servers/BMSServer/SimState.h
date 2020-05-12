//
// Created by jscarsdale on 4/16/20.
//
#ifndef BMSSERVER_SIMSTATE_H
#define BMSSERVER_SIMSTATE_H

#include <vector>
#include "XmlReader.h"
#include "boost/filesystem/operations.hpp"
#include <boost/property_tree/ini_parser.hpp>

typedef std::pair< std::string, std::string > StringStringPair;

class SimState
{
public:
    struct BackendMessageSim {
        std::string port;
        std::string type;
        std::string numFiles;
        std::string fileTemplateUpdateAlgorithm;
        std::string fileTemplate;
        int nextFileIndex;
    };

public:
    SimState();
    ~SimState();
    bool init(const std::string& xmlSimFile);
    pt::ptree* getXmlTree();
    // std::string getNthTemplateFileName(int nthTemplate, int nthFile) const;
    BackendMessageSim * findBackendMessageSim(const std::string& port);
    std::string getXmlFileName() const;
    std::string getBackendConfigValue(const std::string& key) const;
    std::string getBackendConfigFileName() const;
    std::string getDataPort() const;
    std::string getSimulatedResponse(const std::string& , const std::string& sType);
    std::string getXmlStr(BackendMessageSim& backendMessageSim);
    std::string getSimIndex(BackendMessageSim& sim);

protected:
    void setFileNameTemplate(const std::string& port, const std::string& fileTemplate, const std::string& numFiles = "1");

private:
    XmlReader* xmlReader;
    pt::ptree* stateXmlTree;
    std::string xmlFileName;
    std::string backendConfigFileName;
    pt::ptree backendConfig;
    std::map<int, std::pair<std::string, int>> fileNameTemplates;
    std::vector<SimState::BackendMessageSim> backendMessageSims;
};

#endif //BMSSERVER_SIMSTATE_H
