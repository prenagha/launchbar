#!/bin/bash

AWS=/usr/local/bin/aws
TEN_DAYS_SECONDS="864000"

BUCKET=$1
BUCKET_DIR=$2
PROFILE_PUT=$3
PROFILE_GET=$4
FILE=$5

if [ ! -f "${AWS}" ]
then
  echo "AWS CLI not found ${AWS}"
  exit 1
fi

if [ ! -f "${FILE}" ]
then
  echo "File to share not found ${FILE}"
  exit 1
fi

NAME=${FILE##*/}
DEST=s3://${BUCKET}/${BUCKET_DIR}/${NAME}

$AWS --profile ${PROFILE_PUT} s3 cp \
  --only-show-errors \
  --acl private \
  --cache-control no-cache \
  --storage-class STANDARD \
  --sse AES256 \
  ${FILE} ${DEST} 2>&1

if [ $? -ne 0 ]
then
  exit 2
fi

$AWS --profile ${PROFILE_GET} s3 presign \
  --expires-in ${TEN_DAYS_SECONDS} \
  ${DEST}

if [ $? -ne 0 ]
then
  exit 3
fi

exit 0
