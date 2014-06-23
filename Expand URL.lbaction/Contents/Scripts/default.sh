#!/bin/bash
# original idea from https://gist.github.com/Zettt/88ef3112c04ebecf475b
EXP=`curl -siL "$1" | grep ^[lL]ocation | tail -n 1 | cut -c 11-`
# sent bug to LB, returning JSON from script action not working
#echo "[{'title':'$EXP','url':'$EXP','quickLookURL':'$EXP'}]"
echo $EXP
exit 0