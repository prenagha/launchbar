--
-- launchbar integration for Incognito Google Chrome
-- see http://apple.stackexchange.com/a/123909
-- see https://github.com/chrisfsmith/launchbar/blob/master/incognito/
--
property CHROME : "com.google.Chrome"

-- called by launchbar when it has string input
on handle_string(theURL)
	if theURL is not "" then
		log "URL from input " & theURL
	end if
	
	-- figure out what to open with if anything, looks for
	-- take any input specified as is
	-- otherwise check clipboard for http
	-- otherwise take URL of active safari tab
	-- otherwise whatever is in clipboard
	set clip to get the clipboard as string
	if theURL is "" and clip starts with "http" then
		set theURL to clip
		log "URL from clipboard " & theURL
	end if
	if theURL is "" then
		tell application "Safari"
			set theURL to URL of current tab of window 1
			log "URL from Safari " & theURL
		end tell
	end if
	if theURL is "" then
		set theURL to clip
		log "URL from clipboard any " & theURL
	end if
	
	if theURL is not "" and theURL does not start with "http" then
		set theURL to "https://www.google.com/search?q=" & theURL
		log "URL search " & theURL
	end if
	
	-- now look for open Chrome incognito and open there
	-- otherwise open new Chrome window
	-- otherwise start the Chrome app in incognito mode
	if not chrome_running() then
		log "Open the app"
		do shell script "open -b " & CHROME & " --new --args -incognito " & theURL
		return
	end if
	
	tell application "Google Chrome"
		repeat with win in (windows)
			if mode of win is "incognito" then
				log "Open in existing incognito window"
				set index of win to 1
				set myTab to make new tab at end of tabs of window 1
				set URL of myTab to theURL
				activate
				return
			end if
		end repeat
	end tell
	
	tell application "Google Chrome"
		log "Open in new window"
		tell (make new window with properties {mode:"incognito"})
			set URL of active tab to theURL
		end tell
		activate
	end tell
	
end handle_string

on chrome_running()
	tell application "System Events"
		return (bundle identifier of processes) contains CHROME
	end tell
end chrome_running

-- called by launchbar when it has an item input
on handle_item(item)
	handle_string(title of item)
end handle_item

-- called by launchbar when it has URL input
on handle_URL(theURL, theDetails)
	handle_string(theURL)
end handle_URL

-- called by launchbar when enter or browse into from top item
on run
	handle_string("")
end run
