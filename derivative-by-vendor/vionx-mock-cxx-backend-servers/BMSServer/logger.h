//
// Created by jscarsdale on 4/26/20.
//
#ifndef BMSSERVER_LOGGER_H
#define BMSSERVER_LOGGER_H

#include <string>
#include <boost/program_options.hpp>
#include <ctime>
#include <chrono>
#include <iostream>
#include <sstream>
#include <iomanip>

namespace logger {
    std::string getLogTime();
}

#endif //BMSSERVER_LOGGER_H
