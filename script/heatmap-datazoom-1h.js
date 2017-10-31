/**
 * Created by Administrator on 2017/3/9 0009.
 */
Date.prototype.format = function(format) {
    var date = {
        "M+": this.getMonth() + 1,
        "d+": this.getDate(),
        "h+": this.getHours(),
        "m+": this.getMinutes(),
        "s+": this.getSeconds(),
        "q+": Math.floor((this.getMonth() + 3) / 3),
        "S+": this.getMilliseconds()
    };
    if (/(y+)/i.test(format)) {
        format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    for (var k in date) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1
                ? date[k] : ("00" + date[k]).substr(("" + date[k]).length));
        }
    }
    return format;
};

var heatMap = echarts.init(document.getElementById('heatMap'));
var timeLine = echarts.init(document.getElementById('timeLine'));
var $timer = $('#timer');
var center=null;
var zoom=12;
//var map = new BMap.Map("content");
function initData(city) {
    $.ajax({
        url:'http://10.0.11.201:8899/start/coords/todaycity?city='+city,
        method:'get'
    }).done(function (result) {
        heatMap.clear();
        
        var center     = result.center,
        	datacoords = result.coords;
       	var length     = datacoords.length;
        
        var lineData = lineDataFormatter(datacoords);
        initTimeLine(lineData);//初始化折线图
                
        var allPoints = allDataFormatter(datacoords);
        var halfhourPoints = halfhourDataFormatter(allPoints);
        var timerPoints = timerZoomDataFormatter(0,2,halfhourPoints);
        initMap(timerPoints);//初始化地图
//      console.log('halfhourPoints');
//      console.log(halfhourPoints);
//      console.log('timerPoints');
//      console.log(timerPoints);
        
        
        function lineDataFormatter(data){
        	var newData = {xData:[],yData:[]};
        	for(var i=0;i<length;i++){
	        	var tempTime = new Date(data[i][0].timestamp*1000);
	        	var myTime   = tempTime.format('hh:mm:ss');
	            newData.xData.push(myTime);
	            newData.yData.push(data[i].length);
	        }
        	return newData;
        }
        
        function allDataFormatter(data){
        	var newData = [];
        	for( var j=0;j<data.length;j++){
		   		newData[j] = data[j].map(function (item) {
	                return [item.coord[0],item.coord[1], 1,item.timestamp]
	            })
		   	}
        	return newData;
        }
        
        function halfhourDataFormatter(data){
        	var newData = [];
        	for(var i=0;i<data.length;i+=60){
	        	var arr =[];
	        	for(var j=0;j<60;j++){
	        		arr = arr.concat(data[i+j])
	        	}
	        	newData.push(arr);
			}
        	return newData;
        }
        
        function timerZoomDataFormatter(s,e,data){
        	var newData = [];
        	for( var i=s;i<e;i++){
                newData=newData.concat(data[i]);
		   	}
        	return newData;
        }
		
		
        var mapOption;
        function initMap(data) {
        	mapOption={
                animation: false,
                bmap: {
                    center: center,
                    zoom: zoom,
                    roam: true
                },
                visualMap: {
                    show: false,
                    top: 'top',
                    min: 0,
                    max: 5,
                    seriesIndex: 0,
                    calculable: true,
                    inRange: {
                        color: ['blue', 'blue', 'green', 'yellow', 'red']
                    }
                },
                series: [{
                    type: 'heatmap',
                    coordinateSystem: 'bmap',
                    data: data,
                    pointSize: 5,
                    blurSize: 6
                }]
            }
        	heatMap.setOption(mapOption);
        }
        
        function updateMap(data){
        	mapOption.series[0].data = data;
        	heatMap.setOption(mapOption);
        }
        
        var timeLineOption;
        function initTimeLine(data) {
            timeLineOption = {
            	backgroundColor: '#E0E0E0',
            	grid:{
                    y:40,
                },
                dataZoom: [
			        {
			            show: true,
			            startValue: 0,
			            endValue: 120,
			            throttle:100
			        }
			    ],
                xAxis: {
                    type: 'category',
                    splitLine: {
                        show: false
                    },
                    data:data.xData,
                    boundaryGap:false
//                  show:false
                },
                yAxis: {
                    type: 'value',
                    splitLine: {
                        show: false
                    },
                    boundaryGap:false,
                    show:false
                },
                series: [
                    {
                        name:'最高气温',
                        type:'line',
                        data:data.yData,
                        itemStyle:{
                            normal:{
                                color:'#00CD9A'
                            }
                        }
                    }
                ]
            };
            timeLine.setOption(timeLineOption);
        }
        
        function updateTimeLine(s,e){
        	timeLineOption.dataZoom[0].startValue = s*60;
        	timeLineOption.dataZoom[0].endValue = e*60;
        	timeLine.setOption(timeLineOption);
        }
        
        timeLine.on('datazoom', function (params) {
        	//暂停定时器，显示开始
        	clearInterval(timer);
        	$timer.text('开始');
        	var o = myChart.getOption();
        	var sIdx  = o.dataZoom[0].startValue,
        		eIdx  = o.dataZoom[0].endValue,
        		newPoints = [];
	   		for( var i=sIdx;i<eIdx;i++){
                newPoints=newPoints.concat(allPoints[i]);
		   	}
		   	updateMap(newPoints);
		});
		
		$timer.on("click",function(){
			var t = $(this).text();
			if(t =="开始"){
				$(this).text("暂停");
				timer = setInterval(timerFn, 1000);
			}else{
				$(this).text("开始");
				clearInterval(timer);
			}
		});
		
		clearInterval(timer);
		var sIdx = 0,eIdx = 2;
		var timer = setInterval(timerFn, 1000);
		function timerFn() {
			if(eIdx < halfhourPoints.length){
				sIdx ++;
				eIdx ++;
			}else{
				sIdx = 0;
				eIdx = 2;
			}
		    timerPoints = timerZoomDataFormatter(sIdx,eIdx,halfhourPoints);
		    updateMap(timerPoints);
		    updateTimeLine(sIdx,eIdx);
		}
		
       
    }).fail(function (error) {
        console.log(error);
    })
}


function circleInitData(city) {
    initData(city);
}

circleInitData('bj');

