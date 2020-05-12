cmake_minimum_required(VERSION 3.16)
project(BMSServer)

set(CMAKE_CXX_STANDARD 17)

find_package(Boost 1.67)
if(Boost_FOUND)
    include_directories(${Boost_INCLUDE_DIR})
endif()
add_executable(BMSServer main.cpp SimState.h SimState.cpp logger.h props.cpp props.h XmlReader.cpp XmlReader.h ZmqWrapper.cpp ZmqWrapper.h logger.cpp)

target_link_libraries(BMSServer LINK_PUBLIC /usr/lib/x86_64-linux-gnu/libzmq.so /usr/lib/x86_64-linux-gnu/libboost_filesystem.so.1.67.0 /usr/lib/x86_64-linux-gnu/libboost_system.so.1.67.0)
