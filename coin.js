var coins = [];
var coinScore = 100;          // 1枚あたりの得点(好きに調整)
var magnetRange = 120;        // この距離に入ると吸い寄せられる

function spawnCoins(x, y, count) {
    for (var i = 0; i < count; i++) {
        var a = Math.random() * Math.PI * 2;
        var sp = 1 + Math.random() * 3;
        coins.push({
            x: x, y: y,
            vx: Math.cos(a) * sp,
            vy: Math.sin(a) * sp - 2,   // ちょっと上に跳ねてから落ちる
            age: 0,
            collecting: false,
            dead: false
        });
    }
}

function updateCoins() {
    for (var i = 0; i < coins.length; i++) {
        var c = coins[i];
        c.age++;

        var dx = player.x - c.x;
        var dy = player.y - c.y;
        var dist = Math.sqrt(dx * dx + dy * dy);

        // 近づく or ボム中は吸い寄せ状態にする(一度なったら解除しない)
        if (dist < magnetRange || megaLaser || spreadPower > 0) {
            c.collecting = true;
        }

        if (c.collecting) {
            // 自機に向かって加速しながら飛ぶ
            var speed = 6 + c.age * 0.05;
            c.x += dx / dist * speed;
            c.y += dy / dist * speed;
        } else {
            // 吸われる前は、ふわっと広がってゆっくり落ちる
            c.x += c.vx;
            c.y += c.vy;
            c.vx *= 0.95;
            c.vy = c.vy * 0.95 + 0.08;   // 少しずつ下へ
        }

        // 取れた
        if (dist < 14) {
            score += coinScore;          // ← 既存のスコア変数名に合わせてください
            spawnEffect(c.x, c.y, 4);    // 小さな火花
            c.dead = true;
        }

        // 取り逃した(画面の下に落ちた)
        if (c.y > canvas.height + 20) c.dead = true;
    }
    coins = coins.filter(function (c) { return !c.dead; });
}

function drawCoins() {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (var i = 0; i < coins.length; i++) {
        var c = coins[i];
        // くるくる回って見えるように、横幅を変える
        var w = 3 + Math.abs(Math.sin(c.age * 0.2 + i)) * 4;

        // ほんのり光る
        var g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, 10);
        g.addColorStop(0, 'rgba(255,230,100,0.5)');
        g.addColorStop(1, 'rgba(255,180,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(c.x, c.y, 10, 0, Math.PI * 2);
        ctx.fill();

        // コイン本体
        ctx.fillStyle = 'rgb(255,215,60)';
        ctx.fillRect(c.x - w / 2, c.y - 5, w, 10);
    }
    ctx.restore();
}