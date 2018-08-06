on dlog(str)
	set msg to "LaunchBar.SizeUp.AppleScript: " & str
	log quoted form of msg
	do shell script "logger " & quoted form of msg
end dlog

dlog("ascript start")
try
	
	tell application "SizeUp" to do action Left
	
on error errorMessage number errorNumber
	dlog("Error: " & errorMessage & ", ErrorNumber: " & errorNumber)
end try

dlog("ascript end")