G = sfig.serverSide ? global : this;
G.prez = presentation();

add(titleSlide('Lecture 3: Machine learning II',
  nil(),
  parentCenter(image('images/learning.png').width(300)),
_));

add(quizSlide('learning2-start',
  'Can we obtain decision boundaries which are circles by using linear classifiers?',
  'Yes',
  'No',
_));

prose(
  'The answer is yes.',
  'This might seem paradoxical since we are only working with linear classifiers.',
  'But as we will see later, <b>linear</b> refers to the relationship between the',
  'weight vector $\\w$ and the prediction (not $x$), whereas the decision boundary',
  'refers to how the prediction varies as a function of $x$.',
_);

learnFramework(2);

prose(
  'Last time, we started by studying the predictor $f$,',
  'concerning ourselves with linear predictors based on the score $\\w \\cdot \\phi(x)$,',
  'where $\\w$ is the weight vector we wish to learn and $\\phi$',
  'is the feature extractor that maps an input $x$ to some feature vector $\\phi(x) \\in \\R^d$,',
  'turning something that is domain-specific (images, text) into a mathematical object.',
  _,
  'Then we looked at how to learn such a predictor by formulating an optimization problem',
  'and developing an algorithm to solve that problem.',
_);

add(slide('Review: optimization problem',
  keyIdea('minimize training loss',
    parentCenter('$\\displaystyle \\TrainLoss(\\w) = \\frac1{|\\Train|} \\sum_{(x,y) \\in \\Train} \\Loss(x, y, \\w)$'),
    parentCenter('$\\displaystyle \\min_{\\w \\in \\R^d} \\TrainLoss(\\w)$'),
  _).content.margin(20).end,
_));

prose(
  'Recall that the optimization problem was to minimize the training loss,',
  'which is the average loss over all the training examples.',
_);

add(slide('Review: loss functions',
  parentCenter(table(
    [redbold('Regression'), pause(), redbold('Binary classification')], pause(-1),
    [lossGraph({pause: false, regression: true, squaredLoss: true, absLoss: true}).scale(0.8), pause(),
    lossGraph({pause: false, zeroOneLoss: true, hingeLoss: true, logisticLoss: true}).scale(0.8)],
  _).center().margin(80, 20)),
  pause(),
  parentCenter(bluebold('Captures properties of the desired predictor')),
_));

prose(
  'The actual loss function depends on what we\'re trying to accomplish.',
  'Generally, the loss function takes the score $\\w\\cdot\\phi(x)$,',
  'compares it with the correct output $y$ to form either the residual (for regression)',
  'or the margin (for classification).',
  _,
  'Regression losses are smallest when the residual is close to zero.',
  'Classification losses are smallest when the margin is large.',
  'Which loss function we choose depends on the desired properties.',
  'For example, the absolute deviation loss for regression is robust against outliers.',
  'The logistic loss for classification never relents in encouraging large margin.',
  _,
  'Note that we\'ve been talking about the loss on a single example,',
  'and plotting it in 1D against the residual or the margin.',
  'Recall that what we\'re actually optimizing is the training loss,',
  'which sums over all data points.',
  'To help visualize the connection between a single loss plot and the more general picture,',
  'consider the simple example of linear regression on three data points:',
  '$([1, 0], 2)$, $([1, 0], 4)$, and $([0, 1], -1)$,',
  'where $\\phi(x) = x$.',
  _,
  'Let\'s try to draw the training loss, which is a function of $\\w = [w_1, w_2]$.',
  'Specifically, the training loss is $\\frac{1}{3}((w_1 - 2)^2 + (w_1 - 4)^2 + (w_2 - (-1))^2)$.',
  'The first two points contribute a quadratic term sensitive to $w_1$,',
  'and the third point contributes a quadratic term sensitive to $w_2$.',
  'When you combine them, you get a quadratic centered at $[3, -1]$.',
  '(Draw this on the whiteboard).',
_);

add(slide('Review: optimization algorithms',
  let(w = 20),
  let(elephant = function() { return image('images/elephant.jpg').width(150); }),
  let(hummingbird = function() { return image('images/hummingbird.jpg').width(40); }),
  table(
    [elephant(),
    parentLeft(algorithm('gradient descent',
      pause(),
      'Initialize $\\w = [0, \\dots, 0]$',
      'For $t = 1, \\dots, T$:',
      indent('$\\w \\leftarrow \\w - \\eta_t \\orange{\\nabla_\\w \\TrainLoss(\\w)}$'),
    _)).scale(0.9)],
    pause(),
    [table(
      [hummingbird(), hummingbird(), hummingbird()],
      [hummingbird(), hummingbird(), hummingbird()],
      [hummingbird(), hummingbird(), hummingbird()],
      [hummingbird(), hummingbird(), hummingbird()],
    _),
    parentLeft(algorithm('stochastic gradient descent',
      'Initialize $\\w = [0, \\dots, 0]$',
      'For $t = 1, \\dots, T$:',
      indent('For $(x,y) \\in \\Train$:'),
      indent(indent('$\\w \\leftarrow \\w - \\eta_t \\blue{\\nabla_\\w \\Loss(x, y, \\w)}$')),
    _)).scale(0.9)],
  _).margin(30),
_));

prose(
  'Finally, we introduced two very simple algorithms to minimize the training loss,',
  'both based on iteratively computing the gradient of the objective with respect to the parameters $\\w$ and stepping in the opposite direction of the gradient.',
  'Think about a ball at the current weight vector and rolling it down on the surface of the training loss objective.',
  _,
  'Gradient descent (GD) computes the gradient of the full training loss,',
  'which can be slow for large datasets.',
  _,
  'Stochastic gradient descent (SGD), which approximates the gradient of the training loss with the loss at a single example,',
  ' generally takes less time.',
  _,
  'In both cases, one must be careful to set the step size $\\eta$ properly (not too big, not too small).',
_);

function roadmap(i) {
  add(outlineSlide('Roadmap', i, [
    ['features', 'Features'],
    ['neuralNetworks', 'Neural networks'],
    ['chainRule', 'Gradients without tears'],
    ['nearestNeighbors', 'Nearest neighbors'],
  ]));
}

////////////////////////////////////////////////////////////
roadmap(0);

prose(
  'The first half of this lecture is about thinking about feature extraction $\\phi(x)$.',
  'Features are a critical part of machine learning which often does not get as much attention as it deserves.',
  'Ideally, they would be given to us by a domain expert,',
  'and all we (as machine learning people) have to do is to stick them into our learning algorithm.',
  'While one can get considerable mileage out of doing this,',
  'the interface between general-purpose machine learning and domain knowledge is often nuanced,',
  'so to be successful, it pays to understand this interface.',
  _,
  'In the second half of this lecture, we return to learning,',
  'rip out the linear predictors that we had from before,',
  'and show how we can build more powerful classifiers given the features that we extracted.',
_);

add(slide('Two components',
  stmt('Score (drives prediction)'),
  parentCenter('$\\red{\\w} \\cdot \\blue{\\phi(x)}$'),
  pause(),
  headerList(null,
    'Previous: '+red('learning')+' sets $\\red{\\w}$ via optimization',
    'Next: '+bluebold('feature extraction')+' sets $\\blue{\\phi(x)}$ based on prior domain knowledge',
  _),
_));

prose(
  'As a reminder, the prediction is driven by the score $\\w \\cdot \\phi(x)$.',
  'In regression, we predict the score directly, and in binary classification, we predict the sign of the score.',
  _,
  'Both $\\w$ and $\\phi(x)$ play an important role in prediction.',
  'So far, we have fixed $\\phi(x)$ and used learning to set $\\w$.',
  'Now, we will explore how $\\phi(x)$ affects the prediction.',
_);

add(slide('An example task',
  example('restaurant recommendation',
    stmt('Input $x$'),
    indent('user and restaurant information'),
    yspace(10),
    stmt('Output $y \\in \\{ +1, -1 \\}$'),
    indent('whether user will like the restaurant'),
  _),
  pause(),
  stmt('Recall', 'feature extractor $\\phi$ should pick out properties of $x$ that might be useful for prediction of $y$'),
  stmt('Recall', 'feature extractor $\\phi$ returns a set of (feature name, real number) pairs'),
_));

prose(
  'Consider the problem of predicting whether a given user will like a given restaurant.',
  'Suppose that $x$ contains all the information about the user and restaurant.',
_);

add(quizSlide('learning2-features',
  'What might be good features for predicting whether a user will like a restaurant?',
_));

add(slide('Organization of features',
  // Copied from learning1
  stmt('Task: predict whether a string is an email address'),
  parentCenter(featureExtractionExample()),
  'Which features to include?  Need an organizational principle...',
_));

prose(
  'How would we go about about creating good features?',
  _,
  'Here, we used our prior knowledge to define certain features (contains_@)',
  'which we believe to be helpful for detecting email addresses.',
  _,
  'But this is ad-hoc: which strings should we include?',
  'We need a more systematic way about going about this.',
_);

add(slide('Feature templates',
  definition('feature template (informal)',
    'A <b>feature template</b> is a group of features all computed in a similar way.',
  _),
  pause(),
  stmt('Input'),
  parentCenter(greenitalics('abc@gmail.com')),
  headerList('Some feature templates',
    'Length greater than ___',
    //'Fraction of alphanumeric characters',
    'Last three characters equals ___',
    'Contains character ___',
    pause(),
    'Pixel intensity of position ___, ___',
  _),
_).leftHeader(image('images/cookie-cutter.jpg').dim(150)));

prose(
  'A useful organization principle is a <b>feature template</b>,',
  'which groups all the features which are computed in a similar way.',
  '(People often use the word "feature" when they really mean "feature template".)',
  _,
  'A feature template also allows us to define a set of related features',
  '(contains_@, contains_a, contains_b).',
  'This reduces the amount of burden on the feature engineer',
  'since we don\'t need to know which particular characters are useful,',
  'but only that existence of certain single characters is a useful cue to look at.',
  _,
  'We can write each feature template as a English description with a blank (___),',
  'which is to be filled in with an arbitrary string.',
  'Also note that feature templates are most natural for defining binary features,',
  'ones which take on value 1 (true) or 0 (false).',
  _,
  'Note that an isolated feature (fraction of alphanumeric characters) can be treated',
  'as a trivial feature template with no blanks to be filled.',
  _,
  'As another example, if $x$ is a $k \\times k$ image, then $\\{ \\text{pixelIntensity}_{ij} : 1 \\le i,j\\le k \\}$ is a feature template consisting of $k^2$ features,',
  'whose values are the pixel intensities at various positions of $x$.',
_);

add(slide('Feature templates',
  stmt('Feature template: last three characters equals ___'),
  xtable(
    greenitalics('abc@gmail.com'),
    a = thickRightArrow(250),
    frameBox(table(
      [red('endsWith_aaa'), ':', blue('0')],
      [red('endsWith_aab'), ':', blue('0')],
      [red('endsWith_aac'), ':', blue('0')],
      ['...', nil(), nil()],
      [red('endsWith_com'), ':', blue('1')],
      ['...', nil(), nil()],
      [red('endsWith_zzz'), ':', blue('0')],
    _).margin(5, 0)).scale(0.8),
  _).center().margin(15),
  pause(),
_).leftHeader(image('images/cookie-cutter.jpg').dim(150)));

prose(
  'This is an example of one feature template mapping onto a group of $m^3$ features,',
  'where $m$ (26 in this example) is the number of possible characters.',
_);

add(slide('Sparsity in feature vectors',
  stmt('Feature template: last character equals ___'),
  xtable(
    greenitalics('abc@gmail.com'),
    a = thickRightArrow(250),
    frameBox(new Table(wholeNumbers(26).map(function(i) {
      var c = String.fromCharCode(97+i);
      var hit = c == 'm';
      return [red('endsWith_' + c), ':', (hit ? bold('1') : '0')];
    })).margin(5, 0)).scale(0.4),
  _).center().margin(15),
  pause(),
  'Inefficient to represent all the zeros...',
_).leftHeader(image('images/cookie-cutter.jpg').dim(150)));

prose(
  'In general, a feature template corresponds to many features.',
  'It would be inefficient to represent all the features explicitly.',
  'Fortunately, the feature vectors are often <b>sparse</b>,',
  'meaning that most of the feature values are $0$.',
  'It is common for all but one of the features to be $0$.',
  'This is known as a <b>one-hot representation</b> of a discrete value such as a character.',
_);

add(slide('Feature vector representations',
  parentCenter(frameBox(table(
    [red('fracOfAlpha'), ':', blue('0.85')],
    [red('contains_a'), ':', blue('0')],
    ['...', nil(), nil()],
    [red('contains_@'), ':', blue('1')],
    ['...', nil(), nil()],
  _).margin(5, 0)).scale(0.8)),
  pause(),
  stmt('Array representation (good for dense features)'),
  parentCenter(tt('[0.85, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0]')),
  pause(),
  stmt('Map representation (good for sparse features)'),
  parentCenter(tt('{"fracOfAlpha": 0.85, "contains_@": 1}')),
_));

prose(
  'Let\'s now talk a bit more about implementation.',
  'There are two common ways to define features: using arrays or using maps.',
  _,
  '<b>Arrays</b> assume a fixed ordering of the features and represent the feature values as an array.',
  'These representations are appropriate when the number of nonzeros is significant (the features are dense).',
  'Arrays are especially efficient in terms of space and speed (and you can take advantage of GPUs).',
  'In computer vision applications, features (e.g., the pixel intensity features)',
  'are generally dense, so array representations are more common.',
  _,
  'However, when we have sparsity (few nonzeros),',
  'it is typically more efficient to represent the feature vector as a <b>map</b> from strings to doubles',
  'rather than an fixed-size array of doubles.',
  'The features not in the map implicitly have a default value of zero.',
  'This sparse representation is very useful in natural language processing,',
  'and is what allows us to work effectively over trillions of features.',
  'In Python, one would define a feature vector $\\phi(x)$ as <tt>{"endsWith_"+x[-3:]: 1}</tt>.',
  'Maps do incur extra overhead compared to arrays, and therefore maps are much slower when the features are not sparse.',
  _,
  'Finally, it is important to be clear when describing features.',
  'Saying "length" might mean that there is one feature whose value is the length of $x$',
  'or that there could be a feature template "length is equal to ___".',
  'These two encodings of the same information can have a drastic impact on prediction accuracy when using a linear predictor,',
  'as we\'ll see later.',
_);

/*add(slide('Feature engineering',
  'Arguably the most important part of machine learning!',
  pause(),
  headerList('Examples of features',
    'Natural language: words, parts-of-speech, capitalization pattern', pause(),
    'Computer vision: pixels, histograms of color, orientations, magnitude', pause(),
    'In general: use domain knowledge about task, sometimes can be learned automatically',
  _),
  pause(),
  stmt('Intuition', 'extract lots of features which <b>might be</b> relevant'),
_).leftHeader(image('images/gears.png').dim(100)));*/

add(slide('Two pieces',
  stmt('Score (drives prediction)'),
  parentCenter('$\\red{\\w} \\cdot \\blue{\\phi(x)}$'),
  pause(),
  headerList('Thought experiment',
    'Assume '+red('learning')+' chooses the optimal $\\w$.',
    'How does '+bluebold('feature extraction')+' affect quality of $f_\\w$?',
  _),
_));

prose(
  'Having discussed how feature templates can be used to organize groups of feature and allow us to leverage sparsity,',
  'let us further study how the features can affect prediction accuracy.',
  _,
  'The question is: if learning were perfect and always magically choose the best $\\w$,',
  'how could be the resulting predictor $f_\\w$, which is now limited by the choice of $\\phi$?',
_);

add(slide('Simple example',
  stmt('Regression: $x \\in \\R, y \\in \\R$'),
  nil(),
  stmt('Linear functions'),
  parentCenter('$\\phi(x) = x$'),
  parentCenter(stagger(
      '$\\sF_1 = \\{ \\blue{x \\mapsto w_1 x} : \\red{w_1 \\in \\R} \\}$', pause(),
      '$\\sF_1 = \\{ \\blue{x \\mapsto w_1 x + w_2 x^2} : \\red{w_1 \\in \\R, w_2 = 0} \\}$',
  _)),
  pause(-1),
  stmt('Quadratic functions'),
  parentCenter('$\\phi(x) = [x, x^2]$'),
  parentCenter('$\\sF_2 = \\{ \\blue{x \\mapsto w_1 x + w_2 x^2} : \\red{w_1 \\in \\R, w_2 \\in \\R} \\}$'),
  parentCenter('[whiteboard]'),
_));

prose(
  'Given a fixed feature extractor $\\phi$, consider the space of all predictors $f_\\w$ obtained by sweeping $\\w$ over all possible values.',
  _,
  'If we use $\\phi(x) = x$, then we get linear functions that go through the origin.',
  'If we use $\\phi(x) = [x, x^2]$, then we get quadratic functions that go through the origin,',
  'which are a strict superset of the linear functions,',
  'and therefore are strictly more expressive.',
_);

add(slide('Expressivity',
  definition('hypothesis class',
    'A <b>hypothesis class</b> is the set of possible predictors with a fixed $\\phi(x)$ and varying $\\w$:',
    parentCenter('$\\sF = \\{ f_\\w : \\w \\in \\R^d \\}$'),
  _),
  pause(),
  parentCenter(overlay(
    center(a = ellipse(350, 100).fillColor('brown').fillOpacity(0.2)),
    transform('All predictors').pivot(-1, -1).scale(0.8).shift(a.left(), a.top()),
    pause(),
    e = ellipse(150, 60).strokeWidth(2).fillColor('blue').fillOpacity(0.3),
    moveRightOf(text(blue('Feature extraction')).scale(0.8), e),
    center('$\\blue{\\sF}$').shiftBy(-120, -50),
    pause(),
    c = circle(5).fillColor('red').shiftBy(-10, 10),
    moveTopOf(text(red('Learning')).scale(0.8), c),
    moveBottomOf('$\\red{f_\\w}$', c),
  _)),
  pause(),
  parentCenter(greenbold('Question: does $\\sF$ contain a good predictor?')),
  //parentCenter('[whiteboard: classifiers, regressors]'),
_));

prose(
  'In general, this thought experiment leads us to think about the question of <b>expressivity</b>.',
  'The feature extractor $\\phi$ really defines a <b>hypothesis class</b> (also known as model family),',
  'the set of possible predictors.',
  _,
  'Now we can view learning as follows: feature extraction defines a hypothesis class $\\sF$,',
  'a subset of the set of all possible predictors.',
  'Then learning is the problem of choosing a particular predictor from that space based on the training data.',
  _,
  'Note that if feature extraction defines a hypothesis class which doesn\'t contain any good predictors, then no amount of learning can help.',
  'So the question really is whether the features $\\phi(x)$ are powerful enough to <b>express</b> predictors which are good?',
  'It\'s okay and expected that $\\sF$ will contain a bunch of bad ones as well.',
  _,
  'Later, we\'ll see reasons for keeping the hypothesis class small (both for computational and statistical reasons),',
  'because we can\'t get the optimal $\\w$ for any feature extractor $\\phi$ we choose.',
_);

/*add(slide('An example task',
  example('predicting health',
    stmt('Input $x$'),
    indent('patient information, vital signs'),
    yspace(10),
    stmt('Output $y \\in \\R$'),
    indent('health (positive is good)'),
  _),
_).leftHeader(image('images/doctor-tools.jpg').width(100)));*/

/*prose(
  'It\'s not just a matter of making the hypothesis class larger $\\sF$; it also matters how it\'s made larger.',
  'To get some intuition for this, we turn to a concrete task.',
_);*/

add(slide('Features in linear predictors',
  stmt('(Sunday): extract any features that might be relevant.'),
  pause(),
  example('predicting health',
    stmt('Input: patient information $x$'),
    yspace(10),
    stmt('Output: health $y \\in \\R$ (positive is good)'),
  _),
  stmt('Features for medical diagnosis: height, weight, body temperature, blood pressure, etc. &mdash; just throw them in!'),
  pause(),
  headerList('Three issues (<b>non-linearity</b> in original measurements)',
    'Non-monotonicity',
    'Saturation',
    'Interactions between features',
  _),
_));

prose(
  'So far, we have been pretty laid back about how we add features and have simply suggested to extract any features which are relevant.',
  'However, because we\'re working with linear classifiers, we actually do need to pay attention to how we do this.',
  'All three issues stem from <b>non-linearities in the original measurements</b>.',
_);

// Plot a function and some points
function regressionGraph(opts) {
  var trajectories = opts.funcs.map(function(func) {
    var points = [];
  });
  var graph = new sfig.LineGraph([[[0, 0], [4, 3]]]);
  graph.xlength(600);
  //graph.trajectoryColors(['red']);
  graph.roundPlaces(0).tickIncrValue(1);
  graph.axisLabel('$\\phi(x)$', '$\\w \\cdot \\phi(x)$');
  return overlay(
    graph,
  _).scale(0.8);
}

add(slide('Non-monotonicity: attempt 1',
  stmt('Features: $\\phi(x) = [1, \\text{temperature}(x)]$'),
  stmt('Output: health $y \\in \\R$'),
  pause(),
  stmt('Problem: favor extremes; true relationship is non-monotonic'),
  //parentCenter(regressionGraph({funcs: [function(x) {return x;}]})),
  parentCenter('[whiteboard]'),
_));

prose(
  'Let\'s consider the regression task of trying to predict the health $y$ from just the temperature (and a bias).',
  'Recall that we should think in terms of the hypothesis class rather than individual predictors.',
  _,
  'The set of possible predictors (functions) $\\sF$ defined by just these features are just lines with arbitrary intercept and slope.',
  _,
  'The problem is that we can only represent that either: (i) the higher the temperature, the healthier you are; or (ii) the lower the temperature, the healthier you are.',
  _,
  'Both of these are ridiculous.  This is an instance of the problem where there is a <b>non-monotonic</b> relationship between the features $\\phi(x)$ and the output $y$.',
  'That is, $y$ is neither increasing nor decreasing with respect to its features.',
_);

add(slide('Non-monotonicity: attempt 2',
  stmt('Solution: '+redbold('transform')+' inputs'),
  '$\\phi(x) = [1, \\blue{(\\text{temperature}(x) - 37)^2}]$',
  stmt('Disadvantage: requires manually-specified domain knowledge'),
  //parentCenter('[whiteboard]'),
_));

prose(
  'To fix this problem, we can just redefine the features to be transformations of the input &mdash; we really have full flexibility with the features here.',
  'We can define a feature which is the squared distance from the normal body temperature (37 Celsius).',
  _,
  'This solves the problem, but is a bit clunky because we had to manually hard code $37$ in.',
  'This case wasn\'t so bad, but it does require domain knowledge, and sometimes we just don\'t have it.',
_);

add(slide('Non-monotonicity: attempt 3',
  '$\\phi(x) = \\blue{[1, \\text{temperature}(x), \\text{temperature}(x)^2]}$',
  stmt('General rule: features should be simple building blocks to be pieced together'),
  parentCenter('[whiteboard]'),
_));

prose(
  'The next solution is to remove this clunky hard coding.',
  'If we expand the quadratic term $(\\text{temperature}(x) - 37)^2$ and look at the dependencies on $x$,',
  'we see that we just have $1$, $\\text{temperature}(x)$, and $\\text{temperature}(x)^2$.',
  'Call this the new feature extractor.',
  _,
  'In other words, a function using the old feature extractor, say',
  '$f(x) = [5, 7] \\cdot [1, (\\text{temperature}(x) - 37)^2]$,',
  'can be represented as $f(x) = [5 + 37^2, -7(2)(-37), 7] \\cdot [1, \\text{temperature}(x), \\text{temperature}(x)^2]$ in the new feature extractor.',
  _,
  'So the new hypothesis class contains the old one and is conceptually much simpler.',
  'The take-home message is to think about what the desired functions should look like, but then break them down into simple building blocks.',
_);

add(slide('Saturation: attempt 1',
  example('product recommendation',
    stmt('Input: product information $x$'),
    stmt('Output: relevance $y \\in \\R$'),
  _),
  pause(),
  'Let $N(x)$ be number of people who bought $x$',
  bulletedText('Identity: $\\phi(x) = N(x)$'),
  pause(),
  stmt('Problem: is 1000 people really 10 times more relevant than 100 people?  Not quite...'),
_));

prose(
  'Here\'s another example: suppose we wanted to do product recommendation: given a product ($x$),',
  'predict whether it will be relevant to the user ($y$).',
  'For illustrative simplicity, suppose the only information we are using is $N(x)$, the number of people who also bought $x$.',
  _,
  'Our initial attempt is to use $N(x)$ directly as a feature.',
  'This even seems reasonable because we expect the relevance to be monotonic in the product\'s popularity.',
  'However, the problem is that the relevance $y$ and $N(x)$ don\'t have a linear relationship.',
_);

add(slide('Saturation: attempt 2',
  'Let $N(x)$ be number of people who bought $x$',
  parentCenter('[whiteboard]'),
  bulletedText(stmt('Identity')),
  parentCenter('$\\phi(x) = N(x)$'),
  pause(),
  bulletedText(stmt('Log')),
  parentCenter('$\\phi(x) = \\log N(x)$'),
  pause(),
  bulletedText(stmt('Discretization')),
  parentCenter('$\\phi(x) = [\\1[0 < N(x) \\le 10], \\1[10 < N(x) \\le 100], \\dots]$'),
_));

prose(
  'One solution is to again transform the raw inputs $N(x)$ to get some more useful features.',
  'For example, if we believe that the effect of product popularity has diminishing returns on relevance,',
  'then we might take the $\\log$ (this is usually a good idea for values with a large dynamic range).',
  _,
  'Another useful transformation is to use a discretization feature template.',
  'This feature template supplies indicator features, each corresponding to a range of values for $N(x)$: $\\1[a < N(x) \\le b]$.',
  'This gives us piecewise constant functions which can be quite flexible for capturing general relationships',
  'provided the ranges are fine-grained enough.',
_);

add(slide('Interaction between features: attempt 1',
  example('health prediction',
    stmt('Input: patient information $x$'),
    stmt('Output: health $y \\in \\R$'),
  _),
  parentCenter('$\\phi(x) = [\\red{\\text{height}(x)}, \\blue{\\text{weight}(x)}]$'),
  pause(),
  stmt('Problem: can\'t capture relationship between height and weight'),
_));

prose(
  'Our final example consists of predicting health given two measurements, height and weight.',
  'What\'s noteworthy here is that there is a huge range of possible heights and weights that are acceptable; what matters is actually their relationship.',
  'If we just included these measurements directly as features, then we wouldn\'t be able to capture these relationships.',
_);

add(slide('Interaction between features: attempt 2',
  parentCenter(nowrapText('$\\phi(x) = (52 + 1.9(\\red{\\text{height}(x)}-60) - \\blue{\\text{weight}(x)})^2$')),
  stmt('Solution: define features that combine inputs'),
  pause(),
  stmt('Disadvantage: requires manually-specified domain knowledge'),
_));

prose(
  'Just as in the temperature example, let\'s start by thinking what transformation of our inputs results in something that is linearly related to health.',
  'A sensible first start is the squared difference between the weight and an expected weight given by a formula',
  '(these coefficients come from a 1983 paper by J. D. Robinson).',
_);

add(slide('Interaction between features: attempt 3',
  nil(),
  parentCenter(nowrapText('$\\phi(x) = [1, \\red{\\text{height}(x)}, \\blue{\\text{weight}(x)}, \\red{\\text{height}(x)^2}, \\blue{\\text{weight}(x)^2}, \\purple{\\underbrace{\\text{height}(x) \\text{weight}(x)}_\\text{cross term}}]$')).scale(0.68),
  stmt('Solution: add features involving multiple measurements'),
_));

prose(
  'However, this requires some amount of domain knowledge, which we were trying to avoid with learning.',
  'If we expand the quadratic and remove the coefficients, we the get the following feature vector, which is much more generic.',
  _,
  'Again, we have put on our reductionist hat and broken the single complex feature down into simpler building blocks,',
  'so that the resulting hypothesis class contains the desired predictor.',
_);

add(slide('Linear in what?',
  stmt('Prediction driven by score'),
  parentCenter('$\\w \\cdot \\phi(x)$'),
  pause(),
  indent(table(
    ['Linear in $\\w$?', pause(), blue('Yes')],
    ['Linear in $\\phi(x)$?', pause(), blue('Yes')],
    ['Linear in $x$?', pause(), red('No!')+' ($x$ not necessarily even a vector)'],
  _).margin(30, 0)),
  pause(),
  keyIdea('non-linearity',
    bulletedText('Predictors $f_\\w(x)$ can be expressive '+redbold('non-linear')+' functions and decision boundaries of $x$.'), pause(),
    bulletedText('Score $\\w \\cdot \\phi(x)$ is '+bluebold('linear')+' function of $\\w$, which permits efficient learning.'),
  _),
_).leftHeader(image('images/vase-face-illusion.jpg').width(150)));

prose(
  'Wait a minute...how were we able to get non-linear predictions using linear predictors?',
  _,
  'It is important to remember that for linear predictors, it is the score $\\w \\cdot \\phi(x)$ that is linear in $\\w$ and $\\phi(x)$ (read it off directly from the formula).',
  'In particular, the score is not linear in $x$ (it sometimes doesn\'t even make sense because $x$ need not be a vector at all &mdash; it could be a string or a PDF file.',
  'Also, neither the predictor $f_\\w$ (unless we\'re doing linear regression) nor the loss function $\\TrainLoss(\\w)$ are linear in anything.',
  _,
  'The significance is as follows: From the feature extraction viewpoint, we can define arbitrary features that yield very <b>non-linear</b> functions in $x$.',
  'From the learning viewpoint (only looking at $\\phi(x)$, not $x$),',
  '<b>linearity</b> plays an important role in being able to optimize the weights efficiently (as it leads to convex optimization problems).',
_);

G.decisionBoundary = function(nonlinear) {
  var items = [];
  var width = 200, height = 200;
  items.push(r = rect(width, height).fillColor('red').fillOpacity(0.3));
  items.push(moveLeftOf('$x_1$', r));
  items.push(moveBottomOf('$x_2$', r));
  if (nonlinear)
    items.push(ellipse(width/3, height/3).shiftBy(width/2, height/2).fillColor('blue').fillOpacity(0.3));
  else
    items.push(polygon([0, 0], [width-30, 0], [0, down(height-10)]).fillColor('blue').fillOpacity(0.3));
  //items.push(polygon([width, height], [width, 0], [0, height]).fillColor('red').fillOpacity(0.3));
  return new Overlay(items);
}

add(slide('Geometric viewpoint',
  /*parentCenter(table(
    [decisionBoundary(false), pause(), decisionBoundary(true)], pause(-1),
    ['$\\phi(x) = (1, x_1, x_2)$', pause(), '$\\phi(x) = (1, x_1, x_1^2, x_2, x_2^2)$'],
  _).margin(100, 20).center()),*/
  parentCenter(ytable(
    decisionBoundary(true),
    pause(),
    '$\\phi(x) = [1, x_1, x_2, x_1^2 + x_2^2]$',
  _).center()),
  pause(),
  'How to relate <b>non-linear</b> decision boundary in $x$ space with <b>linear</b> decision boundary in $\\phi(x)$ space?',
  parentCenter(text('[demo]').linkToUrl('http://www.youtube.com/watch?v=3liCbRZPrZA')),
_).leftHeader(image('images/geometry.jpg').width(150)));

prose(
  'Let\'s try to understand the relationship between the non-linearity in $x$ and linearity in $\\phi(x).$',
  'We consider binary classification where our input is $x = [x_1, x_2] \\in \\R^2$ a point on the plane.',
  'With the quadratic features $\\phi(x)$, we can carve out the decision boundary corresponding to an ellipse',
  '(think about the formula for an ellipse and break it down into monomials).',
  _,
  'We can now look at the feature vectors $\\phi(x)$, which include an extra dimension.',
  'In this 3D space, a linear predictor (defined by the hyperplane)',
  'actually corresponds to the non-linear predictor in the original 2D space.',
_);

/*add(slide('Quadratic features',
  stmt('Original input'),
  //parentCenter('$x = [x_1, \\dots, x_b]$'),
  parentCenter('$x = [x_1, x_2, x_3]$'),
  pause(),
  stmt('Braindead feature vector'),
  //parentCenter('$\\phi(x) = [x_1, \\dots, x_b; x_i x_j \\text{ for $1 \\le i, j \\le b$}]$'),
  parentCenter('$\\phi(x) = [1, x_1, x_2, x_3, x_1^2, x_2^2, x_3^2, x_1 x_2, x_1 x_3, x_2 x_3]$'),
  //parentCenter(text('[demo]').linkToUrl('index.html#include=learning-demo.js&example=nonlinear')),
_));

prose(
  'More generally, if our original input is $x = [x_1, \\dots, x_b]$,',
  'we can define a $O(b^2)$-dimensional feature vector $\\phi(x)$ that contains',
  'a bias term, all the original features, and all the pairwise interaction terms.',
  _,
  'Note that for binary features, quadratic features correspond to conjunction',
  '($x_i x_j = 1$ if $x_i = 1$ and $x_j = 1$).',
_);*/

add(quizSlide('learning2-feature-templates',
  'What might be good feature templates for predicting whether a user will like a restaurant?',
_));

prose(
  'Equipped with more intuition about organization of features and properties of features and non-linearity,',
  'let us revisit the problem of coming up with features for restaurant recommendation.',
  'Can you come up with better feature templates which are more well-defined?',
_);

add(summarySlide('Summary so far',
  bulletedText(stmt('Goal: define features $\\phi(x)$ (via feature templates) so that the hypothesis class contains good predictors')), pause(),
  bulletedText(stmt('Pay attention to non-linearity in $x$: non-monotonicity, saturation, interaction between features')), pause(),
  bulletedText(stmt('Suggested approach: define features $\\phi(x)$ to be building blocks (e.g., monomials)')),
  pause(),
  bulletedText(stmt('Linear prediction: actually very powerful!')),
_));

/*add(slide('How to construct features?',
  'When have domain knowledge, should encode it as features $\\phi(x)$.',
  parentCenter(image('images/woodwork.jpg').width(100)),
  pause(),
  'When have no domain knowledge (or you\'re lazy), need more automatic methods...',
  parentCenter(image('images/factory.jpg').width(100)),
_));*/

////////////////////////////////////////////////////////////
roadmap(1);

prose(
  'What we\'ve shown so far is that by being mildly clever with choosing the features $\\phi(x)$,',
  'we can actually get quite a bit of mileage out of our so-called linear predictors.',
  _, 
  'However, sometimes we don\'t know what features are good to use, either because the prediction task is non-intuitive',
  'or we don\'t have time to figure out which features are suitable.',
  'Sometimes, we think we might know what features are good, but then it turns out that they aren\'t (this happens a lot!).',
  _,
  'In the spirit of machine learning,',
  'we\'d like to automate things as much as possible.',
  'In this context, it means creating algorithms that can take whatever crude features we have and turn them into refined predictions,',
  'thereby shifting the burden off feature extraction and moving it to learning.',
  _,
  'Neural networks have been around for many decades,',
  'but they fell out of favor because they were difficult to train.',
  'Recently, there has been a huge resurgence of interest in neural networks',
  'since they perform so well and training seems to not be such an issue when you have tons of data and compute.',
  _,
  'In a way, neural networks allow one to automatically learn the features of a linear classifier which are geared towards the desired task,',
  'rather than specifying them all by hand.',
_);

add(slide('Motivation',
  example('predicting car collision',
    stmt('Input: position of two oncoming cars $x = [x_1, x_2]$'),
    yspace(10),
    stmt('Output: whether safe ($y = +1$) or collide ($y = -1$)'),
    //indent('$y \\in \\{ +1, -1 \\}$'),
  _),
  pause(),
  stmt('True function: safe if cars sufficiently far'),
  parentCenter('$y = \\sign(|x_1 - x_2| - 1)$'),
  stmt('Examples'),
  parentCenter(table(
    ['$x$', '$y$'],
    ['$[1, 3]$', '$+1$'],
    ['$[3, 1]$', '$+1$'],
    ['$[1, 0.5]$', '$-1$'],
  _).margin(40, 10).scale(0.8)),
_));

prose(
  'As a motivating example, consider the problem of predicting whether two cars at positions $x_1$ and $x_2$ are going to collide.',
  'Suppose the true output is $1$ (safe) whenever the cars are separated by a distance of at least $1$.',
  'Clearly, this the decision is not linear.',
  _,
  'Note that one could express the desired predictor as a linear classifier with quadratic features by again expanding $(x_1-x_2)^2-1$.',
  'However, let\'s try to do this with neural networks.',
_);

add(slide('Decomposing the problem',
  stmt('Test if car 1 is far right of car 2'),
  indent('$h_1 = \\1[x_1 - x_2 \\ge 1]$'),
  pause(),
  stmt('Test if car 2 is far right of car 1'),
  indent('$h_2 = \\1[x_2 - x_1 \\ge 1]$'),
  pause(),
  stmt('Safe if at least one is true'),
  indent('$y = \\sign(h_1 + h_2)$'),
  pause(),
  parentCenter(table(
    ['$x$', '$h_1$', '$h_2$', '$y$'],
    ['$[1, 3]$','$0$', '$1$', '$+1$'],
    ['$[3, 1]$','$1$', '$0$', '$+1$'],
    ['$[1, 0.5]$', '$0$', '$0$', '$-1$'],
  _).margin(40, 10).scale(0.8)),
_));

prose(
  'The intuition is to break up the problem into two subproblems,',
  'which test if car 1 (car 2) is to the far right.',
  _,
  'Given these two binary values $h_1,h_2$, we can declare safety if at least one of them is true.',
_);

add(slide('Learning strategy',
  stmt('Define: $\\phi(x) = [1, x_1, x_2]$'),
  stmt('Intermediate hidden subproblems'),
  indent(xtable('$h_1 = \\1[\\red{\\v_1} \\cdot \\phi(x) \\ge 0]$', text('$\\red{\\v_1} = [-1, +1, -1]$').scale(0.7)).margin(150)),
  indent(xtable('$h_2 = \\1[\\red{\\v_2} \\cdot \\phi(x) \\ge 0]$', text('$\\red{\\v_2} = [-1, -1, +1]$').scale(0.7)).margin(150)),
  pause(),
  stmt('Final prediction'),
  indent(xtable('$f_\\red{\\V, \\w}(x) = \\sign(\\red{w_1} h_1 + \\red{w_2} h_2)$', text('$\\red{\\w} = [1, 1]$').scale(0.7)).margin(100)),
  pause(),
  keyIdea('joint learning',
    'Goal: learn both hidden subproblems $\\red{\\V = (\\v_1, \\v_2)}$ and combination weights $\\red{\\w = [w_1, w_2]}$',
  _),
_));

prose(
  'Having written $y$ in a specific way, let us try to generalize to a family of predictors (this seems to be a recurring theme).',
  _,
  'We can define $\\v_1 = [-1, 1, -1]$ and $\\v_2 = [-1, -1, 1]$ and $w_1=w_2=1$ to accomplish this.',
  _,
  'At a high-level, we have defined two intermediate subproblems, that of predicting $h_1$ and $h_2$.',
  'These two values are hidden in the sense that they are not specified to be anything.',
  'They just need to be set in a way such that $y$ is linearly predictable from them.',
_);

add(slide('Gradients',
  stmt('Problem: gradient of $h_1$ with respect to $\\v_1$ is 0'),
  indent('$h_1 = \\1[\\red{\\v_1} \\cdot \\phi(x) \\ge 0]$'),
  parentCenter('[whiteboard]'),
  pause(),
  definition('logistic function',
    'The logistic function maps $(-\\,\\infty, \\infty)$ to $[0, 1]$:',
    parentCenter('$\\sigma(z) = (1 + e^{-z})^{-1}$'),
    pause(),
    'Derivative:',
    parentCenter('$\\sigma\'(z) = \\sigma(z) (1 - \\sigma(z))$'),
  _),
  pause(),
  stmt('Solution'),
  indent('$h_1 = \\sigma(\\red{\\v_1} \\cdot \\phi(x))$'),
_));

prose(
  'If we try to train the weights $\\v_1,\\v_2,w_1,w_2$, we will immediately notice a problem:',
  'the gradient of $h_1$ with respect to $\\v_1$ is always zero because of the hard thresholding function.',
  _,
  'Therefore, we define a function <b>logistic function</b> $\\sigma(z)$, which looks roughly like the step function $\\1[z \\ge 0]$,',
  'but has non-zero gradients everywhere.',
  _,
  'One thing to bear in mind is that even though the gradients are non-zero, they can be quite small when $|z|$ is large.',
  'This is what makes optimizing neural networks hard.',
_);

add(slide('Linear predictors',
  stmt('Linear predictor'),
  indent(linearPredictor(), 40),
  stmt('Output'),
  parentCenter('$\\text{score} = \\w \\cdot \\phi(x)$'),
_));

prose(
  'Let\'s try to visualize the predictors.',
  _,
  'Recall that linear classifiers take the input $\\phi(x) \\in \\R^d$ and directly take the dot product with the weight vector $\\w$ to form the score,',
  'the basis for prediction in both binary classification and regression.',
_);

add(slide('Neural networks',
  stmt('Neural network'),
  indent(neuralNetwork(0), 40),
  pause(-1),
  stmt('Intermediate hidden units'),
  parentCenter(xtable(
    '$h_j = \\red{\\sigma}(\\blue{\\v_j} \\cdot \\phi(x))$',
    '$\\red{\\sigma}(z) = (1 + e^{-z})^{-1}$',
  _).center().margin(30)),
  pause(),
  stmt('Output'),
  parentCenter('$\\text{score} = \\blue{\\w} \\cdot \\h$'),
_));

prose(
  'The idea in neural networks is to map an input $\\phi(x) \\in \\R^d$ onto a hidden <b>intermediate representation</b> $\\h \\in \\R^k$,',
  'which in turn is mapped to the score.',
  _,
  'Specifically, let $k$ be the number of hidden units.',
  'For each hidden unit $j = 1, \\dots, k$, we have a weight vector $\\v_j \\in \\R^d$,',
  'which is used to determine the value of the hidden node $h_j \\in \\R$ (also called the <b>activation</b>)',
  'according to $h_j = \\sigma(\\v_j \\cdot \\phi(x))$, where $\\sigma$ is the activation function.',
  'The activation function can be a number of different things, but its main property is that it is a non-linear function.',
  'Traditionally the <b>sigmoid</b> function $\\sigma(z) = (1+e^{-z})^{-1}$ was used,',
  'but recently the <b>rectified linear</b> function $\\sigma(z) = \\max\\{z,0\\}$ has gained popularity.',
  _,
  'Let $\\h = [h_1, \\dots, h_k]$ be the vector of activations.',
  'This activation vector is now combined with another weight vector $\\w \\in \\R^k$ to produce the final score.',
_);

add(slide('Neural networks',
  'Think of intermediate hidden units as learned features of a linear predictor',
  pause(),
  keyIdea('feature learning',
    stmt('Before: apply linear predictor on manually specify features'),
    parentCenter('$\\phi(x)$'),
    stmt('Now: apply linear predictor on automatically learned features'),
    parentCenter('$h(x) = [h_1(x), \\dots, h_k(x)]$'),
  _),
  pause(),
  stmt('Question: can the functions $h_j(x) = \\sigma(\\v_j \\cdot \\phi(x))$ supply good features for a linear predictor?'),
_));

prose(
  'The noteworthy aspect here is that the activation vector $\\h$ behaves a lot like our feature vector $\\phi(x)$ that we were using for linear prediction.',
  'The difference is that mapping from input $\\phi(x)$ to $\\h$ is learned automatically, not manually constructed (as was the case before).',
  'Therefore, a neural network can be viewed as learning the features of a linear classifier.',
  'Of course, the type of features that can be learned must be of the form $x \\to \\sigma(\\v_j \\cdot \\phi(x))$.',
  _,
  'Whether this is a suitable form depends on the nature of the application.',
  'Empirically, though, neural networks have been quite successful,',
  'since learning the features from the data with the explicit objective of minimizing the loss can yield better features than ones which are manually crafted.',
  'Recently, there have been some advances in getting neural networks to work, and they have become the state-of-the-art in many tasks.',
  'For example, all the major companies (Google, Microsoft, IBM) all recently switched over to using neural networks for speech recognition.',
  'In computer vision, (convolutional) neural networks are completely dominant in object recognition.',
_);

////////////////////////////////////////////////////////////
roadmap(2);

add(slide('Motivation: loss minimization',
  stmt('Optimization problem'),
  indent(ytable(
    '$\\displaystyle \\min_{\\V, \\w} \\TrainLoss(\\V, \\w)$', pause(),
    '$\\displaystyle \\TrainLoss(\\V, \\w) = \\frac1{|\\Train|} \\sum_{(x,y) \\in \\Train} \\Loss(x, y, \\V, \\w)$', pause(),
    '$\\Loss(x, y, \\V, \\w) = (y - f_{\\V, \\w}(x))^2$', pause(),
    '$\\displaystyle f_{\\V, \\w}(x) = \\sum_{j=1}^k w_j \\sigma(\\v_j \\cdot \\phi(x))$', pause(),
  _)).scale(0.9),
  stmt('Goal: compute gradient'),
  parentCenter('$\\nabla_{\\V,\\w} \\TrainLoss(\\V, \\w)$'),
_));

prose(
  'The main thing left to do for neural networks is to be able to train them.',
  'Conceptually, this should be straightforward: just take the gradient and run SGD.',
  _,
  'While this is true, computing the gradient, even though it is not hard,',
  'can be quite tedious to do by hand.',
_);

add(slide('Approach',
  stmt('Mathematically: just grind through the chain rule'),
  pause(),
  stmt('Next: visualize the computation using a computation graph'),
  headerList('Advantages',
    'Avoid long equations',
    'Reveal structure of computations (modularity, efficiency, dependencies)',
  _),
_));

prose(
  'We will illustrate a graphical way of organizing the computation of gradients,',
  'which is built out of a few components.',
  _,
  'This graphical approach will show the structure of the function',
  'and will not only make gradients easy to compute,',
  'but also shed more light onto the predictor and loss function.',
  _,
  'In fact, these days if you use a package such as Theano or TensorFlow,',
  'you can write down the expressions symbolically and the gradient is computed for you.',
  'This is done essentially using the computational procedure that we will see.',
_);

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

add(slide('Functions as boxes',
  parentCenter(overlay(
    operation = T('$\\text{function}$',
      C('$\\frac{\\partial \\text{out}}{\\partial \\text{in}_1}$', Leaf('$\\text{in}_1$')),
      C('$\\frac{\\partial \\text{out}}{\\partial \\text{in}_2}$', Leaf('$\\text{in}_2$')),
      C('$\\frac{\\partial \\text{out}}{\\partial \\text{in}_3}$', Leaf('$\\text{in}_3$')),
    _).ymargin(100),
    moveLeftOf('$\\text{out}$', operation.headBox),
  _)),
  stmt('Partial derivatives (gradients): how much does the output change if an input changes?'),
  pause(2),
  stmt('Example'),
  parentCenter(stagger(
    '$2 \\text{in}_1 + \\text{in}_2 \\text{in}_3 = \\text{out}$',
    '$2 (\\text{in}_1 + \\red{\\epsilon}) + \\text{in}_2 \\text{in}_3 = \\text{out} + \\red{2 \\epsilon}$',
    '$2 \\text{in}_1 + (\\text{in}_2 + \\red{\\epsilon}) \\text{in}_3 = \\text{out} + \\red{\\text{in}_3 \\epsilon}$',
  _)),
_));

prose(
  'The first conceptual step is to think of functions as boxes that take a set of inputs and produces an output.',
  'Then the partial derivatives (gradients if the input is vector-valued) are just a measure of sensitivity:',
  'if we perturb $\\text{in}_1$ by a small amount $\\epsilon$, how much does the output $\\text{out}$ change?',
  'The answer is $\\frac{\\partial\\text{out}}{\\partial\\text{in}_1} \\cdot \\epsilon$.',
  'For convenience, we write the partial derivative on the edge connecting the input to the output.',
_);

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

prose(
  'Here are 5 examples of simple functions and their partial derivatives.',
  'These should be familiar from basic calculus.',
  'All we\'ve done is to present them in a visually more intuitive way.',
  _,
  'But it turns out that these simple functions are all we need to build up many of the more complex',
  'and potentially scarier looking functions that we\'ll encounter in machine learning.',
_);

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

prose(
  'The second conceptual point is to think about <b>composing</b>.',
  'Graphically, this is very natural: the output of one function $f$ simply gets fed as the input into another function $g$.',
  _,
  'Now how does $\\text{in}$ affect $\\text{out}$ (what is the partial derivative)?',
  'The key idea is that the partial derivative <b>decomposes</b> into a product of the two partial derivatives on the two edges.',
  'You should recognize this is no more than the chain rule in graphical form.',
  _,
  'More generally, if the partial derivative of $y$ with respect to $x$ is simply the product of all the green expressions on the edges of the path connecting $x$ and $y$.',
  'This visual intuition will help us better understand more complex functions, which we will turn to next.',
_);

add(slide('Binary classification with hinge loss',
  stmt('Hinge loss'),
  parentCenter('$\\Loss(x, y, \\w) = \\max \\{ 1 - \\w \\cdot \\phi(x) y, 0 \\}$'),
  stmt('Compute'),
  parentCenter(stagger(
    '$\\nabla_\\w \\Loss(x, y, \\w)$',
    '$\\frac{\\partial \\Loss(x, y, \\w)}{\\partial \\w}$',
  _)),
  //parentCenter('$\\frac{\\partial \\max \\{ 1 - \\w \\cdot \\phi(x) y, 0 \\}}{\\partial \\w}$'),
_));

add(slide('Binary classification with hinge loss',
  parentCenter(overlay(
    T(loss = text(opMax),
      C('$\\1[1-\\text{margin} > 0]$', T(text(opMinus),
        Leaf('$1$'),
        C('$-1$', T(margin = text(opDot),
          C('$y$', T(score = text(opDot), C('$\\phi(x)$', Leaf('$\\red{\\w}$')), Leaf('$\\phi(x)$'))),
          Leaf('$y$'),
        _)),
      _)),
      Leaf('$0$'),
    _),
    moveLeftOf('loss', loss),
    moveLeftOf('margin', margin),
    moveLeftOf('score', score),
  _)).scale(0.9),
  pause(2),
  stmt('Gradient: multiply the edges'),
  parentCenter('$\\green{-\\1[\\text{margin} < 1] \\phi(x) y}$'),
_));

prose(
  'Let us start with a simple example: the hinge loss for binary classification.',
  _,
  'In red, we have highlighted the weights $\\w$ with respect to which we want to take the derivative.',
  'The central question is how small perturbations in $\\w$ affect a change in the output (loss).',
  'Intermediate nodes have been labeled with interpretable names (score, margin).',
  _,
  'The actual gradient is the product of the edge-wise gradients from $\\w$ to the loss output.',
_);

G.multiclassGradientDiagram = function() {
  var score1 = T(opDot, C('$\\phi(x)$', Leaf('$\\red{\\w_1}$')), Leaf('$\\phi(x)$'));
  var score2 = T(opDot, C('$\\phi(x)$', Leaf('$\\red{\\w_2}$')), Leaf('$\\phi(x)$'));
  var score3 = T(opDot, C('$\\phi(x)$', Leaf('$\\red{\\w_3}$')), Leaf('$\\phi(x)$'));
  var scoret = function() { return T(opDot, C('$\\phi(x)$', Leaf('$\\red{\\w_1}$')), Leaf('$\\phi(x)$')); }
  var d1 = T(opMinus, C('1', score1), C('-1', scoret()));
  var d2 = T(opPlus, C('1', T(opMinus, C('1', score2), C('-1', scoret()))), Leaf('$1$'));
  var d3 = T(opPlus, C('1', T(opMinus, C('1', score3), C('-1', scoret()))), Leaf('$1$'));
  return overlay(
    T(opMax,
      C('$\\1[d_1 > \\max(d_2,d_3)]$', d1),
      C('$\\1[d_2 > \\max(d_1,d_3)]$', d2),
      C('$\\1[d_3 > \\max(d_1,d_2)]$', d3),
    _),
    moveLeftOf('$d_1$', d1.headBox),
    moveLeftOf('$d_2$', d2.headBox),
    moveLeftOf('$d_3$', d3.headBox),
  _);
}

/*add(slide('Multiclass classification with hinge loss',
  parentCenter('$\\displaystyle \\Loss(x, y, \\w) = \\max_{y\'} \\{ \\w_{y\'} \\cdot \\phi(x) - \\w_{y} \\cdot \\phi(x) + \\1[y \\neq y\'] \\}$').scale(0.9),
  'Assume labels $\\{1,2,3\\}$ and correct label is $y = 1$',
  parentCenter(multiclassGradientDiagram()).scale(0.5),
_));

prose(
  'The multiclass hinge loss is more complex, but boils down to the same principles.',
  'From this diagram, we can clearly see the gradient.',
  'One of the top-level children will be active (have non-zero partial derivative).',
  'Suppose label $2$ is active.',
  'Then the gradient corresponds to adding $\\phi(x)$ to $\\w_2$ and subtracting $\\phi(x)$ from $\\w_1$.',
_);*/

add(slide('Neural network',
  parentCenter('$\\displaystyle \\Loss(x, y, \\w) = \\left(\\sum_{j=1}^k w_j \\sigma(\\v_j \\cdot \\phi(x)) - y\\right)^2$').scale(0.9),
  //'Assume labels $\\{1,2,3\\}$ and correct label is $y = 1$',
  parentCenter(neuralNetworkGradientDiagram()).scale(0.55),
_));

prose(
  'Now, we can apply the same strategy to neural networks.',
  'Here we are using the squared loss for concreteness, but one can also use the logistic or hinge losses.',
  _,
  'Note that there is some really nice modularity here: you can pick any predictor (linear or neural network) to drive the score,',
  'and the score can be fed into any loss function (squared, hinge, etc.).',
_);

add(slide('Backpropagation',
  parentCenter(xtable(
    neuralNetworkGradientDiagram().scale(0.5),
  _).center().margin(50)),
  definition('Forward/backward values',
    nowrapText(stmt('Forward: $f_i$ is value for subexpression rooted at $i$')),
    pause(),
    nowrapText(stmt('Backward: $g_i = \\frac{\\partial \\text{out}}{\\partial f_i}$ is how $f_i$ influences output')),
  _),
_));

prose(
  'So far, we have mainly used the graphical representation to visualize the computation of function values and gradients for our conceptual understanding.',
  'But it turns out that the graph has algorithmic implications too.',
  _,
  'Recall that to train any sort of model using (stochastic) gradient descent, we need to compute the gradient of the loss (top output node)',
  'with respect to the weights (leaf nodes highlighted in red).',
  _,
  'We also saw that these gradients (partial derivatives) are just the product of the local derivatives (green stuff) along the path from a leaf to a root.',
  'So we can just go ahead and compute these gradients: for each red node, multiply the quantities on the edges.',
  'However, notice that many of the paths share subpaths in common, so sometimes there\'s an opportunity to save computation (think dynamic programming).',
  _,
  'To make this sharing more explicit,',
  'for each node $i$ in the tree, define the forward value $f_i$ to be the value of the subexpression rooted at that tree,',
  'which depends on the inputs underneath that subtree.',
  'For example, the parent node of $w_1$ corresponds to the expression $w_1 \\sigma(\\v_1 \\cdot \\phi(x))$.',
  'The $f_i$\'s are the intermediate computations required to even evaluate the function at the root.',
  _,
  'Next, for each node $i$ in the tree, define the backward value $g_i$ to be the gradient of the output with respect to $f_i$, the forward value of node $i$.',
  'This measures the change that would happen in the output (root node) induced by changes to $f_i$.',
  _,
  'Note that both $f_i$ and $g_i$ can either be scalars, vectors, are matrices, but have the same dimensionality.',
_);

add(slide('Backpropagation',
  parentCenter(xtable(
    neuralNetworkGradientDiagram().scale(0.4),
    overlay(
      out = T('', C('...',
          fj = T('', C('$\\frac{\\partial f_j}{\\partial f_i}$',
          fi = T('', C('...', Leaf('$\\text{in}$'))))))),
      moveLeftOf('$\\text{out}$', out.headBox),
      moveLeftOf('$f_j$', fj.headBox),
      moveLeftOf('$f_i$', fi.headBox),
      pause(),
      moveRightOf('$g_j$', fj.headBox),
      moveRightOf('$\\blue{g_i = \\frac{\\partial f_j}{\\partial f_i} g_j}$', fi.headBox),
    _),
  _).center().margin(50)),
  pause(-1),
  algorithm('backpropagation',
    stmt('Forward pass: compute each $f_i$ (from leaves to root)'), pause(),
    stmt('Backward pass: compute each $g_i$ (from root to leaves)'),
  _),
_));

prose(
  'We now define the backpropagation algorithm on arbitrary computation graphs.',
  _,
  'First, in the forward pass, we go through all the nodes in the computation graph from leaves to the root,',
  'and compute $f_i$, the value of each node $i$,',
  'recursively given the node values of the children of $i$. These values will be used in the backward pass.',
  _,
  'Next, in the backward pass, we go through all the nodes from the root to the leaves and compute $g_i$ recursively from $f_i$ and $g_j$,',
  'the backward value for the parent of $i$ using the key recurrence $g_i = \\frac{\\partial f_j}{\\partial f_i} g_j$ (just the chain rule).',
  _,
  'In this example, the backward pass gives us the gradient of the output node (the gradient of the loss) with respect to the weights (the red nodes).',
_);

////////////////////////////////////////////////////////////
roadmap(3);

prose(
  'Linear predictors were governed by a simple dot product $\\w \\cdot \\phi(x)$.',
  'Neural networks chained together these simple primitives to yield something more complex.',
  'Now, we will consider <b>nearest neighbors</b>, which yields complexity by another mechanism:',
  'computing similarities between examples.',
_);

add(slide('Nearest neighbors',
  pause(),
  algorithm('nearest neighbors',
    stmt('Training: just store $\\Train$'),
    pause(),
    stmt('Predictor $f(x\')$'),
    indent('Find $(x,y) \\in \\Train$ where $\\|\\phi(x)-\\phi(x\')\\|$ is smallest'),
    indent('Return $y$'),
  _).scale(0.9),
  pause(),
  keyIdea('similarity',
    'Similar examples tend to have similar outputs.',
  _),
  //parentCenter(text('[demo]').linkToUrl('index.html#include=learning-demo.js&example=noise')),
_));

prose(
  '<b>Nearest neighbors</b> is perhaps conceptually one of the simplest learning algorithms.',
  'In a way, there is no learning.  At training time, we just store the entire training examples.',
  'At prediction time, we get an input $x\'$ and we just find the input in our training set that is <b>most similar</b>, and return its output.',
  _,
  'In a practical implementation, finding the closest input is non-trivial.',
  'Popular choices are using k-d trees or locality-sensitive hashing.  We will not worry about this issue.',
  _,
  'The intuition being expressed here is that similar (nearby) points tend to have similar outputs.',
  'This is a reasonable assumption in most cases; all else equal, having a body temperature of $37$ and $37.1$',
  'is probably not going to affect the health prediction by much.',
_);

add(slide('Expressivity of nearest neighbors',
  stmt('Decision boundary: based on Voronoi diagram'),
  parentCenter(image('images/voronoi.png').width(200)),
  pause(),
  headerList(null,
    'Much more expressive than quadratic features', pause(),
    '<b>Non-parametric</b>: the hypothesis class adapts to number of examples', pause(),
    'Simple and powerful, but kind of brute force',
  _),
_));

prose(
  'Let\'s look at the decision boundary of nearest neighbors.',
  'The input space is partitioned into regions, such that each region has the same closest point (this is a Voronoi diagram), and each region could get a different output.',
  _,
  'Notice that this decision boundary is much more expressive than what you could get with quadratic features.',
  'In particular, one interesting property is that the complexity of the decision boundary adapts to the number of training examples.',
  'As we increase the number of training examples, the number of regions will also increase.',
  'Such methods are called <b>non-parametric</b>.',
_);

add(quizSlide('learning2-end',
  'What was the most surprising thing you learned today?',
_));

add(summarySlide('Summary of learners',
  bulletedText(stmt('Linear predictors: combine raw features')),
  parentCenter('prediction is '+greenbold('fast')+', '+greenbold('easy')+' to learn, '+redbold('weak')+' use of features'),
  pause(),
  bulletedText(stmt('Neural networks: combine learned features')),
  parentCenter('prediction is '+greenbold('fast')+', '+redbold('hard')+' to learn, '+greenbold('powerful')+' use of features'),
  pause(),
  bulletedText(stmt('Nearest neighbors: predict according to similar examples')),
  parentCenter('prediction is '+redbold('slow')+', '+greenbold('easy')+' to learn, '+greenbold('powerful')+' use of features'),
_));

prose(
  'Let us conclude now.',
  'First, we discussed some general principles for designing good features for linear predictors.',
  'Just with the machinery of linear prediction, we were able to obtain rich predictors which were quite rich.',
  _,
  'Second, we focused on expanding the expressivity of our predictors fixing a particular feature extractor $\\phi$.',
  _,
  'We covered three algorithms: <b>linear predictors</b> combine the features linearly (which is rather weak), but is easy and fast.',
  //'Note that we can always make the hypothesis class arbitrarily large by adding more features, but that\'s another issue.',
  _,
  '<b>Neural networks</b> effectively learn non-linear features, which are then used in a linear way.',
  'This is what gives them their power and prediction speed, but they are harder to learn (due to the non-convexity of the objective function).',
  _,
  '<b>Nearest neighbors</b> is based on computing similarities with training examples.',
  'They are powerful and easy to learn, but are slow to use for prediction because they involve enumerating (or looking up points in) the training data.',
_);

initializeLecture();
