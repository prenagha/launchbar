--
-- launchbar integration for Things
--
-- NOTE: This is the text AppleScript, the LaunchBar action Info.plist refers to
-- a **COMPILED** .scpt version of this script. You can compile this text AppleScript
-- into .scpt using command line osacompile or by exporting/save-as within Script Editor
--

property TB : "com.culturedcode.things"
property SAFARI : "com.apple.Safari"

-- debug logging to console
on dlog(myObj)
	set txt to quoted form of (myObj as string)
	log txt
	do shell script "logger -t 'LaunchBar.Things' " & txt
end dlog

-- is application running?
on app_running(bundleId)
	tell application "System Events"
		return (bundle identifier of processes) contains bundleId
	end tell
end app_running

-- called by launchbar when it has string input
on handle_string(todo)
	if todo is not "" then
		set newTodo to {}
		tell application "Things"
			set newTodo to parse quicksilver input todo
		end tell
		did_it(newTodo, "Created")
		return new_todo_items(newTodo)
	end if
end handle_string

-- adds a URL as a new todo
on addURL(todo, theURL)
	if todo is not "" then
		set newTodo to {}
		tell application "Things"
			set newTodo to parse quicksilver input todo
			if theURL starts with "http" then
				set notes of newTodo to "[url=" & theURL & "] " & theURL & " [/url]"
			end if
		end tell
		did_it(newTodo, "Created from URL")
		return new_todo_items(newTodo)
	end if
end addURL

-- create a new todo from active safari tab is selected
on safari_add(todo)
	addURL((subtitle of todo), (|url| of todo))
end safari_add

-- called by launchbar when it has an item input
on handle_item(todo)
	addURL((title of todo), (|url| of todo))
end handle_item

-- called by launchbar when it has URL input
on handle_URL(theURL, theDetails)
	addURL(theURL, theURL)
end handle_URL

-- called by launchbar when files are passed to the action
on open (thePaths)
	repeat with thePath in thePaths
		handle_string("File " & POSIX path of thePath)
	end repeat
end open

on new_todo_items(todo)
	set actions to {}
	set action to {title:"Today", action:"moveToday", actionArgument:id of todo, icon:TB & ":TodayMark"}
	copy action to end of actions
	
	set action to {title:"Next", action:"moveNext", actionArgument:id of todo, icon:TB & ":TodayMarkDone"}
	copy action to end of actions
	
	set action to {title:"Someday", action:"moveSomeday", actionArgument:id of todo, icon:TB & ":FocusMaybe-20"}
	copy action to end of actions
	
	set action to {title:"View", action:"viewTodo", actionArgument:id of todo, icon:TB}
	copy action to end of actions
	return actions
end new_todo_items

-- load all things items 
on load_all()
	tell application "Things"
		set listsOut to {}
		repeat with lst in lists
			set listId to id of lst
			if listId is in {"FocusInbox", "FocusToday", "FocusNextActions", "FocusMaybe"} then
				set todosOut to {}
				
				set todos to to dos in lst
				repeat with todo in todos
					set sts to status of todo
					if sts is open then
						set actions to {}
						
						set action to {title:"Complete " & name of todo, subtitle:notes of todo, label:tag names of todo, action:"completeTodo", actionArgument:id of todo, icon:TB & ":checkbox_big_done-P"}
						copy action to end of actions
						
						set u to stringBetween(notes of todo, "[url=", "]") of me
						if u is not "" then
							set action to {title:"View " & u, |url|:u}
							copy action to end of actions
						end if
						
						if listId is not "FocusToday" then
							set action to {title:"Today", action:"moveToday", actionArgument:id of todo, icon:TB & ":TodayMark"}
							copy action to end of actions
						end if
						
						if listId is not "FocusNextActions" then
							set title to "Next"
							if listId is "FocusToday" then
								set title to "Not Today"
							end if
							set action to {title:title, action:"moveNext", actionArgument:id of todo, icon:TB & ":TodayMarkDone"}
							copy action to end of actions
						end if
						
						if listId is not "FocusMaybe" then
							set action to {title:"Someday", action:"moveSomeday", actionArgument:id of todo, icon:TB & ":FocusMaybe-20"}
							copy action to end of actions
						end if
						
						set action to {title:"View", action:"viewTodo", actionArgument:id of todo, icon:TB}
						copy action to end of actions
						
						set action to {title:"Cancel", action:"cancelTodo", actionArgument:id of todo, icon:TB & ":checkbox_big_canceled-P"}
						copy action to end of actions
						
						set action to {title:"Trash", action:"trashTodo", actionArgument:id of todo, icon:TB & ":FocusTrashFull-20"}
						copy action to end of actions
						
						set icon to TB & ":checkbox_big_flat-P"
						set subt to notes of todo
						if due date of todo is not missing value then
							set icon to TB & ":checkbox_big_red-P"
							set subt to "Due " & (due date of todo as string) & " " & (notes of todo)
						end if
						set todoOut to {title:name of todo, icon:icon, subtitle:subt, label:tag names of todo, children:actions}
						copy todoOut to end of todosOut
					end if
				end repeat
				
				set listOut to {title:name of lst, icon:TB & ":" & listId & "-20", children:todosOut}
				if (count of todosOut) is greater than 0 then
					set listOut to {title:name of lst, icon:TB & ":" & listId & "-20", badge:(count of todosOut) as string, children:todosOut}
				end if
				copy listOut to end of listsOut
			end if
		end repeat
	end tell
	
	set theURL to ""
	if app_running(SAFARI) then
		tell application "Safari"
			set theName to name of current tab of window 1
			set theURL to URL of current tab of window 1
			set x to {title:"Add To Do from Safari", icon:SAFARI, subtitle:theName, |url|:theURL, action:"safari_add"}
			copy x to end of listsOut
		end tell
	end if
	
	set clip to get_clipboard()
	if clip is not "" and clip is not theURL then
		set x to {title:"Add To Do from Clipboard", subtitle:clip, icon:"ClipObject.icns", action:"handle_string", actionArgument:clip}
		copy x to end of listsOut
	end if
	
	return listsOut
end load_all

-- get the contents of the clipboard (if any) as plain text
on get_clipboard()
	if (the clipboard) is not {} then
		return the clipboard as text
	end if
	return ""
end get_clipboard

-- get a list by id
on get_list(listId)
	tell application "Things"
		repeat with lst in lists
			if id of lst is listId then
				return lst
			end if
		end repeat
	end tell
	tell application "LaunchBar" to display in large type "List not found " & listId
end get_list

-- get a todo by id
on get_todo(todoId)
	tell application "Things"
		repeat with lst in lists
			set todos to to dos in lst
			repeat with todo in todos
				if id of todo is todoId then
					return todo
				end if
			end repeat
		end repeat
	end tell
	tell application "LaunchBar" to display in large type "Todo not found " & todoId
end get_todo

-- handle complete todo action
on completeTodo(todoId)
	set todo to get_todo(todoId)
	tell application "Things" to set status of todo to completed
	did_it(todo, "Completed")
end completeTodo

-- handle cancel todo action
on cancelTodo(todoId)
	set todo to get_todo(todoId)
	tell application "Things" to set status of todo to canceled
	did_it(todo, "Canceled")
end cancelTodo

-- handle move to today action
on moveToday(todoId)
	set todo to get_todo(todoId)
	set lst to get_list("FocusToday")
	tell application "Things" to move todo to lst
	did_it(todo, "Moved to Today")
end moveToday

-- handle move to next action
on moveNext(todoId)
	set todo to get_todo(todoId)
	set lst to get_list("FocusNextActions")
	tell application "Things" to move todo to lst
	did_it(todo, "Moved to Next")
end moveNext

-- handle move to someday action
on moveSomeday(todoId)
	set todo to get_todo(todoId)
	set lst to get_list("FocusMaybe")
	tell application "Things" to move todo to lst
	did_it(todo, "Moved to Someday")
end moveSomeday

-- OSX notification to tell the user what we just did
on did_it(todo, msg)
	log "Todo " & msg & " -- " & (name of todo) & " -- " & (id of todo)
	tell application "LaunchBar"
		display in notification center with title "To Do " & msg subtitle (name of todo)
		hide
	end tell
end did_it

-- view todo in Things application
on viewTodo(todoId)
	set todo to get_todo(todoId)
	tell application "LaunchBar" to hide
	tell application "Things"
		activate
		show todo
	end tell
end viewTodo

-- handle trash todo action
on trashTodo(todoId)
	set todo to get_todo(todoId)
	tell application "Things" to delete todo
	did_it(todo, "Deleted")
end trashTodo

-- http://applescript.bratis-lover.net/library/string/#explode
on explode(delimiter, input)
	local delimiter, input, ASTID
	set ASTID to AppleScript's text item delimiters
	try
		set AppleScript's text item delimiters to delimiter
		set input to text items of input
		set AppleScript's text item delimiters to ASTID
		return input --> list
	on error eMsg number eNum
		set AppleScript's text item delimiters to ASTID
		error "Error in explode: " & eMsg number eNum
	end try
end explode

-- http://applescript.bratis-lover.net/library/string/#explode
on stringBetween(str, head, tail)
	local str, head, tail
	try
		if str is {} then return ""
		if str is "" then return ""
		if str does not contain head then return ""
		if str does not contain tail then return ""
		set str to item 2 of my explode(head, str)
		set str to item 1 of my explode(tail, str)
		return str
	on error eMsg number eNum
		error "Error in stringBetween: " & eMsg number eNum
	end try
end stringBetween


-- called by launchbar when enter or browse into from top item
on run
	load_all()
end run
