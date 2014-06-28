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

      angular.forEach(winners, function(winner, count) {
        console.log(count);
        console.log(winner);
        winner.score += 10;
        $http.put('/api/games/score/' + $routeParams.gameId, winner).success(function(data) {
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
          score : 0
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
