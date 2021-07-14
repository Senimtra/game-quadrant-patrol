/*
######################################
## JS Canvas Game - Quadrant Patrol ##
###################################### */

class Player {
   constructor(game, x, y) {
      this.game = game;
      this.width = 60;
      this.height = 30;
      // ### center player x-position ###
      this.x = x - (this.width / 2);
      this.y = y;
      this.health = 200;
      this.power = 2000;
      this.shieldsUp = false;
      this.powerShots = false;
      this.lives = 4;
   }

   moveLeft() {
      this.x -= 2;
   }

   moveRight() {
      this.x += 2;
   }

   fireProjectile() {
      // ### Fire double projectiles ###
      const projectile1 = new Projectile(this, this.x + this.width / 2 - 15 - 3, this.y);
      const projectile2 = new Projectile(this, this.x + (this.width / 2) + 15 - 3, this.y);
      this.game.playerProjectiles.push(projectile1, projectile2);
      // ### Fire powershots ###
      if (this.powerShots) {
         const projectile3 = new Projectile(this, this.x + this.width / 2 - 44 - 3, this.y);
         const projectile4 = new Projectile(this, this.x + (this.width / 2) + 44 - 3, this.y);
         this.game.playerProjectiles.push(projectile3, projectile4);
      }
   }

   activateShield() {
      // ### Put player shield up ###
      if ((this.power > 0) && (this.shieldsUp === false)) {
         this.x -= 25;
         this.width += 50;
         this.y -= 25;
         this.height += 25;
         this.shieldsUp = true;
      }
   }

   lowerShield() {
      // ### Lower player shield ###
      this.x += 25;
      this.width -= 50;
      this.y += 25;
      this.height -= 25;
      this.shieldsUp = false;
   }

   drawPlayer() {
      this.game.context.save();
      this.game.context.fillStyle = '#148F77';
      this.game.context.fillRect(this.x, this.y, this.width, this.height);
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

   drawPowerShots() {
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
      // ### Drain power by shields ###
      if (this.shieldsUp && this.power > 0) {
         setTimeout(() => {
            this.power -= 1;
         }, 10);
      }
      // ### Remove shields at no power ###
      if ((this.power <= 0) && (this.shieldsUp)) {
         this.x += 25;
         this.width -= 50;
         this.y += 25;
         this.height -= 25;
         this.shieldsUp = false;
      }
      // ### Drain power by powershots ###
      if (this.powerShots && this.power > 0) {
         setTimeout(() => {
            this.power -= 1;
         }, 10);
      }
      // ### Remove powershots at no power ###
      if ((this.power <= 0) && (this.powerShots)) {
         this.x += 25;
         this.width -= 50;
         this.powerShots = false;
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

