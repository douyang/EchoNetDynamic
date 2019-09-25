function includeScript(src, text) {
  var script = document.createElement('script');
  script.src = src;
  if (text) script.text = text;
  document.head.appendChild(script);
  return script;
}

function initMathJax(scriptLocation, fallbackScriptLocation) {
  var script = includeScript(scriptLocation);
  var buf = '';
  buf += 'MathJax.Hub.Config({';
  buf += '  extensions: ["tex2jax.js", "TeX/AMSmath.js", "TeX/AMSsymbols.js"],';
  buf += '  tex2jax: {inlineMath: [["$", "$"]]},';
  buf += '});';
  script.innerHTML = buf;

  // If fail, try the fallback location
  script.onerror = function() {
    if (fallbackScriptLocation)
      initMathJax(fallbackScriptLocation, null);
  }
}

G = this;
sfig_ = {urlParams: {}};

// Key value store functions
G.keyValueCommand = function(command, args, callback) {
  var request = new XMLHttpRequest();
  request.open('GET', 'http://nimlet.nimaanari.com:7379/' + command + '/' + args.map(encodeURIComponent).join('/'));  // UPDATE
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
G.getKey = function(key, callback) { keyValueCommand('GET', [key], function(result) { callback(JSON.parse(result['GET'])); }); }
G.setKeyValue = function(key, value, callback) { keyValueCommand('SET', [key, JSON.stringify(value)], callback); }
G.getKeyValues = function(key, callback) { keyValueCommand('HGETALL', [key], function(result) { callback(result['HGETALL']); }); }
G.incrKeyValue = function(key, value, incr, callback) { keyValueCommand('HINCRBY', [key, value, incr], callback); }
G.pushKeyValue = function(key, value, callback) { keyValueCommand('LPUSH', [key, JSON.stringify(value)], callback); }

initMathJax(
  'plugins/MathJax/MathJax.js?config=default',
  'http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=default'
);

function onLoad() {
  getKey('cs221-q', onDisplay);
}

function onDisplay(data) {
  if (!data) {
    var questionDiv = $('#question');
    questionDiv.text('No questions now.');
    return;
  }

  function typeset() {
    MathJax.Hub.queue.Push(['Typeset', MathJax.Hub, this]);
  }

  var questionDiv = $('#question');
  questionDiv.html(data.question);
  questionDiv.each(typeset);

  // Assume data is set
  var answersDiv = $('#answers');
  if (data.answers == null) {
    var textDiv = $('<input>');
    textDiv.addClass("pollInput");
    textDiv.css('font-size', 16);
    textDiv.focus();
    answersDiv.append(textDiv);

    var submitDiv = $('<div>').text('Submit');
    submitDiv.addClass("pollSubmit");
    submitDiv.on('click', function() {
      incrKeyValue(data.id, textDiv.val(), +1);
      submitDiv.css('background-color', '#D0D0D0');
      submitDiv.css('color', '#A6A6A6');
      submitDiv.text('Submitted');
      submitDiv.off('click');
      textDiv.css('background-color', '#EEEEEE');
      textDiv.prop('disabled', true);
    });
    answersDiv.append(submitDiv);

    textDiv.keypress(function(e) {
      if (e.which == 13) {
        e.preventDefault();
        submitDiv.focus().click();
      }
    });
    textDiv.focus();
  } else {
    var selectColor = '#B9D48B';
    var unselectColor = 'white';

    var answerDivs = [];

    var selected = [];  // i -> whether i is selected
    function select(i) {
      if (selected[i]) throw 'Already selected';
      selected[i] = true;
      answerDivs[i].css('background-color', selectColor);
      incrKeyValue(data.id, data.answers[i], +1);
    }
    function unselect(i) {
      if (!selected[i]) throw 'Not selected';
      selected[i] = false;
      answerDivs[i].css('background-color', unselectColor);
      incrKeyValue(data.id, data.answers[i], -1);
    }
    function unselectAll() {
      for (var i = 0; i < data.answers.length; i++)
        if (selected[i])
          unselect(i);
    }

    function setupAnswer(i) {
      var ans = data.answers[i];
      var div = $('<div>').text(ans);
      div.each(typeset);
      div.css('border-style', 'solid');
      div.css('cursor', 'pointer');
      if (selected[i]) div.css('background-color', selectColor);
      answerDivs.push(div);
      answersDiv.append(div);

      div.on('click', function() {
        if (data.allowMultipleAnswers) {
          if (!selected[i]) select(i);
          else unselect(i);
        } else {
          if (selected[i]) return;
          unselectAll();
          select(i);
        }
      });
    }

    for (var i = 0; i < data.answers.length; i++)
      setupAnswer(i);
  }
}
