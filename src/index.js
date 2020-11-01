import React from 'react';
import ReactDOM from 'react-dom';
import * as Constants from './constants';
import { getRandomInt, rotateClampX, checkMove } from './util';
import './index.css';

class Square extends React.Component {
  render() {
    return (
      <div style={{
          backgroundColor: this.props.color,
          width: Constants.squareDim,
          height: Constants.squareDim,
          position: 'absolute',
          top: this.props.y * Constants.squareDim,
          left: this.props.x * Constants.squareDim,
        }}
      />
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isFallingFinished: false,
      numLinesRemoved: 0,
      currentPiece: null,
      isGameOver: false,
      board: Array(Constants.numRowInBoard).fill(null).map(
        () => Array(Constants.numColInBoard).fill(Constants.TetrominoShape.NoShape)
      ),
    };
  }

  start() {
    this.newPiece();
  }

  gameOver() {
    this.setState({
      currentPiece: null,
      isGameOver: true,
    });
    this.stopTimer();
  }

  newPiece() {
    const board = this.state.board;

    const newPieceShape = getRandomInt(1, Object.keys(Constants.TetrominoShape).length);
    const newPieceCoords = Constants.TetrominoCoordsTable[newPieceShape].slice();
    const newX = Math.floor(Constants.numColInBoard / 2) + 1;
    const newY = Math.max(0, -Math.min(...newPieceCoords.map(x => x[1])));

    const newPiece = {
      shape: newPieceShape,
      coords: newPieceCoords,
      x: newX,
      y: newY,
    };
    const isValidMove = checkMove(newPiece, board, newX, newY);

    if (isValidMove) {
      this.setState({
        currentPiece: newPiece,
      });
    } else {
      this.commitPieceToBoard(newPiece);
      this.gameOver();
    }
  }

  // Try to move the current piece by (deltaX, deltaY).
  // If the move is successful, this function returns true.
  // If the move is not successful, this function returns false.
  tryMove(deltaX, deltaY) {
    const currentPiece = this.state.currentPiece;
    const board = this.state.board;
    if (!currentPiece) {
      return true;
    }
    const newX = currentPiece.x + deltaX;
    const newY = currentPiece.y + deltaY;
    const isValidMove = checkMove(currentPiece, board, newX, newY);

    if (isValidMove) {
      this.setState({
        currentPiece: Object.assign({}, currentPiece, {x: newX, y: newY}),
      });
    }
    return isValidMove;
  }

  rotateLeft() {
    const currentPiece = this.state.currentPiece;
    if (!currentPiece || currentPiece.shape === Constants.TetrominoShape.SquareShape) {
      return;
    }
    const newCoords = currentPiece.coords.map((entry) => [entry[1], -entry[0]]);
    const newX = rotateClampX(currentPiece.x, newCoords);

    this.setState({
      currentPiece: Object.assign({}, currentPiece, {
        coords: newCoords,
        x: newX,
      }),
    });
  }

  rotateRight() {
    const currentPiece = this.state.currentPiece;
    if (!currentPiece || currentPiece.shape === Constants.TetrominoShape.SquareShape) {
      return;
    }
    const newCoords = currentPiece.coords.map((entry) => [-entry[1], entry[0]]);
    const newX = rotateClampX(currentPiece.x, newCoords);
    this.setState({
      currentPiece: Object.assign({}, currentPiece, {
        coords: newCoords,
        x: newX,
      }),
    });
  }

  dropDown() {
    const currentPiece = this.state.currentPiece;
    if (!currentPiece) {
      return;
    }
    let newY = currentPiece.y;
    while (newY < Constants.numRowInBoard) {
      if (!this.tryMove(0, 1)) {
        break;
      }
      newY++;
    }
    this.pieceDropped();
  }

  oneLineDown() {
    if (!this.tryMove(0, 1)) {
      this.pieceDropped();
    }
  }

  commitPieceToBoard(piece) {
    const board = this.state.board;
    const newBoard = board.map((row, y) => row.map((elem, x) => {
      for (const e of piece.coords) {
        if (x === piece.x + e[0] && y === piece.y + e[1]) {
          return piece.shape;
        }
      }
      return elem;
    }));
    this.setState({
      board: newBoard,
    });
  }

  pieceDropped() {
    const currentPiece = this.state.currentPiece;
    this.commitPieceToBoard(currentPiece);
    this.removeFullLines();
    if (!this.state.isFallingFinished) {
      this.newPiece();
    }
  }

  removeFullLines() {
    const numLinesRemoved = this.state.numLinesRemoved;
    const board = this.state.board;
    let linesToRemove = [];
    for (let y = 0; y < Constants.numRowInBoard; y++) {
      let lineIsFull = true;
      for (let x = 0; x < Constants.numColInBoard; x++) {
        if (board[y][x] === Constants.TetrominoShape.NoShape) {
          lineIsFull = false;
          break;
        }
      }
      if (lineIsFull) {
        linesToRemove.push(y);
      }
    }

    let newBoard = board.map((row) => row.map((elem) => elem));
    for (const y of linesToRemove) {
      for (let yy = y; yy > 0; yy--) {
        for (let xx = 0; xx < Constants.numColInBoard; xx++) {
          newBoard[yy][xx] = newBoard[yy - 1][xx];
        }
      }
    }

    if (linesToRemove.length > 0) {
      this.setState({
        numLinesRemoved: numLinesRemoved + linesToRemove.length,
        isFallingFinished: true,
        currentPiece: null,
        board: newBoard,
      });
    }
  }

  handleKeyDown(event) {
    switch (event.code) {
      case 'ArrowLeft':
        this.tryMove(-1, 0);
        break;
      case 'ArrowRight':
        this.tryMove(1, 0);
        break;
      case 'ArrowDown':
        this.rotateRight();
        break;
      case 'ArrowUp':
        this.rotateLeft();
        break;
      case 'Space':
        this.dropDown();
        break;
      default:
        break;
    }
  }

  handleTimerTick() {
    if (this.state.isFallingFinished) {
      this.setState({ isFallingFinished: false });
      this.newPiece();
    } else {
      this.oneLineDown();
    }
  }

  componentDidMount() {
    document.addEventListener('keydown', (event) => this.handleKeyDown(event), false);
    this.timer = setInterval(
      () => this.handleTimerTick(),
      200
    );
    this.start();
  }

  componentWillUnmount() {
    document.addEventListener('keydown', (event) => this.handleKeyDown(event), false);
    this.stopTimer();
  }

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  render() {
    const currentPiece = this.state.currentPiece;
    const board = this.state.board;
    const statusText = this.state.isGameOver ?
        <strong>Game Over</strong>
      : <span>Score: {this.state.numLinesRemoved}</span>;
    let boardRendered = [];
    for (let y = 0; y < Constants.numRowInBoard; y++) {
      for (let x = 0; x < Constants.numColInBoard; x++) {
        const shape = board[y][x];
        if (shape !== Constants.TetrominoShape.NoShape) {
          boardRendered.push(
            <Square
              x={x}
              y={y}
              color={Constants.TetrominoColor[shape]}
              key={y * Constants.numColInBoard + x}
            />);
        }
      }
    }
    let currentPieceRendered = null;
    if (currentPiece) {
      currentPieceRendered = currentPiece.coords.map((e, index) => {
        return (
          <Square
            x={currentPiece.x + e[0]}
            y={currentPiece.y + e[1]}
            color={Constants.TetrominoColor[currentPiece.shape]}
            key={boardRendered.length + index}
          />);
      });
    }
    return [
      <div
        id="board"
        key="board"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: `${Constants.BoardWidth}px`,
          height: `${Constants.BoardHeight}px`,
          backgroundColor: '#EEEEEE',
        }}

      >
        {boardRendered}
        {currentPieceRendered}
      </div>,
      <div
        id="status"
        key="status"
        style={{
          position: 'absolute',
          top: 0,
          left: `${Constants.BoardWidth}px`,
          padding: '15px',
          fontFamily: 'Helvetica, sans-serif',
        }}
      >
        <h2 style={{
          margin: 0,
          fontSize: '15pt',
        }}>Tetris</h2>
        <p>{statusText}</p>
        <p>&nbsp;</p>
        <ul>
          <li>Left, Right: Move block</li>
          <li>Up, Down: Rotate block</li>
          <li>Space: Drop block</li>
        </ul>
      </div>
    ];
  }
}

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
