const play = document.getElementById("play");
const ctx = play.getContext("2d");

ctx.scale(20, 20);

function tips(){
        document.getElementById('tips').style.display = "none";
}

function arenaSweep() {
    let rowCount = 1;
    outer: for (let y = arena.length - 1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }

        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;

        player.score += rowCount * 10;
        rowCount *= 2;
    }
}

function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for(let y = 0; y < m.length; ++y){
        for(let x = 0; x < m[y].length; ++x){
            if (m[y][x] !== 0 &&
                (arena[y + o.y] &&
                arena[y + o.y][x + o.x]) !== 0) {
                    return true;
            }
        }
    }
    return false;
}

function createM(w, h){
    const matrix = [];
    while(h--){matrix.push(new Array(w).fill(0));}
    return matrix;
}

function createPiece(type){
    if (type === 'T'){
        return [
            [0, 0, 0],
            [1, 1, 1],
            [0, 1, 0],
        ];
    } else if(type === 'O') {
        return [
            [2, 2],
            [2, 2],
        ];
    } else if(type === 'L'){
        return [
            [0, 3, 0],
            [0, 3, 0],
            [0, 3, 3],
        ];
    } else if(type === 'J'){
        return [
            [0, 4, 0],
            [0, 4, 0],
            [4, 4, 0],
        ];
    } else if (type === 'I'){
        return[
            [0, 5, 0 ,0],
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0],
        ];
    } else if (type === 'Z'){
        return [
            [6, 6, 0],
            [0, 6, 6],
            [0, 0, 0]
        ];
    } else if (type === 'S'){
        return [
            [0, 7, 7],
            [7, 7, 0],
            [0, 0, 0]
        ];
    }
}

function draw() {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, play.width, play.height);

    drawM(arena, {x: 0, y: 0});
    drawM(player.matrix, player.pos);
}

function drawM(matrix, offset){
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if(value !== 0){
                ctx.fillStyle = colors[value];
                ctx.fillRect(x + offset.x,
                             y + offset.y,
                             1, 1);
            }
        });
    });
}

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

function update(time = 0){
    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if(dropCounter > dropInterval){
        playerDrop();
    }

    draw();
    requestAnimationFrame(update);
}

const colors = [
    null,
    '#FF0D72',
    '#0DC2FF',
    '#0DFF72',
    '#F538FF',
    '#FF8E0D',
    '#FFE138',
    '#3877FF',
]

const arena = createM(12, 20);

const player = {
    pos: {x: 0, y: 0},
    matrix: null,
    score: 0,
    high: 0,
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0){
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function playerDrop(){
    player.pos.y++;
    if(collide(arena, player)){
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
        updateScore();
    }
    dropCounter = 0;
}

function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)){
        player.pos.x -= dir;
    }
}

function playerReset() {
    const pieces = 'ILJOTSZ';
    player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) -
                    (player.matrix[0].length / 2 | 0);
    if (collide(arena, player)) {
        alert("Game Over!");
        player.score = 0;
        updateScore();
        arena.forEach(row => row.fill(0));
    }
}

function playerRotate(dir){
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while(collide(arena, player)){
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1: -1));
        if (offset > player.matrix[0].length){
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

function rotate(matrix, dir) {
    for(let y = 0; y < matrix.length; ++y) {
        for(let x = 0; x < y; ++x){
            [
                matrix[x][y],
                matrix[y][x],
            ] = [
                matrix[y][x],
                matrix[x][y],
            ];
        }
    }

    if(dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

function updateScore(){
    document.getElementById('score').innerText = "Score: " + player.score;
    if (player.score > player.high){player.high = player.score;}
    document.getElementById('hScore').innerText = "High Score: " + player.high; 
}

document.addEventListener('keydown', event => {
    if (event.keyCode === 37 || event.keyCode === 65){playerMove(-1);}
    else if(event.keyCode === 39 || event.keyCode === 68){playerMove(1);}
    else if(event.keyCode === 40 || event.keyCode === 83){playerDrop();}
    else if(event.keyCode === 82){playerRotate(-1);}
    else if(event.keyCode === 69){playerRotate(1);}
})

playerReset();
updateScore();
update();
