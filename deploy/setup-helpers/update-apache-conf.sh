#!/usr/bin/env bash

if [ $# -ne 2 ]; then
  echo 1>&2 "$0: Wrong # of arguments ($#) - expected 2, APPNAME and PORT"
  exit 2
fi

appName=$1
port=$2

function addAppRewriteBlock() {
  apache_conf_file=/etc/apache2/apache2.conf
  temp_apache_conf_file=/tmp/apache2.conf
  rewrite_block_template=/tmp/apache2-rewrite-block.txt;

  block_tag="#++ Start Rewrite Block: /${appName}/ ++"
  block_matches=$(grep -c "${block_tag}" ${apache_conf_file})
  if $(test 1 -eq ${block_matches}); then
    printf "Nothing to do: block tag already exists: ${block_tag}\n";
  else
    printf "Installing new rewrite block into ${apache_conf_file}\n";

    cp "$(dirname $0)/apache2-rewrite-block.txt" "${rewrite_block_template}"
    replace "XX_APP_NAME" "${appName}" "XX_PORT" "$port" -- ${rewrite_block_template}

    new_block="";
    while IFS= read -r line; do
      new_block="${new_block}${line}\n";
    done < ${rewrite_block_template}

    if $(test -f ${temp_apache_conf_file}); then rm ${temp_apache_conf_file}; fi

    foundStart="F";
    insertComplete="F";
    while IFS= read -r line; do
      if $(test "${insertComplete}" == "T"); then
          printf "%s\n" "${line}" >> ${temp_apache_conf_file};
      else
        if $(test "${line}" == "<Directory />"); then
          foundStart="T";
          printf "${line}\n" >> ${temp_apache_conf_file};
        else
          if $(test "${foundStart}" == "T"); then
            if $(test "${line}" == "</Directory>"); then
              printf "${new_block}" >> ${temp_apache_conf_file};
              printf "${line}\n" >> ${temp_apache_conf_file};
              insertComplete="T";
            else
              printf "${line}\n" >> ${temp_apache_conf_file};
            fi
          else
            printf "${line}\n" >> ${temp_apache_conf_file};
          fi
        fi
      fi
    done < ${apache_conf_file};

    cp ${temp_apache_conf_file} ${apache_conf_file}

    rm "${rewrite_block_template}"
    rm "${temp_apache_conf_file}"
  fi
  return 0;
}

addAppRewriteBlock

exit 0
