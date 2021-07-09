/*
######################################
## JS Canvas Game - Quadrant Patrol ##
###################################### */

// ### retrieve the canvas node ###
const canvasElement = document.querySelector('canvas');

// ### create new game instance ###
const game = new Game(canvasElement);

// ### start the game ###
game.start();
