#!/bin/bash

case "$1" in
  "siteshir")
  ;;
  "1MW_10hr")
  ;;
  *)
    echo "You have failed to specify a correct configuration type.  <Site name: siteshir | 1MW_10hr> : "
    exit 1
    ;;
esac

rm -f *.png
rm -f *.gif

case "$1" in
  "siteshir")
  cp source_images/overlay-siteshir.png overlay.png
  ;;
  "1MW_10hr")
  cp source_images/overlay.png overlay.png
  ;;
  *) # unknown input
  printf "\nERROR - invalid value: %s \n" "$1"
  exit 1
  ;;
esac


cp source_images/2-way-valve-vertical.transit0.gif CV102_Supply.Does_Not_Exist.gif
cp source_images/2-way-valve-vertical.open.gif CV102_Supply.Open.gif
cp source_images/2-way-valve-vertical.closed.gif CV102_Supply.Closed.gif
cp source_images/2-way-valve-vertical.transit.gif CV102_Supply.Transit.gif
cp source_images/2-way-valve-vertical-right.transit0.gif CV112_Return.Does_Not_Exist.gif
cp source_images/2-way-valve-vertical-right.open.gif CV112_Return.Open.gif
cp source_images/2-way-valve-vertical-right.closed.gif CV112_Return.Closed.gif
cp source_images/2-way-valve-vertical-right.transit.gif CV112_Return.Transit.gif
cp source_images/2-way-valve-vertical.transit0.gif CV103_Supply.Does_Not_Exist.gif
cp source_images/2-way-valve-vertical.open.gif CV103_Supply.Open.gif
cp source_images/2-way-valve-vertical.closed.gif CV103_Supply.Closed.gif
cp source_images/2-way-valve-vertical.transit.gif CV103_Supply.Transit.gif
cp source_images/2-way-valve-vertical-right.transit0.gif CV113_Return.Does_Not_Exist.gif
cp source_images/2-way-valve-vertical-right.open.gif CV113_Return.Open.gif
cp source_images/2-way-valve-vertical-right.closed.gif CV113_Return.Closed.gif
cp source_images/2-way-valve-vertical-right.transit.gif CV113_Return.Transit.gif
cp source_images/2-way-valve-vertical.transit0.gif CV104_Supply.Does_Not_Exist.gif
cp source_images/2-way-valve-vertical.open.gif CV104_Supply.Open.gif
cp source_images/2-way-valve-vertical.closed.gif CV104_Supply.Closed.gif
cp source_images/2-way-valve-vertical.transit.gif CV104_Supply.Transit.gif
cp source_images/2-way-valve-vertical-right.transit0.gif CV114_Return.Does_Not_Exist.gif
cp source_images/2-way-valve-vertical-right.open.gif CV114_Return.Open.gif
cp source_images/2-way-valve-vertical-right.closed.gif CV114_Return.Closed.gif
cp source_images/2-way-valve-vertical-right.transit.gif CV114_Return.Transit.gif


cp source_images/2-way-valve-vertical-right.transit0.gif CV202_Supply.Does_Not_Exist.gif
cp source_images/2-way-valve-vertical-right.open.gif CV202_Supply.Open.gif
cp source_images/2-way-valve-vertical-right.closed.gif CV202_Supply.Closed.gif
cp source_images/2-way-valve-vertical-right.transit.gif CV202_Supply.Transit.gif
cp source_images/2-way-valve-vertical.transit0.gif CV212_Return.Does_Not_Exist.gif
cp source_images/2-way-valve-vertical.open.gif CV212_Return.Open.gif
cp source_images/2-way-valve-vertical.closed.gif CV212_Return.Closed.gif
cp source_images/2-way-valve-vertical.transit.gif CV212_Return.Transit.gif
cp source_images/2-way-valve-vertical-right.transit0.gif CV203_Supply.Does_Not_Exist.gif
cp source_images/2-way-valve-vertical-right.open.gif CV203_Supply.Open.gif
cp source_images/2-way-valve-vertical-right.closed.gif CV203_Supply.Closed.gif
cp source_images/2-way-valve-vertical-right.transit.gif CV203_Supply.Transit.gif
cp source_images/2-way-valve-vertical.transit0.gif CV213_Return.Does_Not_Exist.gif
cp source_images/2-way-valve-vertical.open.gif CV213_Return.Open.gif
cp source_images/2-way-valve-vertical.closed.gif CV213_Return.Closed.gif
cp source_images/2-way-valve-vertical.transit.gif CV213_Return.Transit.gif
cp source_images/2-way-valve-vertical-right.transit0.gif CV204_Supply.Does_Not_Exist.gif
cp source_images/2-way-valve-vertical-right.open.gif CV204_Supply.Open.gif
cp source_images/2-way-valve-vertical-right.closed.gif CV204_Supply.Closed.gif
cp source_images/2-way-valve-vertical-right.transit.gif CV204_Supply.Transit.gif
cp source_images/2-way-valve-vertical.transit0.gif CV214_Return.Does_Not_Exist.gif
cp source_images/2-way-valve-vertical.open.gif CV214_Return.Open.gif
cp source_images/2-way-valve-vertical.closed.gif CV214_Return.Closed.gif
cp source_images/2-way-valve-vertical.transit.gif CV214_Return.Transit.gif


cp source_images/2-way-valve-vertical-right.transit0.gif CV401_N2_Supply.Does_Not_Exist.gif
cp source_images/selenoid-valve-right-red.open.gif CV401_N2_Supply.Open.gif
cp source_images/selenoid-valve-right-green.closed.gif CV401_N2_Supply.Closed.gif
cp source_images/2-way-valve-vertical-right.transit.gif CV401_N2_Supply.Transit.gif
cp source_images/2-way-valve-vertical.transit0.gif CV402_N2_Release.Does_Not_Exist.gif
cp source_images/selenoid-valve-left-green.open.gif CV402_N2_Release.Open.gif
cp source_images/selenoid-valve-left-red.closed.gif CV402_N2_Release.Closed.gif
cp source_images/2-way-valve-vertical.transit.gif CV402_N2_Release.Transit.gif

cp source_images/3-way-west.transit0.gif CV121_An_Xfer.Does_Not_Exist.gif
cp source_images/3-way-west.left-up.gif CV121_An_Xfer.Process.gif
cp source_images/3-way-west.up-down.gif CV121_An_Xfer.Xfer.gif
cp source_images/3-way-west.transit.gif CV121_An_Xfer.transit.gif

cp source_images/3-way-west.transit0.gif CV221_Ca_Xfer.Does_Not_Exist.gif
cp source_images/3-way-west.left-down.gif CV221_Ca_Xfer.Process.gif
cp source_images/3-way-west.up-down.gif CV221_Ca_Xfer.Xfer.gif
cp source_images/3-way-west.transit.gif CV221_Ca_Xfer.transit.gif


cp source_images/contactor_closed.gif A1-1_Bus_Contact_Close.closed.gif
cp source_images/contactor_open.gif A1-1_Bus_Contact_Close.open.gif
cp source_images/contactor_closed.gif A1-1_Discharge_Contact_Close.closed.gif
cp source_images/contactor_open.gif A1-1_Discharge_Contact_Close.open.gif
cp source_images/contactor_closed.gif A1-2_Bus_Contact_Close.closed.gif
cp source_images/contactor_open.gif A1-2_Bus_Contact_Close.open.gif
cp source_images/contactor_closed.gif A1-2_Discharge_Contact_Close.closed.gif
cp source_images/contactor_open.gif A1-2_Discharge_Contact_Close.open.gif
cp source_images/contactor_closed.gif A1-3_Bus_Contact_Close.closed.gif
cp source_images/contactor_open.gif A1-3_Bus_Contact_Close.open.gif
cp source_images/contactor_closed.gif A1-3_Discharge_Contact_Close.closed.gif
cp source_images/contactor_open.gif A1-3_Discharge_Contact_Close.open.gif
cp source_images/contactor_closed.gif A1-4_Bus_Contact_Close.closed.gif
cp source_images/contactor_open.gif A1-4_Bus_Contact_Close.open.gif
cp source_images/contactor_closed.gif A1-4_Discharge_Contact_Close.closed.gif
cp source_images/contactor_open.gif A1-4_Discharge_Contact_Close.open.gif

cp source_images/contactor_closed.gif A2-1_Bus_Contact_Close.closed.gif
cp source_images/contactor_open.gif A2-1_Bus_Contact_Close.open.gif
cp source_images/contactor_closed.gif A2-1_Discharge_Contact_Close.closed.gif
cp source_images/contactor_open.gif A2-1_Discharge_Contact_Close.open.gif
cp source_images/contactor_closed.gif A2-2_Bus_Contact_Close.closed.gif
cp source_images/contactor_open.gif A2-2_Bus_Contact_Close.open.gif
cp source_images/contactor_closed.gif A2-2_Discharge_Contact_Close.closed.gif
cp source_images/contactor_open.gif A2-2_Discharge_Contact_Close.open.gif
cp source_images/contactor_closed.gif A2-3_Bus_Contact_Close.closed.gif
cp source_images/contactor_open.gif A2-3_Bus_Contact_Close.open.gif
cp source_images/contactor_closed.gif A2-3_Discharge_Contact_Close.closed.gif
cp source_images/contactor_open.gif A2-3_Discharge_Contact_Close.open.gif
cp source_images/contactor_closed.gif A2-4_Bus_Contact_Close.closed.gif
cp source_images/contactor_open.gif A2-4_Bus_Contact_Close.open.gif
cp source_images/contactor_closed.gif A2-4_Discharge_Contact_Close.closed.gif
cp source_images/contactor_open.gif A2-4_Discharge_Contact_Close.open.gif

cp source_images/contactor_closed.gif B1-1_Bus_Contact_Close.closed.gif
cp source_images/contactor_open.gif B1-1_Bus_Contact_Close.open.gif
cp source_images/contactor_closed.gif B1-1_Discharge_Contact_Close.closed.gif
cp source_images/contactor_open.gif B1-1_Discharge_Contact_Close.open.gif
cp source_images/contactor_closed.gif B1-2_Bus_Contact_Close.closed.gif
cp source_images/contactor_open.gif B1-2_Bus_Contact_Close.open.gif
cp source_images/contactor_closed.gif B1-2_Discharge_Contact_Close.closed.gif
cp source_images/contactor_open.gif B1-2_Discharge_Contact_Close.open.gif
cp source_images/contactor_closed.gif B1-3_Bus_Contact_Close.closed.gif
cp source_images/contactor_open.gif B1-3_Bus_Contact_Close.open.gif
cp source_images/contactor_closed.gif B1-3_Discharge_Contact_Close.closed.gif
cp source_images/contactor_open.gif B1-3_Discharge_Contact_Close.open.gif
cp source_images/contactor_closed.gif B1-4_Bus_Contact_Close.closed.gif
cp source_images/contactor_open.gif B1-4_Bus_Contact_Close.open.gif
cp source_images/contactor_closed.gif B1-4_Discharge_Contact_Close.closed.gif
cp source_images/contactor_open.gif B1-4_Discharge_Contact_Close.open.gif

cp source_images/contactor_closed.gif B2-1_Bus_Contact_Close.closed.gif
cp source_images/contactor_open.gif B2-1_Bus_Contact_Close.open.gif
cp source_images/contactor_closed.gif B2-1_Discharge_Contact_Close.closed.gif
cp source_images/contactor_open.gif B2-1_Discharge_Contact_Close.open.gif
cp source_images/contactor_closed.gif B2-2_Bus_Contact_Close.closed.gif
cp source_images/contactor_open.gif B2-2_Bus_Contact_Close.open.gif
cp source_images/contactor_closed.gif B2-2_Discharge_Contact_Close.closed.gif
cp source_images/contactor_open.gif B2-2_Discharge_Contact_Close.open.gif
cp source_images/contactor_closed.gif B2-3_Bus_Contact_Close.closed.gif
cp source_images/contactor_open.gif B2-3_Bus_Contact_Close.open.gif
cp source_images/contactor_closed.gif B2-3_Discharge_Contact_Close.closed.gif
cp source_images/contactor_open.gif B2-3_Discharge_Contact_Close.open.gif
cp source_images/contactor_closed.gif B2-4_Bus_Contact_Close.closed.gif
cp source_images/contactor_open.gif B2-4_Bus_Contact_Close.open.gif
cp source_images/contactor_closed.gif B2-4_Discharge_Contact_Close.closed.gif
cp source_images/contactor_open.gif B2-4_Discharge_Contact_Close.open.gif

cp source_images/contactor_closed.gif contactor_2_closed.true.gif
cp source_images/contactor_open.gif contactor_1_closed.false.gif
cp source_images/contactor_open.gif contactor_2_closed.false.gif

cp source_images/impeller-right.png impeller-right.png
cp source_images/impeller-left.png impeller-left.png
