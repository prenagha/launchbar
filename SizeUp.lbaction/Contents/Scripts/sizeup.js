
var ALERT_ICON = 'font-awesome:fa-exclamation-triangle';

var COMMANDS = [];
COMMANDS.push({'title': 'Left', 'arg': 'Left', 'icon': 'align-left@2x.png'});
COMMANDS.push({'title': 'Right', 'arg': 'Right', 'icon': 'align-right@2x.png'});
COMMANDS.push({'title': 'Up', 'arg': 'Up', 'icon': 'align-up@2x.png'});
COMMANDS.push({'title': 'Down', 'arg': 'Down', 'icon': 'align-down@2x.png'});

function run() {
  output = [];  
  for (var i = 0; i < COMMANDS.length; i++) {
    c = COMMANDS[i];
    output.push(
      {'title': c.title
      ,'icon': 'com.irradiatedsoftware.SizeUp:' + c.icon
      ,'action': 'go'
      ,'actionArgument': c.arg
      ,'actionRunsInBackground': true
    });
  }
  return output;
}

function go(command) {
}

function err(msg, file) {
  var m = 'ERROR: ' + msg;
  LaunchBar.log(m);
  return [{'title': m, 
    'icon': ALERT_ICON, 
    path: file, 
    subtitle: file}];
}
 