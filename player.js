/*
######################################
## JS Canvas Game - Quadrant Patrol ##
###################################### */

const playerImage = new Image();
playerImage.src = './images/ship_player.png';

class Player {
   constructor(game, x, y) {
      this.game = game;
      this.width = 60;
      this.height = 30;
      // top player shape
      this.widthXT = 22;
      this.heightXT = 36;
      // center player x-position
      this.x = x - (this.width / 2);
      this.y = y;
      this.health = 99999;
      this.shieldPower = 0;
      this.wingsPower = 0;
      this.shieldsUp = false;
      this.wingsUp = false;
      this.lives = 3;
   }

   checkIntersection(element) {
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
         );
   }

   moveLeft() {
      this.x -= 3.5;
   }

   moveRight() {
      this.x += 3.5;
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

   wingsOff() {
      // ### Disable wings ###
      this.x += 25;
      this.width -= 50;
      this.wingsUp = false;
   }

   drawPlayer() {
      this.game.context.save();
      this.game.context.fillStyle = '#148F77';
      this.game.context.fillRect(this.x, this.y, this.width, this.height);
      this.game.context.fillRect(this.x + 19, this.y - 36, this.widthXT, this.heightXT);
      this.game.context.drawImage(playerImage, 755, 0, 151, 151, this.x - 30, this.y - 45, 120, 80);
      this.game.context.restore();
   }

   drawShields() {
      this.game.context.save();
      this.game.context.fillStyle = '#2E86C1';
      this.game.context.fillRect(this.x, this.y, this.width, this.height);
      this.game.context.globalCompositeOperation = 'destination-out';
      this.game.context.fillRect(this.x + 10, this.y + 10, this.width - 20, this.height - 10);
      this.game.context.restore();
      this.game.context.save();
      this.game.context.fillStyle = '#148F77';
      this.game.context.fillRect(this.x + 25, this.y + 25, this.width - 50, this.height - 25);
      this.game.context.restore();
   }

   drawWings() {
      this.game.context.save();
      this.game.context.fillStyle = '#AF601A';
      this.game.context.fillRect(this.x, this.y, this.width, this.height);
      this.game.context.globalCompositeOperation = 'destination-out';
      this.game.context.fillRect(this.x + 21, this.y, 4, this.height);
      this.game.context.fillRect(this.x + this.width - 25, this.y, 4, this.height);
      this.game.context.restore();
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
            this.shieldPower -= 1;
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
   }

   drawLives() {
      let livesUi = '';
      for (let i = 0; i < this.lives; i++) {
         livesUi += ' #';
      }
      return livesUi;
   }
}

