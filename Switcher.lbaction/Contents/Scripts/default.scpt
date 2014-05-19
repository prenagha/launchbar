
on dlog(myObj)
	set txt to quoted form of (myObj as string)
	do shell script "logger -t 'LaunchBar.Switcher' " & txt
end dlog

on run
	set rslt to {}
	set recentApps to {}
	tell application "System Events"
		set frontmostApp to the first application process whose frontmost is true
	end tell
	if frontmostApp is not null then
		set appName to name of frontmostApp
		set the end of recentApps to appName
		set b to bundle identifier of frontmostApp
		set the end of rslt to {title:appName, action:"switch", actionArgument:appName, icon:b}
	end if
	
	tell application "System Events"
		set allApps to every process where background only is false
	end tell
	
	repeat with allApp in allApps
		set appName to name of allApp
		if recentApps does not contain appName then
			set the end of recentApps to appName
			set b to bundle identifier of allApp
			set the end of rslt to {title:appName, action:"switch", actionArgument:appName, icon:b}
		end if
	end repeat
	
	return rslt
end run

on switch(appName)
	tell application appName
		try
			reopen
		end try
		activate
	end tell
end switch
