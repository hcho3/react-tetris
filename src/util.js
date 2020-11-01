import * as Constants from './constants';

function getRandomInt(min, max) {
  return Math.floor(Math.random() * Math.floor(max - min)) + min;
}

// When rotating a piece, make sure it doesn't go outside of the board
function rotateClampX(x, newCoords) {
  let newX = x;
  const newMinX = x + Math.min(...newCoords.map(e => e[0]));
  const newMaxX = x + Math.max(...newCoords.map(e => e[0]));
  if (newMinX < 0) {
    newX += -newMinX;
  }
  if (newMaxX >= Constants.numColInBoard) {
    newX -= (newMaxX - (Constants.numColInBoard - 1));
  }
  return newX;
}

// Check if the move will be successful. This function does not actually make
// the move. To make the move actually, call tryMove().
function checkMove(piece, board, newX, newY) {
  // Check for conditions where the proposed move fails
  for (const e of piece.coords) {
    const x = e[0] + newX;
    const y = e[1] + newY;
    // The move fails when any part of the piece goes outside of the board
    if (x < 0 || x >= Constants.numColInBoard || y < 0 || y >= Constants.numRowInBoard) {
      return false;
    }
    // The move fails when there is another block occupying the same place
    if (board[y][x] !== Constants.TetrominoShape.NoShape) {
      return false;
    }
  }
  return true;
}

export { getRandomInt, rotateClampX, checkMove };
