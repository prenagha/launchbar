
// Copyright (c) 2014 Padraic Renaghan
// https://github.com/prenagha/launchbar

// The 'run' function is called by LaunchBar when the user opens the action.
function run(arg) {
    try {
        LaunchBar.debugLog('in Copy to iPhone action js script');
        
        // for now just assume the arg is text
        var txt = arg;
        
        // The Action.preferences object is persistent across runs of the action. 
        // ~/Library/Application Support/LaunchBar/Action Support/<actionBundleID>/Preferences.plist
        if (Action.preferences.device == undefined) {
            // The device wasn't set in the action's preferences, fall back to to iPhone
            Action.preferences.device = 'iPhone';
        }

        LaunchBar.debugLog('device=' + Action.preferences.device);
		    var url = 'command-c://x-callback-url/copyText?deviceName=' + encodeURIComponent(Action.preferences.device) + '&text=' + encodeURIComponent(txt);
        LaunchBar.debugLog('url=' + url);
		    LaunchBar.openURL(url);

    } catch (exception) {
        LaunchBar.log('Error copying to iPhone ' + exception);
        LaunchBar.alert('Error copying to iPhone', exception);
    }
}
