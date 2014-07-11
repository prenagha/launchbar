
function runWithString(string) {
  return go(string);
}

function runWithItem(item) {
  if (item && item.url && item.url.length > 0) {
    return go(item.url);
  }
}

function runWithURL(url, details) {
  return go(url);
}

function run() {
  return go(LaunchBar.getClipboardString());
}

function go(url) {
  if (!url || url == undefined || url.length == 0) {
    LaunchBar.alert('No URL found to expand');
    return;
  }
  try {
    LaunchBar.debugLog('URL=' + url);
    var exp = LaunchBar.execute('/bin/bash', 'resolve.sh', url);
    LaunchBar.debugLog('Expanded' + exp);
    if (!exp || exp == undefined || exp.length == 0)
      exp = url;
    return {'title':exp
            ,'subtitle':url
            ,'url':exp
            ,'quickLookURL':exp};
  } catch (exception) {
    LaunchBar.log('Error ' + exception);
    LaunchBar.alert('Error expanding ' + url, exception);
  }
}
