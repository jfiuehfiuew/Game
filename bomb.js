var bombs = 3;
var bombCooldown = 0;
var invincible = 0;
var megaLaser = null;
var spreadPower = 0;

// ===== ボム演出用の状態 =====
var bombFx = {
    flash: 0,          // 全画面フラッシュ
    shake: 0,          // 画面揺れの強さ
    particles: [],     // 火花・粒子
    rings: [],         // 衝撃波リング
    bolts: [],         // 稲妻
    totalTimer: 0      // 演出全体の経過
};

function useBomb() {
    if (bombs <= 0 || bombCooldown > 0) return;
    bombs--;
    bombCooldown = 30;
    invincible = 120;

    clearEnemyBullets();

    var laserTime = 60;
    if (weapon === 1 || weapon === 4) {
        megaLaser = { timer: 60, maxTimer: 60, width: 70 };
        laserTime = 60;
    } else {
        spreadPower = 300;
    }
    if (weapon === 3) {
        megaLaser = { timer: 120, maxTimer: 120, width: 350 };
        laserTime = 120;
    }

    // ---- 発動の瞬間の演出 ----
    bombFx.flash = 1.0;
    bombFx.shake = megaLaser ? 18 : 12;
    bombFx.totalTimer = megaLaser ? laserTime : 90;

    // 衝撃波を3連発
    for (var i = 0; i < 3; i++) {
        bombFx.rings.push({
            x: player.x, y: player.y,
            r: 10, speed: 14 + i * 5,
            life: 1.0, delay: i * 6,
            hue: 40 + i * 20
        });
    }

    // 発動時の爆散パーティクル
    for (var j = 0; j < 80; j++) {
        var a = Math.random() * Math.PI * 2;
        var sp = 4 + Math.random() * 12;
        bombFx.particles.push({
            x: player.x, y: player.y,
            vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
            life: 1.0, decay: 0.015 + Math.random() * 0.02,
            size: 2 + Math.random() * 4,
            hue: 30 + Math.random() * 40
        });
    }
}

function clearEnemyBullets() {
    for (var i = 0; i < enemyBullets.length; i++) {
        var b = enemyBullets[i];
        spawnEffect(b.x, b.y, 3);
        // 消えた弾を星くずに変える
        for (var k = 0; k < 3; k++) {
            bombFx.particles.push({
                x: b.x, y: b.y,
                vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 0.5) * 6,
                life: 1.0, decay: 0.04, size: 2 + Math.random() * 2,
                hue: 180 + Math.random() * 60
            });
        }
        b.dead = true;
    }
    enemyBullets = [];
}

function updateBomb() {
    if (bombCooldown > 0) bombCooldown--;
    if (invincible > 0) invincible--;

    // ---- レーザー判定(元のまま)----
    if (megaLaser) {
        megaLaser.timer--;
        for (var i = 0; i < enemies.length; i++) {
            var en = enemies[i];
            var hit = Math.abs(en.x - player.x) < megaLaser.width / 2 + en.size &&
                      en.y < player.y;
            if (hit) {
                en.hp -= 2;
                if (en.hp <= 0 && !en.dead) killEnemy(en);
                // 被弾した敵から火花
                if (Math.random() < 0.6) {
                    bombFx.particles.push({
                        x: en.x, y: en.y,
                        vx: (Math.random() - 0.5) * 10, vy: (Math.random() - 0.5) * 10,
                        life: 1.0, decay: 0.05, size: 2 + Math.random() * 3,
                        hue: 20 + Math.random() * 30
                    });
                }
            }
        }
        enemyBullets = enemyBullets.filter(function (b) {
            return !(Math.abs(b.x - player.x) < megaLaser.width / 2 && b.y < player.y);
        });

        // レーザー中: 毎フレーム粒子を噴射
        for (var p = 0; p < 6; p++) {
            var ly = Math.random() * player.y;
            var side = Math.random() < 0.5 ? -1 : 1;
            bombFx.particles.push({
                x: player.x + side * megaLaser.width * 0.4 * Math.random(),
                y: ly,
                vx: side * (2 + Math.random() * 6),
                vy: (Math.random() - 0.5) * 4,
                life: 1.0, decay: 0.03 + Math.random() * 0.03,
                size: 1.5 + Math.random() * 3,
                hue: 50 + Math.random() * 40
            });
        }
        // 発射口の爆発
        for (var q = 0; q < 3; q++) {
            var aa = -Math.PI / 2 + (Math.random() - 0.5) * 2.4;
            var ss = 3 + Math.random() * 8;
            bombFx.particles.push({
                x: player.x, y: player.y - 10,
                vx: Math.cos(aa) * ss, vy: Math.sin(aa) * ss,
                life: 1.0, decay: 0.05, size: 3 + Math.random() * 3,
                hue: 40 + Math.random() * 20
            });
        }
        // 稲妻をランダム発生
        if (Math.random() < 0.5) {
            bombFx.bolts.push(makeBolt(
                player.x + (Math.random() - 0.5) * megaLaser.width * 0.6, player.y,
                player.x + (Math.random() - 0.5) * megaLaser.width * 2.5,
                Math.random() * player.y * 0.6
            ));
        }
        if (megaLaser.timer <= 0) {
            megaLaser = null;
            bombFx.shake = Math.max(bombFx.shake, 10);   // 終わり際にもドン
            bombFx.flash = Math.max(bombFx.flash, 0.5);
        }
    }

    // ---- スプレッド強化中の演出 ----
    if (spreadPower > 0) {
        spreadPower--;
        // 自機の周りを回るオーラ粒子
        var ang = spreadPower * 0.35;
        for (var s = 0; s < 3; s++) {
            var a2 = ang + s * (Math.PI * 2 / 3);
            bombFx.particles.push({
                x: player.x + Math.cos(a2) * 24, y: player.y + Math.sin(a2) * 24,
                vx: Math.cos(a2) * 0.5, vy: -2 - Math.random() * 2,
                life: 1.0, decay: 0.06, size: 2 + Math.random() * 2,
                hue: 20 + Math.random() * 30
            });
        }
        // 定期的に衝撃波
        if (spreadPower % 40 === 0) {
            bombFx.rings.push({
                x: player.x, y: player.y, r: 10, speed: 10,
                life: 1.0, delay: 0, hue: 30
            });
            bombFx.shake = Math.max(bombFx.shake, 5);
        }
    }

    // ---- 演出要素の更新 ----
    if (bombFx.flash > 0) bombFx.flash = Math.max(0, bombFx.flash - 0.06);
    if (bombFx.shake > 0) bombFx.shake *= 0.9;
    if (bombFx.shake < 0.3) bombFx.shake = 0;

    for (var i2 = bombFx.particles.length - 1; i2 >= 0; i2--) {
        var pt = bombFx.particles[i2];
        pt.x += pt.vx; pt.y += pt.vy;
        pt.vx *= 0.97; pt.vy *= 0.97;
        pt.life -= pt.decay;
        if (pt.life <= 0) bombFx.particles.splice(i2, 1);
    }
    for (var i3 = bombFx.rings.length - 1; i3 >= 0; i3--) {
        var rg = bombFx.rings[i3];
        if (rg.delay > 0) { rg.delay--; continue; }
        rg.r += rg.speed;
        rg.speed *= 0.97;
        rg.life -= 0.025;
        if (rg.life <= 0) bombFx.rings.splice(i3, 1);
    }
    for (var i4 = bombFx.bolts.length - 1; i4 >= 0; i4--) {
        bombFx.bolts[i4].life -= 0.15;
        if (bombFx.bolts[i4].life <= 0) bombFx.bolts.splice(i4, 1);
    }
    // 粒子が増えすぎないよう上限
    if (bombFx.particles.length > 600) {
        bombFx.particles.splice(0, bombFx.particles.length - 600);
    }
}

// ギザギザの稲妻を作る
function makeBolt(x1, y1, x2, y2) {
    var pts = [{ x: x1, y: y1 }];
    var seg = 8;
    for (var i = 1; i < seg; i++) {
        var t = i / seg;
        pts.push({
            x: x1 + (x2 - x1) * t + (Math.random() - 0.5) * 40,
            y: y1 + (y2 - y1) * t + (Math.random() - 0.5) * 20
        });
    }
    pts.push({ x: x2, y: y2 });
    return { pts: pts, life: 1.0 };
}

// ===== 描画 =====
// 敵や背景より「手前」「奥」どちらにも使えるよう分けておく
// 画面揺れの適用: メインの描画ループの先頭/末尾で呼ぶ
function bombShakeBegin() {
    ctx.save();
    if (bombFx.shake > 0) {
        ctx.translate((Math.random() - 0.5) * bombFx.shake * 2,
                      (Math.random() - 0.5) * bombFx.shake * 2);
    }
}
function bombShakeEnd() {
    ctx.restore();
}

function drawBomb() {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';   // 加算合成で光らせる

    // ---- 衝撃波リング ----
    for (var i = 0; i < bombFx.rings.length; i++) {
        var rg = bombFx.rings[i];
        if (rg.delay > 0) continue;
        ctx.lineWidth = 3 + rg.life * 10;
        ctx.strokeStyle = 'hsla(' + rg.hue + ',100%,70%,' + rg.life * 0.8 + ')';
        ctx.beginPath();
        ctx.arc(rg.x, rg.y, rg.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'rgba(255,255,255,' + rg.life + ')';
        ctx.beginPath();
        ctx.arc(rg.x, rg.y, rg.r * 0.97, 0, Math.PI * 2);
        ctx.stroke();
    }

    // ---- 極太レーザー ----
    if (megaLaser) {
        var t = megaLaser.timer / megaLaser.maxTimer;
        var elapsed = 1 - t;
        // 発射直後は一瞬で太くなり、終わりに向かって細くなる
        var env = Math.min(1, elapsed * 8) * Math.min(1, t * 4);
        var base = megaLaser.width * env;
        var flicker = 0.85 + 0.15 * Math.sin(megaLaser.timer * 1.7);
        var w = base * flicker;
        var top = 0, bottom = player.y;

        // 外側のオーラ(虹色グラデーション)
        var gOuter = ctx.createLinearGradient(player.x - w * 1.6, 0, player.x + w * 1.6, 0);
        var hueShift = (megaLaser.timer * 12) % 360;
        gOuter.addColorStop(0,   'hsla(' + hueShift + ',100%,60%,0)');
        gOuter.addColorStop(0.3, 'hsla(' + (hueShift + 60) + ',100%,60%,0.35)');
        gOuter.addColorStop(0.5, 'hsla(' + (hueShift + 120) + ',100%,70%,0.5)');
        gOuter.addColorStop(0.7, 'hsla(' + (hueShift + 180) + ',100%,60%,0.35)');
        gOuter.addColorStop(1,   'hsla(' + (hueShift + 240) + ',100%,60%,0)');
        ctx.fillStyle = gOuter;
        ctx.fillRect(player.x - w * 1.6, top, w * 3.2, bottom);

        // 中間層(黄色)
        var gMid = ctx.createLinearGradient(player.x - w, 0, player.x + w, 0);
        gMid.addColorStop(0,   'rgba(255,200,50,0)');
        gMid.addColorStop(0.5, 'rgba(255,230,120,0.85)');
        gMid.addColorStop(1,   'rgba(255,200,50,0)');
        ctx.fillStyle = gMid;
        ctx.fillRect(player.x - w, top, w * 2, bottom);

        // 芯(真っ白)
        var gCore = ctx.createLinearGradient(player.x - w * 0.45, 0, player.x + w * 0.45, 0);
        gCore.addColorStop(0,   'rgba(255,255,255,0)');
        gCore.addColorStop(0.5, 'rgba(255,255,255,1)');
        gCore.addColorStop(1,   'rgba(255,255,255,0)');
        ctx.fillStyle = gCore;
        ctx.fillRect(player.x - w * 0.45, top, w * 0.9, bottom);

        // レーザーの中を上に流れる光の筋(スピード感)
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        for (var s = 0; s < 14; s++) {
            var sy = ((megaLaser.timer * 40 + s * 97) % bottom);
            var sx = player.x + Math.sin(s * 12.9 + megaLaser.timer * 0.2) * w * 0.4;
            ctx.fillRect(sx - 1.5, bottom - sy, 3, 30 + (s % 3) * 15);
        }

        // 発射口の巨大グロー
        var gl = ctx.createRadialGradient(player.x, player.y, 0, player.x, player.y, w * 1.5);
        gl.addColorStop(0,   'rgba(255,255,255,1)');
        gl.addColorStop(0.3, 'rgba(255,220,100,0.8)');
        gl.addColorStop(1,   'rgba(255,120,0,0)');
        ctx.fillStyle = gl;
        ctx.beginPath();
        ctx.arc(player.x, player.y, w * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // 画面上端の着弾グロー
        var gt = ctx.createRadialGradient(player.x, 0, 0, player.x, 0, w * 2);
        gt.addColorStop(0, 'rgba(255,255,200,0.9)');
        gt.addColorStop(1, 'rgba(255,150,0,0)');
        ctx.fillStyle = gt;
        ctx.fillRect(player.x - w * 2, 0, w * 4, w * 2);
    }

    // ---- 稲妻 ----
    for (var b = 0; b < bombFx.bolts.length; b++) {
        var bolt = bombFx.bolts[b];
        for (var pass = 0; pass < 2; pass++) {
            ctx.lineWidth = pass === 0 ? 6 : 2;
            ctx.strokeStyle = pass === 0
                ? 'rgba(120,180,255,' + bolt.life * 0.5 + ')'
                : 'rgba(255,255,255,' + bolt.life + ')';
            ctx.beginPath();
            ctx.moveTo(bolt.pts[0].x, bolt.pts[0].y);
            for (var k = 1; k < bolt.pts.length; k++) ctx.lineTo(bolt.pts[k].x, bolt.pts[k].y);
            ctx.stroke();
        }
    }

    // ---- パーティクル ----
    for (var pi = 0; pi < bombFx.particles.length; pi++) {
        var pt = bombFx.particles[pi];
        ctx.fillStyle = 'hsla(' + pt.hue + ',100%,65%,' + pt.life + ')';
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size * pt.life + 0.5, 0, Math.PI * 2);
        ctx.fill();
    }

    // ---- スプレッド強化のオーラ ----
    if (spreadPower > 0) {
        var pulse = 18 + Math.sin(spreadPower * 0.3) * 4;
        var ga = ctx.createRadialGradient(player.x, player.y, 0, player.x, player.y, pulse * 2.2);
        ga.addColorStop(0,   'rgba(255,200,80,0.5)');
        ga.addColorStop(0.6, 'rgba(255,120,0,0.25)');
        ga.addColorStop(1,   'rgba(255,60,0,0)');
        ctx.fillStyle = ga;
        ctx.beginPath();
        ctx.arc(player.x, player.y, pulse * 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'orange';
        ctx.beginPath();
        ctx.arc(player.x, player.y, pulse, 0, Math.PI * 2);
        ctx.stroke();
    }

    ctx.restore();   // 加算合成を戻す

    // ---- 全画面フラッシュ ----
    if (bombFx.flash > 0) {
        ctx.fillStyle = 'rgba(255,255,255,' + bombFx.flash * 0.85 + ')';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // ---- ボム中は画面全体をうっすら色付け ----
    if (megaLaser) {
        var tint = 0.12 * (megaLaser.timer / megaLaser.maxTimer);
        ctx.fillStyle = 'rgba(255,180,60,' + tint + ')';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // ---- 残りボム表示(元のまま)----
    ctx.fillStyle = 'white';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('BOMB: ' + '★'.repeat(bombs), 10, 60);
}