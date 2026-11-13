var keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    ShiftLeft: false,
    ShiftRight: false,
    KeyZ: false,
    KeyX: false,
    Digit1: false,
    Digit2: false,
    Digit3: false
};
var pressed = {}; 

document.addEventListener('keydown', function (e) {
    if (e.code in keys) {
        if (!keys[e.code]) pressed[e.code] = true; 
        keys[e.code] = true;
        e.preventDefault();
    }
});
document.addEventListener('keydown', function (e) {
    if (e.code in keys) {
        keys[e.code] = true;
        e.preventDefault();
    }
});
document.addEventListener('keyup', function (e) {
    if (e.code in keys) keys[e.code] = false;
});

window.addEventListener('blur', function () {
    for (var k in keys) keys[k] = false;
});