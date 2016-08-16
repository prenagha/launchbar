
var ALERT_ICON = 'font-awesome:fa-exclamation-triangle';

function setup() {
  if (Action.preferences.Username)
    return [];
  // load up an initial preferences object with defaults if first time run
  // then open editor so user can fill in the fields
  Action.preferences.Username = "Instapaper email address or username";
  Action.preferences.Password = "Instapaper password, if you have one";
  var prefs = Action.supportPath + '/Preferences.plist';
  LaunchBar.alert('Instapaper Login', 
    'Press enter to edit the preferences file and fill out your Instapaper login information. ' + prefs);
  return [{title: 'Edit preferences', icon: 'Pref_Advanced.icns', path: prefs}];
}

function add(url) {
  var s = setup();
  if (s && s.length > 0)
    return s;
    
  if (url && url.length > 4) {
    // ok
  } else {
    // get the URL from the current tab of safari
    url = LaunchBar.executeAppleScript('tell application "Safari" to return URL of current tab of window 1');
  }
    
  var u = "";
  var s = url ? url.indexOf('http') : -1;
  if (s >= 0) {
    u = url.substring(s);
    var e = u.indexOf(' ');
    if (e > 0) {
      u = url.slice(0, e);
    }
  }
  if (u.indexOf('http') != 0)
    return [{title: 'URL input not found', icon: ALERT_ICON}];
    
  // add the url to instapaper
  var iURL = 'https://www.instapaper.com/api/add?'
    + 'username=' + encodeURIComponent(Action.preferences.Username)
    + '&password=' + encodeURIComponent(Action.preferences.Password)
    + '&url=' + encodeURIComponent(u);
  var result = HTTP.get(iURL, {timeout: 20.0});
  if (result && result.response && result.response.status == 201) {
    if (LaunchBar.options.commandKey) {
      LaunchBar.log('Added to Instapaper successfully, command key quick mode');
      return [];
    }
    return [{
       title: result.response.headerFields['X-Instapaper-Title']
      ,icon: 'instapaper.png'
      ,url: result.response.headerFields['Content-Location']
    }];
  } else if (result && result.response && result.response.status && result.response.status == 403) {
    return [{title: 'Authorization error from Instapaper: ' + result.response.status + ' ' + result.response.localizedStatus
      ,path: Action.supportPath + '/Preferences.plist'
      ,icon: 'font-awesome:fa-key'}];
  } else if (result && result.error) {
    return [{title: 'Error from Instapaper: ' + result.error 
      + ' (' + result.response.status + ' ' + result.response.localizedStatus + ')'
      ,icon: ALERT_ICON}];
  } else {
    return [{title: 'HTTP error from Instapaper: ' + result.response.status + ' ' + result.response.localizedStatus
      ,icon: ALERT_ICON}];
  }
}

function run(arg) {
  return add(arg);
}

function runWithItem(item) {
  return add(item.url);
}

function runWithString(str) {
  return add(str);
}

function runWithURL (url, details) {
  return add(url);
}
