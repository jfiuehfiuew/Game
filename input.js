var keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    ShiftLeft: false,
    ShiftRight: false,
    KeyZ: false,
    KeyX: false
};

document.addEventListener('keydown', function (e) {
    if (e.code in keys) {
        keys[e.code] = true;
        e.preventDefault();
    }
    if (e.code === 'Digit1') weapon = 1;
    if (e.code === 'Digit2') weapon = 2;
    if (e.code === 'Digit3') weapon = 3;
    if (e.code === 'KeyX' && !e.repeat) useBomb();   // ← keydown の中
});
document.addEventListener('keyup', function (e) {
    if (e.code in keys) keys[e.code] = false;
});

window.addEventListener('blur', function () {
    for (var k in keys) keys[k] = false;
});