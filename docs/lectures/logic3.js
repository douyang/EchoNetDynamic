G = sfig.serverSide ? global : this;
G.prez = presentation();

add(titleSlide('Section (skipped in lecture): Logic III',
  nil(),
  parentCenter(image('images/escher-hands.jpg')),
_));

add(quizSlide('logic3-start',
  'How would you write <i>Alice believes it will rain</i> in logic?',
_));

add(slide('Review: schema',
  logicSchema(),
_));

function roadmap(i) {
  add(outlineSlide('Roadmap', i, [
    ['otherLogics', 'Other logics'],
    ['markovLogic', 'Markov logic'],
    ['semanticParsing', 'Language to logic'],
  ]));
}

////////////////////////////////////////////////////////////
// Other types of logic
roadmap(0);

add(slide('Motivation',
  stmt('Goal of logic', 'represent knowledge and perform inferences'),
  pause(),
  stmt('Propositional logic'),
  //parentCenter('$\\Rain \\vee \\Snow$'),
  indent(yseq(
    '$\\text{AliceIsStudent} \\to \\text{AliceKnowsArithmetic}$',
    '$\\text{BobIsStudent} \\to \\text{BobKnowsArithmetic}$',
    //'$\\dots$',
  _)).scale(0.9),
  pause(),
  stmt('First-order logic'),
  indent('$\\forall x \\, \\Student(x) \\to \\Knows(x, \\arithmetic)$'),
_));

prose(
  'In the last two lectures, we have presented two types of logics:',
  'propositional logic and first-order logic.',
  _,
  'In propositional logic, we build formulas by putting connectives around propositional symbols.',
  'These allow us to make statements about the truth values of specific facts.',
  _,
  'In first-order logic, the key conceptual difference is that we are making statements about objects and their relations.',
  'Propositional symbols become atomic formulas which are predicates applied to terms (constants, variables, and functions).',
  'Together with quantifiers, this allows us to make compact statements that represent a huge (possibly infinite) set of objects.',
  _,
  'From a modeling point of view, first-order logic is more expressive than propositional logic,',
  'but it does come at a increase in computational cost.',
_);

add(slide('Motivation',
  'Why use anything beyond first-order logic?',
  pause(),
  headerList('Expressiveness',
    'Temporal logic: express time',
    'Epistemic logic: express beliefs',
    'Lambda calculus: generalized quantifiers',
  _),
  pause(),
  headerList('Notational convenience, computational efficiency',
    'Description logic',
  _),
_));

prose(
  'There are two ways we can improve on first-order logic.',
  _,
  'The first makes modeling easier by increasing expressiveness,',
  'allowing us to "say more things", so we can talk about time, beliefs, not just objects and relations.',
  'We can also improve the modeler\'s life by making notation simpler.',
  _,
  'The second makes life easier for algorithms by decreasing expressiveness.',
_);

add(slide('Temporal logic',
  'Barack Obama is the US president.'.italics().fontcolor('green'),
  '$\\text{President}(\\text{BarackObama}, \\text{US})$',
  pause(),
  'George Washington <b>was</b> the US president.'.italics().fontcolor('green'),
  pause(),
  '$\\red{\\mathbf{P}} \\, \\text{President}(\\text{GeorgeWashington}, \\text{US})$',
  pause(),
  'Some woman <b>will be</b> the US president.'.italics().fontcolor('green'),
  '$\\red{\\mathbf{F}} \\, \\exists x \\, \\text{Female}(x) \\wedge \\text{President}(x, \\text{US})$',
_));

prose(
  'So far, we have talked about objects and relations as if they held universally over time.',
  'But things change.  For example, the "president" relation depends on what year it is.',
  'Furthermore, we\'d like to make statements about the past and the future without specifying the exact time.',
  _,
  'To do this, let\'s introduce an additional piece of syntax (e.g., $\\mathbf{P}$ for past, $\\mathbf{F}$ for future).',
_);

add(slide('Temporal logic',
  stmt('Setup', 'all formulas interpreted at a current time.'),
  parentCenter(stagger(
    '$\\sI(f, w) = 1$ if $f$ is true in $w$',
    '$\\sI(f, w, t) = 1$ if $f$ is true in $w$ at time $t$',
  _).center()),
  pause(),
  parentCenter('$\\sI(\\red{\\mathbf{P}} f, w, t) = 1$ if exists $s < t$ such that $\\sI(f, w, s) = 1$'),
  pause(),
  'The following operators change the current time and quantify over it:',
  parentCenter(frameBox(ytable(
    nowrapText('$\\red{\\mathbf{P}} \\, f$: $f$ held at some point in the past'),
    nowrapText('$\\red{\\mathbf{F}} \\, f$: $f$ will hold at some point in the future'),
    nowrapText('$\\red{\\mathbf{H}} \\, f$: $f$ held at every point in the past'),
    nowrapText('$\\red{\\mathbf{G}} \\, f$: $f$ will hold at every point in the future'),
  _))).scale(0.9),
  pause(),
  'Every student will at some point never be a student again.'.italics().fontcolor('green'), pause(),
  parentCenter('$\\forall x \. \\Student(x) \\to \\red{\\mathbf{F}} \\red{\\mathbf{G}} \\neg \\Student(x)$'),
  //pause(),
  //stmt('Model', 'map from time points to models in first-order logic'),
_));

prose(
  'We now need to endow the new notation (e.g., $\\mathbf{P}$) with semantics.',
  'Before, a formula $f$ was interpreted with respect to a particular model $w$: $\\sI(f, w)$.',
  'But now, let\'s evaluate formulas at both a model $w$ and a time $t$: $\\sI(f, t, w)$.',
  'Then the past operator simply looks for a past time and evaluates the formula $f$ at each shifted time $s$ (existential quantification over the past).',
  _,
  'Temporal logic consists four such temporal quantifiers, which correspond to existential or universal quantification over the past or future.',
  _,
  'We can use multiple temporal quantifiers to express rather complex statements with just a few symbols &mdash; highlighting the power of logic.',
_);

add(slide('Modal logic for propositional attitudes',
  'Alice believes one plus one is two.'.italics().fontcolor('green'),
  '$\\Believes(\\alice, \\Equals(\\Sum(1,1), 2))$??',
  pause(),
  'Alice believes Boston is a city.'.italics().fontcolor('green'),
  '$\\Believes(\\alice, \\text{City}(\\boston))$??',
  pause(),
  stmt('Problem', '$\\Equals(\\Sum(1,1), 2)$ is true, $\\text{City}(\\boston)$ is true, but the two are not interchangeable in this context.'),
_));

prose(
  'Another type of knowledge we\'d like to encode are propositional attitudes (what people believe, know, want, etc.).',
  'For example, the relation $\\Believes$ isn\'t simply taking objects as arguments,',
  'but rather entire propositions.',
  _,
  'However, writing down the logical forms naively doesn\'t work because if two propositions have the same truth value,',
  'then they would reduce to the same formula, but believing that one plus one is two surely isn\'t the same as believing that Boston is a city, despite the fact that both are true.',
_);

add(slide('Epistemic logic',
  'Alice believes Boston is a city.'.italics().fontcolor('green'),
  //indent('$\\red{\\mathbf{B}_\\alice} \\, \\Equals(\\Sum(1,1), 2))$'),
  indent('$\\red{\\mathbf{B}_\\alice} \\, \\text{City}(\\boston)$'),
  pause(),
  greenitalics('Every place Alice has lived she believes is a city.'),
  indent('$\\forall x\\, \\red{\\mathbf{P}} \\text{LivesIn}(\\alice, x) \\to \\red{\\mathbf{B}_\\alice} \\, \\text{City}(x)$'),
  pause(),
  headerList('Semantics',
    '$\\sF_\\alice$ is set of internally-consistent formulas that Alice believes',
    pause(),
    '$\\sI(\\mathbf{B}_\\alice f, w) = 1$ if $\\sI(f, w) = 1$ for all worlds $w$ consistent with Alice\'s beliefs ($w \\in \\sM(\\sF_\\alice)$)',
  _),
_));

prose(
  'We can fix this problem with epistemic logic, which allows us to represent beliefs and knowledge.',
  'The basic idea is that for each agent $a$ (e.g., $\\alice$), we have a consisting of set of formulas $\\sF_a$',
  '(e.g., $\\{ \\text{City}(\\boston)$, $\\text{City}(\\text{california}) \\}$).',
  'Importantly, the formulas $\\sF_a$ do not have to have any relationship with the real world,',
  'but they must be internally consistent ($\\sM(\\sF_a) \\neq \\emptyset$).',
  _, 
  'We now introduce a new operator $\\mathbf B_a$, which takes a formula $f$ and checks if it is <b>entailed</b> by $a$\'s beliefs $\\sF_a$;',
  'that is, for every possible world that $a$ might belief we\'re in, $f$ holds.',
  _,
  'Note that a consequence of this formulation of belief is that agents have arbitrary inferential power and are fully rational:',
  'When an agent $a$ believes $\\sF_a$, that agent must believe all the entailed consequences of $a$.',
  'See http://plato.stanford.edu/entries/logic-epistemic/ for more information.',
  _,
  'Just like the past operator $\\mathbf P$ shifted interpretation of its argument $f$ into a different time point,',
  '$\\mathbf B_a$ shifts interpretation to a different world.',
  _,
  'These operators can be embedded into first-order logic formulas with temporal operators to express rather intricate facts about the world.',
_);

add(slide('Lambda calculus',
  stmt('Simple'),
  indent('Alice has visited some museum.'.italics().fontcolor('green')), pause(),
  indent('$\\exists x \\, \\Museum(x) \\wedge \\Visited(\\alice, x)$'), pause(),
  stmt('More complex'),
  indent('Alice has visited <b>at least 10</b> museums.'.italics().fontcolor('green')), pause(),
  stagger(
    indent('$\\{ x : \\Museum(x) \\wedge \\Visited(\\alice, x) \\}$: set of museums Alice has visited'),
    indent('$\\lambda x \\, \\Museum(x) \\wedge \\Visited(\\alice, x)$: boolean function representing <font color="red">set</font> of museums Alice has visited'), pause(),
  _),
  indent('$\\text{GreaterThan}(\\Count(\\lambda x \\, \\Museum(x) \\wedge \\Visited(\\alice, x)), 10)$').scale(0.8),
  //pause(),
  //'Higher-order logic allows us to model these <font color="red">generalized quantifiers</font>.',
_));

prose(
  'Existential and universal quantification only allow a formula to look at one value at a time.',
  'But sometimes, we need to look at the set of all values satisfying a formula, for example, if we wanted to count.',
  _,
  'Here, we will use lambda calculus to define <b>higher-order functions</b> that allow us to do precisely this.',
  _,
  'In lambda calculus, $\\lambda x \\, P(x)$ denotes the set of $x$ for which $P(x)$ is true.',
  'This set can be passed in as an argument into the function $\\Count$, which produces a term.',
_);

add(slide('Description logic',
  text('People with at least three sons who are married to doctors, and at most two daughters who are married to professors...are weird.'.italics().fontcolor('green')).scaleFont(0.8),
  pause(),
  stmt('First-order logic + lambda calculus'),
  ytable(
    '$\\forall x \\, \\big(\\text{Person}(x)$',
    indent(nowrapText('$\\wedge \\Count(\\lambda y \\, \\text{Son}(x, y) \\wedge \\forall z \\, \\text{Spouse}(y, z) \\wedge \\text{Doctor}(z)) \\ge 3$')),
    indent(nowrapText('$\\wedge \\Count(\\lambda y \\, \\text{Daughter}(x, y) \\wedge \\forall z \\, \\text{Spouse}(y, z) \\wedge \\text{Professor}(z)) \\le 2 \\big) \\to \\text{Weird}(x)$')),
  _).scale(0.64),
  pause(),
  stmt('Description logic'),
  ytable(
    '$\\big(\\text{Person}$',
    indent('$\\sqcap (\\ge 3 \\, \\text{Son} . \\forall \\text{Spouse} . \\text{Doctor})$'),
    indent('$\\sqcap (\\le 2 \\, \\text{Daughter}. \\forall \\text{Spouse} . \\text{Professor}) \\big) \\sqsubseteq \\text{Weird}$'),
  _).scale(0.8),
  pause(),
  //'Concepts: unary predicates',
  //'Roles: binary predicates',
  stmt('Advantages', 'more compact (no variables), supports counting, but still decidable'),
_));

prose(
  'With lambda calculus, we can really capture any statement that we want, but it is often too powerful, which makes life difficult for algorithms.',
  'Description logic is a reaction to this, and carves out a logic which can be more intuitive to read, and also is actually decidable',
  '(recall that even first-order logic was semi-decidable).',
  _,
  'The lesson is that the complexity of a logic is not a one-dimensional quantity.',
  'The art of designing a logical language is coming up with operators that focus on representing formulas that actually arise in practice,',
  'while giving up on those that don\'t.  By giving up on those things, we can hope to win on computation.',
  _,
  'Description logic is in a way more powerful than first-order logic because it can support "at least",',
  'but it is restricted in various ways that makes it decidable/tractable.',
_);

add(summarySlide('Summary of logics',
  headerList(null,
    'Propositional logic: $A \\wedge B$',
    'First-order logic: $\\forall x \\, P(x) \\to Q(x)$',
    'Temporal / epistemic logic: $\\mathbf{F} (A \\wedge B), \\textbf{B}_\\alice (A \\wedge B)$',
    'Description logic: $P \\sqsubseteq Q$',
    'Lambda calculus: $\\lambda x \\, P(x) \\wedge Q(x)$',
  _),
_));

prose(
  'We have quickly surveyed a host of logics with varying levels of expressive power and computational complexity.',
  'There is much more to say about each logic,',
  'but the high-level takeaway is an appreciation for the complexity of statements we can make formally.',
_);

////////////////////////////////////////////////////////////
// Markov logic
roadmap(1);

add(slide('Limitations of hard logic',
  stmt('So far: a formula carves out subset of models.'),
  //xseq('All birds can fly.'.italics().fontcolor('green'), '$\\forall x \\, \\text{Bird}(x) \\to \\CanFly(x)$'),
  //stmt('Exceptions', 'penguins, ostriches'),
  //parentCenter('$\\forall x \\, \\forall y \\, \\forall z \\, \\Takes(x,y) \\wedge \\Covers(y,z) \\to \\Knows(x,z)$'), pause(),
  parentCenter(xtable(
    '$\\red{\\Rain \\wedge \\neg\\Snow}$',
    rainTrafficSnow('red', 0, 0, 1, 1, 0, 0, 0, 0),
  _).margin(100).center()),

  /*parentCenter(overlay(
    overlay(
      rect(300, 150).round(10).strokeWidth(4),
      m = ellipse(100, 50).fillColor('lightblue'),
    _).center(),
    //moveTopOf('models', m).scale(0.8),
  _)),*/
  pause(),
  
  'In reality, there is uncertainty.',
  keyIdea('distribution',
    'Model a distribution over models $\\P(W = w; \\theta)$.',
  _),
_));

prose(
  'Now let\'s fall back down to first-order logic,',
  'and try to address another limitation of first-order logic,',
  'and actually more generally, a limitation of all classic hard logics,',
  'in which all statements are either true or false.',
  _,
  'So far, we\'ve used formulas to carve out a set of models.',
  'But this doesn\'t allow us to represent the fact that some models might be more likely than others.',
  'For this, we will turn to probability.',
_);

/*add(slide('Probabilistic generalization',
  stmt('Factor graph (Markov network): distribution over models'),
  parentCenter(frameBox(table(
    ['$w$', '$\\P(W = w)$'],
    ['{ A: 0, B: 0, C: 0 }', '0.3'],
    ['{ A: 0, B: 0, C: 1 }', '0.1'],
    ['...', '...'],
  _).xmargin(50))).scale(0.6),
  pause(),
  //parentCenter(contingencyDiagram()),
  parentCenter('$\\displaystyle \\P(f \\mid \\KB) = \\frac{\\sum_{w \\in \\sM(\\KB \\cup \\{f\\})} \\P(W = w)}{\\sum_{w \\in \\sM(\\KB)} \\P(W = w)}$'),
  pause(),
  parentCenter(overlay(
    line([0, 0], [600, 0]).strokeWidth(3),
    //center('$\\P(f \\mid \\KB)$').shiftBy(350, -20),
    transform('no').pivot(0, -1).shiftBy(0, 10),
    transform('yes').pivot(0, -1).shiftBy(600, 10),
    transform('don\'t know').pivot(0, -1).shiftBy(300, 10),
    l1 = line([0, up(10)], [0, down(10)]).strokeWidth(3),
    l2 = line([600, up(10)], [600, down(10)]).strokeWidth(3),
    moveTopOf('$0$', l1),
    moveTopOf('$1$', l2),
  _)),
_));*/

add(slide('Hiking',
  //greenitalics('Everyone likes hiking.'),
  //indent('$\\forall x \\, L(x, H)$'),
  greenitalics('Everyone who likes hiking likes nature.'),
  indent('$\\forall x \\, \\Likes(x, \\hiking) \\to \\Likes(x, \\nature)$'),
  pause(),
  greenitalics('Bob doesn\'t like nature.'),
  indent('$\\neg \\Likes(\\bob, \\nature)$'),
  pause(),
  greenitalics('Does Bob like hiking?'),
  indent('$\\Likes(\\bob, \\hiking)$?'),
  pause(),
  greenitalics('Does Alice like nature?'),
  indent('$\\Likes(\\alice, \\nature)$?'),
_).leftHeader(image('images/hiking.jpg').width(150)));

prose(
  'Before we dive into probability,',
  'let\'s set up a running example.',
  _,
  'Suppose we are given the first two first-order logic formulas, which we add to our knowledge base.',
  'How can we answer the next two questions?',
  'From last lecture, we could convert all the formulas to CNF form,',
  'and apply resolution to determine whether the questions are true, false, or indeterminate.',
  _,
  'This certainly works, but we will explore an alternative which is more conducive to a probabilistic generalization.',
_);
  
add(slide('Hiking: propositionalization',
  importantBox(redbold('First-order logic KB'),
    ('$\\forall x \\, \\Likes(x, \\hiking) \\to \\Likes(x, \\nature)$'),
    ('$\\neg \\Likes(\\bob, \\nature)$'),
  _),
  pause(),
  'Assume unique names + domain closure.',
  importantBox(bluebold('Propositionalized KB'),
    ('$\\Likes(\\alice, \\hiking) \\to \\Likes(\\alice, \\nature)$'),
    ('$\\Likes(\\bob, \\hiking) \\to \\Likes(\\bob, \\nature)$'),
    ('$\\neg \\Likes(\\bob, \\nature)$'),
  _),
_).leftHeader(image('images/hiking.jpg').width(150)));

prose(
  'The first step is to propositionalize the first-order logic KB,',
  'which means to expand all quantified statements (this was covered last lecture).',
  _,
  'The end result is that we have a set of <b>ground formulas</b>,',
  'which are formulas without quantifiers and whose atomic formulas (e.g., $\\Likes(\\alice, \\hiking)$) do not contain variables.',
_);

function mlnNode(s) {
  return factorNode(text(s).scale(0.6));
}
function mlnGraph(opts) {
  var s = opts.soft ? '+1' : '';
  return overlay(
    table(
      [ah = mlnNode('$L(a,h)$'), an = mlnNode('$L(a,n)$')],
      [bh = mlnNode('$L(b,h)$'), bn = mlnNode('$L(b,n)$')],
    _).margin(100),
    a = edgeFactor(ah, an).strokeColor('green'),
    b = edgeFactor(bh, bn).strokeColor('red'),
    bne = bottomEdgeFactor(bn).strokeColor('blue'),
    moveTopOf('$\\green{[\\Likes(\\alice, \\hiking) \\to \\Likes(\\alice, \\nature)]'+s+'}$', a, 30),
    moveTopOf('$\\red{[\\Likes(\\bob, \\hiking) \\to \\Likes(\\bob, \\nature)]'+s+'}$', b, 30),
    moveBottomOf('$\\blue{[\\neg \\Likes(\\bob, \\nature)]'+s+'}$', bne),
  _);
}

add(slide('Hiking: factor graph',
  parentCenter(mlnGraph({})),
  pause(),
  parentCenter(text('[demo]').linkToUrl('index.html#include=inference-demo.js&example=mln')),
_).leftHeader(image('images/hiking.jpg').width(150)));

prose(
  'Now recall that a set of formulas of this form can essentially be thought of as a set of propositional logic formulas',
  '(with atomic formulas rather than propositional symbols),',
  'and thus be written as a (boolean) constraint satisfaction problem, or more generally, a factor graph.',
  _,
  'Recall that the variables are atomic formulas, and the factors are the ground formulas.',
  'In the demo code, note that we are using a for loop to create all the variables and factors.',
  'This loop corresponds to the unrolling of the quantifier.',
  _,
  'We can use any inference algorithm (backtracking search, variable elimination, Gibbs sampling) to (approximately) solve the CSP,',
  'and determine that Bob doesn\'t like hiking (this is true in all three compatible models) and Alice could either like hiking or not.',
_);
  
add(slide('Hiking: factor graph',
  stmt('Problem: always exceptions!'),
  pause(),
  stmt('Solution: soften factors from $\\{0, 1\\}$ to $\\{ 1, 2 \\}$'),
  parentCenter(mlnGraph({soft: true})),
  pause(),
  nil(),
  parentCenter(text('[demo: +1 in implies, +1 in not]').linkToUrl('index.html#include=inference-demo.js&example=mln')),
_).leftHeader(image('images/urban-hiking.jpg').width(200)));

prose(
  'However, what if we didn\'t believe 100% that everyone who likes hiking likes nature,',
  'since in the real world, there are always exceptions.',
  'Thus, we would like to soften the factors so that they don\'t return 0 and 1.',
  _,
  'One quick hack that gives the right intuition is to simply add 1 to all the factor values,',
  'so that all the values are 1 or 2 instead of 0 or 1.',
  _,
  'In the new factor graph, note that all 16 models have non-zero weight.',
  'If we normalize the weights to get a probability distribution over models,',
  'then we see that all models also have non-zero probability.',
  'We can compute the marginal probability of any atomic formula such as $\\P(\\Likes(\\bob, \\hiking) = 1)$,',
  'which turns out to be 40%, not 0% as before.',
_);
  
add(slide('Markov logic',
  definition('Markov logic network',
    table(
      ['First-order logic formulas:', '$f_1, \\dots, f_m$'],
      ['Sets of ground formulas:', '$S_1, \\dots, S_m$'],
      ['Parameters:', '$\\theta_1, \\dots, \\theta_m$'],
    _).margin(10, 5),
    pause(),
    'Recall: $\\sI(f, w) \\in \\{0,1\\}$ is the interpretation of $f$ in $w$',
    'A <b>Markov logic network</b> defines a probability distribution over models:',
    parentCenter('$\\displaystyle \\P(W = w; \\theta) \\propto \\exp \\left\\{ \\sum_{j=1}^m \\theta_j \\sum_{f \\in S_j} \\sI(f, w) \\right\\}$'),
  _).content.margin(10).end,
_));

prose(
  'Now let\'s formalize the intuition that we\'ve developed so far.',
  'A Bayesian network was a factor graph that was defined via local conditional distributions;',
  'we will define a <b>Markov logic network</b> in terms of weighted first-order logic formulas $f_1, \\dots, f_m$.',
  _,
  'Recall that each such formula $f_j$ when propositionalized yields a set of ground formulas $S_j$.',
  'Also associate with each $f_j$ a real-valued parameter $\\theta_j \\in \\R$,',
  'which determines how true we think this formula is (the more positive it is, the more we believe it is true; negative corresponds to false).',
  _,
  'Given these elements, we define a distribution over models $w$ (which are assignments of truth values to atomic formulas).',
  'The way Markov logic networks are generally defined is the exponential of a sum.',
  'Equivalently, we can think about this in terms of a factor graph,',
  'where each ground formula (factor) $f \\in S_j$ has weight $e^{\\theta_j}$ if $f$ is satisfied in $w$ ($\\sI(f, w) = 1$), and $e^0 = 1$ otherwise.',
_);

add(slide('Markov logic: example',
  example('Markov logic network',
    '$f_1 = \\forall x \\, \\Likes(x, \\hiking) \\to \\Likes(x, \\nature)$',
    '$f_2 = \\neg \\Likes(\\bob, \\nature)$',
    '$S_1 = \\{ \\Likes(\\alice, \\hiking) \\to \\Likes(\\alice, \\nature),$',
    indent('$\\Likes(\\bob, \\hiking) \\to \\Likes(\\bob, \\nature) \\}$', 50),
    '$S_2 = \\{ \\neg \\Likes(\\bob, \\nature) \\}$',
    'Hard logic: $\\theta_1, \\theta_2 \\to \\infty$',
    'Soft logic: $\\theta_1 = \\theta_2 = \\log(2)$ (for example)',
  _).content.margin(10).end,
_));

prose(
  'To encode our hiking example in terms of a Markov logic network, we can define the first-order logic formulas $f_1,f_2$ and ground formulas $S_1,S_2$ as shown.',
  _,
  'To recover hard logic, we let the parameters tend to infinity, which means we most strongly believe the formulas are true.',
  'This setting of parameters will actually do a bit more: assuming $\\theta_1 = \\theta_2$,',
  'it will put a uniform distribution over all models which have the most number of ground formulas satisfied.',
  'This is because each additional satisfied formula contributes a weight of $e^{\\theta_1} = e^{\\theta_2}$, which tends to infinity.',
  _,
  'To recover our initial attempt to soften, we can set the parameter to $\\log(2)$.',
_);

add(slide('Markov logic: learning',
  stmt('Model'),
  parentCenter('$\\displaystyle \\P(W = w; \\theta) \\propto \\exp \\left\\{ \\sum_{j=1}^m \\theta_j \\sum_{f \\in S_j} \\sI(f, w) \\right\\}$'),
  pause(),
  stmt('Maximum likelihood (data: $w_0$)'),
  parentCenter('$\\displaystyle \\max_\\theta \\log \\P(W = w_0; \\theta)$'),
  pause(),
  stmt('Algorithm (gradient descent)'),
  parentCenter('$\\theta \\leftarrow \\theta + \\eta \\nabla_\\theta \\log \\P(W = w; \\theta)$'),
_));

prose(
  'So far, we have assumed the parameters $\\theta_1, \\dots, \\theta_m$ are fixed,',
  'and we can do probabilistic inference given these parameters (using Gibbs sampling, particle filtering, etc.).',
  _,
  'Now let\'s turn to learning, which is the inverse problem: if we see a particular model $w_0$,',
  'can we learn the parameters?',
  _,
  'To do learning, we turn to our faithful maximum likelihood principle, which served us so well for Bayesian networks.',
  'The goal is to find the $\\theta$ that maximizes the probability of the data $w_0$.',
  _,
  'Given this objective function, the most canonical method to optimize it is to use gradient descent.',
  'Computing the gradient involves computing the probability of each ground formula being true,',
  'which requires probabilistic inference.',
_);

add(summarySlide('Markov logic',
  parentCenter(mlnGraph({soft: true}).scale(0.6)),
  headerList(null,
    'Defines distribution over possible worlds (models)', pause(),
    'Parameter sharing between all grounded instances of a formula', pause(),
    'Probabilistic inference: Gibbs sampling', pause(),
    'Learning: maximum likelihood, gradient descent',
  _),
_));

prose(
  'In summary, Markov logic takes first-order logic (under unique names and domain closure) and casts it as a factor graph,',
  'from which we can apply standard factor graph inference and learning algorithms that aren\'t specialized to logic.',
  _,
  'One additional point which we didn\'t discuss is the fact that the factors are not arbitrary, but rather based on first-order logic formulas.',
  'We can exploit this structure, by grouping variables (which correspond to ground formulas) that behave similarly.',
  'This is analogous to performing first-order logic inference without propositionalization.',
  'Operating implicitly in this way is called <b>lifted inference</b>.',
_);

////////////////////////////////////////////////////////////
// Language to logic
roadmap(2);

function semparse(a, b) {
  return xtable(greenitalics(a), bigRightArrow(), b).center().margin(20);
}

add(slide('From language to logic',
  semparse('Alice likes hiking.', '$\\Likes(\\alice, \\hiking)$'),
  pause(),
  semparse('Alice likes geometry.', '$\\Likes(\\alice, \\geometry)$'),
  pause(),
  semparse('Bob likes hiking.', '$\\Likes(\\bob, \\hiking)$'),
  pause(),
  semparse('Bob likes geometry.', '$\\Likes(\\bob, \\geometry)$'),
  pause(),
  'Lots of regularities &mdash; can we convert language to logic automatically?',
_));

prose(
  'So far, we\'ve used natural language as a pedagogical means of helping you understand the semantics of logical formulas.',
  'But after a while, you might note that there is actually quite a bit of similarity between sentences in natural language and logical formulas.',
  'This suggests that it might be possible to build a system that can automate this conversion.',
  _,
  'Such a system would be incredibly useful, since it would allow us to talk to a computer using natural language,',
  'conveying the rich information contained with the implied logical formulas.',
  'Another motivation is that much of human knowledge is actually written down in text.',
  'We\'d like a computer to internalize this knowledge and support question answering from it.',
  'Think next-generation search.',
_);

add(slide('From language to logic',
  keyIdea('principle of compositionality',
    'The semantics of a sentence is combination of meanings of its parts.',
  _),
  pause(),
  stmt('Sentence'),
  parentCenter(semparse('Alice likes hiking.', '$\\Likes(\\alice, \\hiking)$')),
  nil(),
  pause(),
  stmt('Words'),
  parentCenter(ytable(
    semparse('Alice', '$\\alice$'),
    semparse('hiking', '$\\hiking$'),
    pause(),
    stagger(
      semparse('likes', '$\\Likes$'),
      semparse('likes', '$\\Likes(\\cdot, \\cdot)$'),
      semparse('likes', '$\\lambda y \\, \\lambda x \\, \\Likes(x, y)$'),
    _),
  _).margin(10)),
  //stmt('Question: how to combine?'),
_));

prose(
  'To make the mapping from sentences to logical formulas work,',
  'we leverage the principle of compositionality, which basically says that this mapping is defined recursively based on subparts.',
  _,
  'We can say that the word <i>Alice</i> maps to the logical term $\\alice$; <i>hiking</i> to $\\hiking$.',
  'But if <i>likes</i> simply $\\Likes$, then we don\'t have enough information about how to combine the parts.',
  'Therefore, we let <i>likes</i> map onto a function that takes two arguments $y$ and $x$ (in that order),',
  'and returns $\\Likes(x,y)$.',
_);

add(slide('Lambda calculus: example 1',
  stmt('Function'),
  indent('$\\lambda x \\, \\Student(x) \\wedge \\Likes(x,\\hiking)$'),
  stmt('Argument'),
  indent('$\\alice$'),
  pause(),
  stmt('Function application'),
  indent('$(\\lambda x \\, \\Student(x) \\wedge \\Likes(x,\\hiking))(\\alice)$'), pause(),
  indent('$\\Student(\\alice) \\wedge \\Likes(\\alice,\\hiking)$'),
_));

prose(
  'Before getting into how we build up the full logical form,',
  'let\'s give a few quick lambda calculus examples.',
  _,
  'First, suppose we have a function and argument.',
  'Function application substitutes the argument (e.g., $\\alice$) in for the variable of the function ($x$).',
_);

add(slide('Lambda calculus: example 2',
  stmt('Function'),
  indent('$\\lambda y \\, \\lambda x \\, \\Likes(x,y)$'),
  stmt('Argument'),
  indent('$\\hiking$'),
  pause(),
  stmt('Function application'),
  indent('$(\\lambda y \\, \\lambda x \\, \\Likes(x,y))(\\hiking) =$'), pause(),
  indent('$\\lambda x \\, \\Likes(x,\\hiking)$'),
_));

add(slide('Lambda calculus: example 2',
  stmt('Function'),
  indent('$\\lambda f \\, \\lambda x \\, \\neg f(x)$'),
  stmt('Argument'),
  indent('$\\lambda y \\, \\Likes(y, \\hiking)$'),
  pause(),
  stmt('Function application'),
  indent('$(\\lambda f \\, \\lambda x \\, \\neg f(x))(\\lambda y \\, \\Likes(y, \\hiking)) =$'), pause(),
  indent('$\\lambda x \\, \\neg (\\lambda y \\, \\Likes(y, \\hiking))(x) =$'), pause(),
  indent('$\\lambda x \\, \\neg \\Likes(x, \\hiking)$'),
_));

prose(
  'As a more complex example, arguments can themselves be functions.',
  'Working through the substitutions, we get that this function performs negation,',
  'turning "people who like hiking" to "people who don\'t like hiking".',
  _,
  'One of the powerful aspects of lambda calculus is exactly that functions can be passed into other functions.',
  'But to be absolutely rigorous, we would use simply-typed lambda calculus,',
  'which associates each function with a type (e.g., $\\text{object} \\to \\text{bool}$).',
_);

T = rootedTree;
B = rootedTreeBranch;

add(slide('Grammar',
  importantBox(redbold('Grammar'),
    stmt('Lexicon'),
    semparse('Alice', '$\\alice$'),
    semparse('hiking', '$\\hiking$'),
    semparse('likes', '$\\lambda y \\, \\lambda x \\, \\Likes(x, y)$'),
    stmt('Forward application'),
    semparse('$f \\quad x$', '$f(x)$'),
    stmt('Backward application'),
    semparse('$x \\quad f$', '$f(x)$'),
  _),
_));

prose(
  'A grammar is a set of rules.',
  'The lexicon contains a set of lexical rules, which map natural language to formulas.',
  'We also have two rules that perform forward and backward application',
  '(depending on whether the function precedes or succeeds the argument).',
  _,
  'Advanced: if you take a semantic class in linguistics or CS224U,',
  'you will get a richer linguistic treatment of this material.',
  'We have deliberately tried to suppress that in the interest of keeping things simple.',
  'Each rule can not only produce a logical formula, but also a syntactic category (e.g., sentence or noun phrase),',
  'which can be used to restrict when rules are applied.',
  _,
  'Advanced: also note that a context-free grammar (CFG) is also a different beast',
  'than the grammars here because the emphasis is on determining which sentences are licensed under the CFG (yes or no),',
  'whereas here, our expressed emphasis is to actually produce the logical formula for the meaning of that sentence.',
_);

function rule(str, subtree, opts) {
  if (!opts) opts = {};
  var move = opts.left ? moveLeftOf : moveRightOf;
  return move(text(brownbold('['+str+']')).scale(0.8), subtree.headBox);
}

add(slide('Basic derivation',
  stmt('Leaves: input words'),
  stmt('Internal nodes: produced by applying rule to children'),
  parentCenter(overlay(
    a = T(
      '$\\Likes(\\alice, \\hiking)$',
      T('$\\alice$', greenitalics('Alice')),
      b = T(
        '$\\lambda x \\, \\Likes(x, \\hiking)$',
        T('$\\lambda y \\, \\lambda x \\, \\Likes(x,y)$', greenitalics('likes')),
        T('$\\hiking$', greenitalics('hiking')),
      _),
    _),
    rule('backward: $x \\, f \\Rightarrow f(x)$', a),
    rule('forward: $f \\, x \\Rightarrow f(x)$', b),
  _)),
_));

prose(
  'This is perhaps the most important slide.',
  'Given a sequence of input words (as the leaves of the tree),',
  'we build a logical form at each intermediate node by applying a rule to the formulas of its children.',
  'The formula at the root is the formula that\'s output and returned.',
  _,
  'Next, we will walk through some important linguistic phenomena.',
_);

add(slide('Negation',
  greenitalics('Alice does not like hiking.'),
  indent('$\\neg \\Likes(\\alice, \\hiking)$'),
  pause(),
  importantBox(redbold('Grammar'),
    '...',
    stmt('Negation'),
    indent(semparse(greenitalics('does not'), '$\\lambda f \\, \\lambda x \\, \\neg f(x)$')),
  _).scale(0.8),
  pause(),
  parentCenter(overlay(
    b = T(
      '$\\neg \\Likes(\\alice, \\hiking)$',
      T('$\\alice$', greenitalics('Alice')),
      a = T(
        '$\\lambda x \\, \\neg \\Likes(x, \\hiking)$',
        T('$\\lambda f \\, \\lambda x \\, \\neg f(x)$', greenitalics('does not')),
        T('$\\lambda x \\, \\Likes(x, \\hiking)$', greenitalics('like hiking')),
      _),
    _),
    rule('forward: $f \\, x \\Rightarrow f(x)$', a),
    rule('backward: $x \\, f \\Rightarrow f(x)$', b),
  _)).scale(0.8),
_));

prose(
  'Negation is an important construct that inverts the meaning of a sentence.',
  'As we saw earlier with lambda calculus example 2,',
  'we can turn $\\lambda x \\, \\Likes(x,\\hiking)$ into $\\lambda x \\, \\neg \\Likes(x,\\hiking)$.',
_);

add(slide('Coordination 1',
  greenitalics('Alice likes hiking <b>and</b> Bob likes swimming.'),
  indent('$\\Likes(\\alice, \\hiking) \\wedge \\Likes(\\bob, \\swimming)$'),
  importantBox(redbold('Grammar'),
    '...',
    stmt('Coordination'),
    indent(semparse('$f$ and $g$', '$f \\wedge g$')),
  _),
  pause(),
  parentCenter(overlay(
    a = T(
      '$\\Likes(\\alice, \\hiking) \\wedge \\Likes(\\bob, \\swimming)$',
      T('$\\Likes(\\alice, \\hiking)$', greenitalics('Alice likes hiking')),
      greenitalics('and'),
      T('$\\Likes(\\bob, \\swimming)$', greenitalics('Bob likes swimming')),
    _),
    rule('conjunction: $f \\, g \\Rightarrow f \\wedge g$', a),
  _)).scale(0.75),
_));

prose(
  'Coordination refers to the use of connective words such as <i>and</i>, <i>or</i>, etc.',
  'In the simplest coordination case, we are simply taking the conjunction of two formulas.',
_);

add(slide('Coordination 2',
  greenitalics('Alice likes hiking <b>and</b> hates swimming.'),
  indent('$\\Likes(\\alice, \\hiking) \\wedge \\Hates(\\alice, \\swimming)$'),
  pause(),
  importantBox(redbold('Grammar'),
    '...',
    stmt('Coordination'),
    indent(semparse('$f$ and $g$', '$\\lambda x \\, f(x) \\wedge g(x)$')),
  _).scale(0.8),
  pause(),
  parentCenter(overlay(
    b = T(
      '$\\Likes(\\alice, \\hiking) \\wedge \\Hates(\\alice, \\swimming)$',
      T('$\\alice$', greenitalics('Alice')),
      a = T(
        '$\\lambda x \\, \\Likes(x, \\hiking) \\wedge \\Hates(x, \\swimming)$',
        T('$\\lambda x \\, \\Likes(x, \\hiking)$', greenitalics('likes hiking')),
        greenitalics('and'),
        T('$\\lambda x \\, \\Hates(x, \\swimming)$', greenitalics('hates swimming')),
      _),
    _),
    rule('conjunction: $f \\, g \\Rightarrow \\lambda x \\, f(x) \\wedge g(x)$', a),
    rule('backward: $x \\, f \\Rightarrow f(x)$', b),
  _)).scale(0.6),
_));

prose(
  'However, the same word <i>and</i> can also be used to conjoin two incomplete sentences (<i>likes hiking</i> and <i>hates swimming</i>).',
  'Notice that <i>Alice</i> only shows up once in the sentence but twice in the formula.',
  _,
  'Here, we define a different coordination rule which takes the conjunction not of two formulas, but of two functions.',
  'Intuitively, this allows us to combine $\\Likes$ and $\\Hates$ "underneath" the $\\lambda x$.',
_);

add(slide('Quantification',
  greenitalics('<b>Every</b> student likes hiking.'),
  indent('$\\forall x \\, \\Student(x) \\to \\Likes(x, \\hiking)$'),
  pause(),
  importantBox(redbold('Grammar'),
    '...',
    stmt('Universal quantification'),
    indent(semparse(greenitalics('every'), '$\\lambda f \\lambda g \\, \\forall x \\, f(x) \\to g(x)$')),
  _).scale(0.8),
  pause(),
  parentCenter(overlay(
    b = T(
      '$\\forall x \\, \\Student(x) \\to \\Likes(x, \\hiking)$',
      a = T(
        '$\\lambda g \\, \\forall x \\, \\Student(x) \\to g(x)$',
        T('$\\lambda f \\lambda g \\, \\forall x \\, f(x) \\to g(x)$', greenitalics('every')), 
        T('$\\lambda x \\, \\Student(x)$', greenitalics('student')),
      _),
      T('$\\lambda x \\, \\Likes(x, \\hiking)$', greenitalics('likes hiking')),
    _),
    rule('forward: $f \\, x \\Rightarrow f(x)$', a, {left: true}),
    rule('forward: $f \\, x \\Rightarrow f(x)$', b),
  _)).scale(0.65),
_));

prose(
  'The last phenomenon that we will discuss is quantification,',
  'which is a very rich topic, and is a major point of first-order logic too.',
  _,
  'In the simplest case where there is just one quantifier,',
  'we can add a rule that maps <i>every</i> to something that takes two functions, $f$ and $g$, and returns the appropriate formula.',
  _,
  'In the context of the sentence, $f$ gets bound to $\\lambda x \\, \\Student(x)$ and $g$ gets bound to $\\lambda x \\, \\Likes(x, \\hiking)$.',
_);

add(slide('Ambiguity',
  stmt('Lexical ambiguity'),
  indent(semparse('Alice went to the bank.', '$\\text{Travel}(\\alice, \\text{RiverBank})$')).scale(0.9),
  indent(semparse('Alice went to the bank.', '$\\text{Travel}(\\alice, \\text{MoneyBank})$')).scale(0.9),
  pause(),
  stmt('Scope ambiguity'),
  indent(semparse('Everyone likes someone.', '$\\forall x \\, \\exists y \\, \\Likes(x, y)$')).scale(0.9),
  indent(semparse('Everyone likes someone.', '$\\exists y \\, \\forall x \\, \\Likes(x, y)$')).scale(0.9),
_));

prose(
  'Everything has worked out smoothly because we have deliberately chosen the right set of rules to apply so that we get the correct logical formulas.',
  'But in some case, the same piece of text can map to multiple valid logical formula that have different meanings!',
  _,
  'This discrepancy might be due to lexical ambiguity (individual words mean many different meanings) or scope ambiguity',
  'where the actual order of quantification is not specified by the text (natural language is weird like that).',
_);

function semparseSchema() {
  return xtable(
    'utterance',
    bigRightArrow(),
    frameBox('Grammar'),
    bigRightArrow(),
    ytable(
      bold('derivation$_1$'),
      'derivation$_2$',
      '...',
      'derivation$_n$',
    _),
  _).center().margin(20);
}

add(slide('Algorithms',
  semparseSchema(),
  pause(),
  bulletedText(stmt('Inference (parsing): construct derivations recursively (dynamic programming)')),
  pause(),
  bulletedText(stmt('Learning: define ranking loss function, optimize with stochastic gradient descent')),
_));

prose(
  'We\'ve seen many different linguistic phenomena, which all can be handled by adding rules.',
  'In practice, we construct a parsing algorithm that can output a set of derivations gotten by',
  'parsing the utterance with respect to the grammar.',
  _,
  'These algorithms are based on the recursive structure of language and look a lot like dynamic programming algorithms.',
  'Specifically, for each subsequence of the sentence, we build a set of sub-derivations.',
  _,
  'In learning semantic parsers, we are given a set of utterances paired with derivations.',
  'To learn the parameters, we can define a standard ranking function, which can be optimized with stochastic gradient descent.',
_);

add(slide('Putting it together',
  semparseSchema(),
  pause(),
  xtable(
    ytable(
      '$\\Ask[f]$ or $\\Tell[f]$',
      '(from derivation$_1$)',
    _),
    bigRightArrow(),
    frameBox(ytable('knowledge', 'base').center()).bg.strokeWidth(3).end,
    bigRightArrow(),
    'answer',
  _).center().margin(10),
  pause(),
  parentCenter(text('[demo: python nli.py]')),
_));

prose(
  'The result of the derivation is a logical formula equipped with either an ask or tell request.',
  'This can be again used to tell the knowledge base facts or ask questions.',
  'This KB could even be probabilistic via Markov logic.',
_);

add(summarySlide('Summary',
  bulletedText('Logic is used to <b>represent</b> knowledge and perform <b>inferences</b> on it'),
  bulletedText(stmt('Considerations: expressiveness, notational convenience, inferential complexity')),
  bulletedText(stmt('First-order logic: objects/relations, quantify over variables')),
  pause(),
  bulletedText(stmt('Other logics: more expressivity or more efficient')),
  bulletedText(stmt('Markov logic: marry logic (abstract reasoning by working on formulas) and probability (maintaining uncertainty)')),
  bulletedText(stmt('Semantic parsing: map natural language to logic')),
_));

prose(
  'In conclusion, hopefully you have gotten a taste of how powerful logic can be',
  'as a means of expressing pretty complex facts using a very small means.',
  _,
  'There is no one true logic,',
  'and which one is the best to choose depends on the needs of the application coupled with computational budget.',
  _,
  'Also, there is no contradiction between probability and logic.',
  'Logic provides with notions of objects/relations &mdash; answering the question of what we should even be modeling.',
  'Probability allows us to place distributions over these notions defined by logic.',
  _,
  'The story is far from complete: classical logics still have much more expressiveness than Markov logic,',
  'so bringing richer types of statements into the realm of probability is an active area of research.',
  _,
  'Finally, semantic parsing provides an initial step towards the goal of being able to process arbitrary text into a knowledge base',
  'and automatically make inferences about it.  While we talked mostly about the structural aspects of semantic parsers (e.g., the grammar),',
  'there has been a surge of interest lately in making these semantic parsers more robust and scalable.',
  'There is still much work to be done though.',
_);

sfig.initialize();
