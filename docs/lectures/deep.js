G = sfig.serverSide ? global : this;
G.prez = presentation();

addTextLatexMacros('Encode Decode Corrupt'.split(' '));

G.vectorBox = function(label, numRows, numCols, color) { 
  if (!numRows) numRows = 6;
  if (!numCols) numCols = 1;
  if (!color) color = 'red';
  var dots = new Table(wholeNumbers(numRows).map(function() {
    return wholeNumbers(numCols).map(function() {
      return circle(10).fillColor(color).fillOpacity(0.5);
    });
  })).margin(5);
  var box = frameBox(dots).padding(1).bg.strokeWidth(2).end.scale(0.6);
  return ytable(
    label ?  std(label).orphan(true) : _,
    box,
  _).center().margin(5);
}

add(titleSlide('Lecture 18: Deep Learning',
  nil(),
  parentCenter(image('images/learning.png').width(300)),
_));

add(slide('Google Trends',
  parentCenter('Query: deep learning'),
  parentCenter(image('images/deep-learning-google-trends.png').width(600)),
_));

add(slide('Speech recognition (2009-2011)',
  parentCenter(image('images/speech-results.png').width(550)),
  bulletedText('Steep drop in WER due to deep learning'),
  bulletedText('IBM, Google, Microsoft all switched over from GMM-HMM'),
_).leftHeader('[figure from Li Deng]'));

add(slide('Object recognition (2012)',
  parentCenter(image('images/imagenet-results.png').width(600)),
  bulletedText('Landslide win in ILSVRC object recognition competition'),
  bulletedText('Computer vision community switched to CNNs'),
  bulletedText('Simpler than hand-engineered features (SIFT)'),
_).leftHeader('[Krizhevsky et al., 2012, a.k.a. AlexNet]'));

add(slide('Go (2016)',
  parentCenter(xtable(
    image('images/alpha-go.jpg'),
    image('images/tree-search.png').width(400)).margin(30).center(),
  _),
  bulletedText('Defeated world champion Le Sedol 4-1'),
  bulletedText('Simple architecture (in contrast, DeepBlue was search + hand-crafted heuristics)'),
  bulletedText('2017: AlphaGoZero does not require human expert games as supervision'),
_).leftFooter('[Silver et al., 2016]'));

/*
https://research.googleblog.com/2016/09/a-neural-network-for-machine.html
*/
add(slide('Machine translation (2016)',
  parentCenter(xtable(
    image('images/google-translations.png').width(400),
    image('images/google-nmt.png').scale(0.5),
  _).margin(20).center()),
  bulletedText('Decisive wins have taken longer to achieve in NLP (words are meaningful in a way that pixels are not)'),
  bulletedText('Current state-of-the-art in machine translation'),
  bulletedText('Simpler architecture (throw out word alignment, phrases tables, language models)'),
_).leftFooter('[Sutskever et al. 2014; Wu et al, 2016]'));

add(slide('What is deep learning?',
  stmt('Philosophy: learn high-level abstractions automatically'),
  parentCenter(image('images/feature-hierarchy.png').width(300)),
_).leftHeader('[figure from Honglak Lee]'));

add(slide('A brief history',
  headerList(null,
    stmt('1950-60s: modeling brain using neural networks (Rosenblatt, Hebb, etc.)'),
    stmt('1969: research stagnated after Minsky and Papert\'s paper'),
    stmt('1986: popularization of backpropagation by Rumelhardt, Hinton, Williams'),
    stmt('1990s: convolutional neural networks (LeCun)'),
    stmt('1990s: recurrent neural networks (Schmidhuber)'),
    stmt('2006: revival of deep networks (Hinton et al.)'),
    stmt('2013-: massive industrial interest'),
  _),
  pause(),
  stmt('Key problem: was difficult to get training multi-layer neural networks to work!'),
_));

add(slide('What\'s different today',
  parentCenter(table(
    ['Computation (time/memory)', pause(), 'Information (data)'], pause(-1),
    [image('images/datacenter.jpg').dim(200), pause(), image('images/books.jpg').dim(200)],
  _).margin(50).center()),
  pause(),
  parentCenter('Deep learning is fundamentally empirical'),
_));

FEEDFORWARD = 0;
UNSUPERVISED = 1;
CONVOLUTIONAL = 2;
RECURRENT = 3;
CONSIDERATIONS = 4;

function roadmap(i) {
  add(outlineSlide('Roadmap', i, [
    ['feedforward', 'Supervised learning'],
    ['unsupervised', 'Unsupervised learning'],
    ['convolutional', 'Convolutional neural networks'],
    ['recurrent', 'Recurrent neural networks'],
    ['considerations', 'Final remarks'],
  ]));
}

////////////////////////////////////////////////////////////
roadmap(FEEDFORWARD);

learnFramework(2);

add(slide('Review: optimization',
  stmt('Regression'),
  parentCenter('$\\Loss(x, y, \\theta) = (f_\\theta(x) - y)^2$'),
  pause(),
  keyIdea('minimize training loss',
    parentCenter('$\\displaystyle \\TrainLoss(\\theta) = \\frac1{|\\Train|} \\sum_{(x,y) \\in \\Train} \\Loss(x, y, \\theta)$'),
    parentCenter('$\\displaystyle \\min_{\\theta \\in \\R^d} \\TrainLoss(\\theta)$'),
  _).content.margin(20).end.scale(0.8),
  pause(),
  algorithm('stochastic gradient descent',
    'For $t = 1, \\dots, T$:',
    indent('For $(x,y) \\in \\Train$:'),
    indent(indent('$\\theta \\leftarrow \\theta - \\eta_t \\blue{\\nabla_\\theta \\Loss(x, y, \\theta)}$')),
  _).scale(0.8),
_));

add(slide('Review: linear predictors',
  parentCenter(linearPredictor({rawx: true, out: '$f_\\theta(x)$'}), 40),
  stmt('Output'),
  parentCenter('$f_\\theta(x) = \\blue{\\w} \\cdot x$'),
  stmt('Parameters: $\\theta = \\w$'),
_));

add(slide('Review: neural networks',
  parentCenter(neuralNetwork(0, {rawx: true, out: '$f_\\theta(x)$'}), 40),
  pause(-1),
  stmt('Intermediate hidden units'),
  parentCenter(xtable(
    '$h_j(x) = \\red{\\sigma}(\\blue{\\v_j} \\cdot x)$',
    '$\\red{\\sigma}(z) = (1 + e^{-z})^{-1}$',
  _).center().margin(30)),
  pause(),
  stmt('Output'),
  parentCenter('$f_\\theta(x) = \\blue{\\w} \\cdot \\h(x)$'),
  stmt('Parameters: $\\theta = (\\V, \\w)$'),
_).leftHeader(image('images/logistic.png').height(150)));

add(slide('Summary so far',
  stmt('Neural network predictor: $f_\\theta(x) = \\w \\cdot \\sigma(\\V x)$'),
  stmt('Squared loss: $\\Loss(x, y, \\theta) = (f_\\theta(x) - y)^2$'),
  pause(),
  stmt('Next step: compute the gradient $\\nabla_\\theta \\Loss(x, y, \\theta)$'),
_));

T = function() {
  return rootedTree.apply(null, arguments).recmargin(50, 50);
}
B = rootedTreeBranch;
C = function(label, node) {
  if (label[0] == '$') label = label.substring(1, label.length-1);
  label = '$\\green{' + label + '}$';
  return B(opaquebg(label).scale(0.7).showLevel(1), node);
}
Leaf = function(x) { return T(x).nodeBorderWidth(0); }
opPlus = '$\\,+\\,$';
opMinus = '$\\,-\\,$';
opDot = '$\\,\\cdot\\,$';
opLogistic = '$\\,\\sigma\\,$';
opMax = '$\\,\\text{max}\\,$';
opSquare = '$(\\cdot)^2$';

add(slide('Basic building blocks',
  parentCenter(xtable(
    T(opPlus, C('1', Leaf('$a$')), C('1', Leaf('$b$'))),
    T(opMinus, C('1', Leaf('$a$')), C('-1', Leaf('$b$'))),
    T(opDot, C('b', Leaf('$a$')), C('a', Leaf('$b$'))),
  _).margin(100)),
  parentCenter(xtable(
    T(opMax, C('\\1[a > b]', Leaf('$a$')), C('\\1[a < b]', Leaf('$b$'))).recxmargin(200),
    T(opLogistic, C('$\\sigma(a) (1 - \\sigma(a))$', Leaf('$a$'))),
  _).margin(100)),
_).leftHeader(image('images/bricks.jpg')));

add(slide('Composing functions',
  parentCenter(overlay(
    out = T(
      '$\\text{function}_2$', C('$\\frac{\\partial \\text{out}}{\\partial \\text{mid}}$',
      mid = T('$\\text{function}_1$', C('$\\frac{\\partial \\text{mid}}{\\partial \\text{in}}$', Leaf('$\\text{in}$')))),
    _).recymargin(100),
    moveLeftOf('$\\text{out}$', out.headBox),
    moveLeftOf('$\\text{mid}$', mid.headBox),
  _)),
  stmt('Chain rule'),
  parentCenter('$\\green{\\frac{\\partial \\text{out}}{\\partial \\text{in}} = \\frac{\\partial \\text{out}}{\\partial \\text{mid}} \\frac{\\partial \\text{mid}}{\\partial \\text{in}}}$'),
_).leftHeader(image('images/castle.jpg')));

add(slide('Computing the gradient',
  parentCenter('$\\displaystyle \\Loss(x, y, \\w) = \\left(\\sum_{j=1}^k w_j \\sigma(\\v_j \\cdot \\phi(x)) - y\\right)^2$').scale(0.9),
  'Assume labels $\\{1,2,3\\}$ and correct label is $y = 1$',
  parentCenter(neuralNetworkGradientDiagram()).scale(0.45),
_));

add(slide(null,
  nil(),
  parentCenter('[Andrej Karpathy\'s demo]').linkToUrl('http://cs.stanford.edu/people/karpathy/svmjs/demo/demonn.html'),
_));

add(slide('Deep neural networks',
  stmt('1-layer neural network'),
  parentCenter(xtable(
    '$\\text{score} =$',
    vectorBox('$\\w^\\top$', 1, 6, 'blue'),
    vectorBox('$x$', 6),
  _).center().margin(5)),
  pause(),
  stmt('2-layer neural network'),
  parentCenter(xtable(
    '$\\text{score} =$',
    vectorBox('$\\w^\\top$', 1, 3, 'blue'),
    '$\\sigma($',
    vectorBox('$\\V$', 3, 6, 'blue'),
    vectorBox('$x$', 6),
    '$)$',
  _).center().margin(5)),
  pause(),
  stmt('3-layer neural network'),
  parentCenter(xtable(
    '$\\text{score} =$',
    vectorBox('$\\w^\\top$', 1, 3, 'blue'),
    '$\\sigma($',
    vectorBox('$\\mathbf U$', 3, 4, 'blue'),
    '$\\sigma($',
    vectorBox('$\\V$', 4, 6, 'blue'),
    vectorBox('$x$', 6),
    '$)$',
    '$)$',
  _).center().margin(5)),
  parentCenter('...'),
_));

add(slide('Depth',
  parentCenter(xtable(
    vectorBox('$x$', 6), thickRightArrow(50),
    vectorBox('$h$', 5), thickRightArrow(50),
    vectorBox('$h\'$', 4), thickRightArrow(50),
    vectorBox('$h\'\'$', 4), thickRightArrow(50),
    vectorBox('$h\'\'\'$', 3), thickRightArrow(50),
    vectorBox('$f_\\theta(x)$', 1),
  _).center().margin(5)),
  pause(),
  stmt('Intuitions'),
  bulletedText('Hierarchical feature representations'),
  pause(),
  bulletedText('Can simulate a bounded computation logic circuit (original motivation from McCulloch/Pitts, 1943)'),
  bulletedText('Learn this computation (and potentially more because networks are real-valued)'),
  pause(),
  bulletedText('Depth $k+1$ logic circuits can represent more than depth $k$ (counting argument)'),
  bulletedText('Formal theory/understanding is still incomplete'),
_));

add(summarySlide('Supervised learning',
  bulletedText('Construct deep neural networks by composing non-linearities ($\\sigma$) and linear transformations (matrix multiplication)'),
  bulletedText('Train via SGD, use backpragation to compute gradients'),
  bulletedText('Non-convex optimization, but works empirically given enough compute and data'),
_));

////////////////////////////////////////////////////////////
roadmap(UNSUPERVISED);

add(slide('Motivation',
  bulletedText('Deep neural networks requires lots of data'),
  bulletedText('Sometimes not very much labeled data, but plenty of unlabeled data (text, images, videos)'),
  bulletedText('Humans rarely get direct supervision; can learn from raw sensory information?'),
_));

G.autoencodingFramework = function(opts) {
  return parentCenter(xtable(
    vectorBox(opts.x || '$x$', opts.nx || 6), thickRightArrow(50),
    frameBox(opts.encode || 'Encode'), thickRightArrow(50),
    vectorBox(opts.h || '$h$', opts.nh || 3), thickRightArrow(50),
    frameBox(opts.decode || 'Decode'), thickRightArrow(50),
    vectorBox(opts.tx || '$\\hat x$', opts.nx || 6),
  _).center());
}

add(slide('Autoencoders',
  stmt('Analogy'),
  parentCenter(xtable(
    'A A A A B B B B B',
    thickRightArrow(50),
    '4 A\'s, 5 B\'s',
    thickRightArrow(50),
    'A A A A B B B B B',
  _).center().margin(5)),
  pause(),
  keyIdea('autoencoders',
    'If can compress a data point and still reconstruct it, then we have learned something generally useful.',
  _),
  pause(),
  stmt('General framework'),
  nil(),
  autoencodingFramework({}),
  pause(),
  parentCenter('minimize $\\|x - \\hat x\\|^2$'),
_));

add(slide('Principal component analysis',
  //'Assume data is centered at 0: $\sum_{i=1}^n \x_i = 0$',
  parentCenter(xtable(
    stmt('Input: points $x_1, \\dots, x_n$'),
    image('images/3d-proj.jpg').width(200),
  _).center().margin(50)),
  nil(), nil(),
  pause(),
  parentCenter(xtable(
    xtable(
      '$\\Encode(x) =$',
      vectorBox('$U^\\top$', 3, 6, 'blue'),
      vectorBox('$x$', 6),
    _).center().margin(5),
    pause(),
    xtable(
      '$\\Decode(h) =$',
      vectorBox('$U$', 6, 3, 'blue'),
      vectorBox('$h$', 3),
    _).center().margin(5),
  _).margin(50)),
  pause(),
  parentCenter('(assume $x_i$\'s are mean zero and $U$ is orthogonal)').scale(0.6),
  pause(),
  stmt('PCA objective'),
  parentCenter(stagger(
    'minimize $\\displaystyle \\sum_{i=1}^n \\|x_i - \\Decode(\\Encode(x_i))\\|^2$',
  _)),
_));

add(slide('Autoencoders',
  stmt('Increase dimensionality of hidden dimension'),
  autoencodingFramework({nh: 6}),
  pause(),
  bulletedText(stmt('Problem: learning nothing &mdash; just set $\\Encode, \\Decode$ to identity function!')),
  bulletedText('Need to control complexity of $\\Encode$ and $\\Decode$ somehow...'),
_));

add(slide('Non-linear autoencoders',
  stmt('Non-linear transformation (e.g., logistic function)'),
  parentCenter(xtable(
    image('images/logistic.png').height(150),
    ytable(
      '$\\Encode(x) = \\red{\\sigma}(W x + b)$',
      '$\\Decode(h) = \\red{\\sigma}(W\' h + b\')$',
    _),
  _).margin(50).center()),
  parentCenter(xtable(
    vectorBox('$W$', 3, 6, 'blue'), vectorBox('$b$', 3, null, 'blue'),
    vectorBox('$W\'$', 6, 3, 'blue'), vectorBox('$b\'$', 6, null, 'blue'),
  _).center().margin(50)),
  pause(),
  stmt('Loss function'),
  parentCenter('minimize $\\|x - \\Decode(\\Encode(x))\\|^2$'),
  pause(),
  stmt('Key: non-linearity makes life harder, prevents degeneracy'),
_));

add(slide('Denoising autoencoders',
  nil(),
  autoencodingFramework({x: '$\\red{\\Corrupt}(x)$'}).scale(0.8),
  //'Add input noise $\\red{\\epsilon} \\sim \\mathcal N(0, I)$, try to reconstruct original $x$',
  pause(),
  stmt('Types of noise'),
  bulletedText('Blankout: $\\red{\\Corrupt}([1, 2, 3, 4]) = [0, 2, 3, 0]$'),
  bulletedText('Gaussian: $\\red{\\Corrupt}([1, 2, 3, 4]) = [1.1, 1.9, 3.3, 4.2]$'),
  pause(),
  stmt('Objective'),
  parentCenter('minimize $\\|x - \\Decode(\\Encode(\\red{\\Corrupt}(x)))\\|^2$'),
  pause(),
  //stmt('Notes'),
  stmt('Algorithm: pick example, add fresh noise, SGD update'),
  pause(),
  stmt('Key: noise makes life harder, prevents degeneracy'),
  //bulletedText(stmt('Complexity control: $\\red{\\Corrupt}$, early stopping, regularization')),
_));

add(slide('Denoising autoencoders',
  stmt('MNIST: 60,000 images of digits ($784$ dimensions)'),
  parentCenter(image('images/mnist.png')),
  pause(),
  stmt('$200$ learned filters (rows of $W$)'),
  parentCenter(xtable(
    vectorBox('$W$', 4, 16, 'blue'),
    image('images/denoising-autoencoder-filters.png').width(250),
  _).center().margin(50)),
_).leftHeader('[Figure 7 of Vincent et al. (2010)]'));

add(slide('Stacked denoising autoencoders',
  stmt('Goal: learn hierarchical features'),
  //stmt('Basic idea: repeatedly apply autoencoding on hidden states'),
  stmt('Train first layer'),
  nil(), nil(), nil(),
  autoencodingFramework({x: '$\\Corrupt(x)$', h: '$\\blue{h}$', tx: '$\\tilde x$', nh: 5}).scale(0.8),
  pause(),
  stmt('Train second layer'),
  nil(), nil(), nil(),
  autoencodingFramework({x: '$\\Corrupt(\\blue{h})$', h: '$h\'$', tx: '$\\tilde h$', nx: 5, encode: 'Encode$\'$', decode: 'Decode$\'$'}).scale(0.8),
  parentCenter('...'),
  pause(),
  stmt('Test time: $\\Encode\'(\\Encode(x))$'),
_));

add(slide('Probabilistic models',
  stmt('So far'),
  parentCenter('$\\Decode(\\Encode(x))$'),
  pause(),
  stmt('Probabilistic model: distribution over inputs and hidden states'),
  parentCenter('$p(x, h)$'),
  pause(),
  headerList('Two types',
    'Restricted Boltzmann machines (Markov network)',
    'Deep belief network (Bayesian network)',
  _),
  pause(),
  'For simplicity, assume $x$ and $h$ are binary vectors',
_));

add(slide('Restricted Boltzmann machines',
  stmt('Markov network (factor graph)'),
  parentCenter(twoLayerBayesNet({n1:3, n2: 6, undirected: true, label: true}).scale(0.4)),
  stmt('Sampling: $h \\mid x$ is easy, $x$ is hard'),
  pause(),
  nil(), nil(),
  parentCenter(xtable(
    '$p(x, h) \\propto \\exp($',
    vectorBox('$h^\\top$', 1, 3), vectorBox('$W$', 3, 6, 'blue'), vectorBox('$x$', 6),
    '$ + b^\\top h + c^\\top x)$',
  _).center().margin(5)),
  pause(),
  stmt('Learning: SGD; gradient requires summing over all $(x,h)$'),
  stmt('Contrastive divergence: initialize $x$, 1 step of Gibbs sampling'),
_));

add(slide('Deep belief networks',
  stmt('Bayesian network'),
  parentCenter(twoLayerBayesNet({n1:3, n2: 6, label: true}).scale(0.4)),
  stmt('Sampling: $h \\mid x$ is hard, $x$ is easy'),
  nil(), nil(),
  parentCenter(xtable(
    '$p(x \\red{\\mid} h) \\propto \\exp($',
    vectorBox('$h^\\top$', 1, 3), vectorBox('$W$', 3, 6, 'blue'), vectorBox('$x$', 6),
    '$ + b^\\top h + c^\\top x)$',
  _).center().margin(5)),
  stmt('Learning: maximum likelihood is intractable, so use same algorithm as RBM; repeat to get deep (like for stacked denoising autoencoders)'),
_));

unknownWord = redbold('_____')
add(slide('Distributional semantics: warmup',
  italics('The new design has ' + unknownWord + ' lines.'),
  italics('Let\'s try to keep the kitchen ' + unknownWord + '.'),
  italics('I forgot to ' + unknownWord + ' out the cabinet.'),
  nil(),
  pause(),
  parentCenter('What does ' + unknownWord + ' mean?'),
  // Answer: clean
_));

add(slide('Distributional semantics',
  parentCenter(italics('The new design has ' + unknownWord + ' lines.')),
  // Linguistics
  stmt('Observation: <b>context</b> can tell us a lot about word meaning'),
  //stmt('Context: local window around a word occurrence (for now)'),
  //pause(),
  //parentCenter('"You shall know a word by the company it keeps." [Firth, 1957]'),
  //characterize meaning of words/phrases based on its <b>context</b>'),
  // Very data-driven, surprising that it was from the 1950s
  /*headerList('Roots in linguistics',
    stmt('<b>Distributional hypothesis</b>: Semantically similar words occur in similar contexts [Harris, 1954]'),
    '"You shall know a word by the company it keeps." [Firth, 1957]',
    //pause(),
    //'Contrast: Chomsky\'s generative grammar (lots of hidden prior structure, no data)',
  _),*/
  pause(),
  stmt('Autoencoding: predict $x$ from $x$'),
  stmt('Distributional methods: predict $x$ from context'),
_));

add(slide('General recipe',
  '1. Form a <b>word-context matrix</b> of counts (data)',
  indent(overlay(
    r = rect(300, 150),
    moveTopOf('context $c$', r),
    moveLeftOf('word $w$', r),
    moveCenterOf('$N$', r),
  _), 40),
  pause(),
  '2. Perform <b>dimensionality reduction</b> (generalize)',
  indent(overlay(
    r = rect(100, 150),
    //moveTopOf('latent feature', r),
    moveLeftOf('word $w$', r),
    moveCenterOf('$\\Theta$', r),
    moveRightOf('$\\quad\\Rightarrow\\quad$ word vectors $\\theta_w \\in \\R^d$', r),
  _), 40),
_));

add(slide('Latent semantic analysis',
  stmt('Data'),
  indent(ytable(
    'Doc1: ' + italics('Cats have tails.'),
    'Doc2: ' + italics('Dogs have tails.'),
  _)),
  /*indent(ytable(
    'Doc1: '+italics('The kitchen is loaded with food.'),
    'Doc2: '+italics('He made a pie in the kitchen.'),
    'Doc3: '+italics('Let\'s keep the kitchen clean.'),
  _)),*/
  pause(),
  stmt('Matrix: context = <b>documents</b> that word appear in'),
  nil(), nil(), nil(),
  parentCenter(frameBox(table(
    [nil(), 'Doc1', 'Doc2'],
    ['cats', 1, 0],
    ['dogs', 0, 1],
    ['have', 1, 1],
    ['tails', 1, 1],
  _).margin(20, 5)).padding(5)),
_).leftHeader('[Deerwater/Dumais/Furnas/Landauer/Harshman, 1990]'));

add(slide('Latent semantic analysis',
  stmt('Dimensionality reduction: <b>SVD</b>'),
  parentCenter(xtable(
    overlay(
      r = rect(200, 150),
      moveTopOf('document $c$', r).orphan(true),
      moveLeftOf('word $w$', r).orphan(false),
      moveCenterOf('$N$', r),
    _),
    '$\\,\\approx$',
    xtable(
      overlay(rect(s=80, 150), '$\\Theta$').center(),
      overlay(rect(s, s), '$S$').center(),
      overlay(rect(200, s), '$V^\\top$').center(),
    _).margin(10),
  _).center().margin(10)),
  pause(),
  bulletedText('Used for information retrieval'),
  bulletedText('Match query to documents in latent space rather than on keywords'),
_).leftHeader('[Deerwater/Dumais/Furnas/Landauer/Harshman, 1990]'));

/*add(slide('Effect of context',
  'Suppose '+greenitalics('Barack Obama')+' always appear together (a <b>collocation</b>).',
  pause(),
  stmt('Global context (document)'),
  bulletedText('same context $\\Rightarrow \\theta_\\text{Barack}$ close to $\\theta_\\text{Obama}$'),
  bulletedText('more "semantic"'),
  pause(),
  stmt('Local context (neighbors)'),
  bulletedText('different context $\\Rightarrow \\theta_\\text{Barack}$ far from $\\theta_\\text{Obama}$'),
  bulletedText('more "syntactic"'),
_));*/

add(slide('Skip-gram model with negative sampling',
  stmt('Data'),
  indent(ytable(
    greenitalics('Cats and dogs have tails.'),
  _)),
  pause(),
  stmt('Matrix: context = words in a window'),
  parentCenter(frameBox(table(
    [nil(), 'cats', 'and', 'dogs', 'have', 'tails'],
    ['cats', 0, 1, 1, 0, 0],
    ['and', 1, 0, 1, 1, 0],
    ['dogs', 1, 1, 0, 1, 1],
    ['have', 0, 1, 1, 0, 1],
    ['tails', 0, 0, 1, 1, 0],
  _).margin(20, 5)).padding(5)),
_).leftHeader('[Mikolov/Sutskever/Chen/Corrado/Dean, 2013 (word2vec)]'));

add(slide('Skip-gram model with negative sampling',
  parentCenter(ytable(
    greenitalics('Cats are smarter than the best AI.'),
  _)),
  stmt('Dimensionality reduction: <b>logistic regression with SGD</b>'),
  pause(),
  stmt('Model: predict good $(w,c)$ using logistic regression'),
  parentCenter('$p_\\theta(g = 1 \\mid w, c) = (1 + \\exp(\\red{\\theta_w \\cdot \\beta_c}))^{-1}$'),
  pause(),
  stmt('Positives: $(w,c)$ from data'),
  stmt('Negatives: $(w,c\')$ for irrelevant $c\'$ ($k$ times more)'),
  parentCenter(xtable('$+$(cats, AI)', '$\\,-$(cats, linguistics)', '$\\,-$(cats, statistics)').margin(50)),
_).leftHeader('[Mikolov/Sutskever/Chen/Corrado/Dean, 2013 (word2vec)]'));

add(slide('Skip-gram model with negative sampling',
  stmt('Data distribution'),
  parentCenter('$\\hat p(w, c) \\propto N(w, c)$'),
  stmt('Objective'),
  //'$\\E_{(w,c)}[\\log \\sigma(\\theta_w \\cdot \\beta_c) + k \\, \\E_{c\'}[\\log \\sigma(-\\theta_w \\cdot \\beta_{c\'})]]$',
  indent(nowrapText('$\\displaystyle \\max_{\\red{\\theta, \\beta}} \\sum_{w,c} \\hat p(w,c) \\log p(g = 1 \\mid w, c) +$')),
  indent(nowrapText('$\\displaystyle \\quad\\, k \\, \\sum_{w,c\'} \\hat p(w) \\hat p(c\') \\log p(g = 0 \\mid w, c\')$')),
  //pause(),
  //stmt('If no dimensionality reduction'),
  //parentCenter('$\\red{\\theta_w \\cdot \\beta_c} = \\log\\left(\\frac{\\hat p(w, c)}{\\hat p(w) \\hat p(c)}\\right) = \\text{PMI}(w, c)$'),
//_).leftHeader('[Levy/Goldberg, 2014]'));
_).leftHeader('[Mikolov/Sutskever/Chen/Corrado/Dean, 2013 (word2vec)]'));

add(slide('2D visualization of word vectors',
  parentCenter(stagger(
    image('images/word-embedding.png').width(700).linkToUrl('images/word-embedding.png'),
    image('images/word-embedding-subset.png').width(700).linkToUrl('images/word-embedding-subset.png'),
  _).center()),
  // General: numbers and determiners, days of week, countries
  // Useful for downstream applications
  // But only give very loose notion of semantics
_));

function showWordVecs(w, desc, negDesc, note) {
  return ytable(
    greenitalics(bold(w)),
    text('(words)').scale(0.5),
    frameBox(table.apply(null, desc.split(' | ').map(function(s) {
      return [italics(s.split(' ')[0])];
    }))).padding(5).scale(0.8),
    text('(contexts)').scale(0.5),
    frameBox(table.apply(null, negDesc.split(' | ').map(function(s) {
      return [italics(s.split(' ')[0])];
    }))).padding(5).scale(0.8),
    note,
  _).center();
}
/*add(slide('Nearest neighbors',
  // http://irsrv2.cs.biu.ac.il:9998/?word=good
  // Bow5
  parentCenter(table([
    // synonyms
    showWordVecs('cherish',
      'adore 0.581 | love 0.551 | admire 0.551 | embrace 0.546 | rejoice 0.542',
      'cherish 0.135 | both 0.093 | love 0.085 | pride 0.075 | thy 0.060',
      'quasi-synonyms'),
    pause(),
    showWordVecs('tiger',
      'leopard 0.627 | dhole 0.561 | warthog 0.545 | rhinoceros 0.544 | lion 0.541',
      'tiger 0.272 | leopard 0.127 | panthera 0.126 | woods 0.090 | puma 0.089',
      'co-hyponyms'),
    pause(),
    showWordVecs('good',
      'bad 0.743 | decent 0.687 | excellent 0.589 | lousy 0.579 | nice 0.554',
      'faith 0.098 | natured 0.082 | luck 0.069 | riddance 0.058 | both 0.056',
      'includes antonyms'),
  ]).margin(40)),
  pause(),
  parentCenter('Many things under <b>semantic similarity</b>!'),
_));*/

add(slide('Analogies',
  stmt('Differences in vectors capture relations'),
  indent(nowrapText('$\\theta_\\text{king} - \\theta_\\text{man} \\approx \\theta_\\text{queen} - \\theta_\\text{woman}$ (gender)')),
  pause(),
  indent(nowrapText('$\\theta_\\text{france} - \\theta_\\text{french} \\approx \\theta_\\text{mexico} - \\theta_\\text{spanish}$ (language)')),
  indent(nowrapText('$\\theta_\\text{car} - \\theta_\\text{cars} \\approx \\theta_\\text{apple} - \\theta_\\text{apples}$ (plural)')),
  pause(),
  //'$\\theta_\\text{king} - \\theta_\\text{man} + \\theta_\\text{queen} \\approx \\theta_\\text{woman}$',
  stmt('Intuition'),
  indent(nowrapText('$\\underbrace{\\theta_\\text{king}}_{[\\text{crown,he}]} - \\underbrace{\\theta_\\text{man}}_{[\\text{he}]} \\approx \\underbrace{\\theta_\\text{queen}}_{[\\text{crown,she}]} - \\underbrace{\\theta_\\text{woman}}_{[\\text{she}]}$')),
  //'Don\'t need dimensionality reduction for this to work!',
_).rightHeader('[Mikolov/Yih/Zweig, 2013; Levy/Goldberg, 2014]'));

add(summarySlide('Unsupervised learning',
  bulletedText('Principle: make up prediction tasks (e.g., $x$ given $x$ or context)'),
  bulletedText('Hard task $\\rightarrow$ pressure to learn something'),
  pause(),
  bulletedText('Loss minimzation using SGD'),
  bulletedText('Discriminatively fine tune: initialize feedforward neural network and backpropagate to optimize task accuracy'),
  pause(),
  bulletedText('Helps less given large amounts of labeled data, but doesn\'t mean unsupervised learning is solved &mdash; quite the opposite!'),
_));

////////////////////////////////////////////////////////////
roadmap(CONVOLUTIONAL);

add(slide('Motivation',
  parentCenter(xtable(
    image('images/car.jpeg'),
    xtable(
      vectorBox('$W$', 10, 15, 'blue'),
      vectorBox('$x$', 15),
    _).center().margin(5),
  _).center().margin(100)),
  bulletedText(stmt('Observation: images are not arbitrary vectors')),
  bulletedText(stmt('Goal: leverage spatial structure of images (translation invariance)')),
_));

add(slide('Prior knowledge',
  parentCenter(image('images/cnn-stride.jpeg').width(700)),
  bulletedText(stmt('Local connectivity: each hidden unit operates on a local image patch ($3$ instead of $7$ connections per hidden unit)')),
  pause(),
  bulletedText(stmt('Parameter sharing: processing of each image patch is same ($3$ parameters instead of $3 \\cdot 5$)')),
  pause(),
  bulletedText(stmt('Intuition: try to match a pattern in image')),
_).leftHeader('[figure from Andrej Karpathy]'));

add(slide(null,
  stmt('Fully-connected'),
  parentCenter(xtable(
    vectorBox(null, 10), thickRightArrow(50),
    vectorBox(null, 5), thickRightArrow(50),
    vectorBox(null, 7),
  _).center().margin(10)),
  pause(),
  stmt('Convolutional: each depth column produced from localized region (in height/width)'),
  parentCenter(image('images/cnn.jpeg').width(600)),
  parentCenter('[Andrej Karpathy\'s demo]').linkToUrl('http://cs231n.github.io/assets/conv-demo/index.html'),
_));

add(slide('Max-pooling',
  parentCenter(image('images/cnn-maxpool.jpeg').width(600)),
  bulletedText('Intuition: test if there exists a pattern in neighborhood'),
  bulletedText('Reduce computation, prevent overfitting'),
_).leftHeader('[figure from Andrej Karpathy]'));

add(slide('Example of function evaluation',
  parentCenter(image('images/cnn-car.jpeg').width(700)),
  parentCenter('[Andrej Karpathy\'s demo]').linkToUrl('http://cs.stanford.edu/people/karpathy/convnetjs/demo/cifar10.html'),
_));

add(slide('AlexNet',
  parentCenter(image('images/alexnet2012.png').width(600)),
  bulletedText(stmt('Non-linearity: use RelU ($\\max(z,0)$) instead of logistic')),
  bulletedText(stmt('Data augmentation: translate, horizontal reflection, vary intensity, dropout (guard against overfitting)')),
  bulletedText(stmt('Computation: parallelize across two GPUs (6 days)')),
  bulletedText(stmt('Impressive results: 15\% error; next best was 25\%!')),
_).leftHeader('[Krizhevsky et al., 2012, a.k.a. AlexNet]'));

////////////////////////////////////////////////////////////
roadmap(RECURRENT);

function mtExample() {
  return parentCenter(table(
    ['$x$:', 'nat&uuml;rlich hat John spass am spiel'.italics().fontcolor('green')],
    [nil(), thickDownArrow(40)],
    ['$y$:', 'of course John has fun with the game'.italics().fontcolor('red')],
  _).center().margin(20, 5));
}

G.encoderDecoder = function(source, target, opts) {
  if (!opts) opts = {};
  var outputs = [];
  var hidden = [];
  var inputs = [];
  var edges = [];
  source = source.split(/ /);
  //function vec() { return rect(20, 100).fillColor('red').fillOpacity(0.5); }
  function vec() { return vectorBox(null, opts.d || 6); }
  function mytext(x) { return text(greenitalics(x)).scale(0.8); }
  function mylf(x) { return text(blue(x)).scale(0.8); }
  for (var i = 0; i < source.length; i++) {
    outputs.push(nil());
    hidden.push(vec());
    //inputs.push(ytable(vec(), mytext(source[i])).center());
    inputs.push(mytext(source[i]));
  }
  target = target ? target.split(/ /) : [];
  for (var i = 0; i < target.length; i++) {
    if (target[i][0] == '_')
      outputs.push(mylf(target[i].slice(1)));
    else
      outputs.push(mytext(target[i]));
    hidden.push(vec());
    inputs.push(nil());
  }
  for (var i = 0; i < inputs.length; i++) {
    if (i > 0)
      edges.push(arrow(hidden[i-1], hidden[i]));
    if (i >= source.length)
      edges.push(arrow(hidden[i], outputs[i]));
    else
      edges.push(arrow(inputs[i], hidden[i]));
    if (i > 0 && i < source.length && opts.genSource)
      edges.push(arrow(hidden[i-1], inputs[i]));
    if (i > source.length && opts.genTarget)
      edges.push(arrow(outputs[i-1], hidden[i]));
    if (opts.hidden)
      edges.push((i >= source.length ? moveBottomOf : moveTopOf)(mytext('$h_{'+(i+1)+'}$'), hidden[i]));
  }

  return overlay(table(outputs, hidden, inputs).margin(40, 40).center(), new Overlay(edges));
}

var sentence = 'Paris Talks Set Stage for Action as Risks to the Climate Rise'.split(' ');

add(slide('Motivation',
  stmt('Model sequences (sentences)'),
  //parentCenter(xtable('$x$: ', greenitalics(sentence)).center()),
  parentCenter(table(
    wholeNumbers(sentence.length).map(function(i) { return '$x_{' + (i+1) + '}$'; }),
    sentence.map(greenitalics),
  _).margin(20)).scale(0.8),
  pause(),
  stmt('Goal: rich probabilistic model'),
  parentCenter('$p(x_1) p(x_2 \\mid x_1) p(x_3 \\mid x_1, x_2) p(x_4 \\mid x_1, x_2, x_3) \\cdots$'),
  parentCenter('No conditionally independence!'),
_));

add(slide('Recurrent neural networks',
  parentCenter(stagger(
    encoderDecoder('Paris Talks Set Stage', null, {genSource: true}).scale(0.75),
    encoderDecoder('$x_1$ $x_2$ $x_3$ $x_4$', null, {genSource: true, hidden: true}).scale(0.75),
  _).center()),
  pause(),
  xtable(
    ytable(
      '$h_1 = \\Encode(x_1)$', pause(),
      '$x_2 \\sim \\Decode(h_1)$', pause(),
      '$h_2 = \\Encode(h_1, x_2)$',
      '$x_3 \\sim \\Decode(h_2)$', pause(),
      '$h_3 = \\Encode(h_2, x_3)$',
      '$x_4 \\sim \\Decode(h_3)$',
      '$h_4 = \\Encode(h_3, x_4)$',
    _),
    pause(),
    ytable(
      ytable(
        stmt('Update context vector'),
        indent('$h_t = \\Encode(h_{t-1}, x_t)$'),
        stmt('Predict next character'),
        indent('$x_{t+1} = \\Decode(h_t)$'),
      _),
      pause(),
      frameBox('context $h_t$ compresses $x_1, \\dots x_t$').padding(5),
    _).center().margin(10),
  _).margin(5).center(),
_));

add(slide('Simple recurrent network',
  parentCenter(encoderDecoder('$x_1$ $x_2$ $x_3$ $x_4$', null, {genSource: true, hidden: true, d: d = 4}).scale(0.75)),
  nil(), nil(), nil(),
  pause(),
  parentCenter(xtable('$\\Encode(h_{t-1}, x_t) = \\sigma($', vectorBox('$V$', d, d, 'blue'), vectorBox('$h_{t-1}$', d), '$+$', vectorBox('$W$', d, nx = 8, 'blue'), vectorBox('$x_t$', nx), '$) =$', vectorBox('$h_t$', d)).center()),
  nil(), nil(), nil(),
  pause(),
  parentCenter(xtable('$\\Decode(h_t) \\sim \\text{softmax}($', vectorBox('$W\'$', nx, d, 'blue'), vectorBox('$h_t$', d), '$) =$', vectorBox('$p(x_{t+1})$', nx)).center()),
_).leftHeader('[Elman, 1990]'));

add(slide('Vanishing gradient problem',
  //parentCenter(encoderDecoder('$x_1$ $x_2$ $x_3$ $x_4$ $x_5$ $x_6$ $x_7$ $x_8$ $x_9$ $x_{10}$ $x_{11}$ $x_{12}$ $x_{13}$ $x_{14}$', null, {genSource: true, hidden: true, d: d = 4}).scale(0.75)),
  parentCenter(encoderDecoder('$x_1$ $x_2$ $x_3$ $x_4$ $x_5$', null, {genSource: true, hidden: true, d: d = 4}).scale(0.75)),
  parentCenter('(set $x_1 = 1, x_2 = x_3 = \\cdots = 0, \\sigma = $ identity function)').scale(0.7),
  pause(),
  //parentCenter(xtable('$h_5 =$', '$\\sigma($', vectorBox('$V$', d, d, 'blue'), '$\\sigma($', vectorBox('$V$', d, d, 'blue'), '$\\sigma($', vectorBox('$V$', d, d, 'blue'), '$\\sigma($', vectorBox('$V$', d, d, 'blue'), vectorBox('$h_1$', d), '$))))$').center()),
  nil(),
  parentCenter(xtable('$h_5 =$', vectorBox('$V$', d, d, 'blue'), vectorBox('$V$', d, d, 'blue'), vectorBox('$V$', d, d, 'blue'), vectorBox('$V$', d, d, 'blue'), vectorBox('$W$', d, nx, 'blue'), vectorBox('$x_1$', nx)).center().margin(10)),
  pause(),
  'If $V = 0.1$, then',
  bulletedText(stmt('Value: $h_t = \\brown{0.1^{t-1}} W$')),
  bulletedText(stmt('Gradient: $\\frac{\\partial h_t}{\\partial W} = \\brown{0.1^{t-1}}$ (vanishes as length increases)')),
_));

add(slide('Additive combinations',
  parentCenter(encoderDecoder('$x_1$ $x_2$ $x_3$ $x_4$ $x_5$', null, {genSource: true, hidden: true, d: d = 4}).scale(0.75)),
  stmt('What if'),
  parentCenter('$h_t = h_{t-1} + W x_t$'),
  pause(),
  stmt('Then'),
  parentCenter('(set $x_1 = 1, x_2 = x_3 = \\cdots = 0, \\sigma = $ identity function)').scale(0.7),
  bulletedText(stmt('Value: $h_t = W$')),
  bulletedText(stmt('Gradient: $\\frac{\\partial h_t}{\\partial W} = 1$ for any $t$')),
_));

add(slide('Long Short Term Memory (LSTM)',
  stmt('API'),
  parentCenter('$(h_t, c_t) = \\text{LSTM}(h_{t-1}, c_{t-1}, x_t)$'),
  pause(),
  ytable(
    stmt('Input gate'),
    indent('$i_t = \\sigma(W_i x_t + U_i h_{t-1} + V_i c_{t-1} + b_i)$'),
    stmt('Forget gate (initialize with $b_f$ large, so close to $1$)'),
    indent('$f_t = \\sigma(W_f x_t + U_f h_{t-1} + V_f c_{t-1} + b_f)$'),
    pause(),
    stmt('Cell: additive combination of '+red('RNN update')+' with '+blue('previous cell')),
    indent('$c_t = i_t \\odot \\red{\\tanh(W_c x_t + U_c h_{t-1} + b_c)} + f_t \\odot \\blue{c_{t-1}}$'),
    pause(),
    stmt('Output gate'),
    indent('$o_t = \\sigma(W_o x_t + U_o h_{t-1} + V_o c_t + b_o)$'),
    stmt('Hidden state'),
    indent('$h_t = o_t \\odot \\tanh(c_t)$'),
  _).scale(0.85),
  //parentCenter(xtable('$\\Encode(h_{t-1}, x_t) = \\sigma($', vectorBox('$V$', d, d, 'blue'), vectorBox('$h_{t-1}$', d), '$+$', vectorBox('$W$', d, nx = 8, 'blue'), vectorBox('$x_t$', nx), '$) =$', vectorBox('$h_t$', d)).center()),
_).leftHeader('[Schmidhuber &amp; Hochreiter, 1997]'));

add(slide('Character-level language modeling',
  stmt('Sampled output'),
  greenitalics('Naturalism and decision for the majority of Arab countries\' capitalide was grounded by the Irish language by [[John Clair]], [[An Imperial Japanese Revolt]], associated with Guangzham\'s sovereignty. His generals were the powerful ruler of the Portugal in the [[Protestant Immineners]], which could be said to be directly in Cantonese Communication, which followed a ceremony and set inspired prison, training. The emperor travelled back to [[Antioch, Perth, October 25|21]] to note, the Kingdom of Costa Rica, unsuccessful fashioned the [[Thrales]], [[Cynth\'s Dajoard]], known in western [[Scotland]], near Italy to the conquest of India with the conflict.'),
_).leftHeader('[from Andrej Karpathy\'s blog]'));

add(slide(null,
  parentCenter(stagger(
    image('images/rnnlm-pane1.png').width(480),
    image('images/rnnlm-pane2.png').width(480),
  _).center()),
_).leftHeader('[from Andrej Karpathy\'s blog]'));

add(slide('Sequence-to-sequence model',
  stmt('Motivation: machine translation'),
  indent(table(
    ['$x$:', greenitalics('Je crains l\'homme de un seul livre.')],
    ['$y$:', blueitalics('Fear the man of one book.')],
  _).ycenter()),
  pause(),
  parentCenter(encoderDecoder('$x_1$ $x_2$ $x_3$', '$y_4$ $y_5$ $y_6$', {hidden: true, genTarget: true})),
  pause(),
  stmt('Read in a sentence first, output according to RNN'),
  parentCenter('$h_t = \\red{\\Encode}(h_{t-1}, x_t \\text{ or } y_{t-1}), \\quad y_t = \\red{\\Decode}(h_t)$'),
_).leftHeader('[Sutskever et al., 2014]'));

add(slide('Attention-based models',
  stmt('Motivation: long sentences &mdash; compress to finite dimensional vector?'),
  parentCenter(xtable(
    text(greenitalics('Eine Folge von Ereignissen bewirkte, dass aus Beethovens Studienreise nach Wien ein dauerhafter und endg&uuml;ltiger Aufenthalt wurde. Kurz nach Beethovens Ankunft, am 18. Dezember 1792, starb sein Vater. 1794 besetzten franz&ouml;sische Truppen das Rheinland, und der kurf&uuml;rstliche Hof musste fliehen.')).scale(0.4),
    bigRightArrow(),
    vectorBox(),
  _).center().margin(10)),
  pause(),
  keyIdea('attention',
    'Learn to look back at your notes.',
  _),
_));

add(slide('Attention-based models',
  parentCenter(encoderDecoder('$x_1$ $x_2$ $x_3$', '$y_4$ $y_5$ $y_6$', {hidden: true, genTarget: true})).scale(0.9),
  stmt('Distribution over input positions'),
  indent('$\\alpha_t = \\text{softmax}([\\text{Attend}(h_1, h_{t-1}), \\dots, \\text{Attend}(h_L, h_{t-1})])$').scale(0.9), 
  pause(),
  stmt('Generate with '+red('attended input')),
  indent('$h_t = \\text{Encode}(h_{t-1}, y_{t-1}, \\red{\\sum_{j=1}^L \\alpha_t h_j})$'),
_).leftHeader('[Bahdanau et al., 2015]'));

add(slide('Machine translation',
  parentCenter(image('images/machine-translation-attention.png').width(400)),
_).leftHeader('[Bahdanau et al., 2015]'));

/*add(slide('Email responder',
  parentCenter(image('images/google-email-responder.png').width(500)),
_).leftHeader('[Google, 2015]'));*/

add(slide('Image captioning',
  parentCenter(image('images/image-captioning-attention.png').width(700)),
_).leftHeader('[Xu et al., 2015]'));

add(summarySlide('Summary',
  bulletedText('Recurrent neural networks: model sequences (non-linear version of Kalman filter or HMM)'),
  bulletedText('Logic intuition: learning a program with a for loop (reduce)'),
  bulletedText('LSTMs mitigate the vanishing gradient problem'),
  bulletedText('Attention-based models: when only part of input is relevant at a time'),
  bulletedText('Newer models with "external memory": memory networks, neural Turing machines'),
_));

////////////////////////////////////////////////////////////
roadmap(CONSIDERATIONS);

add(slide('Residual networks',
  parentCenter(xtable(
    ytable(
      stagger(
        '$y = \\sigma(W x)$',
        '$y = \\sigma(W x) + x$',
      _),
      pause(),
      image('images/resnet-building-block.png').width(300),
      ytable(
        bulletedText('Key idea: make it easy to learn the identity (good inductive bias)').width(500),
        pause(),
        bulletedText('Enables training 152 layer networks').width(500),
        bulletedText('1st place in ILSVRC 2015').width(500),
      _),
    _).center().margin(30),
    image('images/resnet-full.png').scale(0.6).showLevel(3),
  _).margin(20)),
_).leftHeader(cite('[He et al. 2015]', 'https://arxiv.org/pdf/1512.03385.pdf')));

add(slide('WaveNet for audio generation',
  parentCenter(image('images/wavenet-audio.png').width(700)),
  bulletedText('Work with <b>raw</b> audio (16K observations / second)'),
  parentCenter(image('images/wavenet.png').width(700)),
  bulletedText('Key idea: '+redbold('dilated convolutions')+' captures multiple scales of resolution, not recurrent'),
_).leftHeader(cite('[van den Oord et al., 2016]', 'http://arxiv.org/pdf/1609.03499.pdf')));

add(slide('Conditional adversarial networks',
  parentCenter(image('images/image-to-image-cgan.png').width(700)),
  stmt('Key idea: game between'),
  bulletedText(bluebold('Generator') + ': generates fake images'),
  bulletedText(redbold('Discriminator') + ': distinguishes between fake/real images'),
_).leftHeader(cite('[Isola et al., 2016]', 'http://arxiv.org/pdf/1611.07004.pdf')));

add(slide('Getting things to work',
  stmt('Better optimization algorithms: SGD, SGD+momentum, AdaGrad, AdaDelta, momentum, Nesterov, Adam'),
  stmt('Tricks: initialization, gradient clipping, batch normalization, dropout'),
  stmt('More hyperparameter tuning: step sizes, architectures'),
  stmt('Better hardware: GPUs, TPUs'),
  parentCenter(image('images/gpus.jpg').width(200)),
  pause(),
  parentCenter('...wait for a long time...'),
_));

add(slide('Theory: why does it work?',
  headerList('Two questions',
    'Approximation: why are neural networks good hypothesis classes?',
    'Optimization: why can SGD optimize a high-dimensional non-convex problem?',
  _),
  pause(), 
  headerList('Partial answers',
    '1-layer neural networks can approximate any continuous function on compact set [Cybenko, 1989; Barron, 1993]',
    'Generate random features works too [Rahimi/Recht, 2009; Andoni et. al, 2014]',
    'Use statistical physics to analyze loss surfaces [Choromanska et al., 2014]',
  _),
_));

add(summarySlide('Summary',
  parentCenter(table(
    ['Phenomena', 'Ideas'].map(darkblue),
    ['Fixed vectors', 'Feedforward NNs'],
    ['Spatial structure', 'convolutional NNs'],
    ['Sequence', ytable('recurrent NNs', 'LSTMs')],
    ['Sequence-to-sequence', ytable('encoder-decoder', 'attention-based models')],
    ['Unsupervised', ytable('belief networks', 'RBMs', 'autoencoders')],
  _).margin(40, 20)),
_));

add(slide('References',
  headerList('Tutorials',
		'http://deeplearning.net/tutorial/',
    'http://deeplearning.stanford.edu/tutorial/',
    'http://cs.stanford.edu/people/karpathy/convnetjs/',
  _),
  pause(),
  headerList('Software', 'Caffe (Berkeley): centered around computer vision', 'Theano (Montreal); also see Keras: Python', 'Torch (Facebook): fast, but write in Lua', 'TensorFlow (Google): Python, new but very popular', 'PyTorch: Python, dynamic'),
_));

add(slide('Outlook',
  stmt('Extensibility: able to compose modules'),
  parentCenter(xtable(
    frameBox('$\\text{LSTM}$'),
    frameBox('$\\text{Attend}$'),
    frameBox('$\\text{Encode}$'),
  _).margin(50)),
  pause(),
  stmt('Learning programs: think about analogy with a computer'),
  parentCenter(xtable('$x$', thickRightArrow(50), frameBox('$f_\\theta$'), thickRightArrow(50), '$y$').center()),
  pause(),
  stmt('Data'),
  parentCenter('reinforcement learning?  unsupervised learning?'),
_));

initializeLecture();
