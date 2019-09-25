var serverSide = (typeof global != 'undefined');

var courseName = 'CS221';
var submissionsPath = '/afs/ir.stanford.edu/class/cs221/submissions/';

function eventsOnLoad() {
  // Note: represent all dates as integers.
  function parseDate(date) {
    if (typeof(date) == 'number') return date;  // Already converted
    return Date.parse(date);  // Need to convert
  }

  var firstDateOfClass = parseDate("Apr 03 2018");  // UPDATE
  var todayDate = Date.now();

  function advanceDate(date, numDays) {
    var newDate = new Date(date);
    newDate.setDate(newDate.getDate() + numDays);
    return newDate.getTime();
  }

  var monthNames = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ');
  var dayNames = 'Sun Mon Tue Wed Thu Fri Sat'.split(' ');
  function formatDate(date) {
    date = new Date(date);
    return dayNames[date.getDay()] + ' ' + monthNames[date.getMonth()] + ' ' + date.getDate();
  }

  var currentDate = firstDateOfClass;  // Beginning of the term
  var currentWeek = 0;
  var beginWeek = null;
  function nextClass(n) {
    currentDate = advanceDate(currentDate, n);
    beginWeek = new Date(currentDate).getDay() == 1;  // Monday
    if (beginWeek) currentWeek++;
  }

  // For the schedule
  var schedule = [];
  schedule.push(['', 'Day'.bold(), 'Topic'.bold(), 'Slides'.bold(), 'Events'.bold(), 'Deadlines'.bold()]);

  var horizontalLine = '<td colspan="5"><hr/></td>';
  function section(title, subtitle) {
    schedule.push(['', horizontalLine]);
    schedule.push(['', '', '<h3 style="color:#820000">[' + title + ']</h3><br/>' + subtitle.italics(), '', '']);
  }

  var lastDate = null;
  var passedToday = false;
  function disableItem(title, name, extraLinks, pdfOnly) {
    _item(title, name, extraLinks, pdfOnly, false);
  }
  function enableItem(title, name, extraLinks, pdfOnly) {
    _item(title, name, extraLinks, pdfOnly, true);
  }
  function _item(title, name, extraLinks, pdfOnly, enableLinks) {
    var dateStr;
    if (lastDate == currentDate) {  // Still on the same date, don't do anything new
      date = '';
      dateStr = '';
    } else {
      date = currentDate;
      dateStr = formatDate(currentDate);
      lastDate = currentDate;
    }

    var jsUrl = 'lectures/index.html#include=' + name + '.js';
    var pdfUrl = 'lectures/' + name + '.pdf';
    var smallPdfUrl = 'lectures/' + name + '-6pp.pdf';
    var oneUrl = 'lectures/index.html#include=' + name + '.js&mode=print1pp';
    var outlineUrl = 'lectures/index.html#include=' + name + '.js&mode=outline';
    var dayColor = 'green';

    var todayStr = formatDate(todayDate);
    var formattedDateStr = dateStr;
    if (!passedToday) {
      if (todayStr == dateStr) {
        formattedDateStr = (dateStr + ' (today)').fontcolor(dayColor).bold();
        passedToday = true;
      } else if (currentDate > todayDate) {
        schedule.push(['', (todayStr + ' (today)').fontcolor(dayColor).bold()]);
        passedToday = true;
      }
    }

    if (beginWeek && dateStr != '')
      formattedDateStr += '<br/>' + ('(week ' + currentWeek + ')').fontcolor(dayColor);

    var titleStr = (enableLinks ? '<a href="'+jsUrl+'" target="_blank">'+title+'</a>' : title);

    if (pdfOnly) titleStr = title;

    var linksStr = '';
    if (enableLinks) {
      var links = [];
      if (name) {
        if (!pdfOnly) links.push('<a class="pdfLink" href="'+oneUrl+'" target="_blank">[one page]</a>');
        if (!pdfOnly) links.push('<a class="pdfLink" href="'+outlineUrl+'" target="_blank">[text outline]</a>');
        links.push('<span class="pdfLink">[pdf:<a href="'+pdfUrl+'" target="_blank">1pp</a>,<a href="'+smallPdfUrl+'" target="_blank">6pp</a>]</span>');
      }
      if (extraLinks) extraLinks.forEach(function(l) { links.push(l); });
      linksStr = links.join('<br/>');
    }

    if (formattedDateStr != '') {
      schedule.push([date, formattedDateStr, titleStr, linksStr, '']);
    } else {
      // Just piggyback off of the last row
      var row = schedule[schedule.length-1];
      row[2] += '<br/>' + titleStr;
      row[3] += '<br/>' + linksStr;
    }
  }

  function demoLink(name) {
    return '<a href="lectures/index.html#include='+name+'.js" class="pdfLink" target="_blank">[demo]</a>';
  }

  var events = {};  // date => list of events
  var deadlines = {};  // deate => list of deadlines
  function addEvent(date, title) {
    date = parseDate(date);
    var list = events[date];
    if (!list) events[date] = list = [];
    list.push(title);
  }
  function addDeadline(date, title) {
    date = parseDate(date);
    var list = deadlines[date];
    if (!list) deadlines[date] = list = [];
    list.push(title);
  }

  function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  var homeworks = [];
  var projects = [];
  var assignments = [];  // For generating submit.conf

  function disableHomework(name, title, numDaysTillDueDate) {
    _homework(name, title, numDaysTillDueDate, false, false);
  }
  function openHomework(name, title, numDaysTillDueDate) {
    _homework(name, title, numDaysTillDueDate, true, false);
  }
  function closedHomework(name, title, numDaysTillDueDate) {
    _homework(name, title, numDaysTillDueDate, true, true);
  }

  function _homework(name, title, numDaysTillDueDate, enableLinks, enableSoln) {
    if (!numDaysTillDueDate) numDaysTillDueDate = 8;
    var outDate = currentDate;
    var dueDate = advanceDate(currentDate, numDaysTillDueDate);

    var renderedName;
    if (enableLinks) {
      renderedName = '<a href="assignments/' + name + '/index.html">'+name+'</a> (<a href="assignments/' + name + '.zip">zip</a>)';
    } else {
      renderedName = name;
    }
    renderedName = '[' + renderedName + ']';
    addEvent(outDate, renderedName + ' ' + 'out'.fontcolor('green').bold());
    addDeadline(dueDate, renderedName + ' ' + 'due'.fontcolor('red').bold());

    if (enableLinks) {
      renderedName = '<a href="assignments/' + name + '/index.html">' + title + ' [' + name + ']</a> (<a href="assignments/' + name + '.zip">zip</a>)';
      if (enableSoln)
        renderedName += ' (<a href="restricted/assignments/' + name + '/index.html">solutions</a>)';
    } else {
      renderedName = title + ' [' + name + ']';
    }

    renderedName = '<span style="width:25em;display:inline-block">' + renderedName + '</span>';
    renderedName += ' (due <strong>' + formatDate(dueDate) + '</strong>)';
    homeworks.push(renderedName);

    var files = ['submission.py', name + '.pdf'];
    assignments.push([name, title, dueDate, files]);
  }

  function project(name, title, numDaysTillDueDate) {
    if (!numDaysTillDueDate) numDaysTillDueDate = 8;
    var outDate = currentDate;
    var dueDate = advanceDate(currentDate, numDaysTillDueDate);

    var renderedName = '<a href="project.html#'+name+'">'+name+'</a>';
    addEvent(outDate, renderedName + ' ' + 'out'.fontcolor('green').bold());
    addDeadline(dueDate, renderedName + ' ' + 'due'.fontcolor('red').bold());

    renderedName = '<a href="project.html#'+name+'">'+title+' ['+name+']</a>';
    renderedName = '<span style="width:25em;display:inline-block">' + renderedName + '</span>';
    renderedName += '(due <strong>' + formatDate(dueDate) + '</strong>)';
    projects.push(renderedName);

    var files = [];
    if (name === 'p-peer')
      files.push(name.replace(/^p-/, '') + '.txt');
    else
      files.push(name.replace(/^p-/, '') + '.pdf');
    if (name != 'p-peer') {
      files.push('group.txt');
      files.push('title.txt');
    }
    if (name === 'p-proposal') {
      files.push('keywords.txt');
      files.push('cas.txt');
    }
    if (name === 'p-final') {
      files.push('code.zip');
      files.push('data.zip');
    }
    assignments.push([name, title, dueDate, files]);
  }

  function writeToHtml() {
    var hitDates = {};
    for (var i = 0; i < schedule.length; i++) {
      var tr = document.createElement('tr');
      var dateStr = schedule[i][0];
      hitDates[dateStr] = true;
    }

    // Insert events and deadlines into the schedule
    function insert(map, col) {
      for (var newDate in map) {
        newDate = parseInt(newDate);  // Javascript turns all keys into strings
        var newValue = map[newDate].join('<br/>');
        var added = false;
        for (var i = 0; i < schedule.length; i++) {
          var date = schedule[i][0];
          if (date == newDate) {
            schedule[i][col] = newValue;
            added = true;
            break;
          } else if (date > newDate) {
            var row = [newDate, formatDate(newDate), '', '', ''];
            row[col] = newValue;
            schedule.splice(i, 0, row);  // Insert
            added = true;
            break;
          }
        }
        if (!added) {
          var row = [newDate, formatDate(newDate), '', '', ''];
          row[col] = newValue;
          schedule.push(row);
        }
      }
    }
    insert(events, 4);
    insert(deadlines, 5);

    // Add things to the schedule
    var div = $('#scheduletable');
    var table = $('<table>');
    for (var i = 0; i < schedule.length; i++) {
      var tr = $('<tr>').addClass('highlightOnHover');
      var row = schedule[i].slice(1);
      for (var j = 0; j < 5; j++) {
        tr.append($('<td>').append(row[j]));
      }
      table.append(tr);
    }
    div.append(table);

    // Add things to homeworks
    var div = $('#homeworks');
    var ul = $('<ul>').appendTo(div);
    homeworks.forEach(function(text) {
      ul.append($('<li>').html(text));
    });
    div.append($('<br>'));

    // Add things to projects
    var div = $('#projects');
    var ul = $('<ul>').appendTo(div);
    projects.forEach(function(text) {
      ul.append($('<li>').html(text));
    });
  }

  function sectionLink(file, text) {
    return '<span class="pdflink">[<a href="sections/' + file + '">' + text + '</a>]</span>';
  }

  ////////////////////////////////////////////////////////////
  // https://registrar.stanford.edu/resources-and-help/stanford-academic-calendar

  addEvent('Apr 20 2018', 'Drop date');  // UPDATE
  addEvent('May 29 2018', 'Exam'.fontcolor('brown').bold());  // UPDATE
  addEvent('Jun 06 2018', 'Poster Session'.fontcolor('brown').bold());  // UPDATE

  section('Introduction', 'What can AI do for you?  What do you need for this class?');

  nextClass(0);
  enableItem('Overview of course<br>Optimization', 'overview');
  closedHomework('foundations', 'Foundations');

  nextClass(2);
  section('Machine learning', 'Don\'t manually code it up, learn it from examples...');
  enableItem('Linear classification<br>Loss minimization<br>Stochastic gradient descent', 'learning1', [demoLink('learning-demo')]);
  nextClass(1);
  enableItem('Section: optimization, probability, Python (review)', null, [sectionLink('section1.pdf', 'slides'), sectionLink('section1-extra.html', 'extra material'), sectionLink('section1-extra.ipynb', 'Jupyter notebook')], true);
  nextClass(4);

  closedHomework('sentiment', 'Sentiment classification');
  enableItem('Features and non-linearity<br>Neural networks, nearest neighbors', 'learning2');
  nextClass(2);
  enableItem('Generalization<br>Unsupervised learning, K-means', 'learning3');
  nextClass(1);
  enableItem('Section: recurrent neural networks (advanced)', null, [sectionLink('section2.pdf', 'slides')], true);
  nextClass(4);

  section('Search', 'Problem solving as finding paths in graphs...');

  enableItem('Tree search<br>Dynamic programming, uniform cost search', 'search1');
  closedHomework('reconstruct', 'Text reconstruction');


  nextClass(2);
  enableItem('A*, consistent heuristics<br>Relaxation', 'search2');
  nextClass(1);
  enableItem('Section: dynamic programming (examples)', null, [sectionLink('section3.pdf', 'slides')], true);
  nextClass(4);

  section('Markov decision processes', 'When nature intervenes randomly...');
  enableItem('Policy evaluation, policy improvement<br>Policy iteration, value iteration', 'mdp1');
  closedHomework('blackjack', 'Blackjack');
  project('p-proposal', 'Project proposal', 10);
  nextClass(2);
  enableItem('Reinforcement learning<br>Monte Carlo, SARSA, Q-learning<br>Exploration/exploitation, function approximation', 'mdp2');
  nextClass(1);
  enableItem('Section: MDP and reinforcement learning review', null, [sectionLink('section4.pdf', 'slides')], true);
  nextClass(4);

  section('Game playing', 'When an adversary intervenes...');
  closedHomework('pacman', 'Pac-Man');
  enableItem('Minimax, expectimax<br>Evaluation functions<br>Alpha-beta pruning', 'games1');
  nextClass(2);
  enableItem('TD learning<br>Game theory', 'games2');
  nextClass(1);
  enableItem('Section: AlphaGo (advanced)', null, [sectionLink('section5.pdf', 'slides')], true);
  nextClass(4);

  section('Constraint satisfaction problems', 'Problem solving as assigning variables (with constraints)...');
  closedHomework('scheduling', 'Course scheduling');
  enableItem('Factor graphs<br>Backtracking search<br>Dynamic ordering, arc consistency', 'csp1', [demoLink('inference-demo')]);
  nextClass(2);
  enableItem('Beam search, local search<br>Conditional independence, variable elimination', 'csp2');
  nextClass(1);
  enableItem('Section: CSPs (review)', null, [sectionLink('section6.pdf', 'slides')], true);
  nextClass(4);

  section('Bayesian networks', 'Representing uncertainty with probabilities...');
  enableItem('Bayesian inference<br>Marginal independence<br>Hidden Markov models', 'bayes1');
  closedHomework('car', 'Car tracking');
  project('p-progress', 'Project progress report', 10);
  nextClass(2);
  enableItem('Forward-backward<br>Gibbs sampling<br>Particle filtering', 'bayes2');
  nextClass(1);
  enableItem('Section: variational autoencoders (advanced)', null, [sectionLink('section7.pdf', 'slides')], true);
  nextClass(4);
  enableItem('Learning Bayesian networks<br>Laplace smoothing<br>Expectation Maximization', 'bayes3');
  nextClass(2);

  section('Logic', 'More expressive models...');
  enableItem('Syntax versus semantics<br>Propositional logic<br>Horn clauses', 'logic1');

  openHomework('logic', 'Language and logic');
  nextClass(1);
  enableItem('Section: exam review (practice problems)', null, [sectionLink('section8.pdf', 'slides')], true);
  nextClass(4);

  project('p-poster', 'Project poster session', 7);
  disableItem('First-order logic<br>Resolution', 'logic2');
  nextClass(2);

  section('Conclusion', 'Reflections and prospects...');
  disableItem('Deep learning<br>autoencoders, CNNs, RNNs', 'deep');
  nextClass(1);
  disableItem('Section: semantic parsing (advanced)', null, [sectionLink('section9.pdf', 'slides')], true);
  disableItem('Higher-order logics<br>Markov logic<br>Semantic parsing', 'logic3');
  nextClass(4);

  project('p-peer', 'Project poster session (peer review)', 3);
  project('p-final', 'Project final report', 6);
  disableItem('Summary, future of AI', 'conclusion');

  // Write specification to submit.json
  if (serverSide) {
    const assignmentsList = assignments.map(function (assign) {
      const id = assign[0];
      const title = assign[1];
      const dueDateObj = new Date(assign[2]);
      const dueDate = (dueDateObj.getYear() + 1900) + '-' + (dueDateObj.getMonth() + 1) + '-' + dueDateObj.getDate() + ' 23:01';
      const files = assign[3];
      const maxLateDays = id === 'p-final' ? 0 : 2;  // No late days for the final report
      return {id: id, title: title, dueDate: dueDate, files: files, maxLateDays: maxLateDays, maxSubmissions: 10, maxFileSizeMB: 20};
    });
    const root = {courseName: courseName, submissionsPath: submissionsPath, assignments: assignmentsList};
    console.log(JSON.stringify(root));
  } else {
    writeToHtml();
  }
}

if (serverSide)
  eventsOnLoad();
