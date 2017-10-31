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
var $timer = $('#timer'),
	$danmuUl = $('#slade_div ul');
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
        console.log(lineData);
                
        var allPoints = allDataFormatter(datacoords);
        var halfhourPoints = halfhourDataFormatter(allPoints);
        var timerPoints = timerZoomDataFormatter(0,2,halfhourPoints);
        initMap(timerPoints);//初始化地图
//      console.log('halfhourPoints');
//      console.log(halfhourPoints);
//      console.log('timerPoints');
//      console.log(timerPoints);


   //弹幕
//	$.ajax({
//	    url: 'http://10.0.11.201:8899/keyword/stats',
//	    type: 'get',
//	    success: function(data) {
//			var canvas=document.getElementById('canvas');
//			var ctx=canvas.getContext("2d");
//			var w = $('#slade_div').width();
//			var h = $('#slade_div').height();
//			var textArr = data;
//			console.log(data);
//			canvas.width = w;
//			canvas.height = h;
//			ctx.font = "20px Courier New";
//			var cOption = getRandomOption(textArr.length,w,h);
//			console.log(cOption);
//			
//			clearInterval(danmuTimer);
//			var danmuTimer = setInterval(danmuTimerFn,30);
//			function danmuTimerFn(){
//			    //清理一下canvas画布
//			    ctx.clearRect(0,0,canvas.width,canvas.height);
//			    ctx.save();
//			   	//设置颜色和速度
//			    for(var j=0;j<textArr.length;j++){
//			    	cOption.left[j]-=(j+1)*0.6;
//			    	ctx.fillStyle = cOption.color[j]; 
//			        ctx.fillText(textArr[j][0],cOption.left[j],cOption.top[j]);
//			        //循环出现
//			        if(cOption.left[j]<=-500){
//			            cOption.left[j]=canvas.width;
//			        }
//			    }
//			    ctx.restore();
//			}
//			
//			$('a.close_opt,div.show_opt').click(function(){
//				$('div.slade_div').toggle('slow');
//			});
//			
//	    },
//	    error: function(e) {
//	        alert(e);
//	    }
//	});
	    
        
        
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
		
		//热力图相关方法---start
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
        //热力图相关方法---end
        
        //折线图相关方法-------start
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
//      	timeLineOption.dataZoom[0].startValue = s*60;
//      	timeLineOption.dataZoom[0].endValue = e*60;
        	timeLineOption.dataZoom[0].startValue = s;
        	timeLineOption.dataZoom[0].endValue = e;
        	timeLine.setOption(timeLineOption);
        }
        
        timeLine.on('datazoom', function (params) {
        	//暂停定时器，显示开始
        	clearInterval(timer);
        	$timer.text('开始');
        	
        	var sIdx  = timeLine._model.option.dataZoom[0].startValue,
        		eIdx  = timeLine._model.option.dataZoom[0].endValue,
        		newPoints = [];
	   		for( var i=sIdx;i<eIdx;i++){
                newPoints=newPoints.concat(allPoints[i]);
		   	}
		   	updateMap(newPoints);
		});
		//折线图相关方法-------end
		
		//自动播放相关方法------start
		$timer.on("click",function(){
			var t = $(this).text();
			console.log(t);
			if(t =="开始"){
				$(this).text("暂停");
				timer = setInterval(timerFn, 10);
			}else{
				$(this).text("开始");
				clearInterval(timer);
			}
		});
		
		clearInterval(timer);
		
		var sIdx = 0,eIdx = 120;
		var timer = setInterval(timerFn, 10);
		function timerFn() {
			if(eIdx < allPoints.length){
				sIdx ++;
				eIdx ++;
			}else{
				sIdx = 0;
				eIdx = 120;
			}
			var newPoints = [];
		    for( var i=sIdx;i<eIdx;i++){
                newPoints=newPoints.concat(allPoints[i]);
		   	}
		   	updateMap(newPoints);
		   	
		    updateTimeLine(sIdx,eIdx);
		}
		//自动播放相关方法------end
		
		//弹幕相关方法--------start	
		//获取随机颜色
		function getRandomColor(){
			var arr = ['4','5','6','7','8','9','a','b','c','d','e','f'];
			var cVal = '#';
			for(var i=0;i<6;i++){
				var index = Math.ceil(Math.random()*arr.length) - 1;
				cVal += arr[index];
			}
			return cVal;
		}
		//生成配置项随机数组
		function getRandomOption(len,w,h){
			var option = {left:[],top:[],color:[]};
			for(var i=0; i<len; i++){
				option.left.push(Math.ceil(Math.random()*500+w));
				option.top.push(Math.ceil(Math.random()*(h-30)+20));
				option.color.push(getRandomColor());
			}  
			return option;
		}
		//弹幕相关方法---------end


		
       
    }).fail(function (error) {
        console.log(error);
    })
}


function circleInitData(city) {
    initData(city);
}

circleInitData('bj');

