-- This handler is called when the user runs the action:
on run
	set hasChar to false
	set hasNbr to false
	set hasSpec to false
	set kinds to {"1", "1", "1", "1", "1", "1", "1", "1", "2", "3"}
	set chars to {"a", "b", "c", "d", "e", "f", "g", "h", "j", "k", "m", "n", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "M", "N", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "2", "3", "4", "5", "6", "7", "8", "9"}
	set nbrs to {"2", "3", "4", "5", "6", "7", "8", "9"}
	set specs to {"@", "#", "$", "%", "!", ".", "[", "]", "{", "}", "=", "+", "-", "_"}
	
	repeat while not hasNbr or not hasSpec or not hasChar
		set hasChar to false
		set hasNbr to false
		set hasSpec to false
		set pass to {}
		repeat 12 times
			set t to some item of kinds
			if t is "1" then
				set pass's end to some item of chars
				set hasChar to true
			else if t is "2" then
				set pass's end to some item of nbrs
				set hasNbr to true
			else
				set pass's end to some item of specs
				set hasSpec to true
			end if
		end repeat
	end repeat
	set pwd to (pass as text)
	set the clipboard to pwd
	--log pwd
	--return pwd
end run
