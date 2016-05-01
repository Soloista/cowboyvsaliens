var game = new Phaser.Game(800, 600, Phaser.AUTO, 'gamePlayer');
game.state.add('boot', bootState);
game.state.add('load', loadState);
game.state.add('level_one', level_one);
// game.state.start('boot');
if (playerStatus.gameStarted == false) {
    document.querySelector('dialog#gameStart').showModal();
}

var startGameButton = document.querySelector('.startGameButton');
startGameButton.addEventListener('click', function (e) {
    document.querySelector('dialog#gameStart').close();
    game.state.start('boot');
});
