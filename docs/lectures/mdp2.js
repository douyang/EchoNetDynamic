G = sfig.serverSide ? global : this;
G.prez = presentation();

Math.seedrandom(42);

add(titleSlide('Lecture 8: MDPs II',
  nil(),
  parentCenter(image('images/moving-dice.jpg').width(300)),
_));

add(quizSlide('mdp2-start',
  'If you wanted to go from Orbisonia to Rockhill, how would you get there?',
  'ride bus 1',
  'ride bus 17',
  'ride the magic tram',
_));

prose(
  'In in the previous lecture, you probably had some model of the world (how far Mountain View is, how long biking, driving, and Caltraining each take).',
  'But now, you should have no clue what\'s going on.',
  'This is the setting of <b>reinforcement learning</b>.',
  'Now, you just have to try things and learn from your experience - that\'s life!',
_);

add(slide('Review: MDPs',
  parentCenter(game1MDP()),
  mdpDefinition({pause: false}).scale(0.8),
_));

prose(
  'Last time, we talked about MDPs, which we can think of as graphs, where each node is either a state $s$ or a chance node $(s,a)$.',
  'Actions take us from states to chance nodes (which we choose), and transitions take us from chance nodes to states',
  '(which nature chooses according to the transition probabilities).',
_);

var generalEpisode = '$\\brown{s_0}; a_1, r_1, \\brown{s_1}; a_2, r_2, \\brown{s_2}; a_3, r_3, \\brown{s_3}; \\dots; a_n, r_n, \\brown{s_n}$';

add(slide('Review: MDPs',
  bulletedText('Following a <b>policy</b> $\\pi$ produces a path (<b>episode</b>)'),
  parentCenter(generalEpisode),
  pause(),
  bulletedText('<b>Value</b> function $\\blue{V_\\pi(s)}$: expected utility if follow $\\pi$ from state $s$'),
  pause(),
  parentCenter(nowrapText('$\\displaystyle \\blue{V_\\pi(s)} = \\begin{cases} 0 & \\text{if } \\IsEnd(s) \\\\ \\red{Q_\\pi(s, \\pi(s))} & \\text{otherwise}. \\end{cases}$').scale(0.9)),
  pause(-1),
  bulletedText('<b>Q-value</b> function $\\red{Q_\\pi(s, a)}$: expected utility if first take action $a$ from state $s$ and then follow $\\pi$'),
  pause(),
  parentCenter(nowrapText('$\\red{Q_\\pi(s, a)} = \\sum_{s\'} T(s, a, s\') [\\Reward(s, a, s\') + \\gamma \\blue{V_\\pi(s\')}]$')).scale(0.9),
_));

prose(
  'Given a policy $\\pi$ and an MDP, we can run the policy on the MDP',
  'yielding a sequence of states, action, rewards $s_0; a_1, r_1, s_1; a_2, r_2, s_2; \\dots$.',
  'Formally, for each time step $t$, $a_t = \\pi(s_{t-1})$, and $s_t$ is sampled with probability $T(s_{t-1}, a_t, s_t)$.',
  'We call such a sequence an <b>episode</b> (a path in the MDP graph).',
  'This will be a central notion in this lecture.',
  _,
  'Each episode (path) is associated with a utility, which is the discounted sum of rewards:',
  '$u_1 = r_1 + \\gamma r_2 + \\gamma^2 r_3 + \\cdots$.',
  'It\'s important to remember that the utility $u_1$ is a <b>random variable</b> which depends on how the transitions were sampled.',
  _,
  'The value of the policy (from state $s_0$) is $V_\\pi(s_0) = \\E[u_1]$, the expected utility.',
  'In the last lecture, we worked with the values directly without worrying about the underlying random variables',
  '(but that will soon no longer be the case).',
  'In particular, we defined recurrences relating the value $V_\\pi(s)$ and Q-value $Q_\\pi(s, a)$,',
  'which represents the expected utility from starting at the corresponding nodes in the MDP graph.',
  _,
  'Given these mathematical recurrences, we produced algorithms: policy evaluation computes the value of a policy,',
  'and value iteration computes the optimal policy.',
_);

add(slide('Unknown transitions and rewards',
  stagger(
    mdpDefinition({pause: false}),
    mdpDefinition({pause: false, rl: true}),
  _),
  parentCenter(redbold('reinforcement learning!')),
_));

prose(
  'In this lecture, we assume that we have an MDP where we neither know the transitions nor the reward functions.',
  'We are still trying to maximize expected utility, but we are in a much more difficult setting',
  'called <b>reinforcement learning</b>.',
_);

function RLGame(options) {
  var utility = 0;
  var utilityBox = wrap(utility);
  var startPosition = 5;
  var position = startPosition;
  var hit = 0;
  var stateBox = wrap(position+','+hit);

  var aButton = frame('A').padding(3).bg.fillColor('red').strokeWidth(2).round(10).end;
  var bButton = frame('B').padding(3).bg.fillColor('blue').strokeWidth(2).round(10).end;
  var clearButton = frame('Start').padding(3).bg.fillColor('white').strokeWidth(2).round(10).end;
  var n = 0;
  var gameOver = false;

  function endGame() {
    gameOver = true;
    utilityBox.resetContent(redbold('<ins>'+utility+'</ins>'));
    aButton.opacity(0.2);
    bButton.opacity(0.2);
  }

  function move(d) {
    if (gameOver) return;
    n++;
    position += d;
    utility -= 1;
    if (position == 10) {
      position = 9;
    }
    if (position == -1) {
      position = 0;
    }
    if (position == 9) {
      hit = 1;
    }
    utilityBox.resetContent(utility);

    if (hit == 1 && position == 0) {
      utility += 100;
      utilityBox.resetContent(utility);
      endGame();
    }
    stateBox.resetContent(position+','+hit);
    prez.refresh();
  }

  aButton.onClick(function() {
    move(-1);
  }).setPointerWhenMouseOver();

  bButton.onClick(function() {
    move(+1);
  }).setPointerWhenMouseOver();

  clearButton.onClick(function() {
    Math.seedrandom();
    n = 0;
    utility = 0;
    position = startPosition;
    hit = 0;
    gameOver = false;
    stateBox.resetContent(position+','+hit);
    utilityBox.resetContent(utility);
    aButton.opacity(1);
    bButton.opacity(1);
    prez.refresh();
  }).setPointerWhenMouseOver();

  return ytable(
    xtable(clearButton, aButton, bButton).margin(50),
    xtable(
      xtable('State:', frameBox(stateBox)).center(),
      xtable('Rewards:', frameBox(utilityBox)).center(),
    _).margin(50).center(),
  _).margin(20).center();
}

function mysteryDescription() {
  return example('mystery buttons',
    'For each round $r = 1, 2, \\dots$',
    bulletedText([null,
      'You choose '+red('A')+' or '+blue('B')+'.',
      'You move to a new state and get some rewards.',
    ]),
  _);
}

add(slide('Mystery game',
  mysteryDescription(),
  parentCenter(RLGame()),
_));

prose(
  'To put yourselves in the shoes of a reinforcement learner,',
  'try playing the game.',
  'You can either push the A button or the B button.',
  'Each of the two actions will take you a new state and give you some reward.',
  _,
  'This simple game illustrates some of the challenges of reinforcement learning:',
  'we should take good actions to get rewards, but in order to know which actions are good, we need to explore',
  'and try different actions.',
_);

function roadmap(i) {
  add(outlineSlide('Roadmap', i, [
    ['rl', 'Reinforcement learning'],
    ['monteCarlo', 'Monte Carlo methods'],
    ['bootstrapping', 'Bootstrapping methods'],
    ['unknown', 'Covering the unknown'],
    ['summary', 'Summary'],
  ]));
}

////////////////////////////////////////////////////////////
// Reinforcement learning
roadmap(0);

add(slide('From MDPs to reinforcement learning',
  table([
    image('images/thinker.png').width(100),
    importantBox(bluebold('Markov decision process (offline)'),
      bulletedText('Have mental model of how the world works.').width(500).autowrap(true),
      bulletedText('Find policy to collect maximum rewards.').width(500).autowrap(true),
    _).content.margin(20).end,
    pause(),
  ], [
    image('images/running.jpg').width(150),
    importantBox(redbold('Reinforcement learning (online)'),
      bulletedText('Don\'t know how the world works.').autowrap(true).width(500),
      bulletedText('Perform actions in the world to find out and collect rewards.').width(500).autowrap(true),
    _).content.margin(20).end,
  ]).margin(20).center(),
_));

prose(
  'An important distinction between solving MDPs (what we did before) and reinforcement learning (what we will do now)',
  'is that the former is <b>offline</b> and the latter is <b>online</b>.',
  _,
  'In the former case, you have a mental model of how the world works. You go lock yourself in a room,',
  'think really hard, come up with a policy.  Then you come out and use it to act in the real world.',
  _,
  'In the latter case, you don\'t know how the world works, but you only have one life, so you just have to go out',
  'into the real world and learn how it works from experiencing it and trying to take actions that yield high rewards.',
  _,
  'At some level, reinforcement learning is really the way humans work:',
  'we go through life, taking various actions, getting feedback.',
  'We get rewarded for doing well and learn along the way.',
_);

function rlTemplate() {
  return algorithm('reinforcement learning template',
    'For $t = 1, 2, 3, \\dots$',
    indent('Choose action $a_t = \\pi_\\text{act}(s_{t-1})$ ('+redbold('how?')+')'),
    indent('Receive reward $r_t$ and observe new state $s_t$'),
    indent('Update parameters ('+redbold('how?')+')'),
  _);
}

add(slide('Reinforcement learning framework',
  parentCenter(overlay(
    xtable(
      frameBox('agent').ypadding(80),
      ytable(a = rightArrow(300), b = leftArrow(300)).margin(50),
      frameBox('environment').ypadding(80),
    _).center(),
    moveTopOf('action $a$', a),
    moveBottomOf('reward $r$, new state $s\'$', b),
  _)),
  rlTemplate(),
_));

prose(
  'To make the framework clearer, we can think of an <b>agent</b> (the reinforcement learning algorithm)',
  'that repeatedly chooses an action $a_t$ to perform in the environment, and receives some reward $r_t$,',
  'and information about the new state $s_t$.',
  _,
  'There are two questions here: how to choose actions (what is $\\pi_\\text{act}$) and how to update the parameters.',
  'We will first talk about updating parameters (the learning part), and then come back to action selection later.',
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
    'slipProb = 0.1  // If slip, go in random direction',
    'discount = 1  // How much to value the future',
    '',
    '// Run algorithms on model',
    'numIters = 0  // # iterations of value iteration',
    'numEpisodes = 1  // # simulations',
  ]}),
_));

prose(
  'Recall the volcano crossing example from the previous lecture.',
  'Each square is a state.',
  'From each state, you can take one of four actions to move to an adjacent state: north (N), east (E), south (S), or west (W).',
  'If you try to move off the grid, you remain in the same state.',
  'The starting state is (2,1), and the end states are the four marked with red or green rewards.',
  'Transitions from $(s,a)$ lead where you expect with probability <tt>1-slipProb</tt> and to a random adjacent square with probability <tt>slipProb</tt>.',
  _,
  'If we solve the MDP using value iteration (by setting <tt>numIters</tt> to 10),',
  'we will find the best policy (which is to head for the 20).',
  'Of course, we can\'t solve the MDP if we don\'t know the transitions or rewards.',
  _,
  'If you set <tt>numIters</tt> to zero, we start off with a random policy.',
  'Try pressing the Run button to generate fresh episodes.',
  'How can we learn from this data and improve our policy?',
_);

////////////////////////////////////////////////////////////
// Monte Carlo
roadmap(1);

add(slide('Model-based Monte Carlo',
  stmt('Data: ' + generalEpisode),
  pause(),
  keyIdea('model-based learning',
    'Estimate the MDP: $T(s, a, s\')$ and $\\Reward(s, a, s\')$',
  _),
  pause(),
  stmt('Transitions'),
  parentCenter('$\\hat T(s, a, s\') = \\frac{\\text{# times $(s,a,s\')$ occurs}}{\\text{# times $(s,a)$ occurs}}$'),
  pause(),
  stmt('Rewards'),
  parentCenter('$\\widehat{\\Reward}(s, a, s\') = \\text{average of } r \\text{ in } (s,a,r,s\')$'),
_));

add(slide('Model-based Monte Carlo',
  example('model-based Monte Carlo',
    stmt('Data (following policy $\\pi$)'),
    indent(stagger(
      nowrapText('<b>S1</b>; A, 3, <b>S2</b>; B, 0, <b>S1</b>; A, 5, <b>S1</b>; A, 7, <b>S1</b>'),
      nowrapText(redbold('<b>S1</b>; A')+', 3, <b>S2</b>; B, 0, '+redbold('<b>S1</b>; A')+', 5, '+redbold('<b>S1</b>; A')+', 7, <b>S1</b>'),
      nowrapText('<b>S1</b>; A, 3, '+greenbold('<b>S2</b>')+'; B, 0, <b>S1</b>; A, 5, '+greenbold('<b>S1</b>')+'; A, 7, '+greenbold('<b>S1</b>')),
    _)),
    pause(),
    yspace(20),
    stmt('Estimates'),
    indent(ytable(
      nowrapText('$\\hat T(\\text{S1}, \\text{A}, \\text{S1}) = \\frac23$'),
      nowrapText('$\\hat T(\\text{S1}, \\text{A}, \\text{S2}) = \\frac13$'),
      nowrapText('$\\widehat \\Reward(\\text{S1}, \\text{A}, \\text{S1}) = \\frac12(5 + 7) = 6$'),
      nowrapText('$\\widehat \\Reward(\\text{S1}, \\text{A}, \\text{S2}) = 3$'),
    _)),
  _),
  pause(),
  'Estimates converge to true values (under certain conditions)',
_));

prose(
  'The first idea is called <b>model-based</b> Monte Carlo,',
  'where we try to estimate the model (transitions and rewards) using Monte Carlo simulation.',
  _,
  'Note: if the rewards are deterministic, then every time we see a $(s, a, s\')$ triple, we get the same number',
  'so taking the average just returns that number; allowing averages allows us to handle non-deterministic rewards,',
  'in which case $\\widehat \\Reward(s, a, s\')$ would converge to its expectation.',
  _,
  'Monte Carlo is a standard way to estimate the expectation of a random variable by taking an average',
  'over samples of that random variable.',
  _,
  'Here, the data used to estimate the model is the sequence of states, actions, and rewards in the episode.',
  'Note that the samples being averaged are not independent (because they come from the same episode),',
  'but they do come from a Markov chain, so it can be shown that these estimates converge to the expectations',
  'by the ergodic theorem (a generalization of the law of large numbers for Markov chains).',
  _,
  'But there is one important caveat...',
_);

add(slide('Problem',
  stmt('Data (following policy $\\pi$)'),
  indent('<b>S1</b>; A, 3, <b>S2</b>; B, 0, <b>S1</b>; A, 5, <b>S1</b>; A, 7, <b>S1</b>'),
  pause(),
  stmt('Problem: won\'t even see $(s,a)$ if $a \\neq \\pi(s)$'),
  pause(),
  keyIdea('exploration',
    'To do reinforcement learning, need to explore the state space.',
  _),
  pause(),
  stmt('Solution: need $\\pi$ to <b>explore</b> explicitly (more on this later)'),
_));

prose(
  'So far, our policies have been deterministic, mapping $s$ always to $\\pi(s)$.',
  'However, if we use such a policy to generate our data, there are certain $(s,a)$ pairs that we will never see',
  'and therefore never be able to estimate their Q-value and never know what the effect of those actions are.',
  _,
  'This problem points at the most important characteristic of reinforcement learning, which is the need for <b>exploration</b>.',
  'This distinguishes reinforcement learning from supervised learning, because now we actually have to act to get data,',
  'rather than just having data poured over us.',
  _,
  'To close off this point, we remark that if $\\pi$ is a non-deterministic policy which allows us to explore each state and action infinitely often (possibly over multiple episodes),',
  'then the estimates of the transitions and rewards will converge.',
  _,
  'Once we get an estimate for the transitions and rewards,',
  'we can simply plug them into our MDP and solve it using standard value or policy iteration to produce a policy.',
  _,
  'Notation: we put hats on quantities that are estimated from data ($\\hat Q_\\opt, \\hat T$) to distinguish from the true quantities ($Q_\\opt, T$).',
_);

add(slide('From model-based to model-free',
  parentCenter(nowrapText('$\\displaystyle \\hat Q_\\opt(s, a) = \\sum_{s\'} \\red{\\hat T(s, a, s\')} [\\red{\\widehat{\\Reward}(s, a, s\')} + \\gamma \\hat V_\\opt(s\')]$').scale(0.9)),
  pause(),
  'All that matters for prediction is (estimate of) $Q_\\opt(s, a)$.',
  keyIdea('model-free learning',
    'Try to estimate $Q_\\opt(s, a)$ directly.',
  _),
_));

prose(
  'Taking a step back, if our goal is to just find good policies, all we need is to get a good estimate of $\\hat Q_\\opt$.',
  'From that perspective, estimating the model (transitions and rewards) was just a means towards an end.',
  'Why not just cut to the chase and estimate $\\hat Q_\\opt$ directly?',
  'This is called <b>model-free</b> learning, where we don\'t explicitly estimate the transitions and rewards.',
_);

add(slide('Model-free Monte Carlo',
  stmt('Data (following policy $\\pi$)'),
  parentCenter(generalEpisode),
  pause(),
  stmt('Recall'),
  indent('$Q_\\pi(s, a)$ is expected utility starting at $s$, first taking action $a$, and then following policy $\\pi$'),
  pause(),
  stmt('Utility'),
  indent('$u_t = r_t + \\gamma \\cdot r_{t+1} + \\gamma^2 \\cdot r_{t+2} + \\cdots$'),
  pause(),
  stmt('Estimate'),
  indent('$\\hat Q_\\pi(s, a) = \\text{average of } u_t \\text{ where } s_{t-1} = s, a_t = a$'),
_));

add(slide('Model-free Monte Carlo',
  example('model-free Monte Carlo',
    stmt('Data'),
    stagger(
      indent('<b>S1</b>; A, 3, <b>S2</b>; B, 0, <b>S1</b>; A, 5, <b>S1</b>; A, 7, <b>S1</b>'),
      indent(redbold('<b>S1</b>')+'; A, '+redbold('3')+', <b>S2</b>; B, '+redbold('0')+', <b>S1</b>; A, '+redbold('5')+', <b>S1</b>; A, '+redbold('7')+', <b>S1</b>'),
      indent('<b>S1</b>'+'; A, '+'3'+', <b>S2</b>; B, '+'0'+', '+redbold('<b>S1</b>')+'; A, '+redbold('5')+', <b>S1</b>; A, '+redbold('7')+', <b>S1</b>'),
      indent('<b>S1</b>'+'; A, '+'3'+', <b>S2</b>; B, '+'0'+', '+'<b>S1</b>'+'; A, '+'5'+', '+redbold('<b>S1</b>')+'; A, '+redbold('7')+', <b>S1</b>'),
    _),
    pause(),
    yspace(20),
    stmt('Estimates (assume $\\gamma = 1$)'),
    indent(ytable(
      nowrapText('$\\hat Q_\\pi(\\text{S1}, \\text{A}) = \\frac13(15 + 12 + 7) \\approxeq 11.33$'),
    _)),
  _),
  pause(),
  stmt('Caveat: converges, but still need to follow $\\pi$ that explores'),
  pause(),
  stmt('Note: we are estimating $Q_\\pi$ now, not $Q_\\opt$'),
_));

prose(
  'Recall that $Q_\\pi(s, a)$ is the expected utility starting at $s$, taking action $a$, and the following $\\pi$.',
  _,
  'In terms of the data, define $u_t$ to be the discounted sum of rewards starting with $r_t$.',
  _,
  'Observe that $Q_\\pi(s_{t-1}, a_t) = \\E[u_t]$;',
  'that is, if we\'re at state $s_{t-1}$ and take action $a_t$, the average value of $u_t$ is $Q_\\pi(s_{t-1}, a_t)$.',
  _,
  'But that particular state and action pair $(s,a)$ will probably show up many times.',
  'If we take the average of $u_t$ over all the times that $s_{t-1}=s$ and $a_t=a$,',
  'then we obtain our Monte Carlo estimate $\\hat Q_\\pi(s, a)$.',
  'Note that nowhere do we need to talk about transitions or immediate rewards; the only thing that matters is total rewards resulting from $(s,a)$ pairs.',
  _,
  'Model-free Monte Carlo depends strongly on the policy $\\pi$ that is followed; after all it\'s computing $Q_\\pi$.',
  'Because the value being computed is dependent on the policy used to generate the data, we call this an <b>on-policy</b> algorithm.',
  'In contrast, model-based Monte Carlo is <b>off-policy</b>, because the model we estimated did not depend on the exact policy (as long as it was able to explore all $(s,a)$ pairs).',
_);

add(slide('Model-free Monte Carlo (equivalences)',
  stmt('Data (following policy $\\pi$)'),
  parentCenter(generalEpisode),
  pause(),
  importantBox('Original formulation',
    indent(nowrapText('$\\hat Q_\\pi(s, a) = \\text{average of } u_t \\text{ where } s_{t-1} = s, a_t = a$')),
  _),
  pause(),
  importantBox('Equivalent formulation (convex combination)',
    'On each $(s, a, u)$:',
    indent(nowrapText('$\\blue{\\eta} = \\frac{1}{1 + (\\text{# updates to $(s,a)$})}$')),
    indent(nowrapText('$\\hat Q_\\pi(s, a) \\leftarrow \\blue{(1 - \\eta)} \\hat Q_\\pi(s, a) + \\blue{\\eta} u$')),
  _),
  parentCenter('[whiteboard: $u_1, u_2, u_3$]'),
_));

prose(
  'Over the next few slides, we will interpret model-free Monte Carlo in several ways.',
  'This is the same algorithm, just viewed from different perspectives.',
  'This will give us some more intuition and allow us to develop other algorithms later.',
  _,
  'The first interpretation is thinking in terms of <b>interpolation</b>.',
  'Instead of thinking of averaging as a batch operation that takes a list of numbers (realizations of $u_t$) and computes the mean,',
  'we can view it as an iterative procedure for building the mean as new numbers are coming in.',
  _,
  'In particular, it\'s easy to work out for a small example that averaging is equivalent to just',
  'interpolating between the old value $\\hat Q_\\pi(s,a)$ (current estimate) and the new value $u$ (data).',
  'The interpolation ratio $\\eta$ is set carefully so that $u$ contributes exactly the right amount to the average.',
  _,
  'But we could use a different choice of $\\eta$.',
  'In practice, it is useful to set $\\eta$ to something that doesn\'t decay as quickly',
  '(for example, $\\eta = 1/\\sqrt{\\text{# updates to $(s,a)$}}$)',
  'so that newer examples are favored.',
  'The motivation is that as learning proceeds, later samples $u_t$ will be more reliable than earlier ones.',
_);

add(slide('Model-free Monte Carlo (equivalences)',
  importantBox('Equivalent formulation (convex combination)',
    'On each $(s, a, u)$:',
    indentNowrapText('$\\hat Q_\\pi(s, a) \\leftarrow (1 - \\eta) \\red{\\hat Q_\\pi(s, a)} + \\eta \\green{u}$'),
  _),
  pause(),
  importantBox('Equivalent formulation (stochastic gradient)',
    'On each $(s, a, u)$:',
    indentNowrapText('$\\hat Q_\\pi(s, a) \\leftarrow \\hat Q_\\pi(s, a) - \\eta [\\red{\\underbrace{\\hat Q_\\pi(s, a)}_\\text{prediction}} - \\green{\\underbrace{u}_\\text{target}}]$'),
    pause(),
    stmt('Implied objective: least squares regression'),
    parentCenter('$\\displaystyle (\\hat Q_\\pi(s,a) - u)^2$').scale(0.9),
  _).scale(0.9),
_));

prose(
  'The second equivalent formulation is making the update look like a stochastic gradient update.',
  'Indeed, if think about each $(s, a, u)$ triple as an example (where $(s,a)$ is the input and $u$ is the output),',
  'then the model-free Monte Carlo is just performing stochastic gradient descent on a least squares regression problem,',
  'where the weight vector is $\\hat Q_\\pi$ (which has dimensionality $S A$) and there is one feature template "$(s,a)$ equals ___".',
  _,
  'The stochastic gradient descent view will become particularly relevant when we use non-trivial features on $(s,a)$.',
_);

add(slide('Volcanic model-free Monte Carlo',
  nil(),
  volcanoDemo({origInput: [
    '// Model',
    'moveReward = 0  // For every action you take',
    'passReward = 20  // If get to far green',
    'volcanoReward = -50  // If fall into volcano',
    'slipProb = 0  // If slip, go in random direction',
    'discount = 1  // How much to value the future',
    '',
    '// Algorithms',
    'numEpisodes = 1  // # simulations',
    'eta = 0.5  // step size',
    'epsilon = 1  // exploration probability',
    'rl = "monte-carlo"  // "monte-carlo", "sarsa", "q"',
  ], epsilon: 0.5, showQValues: true}),
_));

prose(
  'Let\'s run model-free Monte Carlo on the volcano crossing example.',
  '<tt>slipProb</tt> is zero to make things simpler.',
  'We are showing the Q-values: for each state, we have four values, one for each action.',
  _,
  'Here, our exploration policy is one that chooses an action uniformly at random.',
  _,
  'Try pressing "Run" multiple times to understand how the Q-values are set.',
  _,
  'Then try increasing <tt>numEpisodes</tt>, and seeing how the Q-values of this policy become more accurate.',
  _,
  'You will notice that a random policy has a very hard time reaching the 20.',
_);

////////////////////////////////////////////////////////////
// Bootstrapping methods
roadmap(2);

add(slide('SARSA',
  stmt('Data (following policy $\\pi$)'),
  parentCenter(generalEpisode),
  pause(),
  algorithm('model-free Monte Carlo updates',
    'When receive $(s, a, u)$:',
    indent('$\\hat Q_\\pi(s, a) \\leftarrow (1 - \\eta) \\hat Q_\\pi(s, a) + \\eta \\green{\\underbrace{u}_\\text{data}}$'),
  _).scale(0.85),
  pause(),
  algorithm('SARSA',
    'When receive $(s, a, r, s\', a\')$:',
    indent('$\\hat Q_\\pi(s,a) \\leftarrow (1-\\eta) \\hat Q_\\pi(s,a) + \\eta \\green{[\\underbrace{r}_\\text{data} + \\gamma \\underbrace{\\hat Q_\\pi(s\', a\')}_\\text{estimate}]}$'),
  _).scale(0.85),
_));

prose(
  'Broadly speaking, reinforcement learning algorithms interpolate between new data',
  '(which specifies the <b>target</b> value) and the old estimate of the value (the <b>prediction</b>).',
  _,
  'Model-free Monte Carlo\'s target was $u$, the discounted sum of rewards after taking an action.',
  'However, $u$ itself is just an estimate of $Q_\\pi(s,a)$.',
  'If the episode is long, $u$ will be a pretty lousy estimate.',
  'This is because $u$ only corresponds to one episode out of a mind-blowing exponential (in the episode length) number of possible episodes,',
  'so as the epsiode lengthens, it becomes an increasingly less representative sample of what could happen.',
  'Can we produce better estimate of $Q_\\pi(s,a)$?',
  _,
  'An alternative to model-free Monte Carlo is SARSA,',
  'whose target is $r + \\gamma \\hat Q_\\pi(s,a)$.',
  'Importantly, SARSA\'s target is a combination of the data (the first step) and the estimate (for the rest of the steps).',
  'In contrast, model-free Monte Carlo\'s $u$ is taken purely from the data.',
_);

add(slide('Comparison',
  parentCenter(generalEpisode),
  keyIdea('bootstrapping',
    'SARSA uses estimate $\\hat Q_\\pi(s,a)$ instead of just raw data $u$.',
  _),
  pause(),
  bulletedText('$u$ is only based on one path, so could have large variance, need to wait until end').autowrap(true),
  bulletedText('$\\hat Q_\\pi(s\',a\')$ based on estimate, which is more stable, update immediately').autowrap(true),
  //pause(),
  //bulletedText('In practice, SARSA can work better').autowrap(true),
_));

prose(
  'The main advantage that SARSA offers over model-free Monte Carlo is that',
  'we don\'t have to wait until the end of the episode to update the Q-value.',
  //'On the other hand, the updates that SARSA makes based on its estimate will not be very good early on in learning.',
  _,
  'If the estimates are already pretty good, then SARSA will be more reliable since $u$ is based on only one path',
  'whereas $\\hat Q_\\pi(s\',a\')$ is based on all the ones that the learner has seen before.',
  _,
  'Advanced: We can actually interpolate between model-free Monte Carlo (all rewards) and SARSA (one reward).',
  'For example, we could update towards $r_t + \\gamma r_{t+1} + \\gamma^2 \\hat Q_\\pi(s_{t+1}, a_{t+2})$ (two rewards).',
  'We can even combine all of these updates, which results in an algorithm called SARSA($\\lambda$),',
  'where $\\lambda$ determines the relative weighting of these targets.',
  'See the Sutton/Barto reinforcement learning book (chapter 7) for an excellent introduction.',
  _,
  'Advanced: There is also a version of these algorithms that estimates the value function $V_\\pi$ instead of $Q_\\pi$.',
  'Value functions aren\'t enough to choose actions unless you actually know the transitions and rewards.',
  'Nonetheless, these are useful in game playing where we actually know the transition and rewards,',
  'but the state space is just too large to compute the value function exactly.',
_);

add(quizSlide('mdp2-qpi',
  'Which of the following algorithms allows you to estimate $Q_\\text{opt}(s,a)$ (select all that apply)?',
  'model-based Monte Carlo',
  'model-free Monte Carlo',
  'SARSA',
_));

prose(
  'Model-based Monte Carlo estimates the transitions and rewards, which fully specifies the MDP.',
  'With the MDP, you can estimate anything you want, including computing $Q_\\opt(s,a)$',
  _,
  'Model-free Monte Carlo and SARSA are on-policy algorithms, so they only give you $\\hat Q_\\pi(s,a)$,',
  'which is specific to a policy $\\pi$.  These will not provide direct estimates of $Q_\\opt(s,a)$.',
_);

add(slide('Q-learning',
  stmt('Problem: model-free Monte Carlo and SARSA only estimate $Q_\\pi$, but want $Q_\\opt$ to act optimally'),
  pause(),
  parentCenter(frameBox(table(
    ['Output', 'MDP', 'reinforcement learning'].map(bold),
    ['$Q_\\pi$', 'policy evaluation', 'model-free Monte Carlo, SARSA'],
    ['$Q_\\opt$', 'value iteration', pause(), redbold('Q-learning')],
  _).margin(30, 5)).scale(0.9)),
_));

prose(
  'Recall our goal is to get an optimal policy, which means estimating $Q_\\opt$.',
  _,
  'The situation is as follows:',
  'Our two methods (model-free Monte Carlo and SARSA) are model-free, but only produce estimates $Q_\\pi$.',
  'We have one algorithm, model-based Monte Carlo, which can be used to produce estimates of $Q_\\opt$, but is model-based.',
  'Can we get an estimate of $Q_\\opt$ in a model-free manner?',
  _,
  'The answer is yes, and Q-learning is an <b>off-policy</b> algorithm that accomplishes this.',
  _,
  'One can draw an analogy between reinforcement learning algorithms and the classic MDP algorithms.',
  'MDP algorithms are offline, RL algorithms are online.',
  'In both cases, algorithms either output the Q-values for a fixed policy or the optimal Q-values.',
_);

add(slide('Q-learning',
  stmt('MDP recurrence'),
  parentCenter(nowrapText('$\\displaystyle Q_\\opt(s, a) = \\sum_{s\'} T(s, a, s\') [\\green{\\Reward(s, a, s\') + \\gamma V_\\opt(s\')}]$').scale(0.9)),
  pause(),
  algorithm('Q-learning [Watkins/Dayan, 1992]',
    'On each $(s, a, r, s\')$:',
    pause(),
    parentCenter(nowrapText('$\\displaystyle \\hat Q_\\opt(s, a) \\leftarrow (1-\\eta) \\red{\\underbrace{\\hat Q_\\opt(s, a)}_\\text{prediction}} + \\eta \\green{\\underbrace{(r + \\gamma \\hat V_\\opt(s\'))}_\\text{target}}]$').scale(0.9)),
    pause(),
    stmt('Recall: $\\displaystyle \\hat V_\\opt(s\') = \\purple{\\max_{a\' \\in \\Actions(s\')}} \\hat Q_\\opt(s\', a\')$'),
  _),
_));

prose(
  'To derive Q-learning, it is instructive to look back at the MDP recurrence for $Q_\\opt$.',
  'There are several changes that take us from the MDP recurrence to Q-learning.',
  'First, we don\'t have an expectation over $s\'$, but only have one sample $s\'$.',
  _,
  'Second, because of this, we don\'t want to just replace $\\hat Q_\\opt(s,a)$ with the target value,',
  'but want to interpolate between the old value (prediction) and the new value (target).',
  _,
  'Third, we replace the actual reward $\\Reward(s,a,s\')$ with the observed reward $r$',
  '(when the reward function is deterministic, the two are the same).',
  _,
  'Finally, we replace $V_\\opt(s\')$ with our current estimate $\\hat V_\\opt(s\')$.',
  _,
  'Importantly, the estimated optimal value $\\hat V_\\opt(s\')$ involves a maximum over actions',
  'rather than taking the action of the policy.',
  'This max over $a\'$ rather than taking the $a\'$ based on the current policy',
  'is the principle difference between Q-learning and SARSA.',
_);

add(slide('Volcanic SARSA and Q-learning',
  nil(),
  volcanoDemo({origInput: [
    '// Model',
    'moveReward = 0  // For every action you take',
    'passReward = 20  // If get to far green',
    'volcanoReward = -50  // If fall into volcano',
    'slipProb = 0  // If slip, go in random direction',
    'discount = 1  // How much to value the future',
    '',
    '// Algorithms',
    'numEpisodes = 1  // # simulations',
    'eta = 0.5  // step size',
    'epsilon = 1  // exploration probability',
    'rl = "sarsa"  // "monte-carlo", "sarsa", "q"',
  ], epsilon: 0.5, showQValues: true}),
_));

prose(
  'Let us try SARSA and Q-learning on the volcanic example.',
  _,
  'If you increase <tt>numEpisodes</tt> to 1000,',
  'SARSA will behave very much like model-free Monte Carlo, computing the value of the random policy.',
  _,
  'However, note that Q-learning is computing an estimate of $Q_\\opt(s,a)$, so the resulting Q-values will be very different.',
  'The average utility will not change since we are still following and being evaluated on the same random policy.',
  'This is an important point for <b>off-policy</b> methods: the online performance (average utility) is generally a lot worse',
  'and not representative of what the model has learned, which is captured in the estimated Q-values.',
_);

////////////////////////////////////////////////////////////
// Unseen
roadmap(3);

add(slide('Exploration',
  rlTemplate(),
  pause(),
  parentCenter(generalEpisode),
  pause(),
  'Which <b>exploration policy</b> $\\pi_\\text{act}$ to use?',
_).leftHeader(image('images/Cantino_Planisphere.jpg').width(300)));

prose(
  'We have so far given many algorithms for updating parameters (i.e., $\\hat Q_\\pi(s, a)$ or $\\hat Q_\\opt(s,a)$).',
  'If we were doing supervised learning, we\'d be done,',
  'but in reinforcement learning, we need to actually determine our <b>exploration policy</b> $\\pi_\\text{act}$',
  'to collect data for learning.',
  'Recall that we need to somehow make sure we get information about each $(s,a)$.',
  _,
  'We will discuss two complementary ways to get this information:',
  '(i) explicitly explore $(s,a)$ or (ii) explore $(s,a)$ implicitly by actually exploring $(s\',a\')$ with similar features and generalizing.',
  _,
  'These two ideas apply to many RL algorithms, but let us specialize to Q-learning.',
_);

add(slide('No exploration, all exploitation',
  stmt('Attempt 1', 'Set $\\displaystyle \\pi_\\text{act}(s) = \\arg\\max_{a \\in \\Actions(s)} \\hat Q_\\opt(s, a)$'), pause(),
  volcanoDemo({origInput: [
    'passReward = 100',
    '',
    'numEpisodes = 1000  // # simulations',
    'epsilon = 0  // all exploitation',
    'rl = "q"  // Q-learning',
  ], showQValues: true}),
  pause(),
  stmt('Problem', '$\\hat Q_\\opt(s, a)$ estimates are inaccurate, <b><font color="red">too greedy</font></b>!'),
_));

prose(
  'The naive solution is to explore using the optimal policy according to the estimated Q-value $\\hat Q_\\opt(s,a)$.',
  _,
  'But this fails horribly.',
  'In the example, once the agent discovers that there is a reward of $2$ to be gotten by going south',
  'that becomes its optimal policy and it will not try any other action.',
  'The problem is that the agent is being too greedy.',
  _,
  'In the demo, if multiple actions have the same maximum Q-value, we choose randomly.',
  'Try clicking "Run" a few times, and you\'ll end up with minor variations.',
  _,
  'Even if you increase <tt>numEpisodes</tt> to 10000, nothing new gets learned.',
_);

add(slide('No exploitation, all exploration',
  stmt('Attempt 2', 'Set $\\pi_\\text{act}(s) = \\text{random from } \\Actions(s)$'), pause(),
  volcanoDemo({origInput: [
    'passReward = 100',
    '',
    'numEpisodes = 1000  // # simulations',
    'epsilon = 1  // all exploration',
    'rl = "q"  // Q-learning',
  ], showQValues: true}),
  pause(),
  stmt('Problem', 'average utility is low because exploration is <b><font color="red">not guided</font></b>'),
_));

prose(
  'We can go to the other extreme and use an exploration policy that always chooses a random action.',
  'It will do a much better job of exploration, but it doesn\'t exploit what it learns and ends up with a very low utility.',
  _,
  'It is interesting to note that the value (average over utilities across all the episodes) can be quite small and yet the Q-values can be quite accurate.',
  'Recall that this is possible because Q-learning is an off-policy algorithm.',
_);

add(slide('Exploration/exploitation tradeoff',
  keyIdea('balance',
    'Need to balance <b><font color="red">exploration</font></b> and <b><font color="green">exploitation</font></b>.',
  _),
  parentCenter(image('images/balance.jpg').width(150)),
  pause(),
  stmt('Examples from life', 'restaurants, routes, research'),
_));

add(slide('Epsilon-greedy',
  algorithm('epsilon-greedy policy',
    parentCenter(nowrapText('$\\displaystyle \\pi_\\text{act}(s) = \\begin{cases} \\arg\\max_{a \\in \\Actions} \\hat Q_\\opt(s, a) & \\text{probability } 1-\\epsilon, \\\\ \\text{random from } \\Actions(s) & \\text{probability } \\epsilon. \\end{cases}$')).scale(0.8),
  _),
  pause(), 
  volcanoDemo({origInput: [
    'passReward = 100',
    '',
    'numEpisodes = 1000  // # simulations',
    'epsilon = [1, 0.5, 0]  // balance',
    'rl = "q"  // Q-learning',
  ], showQValues: true}),
_));

prose(
  'The natural thing to do when you have two extremes is to interpolate between the two.',
  'The result is the <b>epsilon-greedy</b> algorithm which explores with probability $\\epsilon$ and exploits with probability $1-\\epsilon$.',
  _,
  'Over time, it is natural to let $\\epsilon$ decrease over time.',
  'When you\'re young, you want to explore a lot ($\\epsilon = 1$).',
  'After a certain point, when you feel like you\'ve seen all there is to see, then you start exploiting ($\\epsilon = 0$).',
  _,
  'For example, we let $\\epsilon = 1$ for the first third of the episodes, $\\epsilon = 0.5$ for the second third, and $\\epsilon = 0$ for the final third.',
  'This is not the optimal schedule.  Try playing around with other schedules to see if you can do better.',
_);

add(slide('Generalization',
  stmt('Problem: large state spaces, hard to explore'),
  parentCenter(volcanoExample({numEpisodes: 100, epsilon: 0.5, numRows: 5, numCols: 7, rl: 'q', showQValues: true})),
_));

prose(
  'Now we turn to another problem with vanilla Q-learning.',
  _,
  'In real applications, there can be millions of states,',
  'in which there\'s no hope for epsilon-greedy to explore everything in a reasonable amount of time.',
_);

add(slide('Q-learning',
  stmt('Stochastic gradient update'),
  parentCenter(nowrapText('$\\displaystyle \\hat Q_\\opt(s, a) \\leftarrow \\hat Q_\\opt(s, a) - \\eta [\\red{\\underbrace{\\hat Q_\\opt(s, a)}_\\text{prediction}} - \\green{\\underbrace{(r + \\gamma \\hat V_\\opt(s\'))}_\\text{target}}]$').scale(0.9)),
  pause(),
  'This is <b>rote learning</b>: every $\\hat Q_\\opt(s, a)$ has a different value',
  stmt('Problem: doesn\'t generalize to unseen states/actions'),
_));

prose(
  'If we revisit the Q-learning algorithm, and think about it through the lens of machine learning,',
  'you\'ll find that we\'ve just been memorizing Q-values for each $(s,a)$, treating each pair independently.',
  _,
  'In other words, we haven\'t been generalizing, which is actually one of the most important aspects of learning!',
_);

add(slide('Function approximation',
  keyIdea('linear regression model',
    'Define <b>features</b> $\\blue{\\phi(s, a)}$ and <b>weights</b> $\\blue{\\w}$:',
    indent('$\\hat Q_\\opt(s, a; \\w) = \\blue{\\w} \\cdot \\blue{\\phi(s, a)}$'),
  _),
  pause(),
  example('features for volcano crossing',
    xtable(
      ytable(
        '$\\phi_1(s,a) = \\1[a = \\text{W}]$',
        '$\\phi_2(s,a) = \\1[a = \\text{E}]$',
        '...',
      _),
      pause(),
      ytable(
        '$\\phi_7(s,a) = \\1[s = (5, *)]$',
        '$\\phi_8(s,a) = \\1[s = (*, 6)]$',
        '...',
      _),
    _).margin(50),
  _),
_));

prose(
  '<b>Function approximation</b> fixes this by parameterizing $\\hat Q_\\opt$ by a weight vector and a feature vector,',
  'as we did in linear regression.',
  _,
  'Recall that features are supposed to be properties of the state-action $(s,a)$ pair',
  'that are indicative of the quality of taking action $a$ in state $s$.',
  _,
  'The ramification is that all the states that have similar features will have similar Q-values.',
  'For example, suppose $\\phi$ included the feature $\\1[s = (*, 4)]$.',
  'If we were in state $(1, 4)$, took action $\\text{E}$, and managed to get high rewards,',
  'then Q-learning with function approximation will propagate this positive signal to all positions in column $4$ taking any action.',
  _,
  'In our example, we defined features on actions (to capture that moving east is generally good) and',
  'features on states (to capture the fact that the 6th column is best avoided, and the 5th row is generally a good place to travel to).',
_);

add(slide('Function approximation',
  algorithm('Q-learning with function approximation',
    'On each $(s, a, r, s\')$:',
    pause(),
    parentCenter('$\\displaystyle \\w \\leftarrow \\w - \\eta [\\red{\\underbrace{\\hat Q_\\opt(s, a; \\w)}_\\text{prediction}} - \\green{\\underbrace{(r + \\gamma \\hat V_\\opt(s\'))}_\\text{target}}] \\blue{\\phi(s, a)}$'),
  _).scale(0.95),
  pause(),
  stmt('Implied objective function'),
  parentCenter('$\\displaystyle (\\red{\\underbrace{\\hat Q_\\opt(s, a; \\w)}_\\text{prediction}} - \\green{\\underbrace{(r + \\gamma \\hat V_\\opt(s\'))}_\\text{target}})^2$'),
_));

prose(
  'We now turn our linear regression into an algorithm.',
  'Here, it is useful to adopt the stochastic gradient view of RL algorithms, which we developed a while back.',
  _,
  'We just have to write down the least squares objective and then compute the gradient with respect to $\\w$ now instead of $\\hat Q_\\opt$.',
  'The chain rule takes care of the rest.',
_);

add(slide('Covering the unknown',
  parentCenter(image('images/space.jpg')),
  stmt('Epsilon-greedy: balance the exploration/exploitation tradeoff'),
  stmt('Function approximation: can generalize to unseen states'),
_));

add(summarySlide('Summary so far',
  bulletedText('Online setting: learn and take actions in the real world!'),
  pause(),
  bulletedText('Exploration/exploitation tradeoff'),
  pause(),
  bulletedText('Monte Carlo: estimate transitions, rewards, Q-values from data'),
  pause(),
  bulletedText('Bootstrapping: update towards target that depends on estimate rather than just raw data'),
_));

prose(
  'This concludes the technical part of reinforcement learning.',
  _,
  'The first part is to understand the setup: we are taking good actions in the world both to get rewards under our current model,',
  'but also to collect information about the world so we can learn a better model.',
  'This exposes the fundamental exploration/exploitation tradeoff, which is the hallmark of reinforcement learning.',
  _,
  'We looked at several algorithms: model-based Monte Carlo, model-free Monte Carlo, SARSA, and Q-learning.',
  'There were two complementary ideas here: using Monte Carlo approximation (approximating an expectation with a sample)',
  'and bootstrapping (using the model predictions to update itself).',
_);

////////////////////////////////////////////////////////////
roadmap(4);

add(slide('Challenges in reinforcement learning',
  headerList('Binary classification (sentiment classification, SVMs)',
	  green('Stateless') + ', ' + green('full feedback'),
  _),
  pause(),
  headerList('Reinforcement learning (flying helicopters, Q-learning)',
    red('Stateful') + ', ' + red('partial feedback'),
  _),
  pause(),
  keyIdea('partial feedback',
    'Only learn about actions you take.',
  _),
  pause(),
  keyIdea('state',
    'Rewards depend on previous actions $\\Rightarrow$ can have delayed rewards.',
  _),
_));

/*add(slide('In-between problems',
  stmt('Structured prediction: text reconstruction (structured Perceptron)'),
  parentCenter('stateful, full information'),
  pause(),
  stmt('Multi-armed bandits: advertisement placement (one-shot)'),
  parentCenter('stateless, partial information'),
  parentCenter(image('images/multi-armed-bandit.png').width(200)),
_));*/

add(slide('States and information',
  nil(),
  parentCenter(table(
    [nil(), greenbold('stateless'), redbold('state')],
    [greenbold('full feedback'),
    ytable('supervised learning', '(binary classification)').center(),
    ytable('supervised learning', '(structured prediction)').center()],
    [redbold('partial feedback'),
    'multi-armed bandits',
    frameBox('reinforcement learning')],
  _).center().margin(30)).scale(0.85),
_));

prose(
  'If we compare simple supervised learning (e.g., binary classification) and reinforcement learning,',
  'we see that there are two main differences that make learning harder.',
  _,
  'First, reinforcement learning requires the modeling of state.',
  'State means that the rewards across time steps are related.',
  'This results in <b>delayed rewards</b>, where we take an action',
  'and don\'t see the ramifications of it until much later.',
  _,
  'Second, reinforcement learning requires dealing with partial feedback (rewards).',
  'This means that we have to actively explore to acquire the necessary feedback.',
  _,
  'There are two problems that move towards reinforcement learning, each on a different axis.',
  'Structured prediction introduces the notion of state, but the problem is made easier by the fact that we have full feedback,',
  'which means that for every situation, we know which action sequence is the correct one; there is no need for exploration; we just have to update our weights to favor that correct path.',
  _,
  'Multi-armed bandits require dealing with partial feedback, but do not have the complexities of state.',
  'One can think of a multi-armed bandit problem as an MDP with unknown random rewards and one state.',
  'Exploration is necessary, but there is no temporal depth to the problem.',
_);

/*add(slide('Application: crawling robot',
  stmt('Goal', 'maximize distance travelled by robot'),
  parentCenter(youtube('2iNrJx6IDEo', {cache: true, ext: 'flv'})),
  pause(),
  headerList('Markov decision process (MDP)',
    stmt('States', 'positions (4 possibilities) for each of 2 servos'), pause(),
    stmt('Actions', 'choose a servo, move it up/down'), pause(),
    stmt('Transitions', 'move into new position (<font color="red"><b>unknown</b></font>)'), pause(),
    stmt('Rewards', 'distance travelled (<font color="red"><b>unknown</b></font>)'),
  _),
_).leftHeader('[Francis wyffels]'));

prose(
  'This is a nice application of reinforcement learning, where a robot learns how to walk.',
  _,
  'Note that the physical dynamics of the world are quite complex.',
  'However, in this particular domain, there exists a relatively simply policy.',
  'In these cases, RL is a win.',
_);*/

add(slide('Deep reinforcement learning',
  pause(),
  parentCenter('just use a neural network for $\\hat Q_\\opt(s, a)$'),
  pause(),
  stmt('Playing Atari [Google DeepMind, 2013]'),
  parentCenter(image('images/breakout.jpg').height(150)).linkToUrl('https://www.youtube.com/watch?v=V1eYniJ0Rnk'),
  bulletedText('last 4 frames (images) $\\Rightarrow$ 3-layer NN $\\Rightarrow$ keystroke'),
  bulletedText('$\\epsilon$-greedy, train over 10M frames with 1M replay memory'),
  bulletedText('Human-level performance on some games (breakout), less good on others (space invaders)'),
_));

prose(
  'Recently, there has been a surge of interest in reinforcement learning due to the success of neural networks.',
  'If one is performing reinforcement learning in a simulator,',
  'one can actually generate tons of data, which is suitable for rich functions such as neural networks.',
  _,
  'A recent success story is DeepMind, who successfully trained a neural network to represent the $\\hat Q_\\opt$ function',
  'for playing Atari games.',
  'The impressive part was the lack of prior knowledge involved:',
  'the neural network simply took as input the raw image and outputted keystrokes.',
_);

add(slide('Deep reinforcement learning',
  bulletedText(stmt('Policy gradient: train a policy $\\pi(a \\mid s)$ (say, a neural network) to directly maximize expected reward')),
  bulletedText('Google DeepMind\'s AlphaGo (2016)'),
  parentCenter(image('images/go.jpg').width(100)),
  bulletedText('Andrej Karpathy\'s blog post'),
  parentCenter('http://karpathy.github.io/2016/05/31/rl').linkToUrl('http://karpathy.github.io/2016/05/31/rl'),
_));

prose(
  'One other major class of algorithms we will not cover in this class is <b>policy gradient</b>.',
  'Whereas Q-learning attempts to estimate the value of the optimal policy,',
  'policy gradient methods optimize the policy to maximize expected reward, which is what we care about.',
  'Recall that when we went from model-based methods (which estimated the transition and reward functions)',
  'to model-free methods (which estimated the Q function), we moved closer to the thing that we want.',
  'Policy gradient methods take this farther and just focus on the only object that really matters at',
  'the end of the day, which is the policy that an agent follows.',
  _,
  'Policy gradient methods have been quite successful.',
  'For example, it was one of the components of AlphaGo, Google DeepMind\'s program that beat the world champion at Go.',
  'One can also combine value-based methods with policy-based methods in actor-critic methods to get the best of both worlds.',
  _,
  'There is a lot more to say about deep reinforcement learning.',
  'If you wish to learn more, Andrej Karpathy\'s blog post offers a nice introduction.',
_);

add(slide('Applications',
  side('Autonomous helicopters: control helicopter to do maneuvers in the air', image('images/helicopter.jpg')),
  pause(),
  side('Backgammon: TD-Gammon plays 1-2 million games against itself, human-level performance', image('images/backgammon.jpg')),
  pause(),
  side('Elevator scheduling; send which elevators to which floors to maximize throughput of building', image('images/elevator.jpg')),
  pause(),
  side('Managing datacenters; actions: bring up and shut down machine to minimize time/cost', image('images/datacenter.jpg')),
_));

prose(
  'There are many other applications of RL,',
  'which range from robotics to game playing to other infrastructural tasks.',
  'One could say that RL is so general that anything can be cast as an RL problem.',
  _,
  'For a while, RL only worked for small toy problems or settings where there were a lot of prior knowledge / constraints.',
  'Deep RL &mdash; the use of powerful neural networks with increased compute &mdash;',
  'has vastly expanded the realm of problems which are solvable by RL.',
_);

add(slide(nil(),
  stmt('Markov decision processes: against nature (e.g., Blackjack)'),
  parentCenter(overlay(
    xtable(a = node(), b = node(), ytable(c1 = node(), c2 = node()).margin(20)).margin(50).center(),
    arrow(a, b),
    arrow(b, c1),
    arrow(b, c2),
    moveTopOf(image('images/dice.png').width(50), b),
  _)),
  pause(),
  nil(),
  parentCenter(darkbluebold('Next time...')).scale(1.2),
  stmt('Adversarial games: against opponent (e.g., chess)'),
  parentCenter(overlay(
    xtable(a = node(), b = node(), ytable(c1 = node(), c2 = node()).margin(20)).margin(50).center(),
    arrow(a, b),
    arrow(b, c1),
    arrow(b, c2),
    moveTopOf(image('images/devil.jpg').width(50), b),
  _)),
_));

sfig.initialize();
