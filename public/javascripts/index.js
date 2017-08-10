
/*****元素类*****/
function DrawElement(cavId,clearId,eraserId){
    this.ele = document.getElementById(cavId);
    this.clearBnt = document.getElementById(clearId);
    this.eraserBnt = document.getElementById(eraserId);
    //是否是橡皮擦模式
    this.isEraser = false;
    this.draw = new Draw(this.ele);
    var that = this;
    //获取画笔的x和y
    this.getXY = function(xOrY){
        if(xOrY === 'x') return this.pageX - that.ele.offsetLeft;
        return this.pageY - that.ele.offsetTop;
    }

    //建立socket连接
    this.socket = new Socket();
}

DrawElement.prototype.init = function(){
    var ele = this.ele;
    var draw = this.draw;
    var getXY = this.getXY;
    var that = this;
    ele.onmousedown = function(e){
        var ev = e || window.event;
        var x = getXY.call(ev,'x');
        var y = getXY.call(ev);
        draw.drawBegin(x,y);
        that.socket.send(JSON.stringify({
            type: 'drawBegin',
            x: x,
            y: y
        }));
    };
    ele.onmousemove = function(e){
        var ev = e || window.event;
        var x = getXY.call(ev,'x');
        var y = getXY.call(ev);
        if(that.isEraser){
            draw.clear(x,y);
            that.socket.send(JSON.stringify({
                type: 'clear',
                x: x,
                y: y
            }));
        }else{
            if(draw.drawMiddle(x,y)){
                that.socket.send(JSON.stringify({
                    type: 'draw',
                    x: x,
                    y: y
                }));
            }
        }
    };
    ele.onmouseup = function(){
        draw.drawEnd();
        that.socket.send(JSON.stringify({
            type: 'drawEnd'
        }));
    };
    ele.onmouseleave = function(){
        draw.drawEnd();
        that.socket.send(JSON.stringify({
            type: 'drawEnd'
        }));
    };
    //清除画布
    this.clearBnt.onclick = function(){
        draw.clearAll();
        that.socket.send(JSON.stringify({
            type: 'clearAll'
        }));
    };
    //进入橡皮擦模式
    this.eraserBnt.onclick = function(e){
        var ev = e || window.event;
        that.isEraser = !that.isEraser;
        ev.target.innerText = that.isEraser?"继续画画":"橡皮擦"
    };
}


/*****画画类*****/
function Draw(cvs,isBegin){
    this.begin = isBegin || false;
    this.cvs = cvs;
    this.cvx = cvs.getContext("2d");
}

Draw.prototype.drawBegin = function(x,y){
    this.begin = true;
    var cvx = this.cvx;
    cvx.beginPath();
    cvx.moveTo(x, y);
}

Draw.prototype.drawMiddle = function(x,y){
    var cvx = this.cvx;
    if(this.begin){
        cvx.lineTo(x, y);
        cvx.stroke();
    }
    return this.begin;
}

Draw.prototype.drawEnd = function(){
    this.begin = false;
}

//橡皮擦功能
Draw.prototype.clear = function(x,y){
    if(this.begin){
        this.cvx.clearRect(x,y,20,20);
    }
}

//清空画布
Draw.prototype.clearAll = function(){
    this.cvx.clearRect(0,0,this.cvs.clientWidth,this.cvs.clientHeight);
}

/*****socket类*****/
function Socket(doSome){
    this.server = 'ws://localhost:4000';
    this.isOpen = true;
    this.websocket = new WebSocket(this.server);
    this.doSome = doSome;
}

Socket.prototype.init = function(){
    var that = this;
    this.websocket.onopen = function (evt) { 
        that.isOpen = true;
    }
    this.websocket.onclose = function (evt) { 
        alert('连接已经断开');
        that.isOpen = false;
    };
    this.websocket.onerror = function (evt) { 
        alert('连接已经断开');
        that.isOpen = false;
    }; 
    this.websocket.onmessage = function (evt) {
        that.doSome && that.doSome(evt);
    };
}


Socket.prototype.send = function(msg,cb){
    this.websocket.send(msg);
    cb && cb();
}
