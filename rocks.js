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
      this.y += 1.5;
   }

   checkIntersection(player) {
      return (
         // turns true if right side of player is beyond left side of rock
         player.x + player.width >= this.x &&
         // turns true if left side of player is beyond right side of rock
         player.x <= this.x + this.width &&
         // turns true if top edge of player is above bottom edge of rock
         player.y <= this.y + this.height
      );
   }
}
