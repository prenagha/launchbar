#!/bin/bash
# original idea from https://gist.github.com/Zettt/88ef3112c04ebecf475b
curl -siL "$1" | grep -i ^Location | grep -i http | tail -n 1 | cut -c 11- | tr -d '\n' | tr -d '\r'
exit 0