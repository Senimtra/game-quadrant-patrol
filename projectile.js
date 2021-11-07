/*
######################################
## JS Canvas Game - Quadrant Patrol ##
###################################### */

const projectilesImage = new Image();
projectilesImage.src = './images/projectiles.png';

class Projectile {
  constructor(game, x, y) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.vy = 3;
    this.height = 18;
    this.width = 6;
  }

  runLogic() {
    this.y -= this.vy;
  }

  checkDoubleShot(elementX, elementY, elementW, elementH) {
    // ### Check for players second shot ###
    return (
      this.x + this.width >= elementX &&
      this.x <= elementX + elementW &&
      this.y <= elementY + elementH)
  }

  drawProjectile(game) {
    this.game = game;
    this.game.context.save();
    // keep enemy color for reflected shots
    if (this.reflect === true) {
      // this.game.context.fillStyle = 'yellow';

      this.game.context.drawImage(projectilesImage, 48, 0, 24, 36, Math.floor(this.x) - 9, Math.floor(this.y) - 8, 24, 36);
    } else {
      // this.game.context.fillStyle = 'blue';
      this.game.context.globalCompositeOperation = 'destination-over';
      this.game.context.drawImage(projectilesImage, 0, 0, 24, 42, Math.floor(this.x) - 9, Math.floor(this.y) - 6, 24, 42);
    }
    // let projectiles start beneath player
    // this.game.context.globalCompositeOperation = 'destination-under';
    // this.game.context.fillRect(Math.floor(this.x), Math.floor(this.y), this.width, this.height);
    // this.game.context.drawImage(projectilesImage, 0, 0, 24, 42, Math.floor(this.x) - 9, Math.floor(this.y) - 6, 24, 42);
    this.game.context.restore();
  }
}

class EnemyProjectile extends Projectile {
  constructor(game, x, y) {
    super(game, x, y);
    this.reflect = false;
  }

  runLogic() {
    // change direction if reflected
    if (this.reflect === true) {
      this.y -= this.vy;
    } else {
      this.y += this.vy;
    }
  }

  checkIntersection(element) {
    return (
      // turns true if right side of element is beyond left side of projectile
      element.x + element.width >= this.x &&
      // turns true if left side of element is beyond right side of projectile
      element.x <= this.x + this.width &&
      // turns true if top edge of element is above bottom edge of projectile
      element.y <= this.y + this.height &&
      // turns true if bottom side of element is beyond top side of projectile
      element.y + element.height >= this.y
    );
  }

  drawEnemyProjectile() {
    this.game.context.save();
    this.game.context.fillStyle = 'yellow';
    // let projectiles start beneath enemy
    this.game.context.globalCompositeOperation = 'destination-over';
    // this.game.context.fillRect(Math.floor(this.x), Math.floor(this.y), this.width, this.height);
    this.game.context.drawImage(projectilesImage, 24, 0, 24, 36, Math.floor(this.x) - 9, Math.floor(this.y) - 14, 24, 36);
    this.game.context.restore();
  }
}


