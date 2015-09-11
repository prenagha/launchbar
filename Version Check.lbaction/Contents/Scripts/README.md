# Version Check Action

Custom Actions are a great part of LaunchBar. But keeping them up to date is difficult. This action helps by trying to check the most current version of each custom action compared to the version you have installed. If they are different it will tell you that a newer version is available.

## Update URL
This action relies on a URL pointing to the Info.plist of most current version of the custom action.

A custom action can tell this action that URL by
* `LBUpdateURL` property in Info.plist
* `LBDescription/LBUpdateURL` property in Info.plist
* `LBDescription/UpdateURL` property in Info.plist
* If the `LBDescription/LBWebsite` property contains `github.com` then this action guesses at what the Info.plist URL is 
`https://raw.githubusercontent.com/[user]/[repo]/master/[action file]/Contents/Info.plist`

You may specify the Update URL for any action you have installed by setting a preference in this action's local preferences file 
`~/Library/Application Support/LaunchBar/Action Support/com.renaghan.launchbar.Version/Preferences.plist`

## Preferences Example

```
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>UpdateURL</key>
	<dict>
		<key>at.mlinzner.LaunchBar.action.KeyboardMaestro</key>
		<string>https://raw.githubusercontent.com/mlinzner/LaunchBarActions/master/actions/Keyboard%20Maestro/Keyboard%20Maestro%20Macros.lbaction/Contents/Info.plist</string>
		<key>at.obdev.LaunchBar.action.TweetbotSearch</key>
		<string>https://raw.githubusercontent.com/mlinzner/LaunchBarActions/master/actions/Tweetbot%20Search/Tweetbot%20Search.lbaction/Contents/Info.plist</string>
		<key>eu.weiel.BatteryDetails</key>
		<string>SKIP</string>
		<key>eu.weiel.action.SafariTabs</key>
		<string>SKIP</string>
		<key>nbjahan.launchbar.livedic</key>
		<string>https://raw.githubusercontent.com/nbjahan/launchbar-livedic/master/src/Info.plist</string>
		<key>nbjahan.launchbar.spotlight</key>
		<string>https://raw.githubusercontent.com/nbjahan/launchbar-spotlight/master/src/Info.plist</string>
	</dict>
</dict>
</plist>
```