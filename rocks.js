/*
######################################
## JS Canvas Game - Quadrant Patrol ##
###################################### */

class Rock {
   constructor(game, x, y) {
      this.game = game;
      this.x = x;
      this.y = y;
      this.width = 50;
      this.height = 50;
   }

   drawRock() {
      this.game.context.fillRect(this.x, this.y, this.width, this.height);
   }

   runLogic() {
      this.y += 1;
   }
}
