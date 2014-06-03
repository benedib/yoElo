'use strict';

angular.module('yoEloApp')
  .controller('NavbarCtrl', function ($scope, $location, $http, Auth) {
    // $scope.menu = [{
    //   'title': 'Home',
    //   'link': '/'
    // }, {
    //   'title': 'Settings',
    //   'link': '/settings'
    // }];

    $scope.logout = function() {
      Auth.logout()
      .then(function() {
        $location.path('/login');
      });
    };

    $scope.showGame = function(id) {
      // console.log(id);
      $location.path('/game/' + id);
    };

    $scope.isActive = function(route) {
      // console.log('/game/' + route);
      // console.log($location.path());
      return '/game/' + route === $location.path();
    };

    $('.toggle-nav').click(function() {
      console.log('click');
      toogleNav();
    });

    function toogleNav() {
      // Calling a function in case you want to expand upon this.
      if ($('#site-wrapper').hasClass('show-nav')) {
        // Do things on Nav Close
        $('#site-wrapper').removeClass('show-nav');
      } else {
        // Do things on Nav Open
        $('#site-wrapper').addClass('show-nav');
      }
    }

    function populateGames() {

      $http.get('/api/games').success(function(data) {
        // console.log(data);
        $scope.menu = data;
      });
    }

    populateGames();

    $scope.addGame = function() {
      // console.log($scope.gameName);
      $http.post('/api/games', { name: $scope.gameName, players:[] }).success(function(data) {
        console.log(data);
        $scope.gameName = '';
        populateGames();
      });
    };

  });
