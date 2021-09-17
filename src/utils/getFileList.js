var path = require('path')
var fs = require('fs')


function p1(resolve,reject){
  var pathName = path.resolve(__dirname,'../docs')
  var dirs = [];
  fs.readdir(pathName,function(err,files){
    for(let i=0;i<files.length;i++){
      dirs.push(path.join(pathName,files[i]))
    }
    resolve(dirs)
  })
}
var getFileList = function(){
  return new Promise(p1);
} 

module.exports = {
  getFileList
}