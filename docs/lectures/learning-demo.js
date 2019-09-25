G = sfig.serverSide ? global : this;
sfig.enableMouseWheel = false;
document.title = 'Learning algorithms demo';
G.prez = sfig.presentation();

function formatFeatureValue(f, v) { return f+':'+round(v, 2).toString().fontcolor('red'); }
function formatInput(x) {
  if (x instanceof Array)
    return x.map(function(v) { return round(v, 2); });
  return x;
}
function formatOutput(y) { return y == null ? '?' : (y == 1 ? '$+1$' : '$'+y+'$'); }

function FeatureVector() {
  this.list = [];
  this.map = {};
}
FeatureVector.prototype.add = function(f, v) {
  if (v == false) v = 0;
  else if (v == true) v = 1;
  f = f.toString();
  if (f in this.map) this.map[f] += v;
  else {
    this.list.push(f);
    this.map[f] = v;
  }
}
FeatureVector.prototype.dot = function(fv) {
  var sum = 0;
  for (var f in this.map) {
    sum += this.map[f] * (fv.map[f] || 0);
  }
  return sum;
}

FeatureVector.prototype.toString = function() {
  var self = this;
  return '[' + self.list.map(function(f) { return formatFeatureValue(f, self.map[f]); }).join(' ') + ']';
}
FeatureVector.prototype.toPlainString = function() {
  var self = this;
  return '[' + self.list.map(function(f) { return f + ':' + self.map[f]; }).join(' ') + ']';
}

function Learner() {
  this.initialize();
}

Learner.prototype.initialize = function() {
  this.examples = [];
  this.extractors = [];
  this.selectedExample = null;

  this.stepFunc = null;  // Run one iteration of learning
  this.predictFunc = null;  // Function that predicts y given x

  this.weights = null;

  this.errors = [];
  this.algorithmStr = null;

  Math.seedrandom('rand', true);
}

Learner.prototype.error = function(message) { this.errors.push(message); return false; }

function button(text) {
  return frame(text).bg.strokeWidth(2).round(10).fillColor('lightblue').end;
}

var learningCode = [
  "",
  "// Learning algorithm",
  "//roteLearning()",
  "//nearestNeighbors()",
  //"sgd({loss: 'perceptron', steps: 1})",
  "sgd({loss: 'logistic', reduction: 0.5, steps: 100})",
];

function dotProduct(a, b) {
  if (a.length != b.length)
    throw 'Lengths don\'t match';
  var sum = 0;
  for (var i = 0; i < a.length; i++)
    sum += a[i] * b[i];
  return sum;
}

var codeExamples = {
  class: [
    "// Simple classification problem",
    "trainExample([1, 5], +1)",
    "trainExample([0, 1], +1)",
    "trainExample([1, 1], -1)",
    "trainExample([8, 3], -1)",
    "",
    "// Linear features",
    "featureExtractor(function(x, fv) {\n  for (var i in x) fv.add(i, x[i])\n})",
    "",
    "Math.seedrandom(42)",
    //"sgd({loss: 'perceptron', lambda: 0, steps: 1})",
    "sgd({loss: 'hinge', steps: 1})",
    "//sgd({loss: 'logistic', steps: 1})",
    //"//sgd({loss: 'hinge', lambda: 1, reduction: 0.5, steps: 10000})",
    //"//sgd({loss: 'logistic', lambda: 1, reduction: 0.5, steps: 10000})",
    "",
    "// Simple walkthrough of two loss functions.",
  ],
  email: [
    "// Email address detection: given a string, is it an email address?",
    "",
    "trainExample('abc@gmail.com', +1)",
    "trainExample('john@foobar.us', +1)",
    "trainExample('cnn.com', -1)",
    "trainExample('meet @2pm', -1)",
    "trainExample('Folding@home', -1)",
    "",
    "testExample('john@foobar.us', +1)",
    "testExample('abc@stanford.edu', +1)",
    "testExample('xyz@hotmail.com', +1)",
    "testExample('@12pm', -1)",
    "testExample('home', -1)",
    "",
    "// Feature: entire string",
    "featureExtractor(function(x, fv) {fv.add(x, 1)})",
    "",
    "// Feature: singleton",
    "/*featureExtractor(function(x, fv) {fv.add(1, 1)})",
    "*/",
    "",
    "// Feature: last 3 characters",
    "/*featureExtractor(function(x, fv) {",
    "  fv.add(x.slice(Math.max(x.length-3, 0)), 1)",
    "})*/",
    "",
    "// Try different feature extractors.",
  ].concat(learningCode),
  regression: [
    "// Simple regression problem",
    "trainExample([1, 5], -3)",
    "trainExample([0, 1], -1.5)",
    "trainExample([1, 1], 0)",
    "trainExample([8, 3], 13)",
    "//trainExample([5, 5], 100)  // Outlier",
    "",
    "// Linear features",
    "featureExtractor(function(x, fv) {\n  for (var i in x) fv.add(i, x[i])\n})",
    "",
    "sgd({loss: 'squared', lambda: 0, initStepSize: 0.1, reduction: 1, steps: 10000})",
    "//sgd({loss: 'absdev', lambda: 0, initStepSize: 1, reduction: 1, steps: 10000})",
    "",
    "// Add the outlier example and note that squared loss is more sensitive.",
  ],
  noise: [
    "// Generate random inputs with noise",
    "w = [3, -2]  // True weights",
    "noise = 0.2  // Flip output with this probability",
    "Math.seedrandom(42)",
    "for (var i = 0; i < 200; i++) {",
    "  var x = w.map(function() { return Math.random()*10-5; });",
    "  var y = dotProduct(x, w) > 0 ? +1 : -1",
    "  if (Math.random() < noise) y = -y",
    "  example({x: x, y: y, train: randInt(2)})",
    "}",
    "",
    "// Linear features",
    "featureExtractor(function(x, fv) {\n  for (var i in x) fv.add(i, x[i])\n})",
    "",
    "// Learning algorithm",
    "sgd({loss: 'logistic', reduction: 1, steps: 10000})",
    "//nearestNeighbors()",
    "",
    "// Note that nearest neighbors overfits.",
    "// Try adding more dimensions to w.",
    "// The gap should increase.",
  ],
  nonlinear: [
    "// Demonstrate effects of non-linearities",
    "w = [3, -2, 2]  // True weights",
    "Math.seedrandom(42)",
    "for (var i = 0; i < 200; i++) {",
    "  var x = [Math.random()*10-5, Math.random()*10-5]",
    "  var y = (x[0]*w[0] + x[1]*w[1] + x[0]*x[1]*w[2]) > 0 ? +1 : -1",
    "  example({x: x, y: y, train: randInt(2)})",
    "}",
    "",
    "// Linear features",
    "featureExtractor(function(x, fv) {\n  for (var i in x) fv.add(i, x[i])\n})",
    "",
    "// Quadratic features",
    "/*featureExtractor(function(x, fv) {\n  for (var i in x) for (var j in x)\n    fv.add(i+'x'+j, x[i]*x[j])\n})*/",
    "",
    "sgd({loss: 'logistic', reduction: 0.5, steps: 100})",
    "",
    "// Point: quadratic features are necessary to classify accurately!",
  ],
  cluster: [
    "// K-means clustering",
    "trainExample([0, 1])",
    "trainExample([1, 2])",
    "trainExample([1, 3])",
    "trainExample([8, 4])",
    "trainExample([9, 3])",
    "trainExample([8, 2])",
    "trainExample([8, 8])",
    "trainExample([8, 6])",
    "trainExample([5, 8])",
    "trainExample([7, 7])",
    "trainExample([4, 7])",
    "trainExample([3, 8])",
    "trainExample([2, 9])",
    "trainExample([6, 9])",
    "",
    "Math.seedrandom(3)",
    "kmeans({K: 3})",
  ],
  new: [
    "// Create your own learning problem!",
    "trainExample([2, 2], 1)",
    "trainExample([1, 3], -1)",
    "nearestNeighbors()",
  ],
};

// Assign random colors to new clusters
var clusterColors = ['red', 'green', 'blue', 'orange'];
function clusterColor(y) {
  //sfig.L(y, typeof(y), clusterColors[y]);
  if (!clusterColors[y])
    clusterColors[y] = rgb(Math.random()*255, Math.random()*255, Math.random()*255);
  return clusterColors[y];
}

Learner.prototype.updateGraph = function() {
  var self = this;

  function showPoints(train) {
    function keepExample(ex) { return (ex.train && train) || (!ex.train && !train); }
    var examples = self.examples.filter(keepExample);
    if (examples.length == 0) return nil();
    if (self.predictFunc == null) return nil();

    // Evaluate error rate
    var error = 0;
    if (self.clustering) {
      examples.forEach(function(ex) {
        var y = self.predictFunc(ex);
        if (y != null)
          error += l2DistSquared(ex.p, self.centers[y]);
        else
          error = 1.0/0;
      });
      statusStr = (train ? 'Train' : 'Test') + ' error: <b>' + round(error, 2) + '</b>';
    } else if (self.regression) {
      examples.forEach(function(ex) {
        ex.predy = self.predictFunc(ex);
        error += 0.5 * squared(ex.predy - ex.y);
      });
      error /= examples.length;
      statusStr = (train ? 'Train' : 'Test') + ' error: <b>' + round(error, 2) + '</b>';
    } else {
      var numMistakes = 0;
      examples.forEach(function(ex) {
        ex.predy = self.predictFunc(ex);
        if (ex.predy != ex.y) numMistakes++;
      });
      error = numMistakes / examples.length;
      statusStr = (train ? 'Train' : 'Test') + ' error: <b>' + numMistakes + '/' + examples.length + ' = ' + round(error, 2) + '</b>';
    }

    statusStr = text(statusStr.fontcolor('brown')).scale(1.3);

    var result = null;

    var has_p = arrayForall(self.examples, function(ex) {return ex.p != null;});
    // Plot points
    if (has_p) {
      var items = [];

      // Need to look at all of the examples
      var min0 = null, max0 = null;
      var min1 = null, max1 = null;
      var miny = null, maxy = null;
      for (var i = 0; i < self.examples.length; i++) {
        var ex = self.examples[i];
        if (min0 == null || ex.p[0] < min0) min0 = ex.p[0];
        if (min1 == null || ex.p[1] < min1) min1 = ex.p[1];
        if (max0 == null || ex.p[0] > max0) max0 = ex.p[0];
        if (max1 == null || ex.p[1] > max1) max1 = ex.p[1];
        if (miny == null || ex.y < miny) miny = ex.y;
        if (maxy == null || ex.y > maxy) maxy = ex.y;
        if (miny == null || ex.predy < miny) miny = ex.predy;
        if (maxy == null || ex.predy > maxy) maxy = ex.predy;
      }

      function to0(x0) { return (x0 - min0) / (max0 - min0 + 1) * 500; }
      function to1(x1) { return -(x1 - min1) / (max1 - min1 + 1) * 500; }
      function y2color(y) {
        var alpha = (y - miny) / (maxy - miny);
        return rgb(alpha*255, 0, (1-alpha)*255);
      }

      var canvas = rawAddSvg(function(container) {
        var numBins0 = (max0-min0);
        var numBins1 = (max1-min1);
        var maxBins = 60;
        numBins0 *= Math.min(3, Math.max(1, Math.round(maxBins / numBins0)));
        numBins1 *= Math.min(3, Math.max(1, Math.round(maxBins / numBins1)));
        var binSize0 = (max0-min0) / numBins0;
        var binSize1 = (max1-min1) / numBins1;

        // Draw predictions
        for (var i0 = 0; i0 <= numBins0; i0++) {
          for (var i1 = 0; i1 <= numBins1; i1++) {
            var x0 = min0 + binSize0 * i0;
            var x1 = min1 + binSize1 * i1;
            var ex = {x: [x0, x1]};
            self.extractFeatures(ex);
            var y = self.predictFunc(ex);
            var sq = sfig_.newSvgElem('rect');
            sq.setAttribute('width', to0(min0+binSize0));
            sq.setAttribute('height', -to1(min1+binSize1));
            sq.setAttribute('x', to0(x0 - binSize0/2));
            sq.setAttribute('y', to1(x1 + binSize1/2));
            sq.style.fillOpacity = 0.5;
            sq.style.strokeWidth = 0;
            var color;
            if (self.clustering) {
              if (y != null) color = clusterColor(y);
              else color = 'gray';
            } else if (self.regression) {
              color = y2color(y);
            } else {
              if (y == +1) color = 'blue';
              else if (y == -1) color = 'red';
              else color = 'gray';
            }
            sq.setAttribute('fill', color);
            sfig_.addTooltipToElem(sq, ['x: '+round(x0, 2)+','+round(x1, 2), 'prediction score: ' + round(ex.score, 2), 'predicted y: ' + (y == null ? '?' : round(y, 2))].join('\n'));
            container.appendChild(sq);
          }
        }

        // Draw centers
        if (self.clustering) {
          for (var k = 0; k < self.centers.length; k++) {
            var c = self.centers[k];
            var p0 = to0(c[0]);
            var p1 = to1(c[1]);
            var pt = sfig_.newSvgElem('rect');
            var w = 10;
            pt.setAttribute('width', 2*w);
            pt.setAttribute('height', 2*w);
            pt.setAttribute('x', p0-w);
            pt.setAttribute('y', p1-w);
            pt.style.fill = clusterColor(k);
            container.appendChild(pt);
          }
        }

        // Draw points
        examples.forEach(function(ex) {
          var selected = (ex == self.selectedExample);
          var correct = ex.y == ex.predy;

          var pt = null;
          var p0 = to0(ex.p[0]);
          var p1 = to1(ex.p[1]);
          if (self.clustering) {
            pt = sfig_.newSvgElem('circle');
            pt.setAttribute('r', 5);
            pt.setAttribute('cx', p0);
            pt.setAttribute('cy', p1);
            if (ex.y != null) pt.style.fill = clusterColor(ex.y);
          } else if (self.regression) {
            pt = sfig_.newSvgElem('circle');
            pt.setAttribute('r', selected ? 10 : 5);
            pt.setAttribute('cx', p0);
            pt.setAttribute('cy', p1);
            pt.style.fill = y2color(ex.y);
          } else {
            if (ex.y == +1) {
              pt = sfig_.newSvgElem('circle');
              pt.setAttribute('r', selected ? 10 : 5);
              pt.setAttribute('cx', p0);
              pt.setAttribute('cy', p1);
              pt.style.fill = 'blue';
            } else if (ex.y == -1) {
              pt = sfig_.newSvgElem('polygon');
              var radius = selected ? 10 : 5;
              pt.setAttribute('points', [[p0, p1-radius], [p0-radius, p1+radius], [p0+radius, p1+radius]].map(function(p) {return p.join(',');}).join(' '));
              pt.style.fill = 'red';
            } else {
              return;
            }
          }
          if (selected) {
            pt.setAttribute('stroke-width', 4);
            pt.setAttribute('stroke', 'black');
          }

          // Add tooltip information about the point
          var score = ex.fv.dot(self.weights);
          sfig_.addTooltipToElem(pt, [
            'x: ' + ex.x,
            'phi(x): ' + ex.fv.toPlainString(),
            'y: ' + ex.y,
            'predicted y: ' + (ex.predy == null ? '?' : round(ex.predy, 2)),
            (self.regression ? 'residual: ' + round(score-ex.y, 2) : 'margin: ' + round(score*ex.y, 2))
          ].join('\n'));

          container.appendChild(pt);
        });
      });
      items.push(canvas);
      result = overlay.apply(null, items);
    } else {
      // Print table if we can't plot the points
      var header = ['$x$', '$\\phi(x)$', '$y$', self.weights ? '$(\\w \\cdot \\phi(x))$' : _, self.weights ? '$f_\\w(x)$' : '$f(x)$'];
      function xToString(x) {
        if (x instanceof Array) {
          x = x.map(function(a) { return Math.round(a * 100) / 100; });
          x = x.slice(0, 3);
        }
        return x.toString();
      }
      function exToRow(ex) {
        return [
          xToString(ex.x),
          nil(), //ex.fv.toString(),
          formatOutput(ex.y),
          self.weights ? '$' + round(ex.fv.dot(self.weights), 2) + '$' : _,
          formatOutput(ex.predy),
        ];
      }
      var rows = [header];
      examples.slice(0, 10).forEach(function(ex) { rows.push(exToRow(ex)); });
      result = frameBox(table.apply(null, rows).yjustify('c').margin(20, 0)).scale(0.8);
    }

    return ytable(result, statusStr).margin(20).center();
  }

  self.graphBox.resetContent(xtable(showPoints(true), showPoints(false)).margin(40));
}

Learner.prototype.updateAll = function() {
  var self = this;
  self.initialize();
  self.currCode = self.inputBox.content().get();

  // Create graph
  try {
    eval(self.inputBox.content().get());
  } catch (e) {
    self.error(e.toString());
  }

  if (self.examples.length == 0)
    self.error('No examples created!');
  if (self.extractors.length == 0)
    self.error('No feature extractors created!');

  if (self.algorithmStr == null)
    self.error('No learning algorithm specified!');

  self.statusBox.resetContent(ytable(
    self.algorithmStr ? stmt('Algorithm', self.algorithmStr.bold()) : _,
  _).scale(1.5));

  var msg = null;
  if (self.errors.length > 0)
    msg = ytable.apply(null, self.errors).strokeColor('red');
  else if (self.stepFunc != null)
    msg = '<b><font color="red">Start of algorithm</b></font>.  Click "Step" to step through it.';
  else
    msg = 'Algorithm done.'.bold().fontcolor('green');

  this.messageBox.resetContent(msg);
  this.extraBox.resetContent(nil());

  self.updateGraph();
}

Learner.prototype.display = function(opts) {
  var self = this;

  function stepCode() {
    self.inputBox.updateContent();
    if (self.inputBox.content().get() != self.currCode) {
      pushKeyValue('learning-demo', {input: self.inputBox.content().get()});
      // If code changed, then need to start from scratch.
      self.updateAll();
    } else if (self.stepFunc) {
      // Otherwise, just step through it.
      var output = self.stepFunc();
      self.messageBox.resetContent(ytable.apply(null, output));
    }
    prez.refresh(function() { self.inputBox.focus(); });
  }

  this.inputBox = textBox().multiline(true).fontSize(12).size(56, 33).onEnter(stepCode);

  this.statusBox = wrap(nil());
  this.graphBox = wrap(nil());
  this.messageBox = wrap(nil());
  this.extraBox = wrap(nil());

  this.stepButton = button('Step').onClick(stepCode).setPointerWhenMouseOver(true);

  var selectedTabColor = 'red';
  var unselectedTabColor = 'blue';

  var exHeader = ['Examples:'.bold()];
  var codeExampleKeys = [];
  var keyToTab = {};
  for (var key in codeExamples) codeExampleKeys.push(key);
  codeExampleKeys.forEach(function(key) {
    var tab = text('['+key+']').color(sfig_.urlParams.example == key ? selectedTabColor : unselectedTabColor).onClick(function() {
      selectExample(key);
      prez.refresh(function() { self.inputBox.focus(); });
    }).setPointerWhenMouseOver(true);
    keyToTab[key] = tab;
    exHeader.push(tab);
  });

  function selectExample(key) {
    var oldKey = sfig_.urlParams.example;

    // Replace tab colors
    if (keyToTab[oldKey])
      keyToTab[oldKey].color(unselectedTabColor);  // Deselect tab
    keyToTab[key].color(selectedTabColor);  // Select tab

    // Replace code
    if (self.inputBox.content().exists()) {
      var content = self.inputBox.textElem.value;
      codeExamples[oldKey] = content.split('\n');  // Save old code
    }
    self.inputBox.content((codeExamples[key] || ['// ' + key + ' not found']).join('\n'));  // Put new code

    sfig_.urlParams.example = key;
    sfig_.serializeUrlParamsToLocation();

    self.updateAll();
  }
  selectExample(sfig_.urlParams.example || 'class');

  return xtable(
    ytable(
      xtable.apply(null, exHeader).margin(5).scale(0.6),
      xtable(
        text('[Background]'.fontcolor('orange')).linkToInternal(prez, 'background', 0).scale(0.6),
        text('[Documentation]'.fontcolor('orange')).linkToInternal(prez, 'documentation', 0).scale(0.6),
      _).margin(10),
      this.inputBox,
      yspace(10),
      indent(xtable(
        this.stepButton,
        text('(or press ctrl-enter in text box)').scale(0.6),
      _).margin(10).center(), 10),
    _),
    overlay(
      ytable(
        this.statusBox,
        overlay(
          this.graphBox,
          this.extraBox,
        _),
        this.messageBox,
      _).margin(20),
    _).scale(0.6),
  _).margin(20);
}

Learner.prototype.trainExample = function(x, y) { this.example({x: x, y: y, train: true}); }
Learner.prototype.testExample = function(x, y) { this.example({x: x, y: y, train: false}); }

Learner.prototype.example = function(ex) {
  if (ex.x == null) this.error('Example without input x: '+ex);
  //if (ex.y == null) this.error('Example without output y: '+ex);
  this.examples.push(ex);
}

Learner.prototype.featureExtractor = function(extractor) {
  if (!(extractor instanceof Function))
    return this.error('Feature extractor should be a function, but got '+extractor);
  this.extractors.push(extractor);
}

Learner.prototype.extractFeatures = function(ex) {
  var self = this;
  ex.fv = new FeatureVector();
  self.extractors.forEach(function(extractor) {
    extractor(ex.x, ex.fv);
    for (var f in ex.fv.map) self.weights.add(f, 0);
  });

  // Project
  if ((ex.x instanceof Array) && ex.x.length == 2) {
    // Either original data was a two-dimensional point
    ex.p = ex.x;
  } else if (this.weights.list.length == 2) {
    // Or we have two features...
    var f0 = this.weights.list[0];
    var f1 = this.weights.list[1];
    ex.p = [ex.fv.map[f0] || 0, ex.fv.map[f1] || 0];
  } else {
    ex.p = null;  // Can't project down to two-dimensions in a reasonable way
  }
}

Learner.prototype.processData = function(opts) {
  var self = this;
  self.numTrainExamples = 0;
  self.numTestExamples = 0;
  self.weights = new FeatureVector();

  // Default feature extractor if one doesn't exist.
  if (self.extractors.length == 0)
    self.featureExtractor(function(x, fv) {for (var i in x) fv.add(i, x[i])});

  for (var i = 0; i < self.examples.length; i++) {
    var ex = self.examples[i];
    self.extractFeatures(ex);
    if (ex.train) self.numTrainExamples++;
    else self.numTestExamples++;
  }
}

function mapArgmax(map) {
  var bestKey = null;
  for (var key in map) {
    if (bestKey == null || map[key] > map[bestKey]) bestKey = key;
  }
  return bestKey;
}

Learner.prototype.roteLearning = function(opts) {
  var self = this;
  self.algorithmStr = 'rote learning';
  self.regression = false;
  self.clustering = false;
  self.processData();

  var histogram = {};

  function exKey(ex) {
    return ex.fv.list.map(function(f) {return f+':'+ex.fv.map[f]}).join('|');
  }

  // Train
  for (var i = 0; i < self.examples.length; i++) {
    var ex = self.examples[i];
    if (!ex.train) continue;
    var key = exKey(ex);
    var lmap = histogram[key];
    if (!lmap) lmap = histogram[key] = {};
    increment(lmap, ex.y, 1);
  }

  self.predictFunc = function(ex) {
    return mapArgmax(histogram[exKey(ex)]);
  };

  self.stepFunc = null;
}

Learner.prototype.nearestNeighbors = function(opts) {
  var self = this;
  self.algorithmStr = 'nearest neighbors';
  self.regression = false;
  self.clustering = false;
  self.processData();
  self.predictFunc = function(queryEx) {
    var minDist = null;
    var bestEx = null;
    for (var i = 0; i < self.examples.length; i++) {
      var ex = self.examples[i];
      if (!ex.train) continue;
      var dist;
      if (ex.p != null)
        dist = squared(ex.p[0]-queryEx.p[0]) + squared(ex.p[1]-queryEx.p[1]);  // More optimized
      else
        dist = ex.fv.dot(ex.fv) - 2 * ex.fv.dot(queryEx.fv) + queryEx.fv.dot(queryEx.fv);
      if (minDist == null || dist < minDist) {
        minDist = dist;
        bestEx = ex;
      }
    }
    return bestEx.y;
  }

  self.stepFunc = null;
}

Learner.prototype.sgd = function(opts) {
  var self = this;
  self.regression = (opts.loss == 'squared' || opts.loss == 'absdev');
  self.clustering = false;

  var loss;
  var lossName;
  var lossGradient;
  if (opts.loss == 'perceptron') {
    loss = function(score, y) { return Math.max(-score * y, 0); };
    lossGradient = function(score, y) { return score*y <= 0 ? -y : 0; };
    lossName = '$\\PerceptronLoss(x, y, \\w) = \\max\\{-(\\w \\cdot \\phi(x)) y, 0 \\}$';
  } else if (opts.loss == 'hinge') {
    loss = function(score, y) { return Math.max(1 - score*y, 0); };
    lossGradient = function(score, y) { return score*y <= 1 ? -y : 0; };
    lossName = '$\\HingeLoss(x, y, \\w) = \\max\\{1 - (\\w \\cdot \\phi(x)) y, 0 \\}$';
  } else if (opts.loss == 'logistic') {
    loss = function(score, y) { return Math.log(1 + Math.exp(-score*y)); };
    lossGradient = function(score, y) { return -y * Math.exp(-score*y)/(1 + Math.exp(-score*y)); };
    lossName = '$\\LogisticLoss(x, y, \\w) = \\log(1 + e^{-(\\w \\cdot \\phi(x)) y})$';
  } else if (opts.loss == 'squared') {
    loss = function(score, y) { return 0.5 * squared(score - y); };
    lossGradient = function(score, y) { return score - y; };
    lossName = '$\\SquaredLoss(x, y, \\w) = \\frac12 (\\w \\cdot \\phi(x) - y)^2$';
  } else if (opts.loss == 'absdev') {
    loss = function(score, y) { return Math.abs(score - y); };
    lossGradient = function(score, y) { return score-y > 0 ? 1 : (score-y < 0 ? -1 : 0); };
    lossName = '$\\AbsLoss(x, y, \\w) = |\\w \\cdot \\phi(x) - y|$';
  } else {
    return self.error('Loss ' + opts.loss + ' not supported');
  }

  var initStepSize = opts.initStepSize || 1;
  var reduction = opts.reduction || 0;
  var lambda = opts.lambda || 0;

  self.algorithmStr = 'stochastic gradient descent on ' + lossName;
  self.processData();

  self.predictFunc = function(ex) {
    ex.score = ex.fv.dot(this.weights);
    if (self.regression) return ex.score;
    if (ex.score > 0) return +1;
    if (ex.score < 0) return -1;
    return null;
  };

  var iteration = 0;
  var currExample = null;
  var currExampleIndex = -1;

  var trainExamples = self.examples.filter(function(ex) { return ex.train; });

  if (!opts.ordered) {
    // Randomize order of examples
    for (var i = 0; i < trainExamples.length; i++) {
      var j = i + randInt(trainExamples.length - i);
      var tmp = trainExamples[i];
      trainExamples[i] = trainExamples[j];
      trainExamples[j] = tmp;
    }
  }

  self.stepFunc = function() {
    var output = [];
    if (trainExamples.length == 0) {
      output.push('No training examples!');
      return output;
    }

    var steps = opts.steps || 1;
    for (var step = 0; step < steps; step++) {
      var showStep = step == steps - 1;

      // Get new example
      var ex = currExample;
      var update = currExample != null;
      if (ex == null) {
        currExampleIndex++;
        if (currExampleIndex == trainExamples.length) currExampleIndex = 0;
        //currExampleIndex = randInt(trainExamples.length);
        ex = currExample = trainExamples[currExampleIndex];
        self.selectedExample = ex;
        iteration++;
      }

      if (showStep) output.push('<font color="darkblue">Iteration ' + iteration + '</font>');

      function nwindent(x) { return indent(nowrapText(x)); }

      // Choose
      if (showStep) {
        output.push(nwindent('<b>Choose training example</b> [x = ' + formatInput(ex.x) + ' $\\Rightarrow y = $ ' + formatOutput(ex.y) + ']'));
        output.push(nwindent('Old weights $\\w = $ ' + self.weights.toString(), 40));
      }
      var score = ex.fv.dot(self.weights);
      var residual = score - ex.y;
      var margin = score * ex.y;
      var phi = ex.fv.toString();
      if (showStep) {
        output.push(nwindent('$\\phi(x)$: ' + phi, 40));
        output.push(nwindent('Prediction score: $\\w \\cdot \\phi(x) = ' + round(score, 2) + '$', 40));
        if (self.regression)
          output.push(nwindent('Difference: $(\\w \\cdot \\phi(x)) - y = ' + round(residual, 2) + '$', 40));
        else
          output.push(nwindent('Margin: $(\\w \\cdot \\phi(x)) y = ' + round(margin, 2) + '$', 40));
        output.push(nwindent('$\\Loss(x, y, f_\\w)$: ' + round(loss(score, ex.y), 2), 40));
      }
      var g = lossGradient(score, ex.y);
      if (showStep)
        output.push(nwindent('Gradient $\\nabla_\\w \\Loss(x, y, \\w) = ' + round(g, 2) + '\\cdot$ ' + phi, 40));
      if (g == 0 && lambda == 0) {
        if (showStep)
          output.push(nwindent('<b>Update</b>: none since gradient is zero'));
        currExample = null;
      }

      // Update
      if (update) {
        var stepSize = initStepSize / Math.pow(iteration, reduction);
        if (showStep)
          output.push(nwindent('<b>Update</b> $\\w \\leftarrow \\w - ' + (reduction == 0 ? '' : initStepSize + '/' + iteration + '^{' + reduction + '} \\cdot') + '(\\nabla_\\w \\Loss(x, y, f_\\w)' + (lambda == 0 ? '' : ' - \\frac{' + lambda + '}{|\\Train|} \\w') + ')$'));

        // Regularization
        if (lambda != 0) {
          for (var f in self.weights.map)
            self.weights.add(f, -stepSize * lambda / trainExamples.length * (self.weights.map[f] || 0));
        }

        // Loss
        for (var f in ex.fv.map) self.weights.add(f, -stepSize * g * ex.fv.map[f]);

        if (showStep)
          output.push(nwindent('New weights $\\w = $ ' + self.weights.toString(), 40));
        currExample = null;
        
        if (showStep)
          self.updateGraph();
      }
    }

    return output;
  };
}

Learner.prototype.kmeans = function(opts) {
  var self = this;

  var K = opts.K || 2;

  self.algorithmStr = 'K-means';
  self.clustering = true;
  self.regression = false;
  self.processData();

  self.predictFunc = function(ex) {
    // Find the closest center
    var bestk = null;
    var bestd = null;
    for (var k = 0; k < self.centers.length; k++) {
      var d = l2DistSquared(self.centers[k], ex.p);
      if (bestd == null || d < bestd) {
        bestd = d;
        bestk = k;
      }
    }
    //sfig.L(self, self.centers, bestk);
    return bestk;
  };

  var iteration = 1;
  var mode = 'init';

  for (var i = 0; i < self.examples.length; i++) {
    if (!self.examples[i].p) {
      self.error('Examples are not two dimensional!');
      return [];
    }
  }

  var trainExamples = self.examples.filter(function(ex) { return ex.train; });

  self.centers = [];
  self.stepFunc = function() {
    var output = [];
    if (trainExamples.length == 0) {
      output.push('No training examples!');
      return output;
    }

    if (mode == 'init') {
      if (opts.init == 'kmeans++') {
        output.push('Initialization (kmeans++)'.fontcolor('darkblue').bold());
        output.push(indent('For each cluster $k = 1, \\dots, K$:', 20));
        output.push(indent('Set $\\mu_k$ to point $\\phi(x_i)$ with probability proportional to squared distance of $\\phi(x_i)$ to closest center so far: $\\displaystyle \\P(\\text{choose } i) \\propto \\min_{k\' < k} \\|\\mu_{k\'} - \\phi(x_i)\\|^2$.', 40));
        // Initialize using k means++
        var minDist = [];  // For each data point, the distance from the closest center
        for (var i = 0; i < trainExamples.length; i++) minDist[i] = 1e100;
        var distrib = [];
        for (var k = 0; k < K; k++) {
          for (var i = 0; i < trainExamples.length; i++) distrib[i] = minDist[i];
          normalize(distrib);
          var c = sampleMultinomial(distrib);
          self.centers.push([].concat(trainExamples[c].p));
          for (var i = 0; i < trainExamples.length; i++) {
            var d = l2DistSquared(trainExamples[i].p, trainExamples[c].p);
            minDist[i] = Math.min(minDist[i], d);
          }
        }
      } else {
        output.push('Initialization (random)'.fontcolor('darkblue').bold());
        output.push(indent('For each cluster $k = 1, \\dots, K$:', 20));
        output.push(indent('Set $\\mu_k$ randomly', 40));
        for (var k = 0; k < K; k++)
          self.centers[k] = wholeNumbers(trainExamples[0].p.length).map(function() { return 3 + Math.random()*3; });
      }
      mode = 'e';
    } else if (mode == 'e') {
      output.push(('Iteration ' + iteration + ': assign points to clusters (E-step)').fontcolor('darkblue').bold());
      output.push(indent('For each point $i = 1, \\dots, n$, assign it to the closest center: $\\displaystyle z_i = \\arg\\min_k \\|\\phi(x_i) - \\mu_k\\|^2$.'));
      trainExamples.forEach(function(ex) {
        ex.y = self.predictFunc(ex);
      });
      mode = 'm';
    } else if (mode == 'm') {
      output.push(('Iteration ' + iteration + ': estimate centers (M-step)').fontcolor('darkblue').bold());
      output.push(indent('For each cluster $k = 1, \\dots, K$, set center $\\mu_k$ to be average of points assigned to that cluster: $\\displaystyle \\mu_k = \\frac{1}{|\\{i : z_i = k\\}|} \\sum_{i : z_i = k} \\phi(x_i)$.'));
      mode = 'e';
      var counts = [];
      for (var k = 0; k < K; k++) {
        var c = self.centers[k];
        for (var i = 0; i < c.length; i++) c[i] = 0;
        counts[k] = 0;
      }
      trainExamples.forEach(function(ex) {
        var k = ex.y;
        var c = self.centers[k];
        for (var i = 0; i < c.length; i++) c[i] += ex.p[i];
        counts[k]++;
      });
      for (var k = 0; k < K; k++) {
        var c = self.centers[k];
        if (counts[k] > 0) {
          for (var i = 0; i < c.length; i++) c[i] /= counts[k];
        }
      }

      iteration++;
    }
    self.updateGraph();

    return output;
  };
}

var learner = new Learner();
function example() { learner.example.apply(learner, arguments); }
function trainExample() { learner.trainExample.apply(learner, arguments); }
function testExample() { learner.testExample.apply(learner, arguments); }
function featureExtractor() { learner.featureExtractor.apply(learner, arguments); }
function roteLearning() { learner.roteLearning.apply(learner, arguments); }
function nearestNeighbors() { learner.nearestNeighbors.apply(learner, arguments); }
function sgd() { learner.sgd.apply(learner, arguments); }
function kmeans() { learner.kmeans.apply(learner, arguments); }

////////////////////////////////////////////////////////////

var demoFontSize = 24;
sfig.Text.defaults.setProperty('fontSize', demoFontSize);

// Demo!
prez.addSlide(slide(null,
  learner.display(),
_).dim(1100, 640).id('console').leftHeader(nil()).showIndex(false));

sfig.Text.defaults.setProperty('fontSize', 16);

add(slide('Learning algorithms',
  bulletedText([null,
    'An example is an input-output pair $(x,y)$.  The input could be anything (strings, images, videos).  In principle the output could be anything, but we will focus on the case where the output $y \\in \\{+1,-1\\}$ (binary classification) and $y \\in \\R$ (regression).',
    'We are given a set of training examples $\\Train$ and a set of test examples $\\Test$.',
    'Given an input $x$, we define a feature vector $\\phi(x) \\in \\R^d$, which maps $x$ into a high-dimensional point, each feature representing some useful aspect of $x$.',
    'This demo implements the following learning algorithms: rote learning, nearest neighbors, and stochastic gradient descent for linear predictors.',
    'Rote learning computes, for each possible feature vector $\\phi(x)$, a histogram of possible outputs $y$ based on the training data.  Given a new input $x$, the most frequent $y$ for $\\phi(x)$ is returned.',
    'Nearest neighbors returns a predictor, which given an input $x$, returns the output of the closest $x\'$ (that is, $\\|\\phi(x\') - \\phi(x)\\|_2$ is the smallest.',
  ]),
_).id('background'));

add(slide('Learning algorithms: loss minimization',
  bulletedText([null,
    'Now we discuss the <b>loss minimization framework</b>, which is to find $\\w$ that minimizes $\\sum_{(x,y) \\in \\Train} \\Loss(x,y,\\w) + \\Reg(\\w)$.  This captures many of the learning algorithms based on linear predictors.',
    'The possible loss functions for binary classification are $\\PerceptronLoss$ (Perceptron algorithm), $\\HingeLoss$ (support vector machines), and $\\LogisticLoss$ (logistic regression).  The possible loss functions for regression are $\\SquaredLoss$ (least squares regression) and $\\AbsLoss$ (least absolute deviations regression).',
    'We will only work with $L_2$ regularization, in which $\\Reg(\\w) = \\frac{\\lambda}{2} \\|\\w\\|^2$.',
    'The linear predictor is specified by a weight vector $\\w \\in \\R^d$, so that the prediction for regresion is $f_\\w(x) = \\w \\cdot \\phi(x)$ and $f_\\w(x) = \\sign(\\w \\cdot \\phi(x))$ for binary classification.',
    'The stochastic gradient descent (SGD) algorithm is an iterative algorithm.  It repeatedly picks up an example $(x,y) \\in \\Train$ and updates the weights in a way to reduce $\\Loss(x,y,\\w)$.  This is done by computing the gradient and performing $\\w \\leftarrow \\w - \\eta_t \\nabla_\\w \\Loss(x,y,\\w)$, where $\\eta_t$ is the step size at iteration $t$.  For example, we can take $\\eta_t = 1/t^\\alpha$, where $\\alpha$ is the reduction.',
  ]),
_));

add(slide('Documentation',
  bulletedText(['This demo allows you to create your own examples, feature extractors, and step through various learning algorithms.',
    ['Problem definition',
      '<tt>trainExample(x, y), testExample(x, y)</tt>: adds a training/test example with input <tt>x</tt> and output <tt>y</tt> (e.g., <tt>trainExample(\'hello\', +1)</tt>).',
      '<tt>featureExtractor(func)</tt>: adds a feature extractor <tt>func(ex, fv)</tt>, which takes an example object <tt>ex = {x:x, y:y}</tt> and a feature vector <tt>fv</tt>, which you can add features to by calling <tt>fv.add(feature, value)</tt>.',
    ],
    ['Learning algorithms',
      '<tt>roteLearning(opts)</tt>: simply memorizes the training data.',
      '<tt>nearestNeighbors(opts)</tt>: run the nearest neighbors algorithm.',
      '<tt>sgd(opts)</tt>: run stochastic gradient descent on the <tt>opts.loss</tt> (which can be perceptron, hinge, logistic, squared, absdev).  <tt>opts.lambda</tt> is the amount of regularization.  <tt>opts.steps</tt> is the number of steps to take at once.  <tt>opts.reduction</tt> is the reduction for the step size.  <tt>opts.ordered</tt>: if set to true, don\'t randomize order of training examples.',
    ],
  ]),
_).id('documentation'));

sfig.Text.defaults.setProperty('fontSize', demoFontSize);

sfig.initialize();
