var enemies = [];
var enemySpawnTimer = 0;

var enemyTypes = {

    scroll: {
        create: function (x, y) {
            return { x: x, y: y, vx: 0, vy: 1.5, size: 17, hp: 5,
                     shotTimer: 0 };
        },
        update: function (en) {
            en.x += en.vx;
            en.y += en.vy;

            en.shotTimer--;
            if (en.shotTimer <= 0) {
                var angle = Math.atan2(player.y - en.y, player.x - en.x);
                spawnEnemyBullet('normal', en.x, en.y,
                                 { angle: angle, speed: byRank(3, 6) });
                en.shotTimer = Math.round(byRank(90, 8));
            }
        }
    },
     drift: {
        create: function (x, y) {
            return { x: x, y: y, vx: 0, vy: 2.5, size: 22, hp: 8,
                     shotTimer: 0, sleeptimer: byRank(20, 80)};
        },
        update: function (en) {
            en.x += en.vx;
            en.vy += 0.1;
            en.y += en.vy;
            if(player.x > en.x)
            {
                en.vx += 0.3;
            }
            else
            {
                en.vx -= 0.3;
            }

            if(en.sleeptimer > 0)
            {
                en.sleeptimer--;
            }
            en.shotTimer--;
            if ((en.shotTimer <= 0) && (en.sleeptimer > 0)) {
                if(rank >= 20)
                {
                var angle = Math.atan2(player.y - en.y, player.x - en.x);
                var off = 10 * Math.PI / 180;
                var speed = byRank(12, 22);

                spawnEnemyBullet('laser', en.x, en.y, { angle: angle + off, speed: speed });
                spawnEnemyBullet('laser', en.x, en.y, { angle: angle - off, speed: speed });
                spawnEnemyBullet('laser', en.x, en.y, { angle: angle + off * 2, speed: speed });
                spawnEnemyBullet('laser', en.x, en.y, { angle: angle - off * 2, speed: speed });
                en.shotTimer = Math.round(byRank(15, 3));
                }
                else
                {
                var angle = Math.atan2(player.y - en.y, player.x - en.x);
                var off = 10 * Math.PI / 180;
                var speed = byRank(8, 15);

                spawnEnemyBullet('normal', en.x, en.y, { angle: angle + off, speed: speed });
                spawnEnemyBullet('normal', en.x, en.y, { angle: angle - off, speed: speed });
                en.shotTimer = Math.round(byRank(15, 3));
                }
            }
        }
    },

bomber: {
    create: function (x, y) {
        return { x: x, y: y, vx: 0, vy: 3, size: 14, hp: 20,
                 color: 'gold',
                 state: 'enter',
                 timer: 0,
                 stayTime: 360,
                 bombTimer: 40,
                 targetX: x, targetY: 120,
                 moveTimer: 0 };
    },
    update: function (en) {
        if (en.state === 'enter') {

            en.vy *= 0.96;
            if (en.vy < 0.4) {
                en.vy = 0;
                en.state = 'wander';
                en.timer = en.stayTime;
                en.moveTimer = 0;
            }
            en.y += en.vy;

        } else if (en.state === 'wander') {

            en.moveTimer--;
            if (en.moveTimer <= 0) {
                en.targetX = 40 + Math.random() * (base_w - 80);
                en.targetY = 60 + Math.random() * 150;
                en.moveTimer = 60 + Math.floor(Math.random() * 60);
            }

            en.x += (en.targetX - en.x) * 0.03;
            en.y += (en.targetY - en.y) * 0.03;


            en.bombTimer--;
            if (en.bombTimer <= 0) {
                var angle = Math.atan2(player.y - en.y, player.x - en.x);

                angle += (Math.random() - 0.5) * 0.6;
                spawnEnemyBullet('bomb', en.x, en.y,
                { angle: angle, speed: 1.5, fuse: Math.round(byRank(70, 40)) });
                en.bombTimer = Math.round(byRank(70, 30));
            }

            en.timer--;
            if (en.timer <= 0) {
                en.state = 'leave';
                en.timer = 20;
            }

        } else if (en.state === 'leave') {
            en.timer--;
            if (en.timer <= 0) {
                en.vy -= 0.25;
            }
            en.y += en.vy;
            if (en.y < -40) en.dead = true;
        }
    }
},

    ranger: {
create: function (x, y) {
    return { x: x, y: y, vx: 0, vy: 4, size: 22, hp: Math.round(byRank(15, 35)),
             state: 'enter',
             timer: 0,
             shotsLeft: Math.round(byRank(2, 15)),
             spin: 0,
             burstTimer: 0 };
},
        update: function (en) {
            if (en.state === 'enter') {

                en.vy *= 0.95;
                if (en.vy < 0.3) {
                    en.vy = 0;
                    en.state = 'fire';
                    en.timer = 30;
                }
            } else if (en.state === 'fire') {
                en.timer--;
                if (en.timer <= 0) {
                    fireMissile(en, Math.round(byRank(1, 5)), 0.35);
                    en.shotsLeft--;
                    en.timer = Math.round(byRank(60, 35));
                    if (en.shotsLeft <= 0) {
                        en.state = 'leave';
                        en.timer = 30;
                    }
                }
            } else if (en.state === 'leave') {
               en.timer--;
               if (en.timer <= 0) {
                  en.vy = 0.2;
               }



               if (en.y < -40) en.dead = true;
            }
            en.x += en.vx;
            en.y += en.vy;
        }
    },


    raider: {
create: function (x, y) {
    return { x: x, y: y, vx: 0, vy: 4, size: 25, hp: 15,
             state: 'enter',
             timer: 0,
             shotsLeft: 3,
             spin: 0,
             burstTimer: 0 };
},
        update: function (en) {
            if (en.state === 'enter') {

                en.vy *= 0.95;
                if (en.vy < 0.3) {
                    en.vy = 0;
                    en.state = 'fire';
                    en.timer = 30;
                }
            } else if (en.state === 'fire') {
                en.timer--;
                if (en.timer <= 0) {
                    fireFan(en, Math.round(byRank(3, 15)), 0.35);
                    en.shotsLeft--;
                    en.timer = Math.round(byRank(60, 15));
                    if (en.shotsLeft <= 0) {
                        en.state = 'leave';
                        en.timer = 30;
                    }
                }
            } else if (en.state === 'leave') {
               en.timer--;
               if (en.timer <= 0) {
                  en.vy -= 0.2;
               }


               en.burstTimer--;
                 if (en.burstTimer <= 0) {
                    fireRing(en);
                    en.burstTimer = Math.round(byRank(16, 4));
               }

               if (en.y < -40) en.dead = true;
            }
            en.x += en.vx;
            en.y += en.vy;
        }
    }
};


function fireFan(en, count, gap) {
    var center = Math.atan2(player.y - en.y, player.x - en.x);
    var speed = byRank(4, 9);
    for (var i = 0; i < count; i++) {
        var a = center + (i - (count - 1) / 2) * gap;
        spawnEnemyBullet('laser', en.x, en.y, { angle: a, speed: speed });
    }
}

function fireMissile(en, count, gap) {
    var center = Math.atan2(player.y - en.y, player.x - en.x);
    var speed = byRank(2.5, 9);
    for (var i = 0; i < count; i++) {
        var a = center + (i - (count - 1) / 2) * gap;
        spawnEnemyBullet('homing', en.x, en.y, { angle: a, speed: speed });
    }
}

function fireRing(en) {
    var count = Math.round(byRank(4, 16));
    var speed = byRank(1.8, 3);
    en.spin += 0.5;
    for (var i = 0; i < count; i++) {
        var a = en.spin + Math.PI * 2 * i / count;
        spawnEnemyBullet('laser', en.x, en.y, { angle: a, speed: speed });
    }
}

function spawnEnemy(typeName) {
    var type = enemyTypes[typeName];
    var x = 30 + Math.random() * (base_w - 60);
    var en = type.create(x, -20);
    en.type = type;
    en.dead = false;
    enemies.push(en);
}

function updateEnemies() {

    updateChain();
    enemySpawnTimer--;

    if (enemySpawnTimer <= 0) {

        var names = Object.keys(enemyTypes);
        var pick = names[Math.floor(Math.random() * names.length)];
        spawnEnemy(pick);
        enemySpawnTimer = Math.round(byRank(70, 35));
    }

    for (var i = 0; i < enemies.length; i++) {
        enemies[i].type.update(enemies[i]);
    }

    enemies = enemies.filter(function (en) {
        return !en.dead && en.y < base_h + 30;
    });
}

function drawEnemies() {
    for (var i = 0; i < enemies.length; i++) {
        var en = enemies[i];
        if (en.type === enemyTypes.scroll) {
           ctx.fillStyle = 'red';
        }
        if (en.type === enemyTypes.raider) {
           ctx.fillStyle = 'orange';
        }
        if (en.type === enemyTypes.ranger) {
           ctx.fillStyle = 'lime';
        }
        if (en.type === enemyTypes.bomber) {
           ctx.fillStyle = 'yellow';
        }
        if (en.type === enemyTypes.drift) {
           ctx.fillStyle = 'cyan';
        }
        ctx.fillRect(en.x - en.size, en.y - en.size, en.size * 2, en.size * 2);
    }
}

var chain = null;          // 進行中なら { x, left, timer }
var chainCooldown = 0;     // 次に発生判定をするまでの待ち時間

function startChain() {
    var count = Math.max(1, Math.round(rank));     // ランクの数だけ(最低1体)
    chain = {
        x: 40 + Math.random() * (base_w - 80),     // 全員この x から出る
        left: count,
        timer: 0                                   // 0 なら最初の1体はすぐ出る
    };
}
function spawnEnemyAt(typeName, x) {
    var type = enemyTypes[typeName];
    var en = type.create(x, -20);
    en.type = type;
    en.dead = false;
    enemies.push(en);
}
function updateChain() {
    // 進行中の連続スポーン
    if (chain) {
        chain.timer--;
        if (chain.timer <= 0) {
            spawnEnemyAt('drift', chain.x);
            chain.left--;
            chain.timer = 30;                      // 30フレームおき
            if (chain.left <= 0) chain = null;
        }
        return;
    }

    // 発生判定(たまに起きる)
    chainCooldown--;
    if (chainCooldown <= 0) {
        if (Math.random() < 0.3) startChain();     // 30%の確率で発生
        chainCooldown = 600;                       // 10秒ごとに判定
    }
}