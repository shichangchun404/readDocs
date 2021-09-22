var fs = require('fs')
var path = require('path')
const axios = require('axios')
var mammoth = require("mammoth");
const cheerio = require('cheerio');
const qs = require('qs')
const FormData = require('form-data')

const postNewsApi = 'http://portal-system.jdcloud.com/news/addNews' //'http://portal-system-test2.jdcloud.com/news/addNews'

getFileList().then(function(fileList){
  console.log('文章篇数 ', fileList.length)
  fileList.forEach((item,index) => {
    if (index>4)  return
    mammoth.convertToHtml({path: item}).then(function(result){
      let pathname = item.split('/')
      let filename = pathname[pathname.length-1].split(',')
      let publishTime = filename[0].replace(/-/g,'/')
      let newsTitle = filename[1].replace('.docx','')
      var html = result.value; // The generated HTML
     
      // fs.writeFileSync(path.resolve(__dirname, `./src/html/${index}.html`), html);
      var imageNameList = getImagesUrlList(html)
      var htmlStr = replaceBase64ToUrl(html,imageNameList)
      //console.log('htmlStr ',htmlStr)

      fs.writeFile(path.resolve(__dirname, `./src/html/${filename}.html`), html, res => {
        console.log('html文件写入成功：');
      });
      if (!imageNameList[0]) {
        console.log('+++++++ 文章无封面：', filename);
      } else {

      }

      let json = {
        newsTitle: newsTitle, // 新闻标题
        publishTime: publishTime, // 发布时间 2021/9/17
        summary: '', // 摘要
        newsContent: htmlStr, // 正文
        imageUrl: imageNameList[0], // 封面
        hotImageUrl: imageNameList[0],
        lang: 'cn',
        channelAgentId: 2,
        hotLabel: 0,
        status: 1,
      }
     
      axios.post(postNewsApi, qs.stringify(json))
      .then(res => {
        console.log(`表单提交结果 `, res.data)
        if (res.data.result) {
          fs.writeFile(path.resolve(__dirname, `./src/json/${res.data.result}.json`), JSON.stringify(json), res => {
            console.log('json文件写入成功：');
          });
        }
      })
      .catch(error => {
        console.error(error)
      })
    }).done();
  });
})

function getFileList(){
  return new Promise((resolve,reject) => {
    var pathName = path.resolve(__dirname,'./src/docs')
    var dirs = [];
    fs.readdir(pathName,function(err,files){
      for(let i=0;i<files.length;i++){
        if (files[i].includes('.docx')) {
          dirs.push(path.join(pathName,files[i]))
        }
      }
      resolve(dirs)
    })
  });
} 

function replaceImage64(html,index){
  let $ = cheerio.load(html)
  var imageArr = $('img')||[]
  let arr = getImagesUrlList(imageArr)
  console.log(arr)
  var str = $('img')[0].attribs.src
  console.log('str = ',str)
  var base64Data =  str.replace(/^data:image\/jpeg;base64,/, "");
  var imageName = new Date().getTime()
  let imagePath = path.resolve(__dirname, `./src/images/${imageName}.jpeg`)
  fs.writeFileSync(imagePath, base64Data, 'base64', )
  return `https://img1.jcloudcs.com/portal/news/cover/${imageName}.jpeg`

  fs.writeFile(imagePath, base64Data, 'base64', function(err) {
    console.log('图片文件文件写入成功：');
    fs.readFile(imagePath, "binary", async (err,data) => {
      if(err){
        console.log('内容无图片：',err);
        return;
      }else {
        const fileContent = Buffer.from(data, "binary");
        let formData = new FormData();
        formData.append('file', fileContent, {
          filename: index,
          contentType:'multipart/form-data',
          knownLength: fileContent.byteLength,
        });
        const formHeaders = formData.getHeaders();
        axios({
          url: postImageApi,
          method: 'post',
          data: formData,
          headers: {
            ...formHeaders,
          },
        })
        //axios.post(postImageApi, formData, { headers: formHeaders })
        .then(res => {
          console.log(`图片提交结果 `, res.data)
        })
        .catch(error => {
          console.error(error)
        })

      }
    })
  });
}

function getImagesUrlList(html){
  let $ = cheerio.load(html)
  var arr = $('img')||[]
  var imageUrlArr = []
  for(let i = 0; i<arr.length;i++){
    var str = arr[i].attribs.src
    let baseUrl = 'https://img1.jcloudcs.com/portal/news/cover/'
    let url = ''
    if (str.includes('image/jpeg;')) {
      var base64Data =  str.replace(/^data:image\/jpeg;base64,/, "");
      var imageName = new Date().getTime()
      let imagePath = path.resolve(__dirname, `./src/images/${imageName}.jpeg`)
      fs.writeFileSync(imagePath, base64Data, 'base64', )
      url = `${baseUrl}${imageName}.jpeg`
    } else if(str.includes('image/png;')){
      var base64Data =  str.replace(/^data:image\/png;base64,/, "");
      var imageName = new Date().getTime()
      let imagePath = path.resolve(__dirname, `./src/images/${imageName}.png`)
      fs.writeFileSync(imagePath, base64Data, 'base64', )
      url = `${baseUrl}${imageName}.png`
    }
    
    imageUrlArr.push(url)
  }
  return imageUrlArr
}

function replaceBase64ToUrl(html,imageUrlArr){
  let $ = cheerio.load(`<div id="htmlbox">${html}</div>`)
  $('img').each(function(i,item){
    $(this).attr("src", imageUrlArr[i]);
  })
  return $.html("#htmlbox")
}

function deleteNews(){
  ///portal-system/news/deleteNews?id=974&status=1&hotLabel=0&erp=shizhangchun
}




 
