
on dlog(myObj)
	set txt to quoted form of (myObj as string)
	log txt
	do shell script "logger -t 'LaunchBar.MailMate' " & txt
end dlog

on urlencode(theText)
	set theTextEnc to ""
	repeat with eachChar in characters of theText
		set useChar to eachChar
		set eachCharNum to ASCII number of eachChar
		if eachCharNum = 32 or eachCharNum > 127 then
			set useChar to "%20"
		else if (eachCharNum ≠ 42) and (eachCharNum ≠ 95) and (eachCharNum < 45 or eachCharNum > 46) and (eachCharNum < 48 or eachCharNum > 57) and (eachCharNum < 65 or eachCharNum > 90) and (eachCharNum < 97 or eachCharNum > 122) then
			set firstDig to round (eachCharNum / 16) rounding down
			set secondDig to eachCharNum mod 16
			if firstDig > 9 then
				set aNum to firstDig + 55
				set firstDig to ASCII character aNum
			end if
			if secondDig > 9 then
				set aNum to secondDig + 55
				set secondDig to ASCII character aNum
			end if
			set numHex to ("%" & (firstDig as string) & (secondDig as string)) as string
			set useChar to numHex
		end if
		set theTextEnc to theTextEnc & useChar as string
	end repeat
	return theTextEnc
end urlencode

on makeTo(_emailAddresses)
	set _to to ""
	repeat with addr in _emailAddresses
		set _to to _to & "&to=" & urlencode(addr)
	end repeat
	return _to
end makeTo

on basename(thePath) -- Requires POSIX path
	set ASTID to AppleScript's text item delimiters
	set AppleScript's text item delimiters to "/"
	set thePath to text item -1 of thePath
	set AppleScript's text item delimiters to ASTID
	return thePath
end basename

on sendFiles(_files, _emailAddresses)
	dlog("in sendFiles")
	try
		set _mailto to "mailto:?send-now=no" & makeTo(_emailAddresses)
		set _names to ""
		repeat with _file in _files
			set _filePath to POSIX path of _file
			set _names to _names & " " & basename(_filePath)
			set _mailto to _mailto & "&attachment-url=file://" & urlencode(_filePath)
		end repeat
		set _mailto to _mailto & "&subject=File:" & urlencode(_names) & "&body=" & urlencode("File attached")
		dlog("sendFiles " & _mailto)
		tell application "MailMate" to open location _mailto with trust
		tell application "MailMate" to activate
	on error error_message number error_number
		set msg to "LaunchBar.MailMate.sendFiles ERROR: " & error_message & " #" & error_number
		dlog(msg)
		display dialog msg
	end try
end sendFiles

on sendText(txt, _emailAddresses)
	dlog("in sendText")
	try
		if txt starts with "➤" then
			set myName to text 2 thru ((offset of "⬅︎" in txt) - 1) of txt
			set myURL to text ((offset of "⬅︎" in txt) + 1) thru end of txt
			set mySubj to "Link: " & myName
			set myBody to myName & return & myURL & return & return & "Enjoy," & return & "P"
			set _mailto to "mailto:?send-now=yes&subject=" & urlencode(mySubj) & makeTo(_emailAddresses) & "&body=" & urlencode(myBody)
			dlog("sendText link " & _mailto)
			tell application "MailMate" to open location _mailto with trust
		else
			set _mailto to "mailto:?send-now=no&" & makeTo(_emailAddresses) & "&body=" & urlencode(txt)
			dlog("sendText " & _mailto)
			tell application "MailMate" to open location _mailto
			tell application "MailMate" to activate
		end if
	on error error_message number error_number
		set msg to "LaunchBar.MailMate.sendText ERROR: " & error_message & " #" & error_number
		dlog(msg)
		display dialog msg
	end try
end sendText
