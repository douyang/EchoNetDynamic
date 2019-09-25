// General utilities for CS221.
// This file should only define functions.

G = sfig.serverSide ? global : this;

G.titleSlide = function(title) {
  if (!sfig.serverSide)
    document.title = 'CS221: Artificial Intelligence: ' + title;
  var s = slide.apply(null, arguments).showIndex(false);
  s.leftHeader(image('images/stanford-seal.png').dim(150));
  return s;
}

// Add a slide to the presentation
var lastId = 'begin';
var slideId2count = {}  // id -> number of slides that wanted to have that id (and as a result, they got '-<count>')
G.getUniqueSlideId = function(id) {
  var count = (slideId2count[id] || 0) + 1;
  slideId2count[id] = count;
  //sfig.L(id + (count == 0 ? '' : '-' + count));
  return id + (count == 1 ? '' : '-' + count);
}
var tagToSlides = {};  // tag => list of (js file, slideId)
G.add = function(block, tags) {
  // Compute the id of the slide if it's not given
  var id = block.id().get();
  if (id == null) {
    // Try to grab it from the title
    var title = block.title().get();
    if (typeof(title) == 'string')
      id = title.toLowerCase().replace(/[^a-z\- ]/g, '').trim().replace(/ /g, '-').replace(/-+/g, '-');
  }
  if (id == null || id == '')  // Just use the last one
    id = lastId;
  block.id(getUniqueSlideId(id));
  lastId = id;

  var footer = 'CS221 / Spring 2018 / Sadigh';
  if (tags) {
    if (typeof(tags) == 'string') tags = [tags];
    footer += ' [' + tags.map(redbold) + ']';
    tags.forEach(function(tag) {
      var list = tagToSlides[tag];
      if (!list) list = tagToSlides[tag] = [];
      list.push([sfig_.urlParams.include, id]);
    });
  }
  block.leftFooter(nowrapText(footer));
  if (!sfig.serverSide) {
    //if (sfig_.getDisplayMode() != sfig_.DISPLAYMODE_FULLSCREEN)
      //block.rightHeader(createFeedback(id));
  }
  //if (sfig_.getDisplayMode() == sfig_.DISPLAYMODE_DEFAULT) block.showHelp(true);

  // Add empty proses to make main slides always be on the LHS.
  if (prez.slides.length % 2 != 0) prose();
  prez.addSlide(block);

  lastBlock = block;
}

G.prose = function() {
  // Don't display proses in full screen
  if (sfig_.getDisplayMode() == sfig_.DISPLAYMODE_FULLSCREEN) return;

  // Don't display empty proses unless printing 1pp (so as to align things)
  if (arguments.length == 0) {
    if (sfig_.getDisplayMode() != sfig_.DISPLAYMODE_PRINT1PP) return;
  }

  // Sequence of strings or Blocks, separated by _
  var items = [];
  var itemStrings = [];  // Building up last item with strings.
  var flush = function() {
    if (itemStrings.length > 0) {
      items.push(bulletedText(itemStrings.join("\n")).fontSize(18));
      itemStrings = [];
    }
  }
  for (var i = 0; i < arguments.length; i++) {
    var x = arguments[i] || _;
    if (x == _) {
      flush();
    } else if (x instanceof sfig.Block) {
      flush();
      items.push(x);
    } else if (typeof(x) == 'string') {
      itemStrings.push(x);
    } else {
      throw 'Unhandled: ' + x;
    }
  }
  flush();
  var s = ytable.apply(null, items).margin(5);
  // Make the prose top-justified with the slides.
  // TODO: figure out how to do this without taking up a ton of space when the slide is below
  s = slide(null, s).border.color('white').end.showIndex(false);
  s.id(getUniqueSlideId(lastId));
  prez.addSlide(s);
}

G.cite = function(ref, url) {
  return frame(ref).padding(3).bg.fillColor('red').fillOpacity(0.2).end.linkToUrl(url);
}

G.initializeLecture = function() {
  sfig.initialize();
  if (sfig.serverSide) {
    var fs = require('fs');
    var path = sfig_.urlParams.include.replace(/\.js$/, '.tags.json');
    fs.writeFileSync(path, JSON.stringify(tagToSlides) + '\n');
  }
}

G.createFeedback = function(id) {
  id = sfig_.urlParams.include + '-' + id;
  var good = image('images/thumbs-up.jpg').height(50);
  var bad = image('images/thumbs-down.jpg').height(50);
  var written = image('images/written.jpg').height(50);
  good = button(good).setPointerWhenMouseOver().onClick(function() {
    incrKeyValue(id + '.feedback', 'good', +1);
    alert('Thanks for your feedback!');
  });
  bad = button(bad).setPointerWhenMouseOver().onClick(function() {
    incrKeyValue(id + '.feedback', 'bad', +1);
    alert('Thanks for your feedback!');
  });
  written = button(written).setPointerWhenMouseOver().onClick(function() {
    var message = prompt('Enter your feedback:');
    if (message)
      incrKeyValue(id + '.feedback', message, +1);
  });
  return ytable(
    xtable(good, bad, written),
    showFeedback() ? renderFeedback(id + '.feedback') : _,
  _).xjustify('r');
}

G.showFeedback = function() {
  return sfig_.urlParams.auth; // && (sfig_.getDisplayMode() == sfig_.DISPLAYMODE_PRINT1PP);
}

G.renderFeedback = function(key) {
  var box = wrap(nil());
  // TODO
  /*getKeyValues(key, function(feedback) {
    if (!feedback) return _;
    var rows = [];
    for (var k in feedback)
      rows.push([k, feedback[k]]);
    box.content(new Table(rows).xmargin(5));
    prez.refresh();
  });*/
  return box;
}

// Key value store functions
G.keyValueCommand = function(command, args, callback) {
  var request = new XMLHttpRequest();
  request.open('GET', 'http://107.170.225.60:7379/' + command + '/' + args.map(encodeURIComponent).join('/'));  // UPDATE
  if (sfig_.urlParams.auth)
    request.setRequestHeader("Authorization", "Basic " + btoa('cs221:' + sfig_.urlParams.auth));
  if (callback) {
    request.onload = function() {
      //alert(this.responseText);
      callback(JSON.parse(this.responseText));
    };
  }
  request.send();
}
G.delKey = function(key, callback) { keyValueCommand('DEL', [key], callback); }
G.getKey = function(key, callback) { keyValueCommand('GET', [key], function(result) { callback(result['GET']); }); }
G.setKeyValue = function(key, value, callback) { keyValueCommand('SET', [key, JSON.stringify(value)], callback); }
G.getKeyValues = function(key, callback) { keyValueCommand('HGETALL', [key], function(result) { callback(result['HGETALL']); }); }
G.incrKeyValue = function(key, value, incr, callback) { keyValueCommand('HINCRBY', [key, value, incr], callback); }
G.pushKeyValue = function(key, value, callback) { keyValueCommand('LPUSH', [key, JSON.stringify(value)], callback); }

G.smallButton = function(str) {
  return frame(str).padding(3).bg.fillColor('#F0F0D0').strokeWidth(1).round(5).end.setPointerWhenMouseOver().scale(0.5);
}

G.allowMultipleAnswers = function(question) { return question.match(/select all that apply/) != null; }

G.activateQuiz = function (id, question, answers) {
  setKeyValue('cs221-q', {id: id, question: question, answers: answers, allowMultipleAnswers: allowMultipleAnswers(question)});
  window.open('http://cs221.stanford.edu/q');
}
G.deactivateQuiz = function() {
  setKeyValue('cs221-q', {id: 'feedback', question: 'Do you have any comments about the class so far?'});
}

G.createMultipleChoiceQuiz = function(id, question, answers) {
  for (var i = 0; i < answers.length; i++)
    answers[i] = answers[i].toString();

  var ansBlocks = [];
  var counters = [];
  var selected_i = -1;
  var selected = [];
  var answerRows = []
    
  function unselect(decr) {
    if (selected_i != -1) {
      if (decr)
        incrKeyValue(id, answers[selected_i], -1);
      ansBlocks[selected_i].fillColor('white').updateElem();
      selected_i = -1;
      selected[selected_i] = false;
    }
  }
  function select(i) {
    selected_i = i;
    selected[selected_i] = true;
    incrKeyValue(id, answers[selected_i], +1);
    ansBlocks[selected_i].fillColor('#B9D48B').updateElem();
  }

  function setupAnswer(i) {
    var ansBlock = frameBox(text(answers[i]).width(600)).padding(5).bg.width(650).end;
    ansBlock.onClick(function() {
      if (allowMultipleAnswers(question)) {
        if (selected[i]) unselect(true);
        else select(i);
      } else {
        if (selected_i == i) return;
        unselect(true);
        select(i);
      }
    });
    ansBlock.setPointerWhenMouseOver();
    ansBlocks.push(ansBlock);
    var counter = wrap(nil());
    counters.push(counter);
    answerRows.push(xtable(frame(counter).pivot(1, 0).bg.width(80).end, ansBlock).center().margin(5));
  }

  for (var i = 0; i < answers.length; i++)
    setupAnswer(i);

  function reset() {
    // Clear histogram
    unselect(false);
    delKey(id, report);
  }

  function displayResults(value) {
    if (value == null) value = {};
    for (var i = 0; i < answers.length; i++)
      counters[i].content(text(value[answers[i]] || 0).color('brown'));
  }

  function report() {
    getKeyValues(id, function(value) {
      displayResults(value);
      prez.refresh();
    });
  }

  //if (showFeedback()) report();

  return ytable(
    ytable(
      question,
      ytable.apply(null, answerRows).margin(10),
    _).margin(20),
    xtable(
      sfig_.urlParams.auth ? smallButton('activate').onClick(function() { activateQuiz(id, question, answers); }) : _,
      sfig_.urlParams.auth ? smallButton('deactivate').onClick(deactivateQuiz) : _,
      sfig_.urlParams.auth ? smallButton('reset').onClick(reset) : _,
      sfig_.urlParams.auth ? smallButton('report').onClick(report) : _,
    _).margin(10),
  _).margin(20);
}

G.createFreeResponseQuiz = function(id, question) {
  var answerBox = textBox(80).fontSize(20).onEnter(function(textBox) {
    var value = textBox.content().get();
    incrKeyValue(id, value, 1);
  });
  var resultsBox = wrap(nil());

  function reset() { delKey(id, report); }
  function displayResults(response) {
    if (response == null) response = {};
    var items = [];
    // Add random noise to get a random permutation among elements with the same count.
    for (var key in response)
      items.push([response[key], key, Math.random() * 0.001]);
    items.sort(function(a, b) { return (b[0] + b[2]) - (a[0] + a[2]); });

    var n = items.length;
    for (var i = 0; i < n; i++)  // Remove randomnness
      items[i].pop();
    items = items.slice(0, 10);  // Take only top 10

    if (n > items.length)
      items.push([n, '(total)']);
    if (items.length == 0)
      resultsBox.content('(no responses)');
    else
      resultsBox.content(new Table(items).xmargin(20).scale(0.8));
  }

  function report() {
    getKeyValues(id, function(value) {
      displayResults(value);
      prez.refresh();
    });
  }

  //if (showFeedback()) report();

  return ytable(
    ytable(
      question,
      indent(answerBox),
    _).margin(40),
    xtable(
      sfig_.urlParams.auth ? smallButton('activate').onClick(function() { activateQuiz(id, question); }) : _,
      sfig_.urlParams.auth ? smallButton('deactivate').onClick(deactivateQuiz) : _,
      sfig_.urlParams.auth ? smallButton('reset').onClick(reset) : _,
      sfig_.urlParams.auth ? smallButton('report').onClick(report) : _,
    _).margin(10),
    indent(resultsBox.scale(0.75)),
  _).margin(30);
}

G.quizSlide = function(id, question) {
  var answers = [];
  for (var i = 2; i < arguments.length; i++) {
    if (arguments[i] == _) continue;
    answers.push(arguments[i]);
  }
  var quiz;
  if (answers.length == 0)
    quiz = createFreeResponseQuiz(id, question);
  else
    quiz = createMultipleChoiceQuiz(id, question, answers);
  var s = slide('Question', quiz);
  s.leftHeader(xtable(image('images/question.jpg').width(70), text(redbold('cs221.stanford.edu/q')).scale(1.5)).margin(5).center());
  s.id('q-' + id);
  return s;
}

G.outlineSlide = function(title, sel, items) {
  var rows = [title];
  for (var i = 0; i < items.length; i++) {
    var id = items[i][0];
    var text = items[i][1];
    rows.push(roadmapItem(sel == i, text, id));
  }
  return roadmapSlide.apply(null, rows).id(items[sel][0]);
}

G.roadmapItem = function(active, text, id) {
  var b;
  if (active)
    b = parentCenter(frameBox(redbold(text)).bg.strokeWidth(3).end);
  else
    b = parentCenter(frameBox(text).bg.strokeColor('gray').end);
  if (id) b.setPointerWhenMouseOver(true).linkToInternal(prez, id, 0);
  return b;
}

G.evolutionOfModels = function(i, selectDescription) {
  add(slide('Course plan',
    nil(),
    getEvolutionOfModels(i, selectDescription),
  _));
}

G.getEvolutionOfModels = function(i, selectDescription) {
  function select(x) {
    x = std(x);
    if (selectDescription && x.content().get().match(selectDescription)) return frameBox(x).padding(5).bg.strokeWidth(4).end;
    return x;
  }
  var sub = function(x) { return select(text(x).scale(0.8)); };
  return parentCenter(overlay(
    ytable(
      selectPrefix(i, xtable,
        _, pause(),
        select(redbold('Reflex')),
        _, pause(),
        ytable(
          sub(green('Search problems')),
          sub(green('Markov decision processes')),
          sub(green('Adversarial games')),
          select(greenbold('States')),
        _).center().margin(10),
        _, pause(),
        ytable(
          sub(blue('Constraint satisfaction problems')),
          sub(blue('Bayesian networks')),
          select(bluebold('Variables')),
        _).center().margin(10),
        _, pause(),
        select(purplebold('Logic')),
      _).margin(50).yjustify('r').scale(0.8),
      rightArrow(750).strokeWidth(5).showLevel(0),
      xtable(
        text('"Low-level intelligence"').scale(0.6),
        text('"High-level intelligence"').scale(0.6),
      _).margin(400).showLevel(0),
      _, pause(),
      select(text(brownbold('Machine learning'))).showLevel(i == 0 ? 1 : 0),
    _).center(),
  _));
}

////////////////////////////////////////////////////////////
// General utilities

G.addTextLatexMacros = function(items) {
  items.forEach(function(x) { sfig.latexMacro(x, 0, '\\text{'+x+'}'); });
}

G.bigLeftArrow = function(s) { return leftArrow(s || 100).strokeWidth(10).color('brown'); }
G.bigRightArrow = function(s) { return rightArrow(s || 100).strokeWidth(10).color('brown'); }
G.bigUpArrow = function(s) { return upArrow(s || 100).strokeWidth(10).color('brown'); }
G.bigDownArrow = function(s) { return downArrow(s || 100).strokeWidth(10).color('brown'); }
G.bigUpDownArrow = function(s) { return upDownArrow(s || 100).strokeWidth(10).color('brown'); }
G.bigLeftRightArrow = function(s) { return leftRightArrow(s || 100).strokeWidth(10).color('brown'); }

G.dividerSlide = function(content) { return slide(null, nil(), content).titleHeight(0); }
G.summarySlide = function() { return slide.apply(null, arguments).leftHeader(image('images/summary.jpg').width(150)); }
G.roadmapSlide = function() { return slide.apply(null, arguments).leftHeader(image('images/signpost.jpeg').width(150)); }
G.announcementSlide = function() { return slide.apply(null, arguments).leftHeader(image('images/loudspeaker.jpg').width(150)); }

G.button = function(text) {
  return frame(text).bg.strokeWidth(2).round(10).fillColor('lightblue').end;
}

G.orElse = function(a, b) {
  return a != null ? a : b;
}

G.strToArray = function(str) { return str.split(''); }
G.strToMatrix = function(str) { return str.split('|').map(strToArray); }
G.mapVector = function(vector, func) {
  var newVector = [];
  for (var i = 0; i < vector.length; i++)
    newVector[i] = func(vector[i], i);
  return newVector;
}
G.mapMatrix = function(matrix, func) {
  return mapVector(matrix, function(row, r) {
    return mapVector(row, function(cell, c) { return func(cell, r, c); });
  });
}

// Mutates |target|.
G.mergeInto = function(target, source) {
  for (var key in source) target[key] = source[key];
  return target;
}

G.countOf = function(list, x) {
  var n = 0;
  for (var i = 0; i < list.length; i++)
    if (list[i] == x) n++;
  return n;
}

G.sumOf = function(list) { 
  var n = 0;
  for (var i = 0; i < list.length; i++)
    n += list[i];
  return n;
}

G.round = function(x, n) {
  var base = Math.pow(10, n);
  return Math.round(x * base) / base;
}

G.zeros = function(n) {
  var result = [];
  for (var i = 0; i < n; i++) result[i] = 0;
  return result;
}

G.l2DistSquared = function(p, q) {
  var sum = 0;
  if (p.length != q.length) throw 'Mis-match: ' + p + ' and ' + q;
  for (var i = 0; i < p.length; i++) {
    var d = p[i] - q[i];
    sum += d * d;
  }
  return sum;
}

G.normalize = function(probs) {
  var sum = 0;
  for (var k = 0; k < probs.length; k++) sum += probs[k];
  if (sum == 0) {
    // Set to uniform
    for (var k = 0; k < probs.length; k++) probs[k] = 1.0 / probs.length;
    return false;
    //throw 'Bad: ' + probs;
  }
  for (var k = 0; k < probs.length; k++) probs[k] /= sum;
  return true;
}

G.sampleMultinomial = function(probs) {
  var v = Math.random();
  var sum = 0;
  for (var i = 0; i < probs.length; i++) {
    sum += probs[i]; 
    if (v < sum) return i;
  }
  throw 'Unable to sample from '+probs;
}

G.randint = function(n) {
  return Math.floor(Math.random() * n);
}

G.shuffle = function(l) {
  for (var i = 0; i < l.length-1; i++) {
    var j = Math.floor(Math.random() * (l.length-i)) + i;
    var tmp = l[i];
    l[i] = l[j];
    l[j] = tmp;
  }
}

G.sampleGaussian = function() {
  var u1 = Math.random();
  var u2 = Math.random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

G.wholeNumbers = function(n) {
  var result = [];
  for (var i = 0; i < n; i++) result[i] = i;
  return result;
}

G.randomChoice = function(list) {
  var i = Math.floor(Math.random() * list.length);
  return list[i];
}

G.l2Dist = function(v1, v2) {
  var sum = 0;
  if (v1.length != v2.length) throw 'Bad';
  for (var i = 0; i < v1.length; i++)
    sum += (v1[i]-v2[i]) * (v1[i]-v2[i]);
  return Math.sqrt(sum);
}

//// sfig utilities
G.maximizeWidth = function(b) { return transform(b).width(sfig.Text.defaults.getProperty('width')); }
G.indent = function(x, n) {
  n = n != null ? n : 20;
  // Adjust the width so it doesn't spill over
  var adjust = 30 + n;
  if (typeof(x) == 'string')
    x = text(x);
  if (x instanceof sfig.Text) {
    if (x.bulleted().get())
      adjust += 50;
    x.width(Text.defaults.getProperty('width').sub(adjust));
  }
  return frame(x).xpadding(n).xpivot(1);
}
G.indentNowrapText = function(x, n) {
  return indent(nowrapText(x), n);
}
G.bulletedTextNowrap = function(x) { return bulletedText(x).autowrap(false); }
G.xseq = function() { return new sfig.Table([arguments]).center().margin(5); }
G.yseq = function() { return ytable.apply(null, arguments).margin(10); }

G.stmt = function(prefix, suffix) {
  var m;
  if (!suffix && (m = prefix.match(/^([^:]+): (.+)$/))) {
    prefix = m[1];
    suffix = m[2];
  }
  return prefix.fontcolor('darkblue') + ':' + (suffix ? ' '+suffix : '');
}

G.blockquote = function(options) {
  var newWidth = 700;
  function setWidth(x) {
    if (x instanceof sfig.Text && x.width().getOrElse(newWidth) > newWidth) x.width(newWidth);
    if (x.children) x.children.forEach(setWidth);
  }
  var title = options.title;
  var contents = options.contents.map(function(x) {
    if (x == _) return x;
    x = std(x);
    setWidth(x);
    return x;
  });
  return parentCenter(frame(ytable.apply(null, contents)).padding(15, 10).bg.strokeWidth(2).end.title(opaquebg(title)));
}

G.assumption = function(title) { return blockquote({title: xtable(image('images/assumption.jpg').width(50), redbold('Assumption: '+title)).center().margin(10), contents: Array.prototype.slice.call(arguments).slice(1)}); }
G.definition = function(title) { return blockquote({title: xtable(image('images/dictionary.jpg').width(50), greenbold('Definition: '+title)).center().margin(10), contents: Array.prototype.slice.call(arguments).slice(1)}); }
G.proposition = function(title) { return blockquote({title: xtable(image('images/purple-orb.jpg').width(50), bluebold('Proposition: '+title)).center().margin(10), contents: Array.prototype.slice.call(arguments).slice(1)}); }
G.theorem = function(title) { return blockquote({title: xtable(image('images/purple-orb.jpg').width(50), bluebold('Theorem: '+title)).center().margin(10), contents: Array.prototype.slice.call(arguments).slice(1)}); }
G.keyIdea = function(title) { return blockquote({title: xtable(image('images/light-bulb.jpg').width(50), redbold('Key idea: '+title)).margin(10).center(), contents: Array.prototype.slice.call(arguments).slice(1)}); }
G.example = function(title) { return blockquote({title: xtable(image('images/dodecahedron.jpg').width(50), orangebold('Example: '+title)).margin(10).center(), contents: Array.prototype.slice.call(arguments).slice(1)}); }
G.problem = function(title) { return blockquote({title: xtable(image('images/puzzle.jpg').width(50), orangebold('Problem: '+title)).margin(10).center(), contents: Array.prototype.slice.call(arguments).slice(1)}); }

G.algorithm = function(title) { return blockquote({title: xtable(image('images/algorithm.jpg').width(50), bluebold('Algorithm: '+title)).margin(10).center(), contents: Array.prototype.slice.call(arguments).slice(1)}); }
G.generativeModel = function(title) { return blockquote({title: xtable(image('images/generative.jpg').width(50), bluebold('Probabilistic program: '+title)).margin(10).center(), contents: Array.prototype.slice.call(arguments).slice(1)}); }
G.pseudocode = function(title) { return blockquote({title: xtable(image('images/algorithm.jpg').width(50), bluebold('Algorithm: '+title)).margin(10).center(), contents: interpretCode(Array.prototype.slice.call(arguments).slice(1))}); }

G.importantBox = function(title) { return blockquote({title: title, contents: Array.prototype.slice.call(arguments).slice(1)}); }

G.interpretCode = function(contents) {
  return contents.map(function(line) {
    if (typeof(line) == 'string') {
      var indent = line.length - line.replace(/^ */, '').length;
      var line = line.replace(/^(.*)(# .*)$/, '$1 <font color="blue"><em>$2</em></font>');
      return text('<tt>' + line.slice(0, indent).replace(/ /g, '&nbsp;') + line.slice(indent) + '</tt>').fontSize(18);
    }
    return line;
  });
}

G.headerList = function(title) {
  var contents = Array.prototype.slice.call(arguments).slice(1);
  return yseq.apply(null, [title ? stmt(title) : _].concat(contents.map(function(line) {
    if (line == _) return _;
    if (sfig.isString(line) || (!sfig.serverSide && line instanceof HTMLElement)) return bulletedText(line).autowrap(true);
    if (line instanceof sfig.Text && line.bulleted().get()) return line;
    if (line instanceof sfig.PropertyChanger) return line;
    if (line instanceof sfig.Overlay && line.items[0] instanceof sfig.Text && line.items[0].bulleted().get()) return line;
    return indent(line);
  })));
}

G.frameBox = function(content) { return frame(content).padding(10).bg.strokeWidth(1).end; }
G.labeledDownArrow = function(label, s) { return overlay(bigDownArrow(s || 80).strokeWidth(5), ytable(opaquebg(label), yspace(15))).center(); }

G.stagger = function() {
  var items = [];
  var last_i = -1;
  for (var i = 0; i < arguments.length; i++) {
    if (arguments[i] == _) continue;
    var curr = arguments[i] = std(arguments[i]);
    if (curr instanceof sfig.PropertyChanger) {
      items.push(curr);
    } else {
      if (last_i != -1) {
        items.push(pause());
        arguments[last_i].numLevels(i - last_i);
      }
      items.push(curr);
      last_i = i;
    }
  }
  return overlay.apply(null, items);
}

G.applyIf = function(condition, func, arg) { return condition ? func(arg) : arg; }

// Return a moved to right of b.
G.moveLeftOf = function(a, b, offset) { return transform(a).pivot(1, 0).shift(b.left().sub(offset == null ? 5 : offset), b.ymiddle()); }
G.moveRightOf = function(a, b, offset) { return transform(a).pivot(-1, 0).shift(b.right().add(offset == null ? 5 : offset), b.ymiddle()); }
G.moveTopOf = function(a, b, offset) { return transform(a).pivot(0, 1).shift(b.xmiddle(), b.top().up(offset == null ? 5 : offset)); }
G.moveBottomOf = function(a, b, offset) { return transform(a).pivot(0, -1).shift(b.xmiddle(), b.bottom().down(offset == null ? 5 : offset)); }
G.moveCenterOf = function(a, b) { return transform(a).pivot(0, 0).shift(b.xmiddle(), b.ymiddle()); }
G.moveTopLeftOf = function(a, b, offset) { return transform(a).pivot(1, 1).shift(b.left().sub(offset == null ? 3 : offset), b.top().up(offset == null ? 3 : offset)); }
G.moveTopRightOf = function(a, b, offset) { return transform(a).pivot(-1, 1).shift(b.right().add(offset == null ? 3 : offset), b.top().up(offset == null ? 3 : offset)); }

G.withLeft = function(thing, label, offset) { return overlay(thing.appendix(moveLeftOf(label, thing, offset).orphan(true))).closeAppendices(); }
G.withRight = function(thing, label, offset) { return overlay(thing.appendix(moveRightOf(label, thing, offset).orphan(true))).closeAppendices(); }
G.withTop = function(thing, label, offset) { return overlay(thing.appendix(moveTopOf(label, thing, offset).orphan(true))).closeAppendices(); }
G.withBottom = function(thing, label, offset) { return overlay(thing.appendix(moveBottomOf(label, thing, offset).orphan(true))).closeAppendices(); }
G.withCenter = function(thing, label) { return overlay(thing, moveCenterOf(label, thing, offset).orphan(true)); }

G.makeExpandButton = function() { return frameBox(text('+'.fontcolor('purple'))).bg.round(5).end.padding(-5).setPointerWhenMouseOver().scale(0.6).strokeColor('purple'); }
G.expandInternal = function(thing, prez, slideId, level) { thing = std(thing); return overlay(thing, moveRightOf(makeExpandButton().linkToInternal(prez, slideId, level), thing)); }
G.expandExternal = function(thing, name, slideId, level) { thing = std(thing); return overlay(thing, moveRightOf(makeExpandButton().linkToExternal(name, slideId, level), thing)); }
G.expandExplain = function(thing, content, options) {
  thing = std(thing);
  return overlay(thing, moveRightOf(explain(makeExpandButton(), content, mergeInto({pivot: [1,-1], borderWidth: 0}, options || {})), thing, options && options.margin));
}

G.youtube = function(id, options) {
  if (!options) options = {};
  var cacheVideos = options.cache != null ? options.cache : sfig_.urlParams.auth;
  var url;
  if (cacheVideos)
    url = 'cached-videos/'+id+'.'+(options.ext || 'mp4');
  else {
    //url = 'http://www.youtube.com/tv#/watch?v='+id;
    url = 'http://www.youtube.com/watch?v='+id;
    if (options.time)
      url += '&t='+options.time;
  }
  //return cachedImage('http://i1.ytimg.com/vi/'+id+'/default.jpg').width(200).linkToUrl(url);
  return cachedImage('images/'+id+'.jpg').width(200).linkToUrl(url);
}

G.basename = function(path) {
  var tokens = path.split('/');
  return tokens[tokens.length-1];
}

G.linkToVideo = function(block, path) {
  var cacheVideos = (window.location.protocol == 'file:');
  var url = cacheVideos ? 'cached-videos/'+basename(path) : path;
  return std(block).linkToUrl(url);
}

G.stateExample = function() {
  return frameBox(ytable.apply(null, arguments)).bg.round(10).strokeWidth(2).strokeColor('blue').end;
}

G.side = function(text, image, url) {
  if (url == _) url = null;
  if (typeof(image) == 'string') {
    if (!url) url = image;
    image = cachedImage(image);
  }
  if (!image.width().exists()) image.width(100);
  if (!image.height().exists()) image.height(100);
  if (url) image.linkToUrl(url);
  return xtable(image, std(text).width(600)).margin(20).center();
}

// Allow for wrapping
G.staggerText = function() {
  var s = '';
  var items = [];
  for (var i = 0; i < arguments.length; i++) {
    if (arguments[i] == _) continue;
    if (i > 0) s += ' ';
    s += arguments[i];
    items.push(text(s));
  }
  return stagger.apply(null, items);
}
G.staggerBulletedText = function() {
  var s = '';
  var items = [];
  for (var i = 0; i < arguments.length; i++) {
    if (arguments[i] == _) continue;
    if (i > 0) s += ' ';
    s += arguments[i];
    items.push(bulletedText(s));
  }
  return stagger.apply(null, items);
}

G.makeButton = function(label, func) {
  return frame(label).bg.strokeWidth(2).fillColor('lightblue').round(5).end.onClick(func).setPointerWhenMouseOver(true);
}

G.arrayExists = function(arr, func) {
  for (var i = 0; i < arr.length; i++)
    if (func(arr[i])) return true;
  return false;
}

G.arrayForall = function(arr, func) {
  for (var i = 0; i < arr.length; i++)
    if (!func(arr[i])) return false;
  return true;
}

G.argmax = function(weights) {
  var best_i = -1;
  for (var i = 0; i < weights.length; i++) {
    if (best_i == -1 || weights[i] > weights[best_i]) best_i = i;
  }
  return best_i;
}

G.increment = function(a, i, v) { a[i] = (a[i] || 0) + v; }

G.thickRightArrow = function(len) { return rightArrow(len || 50).strokeWidth(5); }
G.thickDownArrow = function(len) { return downArrow(len || 50).strokeWidth(5); }

G.randInt = function(n) { return Math.floor(Math.random() * n); }

G.squared = function(x) { return x * x; }

G.rgb = function(r, g, b) { return 'rgb('+Math.round(r)+','+Math.round(g)+','+Math.round(b)+')'; }

G.paramsToUrl = function(params) {
  var pathname = window.location.pathname;
  var urlHash = sfig_.serializeUrlParams(params);
  var url = pathname + urlHash;
  return url;
}

G.gradientPlot = function(opts) {
  // Doesn't work for serverSide
  if (sfig.serverSide) {
    return text('[gradient plot]');
  }

  var points = opts.points || [];
  var showLastPoint = opts.showLastPoint;
  var func = opts.func;  // Evaluate to get value
  var min0 = opts.min0;
  var max0 = opts.max0;
  var min1 = opts.min1;
  var max1 = opts.max1;
  var width = opts.width || 500;
  var height = opts.height || 500;
  var xaxisLabel = opts.xaxisLabel || '$w_1$';
  var yaxisLabel = opts.yaxisLabel || '$w_2$';

  var numBins0 = (max0-min0);
  var numBins1 = (max1-min1);
  var maxBins = 50;
  numBins0 *= Math.min(2, Math.max(1, Math.round(maxBins / numBins0)));
  numBins1 *= Math.min(2, Math.max(1, Math.round(maxBins / numBins1)));
  numBins0 = Math.min(maxBins, numBins0);
  numBins1 = Math.min(maxBins, numBins1);
  var binSize0 = (max0-min0) / numBins0;
  var binSize1 = (max1-min1) / numBins1;
  var miny = null, maxy = null;

  function to0(x0) { return (x0 - min0) / (max0 - min0 + 1) * width; }
  function to1(x1) { return -(x1 - min1) / (max1 - min1 + 1) * height; }
  function to01(p) { return [to0(p[0]), to1(p[1])]; }
  function y2color(y) {
    var alpha = (y - miny) / (maxy - miny);
    if (alpha < 0.5) { // blue to green
      alpha *= 2;
      return rgb(0, alpha*255/2, (1-alpha)*255);
    } else { // green to red
      alpha = (alpha-0.5)*2;
      return rgb(alpha*255, (1-alpha)*255/2, 0);
    }
  }

  var values = [];
  for (var i0 = 0; i0 <= numBins0; i0++) {
    var row = [];
    values.push(row);
    for (var i1 = 0; i1 <= numBins1; i1++) {
      var x0 = min0 + binSize0 * i0;
      var x1 = min1 + binSize1 * i1;
      var y = func(x0, x1);
      if (miny == null || y < miny) miny = y;
      if (maxy == null || y > maxy) maxy = y;
      row.push(y);
    }
  }

  var canvas = rawAddSvg(function(container) {
    // Draw predictions
    for (var i0 = 0; i0 <= numBins0; i0++) {
      for (var i1 = 0; i1 <= numBins1; i1++) {
        var x0 = min0 + binSize0 * i0;
        var x1 = min1 + binSize1 * i1;
        var y = values[i0][i1];
        var sq = sfig_.newSvgElem('rect');
        sq.setAttribute('width', to0(min0+binSize0));
        sq.setAttribute('height', -to1(min1+binSize1));
        sq.setAttribute('x', to0(x0 - binSize0/2));
        sq.setAttribute('y', to1(x1 + binSize1/2));
        //sq.style.fillOpacity = 0.5;
        sq.style.strokeWidth = 0;
        var color = y2color(y);
        sq.setAttribute('fill', color);
        container.appendChild(sq);

        // Add tooltip
        var title = sfig_.newSvgElem('title');
        title.textContent = '('+round(x0, 2)+','+round(x1,2)+'): '+round(y, 2);
        sq.appendChild(title);
      }
    }
  });
  var items = [];
  items.push(canvas);

  // Draw points
  var lastp = null;
  for (var i = 0; i < points.length; i++) {
    var p = points[i];
    if (lastp != null)
      items.push(arrow(to01(lastp), to01(p)));
    if (i < points.length-1 || showLastPoint)
      items.push(circle(5).color('black').shift.apply(null, to01(p)));
  }

  var result = overlay.apply(null, items);
  if (xaxisLabel || yaxisLabel) {
    result = overlay(result,
      moveBottomOf(xaxisLabel, result),
      moveLeftOf(yaxisLabel, result),
    _);
  }
  return result;
}

G.node = function(x, shaded) { return overlay(circle(20).fillColor(shaded ? 'lightgray' : 'white'), std(x || nil()).orphan(true)).center(); }

if (!sfig.serverSide && window.location.protocol != 'file:') {
  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'UA-35433298-1']);
  _gaq.push(['_trackPageview']);
  (function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  })();
}

// Return |func| applied to a subset of the rest of the arguments.
// The rest of the arguments are broken into sections delimited by _.
// Select the arguments as follows:
// - sections before |section| without pauses
// - |section|
G.selectPrefix = function(section, func) {
  var items = [];
  var currSection = 0;  // Current section
  for (var i = 2; i < arguments.length; i++) {
    var arg = arguments[i];
    if (arg == _) { currSection++; continue; }  // section divider
    if (currSection != section && arg instanceof sfig.PropertyChanger) continue;  // skip pauses in previous sections
    arg = std(arg);
    if (currSection > section && arg instanceof sfig.Block) arg.showLevel(-1);  // hide future sections
    items.push(arg);
  }
  return func.apply(null, items);
}

// Create a slide to produce a graph in a WSYWIG way
G.createGraphSlide = function() {
  var nodes = [];  // list of nodes
  var edges = [];  // list of [node, node] pairs
  var contents = wrap(nil());
  var prev_v = null;

  function refresh() {
    var items = [];
    nodes.forEach(function(v) { items.push(v); });
    edges.forEach(function(e) { items.push(arrow(e[0], e[1])); });
    contents.content(overlay.apply(null, items));
    prez.refresh();

    var output = '//////////////////////////////\n';
    output += 'var nodes = [], edges = [];\n';
    for (var i = 0; i < nodes.length; i++) {
      var v = nodes[i];
      output += 'nodes.push(node(nil()).shift(' + v.xshift().get() + ', ' + v.yshift().get() + '));\n';
    }
    for (var i = 0; i < edges.length; i++) {
      var v1 = edges[i][0];
      var v2 = edges[i][1];
      output += 'edges.push(arrow(nodes['+nodes.indexOf(v1)+'], nodes['+nodes.indexOf(v2)+']));';
    }
    console.log(output);
  }

  function nodeClick(v, ev) {
    //sfig.L('nodeClick');
    if (ev.shiftKey) {
      // Remove v
      nodes = keepIf(nodes, function(vv) { return v != vv; });
      edges = keepIf(edges, function(e) { return e[0] != v && e[1] != v; });
      refresh();
    } else {
      if (prev_v == null) {
        prev_v = v;
      } else {
        edges.push([prev_v, v]);
        refresh();
        prev_v = null;
      }
    }
    ev.stopPropagation();
  }

  // General function
  function keepIf(list, f) {
    var newList = [];
    for (var i = 0; i < list.length; i++)
      if (f(list[i]))
        newList.push(list[i]);
    return newList;
  }

  function canvasClick(block, ev) {
    //sfig.L('canvasClick');
    var pt = [ev.clientX - 9, ev.clientY - 9];
    if (prev_v == null) {
      // Add a new node
      var v = node(nil()).shift(pt[0], pt[1]).onClick(nodeClick).cursor('pointer');
      nodes.push(v);
    } else {
      // Move node
      prev_v.shift(pt[0], pt[1]);
      prev_v = null;
    }
    refresh();
  }

  return slide(null).extra(contents).onClick(canvasClick).cursor('crosshair');
}

////////////////////////////////////////////////////////////
// Learning

G.lossGraph = function(opts) {
  var zeroOneLoss = function(z) { return z <= 0 ? 1 : 0; };
  var hingeLoss = function(z) { return Math.max(0, 1 - z); };
  var logisticLoss = function(z) { return Math.log(1 + Math.exp(-z)); };
  var squaredLoss = function(z) { return 0.5 * z * z; };
  var absLoss = function(z) { return Math.abs(z); };

  function myPause(n) { return opts.pause ? pause(n) : _; }
  var range = 3;
  var trajectories = [];
  [zeroOneLoss, hingeLoss, logisticLoss, squaredLoss, absLoss].forEach(function(loss) {
    if (!opts.zeroOneLoss && loss == zeroOneLoss) return;
    if (!opts.hingeLoss && loss == hingeLoss) return;
    if (!opts.logisticLoss && loss == logisticLoss) return;
    if (!opts.squaredLoss && loss == squaredLoss) return;
    if (!opts.absLoss && loss == absLoss) return;

    var n = 60;
    var eps = 1e-4;
    var points = [];
    wholeNumbers(n+1).forEach(function(i) {
      var x = (i-n/2)/n * range * 2;
      points.push({x: x, y: loss(x - (opts.weights ? 1 : 0)) + (opts.weights ? 1 : 0)});
      if (x == 0 && loss == zeroOneLoss) points.push({x: x+eps, y: loss(x+eps)});
    });
    if (opts.pause) trajectories.push(myPause());
    trajectories.push(points);
  });

  if (opts.pause) trajectories.push(myPause());
  var names = [];
  var colors = [];
  if (opts.zeroOneLoss) { names.push('$\\ZeroOneLoss$'); colors.push('red'); }
  if (opts.hingeLoss) { names.push('$\\HingeLoss$'); colors.push('green'); }
  if (opts.logisticLoss) { names.push('$\\LogisticLoss$'); colors.push('orange'); }
  if (opts.squaredLoss) { names.push('$\\SquaredLoss$'); colors.push('brown'); }
  if (opts.absLoss) { names.push('$\\AbsLoss$'); colors.push('green'); }

  var graph = new sfig.LineGraph(trajectories);
  graph.trajectoryNames(names);
  if (opts.regression)
    graph.axisLabel('residual $(\\w \\cdot \\phi(x)) - y$', '$\\Loss(x, y, \\w)$');
  else if (opts.weights)
    graph.axisLabel('weight $w_1$', '$\\TrainLoss(\\w)$');
  else
    graph.axisLabel('margin $(\\w \\cdot \\phi(x)) y$', '$\\Loss(x, y, \\w)$');
  graph.trajectoryColors(colors);
  if (!opts.weights) {
    if (opts.legend) graph.legendPivot(4, 0);
    graph.ymaxValue(4);
  }
  graph.xrange(-range, range).yminValue(0).roundPlaces(0).tickIncrValue(1, opts.weights ? 2 : 1);
  return graph;
}

G.learnFramework = function(i) {
  var myPause = i == 0 ? pause : function() { return _ };
  add(slide('Framework',
    nil(),
    parentCenter(xtable(
      ytable('$\\Train$').center().strokeColor('green'),
      myPause(),
      thickRightArrow(50),
      /*frameBox(xtable(
        myPause(3),
        frameBox(ytable('Feature', 'extraction').center()).strokeColor('blue'),
        rightArrow(40).strokeWidth(5),
        myPause(),
        frameBox(ytable('Parameter', 'tuning').center()).strokeColor('red'),
        myPause(-4),
      _).margin(10).center()).title(opaquebg(purplebold('Learner'))).padding(20),*/
      frameBox(purplebold('Learner')).padding(20),
      myPause(),
      thickRightArrow(),
      ytable(
        myPause(),
        text('$x$').orphan(true),
        downArrow(50).strokeWidth(3).orphan(true),
        myPause(-1),
        frameBox(ytable('$f$').center()),
        myPause(),
        downArrow(50).strokeWidth(3).orphan(true),
        text('$y$').orphan(true),
      _).center().margin(5),
    _).center().margin(15)),
    i < 2 ? _ : pause(),
    i < 2 ? _ : nil(),
    i < 2 ? _ : parentCenter(learnerOpt()),
  _));
}

G.learnerOpt = function() {
  return frameBox(xtable(
    frameBox(green('Optimization problem')),
    rightArrow(50).strokeWidth(5),
    frameBox(orange('Optimization algorithm')),
  _).center()).padding(20).title(opaquebg(purplebold('Learner')));
}

G.optFramework = function(i) {
  add(selectPrefix(i, slide, darkblue('Learning as optimization'),
    nil(),
    parentCenter(learnerOpt()),
    //stmt('Objective function: minimize training loss (e.g., squared, logistic, depending on task) &mdash; global tradeoffs'), pause(),
    //stmt('Optimization algorithm: perform (stochastic) gradient descent &mdash; follow your nose'),
  _));
}

G.twoDimQuadratic = function() {
  var w = 20;
  return gradientPlot({min0: -w, max0: +w, min1: -w, max1: +w, width: 400, height: 300, func: function(w0, w1) {
    return squared(w0*3+w1*0.7 - 4) + squared(-w0*1+w1*0.3 - 3) + squared(-w0*1-w1*3);
  }}).scale(0.6);
}

G.squareBracket = function(x) {
  var px = 10, py = 2;
  var topLeft = [x.left().sub(px), x.top().up(py)];
  var bottomLeft = [x.left().sub(px), x.bottom().down(py)];
  var topRight = [x.right().add(px), x.top().up(py)];
  var bottomRight = [x.right().add(px), x.bottom().down(py)];
  var myline = function(a, b) { return line(a, b).strokeWidth(2); }
  return overlay(
    x,
    // Left
    myline(topLeft, bottomLeft),
    myline(topLeft, [topLeft[0].add(px/2), topLeft[1]]),
    myline(bottomLeft, [bottomLeft[0].add(px/2), bottomLeft[1]]),
    // Right
    myline(topRight, bottomRight),
    myline(topRight, [topRight[0].sub(px/2), topRight[1]]),
    myline(bottomRight, [bottomRight[0].sub(px/2), bottomRight[1]]),
  _);
}

G.linearPredictor = function(opts) {
  if (!opts) opts = {};
  return overlay(
    xtable(
      ytable(
        x1 = node(nil()),
        x2 = node(nil()),
        x3 = node(nil()),
      _).margin(20),
      y = node(nil()),
    _).center().margin(150),
    moveLeftOf(opts.rawx ? '$x_1$' : '$\\phi(x)_1$', x1),
    moveLeftOf(opts.rawx ? '$x_2$' : '$\\phi(x)_2$', x2),
    moveLeftOf(opts.rawx ? '$x_3$' : '$\\phi(x)_3$', x3),
    moveRightOf(opts.out || '$\\text{score}$', y),
    a1 = arrow(x1, y),
    a2 = arrow(x2, y),
    a3 = arrow(x3, y),
    moveTopOf('$\\blue{\\w}$', a1),
  _);
}

G.neuralNetwork = function(i, opts) {
  var myPause = i == 0 ? pause : function() { return _ };
  if (!opts) opts = {};
  return overlay(
    xtable(
      ytable(
        x1 = node(nil()),
        x2 = node(nil()),
        x3 = node(nil()),
      _).margin(20),
      ytable(
        h1 = node('$\\red{\\sigma}$'),
        h2 = node('$\\red{\\sigma}$'),
      _).margin(20),
      myPause(2),
      y = node(nil()),
    _).center().margin(150),
    myPause(-2),
    moveLeftOf(opts.rawx ? '$x_1$' : '$\\phi(x)_1$', x1),
    moveLeftOf(opts.rawx ? '$x_2$' : '$\\phi(x)_2$', x2),
    moveLeftOf(opts.rawx ? '$x_3$' : '$\\phi(x)_3$', x3),
    moveTopOf('$h_1$', h1),
    moveBottomOf('$h_2$', h2),
    a1 = arrow(x1, h1),
    moveTopOf('$\\blue{\\V}$', a1),
    arrow(x1, h2),
    arrow(x2, h1),
    arrow(x2, h2),
    arrow(x3, h1),
    arrow(x3, h2),
    myPause(2),
    a2 = arrow(h1, y),
    arrow(h2, y),
    moveTopOf('$\\blue{\\w}$', a2),
    moveRightOf(opts.out || '$\\text{score}$', y),
  _);
}

G.featureExtractionExample = function() {
  return overlay(
    xtable(
      greenitalics('abc@gmail.com'),
      a = thickRightArrow(250),
      frameBox(table(
        [red('length&gt;10'), ':', blue('1')],
        [red('fracOfAlpha'), ':', blue('0.85')],
        [red('contains_@'), ':', blue('1')],
        [red('endsWith_com'), ':', blue('1')],
        [red('endsWith_org'), ':', blue('0')],
      _).margin(5, 0)).scale(0.8),
    _).center().margin(15),
    moveTopOf(purplebold('feature extractor'), a),
    moveBottomOf(purple('arbitrary!'), a),
  _);
}

////////////////////////////////////////////////////////////
// Search

//// Grid worlds

function Point(x, y) { this.x = x; this.y = y; }
Point.prototype.at = function(pt) { return this.x == pt.x && this.y == pt.y; }
Point.prototype.add = function(pt) { return point(this.x + pt.x, this.y + pt.y); }
Point.prototype.toString = function() { return this.x+','+this.y; }
G.point = function(x, y) { return new Point(x, y); }  // Shorthand

function ensureArray(arg) { return (arg instanceof Array || arg == null) ? arg : [arg]; }

G.GridState = function(state) {
  this.grid = state.grid;
  if (!(this.grid instanceof Array)) this.grid = strToMatrix(this.grid);
  this.me = state.me;
  this.opp = state.opp || point(-1, -1);
  this.oppColor = state.oppColor || 'red';
  if (state.food) {
    // Map from point pt to single array representing possible amount of food that could be at pt
    this.food = {};
    if (state.food instanceof Array) {  // e.g, [[[0, 0], 15], [[1, 2], 10]]
      for (var i = 0; i < state.food.length; i++) {
        var pair = state.food[i];
        this.food[pair[0]] = ensureArray(pair[1]);
      }
    } else {
      for (var key in state.food)
        this.food[key] = ensureArray(state.food[key]);
    }
  }
  this.turn = state.turn || 'me';
}

GridState.prototype.isFree = function(pt) {
  return this.grid[pt.y] && this.grid[pt.y][pt.x] == '.';
}

GridState.prototype.hasFood = function() { return this.food && this.food[this[this.turn]]; }
GridState.prototype.width = function() { return this.grid[0].length; }
GridState.prototype.height = function() { return this.grid.length; }

// Return the [new state, reward]
GridState.prototype.getSuccessorAndReward = function(action) {
  var self = this;

  var newState = new GridState(this);
  var reward = 0;

  // index: which index to pick from (null if none)
  // Return whether can't pick up a unique item
  function pickUp(index) {
    var pt = self[self.turn];
    var result = self.food[pt];
    if (!result) return;  // Nothing to do
    if (result.length == 1) index = 0;  // Unique
    if (index == null) {  // Can't decide now...
      newState.pending = action;
      return;
    }
    reward += self.food[pt][index];  // Take the food
    newState.food[pt] = null;  // Food is now gone
  }

  if (Game.dir[action]) { // e.g., 'West'
    var pt = this[this.turn].add(Game.dir[action]);
    if (this.isFree(pt)) newState[this.turn] = pt;
  } else if (action[0] == 'Jump') { // e.g., ['Jump', point(0, 1)]
    var pt = action[1];
    if (this.isFree(pt)) newState[this.turn] = pt;
  } else if (action[0] == 'SetFood') {  // e.g., ['SetFood', point(0, 1), newAmount]
    var pt = action[1];
    newState.food[pt] = ensureArray(action[2]);
  } else if (action[0] == 'PickUpIndex') {  // e.g., ['PickUp', indexIntoFoodArray]
    pickUp(action[1]);
  } else if (action == 'PickUp') {  // Only applicable when unambiguous
    pickUp();
  } else {
    // Randomized action: hold onto it
    newState.pending = action;
  }
  
  // New turn
  if (newState.pending)
    newState.turn = (this.turn == 'me') && this.isFree(newState.opp) ? 'opp' : 'me';

  return [newState, reward];
}

GridState.prototype.display = function() {
  var self = this;
  var size = 30;
  function background(pt) {
    var cell = square(size).strokeColor('black'); //.fillColor('black');
    var food = self.food && self.food[pt];
    if (!food) return cell;
    if (food[0] == null) food[0] = '?';
    var foodText = food.length == 1 ? text(food[0]).color('blue') : text(food.join('|')).color('gray');
    return overlay(foodText.scale(0.5), cell).pivot(-1, -1);
  }

  function finish(turn, pt, entity) {
    //if (turn == self.turn) entity.strokeColor('black').strokeWidth(3);
    if (self.pending) entity.opacity(0.3);
    return overlay(background(pt), entity).center();
  }

  var grid = mapMatrix(this.grid, function(cell, y, x) {
    var pt = point(x, y);
    if (self.me.at(pt)) return finish('me', pt, eqTriangle(size*0.5).color('green'));  // Me
    //if (self.me.at(pt)) return finish('me', pt, circle(size*0.7/2).color('yellow'));  // Me: Pac-Man
    if (self.opp.at(pt)) return finish('opp', pt, circle(size*0.7/2).color(self.oppColor));  // Opponent
    if (cell == '#') return background(pt).fillColor('black');  // Wall
    if (cell == '.') return background(pt);  // Empty space
    throw 'Invalid char: '+cell;
  });
  return new sfig.Table(grid);
}

G.nodeEdgeGraph = function(options) {
  var mathMode = options.mathMode;
  var directed = options.directed || false;  // Is this a directed graph?
  var nodeSize = options.nodeSize || 40;
  var targetEdgeDist = options.targetEdgeDist || 80;
  var initRandom = options.initRandom;
  var numTrials = options.numTrials || 20;  // Number of random restarts
  var numIters = options.numIters || 100;  // Number of gradient steps
  var labelScale = options.labelScale;
  var labelColor = options.labelColor;
  var labelDist = options.labelDist || 10;
  var maxWidth = options.maxWidth;
  var maxHeight = options.maxHeight;
  var positions = options.positions;

  // Some nodes come as strings, convert to blocks
  var strToNodeIndex = {};

  var nodes = [];
  var edges = [];
  function nodeIndex(o) {
    if (typeof(o) == 'number') return o;
    if (typeof(o) == 'string') {
      if (strToNodeIndex[o] == null) {
        strToNodeIndex[o] = nodes.length;
        nodes.push(text(mathMode ? '$'+o+'$' : o));
      }
      return strToNodeIndex[o];
    }

    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i] == o) return i;
    }
    nodes.push(o);
    return nodes.length-1;
  }

  function parseEdge(edge) {
    if (typeof(edge) == 'string') edge = edge.split(' ');
    var i = nodeIndex(edge[0]);
    var j = nodeIndex(edge[1]);
    return [i, j, edge[2]];
  }

  // Standardize nodes and edges
  if (options.nodes) {
    for (var i = 0; i < options.nodes.length; i++)
      nodeIndex(options.nodes[i]);
  }
  if (options.edges) {
    for (var e = 0; e < options.edges.length; e++)
      edges.push(parseEdge(options.edges[e]));
  }
  
  var highlightNodes = options.highlightNodes || [];
  if (typeof(highlightNodes) == 'string') highlightNodes = highlightNodes.split(' ');
  for (var i = 0; i < highlightNodes.length; i++)
    highlightNodes[i] = nodeIndex(highlightNodes[i]);

  var highlightEdges = options.highlightEdges || [];
  if (typeof(highlightEdges) == 'string') highlightEdges = highlightEdges.split(' ');
  for (var i = 0; i < highlightEdges.length; i++)
    highlightEdges[i] = parseEdge(highlightEdges[i])

  // Constraints that the x-coordinates and y-coordinates have to be equal
  var xequal = options.xequal || [];
  var yequal = options.yequal || [];
  function parseEqual(list) {
    if (typeof(list) == 'string') list = list.split(' ');
    var value = null;
    var newList = [];
    list.forEach(function(item) {
      if (item[0] == '=') value = parseInt(item.slice(1));
      else newList.push(nodeIndex(item));
    });
    return {value: value, list: newList};
  }
  xequal = xequal.map(parseEqual);
  yequal = yequal.map(parseEqual);

  var n = nodes.length;

  if (!positions) {
    // How far the nodes should be
    var adj = [];
    for (var i = 0; i < n; i++) adj[i] = [];
    for (var e = 0; e < edges.length; e++) {
      var i = edges[e][0];
      var j = edges[e][1];
      if (i == j) continue;
      adj[Math.min(i, j)][Math.max(i, j)] = targetEdgeDist;
    }

    var best_xpoint = null;
    var best_ypoint = null;
    var best_objective = null;

    if (initRandom) Math.seedrandom(initRandom);
    else Math.seedrandom();

    for (var trial = 0; trial < numTrials; trial++) {
      var xpoint = [];
      var ypoint = [];
      var xgrad = [];
      var ygrad = [];

      // Intitialize
      var initNoise = 10;
      for (var i = 0; i < n; i++) {
        //xpoint[i] = Math.random() * initNoise;
        xpoint[i] = i * targetEdgeDist;  // Prefer linear layout
        ypoint[i] = Math.random() * initNoise;
      }

      for (var iter = 0; iter < numIters; iter++) {
        // Compute gradient
        var objective = 0;
        for (var i = 0; i < n; i++) xgrad[i] = ygrad[i] = 0;
        for (var i = 0; i < n; i++) {
          for (var j = i+1; j < n; j++) {
            var xi = xpoint[i], yi = ypoint[i];
            var xj = xpoint[j], yj = ypoint[j];
            var pd = Math.sqrt((xi-xj)*(xi-xj) + (yi-yj)*(yi-yj)); // Predicted distance

            var td = adj[i][j];
            var dx, dy;
            if (td == null) td = Math.max(pd, targetEdgeDist);

            var penalty = pd > td ? 1 : 3;  // Farther is okay, closer is not
            // Objective function: 0.5 (pd - td)^2
            dx = (pd - td) * (pd == 0 ? 1 : (xi - xj) / pd) * penalty;
            dy = (pd - td) * (pd == 0 ? 1 : (yi - yj) / pd) * penalty;
            objective += 0.5 * (pd - td) * (pd - td) * penalty;

            // Make sure spread isn't too much
            var penalty = 1;
            if (maxWidth != null) {
              var rx = Math.abs(xi - xj);
              if (rx > maxWidth) {
                objective += 0.5 * (rx - maxWidth) * (rx - maxWidth) * penalty;
                dx += (xi > xj ? 1 : -1) * (rx - maxWidth) * penalty;
              }
            }
            if (maxHeight != null) {
              var ry = Math.abs(yi - yj);
              if (ry > maxHeight) {
                objective += 0.5 * (ry - maxHeight) * (ry - maxHeight) * penalty;
                dy += (yi > yj ? 1 : -1) * (ry - maxHeight) * penalty;
              }
            }

            xgrad[i] += dx;
            xgrad[j] -= dx;
            ygrad[i] += dy;
            ygrad[j] -= dy;
          }
        }

        //sfig.L(objective, wholeNumbers(n).map(function(i) { return xpoint[i].toFixed(2)+','+ypoint[i].toFixed(2); }).join(' '));

        // Update current point with gradient
        var stepSize = 1.0 / Math.sqrt(iter+1);
        for (var i = 0; i < n; i++) {
          xpoint[i] -= stepSize * xgrad[i];
          ypoint[i] -= stepSize * ygrad[i];
        }

        // Enforce constraints
        function processEqual(coord, eq) {
          var value = eq.value;
          var list = eq.list;
          if (value == null) {
            var sum = 0;
            for (var a = 0; a < list.length; a++) sum += coord[list[a]];
            value = sum / eq.list.length;
          }
          for (var a = 0; a < list.length; a++) coord[list[a]] = value;
        }
        xequal.forEach(function(eq) { processEqual(xpoint, eq) });
        yequal.forEach(function(eq) { processEqual(ypoint, eq) });
      }

      //sfig.L(objective);
      //sfig.L(xpoint.join(' '), ypoint.join(' '));
      if (best_objective == null || objective < best_objective) {
        best_objective = objective;
        best_xpoint = [].concat(xpoint);
        best_ypoint = [].concat(ypoint);
      }
    }

    //sfig.L('best', best_objective);
    positions = options.positions = wholeNumbers(n).map(function(i) { return {x: best_xpoint[i], y: best_ypoint[i]}; });
  }
  if (positions.length != nodes.length)
    throw 'Positions should equal the number of nodes: ' + positions.length + ' ' + nodes.length;

  // Draw border around nodes
  for (var i = 0; i < nodes.length; i++) {
    var c = circle(nodeSize/2.0);
    if (highlightNodes.indexOf(i) != -1) c.strokeWidth(2).strokeColor('blue');
    nodes[i] = overlay(c, nodes[i].orphan(true)).center();
  }

  // Draw everything
  var items = [];
  for (var i = 0; i < nodes.length; i++)
    items.push(center(nodes[i]).shiftBy(positions[i].x, positions[i].y));
  for (var e = 0; e < edges.length; e++) {
    var i = edges[e][0];
    var j = edges[e][1];
    var label = edges[e][2];
    var edge = decoratedLine(nodes[i], nodes[j]).strokeWidth(2).drawArrow2(directed);
    if (label != null) {
      label = wrap(label);
      if (labelScale != null) label.scale(labelScale);
      if (labelColor != null) label.strokeColor(labelColor);
      edge.label(label);
      edge.line.labelDist(labelDist);
      var found = false;
      highlightEdges.forEach(function(hedge) {
        if (hedge[0] == edges[e][0] && hedge[1] == edges[e][1])
          found = true;
      });
      if (found) {
        edge.strokeWidth(3);
        edge.line.color('blue');
      }
    }
    items.push(edge);
  }

  // Save rendered objects
  options.getNode = function(s) { return nodes[nodeIndex(s)]; }

  return new sfig.Overlay(items);
}

G.infoExtractExample = function(opts) {
  if (!opts) opts = {};
  return table(
    [opts.xy ? '$y$:' : '', 'FEAT', 'FEAT', 'FEAT', 'FEAT', 'FEAT', 'AVAIL', 'AVAIL', 'AVAIL', 'SIZE', 'SIZE', 'SIZE', 'SIZE'].map(function(x) { return text(red(x)).scale(0.9); }),
    [opts.xy ? '$x$:' : '', 'View', 'of', 'Los', 'Gatos', 'Foothills', 'Available', 'July', '1', '2', 'bedroom', '1', 'bath'].map(function(x) { return greenitalics(x); }),
  _).center().scale(0.73).xmargin(6);
}

G.infoExtractSmallExample = function(opts) {
  if (!opts) opts = {};
  return table(
    [opts.xy ? '$y$:' : '', 'FEAT', 'SIZE', 'SIZE'].map(function(x) { return text(red(x)).scale(0.9); }),
    [opts.xy ? '$x$:' : '', 'Beautiful', '2', 'bedroom'].map(function(x) { return greenitalics(x); }),
  _).center().xmargin(20);
}

G.componentScores = function(opts) {
  var myPause = opts.pause ? pause : function() { return _; };
  return parentCenter(xtable(
    ytable(
      '$S_1($'+greenitalics('Beautiful')+','+red('FEAT')+'$) = 0.5$',
      '$S_1($'+greenitalics('2')+','+red('SIZE')+'$) = 0.1$',
      '$S_1($'+greenitalics('bedroom')+','+red('SIZE')+'$) = 3$',
    _),
    myPause(),
    ytable(
      '$S_2($'+red('-BEGIN-')+','+red('FEAT')+'$) = 1$',
      '$S_2($'+red('FEAT')+','+red('SIZE')+'$) = 0.1$',
      '$S_2($'+red('SIZE')+','+red('SIZE')+'$) = 1$',
    _),
  _).margin(40));
}

G.componentScores1 = function(opts) {
  var myPause = opts.pause ? pause : function() { return _; };
  return parentCenter(xtable(
    ytable(
      '$S_1($'+greenitalics('Beautiful')+','+red('FEAT')+'$) = 8$',
      '$S_1($'+greenitalics('2')+','+red('FEAT')+'$) = 1$',
      '$S_1($'+greenitalics('bedroom')+','+red('FEAT')+'$) = 3$',
    _),
    myPause(),
    ytable(
      '$S_1($'+greenitalics('Beautiful')+','+red('SIZE')+'$) = -1$',
      '$S_1($'+greenitalics('2')+','+red('SIZE')+'$) = 5$',
      '$S_1($'+greenitalics('bedroom')+','+red('SIZE')+'$) = 9$',
    _),
  _).margin(40));
}

G.componentScores2 = function(opts) {
  var myPause = opts.pause ? pause : function() { return _; };
  return parentCenter(xtable(
    ytable(
      '$S_2($'+red('-BEGIN-')+','+red('FEAT')+'$) = 1$',
      '$S_2($'+red('FEAT')+','+red('FEAT')+'$) = 3$',
      '$S_2($'+red('SIZE')+','+red('FEAT')+'$) = -2$',
    _),
    myPause(),
    ytable(
      '$S_2($'+red('-BEGIN-')+','+red('SIZE')+'$) = 1$',
      '$S_2($'+red('FEAT')+','+red('SIZE')+'$) = -1$',
      '$S_2($'+red('SIZE')+','+red('SIZE')+'$) = 5$',
    _),
  _).margin(40));
}

G.costAlgorithm = function(options) {
  function myPause(n) { return options.pause ? pause(n) : _; }
  return algorithm(options.heuristic ? 'A* search' : 'Uniform cost search',
    'explored = set()',
    'frontier = PriorityQueue()',
    '<font color="red">frontier</font>.update(<b>initState</b>, ' + (options.heuristic ? '<font color="purple"><b>h(initState)</b></font>' : 0) + ')', myPause(),
    'while True:',
    '  if frontier.size() == 0: return None', myPause(),
    '  s, priority = <font color="red">frontier</font>.pop()  # priority = FutureCost(s)' + (options.heuristic ? ' + h(s)' : ''),
    '  if <b>IsEnd</b>(s): return s  # Found end state', myPause(),
    '  explored.add(s)', myPause(),
    '  for a in <b>Actions</b>(s):',
    '    t = <b>Succ</b>(s, a)', myPause(),
    '    if t in explored: continue',
    '    <font color="red">frontier</font>.update(t, priority + Cost(s, a)' + (options.heuristic ? ' + <b><font color="purple">h(t) - h(s)</font></b>' : '') + ')',
  _);
}

G.searchProblemDefinition = function() {
  var w = 430;
  return definition('search problem',
    bulletedText('$\\StartState$: starting state').width(w), pause(),
    bulletedText('$\\Actions(s)$: possible actions').width(w), pause(),
    bulletedText('$\\Cost(s, a)$: action cost').width(w), pause(),
    bulletedText('$\\Succ(s, a)$: successor').width(w), pause(),
    bulletedText('$\\IsEnd(s)$: reached end state?').width(w),
  _);
}

////////////////////////////////////////////////////////////
// MDP

G.Bandit = function(options) {
  if (!options) options = {};
  // Multi-armed bandit example
  var numDoors = 3;
  var humanScore = 0;
  var computerScore = 0;
  function formatNumber(x) { return x.toString().bold().fontcolor('blue'); }
  var humanScoreBox = wrap(formatNumber(0));
  var computerScoreBox = wrap(formatNumber(0));
  var trialBox = wrap(formatNumber(0));
  var pointBoxes = [];  // For each door
  var rewardProbs = [0.2, 0.8, 0.5];
  var maxTrials = 20;
  //var probPad = 0.2; var rewardProbs = wholeNumbers(numDoors).map(function() { return probPad + Math.random() * (1-probPad*2); });
  //sfig.L('rewardProbs = ' + rewardProbs);

  // For computer strategy
  var doorSums = zeros(numDoors);
  var doorCounts = zeros(numDoors);
  var trial = 0;

  function resetGame() {
    computerScore = 0;
    trial = 0;
    doorSums = zeros(numDoors);
    doorCounts = zeros(numDoors);
  }

  var cachedV = {};

  // Return value and action obtaining that value.
  function computeV(sums, counts, numTrials) {
    var key = sums+';'+counts+';'+numTrials;
    if (cachedV[key]) return cachedV[key];
    if (numTrials == 0) return [0, null];
    var bestValue = null;
    var besta = null;
    for (var a = 0; a < numDoors; a++) {
      var value = computeQ(sums, counts, a, numTrials);
      if (besta == null || value > bestValue) {
        bestValue = value;
        besta = a;
      }
    }
    return cachedV[key] = [bestValue, besta];
  }

  var smoothing = 1;
  function computeQ(sums, counts, a, numTrials) {
    var value = 0;
    counts[a]++;
    var prob = (sums[a]+smoothing) / (counts[a]+2*smoothing);

    // Draw 1
    sums[a]++;
    value += prob * (1 + computeV(sums, counts, numTrials-1)[0]);

    // Draw 0
    sums[a]--;
    value += (1-prob) * computeV(sums, counts, numTrials-1)[0];

    counts[a]--;
    //sfig.L(sums + ' ; ' + counts + ' => ' + value);
    return value;
  }

  function bayes() { return computeV(doorSums, doorCounts, 5)[1]; }

  function epsilonGreedy() {
    if (Math.random() < 1.0 / Math.sqrt(trial+1)) return Math.floor(Math.random() * numDoors);
    //if (Math.random() < 0.5) return Math.floor(Math.random() * numDoors);
    var bestValue = null;
    var besta = null;
    for (var a = 0; a < numDoors; a++) {
      var value = doorSums[a] / doorCounts[a];
      if (besta == null || value > bestValue) {
        bestValue = value;
        besta = a;
      }
    }
    return besta;
  }

  function sampleRewards() {
    var rewards = [];
    for (var a = 0; a < numDoors; a++)
      rewards[a] = Math.random() < rewardProbs[a] ? 1 : 0;
    return rewards;
  }

  function simulate() {
    var history = [];
    for (trial = 0; trial < maxTrials; trial++) {
      var rewards = sampleRewards();
      var computerIndex = bayes(maxTrials-trial);
      //var computerIndex = epsilonGreedy();
      computerScore += rewards[computerIndex];
      doorSums[computerIndex] += rewards[computerIndex];
      doorCounts[computerIndex]++;
      if (trial < 10) history.push(computerIndex+':'+rewards[computerIndex]);
    }
    sfig.L(history+'');
    sfig.L(doorSums + ' | ' + doorCounts);
    sfig.L(computerScore);
  }
  function simulateManyTimes() {
    var totalComputerScore = 0;
    for (var i = 0; i < 1; i++) {
      simulate();
      totalComputerScore += computerScore;
      resetGame();
    }
    sfig.L(totalComputerScore);
  }
  //simulateManyTimes();

  function door(index) {
    var doorFrame = overlay(rect(80, 160).round(10).strokeWidth(2).fillColor('brown').opacity(0.5), ['A', 'B', 'C'][index]).center();
    //var doorHandle = transform(circle(5)).pivot(1, 0).shift(doorFrame.right().sub(3), doorFrame.ymiddle());
    var pointBox = wrap(nil());
    pointBoxes.push(pointBox);
    var result = overlay(
      doorFrame,
      //doorHandle,
      transform(pointBox).pivot(0, 1).shift(doorFrame.xmiddle(), doorFrame.bottom().sub(10)),
    _);

    result.onClick(function() {
      var rewards = sampleRewards();

      humanScore += rewards[index];
      humanScoreBox.resetContent(formatNumber(humanScore));
      pointBoxes.forEach(function(box) { box.resetContent(nil()); });
      var t = text((rewards[index] == 1 ? 'yes' : 'no').toString().bold()).color(rewards[index] == 1 ? 'green' : 'red');
      pointBox.resetContent(t);

      var computerIndex = bayes(maxTrials-trial);
      computerScore += rewards[computerIndex];
      computerScoreBox.resetContent(formatNumber(computerScore));
      doorSums[computerIndex] += rewards[computerIndex];
      doorCounts[computerIndex]++;
      sfig.L(doorSums + ' | ' + doorCounts);

      trial++;
      trialBox.resetContent(formatNumber(trial));

      prez.refresh();
    });
    result.setPointerWhenMouseOver();
    return result;
  }
  var doors = xtable(door(0), door(1), door(2)).xmargin(50);

  this.slide = slide(options.title,
    headerList(null,  
      'Three drugs (A, B, C), each with some probability of success.',
      'Conduct 20 trials; in each trial, choose one of the drugs.',
      'Goal: maximize number of successes.',
    _),
    parentCenter(doors),
    pause(options.pause ? 1 : 0),
    parentCenter(xtable(
      xseq('Trials:', overlay(square(50), trialBox).center()),
      xseq('Score:', overlay(square(50), humanScoreBox).center()),
      pause(options.pause ? 1 : 0),
      xseq('Computer score:', overlay(square(50), computerScoreBox).center()),
    _).xmargin(100)),
  _);
}

G.mdpDefinition = function(opts) {
  function myPause(n) { return opts.pause ? pause(n) : _; }
  function mdpText(s) { return opts.rl ? text(s).showLevel(-1) : text(s); }
  return definition('Markov decision process',
    '$\\States$: the set of states', myPause(),
    '$\\StartState \\in \\States$: starting state', myPause(),
    '$\\Actions(s)$: possible actions from state $s$', myPause(),
    mdpText('$T(s, a, s\')$: probability of $s\'$ if take action $a$ in state $s$'), myPause(),
    mdpText('$\\Reward(s, a, s\')$: reward for the transition $(s, a, s\')$'), myPause(),
    '$\\IsEnd(s)$: whether at end of game', myPause(),
    '$0 \\le \\gamma \\le 1$: discount factor (default: $1$)',
  _);
}

G.game1MDP = function() {
  function labelNode(x, label) { return overlay(x, center(label).scale(0.6).orphan(true)).center(); }
  return overlay(
    table(
      [i = labelNode(circle(20), 'in').strokeColor('blue'), c = labelNode(circle(20).dashed().strokeColor('red'), text('in,stay').scale(0.7))],
      [e = labelNode(circle(20).dashed().strokeColor('red'), text('in,quit').scale(0.7)), o = labelNode(circle(20), 'end').strokeColor('blue')],
    _).center().margin(200, 100),
    let(d = 10),
    labeledArrow([i.right(), i.ymiddle().sub(d)], [c.left(), c.ymiddle().sub(d)], 'stay'.fontcolor('blue')),
    labeledArrow([c.left(), c.ymiddle().add(d)], [i.right(), i.ymiddle().add(d)], '(2/3): $\\$4$'.fontcolor('red')),
    labeledArrow(c, o, '(1/3): $\\$4$'.fontcolor('red')),
    labeledArrow(i, e, 'quit'.fontcolor('blue')),
    labeledArrow(e, o, '1: $\\$10$'.fontcolor('red')),
  _);
}

G.addConnectionsSlide = function() {
  add(summarySlide('Connections',
    parentCenter(overlay(
      ytable(
        pi = text('$\\pi(s)$'),
        mid = square(5),
        xtable(
          q = text('$Q_\\pi(s, a)$'), v = text('$V_\\pi(s)$'),
        _).margin(300),
      _).margin(80).center(),
      qpi = arrow(q, pi).strokeWidth(2).color('green'),
      arrow(q, mid).strokeWidth(4).color('blue'),
      arrow(pi, mid).strokeWidth(4).color('blue'),
      arrow(mid, v).strokeWidth(4).color('blue'),
      vq = arrow(v, q).strokeWidth(4).color('red'),
      moveTopOf(purple('policy evaluation'), vq, 10),
      transform(green('policy improvement')).pivot(+1, 0).shift(qpi.xmiddle().sub(10), qpi.ymiddle()),
    _)),
    parentCenter(importantBox('Methods', table(
      [purple('Policy evaluation'), '$(\\blue{\\to} \\red{\\to})^*$'],
      [green('Policy improvement'), '$\\green{\\to}$'],
      [brown('Policy iteration'), '$((\\blue{\\to} \\red{\\to})^* \\green{\\to})^*$'],
      [brown('Value iteration'), '$(\\blue{\\to} \\red{\\to} \\green{\\to})^*$'],
    _).margin(40, 0))),
  _));
}

G.labeledArrow = function(a, b, label, curve) {
  curve = curve || 0;
  var e = arrow(a, b).line.curve(curve).labelDist(curve).strokeWidth(2).end;
  if (curve == 0)
    return overlay(e, opaquebg(center(label)).scale(0.6).shift(e.xmiddle(), e.ymiddle()));
  // TODO: make this work
  return overlay(e, opaquebg(center(label)).scale(0.6).shift(e.line.xlabel(), e.line.ylabel()));
}

G.policyEvaluationTree = function() {
  var node = function() { return frame(circle(25).strokeWidth(2).strokeColor('blue')).padding(0); };
  return parentCenter(overlay(
    xtable(
      s = node(),
      c = circle(25).strokeWidth(2).strokeColor('red').dashed(),
      ytable(t1 = node(), t2 = node()).margin(20).center(),
    _).margin(180).center(),
    labeledArrow(s, c, '$\\pi(s)$'),
    labeledArrow(c, t1, '$T(s, \\pi(s), s\')$'),
    labeledArrow(c, t2, nil()),
    moveCenterOf(text('$s\'$').scale(0.7), t1),
    moveCenterOf(text('$s,\\pi(s)$').scale(0.5), c),
    moveCenterOf(text('$s$').scale(0.7), s),
    moveLeftOf('$\\blue{V_\\pi(s)}$', s),
    moveRightOf('$\\blue{V_\\pi(s\')}$', t1),
    moveTopOf('$\\red{Q_\\pi(s, \\pi(s))}$', c),
  _));
}

G.valueIterationTree = function(options) {
  var node = function() { return frame(circle(25).strokeWidth(2).strokeColor('blue')).padding(0); };
  if (!options) options = {};
  var game = options.game;  // Whether this is the game version
  return parentCenter(overlay(
    xtable(
      s = node(),
      ytable(
        c1 = circle(25).strokeWidth(2).strokeColor('red').dashed(),
        c2 = circle(25).strokeWidth(2).strokeColor('red').dashed(),
      _).margin(20),
      ytable(t1 = node(), t2 = node()).margin(20).center(),
    _).margin(180).center(),
    labeledArrow(s, c1, '$a$'),
    labeledArrow(s, c2, nil()),
    labeledArrow(c1, t1, game ? nil() : '$T(s, a, s\')$'),
    labeledArrow(c1, t2, nil()),
    labeledArrow(c2, t1, nil()),
    labeledArrow(c2, t2, nil()),
    moveCenterOf(text('$s$').scale(0.7), s),
    moveCenterOf(text(game ? '$s\'$' : '$s,a$').scale(0.7), c1),
    moveCenterOf(text(game ? '$s\'\'$' : '$s\'$').scale(0.7), t1),
    options.policyImprovement ? moveLeftOf('$\\purple{\\pi_\\text{new}(s)}$', s) : moveLeftOf(game ? '$V_p(s)$' : '$\\blue{V_\\text{opt}(s)}$', s),
    moveRightOf(options.policyImprovement ? '$\\blue{V_\\pi(s\')}$' : (game ? '$V_p(s\'\')$' : '$\\blue{V_\\text{opt}(s\')}$'), t1),
    options.policyImprovement ? moveTopOf('$\\red{Q_\\pi(s, a)}$', c1) : moveTopOf(game ? '$V_p(s\')$' : '$\\red{Q_\\text{opt}(s,a)}$', c1),
  _));
};

// Handles both MDP and RL
G.volcanoExample = function(opts) {
  // True model of the world
  var numRows = orElse(opts.numRows, 3);
  var numCols = orElse(opts.numCols, 4);
  var volcanoReward = orElse(opts.volcanoReward, -50);
  var passReward = orElse(opts.passReward, 20);
  var moveReward = orElse(opts.moveReward, 0);
  var slipProb = orElse(opts.slipProb, 0);
  var discount = orElse(opts.discount, 1);

  var numIters = orElse(opts.numIters, 0);  // Number of iterations to run value iteration
  var numEpisodes = orElse(opts.numEpisodes, 0);  // Number of times to simulate
  var eta = orElse(opts.eta, 0.5); // step-size for RL
  var epsilon = orElse(opts.epsilon, 0);  // exploration for RL

  //sfig.L(opts);

  var rewards = [];  // [r, c] => reward we get for entering this square
  for (var r = 0; r < numRows; r++) {
    rewards[r] = [];
    for (var c = 0; c < numCols; c++) {
      if (r == numRows-1 && c == 0)
        rewards[r][c] = 2;  // Small consolation prize
      else if ((r < numRows-1) && c == numCols-2)
        rewards[r][c] = volcanoReward;  // Fall into volcano
      else if (r == 0 && c == numCols-1)
        rewards[r][c] = passReward;  // Victory!
      else
        rewards[r][c] = 0;
    }
  }
  var startState = [parseInt(numRows / 2), 0];

  var maxValue = 10;  // For displaying colors properly
  var actions = ['N', 'S', 'E', 'W'];
  var dr = [-1, +1, 0, 0];
  var dc = [0, 0, +1, -1];

  function isEnd(s) { return rewards[s[0]][s[1]] != 0; }

  var states = [];
  var Q = {};
  var transitions = {};  // [state, action] -> [[newState, prob, reward]]
  for (var r = 0; r < numRows; r++) {
    for (var c = 0; c < numCols; c++) {
      var s = [r, c];
      states.push(s);
      for (var ai = 0; ai < actions.length; ai++) {  // For each action...
        var a = actions[ai];
        Q[[s, a]] = 0;

        var T = transitions[[s, a]] = [];
        if (isEnd(s)) continue;

        for (var aai = 0; aai < actions.length; aai++) {  // For each actual action...
          var aa = actions[aai];
          var prob = slipProb/4 + (1-slipProb)*(a == aa);
          if (prob == 0) continue;
          var rr = r + dr[aai];
          var cc = c + dc[aai];
          // If step out of bounds, bring back
          rr = Math.min(Math.max(rr, 0), numRows-1);
          cc = Math.min(Math.max(cc, 0), numCols-1);
          var ss = [rr, cc];
          T.push([ss, prob, moveReward + rewards[rr][cc]]);
        }
      }
    }
  }

  // Value of a state, using Q
  function V(s) {
    if (isEnd(s)) return 0;  // End
    return Math.max.apply(null, actions.map(function(a) {
      return Q[[s, a]];
    }));
  }

  // Return the best actions to take (a list)
  function pi(s) {
    var besta = [];
    var bestq = null;
    actions.forEach(function(a) {
      var q = Q[[s, a]];
      if (bestq == null || q > bestq) {
        besta = [a];
        bestq = q;
      } else if (q == bestq) {
        besta.push(a);
      }
    });
    return besta;
  }

  function epsilonGreedy(episode, s) {
    var e = (epsilon instanceof Array ? epsilon[Math.floor(epsilon.length * episode/numEpisodes)] : epsilon);
    if (Math.random() < e)
      return randomChoice(actions);
    return randomChoice(pi(s));
  }

  var value = null;  // value of start state
  if (numIters > 0) {
    // Value iteration
    for (var iter = 0; iter < numIters; iter++) {
      var newQ = {};
      states.forEach(function(s) {
        if (isEnd(s)) return;
        actions.forEach(function(a) {
          var q = 0;
          //sfig.L(s, a);
          transitions[[s, a]].forEach(function(T) {
            var ss = T[0], prob = T[1], reward = T[2];
            q += prob * (reward + discount * V(ss));
          });
          newQ[[s, a]] = q;
        });
      });
      Q = newQ;
    }
    value = V(startState);
  }
  
  function renderState(s) {
    return blue('('+(s[0]+1)+','+(s[1]+1)+')');
  }

  var utility = null;
  var trace = null;
  if (numEpisodes > 0) {
    // Simulation (with Q-learning)
    var sumTotalReward = 0;
    for (var episode = 0; episode < numEpisodes; episode++) {
      var s = startState;
      var l = 0;
      var cumulativeDiscount = 1;
      var totalReward = 0;
      trace = [['$a$', '$r$', '$s$'], [nil(), nil(), renderState(s)]];
      var experiences = [];
      while (!isEnd(s) && ++l < 100) {
        var a = epsilonGreedy(episode, s);
        var Ts = transitions[[s, a]];
        if (Ts == null)
          throw [s, a];
        var T = Ts[sampleMultinomial(Ts.map(function(T) { return T[1]; }))];
        var ss = T[0], prob = T[1], r = T[2];
        experiences.push([s, a, r, ss]);
        s = ss;
        totalReward += cumulativeDiscount * r;
        cumulativeDiscount *= discount;
        trace.push([a, r, renderState(ss)]);
      }

      // Utilities at each time step
      // Update backwards for better information propagation
      var u = 0;
      for (var i = experiences.length-1; i >= 0; i--) {
        var s = experiences[i][0];
        var a = experiences[i][1];
        var r = experiences[i][2];
        var ss = experiences[i][3];
        var pred = Q[[s, a]];
        var target = null;
        if (opts.rl == 'q') {
          target = r + discount * V(ss);
        } else if (opts.rl == 'sarsa') {
          var q = 0;
          if (i+1 < experiences.length) {
            var aa = experiences[i+1][1];
            q = Q[[ss, aa]];
          }
          target = r + discount * q;
        } else if (opts.rl == 'monte-carlo') {
          u = r + discount * u;
          target = u;
        }
        if (target != null) {
          //sfig.L(''+s, a, r, ''+ss, pred, target);
          Q[[s, a]] = (1 - eta) * pred + eta * target;
        }
      }
      sumTotalReward += totalReward;
    }
    utility = sumTotalReward / numEpisodes;
  }

  function qcolor(value) {
    var b = 100;
    if (value == null) value = 0;
    if (value > 0)
      return rgb(b, b + (255-b)*value/maxValue, b);
    else
      return rgb(b + (255-b)*(-value)/maxValue, b, b);
  }

  // Display everything
  var items = [];
  function addQ(poly, s, a) {
    items.push(poly.strokeWidth(2).fillColor(qcolor(Q[[s, a]])));
    var q = Q[[s, a]];
    if (q != null)
      items.push(moveCenterOf(text(round(q, 1)).scale(0.5), poly));
  }
  for (var r = 0; r < numRows; r++) {
    for (var c = 0; c < numCols; c++) {
      var s = [r, c];
      var isStart = s[0] == startState[0] && s[1] == startState[1];
      var w = 70;
      var h = 70 * sfig.downSign;
      var sq = square(w).shift(c*w, r*h).strokeWidth(isStart ? 3 : 1);
      items.push(sq);
      if (isEnd(s)) {
        var v = rewards[r][c];
        items.push(moveCenterOf(text(v.toString().bold()).strokeColor(v > 0 ? 'green' : (v < 0 ? 'red' : 'black')), sq));
      } else {
        if (opts.showQValues) {  // Show Q-values
          addQ(polygon([c*w, r*h], [(c+1)*w, r*h], [(c+0.5)*w, (r+0.5)*h]), s, 'N');  // N
          addQ(polygon([c*w, (r+1)*h], [(c+1)*w, (r+1)*h], [(c+0.5)*w, (r+0.5)*h]), s, 'S');  // S
          addQ(polygon([(c+1)*w, r*h], [(c+1)*w, (r+1)*h], [(c+0.5)*w, (r+0.5)*h]), s, 'E');  // E
          addQ(polygon([c*w, r*h], [c*w, (r+1)*h], [(c+0.5)*w, (r+0.5)*h]), s, 'W');  // W
        } else if (numIters > 0) {  // Show only the values of states
          var v = round(V(s), 1);
          items.push(moveCenterOf(text(v.toString()), sq));
          // Display the optimal policy according to Q values
          pi(s).forEach(function(a) {
            var ai = actions.indexOf(a);
            var center = [(c+0.5)*w, (r+0.5)*h];
            var half = [center[0] + dc[ai]*w/4, center[1] + dr[ai]*h/4];
            var away = [center[0] + dc[ai]*w/2, center[1] + dr[ai]*h/2];
            items.push(arrow(half, away).strokeWidth(1).color('brown'));
          });
        }
      }
    }
  }

  var result = overlay.apply(null, items);
  if (value != null)
    result = ytable(result, blue('Value')+': '+round(value, 2)).center();
  if (utility != null)
    result = ytable(result, red(numEpisodes > 1 ? 'Average utility' : 'Utility')+': '+round(utility, 2)).center();
  if (trace != null)
    result = xtable(result, table.apply(null, trace).xmargin(5).xjustify('crc').scale(0.5)).margin(10);
  return result;
}

G.volcanoDemo = function(opts) {
  var origInput = opts.origInput.join('\n');
  var inputBox = textBox().multiline(true).content(origInput).size(50, 13);

  function show() {
    var input = inputBox.content().get();
    eval(input);
    if (origInput != input)
      pushKeyValue('volcano', {input: input});
    if (input.indexOf('volcanoReward =') != -1) opts.volcanoReward = volcanoReward;
    if (input.indexOf('passReward =') != -1) opts.passReward = passReward;
    if (input.indexOf('moveReward =') != -1) opts.moveReward = moveReward;
    if (input.indexOf('slipProb =') != -1) opts.slipProb = slipProb;
    if (input.indexOf('discount =') != -1) opts.discount = discount;
    if (input.indexOf('numIters =') != -1) opts.numIters = numIters;
    if (input.indexOf('numEpisodes =') != -1) opts.numEpisodes = numEpisodes;
    if (input.indexOf('epsilon =') != -1) opts.epsilon = epsilon;
    if (input.indexOf('eta =') != -1) opts.eta = eta;
    if (input.indexOf('rl =') != -1) opts.rl = rl;
    return volcanoExample(opts);
  }
  var output = wrap(show());

  inputBox.onEnter(function() {
    inputBox.content(inputBox.textElem.value);
    output.resetContent(show());
    prez.refresh(function() { inputBox.focus(); });
  });
  var controls = xtable(
    button('Run').setPointerWhenMouseOver().onClick(inputBox.onEnter().get()),
    text('(or press ctrl-enter)').scale(0.7),
  _).margin(10).center();
  return xtable(ytable(inputBox, controls).center().margin(20), output).margin(30);
}

////////////////////////////////////////////////////////////
// Games

G.addRewardValue = function(reward, value) {
  if (reward == null) return value;
  //return wholeNumbers(reward.length).map(function(i) { return reward[i] + value[i]; });
  return wholeNumbers(reward.length).map(function(i) { return value[i][0]; });
}

G.averageCombineFunc = function(probs, values) {
  var means = [];
  if (probs.length != values.length) throw 'Mis-match';
  for (var a = 0; a < probs.length; a++) {
    for (var p = 0; p < values[a].length; p++)
      means[p] = (means[p] || 0) + probs[a] * values[a][p];
  }
  return means;
}

G.maxCombineFunc = function(p) {
  var func = function(probs, values) {  // Values: action, player -> value
    var best_a = null;
    for (var a = 0; a < values.length; a++) {
      if (best_a == null || values[a][p] > values[best_a][p])
        best_a = a;
    }
    return values[best_a];
  }
  func.p = p;
  return func;
}

G.gameTree = function(combineFunc, probs, node, children) {
  var branches = [];
  var values = [];
  var maxValue = -1e100, minValue = +1e100;
  for (var i = 0; i < children.length; i++) {
    var child = children[i];
    if (typeof(child) == 'number' || child instanceof Array) {
      var reward = child;
      if (!(reward instanceof Array)) reward = [reward, -reward];  // Assume zero-sum
      child = text(''+reward[0]);
      //child = overlay(square(20).rotate(45), reward[0]).center();
      //child.reward = reward;  // Promote 
      child.value = wholeNumbers(reward.length).map(function(p) { return reward[p]; });
    }
    if (child.value != null) {
      values.push(addRewardValue(child.reward, child.value));
      maxValue = Math.max(maxValue, values[i][0]);
      minValue = Math.min(minValue, values[i][0]);
    }
    var branchLabels = [];
    if (probs != null) branchLabels.push('('+round(probs[i], 2)+')');
    //if (child.reward) branchLabels.push(((gameTree.onlyShowAgentValue ? child.reward[0] : child.reward)+'').fontcolor('red'));
    var branchMarker = null;
    if (branchLabels.length > 0)
      branchMarker = opaquebg(ytable.apply(null, branchLabels).center()).scale(0.6);
    var branch = rootedTreeBranch(branchMarker, child);
    branches.push(branch);
  }

  // Highlight edges
  var target = null;
  var color = null;
  if (combineFunc != null) {
    if (combineFunc.p == 0) {
      target = maxValue;
      color = 'red';
    } else if (combineFunc.p == 1) {
      target = minValue;
      color = 'blue';
    } else {
      color = 'green';
    }
    for (var i = 0; i < children.length; i++) {
      if (values[i][0] == target || (target == null && probs[i] > 0))
        branches[i].edge.strokeWidth(3).strokeColor(color);
    }
  }

  var result = rootedTree.apply(null, [node].concat(branches));
  result.recnodeBorderWidth(0).drawArrow2(true).ymargin(70);
  result.xmargin(70);
  if (combineFunc && values.length > 0) {
    result.value = combineFunc(probs, values);
    result.tail(moveRightOf(text(gameTree.onlyShowAgentValue ? round(result.value[0], 1) : result.value.map(function(v) { return round(v, 1); })[0]).strokeColor(color), node));
  }
  return result;
}

G.ChcIcon = function() { return circle(15); }
G.MaxIcon = function() { return eqTriangle(30); }
//G.MinIcon = function() { return eqTriangle(30).rotate(180); } // TODO: Buggy in Metapost ???
G.MinIcon = function() { var length = 30 * 0.5 * Math.sqrt(3); return sfig.polygon([0,0], [-15, sfig.up(length)], [+15, sfig.up(length)]); }

G.Max = function() { return gameTree(maxCombineFunc(0), null, MaxIcon(), arguments); }
G.Min = function() { return gameTree(maxCombineFunc(1), null, MinIcon(), arguments); }
G.Chc = function() { var n = arguments.length; return gameTree(averageCombineFunc, wholeNumbers(n).map(function() { return 1.0/n; }), ChcIcon(), arguments); }
G.UnkMax = function() { return gameTree(null, null, MaxIcon(), arguments); }
G.UnkMin = function() { return gameTree(null, null, MinIcon(), arguments); }
G.UnkChc = function() { return gameTree(null, null, ChcIcon(), arguments); }

G.minimaxAlgorithm = function(options) {
  function myPause(n) { return options.pause ? pause(n) : _; }
  return pseudocode('minimax',
    'def Vopt(s, d):',
    '  if <b>IsEnd</b>(s): return <b>Utility</b>(s)', myPause(),
    '  if d == 0: return <b>Eval</b>(s)', myPause(),
    '  if <b>Player</b>(s) == "<font color="red">agent</font>":',
    '    v = float(\'-inf\')',
    '    for a in <b>Actions</b>(s):',
    '      v = max(v, Vopt(<b>Succ</b>(s, a), d))',
    '    return v', myPause(),
    '  if <b>Player</b>(s) == "<font color="blue">opp</font>":',
    '    v = float(\'+inf\')',
    '    for a in <b>Actions</b>(s):',
    '      v = min(v, Vopt(<b>Succ</b>(s, a), d-1))',
    '    return v',
  _);
}

G.alphaBetaAlgorithm = function(options) {
  var prune = options.prune;
  function myPause(n) { return options.pause ? pause(n) : _; }
  return pseudocode('alpha-beta',
    'def Vopt(s, d, <font color="red">alpha</font>, <font color="blue">beta</font>):',
    '  if <b>IsEnd</b>(s): return <b>Utility</b>(s)', myPause(),
    '  if d == 0: return <b>Eval</b>(s)', myPause(),
    '  if <b>Player</b>(s) == "<font color="red">agent</font>":',
    '    v = float(\'-inf\')',
    '    for a in <b>Actions</b>(s):',
    '      v = max(v, Vopt(<b>Succ</b>(s, a), d, <font color="red">alpha</font>, <font color="blue">beta</font>))',
    '      <font color="blue">if v >= beta: return v</font>',
    '      <font color="red">alpha = max(alpha, v)</font>',
    '    return v', myPause(),
    '  if <b>Player</b>(s) == "<font color="blue">opp</font>":',
    '    v = float(\'+inf\')',
    '    for a in <b>Actions</b>(s):',
    '      v = min(v, Vopt(<b>Succ</b>(s, a), d-1, <font color="red">alpha</font>, <font color="blue">beta</font>))',
    '      <font color="red">if v <= alpha: return v</font>',
    '      <font color="blue">beta = min(beta, v)</font>',
    '    return v',
  _);
}

G.depthLimitedSchema = function() {
  var h = 80, w = 350;
  var alpha = 0.3;
  return parentCenter(overlay(
    polygon([0, up(h)], [-w, 0], [+w, 0]),
    polygon([0, up(h)], [-w*alpha, up((1-alpha)*h)], [+w*alpha, up((1-alpha)*h)]).fillColor('gray'),
  _));
}

G.randomGameExample = function() {  // Game evaluation
  return parentCenter(Chc(Chc(-50, 50), Chc(1, 3), Chc(-5, 15)));
}
G.minmaxGameExample = function() {
  return parentCenter(Max(Min(-50, 50), Min(1, 3), Min(-5, 15)));
}
G.expectimaxGameExample = function() {
  return parentCenter(Max(Chc(-50, 50), Chc(1, 3), Chc(-5, 15)));
}
G.expectiminimaxGameExample = function() {
  return Max(
    Chc(Min(-50, 50), Min(-5, 15)),
    Chc(Min(1, 3), Min(-50, 50)),
    Chc(Min(-5, 15), Min(1, 3)));
}

G.fullTreeSearch = '$\\displaystyle V_{\\max,\\min}(s) = \\begin{cases} ' +
  '\\Utility(s) & \\IsEnd(s) \\\\ ' +
  '\\max_{a \\in \\Actions(s)} V_{\\max,\\min}(\\Succ(s, a)) & \\Player(s) = \\agent \\\\ ' +
  '\\min_{a \\in \\Actions(s)} V_{\\max,\\min}(\\Succ(s, a)) & \\Player(s) = \\opp \\end{cases}$';
G.limitedDepthSearch = '$\\displaystyle V_{\\max,\\min}(s, \\red{d}) = \\begin{cases} ' +
  '\\Utility(s) & \\IsEnd(s) \\\\ ' +
  '\\red{\\Eval(s)} & \\red{d = 0} \\\\ ' +
  '\\max_{a \\in \\Actions(s)} V_{\\max,\\min}(\\Succ(s, a), \\red{d}) & \\Player(s) = \\agent \\\\ ' +
  '\\min_{a \\in \\Actions(s)} V_{\\max,\\min}(\\Succ(s, a), \\red{d-1}) & \\Player(s) = \\opp \\end{cases}$';

G.gameEvaluationGraph = function() {
  return parentCenter(overlay(
    xtable(a = circle(20), b = circle(20), c = circle(20), d = circle(20)).margin(100).center(),
    labeledArrow(a, b, '$\\pi_\\agent$'),
    labeledArrow(b, c, '$\\pi_\\opp$'),
    labeledArrow(c, d, '$\\pi_\\agent$'),
    moveRightOf('...', d),
  _));
}

G.agentNatureGraph = function() {
  return parentCenter(overlay(
    xtable(a = eqTriangle(40), b = circle(20), c = eqTriangle(40), d = circle(20)).margin(100).center(),
    labeledArrow(a, b, '$\\pi_\\agent$'),
    labeledArrow(b, c, '$\\pi_\\opp$'),
    labeledArrow(c, d, '$\\pi_\\agent$'),
    moveRightOf('...', d),
  _));
}

G.agentOpponentGraph = function() {
  return parentCenter(overlay(
    xtable(a = eqTriangle(40), b = eqTriangle(40).rotate(180), c = eqTriangle(40), d = eqTriangle(40).rotate(180)).margin(100).center(),
    labeledArrow(a, b, '$\\pi_\\agent$'),
    labeledArrow(b, c, '$\\pi_\\opp$'),
    labeledArrow(c, d, '$\\pi_\\agent$'),
    moveRightOf('...', d),
  _));
}

G.agentNatureOpponentGraph = function() {
  return parentCenter(overlay(
    xtable(b = eqTriangle(40), c = circle(20), d = eqTriangle(40).rotate(180), e = circle(20)).margin(90).center(),
    labeledArrow(b, c, '$\\pi_\\agent$'),
    labeledArrow(c, d, '$\\pi_\\dice$'),
    labeledArrow(d, e, '$\\pi_\\opp$'),
    moveRightOf('...', e),
  _));
}

G.backgammonGraph = function() {
  return parentCenter(overlay(
    xtable(/*a = circle(20), */b = eqTriangle(40), c = circle(20), d = eqTriangle(40).rotate(180), e = circle(20)).margin(90).center(),
    //labeledArrow(a, b, '$\\pi_\\dice$'),
    labeledArrow(b, c, '$\\pi_\\agent$'),
    labeledArrow(c, d, '$\\pi_\\coin$'),
    labeledArrow(d, e, '$\\pi_\\opp$'),
    moveRightOf('...', e),
  _));
}

////////////////////////////////////////////////////////////
// CSPs

G.australiaRegions = ['WA', 'NT', 'Q', 'NSW', 'V', 'SA', 'T'];
G.australia = function(options) {
  var colors = options.colors || {};
  var domains = options.domains;
  var condition = options.condition;
  function node(label) {
    if (condition && (label == 'Q' || label == 'SA')) return nil();
    return factorNode(label, {color: colors[label]});
  }
  var wa = node('WA');
  var nt = node('NT');
  var q = node('Q');
  var sa = node('SA');
  var nsw = node('NSW');
  var v = node('V');
  var t = node('T');
  function edge(a, b) {
    if (condition && (b == q || b == sa)) return partialEdgeFactor(a, b);
    return edgeFactor(a, b);
  }

  // Space-separated list of colors which are acceptable (null means anything is okay)
  function feasibleSet(colors) {
    function box(set, color) {
      if (set == null || set.match(color)) return square(20).fillColor(color).fillOpacity(0.5);
      return square(20).opacity(0);
    }
    var r = box(colors, 'red');
    var g = box(colors, 'green');
    var b = box(colors, 'blue');
    return frame(xtable(r, g, b)).bg.strokeWidth(1).end;
  }

  // Domains
  var labels = _;
  if (domains) {
    labels = overlay(
      moveTopOf(feasibleSet(domains['WA']), wa),
      moveTopOf(feasibleSet(domains['NT']), nt),
      moveBottomOf(feasibleSet(domains['SA']), sa),
      options.partial ? _ : overlay(
        moveTopOf(feasibleSet(domains['Q']), q),
        moveTopOf(feasibleSet(domains['NSW']), nsw),
        moveRightOf(feasibleSet(domains['V']), v),
        moveRightOf(feasibleSet(domains['T']), t),
      _),
    _);
  }

  return overlay(
    wa.shiftBy(0, 0),
    nt.shiftBy(100, -50),
    sa.shiftBy(100, 50),
    edge(wa, nt),
    edge(wa, sa), edge(nt, sa),
    options.partial ? _ : overlay(
      q.shiftBy(200, -30),
      nsw.shiftBy(300, 50),
      v.shiftBy(200, 120),
      t.shiftBy(200, 200),
      edge(nt, q), edge(nsw, q),
      edge(nsw, sa), edge(v, sa),
      condition ? _ : edge(q, sa),
      edge(v, nsw),
    _),
    labels,
  _);
}

G.backtrackingTree = function(tree, options) {
  if (options == null) options = {};
  if (!(tree instanceof Array)) tree = [tree];
  var children = [];
  for (var i = 1; i < tree.length; i++) {
    if (options.pause) children.push(pause());
    children.push(backtrackingTree(tree[i], options));
  }
  var isStr = sfig.isString(tree[0]);
  var head = isStr ? text(tree[0]).scale(3) : australia({colors: tree[0], domains: tree[0].domains});
  var out = rootedTree.apply(null, [head].concat(children));
  if (isStr) out.nodeBorderWidth(0);
  else out.nodeBorderWidth(tree[0].highlight ? 10 : 3);
  out.nodePadding(10).margin(60, 60);
  out.drawArrow2(true).verticalCenterEdges(true);
  return out;
}

G.standardAustraliaColors = {WA: 'red', NT: 'green', Q: 'red', SA: 'blue', NSW: 'green', V: 'red', T: 'green'};
G.coloredAustralia = function() {
  return australia({colors: standardAustraliaColors});
}

G.partlyColoredAustralia = function() {
  return australia({colors: {WA: 'red', NT: 'green', Q: 'red', SA: 'blue'}});
}

G.naryConstraint = function(n) {
  var f = square(20);
  var nodes = wholeNumbers(n).map(function(i) { return factorNode('$X_{'+(i+1)+'}$'); });
  var lines = wholeNumbers(n).map(function(i) { return line(f, nodes[i]); });
  return overlay(
    ytable(
      f,
      table(nodes).margin(20),
    _).center().margin(50),
    new Overlay(lines),
  _);
}

G.cspGraph = function(o) {
  return overlay(
    table(
      [a = circle(25), b = circle(25)],
      [c = o.eliminate ? nil() : circle(25), d = circle(25)],
    _).margin(60),
    moveCenterOf('$X_1$', a),
    moveCenterOf('$X_2$', b),
    o.eliminate ? _ : moveCenterOf('$X_3$', c),
    moveCenterOf('$X_4$', d),
    o.pause ? pause() : _,
    edgeFactor(a, b),
    edgeFactor(b, d),
    o.eliminate ? _ : overlay(e = edgeFactor(a, c), o.labelEdges ? moveLeftOf('$f_{13}$', e) : _),
    o.eliminate ? _ : overlay(e = edgeFactor(c, d), o.labelEdges ? moveBottomOf('$f_{34}$', e) : _),
    o.eliminate ? overlay(e = edgeFactor(a, d), o.labelEdges ? moveLeftOf('$f_{14}$', e.items[1]) : _) : _, // HACK
  _);
}

G.exampleFactorGraph = function() {
  function varNode(label) {
    return overlay(text(label).orphan(true), circle(25)).center(); 
  }
  function consNode(label) {
    return overlay(text(label).orphan(true).scale(0.8), square(30)).center(); 
  }
  return overlay(
    ytable(
      xtable(x1 = varNode('$X_1$'), x2 = varNode('$X_2$'), x3 = varNode('$X_3$')).xmargin(50),
      xtable(c1 = consNode('$f_1$'), c2 = consNode('$f_2$'), c3 = consNode('$f_3$'), c4 = consNode('$f_4$')).xmargin(50),
    _).center().ymargin(40),
    line(x1, c1).strokeWidth(2),
    line(x1, c2).strokeWidth(2), line(x2, c2).strokeWidth(2),
    line(x2, c3).strokeWidth(2), line(x3, c3).strokeWidth(2),
    line(x3, c4).strokeWidth(2),
  _);
}

G.australiaBacktrackingTree = function() {
  return backtrackingTree([{T: 'red', WA:'red', V:'red'},
    [{T: 'red', WA:'red', V:'red', Q:'red'},
      [{T: 'red', WA:'red', V:'red', Q:'red', NT:'green'},
        [{T: 'red', WA:'red', V:'red', Q:'red', NT:'green', SA: 'blue'},
          [{T: 'red', WA:'red', V:'red', Q:'red', NT:'green', SA: 'blue', NSW: 'green', highlight: true},
          ],
        ],
      ],
      [{T: 'red', WA:'red', V:'red', Q:'red', NT:'blue'},
        [{T: 'red', WA:'red', V:'red', Q:'red', NT:'blue', SA: 'green'},
          [{T: 'red', WA:'red', V:'red', Q:'red', NT:'blue', SA: 'green', NSW: 'blue', highlight: true},
          ],
        ],
      ],
    ],
    [{T: 'red', WA:'red', V:'red', Q:'blue'},
      [{T: 'red', WA:'red', V:'red', Q:'blue', NT: 'green'},
      ],
    ],
    [{T: 'red', WA:'red', V:'red', Q:'green'},
      [{T: 'red', WA:'red', V:'red', Q:'green', NT: 'blue'},
      ],
    ],
  ], {pause: true}).scale(0.28);
}

//// For drawing factor graphs

G.factorNode = function(label, options) {
  if (!options) options = {};
  var color = options.color || 'white';
  var c = circle(options.radius || 30);
  if (color == 'bold')
    c.strokeWidth(5);
  else
    c.fillColor(color).fillOpacity(0.5);
  if (!label) return c;
  return overlay(c, std(label).orphan(true)).center();
}

G.squareFactor = function(options) { 
  if (!options) options = {}
  var color = options.color || 'white';
  return square(10).fillColor(color); }

// Line between a and b with a square factor.
G.edgeFactor = function(a, b, opts) {
  var l = line(a, b);
  return overlay(l.strokeWidth(2), center(squareFactor(opts)).shift(l.xmiddle(), l.ymiddle()));
}

// Line from a to midpoint of a and b with a square factor.
// Think of conditioning on b
G.partialEdgeFactor = function(a, b) {
  var x = a.xmiddle().add(b.xmiddle()).div(2);
  var y = a.ymiddle().add(b.ymiddle()).div(2);
  return overlay(line(a, [x, y]).strokeWidth(2), center(squareFactor()).shift(x, y));
}

G.topEdgeFactor = function(a) {
  var sq = squareFactor();
  return overlay(
    moveTopOf(sq, a, 15),
    line(sq, a).strokeWidth(2),
  _);
}

G.leftEdgeFactor = function(a) {
  var sq = squareFactor();
  return overlay(
    moveLeftOf(sq, a, 15),
    line(sq, a).strokeWidth(2),
  _);
}

G.rightEdgeFactor = function(a) {
  var sq = squareFactor();
  return overlay(
    moveRightOf(sq, a, 15),
    line(sq, a).strokeWidth(2),
  _);
}

G.bottomEdgeFactor = function(a) {
  var sq = squareFactor();
  return overlay(
    moveBottomOf(sq, a, 15),
    line(sq, a).strokeWidth(2),
  _);
}

G.markovModel = function(opts) {
  var K = opts.K || 5;
  var nodes = [];
  var edges = [];
  var words = 'Wreck a nice beach'.split(' ');
  if (opts.values) {
    K = words.length;
  }
  for (var i = 0; i < K; i++) {
    nodes.push(factorNode('$X_'+(i+1)+'$', opts.condition == i ? {color:'gray'} : {}));
    if (opts.values)
      edges.push(moveTopOf(red(words[i]), nodes[i]));
    if (opts.factorGraph) {
      if (i > 0)
        edges.push(edgeFactor(nodes[i-1], nodes[i]));
      else
        edges.push(leftEdgeFactor(nodes[i]));
    } else {
      if (i > 0)
        edges.push(arrow(nodes[i-1], nodes[i]));
    }
  }
  return overlay(
    xtable.apply(null, nodes).margin(40),
    overlay.apply(null, edges),
  _);
}

G.socialNetwork = function() {
  return overlay(
    ytable(
      h1 = factorNode('$H_1$'),
      xtable(x12 = factorNode('$E_{12}$', {color: 'gray'}), x13 = factorNode('$E_{13}$', {color: 'gray'})).margin(100),
      xtable(h2 = factorNode('$H_2$'), x23 = factorNode('$E_{23}$', {color: 'gray'}), h3 = factorNode('$H_3$')).margin(100),
    _).center().margin(20),
    arrow(h1, x12), arrow(h2, x12),
    arrow(h1, x13), arrow(h3, x13),
    arrow(h2, x23), arrow(h3, x23),
    pause(),
    moveLeftOf('politician'.fontcolor('red'), h1), 
    moveLeftOf('scientist'.fontcolor('red'), h2), 
    moveRightOf('scientist'.fontcolor('red'), h3), 
    pause(),
    moveLeftOf('0'.fontcolor('red'), x12),
    moveRightOf('0'.fontcolor('red'), x13),
    moveBottomOf('1'.fontcolor('red'), x23),
  _).scale(0.65);
}

G.naiveBayesModel = function(opts) {
  return overlay(
    ytable(
      y = factorNode('$Y$'),
      opts.pause ? pause() : _,
      xtable(
        x1 = factorNode('$W_1$', opts.condition ? {color: 'gray'} : _),
        x2 = factorNode('$W_2$', opts.condition ? {color: 'gray'} : _),
        '$\\dots$',
        x4 = factorNode('$W_{L}$', opts.condition ? {color: 'gray'} : _),
      _).margin(20).center(),
    _).center().margin(30),
    arrow(y, x1),
    arrow(y, x2),
    arrow(y, x4),
    opts.pause ? pause(-1) : _,
    opts.example ? moveTopOf('travel'.fontcolor('red'), y).scale(0.8) : _,
    opts.pause ? pause() : _,
    opts.example ? moveBottomOf('beach'.fontcolor('red'), x1).scale(0.8) : _,
    opts.example ? moveBottomOf('Paris'.fontcolor('red'), x2).scale(0.8) : _,
  _);
}

G.ldaModel = function(opts) {
  return overlay(
    ytable(
      y = factorNode('$\\alpha$'),
      opts.pause ? pause() : _,
      table([
        z1 = factorNode('$Z_1$'),
        z2 = factorNode('$Z_2$'),
        '$\\dots$',
        z4 = factorNode('$Z_{L}$'),
      ], pause(), [
        x1 = factorNode('$W_1$', opts.condition ? {color: 'gray'} : _),
        x2 = factorNode('$W_2$', opts.condition ? {color: 'gray'} : _),
        '$\\dots$',
        x4 = factorNode('$W_{L}$', opts.condition ? {color: 'gray'} : _),
      ]).margin(20).center(),
    _).center().margin(30),
    pause(-2),
    opts.example ? moveRightOf('{travel:0.8,Europe:0.2}'.fontcolor('red'), y).scale(0.8) : _,
    pause(),
    arrow(y, z1),
    arrow(y, z2),
    arrow(y, z4),
    opts.example ? moveLeftOf('travel'.fontcolor('red'), z1).scale(0.8) : _,
    opts.example ? moveRightOf('Europe'.fontcolor('red'), z4).scale(0.8) : _,
    pause(),
    arrow(z1, x1),
    arrow(z2, x2),
    arrow(z4, x4),
    opts.example ? moveLeftOf('beach'.fontcolor('red'), x1).scale(0.8) : _,
    opts.example ? moveRightOf('Euro'.fontcolor('red'), x4).scale(0.8) : _,
  _);
}

G.hmm = function(opts) {
  var myPause = opts.pause ? pause : function() { return _ };
  var xs = [];
  var es = [];
  var items = [];
  var lastx = null;
  var first = null;
  var hVar = opts.hVar || 'H';
  var oVar = opts.oVar || 'E';
  for (var i = 1; i <= opts.maxTime; i++) {
    var x = factorNode('$'+hVar+'_{'+i+'}$', opts.xfocus != null && opts.xfocus != i ? {color: 'gray'} : null);
    if (!first) first = x;
    xs.push(x);
    if (lastx != null) {
      var t = arrow(lastx, x);
      items.push(t);
    }
    if (opts.pause) items.push(pause());
    var e = factorNode('$'+oVar+'_{'+i+'}$', (opts.condition == null || opts.condition) ? {color: 'gray'} : null);
    es.push(e);
    var o = arrow(x, e);
    items.push(o);
    if (opts.pause) items.push(pause(-1));
    lastx = x;
  }
  if (opts.values) {
    items.push(moveTopOf('(3,1)'.fontcolor('red'), xs[0]).scale(0.8));
    items.push(moveTopOf('(3,2)'.fontcolor('red'), xs[1]).scale(0.8));
  }
  if (opts.pause) items.push(pause());
  if (opts.values) {
    items.push(moveBottomOf('4'.fontcolor('red'), es[0]).scale(0.8));
    items.push(moveBottomOf('5'.fontcolor('red'), es[1]).scale(0.8));
  }
  return overlay(
    table(xs, myPause(), es).margin(50),
    myPause(-1),
    overlay.apply(null, items),
  _);
}

G.chainFactorGraph = function(opts) {
  var nodes = [];
  var start = (opts.start || 1) - 1;
  var end = (opts.end || opts.n) - 1;
  for (var i = start; i <= end; i++) {
    var selected = false;
    if (opts.xfocus != null)
      selected = opts.xfocus != (i+1);
    else if (opts.condition != null)
      selected = opts.condition == (i+1);
    var x = factorNode('$X_{'+(i+1)+'}$', selected ? {color: 'gray'} : null);
    if (selected && opts.remove) x.showLevel(-1);
    nodes[i] = x;
  }
  var edges = [];
  for (var i = start; i <= end; i++) {
    if (i < end) {
      var g = edgeFactor(nodes[i], nodes[i+1]);
      edges.push(g);
      if (opts.remove && i+2 == opts.condition)
        edges.push(moveTopOf('$t_{'+(i+1)+'}(\\cdot, 0)$', g).scale(0.6));
      else if (opts.remove && i+1 == opts.condition)
        edges.push(moveTopOf('$t_{'+(i+1)+'}(0, \\cdot)$', g).scale(0.6));
      else
        edges.push(moveTopOf('$t_{'+(i+1)+'}$', g).scale(0.8));
    }
    if (opts.remove && i+1 == opts.condition) continue;
    var h = bottomEdgeFactor(nodes[i]);
    edges.push(h);
    edges.push(moveRightOf('$o_{'+(i+1)+'}$', h).scale(0.8));
    edges.push(bottomEdgeFactor(nodes[i]));
  }
  if (start > 0 && opts.forward) {
    var f = leftEdgeFactor(nodes[start]);
    edges.push(f);
    edges.push(moveLeftOf('$F_{'+(start+1)+'}$', f).scale(0.8));
  }
  if (end < opts.n-1) {
    var f = rightEdgeFactor(nodes[end]);
    edges.push(f);
    edges.push(moveRightOf('$t_{'+(end+1)+'}(\\cdot, 0)$', f).scale(0.8));
  }
  return overlay(
    xtable.apply(null, nodes.slice(start)).margin(40),
    new Overlay(edges),
  _);
}

G.treeFactorGraph = function(color) {
  return parentCenter(overlay(
    ytable(
      a = factorNode('$X_1$', {color: color}),
      xtable(b1 = factorNode('$X_2$'), b2 = factorNode('$X_3$'), b3 = factorNode('$X_4$'), b4 = factorNode('$X_5$'), b5 = factorNode('$X_6$'), b6 = factorNode('$X_7$')).margin(60),
    _).margin(60).center(),
    edgeFactor(a, b1),
    edgeFactor(a, b2),
    edgeFactor(a, b3),
    edgeFactor(a, b4),
    edgeFactor(a, b5),
    edgeFactor(a, b6),
  _)).scale(0.6);
}

G.beamSearchTree = function(opts) {
  // Choose which ones to stop
  var D = 6;
  var B = 2;
  if (sfig.serverSide) D = 5;  // HACK: because metapost RootedTrees have too much spacing
  function recurse(d) {
    var tree = rootedTree.apply(null, [square(9).round(2)].concat(wholeNumbers(d < D ? B : 0).map(function(i) {
      return recurse(d+1);
    }))).bareHead().xmargin(2).ymargin(50);
    if (opts.pause) tree.showLevel(d);
    return tree;
  }
  var root = recurse(0);
  var candidates = [root];
  if (opts.beamSize) {
    Math.seedrandom(5);
    for (var d = 0; d < D; d++) {
      var newCandidates = [];
      candidates.forEach(function(c) {
        c.branches.forEach(function(b) {
          newCandidates.push(b.child);
        });
      });
      shuffle(newCandidates);
      // Knock out non-candidates
      candidates = [];
      for (var i = 0; i < newCandidates.length; i++) {
        if (i < opts.beamSize)
          candidates.push(newCandidates[i]);
        else {
          newCandidates[i].strokeColor('lightgray');
        }
      }
    }
  }
  return root;
}

G.removeVariableGraph = function(opts) {
  function E(a, b) {
    return line(a, b).strokeWidth(2);
  }
  var removeEliminate = opts.eliminate && opts.remove;
  var body = ytable(
    v = opts.remove ? _ : factorNode('$X_i$', opts.condition ? {color:'gray'} : {}),
    table(
      [
        f1 = removeEliminate ? nil() : squareFactor(),
        f2 = squareFactor(),
        f3 = removeEliminate ? nil() : squareFactor(),
      ], [
        v1 = factorNode(''),
        v2 = factorNode(''),
        v3 = factorNode('')
      ],
    _).margin(50).center(),
  _).center().margin(50);
  var items = [body];
  if (!opts.remove) {
    items.push(E(v, f1));
    items.push(E(v, f2));
    items.push(E(v, f3));
    items.push(moveLeftOf('$f_1$', f1));
    items.push(moveLeftOf('$f_2$', f2));
    items.push(moveRightOf('$f_3$', f3));
  } else if (opts.condition) {
    items.push(moveLeftOf('$g_1$', f1));
    items.push(moveLeftOf('$g_2$', f2));
    items.push(moveRightOf('$g_3$', f3));
  }
  if (opts.condition || !opts.remove) {
    items.push(E(f1, v1));
    items.push(E(f1, v2));
    items.push(E(f3, v3));
  }
  if (removeEliminate) {
    items.push(E(f2, v1));
    items.push(E(f2, v3));
    items.push(moveTopOf('$f_\\text{new}$', f2));
  }
  items.push(E(f2, v2));
  return new Overlay(items);
}

G.conditionVariableGraph = function() {
  return xtable(
    removeVariableGraph({condition: true}),
    ytable(bigRightArrow(100), yspace(80)),
    removeVariableGraph({condition: true, remove: true}),
  _).yjustify('r').margin(50);
}

G.eliminateVariableGraph = function() {
  return xtable(
    removeVariableGraph({eliminate: true}),
    ytable(bigRightArrow(100), yspace(80)),
    removeVariableGraph({eliminate: true, remove: true}),
  _).yjustify('r').margin(50);
}

G.updateColor = function(block) {
  // Move into sfig some day
  if (block.elem) {
    block.elem.style.stroke = block.strokeColor().get();
    block.elem.style.fill = block.fillColor().get();
  }
}

G.isingModel = function(opts) {
  var rows = [];
  var edges = [];
  for (var r = 0; r < opts.numRows; r++) {
    var row = rows[r] = [];
    for (var c = 0; c < opts.numCols; c++) {
      var selected = false;
      if (opts.selected) selected = opts.selected(r, c);
      row.push(factorNode(opts.label ? text('$X_{'+(c+1)+','+(r+1)+'}$').scale(0.7) : null, {color:selected ? 'gray' : 'white'}));
      if (c-1 >= 0)
        edges.push(edgeFactor(row[c-1], row[c]));
      if (r-1 >= 0)
        edges.push(edgeFactor(rows[r-1][c], rows[r][c]));
    }
  }
  return overlay(
    new Table(rows).margin(40),
    new Overlay(edges),
  _);
}

G.forwardMessageGraph = function() {
  return overlay(
    xtable(i = factorNode(text('$X_i$').scale(0.8)), ii = factorNode(text('$X_{i+1}$').scale(0.8))).margin(100), 
    e = edgeFactor(i, ii), moveTopOf('$t_i$', e),
    l = leftEdgeFactor(i), moveLeftOf('$F_{i-1}$', l),
    b = bottomEdgeFactor(i), moveBottomOf('$o_i$', b),
    moveRightOf('...', ii),
  _);
}

G.backwardMessageGraph = function() {
  var i, ii, e, r, b;
  return overlay(
    xtable(i = factorNode(text('$X_{i-1}$').scale(0.8)), ii = factorNode(text('$X_{i}$').scale(0.8))).margin(100), 
    e = edgeFactor(i, ii), moveTopOf('$t_{i-1}$', e),
    r = rightEdgeFactor(ii), moveRightOf('$B_{i+1}$', r),
    b = bottomEdgeFactor(ii), moveBottomOf('$o_i$', b),
    moveLeftOf('...', i),
  _);
}

G.muChainGraph = function() {
  var i, l, r, b;
  return overlay(
    i = factorNode(text('$X_{i}$')),
    l = leftEdgeFactor(i), moveLeftOf('$F_{i-1}$', l),
    r = rightEdgeFactor(i), moveRightOf('$B_{i+1}$', r),
    b = bottomEdgeFactor(i), moveBottomOf('$o_i$', b),
  _);
}

G.mu2ChainGraph = function() {
  var i, ii, e, l, r, b, bb;
  return overlay(
    xtable(
      i = factorNode(text('$X_{i}$').scale(0.8)),
      ii = factorNode(text('$X_{i+1}$').scale(0.8)),
    _).margin(80),
    e = edgeFactor(i, ii), moveTopOf('$t_i$', e),
    l = leftEdgeFactor(i), moveLeftOf('$F_{i-1}$', l),
    r = rightEdgeFactor(ii), moveRightOf('$B_{i+2}$', r),
    b = bottomEdgeFactor(i), moveBottomOf('$o_i$', b),
    bb = bottomEdgeFactor(ii), moveBottomOf('$o_{i+1}$', bb),
  _);
}

G.forwardBackwardLattice = function(opts) {
  var grid = [];
  var items = [];
  function state(x) { return frame(std(x).scale(0.7)).bg.strokeWidth(1).round(0).end; }
  for (var r = 0; r < opts.numRows; r++) {
    grid[r] = [];
    for (var c = 0; c < opts.numCols; c++) {
      grid[r][c] = state('$H_{'+(c+1)+'}\\!=\\!'+(r+1)+'$');
      if (r == opts.focus[0] && c == opts.focus[1])
        grid[r][c].fillColor('lightblue');
    }
  }
  var start = state('start');
  var end = state('end');

  for (var r = 0; r < opts.numRows; r++)
    items.push(arrow(start, grid[r][0]));
  for (var r = 0; r < opts.numRows; r++)
    items.push(arrow(grid[r][opts.numCols-1], end));

  for (var c = 1; c < opts.numCols; c++) {
    for (var q = 0; q < opts.numRows; q++) {
      for (var r = 0; r < opts.numRows; r++) {
        var a = grid[q][c-1];
        var b = grid[r][c];
        items.push(arrow(a, b));
        //items.push(arrow([a.right(), a.ymiddle()], [b.left(), b.ymiddle()]));
      }
    }
  }
  return overlay(
    xtable(
      start,
      new Table(grid).margin(40),
      end,
    _).margin(40).center(),
    new Overlay(items),
  _);
}

G.momentMatchingLearningExample = function(opts) {
  var theta = [0, 0];
  var targets = opts.multipleTargets ? [[1, 0], [1, 1]] : [[1, 0]];
  var rows = [];
  if (opts.perceptron)
    rows.push(['$\\theta$', 'Target features', 'Predicted features'].map(bold));
  else
    rows.push(['$\\theta$', '$\\P(X = x_\\text{train}; \\theta)$', 'Target features', 'Predicted features'].map(bold));
  function vec(a) { return '[' + round(a[0], 2) + ',' + round(a[1], 2) + ']'; }
  var ex = 0;
  if (opts.numRealIters == null) opts.numRealIters = opts.numIters;
  for (var iter = 0; iter < opts.numRealIters; iter++) {
    //var stepSize = opts.perceptron ? 1 : 1.0 / Math.sqrt(iter + 1);
    //var stepSize = 1.0 / Math.sqrt(iter + 1);
    var stepSize = opts.stepSize || 1;
    target = targets[ex];
    ex = (ex + 1) % targets.length;
    var prob00 = Math.exp(theta[1]);
    var prob01 = Math.exp(0);
    var prob10 = Math.exp(theta[0]);
    var prob11 = Math.exp(theta[0] + theta[1]);
    if (opts.perceptron) {
      var m = Math.max(prob00, prob01, prob10, prob11);
      if (prob00 == m) prob01 = prob10 = prob11 = 0;
      else if (prob01 == m) prob00 = prob10 = prob11 = 0;
      else if (prob10 == m) prob00 = prob01 = prob11 = 0;
      else if (prob11 == m) prob00 = prob01 = prob10 = 0;
      else throw 'Internal error';
    }
    var Z = (prob00 + prob01 + prob10 + prob11);
    prob00 /= Z;
    prob01 /= Z;
    prob10 /= Z;
    prob11 /= Z;
    //L(prob00, prob01, prob10, prob11);
    var pred = [prob10 + prob11, prob00 + prob11];
    if (iter < opts.numIters || iter >= opts.numRealIters - 1) {
      rows.push(pause());
      if (opts.perceptron) {
        if (iter == opts.numRealIters - 1 && iter != opts.numIters - 1) rows.push(['...', '...', '...']);
        rows.push([vec(theta), vec(target), vec(pred)]);
      } else {
        if (iter == opts.numRealIters - 1 && iter != opts.numIters - 1) rows.push(['...', '...', '...', '...']);
        rows.push([vec(theta), round(prob10, 2), vec(target), vec(pred)]);
      }
    }
    for (var j = 0; j < 2; j++)
      theta[j] += stepSize * (target[j] - pred[j]);
  }
  return new Table(rows).margin(50, 0);
}

////////////////////////////////////////////////////////////
// Bayesian networks

G.twoLayerBayesNet = function(opts) {
  var nodes1 = wholeNumbers(opts.n1).map(function(i) { return factorNode(); });
  var nodes2 = wholeNumbers(opts.n2).map(function(i) { return factorNode(null, {color:'gray'}); });
  var edges = [];
  for (var i = 0; i < nodes1.length; i++)
    for (var j = 0; j < nodes2.length; j++)
      edges.push((opts.undirected ? line : arrow)(nodes1[i], nodes2[j]));
  return overlay(
    ytable(
      xtable.apply(null, nodes1).margin(50),
      xtable.apply(null, nodes2).margin(50),
    _).center().margin(200),
    new Overlay(edges),
    (opts.label ? moveLeftOf('$h$', nodes1[0]) : _),
    (opts.label ? moveLeftOf('$x$', nodes2[0]) : _),
  _);
}

G.simpleAlarmNetwork = function(opts) {
  return overlay(
    ytable(
      xtable(b = factorNode('$B$'), e = factorNode('$E$')).margin(100),
      a = factorNode('$A$', opts.condition ? {color: 'gray'}: null),
    _).center().margin(5),
    opts.factorGraph ?
    overlay(
      fb = topEdgeFactor(b),
      fe = topEdgeFactor(e),
      sq = moveTopOf(squareFactor(), a, 10),
      line(b, sq).strokeWidth(2),
      line(e, sq).strokeWidth(2),
      line(a, sq).strokeWidth(2),
      opts.showPotentials ? overlay(
        moveTopOf('$p(b)$', fb).scale(0.6),
        moveTopOf('$p(e)$', fe).scale(0.6),
        moveTopOf('$p(a \\mid b, e)$', sq).scale(0.6),
      _) : nil(),
    _) :
    overlay(
      arrow(b, a),
      arrow(e, a),
    _),
  _);
}

G.simpleInvertedV = function(opts) {
  return overlay(
    ytable(
      a = factorNode('$A$', opts.condition ? {color: 'gray'}: null),
      xtable(h = factorNode('$H$'), i = factorNode('$I$')).margin(100),
    _).center().margin(5),
    opts.factorGraph ?
    overlay(
      fa = topEdgeFactor(a),
      fh = edgeFactor(a, h),
      fi = edgeFactor(a, i),
      moveTopOf('$p(a)$', fa).scale(0.6),
      moveTopLeftOf('$p(h \\mid a)$', fh).scale(0.6),
      moveTopRightOf('$p(i \\mid a)$', fi).scale(0.6),
    _) :
    overlay(
      arrow(a, h),
      arrow(a, i),
    _),
  _);
}

G.eliminateSimpleInvertedV = function(opts) {
  return overlay(
    xtable(h = factorNode('$H$'), i = factorNode('$I$')).margin(100),
    edgeFactor(h, i),
  _);
}

G.simpleMedicalNetwork = function(opts) {
  return overlay(
    ytable(
      xtable(c = factorNode('$C$'), a = factorNode('$A$')).margin(100),
      xtable(
        h = factorNode('$H$', opts.condition ? {color: 'gray'}: null),
        i = factorNode('$I$', opts.condition ? {color: 'gray'}: null),
      _).margin(100),
    _).margin(50),
    opts.factorGraph ?
    overlay(
      fc = topEdgeFactor(c),
      fa = topEdgeFactor(a),
      sq = moveTopOf(squareFactor(), h, 20),
      line(c, sq).strokeWidth(2),
      line(a, sq).strokeWidth(2),
      line(h, sq).strokeWidth(2),
      edgeFactor(a, i),
      opts.showPotentials ? overlay(
        moveTopOf('$p(c)$', fb).scale(0.6),
        moveTopOf('$p(a)$', fe).scale(0.6),
        moveTopOf('$p(h \\mid c, a)$', sq).scale(0.6),
      _) : nil(),
    _) :
    overlay(
      arrow(c, h),
      arrow(a, h),
      arrow(a, i),
    _),
  _);
}

G.eliminateSimpleAlarmNetwork = function(opts) {
  return overlay(
    ytable(
      xtable(b = factorNode('$B$'), e = factorNode('$E$')).margin(100),
    _).center().margin(5),
    opts.factorGraph ?
    overlay(
      fb = topEdgeFactor(b),
      fe = topEdgeFactor(e),
      moveTopOf('$p(b)$', fb).scale(0.6),
      moveTopOf('$p(e)$', fe).scale(0.6),
    _) :
    overlay(
    _),
  _);
}

G.alarmNetwork = function(opts) {
  return overlay(
    ytable(
      l = factorNode('$L$', {color: 'gray'}),
      xtable(b = factorNode('$B$'), e =factorNode('$E$')).margin(150),
      a = factorNode('$A$'),
      xtable(j = factorNode('$J$', {color: 'gray'}), m = factorNode('$M$', {color: 'gray'})).margin(150),
    _).center().margin(0),
    opts.factorGraph ?
    overlay(
      edgeFactor(l, b),
      edgeFactor(l, e),
      sq = moveTopOf(squareFactor(), a, 10),
      line(b, sq).strokeWidth(2),
      line(e, sq).strokeWidth(2),
      line(a, sq).strokeWidth(2),
      edgeFactor(a, j),
      edgeFactor(a, m),
    _) :
    overlay(
      arrow(l, b),
      arrow(l, e),
      arrow(b, a),
      arrow(e, a),
      arrow(a, j),
      arrow(a, m),
    _),
  _);
}

G.simpleDBN = function(opts) {
  var O = 2;
  var T = 4;
  var nodes = [];
  var oNames = 'abcdefg';
  var items = [];
  for (var o = 0; o < O; o++) {
    nodes[o] = [];
    for (var t = 0; t < T; t++)
      nodes[o][t] = factorNode('$H_'+(t+1)+'^\\text{'+oNames[o]+'}$');
    items.push(xtable.apply(null, nodes[o]).shiftBy(o*60, o*60).margin(80));
  }
  for (var o = 0; o < O; o++) {
    for (var t = 0; t < T; t++) {
      var h = nodes[o][t];
      if (t > 0) {
        for (var oo = 0; oo < O; oo++)
          if (oo == o)
            items.push(arrow(nodes[oo][t-1], h));
      }
    }
  }
  if (opts.pause) items.push(pause());
  for (var t = 0; t < T; t++) {
    for (var o = 0; o < O; o++) {
      var h = nodes[o][t];
      //var e = factorNode('$E_'+(t+1)+'^\\text{'+oNames[o]+'}$', {color:'gray'});
      var e = factorNode('$E_'+(t+1)+'$', {color:'gray'});
      if (o == O-1) {
        items.push(e.shift(h.xmiddle(), h.bottom().down(70)));
        for (var oo = 0; oo < O; oo++)
          items.push(arrow(nodes[oo][t], e));
      }
    }
  }
  return new Overlay(items);
}

G.diseaseGraph = function() {
  function node(x, cond) { return frame(x).bg.strokeWidth(1).round(5).fillColor(cond ? 'gray' : 'white').fillOpacity(0.5).end; }
  return overlay(
    ytable(
      xtable(d1 = node('Pneumonia'), d2 = node('Cold'), d3 = node('Malaria')).margin(50),
      pause(),
      xtable(s1 = node('Fever', true), s2 = node('Cough', true), s3 = node('Vomit', true)).margin(50),
    _).center().margin(50),
    arrow(d1, s1),
    arrow(d1, s2),
    arrow(d1, s3),
    arrow(d2, s1),
    arrow(d2, s2),
    arrow(d2, s3),
    arrow(d3, s1),
    arrow(d3, s2),
    arrow(d3, s3),
    pause(-1),
    moveLeftOf('1'.fontcolor('red'), d1),
    moveLeftOf('0'.fontcolor('red'), d2),
    moveLeftOf('0'.fontcolor('red'), d3),
    pause(),
    moveLeftOf('1'.fontcolor('red'), s1),
    moveLeftOf('1'.fontcolor('red'), s2),
    moveLeftOf('0'.fontcolor('red'), s3),
    pause(-1),
  _);
}

G.bayesNetExample = function() {
  return overlay(
    ytable(
      xtable(
        a = factorNode('$A$'),
        b = factorNode('$B$'),
        c = factorNode('$C$'),
      _).margin(100),
      xtable(
        d = factorNode('$D$'),
        e = factorNode('$E$'),
      _).margin(100),
      xtable(
        f = factorNode('$F$'),
        g = factorNode('$G$'),
        h = factorNode('$H$'),
      _).margin(100),
    _).margin(0).center(),
    arrow(a, d),
    arrow(b, d),
    arrow(b, e),
    arrow(c, e),
    arrow(d, f),
    arrow(d, g),
    arrow(e, g),
    arrow(e, h),
  _);
}

////////////////////////////////////////////////////////////
// Logic

G.rainWet = function(color, a, b, c, d) {
  function box(x) { return square(50).fillColor(x ? color : 'white').fillOpacity(x == 2 ? 0.8 : 0.5); }
  return ytable(_, overlay(
    t = table(
      [nil().orphan(true), text(0).orphan(true), text(1).orphan(true)],
      [text(0).orphan(true), box(a), box(b)],
      [text(1).orphan(true), box(c), box(d)],
    _).center(),
    moveTopOf('$\\Wet$', t, 35),
    moveLeftOf(text('$\\Rain$').rotate(-90), t, 20),
  _).scale(0.8)).center().margin(20);
}

rainTrafficSnow = function(color, a, b, c, d, e, f, g, h) {
  function box(x) { return square(50).fillColor(x ? color : 'white').fillOpacity(x == 2 ? 0.8 : 0.5); }
  return ytable(_, overlay(
    t = table(
      [nil().orphan(true), text(0).orphan(true), text(1).orphan(true)],
      [text('0,0').orphan(true), box(a), box(e)],
      [text('0,1').orphan(true), box(b), box(f)],
      [text('1,0').orphan(true), box(c), box(g)],
      [text('1,1').orphan(true), box(d), box(h)],
    _).center(),
    moveTopOf('$\\Snow$', t, 35),
    moveLeftOf(text('$\\Rain,\\Traffic$').rotate(-90), t, 40),
  _).scale(0.8)).center().margin(20);
}

G.formulaSchema = function() { return rect(100, 10).fillColor('pink'); }

G.logicSchema = function(sel) {
  function high(func, str) {
    return !sel || sel.indexOf(str) == -1 ? func(bold(str)) : frameBox(func(bold(str))).strokeWidth(4).bg.fillColor('lightgray').end;
  }
  var syntax = overlay(
    ytable(
      f = formulaSchema(), formulaSchema(), formulaSchema(), formulaSchema(),
      formulaSchema(), formulaSchema(), formulaSchema(), formulaSchema(),
      a = bigDownArrow(140),
      g = formulaSchema(),
    _).center().margin(10),
    moveLeftOf('formula', f).scale(0.8),
    moveLeftOf(ytable(high(green, 'Inference'), high(green, 'rules')).center(), a),
    //moveRightOf(frameBox(ytable(bold('Inference'), bold('algorithm')).center()).strokeWidth(0), a),
  _);
  var semantics = overlay(
    rect(300, 350).round(10).strokeWidth(4),
    n = ellipse(120, 100).shiftBy(150, 200).fillColor('lightgreen'),
    m = ellipse(100, 50).shiftBy(150, 200).fillColor('lightblue'),
    moveTopOf('models', n).scale(0.8),
  _);
  return parentCenter(overlay(
    table(
      [high(red, 'Syntax'), high(blue, 'Semantics')],
      [syntax, semantics],
    _).center().margin(100, 20),
    arrow([f.right(), f.ymiddle()], m).strokeWidth(3),
    arrow([g.right(), g.ymiddle()], n).strokeWidth(3),
  _));
}

G.neuralNetworkGradientDiagram = function() {
  var h1 = T(opLogistic, C('$h_1(1-h_1)$', T(opDot, C('$\\phi(x)$', Leaf('$\\red{\\v_1}$')), Leaf('$\\phi(x)$'))));
  var h2 = T(opLogistic, C('$h_2(1-h_2)$', T(opDot, C('$\\phi(x)$', Leaf('$\\red{\\v_2}$')), Leaf('$\\phi(x)$'))));
  var h3 = T(opLogistic, C('$h_3(1-h_3)$', T(opDot, C('$\\phi(x)$', Leaf('$\\red{\\v_3}$')), Leaf('$\\phi(x)$'))));
  var s1 = T(opDot, C('$h_1$', Leaf('$\\red{w_1}$')), C('$w_1$', h1));
  var s2 = T(opDot, C('$h_2$', Leaf('$\\red{w_2}$')), C('$w_2$', h2));
  var s3 = T(opDot, C('$h_3$', Leaf('$\\red{w_3}$')), C('$w_3$', h3));
  var f = T(opPlus,
    C('1', s1),
    C('1', s2),
    C('1', s3),
  _);
  return overlay(
    T(opSquare, C('$2\\cdot\\text{residual}$', residual = T(opMinus, C('1', f), Leaf('$y$')))),
    moveLeftOf('$h_1$', h1.headBox),
    moveLeftOf('$h_2$', h2.headBox),
    moveLeftOf('$h_3$', h3.headBox),
    moveLeftOf('residual', residual.headBox),
  _);
}

G.smallGraph = function(opts) {
  function barrow(a, b) {
    const arr = arrow(a, b);
    if (opts.showPath) arr.strokeWidth(3).color('blue');
    return arr;
  }
  const nodes = [], edges = [];
  let start, goal;
  nodes.push(start = node(nil()).shift(43, 224));
  nodes.push(node(nil()).shift(126, 152));
  nodes.push(node(nil()).shift(127, 257));
  nodes.push(node(nil()).shift(195, 185));
  nodes.push(node(nil()).shift(213, 273));
  nodes.push(node(nil()).shift(274, 188));
  nodes.push(node(nil()).shift(314, 266));
  nodes.push(node(nil()).shift(350, 183));
  nodes.push(node(nil()).shift(443, 190));
  nodes.push(node(nil()).shift(198, 104));
  nodes.push(node(nil()).shift(391, 247));
  nodes.push(node(nil()).shift(344, 106));
  nodes.push(goal = node(nil()).shift(425, 118));
  edges.push(barrow(nodes[0], nodes[1]));
  edges.push(barrow(nodes[1], nodes[2]));
  edges.push(barrow(nodes[2], nodes[3]));
  edges.push(arrow(nodes[3], nodes[4]));
  edges.push(arrow(nodes[3], nodes[9]));
  edges.push(arrow(nodes[9], nodes[1]));
  edges.push(arrow(nodes[2], nodes[0]));
  edges.push(arrow(nodes[2], nodes[4]));
  edges.push(barrow(nodes[3], nodes[5]));
  edges.push(arrow(nodes[5], nodes[9]));
  edges.push(arrow(nodes[9], nodes[11]));
  edges.push(arrow(nodes[11], nodes[5]));
  edges.push(barrow(nodes[5], nodes[7]));
  edges.push(barrow(nodes[7], nodes[12]));
  edges.push(arrow(nodes[11], nodes[12]));
  edges.push(arrow(nodes[11], nodes[7]));
  edges.push(arrow(nodes[12], nodes[8]));
  edges.push(arrow(nodes[8], nodes[10]));
  edges.push(arrow(nodes[6], nodes[10]));
  edges.push(arrow(nodes[10], nodes[7]));
  edges.push(arrow(nodes[7], nodes[6]));
  edges.push(arrow(nodes[5], nodes[6]));
  edges.push(arrow(nodes[6], nodes[4]));
  edges.push(arrow(nodes[5], nodes[4]));
  edges.push(arrow(nodes[7], nodes[8]));
  start.items[0].strokeWidth(4).strokeColor('blue');
  goal.items[0].strokeWidth(4).strokeColor('blue');
  Math.seedrandom(5);
  const other = [];
  edges.forEach(e => {
    const t = opts.showWeights ? text(randInt(9)) : text('?').color('red');
    other.push(t.scale(0.5).shift(e.xmiddle(), e.ymiddle()));
  });
  return overlay.apply(null, nodes.concat(edges).concat(other)).scale(0.65);
}

G.modeling = function() { return redbold('Modeling'); }
G.inference = function() { return greenbold('Inference'); }
G.learning = function() { return bluebold('Learning'); }

G.paradigm = function () {
  return parentCenter(ytable(
    modeling(),
    xtable(inference(), learning()).margin(200),
  _).margin(200).center());
};
