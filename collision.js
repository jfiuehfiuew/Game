var score = 0;

function updateCollisions() {

    for (var i = 0; i < enemies.length; i++) {
        var en = enemies[i];
        if (en.dead) continue;

        for (var j = 0; j < bullets.length; j++) {
            var b = bullets[j];
            if (b.dead) continue;

            var hit = Math.abs(b.x - en.x) < en.size + b.w / 2 &&
                      Math.abs(b.y - en.y) < en.size + b.h / 2;
            if (!hit) continue;

            b.dead = true;
            en.hp -= b.damage;
            spawnEffect(b.x, b.y, 4);
            if (en.hp <= 0) {
                killEnemy(en);
                break;
            }
        }
    }


    if (invincible > 0) invincible--;

    if (invincible === 0) {
        for (var k = 0; k < enemyBullets.length; k++) {
            var eb = enemyBullets[k];
            var dist = Math.hypot(eb.x - player.x, eb.y - player.y);
            if (dist < eb.r * 0.8 + player.hitSize) {
                playerHit();
                break;
            }
        }
          for (var m = 0; m < enemies.length; m++) {
            var en2 = enemies[m];
            if (en2.dead) continue;

            // 四角(敵)と四角(ヒットボックス)の重なり判定
            var bodyHit = Math.abs(player.x - en2.x) < en2.size + player.hitSize &&
                          Math.abs(player.y - en2.y) < en2.size + player.hitSize;
            if (bodyHit) {
                playerHit();
                break;
            }
        }
    }

    bullets = bullets.filter(function (b) { return !b.dead; });
    enemies = enemies.filter(function (en) { return !en.dead; });
}

function playerHit() {
    lives--;
    invincible = 120;
    addRank(-2);
    spawnEffect(player.x, player.y, 1);
    enemyBullets = [];

    if (lives <= 0) {
        scene = 'gameover';
        gameOverTimer = 0;
    }
}

function killEnemy(en) {
    en.dead = true;
    spawnEffect(en.x, en.y);
    score += 100;
    addRank(0.1);
}