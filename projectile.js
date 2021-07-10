/*
######################################
## JS Canvas Game - Quadrant Patrol ##
###################################### */

class Projectile {
   constructor(game, x, y) {
      this.game = game;
      this.x = x;
      this.y = y;
      this.height = 18;
      this.width = 6;
   }

   runLogic() {
      this.y--;
   }

   drawProjectile() {
      this.game.context.save();
      this.game.context.fillStyle = 'yellow';
      // let projectiles start beneath player
      this.game.context.globalCompositeOperation = 'destination-over';
      this.game.context.fillRect(this.x, this.y, this.width, this.height);
      this.game.context.restore();
   }
}


