/*
######################################
## JS Canvas Game - Quadrant Patrol ##
###################################### */

class Enemy {
   constructor(game, x, y) {
      this.game = game;
      this.x = x;
      this.y = y;
      this.moveDir = Math.random() < 0.5 ? -1 : 1;
      this.width = 50;
      this.height = 50;
   }

   runLogic() {
      this.y += 0.5;
      this.x += 2 * this.moveDir;
      if (this.x <= 0) this.moveDir *= -1;
      if (this.x >= this.game.canvas.width - this.width) this.moveDir *= -1;
   }

   checkIntersection(player) {
      return (
         // turns true if right side of player is beyond left side of enemy
         player.x + player.width >= this.x &&
         // turns true if left side of player is beyond right side of enemy
         player.x <= this.x + this.width &&
         // turns true if top edge of player is above bottom edge of enemy
         player.y <= this.y + this.height
      );
   }

   drawEnemy() {
      this.game.context.save();
      this.game.context.fillStyle = 'darkred';
      this.game.context.fillRect(this.x, this.y, this.width, this.height);
      this.game.context.restore();
   }
}
