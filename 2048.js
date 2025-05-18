var board;
var score = 0;
var rows = 4;
var columns = 4;
let gameOver = false;

// Update image paths to include the "public/" directory
let numToImage = {
    2: "public/slu.jpg",
    4: "public/mizzou.png",
    8: "public/fontbonne.jpg",
    16: "public/wl.jpg",
    32: "public/gw.png",
    64: "public/udub.jpg",
    128: "public/purdue.png",
    256: "public/umich.png",
    512: "public/northwestern.png",
    1024: "public/uchicago.png",
    2048: "public/washu.png"
};

window.onload = function() {
    initializeGame();
    document.getElementById("new-game-button").addEventListener("click", restartGame);
    setupSwipeControls();
}

window.addEventListener("keydown", function(e) {
    if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
        e.preventDefault();
    }
}, false);

gameBoard.addEventListener('touchmove', function(event) {
    event.preventDefault(); // Prevents scrolling when touch is on board
}, { passive: false });

function initializeGame() {
    board = []; 
    const boardElement = document.getElementById("board");
    boardElement.innerHTML = ''; // Clear previous tiles if any (for restart)

    for (let r = 0; r < rows; r++) {
        let row = [];
        for (let c = 0; c < columns; c++) {
            row.push(0); 
            let tile = document.createElement("div");
            tile.id = r.toString() + "-" + c.toString();
            tile.classList.add("tile"); 
            boardElement.append(tile);
            updateTile(tile, 0); 
        }
        board.push(row);
    }
    
    setTwo();
    setTwo();
    updateScoreDisplay();
}

function restartGame() {
    const existingOverlay = document.getElementById("game-over-overlay");
    if (existingOverlay) {
        existingOverlay.remove();
    }

    score = 0;
    gameOver = false;
    initializeGame(); // Re-initializes board and starting tiles
}

function updateScoreDisplay() {
    document.getElementById("score").innerText = score;
}

function updateTile(tile, num) {
    tile.innerHTML = ""; // Clear previous content (image)
    
    // Remove old value-specific classes (x2, x4 etc.) and animation classes
    let classesToRemove = ["tile-appear", "tile-merged"];
    for (const key in numToImage) {
        classesToRemove.push("x" + key);
    }
    // Add any other specific classes like x4096, x8192 if they were defined in CSS
    classesToRemove.push("x4096", "x8192"); 
    tile.classList.remove(...classesToRemove);

    // Ensure base class is present (it should be added at creation)
    if (!tile.classList.contains("tile")) {
        tile.classList.add("tile");
    }

    if (num > 0) {
        const img = document.createElement("img");
        img.src = numToImage[num]; // Path already includes "public/" from numToImage map
        // img.style.width = "100%"; // Now handled by CSS .tile img
        // img.style.height = "100%"; // Now handled by CSS .tile img
        tile.appendChild(img);
        
        // Add the correct xN class for styling
        if (numToImage[num]) {
            tile.classList.add("x" + num.toString());
        } else if (num === 4096) {
            tile.classList.add("x4096");
        } else if (num === 8192) {
            tile.classList.add("x8192");
        }
        // Note: Original code's win condition was slightly different.
        // This logic calls endGame if 2048 (or highest configured tile) is reached.
        const values = Object.keys(numToImage).map(Number);
        const maxConfiguredValue = Math.max(...values); // e.g. 2048 if washu.png is the last
        
        if (num >= maxConfiguredValue && numToImage[maxConfiguredValue].includes("washu.png") && !gameOver) {
             setTimeout(endGame, 250); // Delay endGame slightly to let animation play
        }
    }
    // If num is 0, tile is empty. Default styling from .tile and .cdc1b5 background will apply.
}

function endGame() { // This is the "Win" scenario
    if (gameOver) return; // Prevent multiple calls
    gameOver = true;

    const overlay = document.createElement("div");
    overlay.id = "game-over-overlay";

    const message = document.createElement("div");
    message.id = "game-over-message";
    message.innerText = "You Beat GetWashU!";
    
    const restartButton = document.createElement("button");
    restartButton.innerText = "Play Again?";
    restartButton.onclick = restartGame;

    overlay.appendChild(message);
    overlay.appendChild(restartButton);
    document.body.appendChild(overlay);
}



// Keyup event listener for arrow wasd keys
document.addEventListener('keyup', (e) => {
    if (gameOver) return; // Do nothing if the game is over
    let moved = false;

    if (e.code === "ArrowLeft" || e.code === "KeyA") {
        moved = slideLeft();
    }
    else if (e.code === "ArrowRight" || e.code === "KeyD") {
        moved = slideRight();
    }
    else if (e.code === "ArrowUp" || e.code === "KeyW") {
        moved = slideUp();
    }
    else if (e.code === "ArrowDown" || e.code === "KeyS") {
        moved = slideDown();
    }

    if (moved) {
        setNewTileAnimated(); // Use animated version
    }
    updateScoreDisplay(); // Update score display after any move attempt
    
    // Check for loss condition if no empty tiles and no possible moves
    if (!hasEmptyTile() && !canMove()) {
        setTimeout(handleLoss, 300); // Delay slightly
    }
});




function filterZero(row){
    return row.filter(num => num != 0); //create new array of all nums != 0
}

function slide(row) {
    //[0, 2, 2, 2] 
    let originalRow = [...row]; // For checking if any change occurred
    row = filterZero(row); //[2, 2, 2]
    let mergedIndices = [];

    for (let i = 0; i < row.length-1; i++){
        if (row[i] == row[i+1] && row[i] !== 0) { // Make sure we are not merging 0s
            row[i] *= 2;
            row[i+1] = 0;
            score += row[i];
            mergedIndices.push(i); // Store index of the tile that grew
        }
    } //[4, 0, 2]
    row = filterZero(row); //[4, 2]
    //add zeroes
    while (row.length < columns) {
        row.push(0);
    } //[4, 2, 0, 0]

    let moved = JSON.stringify(originalRow) !== JSON.stringify(row);
    return { newRow: row, mergedIndices: mergedIndices, moved: moved };
}
function slideLeft() {
    let overallMoved = false;
    for (let r = 0; r < rows; r++) {
        let row = board[r];
        let result = slide(row);
        board[r] = result.newRow;
        if (result.moved) overallMoved = true;

        for (let c = 0; c < columns; c++){
            let tile = document.getElementById(r.toString() + "-" + c.toString());
            let num = board[r][c];
            updateTile(tile, num);
            if (result.mergedIndices.includes(c) && num > 0) {
                tile.classList.add("tile-merged");
                tile.addEventListener('animationend', () => tile.classList.remove("tile-merged"), { once: true });
            }
        }
    }
    return overallMoved;
}

function slideRight() {
    let overallMoved = false;
    for (let r = 0; r < rows; r++) {
        let row = board[r];         //[0, 2, 2, 2]
        row.reverse();              //[2, 2, 2, 0]
        let result = slide(row);    //[4, 2, 0, 0]
        let newRow = result.newRow.reverse(); //[0, 0, 2, 4];
        board[r] = newRow;
        if (result.moved) overallMoved = true;
        
        let reversedMergedIndices = result.mergedIndices.map(index => columns - 1 - index);

        for (let c = 0; c < columns; c++){
            let tile = document.getElementById(r.toString() + "-" + c.toString());
            let num = board[r][c];
            updateTile(tile, num);
            if (reversedMergedIndices.includes(c) && num > 0) {
                 tile.classList.add("tile-merged");
                 tile.addEventListener('animationend', () => tile.classList.remove("tile-merged"), { once: true });
            }
        }
    }
    return overallMoved;
}

function slideUp() {
    let overallMoved = false;
    for (let c = 0; c < columns; c++) {
        let colAsRow = [];
        for(let r = 0; r < rows; r++) {
            colAsRow.push(board[r][c]);
        }
        
        let result = slide(colAsRow);
        if (result.moved) overallMoved = true;

        for (let r = 0; r < rows; r++){
            board[r][c] = result.newRow[r];
            let tile = document.getElementById(r.toString() + "-" + c.toString());
            let num = board[r][c];
            updateTile(tile, num);
            if (result.mergedIndices.includes(r) && num > 0) {
                tile.classList.add("tile-merged");
                tile.addEventListener('animationend', () => tile.classList.remove("tile-merged"), { once: true });
            }
        }
    }
    return overallMoved;
}

function slideDown() {
    let overallMoved = false;
    for (let c = 0; c < columns; c++) {
        let colAsRow = [];
        for(let r = 0; r < rows; r++) {
            colAsRow.push(board[r][c]);
        }
        colAsRow.reverse();
        let result = slide(colAsRow);
        let newCol = result.newRow.reverse();
        if (result.moved) overallMoved = true;

        let reversedMergedIndices = result.mergedIndices.map(index => rows - 1 - index);

        for (let r = 0; r < rows; r++){
            board[r][c] = newCol[r];
            let tile = document.getElementById(r.toString() + "-" + c.toString());
            let num = board[r][c];
            updateTile(tile, num);
            if (reversedMergedIndices.includes(r) && num > 0) {
                tile.classList.add("tile-merged");
                tile.addEventListener('animationend', () => tile.classList.remove("tile-merged"), { once: true });
            }
        }
    }
    return overallMoved;
}

// Swipe Control Logic
function setupSwipeControls() {
    const gameBoard = document.getElementById('board');
    let touchstartX = 0;
    let touchstartY = 0;
    let touchendX = 0;
    let touchendY = 0;
    const swipeThreshold = 50; // Minimum distance for a swipe

    gameBoard.addEventListener('touchstart', function(event) {
        touchstartX = event.changedTouches[0].screenX;
        touchstartY = event.changedTouches[0].screenY;
    }, false);

    gameBoard.addEventListener('touchend', function(event) {
        touchendX = event.changedTouches[0].screenX;
        touchendY = event.changedTouches[0].screenY;
        handleSwipeGesture();
    }, false);
    
    // Prevent page scrolling with touch on board if applicable
    gameBoard.addEventListener('touchmove', function(event) {
        event.preventDefault(); // Prevents scrolling when touch is on board
    }, { passive: false });


    function handleSwipeGesture() {
        if (gameOver) return;

        const deltaX = touchendX - touchstartX;
        const deltaY = touchendY - touchstartY;

        if (Math.abs(deltaX) > Math.abs(deltaY)) { // Horizontal swipe
            if (Math.abs(deltaX) > swipeThreshold) {
                if (deltaX > 0) {
                    handleMove("SwipeRight");
                } else {
                    handleMove("SwipeLeft");
                }
            }
        } else { // Vertical swipe
            if (Math.abs(deltaY) > swipeThreshold) {
                if (deltaY > 0) {
                    handleMove("SwipeDown");
                } else {
                    handleMove("SwipeUp");
                }
            }
        }
    }
}
function handleMove(direction) {
    if (gameOver) return; // Do nothing if the game is over
    let moved = false;

    switch (direction) {
        case "SwipeLeft":
            moved = slideLeft();
            break;
        case "SwipeRight":
            moved = slideRight();
            break;
        case "SwipeUp":
            moved = slideUp();
            break;
        case "SwipeDown":
            moved = slideDown();
            break;
    }

    if (moved) {
        setNewTileAnimated(); // Use animated version
    }
    updateScoreDisplay(); // Update score display after any move attempt
    
    // Check for loss condition if no empty tiles and no possible moves
    if (!hasEmptyTile() && !canMove()) {
        setTimeout(handleLoss, 300); // Delay slightly
    }
}
function handleLoss() {
    if (gameOver) return; // Prevent multiple calls if already lost or won
    gameOver = true;

    const overlay = document.createElement("div");
    overlay.id = "game-over-overlay";

    const message = document.createElement("div");
    message.id = "game-over-message";
    message.innerText = "Game Over!"; // More generic message
    
    const restartButton = document.createElement("button");
    restartButton.innerText = "Try Again";
    restartButton.onclick = restartGame;

    overlay.appendChild(message);
    overlay.appendChild(restartButton);
    document.body.appendChild(overlay);
}
function setNewTileAnimated() { // Renamed from setNewTile
    if (!hasEmptyTile()) {
        // No need to call handleLoss here, it's checked after a move.
        return;
    }
    let found = false;
    while (!found) {
        let r = Math.floor(Math.random() * rows);
        let c = Math.floor(Math.random() * columns);
        if (board[r][c] == 0) {
            board[r][c] = Math.random() < 0.9 ? 2 : 4; // 90% chance for 2, 10% for 4
            let tile = document.getElementById(r.toString() + "-" + c.toString());
            updateTile(tile, board[r][c]);
            tile.classList.add("tile-appear");
            tile.addEventListener('animationend', () => tile.classList.remove("tile-appear"), { once: true });
            found = true;
        }
    }
}

function setTwo() { // Used for initial setup
    if (!hasEmptyTile()) {
        return;
    }
    let found = false;
    while (!found) {
        let r = Math.floor(Math.random() * rows);
        let c = Math.floor(Math.random() * columns);
        if (board[r][c] == 0) {
            board[r][c] = 2; // Always 2 for initial tiles
            let tile = document.getElementById(r.toString() + "-" + c.toString());
            updateTile(tile, board[r][c]);
            tile.classList.add("tile-appear");
            tile.addEventListener('animationend', () => tile.classList.remove("tile-appear"), { once: true });
            found = true;
        }
    }
}
//testing (can be removed or kept for debugging)
// function set1024() {
//     if (!hasEmptyTile()) {
//         return;
//     }
//     let found = false;
//     while (!found) {
//         let r = Math.floor(Math.random() * rows);
//         let c = Math.floor(Math.random() * columns);
//         if (board[r][c] == 0) {
//             board[r][c] = 1024;
//             let tile = document.getElementById(r.toString() + "-" + c.toString());
//             updateTile(tile, board[r][c]);
//             tile.classList.add("tile-appear");
//             tile.addEventListener('animationend', () => tile.classList.remove("tile-appear"), { once: true });
//             found = true;
//         }
//     }
// }


function hasEmptyTile() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if (board[r][c] == 0) {
                return true;
            }
        }
    }
    return false;
}

// New function to check if any moves are possible
function canMove() {
    // Check for horizontal merges
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns - 1; c++) {
            if (board[r][c] === board[r][c+1] && board[r][c] !== 0) return true;
        }
    }
    // Check for vertical merges
    for (let c = 0; c < columns; c++) {
        for (let r = 0; r < rows - 1; r++) {
            if (board[r][c] === board[r+1][c] && board[r][c] !== 0) return true;
        }
    }
    return false; // No merges possible (and no empty tiles implies loss)
}