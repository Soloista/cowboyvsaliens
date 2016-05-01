var bootState, loadState, level_one,
    MIN_ENEMY_SPACING = 200,
    MAX_ENEMY_SPACING = 400,
    MIN_ENEMY_SPEED = 128,
    MAX_ENEMY_SPEED = 180,
    BULLET_TIME = 0;

bootState = {
    create: function () {
        game.state.start('load');
    }
};

loadState = {
    preload: function () {
        game.load.image('bg', 'assets/images/bg.jpg');
        game.load.image('enemy', 'assets/images/enemyShip_64.png');
        game.load.image('player', 'assets/images/ship_64.gif');
        game.load.image('bullet', 'assets/images/bullet.png');
        // audios
        game.load.audio('autofire', 'assets/sounds/autofire.mp3');
        game.load.audio('explode', 'assets/sounds/explosion.mp3');
        game.load.audio('bgMusic', 'assets/sounds/music.mp3');
    },
    create: function () {
        game.state.start('level_one');
    }
};

level_one = {
    preload: function () {
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.time.advancedTiming = true;
    },
    playerIsHit: function (player, enemy) {
        enemy.kill();
        playerStatus.hit();
        Lives.lifeDamage();
        if (playerStatus.lives == 0) {
            game.paused = true;
        }
        console.log('Remaining Lives: '+playerStatus.lives);
    },
    enemyIsHit: function (enemy, bullet) {
        this.explosion.play();
        var lastPos = {
            x: enemy.position.x,
            y: enemy.position.y
        }
        enemy.kill();
        bullet.kill();
        playerStatus.scored(50);
        Scores.updateScore();
        // for setting the highscore
        var currentHighScore = playerStatus.getHighScore();
        if (playerStatus.score > currentHighScore) {
            playerStatus.setHighScore(playerStatus.score);
        }
        HighScore.updateHighScore();
    },
    fireBullets: function () {
        if (game.time.now > BULLET_TIME && this.bullets.countDead() > 0) {
            var bullet = this.bullets.getFirstDead();
            bullet.reset(this.player.x, this.player.y - 40);
            bullet.body.velocity.y = -400;
            BULLET_TIME = game.time.now + 300;
        }
    },
    spawnEnemy: function () {
        // console.log(this.enemies);
        // var enemy = this.enemies.getFirstExists(false);
        // console.log(enemy);
        // if (enemy) {
        //     enemy = game.add.sprite(0, 0, 'enemy');
        //     game.physics.arcade.enableBody(enemy);
        //     enemy.body.velocity.y = 128;
        //     enemy.checkWorldBounds = true;
        //     enemy.outOfBoundsKill = true;
        // }
        if (this.enemies.countDead() > 0) {
            var enemy = this.enemies.getFirstDead();
            enemy.reset(game.rnd.integerInRange(64, (game.width - 64)), -20);
            enemy.body.velocity.y = game.rnd.integerInRange(MIN_ENEMY_SPEED, MAX_ENEMY_SPEED);
        }
    },
    create: function () {
        // background
        this.background = game.add.tileSprite(0, 0, 800, 1422, 'bg');
        this.upButton = game.input.keyboard.addKey(Phaser.Keyboard.UP);
        this.downButton = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
        this.leftButton = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
        this.rightButton = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
        this.fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        this.pauseButton = game.input.keyboard.addKey(Phaser.Keyboard.P);
        this.player = game.add.sprite(315, 500,'player');
        this.player.anchor.setTo(0.5, 0.5);
        game.physics.arcade.enable(this.player);
        this.player.body.collideWorldBounds = true;
        // add the audio
        this.autofire = game.add.audio('autofire');
        this.explosion = game.add.audio('explode');
        this.bgMusic = game.add.audio('bgMusic');
        this.bgMusic.play();
        // enemies
        this.enemies = game.add.group();
        this.enemies.enableBody = true;
        this.enemies.physicsBodyType = Phaser.Physics.ARCADE;
        this.enemies.createMultiple(5, 'enemy');
        this.enemies.setAll('anchor.x', 0.5);
        this.enemies.setAll('anchor.y', 0.5);
        this.enemies.setAll('outOfBoundsKill', true);
        this.enemies.setAll('checkWorldBounds', true);
        this.spawnEnemy();
        // bullets
        this.bullets = game.add.group();
        this.bullets.enableBody = true;
        this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
        this.bullets.createMultiple(1000, 'bullet');
        this.bullets.setAll('anchor.x', 0.5);
        this.bullets.setAll('anchor.y', 0.5);
        this.bullets.setAll('checkWorldBounds', true);
        this.bullets.setAll('outOfBoundsKill', true);
    },
    update: function () {
        // moving bg
        this.background.tilePosition.y += 1;
        this.player.body.velocity.x = 0;
        this.player.body.velocity.y = 0;
        game.physics.arcade.collide(this.enemies, this.player, this.playerIsHit, null, this);
        game.physics.arcade.collide(this.bullets, this.enemies, this.enemyIsHit, null, this);
        if (this.upButton.isDown) {
            this.player.body.velocity.y = -300;
        } else if (this.downButton.isDown) {
            this.player.body.velocity.y = 300;
        } else if (this.leftButton.isDown) {
            this.player.body.velocity.x = -300;
        } else if (this.rightButton.isDown) {
            this.player.body.velocity.x = 300;
        }
        // fire button
        if (this.fireButton.isDown) {
            this.fireBullets();
            this.autofire.play();
        }
        // for pausing the game
        if (this.pauseButton.isDown) {
            game.paused = true;
            document.querySelector('dialog#pauseModal').showModal();
        }
        this.spawnEnemy();
        // game.time.events.add(game.rnd.integerInRange(MIN_ENEMY_SPACING, MAX_ENEMY_SPACING), this.spawnEnemy);
    }
}
