var bootState, loadState, level_one,
    MIN_ENEMY_SPACING = 200,
    MAX_ENEMY_SPACING = 400,
    MIN_ENEMY_SPEED = 128,
    MAX_ENEMY_SPEED = 180,
    BULLET_TIME = 0,
    ORBS_TIME = 0;

bootState = {
    create: function () {
        game.state.start('load');
    }
};

loadState = {
    preload: function () {
        // load the images, sprites and stuff
        game.load.image('bg', 'assets/images/bg.jpg');
        game.load.image('enemy', 'assets/images/enemyShip_64.png');
        game.load.image('player', 'assets/images/ship_64.gif');
        game.load.image('bullet', 'assets/images/bullet.png');
        game.load.image('blue_orb', 'assets/images/blue_orb_w64.png');
        game.load.image('red_orb', 'assets/images/red_orb_w64.png');
        game.load.image('bomb', 'assets/images/bomb_w64.png');
        game.load.spritesheet('explode', 'assets/images/explode.png', 128, 128, 15);
        // load the audios
        game.load.audio('autofire', 'assets/sounds/autofire.mp3');
        game.load.audio('explode', 'assets/sounds/explosion.mp3');
        game.load.audio('bgMusic', 'assets/sounds/music.mp3');
        game.load.audio('orb', 'assets/sounds/orb.mp3');
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
        var explosion = game.add.sprite(player.x, player.y, 'explode');
        explosion.anchor.setTo(0.5, 0.5);
        explosion.animations.add('explode_animation');
        explosion.animations.play('explode_animation', 30, false, true);
        playerStatus.hit(1);
        Lives.lifeDamage();
        if (playerStatus.lives == 0 || playerStatus.lives <= 0) {
            player.kill();
        }
    },
    enemyIsHit: function (enemy, bullet) {
        this.explosion.play();
        var lastPos = {
            x: enemy.position.x,
            y: enemy.position.y
        }
        var explosion = game.add.sprite(lastPos.x, lastPos.y, 'explode');
        explosion.anchor.setTo(0.5, 0.5);
        explosion.animations.add('explode_animation');
        explosion.animations.play('explode_animation', 30, false, true);
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
            bullet.body.velocity.y = -550;
            BULLET_TIME = game.time.now + 300;
        }
    },
    spawnEnemy: function () {
        if (this.enemies.countDead() > 0) {
            var enemy = this.enemies.getFirstDead();
            enemy.reset(game.rnd.integerInRange(64, (game.width - 64)), -20);
            enemy.body.velocity.y = game.rnd.integerInRange(MIN_ENEMY_SPEED, MAX_ENEMY_SPEED);
        }
    },
    gotBlueOrb: function (player, blue_orb) {
        // freezes the enemies, need to tint them lightblue to make it them icy
        blue_orb.kill();
        // get the enemies and freezes
        this.enemies.forEachExists(function (enemy) {
            enemy.body.velocity.y = 0;
        });
        this.orbSound.play();
    },
    gotRedOrb: function (player, red_orb) {
        red_orb.kill();
        this.orbSound.play();
        // get the enemies and kill
        this.enemies.forEachExists(function (enemy) {
            var lastPos = {
                x: enemy.position.x,
                y: enemy.position.y
            }
            var explosion = game.add.sprite(lastPos.x, lastPos.y, 'explode');
            explosion.anchor.setTo(0.5, 0.5);
            explosion.animations.add('explode_animation');
            explosion.animations.play('explode_animation', 30, false, true);
            enemy.kill();
            playerStatus.scored(50);
            Scores.updateScore();
            // for setting the highscore
            var currentHighScore = playerStatus.getHighScore();
            if (playerStatus.score > currentHighScore) {
                playerStatus.setHighScore(playerStatus.score);
            }
            HighScore.updateHighScore();
        });
        this.explosion.play();
    },
    gotBomb: function (player, bomb) {
        bomb.kill();
        var explosion = game.add.sprite(player.x, player.y, 'explode');
        explosion.anchor.setTo(0.5, 0.5);
        explosion.animations.add('explode_animation');
        explosion.animations.play('explode_animation', 30, false, true);
        player.kill();
        playerStatus.hit(3);
        Lives.lifeDamage();
        this.orbSound.play();
    },
    spawnOrbs: function () {
        if (game.time.now > ORBS_TIME) {
            // to spawn orbs we need to declare an array to hold some values to make it pseudo-random
            var choices = [
                0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0, 3, 0, 0, 0
            ];
            var chosen = choices[game.rnd.integerInRange(0, 14)];
            switch (chosen) {
                case 1:
                    // blue orbs for freezing the enemies
                    if (this.blueOrbs.countDead() > 0) {
                        var blue_orb = this.blueOrbs.getFirstDead();
                        blue_orb.reset(game.rnd.integerInRange(64, (game.width - 64)), -20);
                        blue_orb.body.velocity.y = game.rnd.integerInRange(MIN_ENEMY_SPEED, MAX_ENEMY_SPEED);
                    }
                    break;
                case 2:
                    // red orbs for killing them all
                    if (this.redOrbs.countDead() > 0) {
                        var red_orb = this.redOrbs.getFirstDead();
                        red_orb.reset(game.rnd.integerInRange(64, (game.width - 64)), -20);
                        red_orb.body.velocity.y = game.rnd.integerInRange(MIN_ENEMY_SPEED, MAX_ENEMY_SPEED);
                    }
                    break;
                case 3:
                    // bomb for instant game over
                    if (this.bombs.countDead() > 0) {
                        var bomb = this.bombs.getFirstDead();
                        bomb.reset(game.rnd.integerInRange(64, (game.width - 64)), -20);
                        bomb.body.velocity.y = game.rnd.integerInRange(MIN_ENEMY_SPEED, MAX_ENEMY_SPEED);
                    }
                    break;
                default:
                    // nothing :D
            }
            ORBS_TIME = game.time.now + 1500;
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
        this.orbSound = game.add.audio('orb');
        this.bgMusic.loopFull(0.8);
        // enemies
        this.enemies = game.add.group();
        this.enemies.enableBody = true;
        this.enemies.physicsBodyType = Phaser.Physics.ARCADE;
        this.enemies.createMultiple(7, 'enemy');
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
        // orb groups
        // red orbs
        this.redOrbs = game.add.group();
        this.redOrbs.enableBody = true;
        this.redOrbs.physicsBodyType = Phaser.Physics.ARCADE;
        this.redOrbs.createMultiple(1, 'red_orb');
        this.redOrbs.setAll('anchor.x', 0.5);
        this.redOrbs.setAll('anchor.y', 0.5);
        this.redOrbs.setAll('checkWorldBounds', true);
        this.redOrbs.setAll('outOfBoundsKill', true);
        // blue orbs
        this.blueOrbs = game.add.group();
        this.blueOrbs.enableBody = true;
        this.blueOrbs.physicsBodyType = Phaser.Physics.ARCADE;
        this.blueOrbs.createMultiple(1, 'blue_orb');
        this.blueOrbs.setAll('anchor.x', 0.5);
        this.blueOrbs.setAll('anchor.y', 0.5);
        this.blueOrbs.setAll('checkWorldBounds', true);
        this.blueOrbs.setAll('outOfBoundsKill', true);
        // bombs
        this.bombs = game.add.group();
        this.bombs.enableBody = true;
        this.bombs.physicsBodyType = Phaser.Physics.ARCADE;
        this.bombs.createMultiple(1, 'bomb');
        this.bombs.setAll('anchor.x', 0.5);
        this.bombs.setAll('anchor.y', 0.5);
        this.bombs.setAll('checkWorldBounds', true);
        this.bombs.setAll('outOfBoundsKill', true);
    },
    update: function () {
        // moving bg
        this.background.tilePosition.y += 1;
        this.player.body.velocity.x = 0;
        this.player.body.velocity.y = 0;
        game.physics.arcade.collide(this.enemies, this.player, this.playerIsHit, null, this);
        game.physics.arcade.collide(this.bullets, this.enemies, this.enemyIsHit, null, this);
        game.physics.arcade.collide(this.redOrbs, this.player, this.gotRedOrb, null, this);
        game.physics.arcade.collide(this.blueOrbs, this.player, this.gotBlueOrb, null, this);
        game.physics.arcade.collide(this.bombs, this.player, this.gotBomb, null, this);
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
        this.spawnOrbs();
    }
}
