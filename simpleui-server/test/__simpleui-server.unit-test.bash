#!/usr/bin/env bash

base_dir="$(dirname $(dirname $(dirname $(dirname $(dirname $(realpath $0))))))"
test_dir="$(dirname $(realpath $0))"
dist_simpleui_server_dir="${base_dir}/dist/simpleui-server"
test_file_list="${test_dir}/__unit-test-files.txt"

# bash -x "${base_dir}/build-simpleui-server.bash"

firstTest=1
lastTest=0

successful_tests=0
failed_tests_on_nodejs=0
failed_tests_on_diff=0
line_number=0

while IFS=' ' read -ra line; do
    if [[ $((++line_number)) > 0 ]]; then
        mode="${line[0]}"
        appName="${line[1]}"
        uiProp="${line[2]}"
        xmlInFile="${test_dir}/${line[3]}"
        refJsonFile="${xmlInFile/.reference.xml/.out.reference.json}"
        outJsonFile="${xmlInFile/.reference.xml/.out.test.json}"
        refJsonFilePretty="${xmlInFile/.reference.xml/.out.reference.pretty.json}"
        outJsonFilePretty="${xmlInFile/.reference.xml/.out.test.pretty.json}"

        if $(test "$mode" == "#test"); then continue; fi

        printf "\n============================= Test $((lastTest=lastTest+1)) =============================\n"
        printf "/usr/bin/node ${dist_simpleui_server_dir}/simpleui-server.js \n"
        printf "  --mode:             ${mode}\n"
        printf "  --appName:          ${appName}\n"
        printf "  --uiProp:           ${uiProp}\n"
        printf "  --xmlInFile:        ${xmlInFile}\n\n"

        printf "  refJsonFile:        ${refJsonFile}\n"
        printf "  outJsonFile:        ${outJsonFile}\n\n"

        printf "  refJsonFilePretty:  ${refJsonFilePretty}\n"
        printf "  outJsonFilePretty:  ${outJsonFilePretty}\n\n"

        /usr/bin/node  "${dist_simpleui_server_dir}/simpleui-server.js"  \
        " --mode=test" \
        " --appName=${appName}" \
        " --uiProp=${uiProp}" \
        " --xmlInFile=${xmlInFile}"

        if $(test $? == 0); then
            printf "RESULT: nodejs test succeeded\n"
            printf "\ndiff --brief ${refJsonFile} ${outJsonFile}\n"

            diff --brief ${refJsonFile} ${outJsonFile}
            if $(test $? == 0); then
                printf "RESULT: diff test succeeded\n"
                successful_tests=$((${successful_tests}+1))
            else
                printf "RESULT: diff test failed\n"
                python3 -m json.tool < ${outJsonFile} > ${outJsonFilePretty}
                python3 -m json.tool < ${refJsonFile} > ${refJsonFilePretty}
                failed_tests_on_diff=$((${failed_tests_on_diff}+1))
            fi
        else
            failed_tests_on_nodejs=$((${failed_tests_on_nodejs}+1));
            printf "RESULT: nodejs test failed\n"
        fi
    fi
done < ${test_file_list}

printf "\n============================= Summary =============================\n"
printf "\nFailed tests:\t\t$((${failed_tests_on_nodejs}+${failed_tests_on_diff}))\t failed on nodejs: ${failed_tests_on_nodejs}\t failed on diff: ${failed_tests_on_diff}"
printf "\nSuccessful tests:\t${successful_tests}"
printf "\nTotal tests:\t\t$((${lastTest}+1-${firstTest}))\n\n"
