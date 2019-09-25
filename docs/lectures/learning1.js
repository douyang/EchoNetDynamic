G = sfig.serverSide ? global : this;
G.prez = presentation();

add(titleSlide('Lecture 2: Machine learning I',
  nil(),
  parentCenter(image('images/learning.png').width(300)),
_));

// answer: trillions - same SGD algorithm
add(quizSlide('learning1-start',
  'How many parameters (real numbers) can be learned by machine learning algorithms using today\'s computers?',
  'thousands',
  'millions',
  'billions',
  'trillions',
_));

evolutionOfModels(9, 'Machine learning');
evolutionOfModels(9, 'Reflex');

function roadmap(i) {
  add(outlineSlide('Roadmap', i, [
    ['linear', 'Linear predictors'],
    ['loss', 'Loss minimization'],
    ['sgd', 'Stochastic gradient descent'],
  ]));
}

////////////////////////////////////////////////////////////
roadmap(0);

prose(
  'We now embark on our journey into machine learning with the simplest yet most practical tool:',
  '<b>linear predictors</b>, which cover both classification and regression and are examples of reflex models.',
  _,
  'After getting some geometric intuition for linear predictors,',
  'we will turn to learning the weights of a linear predictor',
  'by formulating an optimization problem based on the <b>loss minimization</b> framework.',
  _,
  'Finally, we will discuss <b>stochastic gradient descent</b>,',
  'an efficient algorithm for optimizing (that is, minimizing) the loss that\'s tailored for machine learning',
  'which is much faster than gradient descent.',
_);

add(slide('Application: spam classification',
  stmt('Input', '$x = $ email message'),
  parentCenter(xtable(
    frameBox(ytable(
      '<tt><b>From</b>: pliang@cs.stanford.edu</tt>',
      '<tt><b>Date</b>: September 27, 2017</tt>',
      '<tt><b>Subject</b>: CS221 announcement</tt>',
      '&nbsp;',
      '<tt>Hello students,</tt>',
      '<tt>&nbsp;I\'ve attached the answers to homework 1...</tt>',
    _)).scale(0.5),
    pause(),
    frameBox(ytable(
      '<tt><b>From</b>: a9k62n@hotmail.com</tt>',
      '<tt><b>Date</b>: September 27, 2017</tt>',
      '<tt><b>Subject</b>: URGENT</tt>',
      '&nbsp;',
      '<tt>Dear Sir or maDam:</tt>',
      '<tt>&nbsp;my friend left sum of 10m dollars...</tt>',
    _)).scale(0.5),
  _).margin(10)),
  pause(),
  stmt('Output', '$y \\in \\\{ \\text{spam}, \\text{not-spam} \\\}$'),
  pause(),
  stmt('Objective: obtain a '+redbold('predictor')+' $f$'),
  parentCenter(xtable('$x$', rightArrow(60).strokeWidth(5), frameBox('$f$'), rightArrow(60).strokeWidth(5), '$y$').center().xmargin(10)),
_));

prose(
  'First, some terminology.',
  'A <b>predictor</b> is a function $f$ that maps an <b>input</b> $x$ to an <b>output</b> $y$.',
  'In statistics, $y$ is known as a response, and when $x$ is a real vector it is known as the covariates.',
_);

add(slide('Types of prediction tasks',
  stmt(red('Binary classification (e.g., email $\\Rightarrow$ spam/not spam)')),
  indent(xtable('$x$', rightArrow(60).strokeWidth(5), frameBox('$f$'), rightArrow(60).strokeWidth(5), '$y \\in \\red{\\{ -1, +1 \\}}$').center().xmargin(10), 100),
  pause(),
  stmt(blue('Regression (e.g., location, year $\\Rightarrow$ housing price)')),
  indent(xtable('$x$', rightArrow(60).strokeWidth(5), frameBox('$f$'), rightArrow(60).strokeWidth(5), '$y \\in \\blue{\\R}$').center().xmargin(10), 100),
_));

prose(
  'In the context of classification tasks, $f$ is called a <b>classifier</b>',
  'and $y$ is called a <b>label</b> (sometimes class, category, or tag).',
  'The key distinction between binary classification and regression is that the former has <b>discrete</b> outputs',
  '(e.g., "yes" or "no"), whereas the latter has <b>continuous</b> outputs.',
  _,
  'Note that the dichotomy of prediction tasks are not meant to be formal definitions,',
  'but rather to provide intuitions.',
  _,
  'For instance, binary classification could technically be seen as a regression problem if the labels are $-1$ and $+1$.',
  'And structured prediction generally refers to tasks where the possible set of outputs $y$ is huge (generally, exponential in the size of the input),',
  'but where each individual $y$ has some structure.',
  'For example, in machine translation, the output is a sequence of words.',
_);

function io(x, y) {
  return parentCenter(xtable(x, rightArrow(60).strokeWidth(5), frameBox('$f$'), rightArrow(60).strokeWidth(5), y).center().margin(20));
}

function page(i) {
  return frameBox(i).scale(0.8);
}

add(slide('Types of prediction tasks',
  stmt('Multiclass classification', '$y$ is a category'),
  io(image('images/cat.jpg').width(100), 'cat'),
  pause(),
  stmt('Ranking', '$y$ is a permutation'),
  io(xtable(page(1), page(2), page(3), page(4)).margin(10), '2 3 4 1'),
  pause(),
  stmt('Structured prediction', '$y$ is an object which is built from parts'),
  io(greenitalics('la casa blu'), greenitalics('the blue house')),
_));

add(quizSlide('learning1-tasks',
  'Give an example of a prediction task (e.g., image $\\Rightarrow$ face/not face).',
_));

add(slide('Data',
  stmt('Example: specifies that $y$ is the ground-truth output for $x$'),
  parentCenter('$(x,y)$'),
  pause(),
  stmt('Training data', 'list of examples'),
  indent(table(
    //['$\\Train = \\{$', '$(\\nl{...10m dollars...}, +1),$'],
    //[nil(),             '$(\\nl{...CS221...}, -1),$'],
    //[nil(),             '$... \\}$'],
    ['$\\Train =$', '$\\,[$', nil(), nil()],
    [nil(), nil(), '("...10m dollars...",', '+1),'],
    [nil(), nil(), '("...CS221...",', '-1),'],
    //[nil(), nil(), '...', nil()],
    [nil(), '$\\,]$', nil(), nil()],
  _)),
_));

prose(
  'The starting point of machine learning is the data,',
  'which is the main resource that we can use to address the information complexity of the prediction task at hand.',
  _,
  'For now, we will focus on <b>supervised learning</b>, in which our data provides both inputs and outputs,',
  'in contrast to unsupervised learning, which only provides inputs.',
  _,
  'A (supervised) <b>example</b> (also called a data point or instance)',
  'is simply an input-output pair $(x,y)$, which specifies that $y$ is the ground-truth output for $x$.',
  _,
  'The <b>training data</b> $\\Train$ is a multiset of examples (repeats are allowed, but this is not important),',
  'which forms a partial specification of desired behavior of the predictor.',
_);

learnFramework(0);

prose(
  '<b>Learning</b> is about taking the training data $\\Train$ and producing a predictor $f$,',
  'which is a function that takes inputs $x$ and tries to map them to $y = f(x)$.',
  'One thing to keep in mind is that we want the predictor to approximately work even for',
  'examples that we have not seen in $\\Train$. The problem of generalization, which we will discuss two lectures from now,',
  'forces us to design $f$ in a principled, mathematical way.',
  _,
  'We will first focus on examining what $f$ is, independent of how the learning works.',
  'Then we will come back to learning $f$ based on data.',
_);

////////////////////////////////////////////////////////////

add(slide('Feature extraction',
  stmt('Example task: predict $y$, whether a string $x$ is an email address'),
  pause(),
  stmt('Question', 'what properties of $x$ <b>might be</b> relevant for predicting $y$?'),
  pause(),
  stmt('Feature extractor', 'Given input $x$, output a set of ('+red('feature name')+', '+blue('feature value')+') pairs.'),
  pause(-2),
  parentCenter(overlay(
    xtable(
      text('$\\nl{abc@gmail.com}$').scale(0.8),
      pause(2),
      a = thickRightArrow(250),
      frameBox(table(
        pause(),
        [red('length&gt;10'), ':', blue('1')], pause(),
        [red('fracOfAlpha'), ':', blue('0.85')], pause(),
        [red('contains_@'), ':', blue('1')], pause(),
        [red('endsWith_.com'), ':', blue('1')], pause(),
        [red('endsWith_.org'), ':', blue('0')],
      _).margin(5, 0)).scale(0.8),
    _).center().margin(15),
    pause(-5),
    moveTopOf(purplebold('feature extractor'), a),
    moveBottomOf(purple('arbitrary!'), a),
  _)),
_).leftHeader(image('images/magnifying-glass.jpg').width(100)), 'features');

prose(
  'We will consider predictors $f$ based on <b>feature extractors</b>.',
  'Feature extraction is a bit of an art that requires intuition about both the task and also what machine learning algorithms are capable of.',
  _,
  'The general principle is that features should represent properties of $x$ which <b>might be</b> relevant for predicting $y$.',
  'It is okay to add features which turn out to be irrelevant,',
  'since the learning algorithm can sort it out (though it might require more data to do so).',
_);

add(slide('Feature vector notation',
  stmt('Mathematically, feature vector doesn\'t need feature names'),
  parentCenter(xtable(
    frameBox(table(
      [red('length&gt;10'), ':', blue('1')],
      [red('fracOfAlpha'), ':', blue('0.85')],
      [red('contains_@'), ':', blue('1')],
      [red('endsWith_.com'), ':', blue('1')],
      [red('endsWith_.org'), ':', blue('0')],
    _).margin(5, 0)).scale(0.7),
    rightArrow(50).strokeWidth(5),
    squareBracket(ytable(1, 0.85, 1, 1, 0)).scale(0.8),
  _).center().margin(10)),
  pause(),
  definition('feature vector',
    'For an input $x$, its feature vector is:',
    parentCenter('$\\phi(x) = [\\phi_1(x), \\dots, \\phi_d(x)]$.'),
    pause(),
    'Think of $\\phi(x) \\in \\R^d$ as a point in a high-dimensional space.',
  _).content.margin(10).end,
_));

prose(
  'Each input $x$ represented by a <b>feature vector</b> $\\phi(x)$, which is computed by the feature extractor $\\phi$.',
  'When designing features, it is useful to think of the feature vector as being a map from strings (feature names) to doubles (feature values).',
  'But formally, the feature vector $\\phi(x) \\in \\R^d$ is a real vector $\\phi(x) = [\\phi_1(x), \\dots, \\phi_d(x)]$,',
  'where each component $\\phi_j(x)$ with $j = 1, \\dots, d$ represents a feature.',
  _,
  'This vector-based representation allows us to think about feature vectors as a point in a (high-dimensional) vector space,',
  'which will later be useful for getting geometric intuition.',
_);

add(slide('Weight vector',
  stmt('Weight vector', 'for each feature $j$, have real number $w_j$ representing contribution of feature to prediction'),
  parentCenter(frameBox(table(
    [red('length&gt;10'), ':', blue('-1.2')],
    [red('fracOfAlpha'), ':', blue('0.6')],
    [red('contains_@'), ':', blue('3')],
    [red('endsWith_.com'), ':', blue('2.2')],
    [red('endsWith_.org'), ':', blue('1.4')],
    ['...', nil(), nil()],
  _))),
_));

prose(
  'So far, we have defined a feature extractor $\\phi$ that maps each input $x$ to the feature vector $\\phi(x)$.',
  'A <b>weight vector</b> $\\w = [w_1, \\dots, w_d]$ (also called a parameter vector or weights)',
  'specifies the contributions of each feature vector to the prediction.',
  _,
  'In the context of binary classification with binary features',
  '($\\phi_j(x) \\in \\{0,1\\}$), the weights $w_j \\in \\R$ have an intuitive interpretation.',
  'If $w_j$ is positive, then the presence of feature $j$ $(\\phi_j(x) = 1)$ favors a positive classification.',
  'Conversely, if $w_j$ is negative, then the presence of feature $j$ favors a negative classification.',
  _,
  'Note that while the feature vector depends on the input $x$,',
  'the weight vector does not.',
  'This is because we want a single predictor (specified by the weight vector) that works on any input.',
_);

add(slide('Linear predictors',
  parentCenter(table(
    [
      'Weight vector $\\w \\in \\R^d$'.fontcolor('darkblue'),
      'Feature vector $\\phi(x) \\in \\R^d$'.fontcolor('darkblue'),
    ],
    [
      frameBox(table(
        [red('length&gt;10'), ':', blue('-1.2')],
        [red('fracOfAlpha'), ':', blue('0.6')],
        [red('contains_@'), ':', blue('3')],
        [red('endsWith_.com'), ':', blue('2.2')],
        [red('endsWith_.org'), ':', blue('1.4')],
      _)).scale(0.7),
      frameBox(table(
        [red('length&gt;10'), ':', blue('1')],
        [red('fracOfAlpha'), ':', blue('0.85')],
        [red('contains_@'), ':', blue('1')],
        [red('endsWith_.com'), ':', blue('1')],
        [red('endsWith_.org'), ':', blue('0')],
      _)).scale(0.7)
    ],
  _).margin(60, 0).center()),
  pause(),
  stmt('<b>Score</b>: weighted combination of features'),
  parentCenter('$\\red{\\w \\cdot \\phi(x)} = \\sum_{j=1}^d w_j \\phi(x)_j$'),
  parentCenter(nowrapText('Example: $-1.2 (1) + 0.6(0.85) + 3(1) + 2.2(1) + 1.4(0) = 4.51$')).scale(0.7),
_));

prose(
  'Given a feature vector $\\phi(x)$ and a weight vector $\\w$,',
  'we define the prediction <b>score</b> to be their inner product.',
  'The score intuitively represents the degree to which the classification is positive or negative.',
  _,
  'The predictor is linear because the score is a linear function of $\\w$ (more on linearity in the next lecture).',
  _,
  'Again, in the context of binary classification with binary features,',
  'the score aggregates the contribution of each feature, weighted appropriate.',
  'We can think of each feature present as voting on the classification.',
_);

add(slide('Linear predictors',
  'Weight vector $\\w \\in \\R^d$'.fontcolor('darkblue'),
  'Feature vector $\\phi(x) \\in \\R^d$'.fontcolor('darkblue'),
  pause(),
  stmt('For binary classification'),
  definition('(binary) linear classifier',
    nowrapText('$f_{\\w}(x) = \\sign(\\w \\cdot \\phi(x)) = \\begin{cases} +1 & \\text{if $\\w \\cdot \\phi(x) > 0$} \\\\ -1 & \\text{if $\\w \\cdot \\phi(x) < 0$} \\\\ ? & \\text{if $\\w \\cdot \\phi(x) = 0$} \\end{cases}$'),
  _),
_));

prose(
  'We now have gathered enough intuition that we can formally define the predictor $f$.',
  'For each weight vector $\\w$, we write $f_\\w$ to denote the predictor that depends on $\\w$',
  'and takes the sign of the score.',
  _,
  'For the next few slides, we will focus on the case of binary classification.',
  'Recall that in this setting, we call the predictor a (binary) classifier.',
  _,
  'The case of $f_\\w(x) = ?$ is a boundary case that isn\'t so important.',
  'We can just predict $+1$ arbitrarily as a matter of convention.',
_);

add(slide('Geometric intuition',
  'A binary classifier $f_{\\w}$ defines a hyperplane with normal vector $\\w$.',
  '($\\R^2 \\implies$ hyperplane a line\; $\\R^3 \\implies$ hyperplane a plane)',
  stmt('Example'),
  indent('$\\w = [2, -1]$'),
  //indent('$\\phi(x) = [2, 0] \\text{ or } [0, 2] \\text{ or } [2, 4]$'),
  indent('$\\phi(x) \\in \\{ [2, 0], [0, 2], [2, 4] \\}$'),
  parentCenter('[whiteboard]'),
_));

prose(
  'So far, we have talked about linear predictors as weighted combinations of features.',
  'We can get a bit more insight by studying the <b>geometry</b> of the problem.',
  _,
  'Let\'s visualize the predictor $f_\\w$ by looking at which points it classifies positive.',
  'Specifically, we can draw a ray from the origin to $\\w$ (in two dimensions).',
  _,
  'Points which form an acute angle with $\\w$ are classified as positive (dot product is positive),',
  'and points that form an obtuse angle with $\\w$ are classified as negative.',
  'Points which are orthogonal $\\{ z \\in \\R^d : \\w \\cdot z = 0 \\}$ constitute the <b>decision boundary</b>.',
  _,
  'By changing $\\w$, we change the predictor $f_\\w$ and thus the decision boundary as well.',
_);

////////////////////////////////////////////////////////////
roadmap(1);

learnFramework(2);

prose(
  'So far we have talked about linear predictors $f_\\w$ which are based on a feature extractor $\\phi$ and a weight vector $\\w$.',
  'Now we turn to the problem of estimating (also known as fitting or learning) $\\w$ from training data.',
  _,
  'The <b>loss minimization</b> framework is to cast learning as an optimization problem.',
  'Note the theme of separating your problem into a model (optimization problem) and an algorithm (optimization algorithm).',
_);

add(slide('Loss functions',
  nil(),
  definition('loss function',
    'A loss function $\\Loss(x, y, \\w)$ quantifies how unhappy you would be if you used $\\w$ to make a prediction on $x$ when the correct output is $y$. It is the object we want to minimize.',
  _),
_), 'loss function');

add(slide('Score and margin',
  stmt('Correct label: $y$'),
  stmt('Predicted label: $y\' = f_\\w(x) = \\sign(\\w \\cdot \\phi(x))$'),
  pause(),
  stmt('Example: $\\w = [2, -1], \\phi(x) = [2, 0], y = -1$'),
  pause(),
  definition('score',
    'The score on an example $(x,y)$ is $\\red{\\w \\cdot \\phi(x)}$, how <b>confident</b> we are in predicting +1.',
  _),
  pause(),
  definition('margin',
    'The margin on an example $(x,y)$ is $\\red{(\\w \\cdot \\phi(x)) y}$, how <b>correct</b> we are.',
  _),
_), ['score', 'margin']);

prose(
  'Before we talk about what loss functions look like and how to learn $\\w$,',
  'we introduce another important concept, the notion of a <b>margin</b>.',
  'Suppose the correct label is $y \\in \\{-1,+1\\}$.',
  'The margin of an input $x$ is $\\w \\cdot \\phi(x) y$, which measures how correct the prediction that $\\w$ makes is.',
  'The larger the margin, the better, and non-positive margins correspond to classification errors.',
  _,
  'Note that if we look at the actual prediction $f_\\w(x)$,',
  'we can only ascertain whether the prediction was right or not.',
  'By looking at the score and the margin, we can get a more nuanced view onto the behavior of the classifier.',
  _,
  'Geometrically, if $\\|\\w\\| = 1$, then the margin of an input $x$ is exactly the distance from its feature vector $\\phi(x)$ to the <b>decision boundary</b>.',
_);

add(quizSlide('learning1-margin',
  'When does a binary classifier err on an example?',
  'margin less than 0',
  'margin greater than 0',
  'score less than 0',
  'score greater than 0',
_));

add(slide('Binary classification',
  stmt('Example: $\\w = [2, -1], \\phi(x) = [2, 0], y = -1$'),
  stmt('Recall the binary classifier'),
  parentCenter('$f_\\w(x) = \\text{sign}(\\w \\cdot \\phi(x))$'),
  pause(),
  definition('zero-one loss',
    table(
      ['$\\ZeroOneLoss(x, y, \\w) $', '$= \\1[f_\\w(x) \\neq y]$'], pause(),
      [nil(), '$= \\1[\\underbrace{(\\w \\cdot \\phi(x)) y}_\\text{margin} \\le 0]$'],
    _).margin(10, 20),
  _),
_), 'binary classification');

prose(
  'Now let us define our first loss, function, the <b>zero-one loss</b>.',
  'This corresponds exactly to our familiar notion of whether our predictor made a mistake or not.',
  'We can also write the loss in terms of the margin.',
_);

add(slide('Binary classification',
  parentCenter(lossGraph({pause: false, zeroOneLoss: true})).scale(0.8),
  //parentCenter(lossGraph({pause: true, zeroOneLoss: true, hingeLoss: true, logisticLoss: true})).scale(0.8),
  parentCenter('$\\red{\\ZeroOneLoss}(x, y, \\w) = \\1[(\\w \\cdot \\phi(x)) y \\le 0]$'),
_));

prose(
  'We can plot the loss as a function of the margin.',
  'From the graph, it is clear that the loss is 1 when the margin is negative and 0 when it is positive.',
_);

function regressionGraph() {
  var graph = new sfig.LineGraph([[[0, 0], [4, 3]]]);
  graph.xlength(600);
  graph.trajectoryColors(['red']);
  graph.roundPlaces(0).tickIncrValue(1);
  graph.axisLabel('$\\phi(x)$', '$\\w \\cdot \\phi(x)$');
  return overlay(
    graph,
    c = circle(5).color('green').shift(graph.xvalueToCoord(2), graph.yvalueToCoord(2.5)),
    l = line(c, [graph.xvalueToCoord(2), graph.yvalueToCoord(2*3/4)]).strokeWidth(3).dashed(),
    moveRightOf(text('$(\\phi(x), y)$').scale(0.7), c),
    moveLeftOf(text(purple('residual $\\purple{\\w \\cdot \\phi(x) - y}$')), l),
  _).scale(0.8);
}

add(slide('Linear regression',
  parentCenter('$f_\\w(x) = \\w \\cdot \\phi(x)$'),
  pause(),
  parentCenter(regressionGraph().scale(0.8)),
  definition('residual',
    'The '+purplebold('residual')+' is $\\purple{(\\w \\cdot \\phi(x)) - y}$, the amount by which prediction $f_\\w(x) = \\w \\cdot \\phi(x)$ overshoots the target $y$.',
  _),
_), 'linear regression');

prose(
  'Now let\'s turn for a moment to regression, where the output $y$ is a real number rather than $\\{-1,+1\\}$.',
  'Here, the <b>zero-one loss</b> doesn\'t make sense, because it\'s unlikely that we\'re going to predict $y$ exactly.',
  _,
  'Let\'s instead define the <b>residual</b> to measure how close the prediction $f_\\w(x)$ is to the correct $y$.',
  'The residual will play the analogous role of the margin for classification and will let us craft an appropriate loss function.',
_);

add(slide('Linear regression',
  parentCenter('$f_\\w(x) = \\w \\cdot \\phi(x)$'),
  definition('squared loss',
    nowrapText('$\\SquaredLoss(x, y, \\w) = (\\underbrace{\\red{f_\\w(x) - y}}_\\text{residual})^2$'),
  _),
  pause(),
  stmt('Example'),
  indent('$\\w = [2, -1], \\phi(x) = [2, 0], y = -1$'),
  indent('$\\SquaredLoss(x, y, \\w) = 25$'),
_));

add(slide('Regression loss functions',
  parentCenter(lossGraph({pause: true, regression: true, absLoss: true, squaredLoss: true})),
  pause(-2),
  parentCenter('$\\brown{\\SquaredLoss}(x, y, \\w) = (\\w \\cdot \\phi(x) - y)^2$'),
  pause(),
  parentCenter('$\\green{\\AbsLoss}(x, y, \\w) = |\\w \\cdot \\phi(x) - y|$'),
_));

prose(
  'A popular and convenient loss function to use in linear regression is the <b>squared loss</b>,',
  'which penalizes the residual of the prediction quadratically.',
  'If the predictor is off by a residual of $10$, then the loss will be $100$.',
  _,
  'An alternative to the squared loss is the <b>absolute deviation loss</b>,',
  'which simply takes the absolute value of the residual.',
_);

add(slide('Loss minimization framework',
  stmt('So far: one example, $\\Loss(x, y, \\w)$ is easy to minimize.'),
  pause(),
  keyIdea('minimize training loss',
    parentCenter('$\\displaystyle \\TrainLoss(\\w) = \\frac1{|\\Train|} \\sum_{(x,y) \\in \\Train} \\Loss(x, y, \\w)$'),
    pause(),
    parentCenter('$\\displaystyle \\min_{\\w \\in \\R^d} \\TrainLoss(\\w)$'),
  _).content.margin(20).end,
  pause(),
  stmt('Key: need to set $\\w$ to make global tradeoffs &mdash; not every example can be happy.'),
  //parentCenter(text('[demo]').linkToUrl('index.html#include=learning-demo.js&example=noise')),
_));

prose(
  'Note that on one example, both the squared and absolute deviation loss functions have the same minimum,',
  'so we cannot really appreciate the differences here.',
  'However, we are learning $\\w$ based on a whole training set $\\Train$,',
  'not just one example.',
  'We typically minimize the <b>training loss</b> (also known as the training error or empirical risk), which is the average loss over all the training examples.',
  _,
  'Importantly, such an optimization problem requires making tradeoffs across all the examples',
  '(in general, we won\'t be able to set $\\w$ to a single value that makes every example have low loss).',
_);

add(slide('Which regression loss to use?',
  stmt('Example: $\\Train = \\{ (1, 0), (1, 2), (1, 1000) \\}$'),
  pause(),
  stmt('For least squares ($L_2$) regression'),
  parentCenter('$\\blue{\\SquaredLoss}(x, y, \\w) = (\\w \\cdot \\phi(x) - y)^2$'), pause(),
  headerList(null,
    '$\\w$ that minimizes training loss is '+bluebold('mean')+' $y$', pause(),
    blue('Mean')+': tries to accommodate every example, popular',
  _),
  pause(),
  stmt('For least absolute deviation ($L_1$) regression'),
  parentCenter('$\\red{\\AbsLoss}(x, y, \\w) = |\\w \\cdot \\phi(x) - y|$'), pause(),
  headerList(null,
    '$\\w$ that minimizes training loss is '+redbold('median')+' $y$', pause(),
    red('Median')+': more robust to outliers',
  _),
_));

prose(
  'Now the question of which loss we should use becomes more interesting.',
  _,
  'For example, consider the case where all the inputs are $\\phi(x) = 1$.',
  'Essentially the problem becomes one of predicting a single value $y^*$ which is the least offensive towards all the examples.',
  _,
  'If our loss function is the squared loss, then the optimal value is the mean $y^* = \\frac1{|\\Train|} \\sum_{(x,y) \\in \\Train} y$.',
  'If our loss function is the absolute deviation loss, then the optimal value is the median.',
  _,
  'The median is more robust to outliers: you can move the furthest point arbitrarily farther out without affecting the median.',
  'This makes sense given that the squared loss penalizes large residuals a lot more.',
  _,
  'In summary, this is an example of where the choice of the loss function has a qualitative impact on the weights learned,',
  'and we can study these differences in terms of the objective function without thinking about optimization algorithms.',
_);

////////////////////////////////////////////////////////////
roadmap(2);

optFramework(0);

add(slide('Optimization problem',
  parentCenter(stmt('Objective', '$\\displaystyle \\min_{\\w \\in \\R^d} \\TrainLoss(\\w)$')),
  pause(),
  parentCenter(table(
    [text('$\\w \\in \\R$').scale(0.8), pause(), text('$\\w \\in \\R^2$').scale(0.8)],
    pause(-1),
    [
      lossGraph({weights: true, squaredLoss: true}).scale(0.7), pause(),
      twoDimQuadratic(),
    ],
  _).margin(80, 0).center()),
_));

prose(
  'Having defined a bunch of different objective functions that correspond to training loss,',
  'we would now like to optimize them &mdash; that is, obtain an algorithm that outputs the $\\w$ where the objective function achieves the minimum value.',
_);

add(slide('How to optimize?',
  definition('gradient',
    'The gradient $\\nabla_\\w \\TrainLoss(\\w)$ is the direction that increases the loss the most.',
  _),
  pause(),
  algorithm('gradient descent',
    pause(),
    'Initialize $\\w = [0, \\dots, 0]$', pause(),
    'For $t = 1, \\dots, T$:', pause(),
    indent(nowrapText('$\\w \\leftarrow \\w - \\underbrace{\\eta}_\\text{step size} \\underbrace{\\nabla_\\w \\TrainLoss(\\w)}_\\text{gradient}$')), pause(),
  _),
_));

prose(
  'A general approach is to use <b>iterative optimization</b>, which essentially starts at some starting point $\\w$ (say, all zeros),',
  'and tries to tweak $\\w$ so that the objective function value decreases.',
  _,
  'To do this, we will rely on the gradient of the function, which tells us which direction to move in to decrease the objective the most.',
  'The gradient is a valuable piece of information, especially since we will often be optimizing in high dimensions ($d$ on the order of thousands).',
  _,
  'This iterative optimization procedure is called <b>gradient descent</b>.',
  'Gradient descent has two <b>hyperparameters</b>, the <b>step size</b> $\\eta$ (which specifies how aggressively we want to pursue a direction) and the number of iterations $T$.',
  'Let\'s not worry about how to set them, but you can think of $T = 100$ and $\\eta = 0.1$ for now.',
_);

add(slide('Least squares regression',
  stmt('Objective function'),
  parentCenter('$\\displaystyle \\TrainLoss(\\w) = \\frac{1}{\|\\Train\|} \\sum_{(x,y) \\in \\Train} (\\w \\cdot \\phi(x) - y)^2$').scale(0.9),
  pause(),
  stmt('Gradient (use chain rule)'),
  parentCenter('$\\displaystyle \\nabla_\\w \\TrainLoss(\\w) = \\frac{1}{\|\\Train\|} \\sum_{(x,y) \\in \\Train} 2 (\\underbrace{\\red{\\w \\cdot \\phi(x)} - \\green{y}}_{\\red{\\text{prediction}} - \\green{\\text{target}}}) \\phi(x)$').scale(0.9),
  pause(),
  parentCenter(linkToVideo('[semi-live solution]', 'gradientDescent_learning1.mp4')),
_));

prose(
  'All that\'s left to do before we can use gradient descent is to compute the gradient of our objective function $\\TrainLoss$.',
  'The calculus can usually be done by hand; combinations of the product and chain rule suffice in most cases for the functions we care about.',
  _,
  'Note that the gradient often has a nice interpretation.',
  'For squared loss, it is the residual (prediction - target) times the feature vector $\\phi(x)$.',
  _,
  'Note that for linear predictors, the gradient is always something times $\\phi(x)$ because $\\w$ only affects the loss through $\\w \\cdot \\phi(x)$.',
_);

add(slide('Gradient descent is slow',
  parentCenter('$\\displaystyle \\orange{\\TrainLoss(\\w)} = \\frac1{|\\Train|} \\sum_{(x,y) \\in \\Train} \\blue{\\Loss(x, y, \\w)}$'),
  stmt('Gradient descent'),
  parentCenter('$\\w \\leftarrow \\w - \\eta \\orange{\\nabla_\\w \\TrainLoss(\\w)}$'),
  stmt('Problem: each iteration requires going over all training examples &mdash; expensive when have lots of data!'),
_).leftHeader(image('images/elephant.jpg').dim(150)));

prose(
  'We can now apply gradient descent on any of our objective functions that we defined before and have a working algorithm.',
  'But it is not necessarily the best algorithm.',
  _,
  'One problem (but not the only problem) with gradient descent is that it is slow.',
  'Those of you familiar with optimization will recognize that methods like Newton\'s method can give faster convergence,',
  'but that\'s not the type of slowness I\'m talking about here.',
  _,
  'Rather, it is the slowness that arises in large-scale machine learning applications.',
  'Recall that the training loss is a sum over the training data.',
  'If we have one million training examples (which is, by today\'s standards, only a modest number),',
  'then each gradient computation requires going through those one million examples, and this must happen before we can make any progress.',
  'Can we make progress before seeing all the data?',
_);

add(slide('Stochastic gradient descent',
  parentCenter('$\\displaystyle \\orange{\\TrainLoss(\\w)} = \\frac1{|\\Train|} \\sum_{(x,y) \\in \\Train} \\blue{\\Loss(x, y, \\w)}$'),
  stmt('Gradient descent (GD)'),
  indent('$\\w \\leftarrow \\w - \\eta \\orange{\\nabla_\\w \\TrainLoss(\\w)}$'),
  pause(),
  stmt('Stochastic gradient descent (SGD)'),
  indent('For each $(x, y) \\in \\Train$:'),
  indent(indent('$\\w \\leftarrow \\w - \\eta \\blue{\\nabla_\\w \\Loss(x, y, \\w)}$')),
  pause(),
  keyIdea('stochastic updates',
    linkToVideo('It\'s not about '+orangebold('quality')+', it\'s about '+bluebold('quantity')+'.', 'stochasticGradientDescent.mp4'),
  _),
  // live solution continued
_).leftHeader(image('images/hummingbird.jpg').dim(150)), 'stochastic gradient descent');

prose(
  'The answer is <b>stochastic gradient descent</b> (SGD).',
  'Rather than looping through all the training examples to compute a single gradient and making one step,',
  'SGD loops through the examples $(x,y)$ and updates the weights $\\w$ based on <b>each</b> example.',
  'Each update is not as good because we\'re only looking at one example rather than all the examples, but we can make many more updates this way.',
  _,
  'In practice, we often find that just performing one pass over the training examples with SGD,',
  'touching each example once, often performs comparably to',
  'taking ten passes over the data with GD.',
  _,
  'There are other variants of SGD.',
  'You can randomize the order in which you loop over the training data in each iteration,',
  'which is useful.',
  'Think about what would happen if you have all the positive examples first and the negative examples after that.',
_);

add(slide('Step size',
  parentCenter('$\\w \\leftarrow \\w - \\underbrace{\\eta}_\\text{step size} \\blue{\\nabla_\\w \\Loss(x, y, \\w)}$'),
  stmt('Question', 'what should $\\eta$ be?'),
  pause(),
  parentCenter(overlay(
    arrow([0, 0], [750, 0]).strokeWidth(3),
    center('$\\eta$').shiftBy(750, -20),
    transform('conservative, more stable').pivot(-1, -1).shiftBy(0, 10),
    transform('aggressive, faster').pivot(1, -1).shiftBy(730, 10),
    l1 = line([0, up(10)], [0, down(10)]).strokeWidth(3),
    l2 = line([650, up(10)], [650, down(10)]).strokeWidth(3),
    moveTopOf('$0$', l1),
    moveTopOf('$1$', l2),
  _)),
  pause(),
  headerList('Strategies',
    'Constant: $\\eta = 0.1$', pause(),
    'Decreasing: $\\eta = 1/\\sqrt{\\text{# updates made so far}}$',
  _),
_));

prose(
  'One remaining issue is choosing the step size, which in practice (and as we have seen) is actually quite important.',
  'Generally, larger step sizes are like driving fast.  You can get faster convergence, but you might also get very unstable results and crash and burn.',
  'On the other hand, with smaller step sizes, you get more stability, but you might get to your destination more slowly.',
  _,
  'A suggested form for the step size is to set the initial step size to $1$',
  'and let the step size decrease as the inverse of the square root of the number of updates we\'ve taken so far.',
  'There are some nice theoretical results showing that SGD is guaranteed to converge in this case (provided all your gradients have bounded length).',
_);

add(summarySlide('Summary so far',
  stmt('Linear predictors'),
  parentCenter('$f_\\w(x)$ based on score $\\w \\cdot \\phi(x)$'),
  pause(),
  stmt('Loss minimization: learning as optimization'),
  parentCenter('$\\displaystyle \\min_\\w \\TrainLoss(\\w)$'),
  pause(),
  stmt('Stochastic gradient descent: optimization algorithm'),
  parentCenter('$\\w \\leftarrow \\w - \\eta \\nabla_\\w \\Loss(x, y, \\w)$'),
  pause(),
  'Done for linear regression; what about classification?',
_));

prose(
  'In summary, we have seen linear predictors, the functions we\'re considering',
  'the criterion for choosing one, and an algorithm that goes after that criterion.',
  _,
  'We already worked out a linear regression example.',
  'What are good loss functions for binary classification?',
_);

add(slide('Zero-one loss',
  parentCenter('$\\ZeroOneLoss(x, y, \\w) = \\1[(\\w \\cdot \\phi(x)) y \\le 0]$'),
  parentCenter(lossGraph({legend: true, pause: true, zeroOneLoss: true})).scale(0.8),
  pause(),
  headerList('Problems',
    'Gradient of $\\ZeroOneLoss$ is 0 everywhere, SGD not applicable', pause(),
    '$\\ZeroOneLoss$ is insensitive to how badly model messed up',
  _).ymargin(0),
_));

prose(
  'Recall that we have the zero-one loss for classification.',
  'But the main problem with zero-one loss is that it\'s hard to optimize (in fact, it\'s provably NP hard in the worst case).',
  'And in particular, we cannot apply gradient-based optimization to it,',
  'because the gradient is zero (almost) everywhere.',
_);

add(slide('Support vector machines*',
  parentCenter('$\\HingeLoss(x, y, \\w) = \\max\\{1 - (\\w \\cdot \\phi(x)) y, 0 \\}$'),
  parentCenter(lossGraph({legend: true, zeroOneLoss: true, perceptronLoss: true, hingeLoss: true}).scale(0.8)),
  pause(),
  headerList(null,
    stmt('Intuition', 'hinge loss upper bounds 0-1 loss, has non-trivial gradient'), pause(),
    'Try to increase margin if less than $1$',
  _),
_));

prose(
  // How do you solve this?
  'To fix this problem, we can use the <b>hinge loss</b>, which is an upper bound on the zero-one loss.',
  'Minimizing upper bounds are a general idea; the hope is that pushing down the upper bound leads',
  'to pushing down the actual function.',
  _,
  'Advanced: The hinge loss corresponds to the <b>Support Vector Machine</b> (SVM) objective function with one important difference.',
  'The SVM objective function also includes a <b>regularization penalty</b> $\\|\\w\\|^2$, which prevents the weights from getting too large.',
  'We will get to regularization later in the course, so you needn\'t worry about this for now.',
  'But if you\'re curious, read on.',
  _,
  'Why should we penalize $\\|\\w\\|^2$?  One answer is Occam\'s razor, which says to find the simplest hypothesis that explains the data.',
  'Here, simplicity is measured in the length of $\\w$.  This can be made formal using statistical learning theory (take CS229T if you want to learn more).',
  _,
  'Perhaps a less abstract and more geometric reason is the following.',
  'Recall that we defined the (algebraic) margin to be $\\w \\cdot \\phi(x) y$.',
  'The actual (signed) distance from a point to the decision boundary',
  'is actually $\\frac{\\w}{\\|\\w\\|} \\cdot \\phi(x) y$ &mdash; this is called the geometric margin.',
  'So the loss being zero (that is, $\\HingeLoss(x,y,\\w) = 0$) is equivalent to',
  'the algebraic margin being at least 1 (that is, $\\w \\cdot \\phi(x) y \\ge 1$),',
  'which is equivalent to the geometric margin being larger than $\\frac1{\\|\\w\\|}$ (that is, $\\frac{\\w}{\\|\\w\\|} \\cdot \\phi(x) y \\ge \\frac1{\\|\\w\\|}$).',
  'Therefore, reducing $\\|\\w\\|$ increases the geometric margin.',
  'For this reason, SVMs are also referred to as max-margin classifiers.',
_);

add(slide('A gradient exercise',
  parentCenter(lossGraph({legend: true, hingeLoss: true}).scale(0.8)),
  problem('Gradient of hinge loss',
    'Compute the gradient of',
    parentCenter('$\\HingeLoss(x, y, \\w) = \\max\\{1 - (\\w \\cdot \\phi(x)) y, 0 \\}$'),
  _),
  parentCenter('[whiteboard]'),
_));

prose(
  'You should try to "see" the solution before you write things down formally.',
  'Pictorially, it should be evident: when the margin is less than 1,',
  'then the gradient is the gradient of $1-(\\w\\cdot\\phi(x))y$, which is equal to $-\\phi(x) y$.',
  'If the margin is larger than 1, then the gradient is the gradient of 0, which is 0.',
  'Combining the two cases: $\\displaystyle \\nabla_\\w \\HingeLoss(x, y, \\w) = \\begin{cases} -\\phi(x) y & \\text{if $\\w\\cdot\\phi(x) y < 1$} \\\\ 0 & \\text{if $\\w\\cdot\\phi(x) y > 1$.} \\end{cases}$',
  _,
  'What about when the margin is exactly 1?',
  'Technically, the gradient doesn\'t exist because the hinge loss is not differentiable there.',
  'Fear not!',
  'Practically speaking, at the end of the day, we can take either $-\\phi(x) y$ or $0$ (or anything in between).',
  _,
  'Technical note (can be skipped): given $f(\\w)$, the gradient $\\nabla f(\\w)$ is only defined at points $\\w$ where $f$ is differentiable.',
  'However, subdifferentials $\\partial f(\\w)$ are defined at every point (for convex functions).',
  'The subdifferential is a set of vectors called subgradients $z \\in f(\\w)$ which define linear underapproximations to $f$,',
  'namely $f(\\w) + z \\cdot (\\w\' - \\w) \\le f(\\w\')$ for all $\\w\'$.',
_);

/*add(slide('Support vectors',
  parentCenter(text('[demo]').linkToUrl('index.html#include=learning-demo.js&example=class')),
  pause(),
  stmt('Observation: gradient is non-zero for only some examples'),
  stmt('Note: final $\\w$ is just a linear combination of those $\\phi(x)$ that didn\'t attain margin 1 &mdash; these are called '+redbold('support vectors')+':'),
  parentCenter('$\\displaystyle \\w = \\eta \\phi(x_1) y_1 + \\eta \\phi(x_3) y_3 + \\eta \\phi(x_7) y_7 + \\cdots$'),
_));*/

/*prose(
  'One interesting property of stochastic gradient descent is that the resulting weight vector',
  'only depends on the <b>support vectors</b>, that examples that caused a non-zero update.',
  'In particular, each update adds $\\eta \\phi(x_i) y_i$ to the weight vector.',
  'An example is given in the slides.',
_);*/

add(slide('Logistic regression',
  parentCenter('$\\LogisticLoss(x, y, \\w) = \\log(1 + e^{-(\\w \\cdot \\phi(x)) y})$'),
  parentCenter(lossGraph({zeroOneLoss: true, perceptronLoss: true, hingeLoss: true, logisticLoss: true})),
  headerList(null,
    stmt('Intuition', 'Try to increase margin even when it already exceeds 1'), pause(),
  _).ymargin(0),
_));

prose(
  'Another popular loss function used in machine learning is the <b>logistic loss</b>.',
  'The main property of the logistic loss is no matter how correct you are predicting, you will have non-zero loss,',
  'and so there is still an incentive (although a diminishing one) to push the margin even larger.',
  'This means that you\'ll update on every single example.',
  _,
  'There are some connections between logistic regression and probabilistic models, which we will get to later.',
_);

/*add(quizSlide('learning1-logistic-sv',
  'After running stochastic gradient descent on the logistic loss on 1000 training examples, how many support vectors make up the final weight vector?',
  'always 0',
  'any number between 0 and 1000',
  'some number close to 1000',
  'exactly 1000',
_));*/

add(summarySlide('Summary so far',
  parentCenter('$\\underbrace{\\w \\cdot \\phi(x)}_\\text{score}$'),
  pause(),
  frameBox(table(
    [nil(), darkblue('Classification'), darkblue('Linear regression')],
    ['Predictor $f_\\w$', '$\\sign(\\text{score})$', '$\\text{score}$'], pause(),
    ['Relate to correct $y$', 'margin ($\\text{score} \\, y$)', 'residual ($\\text{score} - y$)'], pause(),
    ['Loss functions', ytable('zero-one', 'hinge', 'logistic'), ytable('squared', 'absolute deviation')], pause(),
    ['Algorithm', 'SGD', 'SGD'],
  _).margin(25, 15).ycenter()).scale(0.95),
_));

add(slide('Multiclass classification',
  problem('multiclass classification',
    'Suppose we have three labels: $y \\in \\{ \\vR, \\vG, \\vB \\}$',
    stmt('Weights: $\\w = (\\w_{\\vR}, \\w_{\\vG}, \\w_{\\vB})$'),
    stmt('Predictor'),
    parentCenter('$\\displaystyle f_\\w(x) = \\arg\\max_{y \\in \\{ \\vR, \\vG, \\vB \\}} \\w_y \\cdot \\phi(x)$'),
    pause(),
    'Construct a generalization of the hinge loss for the multiclass setting.',
  _),
  pause(),
  parentCenter('[whiteboard]'),
_));

prose(
  'Let\'s generalize from binary classification to multiclass classification.',
  'For concreteness, let us assume there are three labels.',
  'For each label $y$, we have a weight vector $\\w_y$, from which we define a label-specific score $\\w_y \\cdot \\phi(x)$.',
  'To make a prediction, we just take the label with the highest score.',
  _,
  'To learn $\\w$, we need a loss function.',
  'Let us try to generalize the hinge loss to the multiclass setting.',
  'Recall that the hinge loss is $\\HingeLoss(x, y, \\w) = \\max\\{1 - \\text{margin}, 0\\}$.',
  'So we just need to define the notion of the margin.',
  'Naturally, the margin should be the amount by which the correct score exceeds the others:',
  '$\\displaystyle \\text{margin} = \\w_y \\cdot \\phi(x) - \\max_{y\' \\neq y} \\{ \\w_{y\'} \\cdot \\phi(x) \\}$.',
  _,
  'Now, we just plug in this expression and do some algebra to get:',
  '$\\displaystyle \\HingeLoss(x, y, \\w) = \\max_{y\'} \\{ \\w_{y\'} \\cdot \\phi(x) - \\w_{y} \\cdot \\phi(x) + \\1[y\' \\neq y] \\}$.',
  //'$\\displaystyle \\HingeLoss(x, y, \\w) = \\max_{y\' \\neq y} \\{ \\w_{y\'} \\cdot \\phi(x) - \\w_{y} \\cdot \\phi(x) + \\1[y\' \\neq y] \\}$.',
  _,
  'The loss can be interpreted as the amount by which any competitor label $y\'$\'s score exceeds the true label $y$\'s score',
  'when the competitor is given a 1-point handicap.',
  'The handicap encourages the true label $y$\'s score to be at least 1 more than any competitor label $y\'$\'s score.',
  //'The loss can be interpreted as the amount by which any competitor label $y\'$\'s score exceeds the true label $y$\'s score by more than 1.',
_);

learnFramework(2);

add(slide('Next lecture',
  stmt('Linear predictors'),
  parentCenter('$f_\\w(x)$ based on score $\\w \\cdot \\phi(x)$'),
  indent('Which feature vector $\\phi(x)$ to use?'),
  pause(),
  stmt('Loss minimization'),
  parentCenter('$\\displaystyle \\min_\\w \\TrainLoss(\\w)$'),
  indent('How do we <b>generalize</b> beyond the training set?'),
_));

initializeLecture();
