import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';


const ROW = 10;
const COL = 10;
const WIN_CONDITION = 5;

function Square(props) {
  return (
    <button className="square" onClick={props.onClick} style ={props.pStyle}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i, isBold = false) {
    
    var style = {};
    if(isBold)
    { 
      style = {backgroundColor: "#ffde00"};
    };

    return (
      <Square
        pStyle = {style}
        key = {i}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  createGameTable()
  {
    var gameTable = [];
    var num = 0;
    for(var i = 0; i < ROW; i++)
    {
      var gameRow= [];
      for(var j = 0; j< COL; j++)
      {
        num++;
        try{
          gameRow.push(this.renderSquare(num, num === this.props.historyClicked[this.props.step - 1]));
        }
        catch(err)
        {
          console.log(err);
          gameRow.push(this.renderSquare(num));
        }
      }
      gameTable.push(
        <div key = {i} className="board-row">
          {gameRow}
        </div>
      );
    }
    return(
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

class Game extends React.Component {
  constructor() {
    super();
    this.state = {
      history: [
        {
          squares: Array(ROW*COL).fill(null)
        }
      ],
      stepNumber: 0,
      historyClicked: [],
      winnerMark: Array(ROW*COL).fill(null),
      xIsNext: true
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    try{
      console.log(this.state.historyClicked[this.state.historyClicked.length-1] + '==' + this.state.xIsNext);
      if (this.calculateWinner(squares, this.state.historyClicked[this.state.historyClicked.length-1], !this.state.xIsNext) || squares[i]) {
        return;
      }
    }
    catch(err)
    {
      console.log('this.state.historyClicked is currently empty(may be you have just begin the game)');
    }
    squares[i] = this.state.xIsNext ? "X" : "O";

    //prepare before setState
    
    var newHistory = history.concat([
      {
        squares: squares
      }
    ]);
    var newHistoryClicked = this.state.historyClicked;
    if(newHistoryClicked.length - 1 > this.state.stepNumber)
    {
      newHistoryClicked = newHistoryClicked.slice(0,  this.state.stepNumber);
    };
    newHistoryClicked.push(i);
    
    this.setState({
      history: newHistory,
      stepNumber: history.length,
      historyClicked: newHistoryClicked,
      xIsNext: !this.state.xIsNext
    },
    function(){
      
      // console.log(newHistory);
      // console.log(this.state.historyClicked);
    }
  );
    
    
    //console.log(this.state.stepNumber + "--" + this.state.historyClicked);
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }

  
  calculateWinner(squares, clickedSquare, isX) 
  {

    if(clickedSquare === -1){
      return null;
    }

    const checkValue = isX ? 'X' : 'O';

    var numberOfSameSquares = 0;
    var currRow = numToRow(clickedSquare);
    var currCol = numToCol(clickedSquare);
    var winnerMarkTemp;

    //check row
    for(var col = 0; col < COL; col++)
    {
      winnerMarkTemp = Array(COL*ROW).fill(null);
      numberOfSameSquares = 0;
      for(var i = col; i < COL; i++){

        if(squares[cordToNum(currRow,i)] === checkValue){
          numberOfSameSquares++;
          winnerMarkTemp[cordToNum(currRow,i)] = true;
        }
        else{
          break;
        }
      }
      if(numberOfSameSquares === WIN_CONDITION){
        // this.setState({
        //   winnerMark: winnerMarkTemp
        // })
        return checkValue;
      }
    }

    //check column
    for(var row = 0; row < ROW; row++)
    {
      winnerMarkTemp = Array(COL*ROW).fill(null);
      numberOfSameSquares = 0;
      for(let i = row; i < ROW; i++){

        if(squares[cordToNum(i,currCol)] === checkValue){
          numberOfSameSquares++;
          winnerMarkTemp[cordToNum(i,currCol)] = true;
        }
        else{
          break;
        }
      }
      if(numberOfSameSquares === WIN_CONDITION){
        // this.setState({
        //   winnerMark: winnerMarkTemp
        // })
        return checkValue;
      }
  }

  //check left-right-cross
  var leftRightCrossInfo = leftRightCrossCord(clickedSquare);
  currCol = leftRightCrossInfo[0][1];
  for(let row = leftRightCrossInfo[0][0]; row < leftRightCrossInfo[1][0]; row++)
  {
    winnerMarkTemp = Array(COL*ROW).fill(null);
    numberOfSameSquares = 0;
    let currColTemp = currCol;
    for(let i = row; i < leftRightCrossInfo[1][0]; i++){

      if(squares[cordToNum(i,currColTemp)] === checkValue){
        numberOfSameSquares++;
        currColTemp++;
        winnerMarkTemp[cordToNum(i,currColTemp)] = true;
      }
      else{
        break;
      }
    }
    currCol++;
    if(numberOfSameSquares === WIN_CONDITION){
      // this.setState({
      //   winnerMark: winnerMarkTemp
      // })
      return checkValue;
    }
  }

   //check right-left-cross
   var rightLeftCrossInfo = rightLeftCrossCord(clickedSquare);
   currCol = rightLeftCrossInfo[0][1];
   for(let row = rightLeftCrossInfo[0][0]; row < rightLeftCrossInfo[1][0]; row++)
   {
     winnerMarkTemp = Array(COL*ROW).fill(null);
     numberOfSameSquares = 0;
     let currColTemp = currCol;
     for(let i = row; i <= rightLeftCrossInfo[1][0]; i++){
 
       if(squares[cordToNum(i,currColTemp)] === checkValue){
         numberOfSameSquares++;
         currColTemp--;
         winnerMarkTemp[cordToNum(i,currColTemp)] = true;
       }
       else{
         break;
       }
     }
     currCol--;
     if(numberOfSameSquares === WIN_CONDITION){
       // this.setState({
       //   winnerMark: winnerMarkTemp
       // })
       return checkValue;
     }
   }
  // //check every single line and crossline
  // //check rows
  // console.log(squares);
  // for(var row=0; row < ROW; row++){
  //   for(var col=0; col <COL; col++){
  //     var checkValue = squares[cordToNum(row, col)];
  //     var numberOfSameSquares = 0;
  //     for(var i = col; i<COL; i++)
  //     {
        
  //       if(checkValue === null)
  //       {
  //         break;
  //       }
  //       if(squares[cordToNum(row, i)] === checkValue){
  //         numberOfSameSquares++;
  //       }
  //       if(numberOfSameSquares === WIN_CONDITION)
  //       {
  //         return checkValue;
  //       }
  //     }
  //   }
  // }
  return null;
}

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = this.calculateWinner(current.squares, this.state.historyClicked[this.state.historyClicked.length-1], !this.state.xIsNext);

    const moves = history.map((step, move) => {
      var rowAndCol = '';
      try
      {
          rowAndCol = ' (' + numToCol(this.state.historyClicked[move - 1]) + ', ' + numToRow(this.state.historyClicked[move - 1]) + ')';
      }  
      catch(err)
      {
        console.log(err);
      }

      const desc = move ?
        'Go to move #' + move + ' ' + rowAndCol  :
        'Go to game start';
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
      status = "Next player: " + (this.state.xIsNext ? "X" : "O");
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            historyClicked={this.state.historyClicked}
            step={this.state.stepNumber}
            squares={current.squares}
            onClick={i => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));


function numToCol(num){
  return (num - 1) % COL;
}

function numToRow(num){
  return Math.floor((num - 1) / ROW);
}

//zero-base
function cordToNum(row, col)
{
  return ROW*row + col + 1;
}

//array[begin||end point][row||col]
function leftRightCrossCord(num){
  var row = numToRow(num);
  var col = numToCol(num);

  var result = Array(2).fill(null);

  while(col>0 || row >0)
  {
    col--;
    row--;
  }
  result[0] = [row, col];

  row = numToRow(num);
  col = numToCol(num);

  while(col<COL || row <ROW)
  {
    col++;
    row++;
  }
  result[1] = [row, col];

  return result;
}

//array[begin||end point][row||col]
function rightLeftCrossCord(num){
  var row = numToRow(num);
  var col = numToCol(num);

  var result = Array(2).fill(null);

  while(col<COL && row >0)
  {
    col++;
    row--;
  }
  result[0] = [row, col];

  row = numToRow(num);
  col = numToCol(num);

  while(col>0 && row <ROW)
  {
    col--;
    row++;
  }
  result[1] = [row, col];

  return result;
}