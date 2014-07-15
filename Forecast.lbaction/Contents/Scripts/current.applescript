--
-- Location Helper free on Mac App Store
-- http://www.mousedown.net/mouseware/LocationHelper.html
--
tell application "Location Helper"
	set geo to get location coordinates
	return make JSON from {latitude:(first item of geo), longitude:(second item of geo)}
end tell
