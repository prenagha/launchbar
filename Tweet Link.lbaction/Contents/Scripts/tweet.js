
var ALERT_ICON = 'font-awesome:fa-exclamation-triangle';

function runWithString(string) {
  go(null, string);
}

function runWithPaths(paths) {
  go(null, null);
}

function runWithItem(item) {
  return go(item.title ? item.title : null, item.url ? item.url : null);
}

function runWithURL(url, details) {
  return go(null, url);
}

function run(arg) {
  return go(arg && arg.name ? arg.name : null, 
            arg && arg.url ? arg.url : null);
}

function go(name, url) {
  if (url && url.indexOf('http') == 0) {
    url = url.trim();
    LaunchBar.debugLog('From Input=' + url);
  } else {
    // get from safari
    var data = LaunchBar.executeAppleScript('tell application "Safari" to return URL of current tab of window 1 as string & "🔗prenagha🔗" & name of current tab of window 1 as string');
    var idx = data ? data.indexOf('🔗prenagha🔗') : -1;
    if (idx < 0)
      return err('Link from Safari not found');
      
    url = data.substring(0, idx).trim();
    name = data.substring(idx + 12).trim();

    LaunchBar.debugLog('From Safari=' + data);
  }

  if (!url || url.indexOf('http') != 0) {
    return err('URL is required ' + url);
  }

  var tweet = '🔗 ' + (name && name.length > 0 ? name + ' — ' : '') + url;

  LaunchBar.performAction('Post on Twitter', tweet);
  return null;  
}

function err(msg, file) {
  var m = 'ERROR: ' + msg;
  LaunchBar.log(m);
  return [{'title': m, 
    'icon': ALERT_ICON, 
    path: file, 
    subtitle: file}];
}
 