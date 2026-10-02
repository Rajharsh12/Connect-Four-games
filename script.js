

const ROWS = 6;
const COLS = 7;

let board = [];          // board[row][col] = null | 'red' | 'yellow'
let currentPlayer = 'red';
let gameOver = false;
let scores = { red: 0, yellow: 0 };

const boardEl = document.getElementById('board');
const statusText = document.getElementById('statusText');
const turnDisc = document.getElementById('turnDisc');
const redScoreEl = document.getElementById('redScore');
const yellowScoreEl = document.getElementById('yellowScore');
const winOverlay = document.getElementById('winOverlay');
const winText = document.getElementById('winText');
const resetBtn = document.getElementById('resetBtn');
const resetScoreBtn = document.getElementById('resetScoreBtn');
const playAgainBtn = document.getElementById('playAgainBtn');

function initBoard() {
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  currentPlayer = 'red';
  gameOver = false;
  renderBoard();
  updateStatus();
  winOverlay.classList.remove('active');
}

function renderBoard() {
  boardEl.innerHTML = '';
  for (let col = 0; col < COLS; col++) {
    const colWrapper = document.createElement('div');
    colWrapper.classList.add('column-hover');
    colWrapper.style.display = 'contents';

    for (let row = 0; row < ROWS; row++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.addEventListener('click', () => handleColumnClick(col));
      boardEl.appendChild(cell);
    }
  }
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (board[row][col]) {
        placeDiscVisual(row, col, board[row][col], false);
      }
    }
  }
}

function handleColumnClick(col) {
  if (gameOver) return;

  const row = getLowestEmptyRow(col);
  if (row === -1) return; // column full

  board[row][col] = currentPlayer;
  placeDiscVisual(row, col, currentPlayer, true);

  const winningCells = checkWin(row, col, currentPlayer);
  if (winningCells) {
    gameOver = true;
    scores[currentPlayer]++;
    updateScores();
    highlightWin(winningCells);
    setTimeout(() => showWinOverlay(`${capitalize(currentPlayer)} Wins!`), 500);
    return;
  }

  if (isBoardFull()) {
    gameOver = true;
    setTimeout(() => showWinOverlay("It's a Draw!"), 300);
    return;
  }

  currentPlayer = currentPlayer === 'red' ? 'yellow' : 'red';
  updateStatus();
}

function getLowestEmptyRow(col) {
  for (let row = ROWS - 1; row >= 0; row--) {
    if (!board[row][col]) return row;
  }
  return -1;
}

function placeDiscVisual(row, col, player, animate) {
  const cell = boardEl.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
  if (!cell) return;
  const disc = document.createElement('div');
  disc.classList.add('disc', player);
  if (!animate) disc.style.animation = 'none';
  cell.appendChild(disc);
}

function checkWin(row, col, player) {
  const directions = [
    { dr: 0, dc: 1 },   
    { dr: 1, dc: 0 },   
    { dr: 1, dc: 1 },   
    { dr: 1, dc: -1 },  
  ];

  for (const { dr, dc } of directions) {
    const cells = [[row, col]];

    // walk forward
    let r = row + dr, c = col + dc;
    while (inBounds(r, c) && board[r][c] === player) {
      cells.push([r, c]);
      r += dr; c += dc;
    }
    // walk backward
    r = row - dr; c = col - dc;
    while (inBounds(r, c) && board[r][c] === player) {
      cells.push([r, c]);
      r -= dr; c -= dc;
    }

    if (cells.length >= 4) return cells;
  }
  return null;
}

function inBounds(r, c) {
  return r >= 0 && r < ROWS && c >= 0 && c < COLS;
}

function highlightWin(cells) {
  cells.forEach(([row, col]) => {
    const cell = boardEl.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
    const disc = cell?.querySelector('.disc');
    if (disc) disc.classList.add('winning');
  });
}

function isBoardFull() {
  return board[0].every(cell => cell !== null);
}

function updateStatus() {
  statusText.textContent = `${capitalize(currentPlayer)}'s Turn`;
  turnDisc.className = `disc-preview ${currentPlayer}`;
}

function updateScores() {
  redScoreEl.textContent = scores.red;
  yellowScoreEl.textContent = scores.yellow;
}

function showWinOverlay(message) {
  winText.textContent = message;
  winOverlay.classList.add('active');
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ===== Event Listeners =====
resetBtn.addEventListener('click', initBoard);
playAgainBtn.addEventListener('click', initBoard);
resetScoreBtn.addEventListener('click', () => {
  scores = { red: 0, yellow: 0 };
  updateScores();
  initBoard();
});

// ===== Init =====
initBoard();