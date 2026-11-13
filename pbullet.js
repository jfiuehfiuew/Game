var weapon = 1;
var shotCooldown = 0;
var laserSide = 0;
var bullets = [];
var spreadSide = 0;

function spawnBullet(x, y, vx, vy, w, h, extra) {
    var wd = weaponData[weapon];
var b = {
    x: x, y: y, vx: vx, vy: vy, w: w, h: h,
    damage: wd.damage,
    color: wd.color,
    stroke: wd.stroke
};
    if (extra) {
        for (var k in extra) b[k] = extra[k];
    }
    bullets.push(b);
}
var weaponData = {
    1: { name: 'LASER',  damage: 2, color: '#a8f5ff', stroke: '#03d9ff', cooldown: 2,
         desc: '左右交互に撃つ高速レーザー。直線の火力が強い', power: 5, range: 2, speed: 5 },
    2: { name: 'SPREAD', damage: 1, color: '#09ff00', stroke: '#009b00', cooldown: 2,
         desc: '扇状にばらまく。遠距離では広範囲にちくちく。近距離で全弾当てるとレーザーよりダメージがでる', power: 3, range: 5, speed: 3 },
    3: { name: 'KYUSAI', damage: 2, color: '#e0a8ff', stroke: '#6a1b9a', cooldown: 2,
         desc: '高火力、広範囲にショットを放つ。初心者向け。 !!スコア倍率0.5x!!', power: 5, range: 5, speed: 5 }
};

function shoot() {
    if (weapon === 1) {
        var speed = 35;
        var baseX = (laserSide === 0) ? -12 : 12; //0なら左で1なら右という
        var shots = [
            { dx: -6, dy: 8 },
            { dx:  6, dy: 8 }
        ];

        for (var i = 0; i < shots.length; i++) {
            spawnBullet(player.x + baseX + shots[i].dx,
                     player.y - 14 + shots[i].dy,
                     0, -speed, 3, 24);
        }

        laserSide = 1 - laserSide;

     } else if (weapon === 2) {
    var speed = 20;
    var powered = spreadPower > 0;
    var angles = powered
        ? [-24, -18, -12, -6, 0, 6, 12, 18, 24]
        : [-22, -10, -5, 0, 5, 10, 22];
    var tilt = (spreadSide === 0) ? -8 : 8;

    for (var i = 0; i < angles.length; i++) {
        var rad = (angles[i] + tilt) * Math.PI / 180;
        spawnBullet(player.x, player.y - 14,
                    Math.sin(rad) * speed, -Math.cos(rad) * speed,
                    powered ? 9 : 6, powered ? 14 : 10,
                    powered ? { damage: 3, color: '#ff4444', stroke: '#990000', explode: true } : null);
    }
    spreadSide = 1 - spreadSide;


    
    } else if (weapon === 3) {
        var speed = 25;
        var angles = [-160, -25,-15, -7, 0, 7, 15, 25, 160];
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

        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(angle);

        ctx.fillStyle = b.color;
        ctx.strokeStyle = b.stroke;
        ctx.lineWidth = 1.5;

        ctx.beginPath();
        ctx.moveTo(0, -b.h * 5);
        ctx.lineTo(-b.w, b.h);
        ctx.lineTo(b.w, b.h);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }
}