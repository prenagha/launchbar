# Action Updates Action

Custom Actions are a great part of LaunchBar. But keeping them up to date is difficult. This action helps by trying to check the most current version of each custom action compared to the version you have installed. If they are different it will tell you that a newer version is available.

## Preferences
This action relies on a URL specified in the `/LBDescription/LBUpdate` key in `Info.plist` pointing to the `Info.plist` of most current version of the custom action.
Actions may *optionally* specify the download URL for the package of the latest version of the action using the `/LBDescription/LBDownload` `Info.plist` key.

You may override/specify the Update URL for any action you have installed by setting a preference in this action's local preferences file 
`~/Library/Application Support/LaunchBar/Action Support/com.renaghan.launchbar.Updates/Preferences.plist`

You may also tell this action that a custom action should be skipped by setting the LBUpdate URL to `SKIP` in this action's local preferences file.

The action will search for custom actions in `~/Application Support/LaunchBar/Actions`. You may override this by setting a local `ActionsDir` preference.

The action will attempt to download newer action versions when possible. It will download to `~/Downloads`. You may override this by setting a local `DownloadDir` preference. Set this preference to `SKIP` to disable downloading entirely.

## Preferences Example
```
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>LBUpdate</key>
	<dict>
		<key>at.mlinzner.LaunchBar.action.KeyboardMaestro</key>
		<string>https://raw.githubusercontent.com/mlinzner/LaunchBarActions/master/actions/Keyboard%20Maestro/Keyboard%20Maestro%20Macros.lbaction/Contents/Info.plist</string>
		<key>at.obdev.LaunchBar.action.TweetbotSearch</key>
		<string>https://raw.githubusercontent.com/mlinzner/LaunchBarActions/master/actions/Tweetbot%20Search/Tweetbot%20Search.lbaction/Contents/Info.plist</string>
		<key>eu.weiel.BatteryDetails</key>
		<string>SKIP</string>
		<key>eu.weiel.action.SafariTabs</key>
		<string>SKIP</string>
	</dict>
</dict>
</plist>
```

## Action Info.plist Example
```
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  ...
	<key>LBDescription</key>
	<dict>
	  ...
	  <key>LBUpdate</key>
	  <string>https://raw.githubusercontent.com/jsmith/launchbar/master/Checker.lbaction/Contents/Info.plist</string>
	  <key>LBDownload</key>
	  <string>https://dl.dropboxusercontent.com/u/55/lbdist/Checker.lbaction</string>
	</dict>
</dict>
</plist>
```
