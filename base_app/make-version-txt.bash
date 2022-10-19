#!/bin/bash

VER_FILE=src/public/version.txt
echo "BUILD_COMMAND: $1" > ${VER_FILE}
echo "BUILD_TIME: $(date -R)" >> ${VER_FILE}
echo "USER: $(whoami)" >> ${VER_FILE}

git describe --always --dirty --long >> ${VER_FILE} 2> /dev/null
git rev-list --all --timestamp --branches --pretty >> ${VER_FILE} 2> /dev/null
if [[ $? -ne 0 ]]; then
    echo "GIT_DIRTY_STATUS: unknown (maybe built from docker?)" >> ${VER_FILE};
else
    GIT_FILES_ADDED=$(git status --porcelain | grep -c "^A ")
    GIT_FILES_STAGED_MODIFIED=$(git status --porcelain | grep -c "^M ")
    GIT_FILES_STAGED_NOT_MODIFIED=$(git status --porcelain | grep -c "^ M")
    GIT_FILES_UNTRACKED=$(git status --porcelain | grep -c "^?? ")
    GIT_TOTAL_DIRTY_FILES=$((GIT_FILES_ADDED+GIT_FILES_STAGED_MODIFIED+GIT_FILES_STAGED_NOT_MODIFIED+GIT_FILES_UNTRACKED ))

    if [[ ${GIT_TOTAL_DIRTY_FILES} -eq 0 ]]; then
        echo GIT_DIRTY_STATUS: clean >> ${VER_FILE}
    else
        echo GIT_DIRTY_STATUS: dirty >> ${VER_FILE}
        echo GIT_FILES_ADDED: ${GIT_FILES_ADDED} >> ${VER_FILE}
        echo GIT_FILES_STAGED_MODIFIED: ${GIT_FILES_STAGED_MODIFIED} >> ${VER_FILE}
        echo GIT_FILES_STAGED_NOT_MODIFIED: ${GIT_FILES_STAGED_NOT_MODIFIED} >> ${VER_FILE}
        echo GIT_FILES_UNTRACKED: ${GIT_FILES_UNTRACKED} >> ${VER_FILE}
        echo GIT_TOTAL_DIRTY_FILES: ${GIT_TOTAL_DIRTY_FILES} >> ${VER_FILE}
    fi
fi
