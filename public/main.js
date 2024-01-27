const BG_COLOUR = '#231f20';
const SNAKE_COLOUR = '#c2c2c2';
const FOOD_COLOUR = '#f11';
const FOOD_COLOUR2 = '#ee1';
const ADDRESS = "http://127.0.0.1";
const SOCKET_ADDRESS = ADDRESS + ":8000"
const HTTP_ADDRESS = ADDRESS + ":8000"

const socket = io(SOCKET_ADDRESS);

socket.on('error', handleError);
socket.on('playerJoined', handlePlayerJoined);
socket.on('gameStarted', handleGameStarted);
socket.on('playerLost', handlePlayerLost);
socket.on('gameState', handleGameState);
socket.on('gameOver', handleGameOver);


const gameScreen = document.getElementById('gameScreen');
const initialScreen = document.getElementById('initialScreen');
const newGameBtn = document.getElementById('newGameButton');
const joinGameBtn = document.getElementById('joinGameButton');
const gameCodeInput = document.getElementById('gameCodeInput');
const startGameBtn = document.getElementById('startGameBtn');
const gameCodeDisplay = document.getElementById('gameCodeDisplay');
const readyBtn = document.getElementById('readyButton');
const playersList = document.getElementById('playersList');
const gameInfo = document.getElementById('gameInfo');

const userButton = document.getElementById('userButton');
const userNameInput = document.getElementById('userNameInput');
const registerFormDiv = document.getElementById('registerForm');
const welcomeTextDiv = document.getElementById('welcomeText');
const userName = document.getElementById('userName');

const goBackBtn = document.getElementById('backMainBtn');
const scoreText = document.getElementById('scoreText');
const allGamesScreen = document.getElementById('allGamesScreen');
const reloadBtn = document.getElementById('reloadBtn');
const gamesScreen = document.getElementById('gamesScreen');

const logoutBtn = document.getElementById('logoutBtn');

const canvas = document.getElementById('canvas');

const msgBox = document.getElementById('msgBox');
const $msgBox = $('#msgBox');

const STATE_REG = 2, STATE_HOME = 0, STATE_GAME = 1;
let state = STATE_REG;

let ctx;
let playerNumber;
let gameActive = false;
let ready = false;
let code;
let colors = [];
let roomPlayers = [];
let games = [];
let userId, gameId;

document.addEventListener('keydown', keydown);
newGameBtn.addEventListener('click', newGame);
joinGameBtn.addEventListener('click', joinGame);
userButton.addEventListener('click', registerUser);
startGameBtn.addEventListener('click', startGame)
goBackBtn.addEventListener('click', goBackToMain);
logoutBtn.addEventListener('click', logout);
reloadBtn.addEventListener('click', reloadGames);

welcomeTextDiv.hidden = true
initialScreen.hidden = true
gameScreen.hidden = true
startGameBtn.hidden = true;
gameInfo.hidden = true;
$msgBox.hide()

reloadGames();
loadAuth();
conductStates();

function setAuth() {
  if (!userId) {
    showError("You are not logged in");
    return;
  }
  localStorage.setItem('auth', userId);
}

function loadAuth() {
  let ui = localStorage.getItem('auth');
  if (ui) {
    userId = ui;
  }
}

function removeAuth() {
  localStorage.removeItem('auth');
}

async function logout() {
  if (!userId) {
    showError("You are not logged in");
    return;
  }
  const res = await fetch(
    HTTP_ADDRESS + '/auth/logout',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify({userId})
    }
  );
  if (!res.ok) {
    const err = await res.json();
    if (res.status < 500) {
      showError(err.message);
    } else {
      showError("Server error");
      console.log(err.message);
    }
    return;
  }
  userId = null;
  state = STATE_REG;
  conductStates();
  removeAuth();
}

function reloadGames() {
  getAllGames();  
}

function startGame() {
  socket.emit('start_game', {gameId, userId});
}

function handleError(msg) {
  console.log(msg);
  showError(msg.message);
}

function hideMsgSlowly() {
  $msgBox.fadeOut(2000);
}

function showInfo(msg) {
  $msgBox.show();
  if (!$msgBox.hasClass('alert-primary')) {
    $msgBox.addClass('alert-primary');
  }
  $msgBox.removeClass('alert-danger');
  $msgBox.text(msg);
  hideMsgSlowly();
}

function showError(err) {
  $msgBox.show();
  if (!$msgBox.hasClass('alert-danger')) {
    $msgBox.addClass('alert-danger');
  }
  $msgBox.removeClass('alert-primary');
  $msgBox.text(err);
  hideMsgSlowly();
}

function drawPlayerNode(p) {
  const color = p.color;
  let node = document.createElement('div');
  node.classList = 'row border border-primary-subtle rounded-3 p-1 mb-2';
  let snake = document.createElement('div');
  snake.classList = 'col-3 border-end'
  snake.style.backgroundColor = 'rgb(' + Math.floor(color[0] * 255) + ", " + Math.floor(color[1] * 255) + ", " + Math.floor(color[2] * 255) + ")"
  let playerName = document.createElement('div');
  playerName.classList = 'col-9 fw-bolder fs-4'
  playerName.innerText = p.name
  node.appendChild(snake);
  node.appendChild(playerName);
  playersList.appendChild(node);
}

function handlePlayerJoined(game) {
  playersList.replaceChildren([]);
  for (let p of game.players) {
    drawPlayerNode(p);
  }
  if (game.gameSettings.ownerId === userId) {
    startGameBtn.hidden = false;
  }
  gameId = game.gameId;
  scoreText.innerText = 0;
}

function handlePlayerLost(msg) {
  if (msg.userId === userId) {
    showInfo("You lost")
    gameActive = false;
  }
}

function handleGameStarted() {
  gameActive = true;
  gameScreen.focus();
  startGameBtn.hidden = true;
}

function handleGameState(msg) {
  const game = msg.game;
  scoreText.innerText = msg.game.players.find(p => p.userId === userId).score;
  requestAnimationFrame(() => paintGame(game));
}

function handleGameOver(msg) {
  if (!msg.userId) {
    showInfo("No winners");
    return;
  }
  if (msg.userId === userId) {
    showInfo("You win")
    gameActive = false;
  }
}

async function registerUser() {
  const name = userNameInput.value;
  if (!name || name.length < 1 || name.length > 15) {
    showError("Name is not valid");
    return;
  }
  const res = await fetch(
    HTTP_ADDRESS + '/auth/create_user',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify({name})
    }
  );
  if (!res.ok) {
    const err = await res.json();
    if (res.status < 500) {
      showError(err.message);
    } else {
      showError("Server error");
      console.log(err.message);
    }
    return;
  }
  let id = await res.json();
  userId = id;
  userName.textContent = name;  

  state = STATE_HOME;
  conductStates();

  setAuth();
  await getAllGames();
}

function goBackToMain() {
  state = STATE_HOME;
  conductStates();
  socket.emit('exit_game', {gameId, userId});
  gameId = null;
  getAllGames();
}

async function newGame() {
  const res = await fetch(HTTP_ADDRESS + '/game/create_game', {
    'method': 'POST',
    'headers': {
      'Content-Type': 'application/json;charset=utf-8'
    },
    "body": JSON.stringify({
      'fieldSettings': {
        "fieldW": 20,
        "fieldH": 20
      },
      'gameSettings': {
        'minPlayers': 1,
        'maxPlayers': 5,
        'ownerId': userId,
        "delayTime": 4000
      }
    })
  })
  const body = await res.json();
  if (!res.ok) {
    const err = body;
    if (res.status < 500) {
      showError(err.message);
    } else {
      showError("Server error");
      console.log(err.message);
    }
    return;
  }
  gameId = body;
  socket.emit('join_game', {gameId, userId});
  init();
}

function joinGame() {
  const gameId = +gameCodeInput.value;
  if (gameId === '') {
    showError("You must input the name and the code")
    return;
  }
  
  socket.emit('join_game', {gameId, userId});
  init();
  gameCodeDisplay.textContent = gameId;
  initialScreen.hidden = true;
  gameScreen.hidden = false;
} 

async function getAllGames() {
  const res = await fetch(
    HTTP_ADDRESS + '/game/get_all_games',
  );
  const body = await res.json();
  console.log(body);

  if (!res.ok) {
    if (res.status < 500) {
      showError(err.message);
    } else {
      showError("Server error");
      console.log(err.message);
    }
    return;
  }
  games = body;
  drawGames(body);
}

function drawGames(games) {
  gamesScreen.replaceChildren([]);
  if (!games || games.length === 0) {
    gamesScreen.innerText = 'No games available now';
  }
  for (let game of games) {
    let node = document.createElement('div');
    node.classList = 'p-3 rounded-5 border border-primary mb-2 bg-primary-subtle';
    let name = game.players.find(p => p.userId === game.gameSettings.ownerId)?.name;
    node.innerText = `Owner: ${name}. Code: ${game.gameId}. Players now: ${game.players.map(p => p.name).join(',')}`;
    gamesScreen.appendChild(node);
  }
}


function init() {
  gameCodeDisplay.textContent = gameId;

  state = STATE_GAME;
  conductStates();
  
  ctx = canvas.getContext('2d');

  canvas.width = canvas.height = 600;

  ctx.fillStyle = BG_COLOUR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function keydown(e) {
  if (!gameActive) {
    return;
  }
  let move;
  const code = e.keyCode;
  switch (code) {
    case 37:
      move = 0;
      break;
    case 40:
      move = 3;
      break;
    case 39:
      move = 1;
      break;
    case 38:
      move = 2;
      break;
    default:
      return;
  }
  socket.emit('make_move', {userId, gameId, move});
  e.preventDefault();
}

function paintGame(game) {
  ctx.fillStyle = BG_COLOUR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const food = game.food;
  const gridsize = game.fieldSettings.fieldW;
  const size = canvas.width / gridsize;
  ctx.strokeStyle = 'green';
  for (let i = 0; i < gridsize; i++) {
    for (let j = 0; j < gridsize; j++) {
      ctx.strokeRect(i * size, j * size, size, size);
    }
  }
  
  if (food.adds != 1)
    ctx.fillStyle = FOOD_COLOUR2;
  else
    ctx.fillStyle = FOOD_COLOUR;
  ctx.fillRect(food.x * size, food.y * size, size, size);
  

  for (let player of game.players) {
    if (!player.alive) continue;
    paintPlayer(player, size);
  }
}

function paintPlayer(player, size) {
  const snake = player.snake;
  const color = player.color;
  const colorRgb = `rgb(${Math.floor(color[0] * 255)}, ${Math.floor(color[1] * 255)}, ${Math.floor(color[2] * 255)})`;
  ctx.fillStyle = colorRgb;
  ctx.strokeStyle = 'gray';
  for (let cell of snake.body.slice(0, -1)) {
    ctx.fillRect(Math.ceil(cell.x) * size, Math.ceil(cell.y) * size, size, size);
    ctx.strokeRect(Math.ceil(cell.x) * size, Math.ceil(cell.y) * size, size, size);
  }
  ctx.fillStyle = "#def";
  ctx.fillRect(Math.ceil(snake.body.at(-1).x) * size, Math.ceil(snake.body.at(-1).y) * size, size, size);
}

function conductStates() {
  switch (state) {
    case STATE_HOME:
      switchToHome();
      break;
    case STATE_GAME:
      switchToGame();
      break;
    case STATE_REG:
      switchToReg();
      break;
  }
}

function switchToGame() {
  initialScreen.hidden = true;
  gameScreen.hidden = false;
  gameInfo.hidden = false;
  allGamesScreen.hidden = true;
  logoutBtn.hidden = true;
}

function switchToHome() {
  initialScreen.hidden = false;
  gameScreen.hidden = true;
  gameInfo.hidden = true;
  allGamesScreen.hidden = false;
  welcomeTextDiv.hidden = false;
  registerFormDiv.hidden = true;
  logoutBtn.hidden = false;
}

function switchToReg() {
  registerFormDiv.hidden = false;
  welcomeTextDiv.hidden = true;
  initialScreen.hidden = true;
  gameScreen.hidden = true;
  gameInfo.hidden = true;
  logoutBtn.hidden = true;
}