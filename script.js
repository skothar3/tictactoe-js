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

  const getWinningSet = (token) => {
    const matchStr = new RegExp(`${token}{3}`);
    const winningIndexes = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6]
    ];

    return winningIndexes.filter((indexSet) => {
      const boardSet = indexSet.map(index => board[index]);
      return matchStr.test(boardSet.join(""));
    }).flat();
  }

  const gameState = (token) => {
    const winningSet = getWinningSet(token);

    if (winningSet.length) {
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
    getWinningSet,
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
  const DOMBoard = document.querySelector('section.gameboard');
  const DOMPanelLeft = document.querySelector('section.left');
  const DOMStartBtn = DOMPanelLeft.querySelector("button.start");
  const DOMQuitBtn = DOMPanelLeft.querySelector("button.quit");
  const DOMScoreBox = DOMPanelLeft.querySelector('div.scoreboard-box');
  const DOMPanelRight = document.querySelector('section.right');
  const DOMNotification = DOMPanelRight.querySelector("h3.notification");
  const DOMGameLog = DOMPanelRight.querySelector("div.gamelog");
  const DOMGameLogAnchor = DOMPanelRight.querySelector("#gamelog-anchor");

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

  const startScoreBoard = (player1, player2) => {
    const headers = DOMScoreBox.querySelectorAll('th.score-header');
    const scores = DOMScoreBox.querySelectorAll('td.score');
    headers[0].textContent = player1.name;
    headers[1].textContent = player2.name;
    scores[0].textContent = player1.getPoints();
    scores[0].dataset.token = player1.token;
    scores[1].textContent = player2.getPoints();
    scores[1].dataset.token = player2.token;
  }

  const updateScore = (currentPlayer) => {
    const score = DOMScoreBox.querySelector(`td.score[data-token=${currentPlayer.token}]`);
    score.textContent = currentPlayer.getPoints();
  }
//}}}

// PUBLIC METHODS {{{
  const init = (gameBoard) => {//{{{
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

    const scoreBoard = document.createElement('table');
    scoreBoard.classList.add('scoreboard');
    const headers = document.createElement('tr');
    const scores = document.createElement('tr');
    [0, 1].forEach(() => {
      const header = document.createElement('th');
      header.classList.add('score-header');
      headers.appendChild(header);
    });
    [0, 1].forEach(() => {
      const score = document.createElement('td');
      score.classList.add('score');
      scores.appendChild(score);
    });
    scoreBoard.append(headers, scores);
    DOMScoreBox.appendChild(scoreBoard);

    const DOMFooter = document.querySelector('footer');
    const copyright = document.createElement('p');
    const githubLink = document.createElement('a');
    const githubIcon = document.createElement('img');
    const currentYear = new Date().getFullYear();

    copyright.textContent = `Copyright © ${currentYear} skothar3`;
    githubLink.href = 'https://github.com/skothar3';
    githubIcon.src = './github-mark.svg';
    githubIcon.alt = 'Github logo';

    githubLink.appendChild(githubIcon);
    DOMFooter.append(copyright, githubLink);

    DOMQuitBtn.disabled = true;
  };
//}}}

  const newGame = async (player1, player2, gameBoard) => {
    startScoreBoard(player1, player2);
    updateBoard(gameBoard);
    updateGameLog(`NEW GAME`, 1);
    updateGameLog(`${player1.name} is playing as ${player1.token} and ${player2.name} is playing as ${player2.token}`)
    await updateNotification(`${player1.name}'s turn...`);
    DOMPanelRight.classList.add('live');
    DOMScoreBox.classList.add('live');
    DOMStartBtn.textContent = 'Restart';
    DOMQuitBtn.disabled = false;
  };

  const quitGame = (currentPlayer, gameBoard) => {
    updateGameLog(
      `Awe, ${currentPlayer.name} quit the game! What a coward...`,
      1,
    );
    delay(gameQuitDelay).then(() => {
      const liveGameSquares = DOMBoard.querySelectorAll('button > span.live');
      liveGameSquares.forEach(el => el.classList.remove('live'));
      DOMPanelRight.classList.remove('live');
      DOMScoreBox.classList.remove('live');
      return delay(fadeOutDelay);
    }).then(() => {
      DOMStartBtn.textContent = 'Start';
      DOMQuitBtn.disabled = true;
      updateNotification('');
      DOMGameLog.replaceChildren(DOMGameLogAnchor);
      updateBoard(gameBoard);
    });
  };

  const gameOver = (currentPlayer, gameBoard, gameState) => {
    if (gameState === 1) {
      const winningIndexes = gameBoard.getWinningSet(currentPlayer.token);
      winningIndexes.forEach(winningIndex => {
	const gameSquare = DOMBoard.querySelector(`button[data-index='${winningIndex}']`);
	gameSquare.firstChild.classList.add('win');
      })
      updateGameLog(`${currentPlayer.name} wins!!!`, 1);
      updateNotification('Winner!');
      updateScore(currentPlayer);
    } else if (gameState === 2) {
      updateGameLog("Looks like it's a tie...", 1);
      updateNotification('Tie Game');
    }
    DOMStartBtn.textContent = 'Play Again';
  };

  const updateBoard = (gameBoard) => {
    const board = gameBoard.getBoard();
    const gameSquares = DOMBoard.querySelectorAll(`button[data-index]`);
    for (let i = 0; i < board.length; i++) {
      const squareContent = gameSquares[i].firstChild;
      squareContent.textContent = board[i];
      if (!(board[i] === ' ')) {
        squareContent.classList.add('live');
      } else {
	squareContent.classList.remove('live');
	squareContent.classList.remove('win');
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
  const DOMBoard = document.querySelector("section.gameboard");
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
      if (gameState === 1) {
	currentPlayer.givePoints();
      }
      display.gameOver(currentPlayer, gameBoard, gameState);
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


