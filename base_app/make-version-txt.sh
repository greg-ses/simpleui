#!/bin/sh
../../../../../workspace/CLion/scripts/gitrevision.sh $PWD
mv gitrevision.h src/public/version.txt
replace \
    "#define GIT_REVSTR_SHORT \"" "#define GIT_REVSTR_SHORT \"$1 " \
    "#define GIT_REV_SUMMARY \"" "#define GIT_REV_SUMMARY \"build-$1 " \
    -- src/public/version.txt

