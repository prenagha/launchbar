
function runWithString(string) {
  go(string);
}

function runWithPaths(paths) {
  var text = "";
  for (var i in paths) {
    try {
      text = text + File.readText(paths[i]) + " ";
    } catch (exception) {
      LaunchBar.log('Error reading file ' + paths[i] + ' -- ' + exception);
      LaunchBar.alert('Error copying to iPhone, cannot read file ' + paths[i], exception);
    }
  }
  go(text);
}

function runWithItem(item) {
  if (item && item.url && item.url.length > 0) {
    go(item.url);
  } else {
    go(item.title);
  }
}

function runWithURL(url, details) {
  go(url);
}

function run() {
  go(LaunchBar.getClipboardString());
}

function go(text) {
  if (!text || text == undefined || text.length == 0) {
    LaunchBar.alert('No text found to send to iPhone');
    return;
  }
  try {
    // The Action.preferences object is persistent across runs of the action. 
    // ~/Library/Application Support/LaunchBar/Action Support/<actionBundleID>/Preferences.plist
    if (Action.preferences.device == undefined) {
      // The device wasn't set in the action's preferences, fall back to default
      Action.preferences.device = 'iPhone';
    }

    var url = 'command-c://x-callback-url/copyText?deviceName=' + encodeURIComponent(Action.preferences.device) + '&text=' + encodeURIComponent(text);
    LaunchBar.debugLog('URL=' + url);
    LaunchBar.openURL(url);
  } catch (exception) {
    LaunchBar.log('Error ' + exception);
    LaunchBar.alert('Error copying to iPhone', exception);
  }
}
