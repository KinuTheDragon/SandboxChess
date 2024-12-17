const LIGHT_PIECE_COLOR = "#ffffff";
const DARK_PIECE_COLOR = "#000000";

class Piece {
    #isWhite;
    #position;
    #hasMoved;

    static pieceName = "Piece";
    static pieceDescription = "Piece base class";

    static pieceTypes = [];

    constructor(isWhite, position) {
        if (this.constructor === Piece)
            throw new Error("Cannot instantiate abstract class Piece");
        this.#isWhite = isWhite;
        this.#position = position.map(x => x);
        this.#hasMoved = false;
    }

    get isWhite() {
        return this.#isWhite;
    }

    get position() {
        return this.#position.map(x => x);
    }

    get hasMoved() {
        return this.#hasMoved;
    }

    get row() {
        return this.#position[0];
    }

    get col() {
        return this.#position[1];
    }

    descriptionText(hasCoords = true) {
        return (this.isWhite ? "White" : "Black") + " " + this.constructor.pieceName +
               (hasCoords ? (" @ " + coordsToName(this.position, board.rows)) : "") +
               " (" + this.toString(hasCoords) + ")" +
               ":\n" + this.constructor.pieceDescription;
    }

    moveTo(position) {
        this.#position = position.map(x => x);
        this.#hasMoved = true;
    }

    canMoveTo(board, position) {
        let destinationPiece = board.pieceAt(position);
        if (destinationPiece && destinationPiece.isWhite === this.isWhite) return false;
        return this.pieceCanMoveTo(board, position);
    }

    canSlideTo(board, position, direction) {
        let [row, col] = position;
        let current = this.#position.map(x => x);
        while (board.isInBounds(current)) {
            let piece = board.pieceAt(current);
            let isMe = piece && piece.row === this.row && piece.col === this.col;
            if (piece && !isMe && piece.isWhite === this.isWhite) return false;
            if (current[0] === row && current[1] === col) return true;
            if (piece && !isMe) return false;
            current[0] += direction[0];
            current[1] += direction[1];
        }
        return false;
    }

    pieceCanMoveTo(board, position) {
        throw new Error("Abstract method cannot be called");
    }

    draw(board) {
        ctx.save();
        ctx.fillStyle = this.#isWhite ? LIGHT_PIECE_COLOR : DARK_PIECE_COLOR;
        ctx.strokeStyle = this.#isWhite ? DARK_PIECE_COLOR : LIGHT_PIECE_COLOR;
        ctx.lineWidth = LINE_WIDTH;
        drawToSquare(board.size, this.#position, () => this.pieceDraw());
        ctx.restore();
    }

    pieceDraw() {
        throw new Error("Abstract method cannot be called");
    }

    copy() {
        return this.copyType(this.constructor);
    }

    copyType(type) {
        let output = new type(this.isWhite, this.position);
        if (this.#hasMoved) output.moveTo(output.position);
        return output;
    }

    static _registerPieceType(pieceType) {
        this.pieceTypes.push(pieceType);
    }

    static get pawnPromotionPieceTypes() {
        return this.pieceTypes.filter(x => x !== Pawn && x !== King && x !== Superpawn);
    }

    static fromSymbol(symbol) {
        return this.pieceTypes.find(x => x.symbol === symbol.toUpperCase());
    }

    static fromString(string, board) {
        const r = /^([a-z]+\d+)(.*?)(\^?)$/;
        if (!r.test(string)) throw new Error("Invalid piece: " + string);
        let [_, square, symbol, hasMoved] = string.match(r);
        let isWhite;
        if (symbol.toUpperCase() === symbol) isWhite = true;
        else if (symbol.toLowerCase() === symbol) isWhite = false;
        else throw new Error("Invalid piece color: " + string);
        let pieceType = Piece.fromSymbol(symbol);
        if (!pieceType) throw new Error("Invalid piece symbol: " + symbol);
        let position = nameToCoords(square, board);
        if (!position) throw new Error("Invalid square: " + square);
        let piece = new pieceType(isWhite, position);
        if (hasMoved) piece.moveTo(piece.position);
        return piece;
    }

    toString(hasCoords = true) {
        return (
            hasCoords ? coordsToName(this.position, board.rows) : "" +
            (this.isWhite ? this.constructor.symbol.toUpperCase() : this.constructor.symbol.toLowerCase()) +
            (this.#hasMoved ? "^" : "")
        );
    }
}