/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When your player moves across
 * the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.
 *
 * This engine makes the canvas' context (ctx) object globally available to make 
 * writing app.js a little simpler to work with.
 */

var Engine = (function(global) {
    //#region Entity
    var isEntity = Symbol('EntityChecker');
    var Entity = function() {};
    
    // Update the entities' position, required method for game
    // Parameter: dt, a time delta between ticks
    Entity.prototype.update = function(dt) {
        // You should multiply any movement by the dt parameter
        // which will ensure the game runs at the same speed for
        // all computers.
    };
    
    // Draw the entities on the screen, required method for game
    Entity.prototype.render = function() {
        ctx.drawImage(Resources.get(this.sprite), this.x * 101, this.y * 80 - 25);
        if(Engine.debugCollisions) {
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.strokeStyle = '#ffffff';
            if (this instanceof Enemy) {
                ctx.strokeRect(this.x * 101, this.y * 80 + 25, 101, 101);
            }
            if (this instanceof Player) {
                ctx.strokeRect(this.x * 101 + 15, this.y * 80 + 25, 71, 101);
            }
        }
    };

    Entity.prototype[isEntity] = true;
    Entity.prototype.x = -1;
    Entity.prototype.y = 0;
    Entity.Direction = {
        RIGHT: 1,
        LEFT: -1,
    };
    //#endregion

    //#region GameState
    var GameState = function () {
        var isGameOver = false;
        var isStarted = false;
        var isPlaying = false;
        var messages = {
            gameOver: document.getElementById('gameOver'),
            win: document.getElementById('win'),
            welcome: document.getElementById('welcome'),
            pause: document.getElementById('pause'),
        }

        function Restart() {
            isGameOver = false;
            isStarted = false;
            isPlaying = false;
            messages.gameOver.classList.add('hidden');
            messages.win.classList.add('hidden');
            messages.pause.classList.add('hidden');
            messages.welcome.classList.remove('hidden');
        }

        function Start() {
            isGameOver = false;
            isStarted = true;
            isPlaying = true;
            messages.welcome.classList.add('hidden');
        }

        function GameOver() {
            isGameOver = true;
            isStarted = false;
            isPlaying = false;
        }

        function Win() {
            GameOver();
            messages.win.classList.remove('hidden');
        }

        function Lose() {
            GameOver();
            messages.gameOver.classList.remove('hidden');
        }
        
        function Pause() {
            isPlaying = false;
            messages.pause.classList.remove('hidden');
        }
        
        function Resume() {
            isPlaying = true;
            messages.pause.classList.add('hidden');
        }

        return {
            isGameOver() { return isGameOver },
            isPaused() { return isPaused },
            isPlaying() { return isPlaying },
            isStarted() { return isStarted },
            Lose,
            Pause,
            Restart,
            Resume,
            Start,
            Win,
        }
    }
    //#endregion
    
    /* Predefine the variables we'll be using within this scope,
     * create the canvas element, grab the 2D context for that canvas
     * set the canvas elements height/width and add it to the DOM.
     */
    var doc = global.document;
    var win = global.window;
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');
    var lastTime;
    var enemies = [];
    var startCallbacks = [];
    var events = {};
    var state = GameState();
    var player = void 0;
    var Edge = {
        TOP: 0,
        LEFT: 0,
        RIGHT: 4,
        BOTTOM: 5,
    }

    canvas.width = 505;
    canvas.height = 606;

    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     */
    function main() {
        /* Get our time delta information which is required if your game
         * requires smooth animation. Because everyone's computer processes
         * instructions at different speeds we need a constant value that
         * would be the same for everyone (regardless of how fast their
         * computer is) - hurray time!
         */
        var now = Date.now(),
            dt = (now - lastTime) / 1000.0;

        /* Call our update/render functions, pass along the time delta to
         * our update function since it may be used for smooth animation.
         */
        update(dt);
        render();

        /* Set our lastTime variable which is used to determine the time delta
         * for the next time this function is called.
         */
        lastTime = now;

        /* Use the browser's requestAnimationFrame function to call this
         * function again as soon as the browser is able to draw another frame.
         */
        win.requestAnimationFrame(main);
    }

    /* This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     */
    function init() {
        reset();
        lastTime = Date.now();
        main();
    }

    /* This function is called by main (our game loop) and itself calls all
     * of the functions which may need to update entity's data. Based on how
     * you implement your collision detection (when two entities occupy the
     * same space, for instance when your character should die), you may find
     * the need to add an additional function call here. For now, we've left
     * it commented out - you may or may not want to implement this
     * functionality this way (you could just implement collision detection
     * on the entities themselves within your app.js file).
     */
    function update(dt) {
        if(!state.isPlaying()) {
            return;
        }
        updateEntities(dt);
        checkCollisions();
        checkWin();
    }

    /* This is called by the update function and loops through all of the
     * objects within your allEnemies array as defined in app.js and calls
     * their update() methods. It will then call the update function for your
     * player object. These update methods should focus purely on updating
     * the data/properties related to the object. Do your drawing in your
     * render methods.
     */
    function updateEntities(dt) {
        enemies.forEach(entity => entity.update(dt));
        if(!player) {
            return;
        }
        player.update(dt);
    }

    function checkCollisions() {
        if(enemies
            .filter(enemy => enemy.y === player.y)
            .some(enemy => enemy.x + .80 >= player.x && enemy.x <= player.x + .80))
        {
            state.Lose();
        };
    }

    function checkWin() {
        if (player.y === Edge.TOP) {
            state.Win();
        }
    }

    /* This function initially draws the "game level", it will then call
     * the renderEntities function. Remember, this function is called every
     * game tick (or loop of the game engine) because that's how games work -
     * they are flipbooks creating the illusion of animation but in reality
     * they are just drawing the entire screen over and over.
     */
    function render() {
        /* This array holds the relative URL to the image used
         * for that particular row of the game level.
         */
        var rowImages = [
                'images/water-block.png',   // Top row is water
                'images/stone-block.png',   // Row 1 of 3 of stone
                'images/stone-block.png',   // Row 2 of 3 of stone
                'images/stone-block.png',   // Row 3 of 3 of stone
                'images/grass-block.png',   // Row 1 of 2 of grass
                'images/grass-block.png'    // Row 2 of 2 of grass
            ],
            numRows = 6,
            numCols = 5,
            row, col;
        
        // Before drawing, clear existing canvas
        ctx.clearRect(0,0,canvas.width,canvas.height)

        /* Loop through the number of rows and columns we've defined above
         * and, using the rowImages array, draw the correct image for that
         * portion of the "grid"
         */
        for (row = 0; row < numRows; row++) {
            for (col = 0; col < numCols; col++) {
                /* The drawImage function of the canvas' context element
                 * requires 3 parameters: the image to draw, the x coordinate
                 * to start drawing and the y coordinate to start drawing.
                 * We're using our Resources helpers to refer to our images
                 * so that we get the benefits of caching these images, since
                 * we're using them over and over.
                 */
                ctx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83);
            }
        }

        renderEntities();
    }

    /* This function is called by the render function and is called on each game
     * tick. Its purpose is to then call the render functions you have defined
     * on your enemy and player entities within app.js
     */
    function renderEntities() {
        enemies.forEach(entity => entity.render());
        if(!player) {
            return;
        }
        player.render();
    }

    /* This function does nothing but it could have been a good place to
     * handle game reset states - maybe a new game menu or a game over screen
     * those sorts of things. It's only called once by the init() method.
     */
    function reset() {
        state.Restart();
        enemies = [];
        if(!events['start']) {
            return;
        }
        events['start'].forEach(cb => cb());
    }

    /**
     * Function to register an entity
     */
    function addEnemy(enemy) {
        if(!enemy[isEntity]) {
            console.warn(`${enemy} does not appear to have the Entity prototype chain call`);
            return;
        }
        if(enemies.includes(enemy)) {
            console.warn(`${enemy} appears to be already added`);
            return;
        }
        enemies.push(enemy);
    }
    
    function removeEnemy(enemy) {
        if(!enemy[isEntity]) {
            console.warn(`${enemy} does not appear to have the Entity prototype chain call`);
            return;
        }
        if(!enemies.includes(enemy)) {
            console.warn(`${enemy} appears to be already removed`);
            return;
        }
        enemies.splice(enemies.indexOf(enemy));
    }
    
    function setPlayer(_player) {
        if(!_player[isEntity]) {
            console.warn(`${_player} does not appear to have the Entity prototype chain call`);
            return;
        }
        player = _player;
    }

    function addEventListener(type, listener) {
        if (!events[type]) {
            events[type] = [];
        }
        if (events[type].includes(listener)) {
            return;
        }
        events[type].push(listener);
    }

    /* Go ahead and load all of the images we know we're going to need to
     * draw our game level. Then set init as the callback method, so that when
     * all of these images are properly loaded our game will start.
     */
    Resources.load([
        'images/stone-block.png',
        'images/water-block.png',
        'images/grass-block.png',
        'images/enemy-bug.png',
        'images/char-boy.png'
    ]);
    Resources.onReady(init);

    document.addEventListener('keyup', function(e) {    
        if (e.key === 'r') {
            reset();
        }
    
        if (e.key === 'Escape') {
            state.Pause();
        }
    
        if (e.key === 'Enter') {
            if(state.isGameOver()) {
                return;
            }
            if(!state.isStarted()) {
                state.Start();
                return;
            }
            state.isPlaying()
             ? state.Pause()
             : state.Resume();
        }

        if(!state.isPlaying()) {
            if(!events['menu:keyup']) {
                return;
            }
            events['menu:keyup'].forEach(listener => listener(e));
            return;
        }
        events['keyup'].forEach(listener => listener(e));
    });
    

    return {
        Entity,
        Edge,
        addEnemy,
        removeEnemy,
        setPlayer,
        addEventListener,
    }

})(this);
