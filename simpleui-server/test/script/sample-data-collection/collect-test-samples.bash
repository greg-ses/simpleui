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
#wget -O bms-tab-7-FaultList.reference.xml http://jks-ubuntu16-dev:2080/bms/ui/BMS/query/data/zmq/16901/FaultList?xml
#wget -O bms-tab-7-FaultList.out.reference.json http://jks-ubuntu16-dev:2080/bms/ui/BMS/query/data/zmq/16901/FaultList

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
#tab.1.dataUrl    = ${URL_PREFIX}/VEC/query/data/zmq/${ZMQ_PORT}/EXPORT_DATA
#wget -O c1-scu-a1-tab-1.reference.xml       http://jks-ubuntu16-dev:2080/device/c1-scu-a1/VEC/query/data/zmq/24010/EXPORT_DATA?xml
#wget -O c1-scu-a1-tab-1.out.reference.json  http://jks-ubuntu16-dev:2080/device/c1-scu-a1/VEC/query/data/zmq/24010/EXPORT_DATA

#tab.2.name       = Stack Control 1
#tab.2.dataUrl    = ${URL_PREFIX}/Stack-Control-1/query/data/zmq/${ZMQ_PORT}/EXPORT_DATA
#wget -O c1-scu-a1-tab-2.reference.xml       http://jks-ubuntu16-dev:2080/device/c1-scu-a1/Stack-Control-1/query/data/zmq/24011/EXPORT_DATA?xml
#wget -O c1-scu-a1-tab-2.out.reference.json  http://jks-ubuntu16-dev:2080/device/c1-scu-a1/Stack-Control-1/query/data/zmq/24011/EXPORT_DATA

#tab.3.name       = Sendyne
#tab.3.dataUrl    = ${URL_PREFIX}/Sendyne/query/data/zmq/${ZMQ_PORT}/EXPORT_DATA
#wget -O c1-scu-a1-tab-3.reference.xml       http://jks-ubuntu16-dev:2080/device/c1-scu-a1/Sendyne/query/data/zmq/24015/EXPORT_DATA?xml
#wget -O c1-scu-a1-tab-3.out.reference.json  http://jks-ubuntu16-dev:2080/device/c1-scu-a1/Sendyne/query/data/zmq/24015/EXPORT_DATA


#-----------------------------------------
#/var/www/device/c1-scu-a2.properties
#-----------------------------------------
#tab.1.name       = VEC
#tab.1.dataUrl    = ${URL_PREFIX}/VEC/query/data/zmq/${ZMQ_PORT}/EXPORT_DATA
#wget -O c1-scu-a2-tab-1.reference.xml       http://jks-ubuntu16-dev:2080/device/c1-scu-a2/VEC/query/data/zmq/24020/EXPORT_DATA?xml
#wget -O c1-scu-a2-tab-1.out.reference.json  http://jks-ubuntu16-dev:2080/device/c1-scu-a2/VEC/query/data/zmq/24020/EXPORT_DATA

#tab.2.name       = Stack Control 1
#tab.2.dataUrl    = ${URL_PREFIX}/Stack-Control-1/query/data/zmq/${ZMQ_PORT}/EXPORT_DATA
#wget -O c1-scu-a2-tab-2.reference.xml       http://jks-ubuntu16-dev:2080/device/c1-scu-a2/Stack-Control-1/query/data/zmq/24021/EXPORT_DATA?xml
#wget -O c1-scu-a2-tab-2.out.reference.json  http://jks-ubuntu16-dev:2080/device/c1-scu-a2/Stack-Control-1/query/data/zmq/24021/EXPORT_DATA

#tab.3.name       = Sendyne
#tab.3.dataUrl    = ${URL_PREFIX}/Sendyne/query/data/zmq/${ZMQ_PORT}/EXPORT_DATA
#wget -O c1-scu-a2-tab-3.reference.xml       http://jks-ubuntu16-dev:2080/device/c1-scu-a2/Sendyne/query/data/zmq/24025/EXPORT_DATA?xml
#wget -O c1-scu-a2-tab-3.out.reference.json  http://jks-ubuntu16-dev:2080/device/c1-scu-a2/Sendyne/query/data/zmq/24025/EXPORT_DATA


#-----------------------------------------
#/var/www/device/c1-scu-b1.properties
#-----------------------------------------
#tab.1.name       = VEC
#tab.1.dataUrl    = ${URL_PREFIX}/VEC/query/data/zmq/${ZMQ_PORT}/EXPORT_DATA
#wget -O c1-scu-b1-tab-1.reference.xml       http://jks-ubuntu16-dev:2080/device/c1-scu-b1/VEC/query/data/zmq/24030/EXPORT_DATA?xml
#wget -O c1-scu-b1-tab-1.out.reference.json  http://jks-ubuntu16-dev:2080/device/c1-scu-b1/VEC/query/data/zmq/24030/EXPORT_DATA

#tab.2.name       = Stack Control 1
#tab.2.dataUrl    = ${URL_PREFIX}/Stack-Control-1/query/data/zmq/${ZMQ_PORT}/EXPORT_DATA
#wget -O c1-scu-b1-tab-2.reference.xml       http://jks-ubuntu16-dev:2080/device/c1-scu-b1/Stack-Control-1/query/data/zmq/24031/EXPORT_DATA?xml
#wget -O c1-scu-b1-tab-2.out.reference.json  http://jks-ubuntu16-dev:2080/device/c1-scu-b1/Stack-Control-1/query/data/zmq/24031/EXPORT_DATA

#tab.3.name       = Sendyne
#tab.3.dataUrl    = ${URL_PREFIX}/Sendyne/query/data/zmq/${ZMQ_PORT}/EXPORT_DATA
#wget -O c1-scu-b1-tab-3.reference.xml       http://jks-ubuntu16-dev:2080/device/c1-scu-b1/Sendyne/query/data/zmq/24035/EXPORT_DATA?xml
#wget -O c1-scu-b1-tab-3.out.reference.json  http://jks-ubuntu16-dev:2080/device/c1-scu-b1/Sendyne/query/data/zmq/24035/EXPORT_DATA


#-----------------------------------------
#/var/www/device/c1-scu-b2.properties
#-----------------------------------------
#tab.1.name       = VEC
#tab.1.dataUrl    = ${URL_PREFIX}/VEC/query/data/zmq/${ZMQ_PORT}/EXPORT_DATA
#wget -O c1-scu-b2-tab-1.reference.xml       http://jks-ubuntu16-dev:2080/device/c1-scu-b2/VEC/query/data/zmq/24040/EXPORT_DATA?xml
#wget -O c1-scu-b2-tab-1.out.reference.json  http://jks-ubuntu16-dev:2080/device/c1-scu-b2/VEC/query/data/zmq/24040/EXPORT_DATA

#tab.2.name       = Stack Control 1
#tab.2.dataUrl    = ${URL_PREFIX}/Stack-Control-1/query/data/zmq/${ZMQ_PORT}/EXPORT_DATA
#wget -O c1-scu-b2-tab-2.reference.xml       http://jks-ubuntu16-dev:2080/device/c1-scu-b2/Stack-Control-1/query/data/zmq/24041/EXPORT_DATA?xml
#wget -O c1-scu-b2-tab-2.out.reference.json  http://jks-ubuntu16-dev:2080/device/c1-scu-b2/Stack-Control-1/query/data/zmq/24041/EXPORT_DATA

#tab.3.name       = Sendyne
#tab.3.dataUrl    = ${URL_PREFIX}/Sendyne/query/data/zmq/${ZMQ_PORT}/EXPORT_DATA
#wget -O c1-scu-b2-tab-3.reference.xml       http://jks-ubuntu16-dev:2080/device/c1-scu-b2/Sendyne/query/data/zmq/24045/EXPORT_DATA?xml
#wget -O c1-scu-b2-tab-3.out.reference.json  http://jks-ubuntu16-dev:2080/device/c1-scu-b2/Sendyne/query/data/zmq/24045/EXPORT_DATA


#-----------------------------------------
#/var/www/device/c1-smu.properties
#-----------------------------------------`
#tab.1.name       = VEC
#tab.1.dataUrl    = ${URL_PREFIX}/VEC/query/data/zmq/${ZMQ_PORT}/EXPORT_DATA
#wget -O c1-smu-tab-1.reference.xml       http://jks-ubuntu16-dev:2080/device/c1-smu/VEC/query/data/zmq/24060/EXPORT_DATA?xml
#wget -O c1-smu-tab-1.out.reference.json  http://jks-ubuntu16-dev:2080/device/c1-smu/VEC/query/data/zmq/24060/EXPORT_DATA

#tab.2.name       = Sensor 1
#tab.2.dataUrl    = ${URL_PREFIX}/Sensor-1/query/data/zmq/${ZMQ_PORT}/EXPORT_DATA
#wget -O c1-smu-tab-2.reference.xml       http://jks-ubuntu16-dev:2080/device/c1-smu/Sensor-1/query/data/zmq/24061/EXPORT_DATA?xml
#wget -O c1-smu-tab-2.out.reference.json  http://jks-ubuntu16-dev:2080/device/c1-smu/Sensor-1/query/data/zmq/24061/EXPORT_DATA

#tab.3.name       = Sensor 2
#tab.3.dataUrl    = ${URL_PREFIX}/Sensor-2/query/data/zmq/${ZMQ_PORT}/EXPORT_DATA
#wget -O c1-smu-tab-3.reference.xml       http://jks-ubuntu16-dev:2080/device/c1-smu/Sensor-2/query/data/zmq/24062/EXPORT_DATA?xml
#wget -O c1-smu-tab-3.out.reference.json  http://jks-ubuntu16-dev:2080/device/c1-smu/Sensor-2/query/data/zmq/24062/EXPORT_DATA

#tab.4.name       = Sensor 3
#tab.4.dataUrl    = ${URL_PREFIX}/Sensor-3/query/data/zmq/${ZMQ_PORT}/EXPORT_DATA
#wget -O c1-smu-tab-4.reference.xml       http://jks-ubuntu16-dev:2080/device/c1-smu/Sensor-3/query/data/zmq/24063/EXPORT_DATA?xml
#wget -O c1-smu-tab-4.out.reference.json  http://jks-ubuntu16-dev:2080/device/c1-smu/Sensor-3/query/data/zmq/24063/EXPORT_DATA

#tab.5.name       = Pumps
#tab.5.dataUrl    = ${URL_PREFIX}/Pumps/query/data/zmq/${ZMQ_PORT}/EXPORT_DATA
#wget -O c1-smu-tab-5.reference.xml       http://jks-ubuntu16-dev:2080/device/c1-smu/Pumps/query/data/zmq/24066/EXPORT_DATA?xml
#wget -O c1-smu-tab-5.out.reference.json  http://jks-ubuntu16-dev:2080/device/c1-smu/Pumps/query/data/zmq/24066/EXPORT_DATA


#-----------------------------------------
#/var/www/device/c1-vcu.properties
#-----------------------------------------
#tab.1.name       = VEC
#tab.1.dataUrl    = ${URL_PREFIX}/VEC/query/data/zmq/${ZMQ_PORT}/EXPORT_DATA
#wget -O c1-vcu-tab-1.reference.xml       http://jks-ubuntu16-dev:2080/device/c1-vcu/VEC/query/data/zmq/24050/EXPORT_DATA?xml
#wget -O c1-vcu-tab-1.out.reference.json  http://jks-ubuntu16-dev:2080/device/c1-vcu/VEC/query/data/zmq/24050/EXPORT_DATA

#tab.2.name       = Valve Control 1
#tab.2.dataUrl    = ${URL_PREFIX}/Valve-Control-1/query/data/zmq/${ZMQ_PORT}/EXPORT_DATA
#wget -O c1-vcu-tab-2.reference.xml       http://jks-ubuntu16-dev:2080/device/c1-vcu/Valve-Control-1/query/data/zmq/24051/EXPORT_DATA?xml
#wget -O c1-vcu-tab-2.out.reference.json  http://jks-ubuntu16-dev:2080/device/c1-vcu/Valve-Control-1/query/data/zmq/24051/EXPORT_DATA

#tab.3.name       = Valve Control 2
#tab.3.dataUrl    = ${URL_PREFIX}/Valve-Control-2/query/data/zmq/${ZMQ_PORT}/EXPORT_DATA
#wget -O c1-vcu-tab-3.reference.xml       http://jks-ubuntu16-dev:2080/device/c1-vcu/Valve-Control-2/query/data/zmq/24052/EXPORT_DATA?xml
#wget -O c1-vcu-tab-3.out.reference.json  http://jks-ubuntu16-dev:2080/device/c1-vcu/Valve-Control-2/query/data/zmq/24052/EXPORT_DATA

#tab.4.name       = Pumps
#tab.4.dataUrl    = ${URL_PREFIX}/Pumps/query/data/zmq/${ZMQ_PORT}/EXPORT_DATA
#wget -O c1-vcu-tab-4.reference.xml       http://jks-ubuntu16-dev:2080/device/c1-vcu/Pumps/query/data/zmq/24056/EXPORT_DATA?xml
#wget -O c1-vcu-tab-4.out.reference.json  http://jks-ubuntu16-dev:2080/device/c1-vcu/Pumps/query/data/zmq/24056/EXPORT_DATA


#-----------------------------------------
#/var/www/device/c2-scu-a1.properties
#-----------------------------------------
#tab.1.name       = VEC
#tab.1.dataUrl    = ${URL_PREFIX}/VEC/query/data/zmq/${ZMQ_PORT}/EXPORT_DATA
#wget -O c2-scu-a1-tab-1.reference.xml       http://jks-ubuntu16-dev:2080/device/c2-scu-a1/VEC/query/data/zmq/24070/EXPORT_DATA?xml
#wget -O c2-scu-a1-tab-1.out.reference.json  http://jks-ubuntu16-dev:2080/device/c2-scu-a1/VEC/query/data/zmq/24070/EXPORT_DATA

#tab.2.name       = Stack Control 1
#tab.2.dataUrl    = ${URL_PREFIX}/Stack-Control-1/query/data/zmq/${ZMQ_PORT}/EXPORT_DATA
#wget -O c2-scu-a1-tab-2.reference.xml       http://jks-ubuntu16-dev:2080/device/c2-scu-a1/Stack-Control-1/query/data/zmq/24071/EXPORT_DATA?xml
#wget -O c2-scu-a1-tab-2.out.reference.json  http://jks-ubuntu16-dev:2080/device/c2-scu-a1/Stack-Control-1/query/data/zmq/24071/EXPORT_DATA

#tab.3.name       = Sendyne
#tab.3.dataUrl    = ${URL_PREFIX}/Sendyne/query/data/zmq/${ZMQ_PORT}/EXPORT_DATA
#wget -O c2-scu-a1-tab-3.reference.xml       http://jks-ubuntu16-dev:2080/device/c2-scu-a1/Sendyne/query/data/zmq/24075/EXPORT_DATA?xml
#wget -O c2-scu-a1-tab-3.out.reference.json  http://jks-ubuntu16-dev:2080/device/c2-scu-a1/Sendyne/query/data/zmq/24075/EXPORT_DATA


#-----------------------------------------
#/var/www/device/c2-scu-a2.properties
#-----------------------------------------
#tab.1.name       = VEC
#tab.1.dataUrl    = ${URL_PREFIX}/VEC/query/data/zmq/${ZMQ_PORT}/EXPORT_DATA
#wget -O c2-scu-a2-tab-1.reference.xml       http://jks-ubuntu16-dev:2080/device/c2-scu-a2/VEC/query/data/zmq/24080/EXPORT_DATA?xml
#wget -O c2-scu-a2-tab-1.out.reference.json  http://jks-ubuntu16-dev:2080/device/c2-scu-a2/VEC/query/data/zmq/24080/EXPORT_DATA

#tab.2.name       = Stack Control 1
#tab.2.dataUrl    = ${URL_PREFIX}/Stack-Control-1/query/data/zmq/${ZMQ_PORT}/EXPORT_DATA
#wget -O c2-scu-a2-tab-2.reference.xml       http://jks-ubuntu16-dev:2080/device/c2-scu-a2/Stack-Control-1/query/data/zmq/24081/EXPORT_DATA?xml
#wget -O c2-scu-a2-tab-2.out.reference.json  http://jks-ubuntu16-dev:2080/device/c2-scu-a2/Stack-Control-1/query/data/zmq/24081/EXPORT_DATA

#tab.3.name       = Sendyne
#tab.3.dataUrl    = ${URL_PREFIX}/Sendyne/query/data/zmq/${ZMQ_PORT}/EXPORT_DATA
#wget -O c2-scu-a2-tab-3.reference.xml       http://jks-ubuntu16-dev:2080/device/c2-scu-a2/Sendyne/query/data/zmq/24085/EXPORT_DATA?xml
#wget -O c2-scu-a2-tab-3.out.reference.json  http://jks-ubuntu16-dev:2080/device/c2-scu-a2/Sendyne/query/data/zmq/24085/EXPORT_DATA


#-----------------------------------------
#/var/www/device/c2-scu-b1.properties
#-----------------------------------------
#tab.1.name       = VEC
#tab.1.dataUrl    = ${URL_PREFIX}/VEC/query/data/zmq/${ZMQ_PORT}/EXPORT_DATA
#wget -O c2-scu-b1-tab-1.reference.xml       http://jks-ubuntu16-dev:2080/device/c2-scu-b1/VEC/query/data/zmq/24090/EXPORT_DATA?xml
#wget -O c2-scu-b1-tab-1.out.reference.json  http://jks-ubuntu16-dev:2080/device/c2-scu-b1/VEC/query/data/zmq/24090/EXPORT_DATA

#tab.2.name       = Stack Control 1
#tab.2.dataUrl    = ${URL_PREFIX}/Stack-Control-1/query/data/zmq/${ZMQ_PORT}/EXPORT_DATA
#wget -O c2-scu-b1-tab-2.reference.xml       http://jks-ubuntu16-dev:2080/device/c2-scu-b1/Stack-Control-1/query/data/zmq/24091/EXPORT_DATA?xml
#wget -O c2-scu-b1-tab-2.out.reference.json  http://jks-ubuntu16-dev:2080/device/c2-scu-b1/Stack-Control-1/query/data/zmq/24091/EXPORT_DATA

#tab.3.name       = Sendyne
#tab.3.dataUrl    = ${URL_PREFIX}/Sendyne/query/data/zmq/${ZMQ_PORT}/EXPORT_DATA
#wget -O c2-scu-b1-tab-3.reference.xml       http://jks-ubuntu16-dev:2080/device/c2-scu-b1/Sendyne/query/data/zmq/24090/EXPORT_DATA?xml
#wget -O c2-scu-b1-tab-3.out.reference.json  http://jks-ubuntu16-dev:2080/device/c2-scu-b1/Sendyne/query/data/zmq/24090/EXPORT_DATA


#-----------------------------------------
#/var/www/device/c2-scu-b2.properties
#-----------------------------------------
#tab.1.name       = VEC
#tab.1.dataUrl    = ${URL_PREFIX}/VEC/query/data/zmq/${ZMQ_PORT}/EXPORT_DATA
#wget -O c2-scu-b2-tab-1.reference.xml       http://jks-ubuntu16-dev:2080/device/c2-scu-b2/VEC/query/data/zmq/24100/EXPORT_DATA?xml
#wget -O c2-scu-b2-tab-1.out.reference.json  http://jks-ubuntu16-dev:2080/device/c2-scu-b2/VEC/query/data/zmq/24100/EXPORT_DATA

#tab.2.name       = Stack Control 1
#tab.2.dataUrl    = ${URL_PREFIX}/Stack-Control-1/query/data/zmq/${ZMQ_PORT}/EXPORT_DATA
#wget -O c2-scu-b2-tab-2.reference.xml       http://jks-ubuntu16-dev:2080/device/c2-scu-b2/Stack-Control-1/query/data/zmq/24101/EXPORT_DATA?xml
#wget -O c2-scu-b2-tab-2.out.reference.json  http://jks-ubuntu16-dev:2080/device/c2-scu-b2/Stack-Control-1/query/data/zmq/24101/EXPORT_DATA

#tab.3.name       = Sendyne
#tab.3.dataUrl    = ${URL_PREFIX}/Sendyne/query/data/zmq/${ZMQ_PORT}/EXPORT_DATA
#wget -O c2-scu-b2-tab-3.reference.xml       http://jks-ubuntu16-dev:2080/device/c2-scu-b2/Sendyne/query/data/zmq/24105/EXPORT_DATA?xml
#wget -O c2-scu-b2-tab-3.out.reference.json  http://jks-ubuntu16-dev:2080/device/c2-scu-b2/Sendyne/query/data/zmq/24105/EXPORT_DATA


#-----------------------------------------
#/var/www/device/c2-smu.properties
#-----------------------------------------
#tab.1.name        = VEC
#tab.1.dataUrl     = ${URL_PREFIX}/VEC/query/data/zmq/${ZMQ_PORT}/EXPORT_DATA
#wget -O c2-smu-tab-1.reference.xml       http://jks-ubuntu16-dev:2080/device/c2-smu/VEC/query/data/zmq/24120/EXPORT_DATA?xml
#wget -O c2-smu-tab-1.out.reference.json  http://jks-ubuntu16-dev:2080/device/c2-smu/VEC/query/data/zmq/24120/EXPORT_DATA

#tab.2.name        = Sensor 1
#tab.2.dataUrl     = ${URL_PREFIX}/Sensor-1/query/data/zmq/${ZMQ_PORT}/EXPORT_DATA
#wget -O c2-smu-tab-2.reference.xml       http://jks-ubuntu16-dev:2080/device/c2-smu/Sensor-1/query/data/zmq/24121/EXPORT_DATA?xml
#wget -O c2-smu-tab-2.out.reference.json  http://jks-ubuntu16-dev:2080/device/c2-smu/Sensor-1/query/data/zmq/24121/EXPORT_DATA

#tab.3.name        = Sensor 2
#tab.3.dataUrl     = ${URL_PREFIX}/Sensor-2/query/data/zmq/${ZMQ_PORT}/EXPORT_DATA
#wget -O c2-smu-tab-3.reference.xml       http://jks-ubuntu16-dev:2080/device/c2-smu/Sensor-2/query/data/zmq/24122/EXPORT_DATA?xml
#wget -O c2-smu-tab-3.out.reference.json  http://jks-ubuntu16-dev:2080/device/c2-smu/Sensor-2/query/data/zmq/24122/EXPORT_DATA

#tab.4.name        = Sensor 3
#tab.4.dataUrl     = ${URL_PREFIX}/Sensor-3/query/data/zmq/${ZMQ_PORT}/EXPORT_DATA
#wget -O c2-smu-tab-4.reference.xml       http://jks-ubuntu16-dev:2080/device/c2-smu/Sensor-3/query/data/zmq/24123/EXPORT_DATA?xml
#wget -O c2-smu-tab-4.out.reference.json  http://jks-ubuntu16-dev:2080/device/c2-smu/Sensor-3/query/data/zmq/24123/EXPORT_DATA

#tab.5.name        = Pumps
#tab.5.dataUrl     = ${URL_PREFIX}/Pumps/query/data/zmq/${ZMQ_PORT}/EXPORT_DATA
#wget -O c2-smu-tab-5.reference.xml       http://jks-ubuntu16-dev:2080/device/c2-smu/Pumps/query/data/zmq/24126/EXPORT_DATA?xml
#wget -O c2-smu-tab-5.out.reference.json  http://jks-ubuntu16-dev:2080/device/c2-smu/Pumps/query/data/zmq/24126/EXPORT_DATA


#-----------------------------------------
#/var/www/device/c2-vcu.properties
#-----------------------------------------
#tab.1.name       = VEC
#tab.1.dataUrl    = ${URL_PREFIX}/VEC/query/data/zmq/${ZMQ_PORT}/EXPORT_DATA
#wget -O c2-vcu-tab-1.reference.xml       http://jks-ubuntu16-dev:2080/device/c2-vcu/VEC/query/data/zmq/24110/EXPORT_DATA?xml
#wget -O c2-vcu-tab-1.out.reference.json  http://jks-ubuntu16-dev:2080/device/c2-vcu/VEC/query/data/zmq/24110/EXPORT_DATA

#tab.2.name       = Valve Control 1
#tab.2.dataUrl    = ${URL_PREFIX}/Valve-Control-1/query/data/zmq/${ZMQ_PORT}/EXPORT_DATA
#wget -O c2-vcu-tab-2.reference.xml       http://jks-ubuntu16-dev:2080/device/c2-vcu/Valve-Control-1/query/data/zmq/24111/EXPORT_DATA?xml
#wget -O c2-vcu-tab-2.out.reference.json  http://jks-ubuntu16-dev:2080/device/c2-vcu/Valve-Control-1/query/data/zmq/24111/EXPORT_DATA

#tab.3.name       = Valve Control 2
#tab.3.dataUrl    = ${URL_PREFIX}/Valve-Control-2/query/data/zmq/${ZMQ_PORT}/EXPORT_DATA
#wget -O c2-vcu-tab-3.reference.xml       http://jks-ubuntu16-dev:2080/device/c2-vcu/Valve-Control-2/query/data/zmq/24112/EXPORT_DATA?xml
#wget -O c2-vcu-tab-3.out.reference.json  http://jks-ubuntu16-dev:2080/device/c2-vcu/Valve-Control-2/query/data/zmq/24112/EXPORT_DATA

#tab.4.name       = Pumps
#tab.4.dataUrl    = ${URL_PREFIX}/Pumps/query/data/zmq/${ZMQ_PORT}/EXPORT_DATA
#wget -O c2-vcu-tab-4.reference.xml       http://jks-ubuntu16-dev:2080/device/c2-vcu/Pumps/query/data/zmq/24116/EXPORT_DATA?xml
#wget -O c2-vcu-tab-4.out.reference.json  http://jks-ubuntu16-dev:2080/device/c2-vcu/Pumps/query/data/zmq/24116/EXPORT_DATA




#-----------------------------------------
#/var/www/SimVNX1000Server/ui.properties
#-----------------------------------------
#tab.1.name        = Battery
#tab.1.dataUrl     = ${URL_PREFIX}/Battery/query/data/zmq/${BATTMODEL_PORT}/EXPORT_DATA
#wget -O SimVNX1000Server-tab-1.reference.xml       http://jks-ubuntu16-dev:2080/SimVNX1000Server/ui/Battery/query/data/zmq/17912/EXPORT_DATA?xml
#wget -O SimVNX1000Server-tab-1.out.reference.json  http://jks-ubuntu16-dev:2080/SimVNX1000Server/ui/Battery/query/data/zmq/17912/EXPORT_DATA

#tab.2.name        = VEC Devices
#tab.2.dataUrl     = ${URL_PREFIX}/VEC-Devices/query/data/zmq/${VEC_PORT}/EXPORT_DATA
#wget -O SimVNX1000Server-tab-2.reference.xml       http://jks-ubuntu16-dev:2080/SimVNX1000Server/ui/VEC-Devices/query/data/zmq/17913/EXPORT_DATA?xml
#wget -O SimVNX1000Server-tab-2.out.reference.json  http://jks-ubuntu16-dev:2080/SimVNX1000Server/ui/VEC-Devices/query/data/zmq/17913/EXPORT_DATA

#tab.3.name        = VCU
#tab.3.dataUrl     = ${URL_PREFIX}/VCU/query/data/zmq/${VCU_PORT}/EXPORT_DATA
#wget -O SimVNX1000Server-tab-3.reference.xml       http://jks-ubuntu16-dev:2080/SimVNX1000Server/ui/VCU/query/data/zmq/17915/EXPORT_DATA?xml
#wget -O SimVNX1000Server-tab-3.out.reference.json  http://jks-ubuntu16-dev:2080/SimVNX1000Server/ui/VCU/query/data/zmq/17915/EXPORT_DATA

#tab.4.name        = SCU
#tab.4.dataUrl     = ${URL_PREFIX}/SCU/query/data/zmq/${SCU_PORT}/EXPORT_DATA
#wget -O SimVNX1000Server-tab-4.reference.xml       http://jks-ubuntu16-dev:2080/SimVNX1000Server/ui/SCU/query/data/zmq/17914/EXPORT_DATA?xml
#wget -O SimVNX1000Server-tab-4.out.reference.json  http://jks-ubuntu16-dev:2080/SimVNX1000Server/ui/SCU/query/data/zmq/17914/EXPORT_DATA

#tab.5.name        = SMU
#tab.5.dataUrl     = ${URL_PREFIX}/SMU/query/data/zmq/${SMU_PORT}/EXPORT_DATA
#wget -O SimVNX1000Server-tab-5.reference.xml       http://jks-ubuntu16-dev:2080/SimVNX1000Server/ui/SMU/query/data/zmq/17916/EXPORT_DATA?xml
#wget -O SimVNX1000Server-tab-5.out.reference.json  http://jks-ubuntu16-dev:2080/SimVNX1000Server/ui/SMU/query/data/zmq/17916/EXPORT_DATA

#tab.6.name        = Pump Simulation
#tab.6.dataUrl     = ${URL_PREFIX}/Pump-Simulation/query/data/zmq/${PUMPSIM_PORT}/EXPORT_DATA
#wget -O SimVNX1000Server-tab-6.reference.xml       http://jks-ubuntu16-dev:2080/SimVNX1000Server/ui/Pump-Simulation/query/data/zmq/17902/EXPORT_DATA?xml
#wget -O SimVNX1000Server-tab-6.out.reference.json  http://jks-ubuntu16-dev:2080/SimVNX1000Server/ui/Pump-Simulation/query/data/zmq/17902/EXPORT_DATA

#tab.7.name        = Sendyne
#tab.7.dataUrl     = ${URL_PREFIX}/Sendyne/query/data/zmq/${SENDYNE_PORT}/EXPORT_DATA
#wget -O SimVNX1000Server-tab-7.reference.xml       http://jks-ubuntu16-dev:2080/SimVNX1000Server/ui/Sendyne/query/data/zmq/17917/EXPORT_DATA?xml
#wget -O SimVNX1000Server-tab-7.out.reference.json  http://jks-ubuntu16-dev:2080/SimVNX1000Server/ui/Sendyne/query/data/zmq/17917/EXPORT_DATA

#tab.8.name        = Chiller Simulation
#tab.8.dataUrl     = ${URL_PREFIX}/Chiller-Simulation/query/data/zmq/${CHILLERSIM_PORT}/EXPORT_DATA
#wget -O SimVNX1000Server-tab-8.reference.xml       http://jks-ubuntu16-dev:2080/SimVNX1000Server/ui/Chiller-Simulation/query/data/zmq/17903/EXPORT_DATA?xml
#wget -O SimVNX1000Server-tab-8.out.reference.json  http://jks-ubuntu16-dev:2080/SimVNX1000Server/ui/Chiller-Simulation/query/data/zmq/17903/EXPORT_DATA

#tab.9.name       = Heaters Simulation
#tab.9.dataUrl    = ${URL_PREFIX}/Heaters-Simulation/query/data/zmq/${WATLOWSIM_PORT}/EXPORT_DATA
#wget -O SimVNX1000Server-tab-9.reference.xml       http://jks-ubuntu16-dev:2080/SimVNX1000Server/ui/Heaters-Simulation/query/data/zmq/17904/EXPORT_DATA?xml
#wget -O SimVNX1000Server-tab-9.out.reference.json  http://jks-ubuntu16-dev:2080/SimVNX1000Server/ui/Heaters-Simulation/query/data/zmq/17904/EXPORT_DATA

