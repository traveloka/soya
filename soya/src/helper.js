import path from 'path';
import fs from 'fs';

export class Helper {
  static join() {
    
  }
};


export default {
  join: function(arg1, arg2) {
    var result = path.join(arg1, arg2);
    if (result[0] != '.' && result[0] != '/') result = './' + result;
    return result;
  }
};