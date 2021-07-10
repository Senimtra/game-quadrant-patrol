/*
######################################
## JS Canvas Game - Quadrant Patrol ##
###################################### */

class Rock {
   constructor(game, x, y) {
      this.game = game;
      this.x = x;
      this.y = y - 20;
      this.width = 50;
      this.height = 50;
   }

   drawRock() {
      this.game.context.save();
      this.game.context.fillStyle = '#212F3D';
      this.game.context.fillRect(this.x, this.y, this.width, this.height);
      this.game.context.restore();
   }

   runLogic() {
      this.y += 0.75;
   }
}
