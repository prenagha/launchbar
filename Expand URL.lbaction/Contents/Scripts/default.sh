#!/bin/bash
# original idea from https://gist.github.com/Zettt/88ef3112c04ebecf475b
EXP=`curl -siL "$1" | grep ^[lL]ocation | tail -n 1 | cut -c 11- | tr -d '\n' | tr -d '\r'`
echo "[{\"title\":\"$EXP\",\"subtitle\":\"$1\",\"url\":\"$EXP\",\"quickLookURL\":\"$EXP\"}]"
exit 0