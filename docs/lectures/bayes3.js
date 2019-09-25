G = sfig.serverSide ? global : this;
G.prez = presentation();

add(titleSlide('Lecture 15: Bayesian networks III',
  nil(),
  parentCenter(twoLayerBayesNet({n1:10, n2: 20}).scale(0.3)),
_));

// add(quizSlide('bayes3-start',
//   'Which is computationally more expensive for Bayesian networks?',
//   'probabilistic inference given the parameters',
//   'learning the parameters given fully labeled data',
// _));

add(slide('Review: Bayesian network',
  parentCenter(xtable(
    simpleMedicalNetwork({}),
    ytable(
      '$\\P(C = c, A = a, H = h, I = i)$',
      indent('$= p(c) p(a) p(h \\mid c, a) p(i \\mid a)$'),
    _).margin(10),
  _).center().margin(50)).scale(0.8),
  definition('Bayesian network',
    'Let $X = (X_1, \\dots, X_n)$ be random variables.',
    'A <b>Bayesian network</b> is a directed acyclic graph (DAG) that specifies a '+blue('joint distribution')+' over $X$ as a product of '+red('local conditional distributions')+', one for each node:',
    parentCenter(nowrapText('$\\displaystyle \\blue{\\P(X_1 = x_1, \\dots, X_n = x_n)} = \\prod_{i=1}^n \\red{p(x_i \\mid x_{\\Parents(i)})}$')),
  _),
_));

prose(
  'A Bayesian network allows us to define a <b>joint</b> probability distribution over many variables (e.g., $\\P(C, A, H, I)$)',
  'by specifying <b>local</b> conditional distributions (e.g., $p(i \\mid a)$).',
  'Two lectures ago, we talked about modeling: how can we use Bayesian networks to represent real-world problems.',
_);

add(slide('Review: probabilistic inference',
  stmt('Bayesian network'),
  parentCenter('$\\displaystyle \\P(X = x) = \\prod_{i=1}^n p(x_i \\mid x_{\\Parents(i)})$'),
  stmt('Probabilistic inference'),
  parentCenter('$\\P(Q \\mid E = e)$'),
  pause(),
  headerList('Algorithms',
    'Variable elimination: general, exact',
    'Forward-backward: HMMs, exact',
    'Gibbs sampling, particle filtering: general, approximate',
  _),
_));

prose(
  'Last lecture, we focused on algorithms for probabilistic inference: how do we efficiently compute queries of interest?',
  'We can do many things in closed form by leveraging the conditional independence structure of Bayesian networks.',
  _,
  'For HMMs, we could use the forward-backward algorithm to compute the queries efficiently.',
  _,
  'For general Bayesian networks / factor graphs, we must resort to an approximate algorithm such as Gibbs sampling or particle filtering.',
_);

add(slide('Paradigm',
  nil(),
  parentCenter(paradigm()),
_));

var q = red('?');
add(slide('Where do parameters come from?',
  parentCenter(ytable(
    simpleAlarmNetwork({}),
    xtable(
      frameBox(table(
        ['$b$', '$p(b)$'],
        ['$1$', q],
        ['$0$', q],
      _).ycenter().margin(15, 5)),
      frameBox(table(
        ['$e$', '$p(e)$'],
        ['$1$', q],
        ['$0$', q],
      _).ycenter().margin(15, 5)),
      frameBox(table(
        ['$b$', '$e$', '$a$', '$p(a \\mid b, e)$'],
        ['$0$', '$0$', '$0$', q],
        ['$0$', '$0$', '$1$', q],
        ['$0$', '$1$', '$0$', q],
        ['$0$', '$1$', '$1$', q],
        ['$1$', '$0$', '$0$', q],
        ['$1$', '$0$', '$1$', q],
        ['$1$', '$1$', '$0$', q],
        ['$1$', '$1$', '$1$', q],
      _).ycenter().margin(15, 5)),
    _).margin(50),
  _).margin(50).scale(0.8).center()),
_));

prose(
  'Today\'s lecture focuses on the following question:',
  'where do all the local conditional distributions come from?',
  'These local conditional distributions are the parameters of the Bayesian network.',
_);

function roadmap(i) {
  add(outlineSlide('Roadmap', i, [
    ['learning', 'Supervised learning'],
    ['smoothing', 'Laplace smoothing'],
    ['em', 'Unsupervised learning with EM'],
  ]));
}

////////////////////////////////////////////////////////////
// Learning
roadmap(0);

prose(
  'The plan for today is start with the supervised setting,',
  'where our training data consists of a set of <b>complete assignments</b>.',
  'The algorithms here are just counting and normalizing.',
  _,
  'Then we\'ll talk about smoothing, which is a mechanism for guarding against overfitting.',
  'This involves just a small tweak to existing algorithms.',
  _,
  'Finally, we\'ll consider the unsupervised or missing data setting,',
  'where our training data consists of a set of <b>partial assignments</b>.',
  'Here, the workhorse algorithm is the EM algorithm which breaks up the problem into',
  'probabilistic inference + supervised algorithms.',
_);

add(slide('Learning task',
  importantBox(redbold('Training data'), parentCenter('$\\Train$ (an example is an assignment to $X$)')),
  pause(),
  parentCenter(bigDownArrow(100)),
  importantBox(bluebold('Parameters'), parentCenter('$\\theta$ (local conditional probabilities)')),
_));

prose(
  'As with any learning algorithm, we start with the data.',
  'We will first consider the supervised setting,',
  'where each data point (example) is a complete assignment to all the variables in the Bayesian network.',
  _,
  'We will first develop the learning algorithm intuitively on some simple examples.',
  'Later, we will provide the algorithm for the general case and a formal justification based on maximum likelihood.',
_);

add(slide('Example: one variable',
  stmt('Setup'),
  bulletedText('One variable $R$ representing the rating of a movie $\\{1, 2, 3, 4, 5\\}$'),
  parentCenter(xtable(factorNode('$R$'), '$\\P(R = r) = p(r)$').center().margin(40)),
  pause(),
  stmt('Parameters'),
  parentCenter('$\\theta = (p(1), p(2), p(3), p(4), p(5))$'),
  pause(),
  stmt('Training data'),
  parentCenter('$\\Train = \\{ 1, 3, 4, 4, 4, 4, 4, 5, 5, 5 \\}$'),
_));

prose(
  'Suppose you want to study how people rate movies.',
  'We will develop several Bayesian networks of increasing complexity,',
  'and show how to learn the parameters of these models.',
  '(Along the way, we\'ll also practice doing a bit of modeling.)',
  _,
  'Let\'s start with the world\'s simplest Bayesian network,',
  'which has just one variable representing the movie rating.',
  'Here, there are 5 parameters, each one representing the probability of a given rating.',
  _,
  '(Technically, there are only 4 parameters since the 5 numbers sum to 1 so knowing 4 of the 5 is enough.  But we will call it 5 for simplicity.)',
_);

add(slide('Example: one variable',
  stmt('Learning'),
  parentCenter('$\\Train \\quad \\Rightarrow \\quad \\theta$'),
  stmt('Intuition', '$p(r) \\propto \\text{number of occurrences of $r$ in $\\Train$}$'),
  pause(),
  stmt('Example'),
  parentCenter(ytable(
    '$\\Train = \\{ 1, 3, 4, 4, 4, 4, 4, 5, 5, 5 \\}$',
    downArrow(50).strokeWidth(5),
    xtable(
      text('$\\theta$:').orphan(true),
      stagger(
        frameBox(table(['$r$', '$\\text{count}(r)$'], [1, 1], [2, 0], [3, 1], [4, 5], [5, 3]).center().margin(20, 0)),
        frameBox(table(['$r$', '$p(r)$'], [1, 0.1], [2, '0.0'], [3, 0.1], [4, 0.5], [5, 0.3]).center().margin(20, 0)),
      _),
    _).scale(0.7).center().margin(10),
  _).center().margin(10)),
_));

prose(
  'Given the data, which consists of a set of ratings (the order doesn\'t matter here),',
  'the natural thing to do is to set each parameter $p(r)$ to be the empirical fraction of times that $r$ occurs in $\\Train$.',
_);

add(slide('Example: two variables',
  headerList('Variables',
    'Genre $G \\in \\{ \\text{drama}, \\text{comedy} \\}$',
    'Rating $R \\in \\{ 1, 2, 3, 4, 5 \\}$',
  _),
  pause(),
  parentCenter(xtable(
    overlay(xtable(
      g = factorNode('$G$'),
      r = factorNode('$R$'),
    _).margin(50), arrow(g, r)),
    text('$\\P(G = g, R = r) = p_G(g) p_R(r \\mid g)$').scale(0.9),
  _).margin(50).center()),
  pause(),
  train = '$\\Train = \\{ (\\text{d}, 4), (\\text{d}, 4), (\\text{d}, 5), (\\text{c}, 1), (\\text{c}, 5) \\}$',
  stmt('Parameters: $\\theta = (p_G, p_R)$'),
_));

prose(
  'Let\'s enrich the Bayesian network, since people don\'t rate movies completely randomly;',
  'the rating will depend on a number of factors, including the genre of the movie.',
  'This yields a two-variable Bayesian network.',
  _,
  'We now have two local conditional distributions, $p_G(g)$ and $p_R(r \\mid g)$,',
  'each consisting of a set of probabilities, one for each setting of the values.',
  _,
  'Note that we are explicitly using the subscript $G$ and $R$ to uniquely identify',
  'the local conditional distribution inside the parameters.',
  'In this case, we could just infer it from context, but when we talk about parameter sharing later,',
  'specifying the precise local conditional distribution will be important.',
  _,
  'There should be $2 + 2 \\cdot 5 = 12$ total parameters in this model.',
  '(Again technically there are $1 + 2 \\cdot 4 = 9$.).',
_);

add(slide('Example: two variables',
  parentCenter(xtable(
    overlay(xtable(
      g = factorNode('$G$'),
      r = factorNode('$R$'),
    _).margin(50), arrow(g, r)),
    text('$\\P(G = g, R = r) = p_G(g) p_R(r \\mid g)$').scale(0.9),
  _).margin(50).center()),
  parentCenter(train),
  stmt('Intuitive strategy',
    'Estimate each local conditional distribution ($p_G$ and $p_R$) separately', pause(),
    //'For each value of conditioned variable (e.g., $g$), estimate distribution over values of unconditioned variable (e.g., $r$)',
  _),
  pause(),
  parentCenter(xtable(
    text('$\\theta$:').orphan(true),
    stagger(
      frameBox(table(['$g$', '$\\text{count}_G(g)$'], ['d', '3'], ['c', '2']).center().margin(20, 0)),
      frameBox(table(['$g$', '$p_G(g)$'], ['d', '3/5'], ['c', '2/5']).center().margin(20, 0)),
    _),
    pause(),
    stagger(
      frameBox(table(['$g$', '$r$', '$\\text{count}_R(g, r)$'], ['d', 4, '2'], ['d', 5, '1'], ['c', 1, '1'], ['c', 5, '1']).center().margin(20, 0)),
      frameBox(table(['$g$', '$r$', '$p_R(r \\mid g)$'], ['d', 4, '2/3'], ['d', 5, '1/3'], ['c', 1, '1/2'], ['c', 5, '1/2']).center().margin(20, 0)),
    _),
  _).scale(0.7).center().margin(30)),
_));

prose(
  'To learn the parameters of this model,',
  'we can handle each local conditional distribution separately (this will be justified later).',
  'This leverages the modular structure of Bayesian networks.',
  _,
  'To estimate $p_G(g)$, we look at the data but just ignore the value of $r$.',
  'To estimate $p_R(r \\mid g)$, we go through each value of $g$ and estimate the probability for each $r$.',
  _,
  'Operationally, it\'s convenient to first keep the integer count for each local assignment,',
  'and then just normalize by the total count for each assignment.',
_);

add(slide('Example: v-structure',
  headerList('Variables',
    'Genre $G \\in \\{ \\text{drama}, \\text{comedy} \\}$',
    'Won award $A \\in \\{ 0, 1 \\}$',
    'Rating $R \\in \\{ 1, 2, 3, 4, 5 \\}$',
  _),
  pause(),
  parentCenter(xtable(
    overlay(ytable(
      xtable(g = factorNode('$G$'), a = factorNode('$A$')).margin(50),
      r = factorNode('$R$'),
    _).margin(50).center(), arrow(g, r), arrow(a, r)),
  _).margin(50).center()).scale(0.8),
  text('$\\P(G = g, A = a, R = r) = p_G(g) p_{A}(a) p_{R}(r \\mid g, a)$').scale(0.9),
  pause(),
  //parentCenter('[whiteboard]'),
  //Node: genre {c,d}
  //Node: award {0,1}
  //Rating: rating {1,2,3,4,5}
  //Data: d04 d04 d15 c11 c05
  // Note: winning award helps for drama, averages comedy
_));

add(slide('Example: v-structure',
  parentCenter(xtable(
    overlay(ytable(
      xtable(g = factorNode('$G$'), a = factorNode('$A$')).margin(50),
      r = factorNode('$R$'),
    _).margin(50).center(), arrow(g, r), arrow(a, r)),
  _).margin(50).center()).scale(0.8),
  //parentCenter(train),
  train = '$\\Train = \\{ (\\text{d}, 0, 3), (\\text{d}, 1, 5), (\\text{c}, 0, 1), (\\text{c}, 0, 5), (\\text{c}, 1, 4) \\}$',
  stmt('Parameters: $\\theta = (p_G, p_A, p_R)$'),
  pause(),
  parentCenter(xtable(
    text('$\\theta$:').orphan(true),
    stagger(
      frameBox(table(['$g$', '$\\text{count}_G(g)$'], ['d', '3'], ['c', '2']).center().margin(20, 0)),
      frameBox(table(['$g$', '$p_G(g)$'], ['d', '3/5'], ['c', '2/5']).center().margin(20, 0)),
    _),
    pause(),
    stagger(
      frameBox(table(['$a$', '$\\text{count}_A(a)$'], ['0', '3'], ['1', '2']).center().margin(20, 0)),
      frameBox(table(['$a$', '$p_A(a)$'], ['0', '3/5'], ['1', '2/5']).center().margin(20, 0)),
    _),
    pause(),
    stagger(
      frameBox(table(['$g$', '$a$', '$r$', '$\\text{count}_R(g, a, r)$'], ['d', 0, 3, 1], ['d', 1, 5, 1], ['c', 0, 1, 1], ['c', 0, 5, 1], ['c', 1, 5, 1]).center().margin(20, 0)),
      frameBox(table(['$g$', '$a$', '$r$', '$p_R(r \\mid g, a)$'], ['d', 0, 3, 1], ['d', 1, 5, 1], ['c', 0, 1, '1/2'], ['c', 0, 5, '1/2'], ['c', 1, 5, 1]).center().margin(20, 0)),
    _),
  _).scale(0.7).center().margin(30)),
_));

prose(
  'While probabilistic inference with V-structures was quite subtle,',
  'learning parameters for V-structures is really the same as any other Bayesian network structure.',
  'We just need to remember that the parameters include the conditional probabilities for each joint assignment to both parents.',
  _,
  'In this case, there are roughly $2 + 2 + (2 \\cdot 2 \\cdot 5) = 24$ parameters to set (or $18$ if you\'re more clever).',
  'Given the five data points though, most of these parameters will be zero',
  '(without smoothing, which we\'ll talk about later).',
_);

add(slide('Example: inverted-v structure',
  headerList('Variables',
    'Genre $G \\in \\{ \\text{drama}, \\text{comedy} \\}$',
    'Jim\'s rating $R_1 \\in \\{ 1, 2, 3, 4, 5 \\}$',
    'Martha\'s rating $R_2 \\in \\{ 1, 2, 3, 4, 5 \\}$',
  _),
  pause(),
  parentCenter(xtable(
    overlay(ytable(
      g = factorNode('$G$'),
      xtable(r1 = factorNode('$R_1$'), r2 = factorNode('$R_2$')).margin(50),
    _).margin(50).center(), arrow(g, r1), arrow(g, r2)),
  _).margin(50).center()).scale(0.8),
  text('$\\P(G = g, R_1 = r_1, R_2 = r_2) = p_G(g) p_{R_1}(r_1 \\mid g) p_{R_2}(r_2 \\mid g)$').scale(0.9),
  //Node: genre and rating nodes for two people, Jim and Martha
  //Two versions: no parameter sharing, parameter sharing
  //Data: d45 d44 d53 c12 c54
_));

add(slide('Example: inverted-v structure',
  parentCenter(xtable(
    overlay(ytable(
      g = factorNode('$G$'),
      xtable(r1 = factorNode('$R_1$'), r2 = factorNode('$R_2$')).margin(50),
    _).margin(50).center(), arrow(g, r1), arrow(g, r2)),
  _).margin(50).center()).scale(0.8),
  train = '$\\Train = \\{ (\\text{d}, 4, 5), (\\text{d}, 4, 4), (\\text{d}, 5, 3), (\\text{c}, 1, 2), (\\text{c}, 5, 4) \\}$',
  stmt('Parameters: $\\theta = (p_G, p_{R_1}, p_{R_2})$'),
  pause(),
  parentCenter(xtable(
    text('$\\theta$:').orphan(true),
    stagger(
      frameBox(table(['$g$', '$\\text{count}_G(g)$'], ['d', '3'], ['c', '2']).center().margin(20, 0)),
      frameBox(table(['$g$', '$p_G(g)$'], ['d', '3/5'], ['c', '2/5']).center().margin(20, 0)),
    _),
    pause(),
    stagger(
      frameBox(table(['$g$', '$r_1$', '$\\text{count}_{R_1}(g, r)$'], ['d', 4, 2], ['d', 5, 1], ['c', 1, 1], ['c', 5, 1]).center().margin(20, 0)),
      frameBox(table(['$g$', '$r_1$', '$p_{R_1}(r \\mid g)$'], ['d', 4, '2/3'], ['d', 5, '1/3'], ['c', 1, '1/2'], ['c', 5, '1/2']).center().margin(20, 0)),
    _),
    pause(),
    stagger(
      frameBox(table(['$g$', '$r_2$', '$\\text{count}_{R_2}(g, r)$'], ['d', 3, 1], ['d', 4, 1], ['d', 5, 1], ['c', 2, 1], ['c', 4, 1]).center().margin(20, 0)),
      frameBox(table(['$g$', '$r_2$', '$p_{R_2}(r \\mid g)$'], ['d', 3, '1/3'], ['d', 4, '1/3'], ['d', 5, '1/3'], ['c', 2, '1/2'], ['c', 4, '1/2']).center().margin(20, 0)),
    _),
  _).scale(0.7).center().margin(30)),
_));

prose(
  'Let\'s suppose now that you\'re trying to model two people\'s ratings, those of Jim and Martha.',
  'We can define a three-node Bayesian network.',
  _,
  'Learning the parameters in this way works the same as before.',
_);

add(slide('Example: inverted-v structure',
  parentCenter(xtable(
    overlay(ytable(
      g = factorNode('$G$'),
      xtable(r1 = factorNode('$R_1$'), r2 = factorNode('$R_2$')).margin(50),
    _).margin(50).center(), arrow(g, r1), arrow(g, r2)),
  _).margin(50).center()).scale(0.8),
  train = '$\\Train = \\{ (\\text{d}, 4, 5), (\\text{d}, 4, 4), (\\text{d}, 5, 3), (\\text{c}, 1, 2), (\\text{c}, 5, 4) \\}$',
  stmt('Parameters: $\\theta = (p_G, p_{R})$'),
  pause(),
  parentCenter(xtable(
    text('$\\theta$:').orphan(true),
    stagger(
      frameBox(table(['$g$', '$\\text{count}_G(g)$'], ['d', '3'], ['c', '2']).center().margin(20, 0)),
      frameBox(table(['$g$', '$p_G(g)$'], ['d', '3/5'], ['c', '2/5']).center().margin(20, 0)),
    _),
    pause(),
    stagger(
      frameBox(table(['$g$', '$r$', '$\\text{count}_{R}(g, r)$'], ['d', 3, 1], ['d', 4, 3], ['d', 5, 2], ['c', 1, 1], ['c', 2, 1], ['c', 4, 1], ['c', 5, 1]).center().margin(20, 0)),
      frameBox(table(['$g$', '$r$', '$p_{R}(r \\mid g)$'], ['d', 3, '1/6'], ['d', 4, '3/6'], ['d', 5, '2/6'], ['c', 1, '1/4'], ['c', 2, '1/4'], ['c', 4, '1/4'], ['c', 5, '1/4']).center().margin(20, 0)),
    _),
  _).scale(0.7).center().margin(30)),
_));

prose(
  'Recall that currently, every local conditional distribution is estimated separately.',
  'But this is non-ideal if some variables behave similarly',
  '(e.g., if Jim and Martha have similar movie tastes).',
  _,
  'In this case, it would make more sense to have one local conditional distribution.',
  'To perform estimation in this setup,',
  'we simply go through each example (e.g., (d, 4, 5)) and each variable, and increment the counts',
  'on the appropriate local conditional distribution',
  '(e.g., 1 for $p_G(\\vD)$, 1 for $p_R(4 \\mid \\vD)$, and 1 for $p_R(5 \\mid \\vD)$).',
  'Finally, we normalize the counts to get local conditional distributions.',
_);

add(slide('Parameter sharing',
  keyIdea('parameter sharing',
    'The local conditional distributions of different variables use the same parameters.',
  _),
  parentCenter(overlay(
    ytable(
      y = factorNode('$G$'),
      xtable(w1 = factorNode('$R_1$'), w2 = factorNode('$R_2$')).margin(50),
    _).margin(50).center(),
    arrow(y, w1),
    arrow(y, w2),
    moveLeftOf(py = frameBox(table(
      ['$g$', '$p_G(g)$'],
      ['c', '2/5'],
      ['d', '3/5'],
    _).ycenter().margin(20, 5)), y, 100).scale(0.8),
    moveRightOf(pw = frameBox(table(
      ['$g$', '$r$', '$p_R(r \\mid g)$'],
      //['d', '1', '0/6'],
      //['d', '2', '0/6'],
      ['d', '3', '1/6'],
      ['d', '4', '3/6'],
      ['d', '5', '2/6'],
      ['c', '1', '1/4'],
      ['c', '2', '1/4'],
      //['c', '3', '0/4'],
      ['c', '4', '1/4'],
      ['c', '5', '1/4'],
    _).ycenter().margin(20, 5)), y, 100).scale(0.7),
    arrow(py, y).dashed().color('red'),
    arrow(pw, w1).dashed().color('red'),
    arrow(pw, w2).dashed().color('red'),
  _)).scale(0.9),
  stmt('Result: more reliable estimates, less expressive'),
_));

prose(
  'This is the idea of <b>parameter sharing</b>.',
  'Think of each variable as being powered by a local conditional distribution (a table).',
  'Importantly, each table can drive multiple variables.',
  _,
  'Note that when we were talking about probabilistic inference,',
  'we didn\'t really care about where the conditional distributions came from,',
  'because we were just reading from them;',
  'it didn\'t matter whether $p(r_1 \\mid g)$ and $p(r_2 \\mid g)$ came from the same source.',
  'In learning, we have to write to those distributions, and where we write to matters.',
  'As an analogy, think of when passing by value and passing by reference yield the same answer.',
_);

add(slide('Example: Naive Bayes',
  headerList('Variables',
    'Genre $Y \\in \\{ \\text{comedy}, \\text{drama} \\}$',
    'Movie review (sequence of words): $W_1, \\dots, W_L$',
  _),
  parentCenter(naiveBayesModel({example: false})).scale(0.8),
  pause(),
  parentCenter(nowrapText('$\\displaystyle \\P(Y = y, W_1 = w_1, \\dots, W_L = w_L) = p_\\text{genre}(y) \\prod_{j=1}^L p_\\text{word}(w_j \\mid y)$')).scale(0.8),
  stmt('Parameters', '$\\theta = (p_\\text{genre}, p_\\text{word})$'),
_));

prose(
  'As an extension of the previous example,',
  'consider the popular Naive Bayes model, which can be used to model the contents of documents',
  '(say, movie reviews about comedies versus dramas).',
  'The model is said to be "naive" because all the words are assumed to be conditionally independent given class variable $Y$.',
  _,
  'In this model, there is a lot of parameter sharing: each word $W_j$ is generated from the same distribution $p_\\text{word}$.',
_);

add(quizSlide('bayes3-naiveBayes',
  'If $Y$ can take on $2$ values and each $W_j$ can take on $D$ values, how many parameters are there?',
_));

prose(
  'There are $L+1$ variables, but all but $Y$ are powered by the same local conditional distribution.',
  'We have $2$ parameters for $p_\\text{genre}$ and $2 D$ for $p_\\text{word}$, for a total of $2 + 2D = O(D)$.',
  'Importantly, due to parameter sharing, there is no dependence on $L$.',
_);

add(slide('Example: HMMs',
  headerList('Variables',
    '$H_1, \\dots, H_n$ (e.g., actual positions)',
    '$E_1, \\dots, E_n$ (e.g., sensor readings)',
  _).ymargin(0),
  parentCenter(hmm({maxTime: 5, condition: false})).scale(0.6),
  pause(),
  parentCenter('$\\displaystyle \\P(H = h, E = e) = p_\\text{start}(h_1) \\prod_{i=2}^n p_\\text{trans}(h_i \\mid h_{i-1}) \\prod_{i=1}^n p_\\text{emit}(e_i \\mid h_i)$').scale(0.8),
  pause(),
  stmt('Parameters', '$\\theta = (p_\\text{start}, p_\\text{trans}, p_\\text{emit})$'),
  pause(),
  '$\\Train$ is a set of full assignments to $(H, E)$',
_));

prose(
  'The HMM is another model, which we saw was useful for object tracking.',
  _,
  'With $K$ possible hidden states (values that $H_t$ can take on) and $D$ possible observations,',
  'the HMM has $K^2$ transition parameters and $KD$ emission parameters.',
_);

add(slide('General case',
  stmt('Bayesian network', 'variables $X_1, \\dots, X_n$'),
  pause(),
  stmt('Parameters', 'collection of distributions $\\theta = \\{ p_d : d \\in D \\}$ (e.g., $D = \\{ \\text{start}, \\text{trans}, \\text{emit} \\}$)'),
  pause(),
  'Each variable $X_i$ is generated from distribution $p_{d_i}$:',
  parentCenter('$\\displaystyle \\P(X_1 = x_1, \\dots, X_n = x_n) = \\prod_{i=1}^n p_\\red{d_i}(x_i \\mid x_{\\Parents(i)})$'),
  pause(),
  stmt('Parameter sharing: $d_i$ could be same for multiple $i$'),
_));

prose(
  'Now let\'s consider how to learn the parameters of an arbitrary Bayesian network with arbitrary parameter sharing.',
  'You should already have the basic intuitions; the next few slides will just be able expressing these intuitions',
  'in full generality.',
  _,
  'The parameters of a general Bayesian network include a set of local conditional distributions indexed by $d \\in D$.',
  'Note that many variables can be powered by the same $d \\in D$.',
_);

add(slide('General case: learning algorithm',
  stmt('Input', 'training examples $\\Train$ of full assignments'),
  stmt('Output', 'parameters $\\theta = \\{ p_d : d \\in D \\}$'),
  pause(),
  algorithm('maximum likelihood for Bayesian networks',
    //'For each distribution $d \\in D$:', pause(),
    stmt('Count'.bold()),
    indent('For each $x \\in \\Train$:'),
    indent('For each variable $x_i$:', 40),
    indent('Increment $\\text{count}_{d_i}(x_{\\Parents(i)}, x_i)$', 60),
    pause(),
    stmt('Normalize'.bold()),
    indent('For each $d$ and local assignment $x_{\\Parents(i)}$:'),
    indent('Set $\\red{p_d(x_i \\mid x_{\\Parents(i)})} \\propto \\text{count}_d(x_{\\Parents(i)}, x_i)$', 40),
  _).scale(0.8),
_));

prose(
  'Estimating the parameters is a straightforward generalization.',
  'For each distribution, we go over all the training data, keeping track of the number of times each local assignment occurs.',
  'These counts are then normalized to form the final parameter estimates.',
_);

add(slide('Maximum likelihood',
  stmt('Maximum likelihood objective'),
  parentCenter('$\\displaystyle \\max_\\theta \\prod_{x \\in \\Train} \\P(X = x; \\theta)$'),
  pause(),
  'Algorithm on previous slide exactly computes maximum likelihood parameters (closed form solution).',
  //stmt('Solution: can take logs, use Lagrange multipliers, and solve for the best $\\theta$'),
_));

prose(
  'So far, we\'ve presented the count-and-normalize algorithm,',
  'and hopefully this seems to you like a reasonable thing to do.',
  'But what\'s the underlying principle?',
  _,
  'It can be shown that the algorithm that we\'ve been using is no more than a closed form solution to the <b>maximum likelihood</b> objective,',
  'which says we should try to find $\\theta$ to maximize the probability of the training examples.',
_);

add(slide('Maximum likelihood',
  train = '$\\Train = \\{ (\\text{d}, 4), (\\text{d}, 5), (\\text{c}, 5) \\}$',
  //parentCenter(stagger(
    //nowrapText('$\\displaystyle \\prod_{x \\in \\Train} \\P(X = x; \\theta) = \\red{p_G(\\text{d})} \\blue{p_R(4 \\mid \\text{d})} \\red{p_G(\\text{d})} \\blue{p_R(5 \\mid \\text{d})} \\red{p_G(\\text{c})} \\green{p_R(5 \\mid \\text{c})}$').scale(0.8),
  //_)),
  //pause(),
  parentCenter(stagger(
    nowrapText('$\\displaystyle \\max_{\\theta} \\prod_{x \\in \\Train} \\P(X = x; \\theta)$'),
    nowrapText('$\\displaystyle \\max_{p_G(\\cdot), p_R(\\cdot \\mid \\text{c}), p_R(\\cdot \\mid \\text{d})} (\\red{p_G(\\text{d})} \\blue{p_R(4 \\mid \\text{d})} \\red{p_G(\\text{d})} \\blue{p_R(5 \\mid \\text{d})} \\red{p_G(\\text{c})} \\green{p_R(5 \\mid \\text{c})})$').scale(0.8),
    nowrapText('$\\displaystyle \\max_{p_G(\\cdot)} (\\red{p_G(\\text{d})} \\red{p_G(\\text{d})} \\red{p_G(\\text{c})}) \\max_{p_R(\\cdot \\mid \\text{c})} \\green{p_R(5 \\mid \\text{c})} \\max_{p_R(\\cdot \\mid \\text{d})} (\\blue{p_R(4 \\mid \\text{d})} \\blue{p_R(5 \\mid \\text{d})})$').scale(0.8),
    //nowrapText('$\\displaystyle \\log \\prod_{x \\in \\Train} \\P(X = x; \\theta) = \\log(\\red{p_G(\\text{d})} \\blue{p_R(4 \\mid \\text{d})} \\red{p_G(\\text{d})} \\blue{p_R(5 \\mid \\text{d})} \\red{p_G(\\text{c})} \\green{p_R(5 \\mid \\text{c})})$').scale(0.7),
    //nowrapText('$\\displaystyle \\sum_{x \\in \\Train} \\log \\P(X = x; \\theta) = \\log \\red{p_G(\\text{d})} + \\log \\blue{p_R(4 \\mid \\text{d})} + \\log \\red{p_G(\\text{d})} + \\log \\blue{p_R(5 \\mid \\text{d})} + \\log \\red{p_G(\\text{c})} + \\log \\green{p_R(5 \\mid \\text{c})})$').scale(0.5),
  _)),
  pause(),
  bulletedText(stmt('Key: decomposes into subproblems, one for each distribution $d$ and assignment $x_{\\Parents}$')),
  bulletedText('For each subproblem, solve in closed form (Lagrange multipliers for sum-to-1 constraint)'),
  //stmt('Solution: can take logs, use Lagrange multipliers, and solve for the best $\\theta$'),
_));

prose(
  'We won\'t go through the math, but from the small example, it\'s clear we can switch the order of the factors.',
  _,
  'Notice that the problem decomposes into several independent pieces',
  '(one for each conditional probability distribution $d$ and assignment to the parents).',
  _,
  'Each such subproblem can be solved easily (using the solution from the foundations homework).',
_);

////////////////////////////////////////////////////////////
// Smoothing
roadmap(1);

add(slide('Scenario 1',
  headerList('Setup',
    'You have a coin with an unknown probability of heads $p(\\text{H})$.',
    'You flip it 100 times, resulting in 23 heads, 77 tails.',
    'What is estimate of $p(\\text{H})$?',
  _),
  pause(),
  stmt('Maximum likelihood estimate'),
  parentCenter('$p(\\text{H}) = 0.23 \\quad p(\\text{T}) = 0.77$'),
_));

prose(
  'Having established the basic learning algorithm for maximum likelihood,',
  'let\'s try to stress test it a bit.',
  _,
  'Just to review, the maximum likelihood estimate in this case is what we would expect and seems quite reasonable.',
_);

add(slide('Scenario 2',
  headerList('Setup',
    'You flip a coin once and get heads.',
    'What is estimate of $p(\\text{H})$?',
  _),
  pause(),
  stmt('Maximum likelihood estimate'),
  parentCenter('$p(\\text{H}) = 1 \\quad p(\\text{T}) = 0$'),
  pause(),
  stmt('Intuition', 'This is a bad estimate; real $p(\\text{H})$ should be closer to half'),
  pause(),
  'When have less data, maximum likelihood overfits, want a more reasonable estimate...',
_));

prose(
  'However, if we had just one data point, maximum likelihood places probability $1$ on heads,',
  'which is a horrible idea.  It\'s a very close-minded thing to do: just because we didn\'t see something',
  'doesn\'t mean it can\'t exist!',
  _,
  'This is an example of overfitting.  If we had millions of parameters and only thousands of data points (which is not enough data),',
  'maximum likelihood would surely put 0 in many of the parameters.',
_);

add(slide('Regularization: Laplace smoothing',
  stmt('Maximum likelihood'),
  parentCenter('$p(\\text{H}) = \\frac{1}{1} \\quad p(\\text{T}) = \\frac{0}{1}$'), pause(),
  stmt('Maximum likelihood with Laplace smoothing'),
  parentCenter('$p(\\text{H}) = \\frac{1 + \\red{1}}{1 + \\red{2}} = \\frac23 \\quad p(\\text{T}) = \\frac{0 + \\red{1}}{1 + \\red{2}} = \\frac13$'),
_));

prose(
  'There is a very simple fix to this called <b>Laplace smoothing</b>:',
  'just add $1$ to the count for each possible value, regardless of whether it was observed or not.',
  _,
  'Here, both heads and tails get an extra count of 1.',
_);

add(slide('Example: two variables',
  train,
  stmt('Amount of smoothing: $\\lambda = 1$'),
  pause(),
  parentCenter(xtable(
    text('$\\theta$:').orphan(true),
    stagger(
      frameBox(table(['$g$', '$\\text{count}_G(g)$'], ['d', '1'], ['c', '1']).center().margin(20, 0)),
      frameBox(table(['$g$', '$\\text{count}_G(g)$'], ['d', '1+2'], ['c', '1+1']).center().margin(20, 0)),
      frameBox(table(['$g$', '$p_G(g)$'], ['d', '3/5'], ['c', '2/5']).center().margin(20, 0)),
    _),
    pause(),
    stagger(
      frameBox(table(
        ['$g$', '$r$', '$\\text{count}_R(g, r)$'],
        ['d', 1, '1'],
        ['d', 2, '1'],
        ['d', 3, '1'],
        ['d', 4, '1'],
        ['d', 5, '1'],
        ['c', 1, '1'],
        ['c', 2, '1'],
        ['c', 3, '1'],
        ['c', 4, '1'],
        ['c', 5, '1'],
      _).center().margin(20, 0)),
      frameBox(table(
        ['$g$', '$r$', '$\\text{count}_R(g, r)$'],
        ['d', 1, '1'],
        ['d', 2, '1'],
        ['d', 3, '1'],
        ['d', 4, '1+1'],
        ['d', 5, '1+1'],
        ['c', 1, '1'],
        ['c', 2, '1'],
        ['c', 3, '1'],
        ['c', 4, '1'],
        ['c', 5, '1+1'],
      _).center().margin(20, 0)),
      frameBox(table(
        ['$g$', '$r$', '$p_R(r \\mid g)$'],
        ['d', 1, '1/7'],
        ['d', 2, '1/7'],
        ['d', 3, '1/7'],
        ['d', 4, '2/7'],
        ['d', 5, '2/7'],
        ['c', 1, '1/6'],
        ['c', 2, '1/6'],
        ['c', 3, '1/6'],
        ['c', 4, '1/6'],
        ['c', 5, '2/6'],
      _).center().margin(20, 0)),
    _),
  _).scale(0.7).center().margin(30)),
_));

prose(
  'As a concrete example, let\'s revisit the two-variable model from before.',
  _,
  'For example, d occurs 3 times, but ends up at 4 due to adding $\\lambda = 1$.',
  'In particular, many values which were never observed in the data have positive probability as desired.',
_);

add(slide('Regularization: Laplace smoothing',
  keyIdea('Laplace smoothing',
    'For each distribution $d$ and partial assignment $(x_{\\Parents(i)}, x_i)$, add $\\lambda$ to $\\text{count}_d(x_{\\Parents(i)}, x_i)$.',
    'Then normalize to get probability estimates.',
  _),
  stmt('Interpretation: hallucinate $\\lambda$ occurrences of each local assignment'),
  'Larger $\\lambda$ $\\Rightarrow$ more smoothing $\\Rightarrow$ probabilities closer to uniform.',
  //'Analogous to regularization for learning predictors.',
  pause(),
  stmt('Data wins out in the end'),
  parentCenter('$p(\\text{H}) = \\frac{1 + \\red{1}}{1 + \\red{2}} = \\frac23 \\quad p(\\text{H}) = \\frac{998 + \\red{1}}{998 + \\red{2}} = 0.999$'),
_));

prose(
  'More generally, we can add a number $\\lambda > 0$ (sometimes called a <b>pseudocount</b>)',
  'to the count for each distribution $d$ and local assignment $(x_{\\Parents(i)}, x_i)$.',
  _,
  'By varying $\\lambda$, we can control how much we are smoothing.',
  _,
  'No matter what the value of $\\lambda$, as we get more and more data, the effect of $\\lambda$ will diminish.',
  'This is desirable, since if we have a lot of data, we should be able to trust our data more.',
_);

////////////////////////////////////////////////////////////
// EM

roadmap(2);

add(slide('Motivation',
  /*headerList('Variables',
    'Genre $G \\in \\{ \\text{drama}, \\text{comedy} \\}$',
    'Jim\'s rating $R_1 \\in \\{ 1, 2, 3, 4, 5 \\}$',
    'Martha\'s rating $R_2 \\in \\{ 1, 2, 3, 4, 5 \\}$',
  _),
  pause(),*/
  parentCenter(xtable(
    overlay(ytable(
      g = factorNode('$G$'),
      xtable(r1 = factorNode('$R_1$', {color: 'gray'}), r2 = factorNode('$R_2$', {color: 'gray'})).margin(50),
    _).margin(50).center(), arrow(g, r1), arrow(g, r2)),
  _).margin(50).center()).scale(0.8),
  //text('$\\P(G = g, R_1 = r_1, R_2 = r_2) = p_G(g) p_{R_1}(r_1 \\mid g) p_{R_2}(r_2 \\mid g)$').scale(0.9),
  pause(),
  'What if we '+redbold('don\'t observe')+' some of the variables?',
  train = '$\\Train = \\{ (\\red{?}, 4, 5), (\\red{?}, 4, 4), (\\red{?}, 5, 3), (\\red{?}, 1, 2), (\\red{?}, 5, 4) \\}$',
_));

prose(
  'Data collection is hard, and often we don\'t observe the value of every single variable.',
  'In this example, we only see the ratings $(R_1, R_2)$, but not the genre $G$.',
  'Can we learn in this setting, which is clearly more difficult?',
  _,
  'Intuitively, it might seem hopeless. After all, how can we ever learn anything about the relationship between',
  '$G$ and $R_1$ if we never observe $G$ at all?',
  _,
  'Indeed, if we don\'t observe enough of the variables, we won\'t be able to learn anything.',
  'But in many cases, we can.',
_);

add(slide('Maximum marginal likelihood',
  stmt('Variables: $H$ is hidden, $E = e$ is observed'),
  stmt('Example'),
  parentCenter(xtable(
    overlay(ytable(
      g = factorNode('$G$'),
      xtable(r1 = factorNode('$R_1$', {color: 'gray'}), r2 = factorNode('$R_2$', {color: 'gray'})).margin(50),
    _).margin(50).center(), arrow(g, r1), arrow(g, r2)),
    ytable(
      '$H = G \\quad E = (R_1, R_2) \\quad e = (4,5)$',
      '$\\theta = (p_G, p_R)$',
    _),
  _).margin(50).center()).scale(0.8),
  pause(),
  stmt('Maximum marginal likelihood objective'),
  parentCenter(table(
    [nowrapText('$\\,\\,\\,\\,\\,\\,\\,\\displaystyle \\max_\\theta \\prod_{e \\in \\Train} \\P(E = e; \\theta)$')], pause(),
    [nowrapText('$= \\displaystyle \\max_\\theta \\prod_{e \\in \\Train} \\sum_h \\P(H = h, E = e; \\theta)$')],
  _).ycenter().margin(10)),
  //pause(),
  //bulletedText('EM increases objective function at each iteration'),
  //bulletedText('EM converges to local optima, need to restart multiple times'),
_));

prose(
  'Let\'s try to solve this problem top-down &mdash; what do we want, mathematically?',
  _,
  'Formally, we have a set of hidden variables $H$ and observed variables $E$ and parameters $\\theta$ which define all the local conditional distributions.',
  'We observe $E = e$, but we don\'t know $H$ or $\\theta$.',
  _,
  'If there were no hidden variables, then we would just use maximum likelihood:',
  '$\\max_\\theta \\prod_{(h, e) \\in \\Train} \\P(H = h, E = e; \\theta)$.',
  'But since $H$ is unobserved, we can simply replace the joint probability $\\P(H = h, E = e; \\theta)$ with the marginal probability $\\P(E = e; \\theta)$,',
  'which is just a sum over values $h$ that the hidden variables $H$ could take on.',
_);

add(slide('Expectation Maximization (EM)',
  stmt('Inspiration: K-means'),
  stmt('Variables: $H$ is hidden, $E$ is observed (to be $e$)'),
  pause(),
  algorithm('Expectation Maximization (EM)',
    pause(),
    stmt('E-step'),
    bulletedText('Compute $q(h) = \\P(H = h \\mid E = e; \\theta)$ for each $h$ (use any probabilistic inference algorithm)'),
    bulletedText('Create weighted points: $(h, e)$ with weight $q(h)$'),
    pause(),
    stmt('M-step'),
    bulletedText('Compute maximum likelihood (just count and normalize) to get $\\theta$'),
    pause(),
    'Repeat until convergence.',
  _),
_));

prose(
  'One of the most remarkable algorithms, Expectation Maximization (EM), tries to maximize the marginal likelihood.',
  _,
  'To get intuition for EM, consider K-means, which turns out to be a special case of EM (for Gaussian mixture models with variance tending to $0$).',
  'In K-means, we had to somehow estimate the cluster centers, but we didn\'t know which points were assigned to which clusters.',
  'And in that setting, we took an alternating optimization approach: find the best cluster assignment given the current cluster centers, find the best cluster centers given the assignments, etc.',
  _,
  'The EM algorithm works analogously.',
  'EM consists of alternating between two steps, the E-step and the M-step.',
  'In the E-step, we don\'t know what the hidden variables are,',
  'so we compute the posterior distribution over them given our current parameters $(\\P(H \\mid E = e; \\theta)).$',
  'This can be done using any probabilistic inference algorithm.',
  'If $H$ takes on a few values, then we can enumerate over all of them.',
  'If $\\P(H,E)$ is defined by an HMM, we can use the forward-backward algorithm.',
  'These posterior distributions provide a weight $q(h)$ (which is a temporary variable in the EM algorithm) to every value $h$ that $H$ could take on.',
  'Conceptually, the E-step then generates a set of weighted full assignments $(h, e)$ with weight $q(h)$.',
  '(In implementation, we don\'t need to create the data points explicitly.)',
  _,
  'In the M-step, we take in our set of full assignments $(h, e)$ with weights,',
  'and we just do maximum likelihood estimation,',
  'which can be done in closed form &mdash; just counting and normalizing (perhaps with smoothing if you want)!',
  _,
  'If we repeat the E-step and the M-step over and over again, we are guaranteed to converge to a <b>local optima</b>.',
  'Just like the K-means algorithm, we might need to run the algorithm from different random initializations of $\\theta$ and take the best one.',
_);

add(slide('Example: one iteration of EM',
  parentCenter(xtable(
    overlay(ytable(
      g = factorNode('$G$'),
      xtable(r1 = factorNode('$R_1$'), r2 = factorNode('$R_2$')).margin(50),
    _).margin(50).center(), arrow(g, r1), arrow(g, r2)),
    train = '$\\Train = \\{ (\\red{?}, 2, 2), (\\red{?}, 1, 2) \\}$',
  _).margin(50).center()).scale(0.8),
  pause(),
  overlay(
    table([
      xtable(
        '$\\theta$:',
        frameBox(table(
          ['$g$', '$p_G(g)$'],
          ['c', 0.5],
          ['d', 0.5],
        _).ycenter().margin(15, 5)),
        frameBox(table(
          ['$g$', '$r$', '$p_R(r \\mid g)$'],
          ['c', 1, 0.4],
          ['c', 2, 0.6],
          ['d', 1, 0.6],
          ['d', 2, 0.4],
        _).ycenter().margin(15, 5)),
      _).center().margin(10),
      pause(),
      eArrow = bigRightArrow(80),
      frameBox(table(
        ['$(r_1, r_2)$', '$g$', '$\\P(G=g,R_1=r_1,R_2=r_2)$', '$q(g)$'],
        ['(2, 2)', 'c', '$0.5 \\cdot 0.6 \\cdot 0.6$', '$\\frac{0.18}{0.18+0.08} = 0.69$'],
        ['(2, 2)', 'd', '$0.5 \\cdot 0.4 \\cdot 0.4$', '$\\frac{0.08}{0.18+0.08} = 0.31$'],
        ['(1, 2)', 'c', '$0.5 \\cdot 0.4 \\cdot 0.6$', '$\\frac{0.12}{0.12+0.12} = 0.5$'],
        ['(1, 2)', 'd', '$0.5 \\cdot 0.6 \\cdot 0.4$', '$\\frac{0.12}{0.12+0.12} = 0.5$'],
      _).ycenter().margin(15, 5)),
    _], [
      nil(),
      pause(),
      mArrow = bigRightArrow(80),
      xtable(
        '$\\theta$:',
        frameBox(table(
          ['$g$', 'count', '$p_G(g)$'],
          ['c', '0.69 + 0.5', 0.59],
          ['d', '0.31 + 0.5', 0.41],
        _).ycenter().margin(15, 5)),
        frameBox(table(
          ['$g$', '$r$', 'count', '$p_R(r \\mid g)$'],
          ['c', 1, 0.5, 0.21],
          ['c', 2, '0.5 + 0.69 + 0.69', 0.79],
          ['d', 1, 0.5, 0.31],
          ['d', 2, '0.5 + 0.31 + 0.31', 0.69],
        _).ycenter().margin(15, 5)),
      _).center().margin(10),
    _]).ycenter().margin(10).scale(0.57),
    pause(-1),
    moveTopOf(text('E-step').scale(0.65), eArrow),
    pause(),
    moveTopOf(text('M-step').scale(0.65), mArrow),
  _),
_));

prose(
  'In the E-step, we are presented with the current set of parameters $\\theta$.',
  'We go through all the examples (in this case $(2,2)$ and $(1,2)$).',
  'For each example $(r_1,r_2)$, we will consider all possible values of $g$ (c or d),',
  'and compute the posterior distribution $q(g) = \\P(G = g \\mid R_1 = r_1, R_2 = r_2)$.',
  _,
  'The easiest way to do this is to write down the joint probability $\\P(G = g, R_1 = r_1, R_2 = r_2)$ because',
  'this is just simply a product of the parameters.',
  'For example, the first line is the product of $p_G(\\vC) = 0.5$, $p_R(2 \\mid \\vC) = 0.6$ for $r_1 = 2$,',
  'and $p_R(2 \\mid \\vC) = 0.6$ for $r_2 = 2$.',
  'For each example $(r_1, r_2)$, we normalize these joint probability to get $q(g)$.',
  _,
  'Now each row consists of a fictitious data point with $g$ filled in,',
  'but appropriately weighted according to the corresponding $q(g)$,',
  'which is based on what we currently believe about $g.$',
  _,
  'In the M-step, for each of the parameters (e.g., $p_G(\\vC)$),',
  'we simply add up the weighted number of times that parameter was used in the data',
  '(e.g., 0.69 for (c, 2, 2) and 0.5 for (c, 1, 2)).',
  'Then we normalize these counts to get probabilities.',
  _,
  'If we compare the old parameters and new parameters after one round of EM,',
  'you\'ll notice that parameters tend to sharpen (though not always):',
  'probabilities tend to move towards 0 or 1.',
_);

add(slide('Application: decipherment',
  stmt('Copiale cipher (105-page encrypted volume from 1730s)'),
  parentCenter(xtable(
    image('images/copiale-cipher.png'),
    image('images/copiale-cipher-closeup.jpg').width(300),
  _).margin(10)),
_));

prose(
  'Let\'s now look at an interesting potential application of EM (or Bayesian networks in general):',
  'decipherment.',
  'Given a ciphertext (a string), how can we decipher it?',
  _,
  'The Copiale cipher was deciphered in 2011 (it turned out to be the handbook of a German secret society),',
  'largely with the help of Kevin Knight.',
  'On a related note, he has been quite interested in using probabilistic models (learned with variants of EM) for decipherment.',
  'Real ciphers are a bit too complex, so we will focus on the simple case of substitution ciphers.',
_);

add(slide('Substitution ciphers',
  stmt('Letter substitution table (unknown)'),
  parentCenter(frameBox(table(
    ['Plain:', tt('abcdefghijklmnopqrstuvwxyz')],
    ['Cipher:', tt('plokmijnuhbygvtfcrdxeszaqw')],
  _).margin(10, 5))),
  pause(),
  parentCenter(table(
    ['Plaintext (unknown):', tt('hello world')],
    ['Ciphertext (known):', red(tt('nmyyt ztryk'))],
  _).margin(10, 5)),
_));

prose(
  'The input to decipherment is a ciphertext.',
  'Let\'s put on our modeling hats and think about how this ciphertext came to be.',
  _,
  'Most ciphers are quite complicated, so let\'s consider a simple substitution cipher.',
  'Someone comes up with a permutation of the letters (e.g., "a" maps to "p").',
  'You can think about these as the unknown parameters of the model.',
  'Then they think of something to say &mdash; the plaintext (e.g., "hello world").',
  'Finally, they apply the substitution table to generate the ciphertext (deterministically).',
_);

add(slide('Application: decipherment as an HMM',
  headerList('Variables',
    '$H_1, \\dots, H_n$ (e.g., characters of plaintext)',
    '$E_1, \\dots, E_n$ (e.g., characters of ciphertext)',
  _).ymargin(0),
  parentCenter(hmm({maxTime: 5, condition: true})).scale(0.6),
  pause(),
  parentCenter('$\\displaystyle \\P(H = h, E = e) = p_\\text{start}(h_1) \\prod_{i=2}^n p_\\text{trans}(h_i \\mid h_{i-1}) \\prod_{i=1}^n p_\\text{emit}(e_i \\mid h_i)$').scale(0.8),
  pause(),
  stmt('Parameters', '$\\theta = (p_\\text{start}, p_\\text{trans}, p_\\text{emit})$'),
_));

prose(
  'We can formalize this process as an HMM as follows.',
  'The hidden variables are the plaintext and the observations are the ciphertext.',
  'Each character of the plaintext is related to the corresponding character in the ciphertext based on the cipher,',
  'and the transitions encode the fact that the characters in English are highly dependent on each other.',
  'For simplicity, we use a character-level bigram model (though $n$-gram models would yield better results).',
_);

add(slide('Application: decipherment as an HMM',
  parentCenter(hmm({maxTime: 5, condition: true})).scale(0.6),
  headerList('Strategy',
    '$p_\\text{start}$: set to uniform',
    '$p_\\text{trans}$: estimate on tons of English text',
    '$p_\\text{emit}$: <b>substitution table</b>, from EM',
  _),
  stmt('Intuition: rely on language model ($p_\\text{trans}$) to favor plaintexts $h$ that look like English'),
_));

prose(
  'We need to specify how we estimate the starting probabilities $p_\\text{start}$',
  'the transition probabilities $p_\\text{trans}$, and the emission probabilities $p_\\text{emit}$.',
  _,
  'The <b>starting probabilities</b> we won\'t care about so much and just set to a uniform distribution.',
  _,
  'The <b>transition probabilities</b> specify how someone might have generated the plaintext.',
  'We can estimate $p_\\text{trans}$ on a large corpora of English text.',
  'Note we need not use the same data to estimate all the parameters of the model.',
  'Indeed, there is generally much more English plaintext lying around than ciphertext.',
  _,
  'The <b>emission probabilities</b> encode the substitution table.',
  'Here, we know that the substitution table is deterministic,',
  'but we let the parameters be general distributions,',
  'which can certainly encode deterministic functions',
  '(e.g., $p_\\text{emit}(\\text{p} \\mid \\text{a}) = 1$).',
  'We use EM to only estimate the emission probabilities.',
  _,
  'We emphasize that the principal difficulty here is that we neither know the ciphertext nor the parameters!',
_);

add(slide('Application: decipherment as an HMM',
  parentCenter(hmm({maxTime: 5, condition: true})).scale(0.6),
  stmt('E-step: forward-backward algorithm computes'),
  parentCenter('$q_i(h) \\eqdef \\P(H_i = h \\mid E_1 = e_1, \\dots E_n = e_n)$'),
  pause(),
  stmt('M-step: count (fractional) and normalize'),
  parentCenter('$\\text{count}_\\text{emit}(h, e) = \\sum_{i=1}^n q_i(h) \\cdot [e_i = e]$'),
  parentCenter('$p_\\text{emit}(e \\mid h) \\propto \\text{count}_\\text{emit}(h, e)$'),
  pause(),
  parentCenter(linkToVideo('[semi-live solution]','bayes3.mp4')),
_));

prose(
  'Let\'s focus on the EM algorithm for estimating the emission probabilities.',
  'In the E-step, we can use the forward-backward algorithm to compute the posterior distribution over hidden assignments $\\P(H \\mid E = e)$.',
  'More precisely, the algorithm returns $q_i(h) \\eqdef \\P(H_i = h \\mid E = e)$',
  'for each position $i = 1, \\dots, n$ and possible hidden state $h$.',
  _,
  'We can use $q_i(h)$ as fractional counts of each $H_i$.',
  'To compute the counts $\\text{count}_\\text{emit}(h, e)$,',
  'we loop over all the positions $i$ where $E_i = e$ and add the fractional count $q_i(h)$.',
  _,
  'As you can see from the demo, the result isn\'t perfect,',
  'but not bad given the difficulty of the problem and the simplicity of the approach.',
_);

add(summarySlide('Summary',
  parentCenter(overlay(
    ytable(
      frameBox('(Bayesian network without parameters) + training examples'),
      pause(),
      a = downArrow(150).strokeWidth(10).color('blue'),
      xtable(
        pause(),
        text('$Q \\mid E \\Rightarrow$').orphan(true),
        pause(-1),
        frameBox(ytable('Parameters $\\theta$', '(of Bayesian network)').center()),
        pause(),
        ytable(
          '$\\Rightarrow \\P(Q \\mid E; \\theta)$',
        _).orphan(true),
        pause(-1),
      _).center().margin(10),
    _).center().margin(50),
    moveCenterOf(opaquebg('<b>Learning</b>: maximum likelihood (+Laplace smoothing, +EM)'), a),
  _)),
_));

initializeLecture();
