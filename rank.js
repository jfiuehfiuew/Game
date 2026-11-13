
var RANK_MAX = 30;
var rank = 0;
var rankTimer = 0;

function addRank(n) {
    rank = Math.max(0, Math.min(RANK_MAX, rank + n));
}

function updateRank() {
    rankTimer++;

    if (rankTimer >= 600) {
        rankTimer = 0;
        addRank(1);
    }
}


function rankRatio() {
    return rank / RANK_MAX;
}

function byRank(a, b) {
    return a + (b - a) * rankRatio();
}