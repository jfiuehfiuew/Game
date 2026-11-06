var score = 0;

function updateCollisions() {
    for (var i = 0; i < enemies.length; i++) {
        var en = enemies[i];

        for (var j = 0; j < bullets.length; j++) {
            var b = bullets[j];

            // 四角同士の重なり判定
            var hit = Math.abs(b.x - en.x) < en.size + b.w / 2 &&
                      Math.abs(b.y - en.y) < en.size + b.h / 2;
            if (!hit) continue;

            b.dead = true;
            en.hp -= b.damage;        // en.hp-- の代わりに
            if (en.hp <= 0) {
              killEnemy(en);
               break;
            }
        }
    }

    bullets = bullets.filter(function (b) { return !b.dead; });
    enemies = enemies.filter(function (en) { return !en.dead; });
}

function killEnemy(en) {
    en.dead = true;
    spawnEffect(en.x, en.y);     // 死んだ位置にエフェクト(ランダム)
    score += 100;
}