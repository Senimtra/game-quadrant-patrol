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
      this.power = 500;
      this.lives = 4;
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

   drawLives() {
      let livesUi = '';
      for (let i = 0; i < this.lives; i++) {
         livesUi += ' #';
      }
      return livesUi;
   }
}
