let mousePosition = [-1, -1];

document.addEventListener("mousemove", e => {
    let rect = canvas.getBoundingClientRect();
    mousePosition = [e.clientX - rect.left, e.clientY - rect.top].map(x => x * UPSCALE);
    draw(board);
});

canvas.addEventListener("mousedown", e => {
    let rect = canvas.getBoundingClientRect();
    mousePosition = [e.clientX - rect.left, e.clientY - rect.top].map(x => x * UPSCALE);
    handleClick(board);
    draw(board);
});

function handleClick(board) {
    let clickPosition = getSquarePosition(board.size, mousePosition);
    if (isBoardEditMode) {
        let maxPieceSelection = Piece.pieceTypes.length;
        if (board.hoveringLeftArrow)
            boardEditPieceSelection = (boardEditPieceSelection - 1 + maxPieceSelection) % maxPieceSelection;
        if (board.hoveringRightArrow)
            boardEditPieceSelection = (boardEditPieceSelection + 1) % maxPieceSelection;
        if (board.hoveringConfirmButton)
            boardEditPieceIsWhite = !boardEditPieceIsWhite;
        if (board.hoveringMovedButton)
            boardEditPieceHasMoved = !boardEditPieceHasMoved;
        if (!board.isInBounds(clickPosition)) return;
        let clickedPiece = board.pieceAt(clickPosition);
        if (clickedPiece) {
            board.removePiece(clickedPiece);
        } else {
            let pieceType = Piece.pieceTypes[boardEditPieceSelection];
            let piece = new pieceType(boardEditPieceIsWhite, clickPosition);
            if (boardEditPieceHasMoved) piece.moveTo(piece.position);
            board.addPiece(piece);
        }
    } else if (board.isPawnPromotion) {
        let maxPawnPromotionSelection = Piece.pawnPromotionPieceTypes.length;
        if (board.hoveringLeftArrow)
            pawnPromotionSelection = (pawnPromotionSelection - 1 + maxPawnPromotionSelection) % maxPawnPromotionSelection;
        if (board.hoveringRightArrow)
            pawnPromotionSelection = (pawnPromotionSelection + 1) % maxPawnPromotionSelection;
        if (board.hoveringConfirmButton)
            board.commitPawnPromotion();
    } else {
        if (!board.isInBounds(clickPosition)) return;
        let clickedPiece = board.pieceAt(clickPosition);
        if (selectedPiece) {
            if (clickedPiece === selectedPiece) selectedPiece = null;
            else if (board.canMakeMove(selectedPiece.position, clickPosition)) {
                board.movePiece(selectedPiece.position, clickPosition);
                if (!board.isPawnPromotion)
                    isWhiteTurn = !isWhiteTurn;
                selectedPiece = null;
            } else if (clickedPiece && clickedPiece.isWhite === isWhiteTurn)
                selectedPiece = clickedPiece;
        } else {
            if (clickedPiece && clickedPiece.isWhite === isWhiteTurn)
                selectedPiece = clickedPiece;
        }
    }
}