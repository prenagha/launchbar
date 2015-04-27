-- This handler is called when the user runs the action:
on run
	set hasLowr to false
	set hasUppr to false
	set hasNbr to false
	set hasSpec to false
	set kinds to {"1", "1", "1", "2", "2", "2", "3", "3", "4", "4"}
	set lowr to {"a", "b", "c", "d", "e", "f", "g", "h", "j", "k", "m", "n", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"}
	set uppr to {"A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "M", "N", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"}
	set nbr to {"2", "3", "4", "5", "6", "7", "8", "9"}
	set spec to {"@", "#", "$", "%", "!", ".", "[", "]", "{", "}", "=", "+", "-", "_"}
	
	repeat while not hasNbr or not hasSpec or not hasLowr or not hasUppr
		set hasChar to false
		set hasNbr to false
		set hasSpec to false
		set pass to {}
		repeat 13 times
			set t to some item of kinds
			if t is "1" then
				set pass's end to some item of lowr
				set hasLowr to true
			else if t is "2" then
				set pass's end to some item of uppr
				set hasUppr to true
			else if t is "3" then
				set pass's end to some item of nbr
				set hasNbr to true
			else
				set pass's end to some item of spec
				set hasSpec to true
			end if
		end repeat
	end repeat
	set pwd to (pass as text)
	set the clipboard to pwd
	--log pwd
	--return pwd
end run
