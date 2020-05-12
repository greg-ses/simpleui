//
// Created by jscarsdale on 5/4/20.
//

#include <string>
#include <stdexcept>
#include <boost/property_tree/ptree.hpp>
#include <boost/property_tree/ini_parser.hpp>
#include "props.h"

int Props::init(const std::string& configFile) {

    boost::property_tree::ini_parser::read_ini(configFile, _propTree);

    if (_propTree.size() == 0) {
        throw new std::runtime_error("No props found");
    }

    return (0);
}

