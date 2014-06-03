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
        score : 0
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
      console.log($scope.winners);
      //calculate elo and post to server.

      var winners = $scope.winners;
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
    };

  });
