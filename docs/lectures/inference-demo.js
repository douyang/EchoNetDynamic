G = sfig.serverSide ? global : this;
sfig.enableMouseWheel = false;
document.title = 'Inference algorithms demo';
G.prez = sfig.presentation();

function FactorGraph() {
  this.initialize();
}

FactorGraph.prototype.initialize = function() {
  this.variables = [];
  this.domains = {};  // Variable -> domain
  this.conditioned = {};  // Which variables are being conditioned on?  (domains have one element)
  this.eliminated = {};  // Which variables are eliminated
  this.factors = [];
  this.queryVars = null;
  this.stepFunc = null;

  // For displaying
  this.varBlocks = {};  // Variable -> block

  this.errors = [];
  this.algorithmStr = null;

  Math.seedrandom('rand', true);
}

FactorGraph.prototype.variable = function(v, domain) {
  if (typeof(v) != 'string') return this.error('variable(): first argument is variable name, must be string, but got '+v);
  if (v.indexOf(' ') != -1) return this.error('variable(): variable name can\'t have space, but got '+v);
  if (!(domain instanceof Array)) return this.error('variable(): second argument must be domain (array of values), but got '+domain);
  this.variables.push(v);
  this.domains[v] = domain;
}

FactorGraph.prototype.error = function(message) { this.errors.push(message); return false; }
FactorGraph.prototype.ensureIsVar = function(v) {
  if (!(v in this.domains)) return this.error(v + ' is not a variable; variables are '+this.variables);
  return true;
}
FactorGraph.prototype.getVars = function(vars) {
  if (vars == null)
    vars = [].concat(this.variables);  // Use all variables
  if (vars == '') vars = [];
  else if (!(vars instanceof Array)) vars = vars.split(' ');
  for (var i = 0; i < vars.length; i++) {
    //if (vars[i] == '|') continue;
    if (!this.ensureIsVar(vars[i])) return null;
  }

  return vars;
}

// Get all assignments of values to vars
FactorGraph.prototype.getAllAssignments = function(vars) {
  var self = this;
  var assigns = [];
  var xs = [];
  function recurse(i) {
    if (i == vars.length) { assigns.push([].concat(xs)); return; }
    self.domains[vars[i]].forEach(function(x) {
      xs.push(x);
      recurse(i+1);
      xs.pop();
    });
  }
  recurse(0);
  return assigns;
}

FactorGraph.prototype.factor = function(name, vars, spec) {
  var self = this;
  if (typeof(name) != 'string') return self.error('factor(): first argument is factor name, must be string, but got '+name);
  if (typeof(name) != 'string') return self.error('factor(): second argument must be string (space-separated list of variable names, but got '+vars);
  if (spec == null) return self.error('factor(): third argument (specification) is missing');

  vars = this.getVars(vars);
  if (vars == null) return false;
  var map = {};
  var list = [];
  if (spec instanceof Function) {
    this.getAllAssignments(vars).forEach(function(xs) {
      var v = spec.apply(null, xs);
      if (v == true) v = 1;
      if (v == false) v = 0;
      if (v == 0) return;
      map[xs.join(' ')] = v;
      list.push([xs, v]);
    });
  } else {
    for (var xs in spec) {
      var v = spec[xs];
      if (v == true) v = 1;
      if (v == false) v = 0;
      map[xs] = v;
      xs = xs.split(' ');
      list.push([xs, v]);
    }
  }
  this.factors.push({name: name, vars: vars, map: map, list: list});
  return true;
}

FactorGraph.prototype.condition = function(v, value) {
  if (!this.ensureIsVar(v)) return;
  this.domains[v] = [value];
  this.conditioned[v] = true;
}

FactorGraph.prototype.variableElimination = function(opts) {
  if (!opts) opts = {};
  this.ensureQueryVarsExist();
  var order = this.getVars(opts.order);
  if (order == null) return false;
  var self = this;

  // Remove query variables
  order = order.filter(function(v) { return self.queryVars.indexOf(v) == -1; });

  this.stepFunc = function() {
    var output = [];

    // Eliminate elimv to create new factor
    function createFactor(markovBlanket, depFactors, elimv) {
      var newFactorMap = {};
      var newFactorList = [];
      self.getAllAssignments(markovBlanket).forEach(function(xs) {
        var result = null;
        (elimv == null ? [null] : self.domains[elimv]).forEach(function(value) {
          var weight = 1;
          depFactors.forEach(function(f) {
            var subxs = f.vars.map(function(v) {
              if (v == elimv) return value;
              return xs[markovBlanket.indexOf(v)];
            });
            weight *= f.map[subxs.join(' ')] || 0;
          });
          if (result == null) {
            result = weight;
          } else {
            if (self.queryType == 'max')
              result = Math.max(result, weight);
            else
              result += weight;
          }
        });
        if (result != 0) {
          newFactorMap[xs.join(' ')] = result;
          newFactorList.push([xs, result]);
        }
      });
      return {
        name: elimv ? 'elim-'+elimv : 'final',
        vars: markovBlanket,
        map: newFactorMap,
        list: newFactorList
      };
    }

    function displayFactor(markovBlanket, newFactor) {
      var probDistrib = newFactor.name == 'final' && self.queryType == 'sum';
      var rows = [markovBlanket.concat([newFactor.name+'('+markovBlanket.join(',')+')'])];
      if (probDistrib)  // Final factor is supposed to be a probability distribution
        rows[0].push('$\\P$(' + markovBlanket.join(',') + ')');
      var sum = 0;
      newFactor.list.forEach(function(pair) { sum += pair[1]; });
      var pairs = [];
      newFactor.list.forEach(function(pair) { pairs.push(pair); });
      pairs.sort(function(a, b) { return b[1] - a[1]; });
      pairs.forEach(function(pair) {
        var row = pair[0].map(function(a) { return formatValue(a); });
        row.push(formatWeight(pair[1]));
        if (probDistrib)
          row.push(formatWeight(1.0 * pair[1] / sum));
        rows.push(row);
      });
      return frameBox(table.apply(null, rows).margin(15, 5).yjustify('c'));
    }

    if (order.length == 0) {
      // Multiply all the factors together
      output.push('Algorithm done.'.bold().fontcolor('green'));
      var depFactors = self.factors.filter(function(f) { return !f.eliminated; });
      var newFactor = createFactor(self.queryVars, depFactors);
      output.push('Final factor: ' + newFactor.name);
      output.push(indent(xtable(
        displayFactor(self.queryVars, newFactor),
        '$\\Leftarrow$',
        xtable.apply(null, depFactors.map(function(f) { return displayFactor(f.vars, f); })).margin(10),
      _).margin(10).center()));
      return output;
    }

    // Find Markov blanket
    var elimv = order[0];
    order = order.slice(1);

    self.eliminated[elimv] = true;
    // Get the factors involved
    var markovBlanket = [];
    var depFactors = [];
    var lastDepFactorIndex = null;
    for (var i = 0; i < self.factors.length; i++) {
      var f = self.factors[i];
      if (f.eliminated) continue;
      if (f.vars.indexOf(elimv) != -1) {
        depFactors.push(f);
        f.vars.forEach(function(v) {
          if (markovBlanket.indexOf(v) == -1 && v != elimv)
            markovBlanket.push(v);
        });
        lastDepFactorIndex = i;
      }
    };
    markovBlanket.sort();
    output.push(('Eliminated variable ' + elimv).bold());
    output.push('$\\MarkovBlanket(\\text{'+elimv+'})$: ' + markovBlanket.join(' '));
    output.push('Factors depending on ' + elimv + ': ' + depFactors.map(function(f) { return f.name; }).join(' '));

    depFactors.forEach(function(f) { f.eliminated = true; });

    // Insert factor
    var newFactor = createFactor(markovBlanket, depFactors, elimv);
    output.push('New factor: $\\text{' + newFactor.name + '(' + markovBlanket.join(',') + ')} = \\' + self.queryType + '_{'+elimv+'} ' + depFactors.map(function(f) { return '\\text{' + f.name + '(' + f.vars.join(',') + ')}'; }).join(' ') + '$')
    output.push(indent(xtable(
      displayFactor(markovBlanket, newFactor),
      '$\\Leftarrow$',
      xtable.apply(null, depFactors.map(function(f) { return displayFactor(f.vars, f); })).margin(10),
    _).margin(10).center()));

    // Insert after the last removed factor
    self.factors.splice(lastDepFactorIndex, 0, newFactor);
    self.updateGraph();
    return output;
  };
  this.algorithmStr = 'variable elimination ('+this.queryType+')';
}
FactorGraph.prototype.maxVariableElimination = function(vars) {
  this.algorithmStr = 'max variable elimination';
  this.queryType = 'max';
  this.variableElimination(vars);
}
FactorGraph.prototype.sumVariableElimination = function(vars) {
  this.algorithmStr = 'sum variable elimination';
  this.queryType = 'sum';
  this.variableElimination(vars);
}

function formatVar(v) { return v.toString().fontcolor('blue'); }
function formatValue(value) { return value.toString().fontcolor('red'); }
function formatWeight(weight) { return round(weight, 2).toString(); }
function formatVarValue(v, value) { return formatVar(v) + ':' + formatValue(value); }
function formatValueWeight(value, weight) { return formatValue(value) + ':' + formatWeight(weight); }
function formatValueCountWeight(value, count, weight) { return formatValue(value) + ':' + formatWeight(weight) + '(' + count + 'x)'; }

FactorGraph.prototype.incrementalInference = function(opts) {
  if (!opts) opts = {};
  if (opts.K == null) return this.error('Number of candidates $K$ not specified');

  var self = this;
  this.ensureQueryVarsExist();

  var candidateLevels = [];
  var candidates = [{
    values: {},
    count: self.queryType == 'sum' ? opts.K : 1,
    weight: 1
  }];
  var varIndex = -1;
  var varsCovered = {};
  var stage = 'extend';

  function renderCandidates() {
    var edges = [];
    var cols = [];
    for (var i = 0; i < candidateLevels.length; i++) {
      var v = self.variables[i];
      var col = ytable.apply(null, candidateLevels[i].map(function(candidate) {
        var box;
        if (i == candidateLevels.length-1) {
          if (self.queryType == 'sum')
            box = text(formatValueCountWeight(candidate.values[v], candidate.count, candidate.weight));
          else
            box = text(formatValueWeight(candidate.values[v], candidate.weight));
        } else {
          box = text(formatValue(candidate.values[v]));
        }
        candidate.box = box;
        if (i > 0) {
          edges.push(arrow(
            [candidate.parent.box.right(), candidate.parent.box.ymiddle()],
            [box.left(), box.ymiddle()],
          _));
        }
        return box;
      }));
      cols.push(moveBottomOf(col, self.varBlocks[v]));
    }
    self.extraBox.resetContent(overlay.apply(null, cols.concat(edges)));
  }

  this.stepFunc = function() {
    var output = [];

    if (stage == 'prune') {
      if (self.queryType == 'sum')
        output.push('<b>Prune</b>: resample $K='+opts.K+'$ particles');
      else
        output.push('<b>Prune</b>: keep the top $K='+opts.K+'$ candidates');
      if (self.queryType == 'sum') {
        // Re-sample the particles
        var probs = candidates.map(function(a) { return a.weight * a.count; });
        normalize(probs);
        var counts = [];
        for (var q = 0; q < opts.K; q++) {
          var i = sampleMultinomial(probs);
          counts[i] = (counts[i] || 0) + 1;
        }
        var newCandidates = [];
        for (var i = 0; i < counts.length; i++) {
          if (!counts[i]) continue;
          candidates[i].count = counts[i];
          candidates[i].weight = 1;
          newCandidates.push(candidates[i]);
        }
        candidates = candidateLevels[varIndex] = newCandidates;
      } else {
        // Take the top K
        candidates.sort(function(a, b) { return b.weight - a.weight; });
        if (candidates.length > opts.K)
          candidates = candidateLevels[varIndex] = candidates.slice(0, opts.K);
      }
      stage = 'extend';
      renderCandidates();
      return output;
    }

    if (varIndex < self.variables.length) varIndex++;
    if (varIndex == self.variables.length) {
      output.push('Algorithm done.'.bold().fontcolor('green'));
      if (candidates.length > 0) {
        if (self.queryType == 'max') {
          // Just take the top candidate
          output.push('Best assignment (approximate): ' + self.variables.map(function(v) { return formatVarValue(v, candidates[0].values[v]) }).join(','));
        } else if (self.queryType == 'sum') {
          // Look at only the query variables and compute marginals
          var counts = {};
          candidates.forEach(function(candidate) {
            var subxs = self.queryVars.map(function(v) { return candidate.values[v]; });
            increment(counts, subxs.join(' '), candidate.weight * candidate.count);
          });
          var pairs = [];
          var sum = 0;
          for (var subxsStr in counts) {
            var subxs = subxsStr.split(' ');
            pairs.push([subxs, counts[subxsStr]]);
            sum += counts[subxsStr];
          }
          pairs.sort(function(a, b) { return b[1] - a[1]; });
          var rows = [self.queryVars.map(function(v) { return formatVar(v); }).concat(['$\\Weight$', '$\\P(\\text{'+self.queryVars.join(',')+'})$'])];
          pairs.forEach(function(pair) {
            rows.push(pair[0].map(formatValue).concat([formatWeight(pair[1]), formatWeight(pair[1]/sum)]));
          });
          output.push(indent(frameBox(table.apply(null, rows).margin(15, 5))));
        }
      }
      return output;
    }

    var newv = self.variables[varIndex];
    output.push('<b>Extend</b>: assign value to variable ' + formatVar(newv));
    varsCovered[newv] = true;

    // Include factors that only depend on the first |varIndex| variables
    var newFactors = [];
    self.factors.forEach(function(f) {
      if (arrayForall(f.vars, function(v) { return varsCovered[v]; }) &&
          arrayExists(f.vars, function(v) { return v == newv; }))
        newFactors.push(f);
    });
    var pi = newFactors[0];  // Proposal

    var newCandidates = [];

    function extend(candidate, value, proposalProb) {
      // New candidate
      var newValues = mergeInto({}, candidate.values);
      newValues[newv] = value;
      var newCandidate = {
        parent: candidate,
        values: newValues,
      };

      // Compute weight
      var weightChange = 1;
      newFactors.forEach(function(f) {
        var subxs = f.vars.map(function(v) {
          return newCandidate.values[v];
        });
        weightChange *= f.map[subxs.join(' ')] || 0;
      });
      newCandidate.weight = candidate.weight * weightChange / proposalProb;
      return newCandidate;
    }
    
    if (self.queryType == 'sum') {
      if (pi) {
        var l = pi.vars.filter(function(v) { return v != newv; });
        var piStr = '\\pi(\\text{' + newv + '}' + (l.length > 0 ? ' \\mid \\text{' + l.join(',')+'}' : '') + ')';
        output.push('Proposal distribution $'+ piStr + ' \\propto \\text{' + pi.name + '(' + pi.vars.join(',') + ')}$');

        var weightChange = newFactors.map(function(f) {
          return '\\text{'+f.name+'('+f.vars.join(',')+')}';
        }).join('\\cdot');
        output.push('Weight: $\\frac{' + weightChange + '}{' + piStr + '}$');
      } else {
        output.push('Proposal distribution $\\pi$ is uniform');
      }
    }

    var conds = {}  // Things we've conditioned on, so we display the corresponding proposal distribution only once
    candidates.forEach(function(candidate) {
      if (self.queryType == 'sum') {
        // Propose using first factor that depends on newv
        // (usually the transition distribution)
        var values = self.domains[newv];
        var proposalProbs = [];
        var cond = '';
        if (newFactors.length == 0) {
          for (var vi = 0; vi < values.length; vi++)
            proposalProbs[vi] = 1;
        } else {
          // Conditioned on seen values
          var l = [];
          pi.vars.forEach(function(v) {
            if (v != newv) 
              l.push(formatVarValue(v, candidate.values[v]));
          });
          if (l.length > 0)
            cond = ' $\\mid$ ' + l.join(',');

          // Propose new value
          for (var vi = 0; vi < values.length; vi++) {
            var subxs = pi.vars.map(function(v) {
              return v == newv ? values[vi] : candidate.values[v];
            });
            proposalProbs[vi] = pi.map[subxs.join(' ')] || 0;
          }
        }

        // Can't extend
        if (!normalize(proposalProbs)) return;

        if (!conds[cond]) {
          conds[cond] = true;
          var items = [];
          for (var vi = 0; vi < proposalProbs.length; vi++)
            if (proposalProbs[vi] > 0)
              items.push(formatValueWeight(values[vi], proposalProbs[vi]));
          output.push('Proposal $\\pi(\\text{' + newv + '}$' + cond + '$) =$ [' + items.join(' ') + ']');
        }

        // For each particle, extend the number of times
        var counts = [];
        for (var i = 0; i < candidate.count; i++) {
          var valueIndex = sampleMultinomial(proposalProbs);
          counts[valueIndex] = (counts[valueIndex] || 0) + 1;
        }
        for (var valueIndex = 0; valueIndex < counts.length; valueIndex++) {
          if (!counts[valueIndex]) continue;
          var value = self.domains[newv][valueIndex];
          var newCandidate = extend(candidate, value, proposalProbs[valueIndex]);
          newCandidate.count = counts[valueIndex];
          newCandidates.push(newCandidate);
        }
      } else {
        self.domains[newv].forEach(function(value) {
          newCandidates.push(extend(candidate, value, 1));
        });
      }
    });
    candidates = newCandidates;
    candidateLevels.push(candidates);
    renderCandidates();
    stage = 'prune';

    return output;
  };
}
FactorGraph.prototype.beamSearch = function(opts) {
  this.algorithmStr = 'beam search';
  this.queryType = 'max';
  this.incrementalInference(opts);
}
FactorGraph.prototype.particleFiltering = function(opts) {
  this.algorithmStr = 'particle filtering';
  this.queryType = 'sum';
  this.incrementalInference(opts);
}

FactorGraph.prototype.ensureQueryVarsExist = function() {
  if (this.queryVars == null) this.query(null);
}

FactorGraph.prototype.localInference = function(opts) {
  if (!opts) opts = {};
  var self = this;
  this.ensureQueryVarsExist();

  // Initialize assignment
  var assignment = {};
  var init = opts.init || {};
  for (var i = 0; i < self.variables.length; i++) {
    var v = self.variables[i];
    assignment[v] = (v in init) ? init[v] : randomChoice(self.domains[v]);
  }

  // For each setting of values to the query variables, have a count
  var queryVarValueCounts = {};
  var numSamples = 0;

  // Which variable we're sampling
  var varIndex = -1;

  // Display current assignment
  // Display histogram of query

  // For each variable, compute the Markov blanket
  var markovBlankets = {};
  self.variables.forEach(function(v) {
    var markovBlanket = markovBlankets[v] = [];
    self.factors.forEach(function(f) {
      if (f.vars.indexOf(v) != -1) markovBlanket.push(f);
    });
  });

  this.stepFunc = function() {
    var output = [];

    var steps = opts.steps || 1;
    for (var step = 0; step < steps; step++) {
      var isLast = step == steps-1;
      varIndex = (varIndex + 1) % self.variables.length;

      // Form the conditional distribution
      var samplev = self.variables[varIndex];
      var markovBlanket = markovBlankets[samplev];

      if (isLast) {
        output.push('<b>' + (self.queryType == 'sum' ? 'Sampling' : 'Maximizing') + ' variable ' + formatVar(samplev) + ' given everything else</b>:');
        var header = [formatVar(samplev) + ':?'];
        markovBlanket.forEach(function(f) { header.push(f.name); });
        header.push('$\\Weight$');
        if (self.queryType == 'sum')
          header.push('$\\P(\\text{' + samplev + '} = ?)$');
      }

      // For each possible value of samplev, compute the weight
      var rows = [header];
      var weights = self.domains[samplev].map(function(value) {
        var weight = 1;
        var row = [formatValue(value)];
        markovBlanket.forEach(function(f) {
          var subxs = f.vars.map(function(v) {
            return v == samplev ? value : assignment[v];
          });
          var deltaWeight = f.map[subxs.join(' ')] || 0;
          weight *= deltaWeight;
          if (isLast) row.push(formatWeight(deltaWeight));
        });
        if (isLast) {
          row.push(formatWeight(weight));
          rows.push(row);
        }
        return weight;
      });

      var valueIndex = null;
      if (self.queryType == 'sum') {
        var probs = [].concat(weights);
        normalize(probs);
        if (isLast) {
          for (var valueIndex = 0; valueIndex < probs.length; valueIndex++)
            rows[valueIndex+1].push(formatWeight(probs[valueIndex]));
        }
        valueIndex = sampleMultinomial(probs);
      } else {
        valueIndex = argmax(weights);
      }

      // Output current assignment
      if (isLast) {
        var items = [];
        for (var v in assignment) {
          var item = v == samplev ? assignment[v].toString().fontcolor('gray') : formatValue(assignment[v]);
          items.push(moveBottomOf(item, self.varBlocks[v]));
        }

        // Compute weight
        var weight = 1;
        self.factors.forEach(function(f) {
          var subxs = f.vars.map(function(v) { return assignment[v]; });
          weight *= (f.map[subxs.join(' ')] || 0);
        });
        items.push(moveRightOf('$\\Weight = ' + formatWeight(weight) + '$', items[items.length-1], 20));

        self.extraBox.resetContent(overlay.apply(null, items));
      }

      // Display probability table
      var value = self.domains[samplev][valueIndex];
      assignment[samplev] = value;
      if (isLast) {
        output.push(indent(frameBox(table.apply(null, rows).margin(15, 5).yjustify('c'))));
        output.push('Choose ' + formatVarValue(samplev, value));
      }

      var subxs = self.queryVars.map(function(v) { return assignment[v]; });
      increment(queryVarValueCounts, subxs.join(' '), 1);
      numSamples++;
    }

    // Output aggregated 
    if (self.queryType == 'sum') {
      var rows = [];
      var header = self.queryVars.map(function(v) { return formatVar(v); });
      header.push('count');
      header.push('$\\hat\\P(\\text{' + self.queryVars.join(',') + '})$');
      rows.push(header);
      var keys = [];
      for (var subxsStr in queryVarValueCounts) keys.push(subxsStr);
      keys.sort(function(a, b) { return queryVarValueCounts[b] - queryVarValueCounts[a]; });
      keys.forEach(function(subxsStr) {
        var subxs = subxsStr.split(' ');
        var row = subxs.map(function(value) { return formatValue(value); });
        var count = queryVarValueCounts[subxsStr];
        row.push(count);
        row.push(formatWeight(1.0 * count / numSamples));
        rows.push(row);
      });
      output.push('<b>Estimate of query based on ' + numSamples + ' samples</b>:');
      output.push(frameBox(indent(table.apply(null, rows).margin(15, 5).yjustify('c'))));
    }

    return output;
  }
}
FactorGraph.prototype.iteratedConditionalModes = function(opts) {
  this.algorithmStr = 'iterated conditional modes (ICM)';
  this.queryType = 'max';
  this.localInference(opts);
}
FactorGraph.prototype.gibbsSampling = function(opts) {
  this.algorithmStr = 'Gibbs sampling';
  this.queryType = 'sum';
  this.localInference(opts);
}

FactorGraph.prototype.query = function(vars) {
  this.queryVars = this.getVars(vars);
}

FactorGraph.prototype.queryStr = function(vars) {
  this.ensureQueryVarsExist();
  if (this.queryType == 'max')
    return 'Value of ' + this.queryVars.join(',') + ' in $\\arg\\max_x \\Weight(x)$';
  else if (this.queryType == 'sum')
    return '$\\P('+this.queryVars.map(function(v) { return '\\text{'+v+'}'; }).join(',')+')$';
  else
    return null;
}

var inferenceCode = [
  "",
  /*"// Inference algorithm",
  "//sumVariableElimination()",
  "//maxVariableElimination()",
  "//beamSearch({K: 5})",
  "//particleFiltering({K: 100})",
  "//iteratedConditionalModes()",
  "//gibbsSampling({steps: 100})",
  "",*/
];

var codeExamples = {
  vote: [
    "// 3 people voting R or B",
    "variable('X1', ['R', 'B'])",
    "variable('X2', ['R', 'B'])",
    "variable('X3', ['R', 'B'])",
    "",
    "factor('f1', 'X1', function(x1) {\n  return x1 == 'B';\n})",
    "factor('f2', 'X1 X2', function(x1, x2) {\n  return x1 == x2;\n})",
    "factor('f3', 'X2 X3', function(x2, x3) {\n  return x2 == x3 ? 3 : 2;\n})",
    "factor('f4', 'X3', function(x3) {\n  return x3 == 'R' ? 2 : 1;\n})",
    "",
    "maxVariableElimination()",
  ],
  csp: [
    "// Simple CSP: A <= B <= C",
    "variable('A', [0, 1, 2, 3])",
    "variable('B', [0, 1, 2, 3])",
    "variable('C', [0, 1, 2, 3])",
    "",
    "factor('f1', 'A B', function(a, b) {\n  return a < b;\n})",
    "factor('f2', 'B C', function(b, c) {\n  return b < c;\n})",
    "",
    "// Query variable of interest",
    "query('A')",
  ].concat(inferenceCode),
  pair: [
    "// Pair of variables.  Factor on B influences A.",
    "variable('A', [0, 1, 2, 3])",
    "variable('B', [0, 1, 2, 3])",
    "",
    "factor('repel', 'A B', function(a, b) {\n  return Math.abs(a-b)\n})",
    "factor('observe', 'B', function(b) {\n  return b == 0 ? 10 : 1\n})",
    "",
    "// Query variable of interest",
    "query('A')",
  ].concat(inferenceCode),
  chain: [
    "// Start at 0, end at 1, where in between?",
    "variable('X1', [0, 1])",
    "variable('X2', [0, 1])",
    "variable('X3', [0, 1])",
    "variable('X4', [0, 1])",
    "variable('X5', [0, 1])",
    "",
    "function nearby(a,b) { return a == b ? 2 : 1; }",
    "factor('o1', 'X1', function(a) { return a == 0; })",
    "factor('t1', 'X1 X2', nearby)",
    "factor('t2', 'X2 X3', nearby)",
    "factor('t3', 'X3 X4', nearby)",
    "factor('t4', 'X4 X5', nearby)",
    "factor('o5', 'X5', function(a) { return a == 1; })",
    "",
    //"query('')",
    //"maxVariableElimination()",
    //"//query('X2')",
    //"//maxVariableElimination({order: 'X1 X5 X4 X3'})",
  ],
  track: [
    "// Object tracking example",
    "",
    "// X1,X2,X3 are unknown object positions",
    "variable('X1', [0, 1, 2])",
    "variable('X2', [0, 1, 2])",
    "variable('X3', [0, 1, 2])",
    "",
    "// Transitions: adjacent positions nearby",
    "// Observations: positions, sensor readings nearby",
    "function nearby(a, b) {\n  if (a == b) return 2\n  if (Math.abs(a-b) == 1) return 1\n  return 0\n}",
    "function observe(a) {\n  return function(b) {return nearby(a, b)}\n}",
    "factor('o1', 'X1', observe(0))",
    "factor('t2', 'X1 X2', nearby)",
    "factor('o2', 'X2', observe(2))",
    "factor('t3', 'X2 X3', nearby)",
    "factor('o2', 'X3', observe(2))",
  ].concat(inferenceCode),
  alarm: [
    "// Alarm network (a Bayesian network)",
    "",
    "// (B)urglary, (E)arthquake, (A)larm",
    "variable('B', [0, 1])",
    "variable('E', [0, 1])",
    "variable('A', [0, 1])",
    "",
    "// Small probability of something happening",
    "factor('fB', 'B', {0: 0.95, 1: 0.05})",
    "factor('fE', 'E', {0: 0.95, 1: 0.05})",
    "// If something happens, alarm",
    //"factor('fA', 'B E A', function(b,e,a) {\n  if (b || e) return a ? 0.99 : 0.01;\n  else return !a ? 0.99 : 0.01\n})",
    "factor('fA', 'B E A', function(b, e, a) {\n  return (b || e) == (a == 1);\n})",
    "",
    "// Alarm went off: B,E no longer independent",
    "//condition('A', 1)",
    "",
    "// No earthquake: explaining away phenomenon",
    "//condition('E', 1)",
    "",
    "query('B')  // Was there a burglary?",
    "",
    "sumVariableElimination({order: 'A E'})",
  ],
  med: [
    "// Medical diagnosis (a Bayesian network)",
    "",
    "variable('C', [0, 1])  // Have cold?",
    "factor('fC', 'C', function(c) {",
    "  return c ? 0.1 : 0.9;",
    "})",
    "",
    "variable('A', [0, 1])  // Have allergy?",
    "factor('fA', 'A', function(a) {",
    "  return a ? 0.2 : 0.8;",
    "})",
    "",
    "variable('H', [0, 1])  // Coughing?",
    "factor('fH', 'C A H', function(c, a, h) {",
    "  if (c || a) return h ? 0.9 : 0.1;",
    "  else        return h ? 0.1 : 0.9;",
    "})",
    "",
    "variable('I', [0, 1])  // Itchy eyes?",
    "factor('fI', 'A I', function(a, i) {",
    "  if (a) return i ? 0.9 : 0.1;",
    "  else   return i ? 0.1 : 0.9;",
    "})",
    "",
    "condition('H', 1)",
    "condition('I', 0)",
    "query('C')",
    "sumVariableElimination()",
  ],
  dep: [
    "// Strong dependencies (hard for Gibbs sampling)",
    "",
    "variable('A', [0, 1])",
    "variable('B', [0, 1])",
    "variable('C', [0, 1])",
    "",
    "// Strong factors encouraging variables to have same value",
    "function noisyEquals(a, b) {\n  return a == b ? 1000 : 1  // Try changing this\n}",
    "factor('f1', 'A B', noisyEquals)",
    "factor('f2', 'B C', noisyEquals)",
    "factor('f3', 'A C', noisyEquals)",
    "",
    "query('A B C')",
    "",
    "sumVariableElimination()  // Exact",
    "// Note that Gibbs sampling has problems moving between 0,0,0 and 1,1,1.",
    "//gibbsSampling({steps: 1000})  // Approximate",
  ],
  delay: [
    "// Delayed information: this presents difficulties for particle filtering.  In the first iteration, get lots of samples of X1=0.  When X2 is added, X2=0, but these samples have low weight.",
    "",
    "variable('X1', [0, 1])",
    "variable('X2', [0, 1])",
    "",
    "// Factor on X1 overruled by factor on X2",
    "function equals(a, b) {return a == b ? 1 : 0}",
    "factor('o1', 'X1', {0: 10, 1: 1})",
    "factor('t2', 'X1 X2', equals)",
    "factor('o2', 'X2', {0: 1, 1: 100})",
    "",
    "query('X1')",
    "",
    "sumVariableElimination() // Exact",
    "//particleFiltering({K: 10})  // Approximate",
  ],
  mln: [
    "// Markov logic network for hiking",
    "// L = likes",
    "// a = alice, b = bob",
    "// h = hiking, n = nature",
    /*"variable('L(a,h)', [0, 1])",
    "variable('L(a,n)', [0, 1])",
    "variable('L(b,h)', [0, 1])",
    "variable('L(b,n)', [0, 1])",
    "",
    "factor('f1', 'L(a,h) L(a,n)', function(x, y) {\n  return !x || y;\n});",
    "",
    "factor('f2', 'L(b,h) L(b,n)', function(x, y) {\n  return !x || y;\n});",
    "",
    "factor('f3', 'L(b,n)', function(x) {\n  return !x;\n});",*/
    "",
    "var people = ['a', 'b'];",
    "",
    "function L(x, y) { return 'L('+x+','+y+')'; }",
    "function implies(x, y) { return !x || y; }",
    "function not(x) { return !x; }",
    "",
    "for (var i = 0; i < people.length; i++) {",
    "  var p = people[i];",
    "  variable(L(p, 'h'), [0, 1]);",
    "  variable(L(p, 'n'), [0, 1]);",
    "  factor('f'+i, [L(p, 'h'), L(p, 'n')], implies);",
    "}",
    "",
    "factor('o', L('b', 'n'), not);",
    "",
    //"query('L(b,n)')",
    "sumVariableElimination()",
  ],
  new: [
    "// Create your own factor graph!",
    "// Call variable(), factor(), query() followed by an inference algorithm.",
    "",
    "sumVariableElimination()",
  ],
};

FactorGraph.prototype.updateGraph = function() {
  var self = this;

  // Draw graph
  var nodes = self.variables.map(function(v) {
    var node = factorNode(formatVar(v), self.conditioned[v] ? {color: 'gray'} : _);
    if (self.eliminated[v]) node.opacity(0.1);
    node.tooltip(self.domains[v].join(' '));
    self.varBlocks[v] = node;
    return node;
  });

  var edges = [];

  var squares = self.factors.map(function(f) {
    var sq = square(25);
    sq.tooltip(f.name + ':\n' + f.list.map(function(pair) { return pair[0].join(' ') + ': ' + formatWeight(pair[1]); }).join('\n'));
    edges.push(moveTopOf(f.name, sq).scale(0.8));
    if (f.eliminated) sq.opacity(0.1);
    f.vars.forEach(function(v) {
      var e = line(sq, self.varBlocks[v]).strokeWidth(2);
      if (f.eliminated) e.opacity(0.1);
      edges.push(e);
    });
    return sq;
  });

  var graph = overlay(
    ytable(
      xtable.apply(null, squares).margin(50),
      xtable.apply(null, nodes).margin(30),
    _).center().margin(40),
    overlay.apply(null, edges),
  _);

  self.graphBox.resetContent(graph);
}

FactorGraph.prototype.updateAll = function() {
  var self = this;
  self.initialize();
  self.currCode = self.inputBox.content().get();

  // Create graph
  try {
    eval(self.inputBox.content().get());
  } catch (e) {
    self.error(e.toString());
  }

  if (self.variables.length == 0)
    self.error('No variables created!');

  if (self.algorithmStr == null)
    self.error('No inference algorithm specified!');

  self.statusBox.resetContent(ytable(
    self.queryVars ? stmt('Query', self.queryStr()) : _,
    self.algorithmStr ? stmt('Algorithm', self.algorithmStr.bold()) : _,
  _));

  this.messageBox.resetContent(
    self.errors.length > 0 ?
      ytable.apply(null, self.errors).strokeColor('red') : 
      '<b><font color="red">Start of algorithm</b></font>.  Click "Step" to step through it.');
  this.extraBox.resetContent(nil());

  self.updateGraph();
}

FactorGraph.prototype.display = function(opts) {
  var self = this;

  function stepCode() {
    self.inputBox.updateContent();
    if (self.inputBox.content().get() != self.currCode) {
      pushKeyValue('inference-demo', {input: self.inputBox.content().get()});
      // If code changed, then need to start from scratch.
      self.updateAll();
    } else if (self.stepFunc) {
      // Otherwise, just step through it.
      var output = self.stepFunc();
      self.messageBox.resetContent(ytable.apply(null, output));
    }
    prez.refresh(function() { self.inputBox.focus(); });
  }

  this.inputBox = textBox().multiline(true).size(50, 32).onEnter(stepCode);

  this.statusBox = wrap(nil());
  this.graphBox = wrap(nil());
  this.messageBox = wrap(nil());
  this.extraBox = wrap(nil());

  this.stepButton = button('Step').onClick(stepCode).setPointerWhenMouseOver(true);

  ///// Common to learning-demo
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
    var newContent = (codeExamples[key] || ['// ' + key + ' not found']).join('\n');
    if (sfig_.urlParams.postCode)
      newContent += "\n" + sfig_.urlParams.postCode;
    self.inputBox.content(newContent);  // Put new code

    sfig_.urlParams.example = key;
    sfig_.serializeUrlParamsToLocation();

    self.updateAll();
  }
  selectExample(sfig_.urlParams.example || 'csp');

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

var graph = new FactorGraph();
function variable() { graph.variable.apply(graph, arguments); }
function factor() { graph.factor.apply(graph, arguments); }
function condition() { graph.condition.apply(graph, arguments); }
function query() { graph.query.apply(graph, arguments); }

function maxVariableElimination() { graph.maxVariableElimination.apply(graph, arguments); }
function sumVariableElimination() { graph.sumVariableElimination.apply(graph, arguments); }
function beamSearch() { graph.beamSearch.apply(graph, arguments); }
function particleFiltering() { graph.particleFiltering.apply(graph, arguments); }
function iteratedConditionalModes() { graph.iteratedConditionalModes.apply(graph, arguments); }
function gibbsSampling() { graph.gibbsSampling.apply(graph, arguments); }

////////////////////////////////////////////////////////////

var demoFontSize = 24;
sfig.Text.defaults.setProperty('fontSize', demoFontSize);

// Demo!
add(slide(null,
  graph.display(),
_).dim(1100, 640).id('console').leftHeader(nil()).showIndex(false));

sfig.Text.defaults.setProperty('fontSize', 16);

add(slide('Factor graphs and inference',
  bulletedText([null,
    'We have a set of variables $X = (X_1, \\dots, X_n)$, where each variable $X_i$ can be assigned a value in its domain $\\Domain_i$.  An full assignment $x = (x_1, \\dots, x_n)$ gives a value to each variable, and a partial assignment gives a value to a subset of the variables.',
    'We have a set of factors (constraints) $f_1, \\dots, f_m$.  Each factor $f_j$ depends on a subset of the variables $D_j \\subset X$ and maps each partial assignment to the variables $D_j$ to a non-negative real number representing how "good" that partial assignment is.  This is the way (local) dependencies between variables are expressed.',
    'Define a weight for each assignment $\\Weight(x) = \\prod_{j=1}^m f_j(x)$ which gives a global notion of goodness for the assignment $x$ (notice that this takes into account all the factors).  A Markov network further defines a probability distribution over assignments by normalizing the weights: $\\P(X_1 = x_1, \\dots, X_n = x_n) = \\frac{\\Weight(x)}{\\sum_{x\'} \\Weight(x\')}$.',
    ['Given a factor graph (defined by the variables and factors) which contains all the information, we\'d like to ask queries about these variables (as an analogy, think about performing SQL queries on databases).  There are two primary types of inference:',
      '<b>MAP inference</b>: compute the maximum weight (full) assignment: $\\arg\\max_x \\Weight(x)$.  Note that we don\'t need probabilities here.  This gives us the best global assignment to all the variables, taking into account all the factors (sources of information).',
      '<b>Marginal inference</b>: suppose we are only interested in a subset of variables $A \\subset X$.  Call these query variables.  For each partial assignment $A = a$, compute the weighted fraction of full assignments that are consistent with $A=a$: $\\P(A = a) = \\frac{\\sum_{x \\text{ consistent with a }} \\Weight(x)}{\\sum_{x\'} \\Weight(x\')}$.',
    ],
  ]),
_).id('background'));

add(slide('Inference algorithms',
  bulletedText(['We will consider three types of inference algorithms.  Each type consists of two variants, one for MAP inference and one for marginal inference.  Each algorithm has a set of knobs which can affect both speed and accuracy.',
  ]),
  parentCenter(table(
    ['Type'.bold(), 'MAP inference'.bold(), 'Marginal inference'.bold()],
    ['Variable elimination', 'max variable elimination', 'sum variable elimination'],
    ['Incremental', 'beam search', 'particle filtering'],
    ['Local', 'iterated conditional modes (ICM)', 'Gibbs sampling'],
  _).margin(15, 5)),
_));

add(slide('Exact inference',
  bulletedText([null,
    ['<b>Variable elimination</b>: The idea is to iteratively eliminate one non-query variable at a time.  Eliminating a variable $X_i$ replaces all the factors that depend on $X_i$ with one factor, either summing or maxing over the possible values of $X_i$.',
      'The new factor has arity equal to the size of the Markov blanket of $X_i$, which can be as large as the number of nodes $n$.  Just storing the factor can be exponential in the arity.  So in practice, variable elimination is mostly applied to tree-structured factor graphs or graphs with low tree-width.',
      ['How do we answer our queries?',
       'For marginal inference, we eliminate all the non-query variables $X - A$, producing a new factor graph with variables $A$.  Then just enumerate over each possible assignment $A=a$ and evaluate its weight under the new factor graph.  We can normalize these weights to get $\\P(A = a)$.',
       'For MAP inference, we eliminate all the variables.  This might seem mysterious since we want a full assignment to all the variables, but they\'re all gone now.  The trick is to store, for each new factor created, the assignment to the eliminated variable that achieved the $\\max$ (this essentially provides a back pointer).  Now we go through the factors created in reverse elimination order, setting the variables to a value that achieved the $\\max$.',
      ],
      'The only knob in variable elimination is the elimination order.  There can be a huge difference in time/space complexity depending on the order.  For trees, always eliminate leaves.  For general graphs, choosing the variable that will create the smallest new factor is a reasonable heuristic.  Variable elimination always provides the exact answer.',
    ],
    ['<b>Backtracking</b>: the idea is to recursively enumerate all possible assignments to compute the desired max or sum.  We can employ variable/value ordering heuristics.  We can further prune zero weight assignments using forward checking or AC-3.'],
  ]),
_));

add(slide('Approximate inference',
  bulletedText([null,
    ['<b>Incremental inference</b>: the idea is to maintain a set of partial assignments.  Each iteration, we extend all the partial assignments to a new varaible, and then prune the resulting assignments to keep the set to at most size $K$.',
      'The output of beam search and particle filtering is a set of weighted full assignments.  For MAP inference, take the highest weight assignment.  For marginal inference, use these particles as an approximation of the full joint distribution over all variables, and we can use it to estimate any query $\\P(A = a)$ by computing the weighted fraction of particles that satisfy that query.',
      'The main knob to set is $K$, the beam size / number of particles.  For particle filtering, we also have a proposal distribution for extend partial assignments, which for HMMs is usually taken to be to the transition distribution.',
      'Both beam search and particle filtering are approximate that become more exact as $K$ increases.  Their success relies on having strong local information (from the factors which are included so far).  If there are long range dependencies, then all bets are off.',
    ],
    ['<b>Local inference</b>: the idea is to maintain a full assignment and iteratively reassign one variable at a time conditioned on all others, either by sampling or maximizing.',
     'Both ICM and Gibbs sampling are approximate.  Their success relies on having fairly weak dependencies between the variables.  The main knob to set is the initial assignment which can be crucial for good performance (especially for ICM).',
     'In practice, Gibbs sampling (or MCMC algorithms in general can be re-purposed for MAP inference (these algorithms are known as simulated annealing or stochastic hill-climbing).',
    ],
  ]),
_));

add(slide('Documentation',
  bulletedText(['This demo allows you to programmatically construct your own factor graph and step through various inference algorithms.',
    ['Problem definition',
      '<tt>variable(variableName, domain)</tt>: adds a variable to the factor graph, where <tt>domain</tt> is a list of possible values (e.g., <tt>variable(\'A\', [0, 1])</tt>).',
      '<tt>factor(factorName, variables, spec)</tt>: adds a factor to the factor graph, where <tt>variables</tt> is a string representing a space-separated list of variable names and <tt>spec</tt> is either a function that takes in a partial assignment to <tt>variables</tt> and returns the factor value or a map from partial assignment (represented as space-separated string of values) to the factor value.  Example: <tt>factor(\'f1\', \'A B\', function(a, b) {return a < b;})</tt>',
      '<tt>condition(variableName, value)</tt>: assign <tt>value</tt> to <tt>variableName</tt>.',
      '<tt>query(variables)</tt>: sets the query variables to <tt>variables</tt>, which is a string representing a space-separated list of variable names.  Example: <tt>query(\'A B\')</tt>.',
    ],
    ['Inference algorithms',
      '<tt>maxVariableElimination(opts), sumVariableElimination(opts)</tt>: run variable elimination (<tt>opts.order</tt>: space-separated list of variables to eliminate)',
      '<tt>beamSearch(opts), particleFiltering(opts)</tt>: run incremental inference algorithms (<tt>opts.K</tt>: number of candidates)',
      '<tt>iteratedConditionalModes(opts), beamSearch (opts)</tt>: run local inference algorithms (<tt>opts.steps</tt>: number of steps of algorithms to take between renderings)',
    ],
  ]),
_).id('documentation'));

sfig.Text.defaults.setProperty('fontSize', demoFontSize);

sfig.initialize();
