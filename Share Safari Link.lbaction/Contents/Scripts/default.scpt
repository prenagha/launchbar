-- This handler is called when the user runs the action:
on run
	-- Copies the Title and URL of the current Safari tab back to Launchbar
	tell application "Safari"
		set theURL to URL of front document
		set theTitle to name of front document
		set theLink to "➤" & theTitle & "⬅︎" & theURL as string
		return [{title:theLink, subtitle:theURL, icon:"URL.icns", |url|:theURL, quickLookURL:theURL}]
	end tell
end run
