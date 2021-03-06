/*
######################################
## JS Canvas Game - Quadrant Patrol ##
###################################### */

// ### Retrieve element nodes ###
const gameCanvasElement = document.querySelector('#game-canvas');
const backgroundCanvasElement = document.querySelector('#background-canvas');

const startButtonElement = document.querySelector('#start-game');
const resumeButtonElement = document.querySelector('#resume-game');
const instructionsButtonElement = document.querySelector('#instructions');
const creditsButtonElement = document.querySelector('#credits');
const tryAgainButtonElement = document.querySelector('#try-again');

const introScreenElement = document.querySelector('#intro');
const instructionsScreenElement = document.querySelector('#game-instructions');
const creditsScreenElement = document.querySelector('#game-credits');
const gameOverScreenElement = document.querySelector('#game-over');

// ### Background image ###

const img = new Image();
img.src = './images/background.jpg';

img.onload = function () {
   game.updateBackgroundCanvas()
};

const backgroundImage = {
   img: img,
   x: 0,
   y: 0,
   speed: 0.75,
   move: function () {
      this.y += this.speed;
      this.y %= backgroundCanvasElement.height;
   },
   draw: function () {
      game.contextBg.drawImage(this.img, 0, this.y);
      game.contextBg.drawImage(this.img, 0, this.y - backgroundCanvasElement.height + 1);
      game.contextBg.save();
      // force canvas corners to be transparent due to UI design
      game.contextBg.globalCompositeOperation = 'destination-out';
      game.contextBg.fillRect(0, 0, 500, 60);
      game.contextBg.fillRect(0, 740, 500, 800);
      game.contextBg.restore();
   },
};

// ### Create new game instance ###
const game = new Game(gameCanvasElement, backgroundCanvasElement, backgroundImage);

// ### Enable ESC before game start ###
window.addEventListener('keydown', (event) => {
   if (event.code === 'Escape') {
      introScreenElement.style.display = 'flex';
      instructionsScreenElement.style.display = 'none';
      creditsScreenElement.style.display = 'none';
      gameOverScreenElement.style.display = 'none';
      gameCanvasElement.style.display = 'none';
      backgroundCanvasElement.style.display = 'none';
      musicLevel.pause();
      menuSound.play();
   }
});

// ### Start button ###
startButtonElement.addEventListener('click', () => {
   introScreenElement.style.display = 'none';
   gameCanvasElement.style.display = 'block';
   backgroundCanvasElement.style.display = 'block';
   game.start();
   menuSound.play();
});

// ### Resume button ###
resumeButtonElement.addEventListener('click', () => {
   if (game.player) {
      introScreenElement.style.display = 'none';
      gameCanvasElement.style.display = 'block';
      backgroundCanvasElement.style.display = 'block';
      game.clock();
      menuSound.play();
      musicLevel.play();
   }
})

// ### Instructions button ###
instructionsButtonElement.addEventListener('click', () => {
   introScreenElement.style.display = 'none';
   instructionsScreenElement.style.display = 'flex';
   menuSound.play();
})

// ### Credits button ###
creditsButtonElement.addEventListener('click', () => {
   introScreenElement.style.display = 'none';
   creditsScreenElement.style.display = 'flex';
   menuSound.play();

})

// ### Try again button ###
tryAgainButtonElement.addEventListener('click', () => {
   gameOverScreenElement.style.display = 'none';
   gameCanvasElement.style.display = 'block';
   backgroundCanvasElement.style.display = 'block';
   game.start();
   menuSound.play();
})
