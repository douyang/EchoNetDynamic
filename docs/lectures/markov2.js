G = sfig.serverSide ? global : this;
G.prez = presentation();

add(titleSlide('Lecture 14: Markov networks II',
  nil(),
  parentCenter(isingModel({numRows: 8, numCols: 10, selected: function(r,c) {return (r+c)%2==0;}}).scale(0.3)),
_));

function roadmap(i) {
  var ids = ['conditionalProbability', 'gibbsSampling', 'particleFiltering', 'learning'];
  add(roadmapSlide('Roadmap',
    roadmapItem(i == 0, 'Conditional probabilities', ids[0]),
    roadmapItem(i == 1, 'Gibbs sampling', ids[1]),
    roadmapItem(i == 2, 'Particle filtering', ids[2]),
    //roadmapItem(i == 3, 'Learning', ids[3]),
  _).id(ids[i]));
}

add(slide('Review: Markov networks',
  parentCenter(chainFactorGraph({n:5}).scale(0.7)),
  definition('Markov network',
    'Given random variables $X_1, \\dots, X_n$,',
    parentCenter('$\\Weight(x) = \\prod_{j=1}^m f_j(x)$'),
    pause(),
    'A <b>Markov network</b> defines a distribution over $x$:',
    pause(),
    indent('$\\displaystyle \\P(X_1 = x_1, \\dots, X_n = x_n) = \\frac{\\Weight(x)}{Z}$,'),
    'where $Z$ is the '+redbold('normalization constant')+':',
    parentCenter('$\\displaystyle Z = \\sum_{x\'} \\Weight(x\')$'),
  _),
_));

prose(
  'We started last week by introducing factor graphs,',
  'which gave a decentralized way to define a global weight for each assignment as a product of local potentials.',
  'In this way, factor graphs provide a very nice framework for incorporating different little pieces of preferences and constraints.',
  _,
  'Then we noticed that if we <b>normalize</b> the weights',
  '(that is, divide by the sum of the weights of all the assignments, which is the normalization constant $Z$),',
  'then we get a probability distribution over assignments.',
  'The result is a <b>Markov network</b>.',
_);

add(slide('Review: elimination (sum)',
  parentCenter(image('images/combine-liquids.jpg').width(150)),
  stmt('Elimination of $X_i$ creates a message'),
  parentCenter('$\\displaystyle f_\\text{new}(x) = \\red{\\sum_{v}} \\prod_{j=1}^k f_j(x \\cup \\{ X_i : v \\})$'),
  parentCenter(eliminateVariableGraph()).scale(0.6),
_));

prose(
  'One of the main tools that we use to operate on a Markov network (or a general factor graph) is elimination.',
  'Recall that elimination of a variable $X_i$ removes that variable from the graph,',
  'along with all the potentials that depend on it (the Markov blanket of $X_i$),',
  'replacing it with a new potential that depends on the Markov blanket of $X_i$.',
  _,
  'The intuition is that the new potential represents the sum over the weights of assignments to $X_i$ conditioned on its Markov blanket.',
  'This can be interpreted as a message passed from $X_i$ to its Markov blanket.',
_);

add(slide('Review: marginal probabilities',
  parentCenter(overlay(
    table(
      [ytable(
        '$\\Weight(a, b)$',
        overlay(
          xtable(a = factorNode('$A$'), b = factorNode('$B$')).margin(50),
          edgeFactor(a, b),
        _).center(),
      _),
      showLevel(3),
      elim = bigRightArrow(100),
      ytable('$\\Weight_A(a)$',
        overlay(
          a = factorNode('$A$'),
          rightEdgeFactor(a),
        _),
      _).center(),
      ],
      showLevel(1),
      [norm1 = bigDownArrow(100), nil(), showLevel(4), norm2 = bigDownArrow(100)],
      showLevel(1),
      ['$\\P(A = a, B = b)$', pause(), marg = bigRightArrow(100), '$\\P(A = a)$'],
    _).center().margin(100, 50),
    showLevel(elim.showLevel()), moveTopOf('eliminate $B$', elim),
    showLevel(norm1.showLevel()), moveLeftOf('normalize', norm1),
    showLevel(norm2.showLevel()), moveLeftOf('normalize', norm2),
    showLevel(marg.showLevel()), moveTopOf('sum out $b$', marg),
  _)),
_));

prose(
  'A Markov network defines a probability distribution by virtue of normalization (which can be computed via elimination).',
  _,
  'From there, standard probability tells us that we can sum out a subset of the variables $B$ to get marginal probabilities over the other variables $A$ (again using elimination).',
  _,
  'However, it will be more useful to think of doing elimination directly on the factor graph, which means working with unnormalized weights.',
  'From there, we can always normalize to get the marginal distribution.',
  _,
  'In general, we should think directly in terms of the factor graph, knowing that we are one normalization constant away from an actual probability distribution.',
_);

add(slide('Review: Markov networks',
  parentCenter(chainFactorGraph({n:5}).scale(0.7)),
  parentCenter('$\\displaystyle \\P(X_1 = x_1, \\dots, X_n = x_n) \\propto \\Weight(x)$'),
  pause(),
  keyIdea('proportionality',
    'Represent (unnormalized) weights with <b>factor graph</b>.',
    'Get probability distribution by running <b>elimination</b>.',
  _),
_));

prose(
  'Notationally, we can use the proportional to operation when the left-hand side is a probability distribution over a set of variables,',
  'and the right-hand side is a non-negative function of those variables.',
_);

add(slide('Review: probabilistic inference',
  parentCenter(chainFactorGraph({n:5}).scale(0.7)),
  importantBox(redbold('Task: probabilistic inference'),
    headerList('Input',
      'factor graph over variables $X$ with weights $\\Weight(x)$ representing joint probabilities $\\P(X = x)$',
      pause(),
      'query variables $A \\subset X$',
    _),
    pause(),
    headerList('Output',
      'factor graph over variables $A$ with weights $\\Weight_A(a)$ representing marginal probabilities $\\P(A = a)$',
    _),
  _).scale(0.95),
_));

prose(
  'To summarize, what are we trying to do?',
  'Given a factor graph over a set of variables $X$, we have a weight for each assignment (but we don\'t know the normalization constant).',
  'Our goal is be able to answer queries on this graph (think of it as a database).',
  _,
  'Specifically, given a set of query variables $A$, we want to produce a factor graph over $A$.',
  _,
  'In the background, remember that each factor graph specifies a probability distribution by the normalization constant.',
_);

add(slide('Marginal probabilities: example',
  parentCenter(chainFactorGraph({n:5}).scale(0.7)),
  parentCenter(text('[demo]').linkToUrl('index.html#include=inference-demo.js&example=chain&postCode=query(\'X2 X3\'); sumVariableElimination()')),
  // Copied
  example('chain',
    parentCenter(xtable(
      frameBox(table(
        ['$x$', '$\\Weight(x)$', '$\\P(X = x)$'],
        ['0'+redbold('00')+'01', '8', 0.2],
        ['0'+redbold('00')+'11', '8', 0.2],
        ['0'+redbold('01')+'11', '8', 0.2],
        ['0'+redbold('11')+'11', '8', 0.2],
        ['0'+redbold('01')+'01', '2', 0.05],
        ['0'+redbold('10')+'01', '2', 0.05],
        ['0'+redbold('10')+'11', '2', 0.05],
        ['0'+redbold('11')+'01', '2', 0.05],
      _).margin(10, 0).center()),
      pause(),
      bigRightArrow(100),
      frameBox(table(
        ['$a$', '$\\Weight_A(a)$', '$\\P(A = a)$'],
        [redbold('00'), '16', '0.40'],
        [redbold('01'), '10', 0.25],
        [redbold('11'), '10', 0.25],
        [redbold('10'), '4', '0.10'],
      _).margin(10, 0).center()),
    _).center().margin(10).scale(0.6)),
  _).content.margin(20).end,
  pause(),
  parentCenter('What if we observe that $X_4 = 0$?'),
_));

////////////////////////////////////////////////////////////
// Conditional
roadmap(0);

add(slide('Conditional probabilities',
  definition('conditional probability',
    'The <b>conditional probability</b> of a query $A = a$ given a condition $B = b$ is:',
    indent('$\\displaystyle \\P(A = a \\mid B = b) = \\frac{\\P(A = a, B = b)}{\\P(B = b)}$'),
  _),
  pause(),
  stmt('Intuition: observe evidence $B = b$; how likely is $A = a$?'),
_));

add(slide('Conditional probabilities: example',
  parentCenter(text('[demo]').linkToUrl('index.html#include=inference-demo.js&example=chain&postCode=condition(\'X1\', 0); condition(\'X4\', 0), condition(\'X5\', 1); query(\'X2 X3\'); sumVariableElimination()')),
  example('chain',
    nowrapText('Let $A = (X_2, X_3), B = (X_1, X_4, X_5)$, $b = (0, 0, 1)$'),
    pause(),
    'Select matching rows and normalize:',
    parentCenter(xtable(
      frameBox(table(
        ['$x$', '$\\Weight(x)$', '$\\P(X = x)$'],
        ['0'+redbold('00')+'01', '8', 0.2],
        ['0'+('00')+'11', '8', 0.2],
        ['0'+('01')+'11', '8', 0.2],
        ['0'+('11')+'11', '8', 0.2],
        ['0'+redbold('01')+'01', '2', 0.05],
        ['0'+redbold('10')+'01', '2', 0.05],
        ['0'+('10')+'11', '2', 0.05],
        ['0'+redbold('11')+'01', '2', 0.05],
      _).margin(10, 0).center()),
      pause(),
      bigRightArrow(100),
      frameBox(table(
        ['$a$', '$\\Weight_{A, B=b}(a)$', '$\\P(A = a \\mid B = b)$'],
        [redbold('00'), '8', round(8/14, 2)],
        [redbold('01'), '2', round(2/14, 2)],
        [redbold('10'), '2', round(2/14, 2)],
        [redbold('11'), '2', round(2/14, 2)],
      _).margin(10, 0).center()),
    _).center().margin(10).scale(0.6)),
  _).content.margin(20).end,
_));

prose(
  'Conditional probabilities allow us to talk about the probability of some event (e.g., $A = a$) when we have observed some evidence (e.g., $B=b$).',
  _,
  'In general, the conditional probability $\\P(A = a \\mid B = b)$ will be different from the marginal probability $\\P(A = a)$ (unless $A$ and $B$ are independent).',
  _,
  'In the object tracking example, note that conditioned on $X_4 = 0$ (and $X_1 = 0, X_5 = 1$),',
  'the probability of $X_2 = X_3 = 0$ increases from $0.4$ to $0.57$.',
  'This should be intuitive because objects are more likely to stay in place than to move.',
_);

add(slide('Review: conditioning',
  parentCenter(image('images/break-chain.jpg').width(200)),
  stmt('Conditioning on $X_i=v$ creates'),
  parentCenter('$g_j(x) = f_j(x \\cup \\{ X_i:v\\})$'),
  parentCenter(conditionVariableGraph()).scale(0.6),
_));

prose(
  'Now let\'s use the tools of factor graphs to arrive at this result more directly.',
  'Recall that conditioning is another graph operation that removes the conditioned variable $X_i$',
  'and modifies its dependent potentials to be partial function evaluations of the original potentials.',
  _,
  'Importantly, recall that conditioning tends to break apart the graph into many pieces (whereas elimination tends to bind variables together).',
_);

add(slide('Conditional probabilities: computation',
  parentCenter(xtable(
    chainFactorGraph({n:5, condition:3}).scale(0.65),
    bigRightArrow(100),
    chainFactorGraph({n:5, condition:3, remove: true}).scale(0.65),
  _).margin(20).center()),
  '<b>Conditioning</b> on $B = b$ produces new factor graph over $A$:',
  parentCenter('$\\boxed{\\Weight_{A,B = b}(a) = \\Weight(a, b)}$'),
  pause(),
  stmt('Normalized distribution'),
  indent(stagger(
    '$\\displaystyle \\red{\\P(A = a \\mid B = b)} = \\frac{\\P(A = a, B = b)}{\\P(B = b)}$ [by definition]',
    '$\\displaystyle \\red{\\P(A = a \\mid B = b)} \\propto \\P(A = a, B = b)$ [constant]',
    '$\\displaystyle \\red{\\P(A = a \\mid B = b)} \\propto \\Weight(a, b)$ [constant]',
    '$\\displaystyle \\red{\\P(A = a \\mid B = b)} \\propto \\Weight_{A,B=b}(a)$ [by definition]',
  _)),
  pause(),
  parentCenter('Just another ordinary factor graph!'),
_));

add(slide('Conditional probabilities',
  parentCenter(overlay(
    table(
      [ytable(
        '$\\Weight(a, b)$',
        overlay(
          xtable(a = factorNode('$A$'), b = factorNode('$B$')).margin(50),
          edgeFactor(a, b),
        _).center(),
      _),
      showLevel(3),
      elim = bigRightArrow(100),
      ytable('$\\Weight_{A,B=b}(a)$',
        overlay(
          a = factorNode('$A$'),
          rightEdgeFactor(a),
        _),
      _).center(),
      ],
      showLevel(1),
      [norm1 = bigDownArrow(100), nil(), showLevel(4), norm2 = bigDownArrow(100)],
      showLevel(1),
      ['$\\P(A = a, B = b)$', pause(), marg = bigRightArrow(100), '$\\P(A = a \\mid B = b)$'],
    _).center().margin(100, 50),
    showLevel(elim.showLevel()), moveTopOf('condition on $B=b$', elim),
    showLevel(norm1.showLevel()), moveLeftOf('normalize', norm1),
    showLevel(norm2.showLevel()), moveLeftOf('normalize', norm2),
    showLevel(marg.showLevel()), moveTopOf('divide by $\\P(B = b)$', marg),
  _)).scale(0.9),
_));

prose(
  'Conditioning on $B=b$ as a graph operation actually corresponds directly to conditioning on $B=b$ in the probabilistic sense.',
  _,
  'Conditioning just produces a new factor graph over $A$, which can be normalized to produce a probability distribution,',
  'and that probability distribution is exactly the desired $\\P(A = a \\mid B = b)$.',
  _,
  'Again, we can think in terms of working on factor graphs (which implicitly define probabilities through the normalization constant) rather than manipulating probabilities directly.',
_);

add(slide('Combination: example',
  parentCenter(text('[demo]').linkToUrl('index.html#include=inference-demo.js&example=chain&postCode=condition(\'X3\', 0); query(\'X2\'); sumVariableElimination()')),
  stmt('Objective: compute $\\P(X_2 \\mid X_3 = 0)$'),
  parentCenter(chainFactorGraph({n:5}).scale(0.65)),
  pause(),
  'Condition on $X_3 = 0$:',
  parentCenter(chainFactorGraph({n:5, condition:3, remove: true}).scale(0.65)),
  pause(),
  'Eliminate $X_1,X_4,X_5$:',
  parentCenter(chainFactorGraph({n:3, condition:3, start:2, end:2, forward: true}).scale(0.65)),
_));

add(slide('Combination: general',
  headerList(null,
    'Given <b>query</b> variables $A \\subset X$.', pause(),
    'Given <b>conditioning</b> variables $B \\subset X$ and values $b$.', pause(),
    'Objective: compute $\\P(A = a \\mid B = b)$ for all $a$.',
  _),
  pause(),
  algorithm('probabilistic inference',
    bulletedText('<b>Condition</b> on $B = b$ (produces new factor graph).'), pause(),
    bulletedText('<b>Eliminate</b> all variables not in $A$.  (Shortcut: For variables not connected to $A$, simply remove.)'),
  _),
  pause(),
  keyIdea('factor graphs',
    'Conditioning disconnects, makes elimination easier!',
  _),
_));

prose(
  'Now let\'s take a more general query which involves both elimination (marginalization) and conditioning.',
  _,
  'First we condition on $X_3 = 0$, which breaks apart the graph.',
  _,
  'Second, we eliminate all the variables not in the query.',
  'Note that conditioning has helped us here: $X_4$ and $X_5$ are disconnected from the query $X_2$ (they are independent of $X_2$ conditioned on $X_3$),',
  'so we can actually just ignore them completely!.',
  'We just have to eliminate $X_1$, which creates a forward message $F_2$.',
  _,
  'The general point is that when you condition, the graph becomes more disconnected, which makes elimination easier.',
_);

add(slide('Examples',
  parentCenter(australia({})).scale(0.8),
  headerList('Examples',
    'Compute $\\P(\\text{WA})$', pause(),
    'Compute $\\P(\\text{WA} \\mid \\text{SA} = \\vR)$', pause(),
    'Compute $\\P(\\text{WA} \\mid \\text{SA} = \\vR, \\text{Q} = \\vG)$',
  _),
_));

/*add(slide('Example: chain',
  parentCenter(chainFactorGraph({n:5})),
  'How to compute $\\P(X_2 = x_2)$ for all $x_2$?',
  pause(),
  parentCenter(text('[demo]').linkToUrl('index.html#include=inference-demo.js&example=chain&postCode=query(\'X2\'); sumVariableElimination({order: \'X1 X5 X4 X3\'})')),
_));*/

/*add(slide('Example: chain',
  parentCenter(chainFactorGraph({n:5})),
  stmt('Sum forward messages'),
  xtable(
    forwardMessageGraph(),
    '$\\displaystyle F_i(x_{i+1}) = \\sum_{x_i} F_{i-1}(x_i) o_i(x_i) t_i(x_i, x_{i+1})$',
  _).margin(50).scale(0.75).center(),
  pause(),
  stmt('Sum backward messages'),
  xtable(
    parentCenter(backwardMessageGraph()),
    '$\\displaystyle B_i(x_{i-1}) = \\sum_{x_i} B_{i+1}(x_i) o_i(x_i) t_{i-1}(x_{i-1}, x_i)$',
  _).margin(50).scale(0.75).center(),
_));

add(slide('Example: chain',
  stmt('Sum marginals (nodes)'),
  parentCenter(muChainGraph()),
  parentCenter(nowrapText('$\\P(X_i = x_i) \\propto F_{i-1}(x_i) o_i(x_i) B_{i+1}(x_i)$')),
  pause(),
  stmt('Sum marginals (edges)'),
  parentCenter(mu2ChainGraph()),
  parentCenter(nowrapText('$\\P(X_i = x_i, X_{i+1} = x_{i+1}) \\propto F_{i-1}(x_i) o_i(x_i) t_i(x_i, x_{i+1}) o_{i+1}(x_{i+1}) B_{i+2}(x_i)$').scale(0.7)),
_));*/

add(slide('Example: grid',
  parentCenter(isingModel({numRows: 4, numCols: 10, label: true, selected: function(r, c) { return r == 2 || c == 7}}).scale(0.6)),
  stmt('Goal: compute'),
  parentCenter('$\\P(X_{4,1}, X_{4,2} \\mid X_{1,*}, X_{*,8})$'),
_));

add(quizSlide('markov1/gridEliminate',
  'How many variables must be non-trivially eliminated (not just removed)?',
_));

prose(
  'Here are some examples of factor graphs for you to practice conditioning and elimination.',
  'You should make strong use of your graph intuitions to reason about probabilities.',
  _,
  'On the Australia example, T is already disconnected, so we can just ignore it.',
  'If we condition on SA and Q, that disconnects V and NSW from WA, so we can ignore those two.',
  'Finally, we just eliminate NT, which is the only thing that actually requires computation.',
  _,
  'In the grid example, conditioning disconnects the northwest quadrant from everything else.',
  'After that, we just need to eliminate the 12 variables on either side of the two query variables.',
_);

add(summarySlide('Summary',
  keyIdea('graphs and probabilities',
    'Factor graphs represent probability distributions compactly.',
  _),
  pause(),
  parentCenter(table(
    ['Intuition', 'Probability', 'Graph operation'].map(bold), pause(),
    ['observe', 'conditional probability', 'conditioning'], pause(),
    ['query', 'marginal probability', 'elimination'],
  _).margin(50, 5)),
_));

add(slide('Probabilistic inference',
  stmt('Goal'),
  parentCenter('given query $A \\subset X$, compute $\\P(A = a)$ for all $a$'),
  pause(),
  headerList('Exact inference',
    'Eliminate all variables not in $A$',
    'Running time is exponential in treewidth',
  _),
  pause(),
  headerList('Approximate inference',
    'Local search (max) $\\Rightarrow$ <b>Gibbs sampling</b> (sum)',
    'Beam search (max) $\\Rightarrow$ <b>particle filtering</b> (sum)',
  _),
_));

prose(
  'Now we have an exact inference algorithm for computing all sorts of marginal and conditional probabilities given a factor graph.',
  'However, recall that the running time of variable elimination is exponential in the treewidth,',
  'so we often have to resort to approximate inference methods.',
  _,
  'We\'ve already laid the groundwork for the two styles of approximate inference when we talked about finding maximum weight assignments.',
  'The first was local search, which worked with complete assignments and kept on reassigning one variable at a time.',
  'We even mentioned Gibbs sampling as a way of getting out of local optima, but now we will revisit it through the lens of probabilistic inference.',
  _,
  'The second was beam search, which worked by maintaining a candidate set of partial assignments.',
  'We will give the probabilistic analog of this, called particle filtering or sequential Monte Carlo.',
_);

sfig.initialize();
