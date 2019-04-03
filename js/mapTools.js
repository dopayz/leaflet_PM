var wkts = new Array();//所有wkt数据存放的容器
var makerNum = 0;
var polyNum = 0;
var lineNum = 0;
var markers = new L.MarkerClusterGroup();
var hashmap = new HashMap();
var machinemap = new HashMap();
//将leaflet对象转wkt字符串(只时候新增)
// function LeafletToWkt(e){
//     console.log(e);
//     var wkt ="";
//     switch(e.shape)
//     {
//         case 'Poly':
//             wkt +="POLYGON((";
//             var poly = e.layer._latlngs[0];
//             for(var i=0;i<poly.length;i++){
//                 wkt +=poly[i].lng+" "+poly[i].lat+",";
//             }
//             wkt +=poly[0].lng+" "+poly[0].lat;
//             wkt +="))";
//             return wkt;
//         case 'Line':
//             wkt +="LINESTRING(";
//             var line =  e.layer._latlngs;
//             for(var i=0;i<line.length;i++){
//                 wkt +=line[i].lng+" "+line[i].lat+",";
//             }
//             wkt = wkt.substring(0, wkt.lastIndexOf(','));
//             wkt +=")";
//             return wkt;
//         default :
//             wkt +="POINT("+e.layer._latlng.lng+" "+e.layer._latlng.lat+")";
//             return wkt;
//     }
// }
//将leaflet对象转wkt字符串(通用)，传进来的是图层
function LeafletToWkt(e){
    var wkt ="";
    if( e._latlngs !== undefined){
        if( e._latlngs[0] instanceof Array){
            wkt +="POLYGON((";
            var poly = e._latlngs[0];
            for(var i=0;i<poly.length;i++){
                wkt +=poly[i].lng+" "+poly[i].lat+",";
            }
            wkt +=poly[0].lng+" "+poly[0].lat;
            wkt +="))";
            return wkt;
        }else{
            wkt +="LINESTRING(";
            var line = e._latlngs;
            for(var i=0;i<line.length;i++){
                wkt +=line[i].lng+" "+line[i].lat+",";
            }
            wkt = wkt.substring(0, wkt.lastIndexOf(','));
            wkt +=")";
            return wkt;
        }
    }else{
        wkt +="POINT("+e._latlng.lng+" "+e._latlng.lat+")";
        return wkt;
    }
}
//获取url参数
function GetQueryString(name)
{
    var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);//search,查询？后面的参数，并匹配正则
    if(r!=null){
        return  unescape(r[2]);
    }
    return null;
}
//leaflet加载wkt数据
function loadWKT(data){
    var wkt = new Wkt.Wkt();
    data = JSON.parse(data);
    //wkt.read(data.replace('\n', '').replace('\r', '').replace('\t', ''));
    wkt.read(data.data);
    var obj = null;
    if(data.data.search("POINT") != -1){
        obj = wkt.toObject(this.machineway);
    }else{
        obj = wkt.toObject(this.selfway);
    }
    if (wkt.type === 'polygon' || wkt.type === 'linestring') {
    }
    if (Wkt.isArray(obj)) {
        for (i in obj) {
            if (obj.hasOwnProperty(i) && !Wkt.isArray(obj[i])) {
                obj[i].addTo(this.selfway);
            }
        }
    } else {
        //将路线添加铁路样式(针对polyline和polygon)
        if(obj._latlngs !== undefined && GetQueryString("railroadStyle") !=null){
            var antPath = L.polyline.antPath;
            obj = antPath(obj._latlngs, {
                "paused": true,   　　//暂停  初始化状态
                "reverse": false,　　//方向反转
                "delay": 3000,　　　　//延迟，数值越大效果越缓慢
                "dashArray": [10, 20],　//间隔样式
                "weight": 5,　　　　//线宽
                "opacity": 0.5,　　//透明度
                "color": "#C0C0C0",　//颜色
                "pulseColor": "#000000"　　//块颜色
            });
        }
        //聚合数据处理(针对marker)
        if(obj._latlng !== undefined && GetQueryString("markercluster") !=null){
            var marker = new L.marker(obj._latlng);
            //marker.options.sm_sid = 'position';
            markers.addLayer(marker);
            markers.addTo(this.machineway);
            marker.on('dblclick',function(e){
                console.log(e);
                //调用父页面打开新窗口方法
                parent.closeTab(1548497278226);
                parent.addTab({
                    id: 1548497278226,
                    title: '配置控制命令',
                    url:  siteUrl+ '/station/station/viewStaStation.html/' +data.guid+'?openType=1&dataId=1548497278226'
                });
            })
            //右键点击事件
            marker.on('contextmenu',function(e){
                parent.dojo.publish('contextmenu',hashmap.get(e.target._leaflet_id));
            });
            marker.bindTooltip(data.name, {
                permanent : true,
                offset : [ 0, 0 ],// 偏移
                direction : "right",// 放置位置
                sticky:true,//是否标记在点上面
            }).openTooltip();
            hashmap.put(marker._leaflet_id,data.guid);
            machinemap.put(data.guid,marker);
            return;
        }
        if(data.data.search("POINT") != -1){
            obj.addTo(this.machineway);
        }else{
            obj.addTo(this.selfway);
        }
        machinemap.put(data.guid,obj);
        //定义主键
        obj._leaflet_id = data.guid;
        //添加label以及marker双击跳转页面
        if(obj._latlng !== undefined){
            obj.on('dblclick',function(e){
                console.log(e);
                //调用父页面打开新窗口方法
                parent.closeTab(1548497278226);
                parent.addTab({
                    id: 1548497278226,
                    title: '配置控制命令',
                    url:  siteUrl+ '/station/station/viewStaStation.html/' +data.guid+'?openType=1&dataId=1548497278226'
                });
            })
            //右键点击事件
            obj.on('contextmenu',function(e){
                alert(e.target._leaflet_id);
                parent.dojo.publish('contextmenu',e.target._leaflet_id);
            });
            obj.bindTooltip(data.name, {
                permanent : true,
                offset : [ 0, 0 ],// 偏移
                direction : "right",// 放置位置
                sticky:true,//是否标记在点上面
            }).openTooltip();
        }
    }
    wkts.push({"guid":data.guid,"name":data.name,"data":data.data});
}
//获取当前中心点和缩放比例
function getCenterAndZoom(){
    return map.getCenter().lng+","+map.getCenter().lat+","+map.getZoom();
}

//获取所有wkt数据
function getAllWkt(){
    wkts = uniqueArray(wkts,"data");
    return  JSON.stringify(wkts);
}

//按钮禁用
function disableButton(type){
    switch(type)
    {
        case 'Poly':
            map.pm.disableDraw('Polygon');
            $('.leaflet-pm-icon-polygon').parent().parent().addClass("disable");
            $('.leaflet-pm-icon-polygon').parent().addClass("a_disable");
            break;
        case 'Line':
            map.pm.disableDraw('Polyline');
            $('.leaflet-pm-icon-polyline').parent().parent().addClass("disable");
            $('.leaflet-pm-icon-polyline').parent().addClass("a_disable");
            break;
        default :
            map.pm.disableDraw('Marker');
            $('.leaflet-pm-icon-marker').parent().parent().addClass("disable");
            $('.leaflet-pm-icon-marker').parent().addClass("a_disable");
    }
}
//按钮重启
function enableButton(type){
    switch(type)
    {
        case 'Poly':
            $('.leaflet-pm-icon-polygon').parent().parent().removeClass("disable");
            $('.leaflet-pm-icon-polygon').parent().removeClass("a_disable");
            break;
        case 'Line':
            $('.leaflet-pm-icon-polyline').parent().parent().removeClass("disable");
            $('.leaflet-pm-icon-polyline').parent().removeClass("a_disable");
            break;
        default :
            $('.leaflet-pm-icon-marker').parent().parent().removeClass("disable");
            $('.leaflet-pm-icon-marker').parent().removeClass("a_disable");
    }
}

//按钮操作事件记录
function clickButtonLog(type,dic,flg){
    if(dic){
        switch (flg) {
            case 'insert':
                switch(type)
                {
                    case 'Poly':
                        polyNum ++;
                    case 'Line':
                        lineNum ++;
                    default :
                        makerNum ++;
                }
                break;
            case 'delete':
                switch(type)
                {
                    case 'Poly':
                        polyNum --;
                    case 'Line':
                        lineNum --;
                    default :
                        makerNum --;
                }
                break;
            default:
        }
    }else{
        switch(type)
        {
            case 'Poly':
                return polyNum;
            case 'Line':
                return lineNum;
            default :
                return makerNum;
        }
    }
}

/*
 * JSON数组去重
 * @param: [array] json Array
 * @param: [string] 唯一的key名，根据此键名进行去重
 */
function uniqueArray(array, key){
    var result = [array[0]];
    for(var i = 1; i < array.length; i++){
        var item = array[i];
        var repeat = false;
        for (var j = 0; j < result.length; j++) {
            if (item[key] == result[j][key]) {
                repeat = true;
                break;
            }
        }
        if (!repeat) {
            result.push(item);
        }
    }
    return result;
}