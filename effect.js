var effects = [];



function spawnEffect(x, y, id) {
    if (id === undefined) {
        var ids = Object.keys(effectTypes);
        id = ids[Math.floor(Math.random() * ids.length)];
    }
    var type = effectTypes[id];
    var fx = type.create(x, y);
    fx.type = type;
    effects.push(fx);
}

function updateEffects() {
    for (var i = 0; i < effects.length; i++) {
        effects[i].type.update(effects[i]);
    }
    effects = effects.filter(function (fx) { return !fx.dead; });
}

var effectTypes = {
    // 1: 衝撃波リング(二重にして、最初は速く広がって後でゆっくりに)
    1: {
        create: function (x, y) {
            return { x: x, y: y, age: 0, life: 20, dead: false };
        },
        update: function (fx) {
            fx.age++;
            if (fx.age >= fx.life) fx.dead = true;
        },
        draw: function (fx) {
            var t = fx.age / fx.life;
            var e = 1 - (1 - t) * (1 - t);   // 最初に勢いよく広がる動き
            ctx.strokeStyle = 'rgba(255,255,255,' + (1 - t) + ')';
            ctx.lineWidth = 1 + 4 * (1 - t);
            ctx.beginPath();
            ctx.arc(fx.x, fx.y, 8 + e * 34, 0, Math.PI * 2);
            ctx.stroke();

            // 内側にもう1本
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(fx.x, fx.y, 4 + e * 18, 0, Math.PI * 2);
            ctx.stroke();
        }
    },

    // 2: 飛び散る破片(速さをバラけさせ、減速し、黄→赤に変化)
    2: {
        create: function (x, y) {
            var parts = [];
            for (var i = 0; i < 10; i++) {
                var a = Math.PI * 2 * i / 10 + Math.random() * 0.4;
                var sp = 2 + Math.random() * 3;
                parts.push({ x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp });
            }
            return { parts: parts, age: 0, life: 25, dead: false };
        },
        update: function (fx) {
            for (var i = 0; i < fx.parts.length; i++) {
                var p = fx.parts[i];
                p.x += p.vx;
                p.y += p.vy;
                p.vx *= 0.92;   // だんだん減速
                p.vy *= 0.92;
            }
            fx.age++;
            if (fx.age >= fx.life) fx.dead = true;
        },
        draw: function (fx) {
            var t = fx.age / fx.life;
            var size = 1 + 3 * (1 - t);   // だんだん小さく
            ctx.fillStyle = 'rgba(255,' + Math.floor(200 - t * 120) + ',60,' + (1 - t) + ')';
            for (var i = 0; i < fx.parts.length; i++) {
                ctx.fillRect(fx.parts[i].x - size, fx.parts[i].y - size, size * 2, size * 2);
            }
        }
    },

    // 3: 爆発の閃光(四角から、ふわっと光る丸に)
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
            var r = 14 + t * 22;
            var g = ctx.createRadialGradient(fx.x, fx.y, 0, fx.x, fx.y, r);
            g.addColorStop(0, 'rgba(255,255,255,' + (1 - t) + ')');
            g.addColorStop(0.5, 'rgba(255,230,120,' + (0.6 * (1 - t)) + ')');
            g.addColorStop(1, 'rgba(255,150,0,0)');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(fx.x, fx.y, r, 0, Math.PI * 2);
            ctx.fill();
        }
    },

    // 4: 小さな火花(四角から、尾を引く線に)
    4: {
        create: function (x, y) {
            var parts = [];
            for (var i = 0; i < 5; i++) {
                var a = Math.random() * Math.PI * 2;
                var sp = 2 + Math.random() * 3;
                parts.push({ x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp });
            }
            return { parts: parts, age: 0, life: 12, dead: false };
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
            var t = fx.age / fx.life;
            ctx.strokeStyle = 'rgba(255,255,255,' + (1 - t) + ')';
            ctx.lineWidth = 2;
            for (var i = 0; i < fx.parts.length; i++) {
                var p = fx.parts[i];
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x - p.vx * 2, p.y - p.vy * 2);   // 進行方向の逆に尾
                ctx.stroke();
            }
        }
    }
};

// spawnEffect, updateEffects はそのままでOK

function drawEffects() {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';   // 重なった部分が明るく光る
    for (var i = 0; i < effects.length; i++) {
        effects[i].type.draw(effects[i]);
    }
    ctx.restore();
}