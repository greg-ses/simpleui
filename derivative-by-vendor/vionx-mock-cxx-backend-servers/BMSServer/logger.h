//
// Created by jscarsdale on 4/26/20.
//

#pragma once

#include <string>
#include <boost/program_options.hpp>
#include <ctime>
#include <chrono>
#include <iostream>
#include <sstream>

namespace logger {
    std::string getLogTime() {
        std::chrono::system_clock::time_point now = std::chrono::system_clock::now();
        std::time_t t_c = std::chrono::system_clock::to_time_t(now - std::chrono::hours(24));
        std::ostringstream stream;
        stream  <<  std::put_time(std::localtime(&t_c), "%F %T") << "%H:%M:%S";

        return stream.str();
    }
}
