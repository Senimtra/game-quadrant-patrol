/*
######################################
## JS Canvas Game - Quadrant Patrol ##
###################################### */

class Game {
   constructor(canvas) {
      this.canvas = canvas;
      // ### access the drawing context ###
      this.context = canvas.getContext('2d');
   }

   start() {
      // ### create new player instance ###
      this.player = new Player(this, this.canvas.width / 2, this.canvas.height - 50);
      this.rocks = [];
      this.lastRockSpawn = Date.now();
      this.rockSpawnInterval = 2000;
      this.enableControls();
      this.displayRefresh();
   }

   drawEverything() {
      // ### draw everything to canvas ###
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
   }

   spawnRock() {
      // ### Push new rocks to array ###
      const rock = new Rock(this, (Math.floor(Math.random() * (this.canvas.width - 50)) + 1), 0);
      this.rocks.push(rock);
   }

   enableControls() {
      // ### enable player controls ###
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
      // ### clear whole canvas ###
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
   }

   checkBoundaries() {
      // ### prevent player from moving out of the canvas ###
      if ((this.player.x + this.player.width) >= this.canvas.width) {
         this.player.x = this.canvas.width - this.player.width;
      } else if (this.player.x <= 0) {
         this.player.x = 0;
      }
   }

   displayRefresh() {
      // ### refresh canvas on every frame ###
      this.clearScreen();
      this.runLogic();
      this.drawEverything();
      window.requestAnimationFrame(() => {
         this.displayRefresh();
      })
   }
}
