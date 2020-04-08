#!/usr/bin/env bash

fix_missing=F
if $(test "$1" == "-f") || $(test "$2" == "-f"); then
    fix_missing=T
fi

quiet=F
if $(test "$1" == "-q") || $(test "$2" == "-q"); then
    quiet=T
fi

function check_RAM_DISK_FOLDER() {

    RAM_DISK_FOLDER="/var/volatile/tmp"
    RAM_DISK_APACHE_FOLDER="/var/volatile/tmp/apache2"

    if $(test 1 -gt $(egrep -c "tmpfs[ \t]+${RAM_DISK_FOLDER}" /etc/fstab )); then
            printf "\n\t   Correct missing PREREQ-1 (add RAM DISK mount to /etc/fstab):\n\t\tsudo mkdir -p ${RAM_DISK_FOLDER}\n\t\techo \"tmpfs\t${RAM_DISK_FOLDER}\ttmpfs\trw,size=50M\t0 0\" | sudo tee -a /etc/fstab\n"
            if $(test "T" == "${fix_missing}"); then
                sudo mkdir -p ${RAM_DISK_FOLDER};
                echo "tmpfs  ${RAM_DISK_FOLDER}       tmpfs   rw,size=50M     0 0" | sudo tee -a /etc/fstab
            fi
    fi

    if $(test 1 -gt $(mount | egrep -c "/var/volatile/tmp[ \t]+type[ \t]+tmpfs")); then
            printf "\n\t   Correct missing PREREQ-2 (mount the RAM DISK now):\n\t\tsudo mount ${RAM_DISK_FOLDER}\n"
            if $(test "T" == "${fix_missing}"); then
                sudo mount ${RAM_DISK_FOLDER};
            fi
    fi

    if ! $(test -d ${RAM_DISK_APACHE_FOLDER}); then
            printf "\n\t   Correct missing PREREQ-3 (create folder ${RAM_DISK_APACHE_FOLDER}:\n\t\tsudo mkdir -p ${RAM_DISK_APACHE_FOLDER}\n\t\tsudo chown www-data:www-data ${RAM_DISK_APACHE_FOLDER}\n\t\tsudo chmod 777 ${RAM_DISK_APACHE_FOLDER}\n"
            if $(test "T" == "${fix_missing}"); then
                sudo mkdir -p ${RAM_DISK_APACHE_FOLDER};
                sudo chown www-data:www-data ${RAM_DISK_APACHE_FOLDER}
                sudo chmod 777 ${RAM_DISK_APACHE_FOLDER}
            fi
    fi

    if $(test -f /etc/rc.local); then
        if $(test 1 -gt $(egrep -c "mkdir[ \t]+\-p[ \t]+${RAM_DISK_FOLDER}" /etc/rc.local )); then
                printf "\n\t   Correct missing PREREQ-4b (create ${RAM_DISK_APACHE_FOLDER} in /etc/rc.local:\n\t\tsudo mkdir -p ${RAM_DISK_APACHE_FOLDER}\n\t\tsudo chown www-data:www-data ${RAM_DISK_APACHE_FOLDER}\n\t\tsudo chmod 777 ${RAM_DISK_APACHE_FOLDER}\n"
                if $(test "T" == "${fix_missing}"); then
                    sudo sed -i "\$s^exit 0^# Create apache2 folder under RAM DRIVE folder\nsu -c \"mkdir -p ${RAM_DISK_APACHE_FOLDER}\" root\nsu -c \"chown www-data:www-data ${RAM_DISK_APACHE_FOLDER}\" root\nsu -c \"chmod 777 ${RAM_DISK_APACHE_FOLDER}\" root\n\nexit 0^g" /etc/rc.local
                fi
        fi
    else
        printf "\n\t   Correct missing PREREQ-4a (create ${RAM_DISK_APACHE_FOLDER} in /etc/rc.local:\n\t\tsudo mkdir -p ${RAM_DISK_APACHE_FOLDER}\n\t\tsudo chown www-data:www-data ${RAM_DISK_APACHE_FOLDER}\n\t\tsudo chmod 777 ${RAM_DISK_APACHE_FOLDER}\n"
                if $(test "T" == "${fix_missing}"); then
                    cat <<\! | sudo tee -a /etc/rc.local
#!/bin/sh -e
#
# rc.local
#
# This script is executed at the end of each multiuser runlevel.
# Make sure that the script will "exit 0" on success or any other
# value on error.
#
# In order to enable or disable this script just change the execution
# bits.
#
# By default this script does nothing.

# Auto-startup
# su -c "timeout 300 /opt/bin/wait-for-mysql-server.sh 127.0.0.1 sys_mon PASSWORD && /opt/bin/start.sh" -l service

exit 0
!
                    sudo sed -i "\$s^exit 0^# Create apache2 folder under RAM DRIVE folder\nsu -c \"mkdir -p ${RAM_DISK_APACHE_FOLDER}\" root\nsu -c \"chown www-data:www-data ${RAM_DISK_APACHE_FOLDER}\" root\nsu -c \"chmod 777 ${RAM_DISK_APACHE_FOLDER}\" root\n\nexit 0^g" /etc/rc.local
                    sudo chmod 755 /etc/rc.local
                fi
    fi

    return 0
}


check_RAM_DISK_FOLDER

exit $?
