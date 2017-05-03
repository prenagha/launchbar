
var LINK = '🔗';
var DELIM = LINK + 'microblog' + LINK;

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
  if ( Action.preferences.MicropubURL 
    && Action.preferences.MicropubURL.indexOf('http') >= 0
    && Action.preferences.MicropubToken
    && Action.preferences.MicropubToken.length > 1) {
    // preferences are good
  } else {
    if (!Action.preferences.MicropubURL)
      Action.preferences.MicropubURL = '';
    if (!Action.preferences.MicropubToken)
      Action.preferences.MicropubToken = '';
    var prefsFile = Action.supportPath + '/Preferences.plist';

    return err('Please set MicropubURL and MicropubToken in action preferences file '
      + prefsFile, prefsFile);
  }

  if (url && url.indexOf('http') == 0) {
    url = url.trim();
    LaunchBar.debugLog('From Input=' + url);
  } else {
    // get from safari
    var data = LaunchBar.executeAppleScript('tell application "Safari" to return URL of current tab of window 1 as string & "' + DELIM + '" & name of current tab of window 1 as string');
    var idx = data ? data.indexOf(DELIM) : -1;
    if (idx < 0)
      return err('Link from Safari not found');
      
    url = data.substring(0, idx).trim();
    name = data.substring(idx + DELIM.length).trim();

    LaunchBar.debugLog('From Safari=' + data);
  }

  if (!url || url.indexOf('http') != 0) {
    return err('URL is required ' + url);
  }

  var content = LINK + ' ' + (name && name.length > 0 ? name + ' — ' : '') + url;
  var confirm = LaunchBar.executeAppleScript('return text returned of (display dialog "Confirm Post" default answer "' + content + '" with icon caution)');
  
  if (!confirm || confirm == null || confirm.length < 5) {
    return [{'title': 'Post cancelled', 
    'icon': 'font-awesome:fa-ban'}];
  }
  
  var result = HTTP.post(Action.preferences.MicropubURL, {
      headerFields: {'Authorization': 'Bearer ' + Action.preferences.MicropubToken},
      body: {'h': 'entry', 'content': confirm}
  });
  
  //LaunchBar.debugLog(JSON.stringify(result));
  
  if (result.response.status == 202 && result.data != undefined) {
    // return item with 
    return [{'title': '✅ ' + confirm, 
      'icon': 'font-awesome:fa-rss',
      url: result.response.headerFields.Location}];
  } else if (result.error != undefined) {
    return err('Unable to post entry: ' + result.error);
  } else {
    return err('Unable to post entry: ' + result.response.localizedStatus);
  }
}

function err(msg, file) {
  var m = 'ERROR: ' + msg;
  LaunchBar.log(m);
  return [{'title': m, 
    'icon': 'font-awesome:fa-exclamation-triangle',
    path: file, 
    subtitle: file}];
}
