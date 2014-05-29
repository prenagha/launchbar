-- This handler is called when the user runs the action:
on run
	set charList to {"a", "b", "c", "d", "e", "f", "g", "h", "j", "k", "m", "n", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "M", "N", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "2", "3", "4", "5", "6", "7", "8", "9"}
	set nbrList to {"2", "3", "4", "5", "6", "7", "8", "9"}
	set specList to {"@", "#", "$", "%", "!", ".", "[", "]", "{", "}", "=", "+", "-", "_"}
	
	set pass to {}
	repeat 10 times
		set pass's end to some item of charList
	end repeat
	set pass's end to some item of specList
	set pass's end to some item of nbrList
	
	set pwd to (pass as text)
	set the clipboard to pwd
	
	--return pwd
end run
