
var ALERT_ICON = 'font-awesome:fa-exclamation-triangle';

function runWithString(string) {
  return go(string);
}

function runWithPaths(paths) {
  if (paths.length == 1)
    return go(paths[0]);
    
  // zip up the paths and dropshare the zipped file
  var tzip = LaunchBar.execute('/bin/bash', 'zip.sh', ...paths);  
  LaunchBar.debugLog('Temp zip file ' + tzip);
  tzip = chomp(tzip);
  var rtn = go(tzip);
  LaunchBar.execute('/bin/rm', tzip);
  return rtn;
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

function chomp(inp) {
  return inp.replace(/(\n|\r)+$/, '');
}

function go(file) {
  if (!file || file == undefined || file.length == 0) {
    return err('Missing file to share', '');
  }
  LaunchBar.debugLog("Input File='" + file + "'");
  if (!File.exists(file)) {
    return err('File does not exist', file);
  }
  if (!File.isReadable(file)) {
    return err('File is not readable', file);
  }
  
  if (Action.preferences.bucket == undefined 
   || Action.preferences.bucket.length == 0) {
    Action.preferences.bucket = 'mybucket';
  }
  LaunchBar.debugLog("Pref bucket='" + Action.preferences.bucket + "'");

  if (Action.preferences.dir == undefined 
   || Action.preferences.dir.length == 0) {
    Action.preferences.dir = 'share';
  }
  LaunchBar.debugLog("Pref dir='" + Action.preferences.dir + "'");

  if (Action.preferences.profilePut == undefined 
   || Action.preferences.profilePut.length == 0) {
    Action.preferences.profilePut = 'share-file-put';
  }
  LaunchBar.debugLog("Pref profilePut='" + Action.preferences.profilePut + "'");

  if (Action.preferences.profileGet == undefined 
   || Action.preferences.profileGet.length == 0) {
    Action.preferences.profileGet = 'share-file-get';
  }
  LaunchBar.debugLog("Pref profileGet='" + Action.preferences.profileGet + "'");
  
  try {
    var sharedURL = LaunchBar.execute('/bin/bash', 'share.sh', Action.preferences.bucket, Action.preferences.dir, Action.preferences.profilePut, Action.preferences.profileGet, file);  
    LaunchBar.debugLog("Shared URL='" + sharedURL + "'");
    // use pbcopy so it gets in LaunchBar Clipboard History
    LaunchBar.execute('/bin/echo' , sharedURL, '| /usr/bin/pbcopy');
    return [{
       title: 'Share URL'
      ,subtitle: sharedURL
      ,badge: 'on clipboard'
      ,url: sharedURL
    }];

  } catch (exception) {
    return err('Error sharing: ' + exception, file);
  }
}

function err(msg, file) {
  var m = 'ERROR: ' + msg;
  LaunchBar.log(m);
  return [{'title': m, 
    'icon': ALERT_ICON, 
    path: file, 
    subtitle: file}];
}
 