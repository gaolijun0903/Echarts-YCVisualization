/**
 * Created by Administrator on 2017/3/3 0003.
 */
var bigMap=echarts.init(document.getElementById('bigMap'));
var minLongitude=115.25,maxLongitude=117.30,
    minLatitude=39.26,maxLatitude=41.03;
var carLines=[];
var mapData=function (position, idx) {
    var randTimes=Math.random()*101;

    var prevPt=[position.longitude, position.latitude];
    var hStep = 300 / (randTimes - 1);
    var points = [];
    for (var i = 0; i < randTimes; i += 2) {
        var pt = [position.longitude, position.latitude];
        var beyondHalf=Math.random();
        var symbol1=false,symbol2=false;

        if (beyondHalf>0.5){
            symbol1=true;
        }
        beyondHalf=Math.random();
        if(beyondHalf>0.5){
            symbol2=true;
        }
        var t1=0,t2=0;
        if(symbol1){
            t1=Math.random()*0.1;
        }else{
            t1=-Math.random()*0.1;

        }
        if(symbol2){
            t2=Math.random()*0.1;
        }else{
            t2=-Math.random()*0.1;
        }

        if (i > 0) {
            pt = [
                prevPt[0] + t1,
                prevPt[1] + t2
            ];
        }
        prevPt = pt;
        if(!!!pt){
            pt=[116.46, 39.92]
        }
        points.push([pt[0] , pt[1]]);
    }
    return {
        coords: points,
        lineStyle: {
            normal: {
                color: echarts.color.modifyHSL('#5A94DF', Math.round(hStep * idx))
            }
        }
    };
};
    var length=100;
var datas=[];
    for(var i=0;i<length;i++){


        var startPosition={
            longitude:minLongitude+Math.random()*(maxLongitude-minLongitude),
            latitude:minLatitude+Math.random()*(maxLatitude-minLatitude)
        };
        datas.push(mapData(startPosition,i));
    }
console.log(datas);
$.get('data/lines-car.json', function(data) {
    //console.log(data);
    data=data.filter(function(item,index){
        return index<500;
    })
    var hStep = 300 / (data.length - 1);
    var temp=data.map(function (busLine, idx) {
        var prevPt;
        var points = [];
        for (var i = 0; i < busLine.length; i += 2) {
            var pt = [busLine[i], busLine[i + 1]];
            if (i > 0) {
                pt = [
                    prevPt[0] + pt[0],
                    prevPt[1] + pt[1]
                ];
            }
            prevPt = pt;

            points.push([pt[0] / 1e4, pt[1] / 1e4]);
        }
        return {
            coords: points,
            lineStyle: {
                normal: {
                    color: echarts.color.modifyHSL('#5A94DF', Math.round(hStep * idx))
                }
            }
        };
    });
    console.log(temp);
    var busLines = [].concat.apply([], temp);
    //console.log(busLines)
    bigMap.setOption(option = {
        bmap: {
            center: [116.46, 39.92],
            zoom: 10,
            roam: true,
            mapStyle: {
                'styleJson': [
                    {
                        'featureType': 'water',
                        'elementType': 'all',
                        'stylers': {
                            'color': '#031628'
                        }
                    },
                    {
                        'featureType': 'land',
                        'elementType': 'geometry',
                        'stylers': {
                            'color': '#000102'
                        }
                    },
                    {
                        'featureType': 'highway',
                        'elementType': 'all',
                        'stylers': {
                            'visibility': 'off'
                        }
                    },
                    {
                        'featureType': 'arterial',
                        'elementType': 'geometry.fill',
                        'stylers': {
                            'color': '#000000'
                        }
                    },
                    {
                        'featureType': 'arterial',
                        'elementType': 'geometry.stroke',
                        'stylers': {
                            'color': '#0b3d51'
                        }
                    },
                    {
                        'featureType': 'local',
                        'elementType': 'geometry',
                        'stylers': {
                            'color': '#000000'
                        }
                    },
                    {
                        'featureType': 'railway',
                        'elementType': 'geometry.fill',
                        'stylers': {
                            'color': '#000000'
                        }
                    },
                    {
                        'featureType': 'railway',
                        'elementType': 'geometry.stroke',
                        'stylers': {
                            'color': '#08304b'
                        }
                    },
                    {
                        'featureType': 'subway',
                        'elementType': 'geometry',
                        'stylers': {
                            'lightness': -70
                        }
                    },
                    {
                        'featureType': 'building',
                        'elementType': 'geometry.fill',
                        'stylers': {
                            'color': '#000000'
                        }
                    },
                    {
                        'featureType': 'all',
                        'elementType': 'labels.text.fill',
                        'stylers': {
                            'color': '#857f7f'
                        }
                    },
                    {
                        'featureType': 'all',
                        'elementType': 'labels.text.stroke',
                        'stylers': {
                            'color': '#000000'
                        }
                    },
                    {
                        'featureType': 'building',
                        'elementType': 'geometry',
                        'stylers': {
                            'color': '#022338'
                        }
                    },
                    {
                        'featureType': 'green',
                        'elementType': 'geometry',
                        'stylers': {
                            'color': '#062032'
                        }
                    },
                    {
                        'featureType': 'boundary',
                        'elementType': 'all',
                        'stylers': {
                            'color': '#465b6c'
                        }
                    },
                    {
                        'featureType': 'manmade',
                        'elementType': 'all',
                        'stylers': {
                            'color': '#022338'
                        }
                    },
                    {
                        'featureType': 'label',
                        'elementType': 'all',
                        'stylers': {
                            'visibility': 'off'
                        }
                    }
                ]
            }
        },
        series: [
            {
            type: 'lines',
            coordinateSystem: 'bmap',
            polyline: true,
            data: busLines,
            silent: true,
            lineStyle: {
                normal: {
                    // color: '#c23531',
                    // color: 'rgb(200, 35, 45)',
                    opacity: 0.2,
                    width: 1
                }
            },
            progressiveThreshold: 500,
            progressive: 200
         },
            {
            type: 'lines',
            coordinateSystem: 'bmap',
            polyline: true,
            data: busLines,
            lineStyle: {
                normal: {
                    width: 0
                }
            },
            effect: {
                constantSpeed: 20,
                show: true,
                trailLength: 0.1,
                symbolSize: 1.5
            },
            zlevel: 1
        }
        ]
    });
});