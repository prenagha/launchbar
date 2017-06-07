
function run() {
  var homeDir = LaunchBar.homeDirectory;

  if (!Action.preferences.NotFoundMessage)
    Action.preferences.NotFoundMessage = 'No recent files found';
    
  if (!Action.preferences.FindCommand)
    Action.preferences.FindCommand = 
      '/usr/bin/mdfind,-onlyin,'+homeDir+'/Documents,-onlyin,'+homeDir+'/Desktop,-onlyin,'+homeDir+'/Downloads,-s,Recents';

  var args = Action.preferences.FindCommand.split(',');
  var searchLines = LaunchBar.execute(...args);
  searchLines = searchLines.split('\n');

  var results = [];
  
  for (i = 0; i < searchLines.length; i++) { 
    var path = searchLines[i];    
    var p = path.substring(homeDir.length+1);

    var parts = p.split('/');
    var label = parts[0];
    var name = parts[parts.length-1];
    var dir = '';
    if (parts.length > 2) {
      dir = parts.slice(1, parts.length).join('/');
    }
    
    results.push({'title': name, 'path': path, 'label': label, 'subtitle': dir});
  }

  if (results.length == 0) {    
    results.push({'title': Action.preferences.NotFoundMessage, 
      'icon': 'font-awesome:fa-clock-o'});
  }
  
  return results;
}

