/*
######################################
## JS Canvas Game - Quadrant Patrol ##
###################################### */

const playerImage = new Image();
playerImage.src = './images/ship_player.png';

const exhaustImage = new Image();
exhaustImage.src = './images/ship_player_exhaust.png'

const shieldImage = new Image();
shieldImage.src = './images/shield.png'

class Player {
   constructor(game, x, y) {
      this.game = game;
      this.width = 60;
      this.height = 30;
      // top player shape
      this.widthXT = 22;
      this.heightXT = 36;
      this.animation = 6;
      this.frame = 0;
      this.exhaustFrame = 1;
      this.animationStart = 0;
      this.animationRunning = false;
      // center player x-position
      this.x = x - (this.width / 2);
      this.y = y;
      this.health = 200;
      this.shieldPower = 0;
      this.wingsPower = 0;
      this.shieldsUp = false;
      this.wingsUp = false;
      this.lives = 3;
   }

   checkIntersection(element) {
      // ### Checking up to two shapes (enemy) against two shapes (player) ###
      return (
         // turns true if right side of element is beyond left side of player's base shape
         element.x + element.width >= this.x &&
         // turns true if left side of element is beyond right side of player's base shape
         element.x <= this.x + this.width &&
         // turns true if top edge of element is above bottom edge of player's base shape
         element.y <= this.y + this.height &&
         // turns true if bottom side of element is beyond top side of player's base shape
         element.y + element.height >= this.y
      ) || (
            // turns true if right side of element is beyond left side of player's cockpit shape
            element.x + element.width >= this.x + 19 &&
            // turns true if left side of element is beyond right side of player's cockpit shape
            element.x <= this.x + 19 + this.widthXT &&
            // turns true if top edge of element is above bottom edge of player's cockpit shape
            element.y <= this.y - 36 + this.heightXT &&
            // turns true if bottom side of element is beyond top side of player's cockpit shape
            element.y + element.height >= this.y - 36
         ) || (
            // turns true if right side of enemy cockpit is beyond left side of player's base shape
            element.x + 22 + element.widthXT >= this.x &&
            // turns true if left side of enemy cockpit is beyond right side of player's base shape
            element.x + 22 <= this.x + this.width &&
            // turns true if top edge of enemy cockpit is above bottom edge of player's base shape
            element.y + 36 <= this.y + this.height &&
            // turns true if bottom side of enemy cockpit is beyond top side of player's base shape
            element.y + 36 + element.heightXT >= this.y
         ) || (
            // turns true if right side of enemy cockpit is beyond left side of player's cockpit shape
            element.x + 22 + element.widthXT >= this.x + 19 &&
            // turns true if left side of enemy cockpit is beyond right side of player's cockpit shape
            element.x + 22 <= this.x + 19 + this.widthXT &&
            // turns true if top edge of enemy cockpit is above bottom edge of player's cockpit shape
            element.y + 36 <= this.y - 36 + this.heightXT &&
            // turns true if bottom side of enemy cockpit is beyond top side of player's cockpit shape
            element.y + 36 + element.heightXT >= this.y - 36
         );
   }

   checkIntersectionShield(element) {
      // ### Circle collision check player shield aura ###
      var distX = Math.abs(this.x + 55 - element.x - element.width / 2);
      var distY = Math.abs(this.y + 24 - element.y - element.height / 2);
      if (distX > (element.width / 2 + 56)) { return false; }
      if (distY > (element.height / 2 + 56)) { return false; }
      if (distX <= (element.width / 2)) { return true; }
      if (distY <= (element.height / 2)) { return true; }
      var dx = distX - element.width / 2;
      var dy = distY - element.height / 2;
      return (dx * dx + dy * dy <= (56 * 56));
   }

   moveLeft() {
      this.x -= 3.5;
      // ### player model rolls left ###
      if (((Date.now() - this.animationStart) > 35) && this.animationStart !== 0) {
         if (this.animation > 1) this.animation--;
         this.animationStart = Date.now();
      }
   }

   moveRight() {
      this.x += 3.5;
      // ### player model rolls right ###
      if (((Date.now() - this.animationStart) > 35) && this.animationStart !== 0) {
         if (this.animation < 11) this.animation++;
         this.animationStart = Date.now();
      }
   }

   fireProjectile() {
      // ### Fire double projectiles ###
      const projectile1 = new Projectile(this, this.x + this.width / 2 - 15 - 3, this.y);
      const projectile2 = new Projectile(this, this.x + (this.width / 2) + 15 - 3, this.y);
      this.game.playerProjectiles.push(projectile1, projectile2);
      // ### Fire powershots ###
      if (this.wingsUp) {
         const projectile3 = new Projectile(this, this.x + this.width / 2 - 44 - 3, this.y);
         const projectile4 = new Projectile(this, this.x + (this.width / 2) + 44 - 3, this.y);
         this.game.playerProjectiles.push(projectile3, projectile4);
      }
   }

   activateShield() {
      // ### Put shield up ###
      if ((this.shieldPower > 0) && (this.shieldsUp === false)) {
         this.x -= 25;
         this.width += 50;
         this.y -= 25;
         this.height += 25;
         this.shieldsUp = true;
      }
   }

   lowerShield() {
      // ### Lower shield ###
      this.x += 25;
      this.width -= 50;
      this.y += 25;
      this.height -= 25;
      this.shieldsUp = false;
   }

   wingsOn() {
      // ### Activate wings ###
      if ((this.wingsPower > 0) && (this.wingsUp === false)) {
         this.x -= 25;
         this.width += 50;
         this.wingsUp = true;
      }
   }

   rollBack() {
      // ### Roll back into horizontal position ###
      if (this.animationStart === 0) {
         this.animationStart = Date.now();
      }
      if (Date.now() - this.animationStart > 35) {
         this.animation < 6 ? this.animation++ : this.animation--;
         this.animationStart = Date.now();
      }
   }

   wingsOff() {
      // ### Disable wings ###
      this.x += 25;
      this.width -= 50;
      this.wingsUp = false;
   }

   drawPlayer() {
      this.game.context.save();
      // ### Draw player ship ###
      this.game.context.drawImage(playerImage, (this.animation - 1) * 151, 0, 151, 151, this.x - 30, this.y - 45, 120, 80);
      // ### Draw player ship exhaust ###
      this.game.context.drawImage(exhaustImage, (128 * this.exhaustFrame - 128) - ((Math.ceil(this.exhaustFrame / 8)) * 1024 - 1024), (0 + Math.floor((this.exhaustFrame - 1) / 8) * 128), 128, 128, this.x + 5.5, this.y + 25, 50, 50);
      this.game.context.restore();
   }

   animateExhaust() {
      // ### Animate player ship exhaust ###
      if (this.frame > 5) {
         this.exhaustFrame++;
         this.frame = 0;
         if (this.exhaustFrame > 32) this.exhaustFrame = 1;
      }
   }

   drawShields() {
      // ### Draw shield state ### //
      this.game.context.save();
      // draw player ship
      this.game.context.drawImage(playerImage, (this.animation - 1) * 151, 0, 151, 151, this.x - 5, this.y - 20, 120, 80);
      // draw player ship exhaust
      this.game.context.drawImage(exhaustImage, (128 * this.exhaustFrame - 128) - ((Math.ceil(this.exhaustFrame / 8)) * 1024 - 1024), (0 + Math.floor((this.exhaustFrame - 1) / 8) * 128), 128, 128, this.x + 30.5, this.y + 50, 50, 50);
      // draw player shield
      this.game.context.drawImage(shieldImage, this.x - 5, this.y - 36, 120, 120);
      this.game.context.beginPath();
      this.game.context.stokeStyle = 'white';
      // this.game.context.arc(this.x + 55, this.y + 24, 56, 0, 2 * Math.PI);
      this.game.context.stroke();
      this.game.context.restore();
   }

   drawWings() {
      // ### Draw wingmen state ### //
      this.game.context.save();
      // draw player ship
      this.game.context.drawImage(playerImage, (this.animation - 1) * 151, 0, 151, 151, this.x - 5, this.y - 45, 120, 80);
      // draw player ship exhaust
      this.game.context.drawImage(exhaustImage, (128 * this.exhaustFrame - 128) - ((Math.ceil(this.exhaustFrame / 8)) * 1024 - 1024), (0 + Math.floor((this.exhaustFrame - 1) / 8) * 128), 128, 128, this.x + 30.5, this.y + 25, 50, 50);
      // draw left wingman
      this.game.context.drawImage(playerImage, (this.animation - 1) * 151, 0, 151, 151, this.x - 26, this.y - 18, 75, 50);
      // draw left wingman exhaust
      this.game.context.drawImage(exhaustImage, (128 * this.exhaustFrame - 128) - ((Math.ceil(this.exhaustFrame / 8)) * 1024 - 1024), (0 + Math.floor((this.exhaustFrame - 1) / 8) * 128), 128, 128, this.x - 3, this.y + 27, 30, 30);
      // draw right wingman
      this.game.context.drawImage(playerImage, (this.animation - 1) * 151, 0, 151, 151, this.x + 61, this.y - 18, 75, 50);
      this.game.context.restore();
      // draw left wingman exhaust
      this.game.context.drawImage(exhaustImage, (128 * this.exhaustFrame - 128) - ((Math.ceil(this.exhaustFrame / 8)) * 1024 - 1024), (0 + Math.floor((this.exhaustFrame - 1) / 8) * 128), 128, 128, this.x + 84, this.y + 27, 30, 30);
   }

   checkBoundaries() {
      // ### Prevent player from moving out of the canvas ###
      if (!this.shieldsUp) {
         if ((this.x + this.width) >= this.game.canvas.width) {
            this.x = this.game.canvas.width - this.width;
         } else if (this.x <= 0) {
            this.x = 0;
         }
      } else {
         // ### Let shields go out of canvas ###
         if ((this.x + this.width - 25) >= this.game.canvas.width) {
            this.x = this.game.canvas.width - this.width + 25;
         } else if (this.x <= -25) {
            this.x = -25;
         }
      }
   }

   runLogic() {
      // ### Drain shieldPower ###
      if (this.shieldsUp && this.shieldPower > 0) {
         setTimeout(() => {
            // this.shieldPower -= 1;
         }, 10);
      }
      // ### Remove shield at no power ###
      if ((this.shieldPower <= 0) && (this.shieldsUp)) {
         this.x += 25;
         this.width -= 50;
         this.y += 25;
         this.height -= 25;
         this.shieldsUp = false;
      }
      // ### Drain wingsPower ###
      if (this.wingsUp && this.wingsPower > 0) {
         setTimeout(() => {
            this.wingsPower -= 1;
         }, 10);
      }
      // ### Remove wings at no power ###
      if ((this.wingsPower <= 0) && (this.wingsUp)) {
         this.x += 25;
         this.width -= 50;
         this.wingsUp = false;
      }
      // ### Roll back to center position ###
      if ((game.controls['ArrowLeft'].pressed === false) && (game.controls['ArrowRight'].pressed === false) && this.animation !== 6) {
         this.rollBack();
      }
      this.animateExhaust();
   }

   drawLives() {
      let livesUi = '';
      for (let i = 0; i < this.lives; i++) {
         livesUi += ' #';
      }
      return livesUi;
   }
}

