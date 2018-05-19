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

    if($$('#is_ajax').prop('checked')){
      if(checkFinish()) insertScore();
      insertData($$(this).attr('id'));
    }
  });
});

function init(){
  var matrix = getMatrix();
  matrix = setNewNumber(matrix);
  matrix = setNewNumber(matrix);
  showMatrix(matrix);
  setScoreId();
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

