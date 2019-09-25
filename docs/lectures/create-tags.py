#!/usr/bin/env python

import os, sys, json, collections

# Read all the tags and output an HTML file with the proper links.

tags = collections.defaultdict(list)
for path in ['overview', 'learning1', 'learning2', 'learning3', 'search1', 'search2', 'mdp1', 'mdp2', 'games1', 'games2', 'csp1', 'csp2', 'bayes1', 'bayes2', 'bayes3', 'logic1', 'logic2', 'logic3', 'conclusion']:
    path += '.tags.json'
    if not os.path.exists(path): continue
    for tag, refs in json.load(open(path)).items():
        tags[tag].extend(refs)

out = open('tags.html', 'w')
for tag in sorted(tags.keys()):
    refs = tags[tag]
    refs = ['<a href="index.html#include=%s&slideId=%s">%s</a>' % (file, slideId, file.replace('.js', '')) for file, slideId in refs]
    print >>out, '<b>%s</b>: %s<br>' % (tag, ' '.join(refs))
out.close()
