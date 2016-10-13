import path from 'path';

export default {
  join: function(arg1, arg2) {
    var result = path.join(arg1, arg2);
    if (result[0] != '.' && result[0] != '/') result = './' + result;
    return result;
  }
};