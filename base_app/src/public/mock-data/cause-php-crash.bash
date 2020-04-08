#!/bin/bash

# How long (in seconds) should the monitoring run?
MAX_ITERATIONS=10
TIME_BETWEEN_CYCLES=1
iteration=0

if (( $# > 0 )); then
if  $(test "$1" == "-h") || $(test "$1" == "--help"); then
        printf "cause-php-crash.bash\n"
        printf "\n"
        printf "Description:\n"
        printf "  Repeatedly invokes wget requests to a server in an attempt to force a crash.\n"
        printf "  Use while collect-apache-coredumps.bash is running, watching for detection of\n"
        printf "   a CLOSE_WRITE event.\n"
        printf "\n"
        printf "Arguments:\n"
        printf "    arg1: MAX_ITERATIONS - the number of times through the loop\n"
        printf "                         default: ${MAX_ITERATIONS}\n"
        printf "\n"
        printf "    arg2: TIME_BETWEEN_CYCLES - the number of seconds to wait before checking for the existence\n"
        printf "                         of a new apache crash dump\n"
        printf "                         default: ${TIME_BETWEEN_CYCLES}\n"
        printf "\n"

        exit 0
    else
        # arg 1 is MAX_DURATION
        MAX_ITERATIONS=$1
    fi
fi

if (( $# > 1 )); then
    # arg 2 is TIME_BETWEEN_CYCLES
    TIME_BETWEEN_CYCLES=$2
fi

while $(test ${iteration} -lt ${MAX_ITERATIONS}); do
    iteration=$((iteration+1))
    # wget --tries=1 -O get_props_file-php.txt http://jks-ubuntu16-dev/SimDoeServer/php/get_props_file.php
    #wget --tries=1 -O bsc-data-php.0.txt "http://10.0.5.105/bsc/php/bsc-data.php?JSON=1"

    # Never crashes (json output, with debug session)
    #wget --tries=1 -O bsc-data-php.1.txt "http://10.0.5.105/bsc/php/bsc-data.php?XDEBUG_SESSION_START=session_name&JSON"

    # Crashes almost every time (json output, no debug session info)
    # wget --tries=1 -O bsc-data-php.txt "http://10.0.5.105/bsc/php/bsc-data.php?JSON=1"

    # Never crashes (xml output)
    #wget --tries=1 -O bsc-data-php.2.txt "http://10.0.5.105/bsc/php/bsc-data.php"

    # Crashes almost every time
    #wget --tries=1 -O bsc-data-php.1.txt "http://10.0.5.105/bsc/php/bsc-data.php?some_really_long_unused_arg=fubar&JSON=1"

    # Crashes ?
    wget --tries=1 -O bsc-data-php.1.txt "http://10.0.5.105/bsc/php/bsc-data.php?XDEBUG_SESSION_START=session_name&JSON=1"

    echo "Completed iteration: ${iteration}"
    sleep ${TIME_BETWEEN_CYCLES}

done

