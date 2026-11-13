var base_h = 600;
var base_w = 400;
var gameOverTimer = 0;
var canvas = document.getElementById('game-canvas');
canvas.width = base_w;
canvas.height = base_h;
var ctx = canvas.getContext('2d');

var scene = 'title';

function updateTitle() {
    if (pressed.Digit1) { weapon = 1; startGame(); }
    if (pressed.Digit2) { weapon = 2; startGame(); }
    if (pressed.Digit3) { weapon = 3; startGame(); }
}

function update() {
    if (scene === 'title') {
        updateTitle();

    } else if (scene === 'gameover') {
        gameOverTimer++;
        if (gameOverTimer >= 240) scene = 'title';

    } else {
        updateRank();
        updatePlayer();
        updateBullets();
        updateEnemies();
        updateEnemyBullets();
        updateCollisions();
        updateEffects();
            updateCoins();   // update側
        updateBomb();
    }
    pressed = {};
}

function draw() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, base_w, base_h);

    if (scene === 'title') { drawTitle(); return; }

    drawBullets();
    drawEnemies();
    drawEnemyBullets();
    drawEffects();
    drawPlayer();
    drawHud();
    bombShakeBegin();      // ← 追加:描画の一番最初

    // ...背景、敵、自機、弾などの既存の描画...
    drawBomb();

    bombShakeEnd();        // ← 追加:描画の一番最後
    
drawCoins();     // draw側(敵より手前、ボムより奥くらい)
    if (scene === 'gameover') drawGameOver();
}

function drawTitle() {
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.font = '32px sans-serif';
    ctx.fillText('△ vs □', base_w / 2, 200);

    ctx.font = '16px sans-serif';
    ctx.fillText('1 : LASER 難易度:★★★★★ 直線にレーザーを放つ', base_w / 2, 280);
    ctx.fillText('2 : SPREAD 難易度:★★★ 広範囲にショットを放つ', base_w / 2, 310);
    ctx.fillText('3 : LASPREAD 難易度:★ 最強。 !! スコア倍率0.5x!!', base_w / 2, 340);

    ctx.font = '13px sans-serif';
    ctx.fillText('Arrow : MOVE   Shift : SLOW   Z : SHOT', base_w / 2, 420);
    ctx.fillText('X : Bomb', base_w / 2, 450);
    ctx.textAlign = 'left';
}

function drawHud() {
    ctx.fillStyle = 'white';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('SCORE: ' + score, 10, 20);
    ctx.fillText('LIFE: ' + lives, 10, 40);
}

function startGame() {
    lives = 3;
    invincible = 0;
    score = 0;
    rank = 0;
    rankTimer = 0;
    enemies = [];
    enemyBullets = [];
    bullets = [];
    effects = [];
    enemySpawnTimer = 60;
    player.x = base_w / 2;
    player.y = base_h - 80;
    gameOverTimer = 0;
    scene = 'play';
    coins = [];
    bombs = 3;
    bombCooldown = 0;
    megaLaser = null;
    spreadPower = 0;
    bombFx.particles = [];
    bombFx.rings = [];
    bolts = [];
    bombFx.bolts = [];
    bombFx.flash = 0;
    bombFx.shake = 0;
}

function drawGameOver() {
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, base_w, base_h);
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.font = '32px sans-serif';
    ctx.fillText('GAME OVER', base_w / 2, base_h / 2);
    ctx.font = '16px sans-serif';
    ctx.fillText('SCORE: ' + score, base_w / 2, base_h / 2 + 30);
    ctx.textAlign = 'left';
}

var STEP = 1000 / 60;   // 1回の更新あたりのミリ秒(60回/秒)
var lastTime = 0;
var acc = 0;

function Engine(now) {
    if (lastTime === 0) lastTime = now;
    acc += Math.min(now - lastTime, 100);   // タブ切替後の暴走防止
    lastTime = now;

    while (acc >= STEP) {
        update();
        acc -= STEP;
    }
    draw();
    requestAnimationFrame(Engine);
}

requestAnimationFrame(Engine);   // 最後の「Engine();」はこの1行に置き換える

Engine();
