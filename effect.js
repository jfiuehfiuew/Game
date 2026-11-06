var effects = [];   // 画面上で再生中のエフェクト

// ===== エフェクトの種類(それぞれ独立) =====
// create(x, y): エフェクトのオブジェクトを返す
// update(fx): 毎フレーム呼ばれる。終わったら fx.dead = true にする
// draw(fx): 描画
var effectTypes = {
    // 1: 広がる円(衝撃波)
    1: {
        create: function (x, y) {
            return { x: x, y: y, age: 0, life: 20, dead: false };
        },
        update: function (fx) {
            fx.age++;
            if (fx.age >= fx.life) fx.dead = true;
        },
        draw: function (fx) {
            var t = fx.age / fx.life;                 // 0 → 1
            ctx.strokeStyle = 'rgba(255,255,255,' + (1 - t) + ')';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(fx.x, fx.y, 8 + t * 30, 0, Math.PI * 2);
            ctx.stroke();
        }
    },

    // 2: 四角い破片が飛び散る
    2: {
        create: function (x, y) {
            var parts = [];
            for (var i = 0; i < 8; i++) {
                var a = Math.PI * 2 * i / 8;
                parts.push({ x: x, y: y, vx: Math.cos(a) * 3, vy: Math.sin(a) * 3 });
            }
            return { parts: parts, age: 0, life: 25, dead: false };
        },
        update: function (fx) {
            for (var i = 0; i < fx.parts.length; i++) {
                fx.parts[i].x += fx.parts[i].vx;
                fx.parts[i].y += fx.parts[i].vy;
            }
            fx.age++;
            if (fx.age >= fx.life) fx.dead = true;
        },
        draw: function (fx) {
            var alpha = 1 - fx.age / fx.life;
            ctx.fillStyle = 'rgba(255,80,80,' + alpha + ')';
            for (var i = 0; i < fx.parts.length; i++) {
                ctx.fillRect(fx.parts[i].x - 3, fx.parts[i].y - 3, 6, 6);
            }
        }
    },

    // 3: 一瞬光る白い四角
    3: {
        create: function (x, y) {
            return { x: x, y: y, age: 0, life: 10, dead: false };
        },
        update: function (fx) {
            fx.age++;
            if (fx.age >= fx.life) fx.dead = true;
        },
        draw: function (fx) {
            var t = fx.age / fx.life;
            var s = 12 + t * 20;
            ctx.fillStyle = 'rgba(255,255,200,' + (1 - t) + ')';
            ctx.fillRect(fx.x - s, fx.y - s, s * 2, s * 2);
        }
    }
};

// ===== エフェクトを出す =====
// id を省略するとランダムに1つ選ぶ
function spawnEffect(x, y, id) {
    if (id === undefined) {
        var ids = Object.keys(effectTypes);
        id = ids[Math.floor(Math.random() * ids.length)];
    }
    var type = effectTypes[id];
    var fx = type.create(x, y);
    fx.type = type;           // 自分の update / draw を覚えておく
    effects.push(fx);
}

function updateEffects() {
    for (var i = 0; i < effects.length; i++) {
        effects[i].type.update(effects[i]);
    }
    effects = effects.filter(function (fx) { return !fx.dead; });   // 終わったら消える
}

function drawEffects() {
    for (var i = 0; i < effects.length; i++) {
        effects[i].type.draw(effects[i]);
    }
}