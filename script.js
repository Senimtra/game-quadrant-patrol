/*
######################################
## JS Canvas Game - Quadrant Patrol ##
###################################### */

// ### Retrieve element nodes ###
const canvasElement = document.querySelector('canvas');
const startButtonElement = document.querySelector('#start-game');
const resumeButtonElement = document.querySelector('#resume-game');
const introScreenElement = document.querySelector('#intro');

// ### Create new game instance ###
const game = new Game(canvasElement);

// ### Start button ###
startButtonElement.addEventListener('click', () => {
   introScreenElement.style.display = 'none';
   canvasElement.style.display = 'block';
   game.start();
});

// ### Resume button ###
resumeButtonElement.addEventListener('click', () => {
   if (game.player) {
      introScreenElement.style.display = 'none';
      canvasElement.style.display = 'block';
      game.paused = false;
      game.clock();
   }
})
