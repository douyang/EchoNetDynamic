G = sfig.serverSide ? global : this;
G.prez = presentation();

add(titleSlide('Lecture 16: Logic I',
  nil(),
  parentCenter(image('images/escher-hands.jpg')),
_));

add(quizSlide('logic1-start',
  'If $X_1 + X_2 = 10$ and $X_1 - X_2 = 4$, what is $X_1$?',
_));

prose(
  'Think about how you solved this problem.',
  'You could treat it as a CSP with variables $X_1$ and $X_2$,',
  'and search through the set of candidate solutions, checking the constraints.',
  _,
  'However, more likely, you just added the two equations, divided both sides by $2$',
  'to easily find out that $X_1 = 7$.',
  'This is the power of <b>logical inference</b>, where we apply a set of truth-preserving rules',
  'to arrive at the answer.',
  'This is in contrast to what is called <b>model checking</b> (for reasons that will be come clear),',
  'which tries to directly find assignments.',
  _,
  'We\'ll see that logical inference allows you to perform very powerful manipulations in a very compact way.',
  'This allows us to vastly increase the representational power of our models.',
_);

evolutionOfModels(9, 'Logic');

prose(
  'We are at the last stage of our journey through the AI topics of this course: logic.',
  'Before launching in, let\'s take a moment to reflect.',
_);

add(slide('Taking a step back',
  parentCenter(xtable(
    'data', thickRightArrow(),
    frameBox(bluebold('Learning')), thickRightArrow(),
    'model'.fontcolor('red'),
    pause(), thickRightArrow(),
    yseq(
      'query', thickDownArrow(), frameBox(bluebold('Inference')),
      thickDownArrow(), 'prediction',
    _).center(),
  _).margin(20).center()),
  pause(),
  stmt('Examples: search problems, MDPs, games, factor graphs, Bayesian networks'),
  pause(),
  //'A <font color="red">model</font> describes how the world works (relevant to some task)',
  parentCenter('What type of models to use?'),
_));

prose(
  'For each topic (e.g., MDPs) that we\'ve studied, we have adopted the following paradigm:',
  'We take some data, feed it into a learning algorithm to produce a model with fitted parameters.',
  'Then we take this model and use it to make inferences (turning input queries into output predictions).',
  _,
  'For search problems, the query is "what is the minimum cost path?"',
  'Inference algorithms such as DFS, UCS or A* produced the minimum cost path.',
  'Learning algorithms such as the structured Perceptron filled in the action costs based on data (minimum cost paths).',
  _,
  'For MDPs and games, the query is "what is the maximum value policy?"',
  'Inference algorithms such as value iteration or minimax produced this.',
  'Learning algorithms such as Q-learning or TD learning allow you to work when we don\'t know the transitions and rewards.',
  _,
  'For CSPs, the query is "what is the maximum weight assignment?"',
  'Inference algorithms such as backtracking search, beam search, or variable elimination find such an assignment.',
  'We did not discuss learning algorithms here, but something similar to the structured Perceptron works.',
  _,
  'For Bayesian networks, the query is "what is the probability of a query given evidence?"',
  'Inference algorithms such as Gibbs sampling and particle filtering compute these probabilistic inference queries.',
  'Learning If we don\'t know the local conditional distributions, we can learn them using maximum likelihood.',
  _,
  'We can think of learning as induction, where we need to generalize,',
  'and inference as deduction, where it\'s about computing the best prediction under the model',
_);

add(slide('Some modeling paradigms',
  stmt('State-based models', 'search problems, MDPs, games'),
  ytable(
    indent('Applications: route finding, game playing, etc.'),
    indent('Think in terms of <b>states, actions, and costs</b>'.italics()),
  _),
  pause(),
  stmt('Variable-based models', 'CSPs, Bayesian networks'),
  ytable(
    indent('Applications: scheduling, tracking, medical diagnosis, etc.'),
    indent('Think in terms of <b>variables and factors</b>'.italics()),
  _),
  pause(),
  stmt('Logic-based models'.bold(), 'propositional logic, first-order logic'),
  ytable(
    indent('Applications: theorem proving, verification, reasoning'),
    indent('Think in terms of <b>logical formulas and inference rules</b>'.italics()),
  _),
_));

prose(
  'Each topic corresponded to a modeling paradigm.',
  'The way the modeling paradigm is setup influences the way we approach a problem.',
  _,
  'In state-based models, we thought about inference as finding minimum cost paths in a graph.',
  'This leads us to think in terms of states, actions, and costs.',
  _,
  'In variable-based models, we thought about inference as',
  'finding maximum weight assignments or computing conditional probabilities.',
  'There we thought about variables and factors.',
  _,
  'Now, we will talk about logic-based models,',
  'where inference is applying a set of rules.',
  'For these models, we will think in terms of logical formulas and inference rules.',
_);

add(slide('A historical note',
  bulletedText('Logic was dominant paradigm in AI before 1990s'),
  parentCenter(image('images/lunar-code.png').width(150)),
  pause(),
  bulletedText(stmt('Problem 1: deterministic, didn\'t handle '+redbold('uncertainty')+' (probability addresses this)')),
  bulletedText(stmt('Problem 2: rule-based, didn\'t allow fine tuning from '+redbold('data')+' (machine learning addresses this)')),
  pause(),
  bulletedText(stmt('Strength: provides '+greenbold('expressiveness')+' in a compact way')),
_));

prose(
  'Historically, in AI, logic was the dominant paradigm before the 1990s,',
  'but this tradition fell out of favor with the rise of probability and machine learning.',
  _,
  'There were two reasons for this:',
  'First, logic as an inference mechanism was brittle and did not handle uncertainty,',
  'whereas probability offered a coherent framework for dealing with uncertainty.',
  _,
  'Second, people built rule-based systems which were tedious and did not scale up, whereas machine learning',
  'automated much of the fine-tuning of a system by using data.',
  _,
  'However, there is one strength of logic which has not quite yet been recouped by existing',
  'probability and machine learning methods, and that is expressivity of the model.',
_);

add(slide('Motivation: smart personal assistant',
  parentCenter(image('images/lounge.jpg')),
  pause(),
  parentCenter(stagger(
    image('images/siri.png').height(180),
    image('images/data-star-trek.jpg').height(180),
  _).center()),
_));

prose(
  'How can we motivate logic-based models?',
  'We will take a little bit of a detour and think about an AI grand challenge:',
  'building smart personal assistants.',
  _,
  'Today, we have systems like Apple\'s Siri, Microsoft Cortana, Amazon Echo, and Google Now.',
_);

add(slide('Motivation: smart personal assistant',
  parentCenter(xtable(
    pause(),
    ytable( 
      '<b>Tell</b> information',
      bigRightArrow(200),
    _),
    pause(-1),
    image('images/data-star-trek.jpg').height(180),
    pause(2),
    ytable( 
      '<b>Ask</b> questions',
      bigLeftArrow(200),
    _),
  _).center().margin(30)),
  pause(),
  parentCenter(redbold('Use natural language!')),
  parentCenter('[demo: <tt>python nli.py</tt>]'),
  pause(),
  headerList('Need to',
    'Digest <b>heterogenous</b> information',
    'Reason <b>deeply</b> with that information',
  _),
_));

prose(
  'We would like to have more intelligent assistants such as Data from Star Trek.',
  'What is the functionality that\'s missing in between?',
  _,
  'At an abstract level, one fundamental thing a good personal assistant',
  'should be able to do is to take in information from people',
  'and be able to answer questions that require drawing inferences from the facts.',
  _,
  'In some sense, telling the system information is like machine learning,',
  'but it feels like a very different form of learning than seeing 10M images',
  'and their labels or 10M sentences and their translations.',
  'The type of information we get here is both more heterogenous, more abstract,',
  'and the expectation is that we process it more deeply',
  '(we don\'t want to have to tell our personal assistant 100 times that we prefer morning meetings).',
  _,
  'And how do we interact with our personal assistants?',
  'Let\'s use natural language, the very tool that was built for communication!',
_);

add(slide('Natural language',
  headerList('Example',
    'A <b>dime</b> is better than a <b>nickel</b>.', pause(),
    'A <b>nickel</b> is better than a <b>penny</b>.', pause(),
    'Therefore, a <b>dime</b> is better than a <b>penny</b>.', pause(),
  _),
  //stmt('General rule (transitivity)'),
  //parentCenter('If $A > B$ and $B > C$, then $A > C$.'),
  //pause(),

  headerList('Example',
    'A <b>penny</b> is better than <b>nothing</b>.', pause(),
    '<b>Nothing</b> is better than <b>world peace</b>.', pause(),
    'Therefore, a <b>penny</b> is better than <b>world peace</b>???', pause(),
  _),
  parentCenter(red('Natural language is slippery...')),
_).leftHeader(image('images/penny.png').width(150)));

prose(
  'But natural language is tricky, because it is replete with ambiguities and vagueness.',
  'And drawing inferences using natural languages can be quite slippery.',
  'Of course, some concepts are genuinely vague and slippery,',
  'and natural language is as good as it gets, but that still leaves open the question of how a computer would handle those cases.',
_);

add(slide('Language',
  parentCenter('<b>Language</b> is a mechanism for expression.'.italics()), pause(),
  //parentCenter('<b>Language</b> is a mechanism for expressing models/knowledge/ideas.'.italics()), pause(),
  stmt('Natural languages (informal)'),
  indent(table(
    [stmt('English'), 'Two divides even numbers.'.italics()],
    [stmt('German'), 'Zwei dividieren geraden zahlen.'.italics()],
  _).xmargin(20)),
  pause(),
  stmt('Programming languages (formal)'),
  indent(table(
    [stmt('Python'), text('<tt>def even(x): return x % 2 == 0</tt>').fontSize(20)],
    [stmt('C++'), text('<tt>bool even(int x) { return x % 2 == 0; }</tt>').fontSize(20)],
  _).xmargin(20).yjustify('c')),
  pause(),
  stmt(bold('Logical languages (formal)')),
  indent(table(
    [stmt('First-order-logic'), '$\\red{\\forall x . \\text{Even}(x) \\to \\text{Divides}(x, 2)}$'],
  _).xmargin(20).yjustify('c')),
_));

prose(
  'Let\'s think about language a bit deeply.  What does it really buy you?',
  'Primarily, language is this wonderful human creation that allows us to',
  'express and communicate complex ideas and thoughts.',
  _,
  'We have mostly been talking about natural languages such as English and German.',
  'But as you all know, there are programming languages as well,',
  'which allow one to express computation formally so that a computer can understand it.',
  _,
  'This lecture is mostly about logical languages such as propositional logic and first-order logic.',
  'These are formal languages, but are a more suitable way of capturing declarative knowledge rather than concrete procedures,',
  'and are better connected with natural language.',
_);

/*add(dividerSlide(stmt('Desiderata', 'want a language than can <b>represent</b> complex facts about the world and allows for sophisticated <b>reasoning</b> about those facts...')));

add(slide('Procedural programming languages',
  '<b>Procedural</b> languages represent knowledge using data structures, algorithms manipulates data structures.',
  parentCenter(yseq(
    text('<tt>def f(positions):</tt>').fontSize(20),
    text('<tt>&nbsp;&nbsp;distances = [dist(pos, me) for pos in positions]</tt>').fontSize(20),
    text('<tt>&nbsp;&nbsp;minDistance = min(distances)</tt>').fontSize(20),
    text('<tt>&nbsp;&nbsp;return minDistance</tt>').fontSize(20),
  _)),
  pause(),
  stmt('Easy query', 'Given <tt>positions</tt>, what is <tt>minDistance</tt>?'),
  pause(),
  stmt('Hard query',
    'Given <tt>minDistance</tt>, what are <tt>positions</tt>?',
  _),
  pause(),
  'Need a <b>declarative</b> language ($\\P(\\text{positions} \\mid \\text{minDistance})$)',
_));*/

/*add(slide('Variable-based models',
  '<b>Variable-based models</b> are a declarative language: define factors over variables; ask any query over variables.',
  pause(),

  stmt('Implicit representation'),
  indent(ytable(
    'All students work hard.', pause(),
    'John is a student.', pause(),
    'Therefore, John works hard.',
  _)).scale(0.8),
  'Variable-based models would explicitly represent all the students &mdash; intuitively shouldn\'t be necessary.',
  pause(),

  stmt('Higher-order reasoning'),
  indent(ytable(
    'John believes <i>it will rain</i>.', pause(),
    'Will it rain?', pause(),
    'Does John believe <i>it will not rain</i> (assuming John is logical)?',
  _)).scale(0.8),
  pause(),
  'Need something more expressive to represent...',
_));*/

/*add(slide('A puzzle',
  'If John likes probability, then John likes logic.',
  'If it is Thursday, then John likes probability or John likes logic.',
  'It is Thursday.',
  pause(),
  'Does John like probability?'.italics(), pause(),
  'Does John like logic?'.italics(),
_));*/

add(slide('Two goals of a logic language',
  bulletedText(redbold('Represent')+' knowledge about the world'),
  parentCenter(image('images/globe.jpg').width(150)),
  pause(),
  bulletedText(redbold('Reason')+' with that knowledge'),
  parentCenter(image('images/robot-thinker.jpg').width(100)),
_));

prose(
  'Some of you already know about logic,',
  'but it\'s important to keep the AI goal in mind:',
  'We want to use it to represent knowledge, and we want to be able to reason',
  '(or do inference) with that knowledge.',
  _,
  'Finally, we need to keep in mind that our goal is get computers to use logic automatically,',
  'not for you to do it.',
  'This means that we need to think very mechanistically.',
_);

////////////////////////////////////////////////////////////
add(slide('Ingredients of a logic',
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

prose(
  'The <b>syntax</b> defines a set of valid formulas, which are things which are grammatical to say in the language.',
  _,
  '<b>Semantics</b> usually doesn\'t receive much attention if you have a casual exposure to logic,',
  'but this is really the important piece that makes logic rigorous.',
  'Formally, semantics specifies the meaning of a formula,',
  'which in our setting is a set of configurations of the world in which the formula holds.',
  'This is what we care about in the end.',
  _,
  'But in order to get there, it\'s helpful to operate directly on the syntax using a set of <b>inference rules</b>.',
  'For example, if I tell you that it\'s raining and wet, then you should be able to conclude',
  'that it is also raining (obviously) without even explicitly mentioning semantics.',
  'Most of the time when people do logic casually, they are really just applying inference rules.',
_);

add(slide('Syntax versus semantics',
  stmt('Syntax', 'what are valid expressions in the language?'),
  stmt('Semantics', 'what do these expressions mean?'), pause(),
  'Different syntax, same semantics (5):',
  parentCenter(xtable('<tt>2 + 3</tt>', '$\\Leftrightarrow$', '<tt>3 + 2</tt>').margin(20).center()),
  pause(),
  'Same syntax, different semantics (1 versus 1.5):',
  parentCenter(xtable('<tt>3 / 2</tt> (Python 2.7)', '$\\not\\Leftrightarrow$', '<tt>3 / 2</tt> (Python 3)').margin(20).center()),
_));

prose(
  'Just to hammer in the point that syntax and semantics are different, consider',
  'two examples from programming languages.',
  _,
  'First, the formula <tt>2 + 3</tt> and <tt>3 + 2</tt> are superficially different (a syntactic notion),',
  'but they have the same semantics (5).',
  _,
  'Second, the formula <tt>3 / 2</tt> means something different depending on which language.',
  'In Python 2.7, the semantics is 1 (integer division), and in Python 3 the semantics is 1.5 (floating point division).',
_);

add(slide('Logics',
  bulletedText(bold('Propositional logic with only Horn clauses')),
  bulletedText(bold('Propositional logic')),
  bulletedText('Modal logic'),
  bulletedText(bold('First-order logic with only Horn clauses')),
  bulletedText(bold('First-order logic')),
  bulletedText('Second-order logic'),
  bulletedText('...'), pause(),
  keyIdea('tradeoff',
    'Balance <b>expressivity</b> and <b>computational efficiency</b>.',
  _),
_));

prose(
  'There are many different logical languages, just like there are programming languages.',
  'Whereas most programming languages have the expressive power (all Turing complete),',
  'logical languages exhibit a larger spectrum of expressivity.',
  _,
  'The bolded items are the ones we will discuss in this class.',
_);

////////////////////////////////////////////////////////////
add(slide('Propositional logic',
  logicSchema('Syntax'),
_));

prose(
  'We begin with the syntax of propositional logic: what are the allowable formulas?',
_);

add(slide('Syntax of propositional logic',
  headerList('Propositional symbols (atomic formulas): $A, B, C$'), pause(),
  stmt('Logical connectives', '$\\neg, \\wedge, \\vee, \\to, \\leftrightarrow$'), pause(),
  headerList('Build up formulas recursively&mdash;if $f$ and $g$ are formulas, so are the following',
    'Negation: $\\neg f$',
    'Conjunction: $f \\wedge g$',
    'Disjunction: $f \\vee g$',
    'Implication: $f \\to g$',
    'Biconditional: $f \\leftrightarrow g$',
  _),
_));

prose(
  'The building blocks of the syntax are the propositional symbols and connectives.',
  'The set of propositional symbols can be anything (e.g., $A, \\Wet$, etc.),',
  'but the set of connectives is fixed to these five.',
  _,
  'All the propositional symbols are <b>atomic formulas</b> (also called atoms).',
  'We can <b>recursively</b> create larger formulas by combining smaller formulas using connectives.',
_);

add(slide('Syntax of propositional logic',
  headerList(null,
    stmt('Formula', '$A$'), pause(),
    stmt('Formula', '$\\neg A$'), pause(),
    stmt('Formula', '$\\neg B \\to C$'), pause(),
    stmt('Formula', '$\\neg A \\wedge (\\neg B \\to C) \\vee (\\neg B \\vee D)$'), pause(),
    stmt('Formula', '$\\neg \\neg A$'), pause(),
    stmt('Non-formula', '$A \\neg B$'), pause(),
    stmt('Non-formula', '$A + B$'),
  _).margin(20),
_));

prose(
  'Here are some examples of valid and invalid propositional formulas.',
_);

add(slide('Syntax of propositional logic',
  keyIdea('syntax provides symbols',
    'Formulas by themselves are just symbols (syntax).',
    'No meaning yet (semantics)!',
  _),
  parentCenter(image('images/masonic-cipher.png').width(250)),
  //pause(),
  //stmt('Note: symbols are suggestive, but pay attention when they\'re in a formula or not'),
_));

prose(
  'It\'s important to remember that whenever we talk about syntax, we\'re just talking about symbols;',
  'we\'re not actually talking about what they mean &mdash; that\'s the role of semantics.',
  'Of course it will be difficult to ignore the semantics for propositional logic',
  'completely because you already have a working',
  'knowledge of what the symbols mean.',
_);

////////////////////////////////////////////////////////////
add(slide('Propositional logic',
  logicSchema('Semantics'),
_));

prose(
  'Having defined the syntax of propositional logic, let\'s talk about their semantics or meaning.',
_);

add(slide('Model',
  definition('model',
    'A <b>model</b> $\\blue{w}$ in propositional logic is an <b>assignment</b> of truth values to propositional symbols.',
  _),
  pause(),
  stmt('Example'),
  bulletedText('3 propositional symbols: $A, B, C$'), pause(),
  bulletedText('$2^3 = 8$ possible models $\\blue{w}$:'),
  parentCenter(ytable(
    '$\\{ A:0, B:0, C:0 \\}$',
    '$\\{ A:0, B:0, C:1 \\}$',
    '$\\{ A:0, B:1, C:0 \\}$',
    '$\\{ A:0, B:1, C:1 \\}$',
    '$\\{ A:1, B:0, C:0 \\}$',
    '$\\{ A:1, B:0, C:1 \\}$',
    '$\\{ A:1, B:1, C:0 \\}$',
    '$\\{ A:1, B:1, C:1 \\}$',
  _).scale(0.55)),
_));

prose(
  'In logic, the word <b>model</b> has a special meaning, quite distinct from the way we\'ve been using it in the class (quite an unfortunate collision).',
  'A model (in the logical sense) represents a possible state of affairs in the world.',
  'In propositional logic, this is an assignment that specifies a truth value (true or false) for each propositional symbol.',
_);

G.formulaModel = function(mode) {
  return overlay(
    xtable(
      f = formulaSchema(),
      overlay(
        rect(200, 150).strokeWidth(4).round(10),
        mode >= 1 ? (m = circle(5).color('blue')) : _,
        mode >= 2 ? (m = ellipse(50, 30).strokeWidth(2).fillColor('lightblue')) : _,
      _).center(),
    _).center().margin(50),
    mode >= 1 ? line(f, m).dashed().strokeWidth(2).color('brown') : _,
    mode >= 2 ? arrow(f, m).strokeWidth(2).color('brown') : _,
    moveTopOf('$f$', f).scale(0.8),
    mode == 1 ? moveTopOf('$w$', m).scale(0.8) : _,
    mode == 2 ? moveTopOf('$\\sM(f)$', m).scale(0.8) : _,
  _);
}

add(slide('Interpretation function',
  definition('interpretation function',
    'Let $\\red{f}$ be a formula.',
    'Let $\\blue{w}$ be a model.',
    pause(),
    'An <b>interpretation function</b> $\\brown{\\sI(f, w)}$ returns:',
    bulletedText('true (1) (say that $\\blue{w}$ satisfies $\\red{f}$)'),
    bulletedText('false (0) (say that $\\blue{w}$ does not satisfy $\\red{f}$)'),
  _),
  pause(),
  parentCenter(formulaModel(1)),
_));

prose(
  'The semantics is given by an <b>interpretation function</b>,',
  'which takes a formula $f$ and a model $w$, and returns whether $w$ satisfies $f$.',
  'In other words, is $f$ true in $w$?',
  _,
  'For example, if $f$ represents "it is Wednesday" and $w$ corresponds to right now,',
  'then $\\sI(f, w) = 1$.  If $w$ corresponded to yesterday, then $\\sI(f, w) = 0$.',
_);

add(slide('Interpretation function: definition',
  stmt('Base case'),
  bulletedText('For a propositional symbol $p$ (e.g., $A, B, C$): $\\sI(\\red{p}, w) = w(p)$'), pause(),
  stmt('Recursive case'),
  bulletedText('For any two formulas $\\green{f}$ and $\\green{g}$, define:'),
  parentCenter(frameBox(table(
    ['$\\sI(\\green{f}, w)$', '$\\sI(\\green{g}, w)$', nil(), '$\\sI(\\red{\\neg f}, w)$', '$\\sI(\\red{f \\wedge g}, w)$', '$\\sI(\\red{f \\vee g}, w)$', '$\\sI(\\red{f \\to g}, w)$', '$\\sI(\\red{f \\leftrightarrow g}, w)$'],
    [0, 0, nil(), 1, 0, 0, 1, 1],
    [0, 1, nil(), 1, 0, 1, 1, 0],
    [1, 0, nil(), 0, 0, 1, 0, 0],
    [1, 1, nil(), 0, 1, 1, 1, 1],
  _).scale(0.6).xmargin(25).center())),
_));

prose(
  'The interpretation function is defined recursively,',
  'where the cases neatly parallel the definition of the syntax.',
  _,
  'Formally, for propositional logic, the interpretation function is fully defined as follows.',
  'In the base case, the interpretation of a propositional symbol $p$ is just gotten by looking $p$ up in the model $w$.',
  'For every possible value of $(\\sI(f, w), \\sI(g, w))$, we specify the interpretation of the combination of $f$ and $g$.',
_);

var T = rootedTree;
add(slide('Interpretation function: example',
  example('interpretation function',
    stmt('Formula', '$f = \\red{(\\neg A \\wedge B) \\leftrightarrow C}$'),
    stmt('Model', '$w = \\{ A: 1, B: 1, C: 0 \\}$'),
    pause(),
    stmt('Interpretation'),
    parentCenter(T('$\\sI(\\red{(\\neg A \\wedge B) \\leftrightarrow C}, w) = 1$',
      T('$\\sI(\\red{\\neg A \\wedge B}, w) = 0$',
        T('$\\sI(\\red{\\neg A}, w) = 0$', '$\\sI(\\red{A}, w) = 1$'),
        '$\\sI(\\red{B}, w) = 1$',
      _),
      '$\\sI(\\red{C}, w) = 0$',
    _)),
  _).scale(0.95),
_));

prose(
  'For example, given the formula, we break down the formula into parts,',
  'recursively compute the truth value of the parts,',
  'and then finally combines these truth values based on the connective.',
_);

add(slide('Formula represents a set of models',
  stmt('So far: each formula $f$ and model $w$ has an interpretation $\\sI(f, w) \\in \\{0, 1\\}$'),
  pause(),
  definition('models',
    'Let $\\sM(f)$ be the set of <b>models</b> $w$ for which $\\sI(f, w) = 1$.',
  _),
  parentCenter(formulaModel(2)),
_));

prose(
  'So far, we\'ve focused on relating a single model.',
  'A more useful but equivalent way to think about semantics is to think about the formula $\\sM(f)$',
  'as <b>a set of models</b> &mdash; those for which $\\sI(f, w) = 1$.',
_);

add(slide('Models: example',
  redbold('Formula:'),
  //parentCenter('$f = (A \\wedge B) \\leftrightarrow C$'),
  parentCenter('$f = \\Rain \\vee \\Wet$'),
  pause(),
  bluebold('Models:'),
  /*parentCenter(xtable('$\\sM(f) = $', ytable(
    '$\\{ A: 0, B: 0, C: 0 \\}$',
    '$\\{ A: 1, B: 0, C: 0 \\}$',
    '$\\{ A: 0, B: 1, C: 0 \\}$',
    '$\\{ A: 1, B: 1, C: 1 \\}$',
  _).scale(0.8)).center().margin(5)),*/
  pause(),
  parentCenter(xtable(
    '$\\sM(f) =$',
    rainWet('red', 0, 1, 1, 1),
  _).center().margin(80, 10)),
  keyIdea('compact representation',
    'A '+redbold('formula')+' <i>compactly</i> represents a set of '+bluebold('models')+'.',
  _), //Think of formula as putting constraints on the world.'),
_));

prose(
  'In this example, there are four models for which the formula holds, as one can easily verify.',
  'From the point of view of $\\sM$, a formula\'s main job is to define a set of models.',
  _,
  'Recall that a model is a possible configuration of the world.',
  'So a formula like "it is raining" will pick out all the hypothetical configurations of the world',
  'where it\'s raining; in some of these configurations, it will be Wednesday; in others, it won\'t.',
_);

add(slide('Knowledge base',
  definition('Knowledge base',
    'A <b>knowledge base</b> $\\KB$ is a set of formulas representing their conjunction / intersection:', pause(),
    parentCenter('$\\displaystyle \\sM(\\KB) = \\bigcap_{f \\in \\KB} \\sM(f)$.'),
    stmt('Intuition: $\\small{\\KB}$ specifies constraints on the world. $\\small{\\sM(\\KB)}$ is the set of all worlds satisfying those constraints.'),
  _),
  pause(-1),
  'Let $\\KB = \\{ \\pr{Rain} \\vee \\pr{Snow}, \\pr{Traffic} \\}$.',
  pause(),
  parentCenter(overlay(
    e1 = ellipse(100, 50).strokeWidth(2).fillColor('green').fillOpacity(0.5),
    e2 = ellipse(100, 50).shift(80, 0).strokeWidth(2).fillColor('red').fillOpacity(0.5),
    moveLeftOf('$\\sM(\\pr{Rain} \\vee \\pr{Snow})$', e1),
    moveRightOf('$\\sM(\\pr{Traffic})$', e2),
    center('$\\sM(\\KB)$').shift(40, 0),
  _)),
_));

prose(
  'If you take a set of formulas, you get a <b>knowledge base</b>.',
  'Each knowledge base defines a set of models &mdash; exactly those which are satisfiable by',
  'all the formulas in the knowledge base.',
  _,
  'Think of each formula as a fact that you know,',
  'and the <b>knowledge</b> is just the collection of those facts.',
  'Each fact narrows down the space of possible models,',
  'so the more facts you have, the fewer models you have.',
_);

add(slide('Knowledge base: example',
  parentCenter(table(
    ['$\\sM(\\Rain)$', '$\\sM(\\Rain \\to \\Wet)$'],
    [
      rainWet('red', 0, 0, 1, 1),
      rainWet('red', 1, 1, 0, 1),
    ],
  _).center().margin(80, 10)),
  pause(),
  stmt('Intersection'),
  parentCenter(ytable(
    '$\\sM(\\{ \\Rain, \\Rain \\to \\Wet \\})$',
    rainWet('red', 0, 0, 0, 2),
  _).center().margin(10)),
_));

prose(
  'As a concrete example, consider the two formulas $\\Rain$ and $\\Rain \\to \\Wet$.',
  'If you know both of these facts, then the set of models is constrained to those',
  'where it is raining and wet.',
_);

add(slide('Adding to the knowledge base',
  stmt('Adding more formulas to the knowledge base'),
  parentCenter(xtable('$\\KB$', bigRightArrow(100), '$\\KB \\cup \\{ f \\}$').margin(50).center()),
  pause(),
    stmt('Shrinks the set of models'),
  parentCenter(xtable('$\\sM(\\KB)$', bigRightArrow(100), '$\\sM(\\KB) \\cap \\sM(f)$').margin(50).center()),
  pause(),
  parentCenter(greenbold('How much does $\\sM(\\KB)$ shrink?')),
  //stmt('Note', 'conjunction: $\\sM(\\{f,g,h\\}) = \\sM(\\{f \\wedge g \\wedge g\\})$'),
  parentCenter('[whiteboard]'),
_));

prose(
  'We should think about a knowledge base as carving out a set of models.',
  'Over time, we will add additional formulas to the knowledge base,',
  'thereby winnowing down the set of models.',
  _,
  'Intuitively, adding a formula to the knowledge base imposes yet another ',
  'constraint on our world, which naturally decreases the set of possible ',
  'worlds.',
  _,
  'Thus, as the number of formulas in the knowledge base gets larger, the set of models gets smaller.',
  _,
  'A central question is how much $f$ shrinks the set of models.',
  'There are three cases of importance.',
_);

G.entailmentDiagram = function(f) {
  return overlay(
    e2 = ellipse(150, 70).strokeWidth(2).fillColor('red').fillOpacity(0.3),
    e1 = ellipse(100, 50).strokeWidth(2).fillColor('green').fillOpacity(0.7),
    moveRightOf('$\\sM('+f+')$', e2),
    center('$\\sM(\\KB)$'),
  _);
}

add(slide('Entailment',
  parentCenter(entailmentDiagram('f')),
  pause(),
  stmt('Intuition', '$f$ added no information/constraints (it was already known).'),
  pause(),

  definition('entailment',
    '$\\KB$ entails $f$ (written $\\text{KB} \\models f$) iff',
    '$\\sM(f) \\supseteq \\sM(\\KB)$.',
  _),
  pause(),
  stmt('Example', '$\\Rain \\wedge \\Snow \\models \\Snow$'),
_));

prose(
  'The first case is if the set of models of $f$ is a superset of the models of $\\KB$,',
  'then $f$ adds no information.',
  'We say that $\\KB$ <b>entails</b> $f$.',
_);

G.contradictionDiagram = function() {
  return overlay(
    e1 = ellipse(100, 50).strokeWidth(2).fillColor('green').fillOpacity(0.7),
    center('$\\sM(\\KB)$'),
    e2 = ellipse(50, 40).shift(200, 0).strokeWidth(2).fillColor('red').fillOpacity(0.3),
    moveRightOf('$\\sM(f)$', e2),
  _)
}

add(slide('Contradiction',
  parentCenter(contradictionDiagram()),
  pause(),
  stmt('Intuition', '$f$ contradicts what we know (captured in $\\KB$).'),
  definition('contradiction',
    '$\\KB$ contradicts $f$ iff $\\sM(\\KB) \\cap \\sM(f) = \\emptyset$.',
  _),
  pause(),
  stmt('Example', '$\\Rain \\wedge \\Snow$ contradicts $\\neg\\Snow$'),
_));

prose(
  'The second case is if the set of models defined by $f$ is completely disjoint from those of $\\KB$.',
  'Then we say that the $\\KB$ and $f$ <b>contradict</b> each other.',
  'If we believe $\\KB$, then we cannot possibly believe $f$.',
_);

G.contingencyDiagram = function() {
  return overlay(
    e1 = ellipse(100, 50).strokeWidth(2).fillColor('green').fillOpacity(0.7),
    center('$\\sM(\\KB)$'),
    e2 = ellipse(50, 40).shift(110, 0).strokeWidth(2).fillColor('red').fillOpacity(0.3),
    moveRightOf('$\\sM(f)$', e2),
  _);
}

add(slide('Contingency',
  parentCenter(contingencyDiagram()),
  pause(),
  stmt('Intuition', '$f$ adds non-trivial information to $\\KB$'),
  parentCenter('$\\emptyset \\subsetneq \\blue{\\sM(\\KB) \\cap \\sM(f)} \\subsetneq \\sM(\\KB)$'),
  pause(),
  stmt('Example', '$\\Rain$ and $\\Snow$'),
_));

prose(
  'In the third case, we have a non-trivial overlap between the models of $\\KB$ and $f$.',
  'We say in this case that $f$ is <b>contingent</b>; $f$ could be satisfied or not satisfied',
  'depending on the model.',
_);

add(slide('Contradiction and entailment',
  stmt('Contradiction'),
  parentCenter(contradictionDiagram()),
  pause(),
  stmt('Entailment'),
  parentCenter(entailmentDiagram('\\neg f')),
  pause(),
  proposition('contradiction and entailment',
    '$\\KB$ <b>contradicts</b> $f$ iff $\\KB$ <b>entails</b> $\\neg f$.',
  _),
_));

prose(
  'There is a useful connection between entailment and contradiction.',
  'If $f$ is contradictory, then its negation ($\\neg f$) is entailed, and vice-versa.',
  _,
  'You can see this because the models $\\sM(f)$ and $\\sM(\\neg f)$ partition the space of models.',
_);

add(slide('Tell operation',
  parentCenter(xtable('$\\Tell[f]$', thickRightArrow(), frameBox('$\\KB$'), thickRightArrow(), '?').center().margin(20)),
  pause(),
  stmt('Tell'.bold(), 'It is raining.'.italics()),
  parentCenter('$\\Tell[\\pr{Rain}]$'),
  pause(),
  stmt('Possible responses'),
  headerList(null,
    'Already knew that'.fontcolor('green') + ': entailment ($\\KB \\models f$)', pause(),
    'Don\'t believe that'.fontcolor('red') + ': contradiction ($\\KB \\models \\neg f$)', pause(),
    'Learned something new (update KB)'.fontcolor('purple') + ': contingent',
  _),
_));

prose(
  'Having defined the three possible relationships that a new formula $f$ can have with respect to a knowledge base $\\KB$,',
  'let\'s try to determine the appropriate response that a system should have.',
  _,
  'Suppose we tell the system that it is raining ($f = \\Rain$).',
  'If $f$ is entailed, then we should reply that we already knew that.',
  'If $f$ contradicts the knowledge base, then we should reply that we don\'t believe that.',
  'If $f$ is contingent, then this is the interesting case,',
  'where we have non-trivially restricted the set of models, so we reply that we\'ve learned something new.',
_);

add(slide('Ask operation',
  parentCenter(xtable('$\\Ask[f]$', thickRightArrow(), frameBox('$\\KB$'), thickRightArrow(), '?').center().margin(20)),
  stmt('Ask'.bold(), 'Is it raining?'.italics()),
  parentCenter('$\\Ask[\\pr{Rain}]$'),
  pause(),
  stmt('Possible responses'),
  headerList(null,
    'Yes'.fontcolor('green') + ': entailment ($\\KB \\models f$)', pause(),
    'No'.fontcolor('red') + ': contradiction ($\\KB \\models \\neg f$)', pause(),
    'I don\'t know'.fontcolor('orange') + ': contingent',
  _),
_));

prose(
  'Suppose now that we ask the system a question: is it raining?',
  'If $f$ is entailed, then we should reply with a definitive yes.',
  'If $f$ contradicts the knowledge base, then we should reply with a definitive no.',
  'If $f$ is contingent, then we should just confess that we don\'t know.',
_);

add(slide('Digression: probabilistic generalization',
  stmt('Bayesian network: distribution over assignments (models)'),
  parentCenter(frameBox(table(
    ['$w$', '$\\P(W = w)$'],
    ['{ A: 0, B: 0, C: 0 }', '0.3'],
    ['{ A: 0, B: 0, C: 1 }', '0.1'],
    ['...', '...'],
  _).xmargin(50))).scale(0.6),
  pause(),
  parentCenter(contingencyDiagram()),
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
_));

prose(
  'Note that logic captures uncertainty in a very crude way.',
  'We can\'t say that we\'re almost sure or not very sure or not sure at all.',
  _,
  'Probability can help here.',
  'Remember that a Bayesian network (or more generally a factor graph) defines a distribution over assignments to the variables in the Bayesian network.',
  'Then we could ask questions such as: conditioned on having a cough but not itchy eyes, what\'s the probability of having a cold?',
  _,
  'Recall that in propositional logic, models are just assignments to propositional symbols.',
  'So we can think of $\\KB$ as the evidence that we\'re conditioning on, and $f$ as the query.',
_);

add(slide('Satisfiability',
  let(leaf = function(x) { return rootedTree(x).nodeBorderWidth(3).nodeRound(0); }),
  definition('satisfiability',
    'A knowledge base $\\KB$ is '+purplebold('satisfiable')+' if $\\sM(\\KB) \\neq \\emptyset$.',
  _),
  pause(),
  stmt('Reduce $\\Ask[f]$ and $\\Tell[f]$ to satisfiability'),
  parentCenter(rootedTree(
    'Is $\\KB \\cup \\{ \\neg f \\}$ '+purplebold('satisfiable')+'?',
    pause(),
    rootedTreeBranch(
      opaquebg(redbold('no')),
      leaf('entailment'),
    _),
    pause(),
    rootedTreeBranch(
      opaquebg(greenbold('yes')),
      rootedTree(
        'Is $\\KB \\cup \\{ f \\}$ '+purplebold('satisfiable')+'?',
        pause(),
        rootedTreeBranch(
          opaquebg(redbold('no')),
          leaf('contradiction'),
        _),
        pause(),
        rootedTreeBranch(
          opaquebg(greenbold('yes')),
          leaf('contingent'),
        _),
      _),
    _),
  _).recymargin(70)),
_));

prose(
  'Now let\'s return to pure logic land again.',
  'How can we go about actually checking entailment, contradiction, and contingency?',
  'One useful concept to rule them all is <b>satisfiability</b>.',
  _,
  'Recall that we said a particular model $w$ satisfies $f$ if the interpretation function returns true $\\sI(f, w) = 1$.',
  'We can say that a formula $f$ by itself is satisfiable if there is some model that satisfies $f$.',
  'Finally, a knowledge base (which is no more than just the conjunction of its formulas) is satisfiable',
  'if there is some model that satisfies all the formulas $f \\in \\KB$.',
  _,
  'With this definition in hand, we can implement $\\Ask[f]$ and $\\Tell[f]$ as follows:',
  _,
  'First, we check if $\\KB \\cup \\{ \\neg f \\}$ is satisfiable.',
  'If the answer is no, that means the models of $\\neg f$ and $\\KB$ don\'t intersect',
  '(in other words, the two contradict each other).',
  'Recall that this is equivalent to saying that $\\KB$ entails $f$.',
  _,
  'Otherwise, we need to do another test: check whether $\\KB \\cup \\{ f \\}$ is satisfiable.',
  'If the answer is no here, then $\\KB$ and $f$ are contradictory.',
  'Otherwise, we have that both $f$ and $\\neg f$ are compatible with $\\KB$, so the result is contingent.',
_);

add(slide('Model checking',
  'Checking satisfiability (SAT) in propositional logic is special case of solving CSPs!', pause(),
  stmt('Mapping'),
  parentCenter(frameBox(table(
    ['propositional symbol', '$\\Rightarrow$', 'variable'], pause(),
    ['formula', '$\\Rightarrow$', 'constraint'], pause(),
    ['model', '$\\Leftarrow$', 'assignment'],
  _).margin(50, 20).justify('rcl', 'c'))),
_));

prose(
  'Now we have reduced the problem of working with knowledge bases to checking satisfiability.',
  'The bad news is that this is an (actually, the canonical) NP-complete problem,',
  'so there are no efficient algorithms in general.',
  _,
  'The good news is that people try to solve the problem anyway,',
  'and we actually have pretty good SAT solvers these days.',
  'In terms of this class, this problem is just a CSP,',
  'if we convert the terminology:',
  'Each propositional symbol becomes a variable and each formula is a constraint.',
  'We can then solve the CSP, which produces an assignment, or in logic-speak, a model.',
_);

add(slide('Model checking',
  example('model checking',
    '$\\KB = \\{ A \\vee B, B \\leftrightarrow \\neg C \\}$',
    pause(),
    stmt('Propositional symbols (CSP variables)'),
    parentCenter('$\\{A, B, C\\}$'),
    pause(),
    stmt('CSP'),
    parentCenter(overlay(
      xtable(
        a = factorNode('A'),
        b = factorNode('B'),
        c = factorNode('C'),
      _).xmargin(150),
      ab = edgeFactor(a, b),
      bc = edgeFactor(b, c),
      moveTopOf('$A \\vee B$', ab),
      moveTopOf('$B \\leftrightarrow \\neg C$', bc),
    _)),
    pause(),
    stmt('Consistent assignment (satisfying model)'),
    parentCenter('$\\{ A : 1, B : 0, C : 1 \\}$'),
  _).content.margin(10).end,
_));

prose(
  'As an example, consider a knowledge base that has two formulas and three variables.',
  'Then the CSP is shown.  Solving the CSP produces a consistent assignment (if one exists),',
  'which is a model that satisfies KB.',
  _,
  'Note that in the knowledge base tell/ask application, we don\'t technically need the satisfying assignment.',
  'An assignment would only offer a counterexample certifying that the answer <b>isn\'t</b> entailment or contradiction.',
  'This is an important point: entailment and contradiction is a claim about all models, not about the existence of a model.',
_);

add(slide('Model checking',
  definition('model checking',
    stmt('Input: knowledge base $\\KB$'),
    stmt('Output: exists satisfying model ($\\sM(\\KB) \\neq \\emptyset$)?'),
  _),
  pause(),
  headerList('Popular algorithms',
    'DPLL (backtracking search + pruning)',
    'WalkSat (randomized local search)',
  _),
  pause(),
  stmt('Next: Can we exploit the fact that factors are formulas?'),
  //staggerText('But logic allows us to peer inside factors and exploit structure...', '<font color="red"><b>theorem proving</b></font> operates on <font color="red">formulas</font>.'),
_));

prose(
  'Checking satisfiability of a knowledge base is called <b>model checking</b>.',
  'For propositional logic, there are several algorithms that work quite well',
  'which are based on the algorithms we saw for solving CSPs (backtracking search and local search).',
  _,
  'However, can we do a bit better?',
  'Our CSP factors are not arbitrary &mdash; they are logic formulas,',
  'and recall that formulas are defined recursively and have some compositional structure.',
  'Let\'s see how to exploit this.',
_);

////////////////////////////////////////////////////////////
add(slide('Propositional logic',
  logicSchema('Inference rules'),
_));

prose(
  'So far, we have used formulas, via semantics, to define sets of models.',
  'And all our reasoning on formulas has been through these models (e.g., reduction to satisfiability).',
  'Inference rules allow us to do reasoning on the formulas themselves without ever instantiating the models.',
  _,
  'This can be quite powerful.  If you have a huge KB with lots of formulas and propositional symbols,',
  'sometimes you can draw a conclusion without instantiating the full model checking problem.',
  'This will be very important when we move to first-order logic, where the models can be infinite,',
  'and so model checking would be infeasible.',
_);

add(slide('Inference rules',
  stmt('Example of making an inference'),
  indent(ytable(
    'It is raining. ($\\Rain$)', pause(),
    'If it is raining, then it is wet. ($\\Rain \\to \\Wet$)', pause(),
    'Therefore, it is wet. ($\\Wet$)', pause(),
  _)),
  parentCenter(xtable('$\\displaystyle \\frac{\\Rain, \\quad \\Rain \\to \\Wet}{\\Wet}$', text('$\\frac{\\text{(premises)}}{\\text{(conclusion)}}$').orphan(true)).xmargin(30).center()),

  pause(),
  definition('Modus ponens inference rule',
    'For any propositional symbols $p$ and $q$:',
    parentCenter('$\\frac{p, \\quad p \\to q}{q}$'),
  _),
_));

prose(
  'The idea of making an inference should be quite intuitive to you.',
  'The classic example is <b>modus ponens</b>,',
  'which captures the if-then reasoning pattern.',
_);

add(slide('Inference framework',
  definition('inference rule',
    'If $f_1, \\dots, f_k, g$ are formulas, then the following is an <b>inference rule</b>:',
    parentCenter('$\\displaystyle \\frac{f_1, \\quad \\dots \\quad, f_k}{g}$'),
  _),
  pause(),
  keyIdea('inference rules',
    'Rules operate directly on '+redbold('syntax')+', not on '+bluebold('semantics')+'.',
  _),
_));

prose(
  'In general, an inference rule has a set of premises and a conclusion.',
  'The rule says that if the premises are in the KB, then you can add the conclusion to the KB.',
  _,
  'We haven\'t yet specified whether this is a valid thing to do, but it is a thing to do.',
  'Remember, syntax is just about symbol pushing; it is only by linking to models that we have notions of truth and meaning (semantics).',
_);

add(slide('Inference algorithm',
  algorithm('forward inference',
    stmt('Input: set of inference rules $\\Rules$.'),
    'Repeat until no changes to $\\text{KB}$:', pause(),
    indent('Choose set of formulas $f_1, \\dots, f_k \\in \\text{KB}$.'), pause(),
    indent('If matching rule $\\frac{f_1, \\quad \\dots \\quad, f_k}{g}$ exists:'), pause(),
    indent(indent('Add $g$ to $\\text{KB}$.')),
  _),
  pause(),
  definition('derivation',
    '$\\text{KB}$ <font color="red"><b>derives/proves</b></font> $f$ ($\\text{KB} \\vdash f$) iff $f$ eventually gets added to $\\text{KB}$.',
  _),
_));

prose(
  'Given a set of inference rules (e.g., modus ponens), we can just keep on trying to apply rules.',
  'Those rules generate new formulas which get added to the knowledge base,',
  'and those formulas might then be premises of other rules, which in turn generate more formulas, etc.',
  _,
  'We say that the KB derives or proves a formula $f$ if by blindly applying rules,',
  'we can eventually add $f$ to the KB.',
_);

add(slide('Inference example',
  example('Modus ponens inference',
    stmt('Starting point'),
    indent('$\\KB = \\{ \\Rain, \\Rain \\to \\Wet, \\Wet \\to \\Slippery \\}$'),
    pause(),
    stmt('Apply modus ponens to $\\Rain$ and $\\Rain \\to \\Wet$'),
    indent(nowrapText('$\\KB = \\{ \\Rain, \\Rain \\to \\Wet, \\Wet \\to \\Slippery, \\red{\\Wet} \\}$')),
    pause(),
    stmt('Apply modus ponens to $\\Wet$ and $\\Wet \\to \\Slippery$'),
    indent(nowrapText('$\\KB = \\{ \\Rain, \\Rain \\to \\Wet, \\Wet \\to \\Slippery, \\red{\\Wet}, \\red{\\Slippery} \\}$')),
    pause(),
    darkblue('Converged.'),
  _).scale(0.8).content.margin(20).end,
  pause(),
  'Can\'t derive some formulas: $\\neg \\Wet, \\quad \\Rain \\to \\Slippery$',
_));

prose(
  'Here is an example where we\'ve applied modus ponens twice.',
  'Note that $\\Wet$ and $\\Slippery$ are derived by the KB.',
  _,
  'But there are some formulas which cannot be derived.',
  'Some of these underivable formulas will look bad anyway ($\\neg \\Wet$),',
  'but others will seem reasonable ($\\Rain \\to \\Slippery$).',
_);

add(slide('Desidarata for inference rules',
  bluebold('Semantics'),
  //'Given a $\\KB$, a formula $f$ is true if $\\KB$ entails $f$:',
  indent('Interpretation defines <b>entailed/true</b> formulas: $\\KB \\models f$:'),
  parentCenter(entailmentDiagram('f')),
  pause(),
  redbold('Syntax:'),
  indent('Inference rules <b>derive</b> formulas: $\\KB \\vdash f$'),
  pause(),
  'How does $\\{ f : \\KB \\models f \\}$ relate to $\\{ f : \\KB \\vdash f \\}$?',
_));

prose(
  'We can apply inference rules all day long,',
  'but now we desperately need some guidance on whether a set of inference rules is doing anything remotely sensible.',
  _,
  'For this, we turn to semantics, which gives an objective notion of truth.',
  'Recall that the semantics provides us with $\\sM$,',
  'the set of satisfiable models for each formula $f$ or knowledge base.',
  'This defines a set of formulas $\\{ f : \\KB \\models f \\}$ which are defined to be true.',
  _,
  'On the other hand, inference rules also gives us a mechanism for generating a set of formulas,',
  'just by repeated application.  This defines another set of formulas $\\{ f : \\KB \\vdash f \\}$.',
_);

add(slide('Truth',
  nil(),
  parentCenter(image('images/empty-water-glass.jpg')),
  parentCenter('$\\{ f : \\KB \\models f \\}$'),
_));

prose(
  'Imagine a glass that represents the set of possible formulas entailed by the KB (these are necessarily true).',
  _,
  'By applying inference rules, we are filling up the glass with water.',
_);

add(slide('Soundness',
  definition('soundness',
    'A set of inference rules $\\Rules$ is sound if:',
    //parentCenter('$\\red{\\text{KB} \\vdash f} \\quad $ implies $ \\quad \\blue\{\\text{KB} \\models f}$'),
    parentCenter('$\\{ f : \\red{\\text{KB} \\vdash f} \\} \\subseteq \\{ f : \\blue\{\\text{KB} \\models f} \\}$'),
    //'Nothing but the truth: derive <b>only</b> entailed formulas',
  _),
  parentCenter(image('images/half-water-glass.jpg')),
_));

prose(
  'We say that a set of inference rules is <b>sound</b> if using those inference rules,',
  'we never overflow the glass: the set of derived formulas is a subset of the set of true/entailed formulas.',
_);

add(slide('Completeness',
  definition('completeness',
    'A set of inference rules $\\Rules$ is complete if:',
    //parentCenter('$\\blue{\\text{KB} \\models f} \\quad $ implies $ \\quad \\red{\\text{KB} \\vdash f}$'),
    parentCenter('$\\{ f : \\red{\\text{KB} \\vdash f} \\} \\supseteq \\{ f : \\blue\{\\text{KB} \\models f} \\}$'),
    //'The whole truth: derive <b>all</b> entailed formulas',
  _),
  parentCenter(image('images/full-water-glass.jpg')),
  //pause(),
  //keyIdea('syntax and semantics',
    //'These properties link <font color="red">syntax (inference rules)</font> and <font color="blue">semantics (entailment)</font>.',
  //_),
_));

prose(
  'We say that a set of inference rules is <b>complete</b> if using those inference rules,',
  'we fill up the class to the brim (and possibly go over):',
  'the set of derived formulas is a superset of the set of true/entailed formulas.',
_);

add(slide('Soundness and completeness',
  parentCenter(italics('The truth, the whole truth, and nothing but the truth.')),
  parentCenter(headerList(null,
    '<b>Soundness</b>: nothing but the truth',
    '<b>Completeness</b>: whole truth',
  _)),
_));

prose(
  'A slogan to keep in mind is the oath given in a sworn testimony.',
_);

/*add(slide('Soundness of modus ponens',
  parentCenter(overlay(
    table(
      [darkbluebold('Syntax'), pause(2), nil(), darkbluebold('Semantics')], pause(-2),
      [
        '$\\red{\\KB = \\{ \\Rain, \\Rain \\to \\Wet \\}}$',
        pause(2),
        m1 = bigRightArrow(100),
        rainWet('red', 0, 0, 0, 2),
      ],
      pause(-1),
      [a1 = bigDownArrow(100), nil(), pause(2), a2 = bigDownArrow(100)], pause(-2),
      [
        '$\\green{\\Wet}$',
        pause(),
        m2 = bigRightArrow(100),
        rainWet('green', 0, 2, 0, 2),
      ],
    _).center().margin(5),
    showLevel(a1.showLevel()),
    moveLeftOf('Modus ponens', a1),
    showLevel(a2.showLevel()),
    moveLeftOf(text('$\\blue{\\subseteq}$').scale(2), a2),
    showLevel(m1.showLevel()),
    moveTopOf('$\\sM$', m1),
    showLevel(m2.showLevel()),
    moveTopOf('$\\sM$', m2),
  _)),
  pause(),
  parentCenter(bluebold('Sound!')),
_));*/

/*add(slide('A puzzle',
  headerList('Tell information',
    'You get extra credit if you write a paper and you solve the problems.',
    'You didn\'t get extra credit.',
    'You solve the problems.',
  _),
  pause(),
  stmt('Ask question'),
  bulletedText('Did you write a paper?'),
_));*/

add(slide('Soundness: example',
  'Is $\\displaystyle \\frac{\\Rain, \\quad \\Rain \\to \\Wet}{\\Wet}$ (Modus ponens) sound?',
  pause(),
  parentCenter(table(
    ['$\\red{\\sM(\\Rain)}$', '$\\cap$', '$\\red{\\sM(\\Rain \\to \\Wet)}$', '$\\subseteq$?', '$\\green{\\sM(\\Wet)}$'],
    [
      rainWet('red', 0, 0, 1, 2), nil(),
      rainWet('red', 1, 1, 0, 2), nil(),
      rainWet('green', 0, 1, 0, 1),
    ],
  _).center().margin(40)),
  pause(),
  parentCenter(bluebold('Sound!')),
  //'Yes!  Models represented by $\\Rain$ and $\\Rain \\to \\Wet$ is <b>subset</b> of those represented by $\\Wet$.',
  //parentCenter('$\\sM(\\{\\Rain, \\Rain \\to \\Wet\\}) \\subset \\sM(\\Wet)$'),
_));

prose(
  'To check the soundness of a set of rules, it suffices to focus on one rule at a time.',
  _,
  'Take the modus ponens rule, for instance.',
  'We can derive $\\Wet$ using modus ponens.',
  'To check entailment, we map all the formulas into semantics-land (the set of satisfiable models).',
  'Because the models of $\\Wet$ is a superset of the intersection of models of $\\Rain$ and $\\Rain \\to \\Wet$',
  '(remember that the models in the KB are an intersection of the models of each formula),',
  'we can conclude that $\\Wet$ is also entailed.',
  'If we had other formulas in the KB, that would reduce both sides of $\\subseteq$',
  'by the same amount and won\'t affect the fact that the relation holds.',
  'Therefore, this rule is sound.',
  _,
  'Note, we use $\\Wet$ and $\\Rain$ to make the example more colorful, but this argument',
  'works for arbitrary propositional symbols.',
_);

/*add(slide('Soundness',
  'Is $\\displaystyle \\frac{\\neg\\Wet, \\quad \\Rain \\to \\Wet}{\\neg \\Rain}$ (Modus tollens) sound?', pause(),
  parentCenter(table(
    ['$\\red{\\sM(\\neg\\Wet)}$', '$\\cap$', '$\\red{\\sM(\\Rain \\to \\Wet)}$', '$\\subset$?', '$\\green{\\sM(\\neg\\Rain)}$'],
    [
      rainWet('red', 2, 0, 1, 0), nil(),
      rainWet('red', 2, 1, 0, 1), nil(),
      rainWet('green', 1, 1, 0, 0),
    ],
  _).center().margin(40)),
  pause(),
  'Yes!',
_));*/

add(slide('Soundness: example',
  'Is $\\displaystyle \\frac{\\Wet, \\quad \\Rain \\to \\Wet}{\\Rain}$ sound?', pause(),
  parentCenter(table(
    ['$\\red{\\sM(\\Wet)}$', '$\\cap$', '$\\red{\\sM(\\Rain \\to \\Wet)}$', '$\\subseteq$?', '$\\green{\\sM(\\Rain)}$'],
    [
      rainWet('red', 0, 2, 0, 2), nil(),
      rainWet('red', 1, 2, 0, 2), nil(),
      rainWet('green', 0, 0, 1, 1),
    ],
  _).center().margin(40)),
  pause(),
  parentCenter(brownbold('Unsound!')),
_));

prose(
  'Here is another example: given $\\Wet$ and $\\Rain \\to \\Wet$, can we infer $\\Rain$?',
  'To check it, we mechanically construct the models for the premises and conclusion.',
  'Here, the intersection of the models in the premise are not a subset, then the rule is unsound.',
  _,
  'Indeed, backward reasoning is faulty.',
  'Note that we can actually do a bit of backward reasoning using Bayesian networks,',
  'since we don\'t have to commit to 0 or 1 for the truth value.',
_);

// Picture of semantics and syntax, need to be able to hit every superset
add(slide('Completeness: example',
  stmt('Recall completeness: inference rules derive all entailed formulas ($f$ such that $\\KB \\models f$)'),
  //stmt('Example'),
  //indent('$\\Rules = \\{ \\frac{f, \\quad f \\to g}{g} \\}$'), pause(),
  pause(),
  example('Modus ponens is incomplete',
    headerList('Setup',
      nowrapText('$\\KB = \\{ \\Rain, \\Rain \\vee \\Snow \\to \\Wet \\}$').width(600),
      nowrapText('$f = \\Wet$').width(600), pause(),
      nowrapText('$\\Rules = \\{ \\frac{f, \\quad f \\to g}{g} \\}$ (Modus ponens)').width(600),
    _), pause(),
    'Semantically: $\\KB \\models f$ ($f$ is entailed).', pause(),
    'Syntactically: $\\KB \\not\\vdash f$ (can\'t derive $f$).', pause(),
    parentCenter(brownbold('Incomplete!')),
  _).scale(0.9),
  //'What set of rules is <b>complete</b>?  This is trickier than soundness...', pause(),
  /*headerList('Plan',
    'Propositional logic with only definite clauses: only need modus ponens', pause(),
    'Propositional logic: only need resolution rule (+ preprocessing)',
  _),*/
_));

prose(
  'Completeness is trickier, and here is a simple example that shows that modus ponens alone is not complete,',
  'since it can\'t derive $\\Wet$, when semantically, $\\Wet$ is true!',
_);

add(slide('Fixing completeness',
  stmt('Option 1: Restrict the allowed set of formulas'),
  parentCenter(ytable(
    red('propositional logic'),
    bigDownArrow(80),
    green('propositional logic with only Horn clauses'),
  _).center()),
  pause(),
  stmt('Option 2: Use more powerful inference rules'),
  parentCenter(ytable(
    green('Modus ponens'),
    bigDownArrow(80),
    red('resolution'),
  _).center()),
_));

prose(
  'At this point, there are two ways to fix completeness.',
  'First, we can restrict the set of allowed formulas, making the water glass smaller',
  'in hopes that modus ponens will be able to fill that smaller glass.',
  _,
  'Second, we can use more powerful inference rules, pouring more vigorously into the same glass',
  'in hopes that this will be able to fill the glass; we\'ll look at one such ',
  'rule, resolution, in the next lecutre.',
_);

//outline.indent();
//add(outlineSlide('Inference in propositional logic with only definite clauses'));

add(slide('Definite clauses',
  definition('Definite clause',
    'A <b>definite clause</b> has the following form:',
    parentCenter('$(p_1 \\wedge \\cdots \\wedge p_k) \\to q$'),
    'where $p_1, \\dots, p_k, q$ are propositional symbols.',
  _),
  stmt('Intuition', 'if $p_1, \\dots, p_k$ hold, then $q$ holds.'), pause(),
  indent(stmt('Example', '$(\\Rain \\wedge \\Snow) \\to \\Traffic$')).scale(0.9),
  indent(stmt('Example', '$\\Traffic$')).scale(0.9),
  indent(stmt('Non-example', '$\\Rain \\red{\\wedge} \\Snow$')).scale(0.9),
  indent(stmt('Non-example', '$\\red{\\neg} \\Traffic$')).scale(0.9),
  indent(nowrapText(stmt('Non-example', '$(\\Rain \\wedge \\Snow) \\to (\\red{\\Traffic \\vee \\Peaceful})$'))).scale(0.9),
_));

prose(
  'First we will choose to restrict the allowed set of formulas.',
  'Towards that end, let\'s define a <b>definite clause</b> as a formula',
  'that says, if a conjunction of propositional symbols holds,',
  'then some other propositional symbol $q$ holds.',
  'Note that this is a formula, not to be confused with an inference rule.',
_);

add(slide('Horn clauses',
  definition('Horn clause',
    'A <b>Horn clause</b> is either:',
    bulletedText('a definite clause ($p_1 \\wedge \\cdots \\wedge p_k \\to q$)'), pause(),
    bulletedText('a goal clause ($p_1 \\wedge \\cdots \\wedge p_k \\to \\text{false}$)'),
  _),
  pause(-1),
  indent(stmt('Example (definite)', '$(\\Rain \\wedge \\Snow) \\to \\Traffic$')),
  pause(),
  indent(stmt('Example (goal)', '$\\Traffic \\wedge \\Accident \\to \\text{false}$')),
  pause(),
  parentRight('equivalent: $\\neg (\\Traffic \\wedge \\Accident)$'),
_));

prose(
  'A <b>Horn clause</b> is basically a definite clause,',
  'but includes another type of clause called a <b>goal clause</b>,',
  'which is the conjunction of a bunch of propositional symbols implying false.',
  'The form of the goal clause might seem a bit strange, but the way to interpret it is simply that it\'s the negation of the conjunction.',
_);

function kb() {
  return parentCenter(frameBox(yseq(
    '$\\Rain$', '$\\Weekday$',
    '$\\Rain \\to \\Wet$', '$\\Wet \\wedge \\Weekday \\to \\Traffic$', '$\\Traffic \\wedge \\Careless \\to \\Accident$',
  _)).title(frameBox(opaquebg('KB')).padding(0)).bg.color('orange').opacity(0.3).end);
}
function modusPonens() {
  return definition('Modus ponens',
    nowrapText('$\\displaystyle \\frac{p_1, \\quad \\cdots \\quad, p_k, \\quad (p_1 \\wedge \\cdots \\wedge p_k) \\to q}{q}$'),
  _);
}

add(slide('Modus ponens',
  stmt('Inference rule'),
  modusPonens(),
  stmt('Example'),
  example('Modus ponens',
    nowrapText('$\\displaystyle \\frac{\\Wet, \\quad \\Weekday, \\quad \\Wet \\wedge \\Weekday \\to \\Traffic}{\\Traffic}$'),
  _),
_));

prose(
  'Recall the Modus ponens rule from before.',
  'We simply have generalized it to arbitrary number of premises.',
_);

add(slide('Completeness of modus ponens',
  theorem('Modus ponens on Horn clauses',
    'Modus ponens is '+greenbold('complete')+' with respect to Horn clauses:',
    bulletedText('Suppose KB contains only Horn clauses and $p$ is an entailed propositional symbol.'),
    bulletedText('Then applying modus ponens will derive $p$.'),
  _),
  stmt('Upshot'),
  parentCenter('$\\KB \\models p$ (entailment) is the same as $\\KB \\vdash p$ (derivation)!'),
_));

prose(
  'There\'s a theorem that says that modus ponens is complete on Horn clauses.',
  'This means that any propositional symbol that is entailed can be derived by modus ponens too,',
  'provided that all the formulas in the KB are Horn clauses.',
  _,
  'We already proved that modus ponens is sound, and now we have that it is complete (for Horn clauses).',
  'The upshot of this is that entailment (a semantic notion, what we care about) and being able to derive a formula (a syntactic notion, what we do with inference) are equivalent!',
_);

add(slide('Answering questions',
  parentCenter(xtable(kb(), modusPonens()).margin(100).scale(0.5).center()),
  stmt('Query: $\\Ask[\\Traffic]$'),
  pause(),
  stmt('"Yes" subproblem: $\\KB \\models \\Traffic$'),
  pause(),
  indent(stmt('Equivalent: $\\KB$ contradicts $\\neg \\Traffic$')),
  pause(),
  indent(stmt('Equivalent: $\\KB \\cup \\{\\Traffic \\to \\false \\} \\vdash \\false$?')),
  pause(-2),
  stmt('"No" subproblem: $\\KB \\models \\neg \\Traffic$'),
  pause(3),
  indent(xtable(stmt('Equivalent: $\\KB \\vdash \\neg \\Traffic$'), pause(), redbold('&mdash; impossible!')).margin(20)),
_));

prose(
  'Let\'s see modus ponens on Horn clauses in action.',
  'Suppose we have the given KB consisting of only Horn clauses (in fact, these are all definite clauses),',
  'and we wish to ask the question $\\Traffic$.',
  'Recall that results in two separate queries:',
  'If $\\KB$ entails $\\Traffic$, then we should answer true.',
  'If $\\KB$ entails $\\neg \\Traffic$, then we should answer false.',
  'If neither entailment holds, then we answer "I don\'t know".',
  _,
  'The entailment is equivalent to adding the goal clause $\\Traffic \\to \\false$ to the KB',
  'and checking if we can derive false.',
  'You can think of this as a proof by contradiction.',
  _,
  'Note that for the "no" subproblem, it is actually impossible to derive $\\neg \\Traffic$.',
  'This is because modus ponens can only generate propositional symbols, not their negations.',
  'This means always either answer "yes" or "I don\'t know".',
  'One can verify this is reasonable because setting all variables to true is always a valid model no matter what the Horn clauses are,',
  'so we can never say "no".',
_);

var T = rootedTree;
add(slide('"Yes" subproblem',
  parentCenter(xtable(kb(), modusPonens()).margin(100).scale(0.5).center()),
  pause(),
  yspace(20),
  stmt('Question: $\\KB \\cup \\{\\Traffic \\to \\false \\} \\vdash \\false$?'),
  parentCenter(T('$\\text{false}$', T('$\\Traffic$', T('$\\Wet$', '$\\Rain$', '$\\Rain \\to \\Wet$'), '$\\Weekday$', '$\\Wet \\wedge \\Weekday \\to \\Traffic$'), '$\\Traffic \\to \\false$').scale(0.6)),
_));

prose(
  'A <b>derivation</b> is a proof that the root formula (e.g., $\\false$) was derived using inference rules.',
  _,
  'The leaves are the original formulas in the KB,',
  'and each internal node corresponds to a formula which is produced by applying an inference rule',
  '(e.g., modus ponens) with the children as premises.',
  _,
  'If a symbol is used as the premise in two different rules, then it would have two parents,',
  'resulting in a DAG.',
_);

add(summarySlide('Summary',
  logicSchema(),
_));

sfig.initialize();
