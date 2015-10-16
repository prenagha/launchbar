var ALERT_ICON = '/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/AlertStopIcon.icns';
var PB = 'com.parallels.desktop.console';
var PLUGIN = false;
var LIST = /^\s*([^\s]+)\s+([^\s]+)\s+([^\s]+)\s+(.*)$/;

// idea from https://github.com/bigluck/alfred2-parallels

function setupPreferences() {
  if (!Action.preferences.prlctlPath)
    Action.preferences.prlctlPath = '/usr/local/bin/prlctl';
  if (!Action.preferences.capturePath)
    Action.preferences.capturePath = '/Desktop/';
    
  if (Action.preferences.pluginFile && Action.preferences.pluginFile.length > 5) {
    LaunchBar.log("Loading plugin from " + Action.preferences.pluginFile);
    include(Action.preferences.pluginFile);
    PLUGIN = true;
  }
}

function editPreferences() {
  LaunchBar.openURL('file://' + encodeURI(Action.supportPath + '/Preferences.plist'));
}

function run() {
  try {    
    setupPreferences();
    
    var items = [];              
    var output = LaunchBar.execute(Action.preferences.prlctlPath, 'list', '-a', '--no-header');
    LaunchBar.debugLog('Output ' + output);
    var lines = output.split("\n");
    for (var i = 0; i < lines.length; i++) {
      if (lines[i].length < 10)
        continue;
      var match = LIST.exec(lines[i]);
      if (match == null) {
        LaunchBar.alert('Unrecognized line ' + lines[i]);
        continue;
      }
      
      var vm = {};
      vm.uuid = match[1];
      vm.status = match[2].substring(0,1).toUpperCase() + match[2].substring(1);
      vm.ipaddress = match[3] === '-' ? "" : match[3];
      vm.name = match[4];
      vm.icon = PB+':pvm.icns';
      vm.children = [];

      vm = parse(vm);
      if (vm && vm.name && vm.name.length > 1) {                
        items.push({
           title: vm.name
          ,subtitle: vm.status
          ,alwaysShowsSubtitle: true
          ,icon: vm.icon
          ,children: vm.children
        });      
      }
    }

    if (LaunchBar.options.alternateKey) {
      items.push({title: 'Edit Preferences', icon: "Pref_Advanced.icns", action: "editPreferences"});
      items.push({title: 'Parallels Website', url: 'http://www.parallels.com/', icon:PB});
    }
        
    return items;
    
  } catch (exception) {
    LaunchBar.log('Error ' + exception);
    LaunchBar.alert('Error', exception);
  }
}

function parse(vm) {
  if (vm.status === 'Running') {
    vm.children.push({title:'Pause ' + vm.name,icon:'pauseTemplate.pdf',actionRunsInBackground:true
      ,action:'vmCommand',uuid:vm.uuid,cmd:'pause'});
    vm.children.push({title:'Suspend ' + vm.name,icon:'suspendTemplate.pdf',actionRunsInBackground:true
      ,action:'vmCommand',uuid:vm.uuid,cmd:'suspend'});
    vm.children.push({title:'Stop ' + vm.name,icon:ALERT_ICON,actionRunsInBackground:true
      ,action:'vmCommand',uuid:vm.uuid,cmd:'stop'});
    vm.children.push({title:'Capture Screen ' + vm.name,icon:'PhotoAlbum.icns'
      ,action:'capture',uuid:vm.uuid});
  } else if (vm.status === 'Suspended' || vm.status === 'Paused') {
    vm.children.push({title:'Resume ' + vm.name,icon:'playTemplate.pdf',actionRunsInBackground:true
      ,action:'vmCommand',uuid:vm.uuid,cmd:'resume'});
  } else if (vm.status === 'Stopped') {
    vm.children.push({title:'Start ' + vm.name,icon:'playTemplate.pdf',actionRunsInBackground:true
      ,action:'vmCommand',uuid:vm.uuid,cmd:'start'});
  }
  
  if (PLUGIN)
    return pluginParse(vm);
    
  return vm;
}

function capture(item) {
  try {
    var dt = LaunchBar.execute('/bin/date', '+%Y%m%d_%H%M%S');
    var file = 'capture_' + dt + '.png';
    var path = LaunchBar.homeDirectory + Action.preferences.capturePath + file;
    LaunchBar.debugLog('Capture ' + path);
    LaunchBar.execute(Action.preferences.prlctlPath, 'capture', item.uuid, '--file', path);
    return {title:file,path:path,icon:item.icon}
  } catch (exception) {
    LaunchBar.log('Error VM Capture ' + path + ' ' + exception);
    LaunchBar.alert('Error VM Capture ' + path, exception);
  }
}

function vmCommand(item) {
  try {
    LaunchBar.debugLog('VM Command ' + item.cmd + ' ' + item.uuid);
    LaunchBar.execute(Action.preferences.prlctlPath, item.cmd, item.uuid);
  } catch (exception) {
    LaunchBar.log('Error VM Command ' + item.cmd + ' ' + item.uuid + ' ' + exception);
    LaunchBar.alert('Error VM Command ' + item.cmd + ' ' + item.uuid, exception);
  }
}
