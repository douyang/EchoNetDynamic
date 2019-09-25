G = sfig.serverSide ? global : this;
G.prez = presentation();

////////////////////////////////////////////////////////////

// Colors
G.nlcolor = '#0A8D00';  // Natural language
G.zlcolor = '#BF6400';  // Logical form
G.wlcolor = '#6300A4';  // World
G.nl = function(x) { return x.italics().fontcolor(nlcolor); }
G.zl = function(x) { return ('<tt>' + x + '</tt>').fontcolor(zlcolor); }
G.wl = function(x) { return ('<tt>' + x + '</tt>').fontcolor(wlcolor); }
G.cnl = function(x) { return nl(x).fontcolor(nlcolor); }
G.cwl = function(x) { return wl(x).fontcolor(wlcolor); }
G.czl = function(x) { return '$\\czl{' + x + '}$'; }

sfig.latexMacro('zl', 1, '\\text{#1}');
sfig.colorLatexMacro('zlcolor', '#BF6400');
sfig.colorLatexMacro('wlcolor', '#6300A4');
sfig.latexMacro('czl', 1, '\\zlcolor{\\zl{#1}}');
sfig.latexMacro('wl', 1, '\\text{#1}');
sfig.latexMacro('bR', 0, '\\mathbf{R}');

G.lesson = function(s) {
  //return parentCenter(frameBox(text(redbold('Key: ' + s)).width(700)));
  return parentCenter(frameBox(text(redbold(s)).width(700)).bg.strokeWidth(2).end);
}

G.modulebox = function(s) {
  return parentCenter(frameBox(text(s).width(700)).bg.strokeWidth(2).fillColor('#F3E8B6').end);
}

G.person = function(name, filename) {
  return ytable(
    image('images/' + (filename || name.toLowerCase().replace(' ', '-')) + '.jpg').height(150),
    name,
  _).center();
}

G.systemSpec = function(opts) {
  var myPause = opts.pause ? pause : function() { return _; };
  var ex = opts.ex;
  var zscale = opts.zscale || 0.7;
  return ytable(
    nowrapText(ex.x).scale(0.85),
    myPause(),
    opts.hideArrows ? _ : xtable(bigDownArrow(), text('semantic parsing').orphan(true)).center().margin(10),
    (ex.zfunc ? ex.zfunc() : nowrapText(ex.z)).scale(zscale),
    myPause(),
    opts.hideArrows ? _ : xtable(bigDownArrow(), text('execute').orphan(true)).center().margin(10),
    nowrapText(ex.y).scale(0.85),
  _).center().ymargin(10)
}

G.encoderDecoder = function(source, target) {
  var outputs = [];
  var hidden = [];
  var inputs = [];
  var edges = [];
  source = source.split(/ /);
  function vec() { return rect(20, 100).fillColor('gray').fillOpacity(0.3); }
  //function vec() { return vectorCartoon().scale(0.3); }
  function mytext(x) { return text(nl(x)).scale(0.8); }
  function mytext2(x) { return text(purpleitalics(x)).scale(0.8); }
  for (var i = 0; i < source.length; i++) {
    outputs.push(nil());
    hidden.push(vec());
    inputs.push(mytext(source[i]));
  }
  target = target.split(/ /);
  for (var i = 0; i < target.length; i++) {
    outputs.push(mytext2(target[i]));
    hidden.push(vec());
    inputs.push(nil()); continue;
    if (i > 0) {
      inputs.push(mytext(target[i-1]));
    } else {
      inputs.push(mytext('-'));
    }
  }
  for (var i = 0; i < inputs.length; i++) {
    if (i > 0)
      edges.push(arrow(hidden[i-1], hidden[i]));
    if (i >= source.length)
      edges.push(arrow(hidden[i], outputs[i]));
    else
      edges.push(arrow(inputs[i], hidden[i]));
  }

  return overlay(table(outputs, hidden, inputs).margin(40, 40).center(), new Overlay(edges));
}

G.drawKnowledgeBaseGraph = function(entries, opts) {
  var nodes = {}; // Map node name => object
  var nodePositions = {};  // Map node name => position
  var out = [];
  var frameBox = function(a) { return frame(a).bg.strokeWidth(1).fillColor('white').end; }
  var getNode = function(name, dx, dy) {
    var posScale = 140;
    var o = nodes[name];
    if (!o) {
      o = nodes[name] = center(name.bold().fontcolor('blue')).scale(0.8);
      if (opts.highlightNodes && opts.highlightNodes.indexOf(name) != -1)
        o = frameBox(o).bg.strokeWidth(2).round(5).end;
      o.shift(dx*posScale, down(dy*posScale));
      nodePositions[name] = [dx, dy];
      out.push(o);
    }
    return o;
  }
  entries.forEach(function(info) {
    var e1 = info[0];
    var property = info[1][0];
    var dx = info[1][1];
    var dy = info[1][2];
    var highlight = info[1][3];
    var e2 = info[2];

    if (opts.pause)
      out.push(pause());

    var e1obj = getNode(e1, 0, 0);
    var e2obj = getNode(e2, nodePositions[e1][0]+dx, nodePositions[e1][1]+dy);
    var link = arrow(e1obj, e2obj);
    if (opts.highlightEdges && highlight) link.strokeWidth(6).strokeColor('green');
    else link.strokeWidth(2);
    out.push(link);
    out.push(opaquebg(center(property.fontcolor('brown'))).scale(0.6).shift(link.xmiddle(), link.ymiddle()));
  });
  return new Overlay(out);
}

G.obamaKnowledgeGraph = function(opts) {
  var ObamaMarriage = 'Event8';
  var BarackObamaLiveInChicago = 'Event3';
  var MichelleObamaLiveInChicago = 'Event21';

  return drawKnowledgeBaseGraph([
    ['BarackObama', ['Type', -2, +1, true], 'Person'],
    ['BarackObama', ['Profession', +1, +1], 'Politician'],

    ['BarackObama', ['DateOfBirth', -0.5, 1], '1961.08.04'],
    ['BarackObama', ['PlaceOfBirth', 2, 0], 'Honolulu'],
    ['Honolulu', ['ContainedBy', 0, -1], 'Hawaii'],
    ['Honolulu', ['Type', 0, 1], 'City'],
    ['Hawaii', ['ContainedBy', -1.5, +0.5], 'UnitedStates'],
    ['Hawaii', ['Type', 0, -0.7], 'USState'],

    ['BarackObama', ['Marriage', -1, -1], ObamaMarriage],
    [ObamaMarriage, ['Spouse', -1, -1], 'MichelleObama'],
    ['MichelleObama', ['Type', 1, 0, true], 'Person'],
    ['MichelleObama', ['Gender', 1.5, 0.3], 'Female'],
    [ObamaMarriage, ['StartDate', 1.5, -0.5], '1992.10.03'],

    ['BarackObama', ['PlacesLived', -1.5, +0.4, true], BarackObamaLiveInChicago],
    [BarackObamaLiveInChicago, ['Location', -1, -0.4, true], 'Chicago'],
    ['MichelleObama', ['PlacesLived', -0.5, +1, true], MichelleObamaLiveInChicago],
    [MichelleObamaLiveInChicago, ['Location', 0, 0, true], 'Chicago'],
    ['Chicago', ['ContainedBy', 0, 0, true], 'UnitedStates'],
  ], opts);
}

G.olympicsTable = function() {
  var widths = [90, 120, 120, 110];
  var data = [
    [bold('Year'), bold('City'), bold('Country'), bold('Nations')],
    ['1896', 'Athens', 'Greece', '14'],
    ['1900', 'Paris', 'France', '24'],
    ['1904', 'St. Louis', 'USA', '12'],
    ['...', '...', '...', '...'],
    ['2004', 'Athens', 'Greece', '201'],
    ['2008', 'Beijing', 'China', '204'],
    ['2012', 'London', 'UK', '204']
  ];
  data = data.map(function (row, i) {
    return row.map(function (x, j) {
      return overlay(rect(widths[j], 40).fillColor(i == 0 ? '#ddd' : 'white').strokeColor('#66a'), darkblue(x)).center();
    });
  });
  return table.apply(null, data).center();
};

////////////////////////////////////////////////////////////

add(titleSlide('Lecture 19: Conclusion',
  nil(),
  parentCenter(image('images/curtains.jpg').width(300)),
_));

var index = 0;
var SUMMARY = index++;
var NEXT = index++;
var HISTORY = index++;
var MY = index++;
var FINAL = index++;
function roadmap(i) {
  add(outlineSlide('Roadmap', i, [
    ['summary', 'Summary of CS221'],
    ['next', 'Next courses'],
    ['history', 'History of AI'],
    ['my', 'My research'],
    ['final', 'Food for thought'],
  ]));
}



/////////////////////////


add(slide('Outlook',
  stmt('AI is everywhere: IT, transportation, manifacturing, etc.'),
  parentCenter(image('images/machine-age.jpg').width(200)),
  pause(),
    stmt('AI being used to make decisions for: education, credit, employment, advertising, health care and policing'),
_));


//

add(slide('Ethical Issues',
  stmt('Algorithms and computers are neutral'),
  parentCenter(image('images/algorithm.jpg').width(200)),
  pause(),
  stmt('but algorithms and data are created by people'),
    parentCenter(image('images/person.jpg').width(30)),
_));


// data is biased
add(slide('2D visualization of word vectors',
  parentCenter(stagger(
  //  image('images/word-embedding.png').width(700).linkToUrl('images/word-embedding.png'),
    image('images/word-embedding-subset.png').width(700).linkToUrl('images/word-embedding-subset.png'),
  _).center()),
  // General: numbers and determiners, days of week, countries
  // Useful for downstream applications
  // But only give very loose notion of semantics
_));


add(slide('Analogies',
  stmt('Differences in vectors capture relations'),
  indent(nowrapText('$\\theta_\\text{france} - \\theta_\\text{french} \\approx \\theta_\\text{mexico} - \\theta_\\text{spanish}$ (language)')),
  pause(),
  indent(nowrapText('$\\theta_\\text{king} - \\theta_\\text{man} \\approx \\theta_\\text{queen} - \\theta_\\text{woman}$ (gender)')),
  pause(),
  indent(nowrapText('$\\theta_\\text{king} - \\theta_\\text{man} +\\theta_\\text{woman} \\approx \\theta_\\text{queen}$')),
//  indent(nowrapText('$\\theta_\\text{brother} - \\theta_\\text{man} \\approx \\theta_\\text{sister} - \\theta_\\text{woman}$ (language)')),
  pause(),
  stmt('Data as a social mirror'),
  indent(
  stagger(nowrapText('$\\theta_\\text{computer programmer} - \\theta_\\text{man}  + \\theta_\\text{woman} \\approx$'),pause(),nowrapText('$\\theta_\\text{computer programmer} - \\theta_\\text{man}  + \\theta_\\text{woman} \\approx \\theta_\\text{homemaker}$'))), 
  pause(),
  indent(
  stagger(nowrapText('$\\theta_\\text{doctor} - \\theta_\\text{father}  + \\theta_\\text{mother} \\approx$'), // nurse
  pause(),
  nowrapText('$\\theta_\\text{doctor} - \\theta_\\text{father}  + \\theta_\\text{mother} \\approx  \\theta_\\text{nurse} $'))),
  pause(),
  indent(
  stagger(nowrapText('$\\theta_\\text{feminism} - \\theta_\\text{woman}  + \\theta_\\text{man} \\approx$'), // 
  pause(),
  nowrapText('$\\theta_\\text{feminism} - \\theta_\\text{woman}  + \\theta_\\text{man} \\approx \\theta_\\text{convervatism} $'))),
  //'Don\'t need dimensionality reduction for this to work!',
_).rightHeader('[Bolukbasi et al., 2016]'));

/*
add(slide('Bias',
  parentCenter(image('images/vsrl-bias.png').width(700)),
  parentCenter('33\% men in training set, only predict 16\% men at test time'),
  pause(),
  parentCenter('society $\\Rightarrow$ data $\\Rightarrow$ machine learning predictions'),
_).rightHeader('[Zhao et al., 2017]'));
*/

 add(slide('Framework',
    nil(),
    parentCenter(xtable(
      ytable('$\\Train$').center().strokeColor('green'),
      thickRightArrow(50),
      frameBox(purplebold('Learner')).padding(20),
      pause(),
      thickRightArrow(),
      ytable(
        text('$x$').orphan(true),
        downArrow(50).strokeWidth(3).orphan(true),        
        frameBox(ytable('$f$').center()),
        downArrow(50).strokeWidth(3).orphan(true),
        text('$y$').orphan(true),
      _).center().margin(5),
    _).center().margin(15)),
	pause(),
	stmt('By design: picks up patterns in training data, including biases'),
  _));


add(slide('Ethical concerns',
  parentCenter(image('images/big-data.png').width(200)),
   greenitalics('..big data analytics have the potential to eclipse longstanding civil rights protections in how personal information is used in housing, credit, employment, health, education and the marketplace. Americans relationship with data should expand, not diminish, their opportunities..'),
_));

add(slide('Question',
  //bulletedText('What are the consequences?'),
  //bulletedText('Who is responsible?'),
  bulletedText('When you develop ML systems, what should you be aware of?'),
  parentCenter(image('images/big-data.png').width(200)),
_));


// protected attributes
add(slide('Protected attributes',
  bulletedText('Example task: predict whether a criminal will re-offend'),
  pause(),
  bulletedText('Available data: [Conviction Type, Number of Priors, Age, Income, Location, Race]'),
  pause(),
   stmt('Protected Attributes: To avoid discrimination, we should discard the Race attribute.'),
	pause(),   
  bulletedText('New data: [Conviction Type, Number of Priors, Age, Income, Location]'),
  pause(),   
  bulletedText('Use degree-2 polynomial features: [Conviction Type * Number of Priors, Conviction Type * Age, ... , Income*Location]'),
_));

// protected attributes
add(slide('Protected attributes',
  bulletedText('Example task: predict whether a criminal will re-offend'),  
   bulletedText('Features: [Conviction Type * Number of Priors, Conviction Type * Age, ... , Income*Location]'),
   pause(),
    bulletedText('We have access to the following feature: $(Location=Oakland) \\wedge (Income<10K)$'),
	pause(),
	stmt('Can infer absent attributes: for example, race and gender'),
_));

add(slide('Machine Bias',
   bulletedText('COMPAS: software used across the country to predict future criminals (recidivism)'),
   pause(),
   bulletedText('Propublica: it’s biased against blacks (higher false positive rates)'),  
   //parentCenter(image('images/feature-dependence.png').width(500)),
   pause(),
   bulletedText('Disputed by Northpointe Inc. (same precision)'),  
_));

function biasVarianceN() {
  return overlay(
    center(a = ellipse(350, 100).fillColor('brown').fillOpacity(0.2)),
    transform('All predictors').pivot(-1, -1).scale(0.8).shift(a.left(), a.top()),
    t = circle(5).fillColor('green').shiftBy(-300, 0),
    moveLeftOf('$\\green{f^*}$', t),
    e = ellipse(150, 60).strokeWidth(2).fillColor('blue').fillOpacity(0.3),
    moveRightOf(text(blue('Feature extraction')).scale(0.8), e),
    center('$\\blue{\\sF}$').shiftBy(-120, -50),
    b = circle(5).fillColor('orange').shift(e.left(), e.ymiddle()),
    moveBottomOf('$\\orange{g}$', b),
    c = circle(5).fillColor('brown').shiftBy(-10, 10),
    moveTopOf(text(brown('Learning')).scale(0.8), c),
    moveBottomOf('$\\brown{\\hat f}$', c),
    l1 = line(t, [e.left(), e.ymiddle()]).dashed(),
    moveCenterOf(opaquebg('approx. error').fillColor('brown').fillOpacity(0.2), l1).scale(0.8),
    l2 = line([e.left(), e.ymiddle()], c).dashed(),
    moveCenterOf(opaquebg('est. error').fillColor('blue').fillOpacity(0.3), l2).scale(0.8),
  _);
}

add(slide('Approximation and estimation error',
  parentCenter(biasVarianceN()),
  pause(),
  bulletedText('Generally, more data means smaller estimation error'),
     pause(),
     bulletedText('By definition, less data on minority groups.'),  
   pause(),
   bulletedText('Can lead to higher error rates on minority.'), 
_));


add(slide('Fairness',
   parentCenter(image('images/majority-minority.png').width(500)),
   pause(),
   bulletedText('Most ML training objectives will produce model accurate for majority class, at the expense of the minority one.'),  
_).rightHeader('Figure from Moritz Hardt'));


add(slide('Fairness',
stmt('Two classifiers with 5% error'), 
   parentCenter(image('images/error-analysis.png').width(500)),
_).rightHeader('Figure from Moritz Hardt'));



add(slide('References',
  headerList('Links',
		'https://fairmlclass.github.io/',
    'https://www.fatml.org/',
    'https://cdt.org/issue/privacy-data/digital-decisions/',
  _),
_));

add(slide('Responsibility',
   stmt('Principles for Accountable Algorithms: There is always a human ultimately responsible for decisions made or informed by an algorithm. "The algorithm did it" is not an acceptable excuse if algorithmic systems make mistakes or have undesired consequences, including from machine-learning processes'),
_).rightHeader('fatml.org'));


add(slide('Feedback loops',
  nil(),
  parentCenter(overlay(
    table(
      [d = frame('Data').padding(10), rightArrow(80), 'Hypothesis', rightArrow(80), y = frame('Predictions').padding(10)],
      pause(),
      [nil(), nil(), p = frame(image('images/users.png')).padding(10), nil(), nil()],
    _).center().margin(20),
    arrow(p, d).color('red'),
    arrow(y, p).color('red'),
  _)),
_));


/*add(slide(null,
  stmt('Traditional software'),
  parentCenter(tt('def sort(numbers): ...')),
  pause(),
  stmt('Machine learning software'),
  parentCenter(xtable(frameBox('parser'), thickRightArrow(50), frameBox('question answering')).center()),
  pause(),
  bulletedText('Improve parser?'),
  bulletedText('Add a new feature?'),
  pause(),
  bulletedText('Feedback loops: predict web pages based on what people click on...'),
  lesson('Everything depends on everything'),
_));*/

function hide(x) { return overlay(std(x).hideLevel(1), std(lightgray(x)).showLevel(1)); }
add(slide('Privacy',
  bulletedText('Not reveal sensitive information (income, health, communication)'),
  bulletedText('Compute average statistics (how many people have cancer?)'),
  parentCenter(table(
    [
      image('images/person.jpg').width(40),
      image('images/person.jpg').width(40),
      image('images/person.jpg').width(40),
      image('images/person.jpg').width(40),
      image('images/person.jpg').width(40),
    ], [
      hide('yes'),
      hide('no'),
      hide('yes'),
      hide('no'),
      hide('no'),
    ], pause(), [
      'no',
      'no',
      'yes',
      'no',
      'yes',
    ],
  _).margin(80, 10)),
_));

add(slide('Randomized response',
  parentCenter('Do you have a sibling?'),
  pause(),
  parentCenter(image('images/person.jpg').width(40)),
  parentCenter(frameBox(ytable(
    stmt('Method'),
    bulletedText('Flip two coins.'),
    bulletedText('If both heads: answer yes/no randomly'),
    bulletedText('Otherwise: answer yes/no truthfully'),
  _)).bg.fillColor('#F3E8B6').end.padding(10)),
  pause(),
  stmt('Analysis'),
  parentCenter(stagger(
    '$\\text{observed-prob} = \\frac{3}{4} \\times \\text{true-prob} + \\frac{1}{4} \\times \\frac{1}{2}$',
    '$\\text{true-prob} = \\frac{4}{3} \\times (\\text{observed-prob} - \\frac{1}{8})$',
  _).center()),
_).leftHeader('[Warner, 1965]'));


add(slide('Causality',
  stmt('Goal: figure out the effect of a treatment on survival'),
  pause(),
  stmt('Data'),
  parentCenter(frameBox(ytable(
    'For untreated patients, 80\% survive',
    'For treated patients, 30\% survive',
  _)).bg.fillColor('#F3E8B6').end.padding(10)),
  pause(),
  parentCenter(darkredbold('Does the treatment help?')),
  pause(),
  'Nothing!  Sick people are more likely to undergo treatment...',
_));


// That object recognizer that really brought in the deep learning
add(slide('Adversaries',
  parentCenter('AlexNet predicts correctly on the left'),
  parentCenter(image('images/adversarial-examples.png').width(350)),
  pause(),
  parentCenter('AlexNet predicts '+redbold('ostrich')+' on the right'),
_).leftHeader('[Szegedy et al., 2013; Goodfellow et al., 2014]'));

add(slide('Safety guarantees',
  bulletedText('For air-traffic control, threshold level of safety: probability $10^{-9}$ for a catastrophic failure (e.g., collision) per flight hour'),
  bulletedText('Move from human designed rules to a numeric Q-value table?'),
  pause(),
  parentCenter('yes'),
_).leftHeader('[Mykel Kochdorfer]'));


add(slide(null,
  parentCenter(image('images/concrete-problems-in-ai-safety.png')),
_));

add(slide(null,
  parentCenter(image('images/ai100-report.png').width(550)),
_));

add(slide(null,
  parentCenter(overlay(
    image('images/white-house-ai-report.png').width(400),
    pause(),
    image('images/white-house-ai-report-strategy.png').width(700),
  _).center()),
_));


add(slide('Other AI-related courses',
  parentCenter(text(redbold('http://ai.stanford.edu/courses/')).linkToUrl('http://ai.stanford.edu/courses/')),
  headerList('Foundations',
    'CS228: Probabilistic Graphical Models',
    'CS229: Machine Learning',
    'CS229T: Statistical Learning Theory',
    'CS334A: Convex Optimization',
    'CS238: Decision Making Under Uncertainty',
    //'CS239: Sequential Decision Making',
    'CS257: Logic and Artificial Intelligence',
    'CS246: Mining Massive Data Sets',
  _),
_));

add(slide('Other AI-related courses',
  parentCenter(text(redbold('http://ai.stanford.edu/courses/')).linkToUrl('http://ai.stanford.edu/courses/')),
  headerList('Applications',
    'CS224N: Natural Language Processing (with Deep Learning)',
    'CS224U: Natural Language Understanding',
    //'CS276: Information Retrieval and Web Search',
    'CS231A: Introduction to Computer Vision',
    'CS231N: Convolutional Neural Networks for Visual Recognition',
    //'CS224W: Social and Information Network Analysis',
    'CS223A: Introduction to Robotics',
    //'CS225B: Robot Programming Lab',
    'CS227B: General Game Playing',
  _),
_));

add(slide('Probabilistic graphical models (CS228)',
  parentCenter(twoLayerBayesNet({n1:3, n2: 6, undirected: true, label: true}).scale(0.4)),
  bulletedText('Forward-backward, variable elimination $\\Rightarrow$ belief propagation, variational inference'),
  bulletedText('Gibbs sampling $\\Rightarrow$ Markov Chain Monte Carlo (MCMC)'),
  bulletedText('Learning the structure'),
_));

add(slide('Machine learning (CS229)',
  parentCenter(image('images/overfitting-regression.jpg').width(150)),
  bulletedText('Boosting, bagging, feature selection'),
  bulletedText('Discrete $\\Rightarrow$ continuous'),
  bulletedText('K-means $\\Rightarrow$ mixture of Gaussians'),
  bulletedText('Q-learning $\\Rightarrow$ policy gradient'),
_));

add(slide('Statistical learning theory (CS229T)',
  stmt('Question: what are the mathematical principles behind learning?'),
  stmt('Uniform convergence: with probability at least 0.95, your algorithm will return a predictor $h \\in \\mathcal H$ such that'),
  parentCenter('$\\text{TestError}(h) \\le \\text{TrainError}(h) + \\sqrt{\\frac{\\text{Complexity}(\\mathcal H)}{n}}$'),
_));

add(slide('Cognitive science',
  parentCenter(image('images/brain-gears.jpg').width(150)),
  stmt('Question: How does the human mind work?'),
  bulletedText('Cognitive science and AI grew up together'),
  bulletedText('Humans can learn from few examples on many tasks'),
  stmt('Computation and cognitive science (PSYCH204)'),
  bulletedText('Cognition as Bayesian modeling &mdash; probabilistic program [Tenenbaum, Goodman, Griffiths]'),
_));

add(slide('Neuroscience',
  parentCenter(image('images/learning.png').width(250)),
  bulletedText('Neuroscience: hardware; cognitive science: software'),
  bulletedText('Artificial neural network as computational models of the brain'),
  bulletedText('Modern neural networks (GPUs + backpropagation) not biologically plausible'),
  bulletedText('Analogy: birds versus airplanes; what are principles of intelligence?'),
_));

add(slide('Online materials',
  bulletedText('Online courses (Coursera, edX)'),
  bulletedText('Videolectures.net: tons of recorded talks from major leaders of AI (and other fields)'),
  bulletedText('arXiv.org: latest research (pre-prints)'),
  bulletedText('Blog posts, tutorials'),
_));

add(slide('Conferences',
  bulletedText('AI: IJCAI, AAAI'),
  bulletedText('Machine learning: ICML, NIPS, UAI, COLT'),
  bulletedText('Data mining: KDD, CIKM, WWW'),
  bulletedText('Natural language processing: ACL, EMNLP, NAACL'),
  bulletedText('Computer vision: CPVR, ICCV, ECCV'),
  bulletedText('Robotics: RSS, ICRA'),
_));

add(slide(nil(),
  getEvolutionOfModels(9, 'none'),
  parentCenter('Please fill out course evaluations on Axess.'),
  parentCenter('Thanks for an exciting quarter!'),
_));

sfig.initialize();

