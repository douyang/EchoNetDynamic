$(function () {
  var projectsDiv = $('#projects');
  for (var i = 0; i < projects.length; i++) {
    var project = projects[i];
    var projectDiv = $('<div>').addClass('project').addClass(i % 2 == 0 ? 'even' : 'odd');
    projectsDiv.append(projectDiv);

    var buttons = $('<div>', {class: 'buttonbox'});
    // buttons.append($('<a>', {class: 'poster', href: "restricted/posters/" + project.user + '/poster.pdf'}).append('poster'));
    //buttons.append($('<a>', {class: 'report', href: project.sunetid + '-report.pdf'}).append('report'));
    projectDiv.append(buttons);

    // var titleDiv = $('<div>').addClass('titlebar').append($('<span>').addClass('title').append(project.title));
    var titleDiv = $('<div>').addClass('titlebar').append($('<a>').addClass('title').append(project.title).attr('href', 'restricted/posters/' + project.user + '/poster.pdf'));
    projectDiv.append(titleDiv);

    var sessionDiv = $('<div>').addClass('session').append($('<span>').addClass('author').append(
      project.session));
    buttons.append(sessionDiv);

    var authorDiv = $('<div>').addClass('authorbar').append($('<span>').addClass('author').append(
      project.group.map(function(member) { return member.name; }).join(', ')));
    projectDiv.append(authorDiv);

    var mentorDiv = $('<div>').addClass('mentorbar').append($('<span>').addClass('mentor').append(
      'Mentor: ' + project.mentor.name));
    projectDiv.append(mentorDiv);
  }
});
