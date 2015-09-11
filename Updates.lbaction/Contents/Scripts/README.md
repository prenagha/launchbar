# Action Updates Action

Custom Actions are a great part of LaunchBar. But keeping them up to date is difficult. This action helps by trying to check the most current version of each custom action compared to the version you have installed. If they are different it will tell you that a newer version is available.

## Update URL
This action relies on a URL specified in the `/LBDescription/LBUpdateInfo` key in `Info.plist` pointing to the `Info.plist` of most current version of the custom action.
Actions may additionally specify the download URL for the `.lbaction` file package of the latest version of the action using the `/LBDescription/LBUpdateDownload` `Info.plist` key.

You may override/specify the Update URL for any action you have installed by setting a preference in this action's local preferences file 
`~/Library/Application Support/LaunchBar/Action Support/com.renaghan.launchbar.Updates/Preferences.plist`

## Preferences Example

```
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>LBUpdateInfo</key>
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