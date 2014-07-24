--
-- Dismiss all active notifications
--
on run
  tell application "System Events"
    tell process "NotificationCenter"
      -- re-get the list of windows after each dimiss
      -- otherwise it looses track and skips stuff
      repeat while (count windows) > 0
        if exists menu button "Snooze" of window 1 then
          -- prefer Snoozing if a calendar notification
          click menu button "Snooze" of window 1
        else if exists button "Close" of window 1 then
          -- otherwise just close it
          click button "Close" of window 1
        end if
        delay 1
      end repeat
    end tell
  end tell
end run
