const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const UPSCALE = 10;
const UI_BAR_WIDTH = 200; // UI bar width in pixels
const LINE_WIDTH = 0.25 / UPSCALE;
const UI_SQUARE_SIZE = 750;
const SIZING_BOARD_ROWS = 8;
const SIZING_BOARD_COLS = 8;

canvas.style.width = canvas.width + "px";
canvas.width *= UPSCALE;
canvas.style.height = canvas.height + "px";
canvas.height *= UPSCALE;

function getSquareSize(boardDimensions) {
    let [boardRows, boardCols] = boardDimensions;
    let pixelsPerRow = canvas.height / boardRows;
    let pixelsPerCol = (canvas.width - UI_BAR_WIDTH * UPSCALE) / boardCols;
    return Math.min(pixelsPerRow, pixelsPerCol);
}

function getSquareCoords(boardDimensions, squarePosition) {
    let [boardRows, boardCols] = boardDimensions;
    let [squareRow, squareCol] = squarePosition;
    let squareSize = getSquareSize(boardDimensions);
    let availableWidth = canvas.width - UI_BAR_WIDTH * UPSCALE;
    let availableHeight = canvas.height;
    let boardWidth = boardCols * squareSize;
    let boardHeight = boardRows * squareSize;
    let unusedWidth = availableWidth - boardWidth;
    let unusedHeight = availableHeight - boardHeight;
    let boardLeft = unusedWidth / 2;
    let boardTop = unusedHeight / 2;
    let squareLeft = boardLeft + squareCol * squareSize;
    let squareTop = boardTop + squareRow * squareSize;
    return {
        left: squareLeft,
        top: squareTop,
        right: squareLeft + squareSize,
        bottom: squareTop + squareSize
    };
}

function getSquarePosition(boardDimensions, squareCoords) {
    let [boardRows, boardCols] = boardDimensions;
    let [squareX, squareY] = squareCoords;
    let squareSize = getSquareSize(boardDimensions);
    let availableWidth = canvas.width - UI_BAR_WIDTH * UPSCALE;
    let availableHeight = canvas.height;
    let boardWidth = boardCols * squareSize;
    let boardHeight = boardRows * squareSize;
    let unusedWidth = availableWidth - boardWidth;
    let unusedHeight = availableHeight - boardHeight;
    let boardLeft = unusedWidth / 2;
    let boardTop = unusedHeight / 2;
    return [
        Math.floor((squareY - boardTop) / squareSize),
        Math.floor((squareX - boardLeft) / squareSize)
    ];
}

function drawToSquare(boardDimensions, squarePosition, drawFunc) {
    let squareCoords = getSquareCoords(boardDimensions, squarePosition);
    ctx.save();
    ctx.translate(squareCoords.left, squareCoords.top);
    ctx.scale(squareCoords.right - squareCoords.left, squareCoords.bottom - squareCoords.top);
    drawFunc();
    ctx.restore();
}

function swapColors() {
    [ctx.strokeStyle, ctx.fillStyle] = [ctx.fillStyle, ctx.strokeStyle];
}

let displayPiece;
function getDescriptionText(board) {
    if (board.isPawnPromotion) {
        if (board.hoveringLeftArrow || board.hoveringRightArrow) return "Cycle promotion piece";
        if (board.hoveringConfirmButton) return "Confirm promotion piece";
        if (displayPiece && board.hoveringPromotionPiece) return displayPiece.descriptionText(false);
    }
    if (isBoardEditMode) {
        if (board.hoveringLeftArrow || board.hoveringRightArrow) return "Cycle piece to place";
        if (board.hoveringConfirmButton) return "Toggle piece color";
        if (displayPiece && board.hoveringPromotionPiece) return displayPiece.descriptionText(false);
        if (board.hoveringMovedButton) return "Toggle if piece to place has already moved (green = not moved, red = moved)"
    }
    if (board.hoveringWhiteSword) return "All squares white can move to";
    if (board.hoveringBlackSword) return "All squares black can move to";
    if (board.hoveredPiece) return board.hoveredPiece.descriptionText();
    let coords = getSquarePosition(board.size, mousePosition);
    if (board.isInBounds(coords)) return "Empty square @ " + coordsToName(coords, board.rows);
    return "Hover over something to see a description.";
}

function writeWrapped(text, x, y) {
    let currentLine = [];
    for (let word of text.split(/([ \n])/g)) {
        if (word === " ") continue;
        if (word !== "\n") currentLine.push(word);
        let measured = ctx.measureText(currentLine.join(" "));
        let width = measured.actualBoundingBoxLeft + measured.actualBoundingBoxRight;
        if (word === "\n" || width > UI_BAR_WIDTH * UPSCALE) {
            if (word !== "\n") currentLine.pop();
            ctx.fillText(currentLine.join(" "), x, y);
            y += measured.fontBoundingBoxAscent + measured.fontBoundingBoxDescent;
            currentLine = [];
            if (word !== "\n") currentLine.push(word);
        }
    }
    if (currentLine.length) ctx.fillText(currentLine.join(" "), x, y);
}

let whiteSword, blackSword;
let sizingBoard;
function draw(board) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!whiteSword) whiteSword = new _Sword(true, [0, SIZING_BOARD_COLS]);
    if (!blackSword) blackSword = new _Sword(false, [0, SIZING_BOARD_COLS + 1]);
    if (!sizingBoard) sizingBoard = new Board([SIZING_BOARD_ROWS, SIZING_BOARD_COLS]);
    board.draw();
    ctx.fillStyle = "#888888";
    ctx.fillRect(canvas.width - UI_BAR_WIDTH * UPSCALE, 0, UI_BAR_WIDTH * UPSCALE, canvas.height);
    whiteSword.draw(sizingBoard);
    blackSword.draw(sizingBoard);
    if (board.hoveredPiece) {
        let displayCopy = board.hoveredPiece.copy();
        displayCopy.moveTo([1, SIZING_BOARD_COLS]);
        displayCopy.draw(sizingBoard);
        delete displayCopy;
    }
    ctx.font = `${20 * UPSCALE}px Ubuntu Mono`;
    ctx.fillStyle = "#ffffff";
    ctx.textBaseline = "top";
    let x = canvas.width - UI_BAR_WIDTH * UPSCALE;
    writeWrapped(getDescriptionText(board), x, UI_SQUARE_SIZE * 2);
    ctx.textBaseline = "bottom";
    writeWrapped((isWhiteTurn ? "White" : "Black") + "'s turn", x, UI_SQUARE_SIZE * (SIZING_BOARD_ROWS - 3));
    if (isBoardEditMode || board.isPawnPromotion) {
        writeWrapped(isBoardEditMode ? "Select piece to place" : "Select promotion piece",
                     x, UI_SQUARE_SIZE * (SIZING_BOARD_ROWS - 2.5));
        let isWhite = isBoardEditMode ? boardEditPieceIsWhite : board.lastMovedPiece.isWhite;
        ctx.fillStyle = isWhite ? LIGHT_PIECE_COLOR : DARK_PIECE_COLOR;
        ctx.strokeStyle = isWhite ? DARK_PIECE_COLOR : LIGHT_PIECE_COLOR;
        ctx.lineWidth = LINE_WIDTH * UI_SQUARE_SIZE;
        for (let direction of [-1, 1]) {
            ctx.beginPath();
            ctx.moveTo(UI_SQUARE_SIZE * (SIZING_BOARD_COLS + direction) + UI_BAR_WIDTH * UPSCALE / 2,
                       UI_SQUARE_SIZE * (SIZING_BOARD_ROWS - 1.5));
            ctx.lineTo(UI_SQUARE_SIZE * (SIZING_BOARD_COLS + direction * 0.75) + UI_BAR_WIDTH * UPSCALE / 2,
                       UI_SQUARE_SIZE * (SIZING_BOARD_ROWS - 1.75));
            ctx.lineTo(UI_SQUARE_SIZE * (SIZING_BOARD_COLS + direction * 0.75) + UI_BAR_WIDTH * UPSCALE / 2,
                       UI_SQUARE_SIZE * (SIZING_BOARD_ROWS - 1.25));
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
        ctx.beginPath();
        ctx.ellipse(UI_SQUARE_SIZE * SIZING_BOARD_COLS + UI_BAR_WIDTH * UPSCALE / 2,
                    UI_SQUARE_SIZE * (SIZING_BOARD_ROWS - 0.5),
                    UI_SQUARE_SIZE / 4, UI_SQUARE_SIZE / 4, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        let pieceType;
        if (board.isPawnPromotion) pieceType = Piece.pawnPromotionPieceTypes[pawnPromotionSelection];
        else pieceType = Piece.pieceTypes[boardEditPieceSelection];
        if (!(displayPiece && displayPiece.constructor === pieceType && displayPiece.isWhite === isWhite))
            displayPiece = new pieceType(
                isWhite, [SIZING_BOARD_ROWS - 2, SIZING_BOARD_COLS + UI_BAR_WIDTH * UPSCALE / 2 / UI_SQUARE_SIZE - 0.5]
            );
        displayPiece.draw(sizingBoard);
        if (isBoardEditMode) {
            ctx.beginPath();
            ctx.save();
            ctx.fillStyle = boardEditPieceHasMoved ? "#f00" : "#0f0";
            ctx.strokeStyle = "#000";
            let cx = UI_SQUARE_SIZE * (SIZING_BOARD_COLS + 1) + UI_BAR_WIDTH * UPSCALE / 2;
            let cy = UI_SQUARE_SIZE * (SIZING_BOARD_ROWS - 0.5);
            let d = UI_SQUARE_SIZE / 4;
            ctx.moveTo(cx, cy - d);
            ctx.lineTo(cx + d, cy);
            ctx.lineTo(cx, cy + d);
            ctx.lineTo(cx - d, cy);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        }
    } else if (board.isInStalemate(isWhiteTurn))
        writeWrapped("Stalemate", x, UI_SQUARE_SIZE * (SIZING_BOARD_ROWS - 2.5));
    else if (board.isInCheckmate(true))
        writeWrapped("Black wins!", x, UI_SQUARE_SIZE * (SIZING_BOARD_ROWS - 2.5));
    else if (board.isInCheckmate(false))
        writeWrapped("White wins!", x, UI_SQUARE_SIZE * (SIZING_BOARD_ROWS - 2.5));
    else if (board.isInCheck(true))
        writeWrapped("White is in check", x, UI_SQUARE_SIZE * (SIZING_BOARD_ROWS - 2.5));
    else if (board.isInCheck(false))
        writeWrapped("Black is in check", x, UI_SQUARE_SIZE * (SIZING_BOARD_ROWS - 2.5));
}