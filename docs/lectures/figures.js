// Usage: node figures.js
// Figures for the homeworks, etc.

require('./sfig/internal/sfig.js');
require('./sfig/internal/metapost.js');
require('./sfig/internal/seedrandom.js');
require('./sfig/internal/Graph.js');
require('./sfig/internal/RootedTree.js');
require('./sfig/internal/Outline.js');
require('./utils.js');
sfig.importAllMethods(G);

G = sfig.serverSide ? global : this;
G.prez = presentation();

G.carhmm = function(opts) {
  var xs = [];
  var es = [];
  var items = [];
  var lastx = null;
  var first = null;
  var hVar = opts.hVar || 'C';
  var oVar = opts.oVar || 'D';
  for (var i = 1; i <= opts.maxTime; i++) {
    var x = factorNode('$'+hVar+'_{'+i+'}$');
    if (!first) first = x;
    xs.push(x);
    if (lastx != null) {
      var t = arrow(lastx, x);
      items.push(t);
    }
    var e = factorNode('$'+oVar+'_{'+i+'}$');
    es.push(e);
    var o = arrow(x, e);
    items.push(o);
    lastx = x;
  }
  return overlay(
    table(xs, es).margin(50),
    overlay.apply(null, items),
  _);
}

prez.addSlide(carhmm({maxTime: 3}).id('car'));

sfig.initialize();
prez.writePdf({outPrefix: 'figures', combine: false});
