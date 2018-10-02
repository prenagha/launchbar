--
-- launchbar integration for Incognito Chromium
-- see http://apple.stackexchange.com/a/123909
-- see https://github.com/chrisfsmith/launchbar/blob/master/incognito/
--
-- NOTE: This is the text AppleScript, the LaunchBar action Info.plist refers to
-- a **COMPILED** .scpt version of this script. You can compile this text AppleScript
-- into .scpt using command line osacompile or by exporting/save-as within Script Editor
--
property CHROME : "org.chromium.Chromium"
property SAFARI : "com.apple.Safari"

-- debug logging to console
on dlog(myObj)
	set txt to quoted form of (myObj as string)
	log txt
	do shell script "logger -t 'LaunchBar.Incognito' " & txt
end dlog

-- get the contents of the clipboard (if any) as plain text
on get_clipboard()
	if (the clipboard) is not {} then
		return the clipboard as text
	end if
	return ""
end get_clipboard

-- called by launchbar when it has string input
on handle_string(input)
	tell application "LaunchBar" to hide
	
	set theURL to makeURL(input)
	
	-- look for open Chrome incognito and open there
	-- otherwise open new Chrome window
	-- otherwise start the Chrome app in incognito mode
	if not app_running(CHROME) then
		do shell script "open -b " & CHROME & " --new --args -incognito " & theURL
		return
	end if
	
	tell application "Chromium"
		repeat with win in (windows)
			if mode of win is "incognito" then
				set index of win to 1
				set myTab to make new tab at end of tabs of window 1
				set URL of myTab to theURL
				activate
				return
			end if
		end repeat
	end tell
	
	tell application "Chromium"
		tell (make new window with properties {mode:"incognito"})
			set URL of active tab to theURL
		end tell
		activate
	end tell
end handle_string

-- is application running?
on app_running(bundleId)
	tell application "System Events"
		return (bundle identifier of processes) contains bundleId
	end tell
end app_running

-- http://applescript.bratis-lover.net/library/url/#urlEncode
on urlEncode(str)
	local str
	try
		return (do shell script "/bin/echo " & quoted form of str & Â
			" | perl -MURI::Escape -lne 'print uri_escape($_)'")
	on error eMsg number eNum
		error "Can't urlEncode: " & eMsg number eNum
	end try
end urlEncode

-- called by launchbar when it has an item input
on handle_item(item)
	handle_string(title of item)
end handle_item

-- called by launchbar when it has URL input
on handle_URL(theURL, theDetails)
	handle_string(theURL)
end handle_URL

-- called by launchbar when files are passed to the action
on open (thePaths)
	repeat with thePath in thePaths
		handle_string(POSIX path of thePath as string)
	end repeat
end open

on makeURL(input)
	if input is not "" and input does not start with "http" then
		return "https://duckduckgo.com/?q=" & urlEncode(input)
	end if
	return input
end makeURL

-- called by launchbar when enter or browse into from top item
on run
	set out to {}
	
	set theURL to ""
	if app_running(SAFARI) then
		tell application "Safari"
			set theName to name of current tab of window 1
			set theURL to URL of current tab of window 1
			set x to {title:theName, icon:SAFARI, subtitle:theURL, |url|:theURL, action:"handle_string", actionArgument:theURL}
			copy x to end of out
		end tell
	end if
	
	set clip to get_clipboard()
	if clip is not "" and clip is not theURL then
		if clip starts with "http" then
			set theURL to clip
			set x to {title:theURL, icon:"ClipURL.icns", subtitle:theURL, |url|:theURL, action:"handle_string", actionArgument:theURL}
			copy x to end of out
		else
			set theURL to makeURL(clip)
			set x to {title:"Search '" & clip & "'", subtitle:theURL, |url|:theURL, action:"handle_string", actionArgument:theURL}
			copy x to end of out
		end if
	end if
	
	-- if only one out then do it
	if (count of out) is less than or equal to 1 then
		handle_string(theURL)
	else
		-- otherwise return items so the user can pick 
		set x to {title:"Blank", icon:"ClipObject.icns", action:"handle_string", actionArgument:""}
		copy x to end of out
		return out
	end if
	
end run
