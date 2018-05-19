var LENGTH = 4;
var RATE_4 = 0.1;
var wih = null;
var who = null;

$$(document).ready(function(){
  init();

  $$('button').on('click', function(){
    act($$(this).attr('id'));

    var directionList = ['up', 'down', 'left', 'right'];
    for(var key in directionList){
      var direction = directionList[key];
      if(checkMove(direction)){
        $$('#' + direction).removeAttr('disabled');
      }
      else{
        $$('#' + direction).attr('disabled', 'disabled');
      }
    }

    var neuronResult = calcNeuron();
    $$('#up').text(Math.round(neuronResult[0][0] * 10000) / 100);
    $$('#right').text(Math.round(neuronResult[1][0] * 10000) / 100);
    $$('#down').text(Math.round(neuronResult[2][0] * 10000) / 100);
    $$('#left').text(Math.round(neuronResult[3][0] * 10000) / 100);
  });
});

function init(){
  var matrix = getMatrix();
  matrix = setNewNumber(matrix);
  matrix = setNewNumber(matrix);
  showMatrix(matrix);
  setScoreId();

  wih = getCsv('./csv/layer2/wih.csv');
  who = getCsv('./csv/layer2/who.csv');
}

function act(direction){
  var matrix = getMatrix();
  matrix = rotateMatrix(matrix, direction);
  matrix = moveCombine(matrix, true).matrix;
  matrix = moveAside(matrix).matrix;
  matrix = setNewNumber(matrix);
  matrix = rotateMatrix(matrix, direction);
  showMatrix(matrix);
}

function getMatrix(){
  var matrixArray = [];
  for(var i = 0; i < LENGTH ** 2; i++){
    var id = '#cell' + String(i);
    var num = $$(id).text() != '' ? $$(id).text() : 0;

    matrixArray.push(parseInt(num));
  }
  return matrixArray;
}

function showMatrix(matrix){
  for(var i = 0; i < LENGTH ** 2; i++){
    var id = '#cell' + String(i);
    var num = String(matrix[i]);
    $$(id).text(num);
    $$(id).attr('class', 'val' + matrix[i]);
  }
}

function setNewNumber(matrix){
  var matrixArray = [];
  for(var i = 0; i < LENGTH ** 2; i++){
    matrixArray.push(i);
  }
  shuffle(matrixArray);

  putNumber = Math.random() > RATE_4 ? 2 : 4;

  for(var i = 0; i < LENGTH ** 2; i++){
    if(matrix[matrixArray[i]] == 0){
      matrix[matrixArray[i]] = putNumber;
      return matrix;
    }
  }
}

function checkMove(direction){
  var matrix = getMatrix();
  matrix = rotateMatrix(matrix, direction);
  if(moveCombine(matrix).can) return true;
  if(moveAside(matrix).can) return true;
  return false;
}

function checkFinish(){
  var directionList = ['up', 'down', 'left', 'right'];
  for(var key in directionList){
    var id = '#' + directionList[key];
    if(!$$(id).attr('disabled')) return false;
  }
  return true;
}

function moveCombine(matrix, score){
  var result = {};
  result.can = false;
  for(var col = 0; col < LENGTH; col++){
    //01,02,03,12,13,23
    for(var row = 0; row < LENGTH - 1; row++){
      for(var row2 = row + 1; row2 < LENGTH; row2++){
        var cell = row * LENGTH + col;
        var cell2 = row2 * LENGTH + col;
        if(matrix[cell] == 0) break;
        if(matrix[cell] == matrix[cell2]){
          matrix[cell] = matrix[cell] * 2;
          matrix[cell2] = 0;
          if(score == true){
            var score = parseInt($$('#score').text()) + matrix[cell];
            $$('#score').text(score);
          }
          result.can = true;
          break;
        }
        else if(matrix[cell2] != 0){
          break;
        }
      }
    }
  }
  result.matrix = matrix;
  return result;
}

function moveAside(matrix){
  var result = {};
  result.can = false;
  for(var col = 0; col < LENGTH; col++){
    //01,12,23¤ÎÈë¤ìÌæ¤¨¤ò3»Ø
    for(var row = 0; row < LENGTH - 1; row++){
      for(var row2 = 0; row2 < LENGTH - 1; row2++){
        var cell = row2 * LENGTH + col;
        var cell2 = cell + LENGTH;
        if(matrix[cell] == 0 && matrix[cell2] != 0){
          matrix[cell] = matrix[cell2];
          matrix[cell2] = 0;
          result.can = true;
        }
      }
    }
  }
  result.matrix = matrix;
  return result;
}

function rotateMatrix(matrix, direction){
  var result = new Array(LENGTH ** 2);
  for(var i = 0; i < LENGTH ** 2; i++){
    var i2 = rotateMatrixNumber(direction, i);
    result[i] = matrix[i2];
  }
  return result;
}

function rotateMatrixNumber(direction, number){
  switch (direction){
    case 'up':
      return number;
    case 'down':
      return parseInt(number % LENGTH) - parseInt(number / LENGTH) * LENGTH + LENGTH * (LENGTH - 1);
    case 'left':
      return parseInt(number % LENGTH) * LENGTH + parseInt(number / LENGTH);
    case 'right':
      return - parseInt(number % LENGTH) * LENGTH - parseInt(number / LENGTH) + LENGTH ** 2 - 1;
  }
  return number;
}

function setScoreId(){
  var now = new Date();
  $$('#score_id').text(now.getTime());
}

function shuffle(array){
  var n = array.length, t, i;
  while (n) {
    i = Math.floor(Math.random() * n--);
    t = array[n];
    array[n] = array[i];
    array[i] = t;
  }
  return array;
}

function insertData(direction){
  var data = [
    'table=' + 'piles',
    'hand=' + direction[0],
    'user_id=' + $$('#user_id').val(),
    'score_id=' + $$('#score_id').text()
  ];
  for(var i= 0; i < LENGTH ** 2; i++){
    data.push('cell' + String(i) + '=' + $$('#cell' + String(i)).text());
  }

  insert('insert.php', data);
}

function insertScore(){
  var data = [
    'table=' + 'scores',
    'score_id=' + $$('#score_id').text(),
    'score=' + $$('#score').text()
  ];
  insert('insert.php', data);
}

function insert(url, dataArray){
  var data = dataArray.join('&');

  var xhr = new XMLHttpRequest();
  xhr.open("POST", url , true);
  xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhr.send(data);
}

function calcNeuron(){
  var matrix = getMatrix();
  var inputs = [];
  for(var i in matrix){
    var val = Math.log(parseInt(matrix[i]) + 1.1) / Math.log(2) / 12 + 0.01;
    inputs.push([val]);
  }
  var hiddenInputs = calcDot(wih, inputs);
  var hiddenOutputs = calcSigmoidMatrix(hiddenInputs);
  var finalInputs = calcDot(who, hiddenOutputs);
  return calcSigmoidMatrix(finalInputs);
}

function calcSigmoidMatrix(matrix){
  for(var i1 = 0; i1 < matrix.length; i1++){
    for(var i2 = 0; i2 < matrix[i1].length; i2++){
      matrix[i1][i2] = 1 / (1 + Math.E ** (- matrix[i1][i2]));
    }
  }
  return matrix;
}

function calcDot(matrix1, matrix2){
  var res = [];
  var row1 = matrix1.length;
  var row2 = matrix2.length;
  var col1 = matrix1[0].length;
  var col2 = matrix2[0].length;

  if(col1 != row2) {
    console.error('matrix1の列数とmatrix2の行数が異なります。');
    return null;
  }

  for(var i1 = 0; i1 < row1; i1++){
    res.push([]);
    for(var i2 = 0; i2 < col2; i2++){
      res[i1].push(0);
      for(var i3 = 0; i3 < col1; i3++){
        res[i1][i2] += matrix1[i1][i3] * matrix2[i3][i2];
      }
    }
  }

  return res;
}

function getCsv(url){
  var txt = new XMLHttpRequest();
  txt.open('get', url, false);
  txt.send();

  var arr = txt.responseText.split('\n');
  var res = [];
  for(var i = 0; i < arr.length; i++){
    if(arr[i] == '') break;

    res[i] = arr[i].split(',');
    for(var i2 = 0; i2 < res[i].length; i2++){
      if(res[i][i2].match(/\-?\d+(.\d+)?(e[\+\-]d+)?/)){
        res[i][i2] = parseFloat(res[i][i2].replace('"', ''));
      }
    }
  }

  return res;
}