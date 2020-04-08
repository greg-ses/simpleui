#!/usr/bin/env bash

pushd $(dirname ${BASH_SOURCE})

latest_file=""
latest_file_time=1
dist_tgz_update_time=$(stat  --format "%Y" dist.tgz)

for d in $(find src -type d); do
    for f in ${d}/.*; do
        update_time=$(stat --format "%Y" ${f})
        if ((update_time > latest_file_time)); then
            latest_file_time=${update_time}
            latest_file="${f}"
        fi
    done
done
exit_value=0
if ((latest_file_time > dist_tgz_update_time)); then
    exit_value=1

    printf "Stale distribution: ${PWD}/dist.tgz\n"
    printf "dist_tgz_update_time: %d\n" ${dist_tgz_update_time}
    printf "latest_file_time:     %d\n" ${latest_file_time}
    printf "latest_file:          %s\n" ${latest_file}
fi

popd

exit ${exit_value}
