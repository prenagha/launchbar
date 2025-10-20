
function run() {
  const links = load();
  refreshCounter();
  const output = [];
  if (links.length == 0) {
    output.push({
      'title': 'Zero links', 
      'icon': 'font-awesome:fa-circle-o'
    });
  } else {
    var count = 0;
    const showLinks = [];
  	for (let i = 0; i < links.length; i++) {
			const link = links[i];
			if (link) {
        if (link.linkduplicate) {
          continue;
        } else {
          if (link.url) count++;
          showLinks.push(link);
        }
			}
		}
    output.push({
		  title: 'Read All ' + count + ' ↗️',
		  icon: 'font-awesome:fa-trash',
		  action: 'readAll',
		  actionRunsInBackground: true
    });
    output.push({
		  title: 'Peek All ' + count + ' 👀',
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
		  title: 'Remove All ' + count + ' 👋🏼',
		  icon: 'font-awesome:files-o',
		  action: 'removeAll',
		  actionRunsInBackground: true
    });
  }
  return output;
}

function readAll() {
  const links = load();
  openAll(links);
  deleteAll(links);
  refreshCounter();
  focusSafari();
}

function peekAll() {
  const links = load();
  openAll(links);
  focusSafari();
}

function focusSafari() {
  LaunchBar.openURL('kmtrigger://macro=Focus%20Safari');  
}

function openAll(links) {
  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    if (link && link.url && !link.linkduplicate)
      LaunchBar.execute('/usr/bin/open', '--background', '--url', link.url);
  }  
}

function deleteAll(links) {
  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    if (link && link.linkfile)
      removeFile(link.linkfile);
  }
}

function removeAll() {
  const links = load();
  deleteAll(links);
  refreshCounter();
}

function removeList() {
  const output = []
  const links = load();
  for (let i = 0; i < links.length; i++) {
    const link = links[i];
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
  const links = load();
  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    if (url && link && link.url && url === link.url)
      removeFile(link.linkfile);
  }
  refreshCounter();
}

function refreshCounter() {
  LaunchBar.execute('/usr/bin/open', '--background', '--url', 'swiftbar://refreshplugin?name=links');
}

function capDir() {
  if (Action.preferences.captureDir == undefined 
   || Action.preferences.captureDir.length == 0) {
    Action.preferences.captureDir = 
      LaunchBar.homeDirectory + '/Library/Mobile Documents/iCloud~is~workflow~my~workflows/Documents/Read-Later/Capture';
  }
  return Action.preferences.captureDir;
}

function rdDir() {
  if (Action.preferences.readDir == undefined 
   || Action.preferences.readDir.length == 0) {
    Action.preferences.readDir = LaunchBar.homeDirectory + '/Archive/Links/Read';
  }
  return Action.preferences.readDir;
}

function load() {
  const captureDir = capDir();
  LaunchBar.debugLog("captureDir " + Action.preferences.captureDir);
  if (!File.exists(captureDir) || !File.isDirectory(captureDir))
    return [err('Capture dir invalid', captureDir)];

  const urls = new Set();
  const files = File.getDirectoryContents(Action.preferences.captureDir);
  const links = [];
  for (let i = 0; i < files.length; i++) {
    const file = captureDir + '/' + files[i];
    LaunchBar.debugLog('Reading ' + file);
    var lines;
    try {
      lines = File.readText(file).split('\n');
    } catch (error) {
      links.push(err('Cannot read file: ' + error, file));
      continue;
    }
    if (lines && lines.length >= 2) {
      const url = lines[0];
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
    const dt = new Date();
    const year = dt.getFullYear();
    const mn = dt.getMonth() + 1;
    const month = (mn < 10 ? "0" : "") + mn;
    const day = (dt.getDate() < 10 ? "0" : "") + dt.getDate();
    const dir = rdDir() + '/' + year + '/' + month + '/' + day;
    if (!File.exists(dir))
      File.createDirectory(dir);
    LaunchBar.log('Move to read ' + file);
    LaunchBar.execute('/bin/mv', '-f', file, dir);
  }
}

function err(msg, detail) {
  const m = 'ERROR: ' + msg;
  LaunchBar.log(m);
  return {
    title: m, 
    icon: 'font-awesome:fa-exclamation-triangle',
    subtitle : detail,
    alwaysShowSubtitle: true
  };
}
 