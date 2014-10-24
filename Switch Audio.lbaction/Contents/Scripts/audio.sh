#!/bin/bash
CMD=/usr/local/bin/SwitchAudioSource

if [ ! -f "$CMD" ]
then
  echo "$CMD not found"
  exit 1
fi

if [ ! -z "$1" ]
then
  $CMD -s "$1" -t "$2"
  exit $?
fi

CINPUT=`$CMD -c -t input`
COUTPUT=`$CMD -c -t output`

while read -r INPUT
do
  if [ ! -z "${INS}" ]
  then
    INS="${INS}, "
  fi
  INS="${INS}\"${INPUT}\""
done <<< "`$CMD -a -t input | sed 's/ (input)$//'`"

while read -r OUTPUT
do
  if [ ! -z "${OUTS}" ]
  then
    OUTS="${OUTS}, "
  fi
  OUTS="${OUTS}\"${OUTPUT}\""
done <<< "`$CMD -a -t output | sed 's/ (output)$//'`"

cat << EOF
{
  "currentInput": "${CINPUT}",
  "currentOutput": "${COUTPUT}",
  "inputs": [ ${INS} ],
  "outputs": [ ${OUTS} ]
}
EOF
exit 0
