// ===== ランクシステム =====
// rank は 0.0 〜 RANK_MAX の小数。高いほど敵が激しくなる。
var RANK_MAX = 30;
var rank = 0;
var rankTimer = 0;

function addRank(n) {
    rank = Math.max(0, Math.min(RANK_MAX, rank + n));
}

function updateRank() {
    rankTimer++;
    // 10秒(600フレーム)ごとに+0.5
    if (rankTimer >= 600) {
        rankTimer = 0;
        addRank(0.5);
    }
}

// 0〜1 に正規化した値(補間に使う)
function rankRatio() {
    return rank / RANK_MAX;
}

// ランクに応じて a(低ランク時)→ b(高ランク時)へ変化する値を返す
function byRank(a, b) {
    return a + (b - a) * rankRatio();
}