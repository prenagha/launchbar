
function run() {
  links = load();
  refreshCounter();
  output = [];
  if (links.length == 0) {
    output.push({
      'title': 'Zero links', 
      'icon': 'font-awesome:fa-circle-o'
    });
  } else {
    showLinks = [];
  	for (let i = 0; i < links.length; i++) {
			link = links[i];
			if (link && link.url && !link.linkduplicate)
			  showLinks.push(link);
		}
    output.push({
		  title: 'Read All ' + showLinks.length + ' ↗️',
		  icon: 'font-awesome:fa-trash',
		  action: 'readAll',
		  actionRunsInBackground: true
    });
    output.push({
		  title: 'Peek All ' + showLinks.length + ' 👀',
		  icon: 'font-awesome:fa-eye',
		  action: 'peekAll',
		  actionRunsInBackground: true
    });
    output.push(...showLinks);
    output.push({
		  title: 'Remove',
		  icon: 'font-awesome:file-o',
		  action: 'removeList',
		  actionReturnsItems: true
    });
    output.push({
		  title: 'Remove All ' + links.length + ' 👋🏼',
		  icon: 'font-awesome:files-o',
		  action: 'removeAll',
		  actionRunsInBackground: true
    });
  }
  return output;
}

function readAll() {
  links = load();
  openAll(links);
  deleteAll(links);
  refreshCounter();
}

function peekAll() {
  links = load();
  openAll(links);
}

function openAll(links) {
  for (let i = 0; i < links.length; i++) {
    link = links[i];
    if (link && link.url && !link.linkduplicate)
      LaunchBar.execute('/usr/bin/open', '--url', link.url);
  }  
}

function deleteAll(links) {
  for (let i = 0; i < links.length; i++) {
    link = links[i];
    if (link && link.linkfile)
      removeFile(link.linkfile);
  }
}

function removeAll() {
  links = load();
  deleteAll(links);
  refreshCounter();
}

function removeList() {
  output = []
  links = load();
  for (let i = 0; i < links.length; i++) {
    link = links[i];
    if (link && link.linkfile && !link.linkduplicate) {
      link.icon = 'font-awesome:fa-trash';
      link.action = 'removeOne';
      link.actionArgument = link.url;
      output.push(link);
    }
  }
  return output;
}

function removeOne(url) {
  links = load();
  for (let i = 0; i < links.length; i++) {
    link = links[i];
    if (url && link && link.url && url === link.url)
      removeFile(link.linkfile);
  }
  refreshCounter();
}

function refreshCounter() {
  LaunchBar.execute('/usr/bin/open', '--background', '--url', 'swiftbar://refreshplugin?name=links');
}

function capDir() {
  captureDir = LaunchBar.homeDirectory + '/Library/Mobile Documents/iCloud~is~workflow~my~workflows/Documents/Read-Later/Capture';
  if (Action.preferences.captureDir == undefined 
   || Action.preferences.captureDir.length == 0) {
    Action.preferences.captureDir = captureDir;
  }
  return Action.preferences.captureDir;
}

function rdDir() {
  readDir = LaunchBar.homeDirectory + '/Archive/Links/Read'
  if (Action.preferences.readDir == undefined 
   || Action.preferences.readDir.length == 0) {
    Action.preferences.readDir = readDir;
  }
  return Action.preferences.readDir;
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
      links.push({
        title: lines[1],
        subtitle: url,
        icon: 'font-awesome:fa-globe',
        url: url,
        linkfile: file,
        linkduplicate: urls.has(url)
      });
      urls.add(url);
    } else {
      links.push(err('Invalid file', file));
    }
  };
  links.sort((a,b) => a.title.localeCompare(b.title));
  return links;
}

function removeFile(file) {
  if (file) {
    dt = new Date();
    year = dt.getFullYear();
    month = (dt.getMonth() < 10 ? "0" : "") + (dt.getMonth()+1)
    day = (dt.getDate() < 10 ? "0" : "") + dt.getDate()
    dir = rdDir() + '/' + year + '/' + month + '/' + day;
    if (!File.exists(dir))
      File.createDirectory(dir);
    LaunchBar.log('Move to read ' + file);
    LaunchBar.execute('/bin/mv', '-f', file, dir);
  }
}

function err(msg, detail) {
  var m = 'ERROR: ' + msg;
  LaunchBar.log(m);
  return {
    title: m, 
    icon: 'font-awesome:fa-exclamation-triangle',
    subtitle : detail,
    alwaysShowSubtitle: true
  };
}
 