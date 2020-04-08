#!/usr/bin/env bash

printf "\n------------------ Building dist/simpleui-server --------------------\n"
if $(test -d dist/simpleui-server); then rm -r dist/simpleui-server; fi

mkdir -p dist/simpleui-server
cp src/public/simpleui-server/SERVICE-TEMPLATE.service dist/simpleui-server/
cp node_modules/crypt/crypt.js dist/simpleui-server/
cp node_modules/charenc/charenc.js dist/simpleui-server/
cp node_modules/sha1/sha1.js dist/simpleui-server/

cp node_modules/crypt/crypt.js src/public/simpleui-server/
cp node_modules/charenc/charenc.js src/public/simpleui-server/
cp node_modules/sha1/sha1.js src/public/simpleui-server/
replace  \
    "require('crypt')" "require('./crypt')" \
    "require('charenc')" "require('./charenc')" \
      -- node_modules/sha1/sha1.js

#node_modules/.bin/ts-node --transpile-only --project src/public/simpleui-server/tsconfig.json --cache-directory dist/simpleui-server src/public/simpleui-server/json-string-normalizer.ts --compile-only
#if $(test "$?" -eq "0"); then printf "[json-string-normalizer.ts] ts-node transpile succeeded\n"; else "ERROR: ts-node transpile failed\n"; fi

#tsc --allowJs --outDir dist/json-string-normalizer -t es5 --lib "es5,es2015,es2016" --moduleResolution node --sourcemap src/public/simpleui-server/json-string-normalizer.ts src/public/simpleui-server/json-string-normalizer.ts
#if $(test "$?" -eq "0"); then printf "[json-string-normalizer.ts] transpile succeeded\n\n"; else "ERROR: json-string-normalizer.ts transpile failed\n\n"; fi

transpileStatus=1
tsc --allowJs --outDir dist/simpleui-server -t es5 --lib "es5,es2015,es2016" --moduleResolution node --sourcemap src/public/simpleui-server/simpleui-server.ts src/public/simpleui-server/simpleui-server.ts
transpileStatus=$?

#rm src/public/simpleui-server/crypt.js
#rm src/public/simpleui-server/charenc.js
#rm src/public/simpleui-server/sha1.js

if $(test "$transpileStatus" -eq "0"); then printf "[simpleui-server.ts] transpile succeeded\n\n"; else "ERROR: simpleui-server.ts transpile failed\n\n"; fi
