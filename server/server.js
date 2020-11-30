var 
   http = require('http'),
   url = require('url'),
   fs = require('fs'),
   querystring = require('querystring');

var server= http.createServer(function(request, response){
    var urls= request.url;
    var params = url.parse(urls, true).query;
    var route  = (urls.indexOf("?") > -1) ? urls.substr(0, urls.indexOf("?")) : urls
    var body = ''

    switch (route) {
        case '/':
            fs.readFile('./index.html',function(err, data){
                if(!err){
                    response.writeHead(200, {"Content-Type": "text/html;charset=UTF-8"});
                    response.end(data);
                }else{
                    throw err;
                }
            })
            break;
        case '/api/index':
            fs.readFile('./data/index.json', 'utf-8', function(err, data){
                if(!err){
                    response.writeHead(200, {"Content-Type": "text/json;charset=UTF-8"});
                    // console.log(data)
                    response.end(data);
                    
                } else {
                    throw err;
                }
            })
            break;
        case '/api/abumInfo':
            fs.readFile('./data/abumInfo.json', 'UTF-8', function(err, data){
                if(!err){
                    
                    response.writeHead(200, {"Content-Type": "text/json;charset=UTF-8"});
                    let res = JSON.parse(data)
                    if (res && res.length) {
                        let playData = res.filter(item => item.id === Number(params.id))[0]
                        playData.data = params && params.pageNo ? playData.data.splice((params.pageNo -1) * 10, params.pageSize) : playData.data
                        response.end(JSON.stringify(playData)); 
                    } else {
                        res.data = params && params.pageNo ? res.data.splice((params.pageNo -1) * 10, params.pageSize) : res.data
                        response.end(JSON.stringify(res));   
                    }
                }else{
                    throw err;
                }
            })
            break;
    
        default:
            console.log("err");
            break;
    }
    
});
server.listen(5000);   
console.log("server is running at http://127.0.0.1:5000");