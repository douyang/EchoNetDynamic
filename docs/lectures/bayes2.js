G = sfig.serverSide ? global : this;
G.prez = presentation();

add(titleSlide('Lecture 14: Bayesian networks II',
  nil(),
  parentCenter(twoLayerBayesNet({n1:10, n2: 20}).scale(0.3)),
_));

// add(slide('Pac-Man competition',
//   parentCenter(image('images/pacman.jpg').width(300)),
//   pause(),
//   parentCenter(ytable(
//     '1. (1773) Jeffrey Barratt',
//     '2. (1771) Jiajing Wang',
//     '3. (1769) Evan Darke',
//   _).margin(5)),
// _));

/*add(quizSlide('bayes2-start',
  'If we have a $n$-variable Bayesian network, can we compute some marginals in $O(1)$ time?',
  'yes',
  'no',
_));*/

add(slide('Review: Bayesian network',
  parentCenter(xtable(
    simpleMedicalNetwork({}),
    ytable(
      '$\\P(C = c, A = a, H = h, I = i)$',
      indent('$\\eqdef p(c) p(a) p(h \\mid c, a) p(i \\mid a)$'),
    _).margin(10),
  _).center().margin(50)).scale(0.8),
  definition('Bayesian network',
    'Let $X = (X_1, \\dots, X_n)$ be random variables.',
    'A <b>Bayesian network</b> is a directed acyclic graph (DAG) that specifies a '+blue('joint distribution')+' over $X$ as a product of '+red('local conditional distributions')+', one for each node:',
    parentCenter(nowrapText('$\\displaystyle \\blue{\\P(X_1 = x_1, \\dots, X_n = x_n)} = \\prod_{i=1}^n \\red{p(x_i \\mid x_{\\Parents(i)})}$')),
  _),
_));

prose(
  'Last time, we talked about Bayesian networks,',
  'which was a fun and convenient modeling framework.',
  'We posit a collection of variables that describe the state of the world,',
  'and then create a story on how the variables are generated (recall the probabilistic program interpretation).',
  _,
  'A Bayesian network specifies two parts: (i) a graph structure which governs the qualitative relationship between the variables,',
  'and (ii) local conditional distributions, which specify the quantitative relationship.',
  _,
  'Formally, a Bayesian network defines a <b>joint</b> probability distribution over many variables (e.g., $\\P(C, A, H, I)$)',
  'via the <b>local</b> conditional distributions (e.g., $p(i \\mid a)$).',
  'This joint distribution specifies all the information we know about how the world works.',
_);

add(slide('Review: probabilistic inference',
  parentCenter(importantBox(redbold('Input'),
    'Bayesian network: $\\P(X_1 = x_1, \\dots, X_n = x_n)$',
    'Evidence: $E = e$ where $E \\subseteq X$ is subset of variables',
    'Query: $Q \\subseteq X$ is subset of variables',
  _)),
  pause(),
  parentCenter(bigDownArrow(70)),
  parentCenter(importantBox(bluebold('Output'),
    stagger(
      '$\\P(Q \\mid E = e)$',
      '$\\P(Q = q \\mid E = e)$ for all values $q$',
    _).center(),
  _)),
  pause(),
  stmt('Example: if coughing but no itchy eyes, have a cold?'),
  parentCenter('$\\P(C \\mid H = 1, I = 0)$'),
_));

prose(
  'Think of the joint probability distribution defined by the Bayesian network as a guru.',
  'Probabilistic inference allows you to ask the guru anything:',
  'what is the probability of having a cold?  What if I\'m coughing?  What if I don\'t have itchy eyes?',
  'In this lecture, we\'re going to build such a guru that can answer these queries efficiently.',
_);

function roadmap(i) {
  add(outlineSlide('Roadmap', i, [
    ['forwardBackward', 'Forward-backward'],
    ['gibbsSampling', 'Gibbs sampling'],
    ['particleFiltering', 'Particle filtering'],
  ]));
}

////////////////////////////////////////////////////////////
// Forward-backward
roadmap(0);

add(slide('Object tracking',
  parentCenter(hmm({maxTime: 4}).scale(0.7)),
  problem('object tracking',
    '$H_i \\in \\{1, \\dots, K\\}$: location of object at time step $i$',
    '$E_i \\in \\{1, \\dots, K\\}$: sensor reading at time step $i$',
    pause(),
    stmt('Start: $p(h_1)$: uniform over all locations'),
    stmt('Transition $p(h_i \\mid h_{i-1})$: uniform over adjacent loc.'),
    stmt('Emission $p(e_i \\mid h_i)$: uniform over adjacent loc.'),
    //pause(),
    //stmt('Observations: $E = [1, 2, 3, 6]$'),
    //'What is $\\P(H_i \\mid E = [0, 1, 2, 5])$?',
  _),
  //pause(),
  //parentCenter('[live solution]'),
_));

prose(
  'So far, we have computed various ad-hoc probabilistic queries on ad-hoc Bayesian networks by hand.',
  'We will now switch gears and focus on the popular hidden Markov model (HMM),',
  'and show how the forward-backward algorithm can be used to compute typical queries of interest.',
  _,
  'As motivation, consider the problem of tracking an object.',
  'The probabilistic story is as follows:',
  'An object starts at $H_1$ uniformly drawn over all possible locations.',
  'Then at each time step thereafter, it <b>transitions</b> to an adjacent location with equal probability.',
  'For example, if $H_2 = 3$, then $H_3 \\in \\{ 2, 4 \\}$ with equal probability.',
  'At each time step, we obtain a sensor reading $E_i$ which is also uniform over locations adjacent to $H_i$.',
_);

add(slide('Hidden Markov model',
  parentCenter(hmm({maxTime: 5}).scale(0.8)),
  pause(),
  parentCenter('$\\displaystyle \\P(H = h, E = e) = \\underbrace{p(h_1)}_\\text{start} \\prod_{i=2}^n \\underbrace{p(h_i \\mid h_{i-1})}_\\text{transition} \\prod_{i=1}^n \\underbrace{p(e_i \\mid h_i)}_\\text{emission}$').scale(0.8),
  pause(),
  stmt('Query (<b>filtering</b>)'),
  indent('$\\P(H_3 \\mid E_1 = e_1, E_2 = e_2, E_3 = e_3)$').scale(0.9),
  pause(),
  stmt('Query (<b>smoothing</b>)'),
  indent('$\\P(H_3 \\mid E_1 = e_1, E_2 = e_2, E_3 = e_3, E_4 = e_4, E_5 = e_5)$').scale(0.9),
_));

prose(
  'In principle, you could ask any type of query on an HMM,',
  'but there are two common ones: filtering and smoothing.',
  _,
  'Filtering asks for the distribution of some hidden variable $H_i$ conditioned on only the evidence up until that point.',
  'This is useful when you\'re doing real-time object tracking, and you can\'t see the future.',
  _,
  'Smoothing asks for the distribution of some hidden variable $H_i$ conditioned on all the evidence, including the future.',
  'This is useful when you have collected all the data and want to retroactively go and figure out what $H_i$ was.',
_);

add(slide('Lattice representation',
  parentCenter(forwardBackwardLattice({numRows: 3, numCols: 5, focus: [1, 2]})), pause(),
  //bulletedText('Node $\\boxed{H_{i}=a}$ has weight $o_i(a)$').autowrap(false), pause(),
  bulletedText('Edge $\\boxed{\\text{start}} \\Rightarrow \\boxed{H_{1}=h_{1}}$ has weight $p(h_1) p(e_1 \\mid h_1)$'), pause(),
  bulletedText('Edge $\\boxed{H_{i-1}=h_{i-1}} \\Rightarrow \\boxed{H_{i}=h_{i}}$ has weight $p(h_i \\mid h_{i-1}) p(e_i \\mid h_i)$'), pause(),
  bulletedText('Each path from $\\boxed{\\text{start}}$ to $\\boxed{\\text{end}}$ is an assignment with weight equal to the product of node/edge weights'),
_));

prose(
  'Now let\'s actually compute these queries.',
  'We will do smoothing first.',
  'Filtering is a special case: if we\'re asking for $H_i$ given $E_1, \\dots, E_i$,',
  'then we can marginalize out the future, reducing the problem to a smaller HMM.',
  _,
  'A useful way to think about inference is returning to state-based models.',
  'Consider a graph with a start node, an end node, and a node for each assignment of a value to a variable $H_i = v$.',
  'The nodes are arranged in a lattice, where each column corresponds to one variable $H_i$ and each row corresponds to a particular value $v$.',
  'Each path from the start to the end corresponds exactly to a complete assignment to the nodes.',
  _,
  'Note that in the reduction from a variable-based model to a state-based model,',
  'we have committed to an ordering of the variables.',
  _,
  'Each edge has a weight (a single number) determined by the local conditional probabilities',
  '(more generally, the factors in a factor graph).',
  'For each edge into $\\boxed{H_i = h_i}$, we multiply by the transition probability into $h_i$ and emission probability $p(e_i \\mid h_i)$.',
  'This defines a weight for each path (assignment) in the graph equal to the joint probability $P(H = h, E = e)$.',
  _,
  'Note that the lattice contains $O(Kn)$ nodes and $O(K^2 n)$ edges,',
  'where $n$ is the number of variables and $K$ is the number of values in the domain of each variable.',
_);

add(slide('Lattice representation',
  parentCenter(forwardBackwardLattice({numRows: 3, numCols: 5, focus: [1, 2]})).scale(0.85),
  pause(),
  stmt('Forward: $F_i(h_i) = \\sum_{h_{i-1}} F_{i-1}(h_{i-1}) w(h_{i-1}, h_i)$'),
  indent('sum of weights of paths from $\\boxed{\\text{start}}$ to $\\boxed{H_i=h_i}$').scale(0.85), pause(),
  stmt('Backward: $B_i(h_i) = \\sum_{h_{i+1}} B_{i+1}(h_{i+1}) w(h_i, h_{i+1})$'),
  indent('sum of weights of paths from $\\boxed{H_i=h_i}$ to $\\boxed{\\text{end}}$').scale(0.85), pause(),
  stmt('Define $S_i(h_i) = F_i(h_i) B_i(h_i)$'),
  indent(nowrapText('sum of weights of paths from $\\boxed{\\text{start}}$ to $\\boxed{\\text{end}}$ through $\\boxed{H_i=h_i}$').scale(0.85)),
_));

prose(
  'The point of bringing back the search-based view is that we can cast the probability queries we care about in terms of sums over paths,',
  'and effectively use dynamic programming.',
  _,
  'First, define the forward message $F_i(v)$ to be the sum of the weights over all paths from the start node to $\\boxed{H_i = v}$.',
  'This can be defined recursively: any path that goes $\\boxed{H_i=h_i}$ will have to go through some $\\boxed{H_{i-1}=h_{i-1}}$,',
  'so we can so over all possible values of $h_{i-1}$.',
  _,
  'Analogously, let the backward message $B_i(v)$ be the sum of the weights over all paths from $\\boxed{H_i = v}$ to the end node.',
  _,
  'Finally, define $S_i(v)$ to be the sum of the weights over all paths from the start node to the end node that pass through the intermediate node $\\boxed{X_i = v}$.',
  'This quantity is just the product of the weights of paths going into $\\boxed{H_i=h_i}$ ($F_i(h_i)$) and those leaving it ($B_i(h_i)$).',
_);

add(slide('Lattice representation',
  //parentCenter(forwardBackwardLattice({numRows: 3, numCols: 5, focus: [1, 2]})),
  stmt('Smoothing queries (marginals)'),
  parentCenter('$\\P(H_i = h_i \\mid E = e) \\propto S_i(h_i)$'),
  pause(),
  algorithm('forward-backward algorithm',
    'Compute $F_1, F_2, \\dots, F_L$',
    'Compute $B_L, B_{L-1}, \\dots, B_1$',
    'Compute $S_i$ for each $i$ and normalize',
  _),
  stmt('Running time: $O(L K^2)$'),
_));

prose(
  'Let us go back to the smoothing queries: $\\P(H_i = h_i \\mid E = e)$.',
  'This is just gotten by normalizing $S_i$.',
  _,
  'The algorithm is thus as follows: for each node $\\boxed{H_i = h_i}$, we compute three numbers: $F_i(h_i), B_i(h_i), S_i(h_i)$.',
  'First, we sweep forward to compute all the $F_i$\'s recursively.',
  'At the same time, we sweep backward to compute all the $B_i$\'s recursively.',
  'Then we compute $S_i$ by pointwise multiplication.',
  _,
  'Implementation note: we technically can normalize $S_i$ to get $\\P(H_i \\mid E = e)$ at the very end',
  'but it\'s useful to normalize $F_i$ and $B_i$ at each step to avoid underflow.',
  'In addition, normalization of the forward messages yields $\\P(H_i = v \\mid E_1 = e_1, \\dots, E_i = e_i) \\propto F_i(v)$.',
_);

add(summarySlide('Summary',
  bulletedText(stmt('Lattice representation: paths are assignments (think state-based models)')),
  bulletedText(stmt('Dynamic programming: compute sums efficiently')),
  bulletedText(stmt('Forward-backward algorithm: share intermediate computations across different queries')),
_));

////////////////////////////////////////////////////////////
// Gibbs sampling
roadmap(1);

function generateSamples() {
  var probs = [0.8, 1, 0.9];
  var rows = [];
  Math.seedrandom(40);
  rows.push(['$x_1$', '$x_2$', '$x_3$', '$\\P(X_1=x_1,X_2=x_2,X_3=x_3)$']);
  function p(b, i) { return b * probs[i] + (1-b) * (1-probs[i]); }
  var margs = [0, 0, 0];
  for (var x = 0; x < 8; x++) {
    var x0 = (x & 4) != 0 ? 1 : 0;
    var x1 = (x & 2) != 0 ? 1 : 0;
    var x2 = (x & 1) != 0 ? 1 : 0;
    var prob = round(p(x0, 0) * p(x0 ? x1 : 1-x1, 1) * p(x0 ? x2 : 1-x2, 2), 3);
    margs[0] += x0 * prob;
    margs[1] += x1 * prob;
    margs[2] += x2 * prob;
    rows.push([x0, x1, x2, prob]);
  }
  rows.push(margs.map((a) => (a * 100) / 100 + ' ').concat(['(true marginals)']).map(greenbold));
  var table1 = new Table(rows).margin(20, 0);

  var rows = [];
  rows.push([nil(), '$x_1$', '$x_2$', '$x_3$']);
  var n = 3;
  var sums = [0, 0, 0];
  for (var i = 0; i < n; i++) {
    var a = Math.random() < probs[0] ? 1 : 0;
    var b = Math.random() < probs[1] ? a : 1-a;
    var c = Math.random() < probs[2] ? b : 1-b;
    rows.push(['Sample ' + (i+1), a, b, c]);
    sums[0] += a;
    sums[1] += b;
    sums[2] += c;
  }
  rows.push(pause());
  rows.push([redbold('Estimated marginals')].concat(sums.map(function(x) { return redbold(round(1.0*x/n, 2)+''); })));
  var table2 = new Table(rows).margin(40, 0);

  return xtable(table1, pause(), table2).margin(50).center();
}

add(slide('Particle-based approximation',
  parentCenter('$\\P(X_1, X_2, X_3)$'),
  pause(2),
  keyIdea('particles',
    'Use a small set of assignments (particles) to represent a large probability distribution.',
  _),
  pause(-1),
  //stmt('Example'),
  parentCenter(generateSamples().scale(0.6)),
_));

prose(
  'The central idea to both of Gibbs sampling and particle filtering is the use of particles',
  '(just a fancy word for complete assignment, usually generated stochastically) to represent a probability distribution.',
  _,
  'Rather than storing the probability of every single assignment,',
  'we have a set of assignments, some of which can occur multiple times',
  '(which implicitly represents a higher probability). Maintaining this small set of assignments ',
  'will allows us to answer queries more quickly, but at a cost: our answers will now be approximate instead of exact.',
  _,
  'From a set of particles, we can compute approximate marginals (or any query we want)',
  'by simply computing the fraction of assignments that satisfy the desired condition.',
  'Here, marginalization is easy because we\'re explicitly enumerating full assignments.',
  _,
  'Once we have a set of particles, we can compute all the queries we want with it.',
  'So now how do we actually generate the particles?',
_);

add(slide('Gibbs sampling',
  algorithm('Gibbs sampling',
    'Initialize $x$ to a random complete assignment', pause(),
    'Loop through $i = 1, \\dots, n$ until convergence:', pause(),
    indent('Compute weight of $x \\cup \\{X_i: v\\}$ for each $v$'),
    pause(),
    indent('Choose $x \\cup \\{X_i: v\\}$ with probability prop. to weight'),
  _),
  pause(),
  importantBox(redbold('Gibbs sampling (probabilistic interpretation)'),
    'Loop through $i = 1, \\dots, n$ until convergence:',
    indent('Set $X_i=v$ with prob. $\\P(X_i = v \\mid X_{-i} = x_{-i})$'),
    indent(text('(notation: $X_{-i} = X \\backslash \\{X_i\\}$)').scale(0.7)),
  _),
  pause(),
  parentCenter(nowrapText('[demo]').linkToUrl('index.html#include=inference-demo.js&example=chain&postCode=query(\'X1 X2\'); gibbsSampling({steps:1})')).scale(0.9),
_));

prose(
  'Recall that Gibbs sampling proceeds by going through each variable $X_i$,',
  'considering all the possible assignments of $X_i$ with some $v \\in \\Domain_i$,',
  'computing the weight of the resulting assignment $x \\cup \\{X_i: v\\}$,',
  'and choosing an assignment with probability proportional to the weight.',
  _,
  'We first introduced Gibbs sampling in the context of local search to get out of local optima.',
  'Now, we will use it for its original purpose, which is to draw samples from a probability distribution.',
  '(In particular, our goal is to draw from the joint distribution over $X_1, X_2, \\ldots, X_n$.)',
  'To do this, we need to define a probability distribution given an arbitrary factor graph.',
  'Recall that a general factor graph defines a $\\Weight(x)$, which is the product of all its factors.',
  'We can simply normalize the weight to get a distribution: $\\P(X = x) \\propto \\Weight(x)$.',
  'Then, Gibbs sampling is exactly sampling according to the conditional distribution $\\P(X_i = v \\mid X_{-i} = x_{-i})$.',
  _,
  'Note that the convergence criteria is on the <i>distribution</i> of the sample values,',
  'not the values themselves.',
  _,
  'Advanced: Gibbs sampling is an instance of a Markov Chain Monte Carlo (MCMC) algorithm',
  'which generates a sequence of particles $X^{(1)}, X^{(2)}, X^{(3)}, \\dots$.',
  'A Markov chain is irreducible if there is positive probability of getting',
  'from any assignment to any other assignment (now the probabilities are over the random choices of the sampler).',
  'When the Gibbs sampler is irreducible, then in the limit as $t \\to \\infty$,',
  'the distribution of $X^{(t)}$ converges to the true distribution $\\P(X)$.',
  'MCMC is a very rich topic which we will not talk about very much here.',
_);

add(slide('Application: image denoising',
  nil(),
  parentCenter(image('images/image-denoising.png')),
_));

add(slide('Application: image denoising',
  example('image denoising',
    parentCenter(isingModel({numRows: 3, numCols: 5, selected: function(r,c) {return !(r == 1 && c == 2);}}).scale(0.6)),
    bulletedText('$X_i \\in \\{0,1\\}$ is pixel value in location $i$'), pause(),
    bulletedText('Subset of pixels are observed'),
    indent('$o_i(x_i) = [x_i = \\text{observed value at $i$}]$'), pause(),
    bulletedText('Neighboring pixels more likely to be same than different'),
    indent('$t_{ij}(x_i, x_j) = [x_i = x_j] + 1$'),
  _),
_));

prose(
  'Factor graphs (sometimes referred to as Markov random fields) play an important role in computer vision applications.',
  'Here we take a look at a very simple image denoising application',
  'and construct a factor graph.',
  _,
  'We assume that we have observed some fraction of the pixels in an image,',
  'and we wish to recover the pixels which have been removed.',
  'Our simple factor graph has two types of factors.',
  _,
  'First, $o_i(x_i) = 0$ if the pixel at $i$ is observed and $x_i$ does not match it.',
  'This is analogous to the emission probabilities in an HMM,',
  'but here, the factor is deterministic (0 or 1).',
  _,
  'Second, $t_{ij}(x_i, x_j)$ exists for every pair of neighboring pixels,',
  'and encourages them to agree (both be 0 or both be 1).',
  'Weight 2 is given to those pairs which are the same and 1 if the pair is different.',
  'This is analogous to the transition probabilities in an HMM.',
_);

add(slide('Application: image denoising',
  parentCenter(isingModel({numRows: 3, numCols: 5, selected: function(r,c) {return !(r == 1 && c == 2);}}).scale(0.6)),
  example('image denoising',
    'If neighbors are $1, 1, 1, 0$ and $X_i$ not observed:',
    '$\\P(X_i = 1 \\mid X_{-i} = x_{-i}) = \\frac{2 \\cdot 2 \\cdot 2 \\cdot 1}{2 \\cdot 2 \\cdot 2 \\cdot 1 + 1 \\cdot 1 \\cdot 1 \\cdot 2} = 0.8$',
    pause(),
    yspace(10),
    'If neighbors are $0, 1, 0, 1$ and $X_i$ not observed:',
    '$\\P(X_i = 1 \\mid X_{-i} = x_{-i}) = \\frac{1 \\cdot 2 \\cdot 1 \\cdot 2}{1 \\cdot 2 \\cdot 1 \\cdot 2 + 2 \\cdot 1 \\cdot 2 \\cdot 1} = 0.5$',
  _),
  parentCenter('[whiteboard]'),
_));

prose(
  'Let us compute the Gibbs sampling update.',
  'We go through each pixel $X_i$ and try to update its value.',
  'Specifically, we condition on $X_{-i} = x_{-i}$ being the current value.',
  _,
  'To compute the conditional $\\P(X_i = x_i \\mid X_{-i} = x_{-i})$,',
  'we only need to multiply in the factors that are touching $X_i$,',
  'since conditioning disconnects the graph completely.',
  'Many of the factors simply can be ignored.',
  _,
  'For example, suppose we are updating variable $X_i$,',
  'which has neighbors $X_j,X_k,X_l,X_m$.',
  'Suppose we condition on $X_j = 1, X_k = 1, X_l = 0, X_m = 1$.',
  'Then $\\P(X_i = x_i \\mid X_{-i} = x_{-i}) \\propto t_{ij}(x_i, 1) t_{ik}(x_i, 1) t_{il}(x_i, 0) t_{im}(x_m, 1) o_i(x_i)$.',
  'We can compute the RHS for both $x_i = 1$ and $x_i = 0$, and then normalize to get the conditional probability $0.8$.',
  _,
  'Intuitively, the neighbors are all trying to pull $X_i$ towards their values,',
  'and 0.8 reflects the fact that the pull towards 1 is stronger.',
_);

G.gibbsSamplingDemo = function() {
  if (sfig.serverSide) return '[see web version]';

  var cs221Pixels = [
    "################################################",
    "###.......##########.......#############....####",
    "#...####....######...####....#########......####",
    "#..######....#####..######....######..##....####",
    "#.########....####.########....#####.###....####",
    "##########....#############....#########....####",
    "##########....#############....#########....####",
    "##########....#############....#########....####",
    "##########....#############....#########....####",
    "#########....#############....##########....####",
    "#########...##############...###########....####",
    "########...##############...############....####",
    "######....#############....#############....####",
    "#####...##############...###############....####",
    "###...#######.######...#######.#########....####",
    "##...########.#####...########.#########....####",
    "#.............####.............#########....####",
    "#.............####.............#########....####",
    "#.............####.............######..........#",
    "################################################",
  ];

  var catPixels = [
    '##########################################...#',
    '########################################.....#',
    '#######################################.....##',
    '######.################################...####',
    '#.####.###############################...#####',
    '#..#...###############################...#####',
    '#......###############################..######',
    '#.......#############################...######',
    '........##########........###########...######',
    '...........#................#########..#######',
    '..............................######...#######',
    '##.............................###....########',
    '###...................................########',
    '###.................................##########',
    '####..........................##..############',
    '####..........................################',
    '#####.........................################',
    '#####..........................###############',
    '######.........................###############',
    '#######.......########.........###############',
    '########......########..........##############',
    '########.....##########..........#############',
    '#######......###########.....#...#############',
    '#######......############....##..#############',
    '#######...#..############....##.##############',
    '#######...#..############....#..##############',
    '######...##..############...#...##############',
    '######...##..###########...###################',
    '######..##..##########....####################',
    '#####...###############.######################',
    '#####..#######################################',
    '#####.########################################',
  ];

  var items = [];
  var w = 8;

  var pixels, numRows, numCols;
  function setImage(i) {
    pixels = i == 0 ? cs221Pixels : catPixels;
    numRows = pixels.length;
    numCols = pixels[0].length;
  }

  var obsGrid = [];  // Observations
  var grid = [];  // Current state of sampler
  var countsGrid = [];  // Averaged counts of sampler

  var numIters = null;
  var textElem = sfig_.newSvgElem('text');
  var numItersBox = rawAddSvg(function(container) {
    container.appendChild(textElem);
  });
  function updateNumItersBox() {
    textElem.textContent = numIters + ' iterations';
  }

  function renderCell(r, c) {
    var item = items[r*numCols+c];
    if (!item.elem) return;
    if (obsGrid[r][c] == null && numIters <= 1)
      item.color('white');  // First iteration: show missing
    else {
      if (showMarginals) {
        var v = 1.0 * countsGrid[r][c] / numIters;
        item.color(rgb(v*255, 0, 0));
      }
      else {
        item.color(grid[r][c] ? 'black' : 'red');
      }
    }
    updateColor(item);
  }

  function sample(r, c) {
    var x;  // new value
    if (obsGrid[r][c] != null) {  // Observed: just use it
      x = obsGrid[r][c];
    } else {
      var w = [1, 1];  // weights
      if (r-1 >= 0) w[grid[r-1][c]] *= coherenceFactor;
      if (c-1 >= 0) w[grid[r][c-1]] *= coherenceFactor;
      if (r+1 < numRows) w[grid[r+1][c]] *= coherenceFactor;
      if (c+1 < numCols) w[grid[r][c+1]] *= coherenceFactor;
      var prob = w[1] / (w[0] + w[1]);
      if (icm) x = prob > 0.5 ? 1 : 0;
      else x = Math.random() < prob ? 1 : 0;
    }
    grid[r][c] = x;
    countsGrid[r][c] += x;
    renderCell(r, c);
  }

  function step() {
    //var r = randint(numRows);
    //var c = randint(numCols);
    for (var r = 0; r < numRows; r++)
      for (var c = 0; c < numCols; c++)
        sample(r, c);
    numIters++;
    updateNumItersBox();
  }

  var origInput = [
    '// Press ctrl-enter to save settings',
    'setImage(0)            // What true image to use (either 0 or 1)',
    'missingFrac = 0.6      // Fraction of missing pixels',
    'coherenceFactor = 2    // Transition factors: prefer equal neighbors',
    'initRandom = false     // Initialize sampler randomly',
    'icm = false            // Use ICM, not Gibbs sampling',
    'showMarginals = false  // Show marginals (averages), not samples',
    'sampleTime = 100       // Milliseconds to wait between samples',
  ].join('\n');

  var inputBox = textBox().multiline(true).content(origInput).size(80, 9);
  var outputBox = wrap(nil());
  var timerId = null;
  function show() {
    eval(inputBox.content().get());

    // Create grid only if necessary
    if (items.length != numRows * numCols) {  // Weaker condition
      items = [];
      for (var r = 0; r < numRows; r++) {
        for (var c = 0; c < numCols; c++) {
          var item = square(w).shiftBy(w*c, w*r);
          items.push(item);
        }
      }
      outputBox.content(new Overlay(items));
    }

    for (var r = 0; r < numRows; r++) {
      grid[r] = [];
      obsGrid[r] = [];
      countsGrid[r] = [];
      for (var c = 0; c < numCols; c++) {
        var v = pixels[r][c] == '#' ? 1 : 0;
        if (Math.random() < missingFrac) v = null;  // Missing at random
        obsGrid[r][c] = v;

        if (initRandom || v == null)  // Need to initialize
          v = Math.random() < 0.5 ? 1 : 0;
        grid[r][c] = v;
        countsGrid[r][c] = v;
        renderCell(r, c);
      }
    }
    numIters = 1;
    for (var r = 0; r < numRows; r++)
      for (var c = 0; c < numCols; c++)
        renderCell(r, c);
    updateNumItersBox();

    if (origInput != inputBox.content().get())
      pushKeyValue('gibbs-sampling-demo', {input: inputBox.content().get()});
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  }
  show();

  inputBox.onEnter(function() {
    show();
    prez.refresh(function() { inputBox.focus(); });
  });
  outputBox.onClick(function() {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    } else {
      timerId = setInterval(step, sampleTime);
    }
  });

  return ytable(
    text('Click image to start Gibbs sampling.').scale(0.6).color('brown'),
    ytable(outputBox, numItersBox).center(),
    inputBox,
  _).center().margin(10);
}

add(slide('Gibbs sampling: demo',
  // Guess
  // missingFrac = 0.5
  // showMarginals = true [smoother]
  // setImage(1), Guess
  // coherenceFactor = 2, showMarginals = false, missingFrac = 1
  // coherenceFactor = 10, showMarginals = false, missingFrac = 1
  parentCenter(gibbsSamplingDemo()),
_));

prose(
  'Try playing with the demo by modifying the settings to get a feeling for what Gibbs sampling is doing.',
  'Each iteration corresponds to resampling each pixel (variable).',
  _,
  'When you hit ctrl-enter for the first time, red and black correspond to $1$ and $0$, and white corresponds to unobserved.',
  _,
  '<tt>showMarginals</tt> allows you to either view the particles produced or the marginals estimated from the particles (this gives you a smoother probability estimate of what the pixel values are).',
  _,
  'If you increase <tt>missingFrac</tt>, the problem becomes harder.',
  _,
  'If you set <tt>coherenceFactor</tt> to $1$, this is equivalent to turning off the edge factors.',
  _,
  'If you set <tt>icm</tt> to true, we will use local search rather than Gibbs sampling, which produces very bad solutions.',
  _,
  'In summary, Gibbs sampling is an algorithm that can be applied to any factor graph.',
  'It performs a guided random walk in the space of all possible assignments.',
  'Under some mild conditions, Gibbs sampling is guaranteed to converge to a sample from the true distribution $\\P(X = x) \\propto \\Weight(x)$',
  'but this might take until the heat death of the universe for complex models.',
  'Nonetheless, Gibbs sampling is widely used due to its simplicity and can work reasonably well.',
_);

////////////////////////////////////////////////////////////
// Particle filtering
roadmap(2);

add(slide('Hidden Markov models',
  parentCenter(hmm({maxTime:5, hVar:'X'}).scale(0.7)),
  //parentCenter(chainFactorGraph({n:5}).scale(0.7)),
  parentCenter('$\\displaystyle \\P(X = x, E = e) = \\underbrace{p(x_1)}_\\text{start} \\prod_{i=2}^n \\underbrace{p(x_i \\mid x_{i-1})}_\\text{transition} \\prod_{i=1}^n \\underbrace{p(e_i \\mid x_i)}_\\text{emission}$').scale(0.8),
  stmt('Query (<b>filtering</b>)'),
  indent('$\\P(X_1 \\mid E_1 = e_1)$').scale(0.9),
  indent('$\\P(X_2 \\mid E_1 = e_1, E_2 = e_2)$').scale(0.9),
  indent('$\\P(X_3 \\mid E_1 = e_1, E_2 = e_2, E_3 = e_3)$').scale(0.9),
_));

prose(
  'Now we turn our attention to particle filtering.',
  'Gibbs sampling is the probabilistic analog of local search methods such as ICM,',
  'and particle filtering is the probabilistic analog of partial search such as beam search.',
  _,
  'Although particle filtering applies to general factor graphs,',
  'we will present them for hidden Markov models for concreteness.',
  _,
  'As the name suggests, we will use particle filtering for answering filtering queries.',
_);

function distribGrid(opts) {
  var N = 10;
  var K = 30;
  var probs = [];
  var cellSize = 20;
  Math.seedrandom(1);
  var mi = N/2;
  var mj = N/2;
  for (var i = 0; i < N; i++) {
    for (var j = 0; j < N; j++) {
      var p = Math.exp((-(i-mi)*(i-mi) - (j-mj)*(j-mj))/100);
      probs.push(p);
    }
  }
  normalize(probs);
  var maxProb = Math.max.apply(null, probs);

  var cells = [];
  if (opts.beam) {
    cells = wholeNumbers(N*N);
    cells.sort(function(a,b) { return probs[b] - probs[a]; });
    cells = cells.slice(0, K);
  }
  if (opts.sample) {
    for (var i = 0; i < K; i++)
      cells.push(sampleMultinomial(probs));
  }

  var rows = [];
  var k = 0;
  for (var i = 0; i < N; i++) {
    var row = [];
    for (var j = 0; j < N; j++) {
      var cell = square(cellSize).fillOpacity(probs[k++] / maxProb / 2).fillColor('red');
      if (cells.indexOf(i*N+j) != -1)
        cell = overlay(cell, circle(5).color('black')).center();
      row.push(cell);
    }
    rows.push(row);
  }

  return table.apply(null, rows);
}

add(slide('Review: beam search',
  stmt('Idea: keep $\\le K$ <b>candidate list</b> $C$ of partial assignments'),
  algorithm('beam search',
    'Initialize $C \\leftarrow [\\{ \\}]$', pause(),
    'For each $i = 1, \\dots, n$:',
    indent(stmt('Extend')),
    indent(indentNowrapText('$C\' \\leftarrow \\{ x \\cup \\{ X_i : v \\} : x \\in C, v \\in \\Domain_i \\}$')), pause(),
    indent(stmt('Prune')),
    indent(indentNowrapText('$C \\leftarrow K$ elements of $C\'$ with highest weights')),
  _),
  pause(),
  parentCenter(text('[demo: <tt>beamSearch({K:3})</tt>]').linkToUrl('index.html#include=inference-demo.js&example=chain&postCode=beamSearch({K:3})')),
_));

add(slide('Review: beam search',
  parentCenter(beamSearchTree({beamSize: 4, pause: true})),
  showLevel(0),
  parentCenter('Beam size $K=4$'),
_));

prose(
  'Recall that beam search effectively does a pruned BFS of the search tree of partial assignments,',
  'where at each level, we keep track of the $K$ partial assignments with the highest weight.',
  _,
  'There are two phases.  In the first phase, we <b>extend</b> all the existing candidates $C$ to all possible assignments to $X_i$;',
  'this results in $K = |\\Domain_i|$ candidates $C\'$.',
  'These $C\'$ are sorted by weight and <b>pruned</b> by taking the top $K$.',
_);

add(slide('Beam search',
  stmt('End result'),
  bulletedText('Candidate list $C$ is set of particles'),
  bulletedText('Use $C$ to compute marginals'),
  pause(),
  stmt('Problems'),
  bulletedText('Extend: slow because requires considering every possible value for $X_i$'), pause(),
  bulletedText('Prune: greedily taking best $K$ doesn\'t provide diversity'),
  pause(),
  stmt('Solution (3 steps): <b>propose, weight, resample</b>'),
_));

prose(
  'Beam search does generate a set of particles, but there are two problems.',
  _,
  'First, it can be slow if $\\Domain_i$ is large because we have to try every single value.',
  'Perhaps we can be smarter about which values to try.',
  _,
  'Second, we are greedily taking the top $K$ candidates,',
  'which can be too myopic.',
  'Can we somehow encourage more diversity?',
  _,
  'Particle filtering addresses both of these problems.',
  'There are three steps: propose, which extends the current parital assignment,',
  'and weight/resample, which redistributes resources on the particles based on evidence.',
_);

add(slide('Step 1: propose',
  //parentCenter(chainFactorGraph({n:5}).scale(0.8)),
  //parentCenter(hmm({maxTime:5, hVar:'X'}).scale(0.7)),
  stmt('Old particles: $\\approx \\P(X_1, X_2 \\mid E_1 = 0, E_2 = 1)$'),
  indent(ytable('[0, 1]', '[1, 0]')),
  pause(),
  keyIdea('proposal distribution',
    //nowrapText('For each old particle $x_{1:i-1}$, sample $X_i \\sim p(x_i \\mid x_{i-1})$.'),
    nowrapText('For each old particle $(x_1, x_2)$, sample $X_3 \\sim p(x_3 \\mid x_2)$.'),
    //'The <b>proposal distribution</b> $p(x_i \\mid x_{i-1})$ is a heuristic guess of the value of $X_i$.',
  _),
  stmt('New particles: $\\approx \\P(X_1, X_2, \\red{X_3} \\mid E_1 = 0, E_2 = 1)$'),
  indent(ytable('[0, 1, '+red('1')+']', '[1, 0, '+red('0')+']')),
  //stmt('Notation: $x_{1:i} = (x_1, \\dots, x_i)$'),
  //pause(),
  //'How to choose a proposal?', //  Tradeoff accuracy and efficiency.',
  //pause(),
  //stmt('Note: can just store $X_3$ (Markov assumption).'),
_));

prose(
  'Suppose we have a set of particles that approximates the filtering distribution over $X_1,X_2$.',
  'The first step is to extend each current partial assignment (particle)',
  'from $x_{1:i-1} = (x_1, \\dots, x_{i-1})$ to $x_{1:i} = (x_1, \\dots, x_{i})$.',
  _,
  /*'Recall from factor graphs that upon assigning variable $X_i$, we can include all the dependent factors $D(x_{1:i-1}, X_i)$,',
  'which for chain-structured factor graphs contains $t_i(x_{i-1}, x_i)$ and $o_i(x_i)$.',
  _,
  'But in general, there are many possible values for $X_i$ (for object tracking in a 100x100 grid,',
  'we have $|\\Domain_i| = 10^4$ possible values)',
  'and we don\'t want to enumerate over all of them.',
  _,
  'So we will use a <b>proposal distribution</b> $\\pi_i$,',
  'whose purpose is to provide an educated guess about what the value of $X_i$ should be.',
  'The idea is that we can just sample from this distribution,',
  'which might be easier than enumerating all possible values $v \\in \\Domain_i$.',*/
  'To do this, we simply go through each particle and extend it stocastically,',
  'using the transition probability $p(x_i \\mid x_{i-1})$ to sample a new value of $X_i$.',
  _,
  '(For concreteness, think of what will happen if $p(x_i \\mid x_{i-1}) = 0.8$ if $x_i = x_{i-1}$ and $0.2$ otherwise.)',
  _,
  'We can think of advancing each particle according to the dynamics of the HMM.',
  'These particles approximate the probability of $X_1,X_2,X_3$, but still conditioned on the same evidence.',
_);

add(slide('Step 2: weight',
  stmt('Old particles: $\\approx \\P(X_1, X_2, X_3 \\mid E_1 = 0, E_2 = 1)$'),
  indent(ytable('[0, 1, 1]', '[1, 0, 0]')),
  pause(),
  keyIdea('weighting',
    'For each old particle $(x_1, x_2, x_3)$, weight it by $w(x_1, x_2, x_3) = p(e_3 \\mid x_3)$.',
  _),
  stmt('New particles'),
  parentCenter('$\\approx \\P(X_1, X_2, X_3 \\mid E_1 = 0, E_2 = 1, \\red{E_3 = 1})$'),
  indent(ytable('[0, 1, 1] '+red('(0.8)'), '[1, 0, 0] '+red('(0.4)'))),
_));

prose(
  'Having generated a set of $K$ candidates, we need to now take into account the new evidence $E_i = e_i$.',
  'This is a deterministic step that simply weights each particle by the probability of generating $E_i = e_i$,',
  'which is the emission probability $p(e_i \\mid x_i)$.',
  _,
  'Intuitively, the proposal was just a guess about where the object will be $X_3$.',
  'To get a more realistic picture, we condition on $E_3 = 1$.',
  'Supposing that $p(e_i = 1 \\mid x_i = 1) = 0.8$ and $p(e_i = 1 \\mid x_i = 0) = 0.4$,',
  'we then get the weights 0.8 and 0.4.',
  'Note that these weights do not sum to 1.',
_);

add(slide('Step 3: resample',
  stmt('Question: given weighted particles, which to choose?'),
  pause(),
  stmt('Tricky situation'),
  headerList(null,
    'Target distribution close to uniform',
    'Fewer particles than locations',
  _),
  parentCenter(distribGrid({})),
_));

prose(
  'Having proposed extensions to the particles and computed a weight for each particle,',
  'we now come to the question of which particles to keep.',
  _,
  'Intuitively, if a particle has very small weight, then we might want to prune it away.',
  'On the other hand, if a particle has high weight, maybe we should dedicate more resources to it.',
  _,
  'As a motivating example, consider an almost uniform distribution over a set of locations,',
  'and trying to represent this distribution with fewer particles than locations.',
  'This is a tough situation to be in.',
_);

add(slide('Step 3: resample',
  parentCenter(table(
    ['$K$ with highest weight', pause(), '$K$ sampled from distribution'], pause(-1),
    [distribGrid({beam: true}), pause(), distribGrid({sample: true})],
  _).margin(100, 10)).center(),
  pause(),
  stmt('Intuition: top $K$ assignments not representative.'),
  'Maybe random samples will be more representative...',
_));

prose(
  'Beam search, which would choose the $K$ locations with the highest weight, would clump all the particles near the mode.',
  'This is risky, because we have no support out farther from the center, where there is actually substantial probability.',
  _,
  'However, if we sample from the distribution which is proportional to the weights,',
  'then we can hedge our bets and get a more representative set of particles which cover the space more evenly.',
_);

add(slide('Step 3: resample',
  keyIdea('resampling',
    'Given a distribution $\\P(A = a)$ with $n$ possible values, draw a sample $K$ times.',
  _),
  stmt('Intuition: redistribute particles to more promising areas'),
  pause(),
  example('resampling',
    xtable(
      frameBox(table(
        ['$a$', '$\\P(A = a)$'],
        ['a1', '$0.70$'],
        ['a2', '$0.20$'],
        ['a3', '$0.05$'],
        ['a4', '$0.05$'],
      _).scale(0.7).center().margin(40, 0)),
      bigRightArrow(100),
      frameBox(table(
        ['sample $1$', 'a1'],
        ['sample $2$', 'a2'],
        ['sample $3$', 'a1'],
        ['sample $4$', 'a1'],
      _).scale(0.7).center().margin(40, 0)),
    _).center().margin(10),
  _),
_));

prose(
  'After proposing and weighting, we end up with a set of samples $x_{1:i}$, each with some weight $w(x_{1:i})$.',
  'Intuitively, if $w(x_{1:i})$ is really small, then it might not be worth keeping that particle around.',
  _,
  'Resampling allows us to put (possibly multiple) particles on high weight particles.',
  'In the example above, we don\'t sample a3 and a4 because they have low probability of being sampled.',
_);

add(slide('Step 3: resample',
  stmt('Old particles'),
  parentCenter('$\\approx \\P(X_1, X_2, X_3 \\mid E_1 = 0, E_2 = 1, E_3 = 1)$'),
  indent(ytable('[0, 1, 1] (0.8) $\\Rightarrow 2/3$', '[1, 0, 0] (0.4) $\\Rightarrow 1/3$')),
  pause(),
  stmt('New particles'),
  parentCenter('$\\approx \\P(X_1, X_2, X_3 \\mid E_1 = 0, E_2 = 1, E_3 = 1)$'),
  indent(ytable('[0, 1, 1]', '[0, 1, 1]')),
_));

prose(
  'In our example, we normalize the particle weights to form a distribution over particles.',
  'Then we draw $K = 2$ independent samples from that distribution.',
  'Higher weight particles will get more samples.',
_);

add(slide('Particle filtering',
  //stmt('Idea: keep $C$, set of $K$ partial assignments (particles)'),
  algorithm('particle filtering',
    'Initialize $C \\leftarrow [\\{ \\}]$', pause(),
    'For each $i = 1, \\dots, n$:',
    indent(stmt('Propose (extend)')),
    indent(indent('$C\' \\leftarrow \\{ (x_{1:{i-1}}, x_i) : x_{1:i-1} \\in C, x_i \\sim p(x_i \\mid x_{i-1}) \\}$')),
    pause(),
    indent(stmt('Reweight')),
    indent(indent('Compute weights $w(x_{1:i}) = p(e_i \\mid x_{i})$ for $x \\in C\'$')),
    pause(),
    indent(stmt('Resample (prune)')),
    indent(indent('$C \\leftarrow K$ elements drawn independently from $\\propto w(x_{1:i})$')),
  _).scale(0.9),
  pause(),
  parentCenter(text('[demo: <tt>particleFiltering({K:100})</tt>]').linkToUrl('index.html#include=inference-demo.js&example=chain&postCode=particleFiltering({K:100})')),
_));

prose(
  'The final algorithm here is very similar to beam search.',
  'We go through all the variables $X_1, \\dots, X_n$.',
  _,
  'For each candidate $x_{i-1} \\in C$, we propose $x_i$ according to the transition distribution $p(x_i \\mid x_{i-1})$.',
  _,
  'We then weight this particle using $w(x_{1:i}) = p(e_i \\mid x_i)$.',
  _,
  'Finally, we select $K$ particles from $\\propto w(x_{1:i})$ by sampling $K$ times independently.',
_);

add(slide('Particle filtering: implementation',
  bulletedText('If only care about last $X_i$, collapse all particles with same $X_i$ (think elimination)'),
  parentCenter(ytable(
    '$0 0 1 \\Rightarrow 1$', 
    '$1 0 1 \\Rightarrow 1$', 
    '$0 1 0 \\Rightarrow 0$', 
    '$0 1 0 \\Rightarrow 0$',
    '$1 1 0 \\Rightarrow 0$', 
  _)),
  pause(),
  bulletedText('If many particles are the same, can just store counts'),
  parentCenter(xtable(ytable(
    '$1$', 
    '$1$', 
    '$0$', 
    '$0$',
    '$0$', 
  _), '$\\Rightarrow$', ytable('$1:2$', '$0:3$')).center().margin(10)),
_));

prose(
  'In particle filtering as it is currently defined,',
  'each particle is an entire trajectory in the context of object tracking (assignment to all the variables).',
  _,
  'Often in tracking applications, we only care about the last location $X_i$,',
  'and the HMM is such that the future ($X_{i+1}, \\dots, X_n$) is conditionally independent of $X_1, \\dots, X_{i-1}$ given $X_i$.',
  'Therefore, we often just store the value of $X_i$ rather than its entire ancestry.',
  _,
  'When we only keep track of the $X_i$, we might have many particles that have the same value,',
  'so it can be useful to store just the counts of each value rather than having duplicates.',
_);

add(slide('Application: tracking',
  parentCenter(chainFactorGraph({n:5}).scale(0.8)),
  example('tracking',
    bulletedText('$X_i$: position of object at $i$'), pause(),
    bulletedText('Transitions: $t_i(x_i, x_{i+1}) = [x_i \\text{ near } x_{i+1}]$'), pause(),
    bulletedText('Observations: $o_i(x_i) = \\text{sensor reading...}$'), pause(),
  _),
_));

G.particleFilteringDemo = function() {
  if (sfig.serverSide) return '[see web version]';

  // Directions
  var dx = [0, +1, 0, -1, 0];
  var dy = [-1, 0, +1, 0, 0];
  var dNames = 'NESW=';

  // For rendering
  var items = [];  // List of all the cell Blocks to stick in the Overlay
  var cells = [];  // x, y => cell Block
  var obsBlocks = [];  // x, y => observation Blocks (circles)
  var cellSize = 10;  // Size of a cell Block

  // State: (x,y) position
  var particles;  // List of states
  var time;
  var prev_time;
  var ox, oy;

  // Grid
  var width = 3 * 10, height = 4 * 5;
  for (var x = 0; x < width; x++) {
    cells[x] = [];
    obsBlocks[x] = [];
    for (var y = 0; y < height; y++) {
      // represent uncertainty over the blocks
      var cell = square(cellSize).color('black').shiftBy(x*cellSize, y*cellSize);
      cells[x][y] = cell;
      items.push(cell);
      // For truePath or observation
      var obs = circle(3).color('black').shiftBy((x+0.5)*cellSize, (y+0.5)*cellSize);
      obsBlocks[x][y] = obs;
      items.push(obs);
    }
  }

  // Create the true path
  var truePath = null;  // Sequence of true states
  function setPath() {
    truePath = [];
    function p(xi, yi, d) {
      return [Math.floor(xi*width/3), Math.floor(yi*height/4), dNames.indexOf(d)];
    }
    var wayPoints = [
      p(2, 1, 'W'),
      p(1, 1, 'S'),
      p(1, 2, 'E'),
      p(2, 2, 'S'),
      p(2, 3, 'W'),
      p(1, 3, 'N'),
      p(1, 2, 'E'),
      p(2, 2, 'N'),
      p(2, 1, null),
    ];

    for (var pi = 0; pi < wayPoints.length-1; pi++) {
      var x = wayPoints[pi][0], y = wayPoints[pi][1], d = wayPoints[pi][2];
      var m;
      for (m = 0; m < 100; m++) {
        if (x == wayPoints[pi+1][0] && y == wayPoints[pi+1][1])  // Reached the end
          break;
        truePath.push([x, y]);
        x += dx[d];
        y += dy[d];
      }
      if (m == 100) throw 'Bad';
    }
    //truePath = [[10, 10]];  // Debugging
  }
  setPath();

  function renderCell(x, y, v) {
    if (!cells[x] || !cells[x][y]) return;  // Out of bounds
    var cell = cells[x][y];
    var color = rgb(v*255, 0, 0);
    updateColor(cell.color(color));
    var obs = obsBlocks[x][y];
    // Can overwrite if neither truePath nor observations are there
    var true_x = truePath[time][0];
    var true_y = truePath[time][1];
    if (!(ox == x && oy == y) && (!showTruePosition || !(true_x == x && true_y == y)))
      updateColor(obs.color(color));
  }

  function renderParticles(show) {
    // Set the color of squares
    var counts = {};
    for (var i = 0; i < numParticles; i++) {
      var p = particles[i];
      counts[p] = (counts[p] || 0) + 1;
    }
    for (var i = 0; i < numParticles; i++) {
      var p = particles[i];
      if (counts[p]) {
        if (show) {
          var base = 0.3;  // If particle exists, show something
          renderCell(p[0], p[1], base + counts[p]/numParticles * (1 - base));
        } else {
          renderCell(p[0], p[1], 0);
        }
        counts[p] = null;
      }
    }
  }

  function resetParticles() {
    particles = [];
    for (var i = 0; i < numParticles; i++) {
      var x = randint(width);
      var y = randint(height);
      particles.push([x, y]);
    }
  }

  function step() {
    // Remove old points
    if (prev_time != null && showTruePosition) {
      var prev_true_x = truePath[prev_time][0];
      var prev_true_y = truePath[prev_time][1];
      updateColor(obsBlocks[prev_true_x][prev_true_y].color('black'));
    }
    if (ox != null && oy != null)
      updateColor(obsBlocks[ox][oy].color('black'));

    // Sample observation
    var true_x = truePath[time][0];
    var true_y = truePath[time][1];
    var choices = [];
    var weights = [];
    // Approximation: don't consider things outside the grid
    for (var x = 0; x < width; x++) {
      for (var y = 0; y < height; y++) {
        var f = observeFactor(Math.abs(true_x-x), Math.abs(true_y-y));
        if (f == 0) continue;
        choices.push([x, y]);
        weights.push(f);
      }
    }
    if (weights.length == 0) {
      L('Error: no possible observations');
    }
    normalize(weights);
    var chosen_i = sampleMultinomial(weights);
    ox = choices[chosen_i][0];
    oy = choices[chosen_i][1];

    // Add new points
    if (showTruePosition)
      updateColor(obsBlocks[true_x][true_y].color('blue'));
    updateColor(obsBlocks[ox][oy].color('orange'));

    // Move to the new time step
    renderParticles(false); // Remove old particles
    var newParticles = [];
    var weights = [];
    var indexMap = {};  // map point to index in newParticles
    for (var i = 0; i < particles.length; i++) {
      var x = particles[i][0];
      var y = particles[i][1];

      // Extend
      var d = randint(5);
      var new_x = x + dx[d];
      var new_y = y + dy[d];

      // Reweight
      var w = observeFactor(Math.abs(new_x - ox), Math.abs(new_y - oy));
      if (!w) continue;
      var new_p = [new_x, new_y];
      var index = indexMap[new_p];
      if (index == null) {
        index = newParticles.length;
        indexMap[new_p] = index;
        newParticles[index] = new_p;
        weights[index] = w;
      } else {
        weights[index] += w;
      }
    }
    particles = newParticles;
    if (!normalize(weights)) {
      resetParticles();
    } else {
      // Resample
      var newParticles = [];
      for (var i = 0; i < numParticles; i++)
        newParticles[i] = particles[sampleMultinomial(weights)];
      particles = newParticles;
    }
    renderParticles(true);  // Add new particles

    // Advance time
    prev_time = time;
    time = (time + 1) % truePath.length;
  }

  var origInput = [
    '// Press ctrl-enter to start simulation',
    '',
    '// Observation model: distance between true and observed',
    'observeFactor = function(distx, disty) {',
    '  return distx <= 3 && disty <= 3;  // Box noise',
    '  //return Math.exp(-(distx*distx + disty*disty)/5);  // Gaussian noise',
    '  //return distx % 5 == 0 && disty % 5 == 0 && distx + disty <= 15;  // Weird',
    '}',
    'numParticles = 0          // Number of particles (try 10000)',
    'sampleTime = 100          // Milliseconds to wait between samples',
    'showTruePosition = false  // Set to true to see ground truth',
  ].join('\n');

  var inputBox = textBox().multiline(true).content(origInput).size(80, 12);
  var outputBox = new Overlay(items);
  var timerId = null;
  function show() {
    eval(inputBox.content().get());

    // Initialize particles
    time = 0;
    for (var x = 0; x < width; x++)
      for (var y = 0; y < height; y++)
        renderCell(x, y, 0);
    resetParticles();
    renderParticles(true);

    if (origInput != inputBox.content().get())
      pushKeyValue('particle-filtering-demo', {input: inputBox.content().get()});
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  }
  show();

  inputBox.onEnter(function() {
    show();
    timerId = setInterval(step, sampleTime);
    prez.refresh(function() { inputBox.focus(); });
  });
  outputBox.onClick(function() {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    } else {
      timerId = setInterval(step, sampleTime);
    }
  });

  return ytable(
    outputBox,
    inputBox,
  _).center().margin(10);
}

add(slide('Particle filtering demo',
  parentCenter(particleFilteringDemo()),
_));

prose(
  'Consider a tracking application where an object is moving around in a grid and we are trying to figure out its location $X_i \\in \\{1, \\dots, \\text{grid-width}\\} \\times \\{1, \\dots, \\text{grid-height}\\}$.',
  _,
  'The transition factors say that from one time step to the next, the object is equally likely to have moved north, south, east, west, or stayed put.',
  _,
  'Each observation is a location on the grid (a yellow dot).',
  'The observation factor is a user-defined function which depends on the vertical and horizontal distance.',
  _,
  'Play around with the demo to get a sense of how particle filtering works, especially the different observation factors.',
_);

add(summarySlide('Probabilistic inference',
  stmt('Model (Bayesian network or factor graph)'),
  parentCenter('$\\displaystyle \\P(X = x) = \\prod_{i=1}^n p(x_i \\mid x_{\\Parents(i)})$'),
  stmt('Probabilistic inference'),
  parentCenter('$\\P(Q \\mid E = e)$'),
  pause(),
  headerList('Algorithms',
    'Forward-backward: chain-structured (HMMs), exact',
    'Gibbs sampling, particle filtering: general, approximate',
  _),
  pause(),
  stmt('Next time: learning'),
_));

sfig.initialize();
