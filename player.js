/*
######################################
## JS Canvas Game - Quadrant Patrol ##
###################################### */

class Player {
   constructor(game, x, y) {
      this.game = game;
      this.width = 60;
      this.height = 30;
      // ### center player x-position ###
      this.x = x - (this.width / 2);
      this.y = y;
      this.health = 200;
      this.power = 500;
   }
   drawPlayer() {
      this.game.context.save();
      this.game.context.fillStyle = '#148F77';
      this.game.context.fillRect(this.x, this.y, this.width, this.height);
      this.game.context.restore();
   }
}
