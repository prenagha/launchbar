
var ALERT_ICON = '/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/AlertStopIcon.icns';

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
    
  var u = null;
  if (url && url.includes('http')) {
    var s = url.indexOf('http');
    if (s >= 0) {
      var e = url.indexOf(' ', s);
      if (e > s) {
        u = url.slice(s, e);
      } else {
        u = url.substring(s);
      }
    }
  }
  if (!u || !u.includes('http'))
    return [{title: 'URL not found', icon: ALERT_ICON}];
    
  // add the url to instapaper
  var iURL = 'https://www.instapaper.com/api/add?'
    + 'username=' + encodeURIComponent(Action.preferences.Username)
    + '&password=' + encodeURIComponent(Action.preferences.Password)
    + '&url=' + encodeURIComponent(u);
  var result = HTTP.get(iURL, {timeout: 20.0});
  if (result && result.response && result.response.status == 201) {
    return [{
       title: result.response.headerFields['X-Instapaper-Title']
      ,icon: 'instapaper.png'
      ,url: result.response.headerFields['Content-Location']
    }];
  } else if (result && result.response && result.response.status && result.response.status == 403) {
    return [{title: 'Authorization error from Instapaper: ' + result.response.status + ' ' + result.response.localizedStatus
      ,path: Action.supportPath + '/Preferences.plist'
      ,icon: ALERT_ICON}];
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
  return typeof(item) == 'string' ? add(item) : add(item.url);
}

function runWithString(str) {
  return add(str);
}

function runWithURL (url, details) {
  return add(url);
}
