var http = require('http');
var url = require('url');
var MongoClient = require('mongodb').MongoClient;
let connStr = "mongodb://mongo-db:27017/dockerExpress";

var server = http.createServer(function (req, res) {
	MongoClient.connect(connStr,function(err,db){
	if(err) throw err;
	   //console.log(connStr);
	   res.writeHead(200, {'Content-Type': 'text/html'});
	   res.write('<head><meta charset="utf-8"/><title>阿本 docker hw</title></head>');
	   if(req.url=='/'){
				
			db.collection('accessTime').insertOne({
				id: UUID(),
				time:Date.now(),
				timeStr: new Date().toLocaleString()
			});
			
			db.collection("accessTime").find().sort({time:1}).toArray(function(err, result) {
				if (err) throw err;
				let htmlStr = "歷史存取此頁面時間:<br> (寫進db&讀出來)<br><br>"
				htmlStr += result.map(function(item){
					return item.timeStr+"　<a href='/delete?id="+item.id+"'>刪除</a>";
				}).join("<br>")
				if(result.length>10){
					htmlStr += "<br><br><br>或者妳很快就發現 刪一筆回首頁的同時也增加一筆!?<br>不如...<a href='/delete'>全刪了</a><br>(這兩行超過十筆才會出現)";
				}
				res.write(htmlStr);
				res.end();
			});
	   }else if (req.url.indexOf('/delete')!=-1){
		   let deleteId = url.parse(req.url, true).query.id;
		   let queryObj = {};
		   let displayStr = "";
		   if(deleteId!=null){
			   queryObj.id=deleteId;
			   displayStr ="id: "+deleteId;
		   }
			db.collection('accessTime').remove(queryObj, function(err, obj) {
				if (err) throw err;  
				res.write("已刪除"+(obj.result.n)+"筆資料 "+displayStr);
				res.write("<br><a href='/'>回首頁</a>");
				res.end();
			});
			
	   }else{
		   res.write("雖然不知道妳為什麼在這裡，不過 <a href='/'>回首頁</a> 去吧？");
		   res.end();
	   }
	 
	});
});

function UUID(){
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
	    return v.toString(16);
	});
}

let port = 3000;
server.listen(port);
console.log("Node.js web server at port " + port + " is running..");
