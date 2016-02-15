#import <Foundation/Foundation.h>
#import <Cocoa/Cocoa.h>
#import <unistd.h>

// from http://www.alecjacobson.com/weblog/?p=3816

BOOL copy_to_clipboard(NSString *path)
{
  // http://stackoverflow.com/questions/2681630/how-to-read-png-image-to-nsimage
  NSImage * image;
  image =  [[NSImage alloc] initWithContentsOfFile:path];

  // http://stackoverflow.com/a/18124824/148668
  BOOL copied = false;
  if (image != nil) {
    NSPasteboard *pasteboard = [NSPasteboard generalPasteboard];
    [pasteboard clearContents];
    NSArray *copiedObjects = [NSArray arrayWithObject:image];
    copied = [pasteboard writeObjects:copiedObjects];
  }
  
  [image release];
  return copied;
}

int main(int argc, char * const argv[]) {
  NSAutoreleasePool *pool = [[NSAutoreleasePool alloc] init];
  if(argc<1) {
    printf("Usage: Copy file to clipboard: ./imgcopy path/to/file\n\n");
    return EXIT_FAILURE;
  }
  NSString *path= [NSString stringWithUTF8String:argv[1]];
  BOOL success = copy_to_clipboard(path);
  [pool release];
  return (success?EXIT_SUCCESS:EXIT_FAILURE);
}