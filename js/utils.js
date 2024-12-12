function isLightSquare(boardDimensions, squarePosition) {
    let [boardRows, boardCols] = boardDimensions;
    let [squareRow, squareCol] = squarePosition;
    // First square of far-right column must be light (https://en.wikipedia.org/wiki/Chessboard#History_and_evolution)
    return ((boardRows - squareRow - 1) + (boardCols - squareCol - 1)) % 2 === 0;
}

function hexToRGBA(hexColor, alpha = 1) {
    if (!/^#?(?:[0-9A-Fa-f]{3}){1,2}$/.test(hexColor))
        throw new Error("Invalid hex color: " + hexColor);
    if (hexColor.startsWith("#")) hexColor = hexColor.slice(1);
    if (hexColor.length === 3) hexColor = [...hexColor].map(x => x.repeat(2)).join("");
    return "rgba(" + [0, 2, 4].map(x => parseInt(hexColor.slice(x, x + 2), 16)).join(", ") + ", " + alpha + ")";
}

function lerp(a, b, t) {
    return a * (1 - t) + b * t;
}

const NUM_LETTERS = 26;
function numberToColumnName(column) {
    if (column < NUM_LETTERS) return String.fromCharCode(column + 97);
    let digits = [];
    while (column > 0) {
        digits.unshift(column % NUM_LETTERS);
        column = Math.floor(column / NUM_LETTERS);
    }
    digits[0]--;
    return digits.map(x => String.fromCharCode(x + 97)).join("");
}

function columnNameToNumber(columnName) {
    let digits = [...columnName].map(x => x.charCodeAt(0) - 97);
    if (digits.length === 1) return digits[0];
    digits[0]++;
    let output = 0;
    for (let digit of digits) output = output * NUM_LETTERS + digit;
    return output;
}

function coordsToName(coords, rows) {
    let [row, col] = coords;
    return numberToColumnName(col) + (rows - row);
}

function nameToCoords(name, board) {
    const r = /^([a-z]+)(\d+)$/;
    if (!r.test(name)) return null;
    let [_, columnName, row] = name.match(r);
    row = board.rows - (+row);
    let col = columnNameToNumber(columnName);
    let output = [row, col];
    if (!board.isInBounds(output)) return null;
    return output;
}