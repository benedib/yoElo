'use strict';

angular.module('yoEloApp')
  .factory('Session', function ($resource) {
    return $resource('/api/session/');
  });
