require('./sfig/internal/sfig.js');
require('./sfig/internal/metapost.js');
require('./sfig/internal/seedrandom.js');
require('./sfig/internal/Graph.js');
require('./sfig/internal/RootedTree.js');
require('./sfig/internal/Outline.js');
require('./utils.js');

////////////////////////////////////////////////////////////

G = sfig.serverSide ? global : this;
sfig.importAllMethods(G);

sfig.TextBox.defaults.setProperty('fontSize', 12);
sfig.Text.defaults.setProperty('font', 'Arial');

sfig.latexMacro('StartState', 0, 's_\\text{start}');
sfig.latexMacro('EndState', 0, 's_\\text{end}');
addTextLatexMacros('States Actions Succ Cost PathCost FutureCost PastCost LowCost UpCost'.split(' '));
addTextLatexMacros('Reward IsTerminal IsEnd PathReward ForwReward BackReward Utility opt'.split(' '));
sfig.latexMacro('ValueStart', 2, 'V_{#1, #2}(\\StartState)');
addTextLatexMacros('Turn Player Players Eval'.split(' '));
addTextLatexMacros('agent nature opp dice coin'.split(' '));
addTextLatexMacros('prior likelihood Parents'.split(' '));
addTextLatexMacros('IG TrainLoss Loss Error Dist sign'.split(' '));

sfig.latexMacro('ModifiedCost', 0, '\\Cost\'');
sfig.latexMacro('ModifiedPastCost', 0, '\\PastCost\'');
sfig.latexMacro('RelaxedCost', 0, '\\Cost_\\text{rel}');
sfig.latexMacro('RelaxedFutureCost', 0, '\\FutureCost_\\text{rel}');
sfig.latexMacro('RelaxedP', 0, 'P_\\text{rel}');

addTextLatexMacros('Scope Score Weight Domain Domains MarkovBlanket true false'.split(' '));
addTextLatexMacros('Formulas KB Rules Tell Ask Rain Slippery Snow Traffic Wet Weekday Peaceful Careless Accident'.split(' '));
addTextLatexMacros('Student Person Creative Takes Course Knows Believes Covers Concept'.split(' '));
addTextLatexMacros('alice bob carol arithmetic Summer Bizzare'.split(' '));
addTextLatexMacros('Unify Subst American Hostile Weapon Sells Criminal Owns Nono Missile West Brother'.split(' '));
addTextLatexMacros('john bob Animal Loves Likes Feeds Visited Museum Equals Sum Count'.split(' '));
addTextLatexMacros('lois superman CanFly Knows chicago boston nature hiking swimming Hates geometry'.split(' '));

sfig.latexMacro('Train', 0, '\\mathcal{D}_\\text{train}');
sfig.latexMacro('Test', 0, '\\mathcal{D}_\\text{test}');
sfig.latexMacro('Validation', 0, '\\mathcal{D}_\\text{val}');
sfig.latexMacro('Holdout', 0, '\\mathcal{D}_\\text{holdout}');
sfig.latexMacro('Mistakes', 0, '\\mathcal{D}_\\text{mistakes}');
sfig.latexMacro('P', 0, '\\mathbb{P}');
sfig.latexMacro('R', 0, '\\mathbb{R}');
sfig.latexMacro('E', 0, '\\mathbb{E}');
sfig.latexMacro('v', 0, '\\mathbf{v}');
sfig.latexMacro('V', 0, '\\mathbf{V}');
sfig.latexMacro('w', 0, '\\mathbf{w}');
sfig.latexMacro('h', 0, '\\mathbf{h}');
sfig.latexMacro('sD', 0, '\\mathcal{D}');
sfig.latexMacro('sF', 0, '\\mathcal{F}');
sfig.latexMacro('sM', 0, '\\mathcal{M}');
sfig.latexMacro('sI', 0, '\\mathcal{I}');
sfig.latexMacro('sL', 0, '\\mathcal{L}');
sfig.latexMacro('ba', 0, '\\mathbf{a}');
sfig.latexMacro('bX', 0, '\\mathbf{X}');
sfig.latexMacro('bB', 0, '\\mathbf{B}');
sfig.latexMacro('phia', 0, '\\phi_\\text{local}');
sfig.latexMacro('eqdef', 0, '\\stackrel{\\text{def}}{=}');
sfig.latexMacro('1', 0, '\\mathbf{1}');
sfig.latexMacro('independent', 0, '\\perp\\!\\!\\!\\!\\perp');
sfig.latexMacro('vR', 0, '\\color{red}{\\text{R}}');
sfig.latexMacro('vB', 0, '\\color{blue}{\\text{B}}');
sfig.latexMacro('vG', 0, '\\color{green}{\\text{G}}');
sfig.latexMacro('vO', 0, '\\color{orange}{\\text{O}}');
sfig.latexMacro('vC', 0, '\\text{c}');
sfig.latexMacro('vD', 0, '\\text{d}');

sfig.latexMacro('nl', 1, '``\\text{#1}"');
sfig.latexMacro('ZeroOneLoss', 0, '\\Loss_{\\text{0-1}}');
sfig.latexMacro('PerceptronLoss', 0, '\\Loss_{\\text{perceptron}}');
sfig.latexMacro('HingeLoss', 0, '\\Loss_{\\text{hinge}}');
sfig.latexMacro('LogisticLoss', 0, '\\Loss_{\\text{logistic}}');
sfig.latexMacro('SquaredLoss', 0, '\\Loss_{\\text{squared}}');
sfig.latexMacro('AbsLoss', 0, '\\Loss_{\\text{absdev}}');
sfig.latexMacro('ReconstructionLoss', 0, '\\Loss_{\\text{kmeans}}');
sfig.latexMacro('Reg', 0, '\\text{Penalty}');
sfig.latexMacro('pr', 1, '\\text{#1}');  // Predicate

sfig.latexMacro('o', 1, '\\textit{o#1}');

////////////////////////////////////////////////////////////

if (sfig.serverSide) {
  if (process.argv.length != 3) {
    sfig.L("Missing javascript file to include");
  } else {
    var base = process.argv[2].replace(/.js$/, '');
    sfig_.urlParams.include = base + '.js';
    require('./' + base + '.js');
    prez.writePdf({outPrefix: base, onlyFinalLevel: true});
  }
} else {
  sfig_.parseUrlParamsFromLocation();
  sfig.includeFileFromArgs();
}
