var fs = require('fs')
var path = require('path')
var mammoth = require("mammoth");
var { getFileList } = require('./src/utils/getFileList')


getFileList().then(function(fileList){

  fileList.forEach((item,index) => {
    mammoth.convertToHtml({path: item}).then(function(result){
      let pathname = item.split('/')
      let filename = pathname[pathname.length-1].split(',')
      let publishTime = filename[0].replace(/-/g,'/')
      let newsTitle = filename[1].replace('.docx','')
      var html = result.value; // The generated HTML

      console.log('publishTime,newsTitle ', publishTime,newsTitle)
      console.log('html ',html)
      fs.writeFile(path.resolve(__dirname, `./src/html/${index}-${publishTime}.html`), html, res => {
        console.log('html文件写入成功：');
      });
      
      let json = {
        newsTitle: newsTitle, // 新闻标题
        publishTime: publishTime, // 发布时间 2021/9/17
        summary: '', // 摘要
        newsContent: html, // 正文
        imageUrl: '', // 封面
        hotImageUrl: '',
        lang: 'cn',
        channelAgentId: 2,
        hotLabel: 0,
        status: 1,
      }
      fs.writeFile(path.resolve(__dirname, `./src/json/${index}-${publishTime}.json`), JSON.stringify(json), res => {
        console.log('json文件写入成功：');
      });
    }).done();

  });


})





 
