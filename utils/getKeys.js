var order = require('./order');
var keys = [];
//console.log(Object.keys(order));


function mineKeysDeeply(input, spaces, lastKey) {
  switch (typeof(input)) {
    case 'object':
    if ((input) == null) {
      break;
    }
    spaces++;

      if (Array.isArray(input)) {
        spaces--;
        mineKeysDeeply(input[0], spaces, lastKey)
      } else {
        for (key in input) {
          if (lastKey === '' ) {
            keys.push(key)
            //console.log(key)
            mineKeysDeeply(input[key], spaces, key);
          } else {
            keys.push(lastKey + '.' + key);
            //console.log(lastKey + '.' + key)
            mineKeysDeeply(input[key], spaces, lastKey + '.' + key);
          }

        }
      }
      break;
  }
}

mineKeysDeeply(order, 0, '');
//console.log(Object.keys(order))

console.log('var fields = [')
keys.forEach((key) => {
  console.log("'" + key + "',");
})
console.log(']')
