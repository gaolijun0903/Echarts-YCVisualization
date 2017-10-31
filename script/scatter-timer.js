/**
 * Created by Administrator on 2017/3/9 0009.
 */
var starMap=echarts.init(document.getElementById('starMap'));
var chinaMap=null;
var i=0;
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


$.ajax({
    url:'http://10.0.11.201:8899/start/coords/todaychinabytsorigin',
    //url:'test.json',
    method:'get'
}).done(function (result) {
    var result=JSON.parse(result);
    var length=result.length;
    var carDatas=[];
    initData(result[i]);
    i++;
    var interval=setInterval(function () {
        if(i<length){
            initData(result[i]);
            i++
        }else{
            clearInterval(interval);
        }
    },300);
    function initCurrentTime(timeStamp) {
        var tempTime=new Date(timeStamp*1000);
        //console.log(timeStamp);
        var currentTime=tempTime.format('yyyy年MM月dd日 hh:mm:ss');
        //console.log(currentTime);
        $('#currentTime').text(currentTime);
    }
    function initData(resData) {
        var carData=[[],[],[]];
        var temp=resData.Point;
        initCurrentTime(resData.TS);
        //console.log(resData.TS);
        var tempLength=temp.length;
        var tempDatas=[];
        for(var j=0;j<tempLength;j++){
            var lls=temp[j][0].split(',');
            var current=[Number(lls[0])/1000,Number(lls[1])/1000,temp[j][1]];
            tempDatas.push(current);
        }
        for(var j=0;j<tempDatas.length;j++){
            carDatas.push(tempDatas[j]);
        }
        var datas=carDatas.sort(function (a,b) {
            return b[2]-a[2];
        });
        var datalength=datas.length;
        for(var j=0;j<datalength;j++){
            if(j<datalength/5){
                carData[0].push(datas[j]);
            }else if(j>datalength/2){
                carData[2].push(datas[j]);
            }else{
                carData[1].push(datas[j]);
            }
        }
        //carDatas=carData;
        //window.t2=Date.now();
        //console.log(t2-t1);
        var chinaMapLoad=$.Deferred();
        chinaMapLoad.then(initChinaMap,function () {
            alert('请求数据异常');
        });
        if(!!chinaMap){
            chinaMapLoad.resolve('china',chinaMap, carData );
            carData=null;
        }else{
            $.get('data/china.json',function (chinaJson) {
                chinaMapLoad.resolve('china',chinaJson, carData );
                carData=null;
            });
        }
        temp=null;
        datas=null;
        function initChinaMap(type,chinaJson,data) {
            console.log(data);
            // var data=data.map(function (item, index) {
            //     var length=item.length;
            //     return item.filter(function (item1, index1) {
            //         return index1<length/5;
            //     })
            // })
            //window.t3=Date.now();
            //console.log(t3-t2);
            if(i>1){
                option.series=[
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
                    }];
                starMap.clear();
                starMap.setOption(option);
                option.series=null;
            }else{
                chinaMap=chinaJson;
                echarts.registerMap(type,chinaJson);
                option = {
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
                starMap.setOption(option);
                type=null;
                data=null;
                chinaJson=null;
                option.series=null;
            }

            //window.t4=Date.now();
            //console.log(t4-t3);
        }
    }
});

var option=null;

