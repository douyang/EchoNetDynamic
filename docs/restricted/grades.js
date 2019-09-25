const urlParams = decodeUrlParams(window.location.search);
if (!urlParams.sunetId) {
  const sunetId = prompt('Enter your SUNet ID (e.g., psl):');
  window.location = encodeUrlParams({sunetId});
}

if (window.location.href.startsWith('file')) {
  loadScript('../../cs221.afs/www/restricted/grades/' + urlParams.sunetId + '/data.js', onload, onerror);
} else {
  loadScript('../restricted/grades/' + urlParams.sunetId + '/data.js', onload, onerror);
}

const $main = $('#main');

function onload() {
  console.log('COURSE', course);
  console.log('STUDENT', student);
  const name = student.firstName + ' ' + student.lastName + ' (' + student.sunetId + ')';

  $('#title').append(': ' + name + (urlParams.assignments ? ' / ' + urlParams.assignmentId : ''));

  // Render summary of all assignments
  const keys = ['assignmentId', 'attempt', 'timestamp', 'pdfPages', 'totalPoints', 'maxTotalPoints', 'totalExtraCredit', 'lateDays', 'penaltyFactor'];
  const rows = course.assignments.filter(assign => !urlParams.assignmentId || assign.id === urlParams.assignmentId).map(assign => {
    const attemptSubmissions = student.assignments[assign.id];
    if (!attemptSubmissions)
      return {assignmentId: assign.id};
    const maxTotalPoints = assign.parts.filter((part) => !part.extraCredit).map((part) => part.maxPoints).reduce((a, b) => a + b, 0);
    const submission = Object.values(attemptSubmissions)[0];
    return Object.assign({maxTotalPoints}, submission, submission.metadata);
  });
  const renderers = {
    assignmentId: (assignmentId) => {
      return $('<a>', {href: encodeUrlParams({sunetId: urlParams.sunetId, assignmentId})}).append(assignmentId);
    },
    timestamp: renderTimestamp,
  };
  $main.append(renderTable(keys, rows, renderers));

  if (urlParams.assignmentId) {
    // Render particular assignment
    const keys = ['partName', 'description', 'points', 'maxPoints', 'seconds', 'messages', 'grader'];
    const submission = Object.values(student.assignments[urlParams.assignmentId])[0];
    const assign = course.assignments.filter((assign) => urlParams.assignmentId === assign.id)[0];
    const rows = assign.parts.map((part) => {
      const gradingPart = submission.parts && submission.parts[part.name];
      const messages1 = (gradingPart && gradingPart.rubric ? gradingPart.rubric.messages : []);
      const messages2 = (gradingPart && gradingPart.messages ? gradingPart.messages : []);

      const points = gradingPart && (gradingPart.points !== undefined ? gradingPart.points : gradingPart.rubric.points);
      return {
        partName: part.name,
        description: part.description,
        points: gradingPart && (points + '').fontcolor(points == part.maxPoints ? 'green' : 'red'),
        maxPoints: part.maxPoints + (part.extraCredit ? ' (extra credit)' : ''),
        seconds: gradingPart && gradingPart.seconds,
        messages: messages1.concat(messages2).join('<br>'),
        grader: gradingPart.caSunetId,
      };
    });
    const renderers = {};
    $main.append(renderTable(keys, rows, renderers));
  }
}

function onerror() {
  $main.append($('<div>').addClass('alert alert-danger').append('You do not have permissions.'));
}
