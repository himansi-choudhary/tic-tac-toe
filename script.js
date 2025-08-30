const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('status');
const restartBtn = document.getElementById('restart');
const difficultySelector = document.getElementById('difficulty');
const modeSelector = document.getElementById('mode');

let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let gameActive = true;
let aiDifficulty = "hard";
let gameMode = "ai"; // Default mode

const winningCombos = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

// Scoreboard
let scores = { X: 0, O: 0, draw: 0 };

// Event listeners
difficultySelector.addEventListener('change', (e) => {
  aiDifficulty = e.target.value;
});

modeSelector.addEventListener('change', (e) => {
  gameMode = e.target.value;
  toggleDifficultyDisplay();
  restartGame();
});

function toggleDifficultyDisplay() {
  const label = document.querySelector('label[for="difficulty"]');
  if (gameMode === "2p") {
    difficultySelector.style.display = "none";
    if (label) label.style.display = "none";
  } else {
    difficultySelector.style.display = "inline-block";
    if (label) label.style.display = "inline-block";
  }
}

function updateScore(winner = null) {
  if (winner && scores[winner] !== undefined) {
    scores[winner]++;
  }
  document.getElementById('x-wins').textContent = scores.X;
  document.getElementById('o-wins').textContent = scores.O;
  document.getElementById('draws').textContent = scores.draw;
}

function handleClick(e) {
  const index = e.target.dataset.index;

  // Don't allow click if game is over or cell is filled
  if (board[index] !== "" || !gameActive) return;

  if (gameMode === "ai") {
    // Only allow human (X) to click
    if (currentPlayer !== "X") return;

    makeMove(index, "X");

    if (!gameActive) return;

    // Let AI (O) play
    setTimeout(() => {
      aiMove();
    }, 400);

  } else {
    // Player vs Player
    makeMove(index, currentPlayer);
  }
}

function makeMove(index, player) {
  board[index] = player;
  cells[index].textContent = player;

  cells[index].classList.add('clicked');
  setTimeout(() => cells[index].classList.remove('clicked'), 200);

  if (checkWin(player)) {
    statusText.textContent = `Player ${player} wins!`;
    updateScore(player);
    gameActive = false;
  } else if (board.every(cell => cell !== "")) {
    statusText.textContent = "It's a draw!";
    updateScore("draw");
    gameActive = false;
  } else {
    currentPlayer = player === "X" ? "O" : "X";
    statusText.textContent = `Player ${currentPlayer}'s turn`;
  }
}

function checkWin(player) {
  return winningCombos.some(combo => {
    if (combo.every(i => board[i] === player)) {
      combo.forEach(i => cells[i].classList.add("win"));
      return true;
    }
    return false;
  });
}

function aiMove() {
  if (!gameActive) return;

  let best;
  if (aiDifficulty === "easy") {
    const empty = board.map((v, i) => v === "" ? i : null).filter(i => i !== null);
    best = { index: empty[Math.floor(Math.random() * empty.length)] };
  } else if (aiDifficulty === "medium") {
    best = minimax(board, "O", 0, 2);
  } else {
    best = minimax(board, "O", 0, Infinity);
  }

  if (best.index !== undefined) {
    makeMove(best.index, "O");
  }
}

function minimax(newBoard, player, depth, maxDepth) {
  const huPlayer = "X", aiPlayer = "O";
  const avail = newBoard.map((v, i) => v === "" ? i : null).filter(i => i !== null);

  if (checkWinState(newBoard, huPlayer)) return { score: -10 + depth };
  if (checkWinState(newBoard, aiPlayer)) return { score: 10 - depth };
  if (avail.length === 0 || depth >= maxDepth) return { score: 0 };

  const moves = [];

  for (let i = 0; i < avail.length; i++) {
    const move = { index: avail[i] };
    newBoard[avail[i]] = player;

    const result = minimax(newBoard, player === aiPlayer ? huPlayer : aiPlayer, depth + 1, maxDepth);
    move.score = result.score;

    newBoard[avail[i]] = "";
    moves.push(move);
  }

  let bestMove;
  if (player === aiPlayer) {
    let bestScore = -Infinity;
    moves.forEach((move, i) => {
      if (move.score > bestScore) {
        bestScore = move.score;
        bestMove = i;
      }
    });
  } else {
    let bestScore = Infinity;
    moves.forEach((move, i) => {
      if (move.score < bestScore) {
        bestScore = move.score;
        bestMove = i;
      }
    });
  }

  return moves[bestMove];
}

function checkWinState(bd, player) {
  return winningCombos.some(combo => combo.every(i => bd[i] === player));
}

function restartGame() {
  board = ["", "", "", "", "", "", "", "", ""];
  gameActive = true;
  currentPlayer = "X";
  statusText.textContent = `Player ${currentPlayer}'s turn`;

  cells.forEach(cell => {
    cell.textContent = "";
    cell.classList.remove("win");
  });
}

// Init
toggleDifficultyDisplay();
updateScore();

// Event Listeners
cells.forEach(cell => cell.addEventListener("click", handleClick));
restartBtn.addEventListener("click", restartGame);
