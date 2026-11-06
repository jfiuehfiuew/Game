var enemies = [];
var enemyBullets = [];
var enemySpawnTimer = 0;

function spawnEnemy() {
    enemies.push({
        x: 30 + Math.random() * (base_w - 60),
        y: -20,
        vx: 0,
        vy: 1.5,
        size: 12,
        shotTimer: 30,
        hp: 5
    });
}

function updateEnemies() {
    enemySpawnTimer--;
    if (enemySpawnTimer <= 0) {
        spawnEnemy();
        enemySpawnTimer = 60;
    }

    for (var i = 0; i < enemies.length; i++) {
        var en = enemies[i];
        en.x += en.vx;
        en.y += en.vy;

        en.shotTimer--;
        if (en.shotTimer <= 0) {
            var angle = Math.atan2(player.y - en.y, player.x - en.x);
            enemyBullets.push({
                x: en.x, y: en.y,
                vx: Math.cos(angle) * 3,
                vy: Math.sin(angle) * 3,
                r: 4
            });
            en.shotTimer = 30;
        }
    }
    enemies = enemies.filter(function (en) { return en.y < base_h + 30; });

    for (var i = 0; i < enemyBullets.length; i++) {
        enemyBullets[i].x += enemyBullets[i].vx;
        enemyBullets[i].y += enemyBullets[i].vy;
    }
    enemyBullets = enemyBullets.filter(function (b) {
        return b.x > -20 && b.x < base_w + 20 &&
               b.y > -20 && b.y < base_h + 20;
    });
}

function drawEnemies() {
    ctx.fillStyle = 'red';
    for (var i = 0; i < enemies.length; i++) {
        var en = enemies[i];
        ctx.fillRect(en.x - en.size, en.y - en.size, en.size * 2, en.size * 2);
    }

    ctx.fillStyle = 'magenta';
    for (var i = 0; i < enemyBullets.length; i++) {
        var eb = enemyBullets[i];
        ctx.beginPath();
        ctx.arc(eb.x, eb.y, eb.r, 0, Math.PI * 2);
        ctx.fill();
    }
}