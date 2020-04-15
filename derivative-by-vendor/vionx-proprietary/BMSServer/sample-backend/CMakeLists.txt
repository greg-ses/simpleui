cmake_minimum_required(VERSION 3.16)
project(BMSServer)

set(CMAKE_CXX_STANDARD 17)

add_subdirectory(test)

add_executable(BMSServer BMSServer.cpp)

target_link_libraries(BMSServer LINK_PUBLIC)