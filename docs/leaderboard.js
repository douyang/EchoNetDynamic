$(function () {
  document.title = leaderboardData.assignmentId + ' leaderboard';

  var users = Object.keys(leaderboardData.items);
  console.log(users.length + ' users');
  users.sort(function(user1, user2) {
    var s1 = leaderboardData.items[user1].score;
    var s2 = leaderboardData.items[user2].score;
    return s2 - s1;
  });
  for (var i = 0; i < users.length; i++)
    leaderboardData.items[users[i]].rank = i + 1;

  function td(x) {
    return $('<td>').append(x);
  }

  var table = $('#leaderboardTable');
  var tr = $('<tr>');
  tr.append(td('Name'.bold()));
  tr.append(td('Rank'.bold()));
  tr.append(td('Score'.bold()));
  tr.append(td('Submission Date'.bold()));
  table.append(tr);

  function formatDatetime(datetime) {
    var d = new Date(datetime * 1000);
    return d.toLocaleString();
  }

  users.forEach(function (user) {
    var tr = $('<tr>');
    var item = leaderboardData.items[user];
    tr.append(td(user));
    tr.append(td(item.rank));
    tr.append(td(Math.round(item.score)));
    tr.append(td(formatDatetime(item.timestamp)));
    table.append(tr);
  });
});
