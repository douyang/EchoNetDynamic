////////////////////////////////////////////////////////////
// from learning2

add(dividerSlide('Extra material'));

prose(
  'You will not be responsible for the material beyond this point.',
  'But if you are interested in learning more about other types of supervised',
  'classification methods, then you are encouraged to read on.',
_);

function extraRoadmap(i) {
  add(outlineSlide('Extra material', i, [
    ['kernelMethods', 'Kernel methods'],
    ['decisionTrees', 'Decision trees'],
  ]));
}

extraRoadmap(0);

add(slide('Kernel methods: key points',
  bulletedText(stmt('Intuition: predict based on similarity between points (same as <b>nearest neighbors</b>)')),
  parentCenter(image('images/voronoi.png').width(100)),
  pause(),
  bulletedText(stmt('Technical foundation: exactly the same as feature-based <b>linear predictors</b>')),
  parentCenter(image('images/linear-classifier.jpg').width(100)),
_));

add(slide('Kernel methods',
  stmt('Recall'),
  bulletedText('Perceptron update: $\\w \\leftarrow \\w + \\blue{\\phi(x)} y$'), pause(),
  bulletedText('Final weights: $\\w = \\sum_{(x, y) \\in \\Mistakes} \\blue{\\phi(x)} y$'),
  pause(),
  bulletedText('In general: $\\w = \\sum_{(x, y) \\in \\Train} \\red{\\alpha_x} \\blue{\\phi(x)}$'), pause(),
  bulletedText('Equivalent Perceptron update: $\\red{\\alpha_x} \\leftarrow \\red{\\alpha_x} + y$'),
  pause(),
  stmt('Equivalence'),
  parentCenter(xtable('feature weights $\\w$', '$\\Leftrightarrow$', 'example coefficients $\\alpha$').margin(50).center()),
_).leftHeader(image('images/vase-face-illusion.jpg').width(150)));

prose(
  'Our goal is to move towards a more example-centric way of looking linear classification.',
  _,
  'Recall in the Perceptron algorithm, we only update the weights $\\w$ by adding constant multiples of $\\phi(x)$.',
  'This gives as an alternative formulation of the Perceptron algorithm which maintains coefficients $\\alpha_x$ for each input $x$ in the training set instead of maintaining a weight vector $\\w$.',
  'Realizing that the weights are just linear combinations of the feature vectors gets us halfway there.',
_);

add(slide('Kernel methods',
  stmt('Weights'),
  parentCenter('$\\displaystyle \\w = \\sum_{(x, y) \\in \\Train} \\alpha_x \\blue{\\phi(x)}$'),
  pause(),
  stmt('Prediction based on score'),
  parentCenter('$\\displaystyle \\w \\cdot \\blue{\\phi(x\')} = \\sum_{(x,y) \\in \\Train} \\alpha_x (\\underbrace{\\blue{\\phi(x)} \\cdot \\blue{\\phi(x\')}}_{= \\color{red}{k(x, x\')}})$'),
_));

prose(
  'Now if we look at the prediction score using $\\w$ on a new input feature vector $\\phi(x\')$.',
  'Since weights are just linear combinations of feature vectors,',
  'this dot product is actually composed of linear combinations of <b>dot products between feature vectors</b>.',
  _,
  'Now it should be clear that prediction just involves going through the training set and comparing a new input $x\'$ to previous inputs $x$.',
  'Feels a lot like nearest neighbors...',
  _,
  'Let\'s give the dot product between feature vectors a name: $k(x,x\') = \\phi(x) \\cdot \\phi(x\')$.',
_);

add(slide('Kernel methods',
  definition('kernel',
    'A <b>kernel</b> is a function $\\red{k(x,x\')}$ which corresponds to some choice of features $\\blue{\\phi(x)}$ via',
    parentCenter('$\\red{k(x,x\')} = \\blue{\\phi(x) \\cdot \\phi(x\')}$'),
  _),
  pause(),
  stmt('Features viewpoint: construct and work with $\\blue{\\phi(x)}$ (think in terms of <b>properties</b> of inputs)'),
  pause(),
  stmt('Kernel viewpoint: construct and work with $\\red{k(x,x\')}$ (think in terms of <b>similarity</b> between inputs)'),
_).leftHeader(image('images/vase-face-illusion.jpg').width(150)));

prose(
  'That function $k(x,x\')$ that just popped out is called a <b>kernel function</b>.',
  'There is a more mathematical definition based in functional analysis, but it suffices to think of $k(x,x\')$ any function that arises from an inner product between two feature vectors.',
  _,
  'There is a correspondence between kernels and features.',
  'This gives us two ways to think about classification, either in terms of properties of the data using <b>features</b> or in terms of similarities between examples using <b>kernels</b>.',
  _,
  'Advanced: kernels in some sense are more pure than features because there could be multiple feature vectors that yield the same kernel.',
_);

add(slide('Kernels',
  stmt('<b>Linear kernel</b> (obvious)'),
  parentCenter('$\\red{k(x,x\')} = x \\cdot x\'$'),
  indent('If $x \\in \\R^b$:'),
  parentCenter('$\\blue{\\phi(x)} = x$.'),
  pause(),

  stmt('<b>Quadratic kernel</b> (less obvious)'),
  parentCenter('$\\red{k(x,x\')} = (x \\cdot x\')^2$'),
  pause(),
  indent('If $x \\in \\R^2$:'),
  parentCenter('$\\phi(x) = (x_1^2, \\sqrt{2} x_1 x_2, x_2^2)$'),
_));

prose(
  'The practical upshot of kernels is that we can start designing kernels rather than designing features,',
  'which might be more natural for some applications.',
  _,
  'As an aside, there is another advantage that sometimes kernels correspond to very large or infinite feature vectors, for which computation would be intractable or impossible.',
  'Kernels provide a computationally more efficient solution in that case.',
  _,
  'There are also kernels that can be defined where $x$ is a string or a tree, corresponding to counting the number of substrings or subtrees.',
  'These kernels have been useful in computational biology and natural language processing.',
_);

add(slide('Gaussian kernel',
  parentCenter('$\\red{k(x,x\')} = \\exp\\left(\\frac{-\\red{\\|x-x\'\\|}^2}{2\\sigma^2}\\right)$'),
  parentCenter('[whiteboard]'),
  pause(),
  '$k(x,x\') \\to 0$ very fast as $x$ and $x\'$ get farther, so only close points matter.',
  pause(),
  stmt('Perceptron training'),
  parentCenter('$\\red{\\alpha_x} \\leftarrow \\red{\\alpha_x} + y$'),
  pause(),
  stmt('Prediction'),
  parentCenter('$\\text{score}(x\') = \\sum_x \\alpha_x k(x, x\') \\Leftrightarrow \\green{y \\text{ of closest $x$ to $x\'$}}$'),
  pause(),
  stmt('Intuition: smooth version of '+greenbold('nearest neighbors')),
_));

prose(
  'The Gaussian kernel is noteworthy because of it\'s relationship to nearest neighbors.',
  _,
  'Here, the key property is that the value of the kernel $k(x,x\')$ dies away very fast as the distance $\\|x-x\'\\|$, which hints at the fact that only close-by points contribute towards the prediction of $x\'$.',
  'To make the argument a bit more formal, recall that in the Perceptron algorithm,',
  'the example coefficients $\\alpha_x$ are some non-negative multiple of $y$ (specifically the number of times we made a mistake on that example).',
  _,
  'Observe that the prediction score is a sum over all points, but if the $\\sigma^2$ (called the kernel bandwidth) is close to $0$,',
  '$k(x,x\')$ will dominate, where $x$ is the nearest neighbor of $x\'$.',
  'This term contributes $\\alpha_x k(x,x\')$ to the score, which has the same sign as $y$.',
  'Therefore, the prediction made by the weights returned by the Perceptron algorithm with a Gaussian kernel is taking the nearest neighbors (over examples that we\'ve made a mistake on).',
  _,
  'In essence, using a Gaussian kernel yields a smoother version of nearest neighbors where the prediction depends not just on the closest neighbor, but all the points weighted based on how far they are.',
_);

add(summarySlide('Nearest neighbors and kernels',
  bulletedText(stmt('Idea: predictions made based on <b>similar</b> examples')), pause(),
  bulletedText(stmt('Kernel methods: connect feature-based and similarity-based views $k(x,x\') = \\phi(x) \\cdot \\phi(x\')$')), pause(),
  bulletedText(stmt('Expressive predictors: let the data speak for itself')),
  pause(),
  bulletedText(stmt('Disadvantage: not very compact, prediction is computationally expensive, learning is "shallow"')), pause(),
_));

////////////////////////////////////////////////////////////
extraRoadmap(1);

add(slide('Decision trees',
  example('prediction Titanic survival',
    stmt('Input: passenger information'),
    stmt('Output: survived?'),
  _),
  pause(),
  stmt('Decision tree predictor'),
  parentCenter(image('images/titanic-decision-tree.png').width(250)),
_).leftHeader(image('images/titanic.jpg').width(150)));

add(slide('Decision trees: expressive power',
  'Let $x = (x_1, \\dots, x_b)$, e.g., $(\\text{sex}, \\text{age}, \\text{sibsp})$',
  pause(),
  bulletedText('Each node has a '+bluebold('condition')+': $[x_j > t]$'),
  pause(),
  bulletedText('Each node corresponds to a region of input space: <b>conjunction</b> of conditions of all ancestors'),
  pause(-1),
  parentCenter(xtable(
    image('images/titanic-decision-tree.png').width(250),
    pause(),
    image('images/mondrian.jpg'),
  _).center().margin(80)),
_));

prose(
  'Now we turn to a different classification technique called <b>decision trees</b>.',
  'A decision tree is a predictor that takes an input and walks down the nodes in the tree,',
  'testing each condition to determine whether to go left (true) or right (false).',
  'The final prediction is the output label of the leaf.',
  _,
  'Just like the other methods, let\'s try to understand decision trees through the lens of the types of decision boundaries that can be produced.',
  'A decision tree partitions the input space into regions, one for each leaf of the tree.',
  'The region carved out by the leaf is exactly the set of inputs that would satisfy the conditions on all of the ancestors.',
_);

add(slide('Connections to linear classification',
  'For each leaf, define a <b>feature</b> equal to conjunction of its ancestors with <b>weight</b> equal to the output',
  xtable(
    image('images/titanic-decision-tree.png').width(250), pause(),
    indent(table(
      ['$\\phi_1(x) = [\\text{male} = 1 \\wedge \\text{age} > 9.5]$', '$w_1 = \\red{-1}$'],
      ['$\\phi_2(x) = [\\text{male} = 1 \\wedge \\text{age} \\le 9.5]$', '$w_2 = \\red{-1}$'],
      ['$\\phi_3(x) = [\\text{male} = 1 \\wedge \\text{age} > 9.5]$', '$w_3 = \\green{+1}$'],
      ['$\\phi_4(x) = [\\text{male} = 0]$', '$w_4 = \\green{+1}$'],
    _).margin(30, 10).scale(0.75)),
  _).center().margin(0),
  pause(),
  stmt('Point: any decision tree can be represented as a linear classifier with the <i>appropriate</i> features.'),
_));

prose(
  'Thinking about decision trees in terms of the regions immediately gives us a nice connection to linear classification.',
  'Let\'s define a brand new feature $\\phi_j(x)$ for each leaf and set its weight $w_j$ to be the output label of that leaf.',
  _,
  'The claim is that the newly defined classifier has the exact same decision boundary as the decision tree.',
  'To see this, note that for each input $x$, $\\phi(x)$ is going to be an indicator vector which is $1$ in the component corresponding to its region and $0$ elsewhere.',
  'Therefore, the score will be the label $w_j$.',
  _,
  'Why bother with a decision tree then if its just a linear classifier in disguise?',
  'Note that this linear classifier has pretty complex features corresponding to the conjunction of conditions.',
  'There aren\'t that many of them, but a priori, we don\'t know which ones are useful or not.',
  'It would be expensive to include all of these conjunctive features in a classifier.',
  'What we can think of the decision tree as doing is starting with a basic set of features $x$ and building up more complex features $\\phi(x)$',
  '(not to mention problems with overfitting, which we\'ll get to later).',
  'In other words, we can see it as doing automatic feature extraction and parameter tuning at the same time.',
_);

function decisionTreePartitioning() {
  var w = 400, h = 200;
  var x = w/3;
  var y = down(h*0.4);
  var pt = function(fx, fy, label) {
    return center(label == 1 ? green('+') : red('-')).shift(fx*w, fy*down(h));
  }
  Math.seedrandom(1);
  var cyCounts = [[0, 0], [0, 0]];  // c, y => count
  var cCounts = [0, 0];
  var yCounts = [0, 0];
  var totalCount = 0;
  var noise = 0.1;
  var points = wholeNumbers(50).map(function() {
    var fx = Math.random();
    var fy = Math.random();
    var c = fx*w > x;
    var label = c ? 1 : -1;
    if (Math.random() < noise) label = -label;
    totalCount++;
    cCounts[c ? 1 : 0]++;
    yCounts[label == 1 ? 1 : 0]++;
    cyCounts[c ? 1 : 0][label == 1 ? 1 : 0]++;
    return pt(fx, fy, label);
  });
  var Hy = 0;
  for (var y = 0; y < 2; y++)
    Hy -= (yCounts[y] / totalCount) * Math.log(yCounts[y] / totalCount)
  var Hyc = 0;
  for (var c = 0; c < 2; c++)
    for (var y = 0; y < 2; y++)
      Hyc -= (cyCounts[c][y] / totalCount) * Math.log(cyCounts[c][y] / cCounts[c]);

  var canvas = overlay(
    rect(w, h),
    //line([0, y], [w, y]),
    transform('$X_1$').pivot(1, 0).scale(0.8).shift(-5, (0+down(h))/2),
    transform('$X_2$').pivot(0, -1).scale(0.8).shift((0+w)/2, down(h+5)),
    new Overlay(points),
    pause(2),
    line([x, 0], [x, down(h)]),
    transform('$\\blue{C} = 0$').pivot(0, 1).scale(0.8).shift((0+x)/2, up(5)),
    transform('$\\blue{C} = 1$').pivot(0, 1).scale(0.8).shift((x+w)/2, up(5)),
  _);
  return xtable(
    canvas,
    pause(-2),
    ytable(
      text('$Y \\in \\{ \\green{+1}, \\red{-1} \\}$').scale(0.8),
      yspace(20),
      'How uncertain?',
      pause(),
      '$H(Y) = ' + round(Hy, 2) + '$',
      pause(2),
      '$H(Y \\mid \\blue{C}) = ' + round(Hyc, 2) + '$',
    _).justify('r').margin(10),
  _).center().margin(10);
}

add(slide('What conditions to choose?',
  'Choose a random example: $(X, Y) \\in \\sD$', pause(2),
  'Condition $\\blue{C} = [X_2 > t]$',
  pause(-2),
  parentCenter(decisionTreePartitioning()),
  pause(),
  stmt('Question: Does knowing $\\blue{C}$ reduce uncertainty in $Y$?'),
_));

add(slide('What conditions to choose?',
  definition('entropy',
    'Let $Y$ be a random variable with distribution $p(y)$.',
    'Define $H(Y) = -\\sum_y p(y) \\log p(y)$.',
  _).scale(0.9),
  pause(),
  definition('conditional entropy',
    'Let $Y, C$ be random variables with distribution $p(y, c)$.',
    'Define $H(Y \\mid C) = -\\sum_{y,c} p(y, c) \\log p(y \\mid c)$.',
  _).scale(0.9),
  pause(),
  definition('information gain',
    'How much entropy was reduced by observing $C$?',
    '$\\IG(Y \\mid C) = H(Y) - H(Y \\mid C)$',
  _).scale(0.9),
_));

prose(
  'So far, we\'ve looked at the hypothesis class defined by decision trees.',
  'Let us now talk about how to actually learn a decision tree from data.',
  _,
  'The core problem in learning decision trees is choosing good <b>conditions</b> for the nodes, so let\'s focus on that first.',
  'Consider the a set of two-dimensional inputs, about half labeled $+1$ and other half labeled $-1$.',
  'If we were to make a single node decision tree, we would label it with the majority label;',
  'this would give us 50\% accuracy and just not be very good.',
  'The problem is that if in this region, there is <b>high uncertainty</b> about what the label $Y$ is.',
  _,
  'To make this more precise, let $(X,Y)$ be a pair of random variables which correspond to drawing an example uniformly at random from a set of examples $\\sD$.',
  'We use <b>Shannon entropy</b> $H(Y)$ as a way to measure the uncertainty formally;',
  'the entropy is $0$ when all the points in $\\sD$ are of the same label and is $\\log(2) \\approxeq 0.693$ (nats) when there is roughly an even split between positive and negative examples.',
  _,
  'Now let\'s add the condition $C = [X_2 > t]$.',
  'What we are interested is in how knowing $C$ can reduce the uncertainty in $Y$.',
  'This property is captured by the <b>conditional entropy</b> $H(Y \\mid C)$.',
  'This is computed by looking at each region defined by values of $C$, computing the entropy there,',
  'and then taking a weighted average of the resulting entropies.',
  _,
  'In this case, the conditional entropy is much smaller than the entropy.',
  'We define the <b>information gain</b> to simply the difference between the two entropy;',
  'this is the amount of reduction in uncertainty we would get if we included $C$; higher is better.',
_);

add(slide('Learning decision trees',
  algorithm('ID3 [Quinlan, 1986]',
    '$\\text{BuildTree}(\\sD)$:',
    indent(bluebold('Choose condition')+' $C = [x_j > t]$; $\\sD$ into $\\sD_{C=1}$ and $\\sD_{C=0}$'), pause(),
    indent('If condition $C$ is '+bluebold('good enough')+':'),
    indent(indent('Call $\\text{BuildTree}$ on $\\sD_{C=1}$ and $\\sD_{C=0}$ to make children')),
    pause(),
    indent('Else:'),
    indent(indent('Return a leaf labeled with majority class')),
  _).scale(0.9),
_));

add(slide('Learning decision trees',
  headerList('Find best condition',
    'Loop through conditions of form $C = [x_j > t]$, computing $\\IG(Y \\mid C)$',
    'Return $C$ with largest $\\IG(Y \\mid C)$',
  _),
  pause(),
  headerList('Stopping criteria',
    'When improvement $\\IG(Y \\mid C)$ is too small',
    'When number of $|\\sD|$ is too small',
  _),
  pause(),
  keyIdea('decision trees',
    stmt('Decision trees: divide and conquer.'),
    stmt('ID3: greedily try to make leaves <b>pure</b>.'),
  _),
_));

prose(
  'Now we can state the decision tree learning algorithm, which grows a tree greedily.',
  'The original algorithm, ID3, was developed by Quinlan, and there have been subsequent extensions and improvement (C4.5).',
  _,
  'The basic idea of the algorithm is as follows:',
  'Given a set of points (corresponding to a region), $\\text{BuildTree}$ loops over all possible conditions of the form $C = [x_j > t]$.',
  'We go through all possible base features $j = 1, \\dots, b$ as well as all threshold values $t$, where the latter we can just take to be the midpoints between the possible values of $x_j$ in the training set.',
  'For each of these conditions $C$, we compute its information gain and then take the condition that has the highest one.',
  _,
  'We stop growing the tree when the information gain is so small that it\'s not worth our trouble or when the number of data points is too small (in which case, we don\'t have enough data to support the prediction.',
_);

////////////////////////////////////////////////////////////
// from learning3

learnFramework(2);
add(slide('Learning framework',
  pause(),
  parentCenter(table(
    //[blue('Manual'), red('Automatic')],
    [blue('Domain knowledge'), text('+').scale(2), ytable('Linear classifiers', 'Nearest neighbors', 'Kernels methods', 'Decision trees', 'Neural networks').center().color('red')],
  _).margin(40).center()),
_));

prose(
  'Last lecture, we talked about the two stages of machine learning: feature extraction and parameter tuning.',
  'Feature extraction focuses on manually using domain knowledge to figure out what information and how to expose it to the learning algorithm.',
  'Parameter tuning is about figuring out how to best use the features $\\phi(x)$ exposed by feature extraction to produce good predictors.',
  _,
  'Both stages influence the quality of the final predictor.',
  'If we use a simple method (linear classifiers), then we need to make sure that the features are specified in a way such that the prediction is in fact linear in the features',
  '(not necessarily in the original $x$!).',
  'If we use a more powerful method (decision trees), then we often have to work less hard (but not be completely insensitive) in making sure the features are in a form that parameter tuning can take advantage of.',
  _,
  'Of course, making the learning algorithm do more work means that we need more data and computation to learn and predict,',
  'whereas making the learning algorithm do less work means that the human (you) has to do more work manually.',
  'The art of machine learning is finding a good balance between the two.',
_);

function simpleArrow() { return rightArrow(100).strokeWidth(5).color('blue'); }
function complexArrow() { return rightArrow(300).strokeWidth(20).color('red'); }
add(slide('Every predictor is linear!',
  '...with the right features.',
  parentCenter(overlay(
    ytable(
      xtable('$x$', a1 = simpleArrow(), '$\\blue{\\phi(x)}$', a2 = complexArrow(), '$f$').center().margin(30),
      pause(),
      xtable('$x$', a3 = complexArrow(), '$\\red{\\Phi(x)}$', a4 = simpleArrow(), '$f$').center().margin(30),
    _).margin(200),
    pause(-1),
    moveTopOf('simple', a1),
    moveTopOf('complex', a2),
    pause(),
    moveTopOf('complex', a3),
    moveTopOf(greenbold('linear'), a4),
  _)),
_));

prose(
  'There are a lot machine learning methods &mdash; nearest neighbors, kernel methods decision trees, neural networks, all with their own logical intuitions.',
  'To get a deeper understanding, it is useful to relate all of these methods to each other.',
  'One easy way to do this is look at the possible decision boundaries defined by each of these methods.',
  'Another way, which we\'ll pursue now, is to show that the predictors defined these methods',
  'can be represented by a <b>linear</b> classifier based on more complex features $\\Phi(x)$.',
  _,
  'In other words, decision trees, for example, take simple features $\\phi(x)$ and find a complex decision boundary on $\\phi(x)$.',
  'This is equivalent to mapping $x$ to some more complex features $\\Phi(x)$ and finding a simple linear decision boundary on $\\Phi(x)$.',
  _,
  'This should not surprising because features are arbitrary functions.',
  'If we took $\\Phi(x)$ to be the feature vector where we have one feature per possible input $x$ and set the weights to be the correct output for that $x$,',
  'then the so-called linear classifiers actually represent all possible predictors.',
_);

add(slide('Kernel methods',
  stmt('Prediction on $x\'$'),
  parentCenter('$\\text{score} = \\sum_x \\alpha_x k(x,x\')$'),
  pause(),
  stmt('Gaussian kernel'),
  parentCenter(stagger(
    '$k(x,x\') = \\exp\\left(\\frac{-\\,\\|\\blue{\\phi(x)} - \\blue{\\phi(x\')}\\|^2}{2\\sigma^2} \\right)$',
    '$k(x,x\') = \\underbrace{\\exp\\left(\\frac{-\\,\\|\\blue{\\phi(x)} - \\blue{\\phi(x\')}\\|^2}{2\\sigma^2} \\right)}_{= \\red{\\Phi(x)} \\cdot \\red{\\Phi(x\')}}$',
  _)),
  'Every kernel corresponds to dot products of feature vectors $\\red{\\Phi(x) \\cdot \\Phi(x\')}$ (in this case, <b>infinite</b> dimensional!)',
  pause(),
  parentCenter('$\\text{score} = \\w \\cdot \\red{\\Phi(x\')}$'),
_).leftHeader(image('images/buzz-lightyear.jpg').width(200)));

prose(
  'Recall the prediction score on a new point $x\'$ is a combination of the example coefficients $\\alpha_x$ (think of them as predictions of those points) weighted by $k(x,x\')$, which captures the similarity between $x$ and $x\'$.',
  _,
  'The Gaussian kernel, in particular, says two points are similar if their feature vectors are very close.',
  _,
  'We stated (but didn\'t prove) that each kernel $k(x,x\')$ corresponds to the inner product between two feature vectors, say $\\Phi(x) \\cdot \\Phi(x\')$.',
  'It is important that this is just a mathematical statement &mdash; we don\'t actually need to construct the feature vectors because we are working with kernels.',
  _,
  'It\'s worth noting that in the case of the Gaussian kernel, the feature vectors are <b>infinite-dimensional</b>.',
  'In other words, by using a Gaussian kernel, we are <b>implicitly</b> doing learning on a infinite number of features.',
  'You would expect that having an infinite number of features gives you something quite powerful, and indeed it does.',
  'After all, Gaussian kernels are like nearest neighbors, which are also quite powerful as they allow for very flexible decision boundaries.',
  _,
  'What are these features?  There is a feature for each input point $a$.  The value of that feature on an input $x$ is the similarity to $a$: $\\Phi_a(x) = k(a,x)$.',
  'In other words, the properties defined by the features are just similarities to all points in the space.',
  _,
  'Finally, we can use the identity $\\w = \\sum_x \\alpha_x \\Phi(x)$ to recover our familiar definition of the score for a linear classifier.',
_);

add(slide('Decision trees',
  parentCenter(xtable(
    image('images/titanic-decision-tree.png').width(250),
    '$\\blue{\\phi(x)} = (\\text{sex}, \\text{age}, \\text{sibsp})$',
  _).margin(30).center()),
  pause(),
  stmt('Each <b>leaf</b> $j$ corresponds to a complex feature $\\red{\\Phi_j(x)}$'),
  parentCenter(table(
    [ytable(yspace(8), '$\\text{score}$'),
    stagger(
      nowrapText('$= -1 \\, [\\blue{\\phi_1(x)} = 1 \\wedge \\blue{\\phi_2(x)} > 9.5 \\wedge \\blue{\\phi_3(x)} \\le 2.5] + \\cdots$'),
      nowrapText('$= \\underbrace{-1}_{w_2} \\, \\underbrace{[\\blue{\\phi_1(x)} = 1 \\wedge \\blue{\\phi_2(x)} \\le 9.5 \\wedge \\blue{\\phi_3(x)} > 2.5]}_{\\red{\\Phi_2(x)}} + \\cdots$'),
    _)],
    pause(),
    [nil(), '$= \\w \\cdot \\red{\\Phi(x)}$'],
  _).xmargin(5)).scale(0.8),
_));

prose(
  'In decision trees, we can associate each leaf $j$ with a feature $\\Phi_j(x)$.',
  'The weight of that feature is simply the label assigned to the leaf, and the feature value is the conjunction of the conditions along the path from the root to that leaf.',
  'Again, this gives us the usual linear prediction score $\\w \\cdot \\Phi(x)$.',
  _,
  'In kernel methods, we essentially throw in all the features, and learning\'s job is to tune the weights of those features (implicitly through the $\\alpha_x$\'s).',
  'In decision trees, the features $\\Phi(x)$ are actually selected by the learning algorithm (through the construction of the decision tree itself),',
  'which makes it a kind of feature learning algorithm.',
_);

G.neuralNetwork2 = function(i) {
  var myPause = i == 0 ? pause : function() { return _ };
  return overlay(
    xtable(
      ytable(
        x1 = node(nil()),
        x2 = node(nil()),
        x3 = node(nil()),
      _).margin(20),
      ytable(
        h1 = node('$\\sigma$'),
        h2 = node('$\\sigma$'),
      _).margin(20),
      myPause(2),
      y = node(nil()),
    _).center().margin(150),
    myPause(-2),
    moveLeftOf('$\\blue{\\phi_1(x)}$', x1),
    moveLeftOf('$\\blue{\\phi_2(x)}$', x2),
    moveLeftOf('$\\blue{\\phi_3(x)}$', x3),
    moveTopOf('$\\red{h_1}$', h1),
    moveBottomOf('$\\red{h_2}$', h2),
    a1 = arrow(x1, h1),
    moveTopOf('$\\V$', a1),
    arrow(x1, h2),
    arrow(x2, h1),
    arrow(x2, h2),
    arrow(x3, h1),
    arrow(x3, h2),
    myPause(2),
    a2 = arrow(h1, y),
    arrow(h2, y),
    moveTopOf('$\\w$', a2),
    moveRightOf('$\\text{score}$', y),
  _);
}

add(slide('Neural networks',
  parentCenter(neuralNetwork2()),
  parentCenter(stagger(
    nowrapText('$\\text{score} = \\w \\cdot \\sigma(\\mathbf V^\\top \\blue{\\phi(x)})$'),
    nowrapText('$\\text{score} = \\w \\cdot \\underbrace{\\sigma(\\mathbf V^\\top \\blue{\\phi(x)})}_{\\red{\\Phi(x)}}$'),
  _)),
_));

prose(
  'Neural networks take the original feature vector $\\phi(x)$ and map it to a vector of activations $\\h$.',
  'We can understand this <b>activation vector</b> as a complex feature vector $\\Phi(x)$, which is used in the usual linear way to define the prediction score $\\w \\cdot \\Phi(x)$.',
  _,
  'Like decision trees, this feature vector $\\Phi(x)$ is set by the learning algorithm via tuning the parameters of the first layer $\\V$.',
  'The feature vector $\\Phi(x)$ can be thought of as the output of a set of linear predictors, each mapping $\\phi(x)$ to $\\sigma(v_k \\cdot \\phi(x))$.',
  _,
  'Here\'s a cartoon of what\'s going on to provide intuition: if the neural network is trying to map an image $x$ onto whether there is a face in the image ($y)$,',
  'each hidden unit might correspond to the presence or absence of a face part (e.g., ear, eye, nose, mouth).',
  'However, we don\'t tell the neural network what parts to look for &mdash; it decides for itself what parts are useful for the final face detection task.',
_);

add(summarySlide('Summary',
  bulletedText('Start with basic set of features $\\blue{\\phi(x)}$'), pause(),
  bulletedText(stmt('Linear classifiers: use features directly')),
  pause(),
  bulletedText(stmt('Kernel methods: linear classifiers with a possibly <b>infinite set of features</b> $\\red{\\Phi(x)}$')),
  pause(),
  bulletedText(stmt('Decision trees and neural networks: linear classifiers with <b>automatically learned features</b> $\\red{\\Phi(x)}$')),
_));

prose(
  'In summary, we always start out with basic set of features $\\phi(x)$.',
  _,
  'If the features are good enough, then we can simply use a linear classifier.',
  'This is typical for most text applications, where we have a feature for the presence/absence of each word.',
  'In this case, the feature vector is quite high dimensional (at least thousands), so linear classifiers are powerful enough.',
  _,
  'However, if the features are not good enough, then we can either hand engineer the features to make them better or simply appeal to a more complex learning algorithm that can do more with the basic features $\\phi(x)$.',
  'For instance, if $x$ is an image and $\\phi(x)$ is just the vector of pixel intensities, then linear classifiers don\'t work very well because the features are too low-level and noisy.',
  _,
  'We saw several ways that learning algorithms can be thought of as linear classifiers using more complex features.',
  'Kernel methods just throw in the kitchen sink and use an infinite set of features.',
  'Decision trees choose features that carve out regions of the input space.',
  'Neural networks choose features that correspond to linear predictors that capture higher-order properties of the basic input (through the activations of the hidden layers).',
  _,
  'Finally, it\'s worth noting that we\'ve spent most of our time talking about the expressiveness of hypothesis classes defined by the various learning algorithms.',
  'This is perhaps the part that is most important and hardest to understand.',
  'The mechanics of how to actually tune the parameters are fairly straightforward:',
  'using gradient-based optimization in the case of kernel methods and neural networks,',
  'and using the ID3 algorithm for decision trees.',
_);

add(quizSlide('learning3-start',
  'Is it possible to learn a linear classifier with an <b>infinite</b> number of features using <b>finite</b> computation?',
  'Yes',
  'No',
_));

////////////////////////////////////////////////////////////
// from search2

add(dividerSlide(italics('Another example...')));

add(slide('Information extraction',
  example('information extraction',
    stmt('Input: Craigslist apartment ad'),
    stmt('Output: labeling of each word with aspect'),
  _),
  parentCenter(infoExtractExample({xy: true})),
  pause(),
  stmt('Modeling', 'define $\\text{score}(x,y)$'),
  stmt('Algorithms', '$\\arg\\max_y \\text{score}(x,y)$'),
_).leftHeader(image('images/house.jpg').width(150)));

prose(
  'It will often be the case that you\'ll be handed a task which is not obviously a search problem',
  'and you have to encode it as one.',
  'The reason to do this is that we have efficient ways of solving search problems (UCS, DP),',
  'so if we can just convert something into a search problem, we can leverage those algorithms (and even the code).',
  _,
  'Let us now look at an example task of information extraction.',
  'Here, the goal is to take a text (sequence of words $x$) and a labeling $y$, which specifies a label for each word in $x$.',
  'The labels in our specific example correspond to the aspects of the Craigslist ad.',
  _,
  'To solve this task, we first start with modeling, which involves defining a scoring function that maps each $(x,y)$ to a number expressing how good $y$ is for $x$.',
  'Second, we try to come up with good algorithms for finding the highest scoring output $y$ given an $x$.  This is where the search problem encoding will happen.',
_);

add(slide('Modeling',
  parentCenter(infoExtractSmallExample({xy: true})),
  stmt('Goal: define $\\text{score}(x,y)$ which is high when $y$ is good for $x$'),
  pause(),
  stmt('Component scores'),
  componentScores({pause:true}),
  pause(),
  stmt('Global score'),
  parentCenter('$\\text{score}(x,y) = \\sum_{i=1}^L [S_1(x_i, y_i) + S_2(y_{i-1}, y_i)]$'),
_));

prose(
  'Here is one possible model $\\text{score}(x,y)$.',
  'There are two intuitions that we want to capture.',
  _,
  'First, certain words are more likely to be labeled a certain way.  For example, <i>beautiful</i> probably describes the feature, and <i>2</i> sometimes is talking about the size of the apartment, but not always.',
  'We define a function $S_1(x_i, y_i)$ that measures the compatibility of a word $x_i$ and its label $y_i$.',
  _,
  'Second, labels should be coherent.  If <i>bedroom</i> is labeled as SIZE, we would expect that the word <i>2</i> before it should also be labeled with SIZE, even though 2 by itself is ambiguous.',
  'We define a function $S_2(y_{i-1}, y_i)$ to capture this.',
  _,
  'For any $(x,y)$ pair, we add up all the component scores to get a global score $\\text{score}(x,y)$.',
  'For now, we assume that the scoring function is given, but later we\'ll see how we can actually learn this from data.',
_);

add(slide('Encoding as a search problem',
  stmt('Goal: given $\\text{score}(x,y)$, cast $\\arg\\max_y \\text{score}(x,y)$ as a search problem'),
  pause(),
  importantBox(bluebold('Recipe'),
    bulletedText('Break down output $y$ into a sequence of <b>actions</b>.'), pause(),
    bulletedText('Define the <b>states</b> of graph.'), pause(),
    bulletedText('Distribute terms of $\\text{score}(x,y)$ over <b>action costs</b>.'),
  _).content.margin(20).end,
_).leftHeader(image('images/cooking.jpg').width(150)));

add(slide('Encoding as a search problem',
  parentCenter(infoExtractSmallExample({xy: true})),
  //stmt('Goal: stuff $\\text{score}(x,y)$ into action costs'),
  //pause(),
  stmt('Action: label (FEAT, SIZE)'),
  pause(),
  stmt('State: (previous label $y_{i-1}$, current position $i$)'),
  pause(),
  parentCenter(overlay(
    xtable(
      frameBox('('+red('-BEGIN-')+',1)').padding(5),
      a1 = rightArrow(90).strokeWidth(3),
      frameBox('('+red('FEAT')+',2)').padding(5),
      a2 = rightArrow(90).strokeWidth(3),
      frameBox('('+red('SIZE')+',3)').padding(5),
      a3 = rightArrow(90).strokeWidth(3),
      frameBox('('+red('SIZE')+',4)').padding(5),
    _).center(),
    moveTopOf(red('FEAT'), a1),
    moveTopOf(red('SIZE'), a2),
    moveTopOf(red('SIZE'), a3),
  _)).scale(0.9),
  pause(),
  stmt('Place scores on edges'),
  parentCenter(frameBox(componentScores({}).scale(0.6))),
_));

add(slide('Encoding as a search problem',
  parentCenter(overlay(
    xtable(
      frameBox('('+red('-BEGIN-')+',1)').padding(5),
      a = rightArrow(450).strokeWidth(3),
      frameBox('('+red('FEAT')+',2)').padding(5),
    _).center(),
    moveTopOf('action: ' + red('FEAT'), a),
    moveBottomOf('$-(S_1($'+greenitalics('Beautiful')+','+red('FEAT')+'$) + S_2($'+red('-BEGIN-')+','+red('FEAT')+'$))$', a).scale(0.7),
  _)),
  stmt('In general'),
  //indent('$\\Cost(\\underbrace{s_{i-1}}_{(y_{i-1},i)}, \\underbrace{a_i}_{y_i}) = -(S_1(x_i, y_i) + S_2(y_{i-1}, y_i))$'),
  indent('$\\Cost((y_{i-1},i), y_i) = -(S_1(x_i, y_i) + S_2(y_{i-1}, y_i))$'),
_));

prose(
  'Now our goal is to turn the problem of finding the maximum scoring output $\\arg\\max_y \\text{score}(x,y)$ into a search problem,',
  'that of finding the minimum cost path.',
  _,
  'To do this, we first define the set of actions to be the possible labels.',
  'More specifically, taking action $a$ means assigning label $a$ to a word.',
  _,
  'To apply actions, we need to keep track of some state: we definitely need to know the current position $i$.',
  'But also, we need to know the label of the previous position $y_{i-1}$, because our scoring function involves interactions between adjacent labels $y_{i-1}$ and $y_i$.',
  _,
  'Finally, we just need to sprinkle the component scores onto the edges.',
  'More formally, we need to define an action cost for each edge involving the component scores so that the total cost of a path (sequence of actions)',
  'is equal to the negative score of the output corresponding to that path.',
  'This way, if we find the minumum cost path, we get the maximum scoring output.',
  _,
  'To do this, we pick up a component score $S_1($'+greenitalics('Beautiful')+','+red('FEAT')+'$)$.',
  'We need to place this on an edge $(s,a)$ where the state $s$ and action $a$ contain enough information to compute the component score.',
  'The first edge meets this criteria, because the current position $i=1$ tells us to get the word $x_1$ '+greenitalics('Beautiful')+', and the action is '+red('FEAT')+'.',
  _,
  'In general, we can place the component score $S_1(x_i, y_i)$ on the an edge $(s,a)$ where $s = (?, i)$ and $a = y_i$.',
  _,
  'Similarly, we can place the component score $S_2(y_{i-1}, y_i)$ on the edge $(s,a)$ where $s = (y_{i-1}, i)$ and $a = y_i$.',
  _,
  'It is easy to check that this construction satisfies the property that the path cost is the negative output score.',
_);

add(slide('Information extraction',
  parentCenter(infoExtractExample({xy: true})),
  pause(),
  stmt('Modeling'),
  parentCenter('define $\\text{score}(x,y)$'),
  pause(),
  stmt('Algorithms'),
  parentCenter(ytable(
    '$\\arg\\max_y \\text{score}(x,y)$',
    pause(),
    downArrow(50).strokeWidth(5),
    frameBox('search problem'),
    downArrow(50).strokeWidth(5),
    'UCS, DP',
  _).center()),
_).leftHeader(image('images/house.jpg').width(150)));

prose(
  'Let\'s revisit the information extraction example from last time.',
  'There are two parts of solving this task.',
  _,
  'First, modeling is about defining a score function that takes an input sentence $x$ and an output label sequence $y$,',
  'and outputs a score which indicates how good $y$ is for $x$.',
  _,
  'Then algorithms is about finding the output $y$ with the highest score for a given $x$.',
  'We will approach this optimization problem by casting it as a <b>search problem</b>,',
  'which allows us to solve it using standard search algorithms which are agnostic to the original problem.',
_);

add(slide('Encoding (unigram model)',
  parentCenter(infoExtractSmallExample({xy: true})),
  stmt('Component scores'),
  parentCenter(frameBox(componentScores1({pause: false}).scale(0.6))),
  pause(),
  stmt('Global score'),
  parentCenter('$\\text{score}(x,y) = \\sum_{i=1}^L S_1(x_i, y_i)$'),
  parentCenter('[whiteboard]'),
_));

prose(
  'Let us start with a simple model (scoring function), which only considers how words are labeled in isolation.',
  'In this model, the score is a sum of component scores, one for each word in the sentence.',
  'For example, we get rewarded $8$ for tagging the word <i>Beautiful</i> with FEAT.',
  _,
  'Let\'s now cast this as a search problem.',
  'We can think about the process of producing a label sequence $y$ as marching along the sentence left to right,',
  'placing a label down for each position $i$.',
  'So let\'s let the states be the positions $i=1,\\dots,L$ and the actions be the label.',
  _,
  'We can now put each of the negative of the component scores on the edges.',
  'Verify that the cost of each path is the sum of the edge costs,',
  'which exactly equals the negative score associated with that $y$.',
  _,
  'Every path corresponds to exactly one output $y$ and vice-versa.',
_);

add(slide('Encoding (bigram model)',
  parentCenter(infoExtractSmallExample({xy: true})),
  stmt('Component scores'),
  parentCenter(ytable(
    frameBox(componentScores1({pause: false})),
    frameBox(componentScores2({pause: false})),
  _).center()).scale(0.6),
  pause(),
  stmt('Global score'),
  parentCenter('$\\text{score}(x,y) = \\sum_{i=1}^L [S_1(x_i, y_i) + S_2(y_{i-1}, y_i)]$'),
  parentCenter('[whiteboard]'),
_));

prose(
  'The problem with the previous unigram model is that each label only depends on the word.',
  'In some cases, such as the word <i>2</i>, there is little information about what the label should be',
  '(it could be SIZE or DATE, etc.).',
  _,
  'Therefore, we introduce new bigram scores on the output.',
  'For example, we get a score of $5$ every time our label sequence has two adjacent labels equal to SIZE.',
  _,
  'If we try to add these scores on the edges of our unigram state space graph,',
  'we\'ll quickly realize that this is impossible since edge costs can only depend on the state and action ($\\Cost(s,a)$),',
  'not on previous actions.',
  _,
  'Therefore, we need to augment our state with more information about the past.',
  'In particular, let\'s add the previous label.',
  'If we do this, each node gets split into multiple ones so that we can now add the negative bigram scores to the appropriate edges.',
_);

add(summarySlide('Summary',
  stmt('Modeling: convert tasks into search problems'),
  //stmt('Put $\\text{score}(x,y)$ into action costs $\\Cost(s, a)$'),
  parentCenter('maximum scoring output $y$ $\\Leftrightarrow$ minimum cost path'),
  pause(),
  headerList('Algorithms',
    'Dynamic programming: assumes graph is acyclic',
    'Uniform cost search: assume non-negative action costs',
  _),
_));

add(slide('Binary classification as search',
  parentCenter('$f_\\w(x) = \\text{sign}(\\w \\cdot \\phi(x))$'),
  pause(),
  parentCenter(rootedTree('$\\StartState$',
    rootedTreeBranch(opaquebg('$+1: -\\blue{\\w \\cdot \\phi(x)}$'), '$\\GoalState$'),
    rootedTreeBranch(opaquebg('$-1: 0$'), '$\\GoalState$'),
  _).recmargin(400, 80).drawArrow2(true)),
  pause(),
  parentCenter(ytable(
    '$\\red{\\Cost(\\StartState, y)} = \\begin{cases} -\\blue{\\w \\cdot \\phi(x)} & \\text{if $y = +1$} \\\\ 0 & \\text{if $y = -1$} \\end{cases}$',
  _)),
  pause(),
  stmt('Machine learning: learn the '+redbold('edge costs')+' from data $(x,y)$'),
_));

prose(
  'As a trivial example, we can view binary classification as "search" over two actions.',
  'Having done this, it is clear that by estimating the weights $\\w$, machine learning is just learning the costs.',
_);

add(slide('Local feature vector',
  parentCenter('[whiteboard]'),
  stmt('<b>Local</b> feature vector'),
  indent('$\\phia(s, a) \\in \\R^d$: properties of the state and action'),
  pause(),
  stmt('Action cost (local)'),
  indent('$\\Cost(s, a) = -\\blue{\\w \\cdot \\phia(s, a)}$'),
_));

prose(
  'Let\'s generalize beyond binary classification.',
  'To do this, we will assume that each edge has a <b>local feature vector</b> $\\phia(s, a) \\in \\R^d$,',
  'which captures properties about that specific state $s$ and action $a$.',
  _,
  'For example, suppose that each state represents a city, and each action corresponds to traveling from one city to another.',
  'Suppose cost is travel time.',
  'For each edge, we could have features such as the traffic conditions, the number of lanes, or time of day; these are things that could influence the cost.',
  'Then, the define the edge cost to be the negative dot product between the weight vector $\\w$ and the local feature vector.',
_);

add(slide('Strategies for derivations',
  stmt('Compute the gradient update'),
  parentCenter('$\\displaystyle \\Loss(\\mathbf U, \\mathbf V) = \\sum_{i=1}^m \\sum_{j=1}^n w_{ij} \\max(|\\mathbf u_i^\\top\\mathbf v_j - x_{ij}| - \\epsilon, 0)$'),
  pause(),
  bulletedText('Interpret holistically: what are the properties of this equation?').autowrap(true),
  bulletedText('Simplify to get overall form: vectors to scalars, remove summations').autowrap(true),
  bulletedText('Memoize basic facts (e.g., $\\nabla_\\w \\|\\w\\|^2 = 2 \\w$)').autowrap(true),
  bulletedText('Dimension analysis: check that the "units" in your equation check out (think physics)').autowrap(true),
_));

prose(
  'This is the loss function for the $\\epsilon$-insensitive regression loss for matrix factorization.',
  'But it doesn\'t matter.  The point is that while it might look intimidating at first,',
  'it\'s actually not that bad if we approach it with a cool head.',
  'This next few paragraphs will hopefully convince you of that.',
  _,
  'The first thing to do is to always <b>interpret</b> the equation.',
  'In this class, we will never write down random equations &mdash; they are for some solving some real problem, and therefore are always purposeful.',
  'Interpreting the equations gives you a strong idea of what to do with it.',
  _,
  'This is a loss function, which means that $\\mathbf U$ and $\\mathbf V$ are some sort of parameters.',
  'It might not be clear what $\\mathbf U$ and $\\mathbf V$ are at this point,',
  'but searching on the right-hand side shows $\\mathbf u_i^\\top \\mathbf v_j$,',
  'which suggests that $\\mathbf U$ is a matrix whose columns are $\\mathbf u_1, \\dots, \\mathbf u_m$ (same for $\\mathbf V$).',
  'Next, it appears that there is a weighted (by $w_{ij}$) sum over $i,j$ of something.',
  'Perhaps we can interpret each $(i,j)$ as a data point.',
  'Now, there\'s some ugliness in the $\\max(\\cdot)$, but at the heart of it is $r = \\mathbf u_i^\\top\\mathbf v_j - x_{ij}$,',
  'the difference between something that depends on the parameters and some point.',
  'This should remind you of the residual term in regression.',
  'And let\'s just abstract out the ugliness into $f(r) = \\max(|r| - \\epsilon, 0)$.',
  'Just as in code, it is really useful to introduce intermediate functions to simplify your equations.',
  'Now, we can just think of $f(r)$ as the per-example loss function that operates on the residual.',
  _,
  'Ok, now that we\'ve interpreted the loss function, how do we compute a gradient update?',
  'What are gradient updates?  Recall from the gradient descent algorithms that gradient updates looked like',
  '$\\w \\leftarrow \\w - \\nabla_w \\TrainLoss(\\w)$.',
  'Now we just need to map those notions on to our loss function here.',
  'The gradient here should be with respect to our parameters, which are $(\\mathbf U, \\mathbf V)$.',
  'Let\'s simplify and take the gradient with respect to just one of the components $\\mathbf u_k$.',
  'Everything else is really the same (you should convince yourself of this).',
_);

prose(
  'Ok, let\'s start taking the gradient.  Always remember what are variables that you\'re taking the gradient with respect to,',
  'and which are constants.  Most of the variables are actually constants, which is good news, since the gradient of constants is zero.',
  'Gradients of summations are easy: they are just the summation of the gradients.',
  'Visually, we can just think of pushing the gradient through the summations.',
  'Multiplication by constant is also easy, because we can again switch the constant and the gradient.',
  'So, at this point, we just have:',
  '$\\displaystyle \\nabla_{\\mathbf u_k} \\Loss(\\mathbf U, \\mathbf V) = \\sum_{i=1}^m \\sum_{j=1}^n w_{ij} \\nabla_{\\mathbf u_k} f(\\mathbf u_i^\\top\\mathbf v_j - x_{ij})$.',
  _,
  'Let\'s zoom in on $G = \\nabla_{\\mathbf u_k} f(\\mathbf u_i^\\top \\mathbf v_j - x_{ij})$.',
  'Now, we need to pay a bit of attention to the summation indices.',
  'If $k \\neq i$, then the quantity doesn\'t depend on $\\mathbf u_k$, and $G = 0$.',
  'If $k = i$, then we can just use the chain rule to get $G = f\'(\\mathbf u_k^\\top \\mathbf v_j - x_{ij}) \\mathbf v_j$.',
  _,
  'To reassure yourself that this is correct, a useful trick is to check it if all the variables are scalars instead of vectors.',
  'Whatever answer you get in the vector case must be consistent with the scalar case, or else someting wrong.',
  _,
  'Now, we just need to compute the derivative of a simple scalar function $f\'(r)$.',
  'Note that we can do this in isolation, away from the bustling commotion of the full objective.',
  'Plot it: the loss is a max over two functions, so just draw the two functions separately,',
  'and just trace out the max over the two.  You should get a something that looks like a cone that\'s be squashed.',
  'You should be able to read off the derivative $f\'(r)$ from the plot: it is $-1$ if $r < \\epsilon$, $+1$ if $r > \\epsilon$, and $0$ otherwise.',
  'Simple.',
  _,
  'In case you don\'t have the luxury of visualization, you can also come to the same conclusion algebraically.',
  'The key is that the derivative of $\\max(f_1(x), f_2(x))$ is just $f_i\'(x)$, where $i = \\arg\\max_{i} f_i(x)$ corresponds to whichever function is larger at $x$.',
  _,
  'So that\'s basically it.  You needn\'t even bother plugging $f\'(r)$ back into the original formula.',
  'It\'s actually nice keeping things nice and modular, like code.',
_);

add(slide('Strategies for debugging',
  bulletedText('Simplify inputs: find the smallest test case where your code fails ($n=1$); for machine learning, easy test cases (two well-separated points)').autowrap(true),
  bulletedText('Code: write smaller functions, use intermediate variables, print out variables liberally').autowrap(true),
  bulletedText('Fail early: use <tt>assert</tt>').autowrap(true),
  bulletedText('Agree on conventions (to avoid off-by-1) and document').autowrap(true),
_));

prose(
  'Speaking of code...  Suppose you write up your solution, and run it, and the code fails.',
  'The first thing you should do is to try to simplify, and find the smallest test case',
  'on which your code fails.  If your Perceptron is failing when it\'s training on a thousand points,',
  'reduce it down to something embarassingly simple, like $1$ or $2$.',
  'If that works, then binary search until you find the right complexity.',
  'This will just make your life easier.',
  _,
  'For machine learning algorithms, there\'s an additional consideration.',
  'They tend to be harder to debug, because there might not a definitive right answer, unlike in search.',
  'But you can try to make the learning problems easier, which means, choosing data points which are well separated.',
  'In those cases, Perceptron is guaranteed to converge, so it better do so.',
  _,
  'As in math, always write smaller functions and use intermediate variables, for example <tt>phi = featureExtractor(x)</tt>, <tt>margin = dot(phi, w) * y</tt>, etc.',
  'rather than just having an ultra-compressed one line expression.',
  'Well-written code should be almost self-documenting.',
  _,
  'Print out the internal state of your code.  You want to get more information about what your program is doing than just a single number at the end.',
  'But you also don\'t want to print out more stuff that you can actually read.',
  'Along with prints, insert asserts liberally.  You know that uniform cost search is supposed to only take non-negative edge costs,',
  'so just assert that it\'s true.  Otherwise, UCS will just spit out something that almost seems reasonable but is wrong,',
  'and it\'s just hard to chase down.  Sometimes the problem is not where you think it is.',
  _,
  'Some code is intrinsically tricky to write.  For example, if you\'re keeping track of intervals.',
  'Make sure you\'re absolutely clear about whether the end indices are inclusive or inclusive, whether things are zero-based or one-based etc.',
  'I tend to use the convention of <tt>(start, end)</tt> to mean <tt>start</tt> is included but <tt>end</tt> is not.',
  'But whatever you use, be consistent.',
_);

add(slide(null,
  nil(),
  keyIdea('strategy', '<b>Interpret</b> and <b>simplify</b>.'),
_));

// Return a bounding rectangle around blocks.
function fence(blocks, options) {
  if (options == null) options = {};
  var padding = options.padding || 5;
  var minx, miny, maxx, maxy;
  for (var i = 0; i < blocks.length; i++) {
    var b = blocks[i];
    if (sfig.serverSide) {
      minx = minx == null ? b.left() : b.left().min(minx);
      miny = miny == null ? b.top() : b.top().max(miny);
      maxx = maxx == null ? b.right() : b.right().max(maxx);
      maxy = maxy == null ? b.bottom() : b.bottom().min(maxy);
    } else {
      minx = minx == null ? b.left() : b.left().min(minx);
      miny = miny == null ? b.top() : b.top().min(miny);
      maxx = maxx == null ? b.right() : b.right().max(maxx);
      maxy = maxy == null ? b.bottom() : b.bottom().max(maxy);
    }
  }
  return polygon(
    [minx.sub(padding), miny.up(padding)],
    [maxx.add(padding), miny.up(padding)],
    [maxx.add(padding), maxy.down(padding)],
    [minx.sub(padding), maxy.down(padding)]);
  //return rect(maxx.sub(minx).add(2*padding), maxy.sub(miny).abs().add(2*padding)).shiftBy(minx.up(padding), miny.up(padding));
}

function hierarchicalGraph() {
  var graph = {edges: 'S A 1|A D 3|D C 2|S B 2|A B 5|C E 3|E F 2|F G 1|E G 7'.split('|'), initRandom: 5, maxHeight: 200, labelScale: 0.8, labelColor: 'blue', highlightNodes: 'S G'};
  nodeEdgeGraph(graph);
  graph.edges.push('B D 1');
  return parentCenter(overlay(
    nodeEdgeGraph(graph),
    fence('S A B'.split(' ').map(function(x) { return graph.getNode(x); })).dashed().strokeColor('red').strokeWidth(2),
    fence('C D'.split(' ').map(function(x) { return graph.getNode(x); })).dashed().strokeColor('red').strokeWidth(2),
    fence('E F G'.split(' ').map(function(x) { return graph.getNode(x); })).dashed().strokeColor('red').strokeWidth(2),
  _));
}

addRelaxationSummarySlide();

add(slide('State abstraction',
  stmt('Intuition: won\'t always have closed form; can we make search cheaper?'),
  pause(),
  keyIdea('state abstraction',
    'Collapse multiple <b>concrete</b> states into one '+redbold('abstract')+' state $\\Rightarrow$ search over fewer states.',
  _),
  hierarchicalGraph(),
  pause(),
  stmt('Relaxation: adding zero cost edges within an abstract state'),
_));

prose(
  'In general, $\\FutureCost\'(s)$ will not be computable in closed form, and we will need to use actual search.',
  'So let\'s see if we can make the search problem faster to solve by reducing the number of states.',
  _,
  'A general way to do this is via <b>state abstraction</b>, where we collapse multiple (concrete) states into abstract states.',
  'The idea is that we can just search over the fewer number of abstract states.',
  _,
  'State abstraction is an instantiation of relaxation, where we simply add zero cost edges between all concrete states in an abstract state.',
_);

function stateAbstractionCosts() {
  var node = function() { return circle(5).color('black'); }
  var myArrow = function(a, b, l) { var arr = arrow(a, b).line.labelDist(15).end; return overlay(arr, text(''+l).scale(0.5).color('blue').shift(arr.line.xlabel(), arr.line.ylabel())); }
  return overlay(
    table(
      [overlay(u1 = ellipse(30, 60).strokeWidth(2).dashed().strokeColor('red'), ytable(a1 = node(), a2 = node()).margin(30)).center(),
       overlay(u2 = ellipse(30, 60).strokeWidth(2).dashed().strokeColor('red'), ytable(b1 = node(), b2 = node()).margin(30)).center()],
    _).margin(100, 0).justify('c', 'r'),
    myArrow(a1, b1, 10), myArrow(a1, b2, 5), myArrow(a2, b2, 8),
  _);
}
add(slide('Abstract search problem',
  stmt('Abstract initial state: abstract state that contains $\\StartState$'),
  pause(),
  stmt('Abstract goal: abstract state that contains $\\GoalState$'),
  pause(),
  stmt('Abstract edge costs: minimum over all concrete edges between them (5 in this example)'),
  parentCenter(stateAbstractionCosts()),
_));

prose(
  'Having defined the abstract states, let us define an abstract search problem.',
  _,
  'The abstract start state is the abstract state that contains the concrete start state $\\StartState$; same for the abstract goal state and $\\GoalState$.',
  _,
  'We define an abstract edge between two abstract states if there is at least one concrete edge between them.',
  'The abstract edge cost is the minimum over the concrete edge costs.',
_);

////////////////////////////////////////////////////////////
// Learning Markov networks
roadmap(0);

add(slide('Elimination on a chain',
  example('chain',
    parentCenter(chainFactorGraph({n:5})),
    pause(),
    stmt('Object in $\\{0,1\\}$ starts at $0$, ends at $1$'),
    parentCenter(xtable('$o_1(x_1) = [x_1 = 0]$', '$o_5(x_5) = [x_5 = 1]$').margin(100)),
    pause(),
    stmt('Twice as likely to stay in place than move'),
    parentCenter('$t_i(x_i, x_{i+1}) = [x_i = x_{i+1}] + 1$'),
    pause(),
    parentCenter(text('[demo]').linkToUrl('index.html#include=inference-demo.js&example=chain&postCode=maxVariableElimination()')),
  _).content.margin(20).end,
_));

add(slide('Motivation',
  parentCenter(chainFactorGraph({n:5}).scale(0.6)),
  stmt('So far'),
  parentCenter(xtable(
    'potentials $t_i,o_i$',
    bigRightArrow(100),
    ytable(
      'maximum weight assignment',
      'marginal probabilities',
    _),
  _).center().margin(20)),
  pause(),
  stmt('Next'),
  parentCenter('Where do the potentials $\\red{t_i,o_i}$ come from?'),
_));

prose(
  'So far, if someone hands you a factor graph with a set of potentials, you should be able to do probabilistic inference',
  'using a variety of different methods (elimination, Gibbs sampling, particle filtering).',
  _,
  'Now we turn to the question of where do these potentials actually come from?',
  'In the spirit of the class, we will learn them from data.',
_);

add(slide('Inference and learning',
  nil(),
  parentCenter(overlay(
    xtable(
      frameBox('parameters $\\theta$').ypadding(50),
      ytable(
        a1 = bigRightArrow(200),
        a2 = bigLeftArrow(200),
      _).center().margin(50),
      frameBox('assignment $x$').ypadding(50),
    _).center().margin(20),
    moveTopOf(bluebold('inference'), a1).scale(0.7),
    moveBottomOf(redbold('learning'), a2).scale(0.7),
  _)),
_));

prose(
  'In the past (both for supervised learning and reinforcement learning), we had talked about learning weight vectors $\\w$.',
  'Since we have co-opted the term <b>weight</b> for assignments, we will instead use <b>parameters</b> $\\theta$ instead (this is a purely notational switch).',
  _,
  'Inference is the task of taking a fixed parameter vector $\\theta$ (which specifies all the potential functions),',
  'and producing the maximum weight assignment or a distribution over assignments.',
  _,
  'Learning is the <b>inverse</b> task of taking an observed assignment and setting the parameters.',
_);

add(slide('Example',
  parentCenter(chainFactorGraph({n:5}).scale(0.6)),
  stmt('Data'),
  parentCenter('$x_\\text{train} = 00001$'),
  pause(),
  stmt('Parameters'),
  parentCenter('$t_i(x_i, x_{i+1}; \\red{\\theta}) = \\exp(\\red{\\theta_1} \\cdot [x_i = 1] + \\red{\\theta_2} \\cdot [x_i = x_{i+1}])$'),
  parentCenter(text('[demo: manual learning]').linkToUrl('index.html#include=inference-demo.js&example=chain&postCode=sumVariableElimination()')),
_));

prose(
  'As an example, let us consider the case where we get a single training example 00001.',
  'What should the potentials be?',
  _,
  'Let\'s suppose that the potentials now depend on some parameters $\\theta$.',
  'We add $\\theta$ into the potentials ($t_i(x_i, x_{i+1}; \\theta)$) to make this dependence explicit.',
  _,
  'The transition potentials depend on two features: the first one is $[x_i = 1]$ indicates whether the current position is $1$,',
  'and the second one $[x_i = x_{i+1}]$ indicates whether the the current position and the next position are equal (the object is staying in place).',
  _,
  'In the demo, let\'s change the <tt>nearby()</tt> potential to depend on the parameters $\\theta = (\\theta_1,\\theta_2)$.',
  'In particular: <tt>theta1 = -1, theta2 = 1, nearby = function(a, b) { return Math.exp(theta1*a + theta2*(a==b)); }</tt>.',
  _,
  'Try to get some intuition by manually fiddling with the parameters and observing the resulting probability distribution over assignments.',
_);

add(slide('General setup',
  parentCenter(chainFactorGraph({n:5}).scale(0.6)),
  bulletedText('Parameter vector $\\red{\\theta} \\in \\R^d$'), pause(),
  bulletedText('Local feature vector $\\phi_j(x) \\in \\R^d$'), pause(),
  bulletedText('Potentials (local): $f_j(x; \\red{\\theta}) = \\exp(\\red{\\theta} \\cdot \\phi_j(x))$'), pause(),
  bulletedText('Global feature vector: $\\phi(x) = \\sum_{j=1}^m \\phi_j(x)$'), pause(),
  stagger(
    bulletedText('Weight (global): $\\displaystyle \\Weight(x; \\red{\\theta}) = \\prod_{j=1}^m f_j(x; \\theta)$'),
    bulletedText('Weight (global): $\\displaystyle \\Weight(x; \\red{\\theta}) = \\exp\\left(\\theta \\cdot \\phi(x)\\right)$'),
  _),
  pause(),
  bulletedText('Probability distribution: $\\P(X = x; \\red{\\theta}) = \\frac{\\Weight(x; \\red{\\theta})}{Z(\\red{\\theta})}$'),
_));

prose(
  'Here is the general setup, similar to the one for the structured Perceptron for search problems:',
  'we have an unknown parameter vector $\\theta$.',
  _,
  'Rather than having a fully-specified potential $f_j$, we define a local feature vector $\\phi_j$ instead.',
  'This will be the thing that sits on each square node in the factor graph.',
  'If we have the parameters $\\theta$, then the exponential of the dot product of the parameter vector and the local feature vector determines the value of the potential function $f_j$.',
  _,
  'The sum of the local feature vectors yields the the global feature vector defined for an entire assignment $x$.',
  'This allows us to express the weight more simply as the exponential of the dot product between the parameter vector and the global feature vector.',
  _,
  'Finally, we can normalize the weight vector to get a probability distribution.',
  'Note that the normalization constant $Z(\\theta)$ (equal to the total weight over all assignments) now depends on the parameters:',
  'Naturally, the parameters affect how much total weight there is.',
_);

add(slide('Structured Perceptron',
  stmt('Data: $x_\\text{train}$'),
  pause(),
  keyIdea('learning',
    'Tweak $\\theta$ so that training assignments have higher weight than other assignments.',
  _),
  pause(),
  algorithm('structured Perceptron',
    '$\\theta \\leftarrow [0, \\dots, 0]$',
    'For $t = 1, \\dots, T$:', pause(),
    indent('$\\displaystyle x_\\text{pred} \\leftarrow \\arg\\max_x \\Weight(x; \\theta)$'), pause(),
    indent('$\\theta \\leftarrow \\theta + \\eta_t [\\phi(x_\\text{train}) - \\phi(x_\\text{pred})]$'),
  _),
_));

prose(
  'We first saw the structured Perceptron algorithm in the context of search problems,',
  'which provided a natural generalization of the structured Perceptron for binary classification.',
  'Now, we reintroduced the structured Perceptron in the context of factor graphs.',
  _,
  'The intuition is simple: we want the training assignment to have higher weight than any other assignment.',
  'To accomplish that, we will incrementally tweak $\\theta$.',
  _,
  'The algorithm first computes the maximum weight assignment ($x_\\text{pred}$); note that this depends on the current parameters.',
  'If we get the desired assignment ($x_\\text{pred} = x_\\text{train}$), then we stop.',
  'Otherwise, we will update the parameters towards the feature vector of the training assignment $\\phi(x_\\text{train})$',
  'and away from the feature vector of the predicted assignment $\\phi(x_\\text{pred})$.',
  _,
  'Here, $\\eta_t$ is the step size, which in the classic Perceptron is $1$,',
  'but generally, a decaying step size such as $\\eta_t = \\frac1{\\sqrt{t}}$ leads to better results.',
  'For simplicity, assume $\\eta_t = 1$.',
_);

add(slide('Structured Perceptron: example',
  stmt('Update'),
  parentCenter('$\\theta \\leftarrow \\theta + \\eta_t [\\phi(x_\\text{train}) - \\phi(x_\\text{pred})]$'),
  pause(),
  example('toy model',
    stmt('Model'),
    parentCenter(nowrapText('$(x_1,x_2) \\in \\{0,1\\}^2, \\phi(x) = ([x_1 = 1], [x_1 = x_2])$')),
    pause(),
    stmt('Data'),
    parentCenter('$x_\\text{train} = (1,0)$'),
    pause(),
    stmt('Training'),
    parentCenter(momentMatchingLearningExample({perceptron: true, numIters: 3}).scale(0.8)),
  _).scale(0.9),
_));

add(slide('Structured Perceptron: multiple examples',
  stmt('Data: set of training assignments $\\Train$'), pause(),
  stmt('Approach: apply same update on each assignment'),
  pause(),
  algorithm('structured Perceptron',
    '$\\theta \\leftarrow [0, \\dots, 0]$',
    'For $t = 1, \\dots, T$:', pause(),
    indent(redbold('Choose $\\red{x_\\text{train} \\in \\sD_\\text{train}}$')), pause(),
    indent('$\\displaystyle x_\\text{pred} \\leftarrow \\arg\\max_x \\Weight(x; \\theta)$'), pause(),
    indent('$\\theta \\leftarrow \\theta + \\eta_t [\\phi(x_\\text{train}) - \\phi(x_\\text{pred})]$'),
  _),
_));

add(slide('Structured Perceptron: example',
  stmt('Update'),
  parentCenter('$\\theta \\leftarrow \\theta + \\eta_t [\\phi(x_\\text{train}) - \\phi(x_\\text{pred})]$'),
  pause(),
  example('toy model with two examples',
    //stmt('Model'),
    //parentCenter(nowrapText('$(x_1,x_2) \\in \\{0,1\\}^2, \\phi(x) = ([x_1 = 1], [x_1 = x_2])$')),
    //pause(),
    stmt('Data: $x_\\text{train} \\in \\{(1,0), (1,1)\\}$'),
    pause(),
    //stmt('Training'),
    parentCenter(momentMatchingLearningExample({perceptron: true, multipleTargets: true, numIters: 7}).scale(0.8)),
  _).scale(0.9),
  pause(),
  stmt('Problem: not converging!'),
_));

prose(
  'On one example, the structured Perceptron works beautifully and converges in just one update (in general, it could take more iterations).',
  _,
  'However, on multiple examples, we run into convergence problems.',
  'The weight of the first feature stabilizes (favoring $x_1 = 1$),',
  'but the other feature alternates between $0$ and $1$ after seeing each different example.',
  _,
  'Let\'s see if we can come up with a more principled framework that can fix this problem.',
_);

add(slide('Maximum likelihood',
  keyIdea('maximum likelihood',
    'Tweak $\\theta$ so that the model probability of training assignments is maximized.',
  _),
  pause(),
  //stmt('Data: set of assignments $\\Train$'),
  stmt('Data: training assignment $x_\\text{train}$'),
  pause(),
  stmt('Log-likelihood function'),
  //indent('$\\displaystyle L(\\red{\\theta}) = \\sum_{x_\\text{train} \\in \\Train} \\log \\P(X = x_\\text{train}; \\red{\\theta})$'),
  //indent('$\\begin{align} L(\\red{\\theta}) &= \\log \\P(X = x_\\text{train}; \\red{\\theta}) \\\\ & = \\theta \\cdot \\phi(x_\\text{train}) - \\log Z(\\theta) \\end{align}$'),
  indent(table(
    ['$L(\\red{\\theta})$', '$= \\log \\P(X = x_\\text{train}; \\red{\\theta})$'], pause(),
    [nil(), '$= \\theta \\cdot \\phi(x_\\text{train}) - \\log Z(\\theta)$'],
  _).ymargin(20)),
_));

add(slide('Maximum likelihood',
  stmt('Maximum likelihood objective'),
  parentCenter('$\\displaystyle \\max_{\\theta} L(\\theta)$'),
  pause(),
  algorithm('gradient ascent',
    '$\\theta \\leftarrow [0, \\dots, 0]$',
    'For $t = 1, \\dots, T$:',
    indent('$\\theta \\leftarrow \\theta + \\eta_t \\red{\\nabla_\\theta L(\\theta)}$'),
  _),
_));

prose(
  'Given an observed assignment $x_\\text{train}$, we want to set $\\theta$ to maximize the probability assigned to $x_\\text{train}$.',
  'It will be convenient to work with the log probability, which is just a monotonic transformation of the probability.',
  _,
  'Thus, what we seek to maximize is the <b>log-likelihood function</b>.',
  _,
  'We can maximize this function using gradient ascent',
  '(same as gradient descent except we add the gradient rather than subtract the gradient).',
_);

add(slide('Gradient of the log-likelihood',
  //stmt('Gradient'),
  indent(stagger(
    '$\\displaystyle \\blue{\\nabla_\\theta} L(\\theta) = \\blue{\\nabla_\\theta} \\theta \\cdot \\phi(x_\\text{train}) - \\blue{\\nabla_\\theta} \\log Z(\\theta)$',
    '$\\displaystyle \\blue{\\nabla_\\theta} L(\\theta) = \\phi(x_\\text{train}) - \\blue{\\nabla_\\theta} \\log Z(\\theta)$',
    '$\\displaystyle \\blue{\\nabla_\\theta} L(\\theta) = \\phi(x_\\text{train}) - \\frac{\\blue{\\nabla_\\theta} Z(\\theta)}{Z(\\theta)}$',
    '$\\displaystyle \\blue{\\nabla_\\theta} L(\\theta) = \\phi(x_\\text{train}) - \\frac{\\blue{\\nabla_\\theta} \\sum_{x\'} \\exp(\\theta \\cdot \\phi(x\'))}{Z(\\theta)}$',
    '$\\displaystyle \\blue{\\nabla_\\theta} L(\\theta) = \\phi(x_\\text{train}) - \\frac{\\sum_{x\'} \\blue{\\nabla_\\theta} \\exp(\\theta \\cdot \\phi(x\'))}{Z(\\theta)}$',
    '$\\displaystyle \\blue{\\nabla_\\theta} L(\\theta) = \\phi(x_\\text{train}) - \\frac{\\sum_{x\'} \\exp(\\theta \\cdot \\phi(x\')) \\phi(x\')}{Z(\\theta)}$',
    '$\\displaystyle \\blue{\\nabla_\\theta} L(\\theta) = \\phi(x_\\text{train}) - \\frac{\\sum_{x\'} \\orange{\\exp(\\theta \\cdot \\phi(x\'))} \\phi(x\')}{\\orange{Z(\\theta)}}$',
    '$\\displaystyle \\blue{\\nabla_\\theta} L(\\theta) = \\phi(x_\\text{train}) - \\sum_{x\'} \\orange{\\P(X = x\'; \\theta)} \\phi(x\')$',
    '$\\displaystyle \\blue{\\nabla_\\theta} L(\\theta) = \\green{\\underbrace{\\phi(x_\\text{train})}_{\\text{target}}} - \\red{\\underbrace{\\sum_{x\'} \\P(X = x\'; \\theta) \\phi(x\')}_{\\text{prediction}}}$',
  _)),
  pause(),
  keyIdea('moment matching',
    'Tweak parameters $\\theta$ to make '+redbold('predicted features')+' under the model equal to '+greenbold('target features')+' according to training data.',
  _),
_));

prose(
  'Now what remains to be done is to compute the gradient of the log-likelihood function.',
  'It is a relatively straightforward derivation.',
  _,
  'The key step is to note that the quantity $\\frac{\\exp(\\theta \\cdot \\phi(x\'))}{Z(\\theta)}$ shows up again,',
  'which is exactly equal to the probability of $x\'$ based on parameters $\\theta$.',
  _,
  'The final form of the gradient has an especially elegant interpretation:',
  'it is the difference between the feature vector of the training assignment (the target) and the feature vector according to the model distribution $\\P(X = x; \\theta)$ (our prediction).',
  _,
  'Note the similarity to all other machine learning gradient updates:',
  'it always boils down to the difference between target and prediction.',
_);

add(slide('Maximum likelihood: example',
  example('toy model',
    stmt('Model'),
    parentCenter(nowrapText('$(x_1,x_2) \\in \\{0,1\\}^2, \\quad \\phi(x) = ([x_1 = 1], [x_1 = x_2])$')),
    pause(),
    stmt('Data'),
    parentCenter('$x_\\text{train} = (1,0)$'),
    pause(),
    stmt('Training'),
    parentCenter(momentMatchingLearningExample({perceptron: false, numIters: 4, numRealIters: 10000, stepSize: 1}).scale(0.7)),
  _),
_));

add(slide('Maximum likelihood: example',
  example('toy model with two examples',
    //stmt('Model'),
    //parentCenter(nowrapText('$(x_1,x_2) \\in \\{0,1\\}^2, \\quad \\phi(x) = ([x_1 = 1], [x_1 = x_2])$')),
    //pause(),
    stmt('Data: $x_\\text{train} \\in \\{(1,0), (1,1)\\}$'),
    pause(),
    //stmt('Training'),
    parentCenter(momentMatchingLearningExample({perceptron: false, numIters: 7, numRealIters: 1000, multipleTargets: true, stepSize: 1}).scale(0.7)),
  _),
  pause(),
  stmt('Conclusion: handle multiple conflicting examples gracefully'),
_));

add(slide('Efficient computation',
  stmt('Goal: compute predicted features (for gradient)'),
  parentCenter('$\\displaystyle \\sum_x \\P(X = x; \\theta) \\phi(x)$'),
  pause(),
  stmt('Example: if $\\phi(x) = \\phi_3(x_3)$'),
  parentCenter('$\\displaystyle \\sum_{x_3} \\red{\\P(X_3 = x_3; \\theta)} \\phi_3(x_3)$'),
  pause(),
  stmt('Example: if $\\phi(x) = \\phi_3(x_3, x_4)$'),
  parentCenter('$\\displaystyle \\sum_{x_3, x_4} \\red{\\P(X_3 = x_3, X_4 = x_4; \\theta)} \\phi_3(x_3, x_4)$'),
  pause(),
  'Use probabilistic inference algorithms to compute marginals!',
_));

prose(
  'The structured Perceptron just required finding the maximum weight assignment, which we already know how to do.',
  'How do we compute the gradient for the maximum likelihood objective?',
  _,
  'All that remains to be done is to actually compute the expected feature vector.',
  'This is non-trivial because it requires a sum over all possible assignments.',
  'But summing over all possible assignments is something that we\'ve been doing all along!',
  _,
  'If $\\phi(x)$ only depends on a few variables $A$, then we can just eliminate all the other variables not in $A$.',
  _,
  'In general, $\\phi(x) = \\sum_{j=1}^m \\phi_j(x)$ will be a summation over local feature vectors.',
  'By linearity of expectation, we just need to compute the marginal probabilities $\\P(A_j; \\theta)$,',
  'where $A_j \\subset X$ is the set of variables that $\\phi_j$ depends on.',
  'Then, the overall expected features is just $\\sum_{j=1}^m \\sum_{a_j} \\P(A_j = a_j; \\theta) \\phi_j(a_j)$,',
  'where $a_j$ ranges over all possible assignments to $A_j$.',
  _,
  'In the case of chain-structured factor graphs, we can compute all the marginals by computing forward and backward sum messages:',
  _,
  'Forward messages: $\\displaystyle F_i(x_{i+1}) = \\sum_{x_i} F_{i-1}(x_i) o_i(x_i) t_i(x_i, x_{i+1})$',
  _,
  'Backward messages: $\\displaystyle B_i(x_{i-1}) = \\sum_{x_i} B_{i+1}(x_i) o_i(x_i) t_{i-1}(x_{i-1}, x_i)$',
  _,
  'Node marginals: $\\P(X_i = x_i) \\propto F_{i-1}(x_i) o_i(x_i) B_{i+1}(x_i)$',
  _,
  'Edge marginals: $\\P(X_i = x_i, X_{i+1} = x_{i+1}) \\propto F_{i-1}(x_i) o_i(x_i) t_i(x_i, x_{i+1}) o_{i+1}(x_{i+1}) B_{i+2}(x_i)$',
_);

/*add(slide('Example: chain',
  parentCenter(chainFactorGraph({n:5})),
  'How to compute $\\P(X_2 = x_2)$ for all $x_2$?',
  pause(),
  parentCenter(text('[demo]').linkToUrl('index.html#include=inference-demo.js&example=chain&postCode=query(\'X2\'); sumVariableElimination({order: \'X1 X5 X4 X3\'})')),
_));*/

add(slide('Example: chain',
  parentCenter(chainFactorGraph({n:5})),
  pause(),
  stmt('Sum forward messages $F_i$: eliminate $X_1, \\dots, X_i$'),
  pause(),
  xtable(
    forwardMessageGraph(),
    '$\\displaystyle \\red{F_i(x_{i+1})} = \\sum_{x_i} F_{i-1}(x_i) o_i(x_i) t_i(x_i, x_{i+1})$',
  _).margin(30).scale(0.75).center(),
  pause(),
  stmt('Sum backward messages $B_i$: eliminate $X_i, \\dots, X_n$'),
  pause(),
  xtable(
    parentCenter(backwardMessageGraph()),
    '$\\displaystyle \\blue{B_i(x_{i-1})} = \\sum_{x_i} B_{i+1}(x_i) o_i(x_i) t_{i-1}(x_{i-1}, x_i)$',
  _).margin(30).scale(0.75).center(),
_));

add(slide('Example: chain',
  stmt('Sum marginals (nodes)'),
  parentCenter(muChainGraph()),
  parentCenter(nowrapText('$\\purple{\\P(X_i = x_i)} \\propto \\red{F_{i-1}(x_i)} o_i(x_i) \\blue{B_{i+1}(x_i)}$')),
  pause(),
  stmt('Sum marginals (edges)'),
  parentCenter(mu2ChainGraph()),
  parentCenter(nowrapText('$\\purple{\\P(X_i = x_i, X_{i+1} = x_{i+1})} \\propto \\red{F_{i-1}(x_i)} o_i(x_i) t_i(x_i, x_{i+1}) o_{i+1}(x_{i+1}) \\blue{B_{i+2}(x_i)}$').scale(0.7)),
_));

add(slide('Learning and inference',
  nil(),
  parentCenter(
    frameBox(ytable(
      'Structured Perceptron',
      'Maximum likelihood',
      pause(),
      yspace(20),
      frameBox(ytable('Variable elimination', 'Gibbs sampling', 'Particle filtering')).title(opaquebg(redbold('Inference'))).padding(50),
      yspace(20),
    _)).title(opaquebg(greenbold('Learning'))).padding(50, 10),
  _),
_));

add(summarySlide('Announcements',
  bulletedText('Wednesday: guest lecture [Roy Frostig]'),
  pause(),
  bulletedText('Midterm next Tuesday, review section this Friday [Arun]'),
  pause(),
  bulletedText('Homework [ner] due <b>Thursday at 11pm</b>'),
  bulletedText('Homework [car] out today, due <b>Dec 3 11pm</b>'),
  bulletedText('Homework [qa] out next Monday, due <b>Dec 3 11pm</b>'),
  pause(),
  bulletedText('Project: poster session <b>Dec 4 in class</b>'),
  bulletedText('Project: final report <b>Dec 10 11pm</b>'),
_));

add(slide('Generative models',
  keyIdea('probabilistic program',
    'A <b>probabilistic program</b> that outputs the state of the world (variables $X_1, \\dots, X_n$) via a sequence of random choices.',
  _),
  pause(),
  parentCenter(xtable(
    image('images/big-bang.jpg'),
    bigRightArrow(100),
    image('images/new-york-city.jpg'),
  _).center().margin(20)),
_));

prose(
  'The way we\'ll think about a generative model is as a probabilistic program,',
  'that is, a program that invokes a random number generator to make random choices.',
  'Concretely, executing the program will assigns values to a collection of random variables $X_1, \\dots, X_n$.',
  _,
  'We should think of this program as outputting the state of the world',
  '(or at least the part of the world that we care about for our task).',
_);

add(slide('Factor graph representation',
  parentCenter(markovModel({factorGraph: true})), pause(),
  parentCenter('$\\displaystyle \\Weight(x) = \\prod_{i=1}^n \\underbrace{p(x_i \\mid x_{i-1})}_\\text{potential}$'),
  pause(),
  stmt('Markov network'),
  parentCenter('$\\displaystyle \\P(X = x) = \\frac{\\Weight(x)}{Z}$'),
  pause(),
  parentCenter('(normalization constant $Z = 1$)'),
_));

prose(
  'Now let us understand Bayesian networks from the point of view of a factor graph, which will be later useful for inference.',
  _,
  'Treat each local conditional distribution $p(x_i \\mid x_{i-1})$ ($p(x_i \\mid x_{\\Parents(i)})$ in general)',
  'as a potential.',
  'The weight of an assignment is simply equal to the product of all the potentials.',
  _,
  'Note that we have exactly one local conditional distribution (and thus a potential) <b>for every variable</b>.',
  'The scope of that potential is the variable being generated and its parents.',
  _,
  'To get a Markov network, we usually normalize the weights by dividing by a normalization constant $Z$.',
  'In the case of a Bayesian network, the normalization constant $Z$ is already $1$:',
  'We saw earlier that the product over the local potentials yields a probability distribution,',
  'and the sum over probabilities of all assignments is $1$.',
  _,
  'Therefore, for Bayesian networks without conditioning on any variables, the normalization constant is $1$.',
  'When we condition on variables, this is no longer the case.',
_);

add(summarySlide('Generative models summary',
  stmt('Probabilistic program (convenient for <b>modeling</b>)'),
  parentCenter(objectTrackingGenerativeModel({pause:false}).scale(0.5)),
  pause(),
  stmt('Bayesian network'),
  parentCenter(markovModel({}).scale(0.8)),
  pause(),
  stmt('Factor graph (convenient for <b>inference</b>)'),
  parentCenter(markovModel({factorGraph: true}).scale(0.8)),
_));

prose(
  'In summary, we have three ways of thinking about generative models.',
  'From a modeling perspective, it is fun and convenient to think in terms of probabilistic programs.',
  'To understand the dependency structure, it is useful to draw a Bayesian network.',
  'But when we need to actually perform inference, it is most convenient to view the model',
  'as just a factor graph, as we\'ll see shortly.',
  _,
  'So why use a Bayesian network rather than a Markov network (factor graph)?',
  'After all, Markov networks provide more freedom: the potentials can be any function as long as it is non-negative.',
  'We have to do probabilistic inference (a pretty complicated process) in order to get marginal and conditional probabilities out of a Markov network.',
  _,
  'Bayesian networks are more <b>interpretable</b>: each local potential corresponds exactly to a local probability,',
  'which is specified by you, the modeler.',
  _,
  'As we\'ll see later, Bayesian networks also provide some computational benefits for both inference and learning.',
_);

add(slide('Modeling framework',
  importantBox(bluebold('Markov networks'),
    parentCenter('$\\displaystyle \\Weight(x) = \\prod_{j=1}^m \\red{f_j}(x)$'),
    pause(),
    parentCenter('$\\displaystyle \\P(X_1 = x_1, \\dots, X_n = x_n) \\propto \\Weight(x)$'),
  _),
  pause(),
  'Is there a more convenient way to construct a probability distribution?',
_));

prose(
  'Now, we will introduce another framework for writing down models, specifically, probability distributions.',
  'Technically, the models we will describe are all <b>Bayesian networks</b> (also known as directed graphical models),',
  'although the way we will introduce them will be much more general than what is normally thought of as Bayesian networks.',
  _,
  'Conceptually, the more accurate term is <b>generative model</b>, which more captures the spirit of what we\'re trying to do.',
_);

/*
variable('S', [0, 1])  // Is it sunny?
factor('fS', 'S', function(s) {
  return s ? 0.8 : 0.2;
})

variable('R', [0, 1])  // Is it raining?
factor('fR', 'S R', function(s, r) {
  if (s) return r ? 0.1 : 0.9;
  else   return r ? 0.5 : 0.5;
})

variable('G', [0, 1])  // Is there a game?
factor('fG', 'G', function(g) {
  return g ? 0.1 : 0.9;
})

variable('T', [0, 1])  // Is there traffic?
factor('fT', 'R G T', function(r, g, t) {
  if (r || g) return t ? 0.9 : 0.1;
  else        return t ? 0.1 : 0.9;
})

//condition('S', 0)
condition('T', 1)
query('G')

sumVariableElimination()
*/

/*
variable('C', [0, 1])  // Have cold?
factor('fC', 'C', function(c) {
  return c ? 0.1 : 0.9;
})

variable('A', [0, 1])  // Have allergy?
factor('fA', 'A', function(a) {
  return a ? 0.2 : 0.8;
})

variable('H', [0, 1])  // Coughing?
factor('fH', 'C A H', function(c, a, h) {
  if (c || a) return h ? 0.9 : 0.1;
  else        return h ? 0.1 : 0.9;
})

variable('I', [0, 1])  // Itchy eyes?
factor('fI', 'A I', function(a, i) {
  if (a) return i ? 0.9 : 0.1;
  else   return i ? 0.1 : 0.9;
})

//condition('S', 0)
condition('H', 1)
condition('I', 0)
query('C')

sumVariableElimination()
*/

add(slide('Comparison',
  parentCenter(xtable(
    simpleAlarmNetwork({factorGraph: true}),
    simpleAlarmNetwork({}),
  _).margin(100).yjustify('r')),
  parentCenter(table(
    [nil(), bold('Markov networks'), bold('Bayesian networks')],
    [bold('Nodes'), 'random variables', 'random variables'], pause(),
    [bold('Edges'), 'undirected', 'directed'], pause(),
    [bold('Potentials'), 'non-negative', 'conditional probabilities'],
  _).margin(20, 5)),
_));

