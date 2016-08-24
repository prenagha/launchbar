
var ALERT_ICON = 'font-awesome:fa-exclamation-triangle';

function err(msg) {
  LaunchBar.log('ERROR: ' + msg);
  LaunchBar.alert('ERROR: ' + msg);
}

function setup() {
  if (Action.preferences.Token && Action.preferences.Token.indexOf('userid:') != 0)
    return true;
  // load up an initial preferences object with defaults if first time run
  // then open editor so user can fill in the fields
  Action.preferences.Token = 'userid:value';
  Action.preferences.Shared = 'no';
  Action.preferences.ToRead = 'yes';
  var prefs = Action.supportPath + '/Preferences.plist';
  err('Action preferences file missing API Token. Please edit this file in TextEdit and set your Pinboard API Token. ' + prefs);
  return false;
}

function expand(url) {
  if (!url || url.length < 8 || url.indexOf('http') != 0)
    return url;
  
  var exp = LaunchBar.execute('/bin/bash', 'expand.sh', url);
  LaunchBar.debugLog('Expanded URL ' + exp);
  if (!exp || exp.length < 8)
    return url;
  return exp;
}

function isSafari() {
  var app = LaunchBar.executeAppleScript('tell application "System Events" to return name of first application process whose frontmost is true');
  return app && app == "Safari";
}

function add(url, name) {
  if (!setup())
    return;
  if (!url) {
    err('Input URL is required');
    return;
  }
  if (!url || url.length < 8 || url.indexOf('http') != 0) {
    err('Input URL is invalid: ' + url);
    return;
  }
  if (!name)
    name = url;  
          
  // add the url to Pinboard
  var pURL = 'https://api.pinboard.in/v1/posts/add?'
    + 'auth_token=' + encodeURIComponent(Action.preferences.Token)
    + '&format=json'
    + '&shared=' + Action.preferences.Shared
    + '&toread=' + Action.preferences.ToRead
    + '&url=' + encodeURIComponent(url)
    + '&description=' + encodeURIComponent(name);
  LaunchBar.debugLog('Add URL: ' + pURL);

  var result = HTTP.getJSON(pURL, {timeout: 20.0});
  LaunchBar.debugLog('Result: ' + JSON.stringify(result));

  if (result && result.data && result.data.result_code == 'done') {
    LaunchBar.displayNotification({title: 'Added to Pinboard', string: name, url: url});

  } else if (result && result.data && result.data.result_code) {
    err('Pinboard Add Service Returned Error -- ' + result.response.result_code);

  } else if (result && result.response && result.response.status && result.response.status == 401) {
    err('Authorization error from Pinboard -- ' + result.response.status + ' ' + result.response.localizedStatus);

  } else {
    err('Add Service Returned HTTP Error -- ' + JSON.stringify(result));
  }
}

function run(url) {
  // if the input is a URL then use it
  if (url && url.length > 8 && url.indexOf('http') == 0) {
    url = expand(url);
    add(url, url);
  // otherwise if active app was safari then use active URL in safari
  } else if (isSafari()) {
    url = LaunchBar.executeAppleScript('tell application "Safari" to return URL of current tab of window 1 as string');
    var name = LaunchBar.executeAppleScript('tell application "Safari" to return name of current tab of window 1 as string');
    add(url, name);
  // otherwise use whatever is in clipboard
  } else {
    url = expand(LaunchBar.getClipboardString());
    add(url, url);
  }
}

function runWithItem(item) {
  var url = expand(item.url);
  return add(url, (item.title ? item.title : url));
}

function runWithString(str) {
  var url = expand(str);
  return add(url, url);
}

function runWithURL (url, details) {
  var url = expand(url);
  return add(url, url);
}
