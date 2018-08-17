
function run(arg) {
  if (!arg || arg === null || typeof(arg) != 'string' || arg.length === 0)
    return;
  
  if (!Action.preferences.jiraBase)
    Action.preferences.jiraBase = "https://jira.example.com";
  if (!Action.preferences.crucibleBase)
    Action.preferences.crucibleBase = "https://crucible.example.com";
    
  var url = "";
  if (arg.match(/^\d+$/)) {
    url = Action.preferences.jiraBase + "/browse/ER-" + arg;
  } else if (arg.match(/^ER-\d+$/i)) {
    url = Action.preferences.jiraBase + "/browse/" + arg;
  } else if (arg.match(/^CR-\d+$/i)) {
    url = Action.preferences.crucibleBase + "/cru/" + arg;
  } else {
    var term = encodeURIComponent(arg);
    url = Action.preferences.jiraBase + "/issues/?jql=(summary%20~%20%22" 
      + term + "%22%20or%20description%20~%20%22" 
      + term + "%22)%20and%20status%20!%3D%20Closed%20order%20by%20key%20desc";
  }
      
  LaunchBar.debugLog("URL " + url);
  LaunchBar.openURL(url);
}
