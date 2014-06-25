#!/bin/bash
STP="/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/AlertStopIcon.icns"
CLK="/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/Clock.icns"

# orig idea and some code from https://github.com/shawnrice/alfred-2-caffeinate-workflow

toSeconds() {
  arg=$1
  (( sec=60*60*2 ))
  if [[ $arg =~ ([0-9]+)$ ]]
  then
    (( sec=$arg*60*60 ))
  else
    [[ $arg =~ ([0-9]+)([hHmM])$ ]]
    time=${BASH_REMATCH[1]}
    unit=${BASH_REMATCH[2]}
    if [[ $unit =~ ([hH]) ]]
    then
      (( sec=$time*60*60 ))
    elif [[ $unit =~ ([mM]) ]]
    then
      (( sec=$time*60 ))
    fi
  fi
  echo $sec
}

toString() {
  sec=$1
  hour=$(($sec/3600))
  min=$((($sec/60)%60))
  printf "%02d:%02d" $hour $min
}

# if no argument then show status
if [ -z "$1" ]
then
  PROC=`ps -eo etime,args | grep caffeinate | grep -v grep | head -n 1`
  if [ -z "$PROC" ]
  then
    echo "[{\"title\":\"Not caffeinated\",\"icon\":\"NotFound.icns\"}]"
  else
    # 03:26 caffeinate -u -t 1200
    # 01:03:26 caffeinate -u -t 1200
    [[ $PROC =~ ([0-9]+)$ ]]
    dur=${BASH_REMATCH[1]}

    if [[ $PROC =~ ([0-9]+):([0-9]+):([0-9]+) ]]
    then
      (( elapsed=${BASH_REMATCH[1]}*60*60 + ${BASH_REMATCH[2]}*60 ))
    else
      [[ $PROC =~ ([0-9]+):([0-9]+) ]]
      (( elapsed=${BASH_REMATCH[1]}*60 ))
    fi
    (( remain=$dur - $elapsed ))
    str=`toString $remain`
    echo "[{\"title\":\"Caffeinated awake for $str\",\"icon\":\"$CLK\"},\
           {\"title\":\"Stop caffeinating\",\"icon\":\"$STP\",\"action\":\"stop.sh\"}]"
  fi
else
  # if we have an argument then process it as a new caffeinate time
  sec=`toSeconds $1`
  str=`toString $sec`
  killall caffeinate 2>/dev/null
  caffeinate -u -t "$sec" 1>/dev/null 2>&1 &
  echo "[{\"title\":\"Caffeinated awake for $str\",\"icon\":\"$CLK\"}]"
fi
exit 0