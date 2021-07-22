/*
######################################
## JS Canvas Game - Quadrant Patrol ##
###################################### */

const enemyColors = ['blue', 'green', 'orange', 'cyan', 'red'];

const enemyImage = new Image();
enemyImage.src = './images/ships_enemies.png';

const powerUpsImage = new Image();
powerUpsImage.src = './images/power_ups.png';

const playerExplosionImage = new Image();
playerExplosionImage.src = './images/explosion_player.png';

const enemyExplosionImage = new Image();
enemyExplosionImage.src = './images/explosion_enemies.png';

const razorImage = new Image();
razorImage.src = './images/bouncing_razor.png';

const razorExplosionImage = new Image();
razorExplosionImage.src = './images/explosion_razor.png'

class Enemy {
   constructor(game, x, y) {
      this.game = game;
      this.x = x;
      this.y = y;
      this.moveDir = Math.random() < 0.5 ? -1 : 1;
      this.width = 60;
      this.height = 36;
      this.widthXT = 16;
      this.heightXT = 20;
      this.frame = 0;
      this.frameStep = 7;
      this.animationFrame = this.moveDir < 0 ? 9 : 1;
      this.color = Math.floor(Math.random() * 5);
      this.health = 100;
      this.lastEnemyShotTimestamp = Date.now();
      this.enemyShotInterval = 500;
   }

   runLogic() {
      this.y += 0.5;
      this.x += 2 * this.moveDir;
      if (this.x <= 0) {
         this.moveDir *= -1;
         this.frame = 0;
      }
      if (this.x >= this.game.canvas.width - this.width) {
         this.moveDir *= -1;
         this.frame = 0;
      }
      // ### Check shot interval on enemy ###
      if ((Date.now() - this.lastEnemyShotTimestamp) > this.enemyShotInterval) {
         this.lastEnemyShotTimestamp = Date.now();
         this.shoot();
      }
      this.frame++;
      this.animation();
   }

   animation() {
      // ### Enemy rolls left/right during direction change ###
      if (this.frame > this.frameStep) {
         if (this.x > this.game.canvas.width - 120 && this.animationFrame < 9) {
            this.animationFrame++;
            this.frame = 0;
         } else if (this.x < 60 && this.animationFrame > 1) {
            this.animationFrame--;
            this.frame = 0;
         }
      }
   }

   shoot() {
      const enemyShot = new EnemyProjectile(this.game, this.x + this.width / 2 + 3, this.y + 32);
      this.game.enemyProjectiles.push(enemyShot);
   }

   checkIntersection(element) {
      return (
         // turns true if right side of element is beyond left side of enemy base shape
         element.x + element.width >= this.x &&
         // turns true if left side of element is beyond right side of enemy base shape
         element.x <= this.x + this.width &&
         // turns true if bottom side of element is beyond top side of enemy base shape
         element.y + element.height >= this.y &&
         // turns true if top side of element is above bottom edge of enemy base shape
         element.y <= this.y + this.height
      ) || (
            // turns true if right side of element is beyond left side of enemy cockpit
            element.x + element.width >= this.x + 22 &&
            // turns true if left side of element is beyond right side of enemy cockpit
            element.x <= this.x + 22 + this.widthXT &&
            // turns true if bottom side of element is beyond top side of enemy cockpit
            element.y + element.height >= this.y + 36 &&
            // turns true if top side of element is above bottom edge of enemy cockpit
            element.y <= this.y + 36 + this.heightXT
         );
   }

   drawEnemy() {
      this.game.context.save();
      // this.game.context.fillStyle = 'beige';
      // this.game.context.fillRect(this.x, this.y, this.width, this.height);
      // this.game.context.fillRect(this.x + 22, this.y + 36, this.widthXT, this.heightXT);
      this.game.context.drawImage(enemyImage, 343 * this.animationFrame - 343, this.color * 383, 343, 383, Math.floor(this.x - 2), Math.floor(this.y), 64, 64);
      this.game.context.restore();
   }
}

const rockImage_light = new Image();
const rockImage_dark = new Image();

rockImage_light.src = './images/rocks_light.png';
rockImage_dark.src = './images/rocks_dark.png';

class Rock extends Enemy {
   constructor(game, x, y) {
      super(game, x, y);
      this.color = '#1C2833'
      this.width = 50;
      this.height = 50;
      this.health = 100;
      this.frame = 0;
      this.animations = 31;
      this.animationFrame = 1;
      // spawn lighter or darker rocks
      this.rockBrightness = Math.random() < 0.5;
      // random rotation left/right (clip different images)
      this.rotationDirection = Math.floor(Math.random() * 2);
      // random rotation speed (between 1.5 and 3.5)
      this.animationFrameSteps = Number(((Math.random() * 2) + 1.5).toPrecision(3));
      // random y velocity between 0.5 and 2
      this.vy = Math.floor((Math.random() + 2) * 100) / 100;
      // random destination (bottom) x between 0 and canvas.width
      this.destination = Math.floor(Math.random() * (this.game.canvas.width - this.width));
      // calculate amount of updates to reach bottom regarding random vy
      this.travelUpdatesY = Math.floor(this.game.canvas.height / this.vy);
      // calculate amount of needed x/update to reach destination
      this.vx = Math.floor(((this.destination - this.x) / this.travelUpdatesY) * 100) / 100;
   }

   drawRock() {
      this.game.context.save();
      // ### Clip light image left/right // dark image top/bottom ###
      if (this.rockBrightness === true) {
         // ### Light rock animation logic
         if ((this.frame > this.animationFrameSteps)) {
            this.animationFrame++;
            this.frame = 0;
         }
         if (this.animationFrame > this.animations) {
            this.animationFrame = 1;
         }
         this.game.context.drawImage(rockImage_light, (128 * this.animationFrame - 128) - ((Math.ceil(this.animationFrame / 8)) * 1024 - 1024), (0 + Math.floor((this.animationFrame - 1) / 8) * 128) + this.rotationDirection * 512, 128, 128, Math.floor(this.x - 15), Math.floor(this.y - 15), 80, 80);
      }
      else {
         // ### Dark rock animation logic
         if ((this.frame > this.animationFrameSteps)) {
            this.animationFrame++;
            this.frame = 0;
         }
         if (this.animationFrame > this.animations) {
            this.animationFrame = 1;
         }
         this.game.context.drawImage(rockImage_dark, (384 - Math.floor((this.animationFrame - 1) / 8) * 128) + this.rotationDirection * 512, (this.animationFrame * 128 - 128) - ((Math.ceil(this.animationFrame / 8)) * 1024 - 1024), 128, 128, Math.floor(this.x - 15), Math.floor(this.y) - 15, 80, 80);
      }
      this.game.context.restore();
   }

   runLogic() {
      this.x += this.vx;
      this.y += this.vy;
   }
}

class PowerUp {
   constructor(game, x, y, direction, bonus) {
      this.game = game;
      this.direction = direction;
      this.bonus = bonus;
      this.x = x;
      this.y = y;
      this.vx = 2.25 * this.direction;
      this.vy = -3;
      this.width = 50;
      this.height = 50;
      this.frame = 0;
      this.frameStep = 2;
      this.animation = 1;
      this.gravity = 0.15;
   }

   drawPowerUp() {
      this.game.context.save();
      // this.game.context.fillStyle = `${this.color}`;
      // this.game.context.fillRect(this.x, this.y, this.width, this.height);
      this.game.context.drawImage(powerUpsImage, this.animation * 52 - 52, this.colorRow * 52 - 52, 52, 52, Math.floor(this.x), Math.floor(this.y), 50, 50);
      // if (this.bounced === true && (Date.now() - this.timeSpawned < 9000)) {
      //    this.game.context.globalCompositeOperation = 'source-over'
      //    this.game.context.fillStyle = 'white';
      //    this.game.context.font = '24px Arial';
      //    this.game.context.fillText(`${10 - ((Date.now() - this.timeSpawned) / 1000).toFixed()}`, this.x + 8, this.y + this.height - 7);
      // }
      this.game.context.restore();
   }

   drawRazor() {
      // ### Bouncing razor animation ###
      this.game.context.save();
      if (this.razorFrame < 63) {
         this.razorFrame++;
      } else {
         this.razorFrame = 0;
         this.game.context.restore();
      }
      this.game.context.drawImage(razorImage, (128 * this.razorFrame - 128) - ((Math.ceil(this.razorFrame / 8)) * 1024 - 1024), (0 + Math.floor((this.razorFrame - 1) / 8) * 128), 128, 128, Math.floor(this.x), Math.floor(this.y), 50, 50);
   }

   runLogic() {
      this.x += this.vx;
      this.vy += this.gravity;
      this.y += this.vy;
      this.frame++;
      this.rotatePowerUp();
   }

   rotatePowerUp() {
      // ### Power-up animation ###
      if (this.frame > this.frameStep - 1) {
         this.frame = 0;
         if (this.animation < 20) {
            this.animation++;
         } else {
            this.animation = 1;
         }
      }
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
   constructor(game, x, y, direction, bonus, colorRow) {
      super(game, x, y, direction, bonus, colorRow)
      this.colorRow = colorRow;
   }
}

class ShieldUp extends PowerUp {
   constructor(game, x, y, direction, bonus, colorRow) {
      super(game, x, y, direction, bonus, colorRow)
      this.colorRow = colorRow;
   }
}

class WingsUp extends PowerUp {
   constructor(game, x, y, direction, bonus, colorRow) {
      super(game, x, y, direction, bonus, colorRow)
      this.colorRow = colorRow;
   }
}

class BounceUp extends PowerUp {
   constructor(game, x, y, direction, bonus, colorRow) {
      super(game, x, y, direction, bonus, colorRow)
      this.colorRow = colorRow;
      this.bounced = false;
      this.timeSpawned = Date.now();
      this.razorFrame = 0;
   }

   runLogic() {
      if (this.bounced === false) {
         this.x += (2.25 * this.direction);
         this.vy += this.gravity;
         this.y += this.vy;
      }
      if (this.bounced === true) {

         this.x += this.vx * 1;
         this.y -= this.vy * 0.4;
         if (this.y < 60 && Date.now() - this.timeSpawned < 15000) {
            this.vy *= -1;
         }
         if (this.x < 0 || this.x + this.width > this.game.canvas.width) {
            this.vx *= -1;
         }
         if (game.player.checkIntersectionShield(this)) {
            this.vy *= -1;
         }
         this.game.enemies.forEach((enemy, index) => {
            if (this.checkIntersection(enemy)) {
               // Spawn razor/enemy explosion
               const enemyBoom = new Explosion(this, enemy.x, enemy.y, enemy.width);
               this.game.razorExplosions.push(enemyBoom);
               this.game.enemies.splice(index, 1);
            }
         });
         this.game.rocks.forEach((rock, index) => {
            if (this.checkIntersection(rock)) {
               // Spawn razor/rock explosion
               const rockBoom = new Explosion(this, rock.x, rock.y, rock.width);
               this.game.razorExplosions.push(rockBoom);
               this.game.rocks.splice(index, 1);
            }
         });
         if (this.x + this.width < 0 || this.x > this.game.canvas.width || this.y + this.height < 60) {
            this.game.powerUpSpawned = false;
         }
      }
      this.frame++;
      this.rotatePowerUp();
   }
}

class ScoreUp extends PowerUp {
   constructor(game, x, y, direction, bonus, colorRow) {
      super(game, x, y, direction, bonus, colorRow)
      this.colorRow = colorRow;
   }
}

class Explosion {
   constructor(game, x, y, width) {
      this.game = game;
      this.x = x;
      this.y = y;
      this.animationFrame = 1;
      this.xOffset = width / 2;
      this.explosionType = Math.floor(Math.random() * 4);
   }

   runLogic() {
      if (this.animationFrame < 64) {
         this.animationFrame++;
      }
   }

   drawPlayerExplosion() {
      this.game.context.drawImage(playerExplosionImage, (512 * this.animationFrame - 512) - ((Math.ceil(this.animationFrame / 8)) * 4096 - 4096), (0 + Math.floor((this.animationFrame - 1) / 8) * 512), 512, 512, Math.floor(this.x - 256 + this.xOffset), Math.floor(this.y - 256 + this.xOffset), 512, 512)
   }

   drawEnemyExplosion() {
      this.game.context.drawImage(enemyExplosionImage, (256 * this.animationFrame - 256) - ((Math.ceil(this.animationFrame / 8)) * 2048 - 2048), (0 + Math.floor((this.animationFrame - 1) / 8) * 256) + this.explosionType * 2048, 256, 256, Math.floor(this.x - 170 + this.xOffset), Math.floor(this.y - 170 + this.xOffset), 340, 340)
   }

   drawRazorExplosion() {
      game.context.drawImage(razorExplosionImage, (256 * this.animationFrame - 256) - ((Math.ceil(this.animationFrame / 8)) * 2048 - 2048), (0 + Math.floor((this.animationFrame - 1) / 8) * 256), 256, 256, Math.floor(this.x - 175 + this.xOffset), Math.floor(this.y - 175 + this.xOffset), 350, 350)
   }
}

