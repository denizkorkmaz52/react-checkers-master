import {ReactCheckers} from './ReactCheckers';

export class Opponent extends ReactCheckers {
    evaluateWinner(boardState) {

        let player1Pieces = 0;
        let player1Moves  = 0;

        let player2Pieces = 0;
        let player2Moves  = 0;

        for (let coordinates in boardState) {
            if (!boardState.hasOwnProperty(coordinates) || boardState[coordinates] === null) {
                continue;
            }

            const movesData = this.getMoves(boardState, coordinates, boardState[coordinates].isKing, false);
            const moveCount = movesData[0].length;

            if (boardState[coordinates].player === 'player1') {
                ++player1Pieces;
                player1Moves += moveCount;

            } else {
                ++player2Pieces;
                player2Moves += moveCount;
            }
        }
        if (player1Pieces === 0 ) {
            return 'player2pieces';
        }

        if (player2Pieces === 0 ) {
            return 'player1pieces';
        }

        if (player1Moves === 0) {
            return 'player2moves';
        }

        if (player2Moves === 0) {
            return 'player1moves';
        }

        return null;
    }
    minimax(state, depth, isMaximizingPlayer) {
        let currentState  = Object.assign({}, state.history[state.stepNumber]);
        let boardState = Object.assign({}, currentState.boardState);
        let movingPiece = Object.assign({}, boardState[state.activePiece]);
        let winner = this.evaluateWinner(boardState);
        let currentPlayer = currentState.currentPlayer;
        this.ReactCheckers = new ReactCheckers(this.columns);
        if (depth === 0 ||  winner !== null) {
            let player1Pieces = 0;
            let player1Moves  = 0;
    
            let player2Pieces = 0;
            let player2Moves  = 0;
    
            for (let coordinates in boardState) {
                if (!boardState.hasOwnProperty(coordinates) || boardState[coordinates] === null) {
                    continue;
                }
    
                const movesData = this.getMoves(boardState, coordinates, boardState[coordinates].isKing, false);
                const moveCount = movesData[0].length;
    
                if (boardState[coordinates].player === 'player1') {
                    ++player1Pieces;
                    player1Moves += moveCount;
    
                } else {
                    ++player2Pieces;
                    player2Moves += moveCount;
                }
            }
            if (movingPiece.player === 'player1') {
                return [state, player1Pieces * 10];
    
            } else {
                return [state, player2Pieces * 10];
            }
        }
      
        if (isMaximizingPlayer) {
            let bestValue = -Infinity;
            let bestState;
            const possibleMoves = this.getComputerMoves(boardState, currentPlayer);
            const moveKeys = Object.keys(possibleMoves);
            for (let i = 0; i < moveKeys.length; i++) {
                const piece = moveKeys[i];

                const movesData1 = possibleMoves[piece][0];
                const jumpKills = possibleMoves[piece][1];
                const jumpMoves = [];

                for (const jumpCoordinates in jumpKills) {
                    if (!jumpKills.hasOwnProperty(jumpCoordinates)) {
                        continue;
                    }
                    jumpMoves.push(jumpKills[jumpCoordinates]);
                }
                let highestScore = 0;
                let bestMove = null;
                for (let a = 0; a < movesData1.length ; ++a) {
                    const moveTo = movesData1[a];
                    
                    let score = 0;
                    if (jumpMoves.indexOf(moveTo) > -1) {
                        score += 10;
                    }

                    if (score >= highestScore) {
                        highestScore = score;
                        bestMove = moveTo;
                    }
                }

                let nextState = this.ReactCheckers.movePiece(bestMove, state);
                let value = this.minimax(nextState, depth - 1, false)[1];
                if(value > bestValue){
                    bestState = Object.assign({}, nextState);
                    bestValue = value;
                }
                
            }
        
            return [bestState, bestValue];
        } else {
            let bestValue = Infinity;
            let bestState;
            let possibleMoves = this.getComputerMoves(boardState, currentPlayer);
            const moveKeys = Object.keys(possibleMoves);
            for (let move of moveKeys) {
                let nextState = this.ReactCheckers.movePiece(move, state);
                let value = this.minimax(nextState, depth - 1, true)[1];
                if(value < bestValue){
                    bestState = Object.assign({}, nextState);
                    bestValue = value;
                }
            }
        
            return [bestState, bestValue];
        }
    }
    getComputerMoves(boardState, player) {
        const self = this;
        let computerMoves = {};

        for (const coordinates in boardState) {
            if (!boardState.hasOwnProperty(coordinates)) {
                continue;
            }

            const currentSquare = boardState[coordinates];

            if (currentSquare == null) {
                continue;
            }

            if (currentSquare.player !== player) {
                continue;
            }

            const pieceMoves = self.getMoves(boardState, coordinates, boardState[coordinates].isKing, false);

            if (pieceMoves[0].length > 0 || pieceMoves[1] !== null) {
                computerMoves[coordinates] = pieceMoves;
            }
        }

        return computerMoves;
    }

    getSmartMove(state, boardState, player, depth, isMaximizingPlayer) {
        
        const computerMoves = this.getComputerMoves(boardState, player);

        const moveKeys = Object.keys(computerMoves);

        const superMoves = {};
        //let bests = this.minimax(state, depth, isMaximizingPlayer);
        // Pieces
        for (let m = 0; m < moveKeys.length ; ++m) {
            const piece = moveKeys[m];

            const movesData = computerMoves[piece][0];
            const jumpKills = computerMoves[piece][1];

            const jumpMoves = [];

            for (const jumpCoordinates in jumpKills) {
                if (!jumpKills.hasOwnProperty(jumpCoordinates)) {
                    continue;
                }
                jumpMoves.push(jumpKills[jumpCoordinates]);
            }

            let highestScore = 0;
            let bestMove = null;
            let stateLeaf = Object.assign({}, state);

            stateLeaf.activePiece = piece;
            stateLeaf.moves = movesData;
            stateLeaf.jumpKills = jumpKills;
            let bests = this.minimax(stateLeaf, depth, isMaximizingPlayer);
            // Piece moves
            for (let a = 0; a < movesData.length ; ++a) {

                const moveTo = movesData[a];
                
                let score = 0;
                // let boardStateLeaf = Object.assign({}, boardstate);
                // let stateLeaf = Object.assign({}, state);

                // stateLeaf.activePiece = piece;
                // stateLeaf.moves = movesData;
                // stateLeaf.jumpKills = jumpKills;
                // let bests = this.minimax(stateLeaf, depth, isMaximizingPlayer);
                if (jumpMoves.indexOf(moveTo) > -1) {
                    score += 10;
                }

                if (score >= highestScore) {
                    highestScore = score;
                    bestMove = moveTo;
                }
            }

            superMoves[piece] = [bestMove, highestScore];
        }
        
        let finalMove = [];
        let highestAllMoves = 0;

        for (let pieces in superMoves) {
            if (!superMoves.hasOwnProperty(pieces)) {
                continue;
            }

            const pieceMove = superMoves[pieces][0];
            const moveScore = superMoves[pieces][1];

            if (moveScore >= highestAllMoves) {
                if (moveScore === highestAllMoves) {
                    finalMove.push([pieces, pieceMove]);
                }
                if (moveScore > highestAllMoves) {
                    finalMove = [];
                    finalMove.push([pieces, pieceMove]);
                    highestAllMoves = moveScore;
                }
            }
        }

        const chooseMove = finalMove[Math.floor(Math.random()*finalMove.length)];

        const out = {};
        out.piece = chooseMove[0];
        out.moveTo = chooseMove[1];

        return out;
    }

    getRandomMove(boardState, player) {
        const computerMoves = this.getComputerMoves(boardState, player);
        const keys = Object.keys(computerMoves);
        const randomPiece = keys[Math.floor(Math.random() * keys.length)];

        const movesData    = computerMoves[randomPiece][0];
        const randomMoveTo = movesData[Math.floor(Math.random()*movesData.length)];

        let out = {};
        out.piece = randomPiece;
        out.moveTo = randomMoveTo;

        return out;
    }
}