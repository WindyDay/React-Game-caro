import React from 'react';
import ReactDOM from 'react-dom';

import {render} from 'react-dom';
import {Provider} from 'react-redux';
import {createStore} from 'redux';
import {connect} from 'react-redux';

import './index.css';

const SORT_HISTORY = 'SORT_HISTORY'
const CLICK_SQUARE = 'CLICK_SQUARE'
const JUMP_TO = 'JUMP_TO'

const ROW = 10;
const COL = 10;
const WIN_CONDITION = 5;
let winnerMark = Array(ROW * COL).fill(null);

const defaultState = {
  history: [
    {
      squares: Array(ROW * COL).fill(null)
    }
  ],
  stepNumber: 0,
  historyClicked: [],
  xIsNext: true,
  isHistoryAscen: true
}

const reducer = (state = defaultState, action) => {

  switch (action.type) {

    case SORT_HISTORY:
      return Object.assign({}, state, {
        isHistoryAscen: !state.isHistoryAscen,
      });

    case CLICK_SQUARE:
      //console.log('CLICK_SQUARE action.value = ' + action.value);
      return Object.assign({}, state, {
        history: action.history,
        stepNumber: action.stepNumber,
        historyClicked: action.historyClicked,
        xIsNext: action.xIsNext
      });
    case JUMP_TO:
      return Object.assign({}, state, {
        stepNumber: action.stepNumber,
        xIsNext: action.xIsNext
      });
    
    default:
      return state;
  }
}

const store = createStore(reducer);

// console.log('store.getState().isHistoryAscen = ' + store.getState().isHistoryAscen);
// store.dispatch({type: SORT_HISTORY});
// console.log(store.getState());

// ==============================================================================
function mapStateToProps(state) {
  return state;
}

// ==============================================================================



// class App extends React.Component {
//   render() {
//     return (
//       <Provider store={store}>
//         <Game/>
//       </Provider>
//     )
//   }
// } 

// =============================================================================
function Square(props) {
  return (
    <button className="square" onClick={props.onClick} style ={props.pStyle}>
      {props.value}
    </button>
  );
}

// ==============================================================================



// =============================================================================
class Board extends React.Component {
  renderSquare(i, isBold = false) {

    let style = {};
    if (isBold) {
      style = {
        backgroundColor: "#ff3300"
      };
    } else {
      if (winnerMark[i] === true) {
        style = {
          backgroundColor: "#ffde00"
        };
      }
    }

    return (<Square
      pStyle={style}
      key={i}
      value={this.props.squares[i]}
      onClick={() => this.props.onClick(i)}/>);
  }

  createGameTable()
  {
    let gameTable = [];
    let num = 0;
    for (let i = 0; i < ROW; i++) {
      let gameRow = [];
      for (let j = 0; j < COL; j++) {
        num++;
        try {
          gameRow.push(this.renderSquare(num, num === this.props.historyClicked[this.props.step - 1]));
        } catch (err) {
          console.log(err);
          gameRow.push(this.renderSquare(num));
        }
      }
      gameTable.push(
        <div key={i} className="board-row">
          {gameRow}
        </div>
      );
    }
    return (
      <div>
        {gameTable}
      </div>
    );
  }

  render() {
    return (
      <div>
        {this.createGameTable()}
      </div>
    );
  }
}

// ==============================================================================




// =============================================================================
class Game extends React.Component {

  render() {
    let history = this
      .props
      .history
      .slice(0);
    let historyClicked = this
      .props
      .historyClicked
      .slice(0);
      
    console.log(this.props.isHistoryAscen);
    if (!this.props.isHistoryAscen) {
      history = history.reverse();
    }
    const current = this.props.history[this.props.stepNumber];
    const winner = this.calculateWinner(current.squares, historyClicked[historyClicked.length - 1], !this.props.xIsNext);

    const moves = history.map((step, move) => {
      move = this.props.isHistoryAscen
        ? move
        : history.length - 1 - move
      let rowAndCol = '';
      try
      {
        rowAndCol = ' (' + numToCol(historyClicked[move - 1]) + ', ' + numToRow(historyClicked[move - 1]) + ')';
      } catch (err) {
        console.log(err);
      }

      const desc = move
        ? 'Go to move #' + move + ' ' + rowAndCol
        : 'Go to game start';

      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    });

    let status;
    if (winner) {
      status = "Winner: " + winner;
    } else {
      status = "Next player: " + (this.props.xIsNext
        ? "X"
        : "O");
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            historyClicked={this.props.historyClicked}
            step={this.props.stepNumber}
            squares={current.squares}
            onClick={i => this.handleClick(i)}/>
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ul>
            <li>
              <button onClick={() => this.sortHistory()}>History sort</button>
            </li>
          </ul>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }

  handleClick(i) {
    const history = this
      .props
      .history
      .slice(0, this.props.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current
      .squares
      .slice();
    try {
      // console.log(this.props.historyClicked[this.props.historyClicked.length-1] +
      // '==' + this.props.xIsNext);
      if (this.calculateWinner(squares, this.props.historyClicked[this.props.historyClicked.length - 1], !this.props.xIsNext) || squares[i]) {
        return;
      }
    } catch (err) {
      console.log('this.props.historyClicked is currently empty(may be you have just begin the game' +
          ')');
    }
    squares[i] = this.props.xIsNext
      ? "X"
      : "O";

    //prepare before setState

    let newHistory = history.concat([
      {
        squares: squares
      }
    ]);
    let newHistoryClicked = this.props.historyClicked;
    if (newHistoryClicked.length - 1 > this.props.stepNumber) {
      newHistoryClicked = newHistoryClicked.slice(0, this.props.stepNumber);
    };
    newHistoryClicked.push(i);

    this.props.dispatch({type: CLICK_SQUARE, 
      value: i,
      history: newHistory,
      stepNumber: history.length,
      historyClicked: newHistoryClicked,
      xIsNext: !this.props.xIsNext
    });
  }

  sortHistory() {
    this.props.dispatch({type: SORT_HISTORY});
    // this.setState({
    //   isHistoryAscen: !this.props.isHistoryAscen
    // }, () => {
    //   console.log(this.props.isHistoryAscen);
    // });
  }
  jumpTo(step) {
    
    this.props.dispatch({type: JUMP_TO, 
      stepNumber: step,
      xIsNext: (step % 2) === 0
    });

    winnerMark.fill(null);
  }

  calculateWinner(squares, clickedSquare, isX)
  {

    if (clickedSquare === -1) {
      return null;
    }
    //console.log('winnerMark: ' + winnerMark);
    const checkValue = isX
      ? 'X'
      : 'O';

    let numberOfSameSquares = 0;
    let currRow = numToRow(clickedSquare);
    let currCol = numToCol(clickedSquare);
    let winnerMarkTemp;

    //check row
    for (let col = 0; col < COL; col++) {
      winnerMarkTemp = Array(COL * ROW).fill(null);
      numberOfSameSquares = 0;
      for (let i = col; i < COL; i++) {

        if (squares[cordToNum(currRow, i)] === checkValue) {
          numberOfSameSquares++;
          winnerMarkTemp[cordToNum(currRow, i)] = true;
        } else {
          break;
        }
      }
      if (numberOfSameSquares === WIN_CONDITION) {
        winnerMark = winnerMarkTemp;
        return checkValue;
      }
    }

    //check column
    for (let row = 0; row < ROW; row++) {
      winnerMarkTemp = Array(COL * ROW).fill(null);
      numberOfSameSquares = 0;
      for (let i = row; i < ROW; i++) {

        if (squares[cordToNum(i, currCol)] === checkValue) {
          numberOfSameSquares++;
          winnerMarkTemp[cordToNum(i, currCol)] = true;
        } else {
          break;
        }
      }
      if (numberOfSameSquares === WIN_CONDITION) {
        winnerMark = winnerMarkTemp;
        return checkValue;
      }
    }

    //check left-right-cross
    let leftRightCrossInfo = leftRightCrossCord(clickedSquare);
    currCol = leftRightCrossInfo[0][1];
    for (let row = leftRightCrossInfo[0][0]; row < leftRightCrossInfo[1][0]; row++) {
      winnerMarkTemp = Array(COL * ROW).fill(null);
      numberOfSameSquares = 0;
      let currColTemp = currCol;
      for (let i = row; i < leftRightCrossInfo[1][0]; i++) {

        if (squares[cordToNum(i, currColTemp)] === checkValue) {
          numberOfSameSquares++;
          winnerMarkTemp[cordToNum(i, currColTemp)] = true;
          currColTemp++;
        } else {
          break;
        }
      }
      currCol++;
      if (numberOfSameSquares === WIN_CONDITION) {
        winnerMark = winnerMarkTemp;
        return checkValue;
      }
    }

    //check right-left-cross
    let rightLeftCrossInfo = rightLeftCrossCord(clickedSquare);
    currCol = rightLeftCrossInfo[0][1];
    for (let row = rightLeftCrossInfo[0][0]; row < rightLeftCrossInfo[1][0]; row++) {
      winnerMarkTemp = Array(COL * ROW).fill(null);
      numberOfSameSquares = 0;
      let currColTemp = currCol;
      for (let i = row; i <= rightLeftCrossInfo[1][0]; i++) {

        if (squares[cordToNum(i, currColTemp)] === checkValue) {
          numberOfSameSquares++;
          winnerMarkTemp[cordToNum(i, currColTemp)] = true;
          currColTemp--;
        } else {
          break;
        }
      }
      currCol--;
      if (numberOfSameSquares === WIN_CONDITION) {
        winnerMark = winnerMarkTemp;
        return checkValue;
      }
    }
    return null;
  }
}


function numToCol(num) {
  return (num - 1) % COL;
}

function numToRow(num) {
  return Math.floor((num - 1) / ROW);
}

//zero-base
function cordToNum(row, col) {
  return ROW * row + col + 1;
}

//array[begin||end point][row||col]
function leftRightCrossCord(num) {
  let row = numToRow(num);
  let col = numToCol(num);

  let result = Array(2).fill(null);

  while (col > 0 || row > 0) {
    col--;
    row--;
  }
  result[0] = [row, col];

  row = numToRow(num);
  col = numToCol(num);

  while (col < COL || row < ROW) {
    col++;
    row++;
  }
  result[1] = [row, col];

  return result;
}

//array[begin||end point][row||col]
function rightLeftCrossCord(num) {
  let row = numToRow(num);
  let col = numToCol(num);

  let result = Array(2).fill(null);

  while (col < COL && row > 0) {
    col++;
    row--;
  }
  result[0] = [row, col];

  row = numToRow(num);
  col = numToCol(num);

  while (col > 0 && row < ROW) {
    col--;
    row++;
  }
  result[1] = [row, col];

  return result;
}



// ==============================================================================


let ConnectedApp  = connect(mapStateToProps)(Game);
ReactDOM.render(<Provider store={store}><ConnectedApp /></Provider>, document.getElementById("root"));

// ==============================================================================