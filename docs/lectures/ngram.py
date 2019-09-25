#!/usr/bin/env python

import nltk
import random
import sys

sentences = []
lastLine = ''
sentence = []
numLines = 0
for line in open('fab.mb.txt'):
  line = line.rstrip()
  #if len(line) > 0 and len(line) < 60: continue
  #if line.startswith('----------------'): continue
  if lastLine == '':
    if len(sentence) > 0 and numLines > 1: sentences.append(sentence) 
    sentence = []
    numLines = 0
  if line != '':
    for word in nltk.word_tokenize(line):
      sentence.append(word.lower())
    numLines += 1
  lastLine = line
if len(sentence) > 0 and numLines > 1: sentences.append(sentence) 

#print sentences
#sentences = [['the', 'wolf', 'cried'], ['the', 'boy', 'ate']]

def estimateModel(order):
  counts = {} # history -> word -> count
  for sentence in sentences:
    sentence = (['-BEGIN-'] * (order-1)) + sentence + ['-END-']
    for i in range(len(sentence)):
      for o in range(1, order+1):
        history = '_'.join(sentence[max(i-o+1,0):i])
        distrib = counts[history] = counts.get(history, {})
        w = sentence[i]
        distrib[w] = distrib.get(w, 0) + 1

  for history, distrib in counts.items():
    z = 1.0 * sum(value for word, value in distrib.items())
    for word, value in distrib.items(): distrib[word] = value/z 
    for word, value in sorted(distrib.items(), key=lambda pair : -pair[1]):
      #print history, word, value
      pass
  return counts

def sampleMultinomial(distrib):
  target = random.random() 
  accum = 0
  for key, value in distrib.items():
    accum += value
    if accum > target:
      return key
  raise 'Bad: '+distrib

while True:
  print '> ',
  line = sys.stdin.readline()
  if not line: break
  order, = line.split(' ')
  order = int(order)
  counts = estimateModel(order)
  gen = ['-BEGIN-'] * (order-1)
  for i in range(1000):
    for o in reversed(range(1, order+1)):
      history = '_'.join(gen[max(0,len(gen)-o+1):len(gen)])
      #print 'history', history
      distrib = counts.get(history, {})
      if len(distrib) > 0:
        w = sampleMultinomial(distrib)
        #print 'GEN', history, w
        gen.append(w)
        break
    if gen[-1] == '-END-': break
  print ' '.join(gen[order-1:-1])
