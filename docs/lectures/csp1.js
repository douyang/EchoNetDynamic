G = sfig.serverSide ? global : this;
G.prez = presentation();

add(titleSlide('Lecture 11: CSPs I',
  nil(),
  parentCenter(image('images/sodoku-green.jpg').width(300)),
_));

add(quizSlide('csp1-start',
  //'Is it possible to get faster algorithms by going to a higher-level language (e.g., C to Python)?',
  //'yes',
  //'no',
  'Find two neighboring countries, one that begins with an A and the other that speaks Hungarian.',
  // Country, Language
_));

function roadmap(i) {
  add(outlineSlide('Roadmap', i, [
    ['definition', 'Factor graphs'],
    ['dynamic', 'Dynamic ordering'],
    ['arc', 'Arc consistency'],
    ['modeling', 'Modeling'],
  ]));
}

evolutionOfModels(9, 'Constraint satisfaction problems');

prose(
  'We\'ve finished our tour of machine learning and state-based models,',
  'which brings us to the midpoint of this course.',
  'Let\'s reflect a bit on what we\'ve covered so far.',
_);

add(slide('Review: paradigm',
  parentCenter(yseq(
    frameBox(xtable(
      'Real-world task',
      image('images/airplane.jpg').width(100),
    _).margin(10).center()).bg.round(10).end, pause(),
    labeledDownArrow(red('<b>Modeling</b>')),
    frameBox(xtable(
      'Formal task ('+red('model')+')',
      image('images/cartoon-airplane.jpg').width(100),
    _).margin(10).center()).bg.round(10).end, pause(),
    labeledDownArrow(blue('<b>Algorithms</b>')),
    pause(-2),
    frameBox(xtable(
      'Program',
      image('images/source-code.png').height(50),
    _).margin(10).center()).bg.round(10).end, pause(2),
  _).center()),
_));

prose(
  'Recall the paradigm that we\'ve been working in:',
  'separate modeling (what to compute) from algorithms (how to compute it).',
_);

add(slide('State-based models',
  parentCenter(table(
    [redbold('[Modeling]'), nil(), nil()],
    [bold('Framework'), 'search problems', 'MDPs/games'],
    [bold('Objective'), 'minimum cost paths', 'maximum value policies'],
    pause(),
    [bluebold('[Algorithms]'), nil(), nil()],
    [bold('Tree-based'), 'backtracking', 'minimax/expectimax'],
    [bold('Graph-based'), 'DP, UCS, A*', 'value/policy iteration'],
    pause(),
    [greenbold('[Learning]'), nil(), nil()],
    [bold('Methods'), 'structured Perceptron', 'Q-learning, TD learning'],
  _).margin(10, 20)).scale(0.95),
_));

prose(
  'Modeling: In the context of state-based models,',
  'we seek to find minimum cost paths (for search problems) or maximum value policies (for MDPs and games).',
  _,
  'Algorithms: To compute these solutions, we can either work on the search/game tree or on the state graph.',
  'In the former case, we end up with recursive procedures which take exponential time but require very little memory (generally linear in the size of the solution).',
  'In the latter case, where we are fortunate to have few enough states to fit into memory,',
  'we can work directly on the graph, which can often yield an exponential savings in time.',
  _,
  'Given that we can find the optimal solution with respect to a fixed model,',
  'the final question is where this model actually comes from.',
  'Learning provides the answer: from data.',
  'You should think of machine learning as not just a way to do binary classification,',
  'but more as a way of life, which can be used to support a variety of different models.',
  _,
  'In the rest of the course, modeling, algorithms, and learning will continue to be',
  'the three structural supports of the techniques we will develop.',
_);

function simpleSearchProblem() {
  Math.seedrandom(23);
  return nodeEdgeGraph({
    //edges: 'S A|A B|B C|A C|C G|S B|B G'.split('|').map(function(x) { return x + ' ' + Math.floor(Math.random()*10); }),
    edges: 'S A|A G|S B|B G'.split('|').map(function(x) { return x + ' ' + Math.floor(Math.random()*10); }),
    xequal: ['S =0'], yequal: ['S G'], directed: true, labelScale: 0.5, labelColor: 'red', initRandom: 3,
  });
}

add(slide('State-based models: takeaway 1',
  parentCenter(simpleSearchProblem()),
  keyIdea('specify locally, optimize globally',
    stmt('Modeling: specifies local interactions'),
    stmt('Algorithms: find globally optimal solutions'),
  _),
_));

prose(
  'One high-level takeaway is the motto: specify locally, optimize globally.',
  'When we\'re building a search problem,',
  'we only need to specify how the states are connected through actions',
  'and what the local action costs are;',
  'we need not specify the long-term consequences of taking an action.',
  'It is the job of the algorithms to take all of this local information',
  'into account and produce globally optimal solutions (minimum cost paths).',
  _,
  'This separation is quite powerful in light of modeling and algorithms:',
  'having to worry only about local interactions makes modeling easier,',
  'but we still get the benefits of a globally optimal solution via algorithms',
  'which are constructed independent of the domain-specific details.',
  _,
  'We will see this local specification + global optimization pattern',
  'again in the context of variable-based models.',
_);

add(slide('State-based models: takeaway 2',
  parentCenter(simpleSearchProblem()),
  keyIdea('state',
    'A <b>state</b> is a summary of all the past actions sufficient to choose future actions <b>optimally</b>.',
  _),
  pause(),
  stmt('Mindset: move through states (nodes) via actions (edges)'),
_));

prose(
  'The second high-level takeaway which is core to state-based models is the notion of <b>state</b>.',
  'The state, which summarizes previous actions, is one of the key tools that allows us to manage',
  'the exponential search problems frequently encountered in AI.',
  'We will see the notion of state appear again in the context of conditional independence in variable-based models.',
  _,
  'With states, we were in the mindset of thinking about taking a sequence of actions (where order is important) to reach a goal.',
  'However, in some tasks, order is irrelevant.',
  'In these cases, maybe search isn\'t the best way to model the task.',
  'Let\'s see an example.',
_);

add(slide(null,
  parentCenter(image('images/australia.jpg').width(400)),
  pause(),
  stmt('Question: how can we color each of the 7 provinces {'+red('red')+','+green('green')+','+blue('blue')+'} so that no two neighboring provinces have the same color?'),
  //stmt('Question: many ways are there to color each of the 7 provinces {'+red('red')+','+green('green')+','+blue('blue')+'} so that no two neighboring provinces have the same color?'),
_));

add(slide('Map coloring',
  parentCenter(image('images/australia-colored.png').width(400)),
  parentCenter('(one possible solution)'),
  //parentCenter(stmt('Answer: 18')),
_));

add(slide(null,
  parentCenter(australiaBacktrackingTree()),
_).leftHeader(ytable(
  text(darkblue('Search')).scale(3),
  text(red('WA,V,T')+',Q,NT,SA,NSW').scale(1.5),
_)));

add(slide('As a search problem',
  parentCenter(partlyColoredAustralia().scale(0.5)),
  bulletedText(stmt('State', 'partial assignment of colors to provinces')),
  bulletedText(stmt('Action', 'assign next uncolored province a compatible color')),
  pause(),
  darkblue('What\'s next? Exploit the problem structure!'), pause(),
  bulletedText('Variable ordering doesn\'t affect correctness'), pause(),
  bulletedText('Variables are interdependent in a local way'),
_));

prose(
  'We can certainly use search to find an assignment of colors to the provinces of Australia.',
  'Let\'s fix an arbitrary ordering of the provinces.',
  'Each state contains an assignment of colors to a subset of the provinces (a <b>partial assignment</b>),',
  'and each action chooses a color for the next unassigned province as long as the color isn\'t already assigned to one of its neighbors.',
  'In this way, all the leaves of the search tree are solutions (18 of them).',
  '(In the slide, in the interest of space, we\'ve only shown the subtree rooted at a partial assignment to 3 variables.)',
  _,
  'This is a fine way to solve this problem, and in general, it shows how powerful search is:',
  'we don\'t actually need any new machinery to solve this problem.',
  'But the question is: can we do better?',
  _,
  'First, the particular search tree that we drew had several dead ends;',
  'it would be better if we could detect these earlier.',
  'We will see in this lecture that the fact that <b>the order in which we assign variables doesn\'t matter for correctness</b>',
  'gives us the flexibility to dynamically choose a better ordering of the variables.',
  'That, with a bit of lookahead will allow us to dramatically improve the efficiency over naive tree search.',
  _,
  'Second, it\'s clear that Tasmania\'s color can be any of the three colors regardless of the colors on the mainland.',
  'This is an instance of <b>independence</b>, and next time, we\'ll see how to exploit these observations systematically.',
_);

add(slide('Variable-based models',
  'A new framework...',
  parentCenter(image('images/brick-foundation.jpg').width(200)),
  pause(),
  keyIdea('variables',
    bulletedText('Solutions to problems $\\Rightarrow$ assignments to variables ('+red('modeling')+').'), pause(),
    bulletedText('Decisions about variable ordering, etc. chosen by '+blue('algorithms')+'.'),
  _),
  //('Work at a higher level of abstraction...'),
_));

prose(
  'With that motivation in mind, we now embark on our journey into variable-based models.',
  'Variable-based models is an umbrella term that includes constraint satisfaction problems (CSPs),',
  'Markov networks, Bayesian networks, hidden Markov models (HMMs), conditional random fields (CRFs), etc.,',
  'which we\'ll get to later in the course.',
  'The term graphical models can be used interchangeably with variable-based models,',
  'and the term probabilistic graphical models (PGMs) generally encompasses',
  'both Markov networks (also called undirected graphical models) and Bayesian networks (directed graphical models).',
  _,
  'The unifying theme is the idea of thinking about solutions to problems as assignments of values to variables (this is the modeling part).',
  'All the details about how to find the assignment (in particular, which variables to try first) are delegated to the algorithms.',
  'So the advantage of using variable-based models over state-based models is that it\'s making the algorithms do more of the work,',
  'freeing up more time for modeling.',
_);

add(slide('An analogy',
  stmt('State-based models'),
  parentCenter(image('images/stick-shift.jpg')),
  stmt('Variable-based models'),
  parentCenter(image('images/auto-shift.jpg')),
_));

prose(
  'An apt analogy are programming languages.',
  _,
  'Solving a problem directly by implementing an ad-hoc program is like using assembly language.',
  _,
  'Solving a problem using state-based models is like using C.',
  _,
  'Solving a problem using variable-based models is like using Python.',
  _,
  'By moving to a higher language, you might forgo some amount of ability to optimize manually,',
  'but the advantage is that (i) you can think at a higher level and',
  '(ii) there are more opportunities for optimizing automatically.',
_);

add(slide('How to describe your solution',
  stmt('Question: How are you solving the problem?'),
  pause(),
  stagger(
    stmt('Bad answer: I\'m using C++.'),
    stmt('Bad answer: I\'m using SVMs.'),
    stmt('Bad answer: I\'m using MDPs.'),
  _),
  pause(),
  stagger(
    stmt('Good answer: The features are bag of words.'),
    stmt('Good answer: The states capture position and velocity.'),
  _),
_));

prose(
  'While we\'re on the topic of programming languages and tools,',
  'it\'s worth making one final general remark: What is the best way to describe a solution',
  '(e.g., in writing up your final project)?',
  _,
  'It\'s not very informative to simply say that you used SVMs,',
  'because you could have used SVMs in a thousand different ways,',
  'just like you could have used C++ in a thousand different ways.',
  'SVMs, MDPs, and C++ are just tools and frameworks that help you get the job done,',
  'but should only play a supporting role in your description.',
  _,
  'It is much more useful to describe the <b>model</b> that you used to represent your real-world task.',
  'What are the features trying to capture about the problem (in the case of machine learning)?',
  'What are the states, actions, costs, etc. capturing (in the case of state-based models)?',
  _,
  'Once the tools (MDPs, etc.) become second nature,',
  'it is almost as if they are invisible.',
  'It\'s like when you master a language, you can "think" in it without constantly referring to the framework.',
_);

////////////////////////////////////////////////////////////
// CSPs
roadmap(0);

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

function table_weight() {
  return frameBox(table(
    ['$x_1$', '$x_2$', '$x_3$', '$\\Weight$'],
    ['$\\vR$', '$\\vR$', '$\\vR$', '$0 \\cdot 1 \\cdot 3 \\cdot 2 = 0$'],
    ['$\\vR$', '$\\vR$', '$\\vB$', '$0 \\cdot 1 \\cdot 2 \\cdot 1 = 0$'],
    ['$\\vR$', '$\\vB$', '$\\vR$', '$0 \\cdot 0 \\cdot 2 \\cdot 2 = 0$'],
    ['$\\vR$', '$\\vB$', '$\\vB$', '$0 \\cdot 0 \\cdot 3 \\cdot 1 = 0$'],
    ['$\\vB$', '$\\vR$', '$\\vR$', '$1 \\cdot 0 \\cdot 3 \\cdot 2 = 0$'],
    ['$\\vB$', '$\\vR$', '$\\vB$', '$1 \\cdot 0 \\cdot 2 \\cdot 1 = 0$'],
    ['$\\vB$', '$\\vB$', '$\\vR$', '$1 \\cdot 1 \\cdot 2 \\cdot 2 = 4$'],
    ['$\\vB$', '$\\vB$', '$\\vB$', '$1 \\cdot 1 \\cdot 3 \\cdot 1 = 3$'],
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
  pause(),
  parentCenter(text('[demo]').linkToUrl('index.html#include=inference-demo.js&example=vote')),
_));

prose(
  'The most important concept for the next three weeks will be that of a <b>factor graph</b>.',
  'But before we define it formally, let us consider a simple example.',
  _,
  'Suppose there are three people, each of which will vote for a color, red or blue.',
  'We know that Person 1 is leaning pretty set on blue, and Person 3 is leaning red.',
  'Person 1 and Person 2 must have the same color,',
  'while Person 2 and Person 3 would weakly prefer to have the same color.',
  _,
  'We can model this as a factor graph consisting of three <b>variables</b>, $X_1, X_2, X_3$,',
  'each of which must be assigned red ($\\vR$) or blue ($\\vB$).',
  _,
  'We encode each of the constraints/preferences as a <b>factor</b>,',
  'which assigns a non-negative number based on the assignment to a subset of the variables.',
  'We can either describe the factor as an explicit table, or via a function (e.g., $[x_1 = x_2]$).',
_);

add(slide('Factor graph',
  parentCenter(exampleFactorGraph()),
  definition('factor graph',
    stmt('Variables'),
    indent('$X = (X_1, \\dots, X_n)$, where $X_i \\in \\Domain_i$'),
    pause(),
    stmt('Factors (potentials)'),
    indent('$f_1, \\dots, f_m$, with each $f_j(X) \\ge 0$'),
  _),
_));

prose(
  'Now we proceed to the general definition.',
  'a factor graph consists of a set of variables and a set of factors:',
  '(i) $n$ variables $X_1, \\dots, X_n$, which are represented as circular nodes in the graphical notation; and',
  '(ii) $m$ factors (also known as potentials) $f_1, \\dots, f_m$, which are represented as square nodes in the graphical notation.',
  _,
  'Each variable $X_i$ can take on values in its <b>domain</b> $\\Domain_i$.',
  'Each factor $f_j$ is a function that takes an assignment $x$ to all the variables and returns a non-negative number',
  'representing how good that assignment is (from the factor\'s point of view).',
  'Usually, each factor will depend only on a small subset of the variables.',
_);

add(slide(null,
  example('map coloring',
    parentCenter(australia({}).scale(0.6)),
    stmt('Variables'),
    indentNowrapText('$X = (\\text{WA}, \\text{NT}, \\text{SA}, \\text{Q}, \\text{NSW}, \\text{V}, \\text{T})$'),
    indentNowrapText('$\\Domain_i \\in \\{ \\vR, \\vG, \\vB \\}$'),
    pause(),
    stmt('Factors'),
    indentNowrapText('$f_1(X) = [\\text{WA} \\neq \\text{NT}]$'),
    indentNowrapText('$f_2(X) = [\\text{NT} \\neq \\text{Q}]$'),
    indentNowrapText('...'),
  _),
_));

prose(
  'Notation: we use $[\\text{condition}]$ to represent the indicator function which is',
  'equal to $1$ if the condition is true and $0$ if not.',
  'Normally, this is written $\\1[\\text{condition}]$, but we drop the $\\1$',
  'for succinctness.',
_);

add(slide('Factors',
  definition('scope and arity',
    '<b>Scope</b> of a factor $f_j$: set of variables it depends on.', pause(),
    '<b>Arity</b> of $f_j$ is the number of variables in the scope.', pause(),
    '<b>Unary</b> factors (arity 1); <b>Binary</b> factors (arity 2).',
  _), pause(),
  showLevel(0),
  example('map coloring',
    bulletedText('Scope of $f_1(X) = [\\text{WA} \\neq \\text{NT}]$ is $\\{\\text{WA},\\text{NT}\\}$'), pause(2),
    bulletedText('$f_1$ is a binary factor'),
  _),
_));

prose(
  'The key aspect that makes factor graphs useful is that each factor $f_j$ only depends on a subset of variables, called the <b>scope</b>.',
  'The arity of the factors is generally small (think 1 or 2).',
_);

add(slide('Assignment weights (example)',
  parentCenter(table(
    [
      table_f1(),
      table_f2(),
      table_f3(),
      table_f4(),
    ],
  _).center().margin(40, 20)).scale(0.6),
  pause(),
  parentCenter(table_weight().scale(0.8)),
  pause(),
  parentCenter(text('[demo]').linkToUrl('index.html#include=inference-demo.js&example=vote')),
_));

prose(
  'A factor graph specifies all the local interactions between variables.',
  'We wish to find a global solution.',
  'A solution is called an <b>assignment</b>, which specifies a value for each variable.',
  _,
  'Each assignment is associated with a weight, which is just the product over each factor evaluated on that assignment.',
  'Intuitively, each factor contributes to the weight.',
  'Note that any factor has veto power: if it returns zero, then the entire weight is irrecoverably zero.',
  _,
  'In this setting, the maximum weight assignment is $(\\vB, \\vB, \\vR)$, which has a weight of 4.',
  'You can think of this is the optimal configuration or the most likely outcome.',
_);

add(slide('Assignment weights',
  definition('assignment weight',
    'Each <b>assignment</b> $x = (x_1, \\dots, x_n)$ has a <b>weight</b>:',
    parentCenter('$\\displaystyle \\Weight(x) = \\prod_{j=1}^m f_j(x)$'),
  _),
  pause(),
  stmt('Objective', 'find the maximum weight assignment'),
  parentCenter('$\\displaystyle \\arg\\max_{x} \\Weight(x)$'),
_));

prose(
  'Formally, the <b>weight</b> of an assignment $x$ is',
  'the product of all the factors applied to that assignment ($\\prod_{j=1}^m f_j(x)$).',
  'Think of all the factors chiming in on their opinion of $x$.',
  'We multiply all these opinions together to get the global opinion.',
  _,
  'Our objective will be to find the <b>maximum weight assignment</b>.',
  _,
  'Note: do not confuse the term "weight" in the context of factor graphs with the "weight vector" in machine learning.',
_);

add(slide(null,
  example('map coloring',
    parentCenter(coloredAustralia().scale(0.6)),
    stmt('Assignment'),
    indent(nowrapText('$x = \\{\\text{WA}:\\vR, \\text{NT}:\\vG, \\text{SA}:\\vB, \\text{Q}:\\vR, \\text{NSW}:\\vG, \\text{V}:\\vR, \\text{T}:\\vG \\}$').scale(0.7)),
    pause(),
    stmt('Weight'),
    parentCenter('$\\Weight(x) = 1 \\cdot 1 \\cdot 1 \\cdot 1 \\cdot 1 \\cdot 1 \\cdot 1 \\cdot 1 \\cdot 1 = 1$'),
    pause(),
    stmt('Assignment'),
    indent(nowrapText('$x\' = \\{\\text{WA}:\\vR, \\text{NT}:\\vR, \\text{SA}:\\vB, \\text{Q}:\\vR, \\text{NSW}:\\vG, \\text{V}:\\vR, \\text{T}:\\vG \\}$').scale(0.7)),
    pause(),
    stmt('Weight'),
    parentCenter('$\\Weight(x\') = 0 \\cdot 0 \\cdot 1 \\cdot 1 \\cdot 1 \\cdot 1 \\cdot 1 \\cdot 1 \\cdot 1 = 0$'),
  _),
_));

prose(
  'In the map coloring example, each factor only looks at the variables of two adjacent countries',
  'and checks if the colors are different (returning $1$) or the same (returning $0$).',
  'From a modeling perspective, this allows us to specify local interactions in a modular way.',
  'A global notion of consistency is achieved by multiplying together all the factors.',
  _,
  'Again note that the factors are multiplied (not added),',
  'which means that any factor has veto power: a single zero causes the entire weight to be zero.',
_);

add(slide('Constraint satisfaction problems',
  definition('constraint satisfaction problem (CSP)',
    'A CSP is a factor graph where all factors are <b>constraints</b>:',
    parentCenter('$f_j(x) \\in \\{0, 1\\}$ for all $j = 1, \\dots, m$'),
    'The constraint is satisfied iff $f_j(x) = 1$.',
  _),
  pause(),
  definition('consistent assignments',
    'An assignment $x$ is <b>consistent</b> iff $\\Weight(x) = 1$ (i.e., <b>all</b> constraints are satisfied).',
  _),
_));

prose(
  'Constraint satisfaction problems are just a special case of factor graphs where each of the factors returns either $0$ or $1$.',
  'Such a factor is a <b>constraint</b>, where $1$ means the constraint is satisfied and $0$ means that it is not.',
  _,
  'In a CSP, all assignments have either weight $1$ or $0$.',
  'Assignments with weight $1$ are called <b>consistent</b> (they satisfy all the constraints),',
  'and the assignments with weight $0$ are called inconsistent.',
  'Our goal is to find any consistent assignment (if one exists).',
_);

/*add(slide('An analogy',
  parentCenter(xtable(exampleFactorGraph(), image('images/people-opinions.jpg')).center().margin(50)),
  stmt('Variables: issues'),
  stmt('Factors: people voicing what they want (local)'),
  pause(),
  stmt('Maximum weight assignment: decide on issues to try to make people happy (global)'),
_));*/

add(summarySlide('Summary so far',
  parentCenter(exampleFactorGraph()),
  parentCenter(table(
    ['<b>Factor graph</b> (general)', '<b>CSP</b> (all or nothing)'],
    ['variables', 'variables'],
    ['factors', 'constraints'],
    ['assignment weight', 'consistent or inconsistent'],
  _).margin(50, 5)),
_));

////////////////////////////////////////////////////////////
// Dynamic ordering
roadmap(1);

// For each region, set of colors (NULL means anything is okay)
function feasibleSet(colors) {
  var myRegions = colors.regions || australiaRegions;
  var items = [];
  function box(set, color) {
    if (set == null || set.match(color)) return square(20).fillColor(color).fillOpacity(0.5);
    return square(20).opacity(0);
  }
  for (var i = 0; i < myRegions.length; i++) {
    var r = box(colors[myRegions[i]], 'red');
    var g = box(colors[myRegions[i]], 'green');
    var b = box(colors[myRegions[i]], 'blue');
    items.push(frame(xtable(r, g, b)).bg.strokeWidth(1).end);
  }
  return table(myRegions, items).center().xmargin(10);
}

function ausNode(x) { 
  return factorNode(text(x).scale(0.9), {color: standardAustraliaColors[x]}).scale(0.8);
}

function restrictedColors(colorStr) {
  var colors = {};
  colorStr.split(' ').forEach(function(c) {
    colors[c] = standardAustraliaColors[c];
  });
  return colors;
}

add(slide('Extending partial assignments',
  parentCenter(stagger(
    australia({colors: restrictedColors('')}),
    australia({colors: restrictedColors('WA')}),
    australia({colors: restrictedColors('WA NT')}),
    australia({colors: restrictedColors('WA NT SA')}),
    australia({colors: restrictedColors('WA NT SA Q')}),
    australia({colors: restrictedColors('WA NT SA Q NSW')}),
    australia({colors: restrictedColors('WA NT SA Q NSW V')}),
    australia({colors: restrictedColors('WA NT SA Q NSW V T')}),
  _)).scale(0.6),
  pause(-6),
  parentCenter(table(
    [ausNode('WA'), pause(),
    ausNode('NT'), pause(),
    ausNode('SA'), pause(),
    ausNode('Q'), pause(),
    ausNode('NSW'), pause(),
    ausNode('V'), pause(),
    ausNode('T')], pause(-5),
    [nil(),
    ytable('$[\\text{WA} \\neq \\text{NT}]$').scale(0.7), pause(),
    ytable('$[\\text{WA} \\neq \\text{SA}]$', '$[\\text{NT} \\neq \\text{SA}]$').scale(0.7).center(), pause(),
    ytable('$[\\text{NT} \\neq \\text{Q}]$', '$[\\text{SA} \\neq \\text{Q}]$').scale(0.7).center(), pause(),
    ytable('$[\\text{SA} \\neq \\text{NSW}]$', '$[\\text{Q} \\neq \\text{NSW}]$').scale(0.7).center(), pause(),
    ytable('$[\\text{SA} \\neq \\text{V}]$', '$[\\text{NSW} \\neq \\text{V}]$').scale(0.7).center(),
    nil(),
    ],
  _).margin(20, 5).center()).scale(0.9),
_));

prose(
  'The general idea, as we\'ve already seen in our search-based solution is to work with <b>partial assignments</b>.',
  'We\'ve defined the weight of a full assignment to be the product of all the factors applied to that assignment.',
  _,
  'We extend this definition to partial assignments:',
  'The weight of a partial assignment is defined to be the product of all the factors whose scope',
  'includes only assigned variables.',
  'For example, if only $\\text{WA}$ and $\\text{NT}$ are assigned,',
  'the weight is just value of the single factor between them.',
  _,
  'When we assign a new variable a value, the weight of the new extended assignment is',
  'defined to be the original weight times all the factors',
  'that depend on the new variable and only previously assigned variables.',
_);

add(slide('Dependent factors',
  bulletedText('Partial assignment (e.g., $x = \\{ \\text{WA}: \\vR, \\text{NT}: \\vG \\}$)'),
  parentCenter(australia({colors: {WA: 'red', NT: 'green'}})).scale(0.5),
  pause(),
  definition('dependent factors',
    'Let $D(x, X_i)$ be set of factors depending on $X_i$ and $x$ but not on unassigned variables.',
  _),
  parentCenter('$D(\\{ \\text{WA}: \\vR, \\text{NT}: \\vG \\}, \\text{SA}) = \\{ [\\text{WA} \\neq \\text{SA}], [\\text{NT} \\neq \\text{SA}] \\}$').scale(0.85),
_));

prose(
  'Formally, we will use $D(x, X_i)$ to denote this set of these factors, which we will call <b>dependent factors</b>.',
  _,
  'For example, if we assign $\\text{SA}$, then $D(x, \\text{SA})$ contains two factors:',
  'the one between $\\text{SA}$ and $\\text{WA}$ and the one between $\\text{SA}$ and $\\text{NT}$.',
_);

function backtrackingSearchAlgorithm(opts) {
  var myPause = opts.pause ? pause : function() { return _; };
  return algorithm('backtracking search',
    '$\\text{Backtrack}(x, w, \\Domains)$:',
    bulletedText('If $x$ is complete assignment: update best and return'), myPause(),
    bulletedText(red('Choose unassigned <b>VARIABLE</b> $\\red{X_i}$')), myPause(),
    bulletedText(red('Order <b>VALUES</b> $\\red{\\Domain_i}$ of chosen $\\red{X_i}$')), myPause(),
    bulletedText('For each value $v$ in that order:'), myPause(),
    indent(bulletedText('$\\displaystyle \\delta \\leftarrow \\prod_{f_j \\in D(x, X_i)} f_j(x \\cup \\{X_i:v\\})$')), myPause(),
    indent(bulletedText('If $\\delta = 0$: continue')), myPause(),
    indent(bulletedText(red('$\\red{\\Domains\' \\leftarrow \\Domains}$ via <b>LOOKAHEAD</b>'))), myPause(),
    indent(bulletedText('$\\text{Backtrack}(x \\cup \\{ X_i:v\\}, w \\delta, \\Domains\')$')),
  _);
}

add(slide('Backtracking search',
  backtrackingSearchAlgorithm({pause: true}),
_));

prose(
  'Now we are ready to present the full backtracking search,',
  'which is a recursive procedure that takes in a partial assignment $x$,',
  'its weight $w$, and the domains of all the variables $\\Domains = (\\Domain_1, \\dots, \\Domain_n)$.',
  _,
  'If the assignment $x$ is complete (all variables are assigned),',
  'then we update our statistics based on what we\'re trying to compute:',
  'We can increment the total number of assignments seen so far,',
  'check to see if $x$ is better than the current best assignment that we\'ve seen so far (based on $w$), etc.',
  '(For CSPs where all the weights are 0 or 1, we can stop as soon as we find one consistent assignment, just as in DFS for search problems.)',
  _,
  'Otherwise, we choose an <b>unassigned variable</b> $X_i$.',
  'Given the choice of $X_i$, we choose an <b>ordering of the values</b> of that variable $X_i$.',
  'Next, we iterate through all the values $v \\in \\Domain_i$ in that order.',
  'For each value $v$, we compute $\\delta$, which is the product of the dependent factors $D(x,X_i)$;',
  'recall this is the multiplicative change in weight from assignment $x$ to the new assignment $x \\cup \\{X_i:v\\}$.',
  'If $\\delta = 0$, that means a constraint is violated,',
  'and we can ignore this partial assignment completely,',
  'because multiplying more factors later on cannot make the weight non-zero.',
  _,
  'We then perform <b>lookahead</b>, removing values from the domains $\\Domains$ to produce $\\Domains\'$.',
  'This is not required (we can just use $\\Domains\' = \\Domains$),',
  'but it can make our algorithm run faster. (We\'ll see one type of lookahead in the next slide.)',
  _,
  'Finally, we recurse on the new partial assignment $x \\cup \\{X_i:v\\}$,',
  'the new weight $w \\delta$, and the new domain $\\Domains\'$.',
  _,
  'If we choose an unassigned variable according to an arbitrary fixed ordering,',
  'order the values arbitrarily, and do not perform lookahead,',
  'we get the basic tree search algorithm that we would have used if we were thinking in terms of a search problem.',
  'We will next start to improve the efficiency by exploiting properties of the CSP.',
_);

add(slide('Lookahead: forward checking (example)',
  parentCenter(table(
    [
      backtrackingTree([{domains: {}}]),
      pause(),
      bigRightArrow(100),
      backtrackingTree([{WA: 'red', domains: {WA: 'red', NT: 'green blue', SA: 'green blue'}}]),
      pause(),
      bigRightArrow(100),
    ],
    [
      backtrackingTree([{WA: 'red', NT: 'green', domains: {WA: 'red', NT: 'green', SA: 'blue', Q: 'red blue'}}]),
      pause(),
      bigRightArrow(100),
      backtrackingTree([{WA: 'red', NT: 'green', Q: 'blue', domains: {WA: 'red', NT: 'green', SA: '', Q: 'blue', NSW: 'red green'}}]),
      redbold('Inconsistent - prune!'),
    ],
  _).scale(0.6).margin(10, 10)).center(),
_));

prose(
  'First, we will look at <b>forward checking</b>, which is a way to perform a one-step lookahead.',
  'The idea is that as soon as we assign a variable (e.g., $\\text{WA} = \\vR$),',
  'we can pre-emptively remove inconsistent values from the domains of neighboring variables',
  '(i.e., those that share a factor).',
  _,
  'If we keep on doing this and get to a point where some variable has an empty domain,',
  'then we can stop and backtrack immediately,',
  'since there\'s no possible way to assign a value to that variable which is consistent with the previous partial assignment.',
  _,
  'In this example, after $\\text{Q}$ is assigned blue, we remove inconsistent values (blue) from SA\'s domain,',
  'emptying it.  At this point, we need not even recurse further, since there\'s no way to extend',
  'the current assignment.  We would then instead try assigning Q to red.',
_);

add(slide('Lookahead: forward checking',
  keyIdea('forward checking (one-step lookahead)',
    bulletedText('After assigning a variable $X_i$, eliminate inconsistent values from the domains of $X_i$\'s neighbors.'),
    bulletedText('If any domain becomes empty, don\'t recurse.'),
    bulletedText('When unassign $X_i$, restore neighbors\' domains.'),
  _),
  parentCenter(xtable(
    backtrackingTree([{WA: 'red', NT: 'green', domains: {WA: 'red', NT: 'green', SA: 'blue', Q: 'red blue'}}]),
    bigRightArrow(100),
    backtrackingTree([{WA: 'red', NT: 'green', Q: 'blue', domains: {WA: 'red', NT: 'green', SA: '', Q: 'blue', NSW: 'red green'}}]),
  _).center().margin(50).scale(0.5)),
_));

prose(
  //'In this example, we would remove $\\vR$ from the domains of $\\text{NT}$ and $\\text{SA}$.',
  //_,
  'When unassigning a variable,',
  'remember to restore the domains of its neighboring variables!',
  _,
  'The simplest way to implement this is to make a copy of the domains of the variables before performing forward checking.',
  'This is foolproof, but can be quite slow.',
  _,
  'A fancier solution is to keep a counter (initialized to be zero) $c_{iv}$',
  'for each variable $X_i$ and value $v$ in its domain.',
  'When we remove a value $v$ from the domain of $X_i$, we increment $c_{iv}$.',
  'An element is deemed to be "removed" when $c_{iv} > 0$.',
  'When we want to un-remove a value, we decrement $c_{iv}$.',
  'This way, the remove operation is reversible, which is important',
  'since a value might get removed multiple times due to multiple neighboring variables.',
  _,
  'Later, we will look at arc consistency, which will allow us to lookahead even more.',
  /*_,
  'Alternatively, one can do forward checking lazily,',
  'which means that when actually ask for the domain of a variable,',
  'we compute all the values which are consistent with the assigned variables.',*/
_);

add(slide('Choosing an unassigned variable',
  parentCenter(backtrackingTree([{WA: 'red', NT: 'green', domains: {WA: 'red', NT: 'green', SA: 'blue', Q: 'red blue'}}])).scale(0.6),
  'Which variable to assign next?',
  pause(),
  keyIdea('most constrained variable',
    'Choose variable that has the fewest consistent values.',
  _),
  stmt('This example: $\\text{SA}$ (has only one value)'),
_));

prose(
  'Now let us look at the problem of choosing an unassigned variable.',
  'Intuitively, we want to choose the variable which is most constrained,',
  'that is, the variable whose domain has the fewest number of remaining valid values',
  '(based on forward checking),',
  'because those variables yield smaller branching factors.',
_);

add(slide('Order values of a selected variable',
  'What values to try for $\\text{Q}$?',
  parentCenter(table(
    [backtrackingTree([{WA:'red', Q:'red', domains: {WA: 'red', NT: 'green blue', SA: 'green blue', Q: 'red', NSW: 'green blue'}}]).scale(0.6),
    backtrackingTree([{WA:'red', Q:'blue', domains: {WA: 'red', NT: 'green', SA: 'green', Q: 'blue', NSW: 'red green'}}]).scale(0.6)],
    pause(),
    [text('$2+2+2 = 6$ consistent values').scale(0.8), text('$1 + 1 + 2 = 4$ consistent values').scale(0.8)],
  _).margin(50, 10).center()),
  pause(),
  keyIdea('least constrained value',
    'Order values of selected $X_i$ by decreasing number of consistent values of neighboring variables.',
  _),
_));

prose(
  'Once we\'ve selected an unassigned variable $X_i$,',
  'we need to figure out which order to try the different values in.',
  'Here the principle we will follow is to first try values which are less constrained.',
  _,
  'There are several ways we can think about measuring how constrained a variable is,',
  'but for the sake of concreteness, here is the heuristic we\'ll use:',
  'just count the number of values in the domains of all neighboring variables',
  '(those that share a factor with $X_i$).',
  _,
  'If we color Q red, then we have 2 valid values for NT, 2 for SA, and 2 for NSW.',
  'If we color Q blue, then we have only 1 for NT, 1 for SA, and 2 for NSW.',
  'Therefore, red is preferable (6 total valid values versus 4).',
  _,
  'The intuition is that we want values which impose the fewest number of constraints on the neighbors,',
  'so that we are more likely to find a consistent assignment.',
_);

add(slide('When to fail?',
  headerList('Most constrained variable (MCV)',
    'Must assign <b>every</b> variable',
    'If going to fail, fail early $\\Rightarrow$ more pruning',
  _),
  pause(),
  headerList('Least constrained value (LCV)',
    'Need to choose <b>some</b> value',
    'Choosing value most likely to lead to solution',
  _),
_));

prose(
  'The most constrained variable and the least constrained value heuristics might seem conflicting,',
  'but there is a good reason for this superficial difference.',
  _,
  'An assignment involves <b>every</b> variable whereas for each variable we only need to choose <b>some</b> value.',
  'Therefore, for variables, we want to try to detect failures early on if possible',
  '(because we\'ll have to confront those variables sooner or later),',
  'but for values we want to steer away from possible failures because we might not have to consider those other values.',
_);

add(slide('When do these heuristics help?',
  bulletedText(stmt('Most constrained variable: useful when at least some factors are constraints')),
  pause(),
  bulletedText(stmt('Least constrained value: useful when all factors are constraints')),
  pause(),
  bulletedText('Need lookahead (e.g., forward checking) to actually prune domains!'),
_));

prose(
  'Most constrained variable is useful for finding maximum weight assignments in any factor graph',
  'as long as there are some factors which are constraints,',
  'because we only save work if we can prune away assignments with zero weight,',
  'and this only happens with violated constraints (weight 0).',
  _,
  'On the other hand, least constrained value only makes sense if all the factors are constraints (CSPs).',
  'Ordering the values makes sense if we\'re going to just find the first consistent assignment.',
  'If there are any non-constraint factors, then would need to look at all consistent assignments to see which one',
  'has the maximum weight.',
  'Analogy: think about when depth-first search is guaranteed to find the minimum cost path.',
_);

add(slide('Review: backtracking search',
  backtrackingSearchAlgorithm({pause: false}),
_));

////////////////////////////////////////////////////////////
// Arc consistency
roadmap(2);

add(slide('Arc consistency',
  stmt('Idea: eliminate values from domains $\\Rightarrow$ reduce branching'),
  pause(),
  example('numbers',
    stmt('Before enforcing arc consistency on $X_i$'),
    indent(ytable(
      '$X_i \\in \\Domain_i = \\{ 1, 2, 3, 4, 5 \\}$',
      '$X_j \\in \\Domain_j = \\{ 1, 2, 3, 4, 5 \\}$',
      '$f_1(X) = [X_i + X_j = 4]$',
      '$f_2(X) = [X_j \\le 2]$',
    _)),
    pause(),
    stmt('After enforcing arc consistency on $X_i$'),
    indent('$X_i \\in \\Domain_i = \\{ 2, 3 \\}$'),
  _),
  parentCenter('[whiteboard: bipartite graph]'),
_));

prose(
  'Now let us return to the issue of using lookahead to eliminate values from domains of unassigned variables.',
  'One motivation is that smaller domains lead to smaller branching factors, which makes search faster.',
  _,
  'A second motivation is that since the domain sizes are used in the context of the dynamic ordering heuristics',
  '(most constrained variable and least constrained value),',
  'we can hope to choose better orderings with domains that more accurately reflect what values are actually possible.',
  _,
  'We\'ve already seen forward checking as a simple way of using lookahead to prune the domains of unassigned variables.',
  'Shortly, we will introduce AC-3, which is forward checking without brakes.',
  'To build up to that, we need to introduce the idea of arc consistency.',
  _,
  'The idea behind enforcing arc consistency is to look at all the factors that',
  'involve just two variables $X_i$ and $X_j$',
  'and rule out any values in the domain of $X_i$ which are obviously bad without even looking at another variables.',
  _,
  'To enforce arc consistency on $X_i$ with respect to $X_j$,',
  'we go through each of the values in the domain of $X_i$',
  'and remove it if there is no value in the domain of $X_j$',
  'that is consistent with $X_i$.',
  'For example, $X_i = 4$ is ruled out because no value $X_j \\in \\{1,2,3,4,5\\}$ satisfies $X_i + X_j = 4$.',
_);

add(slide('Arc consistency',
  definition('arc consistency',
    'A variable $X_i$ is <b>arc consistent</b> with respect to $X_j$ if for each $x_i \\in \\Domain_i$, there exists $x_j \\in \\Domain_j$ such that $f(\\{X_i: x_i, X_j : x_j \\}) \\neq 0$ for all factors $f$ whose scope contains $X_i$ and $X_j$.',
  _),
  pause(),
  algorithm('enforce arc consistency',
    '$\\text{EnforceArcConsistency}(X_i, X_j)$: Remove values from $\\Domain_i$ to make $X_i$ arc consistent with respect to $X_j$.',
  _),
_));

add(slide('AC-3 (example)',
  parentCenter(ytable(table(
    [backtrackingTree([{domains: {}}]),
    pause(),
    bigRightArrow(100),
    stagger(
      backtrackingTree([{WA: 'red', domains: {WA: 'red'}}]),
      backtrackingTree([{WA: 'red', domains: {WA: 'red', NT: 'green blue', SA: 'green blue'}}]),
    _),
    ],
    [
    nil(),
    pause(),
    bigRightArrow(100),
    stagger(
      backtrackingTree([{WA: 'red', NT: 'green', domains: {WA: 'red', NT: 'green', SA: 'green blue'}}]),
      backtrackingTree([{WA: 'red', NT: 'green', domains: {WA: 'red', NT: 'green', SA: 'blue', Q: 'red blue'}}]),
      backtrackingTree([{WA: 'red', NT: 'green', domains: {WA: 'red', NT: 'green', SA: 'blue', Q: 'red', NSW: 'red green', V: 'red green'}}]),
      backtrackingTree([{WA: 'red', NT: 'green', domains: {WA: 'red', NT: 'green', SA: 'blue', Q: 'red', NSW: 'green', V: 'red green'}}]),
      backtrackingTree([{WA: 'red', NT: 'green', domains: {WA: 'red', NT: 'green', SA: 'blue', Q: 'red', NSW: 'green', V: 'red'}}]),
    _)],
  _).margin(20).center())).scale(0.6),
_));

add(slide('AC-3',
  stmt('Forward checking: when assign $X_j:x_j$, set $\\Domain_j = \\{x_j\\}$ and enforce arc consistency on all neighbors $X_i$ with respect to $X_j$'),
  pause(),
  stmt('AC-3: repeatedly enforce arc consistency on all variables'),
  pause(),
  algorithm('AC-3',
    'Add $X_j$ to set.', pause(),
    'While set is non-empty:',
    bulletedText('Remove any $X_k$ from set.'), pause(),
    bulletedText('For all neighbors $X_l$ of $X_k$:'), pause(),
    indent(bulletedText('Enforce arc consistency on $X_l$ w.r.t. $X_k$.')), pause(),
    indent(bulletedText('If $\\Domain_l$ changed, add $X_l$ to set.')),
  _).scale(0.9),
_));

prose(
  'In fact, we already saw a limited version of arc consistency.',
  'In forward checking, when we assign a variable $X_i$ to a value,',
  'we are actually enforcing arc consistency on the neighbors of $X_i$ with respect to $X_i$.',
  _,
  'Why stop there?  AC-3 doesn\'t.',
  'In AC-3, we start by enforcing arc consistency on the neighbors of $X_i$ (forward checking).',
  'But then, if the domains of any neighbor $X_j$ changes,',
  'then we enforce arc consistency on the neighbors of $X_j$, etc.',
  _,
  'In the example, after we assign $\\text{WA}:\\vR$, performing AC-3 is the same as forward checking.',
  'But after the assignment $\\text{NT}:\\vG$,',
  'AC-3 goes wild and eliminates all but one value from each of the variables on the mainland.',
  _,
  'Note that unlike BFS graph search, a variable could get added to the set multiple times',
  'because its domain can get updated more than once.',
  'More specifically, we might enforce arc consistency on $(X_i, X_j)$ up to $D$ times in the worst case,',
  'where $D = \\max_{1 \\le i \\le n} |\\Domain_i|$ is the size of the largest domain.',
  'There are at most $m$ different pairs $(X_i, X_j)$ and each call to enforce arc consistency takes $O(D^2)$ time.',
  'Therefore, the running time of this algorithm is $O(E D^3)$ in the very worst case where $E$ is the number of edges',
  '(usually, it\'s much better than this).',
_);

add(slide('Limitations of AC-3',
  bulletedText('Ideally, if no solutions, AC-3 would remove all values from a domain'),
  pause(),
  bulletedText('AC-3 isn\'t always effective:'),
  parentCenter(xtable(
    australia({partial: true, domains: {WA: 'red blue', NT: 'red blue', SA: 'red blue'}}).scale(0.8),
  _).margin(100)),
  parentCenter('No actual solutions, but AC-3 doesn\'t do anything!'),
  pause(),
  bulletedText(stmt('Intuition', 'if we look locally at the graph, nothing blatantly wrong...')),
_));

prose(
  'In the best case, if there is no way to consistently assign values all the variables,',
  'then running AC-3 will detect that there is no solution by emptying out a domain.',
  'However, this is not always the case, as the example above shows.',
  'Locally, everything looks fine, even though there\'s no global solution.',
  _,
  'Advanced: We could generalize arc consistency to fix this problem.',
  'Instead of looking at every $2$ variables and the factors between them,',
  'we could look at every subset of $k$ variables, and check that there\'s a way to consistently assign values to all $k$,',
  'taking into account all the factors involving those $k$ variables.',
  'However, there is a substantial cost to doing this (the running time is exponential in $k$ in the worst case),',
  'so generally arc consistency ($k=2$) is good enough.',
_);

add(summarySlide('Summary',
  bulletedText(stmt('Basic template: backtracking search on partial assignments')), pause(),
  bulletedText(stmt('Dynamic ordering: most constrained variable (fail early), least constrained value (try to succeed)')), pause(),
  bulletedText(stmt('Lookahead: forward checking (enforces arc consistency on neighbors), AC-3 (enforces arc consistency on neighbors and their neighbors, etc.)')), pause(),
_));

////////////////////////////////////////////////////////////
// Modeling
roadmap(3);

add(slide('Example: LSAT question',
  'Three sculptures (A, B, C) are to be exhibited in rooms 1, 2 of an art gallery.',
  pause(),
  'The exhibition must satisfy the following conditions:',
  bulletedText('Sculptures A and B cannot be in the same room.'),
  bulletedText('Sculptures B and C must be in the same room.'),
  bulletedText('Room 2 can only hold one sculpture.'),
  pause(),
  parentCenter(text('[demo]').linkToUrl('index.html#include=inference-demo.js&example=new')),
  /*
variable('A', [1, 2])
variable('B', [1, 2])
variable('C', [1, 2])

factor('ab', 'A B', function(a, b) { return a != b; })
factor('bc', 'B C', function(b, c) { return b == c; })
factor('abc', 'A B C', function(a, b, c) {
  var n = 0;
  if (a == 2) n++;
  if (b == 2) n++;
  if (c == 2) n++;
  return n <= 1;
})
maxVariableElimination()
*/
_).leftHeader(image('images/rodin.jpg').width(120)));

eventSchedulingGraph = function(options) {
  function myPause(n) { return options.pause ? pause(n) : _; }
  return overlay(
    let(dot = function() { return circle(5).fillColor('black'); }),
    table(
      [a1 = dot(), b1 = dot()],
      [a2 = dot(), b2 = dot()],
      [a3 = dot(), b3 = dot()],
      [nil(), b4 = dot()],
    _).margin(150, 30),
    moveTopOf('event $e$', a1),
    moveTopOf('time slot $t$', b1),
    moveLeftOf('1', a1),
    moveLeftOf('2', a2),
    moveLeftOf('3', a3),
    moveRightOf('1', b1),
    moveRightOf('2', b2),
    moveRightOf('3', b3),
    moveRightOf('4', b4),
    myPause(3),
    line(a1, b1),
    line(a2, b1),
    line(a3, b4),
    line(a3, b3),
    line(a1, b2),
    line(a3, b2),
    myPause(),
    line(a1, b2).strokeWidth(2).color('red'),
    line(a2, b1).strokeWidth(2).color('red'),
    line(a3, b3).strokeWidth(2).color('red'),
  _);
}

add(slide('Example: event scheduling (section)',
  parentCenter(xtable(
    image('images/calendar.jpg').width(100),
    eventSchedulingGraph({}).scale(0.8),
  _).margin(50)),
  showLevel(a1.showLevel()),
  headerList('Setup',
    'Have $E$ events and $T$ time slots', pause(),
    'Each event $e$ must be put in <b>exactly one</b> time slot', pause(),
    'Each time slot $t$ can have <b>at most one</b> event', pause(),
    'Event $e$ allowed in time slot $t$ only if $(e,t) \\in A$',
  _),
_));

prose(
  'Consider a simple scheduling problem, where we have $E$ events that we want to schedule into $T$ time slots.',
  'There are three families of requirements:',
  '(i) every event must be scheduled into a time slot;',
  '(ii) every time slot can have at most one event (zero is possible);',
  'and (iii) we are given a fixed set $A$ of (event, time slot) pairs which are allowed.',
  _,
  'There are in general multiple ways to cast a problem as a CSP, and the purpose of this example is to show',
  'two reasonable ways to do it.',
_);

add(slide('Example: event scheduling (section)',
  parentCenter(xtable(
    image('images/calendar.jpg').width(100),
    eventSchedulingGraph({}).scale(0.8),
  _).margin(50)),
  headerList('CSP formulation 1', pause(),
    'Variables: for each event $e$, $X_e \\in \\{1,\\dots,T\\}$', pause(),
    'Constraints (only one event per time slot): for each pair of events $e \\neq e\'$, enforce $[X_e \\neq X_{e\'}]$', pause(),
    'Constraints (only scheduled allowed times): for each event $e$, enforce $[(e,X_e) \\in A]$',
  _),
_));

prose(
  'The first formulation is perhaps the more natural one.',
  'We make a variable $X_e$ for each event, whose value will be the time slot that the event is scheduled into.',
  'Since each variable can only take on one value, we automatically satisfy the requirement that every event must be put in exactly one time slot.',
  _,
  'However, we need to make sure no two events end up in the same time slot.',
  'To do this, we can create a binary constraint between every pair of distinct event variables $X_e$ and $X_e\'$ that',
  'enforces their values to be different ($X_e \\neq X_{e\'}$).',
  _,
  'Finally, to deal with the requirement that an event is scheduled only in allowed time slots,',
  'we just need to add a unary constraint for each variable saying that the time slot $X_e$ that\'s chosen for that event is allowed.',
  _,
  'Note that we end up with $E$ variables with domain size $T$, and $O(E^2)$ binary constraints.',
_);

add(slide('Example: event scheduling (section)',
  parentCenter(xtable(
    image('images/calendar.jpg').width(100),
    eventSchedulingGraph({}).scale(0.8),
  _).margin(50)),
  headerList('CSP formulation 2', pause(),
    'Variables: for each time slot $t$, $Y_t \\in \\{1,\\dots,E\\} \\cup \\{\\emptyset\\}$', pause(),
    'Constraints (each event is scheduled exactly once): for each event $e$, enforce $[Y_t = e \\text{ for exactly one } t]$', pause(),
    'Constraints (only schedule allowed times): for each time slot $t$, enforce $[Y_t = \\emptyset \\text{ or } (Y_t,t) \\in A]$',
  _),
_));

prose(
  'Alternatively, we can take the perspective of the time slots and ask which event was scheduled in each time slot.',
  'So we introduce a variable $Y_t$ for each time slot $t$ which takes on a value equal to one of the events or none ($\\emptyset$).',
  _,
  'Unlike the first formulation, we don\'t get for free the requirement that each event is put in exactly one time slot.',
  'To add it, we introduce $E$ constraints, one for each event.',
  'Each constraint needs to depend on all $T$ variables and check that the number of time slots $t$ which have event $e$ assigned to that slot ($Y_t = e$) is exactly 1.',
  _,
  'On the other hand, the requirement that each time slot has at most one event assigned to it we get for free,',
  'since each variable takes on exactly one value.',
  _,
  'Finally, we add $T$ constraints, one for each time slot $t$ enforcing that if there was an event scheduled there',
  '($Y_t \\neq \\emptyset$), then it better be allowed according to $A$.',
  _,
  'With this formulation, we have $T$ variables with domain size $E+1$, and $E$ $T$-ary constraints.',
  'We will show shortly that each $T$-ary constraints can be converted into $O(T)$ binary constraints with $O(T)$ variables.',
  'Therefore, the resulting formulation has $T$ variables with domain size $E+1$, $O(T^2)$ variables with domain size $2$ and $O(T^2)$ binary constraints.',
  _,
  'Which one is better?  Since $T \\gg E$ is required for the existence of a consistent solution, the first formulation is better.',
  'If the problem were modified so that not all events had to be scheduled and $T \\ll E$, then the second formulation would be better.',
_);

add(slide('Arity',
  stmt('Modeling: allow arity of factors to be arbitrary'),
  parentCenter(naryConstraint(6)),
  pause(),
  stmt('Algorithms: assume arity of all factors is $1$ or $2$'),
  parentCenter(naryConstraint(2)),
  pause(),
  stmt('Later: reduction from $n$ to $2$ with auxiliary variables'),
_));

prose(
  'When we are modeling with factor graphs,',
  'we would like the factors to have any arity (depend on any number of variables).',
  'This allows us to, for example, require that at least one of the provinces is colored red.',
  _,
  'However, from an algorithms and implementation perspective,',
  'it is often useful to just think about unary and binary factors.',
  'For example, arc consistency is defined with respect to binary factors.',
  _,
  'It appears that there is a tradeoff between modeling expressivity and algorithmic efficiency,',
  'but this is actual not a real tradeoff,',
  'since we can reduce the general arity case to the unary-binary case.',
_);

add(slide('N-ary constraints',
  parentCenter(naryConstraint(4)),
  stmt('Variables: $X_1, X_2, X_3, X_4 \\in \\{ 0, 1 \\}$'),
  stmt('Factor: $[X_1 \\vee X_2 \\vee X_3 \\vee X_4]$'),
  pause(),
  stmt('Examples'),
  indent(ytable(
    '$\\Weight(\\{X_1: \\red{0}, X_2: \\red{0}, X_3: \\red{0}, X_4: \\red{0}\\}) = 0$',
    '$\\Weight(\\{X_1: \\red{0}, X_2: \\green{1}, X_3: \\red{0}, X_4: \\red{0}\\}) = 1$',
    '$\\Weight(\\{X_1: \\red{0}, X_2: \\green{1}, X_3: \\red{0}, X_4: \\green{1}\\}) = 1$',
  _)),
  pause(),
  stmt('Problem: algorithms so far only take unary/binary factors...'),
_));

prose(
  'Consider the simple problem: given $n$ variables $X_1, \\dots, X_n$, where each $X_i \\in \\{0,1\\}$,',
  'impose the requirement that at least one $X_i = 1$.',
  'The case of $n=4$ is shown in the slide.',
_);

add(slide('N-ary constraints: first attempt',
  parentCenter(naryConstraint(4)).scale(0.7),
  keyIdea('auxiliary variable',
    'Auxiliary variables hold intermediate computation.',
  _).scale(0.9),
  pause(),
  stmt('Factors'),
  parentCenter(xtable(
    ytable(
      'Initialization: $[\\red{A_0} = 0]$',
      'Processing: $[\\red{A_i} = \\red{A_{i-1}} \\vee \\red{X_i}]$',
      'Final output: $[\\red{A_4} = 1]$',
    _),
    table(
      ['$i$', 0, 1, 2, 3, 4],
      ['$X_i$:', nil(), 0, 1, 0, 1],
      ['$A_i$:', 0, 0, 1, 1, 1],
    _).margin(20, 0),
  _).margin(60)),
  pause(),
  'Still have factors involving 3 variables...',
_));

prose(
  'The key idea is to break down the computation of the $n$-ary constraint into $n$ simple steps.',
  'As a first attempt, let\'s introduce an auxiliary variable $A_i$ for $i = 1, \\dots, n$',
  'which represents the OR of variables $X_1, \\dots, X_i$.',
  'Then we can write a simple recurrence that updates $A_i$ with $A_{i-1}$.',
  'The constraint $[A_n = 1]$ enforces that the OR of all the variables is 1.',
  _,
  'It is important to note that while our intuitions are based on procedurally computing $A_i$\'s, one after the other,',
  'these computations are actually represented declaratively as constraints in the CSP.',
  _,
  'We have eliminated the massive $n$-ary constraint with ternary constraints (depending on $A_i,A_{i-1},X_i$).',
  'Can we replace the ternary constraint with unary and binary constraints?',
_);

add(slide('N-ary constraints: second attempt',
  stmt('Key idea: pack $A_{i-1}$ and $A_i$ into one variable $B_i$'),
  parentCenter(overlay(
    table(
      [a1 = factorNode('$B_1$'),
       a2 = factorNode('$B_2$'),
       a3 = factorNode('$B_3$'),
       a4 = factorNode('$B_4$')],
      [x1 = factorNode('$X_1$'),
       x2 = factorNode('$X_2$'),
       x3 = factorNode('$X_3$'),
       x4 = factorNode('$X_4$')],
    _).margin(40),
    e12 = edgeFactor(a1, a2),
    e23 = edgeFactor(a2, a3),
    e34 = edgeFactor(a3, a4),
    f1 = edgeFactor(a1, x1),
    f2 = edgeFactor(a2, x2),
    f3 = edgeFactor(a3, x3),
    f4 = edgeFactor(a4, x4),
    moveBottomOf('$\\red{0}$', x1).scale(0.7),
    moveBottomOf('$\\red{1}$', x2).scale(0.7),
    moveBottomOf('$\\red{0}$', x3).scale(0.7),
    moveBottomOf('$\\red{1}$', x4).scale(0.7),
    moveTopOf('$\\red{(0,0)}$', a1).scale(0.7),
    moveTopOf('$\\red{(0,1)}$', a2).scale(0.7),
    moveTopOf('$\\red{(1,1)}$', a3).scale(0.7),
    moveTopOf('$\\red{(1,1)}$', a4).scale(0.7),
    moveRightOf(out = square(20), a4, 30),
    line(a4, out).strokeWidth(2),
  _).scale(0.8)),
  stmt('Variables: $B_i$ is (pre, post) pair from processing $X_i$'),
  pause(),
  ytable(
    stmt('Factors'),
    indent(ytable(
      'Initialization: $[B_1[1] = 0]$',
      'Processing: $[B_i[2] = B_i[1] \\vee X_i]$',
      'Final output: $[B_4[2] = 1]$', pause(),
      'Consistency: $[B_{i-1}[2] = B_{i}[1]]$',
    _).margin(50, 0)),
  _),
_));

prose(
  'The key idea to turn the ternary constraint $[A_i = A_{i-1} \\vee X_i]$ into a binary constraint is to merge',
  '$A_{i-1}$ and $A_i$ into one variable, represented as one variable $B_i$.',
  'The variable $B_i$ will represent a pair of booleans, where $B_i[1]$ represents $A_{i-1}$ and $B_i[2]$ represents $A_i$.',
  _,
  'Now, the ternary constraint is just a binary constraint: $[B_i[2] = B_i[1] \\vee X_i]$!',
  _,
  'However, note that $A_{i-1}$ is represented twice, both in $B_i$ and $B_{i-1}$.',
  'So we need to add another binary constraint to enforce that the two are equal: $[B_{i-1}[2] = B_i[1]]$.',
  _,
  'The initialization and final output factors are the same as before.',
_);

function gridText(numRows, numCols) {
  function textDocumentImage() {
    return image('images/simple-document.jpg').width(15);
  }
  var contents = wholeNumbers(numRows).map(function() {
    return wholeNumbers(numCols).map(function() {
      return Math.random() < 1 ? textDocumentImage() : nil();
    });
  });
  return table.apply(null, contents).margin(10);
}

add(slide('Example: relation extraction',
  stmt('Motivation: build a question-answering system'),
  parentCenter(greenitalics('Which US presidents played the guitar?')),
  pause(),
  stmt('Prerequisite: learn knowledge by reading the web'),
  parentCenter(xtable(
    gridText(5, 10),
    bigRightArrow(),
    image('images/database.png').width(100),
  _).center().xmargin(30)),
  pause(),
  stmt('Systems'),
  parentCenter(xtable(
    text('[NELL (CMU)]').linkToUrl('http://rtw.ml.cmu.edu/rtw/'),
    text('[OpenIE (UW)]').linkToUrl('http://openie.cs.washington.edu/'),
  _).margin(100)),
_));

prose(
  'Now let\'s look at a different problem.',
  'Some background which is unrelated to CSPs:',
  'A major area of research in natural language processing is <b>relation extraction</b>,',
  'the task of building systems that can process the enormous amount of unstructured text on the web,',
  'and populate a structured knowledge base, so that we can answer complex questions by querying the knowledge base.',
_);

add(slide('Example: relation extraction',
  stmt('Input (hundreds of millions of web pages)'),
  parentCenter(greenitalics('Barack Obama is the 44th and current President of the United States...')),
  pause(),
  stmt('Output (database of relations)'),
  parentCenter(ytable(
    red(tt('EmployedBy(BarackObama, UnitedStates)')),
    red(tt('Profession(BarackObama, President)')),
    red(tt('...')),
  _)),
_));

add(slide('Example: relation extraction',
  stmt('Typical predictions of classifiers'),
  parentCenter(table(
    [red(tt('BornIn(BarackObama,UnitedStates)')), 0.9], pause(),
    [text(red(tt('BornIn(BarackObama,Kenya)'))).linkToUrl('http://www.huffingtonpost.com/michael-russnow/obama-birthers_b_1830644.html'), 0.6], pause(),
    [text(red(tt('BornIn(JohnLennon,guitar)'))).linkToUrl('http://rockhall.com/inductees/john-lennon/bio/'), 0.7], pause(),
    [red(tt('Type(guitar,instrument)')), 0.9],
    ['...', nil()],
  _).margin(10)),
  pause(),
  'How do reconcile conflicting predictions?',
_));

prose(
  'State-of-the-art methods typically use machine learning, casting it as a classification problem.',
  'However, relation extraction is a very difficult problem, and even the best systems today often fail, producing nonsensical facts.',
  _,
  'A key observation is that these classification decisions are not independent,',
  'and we have some prior knowledge on how they should be related.',
  'For example, you can\'t be born in two places,',
  'and you also can\'t be born in an instrument (not usually, anyway).',
_);

function fact(x) {
  //return 
  return frame(red(tt(x))).bg.strokeWidth(1).round(20).end.padding(10, 5);
}

function local(x) {
  return overlay(
    y = moveLeftOf(squareFactor(), x, 30),
    line(x, y).strokeWidth(2),
  _);
}

add(slide('Example: relation extraction',
  parentCenter(overlay(
    ytable(
      a = fact('BornIn(BarackObama,UnitedStates)'),
      b = fact('BornIn(BarackObama,Kenya)'),
    _).margin(80).center(),
    local(a),
    local(b),
    pause(),
    e = edgeFactor(a, b),
    moveRightOf('can\'t be born in two places', e),
  _)),
  pause(),
  parentCenter(overlay(
    ytable(
      a = fact('BornIn(JohnLennon,guitar)'),
      b = fact('Type(guitar,instrument)'),
    _).margin(80).center(),
    local(a),
    local(b),
    pause(),
    e = edgeFactor(a, b),
    moveRightOf('can\'t be born in an instrument', e),
  _)),
_));

add(slide('General framework',
  stmt('Classification decisions are generally related'),
  parentCenter(overlay(
    xtable(
      v1 = factorNode('$Y_1$'),
      v2 = factorNode('$Y_2$'),
      v3 = factorNode('$Y_3$'),
      v4 = factorNode('$Y_4$'),
    _).margin(50), 
  _)),
  pause(),
  bulletedText(stmt('Unary factors: local classifiers (provide evidence)')),
  parentCenter('$\\exp(\\w \\cdot \\phi(x_i) Y_i)$'),
  pause(),
  bulletedText(stmt('Binary factors: enforce that outputs are consistent')),
  parentCenter('$[Y_i \\text{ consistent with } Y_{i\'}]$'),
_));

prose(
  'To operationalize this intuition, we can leverage factor graphs.',
  'Think about each of the classification decisions as a variable, which can take on $1$ or $0$ (assume binary classification for now).',
  _,
  'We have a unary factor which specifies the contribution of the classifier.',
  'Recall that linear classifiers return a score $\\w \\cdot \\phi(x_i)$, which is a real number.',
  'Factors must be non-negative, so it\'s typical to exponentiate the score.',
  _,
  'We can add binary factors between pairs of classification decisions which are related in some way (e.g., $[\\text{BornIn(BarackObama,UnitedStates)} + \\text{BornIn(BarackObama,Kenya)} \\le 1]).$',
  'The factors do not have to be hard constraints,',
  'but rather general preferences that encode soft preferences (e.g., returning weight $0.01$ instead of $0$).',
  _,
  'Once we have a CSP, we can ask for the maximum weight assignment, which takes into account all the information available and reasons about it globally.',
  //_,
  //'This is one example of what can be done with the factor graph framework.',
  //'In general, one could argue that classification decisions are rarely independent,',
  //'and therefore shouldn\'t be made in isolation.',
  //'Of course, making joint predictions is only better if one can characterize the binary factors that relate the individual classification decisions.',
  //'It turns out that we can learn those factors too.',
_);

add(summarySlide('Summary',
  bulletedText(stmt('Factor graphs: modeling framework (variables, factors)')), pause(),
  bulletedText(stmt('Key property: ordering decisions pushed to algorithms')), pause(),
  bulletedText(stmt('Algorithms: backtracking search + dynamic ordering + lookahead')), pause(),
  bulletedText(stmt('Modeling: lots of possibilities!')),
  //bulletedText(stmt('Next time: structural properties of factor graphs')),
_));

sfig.initialize();
