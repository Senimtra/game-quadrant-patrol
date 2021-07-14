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
      this.score = 0;
      this.rocks = [];
      this.enemies = [];
      this.paused = false;
      this.powerUpSpawned = false;
      this.playerProjectiles = [];
      this.enemyProjectiles = [];
      this.lastRockSpawn = Date.now();
      this.lastEnemySpawn = Date.now();
      this.powerUpProbability = Math.random() < 1;
      this.rockSpawnInterval = 1000;
      this.enemySpawnInterval = 5000;
      this.clock();
      this.enableControls();
      this.displayRefresh();
      this.drawFps();
   }

   drawEverything() {
      // ### Draw shielded player ###
      if (this.player.shieldsUp) {
         this.player.drawShields();
         // draw player powershots
      } else if (this.player.powerShots) {
         this.player.drawPowerShots();
      } else {
         // normal player
         this.player.drawPlayer();
      }
      // ### Draw rocks ###
      for (const rock of this.rocks) {
         rock.drawRock();
      }
      // ### Draw player projectiles ###
      for (const playerShot of this.playerProjectiles) {
         playerShot.drawProjectile(this);
      }
      // ### Draw enemies ###
      for (const enemy of this.enemies) {
         enemy.drawEnemy();
      }
      // ### Draw enemy projectiles ###
      for (const enemyShot of this.enemyProjectiles) {
         enemyShot.drawEnemyProjectile(this);
      }
      if (this.powerUpSpawned === true) {
         this.powerUp.drawPowerUp();
      }
      this.executeControls();
   }

   runLogic() {
      // ### Run player logic ###
      this.player.runLogic();
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
      // ### Run PowerUp logic ###
      if (this.powerUpSpawned === true) {
         this.powerUp.runLogic();
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
      // ### Check if powerup moved oob ###
      if ((this.powerUpSpawned === true) && (this.powerUp.y > this.canvas.height)) {
         this.powerUpSpawned = false;
      }
   }

   enableControls() {
      // ### Cope with JS keydown-handler delay ###
      this.controls = {
         ArrowLeft: { pressed: false },
         ArrowRight: { pressed: false },
         Space: { pressed: false },
         KeyD: { pressed: false },
         KeyF: { pressed: false },
         Escape: { pressed: false }
      }
      window.addEventListener('keydown', (event) => {
         // ### Activate keys in controller object ###
         if (this.controls[event.code]) {
            this.controls[event.code].pressed = true
         }
         switch (event.code) {
            case 'Space':
               this.player.fireProjectile();
               break;

         }
         this.player.checkBoundaries();
      });
      window.addEventListener('keyup', (event) => {
         // ### Deactivate keys in controller object ###
         if (this.controls[event.code]) {
            this.controls[event.code].pressed = false;
         }
      });
   }

   executeControls() {
      // ### Execute key functions by keystate ###
      if (this.controls['Escape'].pressed === true) this.quitGame();
      if (this.controls['ArrowLeft'].pressed === true) this.player.moveLeft();
      if (this.controls['ArrowRight'].pressed === true) this.player.moveRight();
      // if (this.controls['Space'].pressed === true) this.player.fireProjectile();
      if ((this.controls['KeyD'].pressed === true) && (this.player.powerShots === false)) this.player.activateShield();
      if ((this.controls['KeyD'].pressed === false) && (this.player.shieldsUp === true)) this.player.lowerShield();
      if ((this.controls['KeyF'].pressed === true) && (this.player.shieldsUp === false)) this.player.powerShotsOn();
      if ((this.controls['KeyF'].pressed === false) && (this.player.powerShots === true)) this.player.powerShotsOff();
      this.player.checkBoundaries();
   }

   clearScreen() {
      // ### Clear whole canvas ###
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
   }

   checkCollisions() {
      // ### Check for player collisions with rocks ###
      this.rocks.forEach((rock, index) => {
         if (rock.checkIntersection(this.player)) {
            this.rocks.splice(index, 1);
            // check if shields are up
            if (!this.player.shieldsUp) {
               this.player.health -= 10;
               this.lose();
            }
            this.score += 50;
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
                     this.rocks[index].health -= 50;
                  }
               });
               // ### Check rock health ###
               this.rocks[index].health -= 50;
               if (this.rocks[index].health <= 0) {
                  // remove rock from array
                  this.rocks.splice(index, 1);
               }
               this.score += 50;
            }
         });
      });
      // ### Check for player collisions with enemies ###
      this.enemies.forEach((enemy, index) => {
         if (enemy.checkIntersection(this.player)) {
            this.enemies.splice(index, 1);
            // check if shields are up
            if (!this.player.shieldsUp) {
               this.player.health -= 10;
               this.lose();
            }
            this.score += 100;
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
                     this.enemies[index].health -= 50;
                  }
               });
               // ### Check enemy health ###
               this.enemies[index].health -= 50;
               if (this.enemies[index].health <= 0) {
                  // spawn one powerup at a time occasionally
                  if ((this.powerUpProbability) && (this.powerUpSpawned === false)) {
                     let direction;
                     // set arc direction depending on x
                     (this.enemies[index].x + 10 > this.canvas.width / 2) ? direction = -1 : direction = 1;
                     if (Math.random() < 0.5) {
                        this.powerUp = new PowerUp(this, this.enemies[index].x + 10, this.enemies[index].y + 10, direction, 'power');
                     } else {
                        this.powerUp = new HealthUp(this, this.enemies[index].x + 10, this.enemies[index].y + 10, direction, 'health');
                     }
                     this.powerUpSpawned = true;
                  }
                  // remove enemy from array
                  this.enemies.splice(index, 1);
               }
               this.score += 100;
            }
         });
      });
      // ### Check player for enemy projectile hits ###
      this.enemyProjectiles.forEach((shot, index) => {
         if (shot.checkIntersection(this.player)) {
            if (this.player.shieldsUp) {
               // push reflected shots from player to enemy array
               this.enemyProjectiles[index].reflect = true;
               this.playerProjectiles.push(this.enemyProjectiles[index]);
            } else {
               this.player.health -= 10;
               this.lose();
            }
            // remove shot if hit unprotected
            this.enemyProjectiles.splice(index, 1);
         }
      });
      // ### Check player for powerup hits ###
      if ((this.powerUpSpawned === true) && (this.powerUp.checkIntersection(this.player))) {
         this.powerUpSpawned = false;
         if (this.powerUp.bonus === 'power') {
            this.player.power += 500;
         } else {
            this.player.health += 50;
         }
      }
   }

   clock() {
      // ### Cope with different display refresh rates ###
      window.clockTimer = setInterval(() => {
         this.runLogic();
      }, 16.67); // 60 fps
   }

   lose() {
      // ### Check for player's health and lives ###
      if (this.player.health <= 0) {
         this.player.lives--;
         // player is dead
         if (this.player.lives === 0) {
            canvasElement.style.display = 'none';
            gameOverScreenElement.style.display = 'flex';
            clearInterval(window.clockTimer);
         } else {
            // player starts a new life
            console.log(`You lost a live - ${this.player.lives} lives remaining!`);
            clearInterval(window.clockTimer);
            setTimeout(() => this.clock(), 3000);
            this.player.health = 200;
         }
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

   quitGame() {
      if (this.paused === false) {
         clearInterval(window.clockTimer);
         this.paused = true;
         introScreenElement.style.display = 'flex';
         canvasElement.style.display = 'none';
      }
   }

   drawUI() {
      // ### Draw UI elements ###
      this.context.save();
      this.context.fillStyle = '#6C3483';
      this.context.fillRect(0, 0, this.canvas.width, 60);
      this.context.fillRect(0, this.canvas.height - 60, this.canvas.width, 60);
      this.context.restore();
      // draw the current fps
      this.context.save();
      this.context.textAlign = 'right';
      this.context.font = '12px Arial';
      this.context.fillText(`FPS: ${this.fps}`, this.canvas.width - 20, 19);
      this.context.restore();
      this.context.font = '45px Arial';
      // draw the game logo
      this.context.strokeText('Quadrant Patrol', 8, 44);
      // draw player health
      this.context.font = '18px Arial';
      this.context.fillText(`HEALTH: ${this.player.health}`, 20, this.canvas.height - 12);
      // draw player score
      this.context.fillText(`SCORE: ${this.score}`, 300, this.canvas.height - 12);
      // draw player power
      this.context.fillText(`POWER: ${this.player.power}`, 155, this.canvas.height - 12);
      // draw player lives
      this.context.save();
      this.context.textAlign = 'right';
      this.context.fillText(`Lives ${this.player.drawLives()}`, this.canvas.width - 20, 45);
      this.context.restore();
      // draw instruction
      this.context.save();
      this.context.font = '9px Arial';
      this.context.fillText('MOVE => LEFT/RIGHT | FIRE => SPACE | SHIELD => D | POWERSHOTS => F  |  RED: ENEMY | DARK : ROCK', 20, this.canvas.height - 40);
      this.context.restore();
      // draw powerups
      this.context.save();
      this.context.font = '9px Arial';
      this.context.textAlign = 'left';
      this.context.fillText('Power', 455, this.canvas.height - 20);
      this.context.fillText('Health', 455, this.canvas.height - 10);
      this.context.fillStyle = 'blue';
      this.context.fillRect(445, this.canvas.height - 27, 7, 7)
      this.context.fillStyle = 'green';
      this.context.fillRect(445, this.canvas.height - 17, 7, 7)
      this.context.restore();
   }
}
