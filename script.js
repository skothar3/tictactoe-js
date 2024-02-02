const startBtn = document.querySelector('button.start');

function Gameboard() {//{{{
  const board = Array(9).fill(' ');

  const addToken = (token, position) => {
    if (board[position - 1] === ' ') {
      board[position - 1] = token;
      return 0
    } else { return 1 }
  }

  const isGameOver = (token, abortGame) => {
    if (abortGame) {
      return 3;
    }
    const matchStr = new RegExp(`${token}{3}`);
    const winningSets = [
      board.slice(0, 3),
      board.slice(3, 6),
      board.slice(6),
      [board[0], board[3], board[6]],
      [board[1], board[4], board[7]],
      [board[2], board[5], board[8]],
      [board[0], board[4], board[8]],
      [board[2], board[4], board[6]]
    ];

    if (winningSets.some(winningSet => matchStr.test(winningSet.join('')))) { return 1 }
    else if (!board.some(cell => cell === ' ')) { return 2 }
    else { return 0 }
  }

  const viewBoard = () => {
    let index = [0, 3, 6];
    console.log('-----------------', '   ', '-----------------');
    for (let i of index) {
      console.log(' ', board[i], ' | ', board[i + 1], ' | ', board[i + 2], '       ', i + 1, ' | ', i + 2, ' | ', i + 3, ' ');
    console.log('-----------------', '   ', '-----------------');
    }
  }

  return {
    addToken,
    isGameOver,
    viewBoard
  }
}//}}}

function Player(name, token) {//{{{
  
  const viewPlayer = () => {
    console.log(`${name} is playing as ${token}`);
  }

  return {
    name,
    token,
    viewPlayer
  }
}//}}}

function GameController() {//{{{
  const gameboard = Gameboard();
  const player1 = Player('Player 1', 'X');
  const player2 = Player('Player 2', 'O');
  let currentPlayer = player1;
  let gameOver = 0;

  const newGame = () => {
    console.log('Firing up a new game of tictactoe!!');
    player1.viewPlayer();
    player2.viewPlayer();
    console.log('Okay, here we go!');
    gameboard.viewBoard();
  }

  const isGameOver = () => {
    return gameOver;
  }

  const playRound = () => {
    console.log(`${currentPlayer.name}'s turn...'`);
    let abortGame;
    let playerMove = prompt(`${currentPlayer.name}, enter your move (1 - 9)`);
    let invalidMove = gameboard.addToken(currentPlayer.token, playerMove);

    if (playerMove) {
      while (invalidMove) {
	alert('Invalid move!');
	playerMove = prompt(`${currentPlayer.name}, enter your move (1 - 9)`);
	invalidMove = gameboard.addToken(currentPlayer.token, playerMove);
      }
      gameboard.viewBoard();
      abortGame = false;
    } else {
      abortGame = true;
    }

    gameOver = gameboard.isGameOver(currentPlayer.token, abortGame);
    if (gameOver) {
      if (gameOver === 1){
	console.log(currentPlayer.name, ' wins!!!');
      } else if (gameOver === 2) {
	console.log('Looks like a tie...');
      } else {
	console.log(currentPlayer.name, ' ended the game!');
      }
    }
    else {
      currentPlayer = currentPlayer === player1 ? player2 : player1;
    }
  }

  newGame();

  return {
    playRound,
    isGameOver
  }

}//}}}


startBtn.addEventListener('click', () => {
  const game = GameController();
  while (!game.isGameOver()) {
    game.playRound();
  }
})

