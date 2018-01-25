var Player = function() {
    var availableSprites = [
        'images/char-boy.png',
        'images/char-cat-girl.png',
        'images/char-horn-girl.png',
        'images/char-pink-girl.png',
        'images/char-princess-girl.png',
    ]
    this.sprite = 'images/char-boy.png';
    this.change = (direction) => {
        if(!direction) {
            return;
        }
        var index = availableSprites.indexOf(this.sprite);
        switch(direction) {
            case 'left': {
                if(index === 0) {
                    index = availableSprites.length - 1;
                    break;
                }
                index--;
                break;
            }
            case 'right': {
                if(index === availableSprites.length -1) {
                    index = 0;
                    break;
                }
                index ++;
                break;
            }
        }
        Resources.load(availableSprites[index], () => {
            this.sprite = availableSprites[index];
        })
    }
}

Player.prototype = Object.create(Engine.Entity.prototype);
Player.prototype.constructor = Player;

Player.prototype.handleInput = function(position) {
    switch(position) {
        case 'left': {
            if (this.x === Engine.Edge.LEFT) {
                return;
            }
            this.x--;
            break;
        }
        case 'right': {
            if (this.x === Engine.Edge.RIGHT) {
                return;
            }
            this.x++;
            break;
        }
        case 'up': {
            if (this.y === Engine.Edge.TOP) {
                return;
            }
            this.y --;
            break;
        }
        case 'down': {
            if(this.y === Engine.Edge.BOTTOM) {
                return;
            }
            this.y++;
            break;
        }
    }
}
