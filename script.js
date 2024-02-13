// FUNCTIONS 
function GameBoard() {
  //{{{
  const board = Array(9).fill(" ");

  const addToken = (token, position) => {
    if (board[position] === " ") {
      board[position] = token;
      return 0;
    } else {
      return 1;
    }
  };

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
      [board[2], board[4], board[6]],
    ];

    if (winningSets.some((winningSet) => matchStr.test(winningSet.join("")))) {
      return 1;
    } else if (!board.some((cell) => cell === " ")) {
      return 2;
    } else {
      return 0;
    }
  };

  const resetBoard = () => {
    board.fill(" ");
  };

  const getBoard = () => board;

  const viewBoard = () => {//{{{
    let index = [0, 3, 6];
    console.log("-----------------", "   ", "-----------------");
    for (let i of index) {
      console.log(
        " ",
        board[i],
        " | ",
        board[i + 1],
        " | ",
        board[i + 2],
        "       ",
        i + 1,
        " | ",
        i + 2,
        " | ",
        i + 3,
        " ",
      );
      console.log("-----------------", "   ", "-----------------");
    }
  };//}}}

  return {
    addToken,
    gameState,
    getBoard,
    resetBoard,
  };
} //}}}

function Player(name, token) {
  //{{{
  let points = 0;

  const getPoints = () => points;
  const givePoints = () => points++;

  return {
    name,
    token,
    getPoints,
    givePoints
  };
} //}}}

function DisplayController() {
  //{{{
  const DOMBoard = document.querySelector("div.gameboard");
  const DOMPanelLeft = document.querySelector('div.left');
  const DOMPanelRight = document.querySelector('div.right');
  const DOMScoreBox = DOMPanelLeft.querySelector('div.scoreboard-box');
  const DOMNotification = document.querySelector("h3.notification");
  const DOMGameLog = document.querySelector("div.gamelog");
  const DOMGameLogAnchor = document.querySelector("#gamelog-anchor");
  const DOMstartBtn = document.querySelector("button.start");
  const DOMquitBtn = document.querySelector("button.quit");

  const rootEl = document.documentElement;
  const notificationDelay = parseInt(getComputedStyle(rootEl).getPropertyValue('--notification-delay').match(/\d+/)[0]);
  const fadeOutDelay = parseInt(getComputedStyle(rootEl).getPropertyValue('--fade-delay').match(/\d+/)[0]);
  const gameQuitDelay = 1000;

// PRIVATE METHODS {{{
  const delay = (time) => {
      return new Promise((resolve, reject) => setTimeout(resolve, time));
  }

  const updateGameLog = (message, importance) => {
    const newLog = document.createElement("p");
    newLog.classList.add("log");
    if (importance === 1) {
      newLog.classList.add("important");
    }
    newLog.textContent = `${message}`;
    DOMGameLog.insertBefore(newLog, DOMGameLogAnchor);
    DOMGameLogAnchor.scrollIntoView();
  };
//}}}

// PUBLIC METHODS {{{
  const init = (gameBoard) => {
    const board = gameBoard.getBoard();
    const newDOMBoard = [];
    for (let i = 0; i < board.length; i++) {
      const gameSquare = document.createElement("button");
      const squareContent = document.createElement("span");
      gameSquare.classList.add("game-square");
      gameSquare.dataset.index = i;
      gameSquare.appendChild(squareContent);
      newDOMBoard.push(gameSquare);
    }
    DOMBoard.replaceChildren(...newDOMBoard);

    DOMquitBtn.disabled = true;
  };

  const newGame = async (player1, player2, gameBoard) => {
    updateBoard(gameBoard);
    updateGameLog(`NEW GAME`, 1);
    updateGameLog(`${player1.name} is playing as ${player1.token} and ${player2.name} is playing as ${player2.token}`)
    await updateNotification(`${player1.name}'s turn...`);
    DOMPanelRight.classList.add('live');
    DOMPanelLeft.classList.add('live');
    DOMstartBtn.textContent = 'Restart';
    DOMquitBtn.disabled = false;
  };

  const quitGame = (currentPlayer, gameBoard) => {
    const liveGameSquares = DOMBoard.querySelectorAll('button > span.live');
    updateGameLog(
      `Awe, ${currentPlayer.name} quit the game! What a coward...`,
      1,
    );
    delay(gameQuitDelay).then(() => {
      liveGameSquares.forEach(el => el.classList.remove('live'));
      DOMPanelRight.classList.remove('live');
      DOMPanelLeft.classList.remove('live');
      return delay(fadeOutDelay);
    }).then(() => {
      DOMstartBtn.textContent = 'Start';
      DOMquitBtn.disabled = true;
      updateNotification('');
      DOMGameLog.replaceChildren(DOMGameLogAnchor);
      updateBoard(gameBoard);
    });
  };

  const gameOver = (currentPlayer, gameState) => {
    if (gameState === 1) {
      updateGameLog(`${currentPlayer.name} wins!!!`, 1);
      updateNotification('Winner!');
    } else if (gameState === 2) {
      updateGameLog("Looks like it's a tie...", 1);
      updateNotification('Tie Game');
    }
    DOMstartBtn.textContent = 'New Game';
  };

  const updateBoard = (gameBoard) => {
    const board = gameBoard.getBoard();
    for (let i = 0; i < board.length; i++) {
      const gameSquare = document.querySelector(`[data-index="${i}"]`);
      const squareContent = gameSquare.firstChild;
      squareContent.textContent = board[i];
      if (!(board[i] === " ")) {
        squareContent.classList.add("live");
      }
    }
  };

  const updatePlayerMove = (currentPlayer, playerMove) => {
    updateGameLog(
      `${currentPlayer.name} played square ${parseInt(playerMove) + 1}!`,
      2
    );
  };

  const updateNotification = async (message) => {
    DOMNotification.classList.remove("transition");
    return delay(notificationDelay).then(() => {
      DOMNotification.textContent = message;
      DOMNotification.classList.add("transition");
    });
  };
//}}}

  return {
    init,
    newGame,
    quitGame,
    gameOver,
    updateBoard,
    updatePlayerMove,
    updateNotification
  };
} //}}}

const game = (function GameController() {
  //{{{
  let gameBoard;
  let player1;
  let player2;
  let currentPlayer;
  let playerQuit = true;
  let gameState;

  const startBtn = document.querySelector("button.start");
  const quitBtn = document.querySelector("button.quit");
  const DOMBoard = document.querySelector("div.gameboard");
  const display = DisplayController();

// PRIVATE METHODS {{{
  const init = () => {
    gameBoard = GameBoard();
    display.init(gameBoard);
    startBtn.addEventListener("click", () => {
      newGame();
    });
    quitBtn.addEventListener("click", () => {
      quitGame();
    });
  };

  const playRound = async (e) => {
    if (!e.target.classList.contains("game-square") || gameState) {
      return;
    }

    const playerMove = e.target.dataset.index;
    const invalidMove = gameBoard.addToken(currentPlayer.token, playerMove);
    if (invalidMove) {
      return;
    }

    display.updateBoard(gameBoard);
    display.updatePlayerMove(currentPlayer, playerMove);

    gameState = gameBoard.gameState(currentPlayer.token);
    if (gameState) {
      display.gameOver(currentPlayer, gameState);
      if (gameState === 1) { currentPlayer.givePoints() }
    } else {
      currentPlayer = currentPlayer === player1 ? player2 : player1;
      await display.updateNotification(`${currentPlayer.name}'s turn...`);
    }
  }

  const beginGame = () => {
    gameBoard.resetBoard();
    currentPlayer = player1;
    gameState = 0;
    display.newGame(player1, player2, gameBoard);
  }
//}}}

// PUBLIC METHODS {{{
  const quitGame = () => {
    DOMBoard.removeEventListener("click", playRound);
    gameBoard.resetBoard();
    display.quitGame(currentPlayer, gameBoard);
    player1 = null;
    player2 = null;
    currentPlayer = null;
    gameState = null;
    playerQuit = true;
  };

  const newGame = () => {
    if (playerQuit) {
      DOMBoard.addEventListener("click", playRound);
      player1 = Player("Player 1", "X");
      player2 = Player("Player 2", "O");
      playerQuit = false;
    }
    beginGame();
  };
//}}}

  init();
  
  return {
    newGame,
    quitGame
  };
})();//}}}


