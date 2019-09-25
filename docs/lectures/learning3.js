G = sfig.serverSide ? global : this;
G.prez = presentation();

add(titleSlide('Lecture 4: Machine learning III',
  nil(),
  parentCenter(image('images/learning.png').width(300)),
_));

add(quizSlide('learning3-objectiveML',
  'What\'s the true objective of machine learning?',
  'minimize error on the training set',
  'minimize training error with regularization',
  'minimize error on unseen future examples',
  'learn about machines',
_));

prose(
  'So far in this class, we have tried to cast everything as a well-defined optimization problem.',
  'We have even written down an objective function, which is the average loss (error) on the training data.',
  _,
  'But it turns out that that\'s not really the true goal.',
  'That\'s only what we tell our optimization friends so that there\'s something concrete and actionable.',
  'The true goal is to minimize error on unseen future examples; in other words, we need to <b>generalize</b>.',
  'As we\'ll see, this is perhaps the most important aspect of machine learning and statistics &mdash; albeit a more elusive one.',
_);

function roadmap(i) {
  add(outlineSlide('Roadmap', i, [
    ['generalization', 'Generalization'],
    ['unsupervisedLearning', 'Unsupervised learning'],
    ['summary', 'Summary'],
  ]));
}

add(slide('Review',
  stmt('Feature extractor $\\phi(x)$'),
  parentCenter(featureExtractionExample()).scale(0.8),
  pause(),
  headerList('Prediction score',
    'Linear predictor: $\\text{score} = \\w \\cdot \\phi(x)$',
    'Neural network: $\\text{score} = \\sum_{j=1}^k w_j \\sigma(\\v_j \\cdot \\phi(x))$',
  _), 
_));

prose(
  'First a review: last lecture we spoke at length about the importance of features,',
  'how to organize them using feature templates, and how we can get interesting non-linearities by choosing the feature extractor $\\phi$ judiciously.',
  'This is you using all your domain knowledge about the problem.',
  _,
  'Given the feature extractor $\\phi$, we can use that to define a prediction score,',
  'either using a linear predictor or a neural network.',
  'If you use neural networks, you typically have to work less hard at designing features,',
  'but you end up with a harder learning problem.',
  'There is a human-machine tradeoff here.',
_);

add(slide('Review',
  stmt('Loss function $\\Loss(x, y, \\w)$'),
  /*parentCenter(table(
    [redbold('Regression'), redbold('Binary classification')],
    [lossGraph({pause: false, regression: true, squaredLoss: true, absLoss: true}).scale(0.8),
    lossGraph({pause: false, zeroOneLoss: true, hingeLoss: true, logisticLoss: true}).scale(0.8)],
  _).center().margin(80, 20)),*/
  parentCenter(xtable(lossGraph({pause: false, zeroOneLoss: true, hingeLoss: true}).scale(0.8), '(for binary classification)').center().margin(50)),
  pause(),
  stmt('Optimization algorithm: stochastic gradient descent'),
  parentCenter('$\\w \\leftarrow \\w - \\eta \\nabla_\\w \\Loss(x, y, \\w)$'),
_));

prose(
  'The prediction score is the basis of many types of prediction,',
  'including regression and binary classification.',
  'The loss function connects the prediction score with the correct output $y$,',
  'and measures how unhappy we are with a particular weight vector $\\w$.',
  _,
  'This leads to an optimization problem, that of finding the $\\w$ that yields the lowest training loss.',
  'We saw that a simple algorithm, stochastic gradient descent, works quite well.',
_);

////////////////////////////////////////////////////////////
// Generalization
roadmap(0);

add(slide('Training error',
  stmt('Loss minimization'),
  parentCenter('$\\displaystyle \\min_{\\w} \\TrainLoss(\\w)$'),
  pause(),
  parentCenter('$\\displaystyle \\TrainLoss(\\w) = \\frac1{|\\Train|} \\sum_{(x,y) \\in \\Train} \\Loss(x, y, \\w)$'),
  'Is this a good objective?',
_));

prose(
  'Now let\'s be a little more critical about what we\'ve set out to optimize.',
  'So far, we\'ve declared that we want to minimize the training loss.',
_);

add(slide('A strawman algorithm',
  algorithm('rote learning',
    stmt('Training: just store $\\Train$.'),
    pause(),
    stmt('Predictor $f(x)$'),
    indent('If $(x,y) \\in \\Train$: return $y$.'),
    pause(),
    indent('Else: '+redbold('segfault')+'.'),
  _),
  'Minimizes the objective perfectly (zero), but clearly bad...',
  /*pause(),
  'Gets zero training error!',
  pause(),
  'But clearly doesn\'t <b>generalize</b> to examples it hasn\'t seen...',*/
_).leftHeader(image('images/school-boy.jpg').width(150)));

prose(
  'Clearly, machine learning can\'t be about just minimizing the training loss.',
  'The rote learning algorithm does a perfect job of that, and yet is clearly a bad idea.',
  'It <b>overfits</b> to the training data and doesn\'t <b>generalize</b> to unseen examples.',
_);

add(slide('Overfitting pictures',
  parentCenter(table(
    [image('images/overfitting.jpg'), pause(),
    image('images/overfitting-regression.jpg')], pause(-1),
    ['Classification', pause(), 'Regression'],
  _).center().margin(100, 20)),
_));

prose(
  'Here are two pictures that illustrate what can go wrong if you only try to minimize the training loss for binary classification and regression.',
  _,
  'On the left, we see that the green decision boundary gets zero training loss by separating all the blue points from the red ones.',
  'However, the smoother and simpler black curve is intuitively more likely to be the better classifier.',
  _,
  'On the right, we see that the predictor that goes through all the points will get zero training loss,',
  'but intuitively, the black line is perhaps a better option.',
  _,
  'In both cases, what is happening is that by over-optimizing on the training set, we risk fitting <b>noise</b> in the data.',
_);

add(slide('Evaluation',
  parentCenter(xtable('$\\Train$', rightArrow(100).strokeWidth(5), frameBox('Learner'), rightArrow(100).strokeWidth(5), '$\\red{f}$').margin(10).center()),
  parentCenter('How good is the predictor $\\red{f}$?'),
  pause(),
  keyIdea('the real learning objective',
    'Our goal is to minimize <b>error on unseen future examples</b>.',
  _),
  pause(),
  'Don\'t have unseen examples; next best thing:',
  definition('test set',
    '<b>Test set</b> $\\Test$ contains examples not used for training.',
  _),
_));

prose(
  'So what is the true objective then?',
  'Taking a step back, what we\'re doing is building a system which happens to use machine learning, and then we\'re going to deploy it.',
  'What we really care about is how accurate that system is on those <b>unseen future</b> inputs.',
  _,
  'Of course, we can\'t access unseen future examples, so the next best thing is to create a <b>test set</b>.',
  'As much as possible, we should treat the test set as a pristine thing that\'s unseen and from the future.',
  'We definitely should not tune our predictor based on the test error,',
  'because we wouldn\'t be able to do that on future examples.',
  _,
  'Of course at some point we have to run our algorithm on the test set,',
  'but just be aware that each time this is done,',
  'the test set becomes less good of an indicator of how well you\'re actually doing.',
_);

add(slide('Overfitting example',
  example('overfitting',
    'Input: $x \\in \\{ -4, -3, -2, -1, 1, 2, 3, 4 \\}$',
    'Output: $y = \\sign(x)$, but 25% labels flipped',
  _),
  pause(),
  parentCenter(table(
    ['$x$', -4, -3, -2, -1, 1, 2, 3, 4],
    ['$y$ (train)', '-', red('+'), '-', '-', '+', '+', '+', red('-')],
    pause(2),
    ['$y$ (test)', red('+'), '-', '-', '-', '+', red('-'), '+', '+'],
    pause(-1),
    ['rote predictions', '-', red('+'), '-', '-', '+', '+', '+', red('-')],
    ['linear predictions', '-', '-', '-', '-', '+', '+', '+', '+'],
  _)).margin(30, 0),
  parentCenter(table(
    [nil(), darkblue('Train error'), pause(), darkblue('Test error'), nil()], pause(-1),
    ['Rote', '0%', pause(), red('50%'), red('&mdash; overfits!')], pause(-1),
    ['Linear', '25%', pause(), green('25%'), green('&mdash; generalizes!')],
  _).margin(20, 0)),
_));

prose(
  'To demonstrate overfitting in a simple setting, consider the problem of predicting whether a number $x$ is positive.',
  'The data we get is noisy, where 25% of the labels have been flipped randomly.',
  _,
  'If we use rote learning, we will get 0% training error, memorizing the labels.',
  'The linear classifier will get 25% error because it misclassifies the noisy examples.',
  _,
  'However, in the test set, the noise might come in different positions.',
  'Now, the rote predictor will get 50% error because it will misclassify on the inputs where there was noise',
  'in the training and in the test.',
  'In contrast, the linear classifier is stable and still has 25% error.',
  _,
  'Rote learning <b>overfits</b>.  The linear predictor <b>generalizes</b> better.',
_);

add(slide('Another strawman algorithm',
  algorithm('majority algorithm',
    stmt('Training: find most frequent output $\\red{y}$ in $\\Train$.'),
    stmt('Predictor $f(x)$: return $\\red{y}$.'),
  _),
  pause(),
  stmt('On the previous example'),
  parentCenter(table(
    ['$x$', -4, -3, -2, -1, 1, 2, 3, 4],
    ['$y_\\text{train}$', '-', red('+'), '-', '-', '+', '+', '+', red('-')],
  _)).margin(30, 0),
  parentCenter(table(
    [nil(), darkblue('Train error'), darkblue('Test error'), nil()],
    ['Rote', '0%', red('50%'), red('&mdash; overfits!')],
    ['Linear', '25%', green('25%'), green('&mdash; generalizes!')],
    ['Majority', pause(), '50%', brown('50%'), brown('&mdash; generalizes!*')],
  _).margin(20, 5)),
  parentRight(text('*though the error is high').scale(0.8)),
_).leftHeader(image('images/vote-hands.jpg').width(150)));

prose(
  'It\'s useful to look at another simple algorithm,',
  'which always returns the most frequent output no matter what the input is.',
  'Though this algorithm cannot fit the data very well (and thus gets high error rates),',
  'it <b>generalizes</b> very well.',
  _,
  'Note that strictly speaking, generalization doesn\'t necessarily mean that you\'re doing well at test time.',
  'It just means that your training error and your test error are not too different.',
_);

/*add(slide('Overfitting example 2',
  parentCenter(image('images/overfitting.jpg').width(250)),
  //pause(),
  //parentCenter(text('[demo: compare nearest neighbors and linear classifiers]').linkToUrl('index.html#include=learning-demo.js&example=noise')),
_));

prose(
  'You might argue that rote learning is obviously a bad idea.',
  'Here\'s a less contrived case of overfitting: comparing nearest neighbors and linear classification.',
  'In this demo, nearest neighbors gets zero training error but substantial test error,',
  'whereas linear classifiers gets some small error for both.',
  'So overfitting leads to worse results, especially when there\'s noise in our data.',
_);*/

add(slide('Generalization',
  //'How do we think about <b>generalization</b>?',
  'When will a learning algorithm <b>generalize</b> well?',
  parentCenter(xtable(
    frameBox('$\\Train$'), rightArrow(100).strokeWidth(5), frameBox('$\\Test$'),
  _).center().margin(30)),
_));

prose(
  'So far, we have an intuitive feel for what overfitting is.',
  'How do we make this precise?',
  'In particular, when does a learning algorithm generalize from the training set to the test set?',
_);

/*function roteMajority() {
  var rows = [];
  //rows.push(['Example', 'Rote $f$', 'Rote error', 'Majority $f$', 'Majority error'].map(bold));
  rows.push(['Training', 'Rote', 'Majority'].map(bold));
  Math.seedrandom(1);
  var X = 20;
  var threshold = 8;
  for (var i = 0; i < 8; i++) {
    var npos = 0;
    var nneg = 0;
    var sel = [];
    var train = [];
    for (var n = 0; n < 5; n++) {
      while (true) {
        var x = Math.floor(Math.random()*X);
        if (sel[x]) continue;
        sel[x] = true;
        train.push(x);
        if (x >= threshold) npos++;
        else nneg++;
        break;
      }
    }
    var target = wholeNumbers(X).map(function(x) { return x >= threshold; });
    var rote = wholeNumbers(X).map(function(x) { return sel[x] ? (x >= threshold ? 1 : 0) : '?' });
    var majority = wholeNumbers(X).map(function(x) { return npos >= nneg ? 1 : 0 });
    var roteError = sumOf(wholeNumbers(X).map(function(i) { return target[i] != rote[i] ? 1 : 0; })) / X;
    var majorityError = sumOf(wholeNumbers(X).map(function(i) { return target[i] != majority[i] ? 1 : 0; })) / X;
    //rows.push([train.join(','), rote.join(''), roteError, majority.join(''), majorityError]);
    rows.push([train.join(','), rote.join(''), majority.join('')]);
    if (i == 0) rows.push(pause());
  }
  return new Table(rows).margin(50, 0);
}

/*add(slide('A toy example',
  example('toy task',
    stmt('Input: $x \\in \\{ 0, 1, \\dots, 19 \\}$'),
    stmt('True output: $y = [x \\ge 8]$'),
    //stmt('Output: $y \\in \\{ 0, 1 \\}$'),
  _),
  pause(),
  parentCenter(roteMajority().scale(0.6)), pause(),
  stmt('Observation: rote has more <b>variance</b> than majority'), pause(),
  stmt('Reason: rote can return <b>more predictors</b> than majority'),
_));

prose(
  'Let\'s compare the rote learning algorithm and the majority algorithm side by side on a toy learning task.',
  'The task is to learn to classify numbers at least 8 as positive and less than 8 as negative.',
  _,
  'Each row represents a possible training set that we could have gotten.',
  'The predictors learned by rote learning and majority are shown.',
  _,
  'It\'s clear that the rote learning predictors are much more varied.',
  'One way to understand this is that rote learning could output one of $2^{20}$ predictors, whereas majority can output only $2$ predictors.',
  'So there is just a lot more wiggle room for rote learning.',
_);*/

function biasVariance() {
  return overlay(
    center(a = ellipse(350, 100).fillColor('brown').fillOpacity(0.2)),
    transform('All predictors').pivot(-1, -1).scale(0.8).shift(a.left(), a.top()),
    t = circle(5).fillColor('green').shiftBy(-300, 0),
    moveLeftOf('$\\green{f^*}$', t),
    pause(),
    e = ellipse(150, 60).strokeWidth(2).fillColor('blue').fillOpacity(0.3),
    moveRightOf(text(blue('Feature extraction')).scale(0.8), e),
    center('$\\blue{\\sF}$').shiftBy(-120, -50),
    pause(),
    b = circle(5).fillColor('orange').shift(e.left(), e.ymiddle()),
    moveBottomOf('$\\orange{g}$', b),
    pause(),
    c = circle(5).fillColor('brown').shiftBy(-10, 10),
    moveTopOf(text(brown('Learning')).scale(0.8), c),
    moveBottomOf('$\\brown{\\hat f}$', c),
    pause(),
    l1 = line(t, [e.left(), e.ymiddle()]).dashed(),
    moveCenterOf(opaquebg('approx. error').fillColor('brown').fillOpacity(0.2), l1).scale(0.8),
    pause(),
    l2 = line([e.left(), e.ymiddle()], c).dashed(),
    moveCenterOf(opaquebg('est. error').fillColor('blue').fillOpacity(0.3), l2).scale(0.8),
  _);
}

add(slide('Approximation and estimation error',
  parentCenter(biasVariance()),
  pause(-1),
  bulletedText(stmt('Approximation error: how good is the hypothesis class?')),
  pause(),
  bulletedText(stmt('Estimation Error: how good is the learned predictor <b>relative to</b> the hypothesis class?')),
  pause(),
  parentCenter(stagger(
    greenbold('$\\text{Err}(\\hat f) - \\text{Err}(f^*)$'),
    greenbold('$\\underbrace{\\text{Err}(\\hat f) - \\text{Err}(g)}_\\text{estimation} + \\underbrace{\\text{Err}(g) - \\text{Err}(f^*)}_\\text{approximation}$'),
  _).center()),
_));

prose(
  'Here\'s a cartoon that can help you understand the balance between fitting and generalization.',
  'Out there somewhere, there is a magical predictor $f^*$ that classifies everything perfectly.',
  'This predictor is unattainable; all we can hope to do is to use a combination of our domain knowledge',
  'and data to approximate that.  The question is: how far are we away from $f^*$?',
  _,
  'Recall that our learning framework consists of (i) choosing a hypothesis class $\\sF$ (by defining the feature extractor)',
  'and then (ii) choosing a particular predictor $\\hat f$ from $\\sF$.',
  _,
  '<b>Approximation error</b> is how far the entire hypothesis class is from the target predictor $f^*$.',
  'Larger hypothesis classes have lower approximation error.',
  'Let $g \\in \\sF$ be the best predictor in the hypothesis class in the sense of minimizing test error $g = \\arg\\min_{f \\in \\sF} \\text{Err}(f)$.',
  'Here, distance is just the differences in test error: $\\text{Err}(g) - \\text{Err}(f^*)$.',
  _,
  '<b>Estimation error</b> is how good the predictor $\\hat f$ returned by the learning algorithm is with respect to the best in the hypothesis class: $\\text{Err}(\\hat f) - \\text{Err}(g)$.',
  'Larger hypothesis classes have higher estimation error because it\'s harder to find a good predictor based on limited data.',
  _,
  'We\'d like both approximation and estimation errors to be small, but there\'s a tradeoff here.',
_);

G.trainTestGraph = function(opts) {
  var range = 3;
  var n = 50;
  var train = [];
  var test = [];
  var gen = [];
  for (var i = 0; i < n; i++) {
    var x = i/n * range;
    var trainy = Math.exp(-x) / 2;
    var testy = trainy + 0.051 * x*x;
    train.push({x: x, y: trainy});
    test.push({x: x, y: testy});
    gen.push({x: x, y: testy - trainy});
  }

  var graph = new sfig.LineGraph([train, /*gen,*/ test]);
  graph.trajectoryNames(['Training error', /*'Generalization (variance)',*/ 'Test error']);
  graph.axisLabel('hypothesis class size', 'error');
  graph.trajectoryColors(['blue', 'red', /*'purple'*/]);
  graph.legendPivot(+6, 0);
  graph.xrange(0, range).yrange(0, 0.6).roundPlaces(0, 1).tickIncrValue(1.2, 0.5).tickLabelScale(0.6);
  return graph;
}

add(slide('Effect of hypothesis class size',
  'As the hypothesis class size increases...',
  stmt('Approximation error decreases because'),
  pause(),
  parentCenter('taking min over larger set'),
  pause(),
  stmt('Estimation error increases because'),
  pause(),
  parentCenter('statistical learning theory'),
_));

prose(
  'The approximation error decreases monotonically as the hypothesis class size increases',
  'for a simple reason: you\'re taking a minimum over a larger set.',
  _,
  'The estimation error increases monotonically as the hypothesis class size increases',
  'for a deeper reason involving statistical learning theory (explained in CS229T).',
_);

add(slide('Estimation error analogy',
  parentCenter(image('images/wallet.jpg').width(150)),
  pause(),
  stmt('Scenario 1: ask few people around'),
  pause(),
  indent(xtable('Is your name Joe?', pause(), image('images/raise-hand.jpg').width(70)).margin(50).center()),
  pause(),
  stmt('Scenario 2: email all of Stanford'),
  pause(),
  indent(xtable('Is your name Joe?', pause(), image('images/raise-hands.jpg').width(150)).margin(50).center()),
  pause(),
  parentCenter(redbold('people = hypotheses, questions = examples')),
_));

prose(
  'Without formalizing it, we can understand the learning theory using the following analogy.',
  'Suppose you find a wallet on the ground, and you\'re trying to figure out who it belongs to.',
  '(Assume all people are honest in this example.)',
  _,
  'If your hypothesis is that it was just the people around you, you can go to each of them and ask',
  'a question to try to see if that is the person\'s wallet.',
  'If there are only a few people, then you could just ask a few basic questions (e.g., first name),',
  'and with high confidence if you find a match, then it\'s probably the right person.',
  _,
  'However, if you decide to email 10,000 people and ask the same basic questions,',
  'then you\'ll probably have a lot of matches and if you just choose one arbitraily,',
  'then chances are that you\'ve probably got the wrong person.',
  _,
  'In this analogy, the questions (examples) try to help you identify the correct person (hypothesis).',
  'To stretch this analogy a bit, stochastic gradient descent is like asking a person:',
  '"which direction do you think I should go to find the correct person?"',
_);

add(slide('Training and test error',
  parentCenter(trainTestGraph()),
  pause(),
  stmt('Underfitting: majority algorithm'), pause(),
  stmt('Overfitting: rote learning algorithm'), pause(),
  stmt('Fitting: reasonable learning algorithms'),
_).leftHeader(image('images/balance.jpg').width(150)));

prose(
  'Another way to visualize generalization is by looking at how the various errors vary as a function of',
  'the size of the hypothesis class (something we will define more precisely later).',
  _,
  'If the hypothesis class is too small (majority algorithm), then the training error will be large (corresponding to large approximation error).',
  _,
  'If the hypothesis class is too large (rote learning), then the approximation error is small, but the estimation error is large.',
  _,
  'The goldilocks hypothesis class is one where we balances both errors, resulting in a nice fit.',
_);

add(quizSlide('learning3-reduceOverfitting',
  'How can you reduce overfitting (select all that apply)?',
  'remove features',
  'simplify your features (replace $\\cos(x_1)$ with $x_1$)',
  'add $0.2 \\|\\mathbf{w}\\|^2$ to the objective function',
  'make sure $\\|\\mathbf{w}\\| \\le 1$',
  'run SGD for fewer iterations',
_));

prose(
  'Now we have seen some concrete examples of overfitting and seen that abstractly,',
  'overfitting stems from having too large of a hypothesis class.',
  'How do we control the size of the hypothesis class?',
  _,
  'As we will see, all of the options here are valid ways to guard against overfitting.',
_);

add(slide('Controlling size of hypothesis class',
  'Linear predictors are specified by weight vector $\\w \\in \\R^d$',
  pause(),
  stmt('Keeping the dimensionality $d$ small'),
  parentCenter(xtable(
    image('images/sphere.jpg').width(100),
    bigRightArrow(100),
    circle(40).fillColor('lightgray'),
  _).center().margin(50)),
  parentCenter('[whiteboard: linear and quadratic functions]'),
  pause(),
  stmt('Keeping the norm (length) $\\|\\w\\|$ small'),
  parentCenter(xtable(
    circle(40).fillColor('lightgray'),
    bigRightArrow(100),
    circle(10).fillColor('lightgray'),
  _).center().margin(50)),
  parentCenter('[whiteboard: $x \\mapsto w_1 x$]'),
_));

prose(
  'For each weight vector $\\w$, we have a predictor $f_\\w$',
  '(for classification, $f_\\w(x) = \\w \\cdot \\phi(x))$.',
  'So the hypothesis class $\\sF = \\{ f_\\w \\}$ is all the predictors as $\\w$ ranges.',
  'By controlling the number of possible values of $\\w$ that the learning algorithm is allowed to choose from,',
  'we control the size of the hypothesis class and thus guard against overfitting.',
  _,
  'There are two ways to do this: keeping the dimensionality $d$ small, and keeping the norm $\\|\\w\\|$ (length of $\\w$) small.',
_);

/*add(slide('Controlling size of hypothesis class',
  'Linear predictors are specified by weight vector $\\w \\in \\R^d$',
  parentCenter('$f_{\\red{\\w}}(x) = \\red{w_0} + \\red{w_1} x + \\red{w_2} x^2$'),
  parentCenter('[whiteboard: reduce dimensionality, norm]'),
_));

prose(
  'To balance bias and variance, we need to be able to adjust the size of our hypothesis class.',
  'For concreteness, think about linear predictors, in which the hypothesis class is specified by weight vectors $\\w \\in \\R^d$.',
  _,
  'There are two primary ways to do reduce (or increase) the size of these hypothesis classes:',
  'the first is by controlling the dimensionality $d$, and the second is by controlling the norm $\\|w\\|$.',
_);*/

/*add(slide('Constraining the norm',
  stmt('Constrained optimization'),
  parentCenter('$\\displaystyle \\min_{\\red{\\|\\w\\| \\le B}} \\TrainLoss(\\w)$'),
  pause(),
  algorithm('projected gradient descent',
    'Initialize $\\w = [0, \\dots, 0]$',
    'For $t = 1, \\dots, T$:',
    indent(nowrapText('$\\w \\leftarrow \\w - \\eta \\nabla_\\w \\TrainLoss(\\w)$')), pause(),
    indent(nowrapText('If $\\red{\\|\\w\\| > B}$: $\\red{\\w \\leftarrow \\w \\cdot \\frac{B}{\\|\\w\\|}}$')),
  _),
  'Same as gradient descent, except if $\\w$ leaves constraint set, put it back.',
_));

prose(
  'The second way to keep hypothesis classes small is to not let the weight vectors get too big.',
  'We can simply take our original loss minimization framework and add a constraint that the norm (also called length or magnitude) of $\\w$ isn\'t too big ($\\|\\w\\| \\le B$).',
  'This defines the optimization problem over weight vectors in a ball of radius $B$.',
  _,
  'The gradient descent algorithm we had before for unconstrained minimization can be adapted easily to handle the constraint:',
  'do gradient descent as usual, and if the weights ever leave the radius $B$ ball, then shrink the length so that we\'re back in the constraint set.',
_);*/

add(slide('Controlling the dimensionality',
  headerList('Manual feature (template) selection',
    'Add features if they help',
    'Remove features if they don\'t help',
  _),
  pause(),
  headerList('Automatic feature selection (beyond the scope of this class)',
    'Forward selection',
    'Boosting',
    '$L_1$ regularization',
  _),
_));

prose(
  'The most intuitive way to reduce overfitting is to reduce the number of features (or feature templates).',
  'Mathematically, you can think about removing a feature $\\phi(x)_{37}$',
  'as simply only allowing its corresponding weight to be zero ($w_{37} = 0$).',
  _,
  'Operationally, if you have a few feature templates, then it\'s probably easier to just manually',
  'include or exclude them &mdash; this will give you more intuition.',
  _,
  'If you have a lot of individual features, you can apply more automatic methods for selecting features,',
  'but these are beyond the scope of this class.',
_);

add(slide('Controlling the norm: regularization',
  stmt('Regularized objective'),
  parentCenter('$\\displaystyle \\min_{\\w} \\TrainLoss(\\w) + \\red{\\frac{\\lambda}{2} \\|\\w\\|^2}$'),
  pause(),
  algorithm('gradient descent',
    'Initialize $\\w = [0, \\dots, 0]$',
    'For $t = 1, \\dots, T$:', pause(),
    indent(nowrapText('$\\w \\leftarrow \\w - \\eta (\\nabla_\\w \\left[\\TrainLoss(\\w)\\right] \\red{+ \\lambda \\w})$')),
  _),
  'Same as gradient descent, except shrink the weights towards zero by $\\lambda$.',
  pause(),
  stmt('Note: SVM = hinge loss + regularization'),
_));

prose(
  'A related way to keep the weights small is called <b>regularization</b>, which involves',
  'adding an additional term to the objective function which',
  'penalizes the norm (length) of $\\w$.',
  'This is probably the most common way to control the norm.',
  _,
  'We can use gradient descent on this regularized objective,',
  'and this simply leads to an algorithm which subtracts a scaled down version of $\\w$ each iteration.',
  'This has the effect of keeping $\\w$ closer to the origin than it otherwise would be.',
_);

add(slide('Controlling the norm: early stopping',
  algorithm('gradient descent',
    'Initialize $\\w = [0, \\dots, 0]$',
    'For $t = 1, \\dots, \\red{T}$:', pause(),
    indent('$\\w \\leftarrow \\w - \\eta \\nabla_\\w \\TrainLoss(\\w)$'),
  _),
  pause(),
  stmt('Idea: simply make $T$ smaller'),
  pause(),
  stmt('Intuition: if have fewer updates, then $\\|\\w\\|$ can\'t get too big.'),
  pause(),
  stmt('Lesson: try to minimize the training error, but don\'t try too hard.'),
_));

prose(
  'A really cheap way to keep the weights small is to do <b>early stopping</b>.',
  'As we run more iterations of gradient descent, the objective function improves.',
  'If we cared about the objective function, this would always be a good thing.',
  'However, our true objective is not the training loss.',
  _,
  'Each time we update the weights, $\\w$ has the potential of getting larger, so by running gradient descent a fewer number of iterations,',
  'we are implicitly ensuring that $\\w$ stays small.',
  _,
  'Though early stopping seems hacky, there is actually some theory behind it.',
  'And one paradoxical note is that we can sometimes get better solutions by performing less computation.',
_);

/*add(summarySlide('Summary',
  bulletedText(stmt('Control dimensionality: remove features, prune nodes of decision trees, reduce number of hidden units')),
  pause(),
  bulletedText(stmt('Control norm: constrain $\\|\\w\\|$, penalize $\\|\\w\\|$, or just stop gradient descent early')),
  pause(),
  keyIdea('keep it simple',
    'Try to minimize training error, but keep the hypothesis class small.',
  _),
  pause(),
  stmt('Question: how small?'),
_));*/

add(slide('Summary so far',
  keyIdea('keep it simple',
    'Try to minimize training error, but keep the hypothesis class small.',
  _),
  parentCenter(image('images/simplicity.jpg')),
_));

prose(
  'We\'ve seen several ways to control the size of the hypothesis class',
  '(and thus reducing variance) based on either reducing the dimensionality or reducing the norm.',
  _,
  'It is important to note that what matters is the <b>size</b> of the hypothesis class, not how "complex" the predictors in the hypothesis class look.',
  'To put it another way, using complex features backed by 1000 lines of code doesn\'t hurt you if there are only 5 of them.',
  _,
  'Now the question is: how do we actually decide how big to make the hypothesis class, and in what ways (which features)?',
_);

add(slide('Hyperparameters',
  //stmt('Parameters', 'weights $\\w$ set by learning algorithm'),
  //pause(),
  definition('hyperparameters', 'Properties of the learning algorithm (features, regularization parameter $\\lambda$, number of iterations $T$, step size $\\eta$, etc.).'),
  'How do we choose hyperparameters?',
  pause(),
  staggerText(
    darkblue('Choose hyperparameters to minimize $\\Train$ error?'),
    '<b>No</b> - solution would be to include all features, set $\\lambda = 0$, $T \\to \\infty.$',
  _),
  pause(),
  staggerText(
    darkblue('Choose hyperparameters to minimize $\\Test$ error?'),
    '<b>No</b> - choosing based on $\\Test$ makes it an unreliable estimate of error!',
  _),
_));

/*add(slide('Evaluation of predictors',
  headerList(null,
    'Split examples into $\\Train$ and $\\Test$ either randomly or based on time if examples are time-stamped (training before test)', pause(),
    'Run learning algorithm on $\\Train$, report accuracy on $\\Test$ (provides estimate of accuracy on future examples).',
  _).ymargin(0),
  parentCenter(xtable(frameBox('$\\Train$').xpadding(50), frameBox('$\\Test$'))),
  pause(),
  overlay(
    a = headerList('Strategy',
      'Run learning algorithm, get predictor, measure $\\Test$ accuracy.',
      'Tweak learning algorithm and repeat.',
      pause(3),
      'Final evaluation: get new test set!',
      pause(-3),
    _).ymargin(0),
    pause(),
    line([a.left(), a.top()], [a.right(), a.bottom()]).strokeWidth(5).strokeColor('red').numLevels(2),
    line([a.right(), a.top()], [a.left(), a.bottom()]).strokeWidth(5).strokeColor('red').numLevels(2),
  _),
  pause(),
  stmt('Warning', 'looking at $\\Test$ makes it less reliable!'),
  //stmt('Iterative strategy is actually good, but just need to get new test set to really evaluate'),
_));*/

add(slide('Validation',
  stmt('Problem: can\'t use test set!'),
  pause(),
  stmt('Solution: randomly take out 10-50\% of training and use it instead of the test set to estimate test error.'),
  parentCenter(xtable(
    frameBox('$\\Train \\backslash \\Validation$').xpadding(160),
    frameBox('$\\Validation$').ypadding(12.5),
    xspace(50),
    frameBox('$\\Test$').ypadding(12.5),
  _)),
  pause(),
  definition('validation set',
    'A <b>validation (development) set</b> is taken out of the training data which acts as a surrogate for the <b>test set</b>.',
  _),
_));

prose(
  'However, if we make the hypothesis class too small, then the approximation error gets too big.',
  'In practice, how do we decide the appropriate size?',
  'Generally, our learning algorithm has multiple <b>hyperparameters</b> to set.',
  'These hyperparameters cannot be set by the learning algorithm on the training data because we would just choose a degenerate solution and overfit.',
  'On the other hand, we can\'t use the test set either because then we would spoil the test set.',
  _,
  'The solution is to invent something that looks like a test set.',
  'There\'s no other data lying around, so we\'ll have to steal it from the training set.',
  'The resulting set is called the <b>validation set</b>.',
  _,
  'With this validation set, now we can simply try out a bunch of different hyperparameters and choose the setting that yields the lowest error on the validation set.',
  'Which hyperparameter values should we try?  Generally, you should start by getting the right order of magnitude',
  '(e.g., $\\lambda = 0.0001, 0.001, 0.01, 0.1, 1, 10$) and then refining if necessary.',
_);

/*add(slide('Cross-validation',
  stmt('Problem: only one validation set (usually small) provides an unreliable estimate of test error.'),
  pause(),
  stmt('Solution: generate multiple validation sets.'),
  pause(),
  stmt('Partition training data $\\Train$ into $K$ folds'),
  parentCenter(xtable(
    frameBox('$\\Train^{(1)}$'),
    frameBox('$\\Train^{(2)}$'),
    frameBox('$\\Train^{(3)}$'),
    frameBox('$\\Train^{(4)}$'),
    frameBox('$\\Train^{(5)}$'),
  _)),
  pause(),
  'Use each fold $k = 1, \\dots, K$ as the validation set.',
  'Average the $K$ validation error rates.',
_));*/

add(slide('Development cycle',
  problem('simplified named-entity recognition',
    'Input: a string $x$ (e.g., '+greenitalics('President [Barack Obama] in')+')',
    'Output: $y$, whether $x$ contains a person or not (e.g., $+1$)',
  _),
  pause(),
  algorithm('recipe for success',
    bulletedText([null,
      'Split data into train, dev, test',
      'Look at data to get intuition',
      ['Repeat:',
        'Implement feature / tune hyperparameters',
        'Run learning algorithm',
        'Sanity check train and dev error rates, weights',
        'Look at errors to brainstorm improvements',
      ],
      'Run on test set to get final error rates',
    ]),
  _).scale(0.8),
  parentCenter(linkToVideo('[semi-live solution]', 'trainTestEval.mp4')),
_));

prose(
  'This slide represents the most important yet most overlooked part machine learning: how do actually apply it in practice.',
  _,
  'We have so far talked about the mathematical foundation of machine learning (loss functions and optimization),',
  'and discussed some of the conceptual issues surrounding overfitting, generalization, size of hypothesis classes.',
  'But what actually spend most of your time doing is not writing new algorithms, but going through a <b>development cycle</b>,',
  'where you iteratively improve your system.',
  _,
  'Suppose you\'re given a binary classification task (backed by a dataset).',
  'What is the process by which you get to a working system?',
  'There are many ways to do this; here is one that I\'ve found to be effective',
  _,
  'The key is to stay connected with the data and the model, and have intuition about what\'s going on.',
  'Make sure to empirically examine the data before proceeding to the actual machine learning.',
  'It is imperative to understand the nature of your data in order to understand the nature of your problem.',
  '(You might even find that your problem admits a simple, clean solution sans machine learning.)',
  'Understanding trained models can be hard sometimes, as machine learning algorithms (even linear classifiers) are often not the easiest',
  'things to understand when you have thousands of parameters.',
  _,
  'First, maintain data hygiene.  Hold out a test set from your data that you don\'t look at until you\'re done.',
  'Start by looking at the data to get intuition.  You can start to brainstorm what features / predictors you will need.',
  'You can compute some basic statistics.',
  _,
  'Then you enter a loop: implement a new feature.',
  'There are three things to look at: error rates, weights, and predictions.',
  'First, sanity check the error rates and weights to make sure you don\'t have an obvious bug.',
  'Then do an <b>error analysis</b> to see which examples your predictor is actually getting wrong.',
  'The art of practical machine learning is turning these observations into new features.',
  _,
  'Finally, run your system once on the test set and report the number you get.',
  'If your test error is much higher than your development error, then you probably',
  'did too much tweaking and were <b>overfitting</b> (at a meta-level) the development set.',
_);

/*add(summarySlide('Summary',
  bulletedText(stmt('Key to good machine learning: balance bias and variance')),
  bulletedText('Control tradeoff using size of hypothesis class'),
  pause(),
  bulletedText(stmt('Test set: only for final evaluation')),
  bulletedText('Use validation set to tune hyperparameters'),
  bulletedText('Look at the data!'),
_));*/

////////////////////////////////////////////////////////////
// Unsupervised learning
roadmap(1);

add(slide('Supervision?',
  headerList('Supervised learning',
    'Prediction: $\\Train$ contains input-output pairs $(x,y)$', pause(),
    //'Bayesian networks: $\\Train$ contains full variable assignments', pause(),
    'Fully-labeled data is very <b><font color="red">expensive</font></b> to obtain (we can get 10,000 labeled examples)',
  _),
  pause(),
  headerList('Unsupervised learning',
    'Clustering: $\\Train$ only contains inputs $x$', pause(),
    //'Bayesian networks: $\\Train$ contains partial variable assignments', pause(),
    'Unlabeled data is much <b><font color="green">cheaper</font></b> to obtain (we can get 100 million unlabeled examples)',
  _),
_));

prose(
  'We have so far covered the basics of <b>supervised learning</b>.',
  'If you get a labeled training set of $(x,y)$ pairs, then you can train a predictor.',
  'However, where do these examples $(x,y)$ come from?',
  'If you\'re doing image classification, someone has to sit down and label each image, and generally this tends to be expensive enough that we can\'t get that many examples.',
  _,
  'On the other hand, there are tons of <b>unlabeled examples</b> sitting around (e.g., Flickr for photos, Wikipedia, news articles for text documents).',
  'The main question is whether we can harness all that unlabeled data to help us make better predictions?',
  'This is the goal of <b>unsupervised learning</b>.',
_);

/*add(slide('Latent variables',
  stmt('Clustering news articles', 'have raw collection of news articles, but topic/category of each is <font color="red"><b>latent</b></font>'),
  //parentCenter(cachedImage('http://www.materials.ox.ac.uk/uploads/images/news/newspaper.gif').dim(400, 300)),
  parentCenter(cachedImage('http://jonathanshkurko.files.wordpress.com/2011/04/googlenews.jpg').dim(400, 300)),
_));

add(slide('Latent variables',
  stmt('Machine translation', 'know what the translation was, but not how it was obtained (detailed correspondence is <font color="red"><b>latent</b></font>)'),
  parentCenter(yseq(
    '$x$: the blue house'.italics().fontcolor('blue'),
    downArrow(50).strokeWidth(3),
    '$y$: la maison bleue'.italics().fontcolor('green'),
  _).center()),
_));

add(slide('Latent variables',
  stmt('Object recognition', 'know what\'s in the image but not where thing are (location is <font color="red"><b>latent</b></font>)'),
  parentCenter(cachedImage('http://nextwelve.files.wordpress.com/2012/04/tree.jpg').dim(400, 300)),
  parentCenter(xtable.apply(null, 'tree grass clouds sunset'.split(' ')).margin(40).strokeColor('blue')),
_));*/

function formatClusters(clusters) {
  var i = 0;
  return parentCenter(ytable.apply(null, clusters.map(function(x) {
    i++;
    return nowrapText(stmt('Cluster '+i, x));
  })).scale(0.55).margin(2));
}

add(slide('Word clustering using HMMs',
  stmt('Input', 'raw text (100 million words of news articles)...'),
  pause(),
  stmt('Output'),
  formatClusters([
    "Friday Monday Thursday Wednesday Tuesday Saturday Sunday weekends Sundays Saturdays",
    "June March July April January December October November September August",
    //"people guys folks fellows CEOs chaps doubters commies unfortunates blokes",
    //"down backwards ashore sideways southward northward overboard aloft downwards adrift",
    "water gas coal liquid acid sand carbon steam shale iron",
    "great big vast sudden mere sheer gigantic lifelong scant colossal",
    "man woman boy girl lawyer doctor guy farmer teacher citizen",
    "American Indian European Japanese German African Catholic Israeli Italian Arab",
    "pressure temperature permeability density porosity stress velocity viscosity gravity tension",
    "mother wife father son husband brother daughter sister boss uncle",
    "machine device controller processor CPU printer spindle subsystem compiler plotter",
    "John George James Bob Robert Paul William Jim David Mike",
    "anyone someone anybody somebody",
    "feet miles pounds degrees inches barrels tons acres meters bytes",
    "director chief professor commissioner commander treasurer founder superintendent dean custodian",
    //"liberal conservative parliamentary royal progressive Tory provisional separatist federalist PQ",
    "had hadn't hath would've could've should've must've might've",
    //"asking telling wondering instructing informing kidding reminding bothering thanking deposing",
    "head body hands eyes voice arm seat eye hair mouth",
  ]),
  pause(),
  stmt('Impact', 'used in many state-of-the-art NLP systems'),
_).leftHeader('[Brown et al, 1992]'));

prose(
  'Empirically, unsupervised learning has produced some pretty impressive results.',
  'HMMs (more specifically, Brown clustering) can be used to take a ton of raw text and cluster related words together.',
  'Word vectors (e.g., word2vec) do something similar.',
_);

add(slide('Feature learning using neural networks',
  stmt('Input', '10 million images (sampled frames from YouTube)'), pause(),
  stmt('Output'),
  parentCenter(xtable(
    image('images/faces.jpeg').dim(230), pause(),
    //image('images/body.jpeg').dim(230), pause(),
    image('images/cats.jpeg').dim(230),
  _).margin(50)),
  pause(),
  stmt('Impact', 'state-of-the-art results on object recognition (22,000 categories)'),
_).leftHeader('[Le et al, 2012]'));

prose(
  'An unsupervised variant of neural networks called autoencoders can be used to take a ton of raw images and output clusters of images.',
  'No one told the learning algorithms explicitly what the clusters should look like &mdash; they just figured it out.',
_);

add(dividerSlide(
  keyIdea('unsupervised learning',
    'Data has lots of rich <font color="red"><b>latent</b></font> structures; want methods to discover this <font color="green"><b>structure</b></font> automatically.',
  _),
_));

prose(
  'Unsupervised learning in some sense is the holy grail: you don\'t have to tell the machine anything &mdash; it just "figures it out."',
  'However, one must not be overly optimistic here: there is no free lunch.',
  'You ultimately still have to tell the algorithm something,',
  'at least in the way you define the features or set up the optimization problem.',
_);

function typeExample(heading, content) {
  return ytable(text(stmt(heading)), content).center();
}

add(slide('Types of unsupervised learning',
  parentCenter(ytable(
    typeExample('Clustering (e.g., K-means)', image('images/k-means.png').width(200)),
    typeExample('Dimensionality reduction (e.g., PCA)', image('images/pca.png').width(300)),
    /*[
    typeExample('Latent-variable models (e.g., HMMs)', hmm({maxTime: 5}).scale(0.5)),
    pause(),
    typeExample('Feature learning (e.g., neural networks)', cachedImage('http://www.optimaltrader.net/images/neuralt_naetverk.png').dim(200)),
  ]*/_).margin(30).xjustify('c')),
_));

prose(
  'There are many forms of unsupervised learning, corresponding to different types of latent structures you want to pull out of your data.',
  'In this class, we will focus on one of them: clustering.',
_);

add(slide('Clustering',
  definition('clustering',
    stmt('Input: training set of input points'),
    parentCenter('$\\Train = \\{ x_1, \\dots, x_n \\}$'),
    pause(),
    stmt('Output: assignment of each point to a cluster'),
    parentCenter('$\\red{[z_1, \\dots, z_n]}$ where $z_i \\in \\{ 1, \\dots, K \\}$'),
  _),
  pause(),
  stmt('Intuition', 'Want similar points to be put in same cluster, dissimilar points to put in different clusters'),
  parentCenter('[whiteboard]'),
  //parentCenter(text('[demo]').linkToUrl('index.html#include=learning-demo.js&example=cluster')),
_));

prose(
  'The task of clustering is to take a set of points as input and return a partitioning of the points into $K$ clusters.',
  'We will represent the partitioning using an <b>assignment vector</b> $z = [z_1, \\dots, z_n]$.',
  'For each $i$, $z_i \\in \\{1,\\dots,K\\}$ specifies which of the $K$ clusters point $i$ is assigned to.',
_);

add(slide('K-means objective',
  headerList('Setup',
    'Each cluster $k = 1, \\dots, K$ is represented by a <b>centroid</b> $\\mu_k \\in \\R^d$', pause(),
    stmt('Intuition', 'want each point $\\blue{\\phi(x_i)}$ close to its assigned centroid $\\red{\\mu_{z_i}}$'),
  _),
  pause(),
  /*headerList('Variables',
    'Cluster assignments $z = (z_1, \\dots, z_n)$',
    'Cluster centers $\\mu = (\\mu_1, \\dots, \\mu_K)$',
  _).ymargin(0),
  pause(),
  */
  stmt('Objective function'),
  parentCenter(frameBox(nowrapText('$\\displaystyle \\ReconstructionLoss(z, \\mu) = \\sum_{i=1}^n \\|\\blue{\\phi(x_i)} - \\red{\\mu_{z_i}}\\|^2$'))),
  pause(),
  'Need to choose centroids $\\mu$ and assignments $z$ <b>jointly</b>',
_));

prose(
  '<b>K-means</b> is a particular method for performing clustering which is based on associating each cluster with a <b>centroid</b> $\\mu_k$ for $k = 1, \\dots, K$.',
  'The intuition is to assign the points to clusters <b>and</b> place the centroid for each cluster so that each point $\\phi(x_i)$ is close to its assigned centroid $\\mu_{z_i}$.',
_);

add(slide('K-means: simple example',
  example('one-dimensional',
    'Input: $\\Train = \\{ 0, 2, 10, 12 \\}$',
    'Output: $K=2$ centroids $\\mu_1, \\mu_2 \\in \\R$',
  _),
  pause(),
  //stmt('Approach: break up the problem into subproblems'),
  stmt('If know centroids $\\mu_1 = 1$, $\\mu_2 = 11$'),
  indent(ytable(
    '$z_1 = \\arg\\min \\{ (0 - 1)^2, (0 - 11)^2 \\} = 1$',
    '$z_2 = \\arg\\min \\{ (2 - 1)^2, (2 - 11)^2 \\} = 1$',
    '$z_3 = \\arg\\min \\{ (10 - 1)^2, (10 - 11)^2 \\} = 2$',
    '$z_4 = \\arg\\min \\{ (12 - 1)^2, (12 - 11)^2 \\} = 2$',
  _)).scale(0.7),
  pause(),
  stmt('If know assignments $z_1 = z_2 = 1$, $z_3 = z_4 = 2$'),
  indent(ytable(
    '$\\mu_1 = \\arg\\min_{\\mu} (0 - \\mu)^2 + (2 - \\mu)^2 = 1$',
    '$\\mu_2 = \\arg\\min_{\\mu} (10 - \\mu)^2 + (12 - \\mu)^2 = 11$',
  _)).scale(0.7),
_));

prose(
  'How do we solve this optimization problem?',
  'We can\'t quite just use gradient descent because there are discrete variables (assignment variables $z_i$).',
  'We can\'t really use dynamic programming because there are continuous variables (the centroids $\\mu_k$).',
  _,
  'To motivate the solution, consider a simple example with four points.',
  'As always, let\'s try to break up the problem into subproblems.',
  _,
  'What if we knew the optimal centroids?  Then computing the assignment vectors is trivial (for each point, choose the closest center).',
  _,
  'What if we knew the optimal assignments?  Then computing the centroids is also trivial (one can check that this is just averaging the points assigned to that center).',
  _,
  'The only problem is that we don\'t know the optimal centroids or assignments,',
  'and unlike in dynamic programming, the two depend on one another cyclically.',
_);

add(slide('K-means algorithm',
  parentCenter('$\\displaystyle \\min_z \\min_{\\mu} \\ReconstructionLoss(z, \\mu)$'),
  parentCenter(image('images/chicken-egg.jpg').width(200)),
  pause(),
  keyIdea('alternating minimization',
    'Tackle <font color="red">hard</font> problem by solving <font color="green">two</font> easy problems.',
  _),
  /*headerList(null,
    'Step 1: if know centroids $\\mu$, can find best assignments $z$',
    'Step 2: if know assignments $z$, can find best centroids $\\mu$',
  _),*/
_));

prose(
  'And now the leap of faith is this: start with an arbitrary setting of the centroids (not optimal).',
  'Then alternate between choosing the best assignments given the centroids, and choosing the best centroids given the assignments.',
  'This is the K-means algorithm.',
_);

add(slide('K-means algorithm (Step 1)',
  stmt('Goal', 'given centroids $\\green{\\mu_1, \\dots, \\mu_K}$, assign each point to the best centroid.'),
  algorithm('Step 1 of K-means',
    'For each point $i = 1, \\dots, n$:',
    indent('Assign $i$ to cluster with closest centroid:'), pause(),
    indent(nowrapText('$\\displaystyle \\red{z_i} \\leftarrow \\arg\\min_{k = 1, \\dots, K} \\|\\phi(x_i) - \\green{\\mu_k}\\|^2$.'), 40),
  _),
_));

prose(
  '<b>Step 1</b> of K-means fixes the centroids.',
  'Then we can optimize the K-means objective with respect to $z$ alone quite easily.',
  'It is easy to show that the best label for $z_i$ is the cluster $k$ that minimizes the distance to the centroid $\\mu_k$ (which is fixed).',
_);

add(slide('K-means algorithm (Step 2)',
  stmt('Goal', 'given cluster assignments $\\green{z_1, \\dots, z_n}$, find the best centroids $\\red{\\mu_1, \\dots, \\mu_K}$.'),
  algorithm('Step 2 of K-means',
    'For each cluster $k = 1, \\dots, K$:',
    indent('Set $\\mu_k$ to average of points assigned to cluster $k$:'), pause(),
    indent(nowrapText('$\\displaystyle \\mu_k \\leftarrow \\frac{1}{|\\{i : z_i = k\\}|} \\sum_{i : z_i = k} \\phi(x_i)$'), 40),
  _),
_));

prose(
  'Now, turning things around, let\'s suppose we knew what the assignments $z$ were.',
  'We can again look at the K-means objective function and try to optimize it with respect to the centroids $\\mu$.',
  'The best $\\mu_k$ is to place the centroid at the average of all the points assigned to cluster $k$; this is <b>step two</b>.',
_);

add(slide('K-means algorithm',
  stmt('Objective'),
  parentCenter('$\\displaystyle \\min_z \\min_{\\mu} \\ReconstructionLoss(z, \\mu)$'),
  algorithm('K-means',
    'Initialize $\\mu_1, \\dots, \\mu_K$ randomly.', pause(),
    'For $t = 1, \\dots, T$:',
    indent('Step 1: set assignments $z$ given $\\mu$'), pause(),
    indent('Step 2: set centroids $\\mu$ given $z$'),
  _),
  pause(),
  parentCenter(text('[demo]').linkToUrl('index.html#include=learning-demo.js&example=cluster')),
_));

prose(
  'Now we have the two ingredients to state the full K-means algorithm.',
  'We start by initializing all the centroids randomly.',
  'Then, we iteratively alternate back and forth between steps 1 and 2, optimizing $z$ given $\\mu$ and vice-versa.',
_);

add(slide('K-means: simple example',
  example('one-dimensional',
    'Input: $\\Train = \\{ 0, 2, 10, 12 \\}$',
    'Output: $K=2$ centroids $\\mu_1, \\mu_2 \\in \\R$',
  _),
  pause(),
  stmt('Initialization (random): $\\mu_1 = 0, \\mu_2 = 2$'),
  headerList('Iteration 1',
    stmt('Step 1: $z_1 = 1, z_2 = 2, z_3 = 2, z_4 = 2$'), pause(),
    stmt('Step 2: $\\mu_1 = 0, \\mu_2 = 8$'), pause(),
  _),
  headerList('Iteration 2',
    stmt('Step 1: $z_1 = 1, z_2 = 1, z_3 = 2, z_4 = 2$'), pause(),
    stmt('Step 2: $\\mu_1 = 1, \\mu_2 = 11$'),
  _),
_));

prose(
  'Here is an example of an execution of K-means where we converged to the correct answer.',
_);

add(slide('Local minima',
  'K-means is guaranteed to converge to a local minimum, but is not guaranteed to find the global minimum.',
  parentCenter(image('images/local-minima.jpg')),
  // K=2, rand=1,2,3: 117.03
  // K=2, rand=4: 127.58
  // K=2, rand=5,8: 139.6
  parentCenter(text('[demo: getting stuck in local optima, seed = 100]').linkToUrl('index.html#include=learning-demo.js&example=cluster')),
  pause(),
  headerList('Solutions',
    'Run multiple times from different random initializations', pause(),
    'Initialize with a heuristic (K-means++)',
  _),
  parentCenter(linkToVideo('[semi-live solution]', 'Kmeans.mp4')),
_));

prose(
  'K-means is guaranteed to decrease the loss function each iteration and will converge to a local minimum,',
  'but it is not guaranteed to find the global minimum, so one must exercise caution when applying K-means.',
  _,
  'One solution is to simply run K-means several times from multiple random initializations and then choose the solution that has the lowest loss.',
  _,
  'Or we could try to be smarter in how we initialize K-means.',
  'K-means++ is an initialization scheme which places centroids on training points so that these centroids tend to be distant from one another.',
  //'which starts by placing the first centroid at a random training point.',
  //'Then for the second center, we compute for each training point the distance to the closest centroid placed so far, and choose the point ',
_);

/*add(slide('Using the clusters',
  stmt('Goal: create better <b>features</b> $\\red{\\Phi(x)}$ for supervised learning'),
  pause(),
  stmt('Intuition: $k$-th feature &mdash; similarity between $\\mu_k$ and $\\phi(x)$'),
  let(s = 30),
  parentCenter(overlay(
    p = circle(5).fillColor('black').shiftBy(0, 0),
    mu1 = center(square(10)).fillColor('red').shiftBy(0, 2*s),
    mu2 = center(square(10)).fillColor('red').shiftBy(-2*s, 0),
    mu3 = center(square(10)).fillColor('red').shiftBy(3*s, 0),
    mu4 = center(square(10)).fillColor('red').shiftBy(0, -1*s),
    line(p, mu1).dashed(),
    line(p, mu2).dashed(),
    line(p, mu3).dashed(),
    line(p, mu4).dashed(),
    moveBottomOf('$\\mu_1$', mu1).scale(0.8),
    moveLeftOf('$\\mu_2$', mu2).scale(0.8),
    moveRightOf('$\\mu_3$', mu3).scale(0.8),
    moveTopOf('$\\mu_4$', mu4).scale(0.8),
    center('$\\phi(x)$').scale(0.8).shiftBy(s, s/2),
  _)),
  pause(),
  'Distance to centroid: $d_k = \\|\\phi(x) - \\mu_k\\|$', pause(),
  'Average distance: $\\bar d = \\frac1K \\sum_{k=1}^K d_k$', pause(),
  parentCenter(
    '$\\red{\\Phi_k(x)} = \\max\\{ \\bar d - d_k, 0 \\}$',
  _),
_));

function clustersHelp() {
  var items = [];
  var s = 200;
  var mus = [[0.7*s, 0.2*s], [0.3*s, 0.6*s]];
  Math.seedrandom(7);
  var projItems = [];
  for (var k = 0; k < mus.length; k++) {
    var mu = mus[k];
    items.push(center(square(10)).fillColor('red').shift(mu[0], up(mu[1])).showLevel(2));
    for (var i = 0; i < 30; i++) {
      var x = mu[0] + sampleGaussian() * s/8;
      var y = mu[1] + sampleGaussian() * s/8;
      var d0 = l2Dist(mus[0], [x, y]);
      var d1 = l2Dist(mus[1], [x, y]);
      var avgd = (d0 + d1) / 2;
      var act0 = Math.max(0, avgd - d0);
      var act1 = Math.max(0, avgd - d1);
      projItems.push(circle(3).fillColor('blue').shift(act0, up(act1)));
      var p = circle(3).fillColor('black').shift(x, up(y));
      if (i > 0) p.showLevel(1);
      items.push(p);
    }
  }

  items.push(arrow([0, 0], [s, 0]).strokeWidth(2));
  items.push(arrow([0, 0], [0, up(s)]).strokeWidth(2));

  projItems.push(arrow([0, 0], [s, 0]).strokeWidth(2));
  projItems.push(arrow([0, 0], [0, up(s)]).strokeWidth(2));

  return table(
    [new Overlay(items), showLevel(3), bigRightArrow(100), new Overlay(projItems)],
    [showLevel(0), '$\\phi(x)$', nil(), showLevel(3), '$\\Phi(x)$'],
  _).center().margin(20, 30);
}
 
add(slide('Cluster-based features',
  parentCenter(clustersHelp()),
  pause(),
  stmt('Assumption: points inside same cluster tend to have same output label'),
_));

prose(
  'Having performed clustering on our large amount of unlabeled data,',
  'let\'s see how it can help us perform better classification.',
  'The key idea will be to use the centroids to define new features.',
  _,
  'We will define a new feature vector $\\Phi(x) = (\\Phi_1(x), \\dots, \\Phi_K(x))$',
  'where the value of feature $k$ represents the proximity of $\\Phi(x)$ to the centroid $\\mu_k$.',
  'Specifically, $\\Phi_k(x)$ will be the amount to which the distance from $\\phi(x)$ to centroid $k$ is less than the average distance between $\\phi(x)$ and a centroid.',
  _,
  'Why is this a reasonable thing to do?',
  'The underlying assumption is that points inside the same cluster tend to have the same output label,',
  'so by mapping the points to that output label, we are transforming the data points into $\\Phi(x)$, which is in a way is much cleaner than $\\phi(x)$.',
_);*/

add(summarySlide('Unsupervised learning summary',
  bulletedText('Leverage tons of unlabeled data'),
  pause(),
  bulletedText(stmt('Difficult optimization')),
  parentCenter(xtable(
    'latent variables $z$', 
    image('images/chicken-egg.jpg').width(200),
    'parameters $\\mu$',
  _).center().margin(20)),
  //pause(),
  //bulletedText('Using as features in supervised learning improves accuracy!'),
_));

////////////////////////////////////////////////////////////
// Conclusion
roadmap(2);

/*add(slide('Fancier prediction tasks',
  parentCenter(xtable('$x$', rightArrow(100).strokeWidth(5), frameBox('$f_\\w$'), rightArrow(100).strokeWidth(5), '$y$').margin(10).center()),
  stmt('So far: $y \\in \\{-1, +1\\}$ (binary classification) or $y \\in \\R$ (regression) &mdash; reflex-based models'),
  pause(),
  stmt('Structured prediction: $y$ is a sequence, tree, etc. &mdash; more complex models'),
  pause(),
  stmt('Same strategy: write down a loss function, take the derivative, and run stochastic gradient descent!'),
_));*/

add(summarySlide('Summary',
	bulletedText('Feature extraction (think hypothesis classes) [modeling]'),
	bulletedText('Prediction (linear, neural network, k-means) [modeling]'),
	bulletedText('Loss functions (compute gradients) [modeling]'),
	bulletedText('Optimization (stochastic gradient, alternating minimization) [algorithms]'),
	bulletedText('Generalization (think development cycle) [modeling]'),
_));

prose(
  'This concludes our tour of the foundations of machine learning, although machine learning will come up again later in the course.',
  'You should have gotten more than just a few isolated equations and algorithms.',
  'It is really important to think about the overarching principles in a modular way.',
  _,
  'First, feature extraction is where you put your domain knowledge into.',
  'In designing features, it\'s useful to think in terms of the induced <b>hypothesis classes</b> &mdash; what kind of functions can your learning algorithm potentially learn?',
  _,
  'These features then drive <b>prediction</b>: either linearly or through a neural network.',
  'We can even think of k-means as trying to predict the data points using the centroids.',
  _,
  '<b>Loss functions</b> connect predictions with the actual training examples.',
  _,
  'Note that all of the design decisions up to this point are about modeling.',
  'Algorithms are very important, but only come in once we have the right <b>optimization problem</b> to solve.',
  _,
  'Finally, machine learning requires a leap of faith.',
  'How does optimizing anything at training time help you <b>generalize</b> to new unseen examples at test time?',
  'Learning can only work when there\'s a common core that cuts past all the idiosyncrasies of the examples.',
  'This is exactly what features are meant to capture.',
_);

add(slide('A brief history',
  '1795: Gauss proposed least squares (astronomy)',
  '1940s: logistic regression (statistics)',
  pause(),
  '1952: Arthur Samuel built program that learned to play checkers (AI)',
  '1957: Rosenblatt invented Perceptron algorithm (like SGD)',
  '1969: Minsky and Papert "killed" machine learning',
  pause(),
  '1980s: neural networks (backpropagation, from 1960s)',
  '1990: interface with optimization/statistics, SVMs',
  '2000s-: structured prediction, revival of neural networks, etc.',
_));

prose(
  'Many of the ideas surrounding fitting functions was known in other fields long before computers, let alone AI.',
  _,
  'When computers arrived on the scene, learning was definitely on people\'s radar,',
  'although this was detached from the theoretical statistical and optimization foundations.',
  _,
  'In 1969, Minsky and Papert wrote a famous paper <i>Perceptrons</i>, which showed the limitations of linear classifiers',
  'with the famous XOR example (similar to our car collision example), which killed off this type of research.',
  'AI largely turned to rule-based and symbolic methods.',
  _,
  'Since the 1980s, machine learning has increased its role in AI,',
  'been placed on a more solid mathematical foundation with its connection with optimization and statistics.',
  _,
  'While there is a lot of optimism today about the potential of machine learning,',
  'there are still a lot of unsolved problems.',
_);

add(slide('Challenges',
  stmt('Capabilities'),
  bulletedText('More complex prediction problems (translation, generation)'),
  bulletedText('Unsupervised learning: automatically discover structure'),
  pause(),
  stmt('Responsibilities'),
  bulletedText('Feedback loops: predictions affect user behavior, which generates data'),
  bulletedText('Fairness: build classifiers that don\'t discriminate?'),
  bulletedText('Privacy: can we pool data together'),
  bulletedText('Interpretability: can we understand what algorithms are doing?'),
_));

prose(
  'Going ahead, one major thrust is to improve the capabilities of machine learning.',
  'Broadly construed, machine learning is about learning predictors from some input to some output.',
  'The simplest case is when the output is just a label, but increasingly,',
  'researchers have been using the same machine learning tools for doing translation (output is a sentence),',
  'speech synthesis (output is a waveform), and image generation (output is an image).',
  _,
  'Another important direction is being able to leverage the large amounts of unlabeled data to learn good representations.',
  'Can we automatically discover the underlying structure (e.g., a 3D model of the world from videos)?',
  'Can we learn a causal model of the world?',
  'How can we make sure that the representations we are learning are useful for some other task?',
  _,
  'A second major thrust has to do with the context in which machine learning is now routinely being applied,',
  'for example in high-stakes scenarios such as self-driving cars.',
  'But machine learning does not exist in a vacuum.',
  'When machine learning systems are deployed to real users, it changes user behavior,',
  'and since the same systems are being trained on this user-generated data, resulting in feedback loops.',
  _,
  'We also want to build ML systems which are fair.',
  'The real world is not fair; thus the data generated from it will reflect these discriminatory biases.',
  'Can we overcome these biases?',
  _,
  'The strength of machine learning lies in being able to aggregate information across many individuals.',
  'However, this appears to require a central organization that collects all this data,',
  'which seems poor practice from the point of view of protecting privacy.',
  'Can we perform machine learning while protecting individual privacy?',
  'For example, local differential privacy mechanisms inject noise into an individual\'s measurement before sending it to the central server.',
  _,
  'Finally, there is the issue of trust of machine learning systems in high-stakes situations.',
  'As these systems become more complex, it becomes harder for humans to "understand" how and why a system is making a particular decision.',
_);

add(slide('Machine learning',
  keyIdea('learning', 'Programs should improve with experience.'),
  pause(),
  stmt('So far: reflex-based models'),
  stmt('Next time: state-based models'),
_));

prose(
  'If we generalize for a moment,',
  'machine learning is really about programs that can improve with experience.',
  _,
  'So far, we have only focused on reflex-based models where the program only outputs a yes/no or a number, and the experience is examples of input-output pairs.',
  _,
  'Next time, we will start looking at models which can perform higher-level reasoning,',
  'but machine learning will remain our companion for the remainder of the class.',
_);

sfig.initialize();
