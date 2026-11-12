var base_h = 600;
var base_w = 400;

var canvas = document.getElementById('game-canvas');
canvas.width = base_w;
canvas.height = base_h;
var ctx = canvas.getContext('2d');

function update() {
    updatePlayer();
    updateBullets();
    updateEnemies();
    updateCollisions();   // 追加
    updateEffects();      // 追加
    updateRank();
    updateEnemyBullets();   // update() の中
        updateBomb();
}

function draw() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, base_w, base_h);

    drawBullets();
    drawEnemies();
    drawEffects();        // 追加
    drawPlayer();
    drawBomb();
    drawEnemyBullets();     // draw() の中
    ctx.fillStyle = 'white';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('SCORE: ' + score, 10, 20);
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

loop();