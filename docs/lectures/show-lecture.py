#!/usr/bin/env python

import os, sys

path = os.path.dirname(sys.argv[1])
javascript = os.path.basename(sys.argv[1])
browser = sys.argv[2] if len(sys.argv) > 2 else 'google-chrome'

# Run with authentication to enable quizzes
auth = open(os.path.join(os.path.dirname(sys.argv[0]), '../authentication.txt')).read().strip()

cmd = '%s \'file://%s/%s/index.html#include=%s&auth=%s\'' % \
    (browser, os.getcwd(), path, javascript, auth)
print cmd
os.system(cmd)
