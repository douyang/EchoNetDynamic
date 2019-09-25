G = sfig.serverSide ? global : this;
G.prez = presentation();

add(titleSlide('Lecture 5: Search I',
  nil(),
  parentCenter(image('images/maze.jpg').width(300)),
_));

add(quizSlide('search1-start',
  'A <b>farmer</b> wants to get his <b>cabbage</b>, <b>goat</b>, and <b>wolf</b> across a river.  He has a boat that only holds two.  He cannot leave the cabbage and goat alone or the goat and wolf alone.  How many river crossings does he need?',
  '4',
  '5',
  '6',
  '7',
  'no solution',
_));

prose(
  'When you solve this problem, try to think about how you did it.',
  'You probably simulated the scenario in your head,',
  'trying to send the farmer over with the goat and',
  'observing the consequences.',
  'If nothing got eaten, you might continue with the next action.',
  'Otherwise, you undo that move and try something else.',
  _,
  'But the point is not for you to be able to solve this one problem manually.',
  'The real question is: How can we get a machine to do solve all problems like this automatically?',
  'One of the things we need is a systematic approach that considers',
  'all the possibilities.',
  'We will see that <b>search problems</b> define the possibilities,',
  'and <b>search algorithms</b> explore these possibilities.',
_);

add(slide(null,
  parentCenter(image('images/logic_boat.png').scale(0.7)),
_));

prose(
  'This example, taken from <i>xkcd</i>, points out the cautionary tale that sometimes you can do better if you change the model',
  '(perhaps the value of having a wolf is zero) instead of focusing on the algorithm.',
_);

evolutionOfModels(9, 'Search problems');

prose(
  'So far, we have worked with only the simplest types of models &mdash; reflex models. We used these as a starting point to explore machine learning.',
  'Now we will proceed to the first type of state-based models, search problems.',
_);

add(slide('Paradigm',
  nil(),
  parentCenter(paradigm()),
_));

prose(
  'Recall the modeling-inference-learning paradigm.',
  'For reflex-based classifiers, modeling consisted of choosing the features and the neural network architecture;',
  'inference was trivial forward computation of the output given the input;',
  'and learning involved using stochastic gradient descent on the gradient of the loss function,',
  'which might involve backpropagation.',
  _,
  'Today, we will focus on the modeling and inference part of search problems.',
  'The next lecture will cover learning.',
_);

add(slide('Application: route finding',
  parentCenter(image('images/route-finding.png').width(500)),
  pause(),
  stmt('Objective', 'shortest? fastest? most scenic?'),
  stmt('Actions', 'go straight, turn left, turn right'),
_));

prose(
  'Route finding is perhaps the most canonical example of a search problem.',
  'We are given as the input a map, a source point and a destination point.',
  'The goal is to output a sequence of actions (e.g., go straight, turn left, or turn right)',
  'that will take us from the source to the destination.',
  _,
  'We might evaluate action sequences based on an objective (distance, time, or pleasantness).',
_);

add(slide('Application: robot motion planning',
  parentCenter(image('images/robot-grasping.jpg').width(150)),
  pause(),
  stmt('Objective', 'fastest? most energy efficient? safest?'),
  stmt('Actions', 'translate and rotate joints'),
_));

prose(
  'In robot motion planning, the goal is get a robot to move from one position/pose to another.',
  'The desired output trajectory consists of individual actions,',
  'each action corresponding to moving or rotating the joints by a small amount.',
  _,
  'Again, we might evaluate action sequences based on various resources like time or energy.',
_);

add(slide('Application: solving puzzles',
  parentCenter(xtable(
    image('images/rubiks-cube.jpg').width(200),
    image('images/15-puzzle.jpg').width(200),
  _).margin(100)).center(),
  pause(),
  stmt('Objective: reach a certain configuration'),
  stmt('Actions: move pieces (e.g., <tt>Move12Down</tt>)'),
_));

prose(
  'In solving various puzzles, the output solution can be represented by a sequence of individual actions.',
  'In the Rubik\'s cube, an action is rotating one slice of the cube.',
  'In the 15-puzzle, an action is moving one square to an adjacent free square.',
  _,
  'In puzzles, even finding one solution might be an accomplishment.',
  'The more ambitious might want to find the best solution (say, minimize the number of moves).',
_);

add(slide('Application: machine translation',
  parentCenter(yseq(
    'la maison bleue'.italics().fontcolor('green'),
    downArrow(50).strokeWidth(3),
    'the blue house'.italics().fontcolor('blue'),
  _).center()),
  pause(),
  stmt('Objective: fluent English and preserves meaning'),
  stmt('Actions: append single words (e.g., <tt>the</tt>)'),
_));

prose(
  'In machine translation, the goal is to output a sentence that\'s the translation of the given input sentence.',
  'The output sentence can be built out of actions,',
  'each action appending a word or a phrase to the current output.',
_);

add(slide('Beyond reflex',
  stmt('Classifier (reflex-based models)'),
  indent(xtable(
    '$x$',
    rightArrow(50).strokeWidth(5),
    frameBox('$f$'),
    rightArrow(50).strokeWidth(5),
    blue('single action') + ' $\\blue{y \\in \\{-1, +1\\}}$',
  _).center().margin(10)),
  pause(),
  stmt('Search problem (state-based models)'),
  indent(xtable(
    '$x$',
    rightArrow(50).strokeWidth(5),
    frameBox('$f$'),
    rightArrow(50).strokeWidth(5),
    redbold('action sequence')+' $\\red{(a_1, a_2, a_3, a_4, \\dots)}$',
  _).center().margin(10)),
  pause(),
  parentCenter(bold('Key: need to consider future consequences of an action!')),
_));

prose(
  'Last week, we finished our tour of machine learning of <b>reflex-based models</b>',
  '(e.g., linear predictors and neural networks) that output either a $+1$ or $-1$ (for binary classification) or a real number (for regression).',
  _,
  'While reflex-based models were appropriate for some applications such as sentiment classification or spam filtering,',
  'the applications we will look at today, such as solving puzzles, demand more.',
  _,
  'To tackle these new problems, we will introduce <b>search problems</b>,',
  'our first instance of a <b>state-based model</b>.',
  _,
  'In a search problem, in a sense, we are still building a predictor $f$ which takes an input $x$,',
  'but $f$ will now return an entire <b>action sequence</b>, not just a single action.',
  'Of course you should object: can\'t I just apply a reflex model iteratively to generate a sequence?',
  'While that is true, the search problems that we\'re trying to solve importantly',
  'require reasoning about the consequences of the entire action sequence,',
  'and cannot be tackled by myopically predicting one action at a time.',
  _,
  'Tangent: Of course, saying "cannot" is a bit strong, since sometimes a search problem can be solved by a reflex-based model.',
  'You could have a massive lookup table that told you what the best action to take for any given situation.',
  '.It is interesting to think of this as a time/memory tradeoff where reflex-based models are performing an implicit kind of caching.',
  'Going on a further tangent, one can even imagine <b>compiling</b> a state-based model into a reflex-based model;',
  'if you\'re walking around Stanford for the first time, you might have to really plan things out,',
  'but eventually it kind of becomes reflex.',
  _,
  'We have looked at many real-world examples of this paradigm.',
  'For each example, the key is to decompose the output solution into a sequence of primitive actions.',
  'In addition, we need to think about how to evaluate different possible outputs.',
_);

function roadmap(i) {
  var ids = ['treeSearch', 'dp', 'ucs', 'learn'];
  add(roadmapSlide('Roadmap',
    roadmapItem(i == 0, 'Tree search', ids[0]),
    roadmapItem(i == 1, 'Dynamic programming', ids[1]),
    roadmapItem(i == 2, 'Uniform cost search', ids[2]),
  _).id(ids[i]));
}

////////////////////////////////////////////////////////////
// Tree search
roadmap(0);

function formatCGW(s) {
  s = s.replace(/\>/, '$\\triangleright$');
  s = s.replace(/\</, '$\\triangleleft$');
  s = s.replace(/F/, red('F'));
  s = s.replace(/C/, green('C'));
  s = s.replace(/G/, orange('G'));
  s = s.replace(/\|/, '$\\blue{\\|}$');
  return s;
}

function cgwTree(opts) {
  var myPause = opts.pause ? pause : function() { return _; };
  var T = rootedTree;
  var B = rootedTreeBranch;
  var f = function(s) {
    var dir = s.match(/[\<\>]/);
    var quality;
    if (s[0] == '-' || s[0] == '+') {
      quality = s[0];
      s = s.substring(1);
    }
    s = formatCGW(s);
    if (dir) return opaquebg(s);
    var o = frame(text(s)).bg.strokeWidth(1).end.padding(2);
    if (quality == '-') o.bg.fillColor('red').fillOpacity(0.2);
    if (quality == '+') o.bg.fillColor('green').fillOpacity(0.2);
    return o;
  }
  return T(
    f('FCGW|'), myPause(),
    B(f('FC>:1'), T(f('-GW|FC'))),
    myPause(),
    B(f('FG>:1'), T(f('CW|FG'), myPause(), B(f('F<:1'), T(f('FCW|G'),
        myPause(), B(f('FC>:1'), T(f('W|FCG'), myPause(), B(f('F<:1'), f('-FW|CG')), myPause(), B(f('FG<:1'), T(f('FGW|C'), myPause(), B(f('FW>:1'), T(f('G|FCW'), myPause(), B(f('F<:1'), T(f('FG|CW'), myPause(), B(f('FG>:1'), f('+|FCGW')))))))))),
        myPause(), B(f('FW>:1'), T(f('C|FGW'), myPause(), B(f('F<:1'), f('-FC|GW')), myPause(), B(f('FG<:1'), T(f('FCG|W'), myPause(), B(f('FC>:1'), T(f('G|FCW'), myPause(), B(f('F<:1'), T(f('FG|CW'), myPause(), B(f('FG>:1'), f('+|FCGW')))))))))),
    _)))),
    myPause(),
    B(f('FW>:1'), T(f('-CG|FW'))),
  _).recdrawArrow2(true).recnodeBorderWidth(0).recnodePadding(0).recymargin(50).recxmargin(50);
}

add(slide(null,
  parentCenter(image('images/cabbage-goat-wolf.jpg').width(200)),
  parentCenter(xtable(
    formatCGW('Farmer'),
    formatCGW('Cabbage'),
    formatCGW('Goat'),
    formatCGW('Wolf'),
  _).margin(30)),
  stmt('Actions'),
  pause(),
  parentCenter(xtable(
    ytable(
      formatCGW('F>'),
      formatCGW('FC>'),
      formatCGW('FG>'),
      formatCGW('FW>'),
    _).margin(5),
    pause(),
    ytable(
      formatCGW('F<'),
      formatCGW('FC<'),
      formatCGW('FG<'),
      formatCGW('FW<'),
    _).margin(5),
  _).margin(50)),
  pause(),
  stmt('Approach: build a <b>search tree</b> ("what if?")'),
_));

prose(
  'We first start with our boat crossing puzzle.',
  'While you can possibly solve it in more clever ways,',
  'let us approach it in a very brain-dead, simple way,',
  'which allows us to introduce the notation for search problems.',
  _,
  'For this problem, we have eight possible actions, which will be denoted by a concise set of symbols.',
  'For example, the action $\\red{\\text{F}}\\orange{\\text{G}}\\triangleright$ means that',
  'the farmer will take the goat across to the right bank;',
  '$\\red{\\text{F}}\\triangleleft$ means that the farmer is coming back to the left bank alone.',
_);

add(slide(null,
  parentCenter(cgwTree({pause: true}).scale(0.75)),
_));

add(slide('Search problem',
  overlay(
    cgwTree({pause: false}).scale(0.5),
    xtable(xspace(390), searchProblemDefinition().scale(0.8)),
  _).pivot(-1, 1),
_));

prose(
  'We will build what we will call a <b>search tree</b>.',
  'The root of the tree is the start state $\\StartState$,',
  'and the leaves are the end states ($\\IsEnd(s)$ is true).',
  'Each edge leaving a node $s$ corresponds to a possible action $a \\in \\Actions(s)$ that could be performed in state $s$.',
  'The edge is labeled with the action and its cost, written $a : \\Cost(s, a)$.',
  'The action leads deterministically to the successor state $\\Succ(s,a)$, represented by the child node.',
  _,
  'In summary, each root-to-leaf path represents a possible action sequence,',
  'and the sum of the costs of the edges is the cost of that path.',
  'The goal is to find the root-to-leaf path that ends in a valid end state with minimum cost.',
  _,
  'Note that in code, we usually do not build the search tree as a concrete data structure.',
  'The search tree is used merely to visualize the computation of the search algorithms',
  'and study the structure of the search problem.',
  _,
  //'Note that right now, there is a one-to-one correspondence between the state (node) and the sequence',
  //'of actions (labels on the edges) that was taken from the initial state.',
  //'Later, when we talk about dynamic programming, this will no longer be true.',
  //_,
  'For the boat crossing example, we have assumed each action (a safe river crossing) costs 1 unit of time.',
  'We disallow actions that return us to an earlier configuration.',
  'The green nodes are the end states.',
  'The red nodes are not end states but have no successors (they result in the demise of some animal or vegetable).',
  'From this search tree, we see that there are exactly two solutions,',
  'each of which has a total cost of 7 steps.',
_);

add(slide('Transportation example',
  example('transportation',
    'Street with blocks numbered $1$ to $n$.',
    'Walking from $s$ to $s+1$ takes 1 minute.',
    'Taking a magic tram from $s$ to $2s$ takes 2 minutes.',
    'How to travel from $1$ to $n$ in the least time?',
  _),
  // parentCenter('[live solution: <tt>TransportationProblem</tt>]'),
  parentCenter(linkToVideo('[semi-live solution: <tt>TransportationProblem</tt>]', 'tram.mp4')),
_).leftHeader(image('images/tram.jpg').width(150)));

prose(
  'Let\'s consider another problem and practice modeling it as a search problem.',
  'Recall that this means specifying precisely what the states, actions, goals, costs, and successors are.',
  _,
  'To avoid the ambiguity of natural language, we will do this directly in code,',
  'where we define a <tt>SearchProblem</tt> class and implement the methods:',
  '<tt>startState</tt>, <tt>isEnd</tt> and <tt>succAndCost</tt>.',
_);

add(slide('Backtracking search',
  parentCenter(polygon([-300, 0], [300, 0], [0, up(100)])),
  parentCenter('[whiteboard: search tree]'),
  pause(),
  'If $b$ actions per state, maximum depth is $D$ actions:', pause(),
  headerList(null,
    stmt('Memory: $O(D)$ ('+green('small')+')'), pause(),
    stmt('Time: $O(b^D)$ ('+red('huge')+') [$2^{50} = 1125899906842624$]'),
  _),
_));

prose(
  'Now let\'s put modeling aside and suppose we are handed a search problem.',
  'How do we construct an algorithm for finding a <b>minimum cost path</b> (not necessarily unique)?',
  _,
  'We will start with <b>backtracking search</b>, the simplest algorithm which just tries all paths.',
  'The algorithm is called recursively on the current state $s$ and the path leading up to that state.',
  'If we have reached a goal, then we can update the minimum cost path with the current path.',
  'Otherwise, we consider all possible actions $a$ from state $s$, and recursively search',
  'each of the possibilities.',
  _,
  'Graphically, backtracking search performs a depth-first traversal of the search tree.',
  'What is the time and memory complexity of this algorithm?',
  _,
  'To get a simple characterization, assume that the search tree has maximum depth $D$ (each path consists of $D$ actions/edges)',
  'and that there are $b$ available actions per state (the <b>branching factor</b> is $b$).',
  _,
  'It is easy to see that backtracking search only requires $O(D)$ memory (to maintain the stack for the recurrence),',
  'which is as good as it gets.',
  _,
  'However, the running time is proportional to the number of nodes in the tree,',
  'since the algorithm needs to check each of them.',
  'The number of nodes is $1 + b + b^2 + \\cdots + b^D = \\frac{b^{D+1} - 1}{b-1} = O(b^D)$.',
  'Note that the total number of nodes in the search tree is on the same order as the number of leaves,',
  'so the cost is always dominated by the last level.',
  _,
  'In general, there might not be a finite upper bound on the depth of a search tree.',
  'In this case, there are two options: (i) we can simply cap the maximum depth and give up after a certain point',
  'or (ii) we can disallow visits to the same state.',
  _,
  'It is worth mentioning that the greedy algorithm that repeatedly chooses the lowest action myopically won\'t work.',
  'Can you come up with an example?',
_);

add(slide('Backtracking search',
  algorithm('backtracking search',
    'def backtrackingSearch($s$, path):',
    indent('If $\\IsEnd(s)$: update minimum cost path'),
    indent('For each action $a \\in \\Actions(s)$:'),
    indent(indent('Extend path with $\\Succ(s, a)$ and $\\Cost(s, a)$')),
    indent(indent('Call backtrackingSearch($\\Succ(s, a)$, path)')),
    indent('Return minimum cost path'),
  _).scale(0.85),
  // parentCenter('[live solution: <tt>backtrackingSearch</tt>]'),
  parentCenter(linkToVideo('[semi-live solution: <tt>backtrackingSearch</tt>]', 'backtrackingSearch.mp4')),
_));


add(slide('Depth-first search',
  assumption('zero action costs',
    'Assume action costs $\\Cost(s,a) = 0$.',
  _), pause(),
  stmt('Idea: Backtracking search + stop when find the first end state.'),
  pause(),
  'If $b$ actions per state, maximum depth is $D$ actions:', pause(),
  headerList(null,
    stmt('Space: still $O(D)$'), pause(),
    stmt('Time: still $O(b^D)$ worst case, but could be much better if solutions are easy to find'),
  _),
_));

prose(
  'Backtracking search will always work (i.e., find a minimum cost path), but there are cases where we can do it faster.',
  'But in order to do that, we need some additional assumptions &mdash; there is no free lunch.',
  _,
  'Suppose we make the assumption that all the action costs are zero.',
  'In other words, all we care about is finding a valid action sequence that reaches the goal.',
  'Any such sequence will have the minimum cost: zero.',
  _,
  'In this case, we can just modify backtracking search to not keep track of costs and then stop searching as soon as we reach a goal.',
  'The resulting algorithm is <b>depth-first search</b> (DFS), which should be familiar to you.',
  'The worst time and space complexity are of the same order as backtracking search.',
  'In particular, if there is no path to an end state, then we have to search the entire tree.',
  _,
  'However, if there are many ways to reach the end state,',
  'then we can stop much earlier without exhausting the search tree.',
  'So DFS is great when there are an abundance of solutions.',
_);

add(slide('Breadth-first search',
  assumption('constant action costs',
    'Assume action costs $\\Cost(s,a) = c$ for some $c \\ge 0$.',
  _), pause(),
  stmt('Idea: explore all nodes in order of increasing depth.'),
  pause(),
  stmt('Legend: $b$ actions per state, solution has $d$ actions'), pause(),
  headerList(null,
    stmt('Space: now $\\red{O(b^d)}$ (a lot worse!)'), pause(),
    stmt('Time: $O(b^d)$ (better, depends on $d$, not $D$)'),
  _),
_));

prose(
  '<b>Breadth-first search</b> (BFS), which should also be familiar,',
  'makes a less stringent assumption, that all the action costs are the same non-negative number.',
  'This effectively means that all the paths of a given length have the same cost.',
  _,
  'BFS maintains a queue of states to be explored.',
  'It pops a state off the queue, then pushes its successors back on the queue.',
  _,
  'BFS will search all the paths consisting of one edge, two edges, three edges, etc., until it finds a path that reaches a end state.',
  'So if the solution has $d$ actions, then we only need to explore $O(b^d)$ nodes, thus taking that much time.',
  _,
  'However, a potential show-stopper is that BFS also requires $O(b^d)$',
  'space since the queue must contain all the nodes of a given level of the search tree.',
  'Can we do better?',
_);

add(slide('DFS with iterative deepening',
  assumption('constant action costs',
    'Assume action costs $\\Cost(s,a) = c$ for some $c \\ge 0$.',
  _), pause(),
  headerList('Idea',
    'Modify DFS to stop at a maximum depth.',
    'Call DFS for maximum depths $1, 2, \\dots$.',
  _),
  parentCenter('DFS on $d$ asks: is there a solution with $d$ actions?'),
  pause(),
  stmt('Legend: $b$ actions per state, solution size $d$'), pause(),
  headerList(null,
    stmt('Space: $O(d)$ (saved!)'), pause(),
    stmt('Time: $O(b^d)$ (same as BFS)'),
  _),
_).rightHeader(image('images/dog-on-leash.jpg')));

prose(
  'Yes, we can do better with a trick called <b>iterative deepening</b>.',
  'The idea is to modify DFS to make it stop after reaching a certain depth.',
  'Therefore, we can invoke this modified DFS',
  'to find whether a valid path exists with at most $d$ edges,',
  'which as discussed earlier takes $O(d)$ space and $O(b^d)$ time.',
  _,
  'Now the trick is simply to invoke this modified DFS with cutoff depths of $1, 2, 3, \\dots$ until we find a solution or give up.',
  'This algorithm is called DFS with iterative deepening (DFS-ID).',
  'In this manner, we are guaranteed optimality when all action costs are equal (like BFS),',
  'but we enjoy the parsimonious space requirements of DFS.',
  _,
  'One might worry that we are doing a lot of work, searching some nodes many times.',
  'However, keep in mind that both the number of leaves and the number of nodes in a search tree is $O(b^d)$',
  'so asymptotically DFS with iterative deepening is the same time complexity as BFS.',
_);

add(summarySlide('Tree search algorithms',
  stmt('Legend: $b$ actions/state, solution depth $d$, maximum depth $D$'),
  parentCenter(table(
    [bold('Algorithm'), bold('Action costs'), bold('Space'), bold('Time')],
    ['DFS', 'zero', '$\\green{O(D)}$', '$\\red{O(b^D)}$'],
    ['BFS', 'constant $\\geq 0$', '$\\red{O(b^d)}$', '$\\red{O(b^d)}$'],
    ['DFS-ID', 'constant $\\geq 0$', '$\\green{O(d)}$', '$\\red{O(b^d)}$'],
    ['Backtracking', 'any', '$\\green{O(D)}$', '$\\red{O(b^D)}$'],
  _).margin(40, 10)),
  pause(),
  headerList(null,
    'Always exponential time',
    'Avoid exponential space with DFS-ID',
  _),
_));

prose(
  'Here is a summary of all the tree search algorithms, the assumptions on the action costs,',
  'and the space and time complexities.',
  _,
  'The take-away is that we can\'t avoid the exponential time complexity,',
  'but we can certainly have linear space complexity.',
  'Space is in some sense the more critical dimension in search problems.',
  'Memory cannot magically grow, whereas time "grows" just by running an algorithm for a longer period of time,',
  'or even by parallelizing it across multiple machines (e.g., where each processor gets its own subtree to search).',
_);

////////////////////////////////////////////////////////////
// Dynamic programming
roadmap(1);

add(slide('Dynamic programming',
  parentCenter(rootedTree(
    'state $s$',
    rootedTreeBranch(opaquebg('$\\red{\\Cost(s, a)}$'),
      rootedTree('state $s\'$', rootedTreeBranch(opaquebg('$\\blue{\\FutureCost(s\')}$'), 'end state')).ymargin(100),
    _),
  _).ymargin(60)).recverticalCenterEdges(true),
  pause(),
  stmt('Minimum cost path from state $s$ to a end state'),
  parentCenter(nowrapText('$\\displaystyle \\FutureCost(s) = \\begin{cases} 0 & \\text{if $\\IsEnd(s)$} \\\\ \\min_{a \\in \\Actions(s)} [\\red{\\Cost(s, a)} + \\blue{\\FutureCost(\\Succ(s, a))}] & \\text{otherwise} \\end{cases}$').scale(0.6)),
_));

prose(
  'Now let\'s see if we can avoid the exponential running time of tree search.',
  'Our first algorithm will be dynamic programming.',
  'We have already seen dynamic programming in specific contexts.',
  'Now we will use the search problem abstraction to define a single dynamic program for all search problems.',
  _,
  'First, let us try to think about the minimum cost path in the search tree recursively.',
  'Define $\\FutureCost(s)$ as the cost of the minimum cost path from $s$ to a end state.',
  'The minimum cost path starting with a state $s$ to a end state must take a first action $a$,',
  'which results in another state $s\'$, from which we better take a minimum cost path to a end state.',
  _,
  'Written in symbols, we have a nice recurrence.',
  'Throughout this course, we will see many recurrences of this form.',
  'The basic form is a base case (when $s$ is a end state) and an inductive case,',
  'which consists of taking the minimum over all possible actions $a$ from $s$,',
  'taking an initial step resulting in an <b>immediate</b> action cost $\\Cost(s, a)$',
  'and a <b>future</b> cost.',
_);

function cityTravelTree(i, n, hi) {
  var label = ''+(i+1);
  var items = [i == hi ? redbold(label) : (i == n-1 ? greenbold(label) : label)];
  for (var j = i+1; j < n; j++)
    items.push(cityTravelTree(j, n, hi));
  return rootedTree.apply(null, items).drawArrow2(true).verticalCenterEdges(true);
}

function cityTravelGraph(n, sparse, atLeast3) {
  var matrix = [];
  var allItems = [];
  var Q = atLeast3 ? 3 : 1;
  var colors = ['red', 'green', 'blue'];
  for (var q = 0; q < Q; q++) {
    var items = [];
    matrix.push(items);
    for (var i = 0; i < n; i++) {
      var alpha = 1.0*i/(n-1);
      var angle = (1-alpha) * (-Math.PI) + alpha * 0;
      var len = 200;
      var d = 50;
      var dx = q * d;
      var dy = q * d;
      var desc = atLeast3 ? text((q+1)+','+(i+1)).scale(0.8) : (i+1);
      var v = node(desc).shiftBy(len * Math.cos(angle) + dx, len * Math.sin(angle) + dy);
      if (atLeast3) v.strokeColor(colors[q]);
      items.push(v);
      allItems.push(v);
    }
  }
  for (var q = 0; q < Q; q++) {
    var items = matrix[q];
    for (var i = 0; i < n; i++) {
      for (var j = i+1; j < n; j++) {
        if (sparse && j - i > 2) continue;
        var qq = Math.min(Q-1, q + (j % 2 == 0 ? 1 : 0));
        var a = arrow(matrix[q][i], matrix[qq][j]); //.color(q == qq ? 'blue' : 'red');
        allItems.push(a);
      }
    }
  }

  return new Overlay(allItems);
}

add(slide('Motivating task',
  example('route finding',
    'Find the minimum cost path from city $1$ to city $n$, only moving forward.  It costs $c_{ij}$ to go from $i$ to $j$.',
  _),
  pause(),
  parentCenter(stagger(
    cityTravelTree(0, 4).scale(0.7),
    cityTravelTree(0, 7, 4).scale(0.4),
  _).center()),
  pause(),
  stmt('Observation: future costs only depend on current city'),
_));

prose(
  'Now let us see if we can avoid the exponential time.',
  'If we consider the simple route finding problem of traveling from city $1$ to city $n$,',
  'the search tree grows exponentially with $n$.',
  _,
  'However, upon closer inspection, we note that this search tree has a lot of repeated structures.',
  'Moreover (and this is important), the future costs (the minimum cost of reaching a end state) of a state',
  'only depends on the current city!',
  'So therefore, all the subtrees rooted at city $5$, for example, have the same minimum cost!',
  _,
  'If we can just do that computation once, then we will have saved big time.',
  'This is the central idea of <b>dynamic programming</b>.',
  _,
  'We\'ve already reviewed dynamic programming in the first lecture.',
  'The purpose here is to construct one generic dynamic programming solution that will work on any search problem.',
  'Again, this highlights the useful division between modeling (defining the search problem) and algorithms (performing the actual search).',
_);

add(slide('Dynamic programming',
  stagger(
    bluebold('State')+': past sequence of actions',
    bluebold('State')+': <del>past sequence of actions</del> current city',
  _),
  pause(),
  parentCenter(cityTravelGraph(7).scale(0.9)),
  parentCenter(greenbold('Exponential saving in time and space!')),
_));

prose(
  'Let us collapse all the nodes that have the same city into one.',
  'This provides us with no longer a tree, but a directed acyclic graph with only $n$ nodes rather than exponential in $n$ nodes.',
  _,
  'Note that dynamic programming is only useful if we can define a search problem where',
  'the number of states is small enough to fit in memory.',
_);

add(slide('Dynamic programming',
  algorithm('dynamic programming',
    'def $\\text{DynamicProgramming}(s)$:',
    indent(greenbold('If already computed for $s$, return cached answer.')),
    indent('If $\\IsEnd(s)$: return solution'),
    indent('For each action $a \\in \\Actions(s)$: ...'),
  _).scale(0.9),
  // parentCenter('[live solution]'),
  parentCenter(linkToVideo('[semi-live solution: <tt>Dynamic Programming</tt>]', 'dynamicProgramming.mp4')),
  pause(),
  assumption('acyclicity', 'The state graph defined by $\\Actions(s)$ and $\\Succ(s, a)$ is acyclic.'),
_));

prose(
  'The dynamic programming algorithm is exactly backtracking search with one twist.',
  'At the beginning of the function, we check to see if we\'ve already computed the future cost for $s$.',
  'If we have, then we simply return it (which takes constant time if we use a hash map).',
  'Otherwise, we compute it and save it in the cache so we don\'t have to recompute it again.',
  'In this way, for every state, we are only computing its value once.',
  _,
  'For this particular example, the running time is $O(n^2)$, the number of edges.',
  _,
  'One important point is that the graph must be acyclic for dynamic programming to work.',
  'If there are cycles, the computation of a future cost for $s$ might depend on $s\'$ which might depend on $s$.',
  'We will infinite loop in this case.',
  'To deal with cycles, we need uniform cost search, which we will describe later.',
_);

function stateAug1() {
  var T = rootedTree;
  var B = rootedTreeBranch;
  var e = function(x) { return opaquebg(x).scale(0.9); }
  return T(
    '$\\text{n/a},1$',
    pause(), B(e('$3$:$c_{13}$'), T('$\\text{odd},3$', pause(), B(e('$7$:$c_{37}$'), '$\\red{\\text{odd},7}$'), pause(), B(e('$4$:$c_{34}$'), '$\\text{odd},4$'))),
    pause(), B(e('$4$:$c_{14}$'), T('$\\text{odd},4$', pause(), B(e('$5$:$c_{45}$'), '$\\text{even},5$'))),
  _).recymargin(70).recxmargin(70).scale(0.8).recverticalCenterEdges(true);
}

add(slide('Dynamic programming',
  nil(),
  keyIdea('state',
    'A <b>state</b> is a summary of all the past actions sufficient to choose future actions <b>optimally</b>.',
  _),
  parentCenter(table(
    ['past actions (all cities)', '1 3 4 6'],
    ['state (current city)', lightgray('1 3 4') + ' 6'],
  _).margin(50, 10)),
_));

prose(
  'So far, we have only considered the example where the cost only depends on the current city.',
  'But let\'s try to capture exactly what\'s going on more generally.',
  _,
  'This is perhaps the most important idea of this lecture: <b>state</b>.',
  'A state is a summary of all the past actions sufficient to choose future actions optimally.',
  _,
  'What state is really about is forgetting the past.',
  'We can\'t forget everything because the action costs in the future might depend on what we did on the past.',
  'The more we forget, the fewer states we have, and the more efficient our algorithm.',
  'So the name of the game is to find the minimal set of states that suffice.  It\'s a fun game.',
_);

add(slide('Handling additional constraints',
  example('route finding',
    'Find the minimum cost path from city $1$ to city $n$, only moving forward.  It costs $c_{ij}$ to go from $i$ to $j$.',
    redbold('Constraint: Can\'t visit three odd cities in a row.'),
  _),
  pause(),
  stagger(
    bluebold('State')+': (previous city, current city)',
    bluebold('State')+': (whether previous city was odd, current city)',
  _),
  pause(),
  parentCenter(stateAug1()),
_));

prose(
  'Let\'s add a constraint that says we can\'t visit three odd cities in a row.',
  'If we only keep track of the current city, and we try to move to a next city, we cannot enforce this constraint because we don\'t know what the previous city was.',
  'So let\'s add the previous city into the state.',
  _,
  'This will work, but we can actually make the state smaller.',
  'We only need to keep track of whether the previous city was an odd numbered city to enforce this constraint.',
  _,
  'Note that in doing so, we have $2n$ states rather than $n^2$ states, which is a substantial savings.',
  'So the lesson is to pay attention to what information you actually need in the state.',
_);

add(quizSlide('search1-atLeast3Cities',
  'Objective: travel from city $1$ to city $n$, visiting at least 3 odd cities.  What is the minimal state?',
_));

add(slide('State graph',
  stmt('State: (min(number of odd cities visited, 3), current city)'),
  parentCenter(stagger(
    cityTravelGraph(6, true, false),
    cityTravelGraph(6, true, true),
  _).center()),
_));

prose(
  'Our first thought might be to remember how many odd cities we have visited so far (and the current city).',
  _,
  'But if we\'re more clever, we can notice that once the number of odd cities is $3$, we don\'t need to keep track of whether that number goes up to $4$ or $5$, etc.',
  'So the state we actually need to keep is $(\\min(\\text{number of odd cities visited}, 3), \\text{current city})$.',
  'Thus, our state space is $O(n)$ rather than $O(n^2)$.',
  _,
  'We can visualize what augmenting the state does to the state graph.',
  'Effectively, we are copying each node $4$ times, and the edges are redirected to move between these copies.',
  _,
  'Note that some states such as $(2,1)$ aren\'t reachable (if you\'re in city $1$, it\'s impossible to have visited $2$ odd cities already);',
  'the algorithm will not touch those states and that\'s perfectly okay.',
_);

add(quizSlide('search1-allCities',
  'Objective: travel from city $1$ to city $n$, visiting more odd than even cities.  What is the minimal state?',
  // (number of odd cities - even cities, current city)
_));

prose(
  'An initial guess might be to keep track of the number of even cities and the number of odd cities visited.',
  _,
  'But we can do better.',
  'We have to just keep track of the number of odd cities minus the number of even cities and the current city.',
  'We can write this more formally as $(n_1 - n_2, \\text{current city})$,',
  'where $n_1$ is the number of odd cities visited so far and $n_2$ is the number of even cities visited so far.',
_);

add(summarySlide('Summary',
  bulletedText(stmt('State: summary of past actions sufficient to choose future actions optimally')),
  pause(),
  bulletedText(stmt('Dynamic programming: backtracking search with <b>memoization</b> &mdash; potentially exponential savings')),
  pause(),
  'Dynamic programming only works for acyclic graphs...what if there are cycles?',
_));

////////////////////////////////////////////////////////////
// Uniform cost search
roadmap(2);

/*Math.seedrandom(3);
function rnd(n) { return Math.random()*n*0.9 + n*0.05; }
var width = 500, height = 150;
var obstacles = wholeNumbers(10).map(function() {
  return polygon(
    [rnd(width), rnd(height)],
    [rnd(width), rnd(height)],
    [rnd(width), rnd(height)]).color('gray'); 
});
add(slide('Continuous state spaces',
  parentCenter(overlay(
    rect(width, height).strokeWidth(2).strokeColor('black'),
    circle(5).fillColor('green').shift(20, height/2),
    circle(5).fillColor('orange').shift(width - 20, height/2),
    new sfig.Overlay(obstacles),
  _)),
  pause(),
  overlay(
    h = headerList(null,
      stmt('States', 'all points $(x,y) \\in [0, 100]^2$'),
      stmt('Actions', 'move in any direction by any distance'),
    _),
    pause(),
    moveRightOf('Infinite!'.fontcolor('red'), h, 40),
  _),
  pause(),
  headerList('Discretization',
    stmt('States', 'corner points of the polygons'),
    stmt('Actions', 'move in straight line to another corner point that doesn\'t intersect rubble'),
  _),
_));*/

add(slide('Ordering the states',
  stmt('Observation: prefixes of optimal path are optimal'),
  parentCenter(overlay(
    xtable(
      s1 = node(),
      xspace(100),
      s2 = node(),
      s3 = node(),
    _).margin(150),
    a1 = arrow(s1, s2),
    a2 = arrow(s2, s3),
    moveBottomOf('$\\StartState$', s1),
    moveBottomOf('$s$', s2),
    moveBottomOf('$s\'$', s3),
    moveTopOf('$\\PastCost(s)$', a1),
    moveTopOf('$\\Cost(s, a)$', a2),
  _)),
  pause(),
  stmt('Key: if graph is acyclic, dynamic programming makes sure we compute $\\PastCost(s)$ before $\\PastCost(s\')$'),
  pause(),
  'If graph is cyclic, then we need another mechanism to order states...',
_));

prose(
  'Recall that we used dynamic programming to compute the future cost of each state $s$,',
  'the cost of the minimum cost path from $s$ to a end state.',
  _,
  'We can analogously define $\\PastCost(s)$, the cost of the minimum cost path from the start state to $s$.',
  'If instead of having access to the successors via $\\Succ(s,a)$,',
  'we had access to predecessors (think of reversing the edges in the state graph),',
  'then we could define a dynamic program to compute all the $\\PastCost(s)$.',
  _,
  'Dynamic programming relies on the absence of cycles, so that there was always a clear order in which',
  'to compute all the past costs.  If the past costs of all the predecessors of a state $s$ are computed,',
  'then we could compute the past cost of $s$ by taking the minimum.',
  _,
  'Note that $\\PastCost(s)$ will always be computed before $\\PastCost(s\')$ if there is an edge from $s$ to $s\'$.',
  'In essence, the past costs will be computed according to a topological ordering of the nodes.',
  _,
  'However, when there are cycles, no topological ordering exists, so we need another way to order the states.',
_);

add(slide('Uniform cost search (UCS)',
  keyIdea('state ordering',
    'UCS enumerates states in order of increasing past cost.',
  _),
  pause(),
  assumption('non-negativity',
    'All action costs are non-negative: $\\Cost(s, a) \\ge 0$.',
  _),
  pause(),
  stmt('UCS in action'),
  parentCenter(youtube('z6lUnb9ktkE', {cache: false})),
  // parentCenter(youtube('z6lUnb9ktkE')),
_));

prose(
  'The key idea that uniform cost search (UCS) uses is to compute the past costs in order of increasing past cost.',
  'To make this efficient, we need to make an important assumption that all action costs are non-negative.',
  _,
  'This assumption is reasonable in many cases, but doesn\'t allow us to handle cases where actions have payoff.',
  'To handle negative costs (positive payoffs), we need the Bellman-Ford algorithm.',
  'When we talk about value iteration for MDPs, we will see a form of this algorithm.',
  _,
  'Note: those of you who have studied algorithms should immediately recognize UCS',
  'as Dijkstra\'s algorithm.',
  'Logically, the two are indeed equivalent.',
  'There is an important implementation difference:',
  'UCS takes as input a <b>search problem</b>,',
  'which implicitly defines a large and even infinite graph,',
  'whereas Dijkstra\'s algorithm (in the typical exposition) takes as input a fully concrete graph.',
  'The implicitness is important in practice because we might be working with an enormous graph (a detailed map of world)',
  'but only need to find the path between two close by points (Stanford to Palo Alto).',
  _,
  'Another difference is that Dijkstra\'s algorithm is usually thought of as finding the shortest path from the start state',
  'to every other node, whereas UCS is explicitly about finding the shortest path to an end state.',
  'This difference is sharpened when we look at the A* algorithm next time,',
  'where knowing that we\'re trying to get to the goal can yield a much faster algorithm.',
  'The name uniform cost search refers to the fact that we are exploring states of the same past cost uniformly',
  '(the video makes this visually clear);',
  'in contrast, A* will explore states which are biased towards the end state.',
  // http://www.aaai.org/ocs/index.php/SOCS/SOCS11/paper/viewFile/4017/4357
_);

add(slide('High-level strategy',
  overlay(
    pause(),
    frontier = ellipse(200, 100).fillColor('green').strokeWidth(2),
    moveTopOf('Frontier', frontier),
    pause(-1),
    explored = ellipse(100, 50).fillColor('orange').strokeWidth(2),
    moveTopOf('Explored', explored),
    pause(2),
    moveRightOf(indent('Unexplored'), frontier),
  _),
  pause(-2),
  headerList(null,
    stmt('Explored: states we\'ve found the optimal path to'), pause(),
    stmt('Frontier: states we\'ve seen, still figuring out how to get there cheaply'), pause(),
    stmt('Unexplored: states we haven\'t seen'),
  _),
_));

prose(
  'The general strategy of UCS is to maintain three sets of nodes: explored, frontier, and unexplored.',
  'Throughout the course of the algorithm, we move states from unexplored to the frontier, and from the frontier to the explored.',
  _,
  'The key invariant is that we have computed the minimum cost paths to all the nodes in the explored set.',
  'So when the end state moves into the explored set, then we are done.',
_);

G.ucsExample = function() {
  var edge = function(s, t, c) {
    return decoratedLine(s, t).label(opaquebg(c).strokeColor('red'));
  };
  return overlay(
    xtable(
      a = node('A'),
      ytable(b = node('B'), c = node('C')).margin(100),
      d = node('D'),
    _).center().margin(100),
    ab = edge(a, b, 1),
    ac = edge(a, c, 100),
    bc = edge(b, c, 1),
    bd = edge(b, d, 100),
    cd = edge(c, d, 1),
  _);
}

add(slide('Uniform cost search example',
  example('UCS example',
    ucsExample(),
    parentCenter('Start state: A, end state: D'),
  _),
  parentCenter('[whiteboard]'),
  pause(),
  stmt('Minimum cost path'),
  parentCenter('A $\\to$ B $\\to$ C $\\to$ D with cost 3'),
_));

prose(
  'Before we present the full algorithm,',
  'let\'s walk through a concrete example.',
  _,
  'Initially, we put A on the frontier.',
  'We then take A off the frontier and mark it as explored.',
  'We add B and C to the frontier with past costs 1 and 100, respectively.',
  _,
  'Next, we remove from the frontier the state with the minimum past cost (priority), which is B.',
  'We mark B as explored and consider successors A, C, D.',
  'We ignore A since it\'s already explored.  The past cost of C gets updated from 100 to 2.',
  'We add D to the frontier with initial past cost 101.',
  _,
  'Next, we remove C from the frontier; its successors are A, B, D.',
  'A and B are already explored, so we only update D\'s past cost from 101 to 3.',
  _,
  'Finally, we pop D off the frontier, find that it\'s a end state,',
  'and terminate the search.',
_);

add(slide('Uniform cost search (UCS)',
  algorithm('uniform cost search [Dijkstra, 1956]',
    'Add $\\StartState$ to <b>frontier</b> (priority queue)',
    'Repeat until frontier is empty:',
    indent('Remove $s$ with smallest priority $p$ from frontier'),
    indent('If $\\IsEnd(s)$: return solution'),
    indent('Add $s$ to <b>explored</b>'),
    indent('For each action $a \\in \\Actions(s)$:'),
    indent(indent('Get successor $s\' \\leftarrow \\Succ(s, a)$')),
    indent(indent('If $s\'$ already in explored: continue')),
    indent(indent(nowrapText('Update <b>frontier</b> with $s\'$ and priority $p + \\Cost(s, a)$'))),
  _).scale(0.95),
  // parentCenter('[live solution]'),
  parentCenter(linkToVideo('[semi-live solution: <tt>Uniform Cost Search</tt>]', 'uniformCostSearch.mp4')),
_));

prose(
  'Implementation note: we use <tt>util.PriorityQueue</tt> which supports <tt>removeMin</tt> and <tt>update</tt>.',
  'Note that <tt>frontier.update(state, pastCost)</tt> returns whether <tt>pastCost</tt> improves',
  'the existing estimate of the past cost of <tt>state</tt>.',
_);

add(slide('Analysis of uniform cost search',
  theorem('correctness',
    'When a state $s$ is popped from the frontier and moved to explored, its priority is $\\PastCost(s)$, the minimum cost to $s$.',
  _), pause(),
  stmt('Proof'),
  parentCenter(overlay(
    explored = ellipse(150, 80).fillColor('green').strokeWidth(2).fillOpacity(0.5),
    moveTopOf('Explored', explored),
    s0 = circle(5).color('black'), moveLeftOf('$\\StartState$', s0),
    s = moveRightOf(circle(5).color('black'), explored, 20),
    moveRightOf('$s$', s),
    t = circle(5).color('black').shiftBy(explored.xradius().sub(40), explored.yradius().sub(35)),
    moveBottomOf('$t$', t),
    arrow(s0, s).color('blue').strokeWidth(2),
    arrow(s0, t).color('red').strokeWidth(2),
    tt = circle(5).color('black').shift(t.xmiddle().add(30), t.ymiddle()),
    moveBottomOf('$u$', tt),
    line(t, tt).color('red').strokeWidth(2),
    arrow(tt, s).color('red').strokeWidth(2),
  _)),
_));

prose(
  'Let $p_s$ be the priority of $s$ when $s$ is popped off the frontier.',
  'Since all costs are non-negative, $p_s$ increases over the course of the algorithm.',
  _,
  'Inductive hypothesis: $p_s = \\PastCost(s)$'.
  _,
  'Suppose we pop $s$ off the frontier.  Let the blue path denote the path with cost $p_s$.',
  _,
  'Consider any alternative red path from the start state to $s$.',
  'The red path must leave the explored region at some point; let $t$ and $u = \\Succ(t, a)$ be the first pair of states straddling the boundary.',
  'We want to show that the red path cannot be cheaper than the blue path via a string of inequalities.',
  _,
  'First, by definition of $\\PastCost(t)$ and non-negativity of edge costs,',
  'the cost of the red path is at least the cost of the part leading to $u$,',
  'which is $\\PastCost(t) + \\Cost(t, a) = p_t + \\Cost(t, a)$,',
  'where the last equality is by the inductive hypothesis.',
  _,
  'Second, we have $p_t + \\Cost(t, a) \\ge p_u$ since we updated the frontier based on $(t,a)$.',
  _,
  'Third, we have that $p_u \\ge p_s$ because $s$ was the minimum cost state on the frontier.',
  _,
  'Note that $p_s$ is the cost of the blue path.',
_);

/*add(slide('Implementation',
  headerList('Priority queue (UCS)', 'Pop and update operations take $O(\\log(\\text{number of states on frontier}))$ time'),
  pause(),
  headerList('Regular queue (BFS)', 'Pop and update Operations take $O(1)$ time', pause(), 'Works only when action costs are constant'),
_));*/

add(slide('DP versus UCS',
  '$N$ total states, $n$ of which are closer than end state',
  parentCenter(table(
    ['Algorithm', 'Cycles?', 'Action costs', 'Time/space'].map(bold),
    ['DP', 'no', 'any', '$O(N)$'],
    //['BFS', 'yes', '$constant$', 'simple route finding'],
    ['UCS', 'yes', '$\\ge 0$', '$O(n \\log n)$'],
    //['Bellman-Ford', 'yes', 'anything', 'handle rewards'],
  _).margin(50, 20)),
  stmt('Note: UCS potentially explores fewer states, but requires more overhead to maintain the priority queue'),
  stmt('Note: assume number of actions per state is constant (independent of $n$ and $N$)'),
_));

prose(
  'DP and UCS have complementary strengths and weaknesses; neither dominates the other.',
  _,
  'DP can handle negative action costs, but is restricted to acyclic graphs.',
  'It also explores all $N$ reachable states from $\\StartState$, which is inefficient.',
  'This is unavoidable due to negative action costs.',
  _,
  'UCS can handle cyclic graphs, but is restricted to non-negative action costs.',
  'An advantage is that it only needs to explore $n$ states,',
  'where $n$ is the number of states which are cheaper to get to than any end state.',
  'However, there is an overhead with maintaining the priority queue.',
  _,
  'One might find it unsatisfying that UCS can only deal with non-negative action costs.',
  'Can we just add a large positive constant to each action cost to make them all non-negative?',
  'It turns out this doesn\'t work because it penalizes longer paths more than shorter paths,',
  'so we would end up solving a different problem.',
_);

add(summarySlide('Summary',
  bulletedText(stmt('Tree search: memory efficient, suitable for huge state spaces but exponential worst-case running time')).autowrap(true), pause(),
  bulletedText(stmt('State: summary of past actions sufficient to choose future actions optimally')), pause(),
  bulletedText(stmt('Graph search: dynamic programming and uniform cost search construct optimal paths (exponential savings!)')), pause(),
  bulletedText(stmt('Next time: learning action costs, searching faster with A*')),
_));

prose(
  'We started out with the idea of a search problem,',
  'an abstraction that provides a clean interface between modeling and algorithms.',
  _,
  'Tree search algorithms are the simplest: just try exploring all possible states and actions.',
  'With backtracking search and DFS with iterative deepening,',
  'we can scale up to huge state spaces since the memory usage only depends on the number of actions',
  'in the solution path.',
  'Of course, these algorithms necessarily take exponential time in the worst case.',
  _,
  'To do better, we need to think more about bookkeeping.',
  'The most important concept from this lecture is the idea of a <b>state</b>,',
  'which contains all the information about the past to act optimally in the future.',
  'We saw several examples of traveling between cities under various constraints,',
  'where coming up with the proper minimal state required a deep understanding of search.',
  _,
  'With an appropriately defined state, we can apply either dynamic programming or UCS,',
  'which have complementary strengths.  The former handles negative action costs and the latter handles cycles.',
  'Both require space proportional to the number of states,',
  'so we need to make sure that we did a good job with the modeling of the state.',
_);

sfig.initialize();
