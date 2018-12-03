<template>
   <div id="ap">
       <!-- <img src="./assets/40.png" alt=""> -->
        <div id="mainA"></div>  
        <div id="mainB"></div> 
   </div>
</template>
<script>
// 绘制图表
export default {
  //  app.title = '多 X 轴示例';
    data () {
        return {
            AtemYList:[],
            AhumYList:[],
            AtimeList:[],
            BtemYList:[],
            BhumYList:[],
            BtimeList:[]
        }
    },
    mounted: function() {
         
          this.getAllDatas('A')
          this.getAllDatas('B');
        
           var _this = this;

    
            // _this.connectionServer();
    
   
    },

    methods: {
        connectionServer: function() {
            var _this = this;
            var ws = new WebSocket("ws://localhost:7009");

            ws.onopen = function (e) {
                
                ws.send("hello")
            }
            ws.onmessage = function(event) {                
                let data = JSON.parse(event.data);
                let name = data.name;
                //console.log("X", name);
                _this[name+"temYList"].push(parseInt(data.tem));
                _this[name+"humYList"].push(parseInt(data.hum));
                _this[name+"timeList"].push(data.time);

                _this.showChart(name);
            }; 
        },
        dealData: function(name, datas) {
               let newDatas = JSON.parse(datas).data;
               this[name+"temYList"] = newDatas.map(function(data) {
                   return parseInt(data.tem);
               });
                this[name+"humYList"] = newDatas.map(function(data) {
                   return parseInt(data.hum);
               });
                this[name+"timeList"] = newDatas.map(function(data) {

                   return data.time;
               });
           
            this.showChart(name);
        },
        getAllDatas:  function(name) {
            let _this = this;
           fetch(`http://localhost:8081/getAllData/${name}`).then(function(response) {
               return response.text();
           }).then(function(result) {
              // console.log("-----------------------------", name);
               _this.dealData(name, result);
           }).catch(function(error) {
               console.log('error', error);
           })
        },
        showChart: function(name) {
            var _this = this; 
            var myChart = this.$echarts.init(document.getElementById('main'+name));
            var colors = ['#5793f3', '#d14a61'];         
            let option = {
    
                        tooltip: {
                            trigger: 'axis'
                        },
                        color: ["#FF0000", "#00BFFF"],
                        legend: {
                            data: ['温度', '湿度']
                        },
                        grid: {

                            containLabel: true
                        },
                        toolbox: {
                            feature: {
                                saveAsImage: {}
                            }
                        },
                        xAxis: {
                            type: 'category',
                            boundaryGap: false,
                            data: _this[name+"timeList"]
                        },
                        yAxis: [{
                            type: 'value',
                            axisLabel: {
                                formatter: '{value} '
                            },
                            min: 0,
                            max: 100,
                            splitLine:{
                            　　show:false
                            },
                        }],

                        series: [{
                            name: '温度',
                            type: 'line',
                            lineStyle: {
                                normal: {
                                    width: 2,
                                }
                            },
                            data: _this[name+"temYList"]
                        }, {
                            name: '湿度',
                            type: 'line',
                            lineStyle: {
                                normal: {
                                    width: 2,
                                }
                            },
                            data:_this[name+"humYList"]
                        }]
            }
            myChart.setOption(option, true);
        }
    }
}
</script>
<style>
#ap{
    background: url(./assets/40.jpg) no-repeat;
    background-size: cover;
} 
#mainA{
    width: 1500px;
    height: 300px;
 
   
}
#mainB{
    
    width: 1500px;
    height: 300px;
   
}

</style>


