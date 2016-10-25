fs = require('fs');
Triejs = require('triejs')

var boardSize = 4;

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function randomNumber(i) {
  return Math.floor(Math.random() * i);
}

function frequencyMap(words) {
  var frequencyMap = {};

  function addToFrequencyMap(word) {
    if (frequencyMap[word]) {
      frequencyMap[word] += 1;
    }
    else {
      frequencyMap[word] = 1;
    }
  }

  words.forEach(function(w) {
    var i;
    var one, two, three;

    if (w.length < 5) {
      return;
    }

    for (i = 0; i < w.length; i += 1) {
      var newChar = w.charAt(i);

      // TODO: I can generalize this past 3
      if (i > 1) {
        three = two + newChar;
        addToFrequencyMap(three);
      }
      if (i > 0) {
        two = one + newChar;
        addToFrequencyMap(two);
      }
      one = newChar
      addToFrequencyMap(one);
    }
  });

  return frequencyMap;
}

function generateBoard(frequencyMap) {
  var board = [
    [null, null, null, null],
    [null, null, null, null],
    [null, null, null, null],
    [null, null, null, null]
  ];

  var pathTaken = [
    [false, false, false, false],
    [false, false, false, false],
    [false, false, false, false],
    [false, false, false, false]
  ];

  var letters = {};

  function pickLetter(soFar, i, j) {
    if (board[i][j] === null) {
      return;
    }
    pathTaken[i][j] = true; 
    soFar = soFar + board[i][j];
    _pickLetter(soFar, i, j);
    pathTaken[i][j] = false;
  }

  function _pickLetter(soFar, i, j) {
    // for each letter, create a probability distribution based on the frequencyMap for 3 letter
    // combinations
    var inci, incj, newi, newj;

    if (soFar.length >= 2) {
      letters[soFar.charAt(0)] += frequencyMap[soFar] || 0;
    }

    if (soFar.length >= 3) {
      return;
    }

    for (inci = -1; inci <= 1; inci += 1) {
      for (incj = -1; incj <= 1; incj += 1) {
        newi = inci + i;
        newj = incj + j;
        if (newi >= 0 && newi < boardSize && newj >= 0 && newj < boardSize && !pathTaken[newi][newj]) {
          pickLetter(soFar, newi, newj);
        }
      }
    }
  }

  function pickLetterStart(i, j) {

    for (var c = 97; c <= 122; c += 1) {
      var letter = String.fromCharCode(c);
      letters[letter] = 1;
      board[i][j] = letter;
      pickLetter("", i, j);
    }

    board[i][j] = null;
    var total = 0;
    Object.keys(letters).forEach(function(k) {
      total += letters[k];
    });
    var i = randomNumber(total)

    total = 0;
    var selected = "";
    Object.keys(letters).forEach(function(k) {
      total += letters[k];
      if (!selected && total > i) {
        selected = k;
      }
    });

    return selected;
  }

  var i, j, letter, coords = []
  for (i = 0; i < boardSize; i += 1) {
    for (j = 0; j < boardSize; j += 1) {
      coords.push([i, j])
    }
  }
  // coords = coords.concat(coords.slice());

  // This didn't seem to get me better results, so I've commented it out.
  // shuffle(coords);

  coords.forEach(function(coord) {
    var i = coord[0], j = coord[1];
    letters = {};
    letter = pickLetterStart(i, j);
    board[i][j] = letter;
  });


  return board;
}

function findAllWords(trie, board) {
  var words = {};

  var pathTaken = [
    [false, false, false, false],
    [false, false, false, false],
    [false, false, false, false],
    [false, false, false, false]
  ];


  function findWordAtPosition(soFar, i, j) {
    pathTaken[i][j] = true; 
    soFar = soFar + board[i][j];
    _findWordAtPosition(soFar, i, j);
    pathTaken[i][j] = false;
  }

  function _findWordAtPosition(soFar, i, j) {
    var values = trie.find(soFar);
    var inci, incj, newi, newj;

    if (!values) {
      return;
    }

    if (soFar.length >= 3 && values[0] === soFar) {
      words[soFar] = true;
    }

    if (values.length === 1) {
      return;
    }

    for (inci = -1; inci <= 1; inci += 1) {
      for (incj = -1; incj <= 1; incj += 1) {
        newi = inci + i;
        newj = incj + j;
        if (newi >= 0 && newi < boardSize && newj >= 0 && newj < boardSize && !pathTaken[newi][newj]) {
          findWordAtPosition(soFar, newi, newj);
        }
      }
    }
  }

  var i, j;

  for (i = 0; i < boardSize; i += 1) {
    for (j = 0; j < boardSize; j += 1) {
      findWordAtPosition("", i, j)
    }
  }

  return Object.keys(words).sort();
}

function scoreWords(words) {
  var sum = 0;
  words.forEach(function(w) {
    var l = w.length;
    if (l < 3) {
      sum += 0;
    }
    else if (l <= 4) {
      sum += 1;
    }
    else if (l <= 5) {
      sum += 2;
    }
    else if (l <= 6) {
      sum += 3;
    }
    else if (l <= 7) {
      sum += 5;
    }
    else {
      sum += 11;
    }
  });
  return sum;
}

// Create a trie
// From the trie, incrementally
fs.readFile('enable1.txt', 'utf8', function (err,data) {
  var words = data.split("\r\n");
  var trie = new Triejs();
  words.forEach(function (w) { trie.add(w); });

  var fm = frequencyMap(words);
  var board, boardWords, score, maxScore = 0;

  while (true) {
    board = generateBoard(fm);
    boardWords = findAllWords(trie, board);
    score = scoreWords(boardWords);
    if (score > maxScore) {
      maxScore = score;
      console.log('-------------------------')
      console.log(board);
      console.log(boardWords);
      console.log(score)
    }
  }
  
;
});

