
function run() {
  try {
    var audioJson = LaunchBar.execute('/bin/bash', 'audio.sh');
    LaunchBar.debugLog('Output ' + audioJson);
    var audio = JSON.parse(audioJson);
    
    var items = [];

    if (audio.outputs && audio.outputs.length > 0) {
      for (var i = 0; i < audio.outputs.length; i++) {
        var output = audio.outputs[i];
        items.push({
          'title': (output == audio.currentOutput ? "* " : "") + output,
          'typ': 'output',
          'name': output,
          'action': 'switchto',
          'actionReturnsItems': true,
          'icon':'headphones.icns'});
      }
    } else {
      LaunchBar.log('Audio outputs not available');
    }
    
    if (audio.inputs && audio.inputs.length > 0) {
      for (var i = 0; i < audio.inputs.length; i++) {
        var input = audio.inputs[i];
        items.push({
          'title': (input == audio.currentInput ? "* " : "") + input,
          'typ': 'input',
          'name': input,
          'action': 'switchto',
          'actionReturnsItems': true,
          'icon':'microphone.icns'});
      }
    } else {
      LaunchBar.log('Audio inputs not available');
    }
              
    return items;
  } catch (exception) {
    LaunchBar.log('Error ' + exception);
    LaunchBar.alert('Error', exception);
  }
}

function switchto(item) {
  try {
    var rtn = LaunchBar.execute('/bin/bash', 'audio.sh', item.name, item.typ);
    LaunchBar.debugLog('Output switch ' + rtn);
    return run();
  } catch (exception) {
    LaunchBar.log('Error switching ' + exception);
    LaunchBar.alert('Error switching', exception);
  }
}
