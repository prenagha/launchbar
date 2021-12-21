
function run(arg) {
  if (!arg || arg === null || typeof(arg) != 'string' || arg.length === 0)
    return;

  arg = arg.trim();
  
  // default jira project  
  if (!Action.preferences.jiraDefaultProject)
    Action.preferences.jiraDefaultProject = "";
    
  // base URL to jira server
  if (!Action.preferences.jiraBase)
    Action.preferences.jiraBase = "https://jira.example.com";

  // text search query, <q> replaced with the search term
  if (!Action.preferences.jiraQuery)
    Action.preferences.jiraQuery = "/issues/?jql=text%20~%20%22<q>%22"
      +"%20AND%20status%20!%3D%20Closed%20ORDER%20BY%20key%20DESC";
      
  var url = "";
  // number assumed to be jira issue id in default project
  if (Action.preferences.jiraDefaultProject.length > 0 && arg.match(/^\d+$/)) {
    url = Action.preferences.jiraBase 
        + "/browse/" 
        + Action.preferences.jiraDefaultProject 
        + "-" + arg;

  // XX-number assumed to be a fully qualified jira issue id
  } else if (arg.match(/^[A-Z]{2,}-\d+$/i)) {
    url = Action.preferences.jiraBase + "/browse/" + arg;
    
  // otherwise string assumed to be a search term
  } else {
    const term = encodeURIComponent(arg);
    url = Action.preferences.jiraBase 
        + Action.preferences.jiraQuery.replaceAll('<q>', term);
  }
      
  LaunchBar.debugLog("URL " + url);
  LaunchBar.openURL(url);
}
