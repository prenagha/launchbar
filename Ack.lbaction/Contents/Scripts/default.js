
function runWithString(string) {
  return go(string);
}

function runWithItem(item) {
  return go(item.title);
}

function go(pattern) {
  if (!pattern || pattern == undefined || pattern.length == 0) {
    return [{'title':'Blank pattern', 'icon':'NotFound.icns'}];
  }
  try {
    var myArgs = [];
    // The Action.preferences object is persistent across runs of the action. 
    // ~/Library/Application Support/LaunchBar/Action Support/com.renaghan.launchbar.Ack/Preferences.plist
    var dirs = [];
    if (Action.preferences.dir == undefined) {
      Action.preferences.dir = LaunchBar.homeDirectory + '/Documents';
      dirs.push(Action.preferences.dir);
    } else {
      dirs = Action.preferences.dir.split(' ');
    }
    
    if (Action.preferences.args == undefined) {
      myArgs.push('--max-count=1');
      myArgs.push('--smart-case');
      Action.preferences.args = myArgs.join(' ');
    } else {
      myArgs = Action.preferences.args.split(' ');
    }
    if (Action.preferences.ack == undefined) {
      Action.preferences.ack = '/usr/local/bin/ack';
    }
    if (Action.preferences.output == undefined) {
      Action.preferences.output = 'reverse';
    }
    var args = [];
    args.push(Action.preferences.ack);
    args.push('--nobreak');
    args.push('--nocolor');
    args.push('--sort-files');
    args = args.concat(myArgs);
    args.push(pattern);
    args = args.concat(dirs);
    LaunchBar.debugLog('Cmd=' + Action.preferences.ack + ' ' + args.join(' '));
    var ackOut = LaunchBar.execute.apply(LaunchBar, args);
    var matches = ackOut.split('\n');
    var result = [];
    for (var i=0; i<matches.length; ++i) {
      var match = matches[i];
      var c1 = match.indexOf(':');
      if (c1 <= 0)
        continue;
      var c2 = match.indexOf(':', c1+1);
      if (c2 <= 0)
        continue;
      var fileName = match.substring(0, c1);
      if (fileName.length <= 0)
        continue;
      var column = match.substring(c1+1, c2);
      var hit = match.substring(c2 + 1);
      var r = new Object();
      var b = fileName;
      var ls = b.lastIndexOf('/');
      if (ls > 0 && ls < fileName.length)
        b = fileName.substring(ls+1);

      var n = fileName;
      for (var d=0; d<dirs.length; ++d) {
        n = n.replace(dirs[d], '');
      }
      if (Action.preferences.output == 'reverse') {
        n = n.split('/').reverse().join('/');
        n = n.substr(0, n.length - 1);
      } else {
        n = n.substr(1);
      }
      r.title = n;

      r.path = fileName;
      r.subtitle = column + ': ' + hit.trim();
      result.push(r);
    }
    if (result.length == 0) {
      return [{'title':'Pattern not found', 'icon':'NotFound.icns'}];
    }
    return result;
  } catch (exception) {
    LaunchBar.log('Ack Error ' + exception);
    LaunchBar.alert('Ack Error', exception);
  }
}
