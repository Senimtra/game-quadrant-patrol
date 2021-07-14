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
      // random y velocity between 0.5 and 2
      this.vy = Math.floor((Math.random() + 1) * 100) / 100;
      // random destination (bottom) x between 0 and canvas.width
      this.destination = Math.floor(Math.random() * (this.game.canvas.width - this.width));
      // calculate amount of updates to reach bottom regarding random vy
      this.travelUpdatesY = Math.floor(this.game.canvas.height / this.vy);
      // calculate amount of needed x/update to reach destination
      this.vx = Math.floor(((this.destination - this.x) / this.travelUpdatesY) * 100) / 100;
   }

   drawRock() {
      this.game.context.save();
      this.game.context.fillStyle = `${this.color}`;
      this.game.context.fillRect(this.x, this.y, this.width, this.height);
      this.game.context.restore();
   }

   runLogic() {
      this.x += this.vx;
      this.y += this.vy;
      // ### Switch color by health status ###
      if (this.health === 50) this.color = '#2C3E50'
   }
}

class PowerUp {
   constructor(game, x, y, direction, bonus) {
      this.game = game;
      this.direction = direction;
      this.bonus = bonus;
      this.x = x;
      this.y = y;
      this.vy = -3;
      this.width = 30;
      this.height = 30;
      this.gravity = 0.15;
      this.color = 'blue'
   }

   drawPowerUp() {
      this.game.context.save();
      this.game.context.fillStyle = `${this.color}`;
      this.game.context.fillRect(this.x, this.y, this.width, this.height);
      this.game.context.restore();
   }

   runLogic() {
      this.x += (2.25 * this.direction);
      this.vy += this.gravity;
      this.y += this.vy;
   }

   checkIntersection(element) {
      return (
         // turns true if right side of element is beyond left side of powerup
         element.x + element.width >= this.x &&
         // turns true if left side of element is beyond right side of powerup
         element.x <= this.x + this.width &&
         // turns true if bottom side of element is beyond top side of powerup
         element.y + element.height >= this.y &&
         // turns true if top side of element is above bottom edge of powerup
         element.y <= this.y + this.height
      );
   }
}

class HealthUp extends PowerUp {
   constructor(game, x, y, direction, bonus) {
      super(game, x, y, direction, bonus)
      this.color = 'green';
   }
}
