#!/bin/bash

targetIp=$2
binName=$1
filename="BMSServer.properties"

function cmdtarget {
  sshpass -p "Br0myne" ssh ${REMOTE_WEB_USER}@$targetIp 'echo Br0myne | sudo -S' "$@"
}

#Copy the desired binary to the target_bak for debug
#Kill gdbserver in case that it's running
cmdtarget killall -9 gdbserver
cmdtarget killall -9 $binName
cmdtarget rm $binName
echo copying binary $binName to target.
sshpass -p "Br0myne" scp ../../../../output/$binName/bin/debug/$binName ${REMOTE_WEB_USER}@$targetIp:.
echo setting executable permissions on binary
cmdtarget chmod 777 $binName

# If there is a fourth argument treat it as a new properties file
# and copy to the target2if [ $# -gt 3 ]
if [ $# -gt 2 ]; then
    echo Copying properties file $3 .
#    basePropName=$(basename $3)
    sshpass -p "Br0myne" scp $3 ${REMOTE_WEB_USER}@$targetIp:/opt/config/.
    filename=$(basename "$3")
fi

echo Starting gdb on target.
# cmdtarget gdbserver 0.0.0.0:10000 ./$binName "${@:3}" &
echo "cmdtarget gdbserver 0.0.0.0:10000 ./$binName -cf /opt/config/$filename"
sleep 2
cmdtarget gdbserver 0.0.0.0:10000 ./$binName -cf /opt/config/$filename &
