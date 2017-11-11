#!/bin/bash
TDIR=`/usr/bin/mktemp -d`
BFIRST=`basename $1`
FIRST="${BFIRST%.*}"
TZIP="${TDIR}/${FIRST}.zip"
/usr/bin/zip -jqo "${TZIP}" $*
##/bin/cp -a $TZIP ~/Desktop
echo "${TZIP}"