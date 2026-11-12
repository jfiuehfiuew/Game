var enemies = [];
var enemySpawnTimer = 0;

// ===== 敵の種類(それぞれ独立) =====
// create(x, y): 敵の初期データを返す(共通項目は spawnEnemy が足す)
// update(en): 移動と攻撃。画面から消すときは en.dead = true
var enemyTypes = {

    // ---- scroll: まっすぐ下へ、一定間隔で狙い撃ち ----
    scroll: {
        create: function (x, y) {
            return { x: x, y: y, vx: 0, vy: 1.5, size: 17, hp: 5,
                     shotTimer: 30 };
        },
        update: function (en) {
            en.x += en.vx;
            en.y += en.vy;

            en.shotTimer--;
            if (en.shotTimer <= 0) {
                var angle = Math.atan2(player.y - en.y, player.x - en.x);
                spawnEnemyBullet('normal', en.x, en.y,
                                 { angle: angle, speed: byRank(3, 6) });
                en.shotTimer = Math.round(byRank(90, 20));   // 高ランクほど速く撃つ
            }
        }
    },
     drift: {
        create: function (x, y) {
            return { x: x, y: y, vx: 0, vy: 1.5, size: 22, hp: 8,
                     shotTimer: 0, sleeptimer: byRank(20, 80)};
        },
        update: function (en) {
            en.x += en.vx;
            en.vy += 0.1;
            en.y += en.vy;
            if(player.x > en.x)
            {
                en.vx += 0.1;
            }
            else
            {
                en.vx -= 0.1;
            }

            if(en.sleeptimer > 0)
            {
                en.sleeptimer--;
            }
            en.shotTimer--;
            if ((en.shotTimer <= 0) && (en.sleeptimer > 0)) {
              var angle = Math.atan2(player.y - en.y, player.x - en.x);
              var off = 10 * Math.PI / 180;
              var speed = byRank(8, 15);

              spawnEnemyBullet('normal', en.x, en.y, { angle: angle + off, speed: speed });
              spawnEnemyBullet('normal', en.x, en.y, { angle: angle - off, speed: speed });

              en.shotTimer = Math.round(byRank(15, 3));
            }
        }
    },
    // ---- bomber: 出てきて、さまよいながら爆弾を投げ、最後は上へ帰る ----
bomber: {
    create: function (x, y) {
        return { x: x, y: y, vx: 0, vy: 3, size: 14, hp: 20,
                 color: 'gold',
                 state: 'enter',        // enter → wander → leave
                 timer: 0,
                 stayTime: 360,         // さまよう時間(フレーム)
                 bombTimer: 40,         // 次の爆弾までのフレーム数
                 targetX: x, targetY: 120,   // 今向かっている目的地
                 moveTimer: 0 };
    },
    update: function (en) {
        if (en.state === 'enter') {
            // 減速しながら入ってくる
            en.vy *= 0.96;
            if (en.vy < 0.4) {
                en.vy = 0;
                en.state = 'wander';
                en.timer = en.stayTime;
                en.moveTimer = 0;
            }
            en.y += en.vy;

        } else if (en.state === 'wander') {
            // 一定間隔で新しい目的地を決める
            en.moveTimer--;
            if (en.moveTimer <= 0) {
                en.targetX = 40 + Math.random() * (base_w - 80);
                en.targetY = 60 + Math.random() * 150;      // 画面の上半分あたり
                en.moveTimer = 60 + Math.floor(Math.random() * 60);
            }
            // 目的地へゆっくり近づく(距離の一部ずつ進むので自然に減速する)
            en.x += (en.targetX - en.x) * 0.03;
            en.y += (en.targetY - en.y) * 0.03;

            // 爆弾を投げる
            en.bombTimer--;
            if (en.bombTimer <= 0) {
                var angle = Math.atan2(player.y - en.y, player.x - en.x);
                // 少しばらつかせて、毎回同じ軌道にならないようにする
                angle += (Math.random() - 0.5) * 0.6;
                spawnEnemyBullet('bomb', en.x, en.y,
                                 { angle: angle, speed: 1.5, fuse: Math.round(byRank(70, 40)) });
                en.bombTimer = Math.round(byRank(70, 30));   // 高ランクほど頻繁
            }

            // 滞在時間が終わったら帰る
            en.timer--;
            if (en.timer <= 0) {
                en.state = 'leave';
                en.timer = 20;
            }

        } else if (en.state === 'leave') {
            en.timer--;
            if (en.timer <= 0) {
                en.vy -= 0.25;          // 上へ加速して帰る
            }
            en.y += en.vy;
            if (en.y < -40) en.dead = true;
        }
    }
},
        // ---- ranger: 出てきて減速→5方向弾×3回→上へ逃げる ----
    ranger: {
create: function (x, y) {
    return { x: x, y: y, vx: 0, vy: 4, size: 22, hp: Math.round(byRank(15, 35)),
             state: 'enter',
             timer: 0,
             shotsLeft: Math.round(byRank(2, 15)),
             spin: 0,              // 追加
             burstTimer: 0 };      // 追加
},
        update: function (en) {
            if (en.state === 'enter') {
                // 減速しながら入ってくる
                en.vy *= 0.95;
                if (en.vy < 0.3) {
                    en.vy = 0;
                    en.state = 'fire';
                    en.timer = 30;           // 最初の一発までの間
                }
            } else if (en.state === 'fire') {
                en.timer--;
                if (en.timer <= 0) {
                    fireMissile(en, Math.round(byRank(1, 5)), 0.35);    // 5方向、隣との間隔0.35rad
                    en.shotsLeft--;
                    en.timer = Math.round(byRank(60, 35));
                    if (en.shotsLeft <= 0) {
                        en.state = 'leave';
                        en.timer = 30;       // 撃ち終わってから少し待って逃げる
                    }
                }
            } else if (en.state === 'leave') {
               en.timer--;
               if (en.timer <= 0) {
                  en.vy = 0.2;               // 上へ加速して逃げる
               }

            // ★ 退場中のばらまき(リング状の弾)

               if (en.y < -40) en.dead = true;
            }
            en.x += en.vx;
            en.y += en.vy;
        }
    },

    // ---- raider: 出てきて減速→5方向弾×3回→上へ逃げる ----
    raider: {
create: function (x, y) {
    return { x: x, y: y, vx: 0, vy: 4, size: 25, hp: 15,
             state: 'enter',
             timer: 0,
             shotsLeft: 3,
             spin: 0,              // 追加
             burstTimer: 0 };      // 追加
},
        update: function (en) {
            if (en.state === 'enter') {
                // 減速しながら入ってくる
                en.vy *= 0.95;
                if (en.vy < 0.3) {
                    en.vy = 0;
                    en.state = 'fire';
                    en.timer = 30;           // 最初の一発までの間
                }
            } else if (en.state === 'fire') {
                en.timer--;
                if (en.timer <= 0) {
                    fireFan(en, Math.round(byRank(3, 15)), 0.35);    // 5方向、隣との間隔0.35rad
                    en.shotsLeft--;
                    en.timer = Math.round(byRank(60, 15));
                    if (en.shotsLeft <= 0) {
                        en.state = 'leave';
                        en.timer = 30;       // 撃ち終わってから少し待って逃げる
                    }
                }
            } else if (en.state === 'leave') {
               en.timer--;
               if (en.timer <= 0) {
                  en.vy -= 0.2;               // 上へ加速して逃げる
               }

            // ★ 退場中のばらまき(リング状の弾)
               en.burstTimer--;
                 if (en.burstTimer <= 0) {
                    fireRing(en);
                    en.burstTimer = Math.round(byRank(16, 4));   // 高ランクほど頻繁
               }

               if (en.y < -40) en.dead = true;
            }
            en.x += en.vx;
            en.y += en.vy;
        }
    }
};

// 自機狙いを中心にした扇状弾(count 発、間隔 gap ラジアン)
function fireFan(en, count, gap) {
    var center = Math.atan2(player.y - en.y, player.x - en.x);
    var speed = byRank(2.5, 9);
    for (var i = 0; i < count; i++) {
        var a = center + (i - (count - 1) / 2) * gap;
        spawnEnemyBullet('normal', en.x, en.y, { angle: a, speed: speed });
    }
}

// 自機狙いを中心にした扇状弾(count 発、間隔 gap ラジアン)
function fireMissile(en, count, gap) {
    var center = Math.atan2(player.y - en.y, player.x - en.x) + 180;
    var speed = byRank(2.5, 9);
    for (var i = 0; i < count; i++) {
        var a = center + (i - (count - 1) / 2) * gap;
        spawnEnemyBullet('homing', en.x, en.y, { angle: a, speed: speed });
    }
}
// ぐるっと一周まき散らす。撃つたびに角度をずらすので渦になる
function fireRing(en) {
    var count = Math.round(byRank(4, 16));      // 一周の弾数
    var speed = byRank(1.8, 3);
    en.spin += 0.5;                             // 毎回ずらす
    for (var i = 0; i < count; i++) {
        var a = en.spin + Math.PI * 2 * i / count;
        spawnEnemyBullet('normal', en.x, en.y, { angle: a, speed: speed });
    }
}
// ===== 敵を出す =====
function spawnEnemy(typeName) {
    var type = enemyTypes[typeName];
    var x = 30 + Math.random() * (base_w - 60);
    var en = type.create(x, -20);
    en.type = type;
    en.dead = false;
    enemies.push(en);
}

function updateEnemies() {
    enemySpawnTimer--;
    if (enemySpawnTimer <= 0) {
        // 全タイプからランダムに選ぶ
        var names = Object.keys(enemyTypes);   // ['scroll', 'raider', 'ranger', ...]
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