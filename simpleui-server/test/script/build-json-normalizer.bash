#!/usr/bin/env bash

base_dir="$(dirname $(dirname $(dirname $(realpath $0))))"
test_build_dir="${base_dir}/dist/nodejs"

printf "\n------------------ Building json-normalizer.js --------------------\n"
if $(test -d ${test_build_dir}); then rm -r ${test_build_dir}; fi

mkdir ${test_build_dir}
cp ${base_dir}/node_modules/crypt/crypt.js ${test_build_dir}/
cp ${base_dir}/node_modules/charenc/charenc.js ${test_build_dir}/
cp ${base_dir}/node_modules/sha1/sha1.js ${test_build_dir}/

# cp ${base_dir}/node_modules/crypt/crypt.js src/public/nodejs/
# cp ${base_dir}/node_modules/charenc/charenc.js src/public/nodejs/
# cp ${base_dir}/node_modules/sha1/sha1.js src/public/nodejs/
# replace  \
#     "require('crypt')" "require('./crypt')" \
#     "require('charenc')" "require('./charenc')" \
#       -- ${base_dir}/node_modules/sha1/sha1.js


${base_dir}/node_modules/.bin/ts-node --transpile-only --project src/public/nodejs/tsconfig.json --cache-directory ${test_build_dir} src/public/nodejs/json-normalizer.ts --compile-only
if $(test "$?" -eq "0"); then printf "ts-node transpile succeeded\n"; else "ERROR: ts-node transpile failed\n"; fi

tsc --allowJs --outDir ${test_build_dir} -t es5 --lib "es5,es2015,es2016" --moduleResolution node --sourcemap src/public/nodejs/json-normalizer.ts src/public/nodejs/json-normalizer.ts
if $(test "$?" -eq "0"); then printf "nodejs transpile succeeded\n\n"; else "ERROR: nodejs transpile failed\n\n"; fi
