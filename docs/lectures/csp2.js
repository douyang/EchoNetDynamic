G = sfig.serverSide ? global : this;
G.prez = presentation();

function table_f1() {
  return frameBox(table(
    ['$x_1$', '$x_2$', '$f_1(x_1, x_2)$'],
    ['$\\vR$', '$\\vR$', 0],
    ['$\\vR$', '$\\vB$', 1],
    ['$\\vB$', '$\\vR$', 1],
    ['$\\vB$', '$\\vB$', 0],
  _).center().margin(15, 5));
}

function table_f2() {
  return frameBox(table(
    ['$x_2$', '$x_3$', '$f_2(x_2, x_3)$'],
    ['$\\vR$', '$\\vR$', 2],
    ['$\\vR$', '$\\vB$', 1],
    ['$\\vB$', '$\\vR$', 1],
    ['$\\vB$', '$\\vB$', 2],
  _).center().margin(15, 5));
}

function table_f12() {
  return frameBox(table(
    ['$x_1$', '$x_2$', '$f(x_1, x_2)$'],
    ['$\\vR$', '$\\vR$', 1],
    ['$\\vR$', '$\\vB$', 7],
    ['$\\vB$', '$\\vR$', 3],
    ['$\\vB$', '$\\vB$', 2],
  _).center().margin(15, 5));
}

function table_g() {  // Conditioning
  return frameBox(table(
    ['$x_1$', '$g(x_1)$'],
    ['$\\vR$', 7],
    ['$\\vB$', 2],
  _).center().margin(15, 5));
}

function table_h() {  // Elimination
  return frameBox(table(
    ['$x_1$', '$h(x_1)$'],
    ['$\\vR$', 7],
    ['$\\vB$', 3],
  _).center().margin(15, 5));
}

function table_f13() {
  return frameBox(table(
    ['$x_1$', '$x_3$', '$f_{13}(x_1, x_3)$'],
    ['$\\vR$', '$\\vR$', 4],
    ['$\\vR$', '$\\vB$', 1],
    ['$\\vB$', '$\\vR$', 1],
    ['$\\vB$', '$\\vB$', 4],
  _).center().margin(15, 5)).scale(0.7);
}

function table_f34() {
  return frameBox(table(
    ['$x_3$', '$x_4$', '$f_{34}(x_3, x_4)$'],
    ['$\\vR$', '$\\vR$', 1],
    ['$\\vR$', '$\\vB$', 2],
    ['$\\vB$', '$\\vR$', 2],
    ['$\\vB$', '$\\vB$', 1],
  _).center().margin(15, 5)).scale(0.7);
}

function table_f14() {
  return frameBox(table(
    ['$x_1$', '$x_4$', '$f_{14}(x_1, x_4)$'],
    ['$\\vR$', '$\\vR$', '$\\max(4 \\cdot 1, 1 \\cdot 2) = 4$'],
    ['$\\vR$', '$\\vB$', '$\\max(4 \\cdot 2, 1 \\cdot 1) = 8$'],
    ['$\\vB$', '$\\vR$', '$\\max(1 \\cdot 1, 4 \\cdot 2) = 8$'],
    ['$\\vB$', '$\\vB$', '$\\max(1 \\cdot 2, 4 \\cdot 1) = 4$'],
  _).center().margin(15, 5)).scale(0.7);
}

////////////////////////////////////////////////////////////

add(titleSlide('Lecture 12: CSPs II',
  nil(),
  parentCenter(image('images/sodoku-green.jpg').width(300)),
_));

/*add(quizSlide('csp2-start',
  'What is the optimal time complexity for finding the maximum weight assignment for a $2 \\times L$ factor graph?',
  '$O(1)$',
  '$O(L)$',
  '$O(L^2)$',
  '$O(2^L)$',
_));*/

add(slide('Review: definition',
  parentCenter(exampleFactorGraph()),
  definition('factor graph',
    stmt('Variables'),
    indent('$X = (X_1, \\dots, X_n)$, where $X_i \\in \\Domain_i$'),
    pause(),
    stmt('Factors'),
    indent('$f_1, \\dots, f_m$, with each $f_j(X) \\ge 0$'),
    indent('Scope of $f_j$: set of dependent variables'),
  _),
_));

prose(
  'Recall the definition of a factor graph:',
  'we have a set of variables $X_1, \\dots, X_n$ and a set of factors $f_1, \\dots, f_m$.',
  _,
  'Each factor $f_j$ is a function that takes an assignment to the variables and returns',
  'a non-negative number $f_j(X)$ indicating how much that factor likes that assignment.',
  'A zero return value signifies a (hard) constraint that the assignment is to be avoided at all costs.',
  _,
  'Each factor $f_j$ depends on only variables in its scope,',
  'which is usually a much smaller subset of the variables.',
  _,
  'Factor graphs are typically visualized graphically in a way what highlights the dependencies',
  'between variables and factors.',
_);

function table_f1() {
  return frameBox(table(
    ['$x_1$', '$f_1(x_1)$'],
    ['$\\vR$', 0],
    ['$\\vB$', 1],
  _).center().margin(15, 5));
}

function table_f2() {
  return frameBox(table(
    ['$x_1$', '$x_2$', '$f_2(x_1, x_2)$'],
    ['$\\vR$', '$\\vR$', 1],
    ['$\\vR$', '$\\vB$', 0],
    ['$\\vB$', '$\\vR$', 0],
    ['$\\vB$', '$\\vB$', 1],
  _).center().margin(15, 5));
}

function table_f3() {
  return frameBox(table(
    ['$x_2$', '$x_3$', '$f_3(x_2, x_3)$'],
    ['$\\vR$', '$\\vR$', 3],
    ['$\\vR$', '$\\vB$', 2],
    ['$\\vB$', '$\\vR$', 2],
    ['$\\vB$', '$\\vB$', 3],
  _).center().margin(15, 5));
}

function table_f4() {
  return frameBox(table(
    ['$x_3$', '$f_4(x_3)$'],
    ['$\\vR$', 2],
    ['$\\vB$', 1],
  _).center().margin(15, 5));
}

function person() {
  return xtable(
    image('images/person.jpg').width(30),
    text('$\\vB$ or $\\vR$?').scale(0.8),
  _);
}

add(slide('Factor graph (example)',
  parentCenter(xtable(
    person(), pause(),
    ytable(brownitalics('must'), brownitalics('agree')).center().scale(0.8), pause(-1),
    person(), pause(),
    ytable(brownitalics('tend to'), brownitalics('agree')).center().scale(0.8), pause(-1),
    person(),
  _).center().margin(40)),
  nil(),
  pause(2),
  parentCenter(exampleFactorGraph()),
  nil(),
  pause(),
  parentCenter(table(
    [
      table_f1(),
      pause(),
      table_f2(),
      pause(),
      table_f3(),
      pause(),
      table_f4(),
    ], pause(-3),
    [nil(), pause(),
     text('$f_2(x_1, x_2) = [x_1 = x_2]$'), pause(),
     text('$f_3(x_2, x_3) = [x_2 = x_3] + 2$'), pause(),
     nil(),
    ],
  _).center().margin(40, 20)).scale(0.6),
  //pause(),
  //parentCenter(text('[demo]').linkToUrl('index.html#include=inference-demo.js&example=vote')),
_));

add(slide('Review: definition',
  definition('assignment weight',
    'Each <b>assignment</b> $x = (x_1, \\dots, x_n)$ has a weight:',
    parentCenter('$\\displaystyle \\Weight(x) = \\prod_{j=1}^m f_j(x)$'),
    //'(Weight of partial assignment is product over factors which are )',
  _),
  pause(),
  stmt('Objective', 'find a maximum weight assignment'),
  parentCenter('$\\displaystyle \\arg\\max_{x} \\Weight(x)$'),
_));

prose(
  'The weight of an assignment $x$ is defined as the product of all the factors applied to $x$.',
  'Since it\'s a product, all factors have to unanimously like an assignment for the assignment to have high weight.',
  _,
  'Our objective is to find an assignment with the maximum weight',
  '(not to be confused with the weights in machine learning).',
_);

add(slide(null,
  parentCenter(australiaBacktrackingTree()),
_).leftHeader(ytable(
  text(darkblue('Search')).scale(3),
  text(red('WA,V,T')+',Q,NT,SA,NSW').scale(1.5),
_)));

add(slide('Review: backtracking search',
  stmt('Vanilla version'),
  parentCenter('$O(|\\Domain|^n)$ time'),
  pause(),
  stmt('Lookahead: forward checking, AC-3'),
  pause(),
  parentCenter('$O(|\\Domain|^n)$ time').scale(0.8),
  pause(),
  stmt('Dynamic ordering: most constrained variable, least constrained value'),
  pause(),
  parentCenter('$O(|\\Domain|^n)$ time').scale(0.6),
  pause(),
  stmt('Note: these pruning techniques useful only for constraints'),
_));

prose(
  'Last time, we talked about backtracking search as a way to find maximum weight assignments.',
  'In the worst case, without any further assumptions on the factor graph, this requires exponential time.',
  'We can be more clever and employ lookahead and dynamic ordering,',
  'which in some cases can dramatically improve running time, but in the worst case, it\'s still exponential.',
  _,
  'Also, these heuristics are only helpful when there are hard constraints,',
  'which allow us to prune away values in the domains of variables which definitely',
  'are not compatible with the current assignment.',
  _,
  'What if all the factors were strictly positive?',
  'None of the pruning techniques we encountered would be useful at all.',
  'Thus we need new techniques.',
_);

add(slide('Example: object tracking',
  stmt('Setup', 'sensors (e.g., camera) provides noisy information about location of an object (e.g., video frames)'),
  stmt('Goal:  infer object\'s true location'),
  parentCenter(youtube('B4ianyQTnCE')),
_));

prose(
  'As motivation, we will consider object (e.g., person) tracking,',
  'an important task in computer vision.',
  _,
  'Here, at each discrete time step $i$, we are given some noisy information about where',
  'the object might be.',
  'For example, this noisy information could be the video frame at time step $i$.',
  'The goal is to answer the question: what trajectory did the object take?',
_);

add(slide('Modeling object tracking',
  problem('object tracking',
    'Noisy sensors reports positions: $0, 2, 2$.',
    'Objects don\'t move very fast.',
    'What path did the object take?',
  _),
  // New: track
  parentCenter('[whiteboard: trajectories over time]'),
_));

add(slide('Person tracking solution',
  stmt('Factor graph (chain-structured)'),
  parentCenter(chainFactorGraph({n:3})).scale(0.6), pause(),
  headerList(null,
    'Variables $X_i$: location of object at position $i$', pause(),
    'Observation factors $o_i(x_i)$: noisy information compatible with position',
    'Transition factors $t_i(x_i, x_{i+1})$: object positions can\'t change too much', pause(),
  _),
  pause(),
  parentCenter(text('[demo: create factor graph]').linkToUrl('index.html#include=inference-demo.js&example=track&postCode=maxVariableElimination()')),
_));

prose(
  'Let\'s try to model this problem.',
  'Always start by defining the variables: these are the quantities which we don\'t know.',
  'In this case, it\'s the locations of the object at each time step: $X_1, X_2, X_3 \\in \\{0, 1, 2\\}$.',
  _,
  'Now let\'s think about the factors, which need to capture two things.',
  'First, transition factors make sure physics isn\'t violated',
  '(e.g., objects positions can\'t change too much).',
  'Second, observation factors make sure the hypothesized locations $X_i$ are compatible with the noisy information.',
  'Note that these numbers are just numbers, not necessarily probabilities;',
  'later we\'ll see how probabilities fit in to factor graphs.',
  _,
  'Having modeled the problem as a factor graph, we can now ask for the maximum weight assignment for that factor graph,',
  'which would give us the most likely trajectory for the object.',
  _,
  'Click on the the [track] demo to see the definition of this factor graph as well as the maximum weight assignment,',
  'which is [1, 2, 2].  Note that we smooth out the trajectory, assuming that the first sensor reading was inaccurate.',
  _,
  'Next we will develop algorithms for finding a maximum weight assignment in a factor graph.',
  'These algorithms will be overkill for solving this simple tracking problem,',
  'but it will nonetheless be useful for illustrative purposes.',
_);

function roadmap(i) {
  add(outlineSlide('Roadmap', i, [
    ['beamSearch', 'Beam search'],
    ['localSearch', 'Local search'],
    ['conditioning', 'Conditioning'],
    ['elimination', 'Elimination'],
  ]));
}

////////////////////////////////////////////////////////////
// Beam search
roadmap(0);

prose(
  'In this lecture, we will discuss alternative ways to find maximum weight assignments efficiently',
  'without incurring the full cost of backtracking search.',
  _,
  'The first two methods (beam search and local search) are approximate algorithms.',
  'We give up guarantees of finding the exact maximum weight assignment,',
  'but they can still work well in practice.',
  _,
  'Then, we will look at the fact that we have a factor <b>graph</b>,',
  'and show that for graph structures, we can get exponentially faster algorithms,',
  'analogous to the savings we obtained by using dynamic programming in search problems.',
  'We will introduce two factor graph operations: conditioning and elimination.',
_);

add(slide('Backtracking search',
  parentCenter(beamSearchTree({})),
_));

prose(
  'Backtracking search in the worst case performs an exhaustive DFS of the entire search tree,',
  'which can take a very very long time.',
  'How do we avoid this?',
_);

add(slide('Greedy search',
  parentCenter(beamSearchTree({beamSize: 1, pause: true})),
_));

prose(
  'One option is to simply not backtrack!',
  'In greedy search, we\'re just going to stick with our guns, marching down one thin slice of the search tree, and never looking back.',
_);

add(slide('Greedy search',
  parentCenter(text('[demo: <tt>beamSearch({K:1})</tt>]').linkToUrl('index.html#include=inference-demo.js&example=track&postCode=beamSearch({K:1})')),
  pause(),
  algorithm('greedy search',
    'Partial assignment $x \\leftarrow \\{\\}$',
    pause(),
    'For each $i = 1, \\dots, n$:',
    indent(stmt('Extend')),
    indent(indent('Compute weight of each $x_v = x \\cup \\{X_i : v\\}$')), pause(),
    indent(stmt('Prune')),
    indent(indent('$x \\leftarrow x_v$ with highest weight')), pause(),
  _), 
  parentCenter('Not guaranteed to find optimal assignment!'),
_));

prose(
  'Specifically, we assume we have a fixed ordering of the variables.',
  'As in backtracking search, we maintain a partial assignment $x$ and its weight, which we denote $w(x)$.',
  'We consider extending $x$ to include $X_i:v$ for all possible values $v \\in \\Domain_i$.',
  'Then instead of recursing on all possible values of $v$, we just commit to',
  'the best one according to the weight of the new partial assignment $x \\cup \\{X_i:v\\}$.',
  _,
  'It\'s important to realize that "best" here is only with respect to',
  'the weight of the partial assignment $x \\cup \\{X_i:v\\}$.',
  'The greedy algorithm is by no means guaranteed to find the globally optimal solution.',
  'Nonetheless, it is incredibly fast and sometimes good enough.',
  _,
  'In the demo, you\'ll notice that greedy search produces a suboptimal solution.',
_);

add(slide('Beam search',
  parentCenter(beamSearchTree({beamSize: 4, pause: true})),
  showLevel(0),
  parentCenter('Beam size $K=4$'),
_));

add(slide('Beam search',
  parentCenter(text('[demo: <tt>beamSearch({K:3})</tt>]').linkToUrl('index.html#include=inference-demo.js&example=track&postCode=beamSearch({K:3})')),
  stmt('Idea: keep $\\le K$ <b>candidate list</b> $C$ of partial assignments'),
  pause(),
  algorithm('beam search',
    'Initialize $C \\leftarrow [\\{ \\}]$', pause(),
    'For each $i = 1, \\dots, n$:',
    indent(stmt('Extend')),
    indent(indentNowrapText('$C\' \\leftarrow \\{ x \\cup \\{ X_i : v \\} : x \\in C, v \\in \\Domain_i \\}$')), pause(),
    indent(stmt('Prune')),
    indent(indentNowrapText('$C \\leftarrow K$ elements of $C\'$ with highest weights')),
  _),
  pause(),
  parentCenter('Not guaranteed to find optimal assignment!'),
_));

prose(
  'The problem with greedy is that it\'s too myopic.',
  'So a natural solution is to keep track of more than just the single best partial assignment at each level of the search tree.',
  'This is exactly <b>beam search</b>, which keeps track of (at most) $K$ candidates ($K$ is called the beam size).',
  'It\'s important to remember that these candidates are not guaranteed to be the $K$ best at each level (otherwise greedy would be optimal).',
  _,
  'The beam search algorithm maintains a candidate list $C$ and iterates through all the variables, just as in greedy.',
  'It extends each candidate partial assignment $x \\in C$ with every possible $X_i:v$.',
  'This produces a new candidate list $C\'$.  We sort $C\'$ by decreasing weight, and keep only the top $K$ elements.',
  _,
  'Beam search also has no guarantees of finding the maximum weight assignment,',
  'but it generally works better than greedy at the cost of an increase in running time.',
  _,
  'In the demo, we can see that with a beam size of $K=3$, we are able to find the globally optimal solution.',
_);

add(slide('Beam search properties',
  bulletedText('Running time: $O(n (K b) \\log (K b))$ with branching factor $b = |\\Domain|$, beam size $K$'),
  pause(),
  bulletedText('Beam size $K$ controls tradeoff between efficiency and accuracy'),
  pause(),
  indent(bulletedText('$K=1$ is greedy ($O(n b)$ time)')), pause(),
  indent(bulletedText('$K=\\infty$ is BFS tree search ($O(b^n)$ time)')), pause(),
  bulletedText(stmt('Analogy: backtracking search : DFS :: beam search : BFS (pruned)')),
_));

prose(
  'Beam search offers a nice way to tradeoff efficiency and accuracy and is used quite common in practice.',
  'If you want speed and don\'t need extremely high accuracy, use greedy ($K=1$).',
  'The running time is $O(nb)$, since for each of the $n$ variables,',
  'we need to consider $b$ possible values in the domain.',
  _,
  'If you want high accuracy, then you need to pay by increasing $K$.',
  'For each of the $n$ variables, we keep track of $K$ candidates, which gets extended to $Kb$ when forming $C\'$.',
  'Sorting these $Kb$ candidates by score requires $Kb \\log (Kb)$ time.',
  _,
  'With large enough $K$ (no pruning),',
  'beam search is just doing a BFS traversal rather than a DFS traversal of the search tree,',
  'which takes $O(b^n)$ time.  Note that $K$ doesn\'t enter in to the expression because the number of',
  'candidates is bounded by the total number, which is $O(b^n)$.',
  'Technically, we could write as running time of beam search $O(\\min\\{b^n, n (Kb) \\log (Kb)\\})$,',
  'but for small $K$ and large $n$, $b^n$ will be much larger, so it can be ignored.',
  _,
  'For moderate values of $K$, beam search is a kind of pruned BFS,',
  'where we use the factors that we\'ve seen so far',
  'to decide which branches of the tree are worth exploring.',
  _,
  'In summary, beam search takes a broader view of the search tree,',
  'allowing us to compare partial assignments in very different parts of the tree,',
  'something that backtracking search cannot do.',
_);

////////////////////////////////////////////////////////////
// Local search
roadmap(1);

add(slide('Local search',
  stmt('Backtracking/beam search: extend partial assignments'),
  parentCenter(image('images/build-house.jpg').width(150)),
  pause(),
  stmt('Local search: modify complete assignments'),
  parentCenter(image('images/fix-house.jpg').width(200)),
_));

prose(
  'So far, both backtracking and beam search build up a partial assignment incrementally,',
  'and are structured around an ordering of the variables (even if it\'s dynamically chosen).',
  'With backtracking search, we can\'t just go back and change the value of a variable much higher in the tree due to new information;',
  'we have to wait until the backtracking takes us back up, in which case we lose all the information about the more recent variables.',
  'With beam search, we can\'t even go back at all.',
  _,
  'Recall that one of the motivations for moving to variable-based models is that we wanted to downplay the role of ordering.',
  '<b>Local search</b> (i.e., hill climbing) provides us with additional flexibility.',
  'Instead of building up partial assignments, we work with a complete assignment and make repairs by changing one variable at a time.',
_);

add(slide('Iterated conditional modes (ICM)',
  parentCenter(chainFactorGraph({n: 3, xfocus: 2})).scale(0.8),
  stmt('Current assignment: $(0, 0, 1)$; how to improve?'),
  pause(),
  //'Weight of new assignment $(x_1, \\red{v}, x_3)$:',
  //parentCenter('$o_1(x_1) \\red{t_1(x_1, v) o_2(v) t_2(v, x_3)} o_3(x_3)$'),
  parentCenter(table(
    ['$(x_1, \\red{v}, x_3)$', 'weight'],
    ['$(0, \\red{0}, 1)$', '$2 \\cdot \\red{2 \\cdot 0 \\cdot 1} \\cdot 1 = 0$'],
    ['$(0, \\red{1}, 1)$', '$2 \\cdot \\red{1 \\cdot 1 \\cdot 2} \\cdot 1 = 4$'],
    ['$(0, \\red{2}, 1)$', '$2 \\cdot \\red{0 \\cdot 2 \\cdot 1} \\cdot 1 = 0$'],
  _).margin(20, 5).center()),
  pause(),
  //parentCenter('Choose $X_i:1$'),
  stmt('New assignment: $(0, 1, 1)$'),
_));

prose(
  'Consider a complete assignment $(0, 0, 1)$.',
  'Can we make a local change to the assignment to improve the weight?',
  'Let\'s just try setting $x_2$ to a new value $v$.',
  'For each possibility, we can compute the weight, and just take the highest scoring option.',
  'This results in a new assignment $(0, 1, 1)$ with a higher weight ($4$ rather than $0$).',
_);

add(slide('Iterated conditional modes (ICM)',
  parentCenter(chainFactorGraph({n: 3, xfocus: 2})).scale(0.8),
  //'Weight of old $(x_1, x_2, x_3)$:',
  //indent('$o_1(x_1) t_1(x_1, x_2) o_2(x_2) t_2(x_2, x_3) o_3(x_3)$'),
  //pause(),
  'Weight of new assignment $(x_1, \\red{v}, x_3)$:',
  parentCenter('$o_1(x_1) \\red{t_1(x_1, v) o_2(v) t_2(v, x_3)} o_3(x_3)$'),
  pause(),
  keyIdea('locality',
    'When evaluating possible re-assignments to $X_i$, only need to consider the factors that $X_i$ depends on.',
  _),
_));

prose(
  'If we write down the weights of the various new assignments $x \\cup \\{X_2:v\\}$,',
  'we will notice that all the factors return the same value except the ones that depend on $X_2$.',
  _,
  'Therefore, we only need to compute the product of these relevant factors and take the maximum value.',
  'Because we only need to look at the factors that touch the variable we\'re modifying,',
  'this can be a big savings if the total number of factors is much larger.',
_);

add(slide('Iterated conditional modes (ICM)',
  algorithm('iterated conditional modes (ICM)',
    'Initialize $x$ to a random complete assignment', pause(),
    'Loop through $i = 1, \\dots, n$ until convergence:', pause(),
    indent('Compute weight of $x_v = x \\cup \\{X_i:v\\}$ for each $v$'),
    pause(),
    indent('$x \\leftarrow x_v$ with highest weight'),
  _),
  pause(),
  parentCenter(xtable(
    chainFactorGraph({n: 3, xfocus: 1}), pause(),
    chainFactorGraph({n: 3, xfocus: 2}), pause(),
    chainFactorGraph({n: 3, xfocus: 3}),
  _).scale(0.6).margin(150)),
_));

prose(
  'Now we can state our first algorithm, ICM, which is the local search analogy of the greedy algorithm we described earlier.',
  'The idea is simple: we start with a random complete assignment.',
  'We repeatedly loop through all the variables $X_i$.',
  'On variable $X_i$, we consider all possible ways of re-assigning it $X_i:v$ for $v \\in \\Domain_i$,',
  'and choose the new assignment that has the highest weight.',
  _,
  'Graphically, we represent each step of the algorithm by having shaded nodes for',
  'the variables which are fixed and unshaded for the single variable which is being re-assigned.',
_);

add(slide('Iterated conditional modes (ICM)',
  parentCenter(text('[demo: <tt>iteratedConditionalModes()</tt>]').linkToUrl('index.html#include=inference-demo.js&example=track&postCode=iteratedConditionalModes()')),
  pause(),
  bulletedText('$\\Weight(x)$ increases or stays the same each iteration'),
  bulletedText('Converges in a finite number of iterations'), pause(),
  bulletedText('Can get stuck in <b>local optima</b>'),
  bulletedText('Not guaranteed to find optimal assignment!'),
  parentCenter(image('images/local-optima.jpg')),
_));

prose(
  'Note that ICM will increase the weight of the assignments monotonically and converges,',
  'but it will get stuck in local optima, where there is a better assignment elsewhere,',
  'but all the one variable changes result in a lower weight assignment.',
  _,
  'Connection: this hill-climbing is called coordinate-wise ascent.',
  'We already saw an instance of coordinate-wise ascent in the K-means algorithm',
  'which would alternate between fixing the centroids and optimizing the object with respect to the cluster assignments,',
  'and fixing the cluster assignments and optimizing the centroids.',
  'Recall that K-means also suffered from local optima issues.',
  _,
  'Connection: these local optima are an example of a Nash equilibrium (for collaborative games),',
  'where no unilateral change can improve utility.',
  _,
  'Note that in the demo, ICM gets stuck in a local optimum with weight 4 rather than the global optimum\'s 8.',
_);

G.probStick = function(probs) {
  var items = [];
  var nx = 400;
  items.push(line([0, 0], [nx, 0]).strokeWidth(3));
  function tick(f) {
    var t = line([f*nx, down(10)], [f*nx, up(10)]).strokeWidth(3);
    items.push(t);
    items.push(moveTopOf(text(round(f, 1)).scale(0.7), t));
  }
  var accum = 0;
  for (var i = 0; i < probs.length; i++) {
    tick(accum);
    accum += probs[i];
  }
  tick(accum);
  Math.seedrandom(new Date());
  items.push(circle(5).color('red').shift(Math.random()*nx, 0));
  return new Overlay(items);
}

add(slide('Gibbs sampling',
  'Sometimes, need to go downhill to go uphill...',
  pause(),
  keyIdea('randomness',
    'Sample an assignment with probability proportional to its weight.',
  _),
  pause(),
  example('Gibbs sampling',
    parentCenter(table(
      ['$\\Weight(x \\cup \\{X_2:0\\}) = 1$', 'prob. $0.2$'],
      ['$\\Weight(x \\cup \\{X_2:1\\}) = 2$', 'prob. $0.4$'],
      ['$\\Weight(x \\cup \\{X_2:2\\}) = 2$', 'prob. $0.4$'],
    _).margin(30, 5).scale(0.8)),
  _),
  pause(),
  parentCenter(probStick([0.2, 0.4, 0.4])),
_));

prose(
  'In reinforcement learning, we also had a problem where if we explore by using a greedy policy',
  '(always choosing the best action according to our current estimate of the $Q$ function),',
  'then we were doomed to get stuck.',
  'There, we used <b>randomness</b> via epsilon-greedy to get out of local optima.',
  _,
  'Here, we will do the same, but using a slightly more sophisticated form of randomness.',
  'The idea is <b>Gibbs sampling</b>, a method originally designed for using Markov chains to sample from a distribution over assignments.',
  'We will return to that original use later, but for now, we are going to repurpose it for the problem of finding the maximum weight assignment.',
_);

add(slide('Gibbs sampling',
  parentCenter(nowrapText('[demo: <tt>gibbsSampling()</tt>]').linkToUrl('index.html#include=inference-demo.js&example=track&postCode=gibbsSampling()')).scale(0.9),
  pause(),
  algorithm('Gibbs sampling',
    'Initialize $x$ to a random complete assignment', pause(),
    'Loop through $i = 1, \\dots, n$ until convergence:', pause(),
    indent('Compute weight of $x_v = x \\cup \\{X_i:v\\}$ for each $v$'),
    pause(),
    indent('Choose $x \\leftarrow x_v$ with probability prop. to its weight'),
  _),
  pause(),
  parentCenter('Can escape from local optima (not always easy though)!'),
_));

prose(
  'The form of the algorithm is identical to ICM.',
  'The only difference is that rather than taking the assignment $x \\cup \\{X_i:v\\}$ with the maximum weight,',
  'we choose the assignment with probability proportional to its weight.',
  _,
  'In this way, even if an assignment has lower weight, we won\'t completely rule it out, but just choose it with lower probability.',
  'Of course if an assignment has zero weight, we will choose it with probability zero (which is to say, never).',
  _,
  'Randomness is not a panacea and often Gibbs sampling can get ensnarled in local optima just as much as ICM.',
  'In theory, under the assumption that we could move from the initial assignment and the maximum weight assignment with non-zero probability,',
  'Gibbs sampling will move there eventually (but it could take exponential time in the worst case).',
  _,
  'Advanced: just as beam search is greedy search with $K$ candidates instead of $1$,',
  'we could extend ICM and Gibbs sampling to work with more candidates.',
  'This leads us to the area of particle swarm optimization, which includes genetic algorithms,',
  'which is beyond the scope of this course.',
_);

add(quizSlide('csp2-opt',
  'Which of the following algorithms are guaranteed to find the maximum weight assignment (select all that apply)?',
  'backtracking search',
  'greedy search',
  'beam search',
  'Iterated Conditional Modes',
  'Gibbs sampling',
_));

add(summarySlide('Summary so far',
  stmt('Algorithms for max-weight assignments in factor graphs'),
  stmt('(1) Extend partial assignments'),
  bulletedText('Backtracking search: exact, exponential time'),
  bulletedText('Beam search: approximate, linear time'),
  pause(),
  stmt('(2) Modify complete assignments'),
  bulletedText('Iterated conditional modes: approximate, deterministic'),
  bulletedText('Gibbs sampling: approximate, randomized'),
_));

////////////////////////////////////////////////////////////
// Conditioning
roadmap(2);

add(slide('Motivation',
  keyIdea('graph',
    'Leverage graph properties to derive efficient algorithms which are exact.',
  _),
  parentCenter(australia({})),
_));

prose(
  'The goal in the second part of the lecture is to take advantage of the fact that we have a factor <b>graph</b>.',
  'We will see how exploiting the graph properties can lead us to more efficient algorithms',
  'as well as a deeper understanding of the structure of our problem.',
_);

add(slide('Motivation',
  //'So far, graph structure provides efficiency (if assign variable, only have to reason about neighbors)',
  stmt('Backtracking search'),
  parentCenter('exponential time in number of variables $n$'),
  pause(),
  nil(),
  parentCenter(overlay(
    table(
      [a1 = factorNode('$X_1$'),
       a2 = factorNode('$X_2$'),
       a3 = factorNode('$X_3$'),
       a4 = factorNode('$X_4$')],
      [b1 = squareFactor(),
       b2 = squareFactor(),
       b3 = squareFactor(),
       b4 = squareFactor()],
    _).margin(50, 10).center(),
    line(a1, b1),
    line(a2, b2),
    line(a3, b3),
    line(a4, b4),
  _)),
  pause(),
  stmt('Efficient algorithm'),
  parentCenter('maximize each variable separately'),
_));

prose(
  'Recall that backtracking search takes time exponential in the number of variables $n$.',
  'While various heuristics can have dramatic speedups in practice, it is not clear how to characterize those improvements rigorously.',
  _,
  'As a motivating example, consider a fully disconnected factor graph.',
  '(Imagine $n$ people trying to vote red or blue, but they don\'t talk to each other.)',
  'It\'s clear that to get the maximum weight assignment, we can just choose the value of each variable that maximizes its own unary factor',
  'without worrying about other variables.',
_);

add(slide('Independence',
  definition('independence',
    //bulletedText('Consider a factor graph with variables $X = (X_1, \\dots, X_n)$.'), pause(),
    bulletedText('Let $A$ and $B$ be a partitioning of variables $X$.'), pause(),
    bulletedText('We say $A$ and $B$ are <b>independent</b> if there are no edges between $A$ and $B$.'), pause(),
    bulletedText('In symbols: $A \\independent B$.'),
  _),
  pause(),
  parentCenter(xtable(
    australia({}).scale(0.5), pause(),
    text('$\\{\\text{WA},\\text{NT},\\text{SA},\\text{Q},\\text{NSW},\\text{V}\\}$ and $\\{\\text{T}\\}$ are independent.').width(400),
  _).margin(50).center()),
  //pause(),
  //stmt('Key point', 'can solve each connected component separately and merge solutions.'),
_));

prose(
  'Let us formalize this intuition with the notion of <b>independence</b>.',
  'It turns out that this notion of independence is deeply related to the notion of independence in probability, as we will see in due time.',
  _,
  'Note that we are defining independence purely in terms of the graph structure,',
  'which will be important later once we start operating on the graph using two transformations: conditioning and elimination.',
_);

add(slide('Non-independence',
  treeFactorGraph(),
  pause(),
  'No variables are independent of each other, but feels close...',
_));

prose(
  'When all the variables are independent,',
  'finding the maximum weight assignment is easily solvable in time linear in $n$, the number of variables.',
  'However, this is not a very interesting factor graph,',
  'because the whole point of a factor graph is to model dependencies (preferences and constraints) between variables.',
  _,
  'Consider the tree-structured factor graph,',
  'which corresponds to $n-1$ people talking only through a leader.',
  'Nothing is independent here,',
  'but intuitively, this graph should be pretty close to independent.',
_);

add(slide('Conditioning',
  stmt('Goal: try to disconnect the graph'),
  parentCenter(
    table(
      [stagger(
        overlay(
          xtable(a = factorNode('$X_1$'), b = factorNode('$X_2$')).margin(w = 150).center(),
          f = edgeFactor(a, b),
          moveTopOf('$f(x_1, x_2)$', f),
        _),
        overlay(
          xtable(a = factorNode('$X_1$'), b = factorNode('$X_2$', {color: 'blue'})).margin(w).center(),
          f = edgeFactor(a, b),
          moveTopOf('$f(x_1, x_2)$', f),
        _),
      _),
      pause(-1),
      table_f12(),
      ],
      pause(),
      [indent(upDownArrow(80).strokeWidth(5), w/2), nil()],
      [overlay(
        xtable(a = factorNode('$X_1$'), b = nil()).margin(w/2).center(),
        g = partialEdgeFactor(a, b),
        moveRightOf('$g(x_1) = f(x_1, \\vB)$', g),
      _),
      table_g(),
      ],
    _).margin(20, 0).yjustify('c').scale(0.8),
  _),
  pause(),
  'Condition on $X_2 = \\vB$: remove $X_2,f$ and add $g$',
_));

add(slide('Conditioning: example',
  example('map coloring',
    'Condition on $\\text{Q} = \\vR$ and $\\text{SA} = \\vG$.',
    parentCenter(overlay(
      xtable(
        australia({colors: {SA: 'green', Q: 'red'}}).scale(0.5),
        pause(), a = rightArrow(50).strokeWidth(5),
        australia({condition: 2}).scale(0.5),
      _).center().margin(50),
    _)),
    pause(),
    stmt('New factors'),
    parentCenter(xtable(
      ytable(
        '$[\\text{NT} \\neq \\vR]$',
        '$[\\text{NSW} \\neq \\vR]$',
      _),
      ytable(
        '$[\\text{WA} \\neq \\vG]$',
        '$[\\text{NT} \\neq \\vG]$',
        '$[\\text{NSW} \\neq \\vG]$',
        '$[\\text{V} \\neq \\vG]$',
      _),
    _).margin(50).scale(0.8)),
  _).content.margin(10).end,
_));

add(slide('Conditioning: general',
  stmt('Graphically: remove edges from $X_i$ to dependent factors'),
  parentCenter(conditionVariableGraph().scale(0.7)),
  pause(),
  definition('conditioning',
    bulletedText('To <b>condition</b> on a variable $X_i = v$, consider all factors $f_1, \\dots, f_k$ that depend on $X_i$.'), pause(),
    bulletedText('Remove $X_i$ and $f_1, \\dots, f_k$.'), pause(),
    bulletedText('Add $g_j(x) = f_j(x \\cup \\{ X_i:v\\})$ for $j=1,\\dots,k$.'),
  _),
_));

prose(
  'In general, factor graphs are not going to have many partitions which are independent (we got lucky with Tasmania, Australia).',
  'But perhaps we can transform the graph to make variables independent.',
  'This is the idea of <b>conditioning</b>: when we condition on a variable $X_i = v$,',
  'this is simply saying that we\'re just going to clamp the value of $X_i$ to $v$.',
  _,
  'We can understand conditioning in terms of a graph transformation.',
  'For each factor $f_j$ that depends on $X_i$, we create a new factor $g_j$.',
  'The new factor depends on the scope of $f_j$ excluding $X_i$; when called on $x$, it just invokes $f_j$ with $x \\cup \\{X_i:v\\}$.',
  'Think of $g_j$ as a partial evaluation of $f_j$ in functional programming.',
  'The transformed factor graph will have each $g_j$ in place of the $f_j$ and also not have $X_i$.',
_);

add(slide('Conditional independence',
  definition('conditional independence',
    bulletedText('Let $A, B, C$ be a partitioning of the variables.'), pause(),
    bulletedText('We say $A$ and $B$ are <b>conditionally independent</b> given $C$ if conditioning on $C$ produces a graph in which $A$ and $B$ are independent.'), pause(),
    bulletedText('In symbols: $A \\independent B \\mid C$.'), pause(),
  _),
  stmt('Equivalently: every path from $A$ to $B$ goes through $C$.'),
  // Try conditioning on different values, solve the resulting CSP.
_));

add(slide('Conditional independence',
  example('map coloring',
    parentCenter(overlay(
      xtable(
        australia({colors: {SA: 'gray', Q: 'gray'}}).scale(0.5),
        a = rightArrow(50).strokeWidth(5),
        australia({condition: 2}).scale(0.5),
      _).center().margin(50),
    _)),
    pause(),
    stmt('Conditional independence assertion'),
    indent('$\\{\\text{WA}, \\text{NT}\\} \\independent \\{\\text{V},\\text{NSW},\\text{T}\\} \\mid \\{\\text{SA}, \\text{Q}\\}$'),
  _),
_));

prose(
  'With conditioning in hand, we can define <b>conditional independence</b>,',
  'perhaps the most important property in factor graphs.',
  _,
  'Graphically, if we can find a subset of the variables $C \\subset X$ that disconnects the rest of the variables into $A$ and $B$,',
  'then we say that $A$ and $B$ are conditionally independent given $C$.',
  _,
  'Later, we\'ll see how this definition relates to the definition of conditional independence in probability.',
_);

add(slide('Markov blanket',
  'How can we separate an arbitrary set of nodes from everything else?',
  parentCenter(xtable(
    stagger(
      australia({colors: {V: 'bold'}}).scale(0.5),
      australia({colors: {V: 'bold', SA: 'gray', NSW: 'gray'}}).scale(0.5),
    _),
    pause(),
    stagger(
      australia({colors: {WA: 'bold', NT: 'bold'}}).scale(0.5),
      australia({colors: {WA: 'bold', NT: 'bold', SA: 'gray', Q: 'gray'}}).scale(0.5),
    _),
  _)).margin(50),
  pause(),
  definition('Markov blanket',
    'Let $A \\subseteq X$ be a subset of variables.',
    'Define $\\MarkovBlanket(A)$ be the neighbors of $A$ that are not in $A$.',
  _),
_));

add(slide('Markov blanket',
  parentCenter(overlay(
    b = ellipse(150, 100).fillColor('lightblue'),
    c = circle(50).fillColor('green'),
    a = circle(40).fillColor('pink'),
    moveCenterOf('$A$', a),
    moveTopOf('$\\green{C}$', c),
    transform('$B$').pivot(1, 0).shift(b.right().sub(5), b.ymiddle()),
  _)),
  proposition('conditional independence',
    'Let $C = \\MarkovBlanket(A)$.',
    'Let $B$ be $X \\backslash (A \\cup C)$.',
    'Then $A \\independent B \\mid C$.',
  _),
_));

prose(
  'Suppose we wanted to disconnect a subset of variables $A \\subset X$ from the rest of the graph.',
  'What is the smallest set of variables $C$ that we need to condition on to make $A$ and the rest of the graph',
  '($B = X \\backslash (A \\cup C)$) conditionally independent.',
  _,
  'It\'s intuitive that the answer is simply all the neighbors of $A$ (those that share a common factor) which are not in $A$.',
  'This concept is useful enough that it has a special name: <b>Markov blanket</b>.',
  _,
  'Intuitively, the smaller the Markov blanket, the easier the factor graph is to deal with.',
_);

add(slide('Using conditional independence',
  'For each value $v = \\vR,\\vG,\\vB$:',
  pause(),
  indent('Condition on $X_1 = v$.'),
  indent('Find the maximum weight assignment (easy).'),
  pause(-1),
  parentCenter(stagger(
    treeFactorGraph(),
    treeFactorGraph('red'),
    treeFactorGraph('green'),
    treeFactorGraph('blue'),
  _)),
  pause(-2),
  parentCenter(table(
    ['$\\vR$', '3'], pause(),
    ['$\\vG$', '6'], pause(),
    ['$\\vB$', '1'],
  _).margin(20)),
  pause(),
  parentCenter('maximum weight is 6'),
_));

prose(
  'Now that we understand conditional independence, how is it useful?',
  _,
  'First, this formalizes the fact that if someone tells you the value of a variable,',
  'you can condition on that variable, thus potentially breaking down the problem into simpler pieces.',
  _,
  'If we are not told the value of a variable,',
  'we can simply try to condition on all possible values of that variable,',
  'and solving the remaining problem using any method.',
  'If conditioning breaks up the factor graph into small pieces,',
  'then solving the problem becomes easier.',
  _,
  'In this example, conditioning on $X_1 = v$ results in a fully disconnected graph,',
  'the maximum weight assignment for which can be computed in time linear in the number of variables.',
_);

/*add(slide('Cond. independence in backtracking',
  parentCenter(xtable(
    pause(5),
    lbox = ytable(
      yspace(100),
      frameBox(backtrackingTree([{Q: 'red', SA: 'green'},
        [{Q: 'red', SA: 'green', NT: 'blue'}, {Q: 'red', SA: 'green', NT: 'blue', WA: 'red'}],
      ], {pause: true}).scale(0.28)).bg.dashed().end,
    _),
    showLevel(0),
    backtrackingTree([{},
      '...',
      [{Q: 'red'}, '...', {Q: 'red', SA: 'green'}],
    ], {pause: true}).scale(0.28),
    showLevel(lbox.showLevel()),
    ytable(
      yspace(100),
      frameBox(backtrackingTree([{Q: 'red', SA: 'green'},
        [{Q: 'red', SA: 'green', NSW: 'blue'}, {Q: 'red', SA: 'green', NSW: 'blue', V: 'red'}],
      ], {pause: true}).scale(0.28)).bg.dashed().end,
    _),
  _).margin(100)),
_));

add(slide('Cond. independence in backtracking',
  headerList('Exploiting conditional independence in backtracking',
    'In backtracking search, partial assignment is conditioning on $C$.', pause(),
    'If $C$ divides remaining unassigned variables into conditionally independent groups $A$ and $B$, recurse on the subproblems (can do in parallel).', pause(),
    'If either subproblem has no solution, return no solution.',
  _),
  pause(),
  keyIdea('divide and conquer',
    'Conditioning breaks large problem into smaller pieces.',
  _),
_));

prose(
  'Conditional independence gives us a tool to study the structure of a factor graph.',
  'But how can we exploit the idea of conditional independence to make our algorithms run faster?',
  _,
  'One way to do this is in the context of backtracking search.',
  'While we\'re backtracking, extending partial assignments is really conditioning on more and more variables.',
  _,
  'At some point, if we ever disconnect the graph into two components,',
  'we can actually recursively find the maximum weight assignment on the two components,',
  'and then stitch the partial assignments which are returned together.',
  _,
  'Note that the two components can even be solved in parallel because they are independent.',
_);*/

add(summarySlide('Summary so far',
  stmt('Independence', 'when sets of variables $A$ and $B$ are disconnected; can solve separately.'), pause(),
  stmt('Conditioning', 'assign variable to value, replaces binary factors with unary factors'), pause(),
  stmt('Conditional independence', 'when $C$ blocks paths between $A$ and $B$'), pause(),
  stmt('Markov blanket', 'what to condition on to make $A$ conditionally independent of the rest.'),
_));

prose(
  '<b>Independence</b> is the key property that allows us to solve subproblems in parallel.',
  'It is worth noting that the savings is huge &mdash; exponential, not linear.',
  'Suppose the factor graph has two disconnected variables, each taking on $m$ values.',
  'Then backtracking search woule take $m^2$ time, whereas solving each subproblem separately would take $2m$ time.',
  _,
  'However, the factor graph isn\'t always disconnected (which would be uninteresting).',
  'In these cases, we can <b>condition</b> on particular values of a variable.',
  'Doing so potentially disconnects the factor graph into pieces, which can be again solved in parallel.',
  _,
  'Factor graphs are interesting because every variable can still influence every other variable,',
  'but finding the maximum weight assignment is efficient if there are small bottlenecks that we can condition on.',
_);

////////////////////////////////////////////////////////////
// Elimination
roadmap(3);

add(slide('Conditioning versus elimination',
  headerList('Conditioning',
    'Removes $X_i$ from the graph',
    'Add factors that use fixed value of $X_i$',
  _),
  pause(),
  headerList('Elimination (max)',
    'Removes $X_i$ from the graph',
    'Add factors that maximize over all values of $X_i$',
  _),
_));

prose(
  'Now we discuss the second important factor graph transformation: <b>elimination</b>.',
  'Conditioning was great at breaking the factor graph apart but required a fixed value on which to condition.',
  'If we don\'t know what the value should be, we just have to try all of them.',
  _,
  'Elimination (more precisely, max elimination) also removes variables from the graph, but actually chooses the best value for the eliminated variable $X_i$.',
  'But how do we talk about the best value?  The answer is that we compute the best one for all possible assignments to the Markov blanket of $X_i$.',
  'The result of this computation can be stored as a new factor.',
_);

add(slide('Conditioning versus elimination',
  // Demonstrate the algorithm on the board: trees, grid
  parentCenter(
    table(
      [overlay(
        xtable(a = factorNode('$X_1$'), b = factorNode('$X_2$')).margin(w = 150).center(),
        f = edgeFactor(a, b),
        moveTopOf(text('$f(x_1, x_2)$'), f),
      _).scale(0.8),
      table_f12().scale(0.7),
      ],
      pause(),
      [nil(), nil()],
      [stmt('Conditioning'), 'consider <b>one</b> value ($X_2=\\vB$)'],
      [overlay(
        xtable(a = factorNode('$X_1$'), b = nil()).margin(w/2).center(),
        g = partialEdgeFactor(a, b),
        moveRightOf('$g(x_1) = f(x_1, \\vB)$', g),
      _).scale(0.8),
      table_g().scale(0.7),
      ],
      pause(),
      [nil(), nil()],
      [stmt('Elimination'), 'consider <b>all</b> values'],
      [overlay(
        xtable(a = factorNode('$X_1$'), b = nil()).margin(w/2).center(),
        h = partialEdgeFactor(a, b),
        moveRightOf('$\\displaystyle h(x_1) = \\max_{x_2} f(x_1, x_2)$', h),
      _).scale(0.8),
      table_h().scale(0.7),
      ],
    _).margin(10, 5).yjustify('c'),
  _),
_));

prose(
  'If we eliminate $X_2$ in this simple example, we produce a factor graph with the same structure as what we got for conditioning (but in general, this is not the case),',
  'but a different factor.',
  _,
  'In conditioning, the new factor produced $g(x_1)$ was just $f$ evaluated with $x_2 = \\vB$.',
  'In elimination, the new factor produced $h(x_1)$ is the maximum value of $f$ over all possible values of $x_2$.',
_);

add(slide('Elimination: example',
  parentCenter(xtable(cspGraph({labelEdges: true}), rightArrow(50).strokeWidth(5), cspGraph({labelEdges: true, eliminate: true})).center().margin(50)),
  pause(),
  indent('$\\displaystyle f_{14}(x_1, x_4) = \\max_{x_3} [f_{13}(x_1, x_3) f_{34}(x_3, x_4)]$'),
  indent('(maximum weight of assignment to $X_3$ given $X_1, X_4$)'),
  pause(),
  xseq(
    '$\\max_{x_3}$', table_f13(), '$\\,\\cdot\\,$', table_f34(), '$\\,=\\,$', pause(), table_f14(),
  _).scale(0.85),
_));

prose(
  'Now let us look at a more complex example.',
  'Suppose we want to eliminate $X_3$.',
  'Now we have two factors $f_{13}$ and $f_{34}$ that depend on $X_3$.',
  _,
  'Again, recall that we should think of elimination as solving the maximum weight assignment problem over $X_3$',
  'conditioned on the Markov blanket $\\{X_1, X_4\\}$.',
  _,
  'The result of this computation is stored in the new factor $f_{14}(x_1, x_4)$, which depends on the Markov blanket.',
_);

add(slide('Elimination: general',
  parentCenter(eliminateVariableGraph()).scale(0.7),
  pause(),
  definition('elimination',
    bulletedText('To <b>eliminate</b> a variable $X_i$, consider all factors $f_1, \\dots, f_k$ that depend on $X_i$.'),
    pause(),
    bulletedText('Remove $X_i$ and $f_1, \\dots, f_k$.'),
    pause(),
    bulletedText('Add $\\displaystyle f_\\text{new}(x) = \\max_{x_i} \\prod_{j=1}^k f_j(x)$'),
  _),
_));

add(slide('Elimination: general',
  parentCenter(xtable(
    removeVariableGraph({eliminate: true}),
    ytable(bigRightArrow(100), yspace(80)),
    removeVariableGraph({eliminate: true, remove: true}),
  _).yjustify('r').margin(50)).scale(0.7),
  parentCenter('$\\displaystyle f_\\text{new}(x) = \\max_{x_i} \\prod_{j=1}^k f_j(x)$'),
  pause(),
  bulletedText('Solves a mini-problem over $X_i$ conditioned on its Markov blanket!'),
  pause(),
  bulletedText('Scope of $f_\\text{new}$ is $\\MarkovBlanket(X_i)$'),
_));

prose(
  'In general, to eliminate a variable $X_i$, we look at all factors which depend on it, just like in conditioning.',
  'We then remove those factors $f_1, \\dots, f_k$ and $X_i$, just as in conditioning.',
  'Where elimination differs is that it produces a single factor which depends on the Markov blanket rather than a new factor for each $f_j$.',
  _,
  'Note that eliminating a variable $X_i$ is much more costly than conditioning,',
  'and will produce a new factor',
  'which can have quite high arity (if $X_i$ depends on many other variables).',
  _,
  'But the good news is that once a variable $X_i$ is eliminated, we don\'t have to revisit it again.',
  'If we have an assignment to the Markov blanket of $X_i$,',
  'then the new factor gives us the weight of the best assignment to $X_i$,',
  'which is stored in the new factor.',
  _,
  'If for every new factor $f_\\text{new}$, we store for each input, not only the value of the max, but also the argmax,',
  'then we can quickly recover the best assignment to $X_i$.',
_);

add(quizSlide('csp2-condelim',
  'Suppose we have a star-shaped factor graph.  Which of the following is true (select all that apply)?',
  'Conditioning on the hub produces unary factors.',
  'Eliminating the hub produces unary factors.',
_));

add(slide('Variable elimination algorithm',
  algorithm('variable elimination',
    'For $i = 1, \\dots, n$:',
    indent('Eliminate $X_i$ (produces new factor $f_{\\text{new},i}$).'),
    'For $i = n, \\dots, 1$:',
    indent('Set $X_i$ to the maximizing value in $f_{\\text{new},i}$.'),
  _),
  parentCenter(nowrapText('[demo: <tt>query(\'\'); maxVariableElimination()</tt>]').linkToUrl('index.html#include=inference-demo.js&example=track&postCode=query(\'\'); maxVariableElimination()')).scale(0.9),
  pause(),
  'Let $\\text{max-arity}$ be the maximum arity of any $f_{\\text{new},i}$.', pause(),
  stmt('Running time', '$O(n \\cdot |\\Domain|^{\\text{max-arity}+1})$'),
_));

prose(
  'We can turn elimination directly into an actual algorithm for computing the maximum weight assignment by just repeating it until we are left with one variable.',
  'This is called the <b>variable elimination</b> algorithm.',
  _,
  'The running time of this algorithm is exponential in the maximum arity of the factor produced along the way in variable elimination.',
  'The arity in the worst case is $n-1$, but in the best case it could be a lot better, as we will see.',
_);

add(slide('Variable ordering',
  'What\'s the maximum arity?',
  pause(),
  treeFactorGraph(),
  pause(),
  'If eliminate leaves first, all factors have arity 1 (<font color="green">good</font>)', pause(),
  'If eliminate root first, get giant factor have arity 6 (<font color="red">bad</font>)',
  pause(),
  stmt('Degree heuristic', 'eliminate variables with the fewest neighbors'),
_));

prose(
  'The arity of the factors produced during variable elimination depends on the ordering of the variables.',
  'In this extreme example, the difference is between $1$ and $6$.',
  _,
  'A useful heuristic is to eliminate variables with the smallest Markov blanket.',
  'In this example, the heuristic would eliminate the leaves and we\'d only end up with factors with arity $1$.',
_);

add(slide('Treewidth',
  definition('treewidth',
    'The <b>treewidth</b> of a factor graph is the maximum arity of any factor created by variable elimination with the <b>best</b> variable ordering.',
  _),
  pause(),
  parentCenter('[whiteboard]'),
  pause(),
  headerList(null,
    'Treewidth of a chain is 1.', pause(),
    'Treewidth of a tree is 1.', pause(),
    'Treewidth of simple cycle is 2.', pause(),
    'Treewidth of $m \\times n$ grid is $\\min(m, n)$.',
  _),
_).leftHeader(image('images/giant-sequoia.jpg').width(200)));

prose(
  'If we use the best ordering, the arity of the largest factor produced is known as the <b>treewidth</b>,',
  'a very important property in graph theory.',
  'Computing the treewidth in general is NP-complete, and verifying that treewidth is $k$ is exponential in $k$ (but linear in the number of nodes).',
  _,
  'However, in practice, it\'s useful to remember a few examples.',
  _,
  'The treewidth of a chain is $1$, by just eliminating all the variables left to right.',
  _,
  'The treewidth of a tree is also $1$ by eliminating the variables from the leaves first.',
  _,
  'The treewidth of a simple cycle is $2$.  By symmetry, we can pick any variable on the cycle; eliminating it creates a factor that connects its two neighbors.',
  _,
  'The treewidth of an $m \\times n$ grid is more complex.  Without loss of generality, assume that $m \\le n$.',
  'One can eliminate the variables by going along the columns left to right and processing the variables from the top row to the bottom row.',
  'Verify that when eliminating variable $X_{ij}$ (in the $i$-th row and the $j$-th column),',
  'its Markov blanket is all the variables in column $j+1$ and row $\\le i$ as well as all the variables in column $j$ but in row $> i$.',
  _,
  'Note that even if we don\'t know the exact treewidth, having an upper bound gives us a handle on the running time of variable elimination.',
_);

add(summarySlide('Summary',
  bulletedText(stmt('Beam search: follows the most promising branches of search tree based on myopic information (think pruned BFS search)')),
  pause(),
  bulletedText(stmt('Local search: can freely re-assign variables; use randomness to get out of local optima')),
  pause(),
  bulletedText(stmt('Conditioning: break up a factor graph into smaller pieces (divide and conquer); can use in backtracking')),
  pause(),
  bulletedText(stmt('Elimination: solve a small subproblem conditioned on its Markov blanket')),
_));

prose(
  'Last lecture, we focused on algorithms that worked in the backtracking search framework.',
  'This lecture explores two classes of methods for efficienty finding the maximum weight assignment in a factor graph.',
  _,
  'The first class of methods are approximate methods.',
  '<b>Beam search</b>, like backtracking search, builds up partial assignments,',
  'but extends multiple partial assignments over the same subset of variables at once,',
  'and heuristically keeping the ones that seem most promising so far.',
  'It is quite possible that the actual maximum weight assignment will "fall off the beam".',
  '<b>Local search</b>, in contrast, works with complete assignments,',
  'modifying the value of one variable at time.',
  'In both beam and local search, one considers one variable at a time,',
  'and we only need to look at the factors touching that one variable.',
  _,
  'The second class of methods are exact methods that rely on (conditional) <b>independence</b> structure of the graph,',
  'in particular, that the graph is weakly connected, for example, a chain or a tree.',
  'We approached this methods by thinking about two graph operations, conditioning and elimination.',
  '<b>Conditioning</b> sets the value of a variable, and breaks up any factors that touch that variable.',
  '<b>Elimination</b> maximimizes over a variable, but since the maximum value depends on the Markov blanket,',
  'this maximization is encoded in a new factor that depends on all the variables in the Markov blanket.',
  'The variable elimination computes the maximum weight assignment by applying elimination to each variable sequentially.',
_);

sfig.initialize();
