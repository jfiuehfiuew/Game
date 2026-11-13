var effects = [];
var effectTypes = {
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
            ctx.strokeStyle = 'rgba(255,255,255,' + (1 - t) + ')';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(fx.x, fx.y, 8 + t * 30, 0, Math.PI * 2);
            ctx.stroke();
        }
    },

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
    },

    4: {
        create: function (x, y) {
            return { x: x, y: y, age: 0, life: 8, dead: false };
        },
        update: function (fx) {
            fx.age++;
            if (fx.age >= fx.life) fx.dead = true;
        },
        draw: function (fx) {
            var t = fx.age / fx.life;
            ctx.fillStyle = 'rgba(255,255,255,' + (1 - t) + ')';
            var s = 3 + t * 4;
            ctx.fillRect(fx.x - s, fx.y - s, s * 2, s * 2);
        }
    }
};


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

function drawEffects() {
    for (var i = 0; i < effects.length; i++) {
        effects[i].type.draw(effects[i]);
    }
}