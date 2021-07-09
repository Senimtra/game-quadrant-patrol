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
      this.player = new Player(this, this.canvas.width / 2, this.canvas.height - 50);
      this.frame = 0;
      this.fps = 0;
      this.rocks = [];
      this.lastRockSpawn = Date.now();
      this.rockSpawnInterval = 2000;
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
      this.collectGarbage();
   }

   spawnRock() {
      // ### Push new rocks to array ###
      const rock = new Rock(this, (Math.floor(Math.random() * (this.canvas.width - 50)) + 1), 0);
      this.rocks.push(rock);
   }

   collectGarbage() {
      // ### Remove objects that moved out of the canvas ###
      this.rocks.forEach((rock, index) => {
         if (rock.y > this.canvas.height) {
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

   clock() {
      /* ### Avoids different speeds on ###
         ### different display refresh rates ### */
      setInterval(() => {
         this.runLogic();
      }, 15);
   }

   displayRefresh() {
      // ### Refresh canvas on every frame ###
      this.clearScreen();
      this.drawEverything();
      window.requestAnimationFrame(() => {
         this.displayRefresh();
      })
      this.frame++;
      this.context.fillText(this.fps, 20, 20);
   }

   drawFps() {
      // ### Calculate the actual fps ###
      setInterval(() => {
         this.fps = this.frame;
         this.frame = 0;
      }, 1000);
   }
}
