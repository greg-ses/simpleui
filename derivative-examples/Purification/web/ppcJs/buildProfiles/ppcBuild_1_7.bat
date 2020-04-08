rem	** builds ppcServer.profile.js
rem    	Requires Dojo source installed under ~\ppc_code\trunk\web\Server\dojo-toolkit
rem	ie: 	~\ppc_code\trunk\web\Server\dojo-toolkit\dijit
rem		~\ppc_code\trunk\web\Server\dojo-toolkit\dojo
rem		~\ppc_code\trunk\web\Server\dojo-toolkit\dojox
rem		~\ppc_code\trunk\web\Server\dojo-toolkit\util

cd ..\..\dojo-toolkit\util\buildscripts
build.bat --profile ../../../release.profile.js --action clean,release

rem		copy external libraries under ~\ppcJs
rem cd ..\..\..\ppcJs
rem xcopy downloadify  ..\dojo-toolkit\release\ppcJs\downloadify   /i /s /e /y
rem cd ..\..\..\ppcJs\buildProfiles

