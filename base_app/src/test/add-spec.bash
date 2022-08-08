#!/usr/bin/env bash

if [[ $# = '0' ]]; then
  echo "wrong number of arguments : saw : $# expected 1"
  exit 1
fi

# Ng=node /mnt/c/Users/jchung/git/vcharge_platform/depend/simpleui/base_app/node_modules/@angular/cli/bin/ng.js

full_file=$1


if $(test -f $full_file); then
  echo "found full_file"
else
  echo "full_file doesn't exist : $full_file"
  exit 1
fi

spec_file=$(basename $full_file)
spec_file=${spec_file/.ts/.spec.ts}
component=$(basename $full_file)
component=${component/.ts/}

folder=$(dirname $full_file)
pushd $folder

if $(test -d $component); then
  echo "component directory already exists : $component"
  exit 1
fi

if $(test -f $spec_file); then
  echo "spec_file already exists : $spec_file"
  exit 1
fi

echo generate spec_file $spec_file for full_file $full_file
node /mnt/c/Users/jchung/git/vcharge_platform/depend/simpleui/base_app/node_modules/@angular/cli/bin/ng.js generate component $component
mv $component/$component.component.spec.ts ./$spec_file
sed -i 's/ComponentComponent/Component/g' ./$spec_file
sed -i 's/\.Component/Component/g' ./$spec_file
sed -i 's/\.component\.component/.component/g' ./$spec_file
rm -rf $component
popd

