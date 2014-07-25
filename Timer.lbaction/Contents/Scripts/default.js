
function runWithString(string) {
  return go(string);
}

function runWithItem(item) {
  return go(item.title);
}

function go(str) {
  if (!str || str == undefined || str.length == 0) {
    return {'title':'Reminder is empty','icon':'NotFound.icns'};
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
    
    return {'title': 'Reminder in ' + delay
      ,'subtitle': remind
      ,'icon':'clock.pdf'};
  
  } catch (exception) {
    return {'title': 'Timer Error ' + exception};
  }
}
