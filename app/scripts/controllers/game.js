'use strict';

angular.module('yoEloApp')
  .controller('GameCtrl', function ($scope, $http, $routeParams, $modal) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];

    // $('#myModal').appendTo('body');

    // console.log($routeParams.gameId);
    function populatePlayers() {
      $http.get('/api/games/' + $routeParams.gameId).success(function(data) {
        console.log(data);
        $scope.game = data;
        $scope.playerList = data.players;
      });
    }

    populatePlayers();

    $scope.winners = [];

    function postGame(winners) {
      console.log('winners array');
      //calculate elo and post to server.
      console.log(winners);



      var players = winners;

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

    }


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
    };


    $scope.open = function (size) {

      var modalInstance = $modal.open({
        templateUrl: 'myModalContent.html',
        controller: ModalInstanceCtrl,
        size: size,
        resolve: {
          players: function () {
            return $scope.playerList;
          },
          gameId: function() {
            return $routeParams.gameId;
          }
        }
      });

      modalInstance.result.then(function (winners) {
        console.log(winners);

        if (winners === 'new') {
          setTimeout(function() {
            $scope.open();
          }, 200);
        } else {
          postGame(winners);
        }


      });

    };

    var ModalInstanceCtrl = function ($scope, $modalInstance, players, gameId) {

      $scope.winners = [];
      $scope.playerList = players;
      $scope.selected = undefined;
      // $scope.newPlayerEmail = '';
      console.log(gameId);

      $scope.ok = function () {
        $modalInstance.close($scope.winners);
      };

      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };

      $scope.addToWinners = function() {
        // console.log($scope.selected);
        var found = false;
        var s = $('#selectedPlayer').val();

        console.log(s);

        if (validateEmail(s)) {
          for (var i=0; i < $scope.playerList.length; i++) {
            if ($scope.playerList[i].email === s) {
              found = true;
              console.log('add to winners');
              $scope.winners.push($scope.playerList[i]);
              break;
            }
          }

          if (!found) {
            //breyta i eitthvad fallegra!!!
            if (confirm('Player not found do you wish to add ' + s  + '?')) {
              console.log('add ');
              addPlayerToGame(s);

            }
          }
          $scope.errorMsg = '';
        } else {
          $scope.errorMsg = 'Not valid email';
          console.log('not valid email');
        }



        $('#selectedPlayer').val('');
        // console.log($scope.winners);
      };

      function addPlayerToGame(email) {
        console.log('Add');
        // var p = $('#player-email').val();
        // console.log(p.length);

        var player = {
          email : email,
          score : 1500
        };

        if (validateEmail(email)) {
          $http.put('/api/games/' + gameId, player).success(function(data) {
            console.log(data);
            if (data === 'OK') {
              populatePlayers();
              $modalInstance.close('new');
            }

          });
          $scope.errorMsg = '';
        } else {
          $scope.errorMsg = 'Not valid email';
          console.log('ekki email');
        }
      }

      function validateEmail(email) {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
      }

    };


  });
