'use strict';

angular.module('yoEloApp')
  .controller('GameCtrl', function ($scope, $http, $routeParams) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
    $('#myModal').appendTo('body');
    // console.log($routeParams.gameId);
    function populatePlayers() {
      $http.get('/api/games/' + $routeParams.gameId).success(function(data) {
        console.log(data);
        $scope.game = data;
        $scope.playerList = data.players;
      });
    }

    populatePlayers();

    $scope.addPlayerToGame = function() {
      console.log('Add');
      var player = {
        email : $scope.newPlayerEmail,
        score : 1500
      };
      $http.put('/api/games/' + $routeParams.gameId, player).success(function(data) {
        console.log(data);
        if (data === 'OK') {
          populatePlayers();
          $scope.newPlayerEmail = '';
        }

      });
    };

    $scope.winners = [];

    $scope.postGame = function() {
      //console.log($scope.winners);
      //calculate elo and post to server.

      var players = $scope.winners;

      angular.forEach(players, function(currentPlayer, i) {
          var eloChange = 0;

          var winningTeams = players.slice(0,i);
          var losingTeams = players.slice(i+1);

          angular.forEach(winningTeams, function(currentWinner) {
            eloChange += calculateWin(currentPlayer, currentWinner, false);
          });

          angular.forEach(losingTeams, function(currentLoser) {
            eloChange += calculateWin(currentPlayer, currentLoser, true);
          });

          var oldScore = currentPlayer.score;
          currentPlayer.score += eloChange;

          console.log(
              currentPlayer.email,
              eloChange < 0 ? "loses" : "gains",
              eloChange, "points",
              oldScore, "->", currentPlayer.score);

        $http.put('/api/games/score/' + $routeParams.gameId, currentPlayer).success(function(data) {
          console.log(data);
        });

      } );

      // for (var i = 0; i < winners.length; i++) {
      //   winners[i].score += 10;
      //
        // $http.put('/api/games/score/' + $routeParams.gameId, winners[i]).success(function(data) {
        //   console.log(data);
        // });
      // }
      $scope.winners = [];
      populatePlayers();
    };

        var calculateWin = function (user, opponent, won) {
            var sa = won ? 1 : 0;
            var Ka = calcK(user);
            var Ea = calcE(user.score, opponent.score);
            return Math.round(Ka * (sa - Ea));
        };

        var calcK = function (user) {
            // todo K should depend on how many games user has played.
            // currently this info is unavailable in the user object
            var elo = user.score;
            if (elo < 2100) {
                return 32;
            }
            if (elo < 2400) {
                return 24
            }
            return 16
        };

        var calcE = function (aElo, bElo) {
            var qa = Math.pow(10, aElo / 400);
            var qb = Math.pow(10, bElo / 400);
            return qa / (qa + qb);
        }
  });
