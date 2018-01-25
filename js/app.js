var player = new Player();

function resetPlayer() {
    player.x = 2;
    player.y = 5;
}

function generateEnemies() {
    var enemiesAmount = Math.ceil(Math.random() * 10);
    for (let i = 0; i < enemiesAmount; i++) {
        var enemy = new Enemy();
        Engine.addEnemy(enemy);
    }
}

Engine.setPlayer(player);
Engine.addEventListener('start', resetPlayer);
Engine.addEventListener('start', generateEnemies);

// Now instantiate your objects. And register then in Engine.registerEntity.
// They must have the Engine.Entity prototype chain.

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
Engine.addEventListener('keyup', function(e) {
    var movementKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(movementKeys[e.keyCode]);
});

Engine.addEventListener('menu:keyup', function(e) {
    var movementKeys = {
        37: 'left',
        39: 'right',
    };

    player.change(movementKeys[e.keyCode]);
});
