G = sfig.serverSide ? global : this;
G.prez = presentation();

add(slide('Final project',
  parentCenter('Task definition'),
  parentCenter('Approach'),
  parentCenter('Analysis'),
_));

add(slide('Task definition',
  bulletedText(stmt('Topic: anything you\'re excited about (games, music, recommendation systems, optimizing society, personal productivity); see website for ideas; must be well-motivated; okay if done before')),
  bulletedText(stmt('Scope: not too broad (building an AI that organizes your life), not too narrow (training linear classifier for standard dataset)')),
  bulletedText(stmt('Evaluation metric: quantitative measure of success; speed? accuracy? user studies?')),
  bulletedText(stmt('Dataset: manually create 3-10 examples, scrape data, and/or create simulator')),
_));

add(slide('Approach',
  bulletedText(stmt('Baseline: simple method (logistic regression with SGD); reveals challenges to tackle; provides lower bound on performance')),
  bulletedText(stmt('Oracle: "cheating" method that is unrealistically optimistic (if trying to speed up X, assume X takes zero time; replace test error with training error); provides upper bound on performance')),
  bulletedText(stmt('Centerpiece: develop approaches that make sense for the task; try to keep things simple')),
_));

add(slide('Analysis',
  bulletedText(stmt('Think like a scientist: ask questions and answer them (e.g., does your method work better than the baseline when there are few training examples?)')),
  bulletedText(stmt('Error analysis: show concrete examples and categorize errors, suggest future work')),
  bulletedText(stmt('Literature review: compare with other pieces of work at a technical level; simulate them if possible (e.g., if they don\'t use X, then strip out X from your approach)')),
_));

add(slide('Example task definition',
  parentCenter(image('images/google-news-articles.png').width(500)),
  bulletedText(stmt('Task: automatically illustrate a news article with images (motivation: pictures make reading more fun)')),
  bulletedText(stmt('Scope: focus on single paragraphs from Google News')),
  bulletedText(stmt('Evaluation metric: given two paragraphs and their two correct images, figure out which one is which (simplified)')),
  bulletedText(stmt('Dataset: scrape 5000 articles from Google News')),
_));

add(slide('Example approach',
  //parentCenter(image('images/google-news-articles.png').width(300)),
  bulletedText(stmt('Baseline: for each image, run standard object detector; return image with highest overlap with words in paragraph')),
  bulletedText(stmt('Oracle: have multiple humans do it and measure agreement')),
  bulletedText(stmt('Baseline-oracle: run baseline assuming perfect object recognition')),
  bulletedText(stmt('Algorithms: (i) predict an object (or n/a) for each word in the paragraph, perform word similarity with objects detected from images; or (ii) Google image search using words from paragraph for candidate images and perform object similarity')),
_));

add(slide('Example analysis',
  bulletedText(stmt('Question: which is more reliable, word similarity or object similarity?')),
  bulletedText(stmt('Question: which types of articles are easier?  concrete events easier than abstract topics')),
  bulletedText(stmt('Question: was the model able to figure out which words are relevant? common nouns are easy, but sometimes spurious correlations get in the way')),
_));

add(slide('Machine learning "versus" AI',
  stmt('Wrong question: Can I just do a "machine learning" project, or do I have to do an "AI" project?'),
  pause(),
  stmt('Way to think about it'),
  bulletedText('Machine learning applied to various models (reflex, state-based, variable-based)'),
  bulletedText('Strongly encourage to apply to non-reflex models'),
  pause(),
  stmt('Examples'),
  bulletedText('Predict eye gaze given images (correlations across time)'),
  bulletedText('Recommend news articles (recommend a set of articles)'),
  bulletedText('Generate blog posts'),
  pause(),
  parentCenter(redbold('always solving collection of related prediction problems')),
_));

add(slide('Using same project in other classes',
  bulletedText('Encourage sharing code/data across classes'),
  bulletedText('Ideally, would explore different aspects of classes'),
  parentCenter(ytable(
    xtable(frameBox('CS221'), frameBox('CS229')),
    frameBox('common code/data'),
  _).center()),
  pause(),
  bulletedText('Cite what you did / turned in for each class'),
  bulletedText('Expectations are higher if sharing between classes'),
_));

add(slide('Project proposal',
  parentCenter(nowrapText(tt('http://web.stanford.edu/class/cs221/project.html#p-proposal'))).scale(0.7),
  pause(),
  bulletedText('Define input-output behavior; give <b>concrete example</b>'),
  parentCenter(
    stagger(
      xtable('image', bigRightArrow(), 'object category').center().margin(10),
      xtable(image('images/cat.jpg').width(100), bigRightArrow(), 'cat').center().margin(10),
    _).center(),
  _),
  pause(),
  bulletedText('Have <b>baseline</b> and <b>oracle</b> implemented'),
  bulletedText('Discuss potential solutions (modeling, inference, learning)'),
  pause(),
  parentCenter(redbold('due Friday May 04')),
  parentCenter('Get help: come to office hours!'),
_));

initializeLecture();
