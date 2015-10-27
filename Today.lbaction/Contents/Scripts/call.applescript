
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
	return
end if

-- click the Call button on the facetime call confirm window
repeat 3 times
	tell application "System Events"
		tell process "FaceTime"
			if window 1 exists then
				if button "Call" of window 1 exists then
					click button "Call" of window 1
					return
				end if
			end if
		end tell
	end tell
end repeat
