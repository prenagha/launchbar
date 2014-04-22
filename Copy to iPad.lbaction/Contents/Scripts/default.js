
// The 'run' function is called by LaunchBar when the user opens the action.
function run(arg) {
    try {
        // copy from clipboard, unless arg is passed
        var action = 'copy';
        var txt = null;        
        if (arg) {
          txt = arg;
          action = 'copyText';
        }
        
        // The Action.preferences object is persistent across runs of the action. 
        // ~/Library/Application Support/LaunchBar/Action Support/<actionBundleID>/Preferences.plist
        if (Action.preferences.device == undefined) {
            // The device wasn't set in the action's preferences, fall back to to iPad
            Action.preferences.device = 'iPad';
        }

		    var url = 'command-c://x-callback-url/' + action + '?deviceName=' + encodeURIComponent(Action.preferences.device);
        if (txt && txt.length > 0) {
		      url = url + '&text=' + encodeURIComponent(txt);
		    }
        LaunchBar.debugLog('URL=' + url);
		    LaunchBar.openURL(url);
    } catch (exception) {
        LaunchBar.log('Error ' + exception);
        LaunchBar.alert('Error copying to iPad', exception);
    }
}
