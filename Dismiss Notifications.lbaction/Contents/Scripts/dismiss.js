
function run(arg) {
  try {
    if (!Action.preferences.snoozeButtonName)
      Action.preferences.snoozeButtonName = "Snooze";
    if (!Action.preferences.whenIsNowText)
      Action.preferences.whenIsNowText = "now";
    if (!Action.preferences.closeButtonName)
      Action.preferences.closeButtonName = "Close";
    if (!Action.preferences.okButtonName)
      Action.preferences.okButtonName = "OK";
    if (!Action.preferences.numbersInConferenceCall)
      Action.preferences.numbersInConferenceCall = 14;
      
    let ascript = Action.path + '/Contents/Scripts/dismiss.scpt';
    if (!File.exists(ascript)) {
      ascript = Action.path + '/Contents/Scripts/dismiss.applescript';
    }
    if (!File.exists(ascript)) {
      LaunchBar.alert('Error', 'Applescript not found ' + ascript);
    }
    
    LaunchBar.executeAppleScriptFile(ascript,
       Action.preferences.snoozeButtonName
      ,Action.preferences.whenIsNowText
      ,Action.preferences.closeButtonName
      ,Action.preferences.okButtonName
      ,Action.preferences.numbersInConferenceCall
    );

  } catch (exception) {
    LaunchBar.log('Error ' + exception);
    LaunchBar.alert('Error', exception);
  }
}
