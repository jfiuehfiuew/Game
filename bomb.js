// ===== ボム =====
var bombs = 3;               // 残りボム数
var bombCooldown = 0;        // 連打防止
var invincible = 0;          // 無敵フレーム(被弾判定を作ったら使う)
var megaLaser = null;        // 極太レーザーの状態
var spreadPower = 0;         // スプレッド強化の残りフレーム

function useBomb() {
    if (bombs <= 0 || bombCooldown > 0) return;
    bombs--;
    bombCooldown = 30;
    invincible = 120;                // 2秒無敵

    clearEnemyBullets();             // 敵弾けしね!

    if (weapon === 1 || weapon === 4) {
        megaLaser = { timer: 60, width: 70 };   // 約1秒、幅70px
    } else {
        spreadPower = 300;                      // 約5秒強化
    }
}

// 敵弾を全部消す(ミニエフェクト付き)
function clearEnemyBullets() {
    for (var i = 0; i < enemyBullets.length; i++) {
        var b = enemyBullets[i];
        spawnEffect(b.x, b.y, 3);
        b.dead = true;
    }
    enemyBullets = [];
}

function updateBomb() {
    if (bombCooldown > 0) bombCooldown--;
    if (invincible > 0) invincible--;

    // 極太レーザー: 自機の真上にあるものすべてにダメージ
    if (megaLaser) {
        megaLaser.timer--;
        for (var i = 0; i < enemies.length; i++) {
            var en = enemies[i];
            var hit = Math.abs(en.x - player.x) < megaLaser.width / 2 + en.size &&
                      en.y < player.y;
            if (hit) {
                en.hp -= 0.5;                 // 毎フレーム0.5ダメージ
                if (en.hp <= 0 && !en.dead) killEnemy(en);
            }
        }
        // ボム中は敵弾も消し続ける(レーザーの幅に入ったもの)
        enemyBullets = enemyBullets.filter(function (b) {
            return !(Math.abs(b.x - player.x) < megaLaser.width / 2 && b.y < player.y);
        });
        if (megaLaser.timer <= 0) megaLaser = null;
    }

    if (spreadPower > 0) spreadPower--;
}

function drawBomb() {
    // 極太レーザー
    if (megaLaser) {
        var t = megaLaser.timer / 60;
        var w = megaLaser.width * (0.7 + 0.3 * Math.sin(megaLaser.timer * 0.8)); // ゆらぎ
        var x = player.x - w / 2;
        ctx.fillStyle = 'rgba(255,255,255,' + (0.4 + 0.5 * t) + ')';
        ctx.fillRect(x, 0, w, player.y);
        ctx.fillStyle = 'rgba(255,255,100,' + (0.6 * t) + ')';
        ctx.fillRect(x - 10, 0, w + 20, player.y);
    }

    // 強化中の表示
    if (spreadPower > 0) {
        ctx.strokeStyle = 'orange';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(player.x, player.y, 18 + Math.sin(spreadPower * 0.3) * 2, 0, Math.PI * 2);
        ctx.stroke();
    }

    // 残りボム表示
    ctx.fillStyle = 'white';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('BOMB: ' + '★'.repeat(bombs), 10, 40);
}