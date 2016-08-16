
var ALERT_ICON = 'font-awesome:fa-exclamation-triangle';

function runWithString(string) {
  return go(string);
}

function runWithPaths(paths) {
  return go(paths[0]);
}

function runWithItem(item) {
  return go(item.path);
}

function runWithURL(url, details) {
  return go(url);
}

function run(arg) {
  return go(LaunchBar.getClipboardString());
}

function go(file) {
  if (!file || file == undefined || file.length == 0) {
    return err('Missing file to share', '');
  }
  LaunchBar.debugLog('Input File=' + file);
  if (!File.exists(file)) {
    return err('File does not exist', file);
  }
  if (!File.isReadable(file)) {
    return err('File is not readable', file);
  }
  
  var clipboardBefore = LaunchBar.getClipboardString();
  if (!clipboardBefore)
    clipboardBefore = '';
  
  try {
    var fileURL = File.fileURLForPath(file);
    LaunchBar.log('Input File URL=' + fileURL);
    LaunchBar.openURL(fileURL, 'Dropshare 4');
  } catch (exception) {
    return err('Error sharing: ' + exception, file);
  }

  // The Action.preferences object is persistent across runs of the action. 
  // ~/Library/Application Support/LaunchBar/Action Support/<actionBundleID>/Preferences.plist
  if (Action.preferences.match == undefined 
   || Action.preferences.match.length == 0) {
    LaunchBar.debugLog('Setting default match preference');
    Action.preferences.match = 'amazonaws';
  }
  
  for (var x=1; x<=8; x++) {
    var shareURL = LaunchBar.getClipboardString();
    LaunchBar.debugLog('Clipboard check ' + x + ' -- ' + shareURL);
    if (shareURL 
     && shareURL.length > 0
     && shareURL.indexOf(Action.preferences.match) > 0 
     && shareURL != clipboardBefore) {
      LaunchBar.log('Shared ' + file + ' as ' + shareURL);
      activateLaunchBar();
      return [{url: shareURL}];
    }
    LaunchBar.execute('/bin/sleep', '1');
  }    
  activateLaunchBar();
  return err('Timeout waiting for Dropshare', file);
}

function activateLaunchBar() {
  LaunchBar.executeAppleScript('tell application "LaunchBar" to activate');
}

function err(msg, file) {
  var m = 'ERROR: ' + msg;
  LaunchBar.log(m);
  return [{'title': m, 
    'icon': ALERT_ICON, 
    path: file, 
    subtitle: file}];
}
 