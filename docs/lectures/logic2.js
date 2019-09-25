G = sfig.serverSide ? global : this;
G.prez = presentation();

add(titleSlide('Lecture 17: Logic II',
  nil(),
  parentCenter(image('images/escher-hands.jpg')),
_));

add(slide('Review: ingredients of a logic',
  redbold('Syntax') + ': defines a set of valid <b>formulas</b> ($\\Formulas$)',
  indent('Example: $\\Rain \\wedge \\Wet$'),
  pause(),
  bluebold('Semantics') + ': for each formula, specify a set of <b>models</b> (assignments / configurations of the world)',
  indent(xtable('Example:', rainWet('red', 0, 0, 0, 2)).margin(5).center()),
  //'<b>Model</b> $w$ describing a possible configuration of the world', pause(),
  //'<b>Interpretation function</b> $\\sI$ mapping each $f \\in \\Formulas$ and model $w$ to a truth value $\\sI(f, w)$',
  pause(),
  greenbold('Inference rules') + ': given $f$, what new formulas $g$ can be added that are guaranteed to follow ($\\frac{f}{g}$)?',
  indent('Example: from $\\Rain \\wedge \\Wet$, derive $\\Rain$'),
  //pause(),
  //stmt(bold('Inference algorithm'), 'apply inference rules to answer queries'),
_));

add(slide('Review: schema',
  logicSchema(),
_));

prose(
  'Logic provides a formal language to talk about the world.',
  _,
  'The valid sentences in the language are the logical formulas,',
  'which live in syntax-land.',
  _,
  'In semantics-land, a model represents a possible configuration of the world.',
  'An interpretation function connects syntax and semantics.',
  'Specifically, it defines, for each formula $f$, a set of models $\\sM(f)$.',
  _,
_);

add(slide('Review: inference task',
  importantBox(redbold('Inference task'),
    headerList('Input',
      nowrapText('Knowledge base $\\KB$ (e.g., $\\{ \\Rain, \\Rain \\to \\Wet \\}$)'),
      nowrapText('Query formula $f$ (e.g., $\\Wet$)'), pause(),
    _),
    headerList('Output',
      nowrapText('Whether $\\KB$ entails $f$ ($\\KB \\models f$)? (e.g., yes)'),
      nowrapText('$\\left(\\KB \\models f \\iff \\sM(f) \\supseteq \\sM(\\KB)\\right)$'),
    _),
  _),
  //headerList('Equivalence',
  //'$\\KB \\models $f$ is equivalent to $\\KB$ contradicts $\\neg f$',
_));

prose(
  'A knowledge base is a set of formulas we know to be true.',
  'Semantically the KB represents the conjunction of the formulas.',
  _,
  'The central goal of logic is inference:',
  'to figure out whether a query formula is entailed by, contradictory with, or contingent on the KB',
  '(these are semantic notions defined by the interpretation function).',
_);

add(slide('Review: inference algorithm',
  stmt('Inference algorithm'),
  nil(),
  parentCenter(xtable(
    '$\\KB$',
    ytable(
      text('(repeatedly apply inference rules)').orphan(true),
      bigRightArrow(500),
    _).center(),
    '$f$',
  _).center().margin(10)),
  pause(),
  stagger(
    example('modus ponens inference rule',
      nowrapText('$\\displaystyle \\frac{\\Wet, \\quad \\Weekday, \\quad \\Wet \\wedge \\Weekday \\to \\Traffic}{\\Traffic}$'),
    _),
    definition('modus ponens inference rule',
      nowrapText('$\\displaystyle \\frac{p_1, \\quad \\cdots \\quad, p_k, \\quad (p_1 \\wedge \\cdots \\wedge p_k) \\to q}{q}$'),
    _),
  _),
  pause(),
  stmt('Desiderata: soundness and completeness'),
  parentCenter(xtable(
    image('images/half-water-glass.jpg'),
    image('images/full-water-glass.jpg'),
  _).margin(100)).scale(0.4),
_));

prose(
  'The unique thing about having a logical language is that we can also perform inference directly on syntax by applying <b>inference rules</b>,',
  'rather than always appealing to semantics (and performing model checking there).',
  _,
  'We would like the inference algorithm to be both sound',
  '(not derive any false formulas) and complete (derive all true formulas).',
  'Soundness is easy to check, completeness is harder.',
_);

add(slide('Review: formulas',
  stmt('Propositional logic: any legal combination of symbols'),
  indent('$(\\Rain \\wedge \\Snow) \\to (\\Traffic \\vee \\Peaceful) \\wedge \\Wet$'),
  pause(),
  stmt('Propositional logic with only Horn clauses: restricted'),
  indent('$(\\Rain \\wedge \\Snow) \\to \\Traffic$'),
_));

prose(
  'Whether a set of inference rules is complete depends on what the formulas are.',
  'Last time, we looked at two logical languages: propositional logic and',
  'propositional logic restricted to Horn clauses',
  '(essentially formulas that look like $p_1 \\wedge \\cdots \\wedge p_k \\to q$),',
  'which intuitively can only derive positive information.',
_);

add(slide('Approaches',
  parentCenter(table(
    ['Formulas allowed', 'Inference rule', 'Complete?'].map(bold),
    ['Propositional logic (only Horn clauses)', 'modus ponens', green('yes')], pause(),
    ['Propositional logic', 'modus ponens',red( 'no')], pause(),
    ['Propositional logic', bluebold('resolution'), green('yes')],
  _).margin(15, 80)).scale(0.9),
_));

prose(
  'We saw that if our logical language was restricted to Horn clauses,',
  'then modus ponens alone was sufficient for completeness.',
  'For general propositional logic, modus ponens is insufficient.',
  _,
  'In this lecture, we\'ll see that a more powerful inference rule, <b>resolution</b>,',
  'is complete for all of propositional logic.',
_);

function roadmap(i) {
  add(outlineSlide('Roadmap', i, [
    ['resolution', 'Resolution in propositional logic'],
    ['firstOrderLogic', 'First-order logic'],
  ]));
}

////////////////////////////////////////////////////////////
// Resolution
roadmap(0);

add(slide('Horn clauses and disjunction',
  parentCenter(table(
    ['Written with implication', 'Written with disjunction'].map(bold),
    //['$\\red{C}$', '$\\red{C}$'], pause(),
    ['$A \\to \\red{C}$', '$\\neg A \\vee \\red{C}$'], pause(),
    ['$A \\wedge B \\to \\red{C}$', '$\\neg A \\vee \\neg B \\vee \\red{C}$'],
  _).margin(100, 10)),
  pause(),
  bulletedText('<b>Literal</b>: either $p$ or $\\neg p$, where $p$ is a propositional symbol'),
  bulletedText('<b>Clause</b>: disjunction of literals'),
  bulletedText('<b>Horn clauses</b>: at most one positive literal'),
  pause(),
  stmt('Modus ponens (rewritten)'),
  parentCenter('$\\frac{\\red{A}, \\quad \\red{\\neg A} \\vee C}{C}$'),
  bulletedText('Intuition: cancel out $A$ and $\\neg A$'),
_));

prose(
  'Modus ponens can only deal with Horn clauses,',
  'so let\'s see why Horn clauses are limiting.',
  'We can equivalently write implication using negation and disjunction.',
  'Then it\'s clear that Horn clauses are just disjunctions of literals',
  'where there is at most one positive literal and zero or more negative literals.',
  'The negative literals correspond to the propositional symbols on the left side of the implication,',
  'and the positive literal corresponds to the propositional symbol on the right side of the implication.',
  _,
  'If we rewrite modus ponens, we can see a "canceling out" intuition emerging. ',
   'To make the intuition a bit more explicit, remember that, to respect ',
   'soundness, we require $\\{A, \\neg A \\vee C\\} \\models C$; this is equivalent to:',
   'if $A \\wedge (\\neg A \\vee C)$ is true, then $C$ is also true.',
   'This is clearly the case.',
  _,
  ' But modus ponens cannot operate on general clauses.',
_);

add(slide('Resolution [Robinson, 1965]',
  'General clauses have any number of literals:',
  parentCenter('$\\neg A \\vee \\red{B} \\vee \\neg C \\vee \\red{D} \\vee \\neg E \\vee \\red{F}$'),
  pause(),
  example('resolution inference rule',
    nowrapText('$\\displaystyle \\frac{\\Rain \\vee \\red{\\Snow}, \\quad \\red{\\neg \\Snow} \\vee \\Traffic}{\\Rain \\vee \\Traffic}$'),
  _),
  pause(),
  definition('resolution inference rule',
    nowrapText('$\\displaystyle \\frac{f_1 \\vee \\cdots \\vee f_n \\vee \\red{p}, \\quad \\red{\\neg p} \\vee g_1 \\vee \\cdots \\vee g_m}{f_1 \\vee \\cdots \\vee f_n \\vee g_1 \\vee \\cdots \\vee g_m}$'),
  _),
_));

prose(
  'Let\'s try to generalize modus ponens by allowing it to work on general clauses.',
  'This generalized inference rule is called <b>resolution</b>,',
  'which was invented in 1965 by John Alan Robinson.',
  _,
  'The idea behind resolution is that it takes two general clauses,',
  'where one of them has some propositional symbol $p$ and the other clause has its negation $\\neg p$,',
  'and simply takes the disjunction of the two clauses with $p$ and $\\neg p$ removed.',
  'Here, $f_1, \\dots, f_n, g_1, \\dots, g_m$ are arbitrary literals.',
_);

add(slide('Soundness of resolution',
  parentCenter('$\\displaystyle \\frac{\\Rain \\vee \\Snow, \\quad \\neg \\Snow \\vee \\Traffic}{\\Rain \\vee \\Traffic}$ (resolution rule)'), pause(),
  parentCenter(table(
    ['$\\red{\\sM(\\Rain \\vee \\Snow)}$', '$\\cap$', '$\\red{\\sM(\\neg \\Snow \\vee \\Traffic)}$', '$\\subseteq$?', '$\\green{\\sM(\\Rain \\vee \\Traffic)}$'],
    [
      rainTrafficSnow('red', 0, 0, 2, 2, 1, 2, 1, 2), nil(),
      rainTrafficSnow('red', 1, 1, 2, 2, 0, 2, 0, 2), nil(),
      rainTrafficSnow('green', 0, 1, 1, 1, 0, 1, 1, 1),
    ],
  _).center().margin(0, 40)).scale(0.8),
  pause(),
  parentCenter(bluebold('Sound!')),
_));

prose(
  'Why is resolution logically sound?',
  'We can verify the soundness of resolution by checking its semantic interpretation.',
  'Indeed, the intersection of the models of $f$ and $g$ are a superset of $f \\vee g$.',
_);

add(slide('Conjunctive normal form',
  stmt('So far: resolution only works on clauses...but that\'s enough!'),
  pause(),
  definition('conjunctive normal form (CNF)',
    'A <b>CNF formula</b> is a conjunction of clauses.',
  _),
  stmt('Example', '$(A \\vee B \\vee \\neg C) \\wedge (\\neg B \\vee D)$'),
  stmt('Equivalent: knowledge base where each formula is a clause'),
  pause(),
  proposition('conversion to CNF',
    'Every formula $f$ in propositional logic can be converted into an equivalent CNF formula $f\'$:',
    parentCenter('$\\sM(f) = \\sM(f\')$'),
  _),
_));

prose(
  'But so far, we\'ve only considered clauses, which are disjunctions of literals.',
  'Surely this can\'t be all of propositional logic...',
  'But it turns out it actually is in the following sense.',
  _,
  'A conjunction of clauses is called a CNF formula, and every formula in propositional logic',
  'can be converted into an equivalent CNF.',
  'Given a CNF formula, we can toss each of its clauses into the knowledge base.',
  _,
  'But why can every formula be put in CNF?',
_);

add(slide('Conversion to CNF: example',
  stmt('Initial formula'),
  parentCenter('$(\\Summer \\to \\Snow) \\to \\Bizzare$'),
  pause(),
  stmt('Remove implication ($\\to$)'),
  parentCenter(stagger(
    '$\\neg (\\Summer \\to \\Snow) \\vee \\Bizzare$',
    '$\\neg (\\neg \\Summer \\vee \\Snow) \\vee \\Bizzare$',
  _)),
  pause(),
  stmt('Push negation ($\\neg\\,$) inwards (de Morgan)'),
  parentCenter('$(\\neg \\neg \\Summer \\wedge \\neg \\Snow) \\vee \\Bizzare$'),
  pause(),
  stmt('Remove double negation'),
  parentCenter('$(\\Summer \\wedge \\neg \\Snow) \\vee \\Bizzare$'),
  pause(),
  stmt('Distribute $\\vee$ over $\\wedge$'),
  parentCenter('$(\\Summer \\vee \\Bizzare) \\wedge (\\neg \\Snow \\vee \\Bizzare)$'),
_));

prose(
  'The answer is by construction.',
  'There is a six-step procedure that takes any propositional formula and turns it into CNF.',
  'Here is an example of how it works (only four of the six steps apply here).',
_);

add(slide('Conversion to CNF: general',
  headerList('Conversion rules',
    'Eliminate $\\leftrightarrow$: $\\frac{f \\leftrightarrow g}{(f \\to g) \\wedge (g \\to f)}$',
    'Eliminate $\\to$: $\\frac{f \\to g}{\\neg f \\vee g}$',
    'Move $\\neg\\,$ inwards: $\\frac{\\neg (f \\wedge g)}{\\neg f \\vee \\neg g}$',
    'Move $\\neg\\,$ inwards: $\\frac{\\neg (f \\vee g)}{\\neg f \\wedge \\neg g}$',
    'Eliminate double negation: $\\frac{\\neg \\neg f}{f}$',
    'Distribute $\\vee$ over $\\wedge$: $\\frac{f \\vee (g \\wedge h)}{(f \\vee g) \\wedge (f \\vee h)}$',
  _),
_));

prose(
  'Here are the general rules that convert any formula to CNF.',
  'First, we try to reduce everything to negation, conjunction, and disjunction.',
  _,
  'Next, we try to push negation inwards so that they sit on the propositional symbols (forming literals).',
  'Note that when negation gets pushed inside, it flips conjunction to disjunction, and vice-versa.',
  _,
  'Finally, we distribute so that the conjunctions are on the outside, and the disjunctions are on the inside.',
  _,
  'Note that each of these operations preserves the semantics of the logical form',
  '(remember there are many formula that map to the same set of models).',
  'This is in contrast with most inference rules,',
  'where the conclusion is more general than the conjunction of the premises.',
  _,
  'Also, when we apply a CNF rewrite rule, we replace the old formula with the new one,',
  'so there is no blow-up in the number of formulas.',
  'This is in contrast to applying general inference rules.',
  'An analogy: conversion to CNF does simplification in the context of full inference,',
  'just like AC-3 does simplification in the context of backtracking search.',
_);

add(slide('Resolution algorithm',
  stmt('Recall: entailment and contradiction $\\Leftrightarrow$ satisfiability'),
  parentCenter(table(
    ['$\\KB \\models f$', bigLeftRightArrow(), '$\\KB \\cup \\{ \\neg f \\}$ is unsatisfiable'],
    ['$\\KB \\models \\neg f$', bigLeftRightArrow(), '$\\KB \\cup \\{ f \\}$ is unsatisfiable'],
  _).margin(50, 80).ycenter()),
  pause(),
  algorithm('resolution-based inference',
    bulletedText('Convert all formulas into <font color="red"><b>CNF</b></font>.'),
    bulletedText('Repeatedly apply <font color="red"><b>resolution</b></font> rule.'),
    bulletedText('Return unsatisfiable iff derive false.'),
  _),
_));

prose(
  'After we have converted all the formulas to CNF, we can repeatedly apply the resolution rule.',
  'But what is the final target?',
  _,
  'Recall that both testing for entailment and contradiction boil down to checking satisfiability.',
  'Resolution can be used to do this very thing.',
  'If we ever apply a resolution rule (e.g., to premises $A$ and $\\neg A$) ',
  'and we derive false, which is clearly a contradiction, then ',
  'the set of formulas in the knowledge base is unsatisfiable.',
  _,
  'If we are unable to derive false, that means the knowledge base is satisfiable because resolution is complete.',
  'However, unlike in model checking, we don\'t actually produce a concrete model that satisfies the KB.',
_);

var T = rootedTree;
add(slide('Resolution: example',
  stmt('Knowledge base (is it satisfiable?)'),
  indent('$\\KB = \\{ A \\to (B \\vee C), A, \\neg B, \\neg C \\}$'), pause(),
  stmt('Convert to CNF'),
  indent('$\\KB = \\{ \\neg A \\vee B \\vee C, A, \\neg B, \\neg C \\}$'), pause(),
  stmt('Repeatedly apply <font color="red"><b>resolution</b></font> rule'),
  parentCenter(T('$\\text{false}$', T('$C$', T('$B \\vee C$', '$\\neg A \\vee B \\vee C$', '$A$'), '$\\neg B$'), '$\\neg C$').recymargin(10)),
  pause(),
  parentCenter(redbold('Unsatisfiable!')),
_));

prose(
  'Here\'s an example of taking a knowledge base, converting it into CNF,',
  'and applying resolution.  In this case, we derive false, which means that the original knowledge base',
  'was unsatisfiable.',
_);

add(slide('Time complexity',
  definition('modus ponens inference rule',
    nowrapText('$\\displaystyle \\frac{p_1, \\quad \\cdots \\quad, p_k, \\quad (p_1 \\wedge \\cdots \\wedge p_k) \\to q}{q}$'),
  _).scale(0.8),
  bulletedText('Each rule application adds clause with <b>one</b> propositional symbol $\\Rightarrow$ linear time'),
  pause(),
  definition('resolution inference rule',
    nowrapText('$\\displaystyle \\frac{f_1 \\vee \\cdots \\vee f_n \\vee \\red{p}, \\quad \\red{\\neg p} \\vee g_1 \\vee \\cdots \\vee g_m}{f_1 \\vee \\cdots \\vee f_n \\vee g_1 \\vee \\cdots \\vee g_m}$'),
  _).scale(0.8),
  bulletedText('Each rule application adds clause with <b>many</b> propositional symbols $\\Rightarrow$ exponential time'),
_));

prose(
  'There we have it &mdash; a sound and complete inference procedure for all of propositional logic',
  '(although we didn\'t prove completeness).',
  'But what do we have to pay computationally for this increase?',
   _,
  'If we only have to apply modus ponens, each propositional symbol can only get added once,',
  'so with the appropriate algorithm (forward chaining), we can apply all necessary modus ponens rules in linear time.',
  _,
  'But with resolution, we can end up adding clauses with many propositional symbols,',
  'and possibly any subset of them!  Therefore, this can take exponential time.',
_);

add(summarySlide('Summary',
  nil(),
  parentCenter(table(
    [darkblue('Horn clauses'), darkblue('any clauses')],
    ['modus ponens', 'resolution'],
    ['linear time', 'exponential time'],
    ['less expressive', 'more expressive'],
  _).margin(150, 40)),
_));

prose(
  'To summarize, we can either content ourselves with the limited expressivity of Horn clauses and obtain an efficient inference procedure (via modus ponens).',
  _,
  'If we wanted the expressivity of full propositional logic,',
  'then we need to use resolution and thus pay more.',
_);

////////////////////////////////////////////////////////////
// First-order logic
roadmap(1);

add(slide('Limitations of propositional logic',
  text('Alice and Bob both know arithmetic.'.italics().fontcolor('green')), pause(),
  indent('$\\text{AliceKnowsArithmetic} \\wedge \\text{BobKnowsArithmetic}$').scale(0.9),
  pause(),
  text('All students know arithmetic.'.italics().fontcolor('green')),
  pause(),
  indent(yseq(
    '$\\text{AliceIsStudent} \\to \\text{AliceKnowsArithmetic}$',
    '$\\text{BobIsStudent} \\to \\text{BobKnowsArithmetic}$',
    '$\\dots$',
  _)).scale(0.9),
  pause(),
  text('Every even integer greater than 2 is the sum of two primes.'.italics().fontcolor('green')),
  indent('???'),
_));

prose(
  'If the goal of logic is to be able to express facts in the world in a compact way,',
  'let us ask ourselves if propositional logic is enough.',
  _,
  'Some facts can be expressed in propositional logic, but it is very clunky,',
  'having to instantiate many different formulas.',
  'Others simply can\'t be expressed at all, because we would need to use an infinite number of formulas.',
_);

add(slide('Limitations of propositional logic',
  text('All students know arithmetic.'.italics().fontcolor('green')),
  indent(yseq(
    '$\\text{AliceIsStudent} \\to \\text{AliceKnowsArithmetic}$',
    '$\\text{BobIsStudent} \\to \\text{BobKnowsArithmetic}$',
    '$\\dots$',
  _)).scale(0.9),
  'Propositional logic is very clunky.  What\'s missing?', pause(),
  headerList(null,
    stmt('Objects and relations', 'propositions (e.g., $\\text{AliceKnowsArithmetic}$) have more internal structure ($\\alice$, $\\Knows$, $\\arithmetic$)'), pause(),
    stmt('Quantifiers and variables', '<i>all</i> is a quantifier which applies to each person, don\'t want to enumerate them all...'),
  _),
_));

prose(
  'What\'s missing?  The key conceptual observation is that',
  'the world is not just a bunch of atomic facts,',
  'but that each fact is actually made out of <b>objects</b> and <b>relations</b> between those objects.',
  _,
  'Once facts are decomposed in this way, we can use <b>quantifiers</b> and <b>variables</b>',
  'to implicitly define a huge (and possibly infinite) number of facts with one compact formula.',
  'Again, where logic excels is the ability to represent complex things via simple means.',
_);

////////////////////////////////////////////////////////////
add(slide('First-order logic',
  logicSchema('Syntax'),
_));

prose(
  'We will now introduce <b>first-order logic</b>,',
  'which will address the representational limitations of propositional logic.',
  _,
  'Remember to define a logic, we need to talk about its syntax,',
  'its semantics (interpretation function),',
  'and finally inference rules that we can use to operate on the syntax.',
_);

add(slide('First-order logic: examples',
  text('Alice and Bob both know arithmetic.'.italics().fontcolor('green')), pause(),
  parentCenter('$\\Knows(\\alice, \\arithmetic) \\wedge \\Knows(\\bob, \\arithmetic)$'), pause(),
  text('All students know arithmetic.'.italics().fontcolor('green')), pause(),
  parentCenter('$\\forall x \\, \\Student(x) \\to \\Knows(x, \\arithmetic)$'),
_));

prose(
  'Before formally defining things, let\'s look at two examples.',
  'First-order logic is basically propositional logic with a few more symbols.',
_);

add(slide('Syntax of first-order logic',
  headerList('Terms (refer to objects)',
    'Constant symbol (e.g., $\\arithmetic$)',
    'Variable (e.g., $x$)',
    'Function of terms (e.g., $\\text{Sum}(3,x)$)',
  _), pause(),
  headerList('Formulas (refer to truth values)',
    'Atomic formulas (atoms): predicate applied to terms (e.g., $\\Knows(x,\\arithmetic)$)', pause(),
    'Connectives applied to formulas (e.g., $\\Student(x) \\to \\Knows(x,\\arithmetic)$)', pause(),
    'Quantifiers applied to formulas (e.g., $\\forall x \\, \\Student(x) \\to \\Knows(x,\\arithmetic)$)',
  _),
_));

prose(
  'In propositional logic, everything was a formula (or a connective).',
  'In first-order logic, there are two types of beasts: terms and formulas.',
  'There are three types of terms: constant symbols (which refer to specific objects),',
  'variables (which refer to some unspecified object to be determined by quantifiers),',
  'and functions (which is a function applied to a set of arguments which are themselves terms).',
  _,
  'Given the terms, we can form atomic formulas, which are the analogue of propositional symbols,',
  'but with internal structure (e.g., terms).',
  _,
  'From this point, we can apply the same connectives on these atomic formulas,',
  'as we applied to propositional symbols in propositional logic.',
  'At this level, first-order logic looks very much like propositional logic.',
  _,
  'Finally, to make use of the fact that atomic formulas have internal structure,',
  'we have <b>quantifiers</b>, which are really the whole point of first-order logic!',
_);

add(slide('Quantifiers',
  stmt('Universal quantification ($\\forall$)'),
  indentNowrapText('Think conjunction: $\\forall x \\, P(x)$ is like $P(A) \\wedge P(B) \\wedge \\cdots$'),
  pause(),
  stmt('Existential quantification ($\\exists$)'),
  indentNowrapText('Think disjunction: $\\exists x \\, P(x)$ is like $P(A) \\vee P(B) \\vee \\cdots$'),
  pause(),
  headerList('Some properties',
    '$\\neg \\forall x \\, P(x)$ equivalent to $\\exists x \\, \\neg P(x)$', pause(),
    '$\\forall x \\, \\exists y \\, \\Knows(x, y)$ different from $\\exists y \\, \\forall x \\, \\Knows(x, y)$',
  _),
_));

prose(
  'There are two types of quantifiers: universal and existential.',
  'These are basically glorified ways of doing conjunction and disjunction, respectively.',
  _,
  'For crude intuition, we can think of conjunction and disjunction as very nice syntactic sugar,',
  'which can be rolled out into something that looks more like propositional logic.',
  'But quantifiers aren\'t just sugar, and it is important that they be compact,',
  'for sometimes the variable being quantified over can take on an infinite number of objects.',
  _,
  'That being said, the conjunction and disjunction intuition suffices for day-to-day guidance.',
  'For example, it should be intuitive that pushing the negation inside a universal quantifier (conjunction)',
  'turns it into a existential (disjunction), which was the case for propositional logic (by de Morgan\'s laws).',
  'Also, one cannot interchange universal and existential quantifiers any more than one can swap conjunction and disjunction in propositional logic.',
_);

add(slide('Natural language quantifiers',
  stmt('Universal quantification ($\\forall$)'),
  indent('Every student knows arithmetic.'.italics().fontcolor('green')),
  pause(),
  indent('$\\forall x \\, \\Student(x) \\red{\\to} \\Knows(x, \\arithmetic)$'),
  pause(),
  stmt('Existential quantification ($\\exists$)'),
  indent('Some student knows arithmetic.'.italics().fontcolor('green')),
  pause(),
  indent('$\\exists x \\, \\Student(x) \\red{\\wedge} \\Knows(x, \\arithmetic)$'),
  pause(),
  parentCenter(frameBox(redbold('Note the different connectives!'))),
_));

prose(
  'Universal and existential quantifiers naturally correspond to the words <i>every</i> and <i>some</i>, respectively.',
  'But when converting English to formal logic, one must exercise caution.',
  _,
  '<i>Every</i> can be thought of as taking two arguments $P$ and $Q$ (e.g., <i>student</i> and <i>knows arithmetic</i>).',
  'The connective between $P$ and $Q$ is an implication (not conjunction, which is a common mistake).',
  'This makes sense because when we talk about every $P$, we are only restricting our attention to objects $x$ for which $P(x)$ is true.',
  'Implication does exactly that.',
  _,
  'On the other hand, the connective for existential quantification is conjunction,',
  'because we\'re asking for an object $x$ such that $P(x)$ and $Q(x)$ both hold.',
_);

add(slide('Some examples of first-order logic',
  'There is some course that every student has taken.'.italics().fontcolor('green'), pause(),
  parentCenter('$\\exists y \\, \\Course(y) \\wedge [\\forall x \\, \\Student(x) \\to \\Takes(x,y)]$').scale(0.6),
  pause(),
  text('Every even integer greater than 2 is the sum of two primes.'.italics().fontcolor('green')), pause(),
  parentCenter(nowrapText('$\\forall x \\, \\text{EvenInt}(x) \\wedge \\text{Greater}(x, 2) \\to \\exists y \\, \\exists z \\, \\text{Equals}(x, \\text{Sum}(y, z)) \\wedge \\text{Prime}(y) \\wedge \\text{Prime}(z)$').scale(0.6)),
  pause(),
  'If a student takes a course and the course covers a concept, then the student knows that concept.'.italics().fontcolor('green'), pause(),
  parentCenter(nowrapText('$\\forall x \\, \\forall y \\, \\forall z \\, (\\Student(x) \\wedge \\Takes(x,y) \\wedge \\Course(y) \\wedge \\Covers(y,z)) \\to \\Knows(x,z)$').scale(0.6)),
_));

prose(
  'Let\'s do some more examples of converting natural language to first-order logic.',
  'Remember the connectives associated with existential and universal quantification!',
  _,
  'Note that some English words such as <i>a</i> can trigger both universal or existential quantification,',
  'depending on context.',
  'In <i>A student took CS221</i>, we have existential quantification,',
  'but in <i>if a student takes CS221, ...</i>, we have universal quantification.',
  _,
  'Formal logic clears up the ambiguities associated with natural language.',
_);

add(slide('First-order logic',
  logicSchema('Semantics'),
_));

prose(
  'So far, we\'ve only presented the syntax of first-order logic,',
  'although we\'ve actually given quite a bit of intuition about what the formulas mean.',
  'After all, it\'s hard to talk about the syntax without at least a hint of semantics for motivation.',
  _,
  'Now let\'s talk about the formal semantics of first-order logic.',
_);

add(slide('Models in first-order logic',
  'Recall a model represents a possible situation in the world.', pause(),
  stmt('Propositional logic', 'Model $w$ maps '+red('propositional symbols')+' to truth values.'),
  parentCenter(nowrapText('$w = \\{ \\text{AliceKnowsArithmetic}: 1, \\text{BobKnowsArithmetic} : 0 \\}$'), 40).scale(0.8), pause(),
  stmt('First-order logic', '?'),
  //stmt('First-order logic', 'Model $w$ maps '+red('grounded atomic formulas')+' to truth values (this is almost right, but not quite).'),
  //parentCenter(nowrapText('$w = \\{ \\Knows(\\alice, \\arithmetic): 1, \\Knows(\\bob, \\arithmetic) : 0 \\}$', 40)).scale(0.8), pause(),
  //bulletedText('Problem is that if $\\bob$ and $\\text{robert}$ refer to the same person, then $w(\\Knows(\\bob, \\arithmetic))$ must equal $w(\\Knows(\\text{robert}, \\arithmetic))$'),
_));

prose(
  'Recall that a model in propositional logic was just an assignment of truth values to propositional symbols.',
  _,
  'A natural candidate for a model in first-order logic would then be an assignment of truth values to grounded atomic formula',
  '(those formulas whose terms are constants as opposed to variables).',
  'This is almost right, but doesn\'t talk about the relationship between constant symbols.',
_);

add(slide('Graph representation of a model',
  'If only have unary and binary relations, a model $w$ as be represented a directed graph:',
  pause(),
  parentCenter(frameBox(overlay(
    ytable(
      xtable(o1 = factorNode('$o_1$'), o2 = factorNode('$o_2$')).margin(40),
      o3 = factorNode('$o_3$'),
    _).margin(40).center(),
    pause(),
    moveLeftOf('$\\green{\\alice}$', o1),
    moveTopOf('$\\green{\\bob}$', o2),
    moveRightOf('$\\green{\\text{robert}}$', o2),
    moveBottomOf('$\\green{\\arithmetic}$', o3),
    pause(),
    a13 = arrow(o1, o3),
    a23 = arrow(o2, o3),
    moveLeftOf(text('$\\red{\\Knows}$').scale(0.7), a13),
    moveRightOf(text('$\\red{\\Knows}$').scale(0.7), a23),
    moveTopOf(text('$\\red{\\Student}$').scale(0.7), o1),
  _)).title(opaquebg('$w$'))).scale(0.9),
  pause(-1),
  bulletedText('Nodes are objects, labeled with <font color="green">constant symbols</font>'),
  pause(),
  bulletedText('Directed edges are binary relations, labeled with '+red('predicate symbols')+'; unary relations are additional node labels'),
_));

prose(
  'A better way to think about a first-order model is that there are a number of objects in the world ($o_1, o_2, \\dots$);',
  'think of these as nodes in a graph.  Then we have relations between these objects.',
  'Predicates that take two arguments can be visualized as labeled edges between objects.',
  'Predicates that take one argument can be visualized as node labels (but these are not so important).',
  _,
  'So far, the objects are unnamed.  We can access individual objects directly using constant symbols,',
  'which are labels on the nodes.',
_);

add(slide('Models in first-order logic',
  definition('model in first-order logic',
    'A model $w$ in first-order logic maps:',
    pause(),
    bulletedText('constant symbols to objects'),
    indent(text('$w(\\alice) = o_1, w(\\bob) = o_2, w(\\arithmetic) = o_3$').scale(0.9)),
    pause(),
    //indent('e.g., $w(\\alice) = \\alice, w(\\text{GirlInWonderland}) = \\alice$)'), pause(),
    bulletedText('predicate symbols to tuples of objects'),
    indent(nowrapText('$w(\\Knows) = \\{ (o_1, o_3), (o_2, o_3), \\dots \\}$').scale(0.9)), pause(),
    //'Model $w$ maps function symbols to tuples of objects',
    //indent('e.g., $w(\\text{Sum}) = \\{ (1, 1, 2), (3, 4, 7), \\dots \\}$'),
  _).content.margin(20).end,
_));

prose(
  'Formally, a first-order model $w$ maps constant symbols to objects and predicate symbols to tuples of objects (2 for binary predicates).',
_);

add(slide('A restriction on models',
  'John and Bob are students.'.italics().fontcolor('green'),
  parentCenter('$\\Student(\\john) \\wedge \\Student(\\bob)$'),
  pause(),
  //stmt('Models'),
  parentCenter(xtable(
    frameBox(overlay(
      xtable(o1 = factorNode('$o_1$'), o2 = factorNode('$o_2$')).margin(40),
      moveTopOf(text('$\\red{\\Student}$').scale(0.7), o1),
      moveTopOf(text('$\\red{\\Student}$').scale(0.7), o2),
      moveLeftOf('$\\green{\\john}$', o1),
      moveRightOf('$\\green{\\bob}$', o2),
    _)).title(opaquebg('$w_1$')),
    pause(),
    frameBox(overlay(
      xtable(o1 = factorNode('$o_1$')).margin(40),
      moveTopOf(text('$\\red{\\Student}$').scale(0.7), o1),
      moveLeftOf('$\\green{\\john}$', o1),
      moveRightOf('$\\green{\\bob}$', o1),
    _)).title(opaquebg('$w_2$')),
    pause(),
    frameBox(overlay(
      xtable(o1 = factorNode('$o_1$'), o2 = factorNode('$o_2$'), o3 = factorNode('$o_3$')).margin(40),
      moveTopOf(text('$\\red{\\Student}$').scale(0.7), o1),
      moveTopOf(text('$\\red{\\Student}$').scale(0.7), o3),
      moveLeftOf('$\\green{\\john}$', o1),
      moveRightOf('$\\green{\\bob}$', o3),
    _)).title(opaquebg('$w_3$')),
  _).margin(20).scale(0.75)),
  pause(),
  headerList(null,
    stmt('Unique names assumption: Each object has <b>at most one</b> <font color="green">constant symbol</font>.  This rules out $w_2$.'), pause(),
    stmt('Domain closure: Each object has <b>at least one</b> <font color="green">constant symbol</font>.  This rules out $w_3$.'), pause(),
    //stmt('Closed-world assumption: All <font color="red">atomic formulas</font> not known (labels not present) are false.'),
  _),
  stmt('Point'),
  parentCenter(xtable('constant symbol', bigLeftRightArrow(200), 'object').center().margin(30)),
  // Demo
_));

prose(
  'Note that by default, two constant symbols can refer to the same object,',
  'and there can be objects which no constant symbols refer to.',
  'This can make life somewhat confusing.',
  'Fortunately, there are two assumptions that people sometimes make to simplify things.',
  _,
  'The unique names assumption says that there\'s at most one way to refer to an object via a constant symbol.',
  'Domain closure says there\'s at least one.',
  'Together, they imply that there is a one-to-one relationship between constant symbols in syntax-land and objects in semantics-land.',
_);

add(slide('Propositionalization',
  'If one-to-one mapping between constant symbols and objects (<b>unique names</b> and <b>domain closure</b>),',
  pause(),
  'first-order logic is syntactic sugar for propositional logic:',
  pause(),
  parentCenter(importantBox(redbold('Knowledge base in first-order logic'),
    '$\\Student(\\alice) \\wedge \\Student(\\bob)$',
    '$\\forall x \\, \\Student(x) \\to \\Person(x)$',
    '$\\exists x \\, \\Student(x) \\wedge \\Creative(x)$',
  _).scale(0.9)),
  pause(),
  parentCenter(importantBox(bluebold('Knowledge base in propositional logic'),
    '$\\Student(\\alice) \\wedge \\Student(\\bob)$',
    nowrapText('$(\\Student(\\alice) \\to \\Person(\\alice)) \\wedge (\\Student(\\bob) \\to \\Person(\\bob))$'),
    nowrapText('$(\\Student(\\alice) \\wedge \\Creative(\\alice)) \\vee (\\Student(\\bob) \\wedge \\Creative(\\bob))$'),
  _).scale(0.7)),
  pause(),
  stmt('Point: use any inference algorithm for propositional logic!'),
_));

prose(
  'If a one-to-one mapping really exists,',
  'then we can <b>propositionalize</b> all our formulas,',
  'which basically unrolls all the quantifiers into explicit conjunctions and disjunctions.',
  _,
  'The upshot of this conversion, is that we\'re back to propositional logic,',
  'and we know how to do inference in propositional logic (either using model checking or by applying inference rules).',
  'Of course, propositionalization could be quite expensive and not the most efficient thing to do.',
_);

//prose('Database semantics is a simplifying assumption which can make inference algorithms more efficient and can be more intuitive for some domains.', 'But this is not the standard semantics of first-order logic, so we will not assume this.');

//prose('We can write binary predicates $x = y$ and $x > 2$ as $\\Equals(x, y)$ or $\\text{Greater}(x,2)$.  Note that these predicates are on terms (which refer to objects) and return truth values.');

////////////////////////////////////////////////////////////
// Resolution
add(slide('First-order logic',
  logicSchema('Inference rules'),
_));

prose(
  'Now we look at inference rules which can make first-order inference much more efficient.',
  'The key is to do everything implicitly and avoid propositionalization;',
  'again the whole spirit of logic is to do things compactly and implicitly.',
_);

add(slide('Definite clauses',
  //nowrapText('$\\forall x \\, \\forall y \\, \\forall z \\, (\\Student(x) \\wedge \\Takes(x,y) \\wedge \\Course(y) \\wedge \\Covers(y,z)) \\to \\Knows(x,z)$').scale(0.65),
  parentCenter(nowrapText('$\\forall x \\, \\forall y \\, \\forall z \\, (\\Takes(x,y) \\wedge \\Covers(y,z)) \\to \\Knows(x,z)$')),
  pause(),
  stmt('Note: if propositionalize, get one formula for each value to $(x,y,z)$, e.g., $(\\alice, \\text{cs221}, \\text{mdp})$'),
  pause(),
  definition('definite clause (first-order logic)',
    'A definite clause has the following form:',
    parentCenter('$\\red{\\forall x_1 \\cdots \\forall x_n} \\, (a_1 \\wedge \\cdots \\wedge a_k) \\to b$'),
    'for variables $x_1, \\dots, x_n$ and atomic formulas $a_1, \\dots, a_k, b$ (which contain those variables).',
  _),
  //pause(),
  //stmt('Intuition', 'think of first-order definite clause compactly representing all instantiations of the variables (for all objects).'),
_));

prose(
  'Like our development of inference in propositional logic,',
  'we will first talk about first-order logic restricted to Horn clauses,',
  'in which case a first-order version of modus ponens will be sound and complete.',
  'After that, we\'ll see how resolution allows to handle all of first-order logic.',
  _,
  'We start by generalizing definite clauses from propositional logic to first-order logic.',
  'The only difference is that we now have universal quantifiers sitting at the beginning of the definite clause.',
  'This makes sense since universal quantification is associated with implication,',
  'and one can check that if one propositionalizes a first-order definite clause,',
  'one obtains a set (conjunction) of multiple propositional definite clauses.',
_);

add(slide('Modus ponens (first attempt)',
  definition('modus ponens (first-order logic)',
    nowrapText('$\\displaystyle \\frac{\\blue{a_1, \\dots, a_k} \\quad \\forall x_1 \\cdots \\forall x_n \\red{(a_1 \\wedge \\cdots \\wedge a_k) \\to b}}{\\blue{b}}$,'),
  _).content.margin(10).end,
  pause(),
  stmt('Setup'),
  indent('Given $P(\\alice)$ and $\\forall x \\, P(x) \\to Q(x)$.'),
  pause(),
  stmt('Problem'),
  indent('Can\'t infer $Q(\\alice)$ because $P(x)$ and $P(\\alice)$ don\'t match!'),
  pause(),
  stmt('Solution: substitution and unification'),
_));

prose(
  'If we try to write down the modus ponens rule, we would fail.',
  _,
  'As a simple example, suppose we are given $P(\\alice)$ and $\\forall x \\, P(x) \\to Q(x)$.',
  'We would naturally want to derive $Q(\\alice)$.',
  'But notice that we can\'t apply modus ponens because $P(\\alice)$ and $P(x)$ don\'t match!',
  _,
  'Recall that we\'re in syntax-land, which means that these formulas are just symbols.',
  'Inference rules don\'t have access to the semantics of the constants and variables &mdash; it is just a pattern matcher.',
  'So we have to be very methodical.',
  _,
  'To develop a mechanism to match variables and constants,',
  'we will introduce two concepts, substitution and unification for this purpose.',
_);

add(slide('Substitution',
  indent('$\\Subst[\\green{\\{x/\\alice\\}}, P(x)] = P(\\alice)$').scale(0.8), pause(),
  indent(nowrapText('$\\Subst[\\green{\\{x/\\alice, y/z\\}}, P(x) \\wedge K(x,y)] = P(\\alice) \\wedge K(\\alice,z)$')).scale(0.8), pause(),
  definition('Substitution',
    'A substitution $\\green{\\theta}$ is a mapping from variables to terms.',
    '$\\Subst[\\green{\\theta}, f]$ returns the result of performing substitution $\\theta$ on $f$.',
  _),
_));

prose(
  'The first step is substitution,',
  'which applies a search-and-replace operation on a formula or term.',
  _,
  'We won\'t define $\\Subst[\\theta, f]$ formally,',
  'but from the examples, it should be clear what $\\Subst$ does.',
  _,
  'Technical note: if $\\theta$ contains variable substitutions $x/\\alice$',
  'we only apply the substitution to the free variables in $f$,',
  'which are the variables not bound by quantification',
  '(e.g., $x$ in $\\exists y \, P(x, y)$).',
  'Later, we\'ll see how CNF formulas allow us to remove all the quantifiers.',
_);

add(slide('Unification',
  ytable(
    nowrapText('$\\Unify[\\Knows(\\red{\\alice},\\blue{\\arithmetic}),\\Knows(\\red{x},\\blue{\\arithmetic})] = \\{\\red{x/\\alice}\\}$'), pause(),
    nowrapText('$\\Unify[\\Knows(\\red{\\alice},\\blue{y}),\\Knows(\\red{x}, \\blue{z})] = \\{\\red{x/\\alice},\\blue{y/z}\\}$'), pause(),
    nowrapText('$\\Unify[\\Knows(\\red{\\alice},\\blue{y}),\\Knows(\\red{\\bob},\\blue{z})] = \\text{fail}$'), pause(),
    nowrapText('$\\Unify[\\Knows(\\red{\\alice},\\blue{y}),\\Knows(\\red{x},\\blue{F(x)})] = \\{\\red{x/\\alice}, \\blue{y/F(\\alice)}\\}$'),
  _).scale(0.77).margin(10),
  pause(),
  definition('Unification',
    'Unification takes two formulas $f$ and $g$ and returns a substitution $\\theta$ which is the most general unifier:',
    indentNowrapText('$\\Unify[f, g] = \\theta$ such that $\\Subst[\\theta, f] = \\Subst[\\theta, g]$'),
    indentNowrapText('or "fail" if no such $\\theta$ exists.'),
  _),
_));

prose(
  'Substitution can be used to make two formulas identical,',
  'and unification is the way to find the least committal substitution we can find to achieve this.',
  _,
  'Unification, like substitution, can be implemented recursively.',
  'The implementation details are not the most exciting,',
  'but it\'s useful to get some intuition from the examples.',
_);

add(slide('Modus ponens',
  definition('modus ponens (first-order logic)',
    nowrapText('$\\displaystyle \\frac{\\blue{a_1\', \\dots, a_k\'} \\quad \\forall x_1 \\cdots \\forall x_n \\red{(a_1 \\wedge \\cdots \\wedge a_k) \\to b}}{\\blue{b\'}}$,'),
    pause(),
    nowrapText('Get most general unifier $\\theta$ on premises:'),
    bulletedText('$\\theta = \\Unify[\\blue{a_1\' \\wedge \\cdots \\wedge a_k\'}, \\red{a_1 \\wedge \\cdots \\wedge a_k}]$'),
    pause(),
    nowrapText('Apply $\\theta$ to conclusion:'),
    bulletedText('$\\Subst[\\theta, \\red{b}] = \\blue{b\'}$'),
  _).content.margin(10).end,
_));

prose(
  'Having defined substitution and unification,',
  'we are in position to finally define the modus ponens rule for first-order logic.',
  'Instead of performing a exact match,',
  'we instead perform a unification, which generates a substitution $\\theta$.',
  'Using $\\theta$, we can generate the conclusion $b\'$ on the fly.',
  _,
  'Note the significance here: the rule $a_1 \\wedge \\cdots \\wedge a_k \\to b$',
  'can be used in a myriad ways,',
  'but $\\Unify$ identifies the appropriate substitution, so that it can be applied to the conclusion.',
_);

add(slide('Modus ponens example',
  example('modus ponens in first-order logic',
    stmt('Premises'),
    yseq(
      indent('$\\Takes(\\alice,\\text{cs221})$'),
      indent('$\\Covers(\\text{cs221},\\text{mdp})$'),
      indent('$\\forall x \\, \\forall y \\, \\forall z \\, \\Takes(x,y) \\wedge \\Covers(y,z) \\to \\Knows(x,z)$'),
    _).scale(0.9),
    pause(),
    stmt('Conclusion'),
    yseq(
      indent('$\\theta = \\{ x/\\alice, y/\\text{cs221}, z/\\text{mdp} \\}$'),
      indent('Derive $\\Knows(\\alice, \\text{mdp})$'),
    _).scale(0.9),
  _),
_));

prose(
  'Here\'s a simple example of modus ponens in action.',
  'We bind $x,y,z$ to appropriate objects (constant symbols),',
  'which is used to generate the conclusion $\\Knows(\\alice,\\text{mdp})$.',
_);

/*add(slide('Forward/backward chaining',
  indent('$\\forall x \\, \\forall y \\, \\forall z \\, \\Takes(x,y) \\wedge \\Covers(y,z) \\to \\Knows(x,z)$'),
  'Inference algorithms analogous to those for propositional logic.', pause(),
  stmt('Forward chaining', 'starting from known atomic formulas (e.g., $\\Takes(\\alice,\\text{CS221})$), find rules whose premises unify with them, and derive conclusion.'), pause(),
  stmt('Backward chaining', 'starting from query atomic formula (e.g., $\\Knows(\\alice,\\text{MDPs})$), find rules whose conclusion unifies with it, and recursive on premises.'),
_));*/

add(slide('Complexity',
  //'Propositional logic: linear in size of knowledge base',
  parentCenter('$\\forall x \\, \\forall y \\, \\forall z \\, P(x,y,z)$'),
  bulletedText('Each application of Modus ponens produces an atomic formula.'),
  bulletedText('If no function symbols, number of atomic formulas is at most'),
  parentCenter('$(\\text{num-constant-symbols})^{\\text{(maximum-predicate-arity)}}$'),
  pause(),
  bulletedText('If there are function symbols (e.g., $F$), then infinite...'),
  parentCenter(nowrapText('$Q(a) \\quad Q(F(a)) \\quad Q(F(F(a))) \\quad Q(F(F(F(a)))) \\quad \\cdots$').scale(0.9)),
_));

prose(
  'In propositional logic, modus ponens was considered efficient,',
  'since in the worst case, we generate each propositional symbol.',
  _,
  'In first-order logic, though, we typically have many more atomic formulas in place of propositional symbols,',
  'which leads to a potentially exponentially number of atomic formulas,',
  'or worse, with function symbols, there might be an infinite set of atomic formulas.',
_);

add(slide('Complexity',
  theorem('completeness',
    'Modus ponens is complete for first-order logic with only Horn clauses.',
  _),
  pause(),
  theorem('semi-decidability',
    'First-order logic (even restricted to only Horn clauses) is <b>semi-decidable</b>.', pause(),
    bulletedText('If $\\KB \\models f$, forward inference on complete inference rules will prove $f$ in finite time.'), pause(),
    bulletedText('If $\\KB \\not\\models f$, no algorithm can show this in finite time.'),
  _),
_));

prose(
  'We can show that modus ponens is complete with respect to Horn clauses,',
  'which means that every true formula has an actual finite derivation.',
  _,
  'However, this doesn\'t mean that we can just run modus ponens and be done with it,',
  'for first-order logic even restricted to Horn clauses is semi-decidable,',
  'which means that if we a formula is entailed, then we will be able to derive it,',
  'but if it is not entailed, then we don\'t even know when to stop the algorithm &mdash; quite troubling!',
  _,
  'With propositional logic, there were a finite number of propositional symbols,',
  'but now the number of atomic formulas can be infinite (the culprit is function symbols).',
  _,
  'Though we have hit a theoretical barrier,',
  'life goes on and we can still run modus ponens inference to get a one-sided answer.',
  'Next, we will move to working with full first-order logic.',
_);

add(slide('Resolution',
  stmt('Recall', 'First-order logic includes non-Horn clauses'),
  parentCenter('$\\forall x \\, \\Student(x) \\to \\exists y \\, \\Knows(x,y)$'),
  pause(),
  headerList('High-level strategy (same as in propositional logic)',
    'Convert all formulas to CNF',
    'Repeatedly apply resolution rule',
  _),
_));

prose(
  'To go beyond Horn clauses, we will develop a single resolution rule which is sound and complete.',
  _,
  'The high-level strategy is the same as propositional logic: convert to CNF and apply resolution.',
_);

add(slide('Conversion to CNF',
  stmt('Input'),
  parentCenter('$\\forall x \\, (\\forall y \\, \\Animal(y) \\to \\Loves(x,y)) \\to \\exists y \\, \\Loves(y,x)$'),
  pause(),
  stmt('Output'),
  parentCenter(nowrapText('$(\\Animal(Y(x)) \\vee \\Loves(Z(x), x)) \\wedge (\\neg \\Loves(x,Y(x)) \\vee \\Loves(Z(x), x))$').scale(0.72)),
  pause(),
  headerList('New to first-order logic',
    'All variables (e.g., $x$) have universal quantifiers by default', pause(),
    'Introduce <font color="red"><b>Skolem functions</b></font> (e.g., $Y(x)$) to represent existential quantified variables',
  _),
  /*headerList('Steps',
    'Eliminate implications, move $\\neg\\,$ inwards <font color="green">(same as propositional logic)</font>', pause(),
    'Standardize variables, remove existential quantifiers (Skolemization), remove universal quantifiers <font color="red">(new to first-order logic)</font>', pause(),
    'Distribute $\\vee$ over $\\wedge$ <font color="green">(same as propositional logic)</font>', pause(),
  _),*/
  /*headerList('Operations',
    bulletedText('Canonicalize connectives to $\\wedge, \\vee, \\neg$ <font color="green">(same as propositional logic)</font>').noWrap(), pause(),
    bulletedText('Standardize variables, remove quantifiers <font color="red">(new to first-order logic)</font>').noWrap(),
  _).ymargin(0).scale(0.95),*/
_));

prose(
  'Consider the logical formula corresponding to <i>Everyone who loves all animals is loved by someone</i>.',
  'The slide shows the desired output, which looks like a CNF formula in propositional logic,',
  'but there are two differences: there are variables (e.g., $x$) and functions of variables (e.g., $Y(x)$).',
  'The variables are assumed to be universally quantified over,',
  'and the functions are called <b>Skolem functions</b> and stand for a property of the variable.',
_);

add(slide('Conversion to CNF (part 1)',
  parentCenter(greenitalics('Anyone who likes all animals is liked by someone.')),
  pause(),
  let(s = 1),
  nowrapText(stmt('Input')).scale(s),
  nowrapText('$\\forall x \\, (\\forall y \\, \\Animal(y) \\to \\Loves(x,y)) \\to \\exists y \\, \\Loves(y,x)$').scale(s),
  pause(),

  nowrapText(stmt('Eliminate implications (old)')).scale(s),
  stagger(
    nowrapText('$\\forall x \\, \\neg (\\forall y \\, \\Animal(y) \\to \\Loves(x,y)) \\vee \\exists y \\, \\Loves(y, x)$').scale(s),
    nowrapText('$\\forall x \\, \\neg (\\forall y \\, \\neg \\Animal(y) \\vee \\Loves(x,y)) \\vee \\exists y \\, \\Loves(y, x)$').scale(s),
  _),
  pause(),

  nowrapText(stmt('Push $\\neg\\,$ inwards, eliminate double negation (old)')).scale(s),
  nowrapText('$\\forall x \\, (\\exists y \\, \\Animal(y) \\wedge \\neg \\Loves(x,y)) \\vee \\exists y \\, \\Loves(y, x)$').scale(s),
  pause(),

  nowrapText(stmt('Standardize variables (<b>new</b>)')).scale(s),
  nowrapText('$\\forall x \\, (\\exists y \\, \\Animal(y) \\wedge \\neg \\Loves(x,y)) \\vee \\exists z \\, \\Loves(z, x)$').scale(s),
_));

prose(
  'We start by eliminating implications, pushing negation inside, and eliminating double negation,',
  'which is all old.',
  _,
  'The first thing new to first-order logic is standardization of variables.',
  'Note that in $\\exists x \\, P(x) \\wedge \\exists x \\, Q(x)$,',
  'there are two instances of $x$ whose scopes don\'t overlap.',
  'To make this clearer, we will convert this into $\\exists x \\, P(x) \\wedge \\exists y \\, Q(y)$.',
  'This sets the stage for when we will drop the quantifiers on the variables.',
_);

add(slide('Conversion to CNF (part 2)',
  nowrapText('$\\forall x \\, (\\exists y \\, \\Animal(y) \\wedge \\neg \\Loves(x,y)) \\vee \\exists z \\, \\Loves(z, x)$').scale(s),
  pause(),
  text(stmt('Replace existentially quantified variables with Skolem functions (<b>new</b>)')).scale(s),
  nowrapText('$\\forall x \\, [\\Animal(Y(x)) \\wedge \\neg \\Loves(x,Y(x))] \\vee \\, \\Loves(Z(x), x)$').scale(0.9),
  pause(),

  nowrapText(stmt('Distribute $\\vee$ over $\\wedge$ (old)')).scale(s),
  nowrapText('$\\forall x \\, [\\Animal(Y(x)) \\vee \\Loves(Z(x), x)] \\wedge [\\neg \\Loves(x,Y(x)) \\vee \\Loves(Z(x), x)]$').scale(0.7),
  pause(),

  nowrapText(stmt('Remove universal quantifiers (<b>new</b>)')).scale(s),
  nowrapText('$[\\Animal(Y(x)) \\vee \\Loves(Z(x), x)] \\wedge [\\neg \\Loves(x,Y(x)) \\vee \\Loves(Z(x), x)]$').scale(0.7),
  //pause(),
  //text(red('Interpretation')+': $Y(x)$ represents animal that $x$ doesn\'t love, $Z(x)$ represents one who loves $x$'),
_));

prose(
  'The next step is to remove existential variables by replacing them with Skolem functions.',
  'This is perhaps the most non-trivial part of the process.',
  'Consider the formula: $\\forall x \\, \\exists y \\, P(x, y)$.',
  'Here, $y$ is existentially quantified and depends on $x$.',
  'So we can mark this dependence explicitly by setting $y = Y(x)$.',
  'Then the formula becomes $\\forall x \\, P(x, Y(x))$.',
  'You can even think of the function $Y$ as being existentially quantified over outside the $\\forall x$.',
  _,
  'Next, we distribute disjunction over conjunction as before.',
  _,
  'Finally, we simply drop all universal quantifiers.',
  'Because those are the only quantifiers left, there is no ambiguity.',
  _,
  'The final CNF formula can be difficult to interpret, but we can be assured that the final formula',
  'captures exactly the same information as the original formula.',
_);

add(slide('Resolution',
  definition('resolution rule (first-order logic)',
    nowrapText('$\\displaystyle \\frac{f_1 \\vee \\cdots \\vee f_n \\vee \\red{p}, \\quad \\red{\\neg q} \\vee g_1 \\vee \\cdots \\vee g_m}{\\Subst[\\theta, f_1 \\vee \\cdots \\vee f_n \\vee g_1 \\vee \\cdots \\vee g_m]}$'),
    nowrapText('where $\\theta = \\Unify[p, q]$.'),
  _),
  pause(),
  example('resolution',
    parentCenter(nowrapText('$\\displaystyle \\frac{\\Animal(Y(x)) \\vee \\Loves(Z(x),x), \\quad \\neg \\Loves(u,v) \\vee \\Feeds(u,v)}{\\Animal(Y(x)) \\vee \\Feeds(Z(x),x)}$').scale(0.8)),
    'Substitution: $\\theta = \\{ u / Z(x), v / x \\}$.',
  _),
_));

prose(
  'After convering all formulas to CNF, then we can apply the resolution rule,',
  'which is generalized to first-order logic.',
  'This means that instead of doing exact matching of a literal $p$,',
  'we unify atomic formulas $p$ and $q$, and then apply the resulting substitution $\\theta$ on the conclusion.',
_);

add(summarySlide('Summary',
  parentCenter(table(
    [bluebold('Propositional logic'), nil(), redbold('First-order logic')], pause(),
    ['model checking', nil(), 'n/a'], pause(),
    [nil(), '$\\Leftarrow$ propositionalization', nil()], pause(),
    [ytable('modus ponens', '(Horn clauses)'), nil(), ytable('modus ponens++', '(Horn clauses)')], pause(),
    [ytable('resolution', '(general)'), nil(), ytable('resolution++', '(general)')], pause(),
  _).ymargin(10)),
  parentCenter('++: unification and substitution'),
  pause(),
  keyIdea('variables in first-order logic',
    nowrapText('Variables yield compact knowledge representations.'),
  _),
_));

prose(
  'To summarize, we have presented propositional logic and first-order logic.',
  'When there is a one-to-one mapping between constant symbols and objects,',
  'we can propositionalize, thereby converting first-order logic into propositional logic.',
  'This is needed if we want to use model checking to do inference.',
  _,
  'For inference based on syntactic derivations,',
  'there is a neat parallel between using modus ponens for Horn clauses and',
  'resolution for general formulas (after conversion to CNF).',
  'In the first-order logic case, things are more complex because we have to use unification and substitution',
  'to do matching of formulas.',
  _,
  'The main idea in first-order logic is the use of variables',
  '(not to be confused with the variables in variable-based models, which are mere propositional symbols from the point of view of logic),',
  'coupled with quantifiers.',
  _,
  'Propositional formulas allow us to express large complex sets of models compactly using a small piece of propositional syntax.',
  'Variables in first-order logic in essence takes this idea one more step forward,',
  'allowing us to effectively express large complex propositional formulas compactly using a small piece of first-order syntax.',
  _,
  'Note that variables in first-order logic are not same as the variables in variable-based models (CSPs).',
  'CSPs variables correspond to atomic formula and denote truth values.',
  'First-order logic variables denote objects.',
_);

sfig.initialize();
