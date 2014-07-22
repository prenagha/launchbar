--
-- Location Helper free on Mac App Store
-- http://www.mousedown.net/mouseware/LocationHelper.html
--
tell application "Location Helper"
  -- get current location
	set geo to get location record
	-- use maps API to get name(s) of current location
	set loc to reverse geocode location using coordinates {lat in geo, lng in geo}
	set r to results in loc
	set n to "Name not available"
	set qty to count of r
	-- first result is most detailed, usually too detailed
	if qty = 1 then
		set i to first item in r
		set n to formatted_address in i
	-- if lots of results then 3rd seems a good balance
	else if qty > 5 then
		set i to third item in r
		set n to formatted_address in i
	else if qty > 1 then
		set i to second item in r
		set n to formatted_address in i
	end if
	return make JSON from {latitude:lat in geo, longitude:lng in geo, place:n}
end tell