// Enemies our player must avoid
var Enemy = function () {
    var isStartingLeft = !!Math.round(Math.random());
    this.sprite = 'images/enemy-bug.png';
    this.speed = Math.random() * 3;
    this.y = Math.floor(Math.random() * 3) + 1;
    this.direction = isStartingLeft ? Engine.Entity.Direction.LEFT : Engine.Entity.Direction.RIGHT;
    this.x = isStartingLeft ? Engine.Edge.LEFT - 1 :  Engine.Edge.RIGHT + 1;
};

Enemy.prototype = Object.create(Engine.Entity.prototype);
Enemy.prototype.constructor = Enemy;

Enemy.prototype.update = function (delta) {
    this.x += delta * this.speed * this.direction;
    if (this.x > Engine.Edge.RIGHT + 1) {
        this.direction = Engine.Entity.Direction.LEFT;
    }
    if (this.x < Engine.Edge.LEFT - 1) {
        this.direction = Engine.Entity.Direction.RIGHT;
    }
}
