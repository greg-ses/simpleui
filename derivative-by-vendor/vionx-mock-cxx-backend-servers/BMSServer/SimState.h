//
// Created by jscarsdale on 4/16/20.
//
#pragma once

#include <boost/property_tree/ptree.hpp>
#include <boost/property_tree/xml_parser.hpp>
#include <boost/foreach.hpp>
#include <string>
#include <set>
#include <exception>
#include <iostream>

namespace pt = boost::property_tree;

class SimState
{
public:
    SimState();
    void initXmlTemplate(std::string fileTemplate, int numFiles);
    std::string getXmlStr() const;

protected:
    void loadXml(const std::string &filename);

private:
    int _numUpdates;
    std::string _fileTemplate; // filename containing "{{index}}"
    int _fileIndex;
    int _numFiles;
    pt::ptree _xmlTree;
};