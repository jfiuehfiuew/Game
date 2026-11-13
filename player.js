var moveSpeed = 6;
var slowSpeed = 3;

var player = {
    x: 200,
    y: 520,
    radius: 18,
    hitSize: 3
};

function updatePlayer() {
    var dx = 0, dy = 0;
    if (keys.ArrowLeft)  dx -= 1;
    if (keys.ArrowRight) dx += 1;
    if (keys.ArrowUp)    dy -= 1;
    if (keys.ArrowDown)  dy += 1;

    if (dx !== 0 && dy !== 0) {
        dx *= Math.SQRT1_2;
        dy *= Math.SQRT1_2;
    }

    var slow = keys.ShiftLeft || keys.ShiftRight;
    var speed = slow ? slowSpeed : moveSpeed;
    player.x += dx * speed;
    player.y += dy * speed;

    // 画面外制限
    if (player.x < player.radius) player.x = player.radius;
    if (player.x > base_w - player.radius) player.x = base_w - player.radius;
    if (player.y < player.radius * 1.5) player.y = player.radius * 1.5;
    if (player.y > base_h - player.radius) player.y = base_h - player.radius;

    // ショット
    if (shotCooldown > 0) shotCooldown--;
    if (keys.KeyZ && shotCooldown === 0) shoot();
    if (keys.keyX && bombCooldown === 0) useBomb();
}

function drawPlayer() {
    var size = player.radius;
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.moveTo(player.x, player.y - size * 1.5);
    ctx.lineTo(player.x - size, player.y + size);
    ctx.lineTo(player.x + size, player.y + size);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'cyan';
    ctx.fillRect(player.x - player.hitSize, player.y - player.hitSize,
    player.hitSize * 2, player.hitSize * 2);
}