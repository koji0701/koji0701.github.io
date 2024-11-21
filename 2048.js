var board;
var score = 0;
var rows = 4;
var columns = 4;
let gameOver = false;

let numToImage = {
    2: "slu.jpg",
    4: "mizzou.png",
    8: "fontbonne.jpg",
    16: "wl.jpg",
    32: "gw.png",
    64: "udub.jpg",
    128: "purdue.png",
    256: "umich.png",
    512: "northwestern.png",
    1024: "uchicago.png",
    2048: "washu.png"
}

window.onload = function() {
    setGame();
}

function setGame() {
    // board = [
    //     [2, 2, 2, 2],
    //     [2, 2, 2, 2],
    //     [4, 4, 8, 8],
    //     [4, 4, 8, 8]
    // ];

    board = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ]

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            let tile = document.createElement("div");
            tile.id = r.toString() + "-" + c.toString();
            let num = board[r][c];
            updateTile(tile, num);
            document.getElementById("board").append(tile);
        }
    }
    //create 2 to begin the game
    setTwo();
    setTwo();

    //testing
    // set1024();
    // set1024();
}


function updateTile(tile, num) {
    tile.innerText = "";
    tile.classList.value = ""; //clear the classList
    tile.classList.add("tile");
    if (num > 0) {
        const img = document.createElement("img");
        img.src = numToImage[num];
        img.style.width = "100%";
        img.style.height = "100%";
        tile.appendChild(img);
        
        if (num < 2048) {
            tile.classList.add("x"+num.toString());
        } else { //beat the game
            //tile.classList.add("x8192");
            endGame();
        }                
    }
}

function endGame() {
    gameOver = true;

    // Create the overlay div
    const overlay = document.createElement("div");
    overlay.id = "game-over-overlay";

    // Create the message
    const message = document.createElement("div");
    message.id = "game-over-message";
    message.innerText = "You Beat GetWashU!";
    
    // Append message and button to the overlay
    overlay.appendChild(message);
    // Append the overlay to the body
    document.body.appendChild(overlay);
}



// Keyup event listener for arrow wasd keys
document.addEventListener('keyup', (e) => {
    if (gameOver) return; // Do nothing if the game is over

    if (e.code === "ArrowLeft" || e.code === "KeyA") {
        slideLeft();
        setNewTile();
    }
    else if (e.code === "ArrowRight" || e.code === "KeyD") {
        slideRight();
        setNewTile();
    }
    else if (e.code === "ArrowUp" || e.code === "KeyW") {
        slideUp();
        setNewTile();
    }
    else if (e.code === "ArrowDown" || e.code === "KeyS") {
        slideDown();
        setNewTile();
    }
    document.getElementById("score").innerText = score;
});




function filterZero(row){
    return row.filter(num => num != 0); //create new array of all nums != 0
}

function slide(row) {
    //[0, 2, 2, 2] 
    row = filterZero(row); //[2, 2, 2]
    for (let i = 0; i < row.length-1; i++){
        if (row[i] == row[i+1]) {
            row[i] *= 2;
            row[i+1] = 0;
            score += row[i];
        }
    } //[4, 0, 2]
    row = filterZero(row); //[4, 2]
    //add zeroes
    while (row.length < columns) {
        row.push(0);
    } //[4, 2, 0, 0]
    return row;
}

function slideLeft() {
    for (let r = 0; r < rows; r++) {
        let row = board[r];
        row = slide(row);
        board[r] = row;
        for (let c = 0; c < columns; c++){
            let tile = document.getElementById(r.toString() + "-" + c.toString());
            let num = board[r][c];
            updateTile(tile, num);
        }
    }
}

function slideRight() {
    for (let r = 0; r < rows; r++) {
        let row = board[r];         //[0, 2, 2, 2]
        row.reverse();              //[2, 2, 2, 0]
        row = slide(row)            //[4, 2, 0, 0]
        board[r] = row.reverse();   //[0, 0, 2, 4];
        for (let c = 0; c < columns; c++){
            let tile = document.getElementById(r.toString() + "-" + c.toString());
            let num = board[r][c];
            updateTile(tile, num);
        }
    }
}

function slideUp() {
    for (let c = 0; c < columns; c++) {
        let row = [board[0][c], board[1][c], board[2][c], board[3][c]];
        row = slide(row);
        // board[0][c] = row[0];
        // board[1][c] = row[1];
        // board[2][c] = row[2];
        // board[3][c] = row[3];
        for (let r = 0; r < rows; r++){
            board[r][c] = row[r];
            let tile = document.getElementById(r.toString() + "-" + c.toString());
            let num = board[r][c];
            updateTile(tile, num);
        }
    }
}

function slideDown() {
    for (let c = 0; c < columns; c++) {
        let row = [board[0][c], board[1][c], board[2][c], board[3][c]];
        row.reverse();
        row = slide(row);
        row.reverse();
        // board[0][c] = row[0];
        // board[1][c] = row[1];
        // board[2][c] = row[2];
        // board[3][c] = row[3];
        for (let r = 0; r < rows; r++){
            board[r][c] = row[r];
            let tile = document.getElementById(r.toString() + "-" + c.toString());
            let num = board[r][c];
            updateTile(tile, num);
        }
    }
}

function handleLoss() {
    gameOver = true;

    // Create the overlay div
    const overlay = document.createElement("div");
    overlay.id = "game-over-overlay";

    // Create the message
    const message = document.createElement("div");
    message.id = "game-over-message";
    message.innerText = "You Lost GetWashU!";
    
    // Append message and button to the overlay
    overlay.appendChild(message);
    // Append the overlay to the body
    document.body.appendChild(overlay);
}

function setNewTile() {
    if (!hasEmptyTile()) {
        //handle loss
        handleLoss();
        return;
    }
    let found = false;
    while (!found) {
        let r = Math.floor(Math.random() * rows);
        let c = Math.floor(Math.random() * columns);
        if (board[r][c] == 0) {
            board[r][c] = Math.random() < 0.9 ? 2 : 4;
            let tile = document.getElementById(r.toString() + "-" + c.toString());
            updateTile(tile, board[r][c]);
            found = true;
        }
    }
}
function setTwo() {
    if (!hasEmptyTile()) {
        return;
    }
    let found = false;
    while (!found) {
        let r = Math.floor(Math.random() * rows);
        let c = Math.floor(Math.random() * columns);
        if (board[r][c] == 0) {
            board[r][c] = 2;
            let tile = document.getElementById(r.toString() + "-" + c.toString());
            updateTile(tile, board[r][c]);
            found = true;
        }
    }
}
//testing
function set1024() {
    if (!hasEmptyTile()) {
        return;
    }
    let found = false;
    while (!found) {
        let r = Math.floor(Math.random() * rows);
        let c = Math.floor(Math.random() * columns);
        if (board[r][c] == 0) {
            board[r][c] = 1024;
            let tile = document.getElementById(r.toString() + "-" + c.toString());
            updateTile(tile, board[r][c]);
            found = true;
        }
    }
}


function hasEmptyTile() {
    let count = 0;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if (board[r][c] == 0) { //at least one zero in the board
                return true;
            }
        }
    }
    return false;
}