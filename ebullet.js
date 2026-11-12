// 敵弾専用ファイル。敵弾は enemyBullets に入る(enemy.js 側の同名変数は削除してください)
var enemyBullets = [];

// ===== 敵弾の種類(それぞれ独立) =====
// create(x, y, opt): 弾の初期データを返す
// update(b): 毎フレーム呼ばれる。消すときは b.dead = true
// draw(b): 描画
var ebulletTypes = {

    // ---- 通常弾: 向いた方向にまっすぐ ----
    normal: {
         create: function (x, y, opt) {
            var angle = opt.angle;
            var speed = opt.speed || 3;
            return { x: x, y: y,
                     vx: Math.cos(angle) * speed,
                     vy: Math.sin(angle) * speed,
                     r: 3,                          // 中心から辺までの距離
                     rot: 0,                        // 今の回転角
                     rotSpeed: opt.rotSpeed || 0.5, // 1フレームの回転量(ラジアン)
                     fill: opt.fill || '#ffd900',   // 中身: 明るい色
                     stroke: opt.stroke || '#ff7b00' // 枠: 濃い色
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

    // ---- 誘導→加速弾 ----
    // 1. ゆっくり出る  2. 自機の方向へ少しずつ向きを変える
    // 3. 向きが合ったら誘導をやめて加速
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

    // ---- 爆弾: 一定時間後に8方向へちび弾 ----
    bomb: {
        create: function (x, y, opt) {
            var angle = opt.angle;
            var speed = opt.speed || 1.5;
            return { x: x, y: y,
                     vx: Math.cos(angle) * speed,
                     vy: Math.sin(angle) * speed,
                     timer: opt.fuse || 60,    // 爆発までのフレーム数
                     r: 15, color: 'orange' };
        },
        update: function (b) {
            b.x += b.vx;
            b.y += b.vy;
            b.timer--;
            if (b.timer <= 0) {
                // 8方向にちび弾
                for (var i = 0; i < 8; i++) {
                    var a = Math.PI * 2 * i / 8;
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

// ===== 敵弾を出す =====
function spawnEnemyBullet(typeName, x, y, opt) {
    var type = ebulletTypes[typeName];
    var b = type.create(x, y, opt || {});
    b.type = type;      // 自分の update / draw を覚えておく
    b.dead = false;
    enemyBullets.push(b);
}

function updateEnemyBullets() {
    // for で回している最中に push されても安全なよう、今ある分だけ処理する
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