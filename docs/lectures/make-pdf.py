#!/usr/bin/python

# Usage: ./make-pdf.py overview.js learning1.js ...
import os, sys

def run(cmd):
    print cmd
    if os.system(cmd) != 0:
        sys.exit(1)

for prefix in sys.argv[1:]:
    prefix = prefix.replace('.js', '') 
    jsPath = prefix + '.js'
    pdfPath = prefix + '.pdf'
    smallPdfPath = prefix + '-6pp.pdf'

    run("node index.js " + jsPath)
    run('pdfjam --paper letter --nup 2x3 %s --outfile %s' % (pdfPath, smallPdfPath))
