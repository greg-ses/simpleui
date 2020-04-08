#!/usr/bin/env bash

printf "\n------------------ Building json-normalizer.js --------------------\n"
if $(test -d dist/nodejs); then rm -r dist/nodejs; fi

mkdir dist/nodejs
cp node_modules/crypt/crypt.js dist/nodejs/
cp node_modules/charenc/charenc.js dist/nodejs/
cp node_modules/sha1/sha1.js dist/nodejs/

cp node_modules/crypt/crypt.js src/public/nodejs/
cp node_modules/charenc/charenc.js src/public/nodejs/
cp node_modules/sha1/sha1.js src/public/nodejs/
replace  \
    "require('crypt')" "require('./crypt')" \
    "require('charenc')" "require('./charenc')" \
      -- node_modules/sha1/sha1.js


node_modules/.bin/ts-node --transpile-only --project src/public/nodejs/tsconfig.json --cache-directory dist/nodejs src/public/nodejs/json-normalizer.ts --compile-only
if $(test "$?" -eq "0"); then printf "ts-node transpile succeeded\n"; else "ERROR: ts-node transpile failed\n"; fi

tsc --allowJs --outDir dist/nodejs -t es5 --lib "es5,es2015,es2016" --moduleResolution node --sourcemap src/public/nodejs/json-normalizer.ts src/public/nodejs/json-normalizer.ts
if $(test "$?" -eq "0"); then printf "nodejs transpile succeeded\n\n"; else "ERROR: nodejs transpile failed\n\n"; fi
