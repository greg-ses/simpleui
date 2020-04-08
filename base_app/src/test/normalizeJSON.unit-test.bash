#!/usr/bin/env bash

sh -x build-json-normalizer.sh

base_dir="$(dirname $(dirname $(dirname $(realpath $0))))"
test_dir="${base_dir}/src/test"
dist_nodejs_dir="${base_dir}/dist/nodejs"
test_file_list="${test_dir}/testfiles.txt"

firstTest=1
lastTest=0

successful_tests=0
failed_tests_on_nodejs=0
failed_tests_on_diff=0

while IFS= read -r filename; do
     inJsonFile="${test_dir}/${filename}"
    inPropsFile="${test_dir}/${filename/in.json/in.properties.json}"
    outJsonFile="${test_dir}/${filename/.in.json/.out.json}"
    refJsonFile="${test_dir}/${filename/in.json/out.reference.json}"

    printf "\n============================= Test $((lastTest=lastTest+1)) =============================\n"
    printf "inJsonFile:  ${inJsonFile}\n"
    printf "inPropsFile: ${inPropsFile}\n"
    printf "outJsonFile: ${outJsonFile}\n"
    printf "refJsonFile: ${refJsonFile}\n"

    printf "/usr/bin/node ${dist_nodejs_dir}/json-normalizer.js ${inJsonFile} ${outJsonFile}\n"

    /usr/bin/node  ${dist_nodejs_dir}/json-normalizer.js  ${inJsonFile}  ${outJsonFile}  ${inPropsFile}
    if $(test $? == 0);
    then
        printf "RESULT: nodejs test succeeded\n"
        printf "\ndiff --brief ${refJsonFile} ${outJsonFile}\n"

        diff --brief ${refJsonFile} ${outJsonFile}
        if $(test $? == 0);
        then
            printf "RESULT: diff test succeeded\n"
            successful_tests=$((${successful_tests}+1))
        else
            printf "RESULT: diff test failed\n"
            failed_tests_on_diff=$((${failed_tests_on_diff}+1))
        fi
    else
        failed_tests_on_nodejs=$((${failed_tests_on_nodejs}+1));
        printf "RESULT: nodejs test failed\n"
    fi
done < ${test_file_list}

printf "\n============================= Summary =============================\n"
printf "\nFailed tests:\t\t$((${failed_tests_on_nodejs}+${failed_tests_on_diff}))\t(failed on nodejs): ${failed_tests_on_nodejs}\t(failed on diff): ${failed_tests_on_diff}"
printf "\nSuccessful tests:\t${successful_tests}"
printf "\nTotal tests:\t\t$((${lastTest}+1-${firstTest}))\n\n"
