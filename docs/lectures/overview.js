G = sfig.serverSide ? global : this;
G.prez = presentation();

if (sfig_.urlParams.auth) {
  prez.addSlide(slide(null,
    nil(),
    'Fill out a poll here:',
    parentCenter(text(greenbold('cs221.stanford.edu/q')).scale(2.7)),
    ytable(
      'Loop:',
      indent('If the seat next to you towards the center is free:'),
      indent(indent('Move there.')),
    _),
  _).showIndex(false));
}

add(titleSlide('Lecture 1: Overview',
  nil(),
  parentCenter(image('images/galaxies.jpg').width(300)),
_));

// ./tab firstName,lastName var/cas.jsonl
var items = [
  'Andrey Kurenkov (head CA)',
  'Bryan He',
  'Zhi Bie',
  'Anna Wang',
  'Feiran Wang',
];

var rows = [];
var m = 1;
for (var i = 0; i < items.length; i += m) {
  var row = [];
  for (var j = 0; j < m; j++)
    row.push(items[i + j] || nil());
  rows.push(row);
}

add(slide('Teaching staff',
  parentCenter(ytable(
    'Dorsa Sadigh'.bold(),
    new Table(rows).margin(50, 5).scale(0.8),
  _).margin(20).center()).scale(0.9),
_).id('staff'));

function roadmap(i) {
  add(outlineSlide('Roadmap', i, [
    ['why', 'Why AI?'],
    ['what', 'How do we approach it?'],
    ['how', 'Course logistics'],
    ['optimization', 'Optimization'],
  ]));
}

add(slide('CS221 enrollments',
  parentCenter(barGraph([[2012, 182], [2013, 217], [2014, 370], [2015, 549], [2016, 660], [2017, 906], [2018, 120]]).xrange(2011, 2018).yrange(0, 800).xlength(400)),
_));

add(slide('CS221 breakdown by year',
  parentCenter(table(
    ['Freshman', 2],
    ['Sophomore', 14],
    ['Junior', 54],
    ['Senior', 21],
    ['GradYear1', 16],
    ['GradYear2', 6],
    ['GradYear3', 1],
    ['GradYear4+', 1],
    //['Prof1', 2],
    //['Prof2', 2],
    //['Prof3', 1],
  _).xjustify('lr').xmargin(40)),
_));

add(slide('CS221 breakdown by majors',
  parentCenter(xtable(
    table(
      ['Statistics', 1],
      ['Philosophy', 1],
      ['Physics', 1],
      ['Classics', 1],
      ['Mathematics', 1],
      ['Law', 1],
      ['Economics', 2],
      ['Electrical Engineering', 2],
      ['Materials Science &amp; Engr', 3],
      ['Mechanical Engineer', 3],
    _).xjustify('lr').xmargin(40),
    table(
      ['Mgmt Sci &amp; Engineering', 3],
      ['Bioengineering', 3],
      ['Comput &amp; Math Engr', 4],
      ['Business Administration', 4],
      ['Symbolic Systems', 5],
      ['Math &amp; Comp Science', 5],
      ['Civil &amp; Envir Engr', 5],
      ['Undeclared', 25],
      ['Computer Science', 50],
    _).xjustify('lr').xmargin(40),
  _).margin(100).scale(0.6)),
_));

////////////////////////////////////////////////////////////

roadmap(0);

add(dividerSlide(parentCenter('What is AI?'.italics())));

add(slide('The Turing Test (1950)',
  nil(),
  parentCenter(xtable(
    ytable(
      '"Can machines think?"',
      image('images/alan-turing.jpg').width(100),
    _).center(),
    pause(),
    image('images/turing-test.jpg'),
  _).margin(100).center()),
  pause(),
  parentCenter(ytable(
    nowrapText('Q: Please write me a sonnet on the subject of the Forth Bridge.'),
    nowrapText('A: Count me out on this one. I never could write poetry.'),
    nowrapText('Q: Add 34957 to 70764.'),
    nowrapText('A: (Pause about 30 seconds and then give as answer) 105621.'),
  _)).scale(0.8),
  pause(),
  parentCenter(redbold('Tests behavior &mdash; simple and objective')),
_));

prose(
  'Can machines think?  This is a question that has occupied philosophers since Decartes.',
  'But even the definitions of "thinking" and "machine" are not clear.',
  'Alan Turing, the renowned mathematician and code breaker who laid the foundations of computing,',
  'posed a simple test to sidestep these philosophical concerns.',
  _,
  'In the test, an interrogator converses with a man and a machine via a text-based channel.',
  'If the interrogator fails to guess which one is the machine, then the machine is said to have passed the Turing test.',
  '(This is a simplification but it suffices for our present purposes.)',
  _,
  'Although the Turing test is not without flaws (e.g., failure to capture visual and physical abilities, emphasis on deception),',
  'the beauty of the Turing test is its simplicity and objectivity.',
  'It is only a test of behavior, not of the internals of the machine.',
  'It doesn\'t care whether the machine is using logical methods or neural networks.',
  'This decoupling of what to solve from how to solve is an important theme in this class.',
_);

function f(x) {
  return text(x.match(/^Scott/) ? red(x) : blue(x)).fontSize(20);
}

add(slide(nil(),
  nil(),
  parentCenter(image('images/turing-test-venn.png')),
_));

prose(
  'Perhaps imitating humans is really the wrong metric when it comes to thinking about intelligence.',
  'It is true that humans possess abilities (language, vision, motor control) which currently surpass the best machines,',
  'but on the other hand, machines clearly possess many advantages over humans (e.g., speed, memory).',
  'Why settle for human-level performance?',
  _,
  'The study of how humans think is fascinating and well-studied within the field of cognitive science.',
  'In this class, however, we will primarily be concerned with the engineering goal of building intelligent systems,',
  'drawing from humans only as a source of solvable problems and high-level motivation.',
_);

add(dividerSlide(parentCenter('Some success stories...'.italics())));

prose(
  'Instead of asking what AI is, let us turn to the more pragmatic question of what AI can do.',
  'We will go through some examples where AI has been successful.',
  'Note that some of the examples are where AI is already widely deployed in practice,',
  'while others are fun but may not necessarily lead to something practically useful.',
_);

add(slide('Machine translation',
  parentCenter(image('images/google-translate.png').width(600)),
_), 'language');

prose(
  'Machine translation research started in the 1960s (the US government was quite keen on translating Russian into English).',
  'Over the subsequent decades, it went through quite a few rough turns.',
  _,
  'In the 1990s and 2000s, statistical machine translation, aided by large amounts of example human translations,',
  'helped vastly improve translation quality.',
  _,
  'As of 2015, Google Translate supports 90 languages and serves over 200 million people daily.',
  'The translations are nowhere near perfect, but they are very useful.',
  _,
  'In 2016, Google released a neural machine translation system which led to significant improvements',
  'in accuracy due to advances in deep learning, and as of July 2017, 30 languages are supported.',
_);

add(slide('Speech recognition',
  parentCenter(image('images/siricortanaetc3.jpg').width(700)),
_));

prose(
  'Speech recognition is the problem of transcribing audio into words.',
  'It too has a long history dating back to the 1970s.',
  'But it wasn\'t until around 2009 that speech recognition started to work well',
  'due to the adoption of deep neural networks.',
  _,
  'In a very short period of time, companies such as Apple, Google, Microsoft',
  'all adopted this technology.',
  'Furthermore, with the rise of smartphones, speech recognition began paving way for the emergence of',
  'virtual assistants such as Apple\'s Siri, Google Now, Microsoft Cortana, Amazon Echo, and others.',
  _,
  'However, speech recognition is only one part of the story; the other is understanding the text,',
  'which is a much harder problem.',
  'Current systems don\'t handle much more than simple utterances and actions',
  '(e.g., setting an alarm, sending a text, etc.),',
  'but the area of natural language understanding is growing rapidly.',
_);

add(slide('Face identification',
  nil(),
  parentCenter(image('images/face-detection.jpg')),
  parentCenter('human-level performance, but privacy issues?'),
_));

prose(
  'In 2014, Facebook Research published a paper describing their DeepFace face identification system.',
  'DeepFace is a 120 million parameter deep neural network and obtains 97.35\% on the standard Labeled Faces in the Wild (LFW) dataset,',
  'which is comparable to human performance.',
  'Facebook definitely has an upper hand when it comes to amassing training data for this task:',
  'whenever a user tags a person in a photo, he or she is providing a training example.',
  _,
  'However, a powerful technology such as this comes with non-technical impliciations.',
  'Privacy advocates strongly oppose the deployment of pervasive identification,',
  'because it would enable some entity (be it a company or a government) to take arbitrary images and videos',
  'of crowds and identify every single person in it,',
  'which would effectively eliminate the ability to stay anonymous.',
_);

add(slide(nil(),
  parentCenter(xtable(
    image('images/young-turing.png').width(300),
    text('“…the best thing we can do is to build a robot with TV cameras for its eyes and motors for its legs and have it run around the countryside and learn from the world.”').width(300),
  _).margin(50).center()),
_));

prose(
  'Back in the early 50s. Alan Turing one of the founders of AI said the best thing we can do is to build a robot with TV cameras for its eyes and motors for its legs and have it run around the countryside and learn from the world. But he decided that is too hard technologically, which was clearly true.',
  _,
  'So he said let’s leave the physical interaction for later and let’s work on more abstract problems for intelligence.',
_);

add(slide('Autonomous driving',
  parentCenter(stagger(
    image('images/google-car.jpeg').width(600),
  _)),
_), 'robotics');

prose(
  'And now we discuss some AI technologies which are promising but not quite ready for prime time.',
  _,
  'Research in autonomous cars started in the 1980s, but the technology wasn\'t there.',
  _,
  'Perhaps the first significant event was the 2005 DARPA Grand Challenge,',
  'in which the goal was to have a driverless car go through a 132-mile off-road course.',
  'Stanford finished in first place.',
  'The car was equipped with various sensors (laser, vision, radar), whose readings needed to be synthesized',
  '(using probabilistic techniques that we\'ll learn from this class)',
  'to localize the car and then generate control signals for the steering, throttle, and brake.',
  _,
  'In 2007, DARPA created an even harder Urban Challenge, which was won by CMU.',
  _,
  'In 2009, Google started a self-driving car program,',
  'and since then, their self-driving cars have driven over 1 million miles on freeways and streets.',
  _,
  'In January 2015, Uber hired about 50 people from CMU\'s robotics department to build self-driving cars.',
  _,
  'While there are still technological and policy issues to be worked out,',
  'the potential impact on transportation is huge.',
_);

add(slide('Reading comprehension',
  parentCenter(image('images/squad-example.png')),
_).rightHeader('[SQuAD dataset; Rajpurkar et al. 2016]'));

prose(
  'Natural language understanding generally is still widely regarded as an unsolved problem.',
  'One of the specific incarnations is the task of reading comprehension:',
  'given a passage, the goal is to answer a question about the passage (think standardized tests).',
  _,
  'One of the popular recent datasets for reading comprehension is SQuAD,',
  'which has 100K questions taken from Wikipedia.',
  'Current methods (see stanford-qa.com) do quite well on this dataset,',
  'but as a student can pass a standardized test without true understanding,',
  'recent work shows that such systems can get fooled by more probing questions.',
_);

add(slide('Image generation',
  parentCenter(image('images/stackgan-results.png').width(500)),
_).rightHeader('[StackGANs; Zhang et al, 2016]'));

prose(
  'One particular hot topic in computer vision right now is generating photorealistic images from text.',
  'The results are becoming visually quite convincing, owing largely to advances such as Generative Adversarial Networks (GANs).',
  'However, keep in mind that it is hard to judge the quality of a system from looking at a single image,',
  'as the "copy a training example" strategy also works quite well.',
_);

add(slide('Artistic style transfer',
  nil(),
  parentCenter(overlay(
    xtable(
      image('images/hoovertowernight.jpg').width(350),
      image('images/starry_night_google.jpg').width(350),
    _),
    pause(),
    ytable(
      yspace(100),
      image('images/starry_stanford_bigger.png').width(700),
    _),
  _)),
_).rightHeader('[from Justin Johnson\'s implementation of Gatys et al. 2015]'));

prose(
  'Another form of image generation is style transfer,',
  'in which we are given a "content image" and a "style image",',
  'and the goal is to generate a new image with the given contents and style.',
  'Though easier in many ways than generating an image from scratch,',
  'this leads to quite visually pleasing and stunning results.',
_);

add(slide('Predicting poverty',
  nil(),
  parentCenter(overlay(
    image('images/poverty-input.png').width(450),
    pause(),
    image('images/poverty-output.jpg').width(500).shift(100, 50),
  _)),
_).rightHeader('[Jean et al. 2016]'));

prose(
  'Computer vision also can be used to tackle social problems.',
  'Poverty is a huge problem, and even identifying the areas of need is difficult due to the difficulty in getting reliable survey data.',
  'Recent work has shown that one can take satellite images (which are readily available) and predict various poverty indicators.',
_);

add(slide('Saving energy by cooling datacenters',
  parentCenter(image('images/google-cooling-datacenter.png').width(700)),
_).rightHeader('[DeepMind]'));

prose(
  'Machine learning can also be used to optimize the energy efficiency of datacenters,',
  'which given the hunger for compute these days makes a big difference.',
  'Some recent work from DeepMind show how to significantly reduce Google\'s energy footprint',
  'by using machine learning to predict the power usage effectiveness from sensor measurements such as pump speeds,',
  'and using that to drive recommendations.',
_);

add(slide('Humans versus machines',
  nil(),
  parentCenter(table(
    [image('images/gary-kasparov.jpg').width(300), pause(), image('images/ibm-watson.jpg')], pause(-1),
    ['1997: Deep Blue (chess)', pause(), '2011: IBM Watson (Jeopardy!)'],
  _).center().margin(70, 20)),
_));

prose(
  'Perhaps the aspect of AI that captures the public\'s imagination the most is in defeating humans at their own games.',
  _,
  'In 1997, Deep Blue defeated Gary Kasparov, the world chess champion.',
  'In 2011, IBM Watson defeated two of the biggest winners (Brad Rutter and Ken Jennings) at the quiz show Jeopardy!',
  '(IBM seems to be pretty good at performing these kind of stunts.)',
  _,
  'One could have argued that Deep Blue won simply by the sheer force of its computational prowess,',
  'whereas winning Jeopardy! involved understanding natural language, and this defeat hit closer to home.',
_);

add(slide('Humans versus machines',
  parentCenter(image('images/alpha-go.jpg')),
  parentCenter(image('images/tree-search.png').width(500)),
_));

prose(
  'March 2016 gave us another seminal result in game playing, this time in the ancient game of Go.',
  'Unlike chess, which fell to efficient search algorithms,',
  'Go styimed computer programs for a very long time, as the the space of possible moves in Go is much larger.',
  _,
  'Google DeepMind created a program called AlphaGo, which used deep neural networks and reinforcement learning (techniques we\'ll cover later in this class),',
  'to defeat Lee Sedol, a 9-dan professional, 4-1 in a stunning five-game match,',
  'surprising not only the master Go player but many AI researchers as well.',
  _,
  'Since then, the program has improved even more.',
  'In May 2017, AlphaGo defeated Ke Jie, who was ranked first in the world.',
_);

add(dividerSlide(parentCenter('Some failures...'.italics())));

prose(
  'It would be remiss not to also show the failure modes of AI, which can actually be quite serious and surprising.',
  'These failures show that there are still important and natural tasks that humans routinely perform with ease,',
  'that still pose difficult, open research problems.',
_);

/*
for x in *.gif; do echo $x; convert "$x[0]" $x.png; done
*/
function gif(x) {
  return sfig.serverSide ? x + '.png' : x;
}

add(slide('2015 DARPA Robotics Challenge',
  parentCenter(table(
    [image(gif('images/drc-fail1.gif')), image(gif('images/drc-fail2.gif'))],
    [image(gif('images/drc-fail3.gif')), image(gif('images/drc-fail4.gif'))],
  _).margin(10).scale(0.4)),
_));

prose(
  'In the 2015 DARPA Robotics Challenge (DRC),',
  'robots were asked to perform a series of eight tasks motivated by a disaster relief scenario',
  '(e.g., getting out of a car and opening a door).',
  _,
  'While some teams did manage to successfully completely these tasks,',
  'many also failed spectacularly.',
  'One can certainly find videos of robots moving with considerable more grace,',
  'which is possible in controlled situations,',
  'but in unstructured environments, it is much harder.',
_);

add(slide('Open-domain dialogue',
  parentCenter(ytable(
    'A: How old are you?',
    'B: I’m 16. Why are you asking?',
    'A: I thought you were 12.',
    'B: What made you think so?',
    'A: I don’t know what you are talking about.',
    'B: You don’t know what you are saying.',
  _)),
_).rightHeader('[Li et al., 2016]'));

prose(
  'We still don\'t have computers that we have a natural conversation with.',
  'While training deep neural networks on huge amounts of data has worked beautifully for speech recognition and machine translation,',
  'recent attempts in open-domain dialogue have not produced sensible results.',
  'Models get confused by the sheer complexity of dialogue and often fall back to generic responses as shown here.',
_);

add(slide('Adversarial examples',
  parentCenter('AlexNet predicts correctly on the left'),
  parentCenter(image('images/adversarial-examples.png').width(350)),
  pause(),
  parentCenter('AlexNet predicts '+redbold('ostrich')+' on the right'),
_).leftHeader('[Szegedy et al., 2013; Goodfellow et al., 2014]'));

prose(
  'Failures aren\'t just in extremely hard problems such as robotics and dialogue,',
  'but can be found in much easier tasks.',
  _,
  'An iconic example are adversarial examples where one can perturb an image by a carefully chosen, but imperceptible amount,',
  'and cause a state-of-the-art model to misclassify the image.',
  _,
  'These examples pose security problems as computer vision is adopted in self-driving cars and authentication systems.',
  'But more fundamentally, these examples shows that current methods clearly are not learning "the right thing" as defined by the human visual system.',
_);

add(slide('Bias',
  parentCenter(image('images/vsrl-bias.png').width(700)),
  parentCenter('33\% men in training set, only predict 16\% men at test time'),
  pause(),
  parentCenter('society $\\Rightarrow$ data $\\Rightarrow$ machine learning predictions'),
_).rightHeader('[Zhao et al., 2017]'));

prose(
  'A more subtle case is the issue of bias.',
  'One might naively think that since machine learning algorithms are based on mathematical principles,',
  'that they are somehow objective.',
  'However, machine learning predictions come from the training data, and the training data comes from society,',
  'so any biases in society are reflected in the data and propagated to predictions.',
  'The issue of bias is a real concern when machine learning is used to decide whether an individual should receive a loan or get a job.',
_);

add(dividerSlide(parentCenter('In the spotlight...'.italics())));

add(slide('Companies',
  table(
    [image('images/google.jpg').width(100), text('"An important shift from a mobile first world to an AI first world" [CEO Sundar Pichai @ Google I/O 2017]').width(650)], 
    [image('images/microsoft.png').width(100), text('Created AI and Research group as 4th engineering division, now 8K people [2016]').width(650)],
    [image('images/facebook.png').width(100), text('Created Facebook AI Research, Mark Zuckerberg very optimistic and invested').width(650)],
  _).margin(10, 50).yjustify('c'),
  stmt('Others: IBM, Amazon, Apple, Uber, Salesforce, Baidu, Tencent, etc.'),
_));

prose(
  'Given the velocity of the recent developments in AI,',
  'AI has been embraced by the major tech companies,',
  'with very explicit endorsement from the top-down leadership.',
_);

add(slide(null,
  parentCenter(overlay(
    image('images/white-house-ai-report.png').width(400),
    pause(),
    image('images/white-house-ai-report-strategy.png').width(700),
  _).center()),
_));

add(slide('Governments',
  table(
    [image('images/flag-usa.png').width(100), text('"AI holds the potential to be a major driver of economic growth and social progress" [White House report, 2016]').width(650)], 
    [image('images/flag-china.png').width(100), text('Released domestic strategic plan to become world leader in AI by 2030 [2017]').width(650)],
    [image('images/flag-russia.png').width(100), text('"Whoever becomes the leader in this sphere [AI] will become the ruler of the world" [Putin, 2017]').width(650)],
  _).margin(10, 70).yjustify('c'),
_));

prose(
  'Governments are noticing as well.',
  'In 2016, the White House put out a report describing the priorities of AI.',
  'China is investing extremely heavily in AI and is very ambitious about their goals.',
_);

add(slide(nil(),
  nil(),
  parentCenter(image('images/second-machine-age.jpg').width(250)),
_));

prose(
  'Some even predict that AI will be as transformative on society as the agricultural and industrial revolutions.',
  'Just as the industrial revolution provided a solution to the problem of physical labor,',
  'AI promises to provide a solution to the problem of mental labor.',
_);

add(slide(null,
  nil(),
  parentCenter(youtube('aygSMgK3BEM', {cache: false, time: 109})),
  pause(),
  bulletedText(green('1956: Dartmouth workshop, John McCarthy coined "AI"')),
  bulletedText(green('1960: checkers playing program, Logical Theorist')),
  pause(),
  bulletedText(red('1966: ALPAC report cuts off funding for translation')),
  bulletedText(red('1974: Lighthill report cuts off funding in UK')),
  pause(),
  bulletedText(green('1970-80s: expert systems (XCON, MYCIN) in industry')),
  bulletedText(green('1980s: Fifth-Generation Computer System (Japan); Strategic Computing Initative (DARPA)')),
  pause(),
  bulletedText(red('1987: collapse of Lisp market, government funding cut')),
  pause(),
  bulletedText(green('1990-: rise of machine learning')),
  bulletedText(green('2010s: heavy industry investment in deep learning')),
_).id('history'));

prose(
  'But such optimism is not new.',
  'People in the 1960s, when computers were still fresh, had similar dreams.',
  'Ok, so maybe people misjudged the difficulty of the problem.',
  'But it happened again in the 1980s, leading to another AI winter.',
  'During these AI winters, people eschewed the phrase "artificial intelligence"',
  'as not to be labeled as a hype-driven lunatic.',
  _,
  'In the latest rebirth, we have new machine learning techniques,',
  'tons of data, and tons of computation.',
  'So each cycle, we are actually making progress.',
  'Will this time be different?',
  _,
  'We should be optimistic and inspired about the potential impact that advances in AI can bring.',
  'But at the same time, we need to be grounded and not be blown away by hype.',
  'This class is about providing that grounding,',
  'showing how AI problems can be treated rigorously and mathematically.',
  'After all, this class is called "Artificial Intelligence: Principles and Techniques".',
_);

add(quizSlide('overview-impact',
  'Now what do you think AI will achieve by 2030?',
  'Hype will die down, will have limited impact',
  'Will be very useful, but only in narrow verticals',
  'Will match humans at many tasks but not all',
  'Will match or surpass humans at everything',
_));

add(slide(null,
    nil(),
    parentCenter(youtube('_9Ny2ghjwuY', {cache: false, time: 1285})),
  _));

add(slide('Characteristics of AI tasks',
  pause(),
  parentCenter(bold('High societal impact')+' (affect billions of people)'), pause(),
  parentCenter(bold('Diverse')+' (language, games, robotics)'), pause(),
  parentCenter(bold('Complex')+' (really hard)'),
_));

prose(
  'What\'s in common with all of these examples?',
  _,
  'It\'s clear that AI applications tend to be very <b>high impact</b>.',
  _,
  'They are also incredibly <b>diverse</b>, operating in very different domains, and requiring integration with many different modalities (natural language, vision, robotics).',
  'Throughout the course, we will see how we can start to tame this diversity with a few fundamental principles and techniques.',
  _,
  'Finally, these applications are also mind-bogglingly <b>complex</b> to the point where we shouldn\'t expect to find solutions that solve these problems perfectly.',
_);

add(dividerSlide(italics('Two sources of complexity...')));

add(slide(null,
  parentCenter(image('images/alpha-go.jpg')),
  parentCenter(image('images/tree-search.png').width(500)),
  pause(),
  parentCenter(red('Computational complexity: exponential explosion').bold()),
_).id('computation'));

prose(
  'There are two sources of complexity in AI tasks.',
  _,
  'The first, which you, as computer scientists, should be familiar with, is <b>computational complexity</b>.',
  'We can solve useful problems in polynomial time, but most interesting AI problems &mdash; certainly the ones we looked at &mdash; are NP-hard.',
  'We will be constantly straddling the boundary between polynomial time and exponential time, or in many cases, going from exponential time with a bad exponent to exponential time with a less bad exponent.',
  _,
  'For example, in the game of Go, there are up to 361 legal moves per turn, and let us say that the average game is about 200 turns.',
  'Then, as a crude calculation, there might be $361^{200}$ game trajectories that a player would have to consider to play optimally.',
  'Of course, one could be more clever, but the number of possibilities would still remain huge.',
_);

add(slide(nil(),
  parentCenter(xtable(
    chineseText(green('这是什么意思？')), pause(),
    image('images/weka.jpg').width(200),
  _).margin(80).center()),
  pause(),
  'Even infinite computation isn\'t enough...need to somehow '+italics('know')+' stuff.',
  pause(),
  parentCenter(redbold('Information complexity: need to acquire knowledge')),
_).id('information'));

prose(
  'The second source of complexity, which you might not have thought of consciously, is <b>information complexity</b>.',
  _,
  '(Note that there are formal ways to characterize information based on Shannon entropy, but we are using the term information rather loosely here.)',
  'Suppose I gave you (really, your program) literally infinite computational resources, locked you (or your program) in a room, and asked you to translate a sentence.',
  'Or asked you to classify an image with the type of bird (it\'s a Weka from New Zealand, in case you\'re wondering).',
  _,
  'In each of these cases, increasing the amount of computation past a certain point simply won\'t help.',
  'In these problems, we simply need the information or knowledge about a foreign language or ornithology to make optimal decisions.',
  'But just like computation, we will be always information-limited and therefore have to simply cope with <b>uncertainty</b>.',
_);

add(slide('Resources',
  nil(),
  parentCenter(table(
    ['Computation (time/memory)', pause(), 'Information (data)'], pause(-1),
    [image('images/datacenter.jpg').dim(200), pause(), image('images/books.jpg').dim(200)],
  _).margin(50).center()),
_));

prose(
  'We can switch vantage points and think about resources to tackle the computational and information complexities.',
  _,
  'In terms of computation, <b>computers</b> (fast CPUs, GPUs, lots of memory, storage, network bandwidth) is a resource.',
  'In terms of information, <b>data</b> is a resource.',
  _,
  'Fortunately for AI, in the last two decades, the amount of computing power and data has skyrocketed,',
  'and this trend coincides with our ability to solve some of the challenging tasks that we discussed earlier.',
_);

add(summarySlide('Summary so far',
  bulletedText('Potentially transformative impact on society'),
  bulletedText('Applications are diverse and complex'),
  bulletedText('Challenges: computational/information complexity'),
_));

////////////////////////////////////////////////////////////

roadmap(1);

add(dividerSlide(
  stagger(
    'How do we solve these challenging AI tasks?'.italics(),
    'How do we <del>solve</del> <ins>tackle</ins> these challenging AI tasks?'.italics(),
  _),
_).id('how'));

add(slide('How?',
  nil(),
  parentCenter(xtable(
    image('images/traffic-jam.jpg').width(200),
    pause(),
    image('images/source-code.png').width(150),
  _).margin(300).center()),
_));

prose(
  'So having stated the motivation for working on AI and the challenges, how should we actually make progress?',
  _,
  'The real world is complicated.',
  'At the end of the day, we need to write some code (and possibly build some hardware too).',
  'But there is a huge chasm.',
_);


add(slide('Paradigm',
  nil(),
  parentCenter(paradigm()),
_));

prose(
  'In this class, we will adopt the <b>modeling-inference-learning</b> paradigm to help us navigate the solution space.',
  'In reality, the lines are blurry, but this paradigm serves as an ideal and a useful guiding principle.',
_);

add(slide('Paradigm: modeling',
  parentCenter(yseq(
    frameBox(xtable(
      'Real world',
      image('images/traffic-jam.jpg').width(200),
    _).margin(10).center()).bg.round(10).end, pause(),
    labeledDownArrow(modeling()),
    frameBox(xtable(
      'Model',
      smallGraph({showWeights: true, showPath: false}),
    _).margin(10).center()).bg.round(10).end, pause(),
  _).center()),
_));

prose(
  'The first pillar is modeling.',
  'Modeling takes messy real world problems and packages them into neat formal mathematical objects called <b>models</b>,',
  'which can be subject to rigorous analysis but is more amenable to what computers can operate on.',
  'However, modeling is lossy: not all of the richness of the real world can be captured,',
  'and therefore there is an art of modeling: what does one keep versus ignore?',
  '(An exception to this is games such as Chess or Go or Sodoku, where the real world is identical to the model.)',
  _,
  'As an example, suppose we\'re trying to have an AI that can navigate through a busy city.',
  'We might formulate this as a graph where nodes represent points in the city.',
_);

add(slide('Paradigm: inference',
  parentCenter(yseq(
    frameBox(xtable(
      'Model',
      smallGraph({showWeights: true, showPath: false}),
    _).margin(10).center()).bg.round(10).end, pause(),
    labeledDownArrow(inference()),
    frameBox(xtable(
      'Predictions',
      smallGraph({showWeights: true, showPath: true}),
    _).margin(10).center()).bg.round(10).end, pause(),
  _).center()),
_));

prose(
  'The second pillar is inference.',
  'Given a model, the task of <b>inference</b> is to answer questions with respect to the model.',
  'For example, given the model of the city, one could ask questions such as: what is the shortest path? what is the cheapest path?',
  _,
  'For some models, computational complexity can be a concern (games such as Go),',
  'and usually approximations are needed.',
_);

add(slide('Paradigm: learning',
  parentCenter(yseq(
    frameBox(xtable(
      'Model without parameters',
      smallGraph({showWeights: false}),
    _).margin(10).center()).bg.round(10).end, pause(),
    '+data',
    labeledDownArrow(learning()),
    frameBox(xtable(
      'Model with parameters',
      smallGraph({showWeights: true}),
    _).margin(10).center()).bg.round(10).end, pause(),
  _).center()),
_));

prose(
  'But where does the model come from?',
  'Remember that the real world is rich, so if the model is to be faithful,',
  'the model has to be rich as well.',
  'This is where information complexity rears its head.',
  'We can\'t possibly write down a model manually.',
  _,
  'The idea behind (machine) <b>learning</b> is to instead get it from data.',
  'Instead of constructing a model,',
  'one constructs a skeleton of a model (more precisely, a model family), which is a model without parameters.',
  'And then if we have the right type of data,',
  'we can run a machine learning algorithm to tune the parameters of the model.',
_);

add(slide('Course plan',
  nil(),
  getEvolutionOfModels(0),
_), 'learning');

prose(
  'We now embark on our tour of the topics in this course.',
  'The topics correspond to types of models that we can use to represent real-world tasks.',
  'The topics will in a sense advance from low-level intelligence to high-level intelligence,',
  'evolving from models that simply make a reflex decision to models that are based on logical reasoning.',
_);

add(slide('Machine learning',
  parentCenter(xtable(frameBox('Data'), bigRightArrow(), frameBox('Model')).center().margin(20)), 
  bulletedText('The main driver of recent successes in AI'),
  bulletedText('Move from "code" to "data" to manage the information complexity'),
  bulletedText('Requires a leap of faith: <b>generalization</b>'),
_));

prose(
  'Supporting all of these models is <b>machine learning</b>,',
  'which has been arguably the most crucial ingredient powering recent successes in AI.',
  'Conceptually, machine learning allows us to shift the information complexity of the model from code to data,',
  'which is much easier to obtain (either naturally occurring or via crowdsourcing).',
  _,
  'The main conceptually magical part of learning is that if done properly, the trained model will be able to produce good predictions beyond the set of training examples.',
  'This leap of faith is called <b>generalization</b>, and is, explicitly or implicitly, at the heart of any machine learning algorithm.',
  'This can even be formalized using tools from probability and statistical learning theory.',
_);

evolutionOfModels(1);

add(slide('What is this animal?',
  pause(), nil(),
  parentCenter(stagger(image('images/zebra.jpg'), nil())),
_));

add(slide('Reflex-based models',
  bulletedText('Examples: linear classifiers, deep neural networks'),
  parentCenter(image('images/deepface-cnn.png').width(750)),
  bulletedText('Most common models in machine learning'),
  bulletedText('Fully feed-forward (no backtracking)'),
_).leftHeader(image('images/hotstove.jpg').width(150)), 'reflex');

prose(
  'The idea of a reflex-based model simply performs a fixed sequence of computations on a given input.',
  'Examples include most models found in machine learning from simple linear classifiers to deep neural networks.',
  'The main characteristic of reflex-based models is that their computations are feed-forward;',
  'one doesn\'t backtrack and consider alternative computations.',
  'Inference is trivial in these models because it is just running the fixed computations, which makes these models appealing.',
_);

add(slide('Course plan',
  nil(),
  getEvolutionOfModels(2),
_), 'state-based models');

add(slide('State-based models',
  parentCenter(image('images/chess-board.png').width(300)),
  parentCenter('White to move'),
_));

add(slide('State-based models',
  parentCenter(image('images/tree-search.png').width(400)),
  stmt('Applications'),
  bulletedText('Games: Chess, Go, Pac-Man, Starcraft, etc.'),
  bulletedText('Robotics: motion planning'),
  bulletedText('Natural language generation: machine translation, image captioning'),
_));

prose(
  'Reflex-based models are too simple for tasks that require more forethought (e.g., in playing chess or planning a big trip).',
  'State-based models overcome this limitation.',
  _,
  'The key idea is, at a high-level, to model the <b>state</b> of a world and transitions between states which are triggered by actions.',
  'Concretely, one can think of states as nodes in a graph and transitions as edges.',
  'This reduction is useful because we understand graphs well and have a lot of efficient algorithms for operating on graphs.',
_);

add(slide('State-based models',
  stmt('Search problems: you control everything'),
  parentCenter(overlay(
    xtable(a = node(), b = node(), c = node()).margin(50),
    arrow(a, b),
    arrow(b, c),
  _)),
  pause(),
  stmt('Markov decision processes: against nature (e.g., Blackjack)'),
  parentCenter(overlay(
    xtable(a = node(), b = node(), ytable(c1 = node(), c2 = node()).margin(20)).margin(50).center(),
    arrow(a, b),
    arrow(b, c1),
    arrow(b, c2),
    moveTopOf(image('images/dice.png').width(50), b),
  _)),
  pause(),
  stmt('Adversarial games: against opponent (e.g., chess)'),
  parentCenter(overlay(
    xtable(a = node(), b = node(), ytable(c1 = node(), c2 = node()).margin(20)).margin(50).center(),
    arrow(a, b),
    arrow(b, c1),
    arrow(b, c2),
    moveTopOf(image('images/devil.jpg').width(50), b),
  _)),
_));

prose(
  'Search problems are adequate models when you are operating in environment that has no uncertainty.',
  'However, in many realistic settings, there are other forces at play.',
  _,
  '<b>Markov decision processes</b> handle tasks with an element of chance (e.g., Blackjack), where the distribution of randomness is known (reinforcement learning can be employed if it is not).',
  _,
  '<b>Adversarial games</b>, as the name suggests, handle tasks where there is an opponent who is working against you (e.g., chess).',
_);

add(slide('Pac-Man',
  nil(),
  //parentCenter(image('images/pacman_multi_agent.png')),
  //parentCenter('[demo]'),
  parentCenter(linkToVideo(image('images/pacman_multi_agent.png'), 'pacman.mp4')),
_));

add(quizSlide('overview-pacman',
  'What kind of model is appropriate for playing Pac-Man against ghosts that move into each valid adjacent square with equal probability?',
  'search problem',
  'Markov decision process',
  'adversarial game',
_));

evolutionOfModels(3);

add(slide('Sudoku',
  parentCenter(xtable(
    image('images/sudoku.png'),
    rightArrow(50).strokeWidth(5),
    image('images/sudoku-solution.png'),
  _).margin(20).center()),
  stmt('Goal', 'put digits in blank squares so each row, column, and 3x3 sub-block has digits 1&ndash;9'),
  pause(),
  stmt('Note: order of filling squares doesn\'t matter in the evaluation criteria!'),
_));

prose(
  'In state-based models, solutions are procedural: they specify step by step instructions on how to go from A to B.',
  'In many applications, the order in which things are done isn\'t important.',
_);

add(slide('Variable-based models',
  stmt('Constraint satisfaction problems: hard constraints (e.g., Sudoku, scheduling)'),
  parentCenter(cspGraph({})),
  pause(),
  stmt('Bayesian networks: soft dependencies (e.g., tracking cars from sensors)'),
  parentCenter(hmm({maxTime: 5})).scale(0.8),
_));

prose(
  '<b>Constraint satisfaction problems</b> are variable-based models where we only have hard constraints.',
  'For example, in scheduling, we can\'t have two people in the same place at the same time.',
  _,
  '<b>Bayesian networks</b> are variable-based models where variables are random variables which are dependent on each other.',
  'For example, the true location of an airplane $H_t$ and its radar reading $E_t$ are related, as are the location $H_t$ and the location at the last time step $H_{t-1}$.',
  'The exact dependency structure is given by the graph structure and formally defines a joint probability distribution over all the variables.',
  'This topic is studied thoroughly in  probabilistic graphical models (CS228).',
_);

evolutionOfModels(4);

add(slide('Logic',
  bulletedText('Dominated AI from 1960s-1980s, still useful in programming systems'),
  bulletedText('Powerful representation of knowledge and reasoning'),
  bulletedText('Brittle if done naively'),
  bulletedText('Open question: how to combine with machine learning?'),
_));

prose(
  'Our last stop on the tour is <b>logic</b>.',
  'Even more so than variable-based models, logic provides a compact language for modeling, which gives us more expressivity.',
  _,
  'It is interesting that historically, logic was one of the first things that AI researchers started with in the 1950s.',
  'While logical approaches were in a way quite sophisticated, they did not work well on complex real-world tasks with noise and uncertainty.',
  'On the other hand, methods based on probability and machine learning naturally handle noise and uncertainty,',
  'which is why they presently dominate the AI landscape.',
  'However, they have yet to be applied successfully to tasks that require really sophisticated reasoning.',
  _,
  'In this course, we will appreciate the two as not contradictory, but simply tackling different aspects of AI &mdash;',
  'in fact, in our schema, logic is a class of models which can be supported by machine learning.',
  'An active area of research is to combine the richness of logic with the robustness and agility of machine learning.',
_);

add(slide('Motivation: virtual assistant',
  parentCenter(xtable(
    pause(),
    ytable( 
      '<b>Tell</b> information',
      bigRightArrow(200),
    _),
    pause(-1),
    image('images/brain-gears.jpg').height(180),
    pause(2),
    ytable( 
      '<b>Ask</b> questions',
      bigLeftArrow(200),
    _),
  _).center().margin(30)),
  pause(),
  parentCenter(redbold('Use natural language!')),
  parentCenter(linkToVideo('[demo]', 'logic.mp4')),
  pause(),
  headerList('Need to',
    'Digest <b>heterogenous</b> information',
    'Reason <b>deeply</b> with that information',
  _),
_));

prose(
  'One motivation for logic is a virtual assistant.',
  'At an abstract level, one fundamental thing a good personal assistant',
  'should be able to do is to take in information from people',
  'and be able to answer questions that require drawing inferences from these facts.',
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

evolutionOfModels(5);

////////////////////////////////////////////////////////////

roadmap(2);

add(slide('Course objectives',
  importantBox('Before you take the class, you should know...',
    bulletedText('Programming (CS 106A, CS 106B, CS 107)'),
    bulletedText('Discrete math (CS 103)'),
    bulletedText('Probability (CS 109)'),
  _),
  pause(),
  importantBox('At the end of this course, you should...',
    bulletedText('Be able to tackle real-world tasks with the appropriate models and algorithms'),
    bulletedText('Be more proficient at math and programming'),
  _),
_));

add(slide('Coursework',
  bulletedText('Homeworks (60%)'),
  bulletedText('Exam (20%)'),
  bulletedText('Project (20%)'),
_).leftHeader(image('images/homework.jpg')));

add(slide('Homeworks',
  bulletedText('8 homeworks, mix of written and programming problems, centers on an application'),
  parentCenter(table(
    ['Introduction'.bold(), 'foundations'],
    ['Machine learning'.bold(), 'sentiment classification'],
    ['Search'.bold(), 'text reconstruction'],
    ['MDPs'.bold(), 'blackjack'],
    ['Games'.bold(), 'Pac-Man'],
    ['CSPs'.bold(), 'course scheduling'],
    ['Bayesian networks'.bold(), 'car tracking'],
    ['Logic'.bold(), 'language and logic'],
  _).margin(80, 10).scale(0.6)),
  bulletedText('Some have competitions for extra credit'),
  bulletedText('When you submit, programming parts will be sanity checked on basic tests; your grade will be based on hidden test cases'),
_));

add(slide('Exam',
  bulletedText('Goal: test your ability to use knowledge to solve new problems, not know facts'),
  bulletedText('All written problems, similar to written part of homeworks'),
  bulletedText('Closed book except one page of notes'),
  bulletedText('Covers all material up to and including preceding week'),
  bulletedText('Tue May 29 from 6pm to 9pm (3 hours)'),
_));

add(slide('Project',
  bulletedText('Goal: choose any task you care about and apply techniques from class'),
  bulletedText('Work in groups of up to 3; find a group early, your responsibility to be in a good group'),
  bulletedText('Milestones: proposal, progress report, poster session, final report'),
  bulletedText('Task is completely open, but must follow well-defined steps: task definition, implement baselines/oracles, evaluate on dataset, literature review, error analysis (read website)'),
  bulletedText('Help: assigned a CA mentor, come to any office hours'),
_));

add(slide('Policies',
  stmt('Late days: 8 total late days, max two per assignment'),
  stmt('Regrades: come in person to the owner CA of the homework'),
  stmt('Piazza: ask questions on Piazza, don\'t email us directly'),
  stmt('Piazza: extra credit for students who help answer questions'),
  parentCenter(bold('All details are on the course website')),
_));

add(slide(null,
  parentCenter(image('images/honor-code.jpg')),
  pause(),
  bulletedText('Do collaborate and discuss together, but write up and code independently.'),
  bulletedText('Do not look at anyone else\'s writeup or code.'),
  bulletedText('Do not show anyone else your writeup or code or post it online (e.g., GitHub).'),
  bulletedText('When debugging, only look at input-output behavior.'),
  bulletedText('We will run MOSS periodically to detect plagarism.'),
  pause(),
  parentCenter(overlay(
    image('images/cheating.jpg').width(150),
    pause(),
    image('images/x.png').width(150),
  _).center()),
_));

////////////////////////////////////////////////////////////

roadmap(3);

add(slide('Optimization',
  stmt('Discrete optimization: a discrete object'),
  parentCenter('$\\min\\limits_{p \\in \\text{Paths}} \\text{Distance}(p)$'),
  indent(redbold('Algorithmic')+' tool: dynamic programming'),
  pause(),
  stmt('Continuous optimization: a vector of real numbers'),
  parentCenter('$\\min\\limits_{\\mathbf w \\in \\R^d} \\text{TrainingError}(\\mathbf w)$'),
  indent(redbold('Algorithmic')+' tool: gradient descent'),
_));

prose(
  'We are now done with the high-level motivation for the class.',
  'Let us now dive into some technical details.',
  'Let us focus on the inference and the learning aspect of the <b>modeling-inference-learning</b> paradigm.',
  _,
  'We will approach inference and learning from an <b>optimization</b> perspective,',
  'which provides both a mathematical specification of <b>what</b> we want to compute',
  'and the algorithms for <b>how</b> we compute it.',
  _,
  'In total generality, optimization problems ask that you find the $x$ that lives in a constraint set $C$',
  'that makes the function $F(x)$ as small as possible.',
  _,
  'There are two types of optimization problems we\'ll consider: discrete optimization problems (mostly for inference) and continuous optimization problems (mostly for learning).',
  'Both are backed by a rich research field and are interesting topics in their own right.',
  'For this course, we will use the most basic tools from these topics: <b>dynamic programming</b> and <b>gradient descent</b>.',
  _,
  'Let us do two practice problems to illustrate each tool.',
  'For now, we are assuming that the model (optimization problem) is given and only focus on <b>algorithms</b>.',
_);

add(slide(null,
  problem('computing edit distance',
    stmt('Input: two strings, $s$ and $t$'),
    stmt('Output: minimum number of character insertions, deletions, and substitutions it takes to change $s$ into $t$'),
  _),
  stmt('Examples'),
  parentCenter(table(
    ['"cat", "cat"', '$\\Rightarrow$', 0],
    ['"cat", "dog"', '$\\Rightarrow$', 3],
    ['"cat", "at"', '$\\Rightarrow$', 1],
    ['"cat", "cats"', '$\\Rightarrow$', 1],
    ['"a cat!", "the cats!"', '$\\Rightarrow$', 4],
  _).xmargin(20).ycenter()),
  pause(),
  parentCenter(linkToVideo('[semi-live solution]', 'editDistance.mp4')),
  // a cat! / the cats!
_), 'dynamic programming');

prose(
  'Let\'s consider the formal task of computing the edit distance (or more precisely the Levenshtein distance) between two strings.',
  'These measures of dissimilarity have applications in spelling correction, computational biology (applied to DNA sequences).',
  _,
  'As a first step, you should think to break down the problem into subproblems.',
  'Observation 1: inserting into $s$ is equivalent to deleting a letter from $t$ (ensures subproblems get smaller).',
  'Observation 2: perform edits at the end of strings (might as well start there).',
  _,
  'Consider the last letter of $s$ and $t$.',
  'If these are the same, then we don\'t need to edit these letters, and we can proceed to the second-to-last letters.',
  'If they are different, then we have three choices.',
  '(i) We can substitute the last letter of $s$ with the last letter of $t$.',
  '(ii) We can delete the last letter of $s$.',
  '(iii) We can insert the last letter of $t$ at the end of $s$.',
  _,
  'In each of those cases, we can reduce the problem into a smaller problem, but which one?',
  'We simply try all of them and take the one that yields the minimum cost!',
  _,
  'We can express this more formally with a mathematical recurrence.',
  'These types of recurrences will show up throughout the course, so it\'s a good idea to be comfortable with them.',
  'Before writing down the actual recurrence, the first step is to express the quantity that we wish to compute.',
  'In this case: let $d(m, n)$ be the edit distance between the first $m$ letters of $s$ and the first $n$ letters of $t$.',
  'Then we have $d(m, n) = \\begin{cases} m & \\text{if $n = 0$} \\\\ n & \\text{if $m = 0$} \\\\ d(m-1, n-1) & \\text{if $s_m = t_n$} \\\\ 1+\\min \\{ d(m-1, n-1), d(m-1, n), d(m, n-1) \\} & \\text{otherwise}. \\end{cases}$',
  _,
  'Once you have the recurrence, you can code it up.',
  'The straightforward implementation will take exponential time,',
  'but you can <b>memoize</b> the results to make it $O(n^2)$ time.',
  'The end result is the dynamic programming solution: recurrence + memoization.',
_);

add(slide(null,
  problem('finding the least squares line',
    stmt('Input: set of pairs $\\{(x_1,y_1), \\dots, (x_n,y_n)\\}$'),
    stmt('Output: $w \\in \\mathbb R$ that minimizes the squared error'),
    parentCenter('$F(w) = \\sum_{i=1}^n (x_i w - y_i)^2$'),
  _),
  pause(),
  stmt('Examples'),
  parentCenter(table(
    ['$\\{(2,4)\\}$', '$\\Rightarrow$', 2],
    ['$\\{(2,4), (4,2)\\}$', '$\\Rightarrow$', '?'],
  _).xmargin(20).ycenter()),
  pause(),
  parentCenter(linkToVideo('[semi-live solution]', 'gradientDescent.mp4')),
_), ['linear regression', 'gradient descent']);

prose(
  'The formal task is this: given a set of $n$ two-dimensional points $(x_i,y_i)$ which defines $F(w)$,',
  'compute the $w$ that minimizes $F(w)$.',
  _,
  'A brief detour to explain the modeling that might lead to this formal task.',
  '<b>Linear regression</b> is an important problem in machine learning, which we will come to later.',
  'Here\'s a motivation for the problem: suppose you\'re trying to understand how your exam score ($y$) depends on the number of hours you study ($x$).',
  'Let\'s posit a linear relationship $y = w x$ (not exactly true in practice, but maybe good enough).',
  'Now we get a set of training examples, each of which is a $(x_i,y_i)$ pair.',
  'The goal is to find the slope $w$ that best fits the data.',
  _,
  'Back to algorithms for this formal task.',
  'We would like an algorithm for optimizing general types of $F(w)$.',
  'So let\'s <b>abstract away from the details</b>.',
  'Start at a guess of $w$ (say $w = 0$), and then iteratively update $w$ based on the derivative (gradient if $w$ is a vector) of $F(w)$.',
  'The algorithm we will use is called <b>gradient descent</b>.',
  _,
  'If the derivative $F\'(w) < 0$, then increase $w$; if $F\'(w) > 0$, decrease $w$; otherwise, keep $w$ still.',
  'This motivates the following update rule, which we perform over and over again:',
  '$\\displaystyle w \\leftarrow w - \\eta F\'(w)$, where $\\eta > 0$ is a <b>step size</b> that controls how aggressively we change $w$.',
  _,
  'If $\\eta$ is too big, then $w$ might bounce around and not converge.',
  'If $\\eta$ is too small, then $w$ might not move very far to the optimum.',
  'Choosing the right value of $\\eta$ can be rather tricky.',
  'Theory can give rough guidance, but this is outside the scope of this class.',
  'Empirically, we will just try a few values and see which one works best.',
  'This will help us develop some intuition in the process.',
  _,
  'Now to specialize to our function, we just need to compute the derivative,',
  'which is an elementary calculus exercise: $F\'(w) = \\sum_{i=1}^n 2 (x_i w - y_i) x_i$.',
_);

////////////////////////////////////////////////////////////

add(quizSlide('introduction-most-surprising',
  'What was the most surprising thing you learned today?',
_));

add(summarySlide('Summary',
  bulletedText('AI applications are high-impact and complex'),
  bulletedText('Modeling [reflex, states, variables, logic] + inference + learning'),
  bulletedText('Section this Thursday: review of foundations'),
  bulletedText('Homework [foundations]: due next Wednesday 11pm'),
  bulletedText('Course will be fast-paced and exciting!'),
_));

initializeLecture();
