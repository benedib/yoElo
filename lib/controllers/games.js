'use strict';

var mongoose = require('mongoose'),
    Game = mongoose.model('Game');


/**
* Get all games
*/

exports.allGames = function(req, res) {
  return Game.find(function (err, games) {
    if (!err) {
      return res.json(games);
    } else {
      return res.send(err);
    }
  });
};


/**
 * Create game
 */
exports.create = function (req, res, next) {
    return Game.create(req.body, function(err, games) {
      if (!err) {
        return res.json(games);
      } else {
        return res.send(err);
      }
    });
};

/**
 * Show game
 */
exports.show = function(req, res, next) {
  // console.log(req.params.id);
  var gameId = req.params.id;
  Game.findById(gameId, function(err, game) {
    if (err) return next(err);
    if (!game) return res.send(404);

    res.send(game);
  });
};

exports.addPlayer = function(req, res, next) {
  var gameId = req.params.id;
  console.log(req.body);
  Game.findById(gameId, function(err, game) {
    if (err) return next(err);
    if (!game) return res.send(404);

    //add player to game
    game.players.push(req.body);
    game.save(function(err) {
      if (err) return res.send(400);

      res.send(200);
    });

  });
};

exports.updateScore = function(req, res, next) {
  var gameId = req.params.id;
  Game.findById(gameId, function(err, game) {
    if (err) return next(err);
    if (!game) return res.send(404);

    //go through all players in game and find the correct one
    for (var i = 0; i < game.players.length; i++) {

      if (req.body.email === game.players[i].email) {
        game.players[i].score = req.body.score;
        game.players[i].gamesPlayed = req.body.gamesPlayed;
      }
    }
    game.save(function(err) {
      if (err) return res.send(400);

      res.send(200);
    });
  });
};
