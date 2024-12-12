const LIGHT_SQUARE_COLOR = "#ffcc88";
const DARK_SQUARE_COLOR = "#aa8855";
const HOVERED_PIECE_SQUARE_COLOR = "#00ff0044";
const HOVERED_MOVE_SQUARE_COLOR = "#00880044";
const SELECTED_PIECE_SQUARE_COLOR = "#00ffff88";
const SELECTED_MOVE_SQUARE_COLOR = "#00888888";
const PREVIOUS_MOVE_START_COLOR = "#ff000044";
const PREVIOUS_MOVE_END_COLOR = "#88000044";
const UNMOVED_SQUARE_COLOR = "#0000ff44";

class Board {
    #size;
    #pieces;
    #lastMovedPiece;
    #lastMovedStartPosition;
    #isPawnPromotion;

    constructor(size) {
        this.#size = size.map(x => x);
        this.#pieces = [];
        this.#lastMovedPiece = null;
        this.#lastMovedStartPosition = null;
        this.#isPawnPromotion = false;
    }

    get size() {
        return this.#size.map(x => x);
    }

    get rows() {
        return this.#size[0];
    }

    get cols() {
        return this.#size[1];
    }

    get lastMovedPiece() {
        return this.#lastMovedPiece;
    }

    get lastMovedStartPosition() {
        return this.#lastMovedStartPosition?.map(x => x);
    }

    get isPawnPromotion() {
        return this.#isPawnPromotion;
    }

    get hoveredPiece() {
        return this.pieceAt(getSquarePosition(this.size, mousePosition));
    }

    get hoveringWhiteSword() {
        return this._hoveringSword(true);
    }

    get hoveringBlackSword() {
        return this._hoveringSword(false);
    }

    get hoveringLeftArrow() {
        return this._hoveringArrow(-1);
    }

    get hoveringRightArrow() {
        return this._hoveringArrow(1);
    }

    get hoveringConfirmButton() {
        let squareSize = getSquareSize(this.size);
        let [mouseX, mouseY] = mousePosition;
        let centerX = squareSize * this.cols + UI_BAR_WIDTH * UPSCALE / 2;
        let centerY = squareSize * this.rows - UI_SQUARE_SIZE * 0.5;
        return Math.sqrt((centerX - mouseX) ** 2 + (centerY - mouseY) ** 2) <= UI_SQUARE_SIZE / 4;
    }

    get hoveringMovedButton() {
        let squareSize = getSquareSize(this.size);
        let [mouseX, mouseY] = mousePosition;
        let centerX = squareSize * (this.cols + 1) + UI_BAR_WIDTH * UPSCALE / 2;
        let centerY = squareSize * this.rows - UI_SQUARE_SIZE * 0.5;
        return Math.abs(centerX - mouseX) + Math.abs(centerY - mouseY) <= UI_SQUARE_SIZE / 4;
    }

    get hoveringPromotionPiece() {
        let squareSize = getSquareSize(this.size);
        let [mouseX, mouseY] = mousePosition;
        let dx = Math.abs(mouseX - (squareSize * this.cols + UI_BAR_WIDTH * UPSCALE / 2));
        let dy = Math.abs(mouseY - squareSize * this.rows + UI_SQUARE_SIZE * 1.5);
        return dx <= squareSize / 2 && dy <= UI_SQUARE_SIZE / 2;
    }

    _hoveringSword(isWhite) {
        let squareSize = getSquareSize(this.size);
        let [mouseX, mouseY] = mousePosition;
        let leftX = squareSize * this.cols + (isWhite ? 0 : UI_SQUARE_SIZE);
        let rightX = leftX + UI_SQUARE_SIZE;
        let topY = 0;
        let bottomY = UI_SQUARE_SIZE;
        return leftX <= mouseX && mouseX <= rightX && topY <= mouseY && mouseY <= bottomY;
    }

    _hoveringArrow(direction) {
        let squareSize = getSquareSize(this.size);
        let [mouseX, mouseY] = mousePosition;
        let boundX1 = squareSize * this.cols + UI_SQUARE_SIZE * direction + UI_BAR_WIDTH * UPSCALE / 2;
        let boundX2 = squareSize * this.cols + UI_SQUARE_SIZE * direction * 0.75 + UI_BAR_WIDTH * UPSCALE / 2;
        let leftX = Math.min(boundX1, boundX2);
        let rightX = Math.max(boundX1, boundX2);
        let topY = squareSize * this.rows - UI_SQUARE_SIZE * 1.75;
        let bottomY = squareSize * this.rows - UI_SQUARE_SIZE * 1.25;
        if (!(leftX <= mouseX && mouseX <= rightX && topY <= mouseY && mouseY <= bottomY)) return false;
        let dx = Math.abs(mouseX - (squareSize * this.cols + UI_BAR_WIDTH * UPSCALE / 2));
        let dy = Math.abs(mouseY - squareSize * this.rows + UI_SQUARE_SIZE * 1.5);
        return dx + dy <= UI_SQUARE_SIZE;
    }

    commitPawnPromotion() {
        let pawnPromoting = this.#lastMovedPiece;
        let i = this.#pieces.indexOf(pawnPromoting);
        this.#pieces[i] = pawnPromoting.copyType(Piece.pawnPromotionPieceTypes[pawnPromotionSelection]);
        this.#isPawnPromotion = false;
        isWhiteTurn = !isWhiteTurn;
    }

    setRows(rows) {
        this.#size[0] = rows;
        for (let piece of this.#pieces.map(x => x)) {
            if (!this.isInBounds(piece.position)) this.removePiece(piece);
        }
    }

    setCols(cols) {
        this.#size[1] = cols;
        for (let piece of this.#pieces.map(x => x)) {
            if (!this.isInBounds(piece.position)) this.removePiece(piece);
        }
    }

    pieceAt(position) {
        let [row, col] = position;
        return this.#pieces.find(piece => piece.row === row && piece.col === col);
    }

    findPiece(predicate) {
        return this.#pieces.find(predicate);
    }

    addPiece(piece) {
        this.#pieces.push(piece);
    }

    isInBounds(position) {
        let [row, col] = position;
        return 0 <= row && row < this.#size[0] && 0 <= col && col < this.#size[1];
    }

    canMakeMove(startPosition, endPosition) {
        let piece = this.pieceAt(startPosition);
        if (!piece) return false;
        if (!this.isInBounds(endPosition)) return false;
        if (!piece.canMoveTo(this, endPosition)) return false;
        let resultingBoard = this.copy();
        resultingBoard.movePiece(startPosition, endPosition, true);
        if (resultingBoard.isInCheck(piece.isWhite)) return false;
        return true;
    }

    movePiece(startPosition, endPosition, force = false) {
        if (!force && !this.canMakeMove(startPosition, endPosition)) return;
        let startPiece = this.pieceAt(startPosition);
        let endPiece = this.pieceAt(endPosition);
        if (!endPiece && startPiece instanceof Pawn && endPosition[1] !== startPosition[1]) {
            // En passant
            let enPassantCapturedPiece = this.pieceAt([startPosition[0], endPosition[1]]);
            this.removePiece(enPassantCapturedPiece);
        } else if (startPiece instanceof King && endPiece instanceof Rook && startPiece.isWhite === endPiece.isWhite) {
            // Castling (one or two squares)
            startPiece.moveTo(endPosition);
            if (startPosition[1] > endPosition[1]) // King moved left
                endPiece.moveTo([endPosition[0], endPosition[1] + 1]);
            else // King moved right
                endPiece.moveTo([endPosition[0], endPosition[1] - 1]);
        } else if (startPiece instanceof King && Math.abs(startPosition[1] - endPosition[1]) === 2) {
            // Castling (three or more squares)
            let nearestRook = null;
            let direction = Math.sign(endPosition[1] - startPosition[1]);
            for (let col = startPiece.col + direction; this.isInBounds([startPiece.row, col]); col += direction) {
                let piece = this.pieceAt([startPiece.row, col]);
                if (piece) {
                    nearestRook = piece;
                    break;
                }
            }
            startPiece.moveTo(endPosition);
            nearestRook.moveTo([endPosition[0], endPosition[1] - direction]);
        } else if (endPiece) {
            this.removePiece(endPiece);
        }
        startPiece.moveTo(endPosition);
        if (startPiece instanceof Pawn && startPiece.row === (startPiece.isWhite ? 0 : 7)) {
            // Do pawn promotion
            this.#isPawnPromotion = true;
            pawnPromotionSelection = 0;
        }
        this.#lastMovedPiece = startPiece;
        this.#lastMovedStartPosition = startPosition.map(x => x);
    }

    removePiece(piece) {
        this.#pieces.splice(this.#pieces.indexOf(piece), 1);
    }

    playerCanMoveTo(square, isWhite, includeKing = true) {
        return this.#pieces.filter(x => x.isWhite === isWhite && (includeKing || !(x instanceof King)))
                           .some(x => this.canMakeMove(x.position, square));
    }

    isInCheck(isWhite) {
        let myKing = this.#pieces.find(x => x.isWhite === isWhite && x instanceof King);
        if (!myKing) return true;
        let theirPieces = this.#pieces.filter(x => x.isWhite === !isWhite);
        return theirPieces.some(x => {
            if (x instanceof King) return x.canMoveTo(this, myKing.position, false);
            return x.canMoveTo(this, myKing.position);
        });
    }

    canMoveAnyPiece(isWhite) {
        let myPieces = this.#pieces.filter(x => x.isWhite === isWhite);
        for (let piece of myPieces) {
            for (let row = 0; row < this.rows; row++) {
                for (let col = 0; col < this.cols; col++) {
                    if (this.canMakeMove(piece.position, [row, col])) return true;
                }
            }
        }
        return false;
    }

    isInCheckmate(isWhite) {
        return this.isInCheck(isWhite) && !this.canMoveAnyPiece(isWhite);
    }

    isInStalemate(isWhite) {
        return !this.isInCheck(isWhite) && !this.canMoveAnyPiece(isWhite);
    }

    draw() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                let squarePosition = [row, col];
                let piece = this.pieceAt(squarePosition);
                drawToSquare(this.#size, squarePosition, () => {
                    ctx.fillStyle = this.isLightSquare(squarePosition) ? LIGHT_SQUARE_COLOR : DARK_SQUARE_COLOR;
                    ctx.fillRect(0, 0, 1, 1);
                    if (this.hoveredPiece) {
                        if (piece === this.hoveredPiece) {
                            ctx.fillStyle = HOVERED_PIECE_SQUARE_COLOR;
                            ctx.fillRect(0, 0, 1, 1);
                        }
                        if (this.canMakeMove(this.hoveredPiece.position, squarePosition)) {
                            ctx.fillStyle = HOVERED_MOVE_SQUARE_COLOR;
                            ctx.fillRect(0, 0, 1, 1);
                        }
                    } else if ((this.hoveringWhiteSword && this.playerCanMoveTo(squarePosition, true)) ||
                               (this.hoveringBlackSword && this.playerCanMoveTo(squarePosition, false))) {
                        ctx.fillStyle = HOVERED_MOVE_SQUARE_COLOR;
                        ctx.fillRect(0, 0, 1, 1);
                    }
                    if (piece && !piece.hasMoved) {
                        ctx.fillStyle = UNMOVED_SQUARE_COLOR;
                        ctx.fillRect(0, 0, 1, 1);
                    }
                    if (selectedPiece && piece === selectedPiece) {
                        ctx.fillStyle = SELECTED_PIECE_SQUARE_COLOR;
                        ctx.beginPath();
                        ctx.moveTo(0.5, 0);
                        ctx.lineTo(0, 0.5);
                        ctx.lineTo(0.5, 1);
                        ctx.lineTo(1, 0.5);
                        ctx.closePath();
                        ctx.fill();
                    }
                    if (selectedPiece && this.canMakeMove(selectedPiece.position, squarePosition)) {
                        ctx.fillStyle = SELECTED_MOVE_SQUARE_COLOR;
                        ctx.beginPath();
                        ctx.moveTo(0.5, 0);
                        ctx.lineTo(0, 0.5);
                        ctx.lineTo(0.5, 1);
                        ctx.lineTo(1, 0.5);
                        ctx.closePath();
                        ctx.fill();
                    }
                    if (this.#lastMovedPiece &&
                        this.#lastMovedStartPosition[0] === squarePosition[0] &&
                        this.#lastMovedStartPosition[1] === squarePosition[1]) {
                        ctx.fillStyle = PREVIOUS_MOVE_START_COLOR;
                        ctx.beginPath();
                        ctx.moveTo(1, 0.5);
                        ctx.ellipse(0.5, 0.5, 0.5, 0.5, 0, 0, 2 * Math.PI);
                        ctx.fill();
                    }
                    if (this.#lastMovedPiece &&
                        this.#lastMovedPiece.row === squarePosition[0] &&
                        this.#lastMovedPiece.col === squarePosition[1]) {
                        ctx.fillStyle = PREVIOUS_MOVE_END_COLOR;
                        ctx.beginPath();
                        ctx.moveTo(1, 0.5);
                        ctx.ellipse(0.5, 0.5, 0.5, 0.5, 0, 0, 2 * Math.PI);
                        ctx.fill();
                    }
                });
                if (piece) piece.draw(this);
            }
        }
    }

    isLightSquare(position) {
        return isLightSquare(this.#size, position);
    }

    copy() {
        let copy = new this.constructor(this.size);
        for (let piece of this.#pieces) copy.addPiece(piece.copy());
        return copy;
    }

    static fromString(string) {
        let parts = string.split(/\s+/g).filter(x => x);
        let rows = +parts[0];
        if (isNaN(rows) || rows <= 0 || Math.floor(rows) !== rows) throw new Error("Invalid rows: " + parts[0]);
        let cols = +parts[1];
        if (isNaN(cols) || cols <= 0 || Math.floor(cols) !== cols) throw new Error("Invalid cols: " + parts[1]);
        let board = new this([rows, cols]);
        for (let piece of parts.slice(2)) {
            board.addPiece(Piece.fromString(piece, board));
        }
        let kings = board.#pieces.filter(x => x.constructor === King);
        if (kings.length !== 2) throw new Error("Must have exactly 2 kings");
        if (!kings.find(x => x.isWhite)) throw new Error("Missing white king");
        if (!kings.find(x => !x.isWhite)) throw new Error("Missing black king");
        return board;
    }

    toString() {
        return `${this.rows} ${this.cols}\n${this.#pieces.map(x => x.toString()).join(" ")}`;
    }
}