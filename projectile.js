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

   checkDoubleShot(elementX, elementY, elementW, elementH) {
      // ### Check for players second shot ###
      return (
         this.x + this.width >= elementX &&
         this.x <= elementX + elementW &&
         this.y <= elementY + elementH)
   }

   drawProjectile(game) {
      this.game = game;
      this.game.context.save();
      // keep enemy color for reflected shots
      if (this.reflect === true) {
         this.game.context.fillStyle = '#85C1E9';
      } else {
         this.game.context.fillStyle = 'yellow';
      }
      // let projectiles start beneath player
      this.game.context.globalCompositeOperation = 'destination-over';
      this.game.context.fillRect(this.x, this.y, this.width, this.height);
      this.game.context.restore();
   }
}

class EnemyProjectile extends Projectile {
   constructor(game, x, y) {
      super(game, x, y);
      this.reflect = false;
   }

   runLogic() {
      // change direction if reflected
      if (this.reflect === true) {
         this.y--;
      } else {
         this.y++;
      }
   }

   checkIntersection(element) {
      return (
         // turns true if right side of element is beyond left side of projectile
         element.x + element.width >= this.x &&
         // turns true if left side of element is beyond right side of projectile
         element.x <= this.x + this.width &&
         // turns true if top edge of element is above bottom edge of projectile
         element.y <= this.y + this.height &&
         // turns true if bottom side of element is beyond top side of projectile
         element.y + element.height >= this.y
      );
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


