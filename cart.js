function cla_inquiry(top_inq,ls,inq_btn,life_time){
    "use strict";
    let _this = this;
    _this.top_inq = $(top_inq);//顯示數量icon
    _this.ls = ls; //localstorage item名稱
    _this.inq_btn = $(inq_btn);//加入按鈕
    _this.life_time = life_time;//存活時間
    _this.inq_btn_arr = new Array();
    localStorage[_this.ls]?_this.top_inq.attr('data-quan',1):_this.top_inq.attr('data-quan',0);
    if(localStorage[_this.ls]){
        _this.inquiry = JSON.parse(localStorage[_this.ls]);
        if(_this.inquiry.life_time < Date.now()){
            localStorage.removeItem(_this.ls);
            _this.inquiry = {};
        }else{
            _this.top_inq.attr('data-quan',_this.inquiry.item_list.length);            
        }
    }else{
        _this.top_inq.attr('data-quan',0);
    }
    if(_this.inq_btn.length){
        _this.inq_btn.each(function(idx,item){
            var is_set = false;
            if(item.tagName === "A"){
                var event = 'click';
            }else if(item.tagName==="INPUT"){
                var event = "change";
            }
            _this.inquiry&&_this.inquiry.item_list.forEach(function(elem){($(item).attr("data-name")===elem.name)&&(is_set=true);});
            _this.inq_btn_arr.push(new cla_inq_btn_item(this,is_set,event));
        });
    }
    _this.inq_btn_arr.forEach(function(item,idx){
        item.o.on(item.event,function(e){
            e.preventDefault();
            item.is_set?_this.delete_inq(item):_this.add_inq(item);
        });
    });
}
cla_inquiry.prototype.add_inq = function(o){
    //新增項目
    this.inquiry = (localStorage[this.ls])?JSON.parse(localStorage[this.ls]):{life_time: 0,item_list:new Array()};
    this.inquiry.item_list.push({
        series: o.series,
        name: o.name,
        src: o.src
    });
    this.inquiry.life_time=(Date.now()+this.life_time);
    localStorage[this.ls] = JSON.stringify(this.inquiry);
    this.top_inq.attr('data-quan',this.inquiry.item_list.length);
    o.btn_type(true,true);
}
cla_inquiry.prototype.delete_inq = function(o,is_inq_page,inq_wrap){
    "use strict";
    //刪除項目
    let _this = this;
    _this.inquiry = (localStorage[_this.ls])?JSON.parse(localStorage[_this.ls]):new Object();
    _this.inquiry.item_list.forEach(function(item,i){
        item.name===o.name && _this.inquiry.item_list.splice(i, 1);
    });
    (_this.inquiry.item_list.length<1)?localStorage.removeItem(_this.ls):localStorage.setItem(_this.ls, JSON.stringify(_this.inquiry));
    _this.top_inq.attr('data-quan',_this.inquiry.item_list.length);
    if(is_inq_page){
        //INQUIRY頁面
        _this.inq_model="";
        _this.show_list_arr.length = 0;
        $(inq_wrap).html("");
        _this.draw(inq_wrap);
        o.delete_item(_this.form_div,_this.inq_model);
    }else{
        o.btn_type(false,true);
    }
}
cla_inquiry.prototype.show_list = function(o, total_price){
    //產生inquiry頁面清單
    "use strict";
    let _this = this;
    _this.inq_model = "";
    _this.show_list_arr = new Array();
    _this.total_price = $(total_price);
    if(_this.inquiry){
        _this.draw(o);
    }
}
cla_inquiry.prototype.draw = function(o){
    "use strict";
    let _this = this;
    _this.price = 0;
    for(let i in _this.inquiry.item_list){
        let div_item = $('<div class="item"></div>');
        let div_img = $('<div class="img"><img src="'+_this.inquiry.item_list[i].src+'" alt="" /></div>');
        let div_txt = $('<div class="txt"><div class="name">'+_this.inquiry.item_list[i].name+'</div><div class="series">'+_this.inquiry.item_list[i].series+'</div></div>');
        let btn = $('<a href="javascript:void(0)" title="" class="btn">CANCEL</a>');
        div_txt.append(btn);
        div_item.append(div_img).append(div_txt);
        $(o).append(div_item);
        _this.show_list_arr.push(new cla_inq_list_item(btn,_this.inquiry.item_list[i].name,_this.inquiry.item_list[i].series,div_item));
        _this.inq_model += _this.inquiry.item_list[i].name+(i<(_this.inquiry.item_list.length-1)?"\n":"");
        _this.price += parseInt(_this.inquiry.item_list[i].series);
        _this.show_list_arr[i].o.one('click',function(){
            _this.delete_inq(_this.show_list_arr[i],true,o);
        });
    }
    _this.total_price.text(_this.price);
}
function cla_inq_btn_item(o,is_set,event){
    //頁面裡的inquiry按鈕
    this.o = $(o);
    this.series = this.o.attr("data-price");
    this.name = this.o.attr("data-name");
    this.src = this.o.attr("data-img");
    this.event = event;
    this.btn_type(is_set);
}
cla_inq_btn_item.prototype.btn_type = function(x,is_event){
    if(this.event=="change"){
        this.o.prop("checked",x);
    }else{
        if(this.o.hasClass('type_checkbox')){
            x?this.o.addClass('added'):this.o.removeClass('added');
        }else{
            x?this.o.addClass('added').text('取消購買'):this.o.removeClass('added').text('加入購物車');
        }
    }
    this.is_set = x;
    return this;
}
function cla_inq_list_item(o,name,series,item){
    //inquiry頁面的item
    this.o = $(o);
    this.name = name;
    this.series = series;
    this.item = item;
}
cla_inq_list_item.prototype.delete_item = function(form_div,inq_model){
    this.item.remove();
}