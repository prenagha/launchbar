
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
      
    LaunchBar.executeAppleScriptFile('./dismiss.scpt',
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
