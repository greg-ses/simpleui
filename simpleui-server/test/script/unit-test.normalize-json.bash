#!/usr/bin/env bash

base_dir="$(dirname $(dirname $(dirname $(realpath $0))))"
simpleui_server="${base_dir}/dist/simpleui-server/simpleui-server.js"

if [[ ! -f ${simpleui_server} ]]; then
    pushd ${base_dir}
    npm run build
    popd
fi

firstTest=1
lastTest=0

successful_tests=0
failed_tests_on_nodejs=0
failed_tests_on_diff=0

for subdir in bms; do

    data_dir="${base_dir}/test/data/${subdir}"
    test_file_list="${data_dir}/__testfiles-for-unit-test.normalize-json.txt"
    while IFS= read -r filename; do
        inJsonFile="${data_dir}/${filename}"
        outJsonFile="${data_dir}/${filename/.in.json/.out.json}"
        refJsonFile="${data_dir}/${filename/in.json/out.reference.json}"

        printf "\n============================= Test $((lastTest=lastTest+1)) =============================\n"
        printf "inJsonFile:  ${inJsonFile}\n"
        printf "outJsonFile: ${outJsonFile}\n"
        printf "refJsonFile: ${refJsonFile}\n"

        printf "\n/usr/bin/node \n\t${simpleui_server} \n\t--mode=test \n\t--appName=mock-bms \n\t--webPort=2080 \n\t--xmlInFile=${inJsonFile}  \n\t--jsonOutFile=${outJsonFile}\n"

        /usr/bin/node  ${simpleui_server} --mode=test --appName=mock-bms --webPort=2080 --xmlInFile=${inJsonFile} --jsonOutFile=${outJsonFile}

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
    done < ${test_file_list};
done

printf "\n============================= Summary =============================\n"
printf "\nFailed tests:\t\t$((${failed_tests_on_nodejs}+${failed_tests_on_diff}))\t(failed on nodejs): ${failed_tests_on_nodejs}\t(failed on diff): ${failed_tests_on_diff}"
printf "\nSuccessful tests:\t${successful_tests}"
printf "\nTotal tests:\t\t$((${lastTest}+1-${firstTest}))\n\n"
