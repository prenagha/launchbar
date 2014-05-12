
function runWithString(string) {
  return go(string);
}

function runWithItem(item) {
  return go(item.title);
}

function go(str) {
  if (!str || str == undefined || str.length == 0) {
    LaunchBar.alert('Empty input');
  }
  try {  
  
    var parts = str.split(' ');
    var delay = parts.pop();
    var remind = parts.join(' ');
    LaunchBar.displayInLargeType({
      'title' : 'Reminder',
      'string' : remind,
      'sound' : 'Tink',
      'delay': delay
    });
  
  } catch (exception) {
    LaunchBar.log('Timer Error ' + exception);
    LaunchBar.alert('Timer Error', exception);
  }
}
