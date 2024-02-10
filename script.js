//  GLOBAL VARIABLES {{{
const startBtn = document.querySelector('button.start');
const quitBtn = document.querySelector('button.quit');
const game = GameController();
//}}}

// FUNCTIONS {{{
function GameBoard() {//{{{
  const board = Array(9).fill(' ');

  const addToken = (token, position) => {
    if (board[position] === ' ') {
      board[position] = token;
      return 0
    } else { return 1 }
  }

  const gameState = (token) => {
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

  const resetBoard = () => {
    board.fill(' ');
  }

  const getBoard = () => {
    return board;
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
    gameState,
    getBoard,
    resetBoard
  }
}//}}}

function Player(name, token) {//{{{
  
  const viewPlayer = () => {
    return `${name} is playing as ${token}`;
  }

  return {
    name,
    token,
    viewPlayer
  }
}//}}}

function DisplayController() {//{{{
  const DOMBoard = document.querySelector('div.gameboard');
  // const DOMPanelLeft = document.querySelector('div.left');
  // const DOMPanelRight = document.querySelector('div.right');
  const DOMPlayerTurn = document.querySelector('h3.turn');
  const DOMGameLogTitle = document.querySelector('h3.gamelog-title');
  const DOMGameLog = document.querySelector('div.gamelog');
  const DOMGameLogAnchor = document.querySelector('#gamelog-anchor');

  const newGame = (player1, player2, gameBoard) => {
    updateBoard(gameBoard);
    updateGameLog(`NEW GAME`, 1);
    updateGameLog(player1.viewPlayer() + ' and ' + player2.viewPlayer(), 2);
    updatePlayerTurn(player1);
    DOMGameLogTitle.textContent = 'Game Log';
    DOMGameLog.classList.add('live');
    DOMGameLogTitle.classList.add('live');
  }

  const quitGame = (currentPlayer, gameBoard) => {
    updateGameLog(`Awe, ${currentPlayer.name} quit the game! What a coward...`, 1);
    setTimeout(() => {
      updateBoard(gameBoard);
      updatePlayerTurn();
      DOMGameLog.replaceChildren(DOMGameLogAnchor);
      DOMGameLogTitle.textContent = '';
      DOMGameLog.classList.remove('live');
      DOMGameLogTitle.classList.remove('live');
    }, '1800');
  }

  const gameOver = (currentPlayer, gameState) => {
    if (gameState === 1) {
      updateGameLog(`${currentPlayer.name} wins!!!`, 1);
    } else if (gameState === 2) {
      updateGameLog("Looks like it's a tie...", 1);
    }
    updatePlayerTurn();
  }

  const updateBoard = (gameBoard) => {
    const board = gameBoard.getBoard();
    const newDOMBoard = [];
    for (let i = 0; i < board.length; i++) {
      const gameSquare = document.createElement('button');
      const squareContent = document.createElement('span');
      gameSquare.classList.add('game-square');
      gameSquare.dataset.index = i;
      squareContent.textContent = board[i];
      gameSquare.appendChild(squareContent);
      newDOMBoard.push(gameSquare);
    }
    DOMBoard.replaceChildren(...newDOMBoard);
  }

  const updateGameLog = (message, importance) => {
    const newLog = document.createElement('p');
    newLog.classList.add('log');
    if (importance === 1) {
      newLog.classList.add('important');
    }
    newLog.textContent = `${message}`;
    DOMGameLog.insertBefore(newLog, DOMGameLogAnchor);
    DOMGameLogAnchor.scrollIntoView();
  }

  const updatePlayerMove = (currentPlayer, playerMove) => {
    updateGameLog(`${currentPlayer.name} played square ${parseInt(playerMove) + 1}!`, 2);
  }

  const updatePlayerTurn = (currentPlayer = '') => {
    if (currentPlayer) {
      DOMPlayerTurn.textContent = `${currentPlayer.name}'s turn...`
    } else {
      DOMPlayerTurn.textContent = '';
    }
  }

  return {
    newGame,
    quitGame,
    gameOver,
    updateBoard,
    updatePlayerMove,
    updatePlayerTurn
  }
}//}}}

function GameController() {//{{{
  let gameBoard;
  let player1;
  let player2;
  let currentPlayer;
  let gameState;

  const DOMBoard = document.querySelector('div.gameboard');
  const displayControl = DisplayController();

  const initBoard = () => {
    gameBoard = GameBoard();
    displayControl.updateBoard(gameBoard);
  }

  const quitGame = async () => {
    DOMBoard.removeEventListener('click',  playRound);
    gameBoard.resetBoard();
    await displayControl.quitGame(currentPlayer, gameBoard);
    player1 = null;
    player2 = null;
    currentPlayer = null;
    gameState = null;
  }

  const newGame = () => {
    DOMBoard.addEventListener('click', playRound);
    gameBoard.resetBoard();
    player1 = Player('Player 1', 'X');
    player2 = Player('Player 2', 'O');
    currentPlayer = player1;
    gameState = 0;
    displayControl.newGame(player1, player2, gameBoard);
  }

  const playRound = (e) => {
    if (!e.target.classList.contains('game-square') || gameState) { return }

    const playerMove = e.target.dataset.index;
    const invalidMove = gameBoard.addToken(currentPlayer.token, playerMove);

    if (invalidMove) {return}

    displayControl.updateBoard(gameBoard);
    displayControl.updatePlayerMove(currentPlayer, playerMove);

    gameState = gameBoard.gameState(currentPlayer.token);
    if (gameState) {
      displayControl.gameOver(currentPlayer, gameState);
    } else {
      currentPlayer = currentPlayer === player1 ? player2 : player1;
      displayControl.updatePlayerTurn(currentPlayer);
    }
  }

  initBoard();

  return {
    newGame,
    quitGame
  }

}//}}}
//}}}

// LISTENERS {{{
startBtn.addEventListener('click', () => {
  game.newGame();
})

quitBtn.addEventListener('click', () => {
  game.quitGame();
})
//}}}
