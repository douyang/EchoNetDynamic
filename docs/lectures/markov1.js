G = sfig.serverSide ? global : this;
G.prez = presentation();

add(titleSlide('Lecture 13: Markov networks I',
  nil(),
  parentCenter(isingModel({numRows: 8, numCols: 10, selected: function(r,c) {return (r+c)%2==0;}}).scale(0.3)),
_));

add(quizSlide('markov1/treewidth',
  'What is the treewidth of the checkerboard factor graph where we condition on every other variable?',
_));

add(slide('Review: conditioning and elimination',
  stmt('Conditioning on $X_i=v$: $g_j(x) = f_j(x \\cup \\{ X_i:v\\})$'),
  parentCenter(conditionVariableGraph()).scale(0.6),
  pause(),
  stmt('Elimination of $X_i$: $\\displaystyle f_\\text{new}(x) = \\max_{v} \\prod_{j=1}^k f_j(x \\cup \\{X_i:v\\})$'),
  parentCenter(eliminateVariableGraph()).scale(0.6),
_));

prose(
  'The treewidth of the checkerboard factor graph is $0$.',
  'Conditioning on all the variables produces a new factor graph where the remaining variables are fully disconnected.',
  'Eliminating each variable produces a factor of arity $0$.',
  _,
  'The ability to quickly reason about the effects of conditioning and elimination are critical to working effectively with factor graphs,',
  'and in this lecture, we will continue building up intuition about the two operations.',
  _,
  'Conceptually, both operations take in a factor graph and produce another factor graph without the variable operated on.',
  'In terms of implementation, we don\'t actually need to create new factor graphs any more than we need to build a search tree data structure.',
  _,
  'The main intuition is that conditioning breaks apart the graph but requires knowing the values of the conditioned variables,',
  'whereas elimination tends to create larger potentials that connect the graph.',
_);

function roadmap(i) {
  var ids = ['messagePassing', 'markovNetworks',  'elimination', 'conditioning'];
  add(roadmapSlide('Roadmap',
    roadmapItem(i == 0, 'Message passing', ids[0]),
    roadmapItem(i == 1, 'Markov networks', ids[1]),
    roadmapItem(i == 2, 'Marginal probabilities', ids[2]),
    //roadmapItem(i == 3, 'Conditional probabilities', ids[3]),
  _).id(ids[i]));
}

////////////////////////////////////////////////////////////
// Message passing
roadmap(0);

////////////////////////////////////////////////////////////
// Markov networks
roadmap(1);

add(slide('Motivation',
  parentCenter(chainFactorGraph({n:5})),
  stmt('Question: what is $X_2$?'),
  parentCenter(text('[demo]').linkToUrl('index.html#include=inference-demo.js&example=chain&postCode=query(\'X2\'); maxVariableElimination({order: \'X1 X5 X4 X3\'})')),
  pause(),
  stmt('Answer: max marginal is $\\mu_2(x_2) = \\{ 0: 8, 1: 8 \\}$'),
  pause(),
  stmt('Problem: if look at maximum weight assignment, either $X_2 = 0$ or $X_2 = 1$ is possible'),
  pause(),
  stmt('Intuition: more support for $X_2 = 0$ than $X_2 = 1$'), 
_));

prose(
  'So far, we\'ve been focused on maximizing the weights of assignments.',
  'If we wanted to know the value of $X_2$, we could ask for the max marginal $\\mu_2$,',
  'which would tell us that both $0$ and $1$ allow us to achieve the maximum weight of $8$.',
  _,
  'However, intuitively, there should be more support $X_2 = 0$ because $X_2$ is right next to $X_1$,',
  'which is constrained to be $0$.',
_);

add(slide('Approach: sum',
  parentCenter(frameBox(table(
    ['$x$', '$\\Weight(x)$'],
    ['0'+bold('0')+'001', red('8')],
    ['0'+bold('0')+'011', red('8')],
    ['0'+bold('0')+'111', red('8')],
    ['0'+bold('1')+'111', blue('8')],
    ['0'+bold('0')+'101', red('2')],
    ['0'+bold('1')+'001', blue('2')],
    ['0'+bold('1')+'011', blue('2')],
    ['0'+bold('1')+'101', blue('2')],
  _).margin(50, 0).center())).scale(0.8),
  pause(),
  'Compute fraction of weight over assignments with $X_2 = 0$:',
  parentCenter(
    '$\\displaystyle \\frac{\\sum_{x_1,x_3,x_4,x_5} \\Weight(x_1, \\red{0}, x_3, x_4, x_5)}{\\sum_{x_1, x_2, x_3, x_4, x_5} \\Weight(x_1, x_2, x_3, x_4, x_5)} = \\frac{26}{40}$',
  _),
_));

prose(
  'What we seem to be missing by looking at only the maximum weight is a sense of how much total weight there is on assignments that satisfy some condition.',
  'Concretely, we see that a $26/40$ fraction of the assignments have $X_2 = 0$.',
  'This seems like a much more reasonable answer.',
_);

add(slide('Max to sum',
  greenbold('Maximum weight over all assignment:'),
  parentCenter('$\\displaystyle \\max_x \\Weight(x)$ '),
  pause(),
  purplebold('Sum of weights over all assignment:'),
  parentCenter('$\\displaystyle \\sum_x \\Weight(x)$ '),
  pause(),
  keyIdea('max to sum',
    'In each algorithm/equation, replace '+greenbold('max')+' with '+purplebold('sum')+'.',
  _),
_));

prose(
  'Now we are in the business of summing the weights of assignments rather than choosing the maximum.',
  'While this can have a large qualitative impact on the answers that we obtain,',
  'there is actually very little conceptual change in how we approach summing over assignments.',
  _,
  'The objective changes a max into a sum.',
  'One might be worried that we will have to develop an entirely different suite of methods to handle this change,',
  'but interestingly, all we need to do is replace all the occurrences of max with sum (e.g., in the elimination algorithm)!',
  'The conceptual structure of the algorithms and even the code remains nearly identical.',
  _,
  'Advanced: it turns out as long as we are computing weights on a semiring,',
  'we can make localized changes to the elimination algorithm.',
  'Sum corresponds to the normal semiring; max corresponds to the tropical semiring.',
  'We can also define semirings that give us the $K$ highest weight assignments.',
_);

add(slide('Elimination (sum): example',
  parentCenter(xtable(cspGraph({labelEdges: true}), rightArrow(50).strokeWidth(5), cspGraph({labelEdges: true, eliminate: true})).center().margin(50)),
  pause(),
  indent('$\\displaystyle f_{14}(x_1, x_4) = \\sum_{x_3} [f_{13}(x_1, x_3) f_{34}(x_3, x_4)]$'),
  indent('(sum of weights of assignments to $X_3$ given $X_1, X_4$)'),
  pause(),
  yseq(
    '$f_{13} = \\{ (\\vR, \\vB): 8, (\\vR, \\vR): 5, (\\vB, \\vG): 8, (\\vB, \\vO): 1 \\}$',
    '$f_{34} = \\{ (\\vB, \\vG): 5, (\\vR, \\vG): 4, (\\vG, \\vG): 6 \\}$',
    pause(),
    stagger(
      indent(nowrapText('$\\Rightarrow f_{14} = \\{ (\\vR, \\vG): 8 \\cdot 5 + 5 \\cdot 4, (\\vB, \\vG): 8 \\cdot 6 \\}$')),
      indent('$\\Rightarrow f_{14} = \\{ (\\vR, \\vG): 60, (\\vB, \\vG): 48 \\}$'),
    _).pivot(-1, -1),
  _).scale(0.85),
_));

add(slide('Elimination (sum): general',
  parentCenter(eliminateVariableGraph().scale(0.6)),
  definition('elimination (sum)',
    bulletedText('To <b>eliminate</b> a variable $X_i$, consider all potentials $f_1, \\dots, f_k$ that depend on $X_i$.'),
    pause(),
    bulletedText('Remove $X_i$ and $f_1, \\dots, f_k$.'),
    pause(),
    bulletedText('Add $\\displaystyle f_\\text{new}(x) = \\sum_{v} \\prod_{j=1}^k f_j(x \\cup \\{ X_i : v \\})$'),
  _),
_));

prose(
  'The elimination operation (the sum version) has the identical structure to the max version:',
  'To eliminate a variable $X_i$, we create a new potential which is equal to the <b>sum</b> over the values $x_i$ that $X_i$ can take on',
  'of the product of the potentials that $X_i$ depends on.',
  _,
  'That\'s it.',
_);

add(slide('Elimination on a chain',
  parentCenter(chainFactorGraph({n:5})),
  pause(),
  stmt('Problem: max doesn\'t take into account all information'),
  parentCenter('$\\mu_2(x_2) = \\{ 0: 8, 1: 8 \\}$'),
  parentCenter(text('[demo]').linkToUrl('index.html#include=inference-demo.js&example=chain&postCode=query(\'X2\'); maxVariableElimination({order:"X1 X5 X4 X3"})')),
  pause(),
  stmt('Solution: sum incorporates all assignments'),
  parentCenter('$\\mu_2(x_2) = \\{ 0: \\red{26}, 1: 14 \\}$'),
  parentCenter(text('[demo]').linkToUrl('index.html#include=inference-demo.js&example=chain&postCode=query(\'X2\'); sumVariableElimination({order:"X1 X5 X4 X3"})')),
  parentCenter('(rightly offers more support for $X_2 = 0$)'),
_));

prose(
  'We can compute the (sum) marginal of $X_2$ by applying sum elimination to all other variables.',
  'All the forward/backward messages and marginals can be defined analogously for the sum operation.',
  'We see that the sum marginals favor $X_2 = 0$, which was the same result that we obtained before by manually summing over all possible assignments.',
_);

add(slide('Formalization',
  definition('Markov network',
    'A <b>Markov network</b> defines a joint distribution over random variables $X_1, \\dots, X_n$:',
    pause(),
    indent('$\\displaystyle \\P(X_1 = x_1, \\dots, X_n = x_n) = \\frac{\\Weight(x)}{Z}$,'),
    pause(),
    'where $Z$ is the '+redbold('normalization constant')+':',
    parentCenter('$\\displaystyle Z = \\sum_{x\'} \\Weight(x\')$'),
  _),
  pause(),
  //stmt('Intuition: a single weight means nothing by itself, probability provides relative grounding'),
  //pause(),
  stmt('Significance: single number $Z$ unlocks all probabilities'),
_));

prose(
  'So far, we have simply given intuitive motivation for summing weights over assignments',
  'rather than just taking the maximum weight assignment.',
  _,
  'Now, we finally put this intuitive motivation on more firm ground by connecting it to probability theory.',
  'In particular, a <b>Markov network</b> defines a joint probability distribution over the variables (now called random variables because we have a probability distribution).',
  _,
  'Markov networks are also known as Markov random fields or undirected graphical models.',
  _,
  'This distribution is simply the weight of $x$ divided by some normalization constant $Z$,',
  'which ensures that when we add up all the probabilities of each assignment, we get $1$.',
  'The value of $Z$ that achieves this is simply the sum over all the assignment weights.',
  _,
  'Given a factor graph, the weight of any given assignment $x$ is easy to compute: just multiply together all the potentials.',
  'However, computing the probability of any given assignment $x$ is in general difficult because it requires knowledge of $Z$.',
  'Note that $Z$ is just a single number, but knowing it unlocks the ability to efficiently compute the probability of any assignment!',
_);

add(slide('Example',
  parentCenter(chainFactorGraph({n:5}).scale(0.8)),
  parentCenter(text('[demo]').linkToUrl('index.html#include=inference-demo.js&example=chain&postCode=sumVariableElimination()')),
  example('chain',
    'Normalization constant: 40',
    parentCenter(table(
      ['$x$', '$\\Weight(x)$', '$\\P(X = x)$'],
      ['00001', '8', 0.2],
      ['00011', '8', 0.2],
      ['00111', '8', 0.2],
      ['01111', '8', 0.2],
      ['00101', '2', 0.05],
      ['01001', '2', 0.05],
      ['01011', '2', 0.05],
      ['01101', '2', 0.05],
    _).margin(50, 0).center()),
  _).scale(0.75),
_));

add(slide('Computation',
  'How do we compute the normalization constant?',
  parentCenter('$\\displaystyle Z = \\sum_{x\'} \\Weight(x\')$'),
  pause(),
  algorithm('normalization constant',
    'Eliminate all the variables $X_1, \\dots, X_n$.',
  _),
  parentCenter(text('[demo]').linkToUrl('index.html#include=inference-demo.js&example=chain&postCode=query(\'\'); sumVariableElimination()')),
_));

prose(
  'So how do we get our hands on this important normalization constant?',
  _,
  'We\'ve already seen the answer: just eliminate all the variables!',
  _,
  'Running the demo should produce $40$.',
_);

add(slide('Proportionality',
  stmt('Equality'),
  parentCenter('$\\P(X = x) = \\frac{\\Weight(x)}{Z}$'),
  pause(),
  stmt('Proportional'),
  parentCenter('$\\boxed{\\P(X = x) \\propto \\Weight(x)}$'),
  pause(),
  keyIdea('proportionality',
    'Represent (unnormalized) weights with factor graph.',
    'Get probability distribution by normalization.',
  _),
  pause(),
  stmt('Significance: factor graph operations work on weights'),
_));

prose(
  'Now, whenever we have a factor graph (whose potentials give rise to $\\Weight(x)$),',
  'we implicitly have a distribution over assignments as well:',
  'we just need to run elimination to compute the normalization constant $Z$ and divide $\\Weight(x)$ by $Z$.',
  _,
  'To bring factor graphs closer to probabilities,',
  'we introduce the proportional to notation.',
  'This notation is extraordinarly useful, not because it removes two symbols,',
  'but because it highlights the intimate connection between the weights defined by the factor graph and the probabilities.',
  _,
  'Over the next few lectures, you will hopefully gain an appreciation for using factor graphs to represent probability distributions.',
_);

////////////////////////////////////////////////////////////
// Marginal probabilities
roadmap(2);

add(slide('Marginal probabilities',
  definition('marginal probability',
    'Let $A,B$ be a partitioning of $X$.', pause(),
    'The <b>marginal probability</b> of a query $A = a$ is:',
    indent('$\\displaystyle \\P(A = a) = \\sum_b \\P(A = a, B = b)$'),
  _),
  pause(),
  stmt('Intuition: marginalization focuses on a subset of variables'),
_));

prose(
  'Now the plan is to go through many of the key ideas in probability theory and study them through the lens of Markov networks.',
  'In particular, we\'ll see how the graph properties of the Markov network correspond naturally to the properties of probability distributions.',
  _,
  'The first notion from probability that we will study is marginal probabilities,',
  'which allows us to query a subset of variables $A \\subset X$.',
  _,
  'The marginal probability is defined by the sum of the joint probability over all assignments to the non-query variables $B$.',
  'Note that this definition makes no mention of Markov networks.',
_);

add(slide('Marginal probabilities: example',
  parentCenter(text('[demo]').linkToUrl('index.html#include=inference-demo.js&example=chain&postCode=query(\'X2 X3\'); sumVariableElimination()')),
  example('chain',
    'Let $A = (X_2, X_3), B = (X_1, X_4, X_5)$',
    pause(),
    'Sum over matching assignments and normalize:',
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
_));

add(slide('Marginal probabilities: computation',
  '<b>Elimination</b> of $B$ produces new factor graph over $A$:',
  parentCenter('$\\boxed{\\Weight_A(a) = \\displaystyle \\sum_b \\Weight(a, b)}$'),
  pause(),
  stmt('Quick derivation'),
  indent(stagger(
    nowrapText('$\\displaystyle \\red{\\P(A = a)} = \\sum_b \\P(A = a, B = b)$ [def. marg. prob.]'),
    nowrapText('$\\displaystyle \\red{\\P(A = a)} = \\sum_b \\frac{\\Weight(a, b)}{Z}$ [def. Markov network]'),
    nowrapText('$\\displaystyle \\red{\\P(A = a)} \\propto \\sum_b \\Weight(a, b)$ [$Z$ is a constant]'),
    nowrapText('$\\displaystyle \\red{\\P(A = a)} \\propto \\Weight_A(a)$ [def. $\\Weight_A(a)$]'),
  _)),
  pause(),
  stmt('Summary: marginal probabilities represented by factor graph with non-query variables $B$ are eliminated'),
_));

prose(
  'One way to think about marginal probabilities is as follows:',
  'For each partial assignment $A=a$, select the complete assignments consistent with $A=a$',
  'and sum their probabilities.',
  _,
  'Another way to do it is to sum the weights (rather than the probabilities) to produce a weight for each $a$; then normalize.',
  _,
  'From the example, we can verify that normalizing $\\Weight(x)$ to get $\\P(X=x)$ and then summing is equivalent to summing and then normalizing.',
  _,
  'We can also perform a quick derivation to see that the marginal probability is proportional to the weights of the factor graph gotten by eliminating $B$.',
  _,
  'The point is that we can work over factor graphs (and thus unnormalized weights).',
  'If we ever need a distribution, we can compute the normalization constant via elimination to get it.',
_);

add(summarySlide('Summary',
  bulletedText('Eliminate all variables to yield normalization constant (and thus probability distribution)'),
  pause(),
  bulletedText('Eliminate non-queried variables to get marginal probabilities'),
  pause(),
  bulletedText('If have structural independence, can remove variables not connected to queried variables (computational win)'),
  pause(),
  bulletedText('Structural independence implies probabilistic independence'),
_));

sfig.initialize();
