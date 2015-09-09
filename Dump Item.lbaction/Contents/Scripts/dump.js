var ICON = "GrayInfo.tiff";

function dumpAction() {
  var items = [];
  items.push({title:'path: ' + Action.path, label: typeStr(Action.path)});
  items.push({title:'scriptType: ' + Action.scriptType, label: typeStr(Action.scriptType)});
  items.push({title:'version: ' + Action.version, label: typeStr(Action.version)});
  items.push({title:'bundleIdentifier: ' + Action.bundleIdentifier, label: typeStr(Action.bundleIdentifier)});
  items.push({title:'cachePath: ' + Action.cachePath, label: typeStr(Action.cachePath)});
  items.push({title:'supportPath: ' + Action.supportPath, label: typeStr(Action.supportPath)});
  items.push({title:'debugLogEnabled: ' + Action.debugLogEnabled, label: typeStr(Action.debugLogEnabled)});
  items.push({title:'preferences ➔', label: typeStr(Action.preferences), children:printItem(Action.preferences)});

  var out = [];
  out.push(dumpLaunchBar());
  out.push({title:'Action ➔',children:items});
  return out;
}

function dumpLaunchBar() {
  var items = [];
  items.push({title:'systemVersion: ' + LaunchBar.systemVersion, label: typeStr(LaunchBar.systemVersion)});
  items.push({title:'currentLocale: ' + LaunchBar.currentLocale, label: typeStr(LaunchBar.currentLocale)});
  items.push({title:'path: ' + LaunchBar.path, label: typeStr(LaunchBar.path)});
  items.push({title:'version: ' + LaunchBar.version, label: typeStr(LaunchBar.version)});
  items.push({title:'bundleIdentifier: ' + LaunchBar.bundleIdentifier, label: typeStr(LaunchBar.bundleIdentifier)});
  items.push({title:'homeDirectory: ' + LaunchBar.homeDirectory, label: typeStr(LaunchBar.homeDirectory)});
  items.push({title:'userName: ' + LaunchBar.userName, label: typeStr(LaunchBar.userName)});
  items.push({title:'userID: ' + LaunchBar.userID, label: typeStr(LaunchBar.userID)});
  items.push({title:'hostName: ' + LaunchBar.hostName, label: typeStr(LaunchBar.hostName)});
  items.push({title:'computerName: ' + LaunchBar.computerName, label: typeStr(LaunchBar.computerName)});
  items.push({title:'options  ➔', label: typeStr(LaunchBar.options), children: printItem(LaunchBar.options)});

  return {title:'LaunchBar ➔',children:items};
}

function printArg(arg) {
  if (typeof arg === 'undefined') {
    return '*undefined*';
  } else if (arg === null) {
    return '*null*';
  } else {
    return '"' + arg + '"';
  }
}

function typeStr(arg) {
  if (typeof(arg) === 'undefined') {
    return '*undefined*';
  } else if (arg === null) {
    return '*null*';
  } else {
    return typeof(arg);
  }
}

function printItem(arg) {
  if (typeof(arg) === 'undefined') {
    return [{title: '*undefined*', icon:ICON}];
  } else if (arg === null) {
    return [{title: '*null*', icon:ICON}];
  } else if (typeof(arg) !== 'object') {
    return [{title: '"' + arg + '"', icon:ICON}];
  }

  var empty = true;
  var items = [];
  for (var p in arg) {
    if (!arg.hasOwnProperty(p))
      continue;
    empty = false;
    var v = arg[p];
    var t = typeof(v);
    if (t === 'object') {
      items.push({title: p + ' ➔', label: t, icon: ICON, children: printItem(v)});
    } else {
      items.push({title: p + ': ' + printArg(v), label: typeStr(v), icon:ICON});
    }
  }
  if (empty)
      return [{title: '*empty*', icon:ICON}];
  return items;
}

function run(arg) {
  var items = dumpAction();
  items.push({title: 'run() handler called', icon:"GrayInfoPressed.tiff"});
  items.push({title: 'Argument ➔', label: typeStr(arg), icon:ICON, children:printItem(arg)});
  return items;
}

function runWithItem(item) {
  var items = dumpAction();
  items.push({title: 'runWithItem() handler called', icon:"ClipObject.icns"});
  items.push({title: 'Argument ➔', label: typeStr(item), icon:ICON, children:printItem(item)});
  return items;
}

function runWithPaths(paths) {
  var items = dumpAction();
  items.push({title: 'runWithPaths() handler called', icon:"FileOperationMove.icns"});
  paths.forEach(function(p) {
    items.push({title: 'Argument ➔', path:p, label: typeStr(p), icon:"FileOperationMove.icns", children:printItem(p)});
  });
  return items;
}

function runWithString(str) {
  var items = dumpAction();
  items.push({title: 'runWithString() handler called', icon:"EnterText.icns"});
  items.push({title: 'Argument ➔', label: typeStr(str), icon:"EnterText.icns", children:printItem(str)});
  return items;
}

function runWithURL(theURL, details) {
  var items = dumpAction();
  items.push({title: 'runWithURL() handler called', url: theURL, icon:"URL.icns"});
  items.push({title: 'URL Argument ➔', label: typeStr(theURL), icon:"URL.icns", url: theURL, children:printItem(theURL)});
  items.push({title: 'Details Argument ➔', label: typeStr(details), icon:ICON, children:printItem(details)});
  return items;
}