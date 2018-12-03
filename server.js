var SerialPort = require("serialport");  //引入模块
//var portName = 'COM3'; //定义串口名
const express = require('express');
const WebSocket = require('ws');
const app = express();
const mysql = require('mysql');

var name;
var tem;
var hum;
var time;
var flag = true;

var mysqlInfo = {
  host: '120.79.192.19',
  user:'root',
  password:'',
  database: 'temperature_humidity',
  useConnectionPooling: true
}

app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
  res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
  res.header("X-Powered-By",' 3.2.1')
  if(req.method=="OPTIONS") res.send(200);/*让options请求快速返回*/
  else  next();
});

var connection = mysql.createConnection(mysqlInfo);
connection.connect();
connection.on('error', function (err) {
  if (err) {
    // 如果是连接断开，自动重新连接
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      connect();
    } else {
      console.error(err.stack || err);
    }
  }
});

var serialPort = new SerialPort(
 "COM3", {
   baudRate: 9600,  //波特率
   autoOpen:false
}); 

function serialPortopen(ws) {
  serialPort.open(function(error){ 
    if(error){ 
      console.log("打开端口COM3错误："+error);
    }else{  
      console.log("打开端口成功，正在监听数据中");
      serialPort.on('data',function(data){
          let dataInfo = data.toString().trim();
           name = dataInfo.charAt('0').trim();
          let temSign = dataInfo.indexOf('T'); //T出现的下标
          let cSign = dataInfo.indexOf('C'); //第一个C符号出现的下标
          let lastColon =  dataInfo.lastIndexOf(":");//最后一个冒号出现的下标
           tem = dataInfo.substring(temSign+2,cSign+1).trim();
           hum = dataInfo.substring(lastColon+1).trim();
          console.log(name, tem, hum);
          sendToClient(ws)
          insertDataToMysql(name, tem, hum);
         })
    }
 })
}

const wss = new WebSocket.Server({ port: 7009 });

wss.on('connection', function connection(ws, req) {
     ws.on('message', function incoming(message) { 
      if(flag) {
      serialPortopen(ws);   
        flag = false;
      }
    });
});

var sendToClient = function(ws) {
  let d = new Date();
  time = d.getFullYear() + "-" +(d.getMonth()+1) + "-" 
              + d.getDate() + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds(); 
  let obj = {
    name: name,
    tem: tem,
    hum: hum,
    time:time
  }

  ws.send(JSON.stringify(obj));
}

//将数据送往mysql
var insertDataToMysql = function(name, tem, hum) {
  let d = new Date();
  let time = d.getFullYear() + "-" +(d.getMonth()+1) + "-" 
                + d.getDate() + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds(); 
  let sql = `insert into tem_hum_table(name, tem, hum, time) values ('${name}', '${tem}', '${hum}', '${time}')`;

  connection.query(sql, ( err, result) => {
    if ( err ) {
       console.log('error', err);
    } else {
     
    }
  })
}

async function query(sql) {
  return await new Promise((resolve, reject) => {
      connection.query(sql, ( err, result) => {
          if ( err ) {
              reject( err )
          } else {
             resolve(result);
             //console.log("r", result);
          }
      })  
  })
} 

app.get('/getAllData/:name', function (req, res) {
  let name = req.params.name;
  let sql = `select * from tem_hum_table where name='${name}'`;
  let data = query(sql)
  data.then(function(result) {
    res.status = 200;
    res.send({
      data:result
    });
  })
});

app.listen(8081, function listening() {
  console.log('Listening');
});

