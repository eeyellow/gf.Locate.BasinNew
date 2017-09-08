;
(function ($, window, document, undefined) {
    //'use strict';
    var pluginName = 'gfLocateBasinNew'; //Plugin名稱
    var gfLocateBasinNew;

    $.ajax({
        url: 'node_modules/select2/dist/css/select2.min.css',
        dataType: 'text',
        cache: true
    }).then(function(data){
        var style = $('<style/>',{ 'text': data });
        $('head').append(style);
    });
    $.ajax({
        url: 'node_modules/gf.locate.basinnew/src/css/gf.Locate.BasinNew.css',
        dataType: 'text',
        cache: true
    }).then(function(data){
        var style = $('<style/>',{ 'text': data });
        $('head').append(style);
    });
    //Load dependencies first
    $.when(
        $.ajax({
            url: 'node_modules/select2/dist/js/select2.min.js',
            dataType: 'script',
            cache: true
        })
    )
    .done(function(){
        //建構式
        gfLocateBasinNew = function (element, options) {

            this.target = element; //html container
            //this.prefix = pluginName + "_" + this.target.attr('id'); //prefix，for identity
            this.opt = {};
            var initResult = this._init(options); //初始化
            if (initResult) {
                //初始化成功之後的動作
                this._style();
                this._event();
                this._subscribeEvents();

                this.target.trigger('onInitComplete');
            }
        };

        //預設參數
        gfLocateBasinNew.defaults = {
            url: 'http://203.74.124.83/d3_new/php/getBasinNewList.php',
            css: {
                'width': '100%',

                'background-color': '#e3f0db',
                'overflow-y': 'hidden',
                'overflow-x': 'hidden',
            },

            onClick: undefined,
            onInitComplete: undefined

        };

        //方法
        gfLocateBasinNew.prototype = {
            //私有方法
            _init: function (_options) {
                //合併自訂參數與預設參數
                try {
                    this.opt = $.extend(true, {}, gfLocateBasinNew.defaults, _options);
                    return true;
                } catch (ex) {
                    return false;
                }
            },
            _style: function () {
                var o = this;
                o.target.css(o.opt.css);

                var row1 = $('<div/>', { 'class': 'gfLocateBasinNew-Row' });
                var lbl1 = $('<label/>', { 'class': 'gfLocateBasinNew-Label', 'text': '流域' });
                var sel1 = $('<select/>', { 'class': 'gfLocateBasinNew-Select gfLocateBasinNew-Select1' });
                o._getOption({}, "rivername", "rivername", sel1);
                row1.append(lbl1);
                row1.append(sel1);

                var row2 = $('<div/>', { 'class': 'gfLocateBasinNew-Row' });
                var lbl2 = $('<label/>', { 'class': 'gfLocateBasinNew-Label', 'text': '子集水區' });
                var sel2 = $('<select/>', { 'class': 'gfLocateBasinNew-Select gfLocateBasinNew-Select2' });
                row2.append(lbl2);
                row2.append(sel2);

                var row3 = $('<div/>', { 'class': 'gfLocateBasinNew-Row' });
                var btn3 = $('<button/>', { 'class': 'gfLocateBasinNew-Button', 'text': '定位' });
                row3.append(btn3);

                o.target.append(row1);
                o.target.append(row2);
                o.target.append(row3);

                sel1.select2();
                sel2.select2();
            },
            _event: function () {
                var o = this;
                o.target
                    .find('.gfLocateBasinNew-Select1')
                        .change(function(e){
                            o.target.find('.gfLocateBasinNew-Select2').empty();
                            o._getOption({ rivername: o.target.find('.gfLocateBasinNew-Select1').val() }, "subbasinna", "subbasinna", o.target.find('.gfLocateBasinNew-Select2'));
                        })
                        .end()
                    .find('.gfLocateBasinNew-Button')
                        .click(function(e){
                            o._getLatLng({
                                rivername: o.target.find('.gfLocateBasinNew-Select1').val(),
                                subbasinna: o.target.find('.gfLocateBasinNew-Select2').val()
                            });
                        })
                        .end()
            },

            _getOption: function(_data, _valueField, _textField, _container){
                var o = this;
                $.ajax({
                    url: o.opt.url,
                    type: 'POST',
                    data: _data,
                    dataType: 'JSON',
                    success: function(res){
                        var defaultOption = $('<option/>', { value: "請選擇", text: "請選擇" });
                        _container.append(defaultOption);

                        res.forEach(function(data){
                            var option = $('<option/>', { value: data[_valueField], text: data[_textField] });
                            _container.append(option);
                        });
                        _container.select2();
                    }
                })
            },
            _getLatLng: function(_data){
                var o = this;
                $.ajax({
                    url: o.opt.url,
                    type: 'POST',
                    data: _data,
                    dataType: 'JSON',
                    success: function(res){
                        o.target.trigger("onClick", {
                            x: res[0]["x_84"] * 1,
                            y: res[0]["y_84"] * 1,
                            content:
                                o.target.find('.gfLocateBasinNew-Select1 option:selected').text() + " > " +
                                o.target.find('.gfLocateBasinNew-Select2 option:selected').text() + "<br />" +
                                "( " + res[0]['x_84'] + " , " + res[0]['y_84'] + " )"
                        });
                    }
                })
            },
            //註冊事件接口
            _subscribeEvents: function () {
                //先解除所有事件接口
                this.target.off('onClick');
                this.target.off('onInitComplete');
                //綁定點擊事件接口
                if (typeof (this.opt.onClick) === 'function') {
                    this.target.on('onClick', this.opt.onClick);
                }
                if (typeof (this.opt.onInitComplete) === 'function') {
                    this.target.on('onInitComplete', this.opt.onInitComplete);
                }
            }



        };
    });

    //實例化，揭露方法，回傳
    $.fn[pluginName] = function (options, args) {
        var gfInstance;
        this.each(function () {
            gfInstance = new gfLocateBasinNew($(this), options);
        });

        return this;
    };
})(jQuery, window, document);