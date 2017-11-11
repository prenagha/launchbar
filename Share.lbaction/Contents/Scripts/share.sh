#!/bin/bash

AWS=/usr/local/bin/aws

BUCKET=$1
BUCKET_DIR=$2
PROFILE=$3
FILE=$4

if [ ! -f "$FILE" ]
then
  echo "File to share not found $FILE"
  exit 1
fi

NAME=${FILE##*/}
EXT=${NAME#*.}
FNAME=${NAME%%.*}
RAND=`cat /dev/urandom | base64 | tr -dc 'a-zA-Z0-9' | fold -w 10 | head -n 1`
DEST=s3://${BUCKET}/${BUCKET_DIR}/${FNAME}-${RAND}.${EXT}

$AWS --profile ${PROFILE} s3 cp \
  --only-show-errors \
  --acl public-read \
  --cache-control "max-age=31536000" \
  --storage-class STANDARD_IA \
  ${FILE} ${DEST} 2>&1

if [ $? -eq 0 ]
then
  echo "https://${BUCKET}.s3.amazonaws.com/${BUCKET_DIR}/${FNAME}-${RAND}.${EXT}"
  exit 0
fi

exit 2
