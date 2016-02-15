#!/bin/bash
#
# from http://www.alecjacobson.com/weblog/?p=3816
#
gcc -Wall -g -O3 -ObjC -framework Foundation -framework AppKit -o imgcopy imgcopy.m
