
var enemyBullets = [];
var ebulletTypes = {


    normal: {
        create: function (x, y, opt) {
            var angle = opt.angle;
            var speed = opt.speed || 3;
            return { x: x, y: y,
                     vx: Math.cos(angle) * speed,
                     vy: Math.sin(angle) * speed,
                     r: 3, //でかさ
                     rot: 0,                        
                     rotSpeed: opt.rotSpeed || 0.5, // 回転速度
                     fill: opt.fill || '#ffd900',   // 中
                     stroke: opt.stroke || '#ff7b00' // 枠
                   };
        },
        update: function (b) {
            b.x += b.vx;
            b.y += b.vy;
            b.rot += b.rotSpeed;
        },
        draw: function (b) {
            ctx.save();
            ctx.translate(b.x, b.y);
            ctx.rotate(b.rot);
            ctx.fillStyle = b.fill;
            ctx.strokeStyle = b.stroke;
            ctx.lineWidth = 2;
            ctx.fillRect(-b.r, -b.r, b.r * 2, b.r * 2);
            ctx.strokeRect(-b.r, -b.r, b.r * 2, b.r * 2);
            ctx.restore();
        }
    },
    laser: {
        create: function (x, y, opt) {
            var angle = opt.angle;
            var speed = opt.speed || 5;
            return { x: x, y: y,
                     angle: angle,                    // 向き
                     vx: Math.cos(angle) * speed,
                     vy: Math.sin(angle) * speed,
                     len: opt.len || 30,              // 長さ
                     wid: opt.wid || 3,               // 太さ
                     r: 4,                            // でかさ
                     fill: opt.fill || '#e26eff',     // 中
                     stroke: opt.stroke || '#6f00ff'  // 枠
                   };
        },
        update: function (b) {
            b.x += b.vx;
            b.y += b.vy;
        },
        draw: function (b) {
            ctx.save();
            ctx.translate(b.x, b.y);
            ctx.rotate(b.angle);
            ctx.fillStyle = b.fill;
            ctx.strokeStyle = b.stroke;
            ctx.lineWidth = 1.5;
            ctx.fillRect(-b.len / 2, -b.wid / 2, b.len, b.wid);
            ctx.strokeRect(-b.len / 2, -b.wid / 2, b.len, b.wid);
            ctx.restore();
        }
    },
    homing: {
        create: function (x, y, opt) {
            return { x: x, y: y,
                     angle: opt.angle,       // 出た時の向き(自機とは別方向でもOK)
                     speed: 1.9,             // 最初はゆっくり
                     turnRate: 0.03,         // 1フレームに曲がれる最大角度(ラジアン)
                     state: 'turning',       // turning → accel
                     r: 10, color: 'cyan' };
        },
        update: function (b) {
            if (b.state === 'turning') {
                var target = Math.atan2(player.y - b.y, player.x - b.x);
                // 角度の差を -π〜π に収める(遠回りしないため)
                var diff = target - b.angle;
                while (diff > Math.PI)  diff -= Math.PI * 2;
                while (diff < -Math.PI) diff += Math.PI * 2;

                if (Math.abs(diff) <= b.turnRate) {
                    // 向きが合った → 誘導終了、加速モードへ
                    b.angle = target;
                    b.state = 'accel';
                } else {
                    b.angle += (diff > 0 ? 1 : -1) * b.turnRate;
                }
            } else {
                // 加速(上限つき)
                b.speed = Math.min(b.speed + 0.15, 7);
            }
            b.x += Math.cos(b.angle) * b.speed;
            b.y += Math.sin(b.angle) * b.speed;
        },
        draw: function (b) {
            // 進行方向を向いた小さい◆
            ctx.save();
            ctx.translate(b.x, b.y);
            ctx.rotate(b.angle);
            ctx.fillStyle = (b.state === 'accel') ? 'white' : b.color;  // 加速中は白
            ctx.beginPath();
            ctx.moveTo(7, 0);
            ctx.lineTo(0, -4);
            ctx.lineTo(-5, 0);
            ctx.lineTo(0, 4);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
    },

    bomb: {
        create: function (x, y, opt) {
            var angle = opt.angle;
            var speed = opt.speed || 1.5;
            return { x: x, y: y,
                     vx: Math.cos(angle) * speed,
                     vy: Math.sin(angle) * speed,
                     timer: opt.fuse || 60, //たいまー
                     r: 15, color: 'orange' };
        },
        update: function (b) {
            b.x += b.vx;
            b.y += b.vy;
            b.timer--;
            if (b.timer <= 0) {
                for (var i = 0; i < 8; i++) { //8かい繰り返すってこと
                    var a = Math.PI * 2 * i / 8; //45ど
                    spawnEnemyBullet('normal', b.x, b.y, { angle: a, speed: 2.5 });
                }
                b.dead = true;
            }
        },
        draw: function (b) {
            // 爆発が近づくと点滅
            var blink = b.timer < 20 && Math.floor(b.timer / 3) % 2 === 0;
            ctx.fillStyle = blink ? 'white' : b.color;
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
            ctx.fill();
        }
    }
};









function spawnEnemyBullet(typeName, x, y, opt) {
    var type = ebulletTypes[typeName];
    var b = type.create(x, y, opt || {});
    b.type = type;
    b.dead = false;
    enemyBullets.push(b);
}

function updateEnemyBullets() {
    var n = enemyBullets.length;
    for (var i = 0; i < n; i++) {
        enemyBullets[i].type.update(enemyBullets[i]);
    }
    enemyBullets = enemyBullets.filter(function (b) {
        return !b.dead &&
               b.x > -30 && b.x < base_w + 30 &&
               b.y > -30 && b.y < base_h + 30;
    });
}

function drawEnemyBullets() {
    for (var i = 0; i < enemyBullets.length; i++) {
        enemyBullets[i].type.draw(enemyBullets[i]);
    }
}