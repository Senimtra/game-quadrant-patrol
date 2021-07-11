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
      this.y += 1;
      this.x += 2 * this.moveDir;
   }

   drawEnemy() {
      this.game.context.save();
      this.game.context.fillStyle = 'darkred';
      this.game.context.fillRect(this.x, this.y, this.width, this.height);
      this.game.context.restore();
   }
}
