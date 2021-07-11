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

   checkDoubleShot(rockX, rockY, rockW, rockH) {
      // ### Check for players second shot ###
      return (
         this.x + this.width >= rockX &&
         this.x <= rockX + rockW &&
         this.y <= rockY + rockH)
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

class EnemyProjectile extends Projectile {
   constructor(game, x, y) {
      super(game, x, y);
   }

   runLogic() {
      this.y++;
   }

   drawEnemyProjectile() {
      this.game.context.save();
      this.game.context.fillStyle = '#85C1E9';
      // let projectiles start beneath enemy
      this.game.context.globalCompositeOperation = 'destination-over';
      this.game.context.fillRect(this.x, this.y, this.width, this.height);
      this.game.context.restore();
   }
}


