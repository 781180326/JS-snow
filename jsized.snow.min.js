(function() {

    var getScroll, getHeight, j, f;


    /**
     * [此函数用于绑定事件]
     * @param {obj} 		a 	事件的载体
     * @param {string} 		b 	事件名
     * @param {function}	c 	事件函数
     */
    function addEvent(a, b, c) {
        if (a.addEventListener)
            a.addEventListener(b, c, false);
        else
            a.attachEvent && a.attachEvent("on" + b, c)
    }

    /**
     * 此函数用于在window尚未onload时，将传入的函数放入window.onload事件中，防止window尚未load就加载函数报错
     * @param  {function} 	a 	需要传入的函数
     * @return {undefined}   
     */
    function g(a) {
        if (typeof window.onload != "function")
            window.onload = a;
        else {
            var b = window.onload; //将onload事件函数给b
            window.onload = function() { //当onload事件触发
                b();
                a();
            }
        }
    }


    /**
     * 此函数获取适合客户浏览器的得到窗口滚动距离的函数(因为此函数触发太多)
     * @return {function} 获取窗口滚动距离的函数
     */
    function getScrollFn() {

        function pageXOff() {
            var a = {};
            for (type in { Top: "", Left: "" }) {
                var b = type == "Top" ? "Y" : "X";
                a[type.toLowerCase()] = window["page" + b + "Offset"];
            }
            return a;
        }

        function docScroll() {
            var a = {};
            for (type in { Top: "", Left: "" }) {
                var b = document.documentElement.clientHeight ? document.documentElement : document.body;
                a[type.toLowerCase()] = b["scroll" + type];
            }
            return a;
        }

        return (typeof window["pageXOffset"] != "undefined") ? pageXOff : docScroll;
    }

    /**
     * 此函数用于获取窗体的滚动距离(x,y)
     * @return {obj}-> {top:"",left:""}  返回一个对象，这个对象里面存放调用函数时窗口的滚动距离
     */
    getScroll = getScrollFn();


    /**
     * 获取得到可视区高的函数
     * @return {function} 返回获取可视区高的函数
     */
    function getClientHeight() {

        function getInnerH() {
            return window.innerHeight;
        }

        function getDocCliH() {
            return document.documentElement.clientHeight;
        }

        function getBodyCliH() {
            return document.body.clientHeight;
        }

        if (getInnerH()) {
            return getInnerH;
        } else if (getDocCliH()) {
            return getDocCliH;
        } else {
            return getBodyCliH;
        }
    }
    getHeight = getClientHeight();


    /**
     * 此构造函数用来创建雪花图片以及所有参数，比如left、top、angle...
     * @param  {string} 	a 	雪花图片的路径，说明雪花图片在哪个目录下面
     * @return {undefined}   	此函数用于实例化对象
     */
    function Snow(a) {
        this.parent = document.body; //父亲是body元素
        this.createEl(a); //创建img对象，添加在body元素下,img图片路径为 a/"snow" + Math.floor(Math.random() * 4) + ".gif"
        this.size = Math.random() * 15 + 15; //雪花宽高是15-30像素
        this.el.style.width = Math.round(this.size) + "px";
        this.el.style.height = Math.round(this.size) + "px";
        this.maxLeft = document.body.offsetWidth - this.size; //最大left值是浏览器占位宽-雪花宽
        this.maxTop = document.body.offsetHeight - this.size; //最大top值是浏览器占位高-雪花高
        this.left = Math.random() * this.maxLeft; //雪花left在0-maxLeft之间
        this.top = getScroll().top + 1; //雪花top等于窗口的滚动距离+1
        this.angle = 1.4 + 0.2 * Math.random(); //雪花每次运动可以摇摆的幅度
        this.minAngle = 1.4;
        this.maxAngle = 1.6;
        this.angleDelta = 0.01 * Math.random();
        this.speed = 2 + Math.random() //雪花飘动的速度在2-3之间
    }

    Snow.prototype = {
        createEl: function(a) { //创建img对象并添加在body下面
            this.el = document.createElement("img");
            this.el.setAttribute("src", a + "snow" + Math.floor(Math.random() * 4) + ".gif");
            this.el.style.position = "absolute";
            this.el.style.display = "block";
            this.el.style.zIndex = "99999";
            this.parent.appendChild(this.el)
        },
        move: function() { //雪花飘动的函数，改变雪花的left和top
            if (this.angle < this.minAngle || this.angle > this.maxAngle)
                this.angleDelta = -this.angleDelta;

            this.angle += this.angleDelta;
            this.left += this.speed * Math.cos(this.angle * Math.PI); //让雪花飘动的主要算法
            this.top -= this.speed * Math.sin(this.angle * Math.PI);

            if (this.left < 0)
                this.left = this.maxLeft;
            else if (this.left > this.maxLeft)
                this.left = 0;
        },
        draw: function() { //改变雪花的当前位置，从而运动(这个函数需要在move函数执行后才有效果，否则left和top都没有改变)
            this.el.style.top = Math.round(this.top) + "px";
            this.el.style.left = Math.round(this.left) + "px";
        },
        remove: function() { //从文档流中删除这个img
            this.parent.removeChild(this.el);
            this.parent = this.el = null
        }
    }


    j = false, f = true;
    g(function() { //当window onload触发后再把j设置为true
        j = true;
    });


    /**
     * 程序的入口
     * @param  {string} 	a 	a传入的是雪花图片的目录路径
     * @param  {int}	 	b 	b传入的是屏幕上雪花的最多显示数目
     * @return {undefined}   
     */
    window.createSnow = function(a, b) {
        if (j) {
            var snow_arr = [], //snow_arr数组用来存放i实例出来的对象(这个对象不只包括图片，还有各种参数)
                m = setInterval(function() {
                    //只有f == true时才能继续创建雪花，否则停止生成雪花
                    f && b > snow_arr.length && Math.random() < b * 0.0025 && snow_arr.push(new Snow(a));
                    //当f == false时，不再生成雪花，页面上的雪花也会逐渐被remove,当数组中没有雪花时，停止定时器，这里可以再添加一个再度开始定时器的方法
                    !f && !snow_arr.length && clearInterval(m);

                    for (var e = getScroll().top, n = getHeight(), d = snow_arr.length - 1; d >= 0; d--)
                        if (snow_arr[d]) //如果雪花的top小于滚动距离或者雪花的bottom已经到了可视区的最底部，将这个雪花从文档流删除，从C数组移除
                            if (snow_arr[d].top < e || snow_arr[d].top + snow_arr[d].size + 1 > e + n) {
                                snow_arr[d].remove();
                                snow_arr[d] = null;
                                snow_arr.splice(d, 1);
                            } else { //否则让这个雪花运动
                                snow_arr[d].move();
                                snow_arr[d].draw();
                            }
                }, 40);

            addEvent(window, "scroll", function() { //当滚动滚动条时,重绘数组中雪花
                for (var e = snow_arr.length - 1; e >= 0; e--)
                    snow_arr[e].draw();
            });

        } else //如果页面还没有onload，就将这个函数加入onload函数中(相当于这个意思)，等页面onload后就会执行这个函数，这算是处理onload之前访问dom出错情况的一种很好的解决办法
            g(function() {
                createSnow(a, b);
            });
    };

    /**
     * 停止雪花效果，需要手动调用
     * @return {undefined} 
     */
    window.removeSnow = function() { //让f == false 可以阻止继续用i函数创建雪花，也就是停止雪花效果，需要手动调用，或者给一个触发函数
        f = false;
    };
})();