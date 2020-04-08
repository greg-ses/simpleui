#!/bin/bash

# How long (in seconds) should the monitoring run?
MAX_DURATION=30
TIME_BETWEEN_CYCLES=5
duration=0

ACCOUNT_NAME=service
APACHE_CRASH_REPORT_FOLDER=/home/${ACCOUNT_NAME}/apache-crash-reports/
TEMP_CRASH_ANALYSIS_FOLDER=/tmp/apache-crash-analysis/

APACHE_BINARY=/usr/sbin/apache2
CRASH_DUMP_FOLDER=/var/crash
CRASH_DUMP_FILE=/var/crash/_usr_sbin_apache2.0.crash
TEMP_CRASH_BT_FILE=${TEMP_CRASH_ANALYSIS_FOLDER}temp-crash-bt.txt
CRASH_LOG_FILE=${APACHE_CRASH_REPORT_FOLDER}apache-crash-log.txt
GDB_BATCH_FILE=/tmp/apache-gdb-batch.txt

if (( $# > 0 )); then
if  $(test "$1" == "-h") || $(test "$1" == "--help"); then
        printf "collect-apache-core-dumps.bash\n"
        printf "\n"
        printf "Description:\n"
        printf "  Looks for an apport-compatible crash dump at ${CRASH_DUMP_FILE}\n"
        printf "\n"
        printf "  If found, performs a gdb backtrace on the crash dump and compares with known backtraces,\n"
        printf "            writing the results to ${CRASH_LOG_FILE}\n"
        printf "\n"
        printf "  If not found, waits TIME_BETWEEN_CYCLES and looks again, until MAX_DURATION is exceeded.\n"
        printf "\n"
        printf "Arguments:\n"
        printf "    arg1: MAX_DURATION - the number of seconds to monitor for apache crash dumps before quitting\n"
        printf "                         default: ${MAX_DURATION}\n"
        printf "\n"
        printf "    arg2: TIME_BETWEEN_CYCLES - the number of seconds to wait before checking for the existence\n"
        printf "                         of a new apache crash dump\n"
        printf "                         default: ${TIME_BETWEEN_CYCLES}\n"
        printf "\n"

        exit 0
    else
        # arg 1 is MAX_DURATION
        MAX_DURATION=$1
    fi
fi

if (( $# > 1 )); then
    # arg 2 is TIME_BETWEEN_CYCLES
    TIME_BETWEEN_CYCLES=$2
fi

while $(test ${duration} -le ${MAX_DURATION}); do

    while inotifywait -e close_write -t ${TIME_BETWEEN_CYCLES} ${CRASH_DUMP_FOLDER}; do
        if $(test -f ${CRASH_DUMP_FILE}); then

            if $(test ! -d ${APACHE_CRASH_REPORT_FOLDER}); then
                mkdir -p ${APACHE_CRASH_REPORT_FOLDER}
                chown ${ACCOUNT_NAME}:${ACCOUNT_NAME} ${APACHE_CRASH_REPORT_FOLDER}
            fi

            touch ${CRASH_LOG_FILE}
            chown ${ACCOUNT_NAME}:${ACCOUNT_NAME} ${CRASH_LOG_FILE}

            if $(test -d /tmp/apache-crash-analysis); then
                rm -rf ${TEMP_CRASH_ANALYSIS_FOLDER}
            fi

            sed -i '1,$s/UserGroups:/UserGroups: mysql/g' ${CRASH_DUMP_FILE}
            apport-unpack ${CRASH_DUMP_FILE} ${TEMP_CRASH_ANALYSIS_FOLDER}

            echo "bt" > ${GDB_BATCH_FILE}
            gdb -batch -x ${GDB_BATCH_FILE} -c ${TEMP_CRASH_ANALYSIS_FOLDER}CoreDump ${APACHE_BINARY} >> ${TEMP_CRASH_BT_FILE}

            # Remove variant parts of the crash dump backtrace
            sed -r -i '1,$s/LWP [0-9]+/LWP XXXXX/' ${TEMP_CRASH_BT_FILE}
            sed -r -i '1,$s/set=0x[0-9a-z]+/iset=0xXXXXXXXXXXXX/' ${TEMP_CRASH_BT_FILE}

            CRASH_BT_SHA1SUM=$(sha1sum ${TEMP_CRASH_BT_FILE} | awk '{print $1}')
            CRASH_BT_FILE=${APACHE_CRASH_REPORT_FOLDER}crash-bt.${CRASH_BT_SHA1SUM}.txt

            if $(test -f ${CRASH_BT_FILE}); then
                # Existing backtrace
                ls --full-time ${CRASH_DUMP_FILE} | awk -v CRASH_BT_FILE="${CRASH_BT_FILE}"  '{printf("repeat crash backtrace at %s %s - see: %s\n", $6, $7, CRASH_BT_FILE);}' >> ${CRASH_LOG_FILE}
            else
                # New backtrace
                mv ${TEMP_CRASH_BT_FILE} ${CRASH_BT_FILE}
                chown ${ACCOUNT_NAME}:${ACCOUNT_NAME} ${CRASH_BT_FILE}
                ls --full-time ${CRASH_DUMP_FILE} | awk -v CRASH_BT_FILE="${CRASH_BT_FILE}"  '{printf("new crash backtrace at    %s %s - see: %s\n", $6, $7, CRASH_BT_FILE);}' >> ${CRASH_LOG_FILE}
            fi

            rm -r /tmp/apache-crash-analysis
            rm ${GDB_BATCH_FILE}

            # Allow new crash dumps by removing this one
            rm ${CRASH_DUMP_FILE}
        fi

    done

    echo "At duration: ${duration}"
    duration=$((duration+${TIME_BETWEEN_CYCLES}))

done
