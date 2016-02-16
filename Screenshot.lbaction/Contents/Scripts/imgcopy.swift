// copy an image file to the clipboard
// inspired by http://www.alecjacobson.com/weblog/?p=3816
import Cocoa

let argCount = Process.arguments.count
if argCount > 1 {
  for path in Process.arguments[1..<argCount] {
    if let img = NSImage(contentsOfFile: path) {
      let clipboard = NSPasteboard.generalPasteboard()
      clipboard.clearContents()
      if !clipboard.writeObjects([img]) {
        print("Cannot copy file", path)
        exit(1)
      }
    } else {
      print("Cannot read file", path)
      exit(1)
    }
  }
}
exit(0)
