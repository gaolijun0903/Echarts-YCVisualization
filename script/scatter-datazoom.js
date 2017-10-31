/**
 * Created by Administrator on 2017/3/9 0009.
 */
var starMap  = echarts.init(document.getElementById('starMap'));
var timeLine = echarts.init(document.getElementById('timeLine'));
var $timer = $('#timer'),
	$danmuUl = $('#slade_div ul');
var chinaMap = null;

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
$('div.show_opt').hide();//弹幕开关
$('div.slade_div').hide();
$.ajax({
    url:'http://10.0.11.201:8899/start/coords/todaychinabytsorigin',
    method:'get'
}).done(function (result) {
    var result = JSON.parse(result);
    var length = result.length;
    var allDatas = allDataFormatter(result);
    var halfhourDatas = halfhourDataFormatter(allDatas);
    var zoomData = zoomDataFormatter(0,2,halfhourDatas);
    
    $.get('data/china.json',function (chinaJson) {
        initMap('china',chinaJson, zoomData);//初始化地图
    });
    
    var lineData = lineDataFormatter(result);
    initTimeLine(lineData);//初始化折线图
    
    //弹幕
	$.ajax({
	    url: 'http://10.0.11.201:8899/keyword/stats',
	    type: 'get',
	    success: function(data) {
	    	$('div.slade_div').show();
			var canvas=document.getElementById('canvas');
			var ctx=canvas.getContext("2d");
			var w = $('#slade_div').width();
			var h = $('#slade_div').height();
			var textArr = data;
			console.log(data);
			canvas.width = w;
			canvas.height = h;
			ctx.font = "20px Courier New";
			var cOption = getRandomOption(textArr.length,w,h);
			console.log(cOption);
			
			clearInterval(danmuTimer);
			var danmuTimer = setInterval(danmuTimerFn,30);
			function danmuTimerFn(){
			    //清理一下canvas画布
			    ctx.clearRect(0,0,canvas.width,canvas.height);
			    ctx.save();
			   	//设置颜色和速度
			    for(var j=0;j<textArr.length;j++){
			    	cOption.left[j]-=(j+1)*0.6;
			    	ctx.fillStyle = cOption.color[j]; 
			        ctx.fillText(textArr[j][0],cOption.left[j],cOption.top[j]);
			        //循环出现
			        if(cOption.left[j]<=-500){
			            cOption.left[j]=canvas.width;
			        }
			    }
			    ctx.restore();
			}
	    },
	    error: function(e) {
	        alert(e);
	    }
	});
	//弹幕开关
	
	$('a.close_opt,div.show_opt').click(function(){
		$('div.slade_div').toggle('slow');
	});
	$('a.close_opt').click(function(){
		$('div.show_opt').show();
	});
	$('div.show_opt').click(function(){
		$(this).hide();
	});
	    
    function allDataFormatter(result){
    	var newData = [];
	    for(var i=0;i<result.length;i++){
	    	var ts=result[i].TS;
	        var temp=result[i].Point;
	        var tempLength=temp.length;
	        var tempDatas=[];
	        for(var j=0;j<tempLength;j++){
	            var lls=temp[j][0].split(',');
	            var current=[Number(lls[0])/1000,Number(lls[1])/1000,temp[j][1],ts];
	            tempDatas.push(current);
	        }
	        newData.push(tempDatas);
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
    
    function zoomDataFormatter(s,e,allDatas){
    	var currentDatas = [];
    	for(var i=s;i<e;i++){
    		currentDatas = currentDatas.concat(allDatas[i]);
    	}
    	//排序
        var sortedDatas = currentDatas.sort(function (a,b) {
            return b[2]-a[2];
        });
        
        var newData = [[],[],[]];
        var len=sortedDatas.length;
        for(var j=0;j<len;j++){
            if(j<len/5){
                newData[0].push(sortedDatas[j]);
            }else if(j>len/2){
                newData[2].push(sortedDatas[j]);
            }else{
                newData[1].push(sortedDatas[j]);
            }
        }
        return newData;
    }
            
	function lineDataFormatter(result){
    	var newData = {xData:[],yData:[]};
    	for(var i=0;i<result.length;i++){
			var tempTime = new Date(result[i].TS*1000);
			var myTime   = tempTime.format('hh:mm:ss');
		    newData.xData.push(myTime);
		    newData.yData.push(result[i].Point.length);
		}
    	return newData;
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
    	
    	var sIdx  = timeLine._model.option.dataZoom[0].startValue,
    		eIdx  = timeLine._model.option.dataZoom[0].endValue;
	   	zoomData = zoomDataFormatter(sIdx,eIdx,allDatas);
	   	updateMap(zoomData);
	});
    
    var mapOption;
    function initMap(type,chinaJson,data){
    	chinaMap=chinaJson;
        echarts.registerMap(type,chinaJson);
        mapOption = {
            //backgroundColor: '#404a59',
            title : {
                text: '',
                left: 'center',
                top: 'top',
                textStyle: {
                    color: '#fff'
                }
            },
            animation:false,
            tooltip: {},
            // legend: {
            //     left: 'left',
            //     data: ['强', '中', '弱'],
            //     textStyle: {
            //         color: '#ccc'
            //     }
            // },
            geo: {
                name: '强',
                type: 'scatter',
                map: 'china',
                label: {
                    emphasis: {
                        show: false
                    }
                },
                itemStyle: {
                    normal: {
                        areaColor: '#323c48',
                        borderColor: '#111'
                    },
                    emphasis: {
                        areaColor: '#2a333d'
                    }
                }
            },
            series: [
                {
                    name: '弱',
                    type: 'scatter',
                    coordinateSystem: 'geo',
                    symbolSize: 2,
                    large: true,
                    itemStyle: {
                        normal: {
                            shadowBlur: 3,
                            shadowColor: 'rgba(37, 140, 249, 0.8)',
                            color: 'rgba(37, 140, 249, 0.8)'
                        }
                    },
                    data: data[2]
                },
                {
                    name: '中',
                    type: 'scatter',
                    coordinateSystem: 'geo',
                    symbolSize: 2,
                    large: true,
                    itemStyle: {
                        normal: {
                            shadowBlur: 3,
                            shadowColor: 'rgba(14, 241, 242, 0.8)',
                            color: 'rgba(14, 241, 242, 0.8)'
                        }
                    },
                    data: data[1]
                },
                {
                    name: '强',
                    type: 'scatter',
                    coordinateSystem: 'geo',
                    symbolSize: 2,
                    large: true,
                    itemStyle: {
                        normal: {
                            shadowBlur: 3,
                            shadowColor: 'rgba(255, 255, 255, 0.8)',
                            color: 'rgba(255, 255, 255, 0.8)'
                        }
                    },
                    data: data[0]
                }
            ]
        }
        starMap.clear();
        starMap.setOption(mapOption);
        
    }
    
    function updateMap(data){
    	starMap.clear();
    	mapOption.series[0].data = data[2];
    	mapOption.series[1].data = data[1];
    	mapOption.series[2].data = data[0];
    	starMap.setOption(mapOption);
    }
    
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
		if(eIdx < halfhourDatas.length){
			sIdx ++;
			eIdx ++;
		}else{
			sIdx = 0;
			eIdx = 2;
		}
	    timerPoints = zoomDataFormatter(sIdx,eIdx,halfhourDatas);
	    updateMap(timerPoints);
	    updateTimeLine(sIdx,eIdx);
	}
	
	
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
});
