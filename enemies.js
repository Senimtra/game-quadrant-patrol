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
      this.color = '#7B241C'
      this.health = 100;
      this.lastEnemyShotTimestamp = Date.now();
      this.enemyShotInterval = 2000;
   }

   runLogic() {
      this.y += 0.5;
      this.x += 2 * this.moveDir;
      if (this.x <= 0) this.moveDir *= -1;
      if (this.x >= this.game.canvas.width - this.width) this.moveDir *= -1;
      // ### Check shot interval on enemy ###
      if ((Date.now() - this.lastEnemyShotTimestamp) > this.enemyShotInterval) {
         this.lastEnemyShotTimestamp = Date.now();
         this.shoot();
      }
      // ### Switch color by health status ###
      if (this.health === 50) this.color = '#A93226'
   }

   shoot() {
      const enemyShot = new EnemyProjectile(this.game, this.x + this.width / 2 + 3, this.y + 32);
      this.game.enemyProjectiles.push(enemyShot);
   }

   checkIntersection(element) {
      return (
         // turns true if right side of element is beyond left side of enemy
         element.x + element.width >= this.x &&
         // turns true if left side of element is beyond right side of enemy
         element.x <= this.x + this.width &&
         // turns true if bottom side of element is beyond top side of enemy
         element.y + element.height >= this.y &&
         // turns true if top side of element is above bottom edge of enemy
         element.y <= this.y + this.height
      );
   }

   drawEnemy() {
      this.game.context.save();
      this.game.context.fillStyle = `${this.color}`;
      this.game.context.fillRect(this.x, this.y, this.width, this.height);
      this.game.context.restore();
   }
}

class Rock extends Enemy {
   constructor(game, x, y) {
      super(game, x, y);
      this.color = '#1C2833'
      this.width = 50;
      this.height = 50;
      this.health = 100;
   }

   drawRock() {
      this.game.context.save();
      this.game.context.fillStyle = `${this.color}`;
      this.game.context.fillRect(this.x, this.y, this.width, this.height);
      this.game.context.restore();
   }

   runLogic() {
      this.y += 1.5;
      // ### Switch color by health status ###
      if (this.health === 50) this.color = '#2C3E50'
   }
}
