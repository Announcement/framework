var areArrays, toArrays, fromArrays, trash, out$ = typeof exports != 'undefined' && exports || this;
areArrays = function(it){
  return it instanceof Array;
};
toArrays = function(it){
  if (areArrays(it)) {
    return it;
  }
  return [it];
};
fromArrays = function(previous, current){
  return previous.concat(current);
};
trash = function(it){
  return it;
};
function flatten(it){
  while (it.some(areArrays)) {
    it = it.map(toArrays).reduce(fromArrays);
  }
  return it.filter(trash);
}
out$.flatten = flatten;