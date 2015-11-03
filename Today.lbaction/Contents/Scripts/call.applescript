
on dlog(myObj)
	set txt to quoted form of (myObj as string)
	log txt
	do shell script "/usr/bin/logger -t 'LaunchBar.Today' " & txt
end dlog

-- code snippet from UI Browser http://pfiddlesoft.com/uibrowser/index.html
tell application "System Events" to set GUIScriptingEnabled to UI elements enabled
if not GUIScriptingEnabled then
	activate
	set scriptRunner to name of current application
	my dlog("GUI scripting not enabled")
	display alert "GUI Scripting is not enabled for " & scriptRunner & "." message "Open System Preferences, unlock the Security & Privacy preference, select " & scriptRunner & " in the Privacy Pane's Accessibility list, and then run this script again." buttons {"Open System Preferences", "Cancel"} default button "Cancel"
	if button returned of result is "Open System Preferences" then
		tell application "System Preferences"
			tell pane id "com.apple.preference.security" to reveal anchor "Privacy_Accessibility"
			activate
		end tell
	end if
	return
end if
my dlog("GUI scripting is enabled")

-- click the Call button on the facetime call confirm window
repeat 5 times
  delay 2
	my dlog("Looking for FaceTime call confirm window")
	tell application "System Events"
		if process "FaceTime" exists then
			tell process "FaceTime"
				if window 1 exists then
					if button "Call" of window 1 exists then
						my dlog("Clicking on FaceTime Call button")
						click button "Call" of window 1
						return
					else
						my dlog("FaceTime window button does not exist yet")
					end if
				else
					my dlog("FaceTime window does not exist yet")
				end if
			end tell
		else
			my dlog("FaceTime process does not exist yet")
		end if
	end tell
end repeat
my dlog("Unable to click FaceTime Call button")
