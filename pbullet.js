var weapon = 1;
var shotCooldown = 0;
var laserSide = 0;
var bullets = [];

function spawnBullet(x, y, vx, vy, w, h) {
    var wd = weaponData[weapon];
    bullets.push({
        x: x, y: y, vx: vx, vy: vy, w: w, h: h,
        damage: wd.damage,    // 発射時の武器からコピー
        color: wd.color
    });
}
var weaponData = {
    1: { name: 'LASER',  damage: 2, color: 'cyan', cooldown: 2 },
    2: { name: 'SPREAD', damage: 1, color: 'orange', cooldown: 4 }
};

function shoot() {
    if (weapon === 1) {
        var offsetX = (laserSide === 0) ? -6 : 6;
        spawnBullet(player.x + offsetX, player.y - 14, 0, -35, 3, 24);
        laserSide = 1 - laserSide;

    } else if (weapon === 2) {
        var speed = 20;
        var angles = [-15, -10, 0, 10, 15];
        for (var i = 0; i < angles.length; i++) {
            var rad = angles[i] * Math.PI / 180;
            spawnBullet(player.x, player.y - 14,
                        Math.sin(rad) * speed, -Math.cos(rad) * speed, 6, 10);
        }

    }
        shotCooldown = weaponData[weapon].cooldown;
}

function updateBullets() {
    for (var i = 0; i < bullets.length; i++) {
        bullets[i].x += bullets[i].vx;
        bullets[i].y += bullets[i].vy;
    }
    bullets = bullets.filter(function (b) {
        return b.x > -20 && b.x < base_w + 20 &&
               b.y > -30 && b.y < base_h + 30;
    });
}

function drawBullets() {
    ctx.fillStyle = (weapon === 1) ? 'cyan' : 'cyan';
    for (var i = 0; i < bullets.length; i++) {
        var b = bullets[i];
        var angle = Math.atan2(b.vy, b.vx) + Math.PI / 2;
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(0, -b.h *5);
        ctx.lineTo(-b.w , b.h );
        ctx.lineTo(b.w , b.h);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
}