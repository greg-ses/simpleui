
#!/usr/bin/env bash



#-----------------------------------------
# /var/www/bms/ui.properties
#-----------------------------------------
## Core BMS TABS
#tab.1.name       = BMS
#tab.1.dataUrl    = ${URL_PREFIX}/BMS/query/data/zmq/${BMS_PORT}/EXPORT_DATA
#wget -O bms-tab-1-BMS.reference.xml http://jks-ubuntu16-dev:2080/bms/ui/BMS/query/data/zmq/16901/EXPORT_DATA?xml
#wget -O bms-tab-1-BMS.out.reference.json http://jks-ubuntu16-dev:2080/bms/ui/BMS/query/data/zmq/16901/EXPORT_DATA

#tab.2.name       = Battery
#tab.2.dataUrl    = ${URL_PREFIX}/Battery/query/data/zmq/${BMS_PORT}/DCBattData
#wget -O bms-tab-2-Battery.reference.xml http://jks-ubuntu16-dev:2080/bms/ui/BMS/query/data/zmq/16902/ModuleIOData?xml
#wget -O bms-tab-2-Battery.out.reference.json http://jks-ubuntu16-dev:2080/bms/ui/BMS/query/data/zmq/16902/ModuleIOData

#tab.4.name       = IO 1
#tab.4.dataUrl    = ${URL_PREFIX}/IO-1/query/data/zmq/${UNIT_PORT}/ModuleIOData
#wget -O bms-tab-4-IO-1.reference.xml http://jks-ubuntu16-dev:2080/bms/ui/BMS/query/data/zmq/16902/ModuleIOData?xml
#wget -O bms-tab-4-IO-1.out.reference.json http://jks-ubuntu16-dev:2080/bms/ui/BMS/query/data/zmq/16902/ModuleIOData

#tab.5.name       = IO 2
#tab.5.dataUrl    = ${URL_PREFIX}/IO-2/query/data/zmq/${UNIT_PORT}/ModuleIOData
#wget -O bms-tab-5-IO-2.reference.xml http://jks-ubuntu16-dev:2080/bms/ui/BMS/query/data/zmq/16902/ModuleIOData?xml
#wget -O bms-tab-5-IO-2.out.reference.json http://jks-ubuntu16-dev:2080/bms/ui/BMS/query/data/zmq/16902/ModuleIOData

#tab.6.name       = Units
#tab.6.dataUrl    = ${URL_PREFIX}/Units/query/data/zmq/${UNIT_PORT}/UnitBoardData
#wget -O bms-tab-6-Units.reference.xml http://jks-ubuntu16-dev:2080/bms/ui/BMS/query/data/zmq/16902/UnitBoardData?xml
#wget -O bms-tab-6-Units.out.reference.json http://jks-ubuntu16-dev:2080/bms/ui/BMS/query/data/zmq/16902/UnitBoardData

#tab.7.name       = FaultList
#tab.7.dataUrl    = ${URL_PREFIX}/FaultList/query/data/zmq/${BMS_PORT}/FaultList
#wget -O bms-tab-7-FaultList.reference.xml       "http://jks-ubuntu16-dev:2080/bms/ui/BMS/query/data/zmq/16901/FaultList?xml"
#wget -O bms-tab-7-FaultList.out.reference.json  "http://jks-ubuntu16-dev:2080/bms/ui/BMS/query/data/zmq/16901/FaultList"

#tab.8.name = Chiller
#tab.8.dataUrl = ${URL_PREFIX}/Chiller/query/data/zmq/${CHILLER_PORT}/EXPORT_DATA
#wget -O bms-tab-8-Chiller.reference.xml http://jks-ubuntu16-dev:2080/bms/ui/BMS/query/data/zmq/16951/EXPORT_DATA?xml
#wget -O bms-tab-8-Chiller.out.reference.json http://jks-ubuntu16-dev:2080/bms/ui/BMS/query/data/zmq/16951/EXPORT_DATA

#tab.9.name = Heaters
#tab.9.dataUrl = ${URL_PREFIX}/Heaters/query/data/zmq/${HEATERS_PORT}/EXPORT_DATA
#wget -O bms-tab-9-Heaters.reference.xml http://jks-ubuntu16-dev:2080/bms/ui/BMS/query/data/zmq/16952/EXPORT_DATA?xml
#wget -O bms-tab-9-Heaters.out.reference.json http://jks-ubuntu16-dev:2080/bms/ui/BMS/query/data/zmq/16952/EXPORT_DATA

#-----------------------------------------
#/var/www/device/c1-scu-a1.properties
#-----------------------------------------
#tab.1.name       = VEC
#wget -O c1-scu-a1-tab-1.reference.xml       "http://mordor/device/vec/data/c1-scu-a1/0?ti=4&hash=99999&xml"
#wget -O c1-scu-a1-tab-1.out.reference.json  "http://mordor/device/vec/data/c1-scu-a1/0?ti=4&hash=99999"

#tab.2.name       = Stack Control 1
#wget -O c1-scu-a1-tab-2.reference.xml       "http://mordor/device/vec/data/c1-scu-a1/1?ti=4&hash=99999&xml"
#wget -O c1-scu-a1-tab-2.out.reference.json  "http://mordor/device/vec/data/c1-scu-a1/1?ti=4&hash=99999"

#tab.3.name       = Sendyne
#wget -O c1-scu-a1-tab-3.reference.xml       "http://mordor/device/vec/data/c1-scu-a1/5?ti=4&hash=99999&xml"
#wget -O c1-scu-a1-tab-3.out.reference.json  "http://mordor/device/vec/data/c1-scu-a1/5?ti=4&hash=99999"


#-----------------------------------------
#/var/www/device/c1-scu-a2.properties
#-----------------------------------------
#tab.1.name       = VEC
#wget -O c1-scu-a2-tab-1.reference.xml       "http://mordor/device/vec/data/c1-scu-a2/0?ti=4&hash=99999&xml"
#wget -O c1-scu-a2-tab-1.out.reference.json  "http://mordor/device/vec/data/c1-scu-a2/0?ti=4&hash=99999"

#tab.2.name       = Stack Control 1
#wget -O c1-scu-a2-tab-2.reference.xml       "http://mordor/device/vec/data/c1-scu-a2/1?ti=4&hash=99999&xml"
#wget -O c1-scu-a2-tab-2.out.reference.json  "http://mordor/device/vec/data/c1-scu-a2/1?ti=4&hash=99999"

#tab.3.name       = Sendyne
#wget -O c1-scu-a2-tab-3.reference.xml       "http://mordor/device/vec/data/c1-scu-a2/5?ti=4&hash=99999&xml"
#wget -O c1-scu-a2-tab-3.out.reference.json  "http://mordor/device/vec/data/c1-scu-a2/5?ti=4&hash=99999"


#-----------------------------------------
#/var/www/device/c1-scu-b1.properties
#-----------------------------------------
#tab.1.name       = VEC
#wget -O c1-scu-b1-tab-1.reference.xml       "http://mordor/device/vec/data/c1-scu-b1/0?ti=4&hash=99999&xml"
#wget -O c1-scu-b1-tab-1.out.reference.json  "http://mordor/device/vec/data/c1-scu-b1/0?ti=4&hash=99999"

#tab.2.name       = Stack Control 1
#wget -O c1-scu-b1-tab-2.reference.xml       "http://mordor/device/vec/data/c1-scu-b1/1?ti=4&hash=99999&xml"
#wget -O c1-scu-b1-tab-2.out.reference.json  "http://mordor/device/vec/data/c1-scu-b1/1?ti=4&hash=99999"

#tab.3.name       = Sendyne
#wget -O c1-scu-b1-tab-3.reference.xml       "http://mordor/device/vec/data/c1-scu-b1/5?ti=4&hash=99999&xml"
#wget -O c1-scu-b1-tab-3.out.reference.json  "http://mordor/device/vec/data/c1-scu-b1/5?ti=4&hash=99999"


#-----------------------------------------
#/var/www/device/c1-scu-b2.properties
#-----------------------------------------
#tab.1.name       = VEC
#wget -O c1-scu-b2-tab-1.reference.xml       "http://mordor/device/vec/data/c1-scu-b2/0?ti=4&hash=99999&xml"
#wget -O c1-scu-b2-tab-1.out.reference.json  "http://mordor/device/vec/data/c1-scu-b2/0?ti=4&hash=99999"

#tab.2.name       = Stack Control 1
#wget -O c1-scu-b2-tab-2.reference.xml       "http://mordor/device/vec/data/c1-scu-b2/1?ti=4&hash=99999&xml"
#wget -O c1-scu-b2-tab-2.out.reference.json  "http://mordor/device/vec/data/c1-scu-b2/1?ti=4&hash=99999"

#tab.3.name       = Sendyne
#wget -O c1-scu-b2-tab-3.reference.xml       "http://mordor/device/vec/data/c1-scu-b2/5?ti=4&hash=99999&xml"
#wget -O c1-scu-b2-tab-3.out.reference.json  "http://mordor/device/vec/data/c1-scu-b2/5?ti=4&hash=99999"



#--------------------------------------------
#/var/www/device/c1-smu.properties (from php)
#--------------------------------------------
#tab.1.name       = VEC
#wget -O c1-smu-tab-1.reference.xml       "http://mordor/device/vec/data/c1-smu/0?ti=0&hash=99999&xml"
#wget -O c1-smu-tab-1.out.reference.json  "http://mordor/device/vec/data/c1-smu/0?ti=0&hash=99999"

#tab.2.name       = Sensor 1
#wget -O c1-smu-tab-2.reference.xml       "http://mordor/device/vec/data/c1-smu/1?ti=1&hash=99999&xml"
#wget -O c1-smu-tab-2.out.reference.json  "http://mordor/device/vec/data/c1-smu/1?ti=1&hash=99999"

#tab.3.name       = Sensor 2
#wget -O c1-smu-tab-3.reference.xml       "http://mordor/device/vec/data/c1-smu/2?ti=2&hash=99999&xml"
#wget -O c1-smu-tab-3.out.reference.json  "http://mordor/device/vec/data/c1-smu/2?ti=2&hash=99999"

#tab.4.name       = Sensor 3
#wget -O c1-smu-tab-4.reference.xml       "http://mordor/device/vec/data/c1-smu/3?ti=3&hash=99999&xml"
#wget -O c1-smu-tab-4.out.reference.json  "http://mordor/device/vec/data/c1-smu/3?ti=3&hash=99999"

#tab.5.name       = Pumps
#wget -O c1-smu-tab-5.reference.xml       "http://mordor/device/vec/data/c1-smu/6?ti=4&hash=99999&xml"
#wget -O c1-smu-tab-5.out.reference.json  "http://mordor/device/vec/data/c1-smu/6?ti=4&hash=99999"

#-----------------------------------------
#/var/www/device/c1-vcu.properties
#-----------------------------------------
#tab.1.name       = VEC
#wget -O c1-vcu-tab-1.reference.xml       "http://mordor/device/vec/data/c1-vcu/0?ti=4&hash=99999&xml"
#wget -O c1-vcu-tab-1.out.reference.json  "http://mordor/device/vec/data/c1-vcu/0?ti=4&hash=99999"

#tab.2.name       = Valve Control 1
#wget -O c1-vcu-tab-2.reference.xml       "http://mordor/device/vec/data/c1-vcu/1?ti=4&hash=99999&xml"
#wget -O c1-vcu-tab-2.out.reference.json  "http://mordor/device/vec/data/c1-vcu/1?ti=4&hash=99999"

#tab.3.name       = Valve Control 2
#wget -O c1-vcu-tab-3.reference.xml       "http://mordor/device/vec/data/c1-vcu/2?ti=4&hash=99999&xml"
#wget -O c1-vcu-tab-3.out.reference.json  "http://mordor/device/vec/data/c1-vcu/2?ti=4&hash=99999"

#tab.4.name       = Pumps
#wget -O c1-vcu-tab-4.reference.xml       "http://mordor/device/vec/data/c1-vcu/6?ti=4&hash=99999&xml"
#wget -O c1-vcu-tab-4.out.reference.json  "http://mordor/device/vec/data/c1-vcu/6?ti=4&hash=99999"


#-----------------------------------------
#/var/www/device/c2-scu-a1.properties
#-----------------------------------------
#tab.1.name       = VEC
#wget -O c2-scu-a1-tab-1.reference.xml       "http://mordor/device/vec/data/c2-scu-a1/0?ti=4&hash=99999&xml"
#wget -O c2-scu-a1-tab-1.out.reference.json  "http://mordor/device/vec/data/c2-scu-a1/0?ti=4&hash=99999"

#tab.2.name       = Stack Control 1
#wget -O c2-scu-a1-tab-2.reference.xml       "http://mordor/device/vec/data/c2-scu-a1/1?ti=4&hash=99999&xml"
#wget -O c2-scu-a1-tab-2.out.reference.json  "http://mordor/device/vec/data/c2-scu-a1/1?ti=4&hash=99999"

#tab.3.name       = Sendyne
#wget -O c2-scu-a1-tab-3.reference.xml       "http://mordor/device/vec/data/c2-scu-a1/5?ti=4&hash=99999&xml"
#wget -O c2-scu-a1-tab-3.out.reference.json  "http://mordor/device/vec/data/c2-scu-a1/5?ti=4&hash=99999"


#-----------------------------------------
#/var/www/device/c2-scu-a2.properties
#-----------------------------------------
#tab.1.name       = VEC
#wget -O c2-scu-a2-tab-1.reference.xml       "http://mordor/device/vec/data/c2-scu-a2/0?ti=4&hash=99999&xml"
#wget -O c2-scu-a2-tab-1.out.reference.json  "http://mordor/device/vec/data/c2-scu-a2/0?ti=4&hash=99999"

#tab.2.name       = Stack Control 1
#wget -O c2-scu-a2-tab-2.reference.xml       "http://mordor/device/vec/data/c2-scu-a2/1?ti=4&hash=99999&xml"
#wget -O c2-scu-a2-tab-2.out.reference.json  "http://mordor/device/vec/data/c2-scu-a2/1?ti=4&hash=99999"

#tab.3.name       = Sendyne
#wget -O c2-scu-a2-tab-3.reference.xml       "http://mordor/device/vec/data/c2-scu-a2/5?ti=4&hash=99999&xml"
#wget -O c2-scu-a2-tab-3.out.reference.json  "http://mordor/device/vec/data/c2-scu-a2/5?ti=4&hash=99999"


#-----------------------------------------
#/var/www/device/c2-scu-b1.properties
#-----------------------------------------
#tab.1.name       = VEC
#wget -O c2-scu-b1-tab-1.reference.xml       "http://mordor/device/vec/data/c2-scu-b1/0?ti=4&hash=99999&xml"
#wget -O c2-scu-b1-tab-1.out.reference.json  "http://mordor/device/vec/data/c2-scu-b1/0?ti=4&hash=99999"

#tab.2.name       = Stack Control 1
#wget -O c2-scu-b1-tab-2.reference.xml       "http://mordor/device/vec/data/c2-scu-b1/1?ti=4&hash=99999&xml"
#wget -O c2-scu-b1-tab-2.out.reference.json  "http://mordor/device/vec/data/c2-scu-b1/1?ti=4&hash=99999"

#tab.3.name       = Sendyne
#wget -O c2-scu-b1-tab-3.reference.xml       "http://mordor/device/vec/data/c2-scu-b1/0?ti=4&hash=99999&xml"
#wget -O c2-scu-b1-tab-3.out.reference.json  "http://mordor/device/vec/data/c2-scu-b1/0?ti=4&hash=99999"


#-----------------------------------------
#/var/www/device/c2-scu-b2.properties
#-----------------------------------------
#tab.1.name       = VEC
#wget -O c2-scu-b2-tab-1.reference.xml       "http://mordor/device/vec/data/c2-scu-b2/0?ti=4&hash=99999&xml"
#wget -O c2-scu-b2-tab-1.out.reference.json  "http://mordor/device/vec/data/c2-scu-b2/0?ti=4&hash=99999"

#tab.2.name       = Stack Control 1
#wget -O c2-scu-b2-tab-2.reference.xml       "http://mordor/device/vec/data/c2-scu-b2/1?ti=4&hash=99999&xml"
#wget -O c2-scu-b2-tab-2.out.reference.json  "http://mordor/device/vec/data/c2-scu-b2/1?ti=4&hash=99999"

#tab.3.name       = Sendyne
#wget -O c2-scu-b2-tab-3.reference.xml       "http://mordor/device/vec/data/c2-scu-b2/5?ti=4&hash=99999&xml"
#wget -O c2-scu-b2-tab-3.out.reference.json  "http://mordor/device/vec/data/c2-scu-b2/5?ti=4&hash=99999"


#-----------------------------------------
#/var/www/device/c2-smu.properties
#-----------------------------------------
#tab.1.name        = VEC
#wget -O c2-smu-tab-1.reference.xml       "http://mordor/device/vec/data/c2-smu/0?ti=4&hash=99999&xml"
#wget -O c2-smu-tab-1.out.reference.json  "http://mordor/device/vec/data/c2-smu/0?ti=4&hash=99999"

#tab.2.name        = Sensor 1
#wget -O c2-smu-tab-2.reference.xml       "http://mordor/device/vec/data/c2-smu/1?ti=4&hash=99999&xml"
#wget -O c2-smu-tab-2.out.reference.json  "http://mordor/device/vec/data/c2-smu/1?ti=4&hash=99999"

#tab.3.name        = Sensor 2
#wget -O c2-smu-tab-3.reference.xml       "http://mordor/device/vec/data/c2-smu/2?ti=4&hash=99999&xml"
#wget -O c2-smu-tab-3.out.reference.json  "http://mordor/device/vec/data/c2-smu/2?ti=4&hash=99999"

#tab.4.name        = Sensor 3
#wget -O c2-smu-tab-4.reference.xml       "http://mordor/device/vec/data/c2-smu/3?ti=4&hash=99999&xml"
#wget -O c2-smu-tab-4.out.reference.json  "http://mordor/device/vec/data/c2-smu/3?ti=4&hash=99999"

#tab.5.name        = Pumps
#wget -O c2-smu-tab-5.reference.xml       "http://mordor/device/vec/data/c2-smu/6?ti=4&hash=99999&xml"
#wget -O c2-smu-tab-5.out.reference.json  "http://mordor/device/vec/data/c2-smu/6?ti=4&hash=99999"


#-----------------------------------------
#/var/www/device/c2-vcu.properties
#-----------------------------------------
#tab.1.name       = VEC
#wget -O c2-vcu-tab-1.reference.xml       "http://mordor/device/vec/data/c2-vcu/0?ti=4&hash=99999&xml"
#wget -O c2-vcu-tab-1.out.reference.json  "http://mordor/device/vec/data/c2-vcu/0?ti=4&hash=99999"

#tab.2.name       = Valve Control 1
#wget -O c2-vcu-tab-2.reference.xml       "http://mordor/device/vec/data/c2-vcu/1?ti=4&hash=99999&xml"
#wget -O c2-vcu-tab-2.out.reference.json  "http://mordor/device/vec/data/c2-vcu/1?ti=4&hash=99999"

#tab.3.name       = Valve Control 2
#wget -O c2-vcu-tab-3.reference.xml       "http://mordor/device/vec/data/c2-vcu/2?ti=4&hash=99999&xml"
#wget -O c2-vcu-tab-3.out.reference.json  "http://mordor/device/vec/data/c2-vcu/2?ti=4&hash=99999"

#tab.4.name       = Pumps
#wget -O c2-vcu-tab-4.reference.xml       "http://mordor/device/vec/data/c2-vcu/6?ti=4&hash=99999&xml"
#wget -O c2-vcu-tab-4.out.reference.json  "http://mordor/device/vec/data/c2-vcu/6?ti=4&hash=99999"



