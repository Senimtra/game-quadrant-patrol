/*
######################################
## JS Canvas Game - Quadrant Patrol ##
###################################### */

const uiGameFrame = new Image();

uiGameFrame.src = './images/ui_game_frame.png';

class Game {
   constructor(canvas, canvasBg) {
      this.canvas = canvas;
      this.canvasBg = canvasBg;
      // ### Access the drawing context ###
      this.context = canvas.getContext('2d');
      this.contextBg = canvasBg.getContext('2d');
      this.running = false;
   }

   start() {
      // ### Create new player instance ###
      this.player = new Player(this, this.canvas.width / 2, this.canvas.height - 120);
      this.frame = 0;
      this.score = 0;
      this.rocks = [];
      this.enemies = [];
      this.playerExplosions = [];
      this.enemyExplosions = [];
      this.razorExplosions = [];
      // this.paused = false;
      this.powerUpSpawned = false;
      this.playerProjectiles = [];
      this.enemyProjectiles = [];
      this.lastRockSpawn = Date.now();
      this.lastEnemySpawn = Date.now();
      this.powerUpProbability = Math.random() < 1;
      this.rockSpawnInterval = 750;
      this.enemySpawnInterval = 2000;
      this.clock();
      this.enableControls();
      if (this.running === false) {
         this.displayRefresh();
         this.running = true;
      }
   }

   drawEverything() {
      // ### Draw shielded player ###
      if (this.player.shieldsUp) {
         this.player.drawShields();
         // draw player powershots
      } else if (this.player.wingsUp) {
         this.player.drawWings();
      } else {
         // normal player
         this.player.drawPlayer();
      }
      // ### Draw rocks ###
      for (const rock of this.rocks) {
         rock.drawRock();
      }
      // ### Draw Player enemy/rock explosions ###
      for (const playerExplosion of this.playerExplosions) {
         playerExplosion.drawPlayerExplosion();
      }
      // ### Draw player projectiles ###
      for (const playerShot of this.playerProjectiles) {
         playerShot.drawProjectile(this);
      }
      // ### Draw enemies ###
      for (const enemy of this.enemies) {
         enemy.drawEnemy();
      }
      // ### Draw rock/enemy explosions ###
      for (const enemyExplosion of this.enemyExplosions) {
         enemyExplosion.drawEnemyExplosion();
      }
      // ### Draw razor rock/enemy explosions ###
      for (const razorExplosion of this.razorExplosions) {
         razorExplosion.drawRazorExplosion();
      }
      // ### Draw enemy projectiles ###
      for (const enemyShot of this.enemyProjectiles) {
         enemyShot.drawEnemyProjectile(this);
      }
      // ### Draw power ups ###
      if (this.powerUpSpawned === true) {
         if (this.powerUp.bounced === true) {
            this.powerUp.drawRazor();
         } else {
            this.powerUp.drawPowerUp();
         }
      }
      this.executeControls();
   }

   updateBackgroundCanvas() {
      backgroundImage.move();
      this.contextBg.clearRect(0, 0, this.canvasBg.width, this.canvasBg.height);
      backgroundImage.draw();
   }

   runLogic() {
      // ### Run player logic ###
      this.player.runLogic();
      this.player.frame++;
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
         rock.frame++;
         rock.runLogic();
      }
      // ### Run player rock/enemy explosion logic ###
      this.playerExplosions.forEach((playerExplosion, index) => {
         if (playerExplosion.animationFrame === 64) this.playerExplosions.splice(index, 1);
         playerExplosion.runLogic();
      });
      // ### Run rock/enemy explosion logic ###
      this.enemyExplosions.forEach((enemyExplosion, index) => {
         if (enemyExplosion.animationFrame === 64) this.enemyExplosions.splice(index, 1);
         enemyExplosion.runLogic();
      });
      // ### Run razor explosion logic ###
      this.razorExplosions.forEach((razorExplosion, index) => {
         if (razorExplosion.animationFrame === 64) this.razorExplosions.splice(index, 1);
         razorExplosion.runLogic();
      });
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
      const enemy = new Enemy(this, (Math.floor(Math.random() * (this.canvas.width - 60)) + 1), 4);
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
         // roll back to center position
         if ((event.code === 'ArrowLeft') || (event.code === 'ArrowRight')) {
            this.player.animationRunning = false;
            this.player.animationStart = 0;
            // this.player.animation = 6;
         }
      });
   }

   executeControls() {
      // ### Execute key functions by keystate ###
      if (this.controls['Escape'].pressed === true) this.quitGame();
      if (this.controls['ArrowLeft'].pressed === true) {
         this.player.moveLeft();
         // initialize player roll animation left
         if (this.player.animationRunning === false) {
            this.player.animationRunning = true;
            this.player.animationStart = Date.now();
         }
      }
      if (this.controls['ArrowRight'].pressed === true) {
         this.player.moveRight();
         // initialize player roll animation right
         if (this.player.animationRunning === false) {
            this.player.animationRunning = true;
            this.player.animationStart = Date.now();
         }
      }
      // if (this.controls['Space'].pressed === true) this.player.fireProjectile();
      this.player.checkBoundaries();
   }

   clearScreen() {
      // ### Clear whole canvas ###
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
   }

   checkCollisions() {
      // ### Check for player collisions with rocks ###
      this.rocks.forEach((rock, index) => {
         if (this.player.shieldsUp && this.player.checkIntersectionShield(rock)) {
            // Spawn player/rock explosion
            const rockBoom = new Explosion(this, rock.x, rock.y, rock.width);
            this.playerExplosions.push(rockBoom);
            this.rocks.splice(index, 1);
            this.score += 50;
         } else if (!this.player.shieldsUp && this.player.checkIntersection(rock)) {
            // Spawn player/rock explosion
            const rockBoom = new Explosion(this, rock.x, rock.y, rock.width);
            this.playerExplosions.push(rockBoom);
            this.rocks.splice(index, 1);
            this.player.health -= 250;
            this.lose();
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
                  // Spawn rock explosion
                  const rockShot = new Explosion(this, rock.x, rock.y, rock.width);
                  this.enemyExplosions.push(rockShot);
                  // remove rock from array
                  this.rocks.splice(index, 1);
               }
               this.score += 50;
            }
         });
      });
      // ### Check for player collisions with enemies ###
      this.enemies.forEach((enemy, index) => {
         if (this.player.shieldsUp && this.player.checkIntersectionShield(enemy)) {
            // Spawn player/enemy explosion
            const enemyBoom = new Explosion(this, enemy.x, enemy.y, enemy.width);
            this.playerExplosions.push(enemyBoom);
            this.enemies.splice(index, 1);
            this.score += 100;
         } else if (!this.player.shieldsUp && this.player.checkIntersection(enemy)) {
            // Spawn player/enemy explosion
            const enemyBoom = new Explosion(this, enemy.x, enemy.y, enemy.width);
            this.playerExplosions.push(enemyBoom);
            this.enemies.splice(index, 1);
            this.player.health -= 50;
            this.lose();
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
                     switch (Math.floor(Math.random() * 5) + 1) {
                        case 1:
                           this.powerUp = new ShieldUp(this, this.enemies[index].x + 10, this.enemies[index].y + 10, direction, 'shield', 1);
                           break;
                        case 2:
                           this.powerUp = new HealthUp(this, this.enemies[index].x + 10, this.enemies[index].y + 10, direction, 'health', 2);
                           break;
                        case 3:
                           this.powerUp = new WingsUp(this, this.enemies[index].x + 10, this.enemies[index].y + 10, direction, 'wings', 4);
                           break;
                        case 4:
                           this.powerUp = new BounceUp(this, this.enemies[index].x + 10, this.enemies[index].y + 10, direction, 'bounce', 5);
                           break;
                        case 5:
                           this.powerUp = new ScoreUp(this, this.enemies[index].x + 10, this.enemies[index].y + 10, direction, 'score', 3)
                     }
                     this.powerUpSpawned = true;
                  }
                  // Spawn rock explosion
                  const enemyShot = new Explosion(this, enemy.x, enemy.y, enemy.width);
                  this.enemyExplosions.push(enemyShot);
                  // remove enemy from array
                  this.enemies.splice(index, 1);
               }
               this.score += 100;
            }
         });
      });
      // ### Check player for enemy projectile hits ###
      this.enemyProjectiles.forEach((shot, index) => {
         if (this.player.shieldsUp && this.player.checkIntersectionShield(shot)) {
            // push reflected shots from player to enemy array
            this.enemyProjectiles[index].reflect = true;
            this.playerProjectiles.push(this.enemyProjectiles[index]);
            this.enemyProjectiles.splice(index, 1);
         } else if (!this.player.shieldsUp && this.player.checkIntersection(shot)) {
            this.player.health -= 20;
            this.lose();
            this.enemyProjectiles.splice(index, 1);
         }
      });
      // ### Check player for powerup hits ###
      if ((this.powerUpSpawned === true) && (this.player.checkIntersection(this.powerUp))) {
         this.powerUpSpawned = false;
         switch (this.powerUp.bonus) {
            case 'shield':
               this.player.shieldPower += this.player.powerGain - this.player.shieldPower;
               this.player.wingsPower = 0;
               this.player.activateShield();
               break;
            case 'health':
               if (this.player.health < this.player.maxHealth - this.player.healthGain) {
                  this.player.health += this.player.healthGain;
               }
               break;
            case 'wings':
               this.player.wingsPower += this.player.powerGain - this.player.wingsPower;
               this.player.shieldPower = 0;
               this.player.wingsOn();
               break;
            case 'score':
               this.score += 10000;
               break;
            case 'bounce':
               this.powerUpSpawned = true;
               this.powerUp.bounced = true;
         }
      }
   }

   clock() {
      // ### Cope with different display refresh rates ###
      window.clockTimer = setInterval(() => {
         this.runLogic();
      }, 10); // 100 ups
   }

   lose() {
      // ### Check for player's health and lives ###
      if (this.player.health <= 0) {
         this.player.lives--;
         // player is dead
         if (this.player.lives === 0) {
            gameCanvasElement.style.display = 'none';
            backgroundCanvasElement.style.display = 'none';
            gameOverScreenElement.style.display = 'flex';
            clearInterval(window.clockTimer);
         } else {
            // player starts a new life
            clearInterval(window.clockTimer);
            setTimeout(() => this.clock(), 3000);
            this.player.health = this.player.maxHealth;
         }
      }
   }

   displayRefresh() {
      // ### Refresh canvas on every frame ###
      this.clearScreen();
      this.drawEverything();
      this.updateBackgroundCanvas();
      this.drawUI();
      window.requestAnimationFrame(() => {
         this.displayRefresh();
      })
      this.frame++;
   }

   quitGame() {
      clearInterval(window.clockTimer);
   }

   // ### Draw UI elements ###
   drawUI() {
      // draw game frame
      this.context.drawImage(uiGameFrame, 0, 0);
      // draw player score
      this.context.save();
      this.context.fillStyle = 'cyan';
      this.context.font = '30px spaceMission';
      this.context.fillText(`SCORE: ${this.score}`, 30, 42);
      this.context.fillStyle = 'black';
      this.context.lineWidth = 2;
      this.context.strokeText(`SCORE: ${this.score}`, 30, 42);
      // draw player lives
      this.player.drawLives();
      // power container bar
      this.context.drawImage(powerBar, 32, this.canvas.height - 45, 208, 30);
      // health container bar
      this.context.drawImage(healthBar, this.canvas.width - 240, this.canvas.height - 45, 208, 30);
      // draw health bar dummy unit background
      for (let j = 1; j <= 21; j++) {
         this.context.drawImage(dummyUnit, 0, 0, 30, 58, 266 + (j * 8 - 8), this.canvas.height - 40, 6, 20);
      }
      // draw health bar units
      for (let i = 1; i <= this.player.healthUnits; i++) {
         this.context.drawImage(healthUnit, 0, 0, 30, 58, 266 + (i * 8 - 8), this.canvas.height - 40, 6, 20);
      }
      // draw power bar dummy unit background
      for (let i = 1; i <= 21; i++) {
         this.context.drawImage(dummyUnit, 0, 0, 30, 58, this.canvas.width - 272 - i * 8 + 8, this.canvas.height - 40, 6, 20);
      }
      // draw power bar units
      for (let i = 1; i <= this.player.powerUnits; i++) {
         this.context.drawImage(powerUnit, 0, 0, 30, 58, this.canvas.width - 272 - i * 8 + 8, this.canvas.height - 40, 6, 20);
      }
      this.context.restore();
   }
}
