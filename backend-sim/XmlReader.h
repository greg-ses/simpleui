//
// Created by jscarsdale on 5/9/20.
//

#ifndef BACKEND_SIM_XMLREADER_H
#define BACKEND_SIM_XMLREADER_H

#include <string>
#include <sstream>
#include <iostream>
#include <ctime>
#include <chrono>
#include <regex>
#include <set>
#include <exception>

#include <boost/program_options.hpp>
#include <boost/property_tree/ptree.hpp>
#include <boost/property_tree/xml_parser.hpp>
#include <boost/foreach.hpp>
#include <boost/exception/all.hpp>

namespace pt = boost::property_tree;

class XmlReader {
public:
    static pt::ptree* loadXmlTree(const std::string& fileName);
    static pt::ptree* getXmlTree(const std::string& fileName);

public:
    XmlReader() = default;
    ~XmlReader();
    std::string getXmlStr(int nthFile = 1) const;

protected:
    static std::map<std::string, pt::ptree* > loadedXmlFiles;

private:
    int _numUpdates;
    pt::ptree* xmlTree;
    std::string _fileTemplate; // filename may cont "{{index}}", which will be replaced with nthFile on getXmlStr()
    int _fileIndex;
    int _numFiles;
};


#endif //BACKEND_SIM_XMLREADER_H
