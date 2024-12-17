class _Sword extends Piece {
    // Sword icon for UI bar. Do not use.
    pieceDraw() {
        ctx.beginPath();
        ctx.moveTo(0.9, 0.3);
        ctx.lineTo(0.9, 0.1);
        ctx.lineTo(0.7, 0.1);
        ctx.lineTo(0.2, 0.6);
        ctx.lineTo(0.4, 0.8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0.8, 0.2);
        ctx.lineTo(0.35, 0.65);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0.2, 0.9);
        ctx.lineTo(0.1, 0.8);
        ctx.lineTo(0.2, 0.7);
        ctx.lineTo(0.1, 0.6);
        ctx.lineTo(0.2, 0.5);
        ctx.lineTo(0.5, 0.8);
        ctx.lineTo(0.4, 0.9);
        ctx.lineTo(0.3, 0.8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
}

class _MovementComboPiece extends Piece {
    pieceCanMoveTo(board, position) {
        let subPieces = this.constructor.constituents.map(x => this.copyType(x));
        return subPieces.some(x => x.pieceCanMoveTo(board, position));
    }
}

class _RiderPiece extends Piece {
    pieceCanMoveTo(board, position) {
        let directions = this.constructor.directions.flatMap(([r, c]) => [
            [r, c], [c, r],
            [-r, c], [c, -r],
            [r, -c], [-c, r],
            [-r, -c], [-c, -r]
        ]);
        return directions.some(direction => this.canSlideTo(board, position, direction));
    }
}

class Pawn extends Piece {
    static {super._registerPieceType(this);}
    static pieceName = "Pawn";
    static pieceDescription = "Moves forward and captures diagonally. Can move forward two spaces on its first move.";
    static symbol = "P";

    pieceCanMoveTo(board, position) {
        let rowOffset = this.isWhite ? -1 : 1;
        let destinationPiece = board.pieceAt(position);
        if (destinationPiece && this.row + rowOffset === position[0] && Math.abs(this.col - position[1]) === 1)
            return true;
        if (!destinationPiece && this.row + rowOffset === position[0] && this.col === position[1])
            return true;
        if (!destinationPiece && !this.hasMoved && this.row + rowOffset * 2 === position[0] && this.col === position[1] &&
            !board.pieceAt([this.row + rowOffset, this.col]))
            return true;
        if (!destinationPiece && this.row + rowOffset === position[0] && Math.abs(this.col - position[1]) === 1) {
            // Do en passant check
            let lastMoved = board.lastMovedPiece;
            let lastStart = board.lastMovedStartPosition;
            if (lastMoved && lastMoved instanceof Pawn &&
                lastMoved.row === this.row && lastMoved.col === position[1] &&
                lastStart[0] === this.row + 2 * rowOffset && lastStart[1] === lastMoved.col)
                return true;
        }
        return false;
    }

    pieceDraw() {
        ctx.beginPath();
        ctx.moveTo(0.5, 0.25);
        ctx.lineTo(0.35, 0.7);
        ctx.lineTo(0.2, 0.7);
        ctx.lineTo(0.2, 0.9);
        ctx.lineTo(0.8, 0.9);
        ctx.lineTo(0.8, 0.7);
        ctx.lineTo(0.65, 0.7);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(0.5, 0.25, 0.15, 0.15, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    }
}

class Knight extends Piece {
    static {super._registerPieceType(this);}
    static pieceName = "Knight";
    static pieceDescription = "Jumps two spaces on one axis and one space on the perpendicular axis.";
    static symbol = "N";

    pieceCanMoveTo(board, position) {
        return (this.row - position[0]) ** 2 + (this.col - position[1]) ** 2 === 5;
    }

    pieceDraw() {
        ctx.beginPath();
        ctx.moveTo(0.4, 0.8);
        ctx.lineTo(0.7, 0.8);
        ctx.lineTo(0.7, 0.4);
        ctx.arc(0.4, 0.4, 0.3, 0, -Math.PI / 2, true);
        ctx.lineTo(0.3, 0.1);
        ctx.lineTo(0.2, 0.4);
        ctx.lineTo(0.4, 0.4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0.2, 0.7);
        ctx.lineTo(0.2, 0.9);
        ctx.lineTo(0.8, 0.9);
        ctx.lineTo(0.8, 0.7);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
}

class Rook extends _RiderPiece {
    static {super._registerPieceType(this);}
    static pieceName = "Rook";
    static pieceDescription = "Can move any number of spaces cardinally.";
    static symbol = "R";
    static directions = [[1, 0]];

    pieceDraw() {
        const CRENELS = 5;
        const d = (0.9 - 0.1) / CRENELS;
        ctx.beginPath();
        ctx.moveTo(0.1, 0.1);
        for (let i = 1; i < CRENELS; i++) {
            ctx.lineTo(0.1 + i * d, 0.1 + (i % 2 ? 0 : d));
            ctx.lineTo(0.1 + i * d, 0.1 + (i % 2 ? d : 0));
        }
        ctx.lineTo(0.9, 0.1);
        ctx.lineTo(0.9, 0.1 + 2.5 * d);
        ctx.lineTo(0.9 - d, 0.1 + 2.5 * d);
        ctx.lineTo(0.9 - d, 0.8);
        ctx.lineTo(0.1 + d, 0.8);
        ctx.lineTo(0.1 + d, 0.1 + 2.5 * d);
        ctx.lineTo(0.1, 0.1 + 2.5 * d);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0.1, 0.7);
        ctx.lineTo(0.1, 0.9);
        ctx.lineTo(0.9, 0.9);
        ctx.lineTo(0.9, 0.7);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
}

class Bishop extends _RiderPiece {
    static {super._registerPieceType(this);}
    static pieceName = "Bishop";
    static pieceDescription = "Can move any number of spaces diagonally.";
    static symbol = "B";
    static directions = [[1, 1]];

    pieceDraw() {
        const d = 0.15 * Math.sqrt(2) / 2;
        ctx.beginPath();
        ctx.moveTo(0.2, 0.7);
        ctx.lineTo(0.2, 0.9);
        ctx.lineTo(0.8, 0.9);
        ctx.lineTo(0.8, 0.7);
        ctx.lineTo(0.6, 0.7);
        ctx.lineTo(0.6, 0.4);
        ctx.lineTo(0.4, 0.4);
        ctx.lineTo(0.4, 0.7);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0.5, 0.3 - 2 * d);
        ctx.lineTo(0.5 + d, 0.3 - d);
        ctx.arc(0.5, 0.3, 0.15, -Math.PI / 4, -3 * Math.PI / 4, false);
        ctx.lineTo(0.5, 0.3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
}

class King extends Piece {
    static {super._registerPieceType(this);}
    static pieceName = "King";
    static pieceDescription = "Moves one space in any direction. You lose when this piece is put in checkmate.";
    static symbol = "K";

    canMoveTo(board, position, considerCastling = true) {
        return this.pieceCanMoveTo(board, position, considerCastling);
    }

    pieceCanMoveTo(board, position, considerCastling = true) {
        let otherKing = board.findPiece(x => x instanceof King && x.isWhite !== this.isWhite);
        if (otherKing && Math.abs(otherKing.row - position[0]) <= 1 && Math.abs(otherKing.col - position[1]) <= 1)
            return false;
        if (considerCastling && !this.hasMoved && !board.isInCheck(this.isWhite)) {
            // Castling check
            let nearestLeftRook = null;
            for (let col = this.col - 1; col >= 0; col--) {
                if (col >= this.col - 2 && board.playerCanMoveTo([this.row, col], !this.isWhite, false)) break;
                let piece = board.pieceAt([this.row, col]);
                if (piece) {
                    if (piece instanceof Rook && !piece.hasMoved) nearestLeftRook = piece;
                    break;
                }
            }
            let nearestRightRook = null;
            for (let col = this.col + 1; col < board.cols; col++) {
                if (col <= this.col + 2 && board.playerCanMoveTo([this.row, col], !this.isWhite, false)) break;
                let piece = board.pieceAt([this.row, col]);
                if (piece) {
                    if (piece instanceof Rook && !piece.hasMoved) nearestRightRook = piece;
                    break;
                }
            }
            if (nearestLeftRook) {
                if (nearestLeftRook.col === this.col - 1 && position[0] === this.row && position[1] === this.col - 1)
                    return true;
                if (nearestLeftRook.col !== this.col - 1 && position[0] === this.row && position[1] === this.col - 2)
                    return true;
            }
            if (nearestRightRook) {
                if (nearestRightRook.col === this.col + 1 && position[0] === this.row && position[1] === this.col + 1)
                    return true;
                if (nearestRightRook.col !== this.col + 1 && position[0] === this.row && position[1] === this.col + 2)
                    return true;
            }
        }
        let destinationPiece = board.pieceAt(position);
        if (destinationPiece && destinationPiece.isWhite === this.isWhite) return false;
        return Math.abs(this.row - position[0]) <= 1 && Math.abs(this.col - position[1]) <= 1;
    }

    pieceDraw() {
        const d = 0.075;
        ctx.beginPath();
        ctx.moveTo(0.5 - 0.5 * d, 0.1);
        ctx.lineTo(0.5 + 0.5 * d, 0.1);
        ctx.lineTo(0.5 + 0.5 * d, 0.1 + d);
        ctx.lineTo(0.5 + 1.5 * d, 0.1 + d);
        ctx.lineTo(0.5 + 1.5 * d, 0.1 + 2 * d);
        ctx.lineTo(0.5 + 0.5 * d, 0.1 + 2 * d);
        ctx.lineTo(0.5 + 0.5 * d, 0.1 + 3 * d);
        ctx.lineTo(0.5 - 0.5 * d, 0.1 + 3 * d);
        ctx.lineTo(0.5 - 0.5 * d, 0.1 + 2 * d);
        ctx.lineTo(0.5 - 1.5 * d, 0.1 + 2 * d);
        ctx.lineTo(0.5 - 1.5 * d, 0.1 + d);
        ctx.lineTo(0.5 - 0.5 * d, 0.1 + d);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0.35, 0.8);
        ctx.lineTo(0.65, 0.8);
        ctx.lineTo(0.65, 0.25 + 3 * d);
        ctx.lineTo(0.8, 0.1 + 3 * d);
        ctx.lineTo(0.2, 0.1 + 3 * d);
        ctx.lineTo(0.35, 0.25 + 3 * d);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0.2, 0.7);
        ctx.lineTo(0.2, 0.9);
        ctx.lineTo(0.8, 0.9);
        ctx.lineTo(0.8, 0.7);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
}

class Queen extends _MovementComboPiece {
    static {super._registerPieceType(this);}
    static pieceName = "Queen";
    static pieceDescription = "Can move any number of spaces cardinally or diagonally.";
    static symbol = "Q";
    static constituents = [Rook, Bishop];

    pieceDraw() {
        const POINTS = 5;
        const d = (0.8 - 0.2) / (POINTS - 1);
        ctx.beginPath();
        ctx.moveTo(0.3, 0.3);
        ctx.lineTo(0.3, 0.8);
        ctx.lineTo(0.7, 0.8);
        ctx.lineTo(0.7, 0.3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0.2, 0.1);
        for (let i = 1; i < POINTS; i++)
            ctx.lineTo(0.2 + i * d, i % 2 ? 0.25 : 0.1);
        ctx.lineTo(0.8, 0.4);
        ctx.lineTo(0.2, 0.4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0.2, 0.7);
        ctx.lineTo(0.2, 0.9);
        ctx.lineTo(0.8, 0.9);
        ctx.lineTo(0.8, 0.7);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
}

class Amazon extends _MovementComboPiece {
    static {super._registerPieceType(this);}
    static pieceName = "Amazon";
    static pieceDescription = "Can move any number of spaces cardinally or diagonally " +
                              "OR jump two spaces on one axis and one space on the perpendicular axis.";
    static symbol = "QN";
    static constituents = [Queen, Knight];

    pieceDraw() {
        const POINTS = 5;
        const d = (0.8 - 0.2) / (POINTS - 1);
        ctx.beginPath();
        ctx.moveTo(0.4, 0.8);
        ctx.lineTo(0.7, 0.8);
        ctx.lineTo(0.7, 0.45);
        ctx.arc(0.4, 0.45, 0.3, 0, -Math.PI / 2, true);
        ctx.lineTo(0.3, 0.15);
        ctx.lineTo(0.2, 0.45);
        ctx.lineTo(0.4, 0.45);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0.2, 0.7);
        ctx.lineTo(0.2, 0.9);
        ctx.lineTo(0.8, 0.9);
        ctx.lineTo(0.8, 0.7);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0.3, 0.05);
        for (let i = 1; i < POINTS; i++)
            ctx.lineTo(0.3 + i * (d / 2), i % 2 ? 0.125 : 0.05);
        ctx.lineTo(0.6, 0.2);
        ctx.lineTo(0.3, 0.2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
}

class Empress extends _MovementComboPiece {
    static {super._registerPieceType(this);}
    static pieceName = "Empress";
    static pieceDescription = "Can move any number of spaces cardinally " +
                              "OR jump two spaces on one axis and one space on the perpendicular axis.";
    static symbol = "RN";
    static constituents = [Rook, Knight];

    pieceDraw() {
        const CRENELS = 5;
        const d = (0.8 - 0.2) / CRENELS;
        ctx.beginPath();
        ctx.moveTo(0.4, 0.7);
        ctx.lineTo(0.7, 0.7);
        ctx.lineTo(0.7, 0.4);
        ctx.arc(0.4, 0.4, 0.3, 0, -Math.PI / 2, true);
        ctx.lineTo(0.3, 0.1);
        ctx.lineTo(0.2, 0.4);
        ctx.lineTo(0.4, 0.4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0.2, 0.9);
        for (let i = 1; i < CRENELS; i++) {
            ctx.lineTo(0.2 + i * d, 0.9 - (i % 2 ? 0 : d));
            ctx.lineTo(0.2 + i * d, 0.9 - (i % 2 ? d : 0));
        }
        ctx.lineTo(0.8, 0.9);
        ctx.lineTo(0.8, 0.9 - 2 * d);
        ctx.lineTo(0.2, 0.9 - 2 * d);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
}

class Princess extends _MovementComboPiece {
    static {super._registerPieceType(this);}
    static pieceName = "Princess";
    static pieceDescription = "Can move any number of spaces diagonally " +
                              "OR jump two spaces on one axis and one space on the perpendicular axis.";
    static symbol = "BN";
    static constituents = [Bishop, Knight];

    pieceDraw() {
        ctx.beginPath();
        ctx.moveTo(0.4, 0.8);
        ctx.lineTo(0.7, 0.8);
        ctx.lineTo(0.7, 0.4);
        ctx.arc(0.4, 0.4, 0.3, 0, -Math.PI / 2, true);
        ctx.lineTo(0.3, 0.1);
        ctx.lineTo(0.2, 0.4);
        ctx.lineTo(0.4, 0.4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0.5, 0.7);
        ctx.lineTo(0.8, 0.8);
        ctx.lineTo(0.8, 0.9);
        ctx.lineTo(0.5, 0.8);
        ctx.lineTo(0.2, 0.9);
        ctx.lineTo(0.2, 0.8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
}

class Nightrider extends _RiderPiece {
    static {super._registerPieceType(this);}
    static pieceName = "Nightrider";
    static pieceDescription = "Jumps two spaces on one axis and one space on the perpendicular axis, " +
                              "repeating as many times in a single direction as you want.";
    static symbol = "NN";
    static directions = [[2, 1]];

    pieceDraw() {
        ctx.beginPath();
        ctx.moveTo(0.6, 0.2);
        ctx.lineTo(0.3, 0.2);
        ctx.lineTo(0.3, 0.2);
        ctx.arc(0.6, 0.6, 0.3, Math.PI, Math.PI / 2, true);
        ctx.lineTo(0.7, 0.9);
        ctx.lineTo(0.8, 0.6);
        ctx.lineTo(0.6, 0.6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0.8, 0.3);
        ctx.lineTo(0.8, 0.1);
        ctx.lineTo(0.2, 0.1);
        ctx.lineTo(0.2, 0.3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
}

class _HandicappedRook extends Piece {
    pieceCanMoveTo(board, position) {
        return (this.row === position[0] && Math.abs(this.col - position[1]) === this.constructor.distance) ||
               (this.col === position[1] && Math.abs(this.row - position[0]) === this.constructor.distance);
    }

    pieceDraw() {
        const CRENELS = 5;
        const d = (0.9 - 0.1) / CRENELS;
        ctx.beginPath();
        ctx.moveTo(0.1, 0.1);
        for (let i = 1; i < CRENELS; i++) {
            ctx.lineTo(0.1 + i * d, 0.1 + (i % 2 ? 0 : d));
            ctx.lineTo(0.1 + i * d, 0.1 + (i % 2 ? d : 0));
        }
        ctx.lineTo(0.9, 0.1);
        ctx.lineTo(0.9, 0.1 + 2.5 * d);
        ctx.lineTo(0.9 - d, 0.1 + 2.5 * d);
        ctx.lineTo(0.9 - d, 0.8);
        ctx.lineTo(0.1 + d, 0.8);
        ctx.lineTo(0.1 + d, 0.1 + 2.5 * d);
        ctx.lineTo(0.1, 0.1 + 2.5 * d);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0.1, 0.7);
        ctx.lineTo(0.1, 0.9);
        ctx.lineTo(0.9, 0.9);
        ctx.lineTo(0.9, 0.7);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        let distance = this.constructor.distance;
        for (let i = 0; i < distance; i++) {
            let x = 0.5 - 0.05 * distance + 0.1 * (i + 0.5);
            ctx.beginPath();
            ctx.moveTo(x, 0.4);
            ctx.lineTo(x, 0.6);
            ctx.stroke();
        }
    }
}

class Wazir extends _HandicappedRook {
    static {super._registerPieceType(this);}
    static pieceName = "Wazir";
    static pieceDescription = "Moves one space cardinally.";
    static symbol = "W";
    static distance = 1;
}

class Dabbaba extends _HandicappedRook {
    static {super._registerPieceType(this);}
    static pieceName = "Dabbaba";
    static pieceDescription = "Jumps two spaces cardinally.";
    static symbol = "D";
    static distance = 2;
}

class Threeleaper extends _HandicappedRook {
    static {super._registerPieceType(this);}
    static pieceName = "Threeleaper";
    static pieceDescription = "Jumps three spaces cardinally.";
    static symbol = "H";
    static distance = 3;
}

class Fourleaper extends _HandicappedRook {
    static {super._registerPieceType(this);}
    static pieceName = "Fourleaper";
    static pieceDescription = "Jumps four spaces cardinally.";
    static symbol = "R4";
    static distance = 4;
}

class _HandicappedBishop extends Piece {
    pieceCanMoveTo(board, position) {
        return Math.abs(this.row - position[0]) === this.constructor.distance &&
               Math.abs(this.col - position[1]) === this.constructor.distance;
    }

    pieceDraw() {
        const d = 0.15 * Math.sqrt(2) / 2;
        ctx.beginPath();
        ctx.moveTo(0.2, 0.7);
        ctx.lineTo(0.2, 0.9);
        ctx.lineTo(0.8, 0.9);
        ctx.lineTo(0.8, 0.7);
        ctx.lineTo(0.6, 0.7);
        ctx.lineTo(0.6, 0.4);
        ctx.lineTo(0.4, 0.4);
        ctx.lineTo(0.4, 0.7);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0.5, 0.3 - 2 * d);
        ctx.lineTo(0.5 + d, 0.3 - d);
        ctx.arc(0.5, 0.3, 0.15, -Math.PI / 4, -3 * Math.PI / 4, false);
        ctx.lineTo(0.5, 0.3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        let distance = this.constructor.distance;
        for (let i = 0; i < distance; i++) {
            let x = 0.5 - 0.05 * distance + 0.1 * (i + 0.5);
            ctx.beginPath();
            ctx.moveTo(x, 0.7);
            ctx.lineTo(x, 0.9);
            ctx.stroke();
        }
    }
}

class Ferz extends _HandicappedBishop {
    static {super._registerPieceType(this);}
    static pieceName = "Ferz";
    static pieceDescription = "Moves one space diagonally.";
    static symbol = "F";
    static distance = 1;
}

class Alfil extends _HandicappedBishop {
    static {super._registerPieceType(this);}
    static pieceName = "Alfil";
    static pieceDescription = "Jumps two spaces diagonally.";
    static symbol = "A";
    static distance = 2;
}

class Tripper extends _HandicappedBishop {
    static {super._registerPieceType(this);}
    static pieceName = "Tripper";
    static pieceDescription = "Jumps three spaces diagonally.";
    static symbol = "G";
    static distance = 3;
}

class Commuter extends _HandicappedBishop {
    static {super._registerPieceType(this);}
    static pieceName = "Commuter";
    static pieceDescription = "Jumps four spaces diagonally.";
    static symbol = "B4";
    static distance = 4;
}

class _HippogonalLeaper extends Piece {
    pieceCanMoveTo(board, position) {
        let dr = Math.abs(this.row - position[0]);
        let dc = Math.abs(this.col - position[1]);
        return (dr === this.constructor.distance1 && dc === this.constructor.distance2) ||
               (dr === this.constructor.distance2 && dc === this.constructor.distance1);
    }
}

class Camel extends _HippogonalLeaper {
    static {super._registerPieceType(this);}
    static pieceName = "Camel";
    static pieceDescription = "Jumps three spaces on one axis and one space on the perpendicular axis.";
    static symbol = "C";
    static distance1 = 3;
    static distance2 = 1;
    
    pieceDraw() {
        ctx.beginPath();
        ctx.moveTo(0.4, 0.8);
        ctx.lineTo(0.7, 0.8);
        ctx.arc(0.7, 0.5, 0.1, Math.PI / 2, -Math.PI / 2, true);
        ctx.arc(0.4, 0.4, 0.3, 0, -Math.PI / 2, true);
        ctx.lineTo(0.3, 0.1);
        ctx.lineTo(0.2, 0.4);
        ctx.lineTo(0.4, 0.4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0.2, 0.7);
        ctx.lineTo(0.2, 0.9);
        ctx.lineTo(0.8, 0.9);
        ctx.lineTo(0.8, 0.7);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
}

class Zebra extends _HippogonalLeaper {
    static {super._registerPieceType(this);}
    static pieceName = "Zebra";
    static pieceDescription = "Jumps three spaces on one axis and two spaces on the perpendicular axis.";
    static symbol = "Z";
    static distance1 = 3;
    static distance2 = 2;

    pieceDraw() {
        ctx.beginPath();
        ctx.moveTo(0.4, 0.8);
        ctx.lineTo(0.7, 0.8);
        ctx.lineTo(0.7, 0.4);
        ctx.arc(0.4, 0.4, 0.3, 0, -Math.PI / 2, true);
        ctx.lineTo(0.3, 0.1);
        ctx.lineTo(0.2, 0.4);
        ctx.lineTo(0.4, 0.4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0.2, 0.7);
        ctx.lineTo(0.2, 0.9);
        ctx.lineTo(0.8, 0.9);
        ctx.lineTo(0.8, 0.7);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        for (let y of [0.5, 0.6]) {
            ctx.beginPath();
            ctx.moveTo(0.4, y);
            ctx.lineTo(0.7, y);
            ctx.stroke();
        }
    }
}

class Giraffe extends _HippogonalLeaper {
    static {super._registerPieceType(this);}
    static pieceName = "Giraffe";
    static pieceDescription = "Jumps four spaces on one axis and one space on the perpendicular axis.";
    static symbol = "GI";
    static distance1 = 4;
    static distance2 = 1;

    pieceDraw() {
        ctx.beginPath();
        ctx.moveTo(0.4, 0.8);
        ctx.lineTo(0.7, 0.8);
        ctx.lineTo(0.7, 0.4);
        ctx.arc(0.4, 0.4, 0.3, 0, -Math.PI / 2, true);
        ctx.lineTo(0.3, 0.1);
        ctx.lineTo(0.2, 0.4);
        ctx.lineTo(0.4, 0.4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0.2, 0.7);
        ctx.lineTo(0.2, 0.9);
        ctx.lineTo(0.8, 0.9);
        ctx.lineTo(0.8, 0.7);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        swapColors();
        ctx.beginPath();
        ctx.ellipse(0.55, 0.55, 0.1, 0.1, 0, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(0.55, 0.3, 0.05, 0.05, 0, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();
        swapColors();
    }
}

class Stag extends _HippogonalLeaper {
    static {super._registerPieceType(this);}
    static pieceName = "Stag";
    static pieceDescription = "Jumps four spaces on one axis and two spaces on the perpendicular axis.";
    static symbol = "N2";
    static distance1 = 4;
    static distance2 = 2;

    pieceDraw() {
        ctx.beginPath();
        ctx.moveTo(0.4, 0.8);
        ctx.lineTo(0.7, 0.8);
        ctx.lineTo(0.7, 0.4);
        ctx.arc(0.4, 0.4, 0.3, 0, -Math.PI / 2, true);
        ctx.lineTo(0.3, 0.1);
        ctx.lineTo(0.2, 0.4);
        ctx.lineTo(0.4, 0.4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0.2, 0.7);
        ctx.lineTo(0.2, 0.9);
        ctx.lineTo(0.8, 0.9);
        ctx.lineTo(0.8, 0.7);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0.5, 0.3);
        ctx.lineTo(0.7, 0.1);
        ctx.stroke();
    }
}

class Antelope extends _HippogonalLeaper {
    static {super._registerPieceType(this);}
    static pieceName = "Antelope";
    static pieceDescription = "Jumps four spaces on one axis and three spaces on the perpendicular axis.";
    static symbol = "AN";
    static distance1 = 4;
    static distance2 = 3;

    pieceDraw() {
        ctx.beginPath();
        ctx.moveTo(0.4, 0.3);
        ctx.arc(0.4, 0.1, 0.2, Math.PI / 2, Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0.4, 0.8);
        ctx.lineTo(0.7, 0.8);
        ctx.lineTo(0.7, 0.4);
        ctx.arc(0.4, 0.4, 0.3, 0, -Math.PI / 2, true);
        ctx.lineTo(0.3, 0.1);
        ctx.lineTo(0.2, 0.4);
        ctx.lineTo(0.4, 0.4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0.2, 0.7);
        ctx.lineTo(0.2, 0.9);
        ctx.lineTo(0.8, 0.9);
        ctx.lineTo(0.8, 0.7);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0.5, 0.3);
        ctx.arc(0.5, 0.1, 0.2, Math.PI / 2, 0, true);
        ctx.stroke();
    }
}

class Champion extends _MovementComboPiece {
    static {super._registerPieceType(this);}
    static pieceName = "Champion";
    static pieceDescription = "Jumps one or two squares cardinally or two squares diagonally.";
    static symbol = "WAD";
    static constituents = [Wazir, Alfil, Dabbaba];

    pieceDraw() {
        ctx.beginPath();
        ctx.moveTo(0.2, 0.9);
        ctx.lineTo(0.8, 0.9);
        ctx.lineTo(0.8, 0.4);
        ctx.arc(0.5, 0.4, 0.3, 0, Math.PI, true);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0.3, 0.4);
        ctx.lineTo(0.7, 0.4);
        ctx.lineTo(0.5, 0.4);
        ctx.lineTo(0.5, 0.7);
        ctx.stroke();
    }
}

class Wizard extends _MovementComboPiece {
    static {super._registerPieceType(this);}
    static pieceName = "Wizard";
    static pieceDescription = "Jumps one square on one axis and one or three squares on the perpendicular axis.";
    static symbol = "FC";
    static constituents = [Ferz, Camel];

    pieceDraw() {
        const theta = Math.atan(3);
        ctx.beginPath();
        ctx.moveTo(0.5, 0.1);
        ctx.arc(0.5, 0.5, 0.4, -Math.PI / 2, Math.PI);
        ctx.arc(0.4, 0.4, Math.sqrt(0.1), theta - Math.PI * 1.5, -theta, true);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
}

class Crab extends Piece {
    static {super._registerPieceType(this);}
    static pieceName = "Crab";
    static pieceDescription = "Moves two squares horizontally and one square back or one square horizontally and two squares forward.";
    static symbol = "CRAB";
    
    pieceCanMoveTo(board, position) {
        let [row, col] = position;
        let dr = row - this.row;
        let dc = col - this.col;
        return dr ** 2 + dc ** 2 === 5 && [1, -2].includes(this.isWhite ? dr : -dr);
    }

    pieceDraw() {
        let y = 0.03 ** 0.5 + 0.3;
        let cx = 0.02 ** 0.5 + 0.5;
        let cy = 0.3 - 0.02 ** 0.5;
        ctx.beginPath();
        ctx.moveTo(0.4, 0.9);
        ctx.lineTo(0.6, 0.9);
        ctx.lineTo(0.6, y);
        ctx.lineTo(0.4, y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0.5, 0.3);
        ctx.lineTo(cx, cy);
        ctx.arc(0.5, 0.3, 0.2, -Math.PI / 4, -Math.PI * 3 / 4);
        ctx.lineTo(0.5, 0.3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
}

class Barc extends Piece {
    static {super._registerPieceType(this);}
    static pieceName = "Barc";
    static pieceDescription = "Moves two squares horizontally and one square forward or one square horizontally and two squares back.";
    static symbol = "BARC";
    
    pieceCanMoveTo(board, position) {
        let [row, col] = position;
        let dr = row - this.row;
        let dc = col - this.col;
        return dr ** 2 + dc ** 2 === 5 && [-1, 2].includes(this.isWhite ? dr : -dr);
    }

    pieceDraw() {
        let y = 0.03 ** 0.5 + 0.3;
        let cx = 0.02 ** 0.5 + 0.5;
        let cy = 0.3 - 0.02 ** 0.5;
        ctx.beginPath();
        ctx.moveTo(0.4, 0.1);
        ctx.lineTo(0.6, 0.1);
        ctx.lineTo(0.6, 1 - y);
        ctx.lineTo(0.4, 1 - y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0.5, 0.7);
        ctx.lineTo(cx, 1 - cy);
        ctx.arc(0.5, 0.7, 0.2, Math.PI / 4, Math.PI * 3 / 4, true);
        ctx.lineTo(0.5, 0.7);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
}

class Mann extends Piece {
    static {super._registerPieceType(this);}
    static pieceName = "Mann";
    static pieceDescription = "Moves one space in any direction.";
    static symbol = "M";

    pieceCanMoveTo(board, position) {
        return Math.abs(this.row - position[0]) <= 1 && Math.abs(this.col - position[1]) <= 1;
    }

    pieceDraw() {
        ctx.beginPath();
        ctx.moveTo(0.35, 0.8);
        ctx.lineTo(0.65, 0.8);
        ctx.lineTo(0.65, 0.25);
        ctx.lineTo(0.8, 0.1);
        ctx.lineTo(0.2, 0.1);
        ctx.lineTo(0.35, 0.25);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0.2, 0.7);
        ctx.lineTo(0.2, 0.9);
        ctx.lineTo(0.8, 0.9);
        ctx.lineTo(0.8, 0.7);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
}

class Kirin extends _MovementComboPiece {
    static {super._registerPieceType(this);}
    static pieceName = "Kirin";
    static pieceDescription = "Moves one space diagonally or jumps two spaces cardinally.";
    static symbol = "FD";
    static constituents = [Ferz, Dabbaba];

    pieceDraw() {
        ctx.beginPath();
        ctx.moveTo(0.5, 0.1);
        ctx.lineTo(0.1, 0.5);
        ctx.lineTo(0.5, 0.9);
        ctx.lineTo(0.9, 0.5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
}

class Toad extends _MovementComboPiece {
    static {super._registerPieceType(this);}
    static pieceName = "Toad";
    static pieceDescription = "Jumps two or three spaces cardinally.";
    static symbol = "DH";
    static constituents = [Dabbaba, Threeleaper];

    pieceDraw() {
        ctx.beginPath();
        ctx.moveTo(0.4, 0.25);
        ctx.lineTo(0.6, 0.25);
        ctx.arc(0.75, 0.25, 0.15, Math.PI, 0);
        ctx.lineTo(0.9, 0.8);
        ctx.arc(0.8, 0.8, 0.1, 0, Math.PI / 2);
        ctx.lineTo(0.2, 0.9);
        ctx.arc(0.2, 0.8, 0.1, Math.PI / 2, Math.PI);
        ctx.lineTo(0.1, 0.25);
        ctx.arc(0.25, 0.25, 0.15, Math.PI, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
}

class DragonHorse extends _MovementComboPiece {
    static {super._registerPieceType(this);}
    static pieceName = "Dragon Horse";
    static pieceDescription = "Moves one space cardinally or any number of pieces diagonally.";
    static symbol = "BW";
    static constituents = [Bishop, Wazir];

    pieceDraw() {
        const NUM_SPIKES = 4;
        ctx.beginPath();
        ctx.moveTo(0.4, 0.8);
        ctx.lineTo(0.7, 0.8);
        ctx.lineTo(0.7, 0.4);
        ctx.arc(0.4, 0.4, 0.3, 0, -Math.PI / 2, true);
        ctx.lineTo(0.3, 0.1);
        ctx.lineTo(0.2, 0.4);
        ctx.lineTo(0.4, 0.4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0.2, 0.7);
        ctx.lineTo(0.2, 0.9);
        ctx.lineTo(0.8, 0.9);
        ctx.lineTo(0.8, 0.7);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0.7, 0.6);
        ctx.lineTo(0.9, 0.65);
        ctx.lineTo(0.7, 0.7);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        for (let i = 0; i < NUM_SPIKES; i++) {
            ctx.beginPath();
            let x = y => y <= 0.4 ? (0.3 ** 2 - (0.4 - y) ** 2) ** 0.5 + 0.4 : 0.7;
            let topY = 0.5 - 0.1 * i;
            ctx.moveTo(x(topY), topY);
            ctx.lineTo(x(topY + 0.05) + 0.1, topY + 0.05);
            ctx.lineTo(x(topY + 0.1), topY + 0.1);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
    }
}

class Superpawn extends Piece {
    static {super._registerPieceType(this);}
    static pieceName = "Superpawn";
    static pieceDescription = "Moves any number of spaces forward and captures any number of spaces diagonally.";
    static symbol = "SP";

    pieceCanMoveTo(board, position) {
        let rowOffset = this.isWhite ? -1 : 1;
        let destinationPiece = board.pieceAt(position);
        if (![-1, 0, 1].some(coff => this.canSlideTo(board, position, [rowOffset, coff]))) return false;
        if (position[1] !== this.col && !destinationPiece) return false;
        if (position[1] === this.col && destinationPiece) return false;
        return true;
    }

    pieceDraw() {
        ctx.beginPath();
        ctx.moveTo(0.5, 0.25);
        ctx.lineTo(0.35, 0.7);
        ctx.lineTo(0.2, 0.7);
        ctx.lineTo(0.2, 0.9);
        ctx.lineTo(0.8, 0.9);
        ctx.lineTo(0.8, 0.7);
        ctx.lineTo(0.65, 0.7);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0.5, 0.1);
        ctx.lineTo(0.65, 0.25);
        ctx.lineTo(0.5, 0.4);
        ctx.lineTo(0.35, 0.25);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
}

class Archbishop extends Piece {
    static {super._registerPieceType(this);}
    static pieceName = "Archbishop";
    static pieceDescription = "Can move any number of spaces diagonally, bouncing off the side of the board at most once.";
    static symbol = "AR";

    pieceCanMoveTo(board, position) {
        if ([[1, 1], [1, -1], [-1, 1], [-1, -1]].some(direction => this.canSlideTo(board, position, direction)))
            return true;
        let edges = [];
        for (let row = 0; row < board.rows; row++) {
            for (let col of [0, board.cols - 1]) {
                edges.push([row, col]);
            }
        }
        for (let col = 0; col < board.cols; col++) {
            for (let row of [0, board.rows - 1]) {
                edges.push([row, col]);
            }
        }
        for (let edge of edges) {
            if (![[1, 1], [1, -1], [-1, 1], [-1, -1]].some(direction => this.canSlideTo(board, edge, direction))) continue;
            let copy = this.copy();
            copy.moveTo(edge);
            if ([[1, 1], [1, -1], [-1, 1], [-1, -1]].some(direction => copy.canSlideTo(board, position, direction))) return true;
        }
        return false;
    }

    pieceDraw() {
        const d = 0.15 * Math.sqrt(2) / 2;
        ctx.beginPath();
        ctx.moveTo(0.2, 0.7);
        ctx.lineTo(0.2, 0.9);
        ctx.lineTo(0.8, 0.9);
        ctx.lineTo(0.8, 0.7);
        ctx.lineTo(0.6, 0.7);
        ctx.lineTo(0.6, 0.4);
        ctx.lineTo(0.4, 0.4);
        ctx.lineTo(0.4, 0.7);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0.5, 0.3 - 2 * d);
        ctx.lineTo(0.5 + d, 0.3 - d);
        ctx.arc(0.5, 0.3, 0.15, -Math.PI / 4, -3 * Math.PI / 4, false);
        ctx.lineTo(0.5, 0.3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0.4, 0.7);
        ctx.lineTo(0.6, 0.5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0.6, 0.7);
        ctx.lineTo(0.4, 0.5);
        ctx.stroke();
    }
}

class Grasshopper extends Piece {
    static {super._registerPieceType(this);}
    static pieceName = "Grasshopper";
    static pieceDescription = "Can move any number of spaces cardinally or diagonally, landing immediately beyond a piece.";
    static symbol = "GR";

    pieceCanMoveTo(board, position) {
        let direction = [Math.sign(position[0] - this.row), Math.sign(position[1] - this.col)];
        let oneBefore = [position[0] - direction[0], position[1] - direction[1]];
        let twoBefore = [position[0] - direction[0] * 2, position[1] - direction[1] * 2];
        if (!this.canSlideTo(board, twoBefore, direction)) return false;
        if (board.pieceAt(twoBefore) || !board.pieceAt(oneBefore)) return false;
        return true;
    }

    pieceDraw() {
        const POINTS = 5;
        const d = (0.8 - 0.2) / (POINTS - 1);
        ctx.beginPath();
        ctx.moveTo(0.3, 0.7);
        ctx.lineTo(0.3, 0.2);
        ctx.lineTo(0.7, 0.2);
        ctx.lineTo(0.7, 0.7);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0.2, 0.9);
        for (let i = 1; i < POINTS; i++)
            ctx.lineTo(0.2 + i * d, i % 2 ? 0.75 : 0.9);
        ctx.lineTo(0.8, 0.6);
        ctx.lineTo(0.2, 0.6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0.2, 0.3);
        ctx.lineTo(0.2, 0.1);
        ctx.lineTo(0.8, 0.1);
        ctx.lineTo(0.8, 0.3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
}