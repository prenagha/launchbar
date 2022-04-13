#!/bin/bash
# original idea from https://gist.github.com/Zettt/88ef3112c04ebecf475b
EXP=`curl -siL -w '%{url_effective}' -o /dev/null "$1"`
if [ -z "$EXP" ]
then
  echo "$1"
else
  echo "$EXP"
fi
exit 0
