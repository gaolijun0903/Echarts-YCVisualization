/**
 * Created by Administrator on 2017/3/1 0001.
 */
function randomData() {
    return Math.round(Math.random()*1000);
}
var countUpOptions = {
    useEasing : true, //使用缓和效果
    useGrouping : false, //使用分组效果
    separator : '', //分离器，数据够三位，例如100,000
    decimal : '.', //小数点分割，例如：10.00
    prefix : '', //第一位默认数字
    suffix : '' //最后一位默认数字
};

function initTotal(number, menu) {
	if(menu.name=='结单费用'){
        number='**'+number.toString().slice(2);
    }
    $('#number').text(number);
    $('#typeName').text(menu.name+':');
    $('#unit').text(menu.unit);
}
// setInterval(function () {
//     var num=parseInt(document.getElementById('number').innerText);
//     var addNumber=Math.round(Math.random()*10);
//     var demo = new CountUp("number", num,num+addNumber, 0, 2.5, countUpOptions);
//     demo.start();
// },2550);
// setInterval(function () {
//     chinaMapLoadSuccess(abc);
// },3000);
var chinaMap=null;
var width=window.innerWidth;
var height=window.innerHeight;
var isFirst=true;
var provinces=[
    {name: '北京',spell: 'beijing' },
    {name: '天津',spell: 'tianjin' },
    {name: '上海',spell: 'shanghai' },
    {name: '重庆',spell: 'chongqing' },
    {name: '河北',spell: 'hebei' },
    {name: '河南',spell: 'henan' },
    {name: '云南',spell: 'yunnan' },
    {name: '辽宁',spell: 'liaoning' },
    {name: '黑龙江',spell: 'heilongjiang' },
    {name: '湖南',spell: 'hunan' },
    {name: '安徽',spell: 'anhui' },
    {name: '山东',spell: 'shandong' },
    {name: '新疆',spell: 'xinjiang' },
    {name: '江苏',spell: 'jiangsu' },
    {name: '浙江',spell: 'zhejiang' },
    {name: '江西',spell: 'jiangxi' },
    {name: '湖北',spell: 'hubei' },
    {name: '广西',spell: 'guangxi' },
    {name: '甘肃',spell: 'gansu' },
    {name: '山西',spell: 'shanxi' },
    {name: '内蒙古',spell: 'neimenggu' },
    {name: '陕西',spell: 'shanxi1' },
    {name: '吉林',spell: 'jilin' },
    {name: '福建',spell: 'fujian' },
    {name: '贵州',spell: 'guizhou' },
    {name: '广东',spell: 'guangdong' },
    {name: '青海',spell: 'qinghai' },
    {name: '西藏',spell: 'xizang' },
    {name: '四川',spell: 'sichuan' },
    {name: '宁夏',spell: 'ningxia' },
    {name: '海南',spell: 'hainan' },
    {name: '台湾',spell: 'taiwan' },
    {name: '香港',spell: 'xianggang' },
    {name: '澳门',spell: 'aomen' }
];
var menus=[
    {
        type:'preorderstats',
        name:'预下单数',
        unit:'个'
    },
    {
        type:'orderstats',
        name:'订单数',
        unit:'个'
    },
    {
        type:'endorderstats',
        name:'结单数',
        unit:'个'
    },
    {
        type:'endorderfeesstats',
        name:'结单费用',
        unit:'元'
    },
    {
        type:'endordermilesstats',
        name:'结单距离',
        unit:'公里'
    },
]
var bigMap=echarts.init(document.getElementById('bigMap'));
var smallMap=echarts.init(document.getElementById('smallMap'));
var lineArea=echarts.init(document.getElementById('lineArea'));
var circleInterval=null;
function circleInitData(type) {
    clearInterval(circleInterval);
    initData(type);
    circleInterval=setInterval(function () {
        initData(type);
    },5000);
}
circleInitData('preorderstats');
function initData(type) {
    $.ajax({
        url:'http://10.0.11.201:8899/'+type+'/today',
        method:'get',
    }).done(function (data) {
        var menu=menus.filter(function (item) {
            return item.type==type;
        })[0];
        console.log(data);
        var tempData=data;
        var chinaData=[];
        var max=0;
        if(tempData.TotalStates){
            var length=tempData.TotalStates.length;
            for(var i=0;i<length;i++){
                var keyName=tempData.TotalStates[i].cname;
                //console.log(keyName);
                if(tempData.TotalStates[i].count>max){
                    max=tempData.TotalStates[i].count;
                }
                if(keyName){
                    chinaData.push({name:keyName,value:tempData.TotalStates[i].count});
                }
            }
        }
        //console.log(chinaData);
        initChinaMap(chinaData,max,menu);
        initTotal(tempData.Total, menu);
        initSmallMap(chinaData, menu);
        initLine(tempData.UpdateStates, menu);
        isFirst=false;
    }).fail(function () {
        alert('error');
    })
}

var mapLoadSuccess=function (district,json,data,max,menu) {
    chinaMap=json;
    //console.log(data);
    echarts.registerMap(district,json);
    var option = {
        tooltip: {
            trigger: 'item'
        },
        visualMap: {
            min: 0,
            max: max,
            left: 'left',
            top: 'bottom',
            text: ['高','低'],           // 文本，默认为数值文本
            inRange: {
                color: ['#66FFCD','#30FFCD','#00FFCD','#00CD9A','#009AFF','#0066FF','#0030FF']
            },
            // outRange:{
            //     color:['#CD00FF','#FF00CD','#FF0030']
            // },
            calculable: true,
            show:false
        },
        series: [
            {
                name: menu.name,
                type: 'map',
                mapType: 'china',
                roam: false,
                label: {
                    normal: {
                        show: true
                    },
                    emphasis: {
                        show: true
                    }
                },
                data:data
            }
        ]
    };
    bigMap.setOption(option);
};

function initChinaMap(data,max, menu) {
    var chinaMapLoad=$.Deferred();
    chinaMapLoad.then(mapLoadSuccess,function () {
        alert('请求数据异常');
    });
    if(!!chinaMap){
        chinaMapLoad.resolve('china',chinaMap, data ,max, menu)
    }else{
        $.get('data/china.json',function (chinaJson) {
            chinaMapLoad.resolve('china',chinaJson, data ,max,menu);
        });
    }
}

function initSmallMap(updateData, menu) {
    var topTen=updateData.sort(function (a,b) {
        return b.value-a.value;
    }).filter(function (item, index) {
        return index<10;
    }).reverse();
    var names=topTen.map(function (item) {
        return  item.name;
    });
    var values=topTen.map(function (item) {
        return item.value;
    });

    var option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        textStyle:{
            color:'#fff'
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'value',
            boundaryGap: [0, 0.05]
        },
        yAxis: {
            type: 'category',
            data: names
        },
        series: [
            {
                name:menu.name,
                type: 'bar',
                data: values,
                barWidth:20,
                animationDuration:2000,
                itemStyle:{
                    normal:{
                        color:'#00CD9A'
                    }
                }
            }
        ]
    };
    smallMap.setOption(option);
}
var lineData;
function initLine(updateData, menu) {
    var datas=[],times=[];
    if(updateData){
        var length=updateData.length;
        var totalObject={name:'',count:0};
        for(var i=0;i<length;i++){
            //console.log(updateData[i])
            var currentObject={name:'',count:0};
            if(updateData[i].state.length>0){
                currentObject=updateData[i].state.reduce(function(previous,item){
                    return {name:'',count:previous.count+item.count};
                });
            }else{
                currentObject={name:'',count:0};
            }
            totalObject={name:'',count:totalObject.count+currentObject.count};
            if((i+1)%5==0){
                datas.push(totalObject.count);
                times.push(updateData[i].timestamp);
                totalObject={name:'',count:0};
            }
        }
    }
    if(isFirst){
        lineData={
            datas:datas,
            times:times
        }
    }else{
        var temp=lineData;
        temp.datas=temp.datas.filter(function (item, index) {
            return index>0;
        })
        temp.datas.push(datas[datas.length-1]);
        temp.times=temp.times.filter(function (item, index) {
            return index>0;
        })
        temp.times.push(datas[datas.length-1]);
    }
    console.log(datas);
    console.log(times);
    var option = {
        // title: {
        //     text: '动态数据 + 时间坐标轴'
        // },
        tooltip: {
            trigger: 'item',
            formatter:menu.name+':{c0}'
        },
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
            data:lineData.times,
            boundaryGap:false,
            show:false,
        },
        yAxis: {
            type: 'value',
            splitLine: {
                show: false
            },
            boundaryGap:false,
            show:false,
        },
        series: [{
            name: '分时数据',
            type: 'line',
            // showSymbol: false,
            // hoverAnimation: false,
            data: lineData.datas,
            itemStyle:{
                normal:{
                    color:'#00CD9A'
                }
            }
        }]
    };
    lineArea.setOption(option);
}


function changeSelectedItem(data) {
    console.log(data)
}












