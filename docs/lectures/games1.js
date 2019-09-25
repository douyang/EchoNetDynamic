G = sfig.serverSide ? global : this;
G.prez = presentation();

add(titleSlide('Lecture 9: Games I',
  nil(),
  parentCenter(image('images/pacman.jpg').width(300)),
_));

function basket(label, a, b) {
  return frameBox(ytable(label, xtable(a, b).margin(40)).margin(40).center()).bg.round(15).end;
}

/*add(quizSlide('games1-start',
  //'Is it possible to define the optimal policy when we have opponents and they behave adversarially?',
  'Is it possible to define a policy that is optimal against all possible opponents, however adversarial?',
  //'What is the optimal policy when we have opponents with unknown (possibly adversarial) behavior?',
  'yes',
  'no',
_));

prose(
  'It depends on what optimal means.',
  _,
  'It will be impossible to have a single policy such that for every opponent strategy,',
  'that policy is the best against that opponent strategy.',
  _,
  'However, we will be able to design policies (based on the minimax principle)',
  'so that no matter who the opponent is, we\'ll be guaranteed some minimum outcome.',
_);*/

function roadmap(i) {
  add(outlineSlide('Roadmap', i, [
    ['expectimax', 'Games, expectimax'],
    ['minimax', 'Minimax, expectiminimax'],
    ['eval', 'Evaluation functions'],
    ['alphaBeta', 'Alpha-beta pruning'],
  ]));
}

evolutionOfModels(9, 'Adversarial games');

prose(
  'This lecture will be about games, which have been one of the main testbeds for developing AI programs since the early days of AI.',
  'Games are distinguished from the other tasks that we\'ve considered so far in this class in that they make explicit the presence of other agents,',
  'whose utility is not generally aligned with ours.',
  'Thus, the optimal strategy (policy) for us will depend on the strategies of these agents.',
  'Moreover, their strategies are often unknown and adversarial.',
  'How do we reason about this?',
_);

add(slide('A simple game',
  example('game 1',
    'You choose one of the three bins.',
    'I choose a number from that bin.',
    'Your goal is to maximize the chosen number.',
  _),
  parentCenter(xtable(
    basket(greenbold('A'), -50, 50),
    basket(greenbold('B'), 1, 3),
    basket(greenbold('C'), -5, 15),
  _).margin(100)),
_));

prose(
  'Which bin should you pick?',
  'Depends on your mental model of the other player (me).',
  _,
  'If you think I\'m working with you (unlikely), then you should pick A in hopes of getting 50.',
  'If you think I\'m against you (likely), then you should pick B as to guard against the worst case (get 1).',
  'If you think I\'m just acting uniformly at random, then you should pick C so that on average things are reasonable (get 5 in expectation).',
_);

////////////////////////////////////////////////////////////
// Expectimax
roadmap(0);

add(slide('Game tree',
  keyIdea('game tree',
    'Each node is a decision point for a player.',
    'Each root-to-leaf path is a possible outcome of the game.',
  _),
  parentCenter(
    UnkChc(UnkChc(-50, 50), UnkChc(1, 3), UnkChc(-5, 15)),
  _),
_));

prose(
  'Just as in search problems, we will use a tree to describe the possibilities of the game.',
  'This tree is known as a <b>game tree</b>.',
  _,
  'Note: We could also think of a game graph to capture the fact that there are multiple ways',
  'to arrive at the same game state.',
  'However, all our algorithms will operate on the tree rather than the graph',
  'since games generally have enormous state spaces,',
  'and we will have to resort to algorithms similar to backtracking search for search problems.',
_);

add(slide('Two-player zero-sum games',
  '$\\Players = \\{\\agent, \\opp\\}$',
  pause(),
  definition('two-player zero-sum game',
    '$\\StartState$: starting state', pause(),
    '$\\Actions(s)$: possible actions from state $s$', pause(),
    '$\\Succ(s, a)$: resulting state if choose action $a$ in state $s$', pause(),
    '$\\IsEnd(s)$: whether $s$ is an end state (game over)', pause(),
    '$\\Utility(s)$: agent\'s utility for end state $s$'.fontcolor('red'), pause(),
    '$\\Player(s) \\in \\Players$: player who controls state $s$'.fontcolor('red'),
  _),
_));

prose(
  'In this lecture, we will specialize to <b>two-player zero-sum</b> games, such as chess.',
  'To be more precise, we will consider games in which people take turns (unlike rock-paper-scissors)',
  'and where the state of the game is fully-observed (unlike poker, where you don\'t know the other players\' hands).',
  'By default, we will use the term <b>game</b> to refer to this restricted form.',
  _,
  'We will assume the two players are named $\\agent$ (this is your program) and $\\opp$ (the opponent).',
  'Zero-sum means that the utility of the agent is negative the utility of the opponent (equivalently, the sum of the two utilities is zero).',
  _,
  'Following our approach to search problems and MDPs,',
  'we start by formalizing a game.',
  'Since games are a type of state space model, much of the skeleton is the same: we have a start state,',
  'actions from each state, a deterministic successor state for each state-action pair,',
  'and a test on whether a state is at the end.',
  _,
  'The main difference is that each state has a designated $\\Player(s)$, which specifies whose turn it is.',
  'A player $p$ only gets to choose the action for the states $s$ such that $\\Player(s) = p$.',
  _,
  'Another difference is that instead of having edge costs in search problems or rewards in MDPs, we will instead have',
  'a utility function $\\Utility(s)$ defined only at the end states.',
  'We could have used edge costs and rewards for games (in fact, that\'s strictly more general),',
  'but having all the utility at the end states emphasizes the all-or-nothing aspect of most games.',
  'You don\'t get utility for capturing pieces in chess; you only get utility if you win the game.',
  'This ultra-delayed utility makes games hard.',
_);

add(slide('Example: chess',
  parentCenter(image('images/chess.jpg').width(150)),
  '$\\Players = \\{ \\text{white}, \\text{black} \\}$', pause(),
  'State $s$: (position of all pieces, whose turn it is)', pause(),
  '$\\Actions(s)$: legal chess moves that $\\Player(s)$ can make', pause(),
  '$\\IsEnd(s)$: whether $s$ is checkmate or draw', pause(),
  '$\\Utility(s)$: $+\\infty$ if white wins, $0$ if draw, $-\\infty$ if black wins',
_));

prose(
  'Chess is a canonical example of a two-player zero-sum game.',
  'In chess, the state must represent the position of all pieces,',
  'and importantly, whose turn it is (white or black).',
  _,
  'Here, we are assuming that white is the agent and black is the opponent.',
  'White moves first and is trying to maximize the utility,',
  'whereas black is trying to minimize the utility.',
  _,
  'In most games that we\'ll consider, the utility is degenerate in that it will be $+\\infty$, $-\\infty$, or $0.$',
_);

add(slide('Characteristics of games',
  bulletedText('All the utility is at the end state'),
  parentCenter(image('images/windy-road.jpg').width(200)),
  pause(),
  bulletedText('Different players in control at different states'),
  parentCenter(image('images/playing-chess.jpg').width(200)),
_));

prose(
  'There are two important characteristics of games which make them hard.',
  _,
  'The first is that the utility is only at the end state.',
  'In typical search problems and MDPs that we might encounter,',
  'there are costs and rewards associated with each edge.',
  'These intermediate quantities make the problem easier to solve.',
  'In games, even if there are cues that indicate how well one is doing (number of pieces, score),',
  'technically all that matters is what happens at the end.',
  'In chess, it doesn\'t matter how many pieces you capture, your goal is just to checkmate the opponent\'s king.',
  _,
  'The second is the recognition that there are other people in the world!',
  'In search problems, you (the agent) controlled all actions.',
  'In MDPs, we already hinted at the loss of control where nature controlled the chance nodes,',
  'but we assumed we knew what distribution nature was using to transition.',
  'Now, we have another player that controls certain states, who is probably out to get us.',
_);

add(slide('The halving game',
  problem('halving game',
    'Start with a number $N$.',
    'Players take turns either decrementing $N$ or replacing it with $\\lfloor \\frac{N}{2} \\rfloor$.',
    'The player that is left with 0 wins.',
  _),
  pause(),
  parentCenter(linkToVideo('[semi-live solution: <tt>HalvingGame</tt>]', 'halvingGame.mp4')),
_));

////////////////////////////////////////////////////////////

add(slide('Policies',
  stmt('Deterministic policies: $\\pi_p(s) \\in \\Actions(s)$'),
  indent('action that player $p$ takes in state $s$'),
  //parentCenter('$\\pi_\\agent(\\StartState) = \\text{A}$').scale(0.7),
  pause(),
  stmt('Stochastic policies $\\pi_p(s, a) \\in [0, 1]$'),
  indent('probability of player $p$ taking action $a$ in state $s$'),
  /*parentCenter(xtable(
    '$\\pi_\\agent(\\StartState, \\text{A}) = 0.5$',
    '$\\pi_\\agent(\\StartState, \\text{B}) = 0.5$',
  _).margin(100)).scale(0.7),*/
  pause(), 
  parentCenter(linkToVideo('[semi-live solution: <tt>humanPolicy</tt>]', 'humanPolicy.mp4')),
_));

prose(
  'Following our presentation of MDPs, we revisit the notion of a <b>policy</b>.',
  //'We will use $\\Pi$ to represent the collection of policies, one for each player.',
  //'Specifically, $\\Pi = (\\pi_p)_{p \\in \\Player}$, where $\\pi_p$ is the policy for player $p$.',
  'Instead of having a single policy $\\pi$, we have a policy $\\pi_p$ for each player $p \\in \\Players$.',
  'We require that $\\pi_p$ only be defined when it\'s $p$\'s turn; that is, for states $s$ such that $\\Player(s) = p$.',
  //'Usually, we will have $\\Pi = (\\pi_\\agent, \\pi_\\opp)$ for a two-player game between an agent and an opponent.',
  _,
  'It will be convenient to allow policies to be stochastic.',
  'In this case, we will use $\\pi_p(s,a)$ to denote the probability of player $p$ choosing action $a$ in state $s$.',
  _,
  _,
  'We can think of an MDP as a game between the agent and nature.',
  'The states of the game are all MDP states $s$ and all chance nodes $(s,a)$.',
  'It\'s the agent\'s turn on the MDP states $s$, and the agent acts according to $\\pi_\\agent$.',
  'It\'s nature\'s turn on the chance nodes.  Here, the actions are successor states $s\'$,',
  'and nature chooses $s\'$ with probability given by the transition probabilities of the MDP:',
  '$\\pi_\\text{nature}((s, a), s\') = T(s, a, s\')$.',
_);

add(slide('Game evaluation example',
  example('game evaluation',
    '$\\pi_\\agent(s) = \\text{A}$',
    '$\\pi_\\opp(s, a) = \\frac12$ for $a \\in \\Actions(s)$',
    pause(),
    gameTree(averageCombineFunc, [1, 0, 0], ChcIcon(), [Chc(-50, 50), Chc(1, 3), Chc(-5, 15)]),
    pause(),
    parentCenter('$\\boxed{V_{\\agent,\\opp}(\\StartState) = 0}$'),
  _).scale(0.9),
_));

prose(
  'Given two policies $\\pi_\\agent$ and $\\pi_\\opp$, what is the (agent\'s) expected utility?',
  'That is, if the agent and the opponent were to play their (possibly stochastic) policies a large number of times,',
  'what would be the average utility?',
  'Remember, since we are working with zero-sum games,',
  'the opponent\'s utility is the negative of the agent\'s utility.',
  _,
  'Given the game tree, we can recursively compute the value (expected utility) of each node in the tree.',
  'The value of a node is the weighted average of the values of the children',
  'where the weights are given by the probabilities of taking various actions given by the policy at that node.',
_);

add(slide('Game evaluation recurrence',
  stmt('Analogy: recurrence for policy evaluation in MDPs'),
  gameEvaluationGraph(),
  // This gets formatted strangely for some reason in MathJax 2.4, but not 2.2
  //parentCenter(nowrapText('$\\displaystyle V_\\Pi(s) = \\begin{cases} \\Utility(s) & \\IsEnd(s) \\\\ \\sum_{a \\in \\Actions(s)} \\pi_\\agent(s, a) V_\\Pi(\\Succ(s, a)) & \\Player(s) = \\agent \\\\ \\sum_{a \\in \\Actions(s)} \\pi_\\opp(s, a) V_\\Pi(\\Succ(s, a)) & \\Player(s) = \\opp \\end{cases}$').scale(0.7)),
  stmt('Value of the game'),
  parentCenter(xtable(
    '$\\displaystyle V_{\\agent,\\opp}(s) = $',
    text('$\\left\\{ \\right.$').scale(1, 4),
    table(
      ['$\\Utility(s)$', '$\\IsEnd(s)$'],
      ['$\\sum_{a \\in \\Actions(s)} \\pi_\\agent(s, a) V_{\\agent,\\opp}(\\Succ(s, a))$', '$\\Player(s) = \\agent$'],
      ['$\\sum_{a \\in \\Actions(s)} \\pi_\\opp(s, a) V_{\\agent,\\opp}(\\Succ(s, a))$', '$\\Player(s) = \\opp$'],
    _).margin(10, 5),
  _).center().margin(10)).scale(0.65),
  // Even this doesn't work...
  //text('$V_\\Pi(s) = \\begin{cases} a & this is a test \\\\ \\sum_{a(s)} & a \\\\ \\sum_{a(s)} & a \\end{cases}$').scale(0.3),
_));

prose(
  'More generally, we can write down a recurrence for $V_{\\agent,\\opp}(s)$,',
  'which is the <b>value</b> (expected utility) of the game at state $s$.',
  _,
  'There are three cases:',
  'If the game is over ($\\IsEnd(s)$), then the value is just the utility $\\Utility(s)$.',
  'If it\'s the agent\'s turn, then we compute the expectation over the value of the successor resulting from the agent choosing an action according to $\\pi_\\agent(s,a)$.',
  'If it\'s the opponent\'s turn, we compute the expectation with respect to $\\pi_\\opp$ instead.',
_);

/*add(slide('Game evaluation definition',
  definition('game value function',
    'Agent follows $\\pi_\\agent$ and opponent follows $\\pi_\\opp$.',
    'Then $V_\\Pi(s)$ is the expected utility of the game, where $\\Pi = (\\pi_\\agent, \\pi_\\opp)$.',
    pause(),
    'Define $\\V[\\pi_\\agent, \\pi_\\opp] = V_\\Pi(\\StartState)$.',
  _),
_));

prose(
  'Formally, the value of the game $V_\\Pi$ is the expected utility that the agent obtains from state $s$',
  '(remember, since this is a zero-sum game, the opponent\'s utility is the negative of the agent\'s utility).',
  'Recall that $\\Pi = (\\pi_\\agent, \\pi_\\opp)$ includes the policies of both agent and opponent.',
  'We will soon define a recurrence for this quantity, just like we did for MDPs.',
  _,
  'In addition, we use the $\\V[\\pi_\\agent, \\pi_\\opp]$ notation,',
  'which defaults to the starting state and makes the policies explicit.',
  'This quantity will be useful for talking about what happens in the game',
  'when players vary their strategies.',
_);*/

add(slide('Expectimax example',
  example('expectimax',
    '$\\pi_\\opp(s, a) = \\frac12$ for $a \\in \\Actions(s)$',
    pause(),
    expectimaxGameExample(),
    pause(),
    parentCenter('$\\boxed{V_{{\\max},\\opp}(\\StartState) = 5}$'),
  _).scale(0.9),
_));

prose(
  'Game evaluation just gave us the value of the game with two fixed policies $\\pi_\\agent$ and $\\pi_\\opp$.',
  'But we are not handed a policy $\\pi_\\agent$; we are trying to find the best policy.',
  'Expectimax gives us exactly that.',
  _,
  'In the game tree, we will now use an upward-pointing triangle to denote states where',
  'the player is maximizing over actions (we call them <b>max nodes</b>).',
  _,
  'At max nodes, instead of averaging with respect to a policy,',
  'we take the max of the values of the children.',
  _,
  'This computation produces the <b>expectimax value</b> $V_{{\\max},\\opp}(s)$ for a state $s$,',
  'which is the maximum expected utility of any agent policy when playing with respect to an opponent policy $\\pi_\\opp$.',
_);

/*add(slide('Expectimax definition',
  definition('expectimax value function',
    'The value $V_{\\max,\\opp}(s)$ is the maximum expected utility of any agent policy',
    'when playing with respect to the opponent policy $\\pi_\\opp$.',
  _),
_));

prose(
  'Formally, we define the expectimax value $V_{\\max,\\opp}$ with respect to a fixed opponent policy $\\pi_\\opp$ to be',
  'the maximum expected utility of any agent policy if the opponent policy is $\\pi_\\opp$.',
  _,
  'Game evaluation is the analogue of policy evaluation in MDPs,',
  'and expectimax is the analogoue of value iteration in MDPs.',
_);*/

add(slide('Expectimax recurrence',
  stmt('Analogy: recurrence for value iteration in MDPs'),
  agentNatureGraph(),
  pause(),
  parentCenter(nowrapText('$\\displaystyle V_{{\\max},\\opp}(s) = \\begin{cases} \\Utility(s) & \\IsEnd(s) \\\\ \\red{\\max_{a \\in \\Actions(s)}} V_{{\\max},\\opp}(\\Succ(s, a)) & \\Player(s) = \\agent \\\\ \\sum_{a \\in \\Actions(s)} \\pi_\\opp(s, a) V_{{\\max},\\opp}(\\Succ(s, a)) & \\Player(s) = \\opp \\end{cases}$').scale(0.65)),
_));

prose(
  'The recurrence for the expectimax value $V_{{\\max},\\opp}$ is exactly the same as the one for the game value $V_{\\agent, \\opp}$,',
  'except that we maximize over the agent\'s actions rather than following a fixed agent policy (which we don\'t know now).',
  _,
  'Where game evaluation was the analogue of policy evaluation for MDPs,',
  'expectimax is the analogue of value iteration.',
_);

add(slide(nil(),
  stmt('Problem: don\'t know opponent\'s policy'),
  pause(),
  stmt('Approach: assume the worst case'),
  parentCenter(image('images/apocalypse.jpg').width(400)),
_));

////////////////////////////////////////////////////////////
// Minimax
roadmap(1);

add(slide('Minimax example',
  example('minimax',
    Max(Min(-50, 50), Min(1, 3), Min(-5, 15)),
    pause(),
    parentCenter('$\\boxed{V_{\\max,\\min}(\\StartState) = 1}$'),
  _).scale(0.9),
_));

prose(
  'If we could perform some mind-reading and discover the opponent\'s policy, then we could maximally exploit it.',
  'However, in practice, we don\'t know the opponent\'s policy.',
  'So our solution is to assume the <b>worst case</b>,',
  'that is, the opponent is doing everything to minimize the agent\'s utility.',
  _,
  'In the game tree,',
  'we use an upside-down triangle to represent <b>min nodes</b>,',
  'in which the player minimizes the value over possible actions.',
  _,
  'Note that the policy for the agent changes from choosing the rightmost action (expectimax) to the middle action.',
  'Why is this?',
_);

/*add(slide('Minimax definition',
  definition('value function',
    'The value $V_{\\max,\\min}(s)$ is the <b>minimax</b> utility ' +
    'when the agent tries to maximize utility and ' +
    'the opponent tries to minimize utility.',
  _),
_));

prose(
  'We say that the opponent is <b>adversarial</b> in this case.',
_);*/

add(slide('Minimax recurrence',
  stmt('No analogy in MDPs'),
  agentOpponentGraph(),
  pause(),
  parentCenter(nowrapText('$\\displaystyle V_{\\max,\\min}(s) = \\begin{cases} \\Utility(s) & \\IsEnd(s) \\\\ \\red{\\max_{a \\in \\Actions(s)}} V_{\\max,\\min}(\\Succ(s, a)) & \\Player(s) = \\agent \\\\ \\blue{\\min_{a \\in \\Actions(s)}} V_{\\max,\\min}(\\Succ(s, a)) & \\Player(s) = \\opp \\end{cases}$').scale(0.7)),
_));

prose(
  'The general recurrence for the minimax value is the same as expectimax,',
  'except that the expectation over the opponent\'s policy is replaced with a minimum over the opponent\'s possible actions.',
  'Note that the minimax value does not depend on any policies at all:',
  'it\'s just the agent and opponent playing optimally with respect to each other.',
_);

add(slide('Extracting minimax policies',
  parentCenter(ytable(
    '$\\displaystyle \\red{\\pi_{\\max}(s)} = \\arg\\max_{a \\in \\Actions(s)} V_{\\max,\\min}(\\Succ(s, a))$',
    '$\\displaystyle \\blue{\\pi_{\\min}(s)} = \\arg\\min_{a \\in \\Actions(s)} V_{\\max,\\min}(\\Succ(s, a))$',
  _)),
  minmaxGameExample(),
_));

prose(
  'Having computed the minimax value $V_{\\max,\\min}$,',
  'we can extract the minimax policies $\\pi_{\\max}$ and $\\pi_{\\min}$',
  'by just taking the action that leads to the state with the maximum (or minimum) value.',
  _,
  'In general, having a value function tells you which states are good,',
  'from which it\'s easy to set the policy to move to those states',
  '(provided you know the transition structure, which we assume we know here).',
_);

add(slide('The halving game',
  problem('halving game',
    'Start with a number $N$.',
    'Players take turns either decrementing $N$ or replacing it with $\\lfloor \\frac{N}{2} \\rfloor$.',
    'The player that is left with 0 wins.',
  _),
  pause(),
  parentCenter(linkToVideo('[semi-live solution: <tt>minimaxPolicy</tt>]', 'minimaxPolicy.mp4')),
_));

add(slide('Minimax property 1',
  proposition('best against minimax opponent',
    '$\\ValueStart{\\max}{\\min} \\ge \\ValueStart{\\red\\agent}{\\min}$ for all $\\red{\\pi_\\agent}$',
  _),
  minmaxGameExample(),
_));

prose(
  'Now let us walk through three properties of minimax.',
  _,
  'Recall that $\\pi_{\\max}$ and $\\pi_{\\min}$ are the minimax policies.',
  'The first property is if the agent were to change her policy to any $\\pi_\\agent$,',
  'then the agent would be no better off (and in general, worse off).',
  _,
  'From the example, it\'s intuitive that this property should hold.',
  'To prove it, we can perform induction starting from the leaves of the game tree,',
  'and show that the minimax value of each node is the highest over all possible policies.',
_);

add(slide('Minimax property 2',
  proposition('lower bound against any opponent',
    '$\\ValueStart{\\max}{\\min} \\le \\\ValueStart{\\max}{\\blue\\opp}$ for all $\\blue{\\pi_\\opp}$',
  _),
  minmaxGameExample(),
_));

prose(
  'The second property is the analogous statement for the opponent:',
  'if the opponent changes his policy from $\\pi_{\\min}$ to $\\pi_\\opp$,',
  'then he will be no better off (the value of the game can only increase).',
  _,
  'From the point of the view of the agent, this can be interpreted as guarding against the worst case.',
  'In other words, if we get a minimax value of $1$, that means no matter what the opponent does,',
  'the agent is guaranteed at least a value of $1$.',
  'As a simple example, if the minimax value is $+\\infty$, then the agent is guaranteed to win,',
  'provided it follows the minimax policy.',
_);

add(slide('Minimax non-property 3',
  proposition('not optimal against all opponents',
    'Suppose opponent policy is $\\pi_\\opp$.',
    '$\\ValueStart{\\max}{\\opp} \\not \\ge \\ValueStart{\\red\\agent}{\\opp}$ for all $\\red{\\pi_\\agent}$',
  _),
  expectimaxGameExample(),
_));

prose(
  'However, following the minimax policy might not be optimal for the agent',
  'if the opponent is not playing the adversarial (minimax) policy.',
  _,
  'In this simple example, suppose the agent is playing $\\pi_{\\max}$,',
  'but the opponent is playing a stochastic policy $\\pi_\\opp$.',
  'Then the game value here would be $2$ (which is larger than the minimax value $1$, as guaranteed by the second property).',
  'However, if we followed the policy $\\pi_\\agent$ corresponding to expectimax, then we would have gotten a value of $5$,',
  'which is even higher.',
  _,
  'To summarize, let $\\pi_\\agent$ be the expectimax policy against the stochastic opponent $\\pi_\\opp$,',
  'and $\\pi_{\\max}$ and $\\pi_{\\min}$ be the minimax policies.',
  'Then we have the following values for the example game tree:',
  _,
  'Agent\'s expectimax policy against opponent\'s minimax policy: $\\ValueStart{\\agent}{\\min} = -5$.',
  _,
  'Agent\'s minimax policy against opponent\'s minimax policy: $\\ValueStart{\\max}{\\min} = 1$.',
  _,
  'Agent\'s minimax policy against opponent\'s stochastic policy: $\\ValueStart{\\max}{\\opp} = 2$.',
  _,
  'Agent\'s expectimax policy against opponent\'s stochastic policy: $\\ValueStart{\\agent}{\\opp} = 5$.',
  _,
  'The four game values are related as follows:',
  '$\\ValueStart{\\agent}{\\min} \\le \\ValueStart{\\max}{\\min} \\le \\ValueStart{\\max}{\\opp} \\le \\ValueStart{\\agent}{\\opp}$.',
  'Make sure you understand this.',
_);

/*add(slide('Example: Backgammon',
  parentCenter(xtable(
    image('images/backgammon1.jpg').width(250),
    image('images/backgammon2.jpg').width(250),
  _).margin(50).center()),
  //parentCenter('[demo]').linkToUrl('http://games.yahoo.com/game/backgammon-quick-play-flash.html'),
  headerList('Rules (abbreviated)',
    'Player rolls two die, then moves two pieces that number of positions (into legal positions).',
    'Player who moves all her pieces off the board wins.',
  _),
_));*/

add(slide('A modified game',
  example('game 2',
    'You choose one of the three bins.',
    red('Flip a coin; if heads, then move one bin to the left (with wrap around).'),
    'I choose a number from that bin.',
    'Your goal is to maximize the chosen number.',
  _),
  parentCenter(xtable(
    basket('A', -50, 50),
    basket('B', 1, 3),
    basket('C', -5, 15),
  _).margin(100)),
_));

prose(
  'Now let us consider games that have an element of chance that does not come from the agent or the opponent.',
  'Or in the simple modified game, the agent picks, a coin is flipped, and then the opponent picks.',
  _,
  'It turns out that handling games of chance is just a straightforward extension of the game framework that we have already.',
_);

add(slide('Expectiminimax example',
  example('expectiminimax',
    '$\\pi_\\coin(s, a) = \\frac12$ for $a \\in \\{0,1\\}$',
    pause(),
    expectiminimaxGameExample().scale(0.6),
    pause(),
    parentCenter('$\\boxed{V_{{\\max},{\\min},\\coin}(\\StartState) = -2}$'),
  _),
_));

prose(
  'In the example, notice that the minimax optimal policy has shifted from the middle action to the rightmost action,',
  'which guards against the effects of the randomness.',
  'The agent really wants to avoid ending up on A, in which case the opponent could deliver a deadly $-50$ utility.',
_);

add(slide('Expectiminimax recurrence',
  '$\\Players = \\{ \\agent, \\opp, \\green{\\coin} \\}$',
  /*definition('value function',
    'The value $V_{\\min,\\max}(s)$ is the utility if the agent follows the '+redbold('best')+' policy, the opponent follows the '+bluebold('adversarial')+' policy, the coin follows a fixed policy.',
  _),*/
  pause(),
  backgammonGraph(),
  pause(),
  parentCenter(nowrapText('$\\displaystyle V_{\\max,\\min,\\coin}(s) = \\begin{cases} \\Utility(s) & \\IsEnd(s) \\\\ \\red{\\max_{a \\in \\Actions(s)}} V_{\\max,\\min,\\coin}(\\Succ(s, a)) & \\Player(s) = \\agent \\\\ \\blue{\\min_{a \\in \\Actions(s)}} V_{\\max,\\min,\\coin}(\\Succ(s, a)) & \\Player(s) = \\opp \\\\ \\green{\\sum_{a \\in \\Actions(s)} \\pi_\\coin(s, a)} V_{\\max,\\min,\\coin}(\\Succ(s, a)) & \\Player(s) = \\coin \\end{cases}$').scale(0.6)),
_));

prose(
  'The resulting game is modeled using <b>expectiminimax</b>,',
  'where introduce a third player (called coin), which always follows a known stochastic policy.',
  'We are using the term <i>coin</i> as just a metaphor for any sort of natural randomness.',
  _,
  'To handle coin, we simply add a line into our recurrence that sums over actions when it\'s coin\'s turn.',
_);

add(summarySlide('Summary so far',
  stmt('Primitives: '+red('max')+' nodes, '+green('chance')+' nodes, '+blue('min')+' nodes'),
  pause(),
  stmt('Composition: alternate nodes according to model of game'),
  pause(),
  stmt('Value function $V(s)$: recurrence for expected utility'),
  pause(),
  headerList('Scenarios to think about',
    'What if you are playing against multiple opponents?',
    'What if you and your partner have to take turns (table tennis)?',
    'Some actions allow you to take an extra turn?',
  _),
_));

prose(
  'In summary, so far, we\'ve shown how to model a number of games using game trees, where each node of the game tree',
  'is either a max, chance, or min node depending on whose turn it is at that node and what we believe about that player\'s policy.',
  _,
  'Using these primitives, one can model more complex turn-taking games involving multiple players with heterogeneous strategies and where the turn-taking doesn\'t have to strictly alternate.',
  'The only restriction is that there are two parties: one that seeks to maximize utility and the other that seeks to minimize utility,',
  'along with other players who have known fixed policies (like $\\coin$).',
_);

add(slide('Computation',
  parentCenter(xtable(
    parentCenter(image('images/chess.jpg').width(150)),
    minmaxGameExample().scale(0.6),
  _).margin(100)),
  pause(),
  stmt('Approach: tree search'),
  headerList('Complexity',
    'branching factor $b$, depth $d$ ($2d$ plies)',
    '$O(d)$ space, $O(b^{2d})$ time', 
  _),
  pause(),
  stmt('Chess: $b \\approxeq 35$, $d \\approxeq 50$'),
  pause(),
  parentCenter(nowrapText('25515520672986852924121150151425587630190414488161019324176778440771467258239937365843732987043555789782336195637736653285543297897675074636936187744140625')).scale(0.3),
_));

prose(
  'Thus far, we\'ve only touched on the modeling part of games.',
  'The rest of the lecture will be about how to actually compute (or approximately compute) the values of games.',
  _,
  'The first thing to note is that we cannot avoid exhaustive search of the game tree in general.',
  'Recall that a state is a summary of the past actions which is sufficient to act optimally in the future.',
  'In most games, the future depends on the exact position of all the pieces, so we cannot forget much and exploit dynamic programming.',
  _,
  'Second, game trees can be enormous.  Chess has a branching factor of around 35 and go has a branching factor of up to 361 (the number of moves to a player on his/her turn).',
  'Games also can last a long time, and therefore have a depth of up to $100$.',
  _,
  'A note about terminology specific to games:',
  'A game tree of depth $d$ corresponds to a tree where each player has moved $d$ times.',
  'Each level in the tree is called a <b>ply</b>.',
  'The number of plies is the depth times the number of players.',
_);

add(slide('Speeding up minimax',
  bulletedText(stmt('Evaluation functions: use domain-specific knowledge, compute approximate answer')),
  bulletedText(stmt('Alpha-beta pruning: general-purpose, compute exact answer')),
  parentCenter(image('images/speeding-train.jpg')),
_));

prose(
  'The rest of the lecture will be about how to speed up the basic minimax search using two ideas:',
  'evaluation functions and alpha-beta pruning.',
_);

////////////////////////////////////////////////////////////
// Evaluation functions
roadmap(2);

add(slide('Depth-limited search',
  depthLimitedSchema(),
  pause(),
  parentCenter(
    stagger(
      yseq(stmt('Full tree search'), nowrapText(fullTreeSearch).scale(0.65)),
      yseq(stmt('Limited depth tree search (stop at maximum depth $d_\\text{max}$)'), nowrapText(limitedDepthSearch).scale(0.65)),
    _),
  _),
  pause(),
  stmt('Use: at state $s$, call $V_{\\max,\\min}(s, d_\\text{max})$'),
  stmt('Convention: decrement depth at last player\'s turn'),
_));

add(slide('Evaluation functions',
  depthLimitedSchema(),
  definition('Evaluation function',
    'An evaluation function $\\text{Eval}(s)$ is a (possibly very weak) estimate of the value $V_{\\max,\\min}(s)$.',
  _),
  pause(),
  stmt('Analogy: $\\FutureCost(s)$ in search problems'),
_));

prose(
  'The first idea on how to speed up minimax is to search only the tip of the game tree, that is down to depth $d_\\text{max}$, which is much smaller than the total depth of the tree $D$ (for example, $d_\\text{max}$ might be $4$ and $D = 50$).',
  _,
  'We modify our minimax recurrence from before by adding an argument $d$, which the maximum depth that we are willing to descend from state $s$.',
  'If $d = 0$, then we don\'t do any more search, but fall back to an <b>evaluation function</b> $\\Eval(s)$, which is supposed to approximate the value of $V_{\\max,\\min}(s)$',
  '(just like the heuristic $h(s)$ approximated $\\FutureCost(s)$ in A* search).',
  _,
  'If $d > 0$, we recurse, decrementing the allowable depth by one at only min nodes, not the max nodes.',
  'This is because we are keeping track of the depth rather than the number of plies.',
_);

add(slide('Evaluation functions',
  parentCenter(image('images/chess.jpg').width(200)),
  example('chess',
    nowrapText('$\\Eval(s) = \\text{material} + \\text{mobility} + \\text{king-safety} + \\text{center-control}$'),
    pause(),
    nowrapText('$\\text{material} = 10^{100} (K-K\') + 9(Q-Q\') + 5(R-R\') +$'),
    xtable(xspace(200), nowrapText('$3(B-B\'+N-N\') + 1(P-P\')$')),
    pause(),
    nowrapText('$\\text{mobility} = 0.1(\\text{num-legal-moves} - \\text{num-legal-moves}\')$'),
    '...',
  _).scale(0.8),
_));

prose(
  'Now what is this mysterious evaluation function $\\Eval(s)$ that serves as a substitute for the horrendously hard $V_{\\max,\\min}$ that we can\'t compute?',
  _,
  'Just as in A*, there is no free lunch, and we have to use domain knowledge about the game.',
  'Let\'s take chess for example.',
  'While we don\'t know who\'s going to win, there are some features of the game that are likely indicators.',
  'For example, having more pieces is good (material), being able to move them is good (mobility),',
  'keeping the king safe is good, and being able to control the center of the board is also good.',
  'We can then construct an evaluation function which is a weighted combination of the different properties.',
  _,
  'For example, $K - K\'$ is the difference in the number of kings that the agent has over the number that the opponent has (losing kings is really bad since you lose then),',
  '$Q-Q\'$ is the difference in queens,',
  '$R-R\'$ is the difference in rooks,',
  '$B-B\'$ is the difference in bishops,',
  '$N-N\'$ is the difference in knights,',
  'and $P-P\'$ is the difference in pawns.',
_);

add(slide('Function approximation',
  keyIdea('parameterized evaluation functions',
    '$\\Eval(s; \\w)$ depends on weights $\\w \\in \\R^d$',
  _),
  pause(),
  stmt('Feature vector: $\\phi(s) \\in \\R^d$'),
  parentCenter(ytable(
    '$\\phi_1(s) = K - K\'$',
    '$\\phi_2(s) = Q - Q\'$',
    '...',
  _)),
  pause(),
  stmt('Linear evaluation function'),
  parentCenter('$\\Eval(s; \\w) = \\w \\cdot \\phi(s)$'),
_));

prose(
  'Whenever you have written down a function that includes a weighted combination of different terms,',
  'there might be an opportunity for using machine learning to automatically tune these weights.',
  _,
  'In this case, we can take all the properties of the state, such as the difference in number of queens,',
  'as features $\\phi(s)$.',
  'Note that in Q-learning with function approximation, we had a feature vector on each state-action pair.',
  'Here, we just need a feature vector on the state.',
  _,
  'We can then define the evaluation function as a dot product between a weight vector $\\w$ and the feature vector $\\phi(s)$.',
_);

/*add(slide('How to learn?',
  parentCenter('$\\Eval(s; \\w) = \\w \\cdot \\phi(s)$'),
  pause(),
  depthLimitedSchema(),
  headerList('Challenge',
    'All the utility is at leaves',
    'To learn, need to play full games...',
  _),
_));

prose(
  'How do we learn the weights $\\w$?',
  'In learning, we need some sort of supervision signal to guide us.',
  'In supervised learning, it was the correct output; in reinforcement learning,',
  'it was the utility (discounted sum of rewards) gotten by following a sequence of actions.',
  _,
  'In games, since all the utility is at the leaves, we need to play the game to completion to get any sort of signal.',
  'We will talk about the actual learning algorithm later.',
  'For now, we will just talk about acquiring a supervision signal.',
  _,
  'Another way to think about it: if we had $V_\\opt(s)$ for every state, then we could learn the weights for $\\Eval(s; \\w)$',
  'by doing linear regression.',
  'However, the whole point is that we don\'t have $V_\\opt(s)$.  Can we acquire it or some approximation of it?',
_);*/

add(slide('Approximating the true value function',
  'If knew optimal policies $\\pi_{\\max}, \\pi_{\\min}$, game tree evaluation provides best evaluation function:',
  parentCenter('$\\Eval(s) = \\red{V_{\\max,\\min}(s)}$'),
  parentCenter('Intractable!'),
  pause(),
  headerList('Two approximations',
    'Replace optimal policies with heuristic (stochastic) policies',
    'Use Monte Carlo approximation',
  _),
_));

prose(
  'Recall that the minimax value $V_{\\max,\\min}(s)$ is the game value where the agent and the opponent both',
  'follow the minimax policies $\\pi_{\\max}$ and $\\pi_{\\min}$.',
  'This is clearly intractable to compute.',
  'So we will approximate this value in two ways.',
_);

add(slide('Approximation 1: stochastic policies',
  'Replace $\\pi_{\\max}, \\pi_{\\min}$ with stochastic $\\pi_\\agent, \\pi_\\opp$:',
  example('game 1',
    xtable(
      minmaxGameExample(),
      randomGameExample(),
    _).margin(50).scale(0.6),
  _),
  pause(),
  '$\\Eval(s) = V_{\\agent, \\opp}(s)$ is still hard to compute...',
_));

prose(
  'First, we will simply replace the minimax policies with some stochastic policies $\\pi_\\agent$ and $\\pi_\\opp$.',
  'A naive thing would be to use policies that choose actions uniformly at random (as in the example),',
  'but in practice, we would want to choose better actions with higher probability.',
  'After all, these policies are supposed to be approximations of the minimax policies.',
  _,
  'In the example, the correct value is $1$, but our approximation gives $2.3$.',
  _,
  'Unfortunately, following even stochastic policies is difficult to compute because we have to enumerate all nodes in the tree.',
_);

function monteCarloEvalExample() {
  var n = 10;
  var items = [-50, 50, 1, 3, -5, 15];
  var values = [];
  var sum = 0;
  Math.seedrandom(2);
  for (var i = 0; i < n; i++) {
    var v = randomChoice(items);
    values.push(v);
    sum += v;
  }
  return nowrapText('$\\frac{1}{'+n+'} [' + values.map(function(v) { return '('+v+')'; }).join(' + ') + '] = ' + round(sum / n, 1) + '$');
}

add(slide('Approximation 2: Monte Carlo',
  headerList('Approach',
    'Simulate $n$ random paths by applying the policies',
    'Average the utilities of the $n$ paths',
  _),
  example('game 1',
    xtable(
      randomGameExample(),
    _).margin(50).scale(0.6),
  _),
  pause(),
  '$\\Eval(\\StartState) = \\hat\\V_{\\agent, \\opp}(\\StartState) = $',
  parentCenter(monteCarloEvalExample()).scale(0.6),
_));

prose(
  'However, moving to a fixed stochastic policy sets the stage for the second approximation.',
  'Recall that Monte Carlo is a very powerful tool that allows us to approximate an expectation with samples.',
  _,
  'In this context, we will simply have the two policies play out the game $n$ times, resulting in $n$ paths (episodes).',
  'Each path has an associated utility.',
  'We then just average the $n$ utilities together and call that our estimate $\\hat\\V_{\\agent, \\opp}(\\StartState)$ of the game value.',
  _,
  'From the example, you\'ll see that the values obtained by sampling are centered around the true value of $2.3$,',
  'but have some variance, which will decrease as we get more samples ($n$ increases).',
_);

add(slide('Monte Carlo Go',
  parentCenter(image('images/go.jpg')),
  'Go has branching factor of 250, depth of 150',
  pause(),
  stmt('Example heuristic policy: if stone is threatened, try to save it; otherwise move randomly'),
  'Monte Carlo is responsible for recent successes',
_));

prose(
  'Minimax search with hand-tuned evaluation functions was quite successful for producing chess-playing programs.',
  'However, these traditional methods worked horribly for Go,',
  'because the branching factor of Go was 250, much larger than Chess\'s 35.',
  _,
  'Since the mid-2000s, researchers have made a ton of progress on Go,',
  'largely thanks to the use of Monte Carlo methods for creating evaluation functions.',
  'It should be quite surprising that the result obtained by moving under a simple heuristic is actually helpful',
  'for determining the result obtained by playing carefully.',
  _,
  'One of the key ingredients in AlphaGo\'s big success in March 2016 was the use of Monte Carlo Tree Search methods',
  'for exploring the game tree.',
  'The other two ingredients leveraged advances in convolutional neural networks:',
  '(i) a policy network was used as the stochastic policy to guide the search, and',
  '(ii) a value network was used as the evaluation function.',
_);

add(summarySlide('Summary: evaluation functions',
  stmt('Depth-limited exhaustive search: $O(b^{2d})$ time'),
  depthLimitedSchema(),
  pause(),
  headerList('Rely on evaluation function',
    'Function approximation: parameterize by $\\w$ and features',
    'Monte Carlo approximation: play many games heuristically (randomize)',
  _),
_));

prose(
  'To summarize, this section has been about how to make naive exhaustive search over the game tree',
  'to compute the minimax value of a game faster.',
  _,
  'The methods so far have been focused on taking shortcuts: only searching up to depth $d$ and relying on an <b>evaluation function</b>,',
  'a cheaper mechanism for estimating the value at a node rather than search its entire subtree.',
  _,
  'Function approximation allows us to use prior knowledge about the game in the form of features.',
  'Monte Carlo approximation allows us to look at thin slices of the subtree rather than looking at the entire tree.',
_);

////////////////////////////////////////////////////////////
// Alpha-beta pruning
roadmap(3);

add(slide('Pruning principle',
  nil(),
  stmt('Choose A or B with maximum value'),
  parentCenter(
    xtable('A: [3, <b>5</b>]', 'B: [<b>5</b>, 100]').margin(200),
  _),
  pause(),
  keyIdea('branch and bound',
    'Maintain lower and upper bounds on values.',
    'If intervals don\'t overlap non-trivially, then can choose optimally without further work.',
  _),
_));

prose(
  'We continue on our quest to make minimax run faster based on <b>pruning</b>.',
  'Unlike evaluation functions, these are general purpose and have theoretical guarantees.',
  _,
  'The core idea of pruning is based on the branch and bound principle.',
  'As we are searching (branching), we keep lower and upper bounds on each value we\'re trying to compute.',
  'If we ever get into a situation where we are choosing between two options A and B whose intervals don\'t overlap or just meet at a single point (in other words, they do not <b>overlap non-trivially</b>),',
  'then we can choose the interval containing larger values (B in the example).',
  'The significance of this observation is that we don\'t have to do extra work to figure out the precise value of A.',
_);

function blot(x) {
  return rect(x.realWidth(), x.realHeight()).color('white').shift(x.left(), x.top());
}

function prune(t) {
  t.branches[1].child.branches[1].edge.opacity(0);
  t.branches[1].child.branches[1].child.opacity(0);
  t.branches[1].child.tail().get().content.content('$\\le 2$'.fontcolor('blue'));  // Hack!
  return overlay(t);
}
gameTree.onlyShowAgentValue = true;
add(slide('Pruning game trees',
  parentCenter(stagger(
    Max(Min(3, 5), Min(2, 10)),
    Max(Min(3, 5), Min(2, 100)),
    Max(Min(3, 5), Min(2, -3)),
    prune(Max(Min(3, 5), Min(2, 10))),
  _)),
  pause(), 'Once see 2, we know that value of right node must be $\\le 2$',
  pause(), 'Root computes $\\max(3, \\le 2) = 3$',
  pause(), 'Since branch doesn\'t affect root value, can safely prune',
_));

prose(
  'In the context of minimax search, we note that the root node is a max over its children.',
  _,
  'Once we see the left child, we know that the root value must be at least 3.',
  _,
  'Once we get the 2 on the right, we know the right child has to be at most 2.',
  _,
  'Since those two intervals are non-overlapping, we can prune the rest of the right subtree and not explore it.',
_);

add(slide('Alpha-beta pruning',
  keyIdea('optimal path',
    'The optimal path is path that minimax policies take.',
    'Values of all nodes on path are the same.',
  _),
  parentCenter(overlay(
    xtable(
      rootedTree(
        s1 = MaxIcon(),
        '...',
        rootedTree(s2 = MinIcon(),
          '...',
          rootedTree(s3 = MaxIcon(),
            '...',
            s4 = MinIcon(),
          _),
      _)).recnodeBorderWidth(0).recdrawArrow2(true).recmargin(60, 60),
      headerList(null,
        pause(),
        bulletedText('$\\red{a_s}$: lower bound on value of max node $s$').width(400),
        pause(),
        bulletedText('$\\blue{b_s}$: upper bound on value of min node $s$').width(400),
        pause(2),
        bulletedText('Prune a node if its interval doesn\'t have non-trivial overlap with every ancestor (store $\\alpha_s = \\max_{s\' \\preceq s} a_s$ and $\\beta_s = \\min_{s\' \\preceq s} b_s$)').width(400),
      _),
    _).margin(50),
    showLevel(1),
    //moveRightOf(text('$\\red{\\ge \\alpha_1}$').scale(0.6), s1),
    //moveRightOf(text('$\\red{\\ge \\alpha_3}$').scale(0.6), s3),
    moveRightOf(text('$\\red{\\ge 6}$').scale(0.6), s1),
    pause(),
    //moveRightOf(text('$\\blue{\\le \\beta_2}$').scale(0.6), s2),
    //moveRightOf(text('$\\blue{\\le \\beta_4}$').scale(0.6), s4),
    moveRightOf(text('$\\blue{\\le 8}$').scale(0.6), s2),
    pause(),
    moveRightOf(text('$\\red{\\ge 3}$').scale(0.6), s3),
    pause(),
    moveRightOf(text('$\\blue{\\le 5}$').scale(0.6), s4),
  _)),
_));

prose(
  'In general, let\'s think about the minimax values in the game tree.',
  'The value of a node is equal to the utility of at least one of its leaf nodes',
  '(because all the values are just propagated from the leaves with min and max applied to them).',
  'Call the first path (ordering by children left-to-right) that leads to the first such leaf node the <b>optimal path</b>.',
  'An important observation is that the values of all nodes on the optimal path are the same',
  '(equal to the minimax value of the root).',
  _,
  'Since we are interested in computing the value of the root node,',
  'if we can prove that a node is not on the optimal path, then we can prune it and its subtree.',
  _,
  'To do this, during the depth-first exhaustive search of the game tree,',
  'we think about maintaining a lower bound ($\\ge a_s$) for all the max nodes $s$',
  'and an upper bound ($\\le b_s$) for all the min nodes $s$.',
  _,
  'If the interval of the current node does not non-trivially overlap the interval of every one of its ancestors,',
  'then we can prune the current node.',
  'In the example, we\'ve determined the root\'s node must be $\\ge 6$.',
  'Once we get to the node on at ply 4 and determine that node is $\\le 5$, we can prune the rest of its children',
  'since it is impossible that this node will be on the optimal path ($\\le 5$ and $\\ge 6$ are incompatible).',
  'Remember that all the nodes on the optimal path have the same value.',
  _,
  'Implementation note: for each max node $s$, rather than keeping $a_s$, we keep $\\alpha_s$, which is the maximum value of $a_{s\'}$',
  'over $s$ and all its max node ancestors.',
  'Similarly, for each min node $s$, rather than keeping $b_s$, we keep $\\beta_s$, which is the minimum value of $b_{s\'}$',
  'over $s$ and all its min node ancestors.',
  'That way, at any given node, we can check interval overlap in constant time regardless of how deep we are in the tree.',
_);

add(slide('Alpha-beta pruning example',
  parentCenter(
    //UnkMax(UnkMin(3, 4), UnkMin(6, UnkMax(3, 4), UnkMax(7, 9)), UnkMin(3, 8)),
    UnkMax(UnkMin(9, 7), UnkMin(6, UnkMax(3, 4), UnkMax(7, 9)), UnkMin(8, 3)),
  _),
_));

/*add(slide('Minimax algorithm',
  minimaxAlgorithm({pause: true}),
_));

add(slide('Alpha-beta pruning',
  alphaBetaAlgorithm({}).scale(0.9),
_));

prose(
  //'For each max node $s$, the local variable <tt>v</tt> keeps track of the lower bound $\\alpha_s$.',
  //_,
  //'For each min node $s$, the local variable <tt>v</tt> keeps track of the upper bound $\\beta_s$.',
  //_,
  'The alpha-beta algorithm takes two additional parameters:',
  '<tt>alpha</tt> is equal to the maximum $\\alpha_s$ over all the ancestors of the current node,',
  'and <tt>beta</tt> is equal to the minimum $\\beta_s$ over all the ancestors of the current node.',
  _,
  'On the max nodes, after we update our lower bound $\\alpha_s$ (<tt>v</tt>),',
  'if we find that this lower bound $\\alpha_s$',
  'is at least the upper bound of some ancestor (<tt>beta</tt>),',
  'then we can prune the current node.',
  _,
  'Similarly, after we update our upper bound $\\beta_s$ (<tt>v</tt>),',
  'if we find that that this upper bound $\\beta_s$ is at most the lower bound of some ancestor (<tt>alpha</tt>),',
  'then we can also prune the current node.',
_);*/

add(slide('Move ordering',
  'Pruning depends on order of actions.',
  stagger('Can prune the 10 node:', 'Can\'t prune the 5 node:'),
  pause(-1),
  parentCenter(stagger(
    Max(Min(3, 5), Min(2, 10)),
    Max(Min(2, 10), Min(3, 5)),
  _)),
_));

prose(
  'We have so far shown that alpha-beta pruning correctly computes the minimax value at the root,',
  'and seems to save some work by pruning subtrees.',
  'But how much of a savings do we get?',
  _,
  'The answer is that it depends on the order in which we explore the children.',
  'This simple example shows that with one ordering, we can prune the final leaf, but in the second, we can\'t.',
_);

add(slide('Move ordering',
  'Which ordering to choose?',
  headerList(null,
    pause(), 'Worst ordering: $O(b^{2 \\cdot \\red{d}})$ time',
    pause(), 'Best ordering: $O(b^{2 \\cdot \\red{0.5 d}})$ time',
    pause(), 'Random ordering: $O(b^{2 \\cdot \\red{0.75 d}})$ time',
  _),
  pause(),
  stmt('In practice, can use evaluation function $\\Eval(s)$'),
  bulletedText('Max nodes: order successors by decreasing $\\Eval(s)$'),
  bulletedText('Min nodes: order successors by increasing $\\Eval(s)$'),
_));

/*add(slide('Depth',
  keyIdea('depth',
    'Depth really matters.',
  _),
  bulletedText('With alpha-beta pruning, can sometimes <b>double</b> the depth!'),
  bulletedText('IBM Deep Blue could go to depth 14 (branching factor 35)'),
  pause(),
  parentCenter('[Pac-Man demo]'),
_));*/

prose(
  'In the worst case, we don\'t get any savings.',
  _,
  'If we use the best possible ordering, then we save half the exponent, which is <i>significant</i>.',
  'This means that if could search to depth $10$ before, we can now search to depth $20$,',
  'which is truly remarkable given that the time increases exponentially with the depth.',
  _,
  'In practice, of course we don\'t know the best ordering.',
  'But interestingly, if we just use a random ordering, that allows us to search 33 percent deeper.',
  _,
  'We could also use a heuristic ordering based on a simple evaluation function.',
  'Intuitively, we want to search children that are going to give us the largest lower bound for max nodes',
  'and the smallest upper bound for min nodes.',
_);

add(summarySlide('Summary',
  minmaxGameExample().scale(0.6),
  bulletedText(stmt('Game trees: model opponents, randomness')), pause(),
  bulletedText(stmt('Minimax: find optimal policy against an adversary')), pause(),
  bulletedText(stmt('Evaluation functions: function approximation, Monte Carlo')), pause(),
  bulletedText(stmt('Alpha-beta pruning: increases searchable depth')),
_));

sfig.initialize();
