/*
######################################
## JS Canvas Game - Quadrant Patrol ##
###################################### */

class Game {
   constructor(canvas) {
      this.canvas = canvas;
      // ### access the drawing context ###
      this.context = canvas.getContext('2d');
   }
   start() {
      // ### create new player instance ###
      this.player = new Player(this, this.canvas.width / 2, this.canvas.height - 50);
      this.drawEverything();
   }
   drawEverything() {
      this.player.drawPlayer();
   }
}
