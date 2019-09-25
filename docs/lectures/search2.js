G = sfig.serverSide ? global : this;
G.prez = presentation();

add(titleSlide('Lecture 6: Search II',
  nil(),
  parentCenter(image('images/maze.jpg').width(300)),
_));

add(quizSlide('search2-start',
  'Suppose we want to travel from city $1$ to city $n$ (going only forward) and back to city $1$ (only going backward).  It costs $c_{ij} \\ge 0$ to go from $i$ to $j$.  Which of the following algorithms can be used to find the minimum cost path (select all that apply)?',
  'depth-first search',
  'breadth-first search',
  'dynamic programming',
  'uniform cost search',
_));

prose(
  'Let\'s first start by figuring out what the search problem actually is.',
  'Any action sequence needs to satisfy the constraint that we move forward to $n$ and then move backwards to $1$.',
  'So we need to keep track of the current city $i$ as well as the direction in the state.',
  _,
  'We can write down the details, but all that matters for this question is that the graph is acyclic',
  '(note that the graph implied by $c_{ij}$ over cities is not acyclic, but keeping track of directionality makes it acyclic).',
  'Also, all edge costs are non-negative.',
  _,
  'Now, let\'s think about which algorithms will work.',
  'Recall the various assumptions of the algorithms.',
  'DFS won\'t work because it assumes all edge costs are zero.',
  'BFS also won\'t work because it assumes all edge costs are the same.',
  'Dynamic programming will work because the graph is acyclic.',
  'Uniform cost search will also work because all the edge costs are non-negative.',
_);

add(slide(null,
  nil(),
  keyIdea('state',
    'A <b>state</b> is a summary of all the past actions sufficient to choose future actions <b>optimally</b>.',
  _),
  parentCenter(table(
    ['past actions (all cities)', '1 3 4 6 5 3'], pause(),
    ['state (current city)', xtable(overlay(lightgray('1 3 4 6 5'), pause(), '$\\leftarrow$').center(), pause(-1), '3').margin(5)],
  _).margin(50, 10)),
_));

add(slide('Review',
  parentCenter(searchProblemDefinition()),
  pause(),
  stmt('Objective: find the minimum cost path from $\\StartState$ to an $s$ satisfying $\\IsEnd(s)$.'),
_));

function roadmap(i) {
  add(outlineSlide('Roadmap', i, [
    ['learningCosts', 'Learning costs'],
    ['aStar', 'A* search'],
    ['relaxation', 'Relaxation'],
  ]));
}

add(slide('Paradigm',
  nil(),
  parentCenter(paradigm()),
_));

////////////////////////////////////////////////////////////
// Learning the costs
roadmap(0);

add(slide('Search',
  //stmt('Problem'),
  importantBox('Transportation example',
    'Start state: $1$',
    'Walk action: from $s$ to $s+1$ (cost: 1)',
    'Tram action: from $s$ to $2s$ (cost: 2)',
    'End state: $n$',
  _),
  pause(),
  parentCenter(xtable(bigDownArrow(80), text(red('search algorithm')).orphan(true)).margin(20).center()),
  //stmt('Solution'),
  parentCenter('walk walk tram tram tram walk tram tram'),
  parentCenter('(minimum cost path)').scale(0.7),
_).leftHeader(image('images/tram.jpg').width(150)));

prose(
  'Recall the magic tram example from the last lecture.',
  'Given a search problem (specification of the start state, end test, actions, successors, and costs),',
  'we can use a search algorithm (DP or UCS) to yield a solution,',
  'which is a sequence of actions of minimum cost reaching an end state from the start state.',
_);

add(slide('Learning',
  //stmt('Problem'),
  importantBox('Transportation example',
    'Start state: $1$',
    'Walk action: from $s$ to $s+1$ (cost: '+redbold('?')+')',
    'Tram action: from $s$ to $2s$ (cost: '+redbold('?')+')',
    'End state: $n$',
  _),
  //stmt('Solution'),
  parentCenter('walk walk tram tram tram walk tram tram'),
  pause(),
  parentCenter(xtable(bigDownArrow(60), text(red('learning algorithm')).orphan(true)).margin(20).center()),
  parentCenter(frameBox('walk cost: '+redbold('1')+', tram cost: '+redbold('2'))),
_).leftHeader(image('images/tram.jpg').width(150)));

prose(
  'Now suppose we don\'t know what the costs are,',
  'but we observe someone getting from $1$ to $n$ via some sequence of walking and tram-taking.',
  'Can we figure out what the costs are?',
  'This is the goal of learning.',
_);

add(slide('Learning as an inverse problem',
  stmt('Forward problem (search)'),
  parentCenter(xtable('$\\blue{\\Cost(s,a)}$', rightArrow(100).strokeWidth(5), '$\\red{(a_1, \\dots, a_k)}$').center().margin(20)),
  pause(),
  stmt('Inverse problem (learning)'),
  parentCenter(xtable('$\\red{(a_1, \\dots, a_k)}$', rightArrow(100).strokeWidth(5), '$\\blue{\\Cost(s,a)}$').center().margin(20)),
_));

prose(
  'More generally, so far we have thought about search as a "forward" problem:',
  'given costs, finding the optimal sequence of actions.',
  _,
  'Learning concerns the "inverse" problem:',
  'given the desired sequence of actions, reverse engineer the costs.',
_);

T = rootedTree;
B = rootedTreeBranch;
C = function(a, b) { return B(opaquebg(a), b); }

add(slide('Prediction (inference) problem',
  stmt('Input $x$: search problem without costs'),
  parentCenter(T(1, C('walk:?', T(2, C('walk:?', T(3, C('walk:?', 4))), C('tram:?', 4)))).recmargin(150, 50)),
  pause(),
  stmt('Output $y$: solution path'),
  parentCenter('walk walk walk'),
_));

prose(
  'Let\'s cast the problem as predicting an output $y$ given an input $x$.',
  'Here, the input $x$ is the search problem (visualized as a search tree) without the costs provided.',
  'The output $y$ is the desired solution path.',
  'The question is what the costs should be set to so that $y$ is actually the minimum cost path of the resulting search problem.',
_);

add(slide('Tweaking costs',
  parentCenter(table(
    [stmt('Costs: {walk:3, tram:2}'), pause(), stmt('Costs: {walk:1, tram:3}')], pause(-1),
    [stmt('Minimum cost path'), pause(), stmt('Minimum cost path')], pause(-1),
    [T(1, C(redbold('walk:3'), T(2, C('walk:3', T(3, C('walk:3', 4))), C(redbold('tram:2'), 4)))).recmargin(150, 50),
    pause(),
    T(1, C(redbold('walk:1'), T(2, C(redbold('walk:1'), T(3, C(redbold('walk:1'), 4))), C('tram:3', 4)))).recmargin(150, 50)],
  _).margin(100, 30).center()),
_));

prose(
  'Suppose the walk cost is 3 and the tram cost is 2.',
  'Then, we would obviously predict the [walk, tram] path, which is lower cost.',
  _,
  'But this is not our desired output,',
  'because we actually saw the person walk all the way from 1 to 4.',
  'How can we update the action costs so that the minimum cost path is walking?',
  _,
  'Intuitively, we want the tram cost to be more and the walk cost to be less.',
  'Specifically, let\'s increase the cost of every action on the predicted path and decrease the cost of every action on the true path.',
  'Now, the predicted path coincides with the true observed path.',
  'Is this a good strategy in general?',
  //_,
  //'In a more complex example, there might be thousands of actions and their associated costs.',
  //'How do we tune these costs automatically?',
_);

add(slide('Modeling costs (simplified)',
  stmt('Assume costs depend only on the action'),
  parentCenter('$\\Cost(s, a) = \\w[a]$'),
  pause(),
  stmt('Candidate output path'),
  parentCenter(xtable('$y$:', overlay(
    xtable(
      frameBox('$s_0$').padding(5),
      a1 = rightArrow(200).strokeWidth(3),
      frameBox('$s_1$').padding(5),
      a2 = rightArrow(200).strokeWidth(3),
      frameBox('$s_2$').padding(5),
      a3 = rightArrow(200).strokeWidth(3),
      frameBox('$s_3$').padding(5),
    _).center(),
    moveTopOf(red('$\\red{a_1} : \\w[a_1]$'), a1),
    moveTopOf(red('$\\red{a_2} : \\w[a_2]$'), a2),
    moveTopOf(red('$\\red{a_3} : \\w[a_3]$'), a3),
  _)).center().margin(30)).scale(0.9),
  //stmt('<b>Global</b> feature vector'),
  //indent('$\\blue{\\phi(x, y)} = \\sum_{i=1}^k \\phia(s_{i-1}, a_i)$'),
  //indent(stmt('Example: $\\phi_{7}(x, y) = $ number of times '+greenitalics('2')+' labeled '+red('SIZE'))),
  //stmt('Path cost (global)'),
  pause(),
  stmt('Path cost'),
  //indent('$\\displaystyle \\Cost(y) = \\sum_{i=1}^k \\Cost(s_{i-1}, a_i)$'),
  parentCenter('$\\displaystyle \\Cost(y) = \\w[a_1] + \\w[a_2] + \\w[a_3]$'),
_));

prose(
  'For each action $a$, we define a weight $\\w[a]$ representing the cost of action $a$.',
  'Without loss of generality, let us assume that the cost of the action does not depend on the state $s$.',
  _,
  'Then the cost of a path $y$ is simply the sum of the weights of the actions on the path.',
  'Every path has some cost, and recall that the search algorithm will return the minimum cost path.',
_);

add(slide('Learning algorithm',
  algorithm('Structured Perceptron (simplified)',
    bulletedText('For each action: $\\w[a] \\leftarrow 0$').width(1000), pause(),
    bulletedText('For each iteration $t = 1, \\dots T$:').width(1000),
    indent(bulletedText('For each training example $(x, y) \\in \\Train$:').width(1000)), pause(),
    indent(indent(bulletedText('Compute the minimum cost path $y\'$ given $\\w$').width(1000))), pause(),
    indent(indent(bulletedText('For each action $a \\in y$: $\\w[a] \\leftarrow \\w[a] - 1$').width(1000))), pause(),
    indent(indent(bulletedText('For each action $a \\in y\'$: $\\w[a] \\leftarrow \\w[a] + 1$').width(1000))),
  _),
  pause(-1),
  headerList(null,
    'Try to decrease cost of true $y$ (from training data)', pause(),
    'Try to increase cost of predicted $y\'$ (from search)',
  _),
  pause(),
  parentCenter(linkToVideo('[semi-live solution]', 'structuredPerceptron.mp4')),
_));

prose(
  'We are now in position to state the (simplified version of) <b>structured Perceptron</b> algorithm.',
  _,
  'Advanced: the Perceptron algorithm performs stochastic gradient descent (SGD) on a modified hinge loss with a constant step size of $\\eta = 1$.',
  'The modified hinge loss is $\\Loss(x, y, \\w) = \\max\\{-(\\w \\cdot \\phi(x))y, 0\\}$, where the margin of $1$ has been replaced with a zero.',
  'The structured Perceptron is a generalization of the Perceptron algorithm,',
  'which is stochastic gradient descent on $\\Loss(x, y, \\w) = \\max_{y\'} \\{ \\sum_{a \\in y} \\w[a] - \\sum_{a \\in y\'} \\w[a] \\}$ (note the relationship to the multiclass hinge loss).',
  'Even if you don\'t really understand the loss function, you can still understand the algorithm, since it is very intuitive.',
  _,
  'We iterate over the training examples. Each $(x,y)$ is a tuple where $x$ is a search problem without costs ',
  'and $y$ is the true minimum-cost path. Given the current weights $w$ (action costs),',
  'we run a search algorithm to find the minimum-cost path $y\'$ according to those weights.',
  'Then we update the weights to favor actions that appear in the correct output $y$ (by reducing their costs)',
  'and disfavor actions that appear in the predicted output $y\'$ (by increasing their costs).',
  'Note that if we are not making a mistake (that is, if $y = y\'$), then there is no update.',
  _,
  'Collins (2002) proved (based on the proof of the original Perceptron algorithm)',
  'that if there exists a weight vector that will make zero mistakes on the training data,',
  'then the Perceptron algorithm will converge to one of those weight vectors in a finite number of iterations.',
_);

add(slide('Generalization to features (skip)',
  stmt('Costs are parametrized by feature vector'),
  parentCenter('$\\Cost(s, a) = \\w \\cdot \\phi(s, a)$'),
  pause(),
  stmt('Example'),
  parentCenter(xtable('$y$:', overlay(
    xtable(
      frameBox('$s_0$').padding(5),
      a1 = rightArrow(300).strokeWidth(3),
      frameBox('$s_1$').padding(5),
      a2 = rightArrow(300).strokeWidth(3),
      frameBox('$s_2$').padding(5),
      //a3 = rightArrow(250).strokeWidth(3),
      //frameBox('$s_3$').padding(5),
    _).center(),
    moveTopOf(red('$\\red{a_1} : \\w \\cdot [1, 0, 1]$'), a1),
    moveTopOf(red('$\\red{a_2} : \\w \\cdot [1, 2, 0]$'), a2),
    //moveTopOf(red('$\\red{a_1} : \\w \\cdot \\phi(s_0, a_1)$'), a1),
    //moveTopOf(red('$\\red{a_2} : \\w \\cdot \\phi(s_1, a_2)$'), a2),
  _)).center().margin(30)).scale(0.9),
  //stmt('<b>Global</b> feature vector'),
  //indent('$\\blue{\\phi(x, y)} = \\sum_{i=1}^k \\phia(s_{i-1}, a_i)$'),
  //indent(stmt('Example: $\\phi_{7}(x, y) = $ number of times '+greenitalics('2')+' labeled '+red('SIZE'))),
  //stmt('Path cost (global)'),
  parentCenter('$\\w = [3, -1, -1]$'),
  pause(),
  stmt('Path cost'),
  //indent('$\\displaystyle \\Cost(y) = \\sum_{i=1}^k \\Cost(s_{i-1}, a_i)$'),
  //parentCenter('$\\displaystyle \\Cost(y) = \\w \\cdot \\phi(s_0, a_1) + \\w \\cdot \\phi(s_1, a_2)$'),
  parentCenter(stagger(
    '$\\displaystyle \\Cost(y) = \\w \\cdot \\phi(y)$',
    '$\\displaystyle \\Cost(y) = \\w \\cdot (\\phi(s_0, a_1) + \\phi(s_1, a_2))$',
    '$\\displaystyle \\Cost(y) = \\w \\cdot \\phi(s_0, a_1) + \\w \\cdot \\phi(s_1, a_2)$',
    '$\\displaystyle \\Cost(y) = [3, -1, -1] \\cdot [1, 0, 1] + [3, -1, -1] \\cdot [1, 2, 0]$',
    '$\\displaystyle \\Cost(y) = 2 + 1 = 3$',
  _)),
_));

prose(
  'So far, the cost of an action $a$ is simply $\\w[a]$.',
  'We can generalize this to allow the cost to be a general dot product $\\w \\cdot \\phi(s, a)$,',
  'which (i) allows the features to depend on both the state and the action',
  'and (ii) allows multiple features per edge.',
  'For example, we can have different costs for walking and tram-taking depending on which part of the city we are in.',
  _,
  'We can equivalently write the cost of an entire output $y$ as $\\w \\cdot \\phi(y)$,',
  'where $\\phi(y) = \\phi(s_0, a_1) + \\phi(s_1, a_2)$ is the sum of the feature vector over all actions.',
_);

add(slide('Learning algorithm (skip)',
  algorithm('Structured Perceptron [Collins, 2002]',
    bulletedText('For each action: $\\w \\leftarrow 0$').width(1000), pause(),
    bulletedText('For each iteration $t = 1, \\dots T$:').width(1000),
    indent(bulletedText('For each training example $(x, y) \\in \\Train$:').width(1000)), pause(),
    indent(indent(bulletedText('Compute the minimum cost path $y\'$ given $\\w$').width(1000))), pause(),
    indent(indent(bulletedText('$\\w \\leftarrow \\w - \\phi(y) + \\phi(y\')$').width(1000))),
  _),
  headerList(null,
    'Try to decrease cost of true $y$ (from training data)',
    'Try to increase cost of predicted $y\'$ (from search)',
  _),
_));

add(slide('Applications',
  bulletedText('Part-of-speech tagging'),
  parentCenter(xtable(greenitalics('Fruit flies like a banana.'), bigRightArrow(), blue('Noun Noun Verb Det Noun')).center().margin(10)),
  pause(),
  //bulletedText('Information extraction'),
  //bulletedText('Parsing'),
  bulletedText('Machine translation'),
  parentCenter(xtable(greenitalics('la maison bleue'), bigRightArrow(), blueitalics('the blue house')).center().margin(10)),
_));

prose(
  'The structured Perceptron was first used for natural language processing tasks.',
  'Given it\'s simplicity, the Perceptron works reasonably well.',
  'With a few minor tweaks, you get state-of-the-art algorithms for structured prediction,',
  'which can be applied to many tasks such as machine translation, gene prediction, information extraction, etc.',
  _,
  'On a historical note, the structured Perceptron merges two relatively classic communities.',
  'The first is search algorithms (uniform cost search was developed by Dijkstra in 1956).',
  'The second is machine learning (Perceptron was developed by Rosenblatt in 1957).',
  'It was only over 40 years later that the two met.',
_);

////////////////////////////////////////////////////////////
// A* search
roadmap(1);

add(slide('A* algorithm',
  stmt('UCS in action'),
  parentCenter(youtube('z6lUnb9ktkE')),
  pause(),
  stmt('A* in action'),
  parentCenter(youtube('huJEgJ82360')),
_));

add(slide('Can uniform cost search be improved?',
  parentCenter(overlay(
    c = circle(5).color('orange'), transform('$\\StartState$').pivot(-1, 0).shift(c.right(), c.ymiddle()),
    c = circle(5).color('green').shift(200, 0), transform('$\\EndState$').pivot(-1, 0).shift(c.right(), c.ymiddle()),
    pause(),
    circle(50), pause(),
    circle(100), pause(),
    circle(150), pause(),
    circle(200), pause(),
    center(opaquebg('Wasted effort?').strokeColor('red')).shift(-150, 0),
  _)).scale(0.8), pause(),
  stmt('Problem: UCS orders states by cost from $\\StartState$ to $s$'),
  pause(),
  stmt('Goal', 'take into account cost from $s$ to $\\EndState$'),
_));

prose(
  'Now our goal is to make UCS faster.',
  'If we look at the UCS algorithm, we see that it explores states based on how far they are away from the start state.',
  'As a result, it will explore many states which are close to the start state, but in the opposite direction of the end state.',
  _,
  'Intuitively, we\'d like to bias UCS towards exploring states which are closer to the end state, and that\'s exactly what A* does.',
_);

add(slide('Exploring states',
  stmt('UCS: explore states in order of $\\PastCost(s)$'), pause(),
  parentCenter(overlay(
    xtable(
      a = node(),
      m1 = rightArrow(250).strokeWidth(1),
      b = node(),
      m2 = rightArrow(250).strokeWidth(1),
      c = node().strokeWidth(2),
    _).center(),
    moveTopOf('$\\StartState$', a),
    moveTopOf('$s$', b),
    moveTopOf('$\\EndState$', c),
    moveBottomOf('$\\PastCost(s)$', m1),
    moveBottomOf('$\\FutureCost(s)$', m2),
  _)),
  pause(),
  stmt('Ideal', 'explore in order of $\\PastCost(s) + \\FutureCost(s)$'),
  pause(),
  stmt('A*', 'explore in order of $\\PastCost(s) + \\red{h(s)}$'),
  definition('Heuristic function',
    'A heuristic $\\red{h(s)}$ is any estimate of $\\FutureCost(s)$.',
  _),
_));

prose(
  'First, some terminology: $\\PastCost(s)$ is the minimum cost from the start state to $s$,',
  'and $\\FutureCost(s)$ is the minimum cost from $s$ to an end state.',
  'Without loss of generality, we can just assume we have one end state.',
  '(If we have multiple ones, create a new official goal state which is the successor of all the original end states.)',
  _,
  'Recall that UCS explores states in order of $\\PastCost(s)$.',
  'It\'d be nice if we could explore states in order of $\\PastCost(s) + \\FutureCost(s)$,',
  'which would definitely take the end state into account,',
  'but computing $\\FutureCost(s)$ would be as expensive as solving the original problem.',
  _,
  'A* relies on a <b>heuristic</b> $h(s)$, which is an estimate of $\\FutureCost(s)$.',
  'For A* to work, $h(s)$ must satisfy some conditions, but for now, just think of $h(s)$ is an approximation.',
  'We will soon show that A* will explore states in order of $\\PastCost(s) + h(s)$.',
  'This is nice, because now states which are estimated (by $h(s)$) to be really far away from the end state',
  'will be explored later, even if their $\\PastCost(s)$ is small.',
_);

add(slide('A* search',
  algorithm('A* search [Hart/Nilsson/Raphael, 1968]',
    'Run uniform cost search with <b>modified edge costs</b>:',
    indent(nowrapText('$\\purple{\\ModifiedCost(s,a)} = \\blue{\\Cost(s,a)} + \\red{h(\\Succ(s, a)) - h(s)}$')),
    // Difference in approximate future costs
  _),
  stmt('Intuition: add a penalty for how much action $a$ takes us away from the end state'),
  pause(),
  stmt('Example'),
  // Example -2 -1 Start[0] 1 Goal[2]
  parentCenter(overlay(
    xtable(
      a = node('A'),
      m1 = leftArrow(50).strokeWidth(1),
      b = node('B'),
      m2 = leftArrow(50).strokeWidth(1),
      c = node('C').strokeWidth(3),
      m3 = rightArrow(50).strokeWidth(1),
      d = node('D'),
      m4 = rightArrow(50).strokeWidth(1),
      e = node('E').strokeWidth(3),
    _).center(),
    moveTopOf('$\\StartState$', c),
    moveTopOf('$\\EndState$', e),
    pause(),
    l = moveBottomOf('$\\red{4}$', a),
    moveBottomOf('$\\red{3}$', b),
    moveBottomOf('$\\red{2}$', c),
    moveBottomOf('$\\red{1}$', d),
    moveBottomOf('$\\red{0}$', e),
    moveLeftOf('$h(s) =$', l),
    pause(-1),
    stagger(
      overlay(
        moveTopOf('$\\blue{1}$', m1).scale(0.6),
        moveTopOf('$\\blue{1}$', m2).scale(0.6),
        moveTopOf('$\\blue{1}$', m3).scale(0.6),
        moveTopOf('$\\blue{1}$', m4).scale(0.6),
      _),
      pause(),
      overlay(
        moveTopOf('$\\purple{2}$', m1).scale(0.6),
        moveTopOf('$\\purple{2}$', m2).scale(0.6),
        moveTopOf('$\\purple{0}$', m3).scale(0.6),
        moveTopOf('$\\purple{0}$', m4).scale(0.6),
      _),
    _),
  _)),
  nil(),
  parentCenter('$\\purple{\\ModifiedCost(C, B)} = \\blue{\\Cost(C, B)} + \\red{h(B) - h(C)} = 1 + (3 - 2) = 2$').scale(0.7),
_));

prose(
  'Here is the full A* algorithm: just run UCS with modified edge costs.',
  _,
  'You might feel tricked because we promised you a shiny new algorithm, but actually, you just got a refurbished version of UCS.',
  '(This is a slightly unorthodox presentation of A*.  The normal presentation is modifying UCS to prioritize by $\\PastCost(s) + h(s)$ rather than $\\PastCost(s)$.)',
  'But I think the modified edge costs view shows a deeper connection to UCS, and we don\'t even have to modify the UCS code at all.',
  _,
  'How should we think of these modified edge costs?',
  'It\'s the same edge cost $\\Cost(s,a)$ plus an additional term.',
  'This term is difference between the estimated future cost of the new state $\\Succ(s,a)$ and that of the current state $s$.',
  'In other words, we\'re measuring how much farther from the end state taking action $a$ is taking us.',
  'If this difference is positive, then we\'re penalizing the action $a$ more.',
  'If this difference is negative, then we\'re favoring this action $a$.',
  _,
  'Let\'s look at a small example.',
  'All edge costs are $1$.',
  'Let\'s suppose we define $h(s)$ to be the actual $\\FutureCost(s)$, the minimum cost to the end state.',
  'In general, this is not the case, but let\'s see what happens in the best case.',
  'The modified edge costs are $2$ for actions moving away from the end state and $0$ for actions moving towards the end state.',
  _,
  'In this case, UCS with original edge costs $1$ will explore all the nodes.',
  'However, A* (UCS with modified edge costs) will explore only the three nodes on the path to the end state.',
_);

G.heuristicExample = function(modified) {
  var edge = function(s, t, c, d) {
    return decoratedLine(s, t).label(xtable(
      opaquebg(c).strokeColor('blue'),
      modified ? opaquebg('$\\Rightarrow$') : _,
      modified ? opaquebg(d).strokeColor('purple') : _,
    _).center());
  };
  return overlay(
    xtable(
      a = node('A'),
      ytable(b = node('B'), c = node('C')).margin(100),
      d = node('D'),
    _).center().margin(100),
    ab = edge(a, b, 1, modified ? 1 : null),
    ac = edge(a, c, 2, modified ? 1002 : null),
    bd = edge(b, d, 5, modified ? 5 : null),
    cd = edge(c, d, 1, modified ? -999 : null),
    moveTopOf(red('0'), a),
    moveTopOf(red('0'), b),
    moveBottomOf(red('1000'), c),
    moveTopOf(red('0'), d),
  _);
}

add(slide('An example heuristic',
  'Will any heuristic work?',
  pause(),
  parentCenter('No.'),
  stmt('Counterexample'),
  parentCenter(stagger(
    heuristicExample(false),
    heuristicExample(true),
  _)),
  pause(),
  parentCenter('Doesn\'t work because of '+purplebold('negative modified edge costs')+'!'),
_));

prose(
  'So far, we\'ve just said that $h(s)$ is just an approximation of $\\FutureCost(s)$.',
  'But can it be any approximation?',
  _,
  'The answer is no, as the counterexample clearly shows.',
  'The modified edge costs would be 1 (A to B), 1002 (A to C), 5 (B to D), and -999 (C to D).',
  'UCS would go to B first and then to D, finding a cost 6 path rather than the optimal cost 3 path through C.',
  _,
  'If our heuristic is lying to us (bad approximation of future costs), then running A* (UCS on modified costs)',
  'could lead to a suboptimal solution.',
  'Note that the reason this heuristic doesn\'t work is the same reason UCS doesn\'t work when there are negative action costs.',
_);

add(slide('Consistent heuristics',
  definition('consistency',
    'A heuristic $h$ is <b>consistent</b> if',
    bulletedText('$\\purple{\\ModifiedCost(s, a)} = \\blue{\\Cost(s,a)} + \\red{h(\\Succ(s, a)) - h(s)} \\ge 0$'), pause(),
    bulletedText('$\\red{h(\\EndState)} = 0$.'),
  _).scale(0.9),
  pause(-1),
  stmt('Condition 1: needed for UCS to work (triangle inequality).'),
  parentCenter(overlay(
    s = circle(5).fillColor('black'),
    ss = circle(5).fillColor('black').shiftBy(300, 0),
    send = circle(5).fillColor('black').shiftBy(600, 50),
    arrow(s, ss),
    arrow(ss, send),
    arrow(s, send),
    moveLeftOf('$s$', s),
    moveRightOf('$\\EndState$', send),
    overlay('$\\blue{\\Cost(s,a)}$').pivot(0, 1).shiftBy(150, 0),
    center('$\\red{h(s)}$').shiftBy(300, 50),
    center('$\\red{h(\\Succ(s,a))}$').shiftBy(500, 0),
  _)),
  pause(),
  nowrapText(stmt('Condition 2: $\\FutureCost(\\EndState) = 0$ so match it.')),
_));

/*add(slide('Example',
  parentCenter(heuristicExample(true)),
_));*/

prose(
  'We need $h(s)$ to be <b>consistent</b>, which means two things.',
  'First, the modified edge costs are non-negative (this is the main property).',
  'This is important for UCS to find the minimum cost path',
  '(remember that UCS only works when all the edge costs are non-negative).',
  _,
  'Second, $h(\\EndState) = 0$, which is just saying: be reasonable.',
  'The minimum cost from the end state to the end state is trivially $0$, so just use $0$.',
  _,
  'We will come back later to the issue of getting a hold of a consistent heuristic,',
  'but for now, let\'s assume we have one and see what we can do with it.',
_);

add(slide('Correctness of A*',
  nil(),
  proposition('correctness', 'If $h$ is consistent, A* returns the minimum cost path.'),
_));

prose(
  'The main theoretical result for A* is that if we use any consistent heuristic,',
  'then we will be guaranteed to find the minimum cost path.',
_);

add(slide('Proof of A* correctness',
  bulletedText('Consider any path $[s_0, a_1, s_1, \\dots, a_L, s_L]$:'),
  parentCenter(overlay(
    xtable(
      a = node(),
      m1 = rightArrow(300).strokeWidth(1),
      b = node(),
      m2 = rightArrow(300).strokeWidth(1),
      c = node(),
      '$\\,\\cdots\\,$',
    _).center(),
    moveTopOf('$s_0$', a),
    moveTopOf('$s_1$', b),
    moveTopOf('$s_2$', c),
    moveBottomOf('$\\blue{\\Cost(s_0, a_1)} + \\red{h(s_1) - h(s_0)}$', m1).scale(0.6),
    moveBottomOf('$\\blue{\\Cost(s_1, a_2)} + \\red{h(s_2) - h(s_1)}$', m2).scale(0.6),
    moveTopOf('$\\purple{\\ModifiedCost(s_0, a_1)}$', m1).scale(0.6),
    moveTopOf('$\\purple{\\ModifiedCost(s_1, a_2)}$', m2).scale(0.6),
  _)),
  pause(),
  bulletedText('Key identity:'),
  parentCenter('$\\purple{\\underbrace{\\sum_{i=1}^L \\ModifiedCost(s_{i-1},a_i)}_{\\text{modified path cost}}} = \\blue{\\underbrace{\\sum_{i=1}^L \\Cost(s_{i-1}, a_i)}_\\text{original path cost}} + \\red{\\underbrace{h(s_L) - h(s_0)}_\\text{constant}}$').scale(0.85),
  //parentCenter('$\\purple{\\text{modified path cost}} = \\blue{\\text{original path cost}} + \\text{constant}$'),
  pause(),
  bulletedText('Therefore, A* (finding the minimum cost path using modified costs) solves the original problem (even though edge costs are all different!)'),
_)); 

prose(
  'To show the correctness of A*, let\'s take any path of length $L$ from $s_0 = \\StartState$ to $s_L = \\EndState$.',
  'Let us compute the modified path cost by just adding up the modified edge costs.',
  'Just to simplify notation, let $c_i = \\Cost(s_{i-1}, a_i)$ and $h_i = h(s_i)$.',
  'The modified path cost is $(c_1 + h_1 - h_0) + (c_2 + h_2 - h_1) + \\cdots + (c_L + h_L - h_{L-1})$.',
  'Notice that most of the $h_i$\'s actually cancel out (this is known as <b>telescoping sums</b>).',
  _,
  'We end up with $\\sum_{i=1}^L c_i$, which is the original path cost plus $h_L - h_0$.',
  'First, notice that $h_L = 0$ because $s_L$ is an end state and by the second condition of consistency, $h(s_L) = 0$.',
  'Second, $h_0$ is just a constant (in that it doesn\'t depend on the path at all), since all paths must start with the start state.',
  _,
  'Therefore, the modified path cost is equal to the original path cost plus a constant.',
  'A*, which is running UCS on the modified edge costs, is equivalent to',
  'running UCS on the original edge costs, which minimizes the original path cost.',
  _,
  'This is kind of remarkable: all the edge costs are modified in A*, but yet the final path cost is the same (up to a constant)!',
_);

add(slide('Efficiency of A*',
  parentCenter(stagger(
    theorem('efficiency of UCS',
      'UCS explores all states $s$ satisfying',
      parentCenter('$\\PastCost(s) \\le \\PastCost(\\EndState)$'),
    _),
    theorem('efficiency of A*',
      'A* explores all states $s$ satisfying',
      parentCenter('$\\PastCost(s) \\le \\PastCost(\\EndState) - \\red{h}(s)$'),
    _),
  _).center()),
  pause(),
  stmt('Interpretation: the larger $\\red{h}(s)$, the better'),
  pause(),
  stmt('Proof: A* explores all $s$ such that'),
  parentCenter(stagger(
    ytable(
      nowrapText('$\\ModifiedPastCost(s)$'),
      text('$\\le$').scale(1.5),
      nowrapText('$\\ModifiedPastCost(\\EndState)$'),
    _).center().margin(10),
    ytable(
      nowrapText('$\\PastCost(s) + \\red{h}(s) - \\red{h}(\\StartState)$'),
      text('$\\le$').scale(1.5),
      nowrapText('$\\PastCost(\\EndState) + \\red{h}(\\EndState) - \\red{h}(\\StartState)$'),
    _).center().margin(10),
    ytable(
      nowrapText('$\\PastCost(s) + \\red{h}(s)$'),
      text('$\\le$').scale(1.5),
      nowrapText('$\\PastCost(\\EndState)$'),
    _).center().margin(10),
  _).center()),
_));

prose(
  'We\'ve proven that A* is correct (finds the minimum cost path) for any consistent heuristic $h$.',
  'But for A* to be interesting, we need to show that it\'s more efficient than UCS (on the original edge costs).',
  'We will measure speed in terms of the number of states which are explored prior to exploring an end state.',
  _,
  'Our second theorem is about the efficiency of A*:',
  'recall that UCS explores states in order of past cost,',
  'so that it will explore every state whose past cost is less than the past cost of the end state.',
  _,
  'A* explores all states for which $\\ModifiedPastCost(s) = \\PastCost(s) + h(s) - h(\\StartState)$',
  'is less than $\\ModifiedPastCost(\\EndState) = \\PastCost(\\EndState) + h(\\EndState) - h(\\StartState)$,',
  'or equivalently $\\PastCost(s) + h(s) \\le \\PastCost(\\EndState)$ since $h(\\EndState) = 0$.',
  _,
  'From here, it\'s clear that we want $h(s)$ to be as large as possible so we can push as many states over the $\\PastCost(\\EndState)$ threshold, so that we don\'t have to explore them.',
  'Of course, we still need $h$ to be consistent to maintain correctness.',
  _,
  'For example, suppose $\\PastCost(s_1) = 1$ and $h(s_1) = 1$ and $\\PastCost(\\EndState) = 2$.',
  'Then we would have to explore $s_1$ ($1+1 \\le 2$).',
  'But if we were able to come up with a better heuristic where $h(s_1) = 2$, then we wouldn\'t have to explore $s_1$ ($1+2 > 2$).',
_);

function astarExploredDiagram() {
  var width = 300, height = 120, x = 100;
  return overlay(
    n = nil(),
    env = ellipse(width, height).strokeWidth(3),
    pause(),
    withLeft(circle(x).fillColor('red'), text('$h=0$ (UCS)').color('red').scale(0.5)),
    pause(2),
    ellipse(x*3/4, 50).xshift(x*0.25).fillColor('orange'),
    pause(-1),
    withBottom(ellipse(x/2, 2).xshift(x*0.5).fillColor('green'), text('$h=\\FutureCost$').color('green').scale(0.5)),
    pause(),
    showLevel(env.showLevel()),
    withLeft(circle(5).color('black'), '$s_\\text{start}$'),
    withRight(circle(5).color('black').shift(x, 0), '$s_\\text{end}$'),
    showLevel(n.showLevel()),
  _);
}
add(slide('Amount explored',
  parentCenter(astarExploredDiagram()),
  pause(),
  headerList(null,
    'If $h(s) = 0$, then A* is same as UCS.', pause(),
    'If $h(s) = \\FutureCost(s)$, then A* only explores nodes on a minimum cost path.', pause(),
    'Usually $h(s)$ is somewhere in between.',
  _),
_));

prose(
  'In this diagram, each ellipse corresponds to the set of states which are explored by A* with various heuristics.',
  'In general, any heuristic we come up with will be between the trivial heuristic $h(s) = 0$ which corresponds to UCS',
  'and the oracle heuristic $h(s) = \\FutureCost(s)$ which is unattainable.',
_);

add(slide('A* search',
  keyIdea('distortion',
    'A* distorts edge costs to favor end states.',
  _),
  parentCenter(image('images/funhouse.jpg').width(150)),
_));

prose(
  'What exactly is A* doing to the edge costs?',
  'Intuitively, it\'s biasing us towards the end state.',
_);

add(slide('Admissibility',
  definition('admissibility',
    'A heuristic $h(s)$ is admissible if',
    parentCenter('$h(s) \\le \\FutureCost(s)$'),
  _),
  stmt('Intuition: admissible heuristics are optimistic'),
  pause(),
  theorem('consistency implies admissibility',
    'If a heuristic $h(s)$ is <b>consistent</b>, then $h(s)$ is <b>admissible</b>.',
  _),
  pause(),
  stmt('Proof: use induction on $\\FutureCost(s)$'),
  //stmt('Note: $\\FutureCost(s)$ is the best heuristic'),
_));

prose(
  'So far, we\'ve just assumed that $\\FutureCost(s)$ is the best possible heuristic (ignoring for the moment that it\'s impractical to compute).',
  'Let\'s actually prove this now.',
  _,
  'To do this, we just have to show that any consistent heuristic $h(s)$ satisfies $h(s) \\le \\FutureCost(s)$',
  '(since by the previous theorem, the larger the heuristic, the better).',
  'In fact, this property has a special name: we say that $h(s)$ is <b>admissible</b>.',
  'In other words, an admissible heuristic $h(s)$ <b>underestimates</b> the future cost: it is optimistic.',
  _,
  'The proof proceeds by induction on increasing $\\FutureCost(s)$.',
  'In the base case, we have $0 = h(\\EndState) \\le \\FutureCost(\\EndState) = 0$ by the second condition of consistency.',
  _,
  'In the inductive case, let $s$ be a state and let $a$ be an optimal action leading to $s\' = \\Succ(s, a)$ that achieves the minimum cost path to the end state;',
  'in other words, $\\FutureCost(s) = \\Cost(s,a) + \\FutureCost(s\')$.',
  'Since $\\Cost(s,a) \\ge 0$,',
  'we have that $\\FutureCost(s\') \\le \\FutureCost(s)$,',
  'so by the inductive hypothesis, $h(s\') \\le \\FutureCost(s\')$.',
  'To show the same holds for $s$, consider:',
  '$h(s) \\le \\Cost(s,a) + h(s\') \\le \\Cost(s,a) + \\FutureCost(s\') = \\FutureCost(s)$,',
  'where the first inequality follows by consistency of $h(s)$,',
  'the second inequality follows by the inductive hypothesis,',
  'and the third equality follows because $a$ was chosen to be the optimal action.',
  'Therefore, we conclude that $h(s) \\le \\FutureCost(s)$.',
  _,
  'Aside: People often talk about admissible heuristics.',
  'Using A* with an admissible heuristic is only guaranteed to find the minimum cost path for tree search algorithms,',
  'where we don\'t use an explored list.',
  'However, the UCS and A* algorithms we are considering in this class are graph search algorithms,',
  'which require consistent heuristics, not just admissible heuristics, to find the minimum cost path.',
  'There are some admissible heuristics which are not consistent, but most natural ones are consistent.',
_);

////////////////////////////////////////////////////////////
// Relaxation
roadmap(2);

function addRelaxationSummarySlide() {
  var T = rootedTree;
  var B = rootedTreeBranch;
  add(slide('Relaxation overview',
    parentCenter(T('reduce costs', T('remove constraints'.bold(),
      ytable('closed form', 'solution').center().color('green'),
      ytable('easier', 'search').center().color('green'),
      ytable('independent', 'subproblems').center().color('green'),
    _)).recverticalCenterEdges(true)),
    parentCenter(frameBox(blue('combine heuristics using max')).padding(5)),
  _).leftHeader(image('images/beach.jpg').width(200)));
}

add(dividerSlide(parentCenter(yseq(
  'How do we get good heuristics? Just relax...',
  image('images/beach.jpg').width(300),
_).center())));

add(slide('Relaxation',
  stmt('Intuition: ideally, use $h(s) = \\FutureCost(s)$, but that\'s as hard as solving the original problem.'),
  pause(),
  keyIdea('relaxation',
    'Constraints make life hard.  Get rid of them.',
    'But this is just for the heuristic!',
  _),
  parentCenter(image('images/break-shackles.jpg').width(150)),
_));

prose(
  'So far, given a heuristic $h(s)$, we can run A* using it and get a savings which depends on how large $h(s)$ is.',
  'However, we\'ve only seen two heuristics: $h(s) = 0$ and $h(s) = \\FutureCost(s)$.',
  'The first does nothing (gives you back UCS), and the second is hard to compute.',
  _,
  'What we\'d like to do is to come up with a general principle for coming up with heuristics.',
  'The idea is that of a <b>relaxation</b>: instead of computing $\\FutureCost(s)$ on the original problem,',
  'let us compute $\\FutureCost(s)$ on an easier problem, where the notion of easy will be made more formal shortly.',
  _,
  'Note that coming up with good heuristics is about <b>modeling</b>, not algorithms.',
  'We have to think carefully about our problem domain and see what kind of structure we can exploit in it.',
_);

addRelaxationSummarySlide();

var s0 = new GridState({grid: '.#...|...#.|.#...', me: point(0, 0), opp: point(4, 1), oppColor: 'orange'}).display();
var s1 = new GridState({grid: '.....|.....|.....', me: point(0, 0), opp: point(4, 1), oppColor: 'orange'}).display();
add(slide('Closed form solution',
  example('knock down walls',
    stmt('Goal: move from triangle to circle'),
    parentCenter(table([s0, pause(), s1], pause(-1), ['Hard', pause(), 'Easy']).margin(100, 20).center()),
    pause(),
    stmt('Heuristic'),
    indent('$h(s) = \\text{ManhattanDistance}(s, (2,5))$'),
    indent('e.g., $h((1,1)) = 5$'),
  _),
  //pause(),
  //stmt('Interpretation: removing constraints $\\Rightarrow$ reduce edge costs (from $\\infty$ to $1$)'),
  //parentCenter(frameBox(redbold('closed form solution'))),
_));

prose(
  'Here\'s a simple example.',
  'Suppose states are positions $(r,c)$ on the grid.',
  'Possible actions are moving up, down, left, or right, provided they don\'t move you into a wall or off the grid; and all edge costs are $1$.',
  'The start state is at the triangle at $(1,1)$, and the end state is the circle at position $(2,5)$.',
  _,
  'With an arbitrary configuration of walls, we can\'t compute $\\FutureCost(s)$ except by doing search.',
  'However, if we just <b>relaxed</b> the original problem by removing the walls,',
  'then we can compute $\\FutureCost(s)$ in <b>closed form</b>:',
  'it\'s just the Manhattan distance between $s$ and $\\EndState$.',
  'Specifically, $\\text{ManhattanDistance}((r_1,c_1), (r_2,c_2)) = |r_1 - r_2| + |c_1 - c_2|$.',
_);

add(slide('Easier search',
  example('original problem',
    'Start state: $1$',
    'Walk action: from $s$ to $s+1$ (cost: 1)',
    'Tram action: from $s$ to $2s$ (cost: 2)',
    'End state: $n$',
    pause(),
    redbold('Constraint: can\'t have more tram actions than walk actions.'),
  _),
  pause(),
  stmt('State: (location, '+redbold('#walk - #tram')+')'),
  parentCenter('Number of states goes from $O(n)$ to $O(n^2)$!'),
  //parentCenter('[live solution]'),
_).leftHeader(image('images/congress.jpg').width(250).showLevel(1)));

prose(
  'Let\'s revisit our magic tram example.',
  'Suppose now that a decree comes from above that says you can\'t have take the tram more times than you walk.',
  'This makes our lives considerably worse, since if we wanted to respect this constraint,',
  'we have to keep track of additional information (augment the state).',
  _,
  'In particular, we need to keep track of the number of walk actions that we\'ve taken so far minus the number of tram actions we\'ve taken so far,',
  'and enforce that this number does not go negative.',
  'Now the number of states we have is much larger and thus, search becomes a lot slower.',
_);

add(slide('Easier search',
  example('relaxed problem',
    'Start state: $1$',
    'Walk action: from $s$ to $s+1$ (cost: 1)',
    'Tram action: from $s$ to $2s$ (cost: 2)',
    'End state: $n$',
    ('<del>Constraint: can\'t have more tram actions than walk actions.</del>'),
  _),
  redbold('Original state')+': (location, '+redbold('#walk - #tram')+')',
  bluebold('Relaxed state')+': location',
_).leftHeader(image('images/break-shackles.jpg').width(150)));

prose(
  'What if we just ignore that constraint and solve the original problem?',
  'That would be much easier/faster.',
  'But how do we construct a consistent heuristic from the solution from the relaxed problem?',
_);

add(slide('Easier search',
  bulletedText('Compute relaxed $\\blue{\\RelaxedFutureCost(\\text{location})}$ for <b>each</b> location ($1, \\dots, n$) using dynamic programming or UCS'),
  pause(),
  example('reversed relaxed problem',
    'Start state: $n$',
    'Walk action: from $s$ to $s-1$ (cost: 1)',
    'Tram action: from $s$ to $s/2$ (cost: 2)',
    'End state: $1$',
  _).scale(0.8),
  pause(),
  indent(ytable(
    'Modify UCS to compute all past costs in reversed relaxed problem',
    '(equivalent to future costs in relaxed problem!)',
  _)),
  pause(),
  bulletedText('Define heuristic for original problem:'),
  parentCenter('$\\red{h((\\text{location, #walk-#tram}))} = \\blue{\\RelaxedFutureCost(\\text{location})}$').scale(0.9),
  //parentCenter('[live solution]'),
_));

prose(
  'We want to now construct a heuristic $h(s)$ based on the future costs under the relaxed problem.',
  _,
  'For this, we need the future costs for all the relaxed states.',
  'One straightforward way to do this is by using dynamic programming.',
  'However, if we have cycles, then we need to use uniform cost search.',
  _,
  'But recall that UCS only computes the past costs of all states up until the end.',
  'So we need to make two changes.',
  'First, we simply don\'t stop at the end, but keep on going until we\'ve explored all the states.',
  'Second, we define a <b>reversed relaxed problem</b> (where all the edges are just reversed), and call UCS on that.',
  'UCS will return past costs in the reversed relaxed problem which correspond exactly to future costs in the relaxed problem.',
  _,
  'Finally, we need to construct the actual heuristic.',
  'We have to be a bit careful because the state spaces of the relaxed and original problems are different.',
  'For this, we set the heuristic $h(s)$ to the future cost of the relaxed version of $s$.',
  _,
  'Note that the minimum cost returned by A* (UCS on the modified problem)',
  'is the true minimum cost minus the value of the heuristic at the start state.',
_);

add(slide('Independent subproblems',
  parentCenter('[8 puzzle]').linkToUrl('http://mypuzzle.org/sliding'),
  parentCenter(xtable(
    image('images/8_puzzle_goal_state_a.png').width(150),
    rightArrow(50).strokeWidth(3),
    image('images/8_puzzle_goal_state_b.png').width(150),
  _).margin(50).center()),
  pause(),
  stmt('Original problem', 'tiles <font color="red">cannot</font> overlap (constraint)'), pause(),
  stmt('Relaxed problem', 'tiles <font color="green">can</font> overlap (no constraint)'), pause(),
  stmt('Relaxed solution',
    '8 indep. problems, each in closed form',
  _),
  keyIdea('independence',
    'Relax original problem into independent subproblems.',
  _),
_));

prose(
  'So far, we\'ve seen that some heuristics $h(s)$ can be computed in closed form and others can be computed by doing a cheaper search.',
  'But there\'s another way to define heuristics $h(s)$ which are efficient to compute.',
  _,
  'In the 8-puzzle, the goal is to slide the tiles around to produce the desired configuration, but with the constraint that no two tiles can occupy the same position.',
  'However, we can throw that constraint out the window to get a relaxed problem.',
  'Now, the new problem is really easy, because the tiles can now move <b>independently</b>.',
  'So we\'ve taken one giant problem and turned it into $8$ smaller problems.',
  'Each of the smaller problems can now be solved separately (in this case, in closed form, but in other cases, we can also just do search).',
  _,
  'It\'s worth remembering that all of these relaxed problems are simply used to get the value of the heuristic $h(s)$ to guide the full search.',
  'The actual solutions to these relaxed problems are not used.',
_);

//addRelaxationSummarySlide();

add(slide('General framework',
  parentCenter(ytable(
    ytable(
      bold('Removing constraints'),
      '(knock down walls, walk/tram freely, overlap pieces)',
    _).center(),
    pause(),
    bigUpDownArrow(),
    ytable(
      bold('Reducing edge costs'),
      '(from $\\infty$ to some finite cost)',
    _).center(),
  _).center()),
  pause(),
  stmt('Example'),
  parentCenter(new GridState({grid: '.#...|...#.|.#...', me: point(0, 0), opp: point(4, 1), oppColor: 'orange'}).display()),
  parentCenter(ytable(
    'Original: $\\red{\\Cost((1,1), \\text{East}) = \\infty}$',
    'Relaxed: $\\blue{\\RelaxedCost((1,1), \\text{East}) = 1}$',
  _)),
_));

prose(
  'We have seen three instances where removing constraints yields simpler solutions, either via closed form, easier search, or independent subproblems.',
  'But we haven\'t formally proved that the heuristics you get are consistent!',
  _,
  'Now we will analyze all three cases in a unified framework.',
  'Removing constraints can be thought of as adding edges',
  '(you can go between pairs of states that you weren\'t able to before).',
  'Adding edges is equivalent to reducing the edge cost from infinity to something finite (the resulting edge cost).',
_);

add(slide('General framework',
  definition('relaxed search problem',
    'A <b>relaxation</b> $\\blue{\\RelaxedP}$ of a search problem $\\red{P}$ has costs that satisfy:',
    parentCenter('$\\blue{\\RelaxedCost(s, a)} \\le \\red{\\Cost(s, a)}$.'),
  _),
  pause(),
  definition('relaxed heuristic',
    'Given a relaxed search problem $\\blue{\\RelaxedP}$, define the <b>relaxed heuristic</b> $\\blue{h(s)} = \\blue{\\RelaxedFutureCost(s)}$, the minimum cost from $s$ to an end state using $\\blue{\\RelaxedCost(s, a)}$.',
  _),
_));

prose(
  'More formally, we define a relaxed search problem as one where the relaxed edge costs are no larger than the original edge costs.',
  _,
  'The relaxed heuristic is simply the future cost of the relaxed search problem,',
  'which by design should be efficiently computable.',
_);

add(slide('General framework',
  theorem('consistency of relaxed heuristics',
    'Suppose $h(s) = \\RelaxedFutureCost(s)$ for some relaxed problem $\\blue{\\RelaxedP}$.',
    'Then $h(s)$ is a consistent heuristic.',
  _),
  pause(),
  stmt('Proof'),
  table(
    ['$h(s)$', '$\\le \\blue{\\RelaxedCost(s, a)} + h(\\Succ(s, a))$ [triangle inequality]'], pause(),
    [nil(), '$\\le \\red{\\Cost(s, a)} + h(\\Succ(s, a))$ [relaxation]'],
  _).yjustify('c').margin(5),
_));

prose(
  'We now need to check that our defined heuristic $h(s)$ is actually consistent,',
  'so that using it actually will yield the minimum cost path of our original problem',
  '(not the relaxed problem, which is just a means towards an end).',
  _,
  'Checking consistency is actually quite easy.',
  'The first inequality follows because $h(s) = \\RelaxedFutureCost(s)$,',
  'and all future costs correspond to the minimum cost paths.',
  'So taking action $a$ from state $s$ better be no better than taking the best action from state $s$ (this is all in the search problem $\\RelaxedP$).',
  _,
  'The second inequality follows just by the definition of a relaxed search problem.',
  _,
  'The significance of this theorem is that we only need to think about coming up with relaxations rather than worrying directly about checking consistency.',
_);

add(slide('Tradeoff',
  stmt(bold('Efficiency')),
  indent('$h(s) = \\RelaxedFutureCost(s)$ must be easy to compute'),
  indent('Closed form, easier search, independent subproblems'),
  pause(),
  stmt(bold('Tightness')),
  indent('heuristic $h(s)$ should be close to $\\FutureCost(s)$'),
  indent('Don\'t remove too many constraints'),
_));

prose(
  'How should one go about designing a heuristic?',
  _,
  'First, the heuristic should be easy to compute.',
  'As the main point of A* is to make things more efficient, if the heuristic is as hard as to compute as the original search problem,',
  'we\'ve gained nothing (an extreme case is no relaxation at all, in which case $h(s) = \\FutureCost(s)$).',
  _,
  'Second, the heuristic should tell us some information about where the goal is.',
  'In the extreme case, we relax all the way and we have $h(s) = 0$, which corresponds to running UCS.',
  '(Perhaps it is reassuring that we never perform worse than UCS.)',
  _,
  'So the art of designing heuristics is to balance informativeness with computational efficiency.',
_);

/*add(quizSlide('search2-sumHeuristics',
  'If $h_1(s)$ and $h_2(s)$ are consistent, is $h_1(s)+h_2(s)$?',
  'yes',
  'no',
_));*/

add(slide('Max of two heuristics',
  'How do we combine two heuristics?',
  proposition('max heuristic',
    'Suppose $h_1(s)$ and $h_2(s)$ are consistent.',
    'Then $h(s) = \\red{\\max\\{h_1(s),h_2(s)\\}}$ is consistent.',
  _),
  stmt('Proof: exercise'),
  //pause(),
  //stmt('Intuition: the larger $h(s)$ is, the better it is, the fewer states $A*$ explores'),
_));

prose(
  'In many situations, you\'ll be able to come up with two heuristics which are both reasonable,',
  'but no one dominates the other.  Which one should you choose?',
  'Fortunately, you don\'t have to choose because you can use both of them!',
  _,
  'The key point is the max of two consistent heuristics is consistent.',
  'Why max?  Remember that we want heuristic values to be larger.',
  'And furthermore, we can prove that taking the max leads to a consistent heuristic.',
  _,
  'Stepping back a bit, there is a deeper takeaway with A* and relaxation here.',
  'The idea is that when you are confronted with a difficult problem,',
  'it is wise to start by solving easier versions of the problem (being an optimist).',
  'The result of solving these easier problems can then be a useful guide in solving the original problem.',
  _,
  'For example, if the relaxed problem turns out to have no solution,',
  'then you don\'t even have to bother solving the original problem,',
  'because a solution can\'t possibly exist (you\'ve been optimistic by using the relaxation).',
_);

add(summarySlide('Summary',
  bulletedText(stmt('Structured Perceptron (reverse engineering): learn cost functions (search + learning)')), pause(),
  bulletedText(stmt('A*: add in heuristic estimate of future costs')), pause(),
  bulletedText(stmt('Relaxation (breaking the rules): framework for producing consistent heuristics')), pause(),
  bulletedText(stmt('Next time: when actions have unknown consequences...')),
_));

initializeLecture();
