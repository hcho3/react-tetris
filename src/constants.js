const TetrominoShape = {
  NoShape: 0,
  ZShape: 1,
  SShape: 2,
  LineShape: 3,
  TShape: 4,
  SquareShape: 5,
  LShape: 6,
  MirroredLShape: 7,
};
Object.freeze(TetrominoShape);

const squareDim = 25;
const numRowInBoard = 22;
const numColInBoard = 10;
const BoardWidth = numColInBoard * squareDim;
const BoardHeight = numRowInBoard * squareDim;

const TetrominoCoordsTable = [
  [[0, 0],     [0, 0],     [0, 0],     [0, 0]],
  [[0, -1],    [0, 0],     [-1, 0],    [-1, 1]],
  [[0, -1],    [0, 0],     [1, 0],     [1, 1]],
  [[0, -1],    [0, 0],     [0, 1],     [0, 2]],
  [[-1, 0],    [0, 0],     [1, 0],     [0, 1]],
  [[0, 0],     [1, 0],     [0, 1],     [1, 1]],
  [[-1, -1],   [0, -1],    [0, 0],     [0, 1]],
  [[1, -1],    [0, -1],    [0, 0],     [0, 1]]
];

const TetrominoColor = [
  '#000000', '#CC6666', '#66CC66', '#6666CC',
  '#CCCC66', '#CC66CC', '#66CCCC', '#DAAA00',
];

export {
  TetrominoShape, squareDim, numRowInBoard, numColInBoard, BoardWidth, BoardHeight,
  TetrominoCoordsTable, TetrominoColor
};
