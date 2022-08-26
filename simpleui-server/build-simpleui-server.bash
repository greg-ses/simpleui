#!/usr/bin/env bash

printf "\n------------------ Building dist/simpleui-server --------------------\n"
if $(test -d dist/simpleui-server); then rm -r dist/simpleui-server; fi

mkdir -p dist/simpleui-server
cp src/SERVICE-TEMPLATE.service dist/simpleui-server/
cp package.json dist/simpleui-server/
cp package-lock.json dist/simpleui-server/

#node_modules/.bin/ts-node --transpile-only --project src/tsconfig.json --cache-directory dist/simpleui-server src/json-string-normalizer.ts --compile-only
#if $(test "$?" -eq "0"); then printf "[json-string-normalizer.ts] ts-node transpile succeeded\n"; else "ERROR: ts-node transpile failed\n"; fi

#tsc --allowJs --outDir dist/json-string-normalizer -t es5 --lib "es5,es2015,es2016" --moduleResolution node --sourcemap src/json-string-normalizer.ts src/json-string-normalizer.ts
#if $(test "$?" -eq "0"); then printf "[json-string-normalizer.ts] transpile succeeded\n\n"; else "ERROR: json-string-normalizer.ts transpile failed\n\n"; fi

transpileStatus=1
tsc --allowJs --outDir dist/simpleui-server -t es5 --lib "es5,es2015,es2016" --moduleResolution node --sourcemap src/simpleui-server.ts src/simpleui-server.ts
transpileStatus=$?

#rm src/crypt.js
#rm src/charenc.js
#rm src/sha1.js

if $(test "$transpileStatus" -eq "0"); then printf "[simpleui-server.ts] transpile succeeded\n\n"; else printf "ERROR: simpleui-server.ts transpile failed\n\n"; fi
