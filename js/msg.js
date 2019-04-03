//致敬伟大的dojo框架，因此用dojo命名
var dojo = {};
dojo.subscribeList = [];
//订阅
dojo.subscribe = function( key, fn ){
    if ( !this.subscribeList[ key ] ){
        this.subscribeList[ key ] = [];
    }
    this.subscribeList[ key ].push( fn );//订阅的消息添加进缓存列表
};
// 发布消息
dojo.publish = function(){
    var key = Array.prototype.shift.call( arguments ),
        fns = this.subscribeList[ key ];
    if ( !fns || fns.length === 0 ){// 如果没有绑定对应的消息
        return false;
    }
    for( var i = 0, fn; fn = fns[ i++ ]; ){
        fn.apply( this, arguments ); // arguments 是trigger 时带上的参数
    }
};
//取消订阅
dojo.remove = function( key, fn ){
    var fns = this.subscribeList[ key ];
    if ( !fns ){ // 如果key 对应的消息没有被人订阅，则直接返回
        return false;
    }
    if ( !fn ){ // 如果没有传入具体的回调函数，表示需要取消key 对应消息的所有订阅
        fns && ( fns.length = 0 );
    }else{
        for ( var l = fns.length - 1; l >=0; l-- ){ // 反向遍历订阅的回调函数列表
            var _fn = fns[ l ];
            if ( _fn === fn ){
                fns.splice( l, 1 ); // 删除订阅者的回调函数
            }
        }
    }
};