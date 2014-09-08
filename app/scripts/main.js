var parseMilliseconds = function(ms) {

  console.log('ms', ms);

      ms = Math.abs(ms); // flip to positive integer

      var x, seconds, minutes, hours;

      x = ms / 1000;
      seconds = Math.round(x % 60);

      x /= 60;
      minutes = Math.round(x % 60);
      minutes = (minutes < 1) ? '00' : minutes;


      x /= 60;
      hours = Math.round(x % 60);
      hours = (hours < 1) ? '00' : hours;

      return {
        hours: hours,
        minutes: minutes,
        seconds: seconds
      };
    };


    var timeCompletedString = function(ms) {
      var parts       = parseMilliseconds(ms);
      var minutesStr  = parts.minutes.toString();
      var secondsStr  = parts.seconds.toString();
      var hoursStr    = parts.hours.toString();

      hoursStr   = (hoursStr.length === 1)    ? '0'+hoursStr    : hoursStr;
      minutesStr = (minutesStr.length === 1)  ? '0'+minutesStr  : minutesStr;
      secondsStr = (secondsStr.length === 1)  ? '0'+secondsStr  : secondsStr;

      return hoursStr+ ':' + minutesStr + ':' + secondsStr;
    };


var filterData = function(data) {

    var array = [];

    for ( var e = 0; e < data.length; e++ ) {
      if (data[e] !== null && typeof data[e].badgesCount !== "undefined" ) {
            array.push(data[e]);
        }
    }

    return array;
};

var orderLeaderboard = function(dataArray) {

      // sort completed first
      dataArray.sort(function(a,b){

        // A is compeleted, B is NOT
        if (a.completed && !b.completed) {
          return -1;
        }
        else if (!a.completed && b.completed) { // A is NOT compeleted, B is completed
          return 1;
        }

        else if (!a.completed && !b.completed) { // A and B is not completed
          if (a.badgesCount === b.badgesCount) {
            return 0;
          }
          return (a.badgesCount > b.badgesCount) ? -1 : 1;
        }

        else if (a.completed && b.completed) { // A & B are completed

          // Finished at the same time
          if (a.completedIn === b.completedIn) {
            return 0;
          }

          // return based on completed time order
          return (a.completedIn < b.completedIn) ? -1 : 1;
        }

      });

      return dataArray;
    };

var updateLeaderboard = function(snapshot)
{
  var data = snapshot.val();
  var array = $.map(data, function(value, index) {
    return [value];
  });
  var playerCount = array.length;
  array = array.splice(0,11);
  array = filterData(array);
  array = orderLeaderboard(array);

  var leaderboardScores = $("#leaderboardScores");

  // Empty Leaderboard
  $("#leaderboardScores tr").remove();


  var fragment = $(document.createDocumentFragment());

  for ( var e = 0; e < array.length; e++ ) {
    var player = array[e];
    var score, completeClass = '';

    if (!player.completed) {
      score = '<td class="performance">'+player.badgesCount+'</td>';
    } else {
      completeClass = 'complete';
      score = '<td class="performance"><span class="completed-time">'+timeCompletedString(player.completedIn)+' <i class="fa fa-check"></i></td>';
    }


    var row = $('<tr class="'+completeClass+'"><td class="place">'+(e+1)+'</td><td class="player">'+player.name+'</td><td>'+score+'</td></tr>');
    fragment.append( row );
  }

  leaderboardScores.append(fragment);

  $("#playerCount").html(playerCount);
};





var usersRef = new Firebase('https://scorching-inferno-1379.firebaseio.com/users');

usersRef.on('value', updateLeaderboard, false);
