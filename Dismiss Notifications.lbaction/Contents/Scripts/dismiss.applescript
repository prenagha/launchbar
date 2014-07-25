--
-- Dismiss all active notifications
--

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
	repeat while pos ≤ (length of input)
		if input's character pos is in nbrs then
			set cnt to cnt + 1
		end if
		set pos to pos + 1
	end repeat
	return cnt
end countNbr

on run
	checkGUIScriptingEnabled()
	tell application "System Events"
		tell process "NotificationCenter"
			-- re-get the list of windows after each dimiss
			-- otherwise it looses track and skips stuff
			set stopAfter to (count windows) * 2
			set iters to 1
			repeat while (count windows) > 0 and iters ≤ stopAfter
				set snoozed to false
				if exists menu button "Snooze" of window 1 then
					-- prefer Snoozing if a calendar notification for a conference call
					if exists static text 3 of scroll area 1 of window 1 then
						set loc to value of static text 3 of scroll area 1 of window 1
						set nbrs to my countNbr(loc)
						-- conference calls have at least 14 numbers in the location field
						if nbrs ≥ 14 then
							set snoozed to true
							click menu button "Snooze" of window 1
						end if
					end if
				end if
				if not snoozed and (exists button "Close" of window 1) then
					-- otherwise just close it
					click button "Close" of window 1
				end if
				delay 1
				set iters to iters + 1
			end repeat
		end tell
	end tell
end run
