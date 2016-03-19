var flatten, fs, path, chalk, folders, pwd, identifyTypeOf, deflate, slice$ = [].slice;
flatten = require('prelude-ls').flatten;
fs = require('fs');
path = require('path');
chalk = require('chalk');
folders = /[\/\\]+/g;
pwd = path.parse(process.argv[1]).dir;
function initialize(){
  if (global.modules == null) {
    return global.modules = {};
  }
} initialize();
identifyTypeOf = function(item){
  if (typeof item !== 'object') {
    return typeof item;
  }
  return item instanceof Array ? 'array' : 'object';
};
deflate = function(point, data, arg$){
  var copy, current, local;
  if (arg$ != null) {
    copy = arg$;
  }
  if (copy == null) {
    copy = global.modules;
  }
  if (typeof point === 'string' && !point.match(folders)) {
    point = [point];
  }
  if (typeof point === 'string') {
    point = point.split(folders);
  }
  if (point.length === 0) {
    return data;
  }
  current = point.shift();
  local = copy[current] || (copy[current] = {});
  local = deflate(point, data, local);
  copy[current] = local;
  return copy;
};
function unflatten(object){
  var i$, own$ = {}.hasOwnProperty, results$ = [];
  for (i$ in object) if (own$.call(object, i$)) {
    results$.push((fn$.call(this, i$, object[i$])));
  }
  return results$;
  function fn$(key, value){
    return deflate(key, value);
  }
}
function withErrors(array){
  return array.map(function(item){
    if (item.hasOwnProperty('error')) {
      return item.error;
    }
  }).filter(function(it){
    return it;
  });
}
function withoutErrors(array){
  return array.map(function(item){
    if (item.error == null) {
      return item;
    }
  }).filter(function(it){
    return it;
  });
}
function clean(arg$){
  var array, errors;
  array = arg$.array, errors = arg$.errors;
  return {
    errors: errors.concat(withErrors(array)),
    array: withoutErrors(array)
  };
}
function include(){
  var array, cwd, errors, ref$, object, res$, i$, x$, len$, error, y$, results$ = [];
  array = slice$.call(arguments);
  cwd = pwd;
  if (identifyTypeOf(array[0]) === 'object') {
    cwd = array.shift().dir;
  }
  array = flatten([array]);
  errors = [];
  array = array.map(function(it){
    return {
      original: it
    };
  });
  array = array.map(function(it){
    return it.path = path.parse(path.join(cwd, it.original)), it;
  });
  array = array.map(function(it){
    return it.stat = it.path.dir, it;
  });
  array = array.map(function(it){
    var error;
    try {
      return it.stats = fs.statSync(it.stat), it;
    } catch (e$) {
      error = e$;
      return {
        error: error
      };
    }
  });
  ref$ = clean({
    errors: errors,
    array: array
  }), errors = ref$.errors, array = ref$.array;
  array = array.map(function(it){
    if (it.stats) {
      return it.isDirectory = it.stats.isDirectory(), it;
    }
  });
  array = array.map(function(it){
    var error;
    if (it.isDirectory) {
      try {
        return it.siblings = fs.readdirSync(it.path.dir), it;
      } catch (e$) {
        error = e$;
        return {
          error: error
        };
      }
    }
  });
  ref$ = clean({
    errors: errors,
    array: array
  }), errors = ref$.errors, array = ref$.array;
  array = array.map(function(it){
    var i$, ref$, len$, file, parsed;
    if (it.siblings) {
      for (i$ = 0, len$ = (ref$ = it.siblings).length; i$ < len$; ++i$) {
        file = ref$[i$];
        parsed = path.parse(path.join(it.path.dir, file));
        if (parsed.name === it.path.name) {
          it.filename = file;
        }
      }
    }
    return it;
  });
  array = array.map(function(it){
    return it.local = it.siblings != null && it.filename != null, it;
  });
  array = array.map(function(it){
    var name;
    name = !it.local
      ? it.original
      : path.join(it.path.dir, it.filename);
    return {
      original: it.original,
      name: name
    };
  });
  array = array.map(function(it){
    var error;
    try {
      console.log(it.name);
      return it.bin = require(it.name), it;
    } catch (e$) {
      error = e$;
      return {
        error: error
      };
    }
  });
  ref$ = clean({
    errors: errors,
    array: array
  }), errors = ref$.errors, array = ref$.array;
  res$ = {};
  for (i$ = 0, len$ = array.length; i$ < len$; ++i$) {
    x$ = array[i$];
    res$[x$.original] = x$.bin;
  }
  object = res$;
  unflatten(object);
  errors.forEach(function(it){
    return console.log(chalk.red('Error'), it);
  });
  error = "There were issues including " + (errors.length > 1 ? errors.length + " modules." : "a module.");
  if (errors.length > 0) {
    throw error;
  }
  for (i$ = 0, len$ = array.length; i$ < len$; ++i$) {
    y$ = array[i$];
    results$.push(y$.bin);
  }
  return results$;
}
module.exports = include;