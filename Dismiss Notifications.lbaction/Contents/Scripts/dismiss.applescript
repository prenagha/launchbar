--
-- Dismiss all active notifications
--
-- NOTE: This is the text AppleScript, the LaunchBar action Info.plist refers to
-- a **COMPILED** .scpt version of this script. You can compile this text AppleScript
-- into .scpt using command line osacompile or by exporting/save-as within Script Editor
--

on dlog(myObj)
	set txt to quoted form of (myObj as string)
	log txt
	do shell script "logger -t 'LaunchBar.Dismiss' " & txt
end dlog

on checkGUIScriptingEnabled()
	-- code snippet from UI Browser http://pfiddlesoft.com/uibrowser/index.html
	tell application "System Events" to set GUIScriptingEnabled to UI elements enabled
	if not GUIScriptingEnabled then
		activate
		set scriptRunner to name of current application
		display alert "GUI Scripting is not enabled for " & scriptRunner & "." message "Open System Preferences, unlock the Security & Privacy preference, select " & scriptRunner & " in the Privacy Pane's Accessibility list, and then run this script again." buttons {"Open System Preferences", "Cancel"} default button "Cancel"
		if button returned of result is "Open System Preferences" then
			tell application "System Preferences"
				tell pane id "com.apple.preference.security" to reveal anchor "Privacy_Accessibility"
				activate
			end tell
		end if
	end if
end checkGUIScriptingEnabled

on countNbr(input)
	set nbrs to {"0", "1", "2", "3", "4", "5", "6", "7", "8", "9"}
	set pos to 1
	set cnt to 0
	repeat while pos ² (length of input)
		if input's character pos is in nbrs then
			set cnt to cnt + 1
		end if
		set pos to pos + 1
	end repeat
	return cnt
end countNbr

on s(pos)
	global localization
	return item pos of localization
end s

on setLocalization()
	global localization
	set user_locale to user locale of (get system info)
	set localization to {"Snooze", "now", 14, "Close", "OK"}
	
	if user_locale is "fr_FR" then
		set localization to {"Rappel", "maintenant", 10, "Fermer", "OK"}
	end if
	return localization
end setLocalization

on run
	checkGUIScriptingEnabled()
	setLocalization()
	
	tell application "System Events"
		tell process "NotificationCenter"
			-- re-get the list of windows after each dimiss
			-- otherwise it looses track and skips stuff
			set stopAfter to (count windows) * 2
			set iters to 1
			
			repeat while (count windows) > 0 and iters ² stopAfter
				set done to false
				-- prefer Snoozing if a calendar notification is for a conference call that is upcoming
				if ((exists menu button (my s(1)) of window 1) or (exists menu button "Snooze" of window 1)) and (exists static text 2 of scroll area 1 of window 1) and (exists static text 3 of scroll area 1 of window 1) then
					set when to value of static text 2 of scroll area 1 of window 1
					set loc to value of static text 3 of scroll area 1 of window 1
					set nbrs to my countNbr(loc)
					-- conference calls have at least 14 numbers in the location field
					if when is not (my s(2)) and nbrs ³ (my s(3)) then
						set done to true
						click menu button (my s(1)) of window 1
					end if
				end if
				if not done and (exists button (my s(4)) of window 1) then
					-- otherwise just close it (Close)
					click button (my s(4)) of window 1
					set done to true
				end if
				if not done and (exists button (my s(5)) of window 1) then
					-- otherwise just close it (OK)
					click button (my s(5)) of window 1
					set done to true
				end if
				if not done then
					set n to "notification"
					if (exists static text 1 of scroll area 1 of window 1) then
						set n to value of static text 1 of scroll area 1 of window 1
					end if
					log "Unable to dismiss " & n
				end if
				delay 1
				set iters to iters + 1
			end repeat
		end tell
	end tell
end run
