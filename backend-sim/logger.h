//
// Created by jscarsdale on 4/26/20.
//
#ifndef BACKEND_SIM_LOGGER_H
#define BACKEND_SIM_LOGGER_H

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

#endif //BACKEND_SIM_LOGGER_H
