G = sfig.serverSide ? global : this;
G.prez = presentation();

add(titleSlide('Lecture 7: MDPs I',
  nil(),
  parentCenter(image('images/moving-dice.jpg').width(300)),
_));

// bike - flat tire, Caltrain - delayed, drive - traffic
add(quizSlide('mdp1-start',
  'How would you get to Mountain View on Friday night in the least amount of time?',
  'bike',
  'drive',
  'Caltrain',
  'Uber/Lyft',
  'fly',
_));

evolutionOfModels(9, 'Markov decision processes');

var graph = {edges: 'S A 1|A D 3|D C 2|S B 2|A B 5|C E 3|E F 2|F G 1|E G 7'.split('|'), initRandom: 5, maxHeight: 200, labelScale: 0.8, labelColor: 'red', highlightNodes: 'S G', directed: true};
add(slide('So far: search problems',
  parentCenter(nodeEdgeGraph(graph)),
  parentCenter(overlay(
    xtable('state $s$, action $a$', a = rightArrow(250).strokeWidth(5), 'state $\\Succ(s, a)$').margin(20).center(),
    moveTopOf(bluebold('deterministic'), a),
  _)),
  parentCenter(image('images/driving-car.jpg').width(200)),
_));

prose(
  'Last week, we looked at search problems, a powerful paradigm that can be used to solve',
  'a diverse range of problems ranging from word segmentation to package delivery to route finding.',
  'The key was to cast whatever problem we were interested in solving into the problem of finding the minimum cost path in a graph.',
  _,
  'However, search problems assume that taking an action $a$ from a state $s$ results <b>deterministically</b> in a unique successor state $\\Succ(s, a)$.',
_);

add(slide('Uncertainty in the real world',
  parentCenter(overlay(
    xtable(s = text('state $s$, action $a$'), redbold('random'), ytable(s1 = text('state $s\'_1$'), s2 = text('state $s\'_2$')).margin(100)).margin(100).center(),
    arrow([s.right().add(10), s.ymiddle()], [s1.left().sub(10), s1.ymiddle()]).strokeWidth(5),
    arrow([s.right().add(10), s.ymiddle()], [s2.left().sub(10), s2.ymiddle()]).strokeWidth(5),
  _)),
  parentCenter(image('images/traffic-jam.jpg').width(300)),
_));

prose(
  'In the real world, the deterministic successor assumption is often unrealistic,',
  'for there is <b>randomness</b>: taking an action might lead to any one of many possible states.',
  _,
  'One deep question here is how we can even hope to act optimally in the face of randomness?',
  'Certainly we can\'t just have a single deterministic plan, and talking about a minimum cost path doesn\'t make sense.',
  _,
  'Today, we will develop tools to tackle this more challenging setting.',
  'We will fortunately still be able to reuse many of the intuitions about search problems,',
  'in particular the notion of a state.',
_);

add(slide('Applications',
  side(
    stmt('Robotics', 'decide where to move, but actuators can fail, hit unseen obstacles, etc.'),
    image('images/robot-grasping.jpg'),
  _),
  pause(),
  side(
    stmt('Resource allocation', 'decide what to produce, don\'t know the customer demand for various products'),
    image('images/factory.jpg'),
  _),
  pause(),
  side(
    stmt('Agriculture', 'decide what to plant, but don\'t know weather and thus crop yield'),
    image('images/agriculture.jpg'),
  _),
_));

prose(
  'Randomness shows up in many places.',
  'They could be caused by limitations of the sensors and actuators of the robot',
  '(which we can control to some extent).',
  'Or they could be caused by market forces or nature, which we have no control over.',
  _,
  'We\'ll see that all of these sources of randomness can be handled in the same mathematical framework.',
_);

add(slide('Volcano crossing',
  parentCenter(xtable(
    image('images/straw-hut.jpg').height(100),
    image('images/lava.jpg').height(200),
    image('images/vanuatu-view.jpg').height(100),
  _).margin(10).center()),
  volcanoDemo({origInput: [
    '// Model',
    'moveReward = 0  // For every action you take',
    'passReward = 20  // If get to far green',
    'volcanoReward = -50  // If fall into volcano',
    'slipProb = 0  // If slip, go in random direction',
    'discount = 1  // How much to value the future',
    '',
    '// CHANGE THIS to 10',
    'numIters = 0  // # iterations of value iteration',
    //'numEpisodes = 0  // # simulations',
  ]}),
_));

prose(
  'Let us consider an example.',
  'You are exploring a South Pacific island, which is modeled as a 3x4 grid of states.',
  'From each state, you can take one of four actions to move to an adjacent state: north (N), east (E), south (S), or west (W).',
  'If you try to move off the grid, you remain in the same state.',
  'You start at (2,1).  If you end up in either of the green or red squares, your journey ends,',
  'either in a lava lake (reward of -50) or in a safe area with either no view (2) or a fabulous view of the island (20).',
  'What do you do?',
  _,
  'If we have a deterministic search problem, then the obvious thing will be to go for the fabulous view, which yields a reward of 20.',
  'You can set <tt>numIters</tt> to 10 and press <tt>Run</tt>.',
  'Each state is labeled with the maximum expected utility (sum of rewards) one can get from that state (analogue of $\\FutureCost$ in a search problem).',
  'We will define this quantity formally later.  For now, look at the arrows, which',
  'represent the best action to take from each cell.',
  'Note that in some cases, there is a tie for the best, where some of the actions seem to be moving in the wrong direction.',
  'This is because there is no penalty for moving around indefinitely.',
  'If you change <tt>moveReward</tt> to -0.1, then you\'ll see the arrows point in the right direction.',
  _,
  'In reality, we are dealing with treacherous terrain, and there is on each action a probability <tt>slipProb</tt> of slipping,',
  'which results in moving in a random direction.',
  'Try setting <tt>slipProb</tt> to various values.',
  'For small values (e.g., 0.1), the optimal action is to still go for the fabulous view.',
  'For large values (e.g., 0.3), then it\'s better to go for the safe and boring 2.',
  'Play around with the other reward values to get intuition for the problem.',
  _,
  'Important: note that we are only specifying the dynamics of the world,',
  'not directly specifying the best action to take.  The best actions are computed automatically',
  'from the algorithms we\'ll see shortly.',
_);

function roadmap(i) {
  add(outlineSlide('Roadmap', i, [
    ['mdp', 'Markov decision process'],
    ['policyEvaluation', 'Policy evaluation'],
    ['valueIteration', 'Value iteration'],
  ]));
}

////////////////////////////////////////////////////////////
// Policy evaluation
roadmap(0);

function DiceGame(options) {
  var utility = 0;
  var outcomeBox = wrap('&nbsp;');
  var utilityBox = wrap(0);
  var M = options.M;
  var probContinue = options.probContinue || 2.0/3;
  var quitReward = options.quitReward;
  var stayReward = options.stayReward;
  var iterBox = wrap('');

  var stayButton = frame('Stay').padding(3).bg.fillColor('green').strokeWidth(2).round(10).end;
  var quitButton = frame('Quit').padding(3).bg.fillColor('red').strokeWidth(2).round(10).end;
  var clearButton = frame('Start').padding(3).bg.fillColor('white').strokeWidth(2).round(10).end;
  var n = 0;
  var gameOver = false;

  function endGame() {
    gameOver = true;
    utilityBox.resetContent(redbold('<ins>'+utility+'</ins>'));
    stayButton.opacity(0.2);
    quitButton.opacity(0.2);
    //iterBox.resetContent(redbold('Game over, you got '+utility));
  }

  stayButton.onClick(function() {
    if (gameOver) return;
    utility += stayReward;
    utilityBox.resetContent(utility);
    n++;
    var die = wholeNumbers(Math.min(n, M)).map(function() { return Math.floor(Math.random() * 6) + 1; });
    if (die.indexOf(1) != -1 || die.indexOf(2) != -1)
      endGame();
    //else
      //iterBox.resetContent(('Round '+n).bold());
    outcomeBox.resetContent(die.join(','));
    prez.refresh();
  }).setPointerWhenMouseOver();

  quitButton.onClick(function() {
    if (gameOver) return;
    utility += quitReward;
    //iterBox.resetContent('Game over'.bold().fontcolor('red'));
    endGame();
    //utilityBox.resetContent(utility);
    prez.refresh();
  }).setPointerWhenMouseOver();

  clearButton.onClick(function() {
    Math.seedrandom();
    iterBox.resetContent('Trial 1'.bold());
    outcomeBox.resetContent('&nbsp;');
    utilityBox.resetContent(0);
    n = 0;
    utility = 0;
    gameOver = false;
    stayButton.opacity(1);
    quitButton.opacity(1);
    prez.refresh();
  }).setPointerWhenMouseOver();

  return ytable(
    //iterBox,
    xtable(clearButton, stayButton, quitButton).margin(50),
    xtable(
      xtable('Dice:', frameBox(outcomeBox)).center(),
      xtable('Rewards:', frameBox(utilityBox)).center(),
    _).margin(50).center(),
  _).margin(20).center();
}

function game1Description() {
  return example('dice game',
    'For each round $r = 1, 2, \\dots$',
    bulletedText([null,
      'You choose <font color="green">stay</font> or <font color="red">quit</font>.',
      'If <font color="red">quit</font>, you get $\\$10$ and we end the game.',
      ['If <font color="green">stay</font>, you get $\\$4$ and then I roll a 6-sided dice.',
        'If the dice results in 1 or 2, we end the game.',
        'Otherwise, continue to the next round.',
      ],
    ]),
  _);
}

add(slide('Dice game',
  game1Description(),
  pause(),
  parentCenter(DiceGame({M: 1, quitReward: 10, stayReward: 4})),
_));

prose(
  'We\'ll see more volcanoes later, but let\'s start with a much simpler example: a dice game.',
  'What is the best strategy for this game?',
_);

function gameDistrib() {
  var items = [];
  var prob = 1;
  for (var i = 1; i < 5; i++) {
    items.push([4*i, prob*1/3]);
    prob *= 2.0/3;
  }
  return items;
}
add(slide('Rewards',
  stmt('If follow policy "stay"'),
  parentCenter(
    barGraph(gameDistrib()).xrange(0, 20).xtickIncrValue(4).yrange(0, 1).ytickIncrValue(0.2).yroundPlaces(1).axisLabel('total rewards (utility)', 'probability'),
  _),
  pause(),
  /*keyIdea('expected utility',
    'Evaluate a policy by expected utility',
  _),*/
  stmt('Expected utility'),
  parentCenter('$\\frac{1}{3} (4) + \\frac{2}{3} \\cdot \\frac{1}{3} (8) + \\frac{2}{3} \\cdot \\frac{2}{3} \\cdot \\frac{1}{3} (12) + \\cdots = 12$'),
_));

prose(
  'Let\'s suppose you always stay.',
  'Note that each outcome of the game will result in a different sequence of rewards,',
  'resulting in a <b>utility</b>, which is in this case just the sum of the rewards.',
  _,
  'We are interested in the <b>expected</b> utility, which you can compute to be 12.',
_);

add(slide('Rewards',
  stmt('If follow policy "quit"'),
  parentCenter(
    barGraph([[10, 1]]).xrange(0, 20).xtickIncrValue(4).yrange(0, 1).ytickIncrValue(0.2).yroundPlaces(1).axisLabel('total rewards (utility)', 'probability'),
  _),
  stmt('Expected utility'),
  parentCenter('$1 (10) = 10$'),
_));

prose(
  'If you quit, then you\'ll get a reward of 10 deterministically.',
  'Therefore, in expectation, the "stay" strategy is preferred, even though sometimes you\'ll get less than 10.',
_);

add(slide('MDP for dice game',
  game1Description().scale(0.8),
  parentCenter(game1MDP()),
_));

prose(
  'While we already solved this game directly, we\'d like to develop a more general framework for thinking about not just this game,',
  'but also other problems such as the volcano crossing example.',
  'To that end, let us formalize the dice game as a <b>Markov decision process</b> (MDP).',
  _,
  'An MDP can be represented as a graph.',
  'The nodes in this graph include both <b>states</b> and <b>chance nodes</b>.',
  'Edges coming out of states are the possible actions from that state, which lead to chance nodes.',
  'Edges coming out of a chance nodes are the possible random outcomes of that action, which end up back in states.',
  'Our convention is to label these chance-to-state edges with the probability of a particular <b>transition</b>',
  'and the associated reward for traversing that edge.',
_);

add(slide('Markov decision process',
  mdpDefinition({pause: false}),
_));

prose(
  'A <b>Markov decision process</b> has',
  'a set of states $\\States$, a starting state $\\StartState$,',
  'and the set of actions $\\Actions(s)$ from each state $s$.',
  _,
  'It also has a <b>transition distribution</b> $T$,',
  'which specifies for each state $s$ and action $a$,',
  'a distribution over possible successor states $s\'$.',
  'Specifically, we have that $\\sum_{s\'} T(s,a,s\') = 1$ because $T$ is a probability distribution (more on this later).',
  _,
  'Associated with each transition $(s,a,s\')$ is a reward, which could be either positive or negative.',
  _,
  'If we arrive in a state $s$ for which $\\IsEnd(s)$ is true, then the game is over.',
  _,
  'Finally, the discount factor $\\gamma$ is a quantity which specifies how much we value the future',
  'and will be discussed later.',
_);

add(slide('Search problems',
  definition('search problem',
    '$\\States$: the set of states',
    '$\\StartState \\in \\States$: starting state',
    '$\\Actions(s)$: possible actions from state $s$',
    '$\\Succ(s, a)$: where we end up if take action $a$ in state $s$',
    '$\\Cost(s, a)$: cost for taking action $a$ in state $s$',
    '$\\IsEnd(s)$: whether at end',
  _),
  pause(),
  headerList(null,
    '$\\Succ(s,a) \\Rightarrow T(s,a,s\')$',
    '$\\Cost(s,a) \\Rightarrow \\Reward(s,a,s\')$',
  _),
_));

prose(
  'MDPs share many similarities with search problems,',
  'but there are differences (one main difference and one minor one).',
  _,
  'The main difference is the move from a deterministic successor function $\\Succ(s,a)$',
  'to transition probabilities over $s\'$.',
  'We can think of the successor function $\\Succ(s,a)$ as a special case of transition probabilities:',
  '$T(s, a, s\') = \\begin{cases} 1 & \\text{if $s\' = \\Succ(s, a)$} \\\\ 0 & \\text{otherwise} \\end{cases}$.',
  _,
  'A minor difference is that we\'ve gone from minimizing costs to maximizing rewards.',
  'The two are really equivalent: you can negate one to get the other.',
_);

function valueIteration(options) {
  var M = options.M || 1;
  var numIters = options.numIters != null ? options.numIters : 100;
  var quitReward = options.quitReward;
  var stayReward = options.stayReward;
  var probContinue = options.probContinue || 2.0/3;
  var alwaysStay = options.alwaysStay;
  var values = [];
  var actions = [];
  for (var s = 0; s <= M; s++) {
    values[s] = 0;
    actions[s] = '-';
  }
  for (var iter = 0; iter < numIters; iter++) {
    for (var s = 1; s <= M; s++) {
      var t = Math.min(s + 1, M);
      var thisStayReward = stayReward + Math.pow(probContinue, s) * values[t];
      if (alwaysStay)
        values[s] = thisStayReward;
      else
        values[s] = Math.max(quitReward, thisStayReward);
      actions[s] = quitReward >= thisStayReward ? 'quit'.fontcolor('red') : 'stay'.fontcolor('green');
    }
  }
  var states = [];
  states.push('end');
  if (M == 1)
    states.push('in');
  else
    for (var s = 1; s <= M; s++) states.push(s);
  states = ['$s$'].concat(states);
  this.values = values;
  values = [alwaysStay ? '$V_\\pi^{(t)}$' : '$V_\\opt^{(t)}$'].concat(values.map(function(x) { return x.toFixed(2).toString().fontcolor('blue'); }));
  actions = ['$\\pi_\\opt(s)$'].concat(actions);
  this.block = table(states, values, alwaysStay || options.hidePolicy ? _ : actions).margin(15, 10).center();
}

function valueIterations(options) {
  var items = [];
  options.numIters.forEach(function(n) {
    items.push(xseq(new valueIteration(mergeInto(options, {numIters: n})).block, '($t='+n+'$ iterations'+')'));
  });
  return frame(stagger.apply(null, items).pivot(-1, -1)).bg.strokeWidth(2).end.padding(5);
}

function transitionExample() {
  return example('transition probabilities',
    table(
      ['$s$', '$a$', '$s\'$', '$T(s, a, s\')$'],
      ['in', 'quit', 'end', '$1$'],
      [nil(), nil(), nil(), nil()],
      [nil(), nil(), nil(), nil()],
      ['in', 'stay', 'in', '$2/3$'],
      ['in', 'stay', 'end', '$1/3$'],
    _).center().margin(40, 5),
  _);
}

add(slide('Transitions',
  definition('transition probabilities',
    'The <b>transition probabilities</b> $T(s, a, s\')$ specify the probability of ending up in state $s\'$ if taken action $a$ in state $s$.',
  _),
  pause(),
  transitionExample(),
_));

prose(
  'Just to dwell on the major difference, transition probabilities, a bit more:',
  'for each state $s$ and action $a$,',
  'the transition probabilities specifies a distribution over successor states $s\'$.',
_);

add(slide('Probabilities sum to one',
  transitionExample(),
  pause(),
  'For each state $s$ and action $a$:',
  parentCenter('$\\displaystyle \\sum_{s\' \\in \\States} T(s, a, s\') = 1$'),
  pause(),
  stmt('Successors: $s\'$ such that $T(s, a, s\') > 0$'),
_));

prose(
  'This means that for each given $s$ and $a$, if we sum the transition probability $T(s,a,s\')$ over all possible successor states $s\'$,',
  'we get 1.',
  _,
  'If a transition to a particular $s\'$ is not possible, then $T(s,a,s\') = 0$.',
  'We refer to the $s\'$ for which $T(s,a,s\') > 0$ as the successors.',
  _,
  'Generally, the number of successors of a given $(s,a)$ is much smaller than the total number of states.',
  'For instance, in a search problem, each $(s,a)$ has exactly one successor.',
_);

add(slide('Transportation example',
  example('transportation',
    'Street with blocks numbered $1$ to $n$.',
    'Walking from $s$ to $s+1$ takes 1 minute.',
    'Taking a magic tram from $s$ to $2s$ takes 2 minutes.',
    'How to travel from $1$ to $n$ in the least time?',
    pause(),
    redbold('Tram fails with probability 0.5.'),
  _),
  pause(),
  parentCenter(linkToVideo('[semi-live solution]', 'tramMDP.mp4')),
_).leftHeader(image('images/tram.jpg').width(150)));

prose(
  'Let us revisit the transportation example.',
  'As we all know, magic trams aren\'t the most reliable forms of transportation,',
  'so let us asume that with probability $\\frac{1}{2}$, it actually does as advertised,',
  'and with probability $\\frac{1}{2}$ it just leaves you in the same state.',
_);

add(slide('What is a solution?',
  stmt('Search problem: path (sequence of actions)'),
  pause(),
  stmt('MDP'),
  definition('policy',
    'A <b>policy</b> $\\pi$ is a mapping from each state $s \\in \\States$ to an action $a \\in \\Actions(s)$.',
  _),
  pause(),
  example('volcano crossing',
    parentCenter(table(
      ['$s$', '$\\pi(s)$'],
      ['(1,1)', 'S'],
      ['(2,1)', 'E'],
      ['(3,1)', 'N'],
      ['...', '...'],
    _).margin(40, 0).center().scale(0.8)),
  _),
_));

prose(
  'So we now know what an MDP is.',
  'What do we do with one?',
  'For search problems, we were trying to find the minimum cost <b>path</b>',
  _,
  'However, fixed paths won\'t suffice for MDPs, because we don\'t know which states the random dice rolls are going to take us.',
  _, 
  'Therefore, we define a <b>policy</b>, which specifies an action for every single state, not just the states along a path.',
  'This way, we have all our bases covered, and know what action to take no matter where we are.',
  _,
  'One might wonder if we ever need to take different actions from a given state.',
  'The answer is no, since like as in a search problem, the state contains all the information',
  'that we need to act optimally for the future.',
  'In more formal speak, the transitions and rewards satisfy the <b>Markov property</b>.',
  'Every time we end up in a state, we are faced with the exact same problem and therefore should take the same optimal action.',
_);

////////////////////////////////////////////////////////////
// Policy evaluation
roadmap(1);

add(slide('Evaluating a policy',
  definition('utility',
    'Following a policy yields a <b>random path</b>.', pause(),
    'The '+redbold('utility')+' of a policy is the (discounted) sum of the rewards on the path (this is a random quantity).',
  _),
  pause(),
  parentCenter(table(
    [darkblue('Path'), red('Utility')],
    ['[in; stay, 4, end]', red('4')],
    pause(),
    ['[in; stay, 4, in; stay, 4, in; stay, 4, end]', red('12')],
    ['[in; stay, 4, in; stay, 4, end]', red('8')],
    ['[in; stay, 4, in; stay, 4, in; stay, 4, in; stay, 4, end]', red('16')],
    ['...', '...'],
  _).scale(0.7).xmargin(20)),
  pause(),
  definition('value (expected utility)',
    'The '+bluebold('value')+' of a policy is the <b>expected</b> utility.',
  _),
  parentCenter(blue('Value: 12')).scale(0.7),
_));

prose(
  'Now that we\'ve defined an MDP (the input) and a policy (the output),',
  'let\'s turn to defining the evaluation metric for a policy &mdash; there are many of them, which one should we choose?',
  _,
  'Recall that we\'d like to maximize the total rewards (utility), but this is a random quantity, so we can\'t quite do that.',
  'Instead, we will instead maximize the <b>expected utility</b>, which we will refer to as <b>value</b> (of a policy).',
_);

add(slide('Evaluating a policy: volcano crossing',
  nil(),
  parentCenter(volcanoDemo({origInput:[
    '// Model',
    'moveReward = -0.1  // For every action you take',
    'passReward = 40  // If get to far green',
    'volcanoReward = -50  // If fall into volcano',
    'slipProb = 0.3  // If slip, go in random direction',
    'discount = 0.9  // How much to value the future',
    '',
    '// Run algorithms on model',
    'numIters = 10  // # iterations of value iteration',
    'numEpisodes = 1  // # simulations',
  ]})),
_));

prose(
  'To get an intuitive feel for the relationship between a value and utility,',
  'consider the volcano example.',
  'If you press <tt>Run</tt> multiple times,',
  'you will get random paths shown on the right leading to different utilities.',
  'Note that there is considerable variation in what happens.',
  _,
  'The expectation of this utility is the <b>value</b>.',
  _,
  'You can run multiple simulations by increasing <tt>numEpisodes</tt>.',
  'If you set <tt>numEpisodes</tt> to 1000, then you\'ll see the average utility converging to the value.',
_);

add(slide('Discounting',
  definition('utility',
    nowrapText('Path: $s_0, a_1 \\red{r_1} s_1, a_2 \\red{r_2} s_2, \\dots$ (action, reward, new state).'),
    'The <b>utility</b> with discount $\\gamma$ is',
    parentCenter('$u_1 = \\red{r_1} + \\gamma \\red{r_2} + \\gamma^2 \\red{r_3} + \\gamma^3 \\red{r_4} + \\cdots$'),
  _),
  pause(),
  stmt('Discount $\\gamma = 1$ (save for the future)'),
  indent('[stay, stay, stay, stay]: $4 + 4 + 4 + 4 = 16$').scale(0.8),
  pause(),
  stmt('Discount $\\gamma = 0$ (live in the moment)'),
  indent('[stay, stay, stay, stay]: $4 + 0 \\cdot (4 + \\cdots) = 4$').scale(0.8),
  pause(),
  stmt('Discount $\\gamma = 0.5$ (balanced life)'),
  indent(nowrapText('[stay, stay, stay, stay]: $4 + \\frac{1}{2} \\cdot 4 + \\frac14 \\cdot 4 + \\frac{1}{8} \\cdot 4 = 7.5$')).scale(0.8),
  //pause(),
  //stmt('Interpretation: small $\\gamma$ favors rewards sooner than later'),
_));

prose(
  'There is an additional aspect to utility: <b>discounting</b>, which captures the fact that a reward today might be worth more than the same reward tomorrow.',
  'If the discount $\\gamma$ is small, then we favor the present more and downweight future rewards more.',
  _,
  'Note that the discounting parameter is applied exponentially to future rewards,',
  'so the distant future is always going to have a fairly small contribution to the utility  (unless $\\gamma = 1$).',
  _,
  'The terminology, though standard, is slightly confusing:',
  'a larger value of the discount parameter $\\gamma$ actually means that the future is discounted less.',
_);

add(slide('Policy evaluation',
  definition('value of a policy',
    'Let $\\blue{V_\\pi(s)}$ be the expected utility received by following policy $\\pi$ from state $s$.',
  _),
  pause(),
  definition('Q-value of a policy',
    'Let $\\red{Q_\\pi(s, a)}$ be the expected utility of taking action $a$ from state $s$, and then following policy $\\pi$.',
  _),
  pause(),
  policyEvaluationTree(),
_));

prose(
  'Associated with any policy $\\pi$ are two important quantities, the value of the policy $V_\\pi(s)$ and the Q-value of a policy $Q_\\pi(s, a)$.',
  _,
  'In terms of the MDP graph, one can think of the value $V_\\pi(s)$ as labeling the state nodes,',
  'and the Q-value $Q_\\pi(s,a)$ as labeling the chance nodes.',
  _,
  'This label refers to the expected utility if we were to start at that node and continue the dynamics of the game.',
_);

add(slide('Policy evaluation',
  stmt('Plan: define recurrences relating value and Q-value'),
  policyEvaluationTree(),
  pause(),
  nowrapText('$\\displaystyle \\blue{V_\\pi(s)} = \\begin{cases} 0 & \\text{if } \\IsEnd(s) \\\\ \\red{Q_\\pi(s, \\pi(s))} & \\text{otherwise}. \\end{cases}$').scale(0.9),
  pause(),
  nowrapText('$\\displaystyle \\red{Q_\\pi(s, a)} = \\sum_{s\'} T(s, a, s\') [\\Reward(s, a, s\') + \\gamma \\blue{V_\\pi(s\')}]$').scale(0.9),
_));

prose(
  'We will now write down some equations relating value and Q-value.',
  'Our eventual goal is to get to an algorithm for computing these values,',
  'but as we will see, writing down the relationships gets us most of the way there,',
  'just as writing down the recurrence for $\\FutureCost$ directly lead to a dynamic programming algorithm for acyclic search problems.',
  _,
  'First, we get $V_\\pi(s)$, the value of a state $s$, by just following the action edge specified by the policy and taking the Q-value $Q_\\pi(s, \\pi(s))$.',
  '(There\'s also a base case where $\\IsEnd(s)$.)',
  _,
  'Second, we get $Q_\\pi(s,a)$ by considering all possible transitions to successor states $s\'$',
  'and taking the expectation over the immediate reward $\\Reward(s,a,s\')$ plus the discounted future reward $\\gamma V_\\pi(s\')$.',
  _,
  'While we\'ve defined the recurrence for the expected utility directly,',
  'we can derive the recurrence by applying the law of total expectation and invoking the Markov property.',
  'To do this, we need to set up some random variables:',
  'Let $s_0$ be the initial state,',
  '$a_1$ be the action that we take,',
  '$r_1$ be the reward we obtain,',
  'and $s_1$ be the state we end up in.',
  'Also define $u_t = r_t + \\gamma r_{t+1} + \\gamma^2 r_{t+2} + \\cdots$ to be the utility of following policy $\\pi$ from time step $t$.',
  'Then $V_\\pi(s) = \\mathbb{E}[u_1 \\mid s_0 = s]$,',
  'which (assuming $s$ is not an end state) in turn equals ',
  '$\\sum_{s\'} \\mathbb{P}[s_1 = s\' \\mid s_0 = s, a_1 = \\pi(s)] \\mathbb{E}[u_1 \\mid s_1 = s\', s_0 = s, a_1 = \\pi(s)]$.',
  'Note that $\\mathbb{P}[s_1 = s\' \\mid s_0 = s, a_1 = \\pi(s)] = T(s, \\pi(s), s\')$.',
  'Using the fact that $u_1 = r_1 + \\gamma u_2$ and taking expectations,',
  'we get that $\\E[u \\mid s_1 = s\', s_0 = s, a_1 = \\pi(s)] = \\Reward(s, \\pi(s), s\') + \\gamma {V_\\pi(s\')}$.',
  'The rest follows from algebra.',
_);

add(slide('Dice game',
  parentCenter(game1MDP()),
  parentCenter('(assume $\\gamma = 1$)').scale(0.5),
  pause(),
  'Let $\\pi$ be the "stay" policy: $\\pi(\\text{in}) = \\text{stay}$.',
  indent('$V_\\pi(\\text{end}) = 0$'),
  indent(stagger(
    '$V_\\pi(\\text{in}) = Q_\\pi(\\text{in}, \\red{\\text{stay}})$',
    '$V_\\pi(\\text{in}) = \\frac{1}{3} (4 + V_\\pi(\\text{end})) + \\frac{2}{3} (4 + 1 \\cdot V_\\pi(\\text{in}))$',
  _)),
  pause(),
  stmt('In this case, can solve in closed form'),
  indent('$V_\\pi(\\text{in}) = 12$'),
_));

prose(
  'As an example, let\'s compute the values of the nodes in the dice game for the policy "stay".',
  _,
  'Note that the recurrence involves both $V_\\pi(\\text{in})$ on the left-hand side and the right-hand side.',
  'At least in this simple example, we can solve this recurrence easily to get the value.',
_);

function policyEvaluationAlgorithm(opts) {
  var myPause = opts.pause ? pause : function() { return _ };
  return algorithm('policy evaluation',
    'Initialize $V_\\pi^{(0)}(s) \\leftarrow 0$ for all states $s$.', myPause(),
    'For iteration $t = 1, \\dots, t_\\text{PE}$:',
    indent('For each state $s$:'), myPause(),
    indent(indent(nowrapText('$\\displaystyle V_\\pi^{(t)}(s) \\leftarrow \\underbrace{\\sum_{s\'} T(s, \\pi(s), s\') [\\Reward(s, \\pi(s), s\') + \\gamma V_\\pi^{(t-1)}(s\')]}_{Q^{(t-1)}(s, \\pi(s))}$').scale(0.7))),
  _);
}

add(slide('Policy evaluation',
  keyIdea('iterative algorithm',
    'Start with arbitrary policy values and repeatedly apply recurrences to converge to true values.',
  _),
  pause(),
  policyEvaluationAlgorithm({pause:true}),
_)),

prose(
  'But for a much larger MDP with 100000 states, how do we efficiently compute the value of a policy?',
  _,
  'One option is the following: observe that the recurrences define a system of linear equations,',
  'where the variables are $V_\\pi(s)$ for each state $s$ and there is an equation for each state.',
  'So we could solve the system of linear equations by computing a matrix inverse.',
  'However, inverting a $100000 \\times 100000$ matrix is expensive in general.',
  _,
  'There is an even simpler approach called <b>policy evaluation</b>.',
  'We\'ve already seen examples of iterative algorithms in machine learning:',
  'the basic idea is to start with something crude, and refine it over time.',
  _,
  'Policy iteration starts with a vector of all zeros for the initial values $V_\\pi^{(0)}$.',
  'Each iteration, we loop over all the states and apply the two recurrences that we had before.',
  'The equations look hairier because of the superscript $(t)$, which simply denotes the value of',
  'at iteration $t$ of the algorithm.',
_);

var values = [];
var T = 15;
var S = 5;
for (var t = 0; t < T; t++) {
  values[t] = [];
  for (var s = 0; s < S; s++) {
    if (t == 0) {
      values[t][s] = 0;
    } else if (s == 2) {
      values[t][s] = 4;
    } else {
      var s1 = (s - 1 + S) % S;
      var s2 = (s + 1) % S;
      values[t][s] = 0.5 * (-0.1 + values[t-1][s1]) + 0.5 * (-0.1 + values[t-1][s2]);
    }
  }
}
add(slide('Policy evaluation computation',
  parentCenter(frameBox('$V_\\pi^{(t)}(s)$')),
  parentCenter(overlay(
    r = overlay(
      new Table(wholeNumbers(5).map(function(s) {
        return wholeNumbers(10).map(function(t) {
          //return rect(40, 40);
          var v = '' + Math.floor(values[t][s] * 10) / 10;
          return overlay(text(v).showLevel(t), rect(60, 50)).center();
        });
      })),
    _),
    moveLeftOf(text('state $s$').rotate(-90), r),
    moveTopOf('iteration $t$', r),
  _)),
_));

prose(
  'We can visualize the computation of policy evaluation on a grid,',
  'where column $t$ denotes all the values $V_\\pi^{(t)}(s)$ for a given iteration $t$.',
  'The algorithm initializes the first column with $0$ and then proceeds to update each subsequent column given the previous column.',
  _,
  'For those who are curious,',
  'the diagram shows policy evaluation on an MDP over 5 states where state 3 is a terminal state that delivers a reward of 4,',
  'and where there is a single action, MOVE, which transitions to an adjacent state (with wrap-around) with equal probability.',
_);

add(slide('Policy evaluation implementation',
  'How many iterations ($t_\\text{PE}$)? Repeat until values don\'t change much:',
  parentCenter('$\\displaystyle \\max_{s \\in \\States} |V_\\pi^{(t)}(s) - V_\\pi^{(t-1)}(s)| \\le \\red{\\epsilon}$'),
  pause(),
  'Don\'t store $V_\\pi^{(t)}$ for each iteration $t$, need only last two:',
  parentCenter('$V_\\pi^{(t)}$ and $V_\\pi^{(t-1)}$'),
_));

prose(
  'Some implementation notes: a good strategy for determining how many iterations to run policy evaluation',
  'is based on how accurate the result is.',
  'Rather than set some fixed number of iterations (e.g, $100$),',
  'we instead set an error tolerance (e.g., $\\epsilon = 0.01$),',
  'and iterate until the maximum change between values of any state $s$',
  'from one iteration ($t$) to the previous ($t-1$) is at most $\\epsilon$.',
  _,
  'The second note is that while the algorithm is stated as computing $V_\\pi^{(t)}$ for each iteration $t$,',
  'we actually only need to keep track of the last two values.',
  'This is important for saving memory.',
_);

function mdpComplexityNotation() {
  return importantBox(bold('MDP complexity'),
    //'$t_\\text{*}$ iterations',
    '$S$ states',
    '$A$ actions per state',
    '$S\'$ successors (number of $s\'$ with $T(s,a,s\') > 0$)',
  _);
}

add(slide('Complexity',
  policyEvaluationAlgorithm({pause:false}).scale(0.8),
  pause(),
  mdpComplexityNotation().scale(0.8),
  pause(),
  parentCenter(xtable(
    //stmt('Space: $O(S)$'),
    //pause(),
    stmt('Time: $O(t_\\text{PE} SS\')$'),
  _).margin(100)),
_));

prose(
  'Computing the running time of policy evaluation is straightforward: for each of the $t_\\text{PE}$ iterations,',
  'we need to enumerate through each of the $S$ states, and for each one of those, loop over the successors $S\'$.',
  'Note that we don\'t have a dependence on the number of actions $A$',
  'because we have a fixed policy $\\pi(s)$ and we only need to look at the action specified by the policy.',
  _,
  'Advanced: Here, we have to iterate $t_\\text{PE}$ time steps to reach a target level of error $\\epsilon$.',
  'It turns out that $t_\\text{PE}$ doesn\'t actually have to be very large for very small errors.',
  'Specifically, the error decreases exponentially fast as we increase the number of iterations.',
  'In other words, to cut the error in half, we only have to run a constant number of more iterations.',
  _,
  'Advanced: For acyclic graphs (for example, the MDP for Blackjack), we just need to do one iteration (not $t_\\text{PE}$)',
  'provided that we process the nodes in reverse topological order of the graph.',
  'This is the same setup as we had for dynamic programming in search problems, only the equations are different.',
_);

add(slide('Policy evaluation on dice game',
  'Let $\\pi$ be the "stay" policy: $\\pi(\\text{in}) = \\text{stay}$.',
  indent('$V_\\pi^{(t)}(\\text{end}) = 0$').scale(0.9),
  indent('$V_\\pi^{(t)}(\\text{in}) = \\frac{1}{3} (4 + V_\\pi^{(t-1)}(\\text{end})) + \\frac{2}{3} (4 + V_\\pi^{(t-1)}(\\text{in}))$').scale(0.9),
  parentCenter(valueIterations({M: 1, quitReward: 10, stayReward: 4, numIters: [0, 1, 2, 3, 100], alwaysStay: true})),
  'Converges to $V_\\pi(\\text{in}) = 12$.',
_));

prose(
  'Let us run policy evaluation on the dice game.',
  'The value converges very quickly to the correct answer.',
_);

add(summarySlide('Summary so far',
  bulletedText(stmt('MDP: graph with states, chance nodes, transition probabilities, rewards')).autowrap(true), pause(),
  bulletedText(stmt('Policy: mapping from state to action (solution to MDP)')).autowrap(true), pause(),
  bulletedText(stmt('Value of policy: expected utility over random paths')).autowrap(true), pause(),
  bulletedText(stmt('Policy evaluation: iterative algorithm to compute value of policy')).autowrap(true),
_));

prose(
  'Let\'s summarize: we have defined an MDP, which we should think of a graph where the nodes are states and chance nodes.',
  'Because of randomness, solving an MDP means generating policies, not just paths.',
  'A policy is evaluated based on its value: the expected utility obtained over random paths.',
  'Finally, we saw that policy evaluation provides a simple way to compute the value of a policy.',
_);

////////////////////////////////////////////////////////////
// Value iteration
roadmap(2);

prose(
  'If we are given a policy $\\pi$, we now know how to compute its value $V_\\pi(\\StartState)$.',
  'So now, we could just enumerate all the policies, compute the value of each one, and take the best policy,',
  'but the number of policies is exponential in the number of states ($A^S$ to be exact),',
  'so we need something a bit more clever.',
  _,
  'We will now introduce value iteration, which is an algorithm for finding the best policy.',
  'While evaluating a given policy and finding the best policy might seem very different,',
  'it turns out that value iteration will look a lot like policy evaluation.',
_);

add(slide('Optimal value and policy',
  stmt('Goal: try to get directly at maximum expected utility'),
  pause(),
  definition('optimal value',
    'The <b>optimal value</b> $V_\\text{opt}(s)$ is the maximum value attained by any policy.',
  _),
  /*pause(),
  definition('optimal policy',
    'The <b>optimal policy</b> $\\pi_\\text{opt}$ attains $V_\\text{opt}$.',
  _),*/
_));

prose(
  'We will write down a bunch of recurrences which look exactly like policy evaluation,',
  'but instead of having $V_\\pi$ and $Q_\\pi$ with respect to a fixed policy $\\pi$,',
  'we will have $V_\\opt$ and $Q_\\opt$, which are with respect to the optimal policy.',
_);

add(slide('Optimal values and Q-values',
  stagger(
    policyEvaluationTree(),
    valueIterationTree(),
  _),
  pause(),
  stmt('Optimal value if take action $a$ in state $s$'),
  parentCenter(nowrapText('$\\displaystyle \\red{Q_\\text{opt}(s, a)} = \\sum_{s\'} T(s, a, s\') [\\Reward(s, a, s\') + \\gamma \\blue{V_\\text{opt}(s\')}]$.')).scale(0.75),
  pause(),
  stmt('Optimal value from state $s$'),
  parentCenter('$\\displaystyle \\blue{V_\\text{opt}(s)} = \\begin{cases} 0 & \\text{if } \\IsEnd(s) \\\\ \\green{\\max_{a \\in \\Actions(s)}} \\red{Q_\\text{opt}(s, a)} & \\text{otherwise}. \\end{cases}$').scale(0.75),
_));

prose(
  'The recurrences for $V_\\opt$ and $Q_\\opt$ are identical to the ones for policy evaluation',
  'with one difference: in computing $V_\\opt$, instead of taking the action from the fixed policy $\\pi$,',
  'we take the best action, the one that results in the largest $Q_\\opt(s, a)$.',
_);


add(slide('Optimal policies',
  valueIterationTree(),
  stmt('Given $Q_\\opt$, read off the optimal policy'),
  parentCenter('$\\displaystyle \\pi_\\opt(s) = \\arg\\max_{a \\in \\Actions(s)} Q_\\opt(s, a)$'),
_));

prose(
  'So far, we have focused on computing the value of the optimal policy, but what is the actual policy?',
  'It turns out that this is pretty easy to compute.',
  _,
  'Suppose you\'re at a state $s$.  $Q_\\opt(s, a)$ tells you the value of taking action $a$ from state $s$.',
  'So the optimal action is simply to take the action $a$ with the largest value of $Q_\\opt(s, a)$.',
_);

add(slide('Value iteration',
  algorithm('value iteration [Bellman, 1957]',
    'Initialize $V_\\opt^{(0)}(s) \\leftarrow 0$ for all states $s$.', pause(),
    'For iteration $t = 1, \\dots, t_\\text{VI}$:',
    indent('For each state $s$:'), pause(),
    indent(indent(nowrapText('$\\displaystyle V_\\opt^{(t)}(s) \\leftarrow \\red{\\max_{a \\in \\Actions(s)}} \\underbrace{\\sum_{s\'} T(s, a, s\') [\\Reward(s, a, s\') + \\gamma V_\\opt^{(t-1)}(s\')]}_{Q_\\opt^{(t-1)}(s, a)}$').scale(0.67))),
  _),
  pause(),
  stmt('Time: $O(t_\\text{VI} SAS\')$'),
  pause(),
  parentCenter(linkToVideo('[semi-live solution]', 'valueIteration.mp4')),
_));

prose(
  'By now, you should be able to go from recurrences to algorithms easily.',
  'Following the recipe, we simply iterate some number of iterations, go through each state $s$',
  'and then replace the equality in the recurrence with the assignment operator.',
  _,
  'Value iteration is also guaranteed to converge to the optimal value.',
  _,
  'What about the optimal policy?  We get it as a byproduct.',
  'The optimal value $V_\\text{opt}(s)$ is computed by taking a max over actions.',
  'If we take the argmax, then we get the optimal policy $\\pi_\\opt(s)$.',
_);

add(slide('Value iteration: dice game',
  //stmt('Policy evaluation with $\\pi$ is "stay"'),
  //parentCenter(valueIterations({M: 1, quitReward: 10, stayReward: 4, numIters: [0, 1, 2, 3, 100], alwaysStay: true})).scale(0.8),
  //pause(),
  //stmt('Value iteration'),
  nil(),
  parentCenter(valueIterations({M: 1, quitReward: 10, stayReward: 4, numIters: [0, 1, 2, 3, 100]})).scale(0.8),
_));

prose(
  'Let us demonstrate value iteration on the dice game.',
  'Initially, the optimal policy is "quit", but as we run value iteration longer,',
  'it switches to "stay".',
_);

add(slide('Value iteration: volcano crossing',
  nil(),
  volcanoDemo({origInput: [
    '// Model',
    'moveReward = 0  // For every action you take',
    'passReward = 20  // If get to far green',
    'volcanoReward = -50  // If fall into volcano',
    'slipProb = 0.1  // If slip, go in random direction',
    'discount = 1  // How much to value the future',
    '',
    '// CHANGE THIS to 0, 1, 2, 3, ...',
    'numIters = 0  // # iterations of value iteration',
  ]}),
_));

prose(
  'As another example, consider the volcano crossing.',
  'Initially, the optimal policy and value correspond to going to the safe and boring 2.',
  'But as you increase <tt>numIters</tt>,',
  'notice how the value of the far away 20 propagates across the grid to the starting point.',
  _,
  'To see this propagation even more clearly, set <tt>slipProb</tt> to 0.',
_);

add(slide('Convergence',
  theorem('convergence',
    'Suppose either',
    bulletedText('discount $\\gamma < 1$, or').autowrap(true),
    bulletedText('MDP graph is acyclic.').autowrap(true),
    pause(),
    'Then value iteration converges to the correct answer.',
    //parentCenter('$\\max_s |V_\\opt(s) - V_\\opt^{(t)}(s)| \\le a^t$'),
  _),
  //pause(),
  //stmt('Intuition: game will stop eventually'),
  pause(),
  example('non-convergence',
    'discount $\\gamma = 1$, zero rewards',
    parentCenter(xtable(
      node(),
      ytable(
        r = rightArrow(100).strokeWidth(2),
        l = leftArrow(100).strokeWidth(2),
      _),
      node(),
    _).center()),
  _),
_));

prose(
  'Let us state more formally the conditions under which any of these algorithms that we talked about will work.',
  'A sufficient condition is that either the discount $\\gamma$ must be strictly less than $1$ or the MDP graph is acyclic.',
  _,
  'We can reinterpret the discount $\\gamma < 1$ condition as introducing a new transition from each state to a special end state with probability $(1 - \\gamma)$,',
  'multiplying all the other transition probabilities by $\\gamma$, and setting the discount to $1$.',
  'The interpretation is that with probability $1 - \\gamma$, the MDP terminates at any state.',
  _,
  'In this view, we just need that a sampled path be finite with probability $1$.',
  _,
  'We won\'t prove this theorem, but will instead give a counterexample to show that things can go badly if we have a cyclic graph and $\\gamma = 1$.',
  'In the graph, whatever we initialize value iteration, value iteration will terminate immediately with the same value.',
  'In some sense, this isn\'t really the fault of value iteration, but it\'s because all paths are of infinite length.',
  'In some sense, if you were to simulate from this MDP, you would never terminate,',
  'so we would never find out what your utility was at the end.',
_);

add(slide('Summary of algorithms',
  bulletedText(stmt('Policy evaluation: (MDP, $\\pi$) $\\rightarrow$ $V_\\pi$')),
  bulletedText(stmt('Value iteration: MDP $\\rightarrow$ $(V_\\text{opt}, \\pi_\\text{opt})$')),
_));

add(slide('Unifying idea',
  headerList('Algorithms',
    'Search DP computes $\\FutureCost(s)$',
    'Policy evaluation computes policy value $V_\\pi(s)$',
    'Value iteration computes optimal value $V_\\opt(s)$',
  _),
  pause(),
  headerList('Recipe',
    'Write down recurrence (e.g., $V_\\pi(s) = \\cdots V_\\pi(s\') \\cdots$)',
    'Turn into iterative algorithm (replace mathematical equality with assignment operator)',
  _),
_));

prose(
  'There are two key ideas in this lecture.',
  'First, the policy $\\pi$, value $V_\\pi$, and Q-value $Q_\\pi$ are the three key quantities of MDPs,',
  'and they are related via a number of recurrences which can be easily gotten by just thinking about their interpretations.',
  _,
  'Second, given recurrences that depend on each other for the values you\'re trying to compute,',
  'it\'s easy to turn these recurrences into algorithms that iterate between those recurrences until convergence.',
_);

add(summarySlide('Summary',
  bulletedText('<b>Markov decision processes</b> (MDPs) cope with uncertainty').autowrap(true),
  pause(), bulletedText('Solutions are <b>policies</b> rather than paths').autowrap(true),
  pause(), bulletedText('<b>Policy evaluation</b> computes policy value (expected utility)').autowrap(true),
  pause(), bulletedText('<b>Value iteration</b> computes optimal value (maximum expected utility) and optimal policy').autowrap(true),
  pause(), bulletedText(stmt('Main technique: write recurrences $\\to$ algorithm')).autowrap(true),
  pause(), bulletedText(stmt('Next time: reinforcement learning &mdash; when we don\'t know rewards, transition probabilities')).autowrap(true),
_));

sfig.initialize();
