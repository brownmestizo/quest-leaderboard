'use strict';

angular.module('angularApp')
  .service('LeaderboardService', ['$q', '$rootScope', '$firebase', function LeaderboardService($q, $rootScope, $firebase) {

    var filterData = function(data) {

        var array = [];

        angular.forEach(data,function(value){
            if (value !== null && angular.isDefined(value.badgesCount)) {
                array.push(value);
            }
        });

        return array;
    };



    var setPlayerAsMe = function(dataArray, playerName) {

      angular.forEach(dataArray,function(value,idx){
        if (value.name === playerName ) {
          dataArray[idx].me = true;
        }
      });

      return dataArray;
    };


    /**
     * Order the leaderboard
     * @param  {[array]} dataArray [description]
     * @return {[array]}           [array or ordered data]
     */
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


    var getFirebaseData = function() {
      var sync = $firebase($rootScope.firebaseRef);

      return sync.$asObject();
    };



    var getLeaderboard = function() {

      var deferred  = $q.defer();
      var data      = getFirebaseData();

      data.$loaded(function(){
        var arrayData   = filterData(data.users);
        var orderedData = orderLeaderboard(arrayData);

        deferred.resolve(orderedData);
      });

      return deferred.promise;
    };


    var getPlayerPosition = function(playerName) {

      var deferred  = $q.defer();
      var data      = getFirebaseData();

      data.$loaded(function(){

        var count       = 0;
        var position    = 0;
        var arrayData   = filterData(data.users);
        var orderedData = orderLeaderboard(arrayData);
        orderedData = setPlayerAsMe(orderedData, playerName);

        angular.forEach(orderedData,function(value){
          count++;
          if (playerName === value.name) {
            position = count;
            return;
          }
        });

        deferred.resolve(position);
      });

      return deferred.promise;
    };



    return {
      get: getLeaderboard,
      getPlayerPosition: getPlayerPosition,
      setPlayerAsMe: setPlayerAsMe
    };

  }]);
