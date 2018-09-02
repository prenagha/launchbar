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

# copy the file to S3, private, no public access           
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

TMPFILE=`/usr/bin/mktemp -t signedUrl.txt` || exit 1

# get a signed URL that will work for 10 days
$AWS --profile ${PROFILE_GET} s3 presign \
  --expires-in ${TEN_DAYS_SECONDS} \
  ${DEST} > ${TMPFILE}

if [ $? -ne 0 ]
then
  /bin/rm ${TMPFILE} 2>/dev/null
  exit 3
fi

# put the signed URL on the clipboard
/bin/cat ${TMPFILE} | /usr/bin/pbcopy

# return signed URL back to LaunchBar
/bin/cat ${TMPFILE}

/bin/rm ${TMPFILE} 2>/dev/null

exit 0
