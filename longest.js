fs = require('fs');

fs.readFile('sowpods.txt', 'utf8', function (err,data) {

  var dict = {}
  var words = data.split("\r\n");
  words.forEach(function(v) {
    dict[v] = true
  });

  function isWordOkay(w) {
    console.log(w)
    if (w.length <= 2) {
      return true;
    }
    else if (dict[w.substring(1)] && isWordOkay(w.substring(1))) {
      return true;
    }
    else if (dict[w.substring(0, w.length - 1)] && isWordOkay(w.substring(0, w.length - 1))) {
      return true;
    }
    else {
      return false;
    }
  }
  
  [ 'ASPIRATED',
  'CANTICOYS',
  'CLASSISMS',
  'CLASSISTS',
  'CLEANSERS',
  'GLASSIEST',
  'ISLANDERS',
  'KETAMINES',
  'MODERNEST',
  'PRELATESS',
  'RELAPSERS',
  'SCOOPINGS',
  'SCRAPINGS',
  'SHEATHERS',
  'SPARKIEST',
  'STABLINGS',
  'STROWINGS',
  'SWASHIEST',
  'UPRAISERS',
  'WASHINESS',
  'WHOOPINGS' ].forEach(isWordOkay)
  /*
  var longest = ""
  var allLongest = []
  words.filter(isWordOkay).forEach(function (w) {
    if (longest.length < w.length) {
      longest = w;
      allLongest = [];
    }
    if (longest.length === w.length) {
      allLongest.push(w);
    }
  });
  console.log(allLongest)
  */
});