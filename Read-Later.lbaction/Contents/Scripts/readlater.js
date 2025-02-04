
function runWithString(string) {
  return capture(string);
}

function runWithURL(url, details) {
  return capture(url);
}

function capture(url) {
  LaunchBar.log("Capturing " + url);
  if (url && url.length > 10 && url.startsWith('https://')) {
  //TODO
  } else {
    return [err('Capture failed, invalid input', url)];
  }
}

function chomp(inp) {
  return inp.replace(/(\n|\r)+$/, '');
}

function run(arg) {
  links = load();
  output = [];
  if (links.length == 0) {
    output.push({
      'title': 'Zero links', 
      'icon': 'font-awesome:fa-circle-o'
    });
  } else {
    output.push({
		  title: 'Read All ↗️',
		  icon: 'font-awesome:fa-trash',
		  action: 'readAll',
		  actionRunsInBackground: true
    });
    output.push({
		  title: 'Peek All 👀',
		  icon: 'font-awesome:fa-eye',
		  action: 'peekAll',
		  actionRunsInBackground: true
    });
    output.push(...links);
  }
  return output;
}

function readAll() {
  links = load();
  for (let i = 0; i < links.length; i++) {
    link = links[i];
    if (link && link.url && link.url.length > 10) {
      LaunchBar.openURL(link.url);
      if (link.linkfile && link.linkfile.length > 5)
        removeFile(link.linkfile);
    }
  }  
}

function peekAll() {
  links = load();
  for (let i = 0; i < links.length; i++) {
    link = links[i];
    if (link && link.url && link.url.length > 10)
      LaunchBar.openURL(link.url);
  }  
}

function capDir() {
  captureDir = LaunchBar.homeDirectory + '/Library/Mobile Documents/iCloud~is~workflow~my~workflows/Documents/Read-Later/Capture'
  if (Action.preferences.captureDir == undefined 
   || Action.preferences.captureDir.length == 0) {
    Action.preferences.captureDir = LaunchBar.homeDirectory + '/Library/Mobile Documents/iCloud~is~workflow~my~workflows/Documents/Read-Later/Capture'
  }
  return Action.preferences.captureDir;
}

function load() {
  var captureDir = capDir();
  LaunchBar.debugLog("captureDir " + Action.preferences.captureDir);
  if (!File.exists(captureDir) || !File.isDirectory(captureDir))
    return [err('Capture dir invalid', captureDir)];

  var urls = new Set();
  var files = File.getDirectoryContents(Action.preferences.captureDir);
  var links = [];
  for (let i = 0; i < files.length; i++) {
    file = captureDir + '/' + files[i];
    LaunchBar.debugLog('Reading ' + file);
    lines = File.readText(file).split('\n');
    if (lines && lines.length >= 2) {
      url = lines[0];
      if (urls.has(url)) {
        LaunchBar.log('Remove duplicate ' + url + ' ' + file);
        removeFile(file);
      } else {
        urls.add(url);
        links.push({
          title: lines[1],
          subtitle: url,
          icon: 'font-awesome:fa-globe',
          url: url,
          linkfile: file
        });
      }
    } else {
      links.push(err('Invalid file', file));
    }
  };
  return links;
}

function removeFile(file) {
  LaunchBar.log('Removing ' + file);
  LaunchBar.execute('/bin/rm', file);
}

function err(msg, detail) {
  var m = 'ERROR: ' + msg;
  LaunchBar.log(m);
  return {
    'title': m, 
    'icon': 'font-awesome:fa-exclamation-triangle',
    'subtitle' : detail,
    'alwaysShowSubtitle': true
  };
}
 