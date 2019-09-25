$(function () {
  var projectsDiv = $('#projects');
  for (var i = 0; i < reports.length; i++) {
    var project = reports[i];
    if (project.private) {
      continue;
    }
    var projectDiv = $('<div>').addClass('project').addClass(i % 2 == 0 ? 'even' : 'odd');
    projectsDiv.append(projectDiv);

    var buttons = $('<div>', {class: 'buttonbox'});
    projectDiv.append(buttons);

    // Make link clickable if 
    var titleDiv = $('<div>').addClass('titlebar').append($('<a>').addClass('title').append(project.title).attr('href', 'restricted/reports/' + project.user + '/final.pdf'));
    
    projectDiv.append(titleDiv);

    var authorDiv = $('<div>').addClass('authorbar').append($('<span>').addClass('author').append(
      project.group.map(function(member) { return member.name; }).join(', ')));
    projectDiv.append(authorDiv);

    var mentorDiv = $('<div>').addClass('mentorbar').append($('<span>').addClass('mentor').append(
      'Mentor: ' + project.mentor.name));
    projectDiv.append(mentorDiv);
  }
});
