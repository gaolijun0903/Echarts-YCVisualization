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
var timeInterval=null;
var heatMap=echarts.init(document.getElementById('heatMap'));
var timeLine=echarts.init(document.getElementById('timeLine'));
var i=0;
var center=null;
var zoom=12;
//var map = new BMap.Map("content");
function initData(city) {
    $.ajax({
        url:'http://10.0.11.201:8899/start/coords/todaycity?city='+city,
        method:'get'
    }).done(function (result) {
    	console.log('result');
    	console.log(result);
    	
        heatMap.clear();
        var temp=result;
        center=temp.center;
        var data=temp.coords;
        var length=data.length;
        var allPoints=[];
        var lineData={xData:[],yData:[]};
        for(var i=0;i<length;i++){
            lineData.xData.push(data[i][0].timestamp);
            lineData.yData.push(data[i].length);
        }
        console.log('lineData');
        console.log(lineData);
        i=0;
        initTimeLine(lineData);
        addIntervalTime();
        function initCurrentTime(timeStamp) {
            var tempTime=new Date(timeStamp*1000);
            //console.log(timeStamp);
            var currentTime=tempTime.format('yyyy年MM月dd日 hh:mm:ss');
            //console.log(currentTime);
            $('#currentTime').text(currentTime);
        }
        function initMap(data) {
            //heatMap.clear();
            heatMap.setOption(option = {
                animation: false,
                bmap: {
                    center: center,
                    zoom: zoom,
                    roam: true,
                    // mapStyle:{
                    //     styleJson: [
                    //         {
                    //             'featureType': 'land',     //调整土地颜色
                    //             'elementType': 'geometry',
                    //             'stylers': {
                    //                 'color': '#515151'
                    //             }
                    //         },
                    //     ]
                    // }
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
            });
        }
        
        function initTimeLine(data) {
            var option = {
                // tooltip: {
                //     trigger: 'item',
                //     //formatter:'{c0}'
                // },
                grid:{
                    x:40,
                    y:40,
                    x2:10,
                    y2:10
                },
                xAxis: {
                    type: 'category',
                    splitLine: {
                        show: false
                    },
                    data:data.xData,
                    boundaryGap:false,
                    show:false
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
                        // markPoint: {
                        //     symbol:'bin',
                        //     symbolSize:10,
                        //     data:{
                        //         x:data.xData[i],
                        //         y:data.yData[i]
                        //         }
                        // },
                        itemStyle:{
                            normal:{
                                color:'#00CD9A'
                            }
                        }
                    }
                ]
            };
            timeLine.setOption(option);
        }
        window.start=function () {
            console.log(i);
            //console.log(zoom);
            //console.log(center);
            addIntervalTime();
        };
        window.stop=function() {
            clearInterval(timeInterval);
            zoom=option.bmap.zoom;
            center=option.bmap.center;
            console.log(i);
            //console.log(zoom);
            //console.log(center);
        }
        window.speed=function () {
            clearInterval(timeInterval);
            heatMap.clear();
            allPoints=[];
            if(i+60<length){
                i=i+60;
            }
            console.log(i);
            addIntervalTime();
            //console.log('point length is : '+allPoints.length)
        }
        function addIntervalTime() {
            timeInterval=setInterval(function () {
                if(i<length){
                    var points=[].concat(data[i].map(function (item) {
                        return [item.coord[0],item.coord[1], 1]
                    }));
                    initCurrentTime(data[i][0].timestamp);
                    //console.log(points);
                    allPoints=allPoints.concat(points);
                    //console.log('point length is : '+points.length)
                    //console.log('allPoint length is : '+allPoints.length)
                    initMap(allPoints);
                }else{
                    clearInterval(timeInterval);
                }
                i++;
            },2000);
        }
    }).fail(function (error) {
        console.log(error);
    })
}

function circleInitData(city) {
    clearInterval(timeInterval);
    i=0;
    initData(city);
}


circleInitData('bj');