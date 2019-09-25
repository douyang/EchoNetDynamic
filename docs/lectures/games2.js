G = sfig.serverSide ? global : this;
G.prez = presentation();

// For two players
sfig.latexMacro('A', 0, '\\text{A}');
sfig.latexMacro('B', 0, '\\text{B}');
sfig.latexMacro('GameValue', 2, 'V(#1,#2)');
sfig.latexMacro('GameValueA', 2, 'V_\\A(#1,#2)');
sfig.latexMacro('GameValueB', 2, 'V_\\B(#1,#2)');
sfig.latexMacro('GameValueTurn', 2, '\\V[#1,#2]');

add(titleSlide('Lecture 10: Games II',
  nil(),
  parentCenter(image('images/pacman.jpg').width(300)),
_));

function roadmap(i) {
  add(outlineSlide('Roadmap', i, [
    ['td', 'TD learning'],
    ['simultaneous', 'Simultaneous games'],
    ['nonZeroSum', 'Non-zero-sum games'],
    ['state', 'State-of-the-art'],
  ]));
}

/*add(quizSlide('games2-start',
  'When playing a one-shot simultaneous game (like rock-paper-scissors), do you do worse if you reveal your strategy (possibly randomized)?',
  'yes',
  'no',
  'depends on the game',
_));*/

add(slide('Review: minimax',
  nil(),
  parentCenter(red('agent') + ' (max) versus ' + blue('opponent') + ' (min)'),
  minmaxGameExample(),
_));

prose(
  'Recall that the central object of study is the game tree.',
  'Game play starts at the root (starting state) and descends to a leaf (end state),',
  'where at each node $s$ (state), the player whose turn it is ($\\Player(s)$) chooses an action $a \\in \\Actions(s)$,',
  'which leads to one of the children $\\Succ(s, a)$.',
  _,
  'The <b>minimax principle</b> provides one way for the agent (your computer program)',
  'to compute a pair of minimax policies',
  'for both the agent and the opponent $(\\pi_\\agent^*, \\pi_\\opp^*)$.',
  _,
  'For each node $s$, we have the minimax value of the game $V_{\\max, \\min}(s)$,',
  'representing the expected utility if both the agent and the opponent play optimally.',
  'Each node where it\'s the agent\'s turn is a max node (right-side up triangle),',
  'and its value is the maximum over the children\'s values.',
  'Each node where it\'s the opponent\'s turn is a min node (upside-down triangle),',
  'and its value is the minimum over the children\'s values.',
  _,
  'Important properties of the minimax policies:',
  'The agent can only decrease the game value (do worse) by changing his/her strategy,',
  'and the opponent can only increase the game value (do worse) by changing his/her strategy.',
_);

add(slide('Review: depth-limited search',
  depthLimitedSchema(),
  parentCenter(nowrapText(limitedDepthSearch).scale(0.65)),
  stmt('Use: at state $s$, call $V_{\\max,\\min}(s, d_\\text{max})$'),
_));

prose(
  'In order to approximately compute the minimax value,',
  'we used a <b>depth-limited search</b>,',
  'where we compute $V_{\\max,\\min}(s, d)$, the approximate value of $s$',
  'if we are only allowed to search to at most depth $d$.',
  _,
  'Each time we hit $d=0$, we invoke an evaluation function $\\Eval(s)$,',
  'which provides a fast reflex way to assess the value of the game at state $s$.',
  _,
  'Having a good evaluation function is one of the most important components of game playing,',
  'and in this lecture, we will consider a method for learning this evaluation function automatically from data.',
_);

////////////////////////////////////////////////////////////
// TD learning
roadmap(0);

add(slide('Evaluation functions',
  stmt('Function approximation'),
  parentCenter('$\\Eval(s) = V(s; \\w)$'),
  pause(),
  stmt('Monte Carlo simulation'),
  parentCenter('$\\Eval(s) = \\hat\\V_{\\agent, \\opp}(s)$'),
  pause(),
  keyIdea('temporal difference (TD) learning',
    'Use Monte Carlo simulations to generate data.',
    'Learn weights $\\w$ of evaluation function from data.',
  _),
  stmt('Ingredients: model, data, learning algorithm'),
_));

prose(
  'Recall that there are two ways of going about creating an evaluation function.',
  'The first way is using function approximation.',
  'For example, the evaluation function could be a linear weighted combination',
  'of some features: $V(s; \\w) = \\w \\cdot \\phi(s)$, which is what we did for reinforcement learning.',
  _,
  'The second way is to use Monte Carlo simulations using some <b>fixed</b> policies',
  '$\\pi_\\agent,\\pi_\\opp$ which are supposed to be approximations of the minimax policies.',
  _,
  'TD learning combines these two ideas, using Monte Carlo simulations to generate data, which can be used to fit $\\w$.',
  'Note that as in Q-learning, simulation and learning will be heavily intertwined.',
  _,
  'The three ingredients in any machine learning approach are to determine the',
  '(i) model family (in this case, what is $V(s; \\w)$?),',
  '(ii) where the data comes from,',
  'and (iii) the actual learning algorithm.',
  'We will go through each of these in turn.',
_);

add(slide('Model for evaluation functions',
  stmt('Linear'),
  indent('$V(s; \\w) = \\w \\cdot \\red{\\phi(s)}$'),
  pause(),
  /*stmt('Log-linear (if utility is $1$ or $0$)'),
  indent('$V(s; \\w) = \\sigma(\\w \\cdot \\phi(s))$, where $\\sigma(z) = \\frac{1}{1 + e^{-z}}$'),
  indent('$V(s, \\w) \\in (0, 1)$, interpret as probability of winning'),
  pause(),*/
  stmt('Neural network'),
  indent('$\\displaystyle V(s; \\w, \\v_{1:k}) = \\sum_{j=1}^k w_j \\sigma(\\mathbf \\v_j \\cdot \\red{\\phi(s)})$'),
_));

prose(
  'When we looked at Q-learning, we considered linear evaluation functions (remember, linear in the weights $\\w$).',
  'This is the simplest case, but it might not be suitable in some cases.',
  _,
  'But the evaluation function can really be any parametrized function.',
  'For example, the original TD-Gammon program used a neural network,',
  'which allows us to represent more expressive functions that capture the non-linear interactions between different features.',
  _,
  'Any model that you could use for regression in supervised learning you could also use here.',
_);

add(slide('Example: Backgammon',
  parentCenter(xtable(
    image('images/backgammon1.jpg').width(320),
    image('images/backgammon2.jpg').width(320),
  _).margin(50).center()),
_));

prose(
  'As an example, let\'s consider the classic game of backgammon.',
  'Backgammon is a two-player game of strategy and chance in which',
  'the objective is to be the first to remove all your pieces from the board.',
  _,
  'The simplified version is that on your turn, you roll two dice,',
  'and choose two of your pieces to move forward that many positions.',
  _,
  'You cannot land on a position containing more than one opponent piece.',
  'If you land on exactly one opponent piece, then that piece goes on the bar and has start over from the beginning.',
  '(See the Wikipedia article for the full rules.).',
_);

add(quizSlide('games2-backgammon',
  'What are some good feature (templates) for backgammon?',
_));

add(slide('Features for Backgammon',
  xtable(
    ytable('state $s$', image('images/simple_bkg.png')).center(),
    pause(),
    stagger(
      ytable(stmt('Feature templates'),
        indent(table(
          ['$[\\text{(# ? in column ?)} = ?]$'],
          ['$[\\text{(# ? on bar)}]$'],
          ['$[\\text{(fraction ? removed)}]$'],
          ['$[\\text{(is it ?\'s turn)}]$'],
        _).ymargin(10)),
      _),
      ytable(stmt('Features $\\phi(s)$'),
        indent(table(
          ['$[\\text{(# o in column 0)} = 1]$', ': $1$'],
          ['$[\\text{(# o on bar)}]$', ': $1$'],
          ['$[\\text{(fraction o removed)}]$', ': $\\frac12$'],
          ['$[\\text{(# x in column 1)} = 1]$', ': $1$'],
          ['$[\\text{(# x in column 3)} = 3]$', ': $1$'],
          ['$[\\text{(is it o\'s turn)}]$', ': $1$'],
        _).ymargin(10)),
      _),
    _),
  _).margin(30),
_));

prose(
  'As an example, we can define the following features for Backgammon,',
  'which are inspired by the ones used by TD-Gammon.',
  _,
  'Note that the features are pretty generic; there is no explicit modeling of strategies',
  'such as trying to avoid having singleton pieces (because it could get clobbered)',
  'or preferences for how the pieces are distributed across the board.',
  _,
  'On the other hand, the features are mostly <b>indicator</b> features,',
  'which is a common trick to allow for more expressive functions using the machinery of linear regression.',
  'For example, instead of having one feature whose value is the number of pieces in a particular column,',
  'we can have multiple features for indicating whether the number of pieces is over some threshold.',
_);

var generalEpisode = '$\\brown{s_0}; a_1, r_1, \\brown{s_1}; a_2, r_2, \\brown{s_2}; a_3, r_3, \\brown{s_3}; \\dots; a_n, r_n, \\brown{s_n}$';
var generalEpisodeHighlight = '$s_0; a_1, r_1, \\orange{s_1; a_2, r_2, s_2}, a_3, r_3, s_3; \\dots, a_n, r_n, s_n$';

add(slide('Generating data',
  stmt('Monte Carlo simulation'),
  parentCenter(generalEpisode),
  pause(),
  stmt('Generate using reflex policies based on current $V(s; \\w)$'),
  indent('$\\displaystyle \\pi_\\agent(s; \\w) = \\red{\\arg\\max_{a \\in \\Actions(s)}} V(\\Succ(s, a); \\w)$'), pause(),
  indent('$\\displaystyle \\pi_\\opp(s; \\w) = \\blue{\\arg\\min_{a \\in \\Actions(s)}} V(\\Succ(s, a); \\w)$'), pause(),
  parentCenter(stmt('Note: need to randomize ($\\epsilon$-greedy) unless game already stochastic (dice)!')),
_));

prose(
  'The second ingredient of doing learning is generating the data.',
  'As in reinforcement learning, we will generate a sequence of states, actions, and rewards by',
  'simulation &mdash; that is, by playing the game.',
  _,
  'In order to play the game, we need two exploration policies: one for the agent, one for the opponent.',
  'The policy of the dice is fixed to be uniform over $\\{1,\\dots,6\\}$ as expected.',
  _,
  'A natural policy to use is one that uses our current estimate of the value $V(s; \\w)$.',
  'Specifically, the agent\'s policy will consider all possible actions from a state,',
  'use the value function to evaluate how good each of the successor states are,',
  'and then choose the action leading to the highest value.',
  'Generically, we would include $\\Reward(s, a, \\Succ(s, a))$, but in games, all the reward is at the end,',
  'so $r_t = 0$ for $t < n$ and $r_n = \\Utility(s_n)$.',
  'Symmetrically, the opponent\'s policy will choose the action that leads to the lowest possible value.',
  _,
  'Given this choice of $\\pi_\\agent$ and $\\pi_\\opp$,',
  'we generate the actions $a_t = \\pi_{\\Player(s_{t-1})}(s_{t-1})$,',
  'successors $s_t = \\Succ(s_{t-1}, a_t)$,',
  'and rewards $r_t = \\Reward(s_{t-1}, a_t, s_t)$.',
  _,
  'In reinforcement learning, we saw that using an exploration policy based on just the current value function is a bad idea,',
  'because we can get stuck exploiting local optima and not exploring.',
  'In the specific case of Backgammon, using deterministic exploration policies for the agent and opponent turns out to be fine,',
  'because the randomness from the dice naturally provides exploration.',
_);

add(slide('Learning algorithm',
  stmt('Monte Carlo simulation'),
  parentCenter(stagger(generalEpisode, generalEpisodeHighlight)),
  stmt('A small piece of experience'),
  parentCenter('$\\orange{(s,a,r,s\')}$'),
  pause(),
  stmt('Prediction'),
  parentCenter('$\\red{V(s; \\w)}$'),
  pause(),
  stmt('Target'),
  parentCenter('$\\green{r + \\gamma V(s\'; \\w)}$'),
_));

prose(
  'With a model family $V(s; \\w)$ and data $s_0, a_1, r_1, s_1, \\dots$',
  'in hand, let\'s turn to the learning algorithm.',
  _,
  'A general principle in learning is to figure out the <b>prediction</b> and the <b>target</b>.',
  'The prediction is just the value of the current function at the current state $s$,',
  'and the target uses the data by looking at the immediate reward $r$ plus',
  'the value of the function applied to to the successor state $s\'$ (discounted by $\\gamma$).',
  'This is analogous to the SARSA update for Q-values,',
  'where our target actually depends on a one-step lookahead prediction.',
_);

add(slide('General framework',
  stmt('Objective function'),
  parentCenter('$\\frac 12 (\\red{\\text{prediction}}(\\w) - \\green{\\text{target}})^2$'),
  pause(),
  stmt('Gradient'),
  parentCenter('$(\\red{\\text{prediction}}(\\w) - \\green{\\text{target}}) \\blue{\\nabla_\\w \\text{prediction}(\\w)}$'),
  pause(),
  stmt('Update'),
  parentCenter(nowrapText('$\\w \\leftarrow \\w - \\eta \\underbrace{(\\red{\\text{prediction}}(\\w) - \\green{\\text{target}}) \\blue{\\nabla_\\w \\text{prediction}(\\w)}}_\\text{gradient}$').scale(0.9)),
_));

prose(
  'Having identified a prediction and target, the next step is to figure out how to update the weights.',
  'The general strategy is to set up an objective function that encourages the prediction and target to be close',
  '(by penalizing their squared distance).',
  _,
  'Then we just take the gradient with respect to the weights $\\w$.',
  _,
  'Note that even though technically the target also depends on the weights $\\w$, we treat this as constant for this derivation.',
  'The resulting learning algorithm by no means finds the global minimum of this objective function.',
  'We are simply using the objective function to motivate the update rule.',
_);

add(slide('Temporal difference (TD) learning',
  nil(),
  algorithm('TD learning',
    'On each $(s, a, r, s\')$:',
    parentCenter(nowrapText('$\\displaystyle \\w \\leftarrow \\w - \\eta [\\red{\\underbrace{V(s; \\w)}_\\text{prediction}} - \\green{\\underbrace{(r + \\gamma V(s\'; \\w))}_\\text{target}}] \\blue{\\nabla_\\w V(s; \\w)}$')).scale(1),
  _).scale(0.95),
  pause(),
  stmt('For linear functions'),
  indent('$V(s; \\w) = \\w \\cdot \\phi(s)$'),
  indent('$\\nabla_\\w V(s; \\w) = \\phi(s)$'),
_));

prose(
  'Plugging in the prediction and the target in our setting yields the TD learning algorithm.',
  'For linear functions, recall that the gradient is just the feature vector.',
_);

var w = [0, 0];
function S() {
  function V(phi) {
    return phi[0]*w[0] + phi[1]*w[1];
  }
  var items = [];
  for (var i = 0; i < arguments.length; i += 3) {
    var s = arguments[i];
    var phi = arguments[i+1];
    var r = arguments[i+2];
    var s2 = arguments[i+3];
    var phi2 = arguments[i+4];
    items.push(ytable(
      redbold(s),
      '$\\phi\\!:\\!\\binom{'+phi[0]+'}{'+phi[1]+'}$',
      yspace(10),
      pause(),
      '$\\w\\!:\\!\\binom{'+round(w[0],2)+'}{'+round(w[1],2)+'}$',
      //yspace(10),
      //'$V\\!:\\!'+V(phi)+'$',
    _).center());
    items.push(pause());
    if (r != null) {
      var residual = V(phi) - (r + V(phi2));
      items.push(ytable(
        greenbold('r:'+r),
        ytable(
          text(red('p:'+V(phi))).scale(0.8),
          text(green('t:'+(r+V(phi2)))).scale(0.8),
          text(purple('p-t:'+residual)).scale(0.8),
          //text('$V\\!:\\!'+V(phi)+'$').scale(0.8),
        _),
      _).center().margin(60));
      //L(V(phi), V(phi2));
      for (var j = 0; j < 2; j++)
        w[j] = w[j] - 0.5 * residual * phi[j];
    }
  }
  return items;
}

add(slide('Example of TD learning',
  'Step size $\\eta = 0.5$, discount $\\gamma = 1$, reward is end utility',
  example('TD learning',
    //'$\\w = [0, 0]$',
    table(
      S('S1', [0, 1], 0, 'S4', [1, 0], 0, 'S8', [1, 2], 1, 'S9', [1, 0]),
      S('S1', [0, 1], 0, 'S2', [1, 0], 0, 'S6', [0, 0], 0, 'S9', [1, 0]),
    _).margin(5, 20).xcenter(),
  _).scale(0.75),
_));

prose(
  'Here\'s an example of TD learning in action.',
  'We have two episodes: [S1, 0, S4, 0, S8, 1, S9] and [S1, 0, S2, 0, S6, 0, S9].',
  _,
  'In games, all the reward comes at the end and the discount is $1$.',
  'We have omitted the action because TD learning doesn\'t depend on the action.',
  _,
  'Under each state, we have written its feature vector, and the weight vector before updating on that state.',
  'Note that no updates are made until the first non-zero reward.',
  'Our prediction is $0$, and the target is $1+0$, so we subtract $-0.5 [1, 2]$ from the weights to get $[0.5, 1]$.',
  _,
  'In the second row, we have our second episode, and now notice that even though all the rewards are zero,',
  'we are still making updates to the weight vectors since the prediction and targets computed based on adjacent states are different.',
_);

add(slide('Comparison',
  algorithm('TD learning',
    'On each $(s, a, r, s\')$:',
    //parentCenter(nowrapText('$\\displaystyle \\w \\leftarrow \\w - \\eta [\\red{\\underbrace{V(s; \\w)}_\\text{prediction}} - \\green{\\underbrace{(r + \\gamma V(s\'; \\w))}_\\text{target}}] \\blue{\\nabla_\\w V(s; \\w)}$')).scale(1),
    parentCenter(nowrapText('$\\displaystyle \\w \\leftarrow \\w - \\eta [\\red{\\underbrace{\\hat V_\\pi(s; \\w)}_\\text{prediction}} - \\green{\\underbrace{(r + \\gamma \\hat V_\\pi(s\'; \\w))}_\\text{target}}] \\blue{\\nabla_\\w \\hat V_\\pi(s; \\w)}$')).scale(1),
  _).scale(0.8),
  algorithm('Q-learning',
    'On each $(s, a, r, s\')$:',
    parentCenter(nowrapText('$\\displaystyle \\w \\leftarrow \\w - \\eta [\\red{\\underbrace{\\hat Q_\\opt(s, a; \\w)}_\\text{prediction}} - \\green{\\underbrace{(r + \\gamma \\max_{a\' \\in \\Actions(s)} \\hat Q_\\opt(s\', a\'; \\w))}_\\text{target}}] \\blue{\\nabla_\\w \\hat Q_\\opt(s, a; \\w)}$')).scale(0.8),
  _).scale(0.8),
  /*algorithm('SARSA',
    'On each $(s, a, r, s\', a\')$:',
    parentCenter(nowrapText('$\\displaystyle \\w \\leftarrow \\w - \\eta [\\red{\\underbrace{\\hat Q(s, a; \\w)}_\\text{prediction}} - \\green{\\underbrace{(r + \\gamma \\hat Q(s\', a\'))}_\\text{target}}] \\blue{\\nabla_\\w \\hat Q(s, a; \\w)}$')).scale(0.8),
  _).scale(0.8),*/
_));

add(slide('Comparison',
  headerList('Q-learning',
    'Operate on $\\hat Q_\\opt(s, a; \\w)$', pause(),
    'Off-policy: value is based on estimate of optimal policy', pause(),
    'To use, don\'t need to know MDP transitions $T(s, a, s\')$',
  _),
  pause(-2),
  headerList('TD learning',
    'Operate on $\\hat V_\\pi(s; \\w)$', pause(),
    'On-policy: value is based on exploration policy (usually based on $\\hat V_\\pi$)', pause(),
    'To use, need to know rules of the game $\\Succ(s, a)$',
  _),
_));

prose(
  'TD learning is very similar to Q-learning.',
  'Both algorithms learn from the same data and are based on gradient-based weight updates.',
  _,
  'The main difference is that Q-learning learns the Q-value,',
  'which measures how good an action is to take in a state,',
  'whereas TD learning learns the value function,',
  'which measures how good it is to be in a state.',
  _,
  'Q-learning is an off-policy algorithm, which means that it tries to compute $Q_\\opt$, associated with the optimal policy (not $Q_\\pi$),',
  'whereas TD learning is on-policy, which means that it tries to compute $V_\\pi$, the value associated with a fixed policy $\\pi$.',
  'Note that the action $a$ does not show up in the TD updates because $a$ is given by the fixed policy $\\pi$.',
  'Of course, we usually are trying to optimize the policy,',
  'so we would set $\\pi$ to be the current guess of optimal policy $\\pi(s) = \\arg\\max_{a \\in \\Actions(s)} V(\\Succ(s, a); \\w)$.',
  _,
  'When we don\'t know the transition probabilities and in particular the successors,',
  'the value function isn\'t enough, because we don\'t know what effect our actions will have.',
  'However, in the game playing setting, we do know the transitions (the rules of the game),',
  'so using the value function is sufficient.',
_);

add(slide('Learning to play checkers',
  parentCenter(image('images/checkers.jpg').width(150)),
  pause(),
  headerList('Arthur Samuel\'s checkers program [1959]',
    'Learned by playing itself repeatedly (self-play)',
    'Smart features, linear evaluation function, use intermediate rewards',
    'Used alpha-beta pruning + search heuristics',
    pause(),
    'Reach human amateur level of play',
    pause(),
    'IBM 701: 9K of memory!',
  _),
_));

prose(
  'The idea of using machine learning for game playing goes as far back as Arthur Samuel\'s checkers program.',
  'Many of the ideas (using features, alpha-beta pruning) were employed,',
  'resulting in a program that reached a human amateur level of play.',
  'Not bad for 1959!',
_);

add(slide('Learning to play Backgammon',
  parentCenter(image('images/backgammon1.jpg').width(200)),
  headerList('Gerald Tesauro\'s TD-Gammon [1992]',
    'Learned weights by playing itself repeatedly (1 million times)',
    'Dumb features, neural network, no intermediate rewards',
    'Reached human expert level of play, provided new insights into opening',
  _),
_));

prose(
  'Tesauro refined some of the ideas from Samuel with his famous TD-Gammon program provided the next advance,',
  'using a variant of TD learning called TD$(\\lambda)$.',
  'It had dumber features, but a more expressive evaluation function (neural network),',
  'and was able to reach an expert level of play.',
_);

add(slide('Learning to play Go',
  parentCenter(image('images/go.jpg').width(200)),
  headerList('AlphaGo Zero [October 2017]',
    'Learned by self play (29 million games)',
    'Dumb features (stone positions), neural network, no intermediate rewards, Monte Carlo Tree Search',
    'Reached super-human performance, provided new insights into the game',
  _),
_));

prose(
  'Very recently, self-play reinforcement learning has been applied to the game of Go.',
  'AlphaGo Zero uses a single neural nework to predict winning probabily and actions to be taken, using raw board positions as inputs.',
  'Starting from random weights, the network is trained to gradually improve its predictions and match the results of an approximate',
  '(Monte Carlo) tree search algorithm.',
_);


add(summarySlide('Summary so far',
  bulletedText('Parametrize evaluation functions using features'),
  pause(),
  bulletedText('TD learning: learn from Monte Carlo simulations'),
  parentCenter('$(\\red{\\text{prediction}(\\w)} - \\green{\\text{target}})^2$'),
  pause(),
  stmt('Up next'),
  parentCenter(table(
    ['Turn-based', bigRightArrow(), 'Simultaneous'], pause(),
    ['Zero-sum', bigRightArrow(), 'Non-zero-sum'],
    //['Fully-observable', bigRightArrow(), 'Partially-observable'],
  _).margin(40, 20).ycenter()),
_));

////////////////////////////////////////////////////////////
// Simultaneous games
roadmap(1);

add(slide(nil(),
  stmt('Turn-based games'),
  indent(xtable(
    image('images/chess.jpg').width(150),
    minmaxGameExample().scale(0.6),
  _).center().cellWidth(300)),
  pause(),
  stmt('Simultaneous games'),
  indent(xtable(
    image('images/rock-paper-scissors.jpg').width(150),
    text(redbold('?')).scale(2),
  _).center().cellWidth(300)),
_));

prose(
  'Game trees were our primary tool to model turn-based games.',
  'However, in simultaneous games, there is no ordering on the player\'s moves,',
  'so we need to develop new tools to model these games.',
  'Later, we will see that game trees will still be valuable in understanding',
  'simultaneous games.',
_);

add(slide('Two-finger Morra',
  nil(),
  example('two-finger Morra',
    pause(),
    'Players '+red('A')+' and '+blue('B')+' each show 1 or 2 fingers.', pause(),
    'If both show 1, '+blue('B')+' gives '+red('A')+' 2 dollars.', pause(),
    'If both show 2, '+blue('B')+' gives '+red('A')+' 4 dollars.', pause(),
    'Otherwise, '+red('A')+' gives '+blue('B')+' 3 dollars.', pause(),
  _),
  parentCenter('[play with a partner]'),
_).leftHeader(image('images/two-fingers.jpg').width(80)));

add(quizSlide('games2-morra',
  'What was the outcome?',
  'player A chose 1, player B chose 1',
  'player A chose 1, player B chose 2',
  'player A chose 2, player B chose 1',
  'player A chose 2, player B chose 2',
_));

add(slide('Payoff matrix',
  definition('single-move simultaneous game',
    '$\\Players = \\{\\A,\\B\\}$',
    '$\\Actions$: possible actions',
    pause(),
    table(
      ['$V(a, b)$:', '<b>A\'s utility</b> if A chooses action $a$, B chooses $b$'],
      [nil(), '(let $V$ be <b>payoff matrix</b>)'],
    _).margin(5, 0), pause(),
  _),
  example('two-finger Morra payoff matrix',
    parentCenter(overlay(
      t = table(
        ['A $\\backslash$ B', '1 finger', '2 fingers'],
        ['1 finger', 2, '-3'],
        ['2 fingers', '-3', 4],
      _).justify('rcc', 'c').margin(30, 10),
    _)),
  _),
_).leftHeader(image('images/two-fingers.jpg').width(80)));

prose(
  'In this lecture, we will consider only single move games.',
  'There are two players, A and B who both select from one of the available actions.',
  'The value or utility of the game is captured by a payoff matrix $V$',
  'whose dimensionality is $|\\Actions| \\times |\\Actions|$.',
  'We will be analyzing everything from A\'s perspective,',
  'so entry $V(a,b)$ is the utility that A gets if he/she chooses action $a$ and player B chooses $b$.',
_);

add(slide('Strategies (policies)',
  definition('pure strategy',
    'A pure strategy is a single action:',
    parentCenter('$a \\in \\Actions$'),
  _).scale(0.9),
  pause(),
  definition('mixed strategy',
    'A mixed strategy is a probability distribution',
    parentCenter('$0 \\le \\pi(a) \\le 1$ for $a \\in \\Actions$'),
  _).scale(0.9),
  pause(),
  example('two-finger Morra strategies',
    'Always 1: $\\pi = [1, 0]$',
    'Always 2: $\\pi = [0, 1]$',
    'Uniformly random: $\\pi = [\\frac12, \\frac12]$',
  _).scale(0.9),
_));

prose(
  'Each player has a <b>strategy</b> (or a policy).',
  'A pure strategy (deterministic policy) is just a single action.',
  'Note that there\'s no notion of state since we are only considering single-move games.',
  _,
  'More generally, we will consider <b>mixed strategies</b> (randomized policy),',
  'which is a probability distribution over actions.',
  'We will represent a mixed strategy $\\pi$ by the vector of probabilities.',
_);

add(slide('Game evaluation',
  definition('game evaluation',
    'The <b>value</b> of the game if player A follows $\\pi_\\A$ and player B follows $\\pi_\\B$ is',
    parentCenter('$\\GameValue{\\pi_\\A}{\\pi_\\B} = \\sum_{a,b} \\pi_\\A(a) \\pi_B(b) V(a,b)$'),
  _),
  pause(),
  example('two-finger Morra',
    'Player A always chooses 1: $\\pi_\\A = [1, 0]$',
    'Player B picks randomly: $\\pi_\\B = [\\frac12, \\frac12]$',
    pause(),
    'Value: $\\boxed{-\\frac12}$',
  _),
  parentCenter('[whiteboard: matrix]'),
_));

prose(
  'Given a game (payoff matrix) and the strategies for the two players,',
  'we can define the value of the game.',
  _,
  'For pure strategies, the value of the game by definition is just reading out the',
  'appropriate entry from the payoff matrix.',
  _,
  'For mixed strategies, the value of the game (that is, the expected utility for player $A$) is gotten by summing over the possible actions that the players choose:',
  '$V(\\pi_\\A, \\pi_\\B) = \\sum_{a \\in \\Actions} \\sum_{b \\in \\Actions} \\pi_\\A(a) \\pi_\\B(b) V(a, b)$.',
  'We can write this expression concisely using matrix-vector multiplications: $\\pi_A^\\top V \\pi_B$.',
_);

add(slide('How to optimize?',
  stmt('Game value'),
  parentCenter('$\\GameValue{\\pi_A}{\\pi_B}$'),
  stmt('Challenge: player A wants to maximize, player B wants to minimize...'),
  pause(),
  parentCenter(redbold('simultaneously')),
  parentCenter(image('images/deadlock-traffic.png').width(200)),
_));

prose(
  'Having established the values of fixed policies,',
  'let\'s try to optimize the policies themselves.',
  'Here, we run into a predicament: player A wants to maximize $V$',
  'but player B wants to minimize $V$ <b>simultaneously</b>.',
  _,
  'Unlike turn-based games, we can\'t just consider one at a time.',
  'But let\'s consider the turn-based variant anyway to see where it leads us.',
_);

add(slide('Pure strategies: who goes first?',
  parentCenter(table(
    ['Player '+red('A')+' goes first:', pause(),
    'Player '+blue('B')+' goes first:'], pause(-1),
    [parentCenter(Max(Min(2, -3), Min(-3, 4)).scale(0.8)), pause(),
    parentCenter(Min(Max(2, -3), Max(-3, 4)).scale(0.8))],
  _).margin(50, 10)),
  pause(),
  proposition('going second is no worse',
    parentCenter('$\\displaystyle \\red{\\max_{a}} \\,\\, \\blue{\\min_{b}} \\,\\, V(a, b) \\le \\blue{\\min_{b}} \\,\\, \\red{\\max_{a}} \\,\\, V(a, b)$'),
  _),
_));

prose(
  'Let us first consider pure strategies, where each player just chooses one action.',
  'The game can be modeled by using the standard minimax game trees that we\'re used to.',
  _,
  'The main point is that if player A goes first, he gets $-3$, but if he goes second, he gets $2$.',
  'In general, it\'s at least as good to go second, and often it is strictly better.',
  'This is intuitive, because seeing what the first player does gives more information.',
_);

add(slide('Mixed strategies',
  example('two-finger Morra',
    'Player A reveals: $\\pi_\\A = [\\frac12, \\frac12]$', pause(),
    'Value $\\GameValue{\\pi_\\A}{\\pi_B} = \\pi_B(1) (-\\frac12) + \\pi_B(2) (+\\frac12)$', pause(),
    'Optimal strategy for player B is $\\pi_B = [1, 0]$ (<b>pure!</b>)',
  _),
  pause(),
  proposition('second player can play pure strategy',
    'For any fixed mixed strategy $\\pi_\\A$:',
    parentCenter('$\\displaystyle \\min_{\\pi_\\B} \\GameValue{\\pi_\\A}{\\pi_B}$'),
    'can be attained by a pure strategy.',
  _),
_));

prose(
  'Now let us consider mixed strategies.',
  'First, let\'s be clear on what playing a mixed strategy means.',
  'If player A chooses a mixed strategy, he reveals to player B',
  'the full probability distribution over actions,',
  'but importantly not a particular action (because that would be the same as choosing a pure strategy).',
  _,
  'As a warmup, suppose that player A reveals $\\pi_\\A = [\\frac12, \\frac12]$.',
  'If we plug this strategy into the definition for the value of the game,',
  'we will find that the value is a convex combination between',
  '$\\frac12 (2) + \\frac12 (-3) = -\\frac12$ and $\\frac12 (-3) + \\frac12 (4) = \\frac12$.',
  'The value of $\\pi_B$ that minimizes this value is $[1, 0]$.',
  'The important part is that this is a <b>pure strategy</b>.',
  _,
  'It turns out that no matter what the payoff matrix $V$ is,',
  'as soon as $\\pi_\\A$ is fixed, then the optimal choice for $\\pi_\\B$',
  'is a pure strategy.',
  'Ths is useful because it will allow us to analyze games with mixed strategies more easily.',
_);

add(slide('Mixed strategies',
  'Player '+red('A')+' first reveals his/her mixed strategy',
  parentCenter(rootedTree(
    MaxIcon(),
    rootedTreeBranch(opaquebg('$\\red{\\pi = [p, 1-p]}$'), rootedTree(
      MinIcon(),
      pause(),
      rootedTreeBranch(opaquebg(blue('1')), ytable('$p \\cdot (2) + (1-p) \\cdot (-3)$', '$= 5p-3$').scale(0.8)),
      pause(),
      rootedTreeBranch(opaquebg(blue('2')), ytable('$p \\cdot (-3) + (1-p) \\cdot (4)$', '$= -7p+4$').scale(0.8)),
    _)),
  _).recymargin(60).recnodeBorderWidth(0)),
  pause(),
  stmt('Minimax value of game'),
  parentCenter('$\\displaystyle \\red{\\max_{0 \\le p \\le 1}} \\,\\, \\blue{\\min} \\{ 5p-3, -7p+4 \\} = \\boxed{-\\frac{1}{12}}$ (with $p = \\frac{7}{12}$)'),
_));

prose(
  'Now let us try to draw the minimax game tree where the player A first chooses a mixed strategy,',
  'and then player B chooses a pure strategy.',
  _,
  'There are an uncountably infinite number of mixed strategies for player A,',
  'but we can summarize all of these actions by writing a single action template $\\pi = [p, 1-p]$.',
  _,
  'Given player A\'s action, we can compute the value if player B either chooses 1 or 2.',
  'For example, if player B chooses 1, then the value of the game is $5p-3$',
  '(with probability $p$, player A chooses 1 and the value is $2$; with probability $1-p$ the value is $-3$).',
  'If player B chooses action 2, then the value of the game is $-7p+4$.',
  _,
  'The value of the min node is $F(p) = \\min\\{5p-3, -7p+4\\}$.',
  'The value of the max node (and thus the minimax value of the game) is $\\max_{0 \\le 1 \\le p} F(p)$.',
  _,
  'What is the best strategy for player A then?',
  'We just have to find the $p$ that maximizes $F(p)$, which is',
  'the minimum over two linear functions of $p$.',
  'If we plot this function, we will see that the maximum of $F(p)$ is attained',
  'when $5p-3 = -7p+4$, which is when $p = \\frac{7}{12}$.',
  'Plugging that value of $p$ back in yields $F(p) = -\\frac{1}{12}$,',
  'the minimax value of the game if player A goes first and is allowed to choose a mixed strategy.',
  _,
  'Note that if player A decides on $p = \\frac{7}{12}$,',
  'it doesn\'t matter whether player B chooses 1 or 2; the payoff will be the same: $-\\frac{1}{12}$.',
  'This also means that whatever mixed strategy (over 1 and 2) player B plays,',
  'the payoff would also be $-\\frac{1}{12}$.',
_);

add(slide('Mixed strategies',
  'Player '+blue('B')+' first reveals his/her mixed strategy',
  parentCenter(rootedTree(
    MinIcon(),
    rootedTreeBranch(opaquebg('$\\blue{\\pi = [p, 1-p]}$'), rootedTree(
      MaxIcon(),
      pause(),
      rootedTreeBranch(opaquebg(red('1')), ytable('$p \\cdot (2) + (1-p) \\cdot (-3)$', '$= 5p-3$').scale(0.8)),
      pause(),
      rootedTreeBranch(opaquebg(red('2')), ytable('$p \\cdot (-3) + (1-p) \\cdot (4)$', '$= -7p+4$').scale(0.8)),
    _)),
  _).recymargin(60).recnodeBorderWidth(0)),
  pause(),
  stmt('Minimax value of game'),
  parentCenter('$\\displaystyle \\blue{\\min_{p \\in [0, 1]}} \\,\\, \\red{\\max} \\{ 5p-3, -7p+4 \\} = \\boxed{-\\frac{1}{12}}$ (with $p = \\frac{7}{12}$)'),
_));

prose(
  'Now let us consider the case where player B chooses a mixed strategy $\\pi = [p, 1-p]$ first.',
  'If we perform the analogous calculations,',
  'we\'ll find that we get that the minimax value of the game is exactly the same ($-\\frac{1}{12}$)!',
  _,
  'Recall that for pure strategies, there was a gap between going first and going second,',
  'but here, we see that for mixed strategies, there is no such gap, at least in this example.',
  _,
  'Here, we have been computed minimax values in the conceptually same manner as we were doing it',
  'for turn-based games.',
  'The only difference is that our actions are mixed strategies (represented by a probability distribution)',
  'rather than discrete choices.',
  'We therefore introduce a variable (e.g., $p$) to represent the actual distribution,',
  'and any game value that we compute below that variable is a function of $p$',
  'rather than a specific number.',
_);

add(slide('General theorem',
  theorem('minimax theorem [von Neumann, 1928]',
    'For every simultaneous two-player zero-sum game with a finite number actions:',
    pause(),
    parentCenter('$\\displaystyle \\red{\\max_{\\pi_\\A}} \\,\\, \\blue{\\min_{\\pi_\\B}} \\,\\, \\GameValue{\\pi_\\A}{\\pi_\\B} = \\blue{\\min_{\\pi_\\B}} \\,\\, \\red{\\max_{\\pi_\\A}} \\,\\, \\GameValue{\\pi_\\A}{\\pi_\\B}$,'),
    pause(),
    'where $\\pi_\\A,\\pi_\\B$ range over <b>mixed strategies</b>.',
  _),
  pause(),
  stmt('Upshot: revealing your optimal mixed strategy doesn\'t hurt you!'),
  pause(),
  stmt('Proof: linear programming duality'),
  pause(),
  stmt('Algorithm: compute policies using linear programming'),
_));

prose(
  'It turns out that having no gap is not a coincidence,',
  'and is actually one of the most celebrated mathematical results:',
  'the von Neumann minimax theorem.',
  'The theorem states that for any simultaneous two-player zero-sum game with a finite set of actions',
  '(like the ones we\'ve been considering),',
  'we can just swap the min and the max: it doesn\'t matter which player reveals his/her strategy first, as long as their strategy is optimal.',
  'This is significant because we were stressing out about how to analyze the game when two players play simultaneously,',
  'but now we find that both orderings of the players yields the same answer.',
  'It is important to remember that this statement is true only for mixed strategies, not for pure strategies.',
  _,
  'This theorem can be proved using linear programming duality,',
  'and policies can be computed also using linear programming.',
  'The sketch of the idea is as follows: recall that the optimal strategy for the second player is always deterministic,',
  'which means that the $\\max_{\\pi_\\A} \\min_{\\pi_\\B} \\cdots$ turns into $\\max_{\\pi_\\A} \\min_{b} \\cdots$.',
  'The min is now over $n$ actions, and can be rewritten as $n$ linear constraints,',
  'yielding a linear program.',
  _,
  'As an aside, recall that we also had a minimax result for turn-based games,',
  'where the max and the min were over agent and opponent policies,',
  'which map states to actions.',
  'In that case, optimal policies were always deterministic',
  'because at each state, there is only one player choosing.',
_);

add(summarySlide('Summary',
  bulletedText(stmt('Challenge: deal with simultaneous min/max moves')),
  bulletedText(stmt('Pure strategies: going second is better')),
  bulletedText(stmt('Mixed strategies: doesn\'t matter (von Neumann\'s minimax theorem)')),
_));

////////////////////////////////////////////////////////////
// Non-zero-sum games
roadmap(2);

add(slide('Utility functions',
  stmt('Competitive games: minimax (linear programming)'),
  parentCenter(image('images/tug-of-war.jpg').width(200)),
  pause(),
  stmt('Collaborative games: pure maximization (plain search)'),
  parentCenter(image('images/collaborative.jpg').width(150)),
  pause(),
  stmt('Real life: '+red('?')),
_));

prose(
  'So far, we have focused on competitive games,',
  'where the utility of one player is the exact opposite of the utility of the other.',
  'The minimax principle is the appropriate tool for modeling these scenarios.',
  _,
  'On the other extreme, we have collaborative games,',
  'where the two players have the same utility function.',
  'This case is less interesting, because we are just doing pure maximization',
  '(e.g., finding the largest element in the payoff matrix or performing search).',
  _,
  'In many practical real life scenarios, games are somewhere in between pure competition and pure collaboration.',
  'This is where things get interesting...',
_);

add(slide('Prisoner\'s dilemma',
  example('Prisoner\'s dilemma',
    'Prosecutor asks A and B individually if each will testify against the other.', pause(),
    'If both testify, then both are sentenced to 5 years in jail.', pause(),
    'If both refuse, then the sentence is only 1 year.', pause(),
    'If only one testifies, then he/she gets out for free; the other gets a 10-year sentence.',
  _),
_));

add(quizSlide('games2-prisoner',
  'What was the outcome?',
  'player A testified, player B testified',
  'player A refused, player B testified',
  'player A testified, player B refused',
  'player A refused, player B refused',
_));

add(slide('Prisoner\'s dilemma',
  example('payoff matrix',
    table(
      ['B $\\backslash$ A', 'testify', 'refuse'],
      ['testify', '$A = -5, B = -5$', '$A = -10, B = 0$'],
      ['refuse', '$A = 0, B = -10$', '$A = -1, B = -1$'],
    _).justify('rcc', 'c').margin(40, 10),
  _),
  pause(),
  definition('payoff matrix',
    'Let $V_\\red{p}(\\pi_\\A, \\pi_\\B)$ be the utility for player $\\red{p}$.',
  _),
_));

prose(
  'In the prisoner\'s dilemma, the players get both penalized only a little bit',
  'if they both refuse to testify, but if one of them defects, then the other will get penalized a huge amount.',
  'So in practice, what tends to happen is that both will testify and both get sentenced to $5$ years,',
  'which is clearly worse than if they both had cooperated.',
_);

add(slide('Nash equilibrium',
  'Can\'t apply von Neumann\'s minimax theorem (not zero-sum), but get something weaker:',
  pause(),
  definition('Nash equilibrium',
    'A <b>Nash equilibrium</b> is $(\\pi_\\A^*,\\pi_\\B^*)$ such that no player has an incentive to change his/her strategy:',
    pause(),
    indent(nowrapText('$\\GameValueA{\\pi_\\A^*}{\\pi_B^*} \\ge \\GameValueA{\\red{\\pi_\\A}}{\\pi_\\B^*}$ for all $\\red{\\pi_A}$')), pause(),
    indent(nowrapText('$\\GameValueB{\\pi_\\A^*}{\\pi_B^*} \\ge \\GameValueB{\\pi_\\A^*}{\\blue{\\pi_\\B}}$ for all $\\blue{\\pi_B}$')),
  _),
  pause(),
  theorem('Nash\'s existence theorem [1950]',
    'In any finite-player game with finite number of actions, there exists <b>at least one</b> Nash equilibrium.',
  _),
_));

prose(
  'Since we no longer have a zero-sum game, we cannot apply the minimax theorem,',
  'but we can still get a weaker result.',
  _,
  'A Nash equilibrium is kind of a state point, where no player has an incentive to change his/her policy unilaterally.',
  'Another major result in game theory is Nash\'s existence theorem,',
  'which states that any game with a finite number of players (importantly, not necessarily zero-sum)',
  'has at least one Nash equilibrium (a stable point).',
  'It turns out that finding one is hard, but we can be sure that one exists.',
_);

add(slide('Examples of Nash equilibria',
  example('Two-finger Morra',
    'Nash equilibrium: A and B both play $\\pi = [\\frac{7}{12}, \\frac{5}{12}]$.',
  _),
  pause(),
  example('Collaborative two-finger Morra',
    'Two Nash equilibria:',
    bulletedText('A and B both play 1 (value is $2$).'),
    bulletedText('A and B both play 2 (value is $4$).'),
  _),
  pause(),
  example('Prisoner\'s dilemma',
    'Nash equilibrium: A and B both testify.',
  _),
_));

prose(
  'Here are three examples of Nash equilibria.',
  'The minimax strategies for zero-sum are also equilibria (and they are global optima).',
  _,
  'For purely collaborative games, the equilibria are simply the entries of the payoff matrix',
  'for which no other entry in the row or column are larger.',
  'There are often multiple local optima here.',
  _,
  'In the Prisoner\'s dilemma, the Nash equilibrium is when both players testify.',
  'This is of course not the highest possible reward, but it is stable',
  'in the sense that neither player would want to change his/her strategy.',
  'If both players had refused, then one of the players could testify to improve his/her payoff',
  '(from -1 to 0).',
_);

add(summarySlide('Summary so far',
  headerList('Simultaneous zero-sum games',
    'von Neumann\'s minimax theorem',
    'Multiple minimax strategies, single game value',
  _),
  pause(),
  headerList('Simultaneous non-zero-sum games',
    'Nash\'s existence theorem',
    'Multiple Nash equilibria, multiple game values',
  _),
  pause(),
  'Huge literature in game theory / economics',
_));

prose(
  'For simultaneous zero-sum games, all minimax strategies have the same game value',
  '(and thus it makes sense to talk about the value of a game).',
  'For non-zero-sum games, different Nash equilibria could have different game values',
  '(for example, consider the collaborative version of two-finger Morra).',
_);

////////////////////////////////////////////////////////////
// Conclusion
roadmap(3);

add(slide('State-of-the-art: chess',
  '1997: IBM\'s Deep Blue defeated world champion Gary Kasparov',
  pause(),
  headerList('Fast computers',
    'Alpha-beta search over 30 billion positions, depth 14',
    'Singular extensions up to depth 20',
  _),
  pause(),
  headerList('Domain knowledge',
    'Evaluation function: 8000 features',
    '4000 "opening book" moves, all endgames with 5 pieces',
    '700,000 grandmaster games',
    'Null move heuristic: opponent gets to move twice',
  _),
_).leftHeader(image('images/Deep_Blue.jpg').width(100)));

add(slide('State-of-the-art: checkers',
  '1990: Jonathan Schaeffer\'s <b>Chinook</b> defeated human champion; ran on standard PC',
  pause(),
  headerList('Recently',
    '2007: Checkers solved in the minimax sense (outcome is draw), but doesn\'t mean you can\'t win', pause(),
    'Alpha-beta search + 39 trillion endgame positions',
  _),
_).leftHeader(image('images/checkers.jpg').width(150)));

add(slide('Backgammon and Go',
  'Alpha-beta search isn\'t enough...',
  parentCenter(xtable(
    image('images/backgammon1.jpg').width(150),
    image('images/go.jpg').width(120),
  _).margin(100).center()),
  pause(),
  headerList('Challenge: large branching factor',
    'Backgammon: randomness from dice (can\'t prune!)',
    'Go: large board size (361 positions)',
  _),
  pause(),
  headerList('Solutions',
    'Backgammon: TD learning',
    'Go: Monte Carlo simulations',
  _),
_));

prose(
  'For games such as checkers and chess with a manageable branching factor,',
  'one can rely heavily on minimax search along with alpha-beta pruning and a lot of computation power.',
  'A good amount of domain knowledge can be employed as to attain or surpass human-level performance.',
  _,
  'However, games such as Backgammon and Go require more due to the large branching factor.',
  'Backgammon does not intrinsically have a larger branching factor,',
  'but much of this branching is due to the randomness from the dice,',
  'which cannot be pruned (it doesn\'t make sense to talk about the most promising dice move).',
  _,
  'As a result, programs for these games have relied a lot on TD learning and Monte Carlo simulations',
  'to produce good evaluation functions without searching the entire space.',
_);

add(slide('AlphaGo',
  parentCenter(image('images/alpha-go.jpg')),
  //parentCenter(image('images/tree-search.png').width(500)),
  bulletedText('Supervised learning: on human games'),
  bulletedText('Reinforcement learning: on self-play games'),
  pause(),
  bulletedText('Evaluation function: convolutional neural network (value network)'),
  bulletedText('Policy: convolutional neural network (policy network)'),
  pause(),
  bulletedText('Monte Carlo Tree Search: search / lookahead'),
_));

prose(
  'The most recent visible advance in game playing was March 2016,',
  'when Google DeepMind\'s AlphaGo program defeated Le Sedol,',
  'one of the best professional Go players 4-1.',
  _,
  'AlphaGo took the best ideas from game playing and machine learning.',
  'DeepMind executed these ideas well with lots of computational resources,',
  'but these ideas should already be familiar to you.',
  _,
  'The learning algorithm consisted of two phases:',
  'a supervised learning phase, where a policy was trained on games played by humans (30 million positions) from the KGS Go server;',
  'and a reinforcement learning phase, where the algorithm played itself in attempt to improve,',
  'similar to what we say with Backgammon.',
  _,
  'The model consists of two pieces: a value network, which is used to evaluate board positions (the evaluation function);',
  'and a policy network, which predicts which move to make from any given board position (the policy).',
  'Both are based on convolutional neural networks, which we\'ll discuss later in the class.',
  _,
  'Finally, the policy network is not used directly to select a move,',
  'but rather to guide the search over possible moves in an algorithm similar to Monte Carlo Tree Search.',
_);


add(slide('Other games',
  stmt('Security games: allocate limited resources to protect a valuable target. Used by TSA security, Coast Guard, protect wildlife against poachers, etc.'),
  parentCenter(image('images/securitygames.jpg').width(200)),
_));

prose(
  'The techniques that we\'ve developed for game playing go far beyond recreational uses.',
  'Whenever there are multiple parties involved with conflicting interests,',
  'game theory can be employed to model the situation.',
  _,
  'For example, in a security game a defender needs to protect a valuable target from a malicious attacker.',
  'Game theory can be used to model these scenarios and devise optimal (randomized) strategies.',
  'Some of these techniques are used by TSA security at airports, to schedule patrol routes by the Coast Guard, and even to protect wildlife from poachers.',
  _);


add(slide('Other games',
  stmt('Resource allocation: users share a resource (e.g., network bandwidth); selfish interests leads to volunteer\'s dilemma'),
  parentCenter(image('images/connect-to-network.jpg').width(200)),
  pause(),
  stmt('Language: people have speaking and listening strategies, mostly collaborative, applied to dialog systems'),
  parentCenter(image('images/two-people-talking.jpg').width(200)),
_));

prose(
  'For example, in resource allocation, we might have $n$ people wanting to access some Internet resource.',
  'If all of them access the resource, then all of them suffer because of congestion.',
  'Suppose that if $n-1$ connect, then those people can access the resource and are happy,',
  'but the one person left out suffers.  Who should volunteer to step out (this is the volunteer\'s dilemma)?',
  _,
  'Another interesting application is modeling communication.',
  'There are two players, the speaker and the listener,',
  'and the speaker\'s actions are to choose what words to use to convey a message.',
  'Usually, it\'s a collaborative game where utility is high when communication is successful and efficient.',
  'These game-theoretic techniques have been applied to building dialog systems.',
_);

/*add(slide('General game playing',
  bulletedText('Idea: write programs that don\'t specialize to one game but can <b>generalize</b> to any game'), pause(),
  bulletedText('Program is given rules of games in a description language'), pause(),
  bulletedText('Check out Genesereth\'s CS227B to learn more'),
_));*/

add(summarySlide('Summary',
  bulletedText(stmt('Main challenge: not just one objective')),
  bulletedText(stmt('Minimax principle: guard against adversary in turn-based games')),
  bulletedText(stmt('Simultaneous non-zero-sum games: mixed strategies, Nash equilibria')),
  bulletedText(stmt('Strategy: <b>search game tree + learned evaluation function</b>')),
_));

prose(
  'Games are an extraordinary rich topic of study,',
  'and we have only seen the tip of the iceberg.',
  'Beyond simultaneous non-zero-sum games, which are already complex,',
  'there are also games involving partial information (e.g., poker).',
  _,
  'But even if we just focus on two-player zero-sum games,',
  'things are quite interesting.',
  'To build a good game-playing agent involves integrating the two main thrusts of AI:',
  'search and learning, which are really symbiotic.',
  'We can\'t possibly search an exponentially large number of possible futures,',
  'which means we fall back to an evaluation function.',
  'But in order to learn an evaluation function, we need to search over enough possible futures',
  'to build an accurate model of the likely outcome of the game.',
_);

sfig.initialize();
