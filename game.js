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
      this.enemies = [];
      this.playerProjectiles = [];
      this.enemyProjectiles = [];
      this.lastRockSpawn = Date.now();
      this.lastEnemySpawn = Date.now();
      this.rockSpawnInterval = 3000;
      this.enemySpawnInterval = 5000;
      this.clock();
      this.enableControls();
      this.displayRefresh();
      this.drawFps();
   }

   drawEverything() {
      // ### Draw player ###
      this.player.drawPlayer();
      // ### Draw rocks ###
      for (const rock of this.rocks) {
         rock.drawRock();
      }
      // ### Draw player projectiles ###
      for (const playerShot of this.playerProjectiles) {
         playerShot.drawProjectile();
      }
      // ### Draw enemies ###
      for (const enemy of this.enemies) {
         enemy.drawEnemy();
      }
      // ### Draw enemy projectiles ###
      for (const enemyShot of this.enemyProjectiles) {
         enemyShot.drawEnemyProjectile(this);
      }
   }

   runLogic() {
      // ### Check rock spawn interval ###
      if (Date.now() - this.lastRockSpawn > this.rockSpawnInterval) {
         this.lastRockSpawn = Date.now();
         this.spawnRock();
      }
      // ### Check enemy spawn interval ###
      if (Date.now() - this.lastEnemySpawn > this.enemySpawnInterval) {
         this.lastEnemySpawn = Date.now();
         this.spawnEnemy();
      }
      // ### Run rock logic ###
      for (const rock of this.rocks) {
         rock.runLogic();
      }
      // ### Run player projectiles logic ###
      for (const playerShot of this.playerProjectiles) {
         playerShot.runLogic();
      }
      // ### Run enemy logic ###
      for (const enemy of this.enemies) {
         enemy.runLogic();
      }
      // ### Run enemy projectiles logic ###
      for (const enemyShot of this.enemyProjectiles) {
         enemyShot.runLogic();
      }
      this.checkCollisions();
      this.collectGarbage();
   }

   spawnRock() {
      // ### Push new rocks to array ###
      const rock = new Rock(this, (Math.floor(Math.random() * (this.canvas.width - 50)) + 1), 10);
      this.rocks.push(rock);
   }

   spawnEnemy() {
      // ### Push new enemy to array ###
      const enemy = new Enemy(this, (Math.floor(Math.random() * (this.canvas.width - 50)) + 1), 10);
      this.enemies.push(enemy);
   }

   collectGarbage() {
      // ### Remove rocks that moved out of the canvas ###
      this.rocks.forEach((rock, index) => {
         if (rock.y > this.canvas.height - 60) {
            this.rocks.splice(index, 1);
         }
      });
      // ### Remove player projectiles that moved oob ###
      this.playerProjectiles.forEach((playerShot, index) => {
         if (playerShot.y < 42) {
            this.playerProjectiles.splice(index, 1);
         }
      });
      // ### Remove enemies that moved oob ###
      this.enemies.forEach((enemy, index) => {
         if (enemy.y > this.canvas.height - 60) {
            this.enemies.splice(index, 1);
         }
      });
      // ### Remove enemy projectiles that moved oob ###
      this.enemyProjectiles.forEach((enemyShot, index) => {
         if (enemyShot.y > this.canvas.height - 42) {
            this.enemyProjectiles.splice(index, 1);
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
   }

   checkCollisions() {
      // ### Check for player collisions with rocks ###
      this.rocks.forEach((rock, index) => {
         if (rock.checkIntersection(this.player)) {
            this.rocks.splice(index, 1);
            this.player.health -= 10;
            this.lose();
         }
         // ### Check for player projectiles ###
         this.playerProjectiles.forEach((shot, shotIndex) => {
            if (rock.checkIntersection(shot)) {
               // check if any shot hit the rock
               this.playerProjectiles.splice(shotIndex, 1);
               this.playerProjectiles.forEach((shot2, shotIndex2) => {
                  // check if the second shot also hit
                  if (shot2.checkDoubleShot(rock.x, rock.y, rock.width, rock.height)) {
                     this.playerProjectiles.splice(shotIndex2, 1);
                  }
               });
               // remove rock from array
               this.rocks.splice(index, 1);
            }
         });
      });
      // ### Check for player collisions with enemies ###
      this.enemies.forEach((enemy, index) => {
         if (enemy.checkIntersection(this.player)) {
            this.enemies.splice(index, 1);
            this.player.health -= 10;
            this.lose();
         }
         // ### Check for player projectiles ###
         this.playerProjectiles.forEach((shot, shotIndex) => {
            if (enemy.checkIntersection(shot)) {
               // check if any shot hit the enemy
               this.playerProjectiles.splice(shotIndex, 1);
               this.playerProjectiles.forEach((shot2, shotIndex2) => {
                  // check if the second shot also hit
                  if (shot2.checkDoubleShot(enemy.x, enemy.y, enemy.width, enemy.height)) {
                     this.playerProjectiles.splice(shotIndex2, 1);
                  }
               });
               // remove enemy from array
               this.enemies.splice(index, 1);
            }
         });
      });
      // ### Check player for enemy projectile hits ###
      this.enemyProjectiles.forEach((shot, index) => {
         if (shot.checkIntersection(this.player)) {
            this.enemyProjectiles.splice(index, 1);
            this.player.health -= 10;
            this.lose();
         }
      })
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
