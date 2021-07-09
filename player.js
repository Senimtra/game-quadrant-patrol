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
   }
   drawPlayer() {
      const context = this.game.context;
      context.fillRect(this.x, this.y, this.width, this.height);
   }
}
