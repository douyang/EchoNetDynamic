G = sfig.serverSide ? global : this;
G.prez = presentation();

add(titleSlide('Lecture 13: Bayesian networks I',
  nil(),
  parentCenter(twoLayerBayesNet({n1:10, n2: 20}).scale(0.3)),
_));

add(slide('Review: definition',
  parentCenter(exampleFactorGraph()),
  definition('factor graph',
    stmt('Variables'),
    indent('$X = (X_1, \\dots, X_n)$, where $X_i \\in \\Domain_i$'),
    stmt('Factors'),
    indent('$f_1, \\dots, f_m$, with each $f_j(X) \\ge 0$'),
  _),
  parentCenter('$\\displaystyle \\Weight(x) = \\prod_{j=1}^m f_j(x)$'),
_));

prose(
  'Last week, we talked about factor graphs, which uses local factors',
  'to specify a weight $\\Weight(x)$ for each assignment $x$ in a compact way.',
  'The stated objective was to find the maximum weight assignment.',
  _,
  'Given any factor graph, we saw a number of algorithms',
  '(backtracking search, beam search, Gibbs sampling, variable elimination) for',
  '(approximately) optimizing this objective.',
_);

add(slide('Review: person tracking',
  problem('person tracking',
    'Sensors report positions: $0, 2, 2$. '+
    'Objects don\'t move very fast and sensors are a bit noisy. '+
    'What path did the person take?',
  _),
  pause(),
  //stmt('Factor graph (chain-structured)'),
  parentCenter(chainFactorGraph({n:3})).scale(0.6),
  headerList(null,
    'Variables $X_i$: location of object at position $i$',
    'Transition factors $t_i(x_i, x_{i+1})$: incorporate physics',
    'Observation factors $o_i(x_i)$: incorporate sensors',
  _),
  parentCenter(text('[demo: <tt>maxVariableElimination()</tt>]').linkToUrl('index.html#include=inference-demo.js&example=track&postCode=maxVariableElimination()')),
  pause(),
  parentCenter(red('What do the factors <b>mean</b>?')),
_));

prose(
  'As an example, recall the object tracking example.',
  'We defined observation factors to capture the fact that the true object position',
  'is close to the sensor reading, and the transition factors to capture the fact that the',
  'true object positions across time are close to each other.',
  _,
  'We just set them rather arbitrarily. Is there a more principled way to think about these factors beyond being non-negative functions?',
_);

evolutionOfModels(11, 'Bayesian networks');

prose(
  'Much of this class has been on developing modeling frameworks.',
  'We started with state-based models, where we cast real-world problems as finding paths or policies through a state graph.',
  _,
  'Then, we saw that for a large class of problems (such as scheduling), it was much more convenient',
  'to use the language of factor graphs.',
  _,
  'While factor graphs could be reduced to state-based models by fixing the variable ordering,',
  'we saw that they also led to notions of treewidth and variable elimination,',
  'which allowed us to understand our models much better.',
  _,
  'In this lecture, we will introduce another modeling framework, Bayesian networks,',
  'which are factor graphs imbued with the language of probability.',
  'This will give probabilistic life to the factors of factor graphs.',
_);

function roadmap(i) {
  add(outlineSlide('Roadmap', i, [
    ['basics', 'Basics'],
    ['probabilisticProgram', 'Probabilistic programs'],
    ['inference', 'Inference'],
  ]));
}

////////////////////////////////////////////////////////////
// Bayesian networks
roadmap(0);

prose(
  'Bayesian networks were popularized in AI by Judea Pearl in the 1980s,',
  'who showed that having a coherent probabilistic framework is important for',
  '<b>reasoning under uncertainty</b>.',
  _,
  'There is a lot to say about the Bayesian networks',
  '(CS228 is an entire course about them and their cousins, Markov networks).',
  'So we will devote most of this lecture focusing on modeling.',
  //'Any algorithms you see are a figment of your imagination (the next lecture will be for that).',
_);

add(slide('Review: probability (example)',
  stmt('<b>Random variables</b>: sunshine $S \\in \\{0,1\\}$, rain $R \\in \\{0,1\\}$'),
  pause(),
  parentCenter(ytable(
    stmt('<b>Joint distribution</b>'),
    indent(xtable('$\\P(S, R) =$', frameBox(table(
      ['$s$', '$r$', '$\\P(S = s, R = r)$'],
      [0, 0, '0.20'],
      [0, 1, '0.08'],
      [1, 0, '0.70'],
      [1, 1, '0.02'],
    _).margin(10, 0).center())).center().margin(5)).scale(0.6),
  _).center()),
  pause(),
  //stmt('<b>Probability</b>: $\\P(S = 1, R = 0) = 0.7$'),
  parentCenter(xtable(
    ytable(
      stmt('<b>Marginal distribution</b>'),
      indent(xtable('$\\P(S) =$', frameBox(table(
        ['$s$', '$\\P(S = s)$'],
        [0, 0.28],
        [1, 0.72],
      _).margin(10, 0).center())).center().margin(5)).scale(0.6),
      '(aggregate rows)',
    _).center(),
    pause(),
    ytable(
      stmt('<b>Conditional distribution</b>'),
      indent(xtable('$\\P(S \\mid R = 1) =$', frameBox(table(
        ['$s$', '$\\P(S = s \\mid R = 1)$'],
        [0, 0.8],
        [1, 0.2],
      _).margin(10, 0).center())).center().margin(5)).scale(0.6),
      '(select rows, normalize)',
    _).center(),
  _).margin(50)),
_).leftHeader(image('images/sun-rain.jpg').width(150)));

prose(
  'Before introducing Bayesian networks, let\'s review probability (at least the relevant parts).',
  'We start with an example about the weather.',
  'Suppose we have two boolean random variables, $S$ and $R$ representing sunshine and rain.',
  'Think of an assignment to $(S, R)$ as representing a possible state of the world.',
  _,
  'The <b>joint distribution</b> specifies a probability for each assignment to $(S,R)$ (state of the the world).',
  'We use lowercase letters (e.g., $s$ and $r$) to denote values and uppercase letters (e.g., $S$ and $R$)',
  'to denote random variables.',
  'Note that $\\P(S = s, R = r)$ is a probability (a number) while $\\P(S, R)$ is a distribution (a table of probabilities).',
  'We don\'t know what state of the world we\'re in, but we know what the probabilities are (there are no unknown unknowns).',
  'The joint distribution contains all the information and acts as the central source of truth.',
  _,
  'From it, we can derive a <b>marginal distribution</b> over a subset of the variables.',
  'We get this by aggregating the rows that share the same value of $S$.',
  'The interpretation is that we are interested in $S$.',
  'We don\'t explicitly care about $R$, but we want to take into account $R$\'s effect on $S$.',
  'We say that $R$ is <b>marginalized out</b>.',
  'This is a special form of elimination.',
  'In the last lecture, we leveraged max-elimination, where we took the max over the eliminated variables; here, we are taking a sum.',
  _,
  'The <b>conditional distribution</b> selects rows of the table matching the condition (right of the bar),',
  'and then normalizes the probabilities so that they sum to 1.',
  'The interpretation is that we observe the condition ($R = 1$) and are interested in $S$.',
  'This is the conditioning that we saw for factor graphs, but where we normalize the selected rows to get probabilities.',
_);

add(slide('Review: probability (general)',
  stmt('<b>Random variables</b>'),
  indent('$X = (X_1, \\dots, X_n)$ partitioned into $(A, B)$'),
  pause(),
  stmt('<b>Joint distribution</b>'),
  indent('$\\P(X) = \\P(X_1, \\dots, X_n)$'),
  pause(),
  stmt('<b>Marginal distribution</b>'),
  indent(stagger(
    '$\\P(A = a) = \\sum_{b} \\P(A = a, B = b)$',
    '$\\P(A) = \\sum_{b} \\P(A, B = b)$',
  _)),
  pause(),
  stmt('<b>Conditional distribution</b>'),
  indent(stagger(
    '$\\P(A = a \\mid B = b) = \\frac{\\P(A = a, B = b)}{\\P(B = b)}$',
    '$\\P(A \\mid B = b) = \\frac{\\P(A, B = b)}{\\P(B = b)}$',
    '$\\P(A \\mid B = b) = \\frac{\\P(A, B = b)}{\\underbrace{\\P(B = b)}_\\text{normalization}}$',
    '$\\P(A \\mid B = b) \\propto \\P(A, B = b)$',
  _)),
_));

prose(
  'In general, we have $n$ random variables $X_1, \\dots, X_n$ and let $X$ denote all of them.',
  'Suppose $X$ is partitioned into $A$ and $B$ (e.g., $A = (X_1, X_3)$ and $B = (X_2, X_4, X_5)$ if $n = 5$).',
  _,
  'The marginal and conditional distributions can be defined over the subsets $A$ and $B$ rather than just single variables.',
  _,
  'Of course, we can also have a hybrid too:',
  'for $n = 3$, $\\P(X_1 \\mid X_3 = 1)$ marginalizes out $X_2$ and conditions on $X_3 = 1$.',
  _,
  'It is important to remember the types of objects here:',
  '$\\P(A)$ is a table where rows are possible assignments to $A$,',
  'whereas $\\P(A = a)$ is a number representing the probability of the row corresponding to assignment $a$.',
_);

add(slide('Probabilistic inference task',
  stmt('Random variables: unknown quantities in the world'),
  //parentCenter('$X = (X_1, X_2, X_3, X_4, X_5, X_6)$'),
  parentCenter('$X = (S, R, T, A)$'),
  pause(),
  headerList('In words',
    //'Observe evidence: $X_4 = 3, X_5 = \\text{red}$',
    //'Interested in query: $X_1, X_2$',
    'Observe evidence (traffic in autumn): $T = 1, A = 1$',
    'Interested in query (rain?): $R$',
  _),
  pause(),
  stmt('In symbols'),
  //parentCenter('$\\P(\\underbrace{X_1, X_2}_\\text{query} \\mid \\underbrace{X_4 = 3, X_5 = \\text{red}}_\\text{condition})$'),
  parentCenter(frameBox(ytable(
    nowrapText('$\\P(\\red{\\underbrace{R}_\\text{query}} \\mid \\green{\\underbrace{T = 1, A = 1}_\\text{condition}})$'),
    nowrapText(blue('($\\blue{S}$ is <b>marginalized out</b>)')),
  _)).padding(15)),
_));

prose(
  'At this point, you should have all the definitions to compute any marginal or conditional distribution given access to a joint probability distribution.',
  'But what is this really doing and how is this useful?',
  _,
  'We should think about each assignment $x$ as a possible state of the world',
  '(it\'s raining, it\'s not sunny, there is traffic, it is autumn, etc.).',
  'Think of the joint distribution as one giant database that contains full information about how the world works.',
  _,
  'In practice, we\'d like to ask questions by querying this probabilistic database.',
  'First, we observe some evidence, which effectively fixes some of the variables.',
  'Second, we are interested in the distribution of some set of variables which we didn\'t observe.',
  'This forms a query, and the process of answering this query (computing the desired distribution) is called <b>probabilistic inference</b>.',
_);

add(slide('Challenges',
  stmt('Modeling: How to specify a joint distribution $\\P(X_1, \\dots, X_n)$ <b>compactly</b>?'),
  indent('Bayesian networks (factor graphs for probability distributions)'),
  pause(),
  stmt('Algorithms: How to compute queries $\\P(R \\mid T = 1, A = 1)$ <b>efficiently</b>?'),
  indent('Variable elimination, Gibbs sampling, particle filtering (analogue of algorithms for finding maximum weight assignment)'),
_));

prose(
  'In general, a joint distribution over $n$ variables has size exponential in $n$.',
  'From a modeling perspective, how do we even specify an object that large?',
  'Here, we will see that Bayesian networks, based on factor graphs, offer an elegant solution.',
  _,
  'From an algorithms perspective, there is still the question of how we perform probabilistic inference efficiently.',
  'In the next lecture, we will see how we can adapt all of the algorithms that we saw before for computing maximum weight assignments in factor graphs,',
  'essentially by replacing a max with a sum.',
  _,
  'The two desiderata are rather synergistic,',
  'and it is the same property &mdash; conditional independence &mdash; that makes both possible.',
_);

add(quizSlide('bayes1-alarm',
  'Earthquakes and burglaries are independent events that will cause an alarm to go off.  Suppose you hear an alarm.  How does hearing on the radio that there\'s an earthquake change your beliefs?',
  'it increases the probability of burglary',
  'it decreases the probability of burglary',
  'it does not change the probability of burglary',
_));

prose(
  'Let us try to build up to our first Bayesian network by trying to perform reasoning about a scenario.',
  _,
  'Situations like these arise all the time in practice:',
  'we have a lot of unknowns which are all dependent on one another.',
  'If we obtain evidence on some of these unknowns,',
  'how does that affect our belief about the other unknowns?',
_);

add(slide('Bayesian network (alarm)',
  parentCenter('$P(B = b, E = e, A = a) \\eqdef \\blue{p(b)} \\green{p(e)} \\red{p(a \\mid b, e)}$'),
  xtable(
    simpleAlarmNetwork({}),
    pause(),
    frameBox(table(
      ['$b$', '$p(b)$'],
      ['$1$', '$\\epsilon$'],
      ['$0$', '$1-\\epsilon$'],
    _).ycenter().margin(15, 5)).bg.strokeColor('blue').end,
    pause(),
    frameBox(table(
      ['$e$', '$p(e)$'],
      ['$1$', '$\\epsilon$'],
      ['$0$', '$1-\\epsilon$'],
    _).ycenter().margin(15, 5)).bg.strokeColor('green').end,
    pause(),
    frameBox(table(
      ['$b$', '$e$', '$a$', '$p(a \\mid b, e)$'],
      ['$0$', '$0$', '$0$', '$1$'],
      ['$0$', '$0$', '$1$', '$0$'],
      ['$0$', '$1$', '$0$', '$0$'],
      ['$0$', '$1$', '$1$', '$1$'],
      ['$1$', '$0$', '$0$', '$0$'],
      ['$1$', '$0$', '$1$', '$1$'],
      ['$1$', '$1$', '$0$', '$0$'],
      ['$1$', '$1$', '$1$', '$1$'],
    _).ycenter().margin(15, 5)).bg.strokeColor('red').end,
  _).margin(50).scale(0.7),
  pause(-3),
  parentCenter(ytable(
    pause(),
    '$\\blue{p(b) = \\epsilon \\cdot [b = 1] + (1-\\epsilon) \\cdot [b = 0]}$',
    pause(),
    '$\\green{p(e) = \\epsilon \\cdot [e = 1] + (1-\\epsilon) \\cdot [e = 0]}$',
    pause(),
    '$\\red{p(a \\mid b, e) = [a = (b \\vee e)]}$',
  _)),
_).leftHeader(image('images/alarm.jpg').width(150)));

prose(
  'Let us try to model the situation.',
  'First, we establish that there are three variables, $B$ (burglary), $E$ (earthquake), and $A$ (alarm).',
  'Next, we connect up the variables to model the dependencies.',
  _,
  'Unlike in factor graphs, these dependencies are represented as <b>directed</b> edges.',
  'You can intuitively think about the directionality as suggesting causality,',
  'though what this actually means is a deeper question and beyond the scope of this class.',
  _,
  'For each variable, we specify a <b>local conditional distribution</b> (a factor) of that variable given its parent variables.',
  'In this example, $B$ and $E$ have no parents while $A$ has two parents, $B$ and $E$.',
  'This local conditional distribution is what governs how a variable is generated.',
  _,
  'We are writing the local conditional distributions using $p$,',
  'while $\\P$ is reserved for the joint distribution over all random variables,',
  'which is defined as the product.',
_);

add(slide('Bayesian network (alarm)',
  parentCenter(xtable(
    simpleAlarmNetwork({}),
    pause(),
    simpleAlarmNetwork({factorGraph: true, showPotentials: true}),
  _).justify('r').margin(100)),
  pause(-1),
  parentCenter('$\\P(B = b, E = e, A = a) = p(b) p(e) p(a \\mid b, e)$'),
  pause(),
  //stmt('Relationship to factor graphs'),
  //bulletedText('Local conditional distributions are just factors that happen to sum to 1 over first argument'),
  parentCenter('Bayesian networks are a special case of factor graphs!'),
_));

prose(
  'Note that the local conditional distributions (e.g., $p(a \\mid b, e)$) are non-negative so they can',
  'be thought of simply as factors of a factor graph.',
  'The joint probability of an assignment is then the weight of that assignment.',
  _,
  'In this light, Bayesian networks are just a type of factor graphs, but with additional structure and interpretation.',
_);

add(slide('Probabilistic inference (alarm)',
  stmt('Joint distribution'),
  parentCenter(frameBox(table(
    ['$b$', '$e$', '$a$', '$\\P(B = b, E = e, A = a)$'],
    ['$0$', '$0$', '$0$', '$(1-\\epsilon)^2$'],
    ['$0$', '$0$', '$1$', '$0$'],
    ['$0$', '$1$', '$0$', '$0$'],
    ['$0$', '$1$', '$1$', '$(1-\\epsilon) \\epsilon$'],
    ['$1$', '$0$', '$0$', '$0$'],
    ['$1$', '$0$', '$1$', '$\\epsilon (1-\\epsilon)$'],
    ['$1$', '$1$', '$0$', '$0$'],
    ['$1$', '$1$', '$1$', '$\\epsilon^2$'],
  _).ycenter().margin(35, 5))).scale(0.7),
  pause(),
  'Queries: $\\P(B)$?  $\\P(B \\mid A = 1)$? $\\P(B \\mid A = 1, E = 1)$?',
  parentCenter(text('[demo: $\\epsilon = 0.05$]').linkToUrl('index.html#include=inference-demo.js&example=alarm')),
_));

prose(
  'Bayesian networks can be used to capture common reasoning patterns under uncertainty',
  '(which was one of their first applications).',
  _,
  'Consider the following model:',
  'Suppose the probability of an earthquake is $\\epsilon$ and the probability of a burglary is $\\epsilon$ and both are independent.',
  'Suppose that the alarm always goes off if either an earthquake or a burglary occurs.',
  _,
  'In the prior, we can eliminate $A$ and $E$ and get that the probability of the burglary is $\\epsilon$.',
  _,
  'Now suppose we hear the alarm $A = 1$.',
  'The probability of burglary is now $\\P(B = 1 \\mid A = 1) = \\frac1{2-\\epsilon}$.',
  _,
  'Now suppose that you hear on the radio that there was an earthquake ($E = 1$).',
  'Then the probability of burglary goes down to $\\P(B = 1 \\mid A = 1, E = 1) = \\epsilon$ again.',
_);

add(slide('Explaining away',
  parentCenter(simpleAlarmNetwork({})),
  keyIdea('explaining away',
    'Suppose two causes positively influence an effect.  Conditioned on the effect, conditioning on one cause reduces the probability of the other cause.',
  _),
_).leftHeader(image('images/alarm.jpg').width(150)));

prose(
  'This last phenomenon has a special name: <b>explaining away</b>.',
  'Suppose we have two <b>cause</b> variables $B$ and $E$, which are parents of an <b>effect</b> variable $A$.',
  'Assume the causes influence the effect positively (e.g., through the OR function).',
  _,
  'Conditioned on the effect $A = 1$, there is some posterior probability of $B$.',
  'Conditioned on the effect $A = 1$ and the other cause $E = 1$, the new posterior probability is reduced.',
  'We then say that the other cause $E$ has explained away $B$.',
_);

add(slide('Definition',
  parentCenter(twoLayerBayesNet({n1:2, n2: 3}).scale(0.3)),
  definition('Bayesian network',
    'Let $X = (X_1, \\dots, X_n)$ be random variables.', pause(),
    'A <b>Bayesian network</b> is a directed acyclic graph (DAG) that specifies a '+blue('joint distribution')+' over $X$ as a product of '+red('local conditional distributions')+', one for each node:',
    parentCenter(nowrapText('$\\displaystyle \\blue{\\P(X_1 = x_1, \\dots, X_n = x_n)} \\eqdef \\prod_{i=1}^n \\red{p(x_i \\mid x_{\\Parents(i)})}$')),
  _),
_));

prose(
  'Without further ado, let\'s define a Bayesian network formally.',
  'A Bayesian network defines a large joint distribution in a modular way, one variable at a time.',
  _,
  'First, the graph structure captures what other variables a given variable depends on.',
  _,
  'Second, we specify a local conditional distribution for variable $X_i$,',
  'which is a function that specifies a distribution over $X_i$ given an assignment $x_{\\Parents(i)}$',
  'to its parents in the graph (possibly none).',
  'The joint distribution is simply <b>defined</b> to be the product of all of the local conditional distributions together.',
  _,
  'Notationally, we use lowercase $p$ (in $p(x_i \\mid x_{\\Parents(i)})$)',
  'to denote a local conditional distribution,',
  'and uppercase $\\P$ to denote the induced joint distribution over all variables.',
  'While the two can coincide, it is important to keep these things separate in your head!',
  /*_,
  'While formally, a Bayesian network just defines a probability distribution,',
  'it can be intuitive (although a bit dangerous) to think of the graph as capturing notions of <b>causality</b>.',
  'This is made more precise with causal networks, but this is beyond the scope of this class.',*/
_);

add(slide('Special properties',
  stmt('Key difference from general factor graphs'),
  keyIdea('locally normalized',
    'All factors (local conditional distributions) satisfy:',
    parentCenter('$\\displaystyle \\sum_{x_i} p(x_i \\mid x_{\\Parents(i)}) = 1$ for each $x_{\\Parents(i)}$'),
  _),
  pause(),
  headerList('Implications',
    'Consistency of sub-Bayesian networks',
    'Consistency of conditional distributions',
  _),
_));

prose(
  'But Bayesian networks are more than that.',
  'The key property is that all the local conditional distributions, being distributions, sum to 1 over the first argument.',
  _,
  'This simple property results in two important properties of Bayesian networks that are not present in general factor graphs.',
_);

add(slide('Consistency of sub-Bayesian networks',
  parentCenter(simpleAlarmNetwork({})),
  'A short calculation:',
  parentCenter(table(
    ['$\\P(B = b, E = e)$', '$= \\sum_a \\P(B = b, E = e, A = a)$'],
    pause(),
    [nil(), '$= \\sum_a p(b) p(e) p(a \\mid b, e)$'],
    pause(),
    [nil(), '$= p(b) p(e) \\sum_a p(a \\mid b, e)$'],
    pause(),
    [nil(), '$= p(b) p(e)$'],
  _).margin(5, 20)),
_));

prose(
  'First, let\'s see what happens when we marginalize $A$ (by performing algebra on the joint probability).',
  'We see that we end up with $p(b) p(e)$, which actually defines a sub-Bayesian network with one fewer variable,',
  'and the same local conditional probabilities.',
  _,
  'If one marginalizes out all the variables, then one gets 1,',
  'which verifies that a Bayesian network actually defines a probability distribution.',
  _,
  'The philosophical ramification of this property is that there could be many other variables',
  'that depend on the variables you\'ve modeled (earthquakes also impacts traffic)',
  'but as long as you don\'t observe them,',
  'they can be ignored mathematically (ignorance is bliss).',
  'Note that this doesn\'t mean that knowing about the other things isn\'t useful.',
_);

add(slide('Consistency of sub-Bayesian networks',
  keyIdea('marginalization',
    'Marginalization of a leaf node yields a Bayesian network without the node.',
  _),
  parentCenter(table([
    simpleAlarmNetwork({}), pause(),
    bigRightArrow(100),
    eliminateSimpleAlarmNetwork({}),
  ], pause(), [
    simpleAlarmNetwork({factorGraph: true, showPotentials: true}), pause(),
    bigRightArrow(100),
    eliminateSimpleAlarmNetwork({factorGraph: true}),
  ]).center().margin(20)),
_));

prose(
  'This property is very attractive, because it means that whenever we have a large Bayesian network,',
  'where we don\'t care about some of the variables, we can just remove them (graph operations),',
  'and this encodes the same distribution as we would have gotten from marginalizing out variables (algebraic operations).',
  'The former, being visual, can be more intuitive.',
_);

add(slide('Consistency of local conditionals',
  keyIdea('local conditional distributions',
    'Local conditional distributions (factors) are the true conditional distributions.',
  _),
  parentCenter(bayesNetExample()).scale(0.8),
  parentCenter('$\\underbrace{\\P(D = d \\mid A = a, B = b)}_\\text{from probabilistic inference} = \\underbrace{p(d \\mid a, b)}_\\text{by definition}$'),
  /*pause(),
  bulletedText('Eliminate all descendants of $D$ (leaf); eliminate rest (disconnected by conditioning on $A$ and $B$)'),
  pause(),
  bulletedText('In general factor graphs, factors don\'t have significance in isolation; in Bayesian networks, factors are probabilities &mdash; nice!'),*/
_));

prose(
  'Note that the local conditional distributions $p(d \\mid a, b)$ are simply defined by the user.',
  'On the other hand, the quantity $\\P(D = d \\mid A = a, B = b)$ is not defined,',
  'but follows from probabilistic inference on the joint distribution defined by the Bayesian network.',
  _,
  'It\'s not clear a priori that the two have anything to do with each other.',
  'The second special property that we get from using Bayesian networks is that the two are actually the same.',
  _,
  'To show this, we can remove all the descendants of $D$ by the consistency of sub-Bayesian networks,',
  'leaving us with the Bayesian network $\\P(A = a, B = b, D = d) = p(a) p(b) p(d \\mid a, b)$.',
  'By the chain rule, $\\P(A = a, B = b, D = d) = \\P(A = a, B = b) \\P(D = d \\mid A = a, B = b)$.',
  'If we marginalize out $D$, then we are left with the Bayesian network $\\P(A = a, B = b) = p(a) p(b)$.',
  'From this, we can conclude that $\\P(D = d \\mid A = a, B = b) = p(d \\mid a, b)$.',
  _,
  'This argument generalizes to any Bayesian network and local conditional distribution.',
_);

add(slide('Medical diagnosis',
  nil(),
  problem('cold or allergies?',
    'You are coughing and have itchy eyes.  Do you have a cold or allergies?',
  _),
  pause(),
  parentCenter(text('[demo]').linkToUrl('index.html#include=inference-demo.js&example=med')),
  stmt('Variables: <b>C</b>old, <b>A</b>llergies, Coug<b>h</b>, <b>I</b>tchy eyes'),
  parentCenter(table(
    [stmt('Bayesian network'),
    stmt('Factor graph')],
    [simpleMedicalNetwork({}).scale(0.7),
    simpleMedicalNetwork({factorGraph: true}).scale(0.7)],
  _).margin(150, 20).justify('c', 'r')),
  // A C | H = 1, I = 1
_).leftHeader(image('images/doctor-tools.jpg').width(150)));

prose(
  'Here is another example (a cartoon version of Bayesian networks for medical diagnosis).',
  'Allergies and cold are the two hidden variables that we\'d like to infer (we have some prior over these two).',
  'Cough and itchy eyes are symptoms that we observe as evidence,',
  'and we have some likelihood model of these symptoms given the hidden causes.',
  _,
  'We can use the demo to infer the hidden state given the evidence.',
  // Try adding I = 1, watch C become less likely
_);

add(slide('Bayes rule',
  'Variables: <b>hidden</b> $H$, <b>evidence</b> $E$', pause(),
  stmt('True statements'),
  parentCenter(nowrapText('$\\P(H = h, E = e) = \\P(H = h, E = e)$')).scale(0.8),
  pause(),
  parentCenter(nowrapText('$\\P(H = h \\mid E = e) \\, \\P(E = e) = \\P(H = h) \\, \\P(E = e \\mid H = h)$')).scale(0.8),
  pause(),
  definition('Bayes rule',
    parentCenter(nowrapText('$\\underbrace{\\P(H = h \\mid E = e)}_\\text{posterior} \\propto \\underbrace{\\P(H = h)}_\\text{prior} \\underbrace{\\P(E = e \\mid H = h)}_\\text{likelihood}$')),
  _),
  stmt('Significance: interpretation'),
_));

prose(
  '<b>Bayes rule</b> is an extremely important concept in probability,',
  'which follows essentially from two applications of the definition of conditional distributions.',
  _,
  'We assume a hidden variable $H$ (e.g., true location) and an evidence variable $E$ (e.g., sensor reading).',
  'We assume that there is a <b>prior</b> distribution over $H$, which is what one believes about $H$ before having seen $E$.',
  'The <b>likelihood</b> is the probability of seeing a particular piece of evidence $e$ given the hidden variable.',
  'The <b>posterior</b> is the distribution over the hidden variable given the evidence.',
  _,
  'Bayes rule allows us to "invert" the conditioning: if likelihood goes forwards, then posterior looks backwards.',
  _,
  'Notation: we will often say that a probability distribution $p(x)$ is proportional to another function $f(x)$',
  '(written $p(x) \\propto f(x)$) if there exists a normalization constant $Z$ independent of $x$ such that $p(x) = \\frac{f(x)}{Z}$ for all $x$.',
  'Another way to think about it is that if we normalized $f(x)$, we would get $p(x)$.',
_);

add(slide('Bayes rule',
  stmt('Bayesian network'),
  parentCenter(xtable(
    overlay(
      stagger(
        ytable(h = factorNode('$H$'), e = factorNode('$E$', {color: 'white'})).margin(50),
        ytable(hh = factorNode('$H$'), ee = factorNode('$E$', {color: 'gray'})).margin(50),
      _),
      pause(-1),
      arrow(h, e),
    _),
    '$\\P(H = h, E = e) = p(h) p(e \\mid h)$',
  _).margin(50).center()),
  pause(),
  parentCenter(stagger(
    nowrapText('$\\underbrace{\\P(H = h \\mid E = e)}_\\text{posterior} \\propto \\underbrace{\\P(H = h)}_\\text{prior} \\underbrace{\\P(E = e \\mid H = h)}_\\text{likelihood}$'),
    nowrapText('$\\underbrace{\\P(H = h \\mid E = e)}_\\text{posterior (want)} \\propto \\underbrace{p(h)}_\\text{prior (have)} \\,\\,\\,\\, \\underbrace{p(e \\mid h)}_\\text{likelihood (have)}$'),
  _)),
  parentCenter(image('images/detective.jpg').width(150)),
_));

prose(
  'For a Bayesian network, Bayes rule is especially interesting because',
  'the prior and likelihood are local conditional distributions, which are specified by the user.',
  'The posterior is typically the query that one wants to answer.',
  _,
  'The mental picture is one of playing detective: we see some evidence, and want to figure out what happened.',
_);

add(summarySlide('Summary so far',
  parentCenter(simpleAlarmNetwork({})),
  bulletedText('Set of random variables capture state of world'),
  bulletedText('Local conditional distributions $\\Rightarrow$ joint distribution'),
  bulletedText('Probabilistic inference task: ask questions'),
  bulletedText('Captures reasoning patterns (e.g., explaining away)'),
  bulletedText('Factor graph interpretation (for algorithms later)'),
_));

////////////////////////////////////////////////////////////
// Probabilistic programs
roadmap(1);

add(slide('Probabilistic programs',
  stmt('Goal: make it easier to write down complex Bayesian networks'),
  keyIdea('probabilistic program',
    'Write a program to generate an assignment (rather than specifying the probability of an assignment).',
  _),
_));

add(slide('Probabilistic programs',
  parentCenter(simpleAlarmNetwork({}).scale(0.8)),
  generativeModel('alarm',
    '$B \\sim \\text{Bernoulli}(\\epsilon)$',
    '$E \\sim \\text{Bernoulli}(\\epsilon)$',
    '$A = B \\vee E$',
  _).scale(0.8),
  pause(),
  keyIdea('probabilistic program',
    'A randomized program that sets the random variables.',
  _),
  parentCenter(ytable(
    nowrapText('<tt>def Bernoulli(epsilon):</tt>'),
    nowrapText('<tt>&nbsp;&nbsp;&nbsp;&nbsp;return random.random() < epsilon</tt>'),
  _)).scale(0.8),
_));

prose(
  'There is another way of writing down Bayesian networks other than graphically or mathematically,',
  'and that is as a probabilistic program.',
  'A <b>probabilistic program</b> is a randomized program that',
  'invokes a random number generator to make random choices.',
  'Executing this program will assign values to a collection of random variables $X_1, \\dots, X_n$;',
  'that is, generating an assignment.',
  _,
  'The probability (e.g., fraction of times) that the program generates that assignment',
  'is exactly the probability under the joint distribution specified by that program.',
  _,
  'We should think of this program as outputting the state of the world',
  '(or at least the part of the world that we care about for our task).',
  _,
  'Note that the probabilistic program is only used to define joint distributions.',
  'We usually wouldn\'t actually run this program directly.',
  _,
  'For example, we show the probabilistic program for alarm.',
  '$B \\sim \\text{Bernoulli}(\\epsilon)$ simply means that $\\P(B = 1) = \\epsilon$.',
  'Here, we can think about $\\text{Bernoulli}(\\epsilon)$ as a randomized function (<tt>random() < epsilon</tt>)',
  'that returns $1$ with probability $\\epsilon$ and $0$ with probability $1-\\epsilon$.',
_);

function objectTrackingGenerativeModel(opts) {
  var myPause = opts.pause ? pause : function() { return _; };
  return generativeModel('object tracking',
    '$X_0 = (0,0)$', myPause(),
    'For each time step $i = 1, \\dots, n$:', myPause(),
    indent('With probability $\\alpha$:'),
    indent(indent('$X_i = X_{i-1} + (1,0)$ [go right]')), myPause(),
    indent('With probability $1-\\alpha$:'),
    indent(indent('$X_i = X_{i-1} + (0,1)$ [go down]')),
    //indent('Generate position $X_t \\sim p(X_t \\mid X_{t-1})$'),
  _);
}

add(slide('Probabilistic program: example',
  objectTrackingGenerativeModel({pause:true}),
  //pause(),
  /*headerList(null,
    'Each run sets variables $X_1, \\dots, X_n$',
    //'Randomness induces a joint distribution over variables',
  _),*/
  pause(),
  stmt('Bayesian network structure'),
  parentCenter(markovModel({})),
_));

prose(
  'This is a more interesting generative model since it has a for loop,',
  'which allows us to determine the distribution over a templatized set of $n$ variables rather than just $3$ or $4$.',
  _,
  'In these cases, variables are generally indexed by something like time or location.',
  _,
  'We can also draw the Bayesian network.',
  'Each $X_i$ only depends on $X_{i-1}$.',
  'This is a chain-structured Bayesian network, called a <b>Markov model</b>.',
_);


G.generativeObjectTrackingDemo = function(opts) {
  var code = [
    'alpha = 0.5',
  ].join("\n") + (opts.postCode ? '\n'+opts.postCode : '');

  var conditions;

  // Build world
  var n = 10;
  var rows = [];
  for (var r = 0; r < n; r++) {
    var row = [];
    for (var c = 0; c < n; c++) {
      row.push(square(20));
    }
    rows.push(row);
  }
  var gridTable = table.apply(null, rows);

  function hit(r, c, condition) {
    if (rows[r] && rows[r][c]) {
      updateColor(rows[r][c].color('black', condition ? 'orange' : 'red'));
    }
  }

  function okay(t, r, c) {
    var cond = conditions[t];
    if (!cond) return true;
    return cond[0] == r && cond[1] == c;
  }

  function sample() {
    var T = 15;
    var path;
    var found = false;
    for (var trial = 0; trial < 10000; trial++) {
      path = [];
      var r = 0, c = 0;
      var ok = true;
      for (var t = 0; t < T; t++) {
        path[t] = [r, c];
        if (!okay(t, r, c)) { ok = false; break; }
        if (Math.random() < alpha) {
          c++;
        } else {
          r++;
        }
      }
      if (ok) { found = true; break; }
    }
    if (found) {
      for (var t = 0; t < T; t++) {
        hit(path[t][0], path[t][1], conditions[t]);
      }
    } else {
      L('Not found');
    }
  }

  function condition(time, point) { conditions[time] = [point[1], point[0]]; }

  function run() {
    conditions = [];
    eval(inputBox.content().get());
    for (var r = 0; r < n; r++)
      for (var c = 0; c < n; c++)
        updateColor(rows[r][c].color('black', 'white'));
    sample();
  }

  var inputBox = textBox().multiline(true).size(40, 6).onEnter(run);
  inputBox.content(code);

  return xtable(
    gridTable,
    ytable(
      inputBox,
      '(press ctrl-enter to save)',
      makeButton('Run', run),
    _).center(),
  _).center().margin(20);
}

add(slide('Probabilistic program: example',
  nil(),
  parentCenter(generativeObjectTrackingDemo({})),
_));

prose(
  'Try clicking [Run].',
  'Each time a new assignment of $(X_1, \\dots, X_n)$ is chosen.',
_);

add(slide('Probabilistic inference: example',
  darkbluebold('Query')+': what are possible trajectories given <b>evidence</b> $X_{10} = (8, 2)$?',
  parentCenter(generativeObjectTrackingDemo({postCode: 'condition(10, [8, 2])'})),
_));

prose(
  'This program only serves for defining the distribution.',
  'Now we can query that distribution and ask the question:',
  'suppose the program set $X_{10} = (8,2)$; what is the distribution over the other variables?',
  _,
  'In the demo, note that all trajectories are constrained to go through $(8,2)$ at time step $10$.',
_);

add(slide('Probability distribution: example',
  stmt('Local conditional distribution'),
  parentCenter(nowrapText('$p(x_i \\mid x_{i-1}) = \\alpha \\cdot \\underbrace{[x_i = x_{i-1} + (1,0)]}_\\text{right} + (1-\\alpha) \\cdot \\underbrace{[x_i = x_{i-1} + (0,1)]}_\\text{down}$')).scale(0.77),
  pause(),
  stmt('Joint distribution'),
  parentCenter('$\\displaystyle \\P(X = x) = \\prod_{i=1}^n p(x_i \\mid x_{i-1})$'),
  pause(),
  example('object tracking',
    stmt('Assignment'),
    indent(nowrapText('$x_1 = (1, 0), x_2 = (1, 1), x_3 = (2, 1)$')),
    pause(),
    stmt('Joint distribution'),
    indent('$\\P(X = x) = \\alpha \\cdot (1-\\alpha) \\cdot \\alpha$'),
  _).scale(0.8),
_));

prose(
  'Let\'s ground out the probabilistic program in symbols.',
  _,
  'First, we formalize the (conditional) distribution over each variable $X_i$.',
  'In this example, this variable depends on only the previous position $X_{i-1}$, but in general, $X_i$ could depend on any of the previous variables.',
  _,
  'The joint distribution over all the variables is simply the product of the conditional distribution over each of the variables.',
_);

add(slide('Three equivalent representations',
  stmt('Probabilistic program'),
  objectTrackingGenerativeModel({pause:false}).scale(0.6),
  stmt('Bayesian network structure'),
  parentCenter(markovModel({})).scale(0.8),
  stmt('Mathematical definition'),
  parentCenter(nowrapText('$p(x_i \\mid x_{i-1}) = \\alpha \\cdot \\underbrace{[x_i = x_{i-1} + (1,0)]}_\\text{right} + (1-\\alpha) \\cdot \\underbrace{[x_i = x_{i-1} + (0,1)]}_\\text{down}$')).scale(0.6),
_));

prose(
  'To summarize, we have seen three equivalent representations for the object tracking model:',
  'the probabilistic program, the Bayesian network structure, and the mathematical definition of the local conditional distributions.',
  'It\'s useful to be able to quickly switch back and forth between the different ones.',
_);

add(slide('Application: language modeling',
  //stmt('Question', 'what did I just say?'),
  //pause(),
  generativeModel('Markov model',
    'For each position $i = 1, 2, \\dots, n$:',
    indent('Generate word $X_i \\sim p(X_i \\mid X_{i-1})$'),
  _),
  parentCenter(markovModel({values: true})).scale(0.8),
  //pause(),
  /*headerList('Applications',
    'Speech recognition',
    'Machine translation',
    //'Generation of random stories',
  _),*/
_));

prose(
  'In the context of natural language, a Markov model is known as a bigram model.',
  'A higher-order generalization of bigram models are $n$-gram models',
  '(more generally known as higher-order Markov models).',
  _,
  'Language models are often used to measure the "goodness" of a sentence,',
  'mostly within the context of a larger system such as speech recognition or machine translation.',
_);

add(slide('Application: object tracking',
  generativeModel('hidden Markov model (HMM)',
    'For each time step $t=1,\\dots,T$:',
    indent('Generate object location $H_t \\sim p(H_t \\mid H_{t-1})$'),
    pause(),
    indent('Generate sensor reading $E_t \\sim p(E_t \\mid H_t)$'),
  _),
  pause(-1),
  parentCenter(hmm({maxTime: 5, pause: true, values: true}).scale(0.7)),
  pause(),
  stmt('Applications: speech recognition, information extraction, gene finding'),
  //pause(),
  /*headerList('Other applications',
    'Computational biology: gene finding', pause(),
    'Natural language: speech recognition, information extraction',
  _).ymargin(0).scale(0.9),*/
_));

prose(
  'Markov models are limiting because they do not have a way of talking about noisy evidence (sensor readings).',
  'They can be extended quite easily to hidden Markov models,',
  'which introduce a parallel sequence of observation variables.',
  _,
  'For example, in object tracking, $H_t$ denotes the true object location,',
  'and $E_t$ denotes the noisy sensor reading,',
  'which might be (i) the location $H_t$ plus noise, or (ii) the distance from $H_t$ plus noise,',
  'depending on the type of sensor.',
  _,
  'In speech recognition, $H_t$ would be the phonemes or words and $E_t$ would be the raw acoustic signal.',
_);

add(slide('Application: multiple object tracking',
  generativeModel('factorial HMM',
    'For each time step $t=1,\\dots,T$:',
    indent('For each object $o \\in \\{\\text{a},\\text{b}\\}$:'), pause(),
    indent('Generate location $H_t^o \\sim p(H_t^o \\mid H_{t-1}^o)$', 40),
    pause(),
    indent('Generate sensor reading $E_t \\sim p(E_t \\mid H_t^\\text{a}, H_t^\\text{b})$'),
  _),
  pause(-1),
  parentCenter(simpleDBN({pause: true}).scale(0.9)),
_));

prose(
  'An extension of an HMM, called a <b>factorial HMM</b>,',
  'can be used to track multiple objects.',
  'We assume that each object moves independently according to a Markov model,',
  'but that we get one sensor reading which is some noisy aggregated function of the true positions.',
  _,
  'For example, $E_t$ could be the set $\\{H_t^\\text{a}, H_t^\\text{b}\\}$, which reveals where the objects are,',
  'but doesn\'t say which object is responsible for which element in the set.',
_);

add(slide('Application: document classification',
  stmt('Question', 'given a text document, what is it about?'),
  pause(),
  generativeModel('naive Bayes',
    'Generate label $Y \\sim p(Y)$', pause(),
    'For each position $i = 1, \\dots, L$:',
    indent('Generate word $W_i \\sim p(W_i \\mid Y)$'),
  _),
  pause(-1),
  parentCenter(naiveBayesModel({pause: true, example: true, condition: true})),
_));

prose(
  'Naive Bayes is a very simple model which can be used for classification.',
  'For document classification, we generate a label and all the words in the document',
  'given that label.',
  _,
  'Note that the words are all generated independently,',
  'which is not a very realistic model of language, but naive Bayes models are surprisingly',
  'effective for tasks such as document classification.',
_);

add(slide('Application: topic modeling',
  stmt('Question', 'given a text document, what topics is it about?'),
  pause(),
  generativeModel('latent Dirichlet allocation',
    'Generate a distribution over topics $\\alpha \\in \\R^K$', pause(),
    'For each position $i = 1, \\dots, L$:',
    indent('Generate a topic $Z_i \\sim p(Z_i \\mid \\alpha)$'), pause(),
    indent('Generate a word $W_i \\sim p(W_i \\mid Z_i)$'),
  _),
  pause(-2),
  parentCenter(ldaModel({pause: true, example: true, condition: true}).scale(0.8)),
_));

prose(
  'A more sophisticated model of text is latent Dirichlet Allocation (LDA),',
  'which allows a document to not just be about one topic (which was true in naive Bayes),',
  'but about multiple topics.',
  _,
  'Here, the distribution over topics $\\alpha$ is chosen per document from a Dirichlet distribution.',
  'Note that $\\alpha$ is a continuous-valued random variable.',
  'For each position, we choose a topic according to that per-docuent distribution and generate a word given that topic.',
  _,
  'Latent Dirichlet Alloction (LDA) has been very infuential for modeling not only text but images, videos, music, etc.;',
  'any sort of data with hidden structure.',
  'It is very related to matrix factorization.',
_);

add(slide('Application: medical diagnostics',
  stmt('Question', 'If patient has has a cough and fever, what disease(s) does he/she have?'),
  pause(),
  parentCenter(diseaseGraph()),
  generativeModel('diseases and symptoms',
    'For each disease $i=1,\\dots,m$:',
    indent('Generate activity of disease $D_i \\sim p(D_i)$'),
    pause(),
    'For each symptom $j=1,\\dots,n$:',
    indent('Generate activity of symptom $S_j \\sim p(S_j \\mid D_{1:m})$'),
  _),
_));

prose(
  'We already saw a special case of this model.',
  'In general, we would like to diagnose many diseases and might have measured many symptoms and vitals.',
_);

// Example of a graph
add(slide('Application: social network analysis',
  stmt('Question', 'Given a social network (graph over $n$ people), what types of people are there?'),
  pause(),
  parentCenter(socialNetwork()),
  showLevel(2),
  generativeModel('stochastic block model',
    'For each person $i=1,\\dots,n$:',
    indent('Generate person type $H_i \\sim p(H_i)$'),
    pause(),
    'For each pair of people $i \\neq j$:',
    indent('Generate connectedness $E_{ij} \\sim p(E_{ij} \\mid H_i, H_j)$'),
  _).scale(0.9),
_));

prose(
  'One can also model graphs such as social networks.',
  'A very naive-Bayes-like model is that each node (person) has a "type".',
  'Whether two people interact with each other is determined solely by their types and random chance.',
  _,
  'Note: there are extensions called mixed membership models which, like LDA,',
  'allow each person to have multiple types.',
  _,
  'In summary, it is quite easy to come up with probabilistic programs that tell a story of how the world works for the domain of interest.',
  'These probabilistic programs define joint distributions over assignments to a collection of variables.',
  'Usually, these programs describe how some collection of hidden variables $H$ that you\'re interested in behave,',
  'and then describe the generation of the evidence $E$ that you see conditioned on $H$.',
  'After defining the model, one can do probabilistic inference to compute $\\P(H \\mid E = e)$.',
_);

////////////////////////////////////////////////////////////
// Inference
roadmap(2);

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


add(slide('Example: Markov model',
  parentCenter(markovModel({condition:1, K:4})).scale(0.8),
  stmt('Query: $\\P(X_3 = x_3 \\mid X_2 = 5)$ for all $x_3$'),
  pause(),
  stmt('Tedious way'),
  parentCenter(ytable(
    stagger(
      '$= \\displaystyle \\frac{\\P(X_2 = 5, X_3 = x_3)}{\\P(X_2 = 5)}$',
      '$\\propto \\displaystyle \\P(X_2 = 5, X_3 = x_3)$',
      '$\\propto \\displaystyle \\sum_{x_1,x_4} \\P(X_1 = x_1, X_2 = 5, X_3 = x_3, X_4 = x_4)$',
      '$\\propto \\displaystyle \\sum_{x_1,x_4} p(x_1) p(x_2 \\mid x_1) p(x_3 \\mid x_2 = 5) p(x_4 \\mid x_3)$',
    _),
    pause(),
    stagger(
      '$\\propto \\displaystyle \\left(\\sum_{x_1} p(x_1) p(x_2 \\mid x_1) \\right) p(x_3 \\mid x_2 = 5) \\sum_{x_4} p(x_4 \\mid x_3)$',
      '$\\propto \\displaystyle \\left(\\sum_{x_1} p(x_1) p(x_2 \\mid x_1) \\right) p(x_3 \\mid x_2 = 5)$',
    _),
    pause(),
    '$\\propto \\displaystyle p(x_3 \\mid x_2 = 5)$',
  _).scale(0.8).margin(20)),
  //pause(),
  //stmt('Fast way'),
  //parentCenter('[whiteboard]'),
_));

prose(
  'Let\'s first compute the query the old-fashioned way by grinding through the algebra.',
  'Then we\'ll see a faster, more graphical way, of doing this.',
  _,
  'We start by transforming the query into an expression that references the joint distribution,',
  'which allows us to rewrite as the product of the local conditional probabilities.',
  'To do this, we invoke the definition of marginal and conditional probability.',
  _,
  'One convenient shortcut we will take is make use of the proportional-to ($\\propto$) relation.',
  'Note that in the end, we need to construct a distribution over $X_3$.',
  'This means that any quantity (such as $\\P(X_2 = 5)$) which doesn\'t depend on $X_3$ can be folded',
  'into the proportionality constant.',
  'If you don\'t believe this, keep it around to convince yourself that it doesn\'t matter.',
  'Using $\\propto$ can save you a lot of work.',
  _,
  'Next, we do some algebra to push the summations inside.',
  'We notice that $\\sum_{x_4} p(x_4 \\mid x_3) = 1$ because it\'s a local conditional distribution.',
  'The factor $\\sum_{x_1} p(x_1) p(x_2 = 5 \\mid x_1)$ can also be folded into the proportionality constant.',
  _,
  'The final result is $p(x_3 \\mid x_2 = 5)$,',
  'which matches the query as we expected by the consistency of local conditional distributions.',
_);

add(slide('General strategy',
  stmt('Query'),
  parentCenter('$\\P(Q \\mid E = e)$'),
  pause(),
  algorithm('general probabilistic inference strategy',
    bulletedText('Remove (marginalize) variables that are not ancestors of $Q$ or $E$.'), pause(),
    bulletedText('Convert Bayesian network to factor graph.'), pause(),
    bulletedText('Condition on $E = e$ (shade nodes + disconnect).'), pause(),
    bulletedText('Remove (marginalize) nodes disconnected from $Q$.'), pause(),
    bulletedText('Run probabilistic inference algorithm (manual, variable elimination, Gibbs sampling, particle filtering).'),
  _),
_));

prose(
  'Our goal is to compute the conditional distribution over the query variables $Q \\subseteq H$ given evidence $E = e$.',
  'We can do this with our bare hands by chugging through all the algebra starting with the definition of marginal and conditional probability,',
  'but there is an easier way to do this that exploits the structure of the Bayesian network.',
  _,
  'Step 1: remove variables which are not ancestors of $Q$ or $E$.',
  'Intuitively, these don\'t have an influence on $Q$ and $E$, so they can be removed.',
  'Mathematically, this is due to the consistency of sub-Bayesian networks.',
  _,
  'Step 2: turn this Bayesian network into a factor graph by simply introducing one factor per node which is connected to that node and its parents.',
  'It\'s important to include all the parents and the child into one factor, not separate factors.',
  'From here out, all we need to think about is factor graphs.',
  _,
  'Step 3: condition on the evidence variables.  Recall that conditioning on nodes in a factor graph shades them in,',
  'and as a graph operation, rips out those variables from the graph.',
  _,
  'Step 4: remove nodes which are not connected to $Q$.',
  'These are independent of $Q$, so they have no impact on the results.',
  _,
  'Step 5: Finally, run a standard probabilistic inference algorithm on the reduced factor graph.',
  'We\'ll do this manually for now using variable elimination.',
  'Later we\'ll see automatic methods for doing this.',
_);

add(slide('Example: alarm',
  parentCenter(xtable(
    simpleAlarmNetwork({}),
    //pause(),
    frameBox(table(
      ['$b$', '$p(b)$'],
      ['$1$', '$\\epsilon$'],
      ['$0$', '$1-\\epsilon$'],
    _).ycenter().margin(15, 5)),
    //pause(),
    frameBox(table(
      ['$e$', '$p(e)$'],
      ['$1$', '$\\epsilon$'],
      ['$0$', '$1-\\epsilon$'],
    _).ycenter().margin(15, 5)),
    //pause(),
    frameBox(table(
      ['$b$', '$e$', '$a$', '$p(a \\mid b, e)$'],
      ['$0$', '$0$', '$0$', '$1$'],
      ['$0$', '$0$', '$1$', '$0$'],
      ['$0$', '$1$', '$0$', '$0$'],
      ['$0$', '$1$', '$1$', '$1$'],
      ['$1$', '$0$', '$0$', '$0$'],
      ['$1$', '$0$', '$1$', '$1$'],
      ['$1$', '$1$', '$0$', '$0$'],
      ['$1$', '$1$', '$1$', '$1$'],
    _).ycenter().margin(15, 5)).scale(0.5),
  _).margin(50).scale(0.8)),
  parentCenter('[whiteboard]'),
  stmt('Query: $\\P(B)$'), pause(),
  bulletedText('Marginalize out $A, E$'),
  pause(),
  stmt('Query: $\\P(B \\mid A = 1)$'), pause(),
  bulletedText('Condition on $A = 1$'),
  //pause(),
  //stmt('Query: $\\P(B \\mid A = 1, E = 1)$'), pause(),
  //bulletedText('Condition on $A = 1$ and $E = 1$'),
_));

prose(
  'Here is another example: the simple v-structured alarm network from last time.',
  _,
  '$\\P(B) = p(b)$ trivially after marginalizing out $A$ and $E$ (step 1).',
  _,
  'For $\\P(B \\mid A = 1)$, step 1 doesn\'t do anything.',
  'Conditioning (step 3) creates a factor graph with factors $p(b)$, $p(e)$, and $p(a = 1 \\mid b, e)$.',
  'In step 5, we eliminate $E$ by replacing it and its incident factors with',
  'a new factor $f(b) = \\sum_e p(e) p(a = 1 \\mid b, e)$.',
  'Then, we multiply all the factors (which should only be unary factors on the query variable $B$) and normalize:',
  '$\\P(B = b \\mid A = 1) \\propto p(b) f(b)$.',
  _,
  'To flesh this out, for $b = 1$, we have $\\epsilon (\\epsilon + (1 - \\epsilon)) = \\epsilon$.',
  'For $b = 0$, we have $(1-\\epsilon) (\\epsilon + 0) = \\epsilon (1 - \\epsilon)$.',
  'The normalized result is thus $\\P(B = 1 \\mid A = 1) = \\frac{\\epsilon}{\\epsilon + \\epsilon (1 - \\epsilon)} = \\frac{1}{2 - \\epsilon}$.',
  _,
  'For a probabilistic interpretation, note that all we\'ve done is calculate ',
  '$\\P(B = b \\mid A = 1) = \\frac{\\P(B = b) \\P(A = 1 | B = b)}{\\P(A = 1)} = \\frac{p(b)f(b)}{\\sum_{b_i \\in \\Domain(B)}p(b_i)f(b_i)}$,',
  'where the first equality follows from Bayes\' rule and the second follows from ',
  'the fact that the local conditional distributions are the true conditional distributions. ',
  'The Bayesian network has simply given us a methodical, algorithmic way to calculate ',
  'this probability.',
_);

add(slide('Example: A-H',
  parentCenter(bayesNetExample()).scale(0.8),
  parentCenter('[whiteboard]'),
  pause(),
  stmt('Query: $\\P(C \\mid B = b)$'), pause(),
  bulletedText('Marginalize out everything else, note $C \\independent B$'),
  pause(),
  stmt('Query: $\\P(C, H \\mid E = e)$'), pause(),
  bulletedText('Marginalize out $A,D,F,G$, note $C \\independent H \\mid E$'),
  //stmt('Query: $\\P(D \\mid A = a, B = b)$'), pause(),
  //bulletedText('Eliminate $F,G$ (leaf), eliminate rest (disconnected)'),
_));

prose(
  'In the first example, once we marginalize out all variables we can,',
  'we are left with $C$ and $B$, which are disconnected.',
  'We condition on $B$, which just removes that node, and so we\'re just left with $\\P(C) = p(c)$, as expected.',
  _,
  'In the second example,',
  'note that the two query variables are independent, so we can compute them separately.',
  'The result is $\\P(C=c, H=h \\mid E = e) \\propto p(c) p(h \\mid e) \\sum_b p(b) p(e \\mid b, c)$.',
  _,
  'If we had the actual values of these probabilities, we can compute these quantities.',
_);

/*add(slide('Pattern 1: v-structure',
  parentCenter(simpleAlarmNetwork({})).scale(0.8),
  pause(),
  stmt('Parents $B$ and $E$ are <b>conditionally dependent</b> (condition on $A$)'),
  parentCenter(xtable(simpleAlarmNetwork({condition: true}).scale(0.8), simpleAlarmNetwork({factorGraph: true, condition: true}).scale(0.8)).margin(150)),
  pause(),
  stmt('Parents $B$ and $E$ are <b>independent</b> (marginalize out $A$)'),
  parentCenter(xtable(eliminateSimpleAlarmNetwork({}).scale(0.8))),
_));

prose(
  'For factor graphs, independence and conditional independence were straightforward graph properties.',
  'Two (sets of) variables $B$ and $E$ were conditionally independent given $A$ if there was no path from $B$ to $E$ in the graph.',
  _,
  'Conditional independence in Bayesian networks warrant some discussion.',
  'First, suppose we condition on $A$.  Are $B$ and $E$ independent?  The answer is no.',
  'A common mistake is to look at the DAG and conclude that $A$ separates $B$ and $E$.',
  'It is important to look at the factor graph rather than the DAG.',
  'Recall that the factor graph corresponding to a Bayesian network includes a single factor that depends on both $A$ and its two parents $B$ and $E$.',
  'When we condition on $A$, that only removes $A$ from the picture, but $B$ and $E$ still have a factor in common.',
  'This is intuitive: recall that given $A = 1$, $E$ explained away $B$.',
  _,
  'Now let\'s not condition on $A$ but ask whether $B$ and $E$ are independent?',
  'Here, we have to eliminate $A$.',
  'But remember that for Bayesian networks, eliminating variables that are not ancestors of the query variables simply amounts to removing them:',
  'the new factor produced is $f(b, e) = \\sum_a p(a \\mid b, e) = 1$, which can be safely ignored.',
  'As a result, $B$ and $E$ are actually independent.',
  'This is a special property of Bayesian networks: <b>eliminating children renders parents independent</b>.',
  'This is also intuitive if we think about the interpretation of Bayesian networks:',
  'Without any information (such as $A$), the parents $B$ and $E$ have nothing to do with each other (and thus are independent).',
  _,
  'Note: this three-node Bayesian network is called a <b>v-structure</b>.',
  'If two variables $A, B$ are Bayesian network conditionally independent given $C$,',
  'then they are said to be <b>d-separated</b>.',
_);

add(slide('Pattern 2: inverted v-structure',
  parentCenter(simpleInvertedV({})).scale(0.8),
  pause(),
  stmt('Children $H$ and $I$ are <b>conditionally independent</b> (condition on $A$)'),
  parentCenter(xtable(simpleInvertedV({condition: true}).scale(0.8), simpleInvertedV({factorGraph: true, condition: true}).scale(0.8)).margin(150).yjustify('r')),
  pause(),
  stmt('Children $H$ and $I$ are <b>dependent</b> (marginalize out $A$)'),
  parentCenter(xtable(eliminateSimpleInvertedV({}).scale(0.8))),
_));

prose(
  'The other structure to keep in mind is the inverted v-structure.',
  'Do not get these two confused!',
  'While the two structures look graphically similar,',
  'if you pause a moment to think about the semantics of Bayesian networks,',
  'you\'ll realize that the two are quite different.',
  'First, rather than having one ternary factor $p(a \\mid b, e)$ and two unary factors,',
  'we now have two binary factors, $p(h \\mid a)$ and $p(i \\mid a)$, and one unary factor.',
  _,
  'In fact, the inverted v-structure is nothing special: all the independences follow from its factor graph structure.',
_);

add(slide('Independence: examples',
  parentCenter(simpleMedicalNetwork({})).scale(0.8),
  parentCenter(xtable(
    table(
      ['$C \\independent A$?', 'yes'],
      ['$C \\independent I$?', 'yes'],
      ['$C \\independent H$?', 'no'],
      ['$A \\independent I$?', 'no'],
      ['$A \\independent H$?', 'no'],
      ['$I \\independent H$?', 'no'],
    _).margin(5),
    pause(),
    table(
      ['$C \\independent A \\mid H$?', 'no'],
      ['$C \\independent I \\mid H$?', 'no'],
      ['$A \\independent I \\mid H$?', 'no'],
      [nil(), nil()],
      pause(),
      ['$C \\independent H \\mid A$?', 'no'],
      ['$C \\independent I \\mid A$?', 'yes'],
      ['$I \\independent H \\mid A$?', 'yes'],
    _).margin(5),
  _).margin(50)),
_));

prose(
  'Now let us look at the medical diagosis example from earlier,',
  'which combines both patterns.',
  _,
  'Which of these are Bayesian network independent?',
  'Go through each of these and convince yourself of the answer.',
  _,
  'First, marginalize out all the variables that do not have any descendants that we\'re conditioning on.',
  'This just means dropping those nodes by consistency properties.',
  _,
  'Next, we can either check the two patterns directly for a small enough factor graph,',
  'or else we convert the Bayesian network to a factor graph,',
  'where independence checking is easy (graph connectivity).',
_);*/

////////////////////////////////////////////////////////////

add(summarySlide('Summary',
  stmt('Bayesian networks: modular definition of large joint distribution over variables'),
  parentCenter(image('images/generative.jpg').width(80)),
  pause(),
  stmt('Probabilistic inference: condition on evidence, query variables of interest'),
  parentCenter(image('images/detective.jpg').width(80)),
  pause(),
  stmt('Next time: probabilistic inference <b>algorithms</b>'),
_));

sfig.initialize();
