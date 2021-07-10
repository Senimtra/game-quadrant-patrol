/*
######################################
## JS Canvas Game - Quadrant Patrol ##
###################################### */

class Game {
   constructor(canvas) {
      this.canvas = canvas;
      // ### Access the drawing context ###
      this.context = canvas.getContext('2d');
   }

   start() {
      // ### Create new player instance ###
      this.player = new Player(this, this.canvas.width / 2, this.canvas.height - 100);
      this.frame = 0;
      this.fps = 0;
      this.rocks = [];
      this.playerProjectiles = [];
      this.lastRockSpawn = Date.now();
      this.rockSpawnInterval = 3000;
      this.clock();
      this.enableControls();
      this.displayRefresh();
      this.drawFps();
   }

   drawEverything() {
      // ### Draw everything to canvas ###
      this.player.drawPlayer();
      for (const rock of this.rocks) {
         rock.drawRock();
      }
      for (const playerShot of this.playerProjectiles) {
         playerShot.drawProjectile();
      }
   }

   runLogic() {
      // ### Check rock spawn interval ###
      if (Date.now() - this.lastRockSpawn > this.rockSpawnInterval) {
         this.lastRockSpawn = Date.now();
         this.spawnRock();
      }
      for (const rock of this.rocks) {
         rock.runLogic();
      }
      for (const playerShot of this.playerProjectiles) {
         playerShot.runLogic();
      }
      this.checkCollisions();
      this.collectGarbage();
   }

   spawnRock() {
      // ### Push new rocks to array ###
      const rock = new Rock(this, (Math.floor(Math.random() * (this.canvas.width - 50)) + 1), 10);
      this.rocks.push(rock);
   }

   collectGarbage() {
      // ### Remove objects that moved out of the canvas ###
      this.rocks.forEach((rock, index) => {
         if (rock.y > this.canvas.height - 60) {
            this.rocks.splice(index, 1);
         }
      });
   }

   enableControls() {
      // ### Enable player controls ###
      window.addEventListener('keydown', (event) => {
         switch (event.code) {
            case 'ArrowLeft':
               this.player.x -= 10;
               break;
            case 'ArrowRight':
               this.player.x += 10;
               break;
            case 'Space':
               this.fireProjectile();
         }
         this.checkBoundaries();
      });
   }

   clearScreen() {
      // ### Clear whole canvas ###
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
   }

   checkBoundaries() {
      // ### Prevent player from moving out of the canvas ###
      if ((this.player.x + this.player.width) >= this.canvas.width) {
         this.player.x = this.canvas.width - this.player.width;
      } else if (this.player.x <= 0) {
         this.player.x = 0;
      }
   }

   fireProjectile() {
      // ### Fire double projectiles ###
      const projectile1 = new Projectile(this, this.player.x + this.player.width / 3 - 3, this.player.y);
      const projectile2 = new Projectile(this, this.player.x + (this.player.width / 3) * 2 - 3, this.player.y);
      this.playerProjectiles.push(projectile1, projectile2);
      console.log(this.playerProjectiles);
   }

   checkCollisions() {
      // ### Check for collisions with rocks ###
      this.rocks.forEach((rock, index) => {
         if (rock.checkIntersection(this.player)) {
            this.rocks.splice(index, 1);
            this.player.health -= 10;
            this.lose();
         }
      });
   }

   clock() {
      // ### Cope different display refresh rates ###
      window.clockTimer = setInterval(() => {
         this.runLogic();
      }, 16.67); // 60 fps
   }

   lose() {
      // ### Check if player is dead ###
      if (this.player.health <= 0) {
         console.log('YOU LOST');
         clearInterval(window.clockTimer);
      }
   }

   displayRefresh() {
      // ### Refresh canvas on every frame ###
      this.clearScreen();
      this.drawEverything();
      this.drawUI();
      window.requestAnimationFrame(() => {
         this.displayRefresh();
      })
      this.frame++;
   }

   drawFps() {
      // ### Calculate the actual fps ###
      setInterval(() => {
         this.fps = this.frame;
         this.frame = 0;
      }, 1000);
   }

   drawUI() {
      // ### draw UI elements ###
      this.context.save();
      this.context.fillStyle = '#6C3483';
      this.context.fillRect(0, 0, this.canvas.width, 60);
      this.context.fillRect(0, this.canvas.height - 60, this.canvas.width, 60);
      this.context.restore();
      // draw the current fps
      this.context.fillText(`FPS: ${this.fps}`, this.canvas.width - 60, 19);
      this.context.save();
      this.context.font = '45px Arial';
      // draw the game logo
      this.context.strokeText('Quadrant Patrol', 8, 44);
      this.context.restore();
      this.context.save();
      // draw player health
      this.context.font = '28px Arial';
      this.context.fillText(`HEALTH: ${this.player.health}`, 20, this.canvas.height - 20);
      this.context.restore();
   }
}
