//
// Created by jscarsdale on 5/11/20.
//
#include "logger.h"

std::string logger::getLogTime() {
    std::chrono::system_clock::time_point now = std::chrono::system_clock::now();
    std::time_t t_c = std::chrono::system_clock::to_time_t(now);
    std::ostringstream stream;
    stream  <<  std::put_time(std::localtime(&t_c), "%F %T") ;

    return stream.str();
}
