#!/bin/bash
if [ -f ~/rbt.sh ]
then
  ~/rbt.sh
fi
/usr/bin/sudo /usr/bin/fdesetup authrestart -inputplist < ~/rbt.plist