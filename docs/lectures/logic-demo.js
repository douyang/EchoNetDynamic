G = sfig.serverSide ? global : this;
sfig.enableMouseWheel = false;
document.title = 'Logic demo';
G.prez = sfig.presentation();

function GeneralRule(name, arity, func) {
  this.name = name;
  this.arity = arity;
  this.func = func;
}

function HornRule(antecedents, consequent) {
  this.antecedents = antecedents;
  this.consequent = consequent;
}

function LogicalSystem() {
  this.initialize();
}

LogicalSystem.prototype.initialize = function() {
  this.derivations = {};  // logical formula key -> derivation

  // For resolution
  this.unaryRules = [];
  this.binaryRules = [];

  // For chaining
  this.hornRules = [];
}

// Create a derivation
function Derivation() { }

// For Horn clauses
LogicalSystem.prototype.doBackwardChaining = function() {
  var self = this;
  // Terms are ['relation name', arg, ..., arg], where arg can be a variable $x or a constant.
  // subst are maps from variables to constants.

  function isVar(t) { return t[0] == '$'; }

  // Simplified version
  // Mutate subst
  function unifyVar(v, x, subst) {
    if (v in subst) return unify(subst[v], x, subst);
    if (x in subst) return unify(subst[x], v, subst);
    subst[v] = x;
    return true;
  }

  function unify(t1, t2, subst) {
    if (t1 == t2) return true;
    if (isVar(t1)) return unifyVar(t1, t2, subst);
    if (isVar(t2)) return unifyVar(t2, t1, subst);

    if (t1.length != t2.length) return false;

    // Term or expression
    if (t1[0] != t2[0]) return false; // Name
    for (var i = 1; i < t1.length; i++) {  // Arguments
      if (!unify(t1[i], t2[i], subst)) return false;
    }
  }

  var subst = {};
  sfig.L(unify(['a', 'b'], subst), subst);

  // Return list of assignments.  for which the goal is true.
  function satisfy(goal, subst) {
    var result = [];
    self.hornRules.forEach(function(rule) {
      //unify(rule, goal, );
    });
  }
}

LogicalSystem.prototype.applyUnaryRules = function(deriv) {
  // Apply unary rules
  for (var i = 0; i < this.unaryRules.length; i++) {
    var rule = this.unaryRules[i];
    var newForms = rule.func(deriv.form);
    for (var j = 0; j < newForms.length; j++) {
      var newForm = newForms[j];
      //sfig.L(rule.name, formulaToString(deriv.form), formulaToString(newForm));
      var newDeriv = new Derivation();
      newDeriv.form = newForm;
      newDeriv.rule = rule;
      newDeriv.children = [deriv];
      newDeriv.cost = deriv.cost + 1;
      newDeriv.temporary = deriv.temporary;
      if (newForm == 'false') {
        this.goalDeriv = newDeriv;
        return false;
      }
      if (!this.addDerivation(newDeriv))
        return false;
    }
  }
  return true;
}

function formatLogicalForm(form, color) {
  // not | and, or | quantifiers | bicond
  function paren(s, b) { return b ? '(' + s + ')' : s; }
  var precMap = {not: 1, and: 2, or: 2, implies: 3, bicond: 3};
  function prec(op) { return precMap[op] || 4; }
  function recurse(form, parentOp) {
    if (form[0] == 'and') {
      return paren(recurse(form[1], 'and') + ' \\wedge ' + recurse(form[2], 'and'), parentOp != 'and' && prec(parentOp) <= prec('and'));
    } else if (form[0] == 'or') {
      return paren(recurse(form[1], 'or') + ' \\vee ' + recurse(form[2], 'or'), parentOp != 'or' && prec(parentOp) <= prec('or'));
    } else if (form[0] == 'bicond') {
      return paren(recurse(form[1], 'bicond') + ' \\leftrightarrow ' + recurse(form[2], 'bicond'), prec(parentOp) <= prec('bicond'));
    } else if (form[0] == 'implies') {
      return paren(recurse(form[1], 'implies') + ' \\to ' + recurse(form[2], 'implies'), prec(parentOp) <= prec('bicond'));
    } else if (form[0] == 'not') {
      return '\\neg ' + recurse(form[1], 'not');
    } else if (form instanceof Array) {  // Assume relation
      return '\\text{' + form[0] + '}' + '(' + form.slice(1).map(recurse).join(',') + ')';
    } else {
      return '\\text{' + form + '}';
    }
  }
  if (color)
    return '$\\red{' + recurse(form) + '}$';
  else
    return '$' + recurse(form) + '$';
}

function renderDerivation(deriv) {
  sfig.L(deriv.temporary);
  var root = formatLogicalForm(deriv.form, deriv.temporary);
  var children = deriv.children ? deriv.children.map(renderDerivation) : [];
  return rootedTree.apply(null, [root].concat(children));
}

LogicalSystem.prototype.applyBinaryRules = function(deriv1, deriv2) {
  for (var i = 0; i < this.binaryRules.length; i++) {
    var rule = this.binaryRules[i];
    var newForms = rule.func(deriv1.form, deriv2.form);
    for (var j = 0; j < newForms.length; j++) {
      var newForm = newForms[j];
      //sfig.L(rule.name, formulaToString(deriv1.form), formulaToString(deriv2.form), formulaToString(newForm));
      var newDeriv = new Derivation();
      newDeriv.form = newForm;
      newDeriv.rule = rule;
      newDeriv.children = [deriv1, deriv2];
      newDeriv.cost = deriv1.cost + deriv2.cost + 1;
      newDeriv.temporary = deriv1.temporary || deriv2.temporary;
      if (newForm == 'false') {
        this.goalDeriv = newDeriv;
        return false;
      }
      if (!this.addDerivation(newDeriv))
        return false;
    }
  }
  return true;
}

// Return whether adding the derivation was okay.
LogicalSystem.prototype.addDerivation = function(deriv) {
  if (!deriv.form) throw 'Bad';

  if (Object.keys(this.derivations).length >= 1000) {
    sfig.L('Reached limit, dropping derivation');
    return;
  }

  var self = this;
  var key = formulaToString(deriv.form);
  var oldDeriv = this.derivations[key];
  if (oldDeriv == null || (deriv.cost < oldDeriv.cost && (deriv.temporary <= oldDeriv.temporary))) {
    this.derivations[key] = deriv;

    //sfig.L('derivation', key, deriv);

    if (!this.applyUnaryRules(deriv)) return false;

    for (var key2 in this.derivations) {
      var deriv2 = this.derivations[key2];
      if (!this.applyBinaryRules(deriv, deriv2)) return false;
      if (!this.applyBinaryRules(deriv2, deriv)) return false;
    }
  }
  return true;
}

// Return whether the derivation was added.
LogicalSystem.prototype.addAxiom = function(form) {
  var deriv = new Derivation();
  deriv.form = form;  // Logical form
  deriv.cost = 0;
  deriv.temporary = true;
  return this.addDerivation(deriv);
}

LogicalSystem.prototype.makeTemporaryPermanent = function() {
  for (var key in this.derivations) {
    var deriv = this.derivations[key];
    deriv.temporary = false;
  }
}

LogicalSystem.prototype.numDerivations = function() { return Object.keys(this.derivations).length; }

LogicalSystem.prototype.removeTemporary = function() {
  for (var key in this.derivations) {
    var deriv = this.derivations[key];
    if (deriv.temporary) delete this.derivations[key];
  }
}

function formulaToString(form) {
  if (form instanceof Array)
    return '(' + form.map(formulaToString).join(' ') + ')';
  return form;
}

function formulaEquals(f, g) {
  if ((f instanceof Array) && (g instanceof Array)) {
    var n = f.length;
    if (n != g.length) return false;
    for (var i = 0; i < n; i++)
      if (!formulaEquals(f[i], g[i])) return false;
    return true;
  }
  return f == g;
}

LogicalSystem.prototype.propositionalLogic = function(mode) {
  this.initialize();
  this.firstOrder = false;
  this.horn = false;

  if (mode == 'resolution') {
    /*this.addUnaryRule('communtativity of $\\vee$', function(f) {
      // (or a b) |- (or b a)
      if (f[0] != 'or') return null;
      return [f[0], f[2], f[1]];
    });*/

    this.addUnaryRule('convert to CNF', function(f) {
      var keywords = {not:1, and:1, or:1, implies:1, bicond:1};
      function recursiveApply(f, act) {
        if (f instanceof Array) return act(f[0], f.slice(1).map(function(subf) { return recursiveApply(subf, act); }));
        return f;
      }

      function removeImplications(f) {
        if (!(f instanceof Array)) return f;
        if (f[0] == 'implies') return ['or', ['not', removeImplications(f[1])], removeImplications(f[2])];
        if (f[0] == 'bicond') return ['and', removeImplications(['implies', f[1], f[2]]), removeImplications['implies', f[2], f[1]]];
        return [f[0]].concat(f.slice(1).map(removeImplications));
      }

      function negPushNegationInwards(f) { return pushNegationInwards(['not', f]); }
      function pushNegationInwards(f) {
        //sfig.L('push', formulaToString(f));
        if (f == null) throw 'Bad';
        if (!(f instanceof Array)) return f;
        if (f[0] == 'not') {
          var g = f[1];
          //sfig.L('g', formulaToString(g));
          if (g[0] == 'or') return ['and', negPushNegationInwards(g[1]), negPushNegationInwards(g[2])];
          if (g[0] == 'and') return ['or', negPushNegationInwards(g[1]), negPushNegationInwards(g[2])];
          if (g[0] == 'not') return pushNegationInwards(g[1]);
          return f;
        } else {
          return [f[0], pushNegationInwards(f[1]), pushNegationInwards(f[2])];
        }
      }

      function distribute(f) {
        if (!(f instanceof Array)) return f;
        if (f[0] == 'and') return ['and', distribute(f[1]), distribute(f[2])];
        if (f[0] == 'or') {
          var g1 = distribute(f[1]);
          var g2 = distribute(f[2]);
          if (g1[0] == 'and')
            return ['and', distribute(['or', g1[1], g2]), distribute(['or', g1[2], g2])];
          if (g2[0] == 'and')
            return ['and', distribute(['or', g1, g2[1]]), distribute(['or', g1, g2[2]])];
          return ['or', g1, g2];
        }
        return f;
      }

      f = removeImplications(f);
      f = pushNegationInwards(f);
      //sfig.L(formulaToString(f));
      f = distribute(f);

      var result = [];
      function recurse(f) {
        if (f[0] == 'and') {
          recurse(f[1]);
          recurse(f[2]);
        } else {
          result.push(f);
        }
      }
      recurse(f);
      return result;
    });

    function updateSigns(signs, x, sign) {
      var oldSign = signs[x];
      if (oldSign == null) { signs[x] = sign; return; }  // New value
      if (oldSign != sign) signs[x] = 0;  // Different value
    }

    // Return whether this is in the right form
    // signs maps each symbol that occurs to 1, -1, or 0
    function addToSigns(f, signs) {
      if (f[0] == 'not' && !(f[1] instanceof Array)) {
        updateSigns(signs, f[1], -1);
        return true;
      }
      if (f instanceof Array) {
        if (f[0] != 'or') return false;
        return addToSigns(f[1], signs) && addToSigns(f[2], signs);
      }
      updateSigns(signs, f, +1);
      return true;
    }

    // Resolution
    this.addBinaryRule('resolution', function(f, g) {
      var signs = {};
      if (!addToSigns(f, signs)) return [];
      if (!addToSigns(g, signs)) return [];

      var keys = Object.keys(signs).sort();

      var form = null;
      var eliminated = false;
      for (var i = 0; i < keys.length; i++) {
        var x = keys[i];
        var sign = signs[x];
        var literal = null;
        if (sign == 1) literal = x;
        else if (sign == -1) literal = ['not', x];
        else { eliminated = true; continue; }
        if (form == null) form = literal;
        else form = ['or', literal, form];
      }
      if (!form) return ['false'];
      if (!eliminated) return [];  // Must have eliminated something
      //if (formulaEquals(form, f) || formulaEquals(form, g)) return [];  // Didn't do anything
      return [form];
    });
  } else {
    // Not needed
    this.addBinaryRule('Modus Ponens', function(f, g) {
      // (implies a b) a |- b
      if (f[0] != 'implies') return [];
      if (!formulaEquals(f[1], g)) return [];
      return [f[2]];
    });
  }
}

LogicalSystem.prototype.firstOrderHornLogic = function() {
  this.initialize();
  this.firstOrder = true;
  this.horn = true;
}

// General
LogicalSystem.prototype.addUnaryRule = function(name, func) {
  this.unaryRules.push(new GeneralRule(name, 1, func));
}
LogicalSystem.prototype.addBinaryRule = function(name, func) {
  this.binaryRules.push(new GeneralRule(name, 2, func));
}

function negateFormula(form) {
  if (form[0] == 'not') return form[1];
  return ['not', form];
}

LogicalSystem.prototype.tell = function(form) {
  this.goalDeriv = null;
  if (!this.firstOrder) {
    var result = this.addAxiom(negateFormula(form));
    this.removeTemporary();
    if (!result) return null;  // Already knew that

    result = this.addAxiom(form);
    if (!result)  // Contradiction
      this.removeTemporary();
    else  // Learned something
      this.makeTemporaryPermanent();
    return result;
  } else {
  }
}

LogicalSystem.prototype.ask = function(form) {
  this.goalDeriv = null;
  if (!this.firstOrder) {
    var result = this.addAxiom(negateFormula(form));
    this.removeTemporary();
    if (!result) return true;  // Yes
    result = this.addAxiom(form);
    this.removeTemporary();
    if (!result) return false;  // No
    return null;  // Don't know
  } else {
  }
}

// Input: "all men are mortal"
function parseNaturalLanguage(str, firstOrder) {
  if (str[0] == '(') {
    if (str[str.length-1] == '?')
      return ['Ask', parseLispTree(str.slice(0, str.length-1))];
    return ['Tell', parseLispTree(str)];
  }

  str = str.toLowerCase();
  str = str.replace(/^\s+/, '').replace(/\s+$/, '');
  var ask = false;
  if (str[str.length-1] == '?') ask = true;
  str = str.replace(/[,\.\?]/g, '');
  str = str.replace(/ +/g, ' ');

  function canonicalizeNoun(s) {
    if (s.slice(s.length-3) == 'ies') return s.slice(0, s.length-3) + 'y';
    if (s[s.length-1] == 's') return s.slice(0, s.length-1);
    return s;
  }
  function canonicalizeVerb(s) {
    if (s[s.length-1] == 's') return s.slice(0, s.length-1);
    return s;
  }

  function agree(noun, verb) {
    if (noun == 'i' || noun == 'you' || noun == 'we') return noun + ' ' + verb;
    else return noun + ' ' + verb + 's';
  }

  function recurse(str) {
    var m;

    if (!firstOrder) {
      // Propositional logic
      if (m = str.match(/^did (\w+) (\w+)(.*)$/)) return recurse(agree(m[1], m[2]) + m[3]);
      if (m = str.match(/^does (\w+) (\w+)(.*)$/)) return recurse(agree(m[1], m[2]) + m[3]);
      if (m = str.match(/^is the (\w+) (.+)$/)) return recurse('the ' + m[1] + ' is ' + m[2]);
      if (m = str.match(/^is (\w+) (.+)$/)) return recurse(m[1] + ' is ' + m[2]);

      if (m = str.match(/^if (.+) then (.+)$/)) return ['implies', recurse(m[1]), recurse(m[2])];
      if (m = str.match(/^(.+) if and only if (.+)$/)) return ['bicond', recurse(m[1]), recurse(m[2])];
      if (m = str.match(/^(.+) only if (.+)$/)) return ['implies', recurse(m[1]), recurse(m[2])];
      if (m = str.match(/^(.+) if (.+)$/)) return ['implies', recurse(m[2]), recurse(m[1])];
      if (m = str.match(/^(.+) and (.+)$/)) return ['and', recurse(m[1]), recurse(m[2])];
      if (m = str.match(/^(.+) or (.+)$/)) return ['or', recurse(m[1]), recurse(m[2])];

      if (m = str.match(/^(.+) do not (\w+)(.*)$/)) return ['not', recurse(agree(m[1], m[2]) + m[3])];
      if (m = str.match(/^(.+) don't (\w+)(.*)$/)) return ['not', recurse(agree(m[1], m[2]) + m[3])];
      if (m = str.match(/^(.+) did not (\w+)(.*)$/)) return ['not', recurse(agree(m[1], m[2]) + m[3])];
      if (m = str.match(/^(.+) didn't (\w+)(.*)$/)) return ['not', recurse(agree(m[1], m[2]) + m[3])];
      if (m = str.match(/^(.+) does not (\w+)(.*)$/)) return ['not', recurse(agree(m[1], m[2]) + m[3])];
      if (m = str.match(/^(.+) doesn't (\w+)(.*)$/)) return ['not', recurse(agree(m[1], m[2]) + m[3])];

      if (m = str.match(/^(.+) not (.+)$/)) return ['not', recurse(m[1] + ' ' + m[2])];
      return str.replace(/ /g, '-');
    } else {
      // First-order logic (only support Horn)
      if (m = str.match(/^(\w+) is an? (\w+)$/)) return [m[2], m[1]];  // John is a student
      if (m = str.match(/^(\w+) is (\w+)$/)) return [m[2], m[1]];  // John is happy
      if (m = str.match(/^(\w+) is (\w+)'s (\w+)$/)) return [m[3], m[2], m[1]];  // John is Tom's father
      if (m = str.match(/^(\w+) (\w+) (\w+)$/)) return [canonicalizeVerb(m[2]), m[1], m[3]];  // John likes Mary
      if (m = str.match(/^all (\w+) are (\w+)/)) return [m[2], canonicalizeNoun(m[1])]; // all people are tall
      if (m = str.match(/^all (\w+) (\w+)/)) return [m[2], canonicalizeNoun(m[1])]; // all birds fly
      if (m = str.match(/^all (\w+) (\w+) (\w+)/)) return [m[2], canonicalizeNoun(m[1])]; // all birds fly
    }

    return null;
  }

  var result = recurse(str);
  if (!result) {
    sfig.L(str);
    return ['Error', 'Sorry, I don\'t understand.'];
  }
  return [ask ? 'Ask' : 'Tell', result];
}

function parseLispTree(str) {
  // Input: "(a (b c))" => ['a', ['b', 'c']]
  // Hack: replace () with [], put quotes
  str = str.replace(/\(/g, ' [ ');
  str = str.replace(/\)/g, ' ] ');
  str = str.replace(/ +/g, ' ');
  str = str.replace(/ /g, '","');
  str = str.replace(/"\[",/g, '[');
  str = str.replace(/"\]"/g, ']');
  str = str.replace(/^",/, '');
  str = str.replace(/,"$/, '');
  try {
    return eval(str);
  } catch(e) {
    throw 'Invalid: ' + str;
  }
}

function chatDemo() {
  var inputBox = textBox().fontSize(18).size(50, 1).multiline(false);
  var transcript = [];
  var outputBox = wrap(nil());
  var logicalSystem = new LogicalSystem();
  logicalSystem.propositionalLogic('resolution');

  function interpret() {
    var input = inputBox.content().get();
    pushKeyValue('logic-demo', {input: input});
    transcript = [];
    if (input == 'forget') {
      logicalSystem.derivations = {};
      transcript.push('I just forgot everything.');
    } else if (input == 'braindump') {
      transcript.push('This is what I know:');
      for (var key in logicalSystem.derivations) {
        var deriv = logicalSystem.derivations[key];
        if (!deriv.children) {
          transcript.push('&nbsp;&nbsp;&nbsp;' + formatLogicalForm(deriv.form));
        }
      }
    } else {
      var form = parseNaturalLanguage(input, false);
      if (form[0] == 'Error') {
        transcript.push(form[1].fontcolor('red'));
      } else {
        transcript.push('Parsed ' + input.italics().fontcolor('green') + ' as ' + formatLogicalForm(form).fontcolor('red') + '.');
        if (form[0] == 'Tell') {
          var result = logicalSystem.tell(form[1]);
          if (result == true) {
            transcript.push('$\\Rightarrow$ I learned something new.');
          } else if (result == false) {
            transcript.push('$\\Rightarrow$ I don\'t buy that!');
          } else {
            transcript.push('I already knew that.');
          }
        } else if (form[0] == 'Ask') {
          var result = logicalSystem.ask(form[1]);
          if (result == true) {
            transcript.push('$\\Rightarrow$ Yes.');
          } else if (result == false) {
            transcript.push('$\\Rightarrow$ No.');
          } else {
            transcript.push('$\\Rightarrow$ I don\'t know.');
          }
        } else {
          transcript.push('Unknown command: ' + form[0]);
        }
        sfig.L(Object.keys(logicalSystem.derivations).length + ' derivations in the system');

        // Show evidence
        if (logicalSystem.goalDeriv) {
          transcript.push(transform(renderDerivation(logicalSystem.goalDeriv)).height(400).width(1250));
        }

        transcript.push('&nbsp;');
      }
    }

    var maxLength = 15;
    if (transcript.length > maxLength)
      transcript = transcript.slice(transcript.length - maxLength);
    outputBox.resetContent(yseq.apply(null, transcript.map(function(t) {
      if (t instanceof sfig.Block) return t;
      return text(t).width(800/0.6);
    })).scale(0.6));
  }

  function say(s) { inputBox.content(s); interpret(); }

  if (false) {
    say('john is tall');
    say('is john tall?');
    say('is bill tall?');
    say('john is not tall');
  }

  if (false) {  // Simple modus ponens
    say('If it rained, then the ground is wet.');
    say('It rained.');
    say('Is the ground wet?');
    say('The ground is not wet.');
  }
  if (false) {
    say('If it rains, then the ground is wet.');
    say('The ground is wet.');
    say('Did it rain?');
  }
  if (false) {
    say('If it rains, then the ground is wet.');
    say('The ground is not wet.');
    say('Did it rain?');
  }

  if (false) {
    say('If Mary loves Pat, then Mary loves quincy.');
    say('If it is Thursday, then Mary loves Pat or Mary loves Quincy.');
    say('It is Thursday.');
    say('Does mary love Quincy?');
    say('Does mary love Pat?');
  }

  if (false) {
    say('You get extra credit if you write a paper and you solve the problems.');
    say('You didn\'t get extra credit.');
    say('You solve the problems.');
    say('Did you write a paper?');
  }

  if (false) {
    say('a');
    say('a?');
  }

  inputBox.onEnter(function() {
    interpret();
    prez.refresh(function() { inputBox.focus(); inputBox.textElem.select(); });
  });

  return ytable(
    yseq(
      ytable(
        text('Tell me some something or ask me something.  I will try to convert your utterance into propositional logic and apply resolution to carry out your request.').fontSize(18),
        indent(text(stmt('Example', '"If it rained, then the ground is wet.", "It rained.", "Is the ground wet?"')).fontSize(18)),
        indent(text(stmt('Example', '"(implies (or rain snow) wet)", "rain", "(or wet cold)?"')).fontSize(18)),
      _),
      inputBox,
      outputBox,
    _),
  _);
}

////////////////////////////////////////////////////////////

var demoFontSize = 24;
sfig.Text.defaults.setProperty('fontSize', demoFontSize);

// Demo!
add(slide(null,
  chatDemo(),
_).dim(1100, 640).id('console').leftHeader(nil()).showIndex(false).rightFooter(bold('Note: use Firefox for best results.')));

sfig.Text.defaults.setProperty('fontSize', 16);

add(slide('Logical inference',
  bulletedText([null,
    'You can enter utterances in either English or propositional logic.',
    'The English parsing is very simplistic right now (in particular, morphological analysis is very brittle), but you can try the examples on the previous slides.',
    'Propositional logic formulas can be entered directly using a LISP-like syntax: (operator arguments), where operator can be "not" ($\\neg\\,$), "and" ($\\wedge$), "or" ($\\vee$), "implies" ($\\to$), or "bicond" ($\\leftrightarrow$).',
    'Assertions trigger Tell requests and questions trigger Ask requests.  In both cases, there are three possible responses: entailed by the knowledge base, contradicts the knowledge base, or is contingent.',
    'In the first two cases, a proof tree will be given.  The leaves correspond to statements that have been added to the knowledge base.  Unary rules correspond to conversion to CNF and binary rules correspond to application of the resolution rule.',
    'The red formulas correspond to those generated by adding $f$ or $\\neg f$ to the knowledge base.',
    'You can also type "forget" to clear the knowledge base or "braindump" to show the knowledge base.',
  ]),
_).id('background'));

sfig.Text.defaults.setProperty('fontSize', demoFontSize);

sfig.initialize();
