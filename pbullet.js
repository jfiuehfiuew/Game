var weapon = 2;
var shotCooldown = 0;
var laserSide = 0;
var bullets = [];
var spreadSide = 0;     // 0なら左寄り、1なら右寄り(撃つたびに切り替わる)

function spawnBullet(x, y, vx, vy, w, h, extra) {
    var wd = weaponData[weapon];
    var b = {
        x: x, y: y, vx: vx, vy: vy, w: w, h: h,
        damage: wd.damage,
        color: wd.color,
        explode: false
    };
    if (extra) {
        for (var k in extra) b[k] = extra[k];   // damage / color / explode を上書き
    }
    bullets.push(b);
}
var weaponData = {
    1: { name: 'LASER',  damage: 2, color: 'cyan', cooldown: 2 },
    2: { name: 'SPREAD', damage: 1, color: 'orange', cooldown: 2 },
    3: { name: 'KYUSAI', damage: 2, color: 'orange', cooldown: 2 }
};

function shoot() {
    if (weapon === 1) {
var speed = 35;
    var baseX = (laserSide === 0) ? -12 : 12;   // 左寄り / 右寄りの中心位置

    // 小山型: 真ん中が一番上(yOffset 0)、両端が少し下(yOffset 8)
    var shots = [
        { dx: -6, dy: 8 },
        { dx:  6, dy: 8 }
    ];

    for (var i = 0; i < shots.length; i++) {
        spawnBullet(player.x + baseX + shots[i].dx,
                    player.y - 14 + shots[i].dy,
                    0, -speed, 3, 24);
    }

    laserSide = 1 - laserSide;   // 次は反対側

    } else if (weapon === 2) {
    var speed = 20;
    var powered = spreadPower > 0;
    var angles = powered
        ? [-24, -18, -12, -6, 0, 6, 12, 18, 24]     // 強化: 9本
        : [-15, -5, 0, 5, 15];             // 通常: 7本
    var tilt = (spreadSide === 0) ? -8 : 8;

    for (var i = 0; i < angles.length; i++) {
        var rad = (angles[i] + tilt) * Math.PI / 180;
        spawnBullet(player.x, player.y - 14,
                    Math.sin(rad) * speed, -Math.cos(rad) * speed,
                    powered ? 9 : 6, powered ? 14 : 10,
                    powered ? { damage: 3, color: 'red', explode: true } : null);
    }

    spreadSide = 1 - spreadSide;   // 次は反対側

    
    } else if (weapon === 3) {
        var speed = 25;
        var angles = [-160, -25, -7, 0, 7, 25, 160];
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
    for (var i = 0; i < bullets.length; i++) {
        var b = bullets[i];
        var angle = Math.atan2(b.vy, b.vx) + Math.PI / 2;
        ctx.fillStyle = b.color;          // 弾ごとの色
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(0, -b.h * 5);
        ctx.lineTo(-b.w, b.h);
        ctx.lineTo(b.w, b.h);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
}