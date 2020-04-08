#!/bin/sh
if $(test "$(basename ${PWD})" != "doc"); then
    printf "\nERROR: Must run from target/common/web/apps/documentation\n\n";
else
    ln -s ${PWD} /var/www/documentation
    printf "Finished.\n\nEnter \"http://$(hostname)/documentation\" in your browser and navigate to the doc you want to view.\n";
fi
