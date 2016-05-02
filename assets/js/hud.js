var playerStatus = {
    lives: 3,
    score: 0,
    gameStarted: false,
    hit: function (dmgValue) {
        var totalLives = this.lives - dmgValue;
        if (totalLives >= 0) {
            this.lives = totalLives
        } else {
            this.lives = 0;
        }
    },
    scored: function (score) {
        this.score += score;
    },
    getHighScore: function () {
        return (localStorage.getItem('highscore') == null)?0:localStorage.getItem('highscore');
    },
    setHighScore: function (newHighScore) {
        localStorage.setItem('highscore', newHighScore);
    },
    reset: function () {
        this.lives = 3;
        this.score = 0;
        this.bulletType = 'normal';
    }
};

var unPauseButton = document.querySelector('.unPauseButton');
var restartButtonGameOver = document.querySelector('.restartButton_game_over');
var restartButtonPause = document.querySelector('.restartButton_pause');

var Lives = (function (parent) {
    var target = parent;
    var gameOverDialog = document.querySelector('dialog#gameOverModal');
    var init = function () {
        target.innerHTML = playerStatus.lives;
    };
    var lifeDamage = function () {
        target.innerHTML = playerStatus.lives;
        if (playerStatus.lives == 0 || playerStatus.lives <= 0) {
            gameOverDialog.showModal();
        }
    };
    return {
        init: init,
        lifeDamage: lifeDamage
    };
})(document.querySelector('#remaingLives'));

var Scores = (function (parent) {
    var target = parent;
    var init = function () {
        target.innerHTML = playerStatus.score.toLocaleString();
    };
    return {
        init: init,
        updateScore: init
    }
})(document.querySelector('#currentScore'));

var HighScore = (function (parent) {
    var target = parent;
    var init = function () {
        var highScore = parseInt(playerStatus.getHighScore());
        target.innerHTML = highScore.toLocaleString();
    };
    return {
        init: init,
        updateHighScore: init
    }
})(document.querySelector('#currentHighScore'));

unPauseButton.addEventListener('click', function (e) {
    document.querySelector('dialog#pauseModal').close();
    game.paused = false;
});

restartButtonGameOver.addEventListener('click', function (e) {
    document.querySelector('dialog#gameOverModal').close();
    game.paused = false;
    game.state.start('level_one');
    playerStatus.reset();
    Lives.init();
    Scores.init();
});

restartButtonPause.addEventListener('click', function (e) {
    document.querySelector('dialog#pauseModal').close();
    game.paused = false;
    game.state.start('level_one');
    playerStatus.reset();
    Lives.init();
    Scores.init();
});

Lives.init();
Scores.init();
HighScore.init();
