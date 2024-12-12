const textarea = document.getElementById("boardtext");
textarea.value = `8 8
a1R b1N c1B d1Q e1K f1B g1N h1R
a8r b8n c8b d8q e8k f8b g8n h8r
a2P b2P c2P d2P e2P f2P g2P h2P
a7p b7p c7p d7p e7p f7p g7p h7p`;

[...document.getElementsByClassName("editing")].forEach(x => {x.disabled = true;});

let board, isWhiteTurn, selectedPiece, pawnPromotionSelection;
let isBoardEditMode = false;
let boardEditPieceSelection = 0;
let boardEditPieceIsWhite = true;
let boardEditPieceHasMoved = false;

function loadFromTextarea() {
    try {
        board = Board.fromString(textarea.value);
    } catch (e) {
        alert(e);
        return;
    }
    isWhiteTurn = true;
    selectedPiece = null;
    pawnPromotionSelection = null;
    draw(board);
}

function saveToTextarea() {
    textarea.value = board.toString();
}

function toggleBoardEditMode() {
    isBoardEditMode = !isBoardEditMode;
    if (isBoardEditMode) {
        isWhiteTurn = true;
        selectedPiece = null;
        pawnPromotionSelection = null;
    }
    draw(board);
    document.getElementById("editMode").innerText = (isBoardEditMode ? "Disable" : "Enable") + " board edit mode";
    [...document.getElementsByClassName("editing")].forEach(x => {x.disabled = !isBoardEditMode;});
}

function changeRows(offset) {
    let newRows = board.rows + offset;
    if (newRows < 1) return;
    board.setRows(newRows);
    draw(board);
}

function changeCols(offset) {
    let newCols = board.cols + offset;
    if (newCols < 1) return;
    board.setCols(newCols);
    draw(board);
}

loadFromTextarea();