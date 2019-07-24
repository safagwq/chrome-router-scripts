if (!window.console.info) {
    window.console.info = function() {}
};


(function() {
    'use strict';

    // 给白鹭引擎在线预览界面增加保存功能
    (function (){
        
        // ctrl+s自动运行 , 并且缓存
        window.onkeydown=function(e){
            if(e.keyCode==83 && (e.metaKey || e.ctrlKey)){
                e.preventDefault()

                cacheCode()
                document.querySelector('#execute').click()          
            }
        }

        // 恢复上次保存代码的按钮
        var span = document.createElement('span')
        span.className = 'btn-blue pull-right'
        span.innerHTML = '恢复代码'
        span.onclick = function (){
            if(localStorage[location.href]){
                restoreCode()
            }
            else{
                alert('暂无可恢复的代码')
            }
        }
        document.querySelector('#reset').parentElement.appendChild( span )


        // 缓存
        function cacheCode(){
            localStorage[location.href] = lhs.editor.getModel().getValue()
        }

        // 恢复
        function restoreCode(){
            if(localStorage[location.href]){
                lhs.editor.getModel().setValue( localStorage[location.href] )
            }
        }

        // 切换代码时自动覆盖自己缓存的代码
        setTimeout(()=>{
            
            change = function() {
                if(DEFAULT_EXAMPLE=="" || DEFAULT_EXAMPLE==null)
                {
                    return;
                }
                
                WinJS.xhr({
                    url: DEFAULT_EXAMPLE
                }).then(function(xmlHttpReq) {
                    if (state >= SAMPLE_RENDERED) {
                        lhs.editor.getModel().setValue(xmlHttpReq.responseText);
                        lhs.editor.setScrollTop(1);
                        restoreCode()
                    }
                });
            }
        },10)

    })();


    //手机背景图，图片的宽高比(原宽高比0.48759)整张图片的比例
    var whprecent = 0.49437;
    /// 设置 dom 元素
    var treeEle = '#treelist';
    var searchEle = '#search';

    var easytree=$('#treelist').easytree({stateChanged:function(nodes, nodesJson, node){                    
        exampleList=nodes;
        if (node) {
            if (!node.isFolder){
                selectNode=node;
                exampleActivate();
            }else{
                for (var i = 0; i < nodes.length; i++) {
    
                    if (nodes[i].isFolder === true && nodes[i].isExpanded && nodes[i].id!=node.id)
                    {
                        easytree.toggleNode(nodes[i].id);
                    }
                }
            }
        }

        $('#treelist').show();
    }});
    ///search 实例
    var easyext = new easyTreeExtends(easytree);
    ///搜索
    $(searchEle).on("keyup",function (e) {
        
        var val = $(e.target).val().trim();
        // easyext.search("模型");
        if (val) {
            var result = easyext.search(val);
            showSearch( result );
            //隐藏列表
            $(treeEle).hide();
        } else if ( "" === val ) {
            //clear
            clearSearch();
        } else {
            console.warn("input error");
        }
    });
    $(searchEle).on("change",function(e){
            var val = $(e.target).val().trim();            
            if( "" === val ) {   
                //clear              
                clearSearch();
            }
    });
    ///显示搜索结果
    function showSearch( res ) {
        $("#searchResult").html("");
        if( res.length ) {
            for( var i = 0; i < res.length; i ++ ){
                var temp = '<li class="searchResult" ' + 
                            'data-id=' + res[i].id + '>' + 
                            res[i].text + '</li>';
                var html = $.parseHTML( temp );
                $(html).on("click",function(e){
                    clearSearch();
                    var id = $(this).attr("data-id");
                    var node = easytree.getNode( id );  
                    var nodes = easytree.getAllNodes(); 
                    console.log( node );
                    // exampleInit();
                     if (!node.isFolder){
                        window.location.hash = node.filename;       
                        exampleInit();
                    }else{
                        for (var i = 0; i < nodes.length; i++) {
    
                            if (nodes[i].isFolder === true && nodes[i].isExpanded && nodes[i].id!=node.id)
                            {
                                easytree.toggleNode(nodes[i].id);
                            }
                        }
                        easytree.toggleNode( node.id );
                        easytree.activateNode( node.id );
                    }
                });
                $( "#searchResult" ).append( html );
            }
        } else {
            console.warn("none result");
        }
    }
    function clearSearch() {
        //显示列表,隐藏结果
        $(treeEle).show();
        $("#searchResult").html("");
        return false;
    }
    
    var wrapper = document.getElementById('wrapper');
    var lhs = {
        domNode: document.getElementById('typescriptEditor'),
        editor: null
    };
    var DEFAULT_EXAMPLE = "";
    var IDLE_STATE = 0,
        EDITORS_RENDERED = 1,
        SAMPLE_RENDERED = 2,
        SAMPLE_COLORED = 3,
        SAMPLE_COMPILED = 4,
        FINISHED = 5,
        state = IDLE_STATE;
    // ------------ Loading logic
    (function() {
        var editorLoaded = false,
            typescriptModeLoaded = false,
            javascriptModeLoaded = false,
            sampleLoaded = false;
        var typescriptMode = null,
            javascriptMode = null,
            sample = '';
        require(['vs/editor/editor.main', 'vs/nls!vs/editor/editor.main', 'vs/css!vs/editor/editor.main'], function() {
            editorLoaded = true;
            Monaco.Editor.getOrCreateMode('text/typescript').then(function(mode) {
                typescriptModeLoaded = true;
                typescriptMode = mode;
                onSomethingLoaded();
            });
            onSomethingLoaded();
        });
        (function() {

            function loadDefault() {
                sampleLoaded = true;
                exampleInit();
                onSomethingLoaded();
            }

            loadDefault();
        })();

        function onSomethingLoaded() {
            if (state === IDLE_STATE && editorLoaded) {
                lhs.editor = Monaco.Editor.create(lhs.domNode, {
                    value: '',
                    mode: 'text/plain',
                    fontIsMonospace: true,
                    suggestOnTriggerCharacters: true,
                    showTypeScriptWarnings: false
                });
                state = EDITORS_RENDERED;
                console.info('yeditors rendered @ ' + ((new Date()).getTime() - startTime) + 'ms');
            }
            if (state === EDITORS_RENDERED && sampleLoaded) {
                lhs.editor.getModel().setValue(sample);
                state = SAMPLE_RENDERED;
                console.info('xsample rendered @ ' + ((new Date()).getTime() - startTime) + 'ms');
            }
            if (state === SAMPLE_RENDERED && typescriptModeLoaded) {
                lhs.editor.getModel().setValue(lhs.editor.getModel().getValue(), typescriptMode);
                console.info('sample colored @ ' + ((new Date()).getTime() - startTime) + 'ms');
                console.info('starting compilation @ ' + ((new Date()).getTime() - startTime) + 'ms');
                lhs.editor.addListener("change", function() {
                });
                state = SAMPLE_COMPILED;
                console.info('sample compiled @ ' + ((new Date()).getTime() - startTime) + 'ms');
            }
        }
    })();

    function change() {
        if(DEFAULT_EXAMPLE=="" || DEFAULT_EXAMPLE==null)
        {
            return;
        }
        
        WinJS.xhr({
            url: DEFAULT_EXAMPLE
        }).then(function(xmlHttpReq) {
            if (state >= SAMPLE_RENDERED) {
                lhs.editor.getModel().setValue(xmlHttpReq.responseText);
                lhs.editor.setScrollTop(1);


            }
        });
    }
    // ------------ Resize logic
    function resize() {
        // incorporate header and footer and adaptive layout
        var headerSize = 0; // 120
        var footerSize = 70;
        var horizontalSpace = 10;
        var wrapperSizeDiff = headerSize + footerSize;
        var windowHeight = window.innerHeight || document.body.offsetHeight || document.documentElement.offsetHeight;
        wrapper.style.height = (windowHeight - wrapper.offsetTop - wrapperSizeDiff) + "px";
        var halfWidth = Math.floor((wrapper.clientWidth - 40) / 2) - 8;
        halfWidth -= (horizontalSpace / 2);
        // Layout lhs
        //var lhsSizeDiff = wrapperSizeDiff + 40;
        var lhsSizeDiff = wrapperSizeDiff+40;
        if(navigator.userAgent.match(/(iPhone|iPod|Android|ios)/i)){
            $("#playground-host").css("margin-left",25);
            $("#playground-host").css("margin-right",20);
        }
        lhs.domNode.style.width = '100%'; // halfWidth + "px";
        lhs.domNode.style.height = (windowHeight - wrapper.offsetTop - lhsSizeDiff) + "px";
        console.log(lhs.domNode.style.height);
        if (lhs.editor) {
            lhs.editor.layout();
        }
    }

    window.onresize = function(){
        resize();
        codeResultResize();
    };
    resize();
    change();
    // ------------ Execution logic
    var _move=false;
    var _x,_defaultX;
    var playground_host_width;
    var playground_result_width;
    codeResultResize();
    function codeResultResize(){

        $("#treelist").height(lhs.domNode.style.height);
        $("#screen").height(lhs.domNode.style.height);
        $("#playground-result").height(lhs.domNode.style.height);
        $("#playground-result").height($("#playground-result").height()-2);
        var bili=640/$("#playground-result").width();
        //$("#popiframe").css({width:640/bili});
        //$("#popiframe").css({height:960/bili});
        //if($("#treelist").height()<458)
        //{
        console.log($(".coderesult").outerWidth(),$("#treelist").height()); 
        
        var codeResWidht = $(".coderesult").outerWidth();
        var codeResHeight = $("#treelist").height();
        
        var scale = codeResWidht / codeResHeight;
        //cww内容宽度占总体高度比例，chh高度占总体比例,offsetTop顶部offset,titleoffset文字offset,titlehight文字行高,fontsize文字字体大小
        var ss = {
            chh:0.632,
            cww:0.8579,
            cww2:0.860,
            offsetTop:0.109,
            offsetLeft:0.063775,
            offsetLeft2:0.06870,
            titleoffset:0.145,
            titlehight:0.089333,
            fontsize:0.02729
        }

        if( scale > whprecent) {
            var poph = codeResHeight;
            //原始图片比例 宽|高 0.845 0.7418
            var popw = whprecent * poph * ss.cww;
            console.log("宽屏",popw,poph,whprecent,poph * ss.chh);
            $("#popiframe").css({
                "width": popw,
                "margin-left": (codeResWidht - whprecent * poph * ss.cww) / 2,
                "height":poph * ss.chh,
                "margin-top": (poph * (1-ss.chh) + poph * ss.offsetTop )/ 2 
            });
            $(".poptitle").css(
                {
                    "width":  popw * ss.cww2,
                    "top": poph * ss.titleoffset,
                    "line-height": poph * ss.titlehight + "px",
                    "font-size": Math.floor(ss.fontsize * poph)+ "px",
                    "left":(codeResWidht - popw * ss.cww) / 2,
                }
            )
      
        } else {
            var popw = codeResWidht;
            var poph = popw / whprecent;
            $("#popiframe").css({
                "width": popw * ss.cww2,
                "margin-left":(codeResWidht - popw * ss.cww) / 2,
                "height":poph * ss.chh,
                "margin-top": (codeResHeight - poph * ss.chh + poph * ss.offsetTop) / 2
            });
            $(".poptitle").css(
                {
                    "width":  popw * ss.cww2,
                    "top": (codeResHeight - poph) / 2 + poph * ss.titleoffset,
                    "line-height": poph * ss.titlehight + "px",
                    "font-size": Math.round(ss.fontsize * poph)+ "px",
                    "left":(codeResWidht - popw * ss.cww) / 2,
                }
            )
        }
        $("#erweima").css({
            "right": (codeResWidht - 118) / 2
        });
        $("#qrcode").css({
            "right": (codeResWidht - 118) / 2
        });
        ///qr module css 
        $(".coderesult .qrpopmodule").css({
            width:$("#popiframe").width(),
            height:$("#popiframe").height() + $(".poptitle").height(),
            left:$("#popiframe").css("margin-left"),
            top:Math.floor($("#popiframe").css("margin-top").slice(0,-3)) - $(".poptitle").height()
        });
    }
    $("#screen").on("mousedown",function(e){
        _move=true;  
        _defaultX=$("#screen").position().left;
        //_x=e.pageX-_defaultX;  
        _x=e.pageX;
        $("#screen").fadeTo(20, 0.5);
        playground_host_width=$("#playground-host").width();
        playground_result_width=$("#playground-result").width();

    });
    $("#screen").on("mousemove",function(e){
        if(_move){  
            var x=e.pageX-_x;
            //调整比例
            var bili=$("#playground-right").width()/100;
            $("#playground-host").css({width:(playground_host_width+x)/bili+"%"});
            $("#playground-result").css({width:(playground_result_width-x)/bili+"%"});
            resize();
            codeResultResize();

        }  
    });
    $("#screen").on("mouseup",function(e){
        _move=false;  
        $("#screen").fadeTo("fast", 1);//松开鼠标后停止移动并恢复成不透明   
    });
    $("#screen").on("mouseout",function(e){
        _move=false;  
        $("#screen").fadeTo("fast", 1);//松开鼠标后停止移动并恢复成不透明   
    });
    
    
    
    function exampleInit(){
        
        var anchor=window.location.hash;
        if(!anchor){
            anchor = "010-disp-basic";
        }
        anchor=anchor.replace(/#/ig,""); 
        for (var i = 0; i < exampleList.length; i++) {
            for(var j = 0;j<exampleList[i].children.length; j++)
            {
                if(exampleList[i].children[j].filename==anchor)
                {
                    easytree.toggleNodes(exampleList[i]);
                    easytree.activateNode(exampleList[i].children[j].id);
                    selectNode=exampleList[i].children[j];
                    exampleActivate();
                    return;
                }
            }
        }
        
    }
    
    function exampleActivate(){ 
//      if (!selectNode.run) {
//          $("#execute").addClass("disabled"); 
//      }
        document.getElementById("exampleTitle").innerText=selectNode.text;
        $(".poptitle").text(selectNode.text);
        DEFAULT_EXAMPLE = examplePath+selectNode.filename+"/src/Main.ts";
        location.hash="#"+selectNode.filename; 
        change();
        exampleDisplay();
        setExampleQrcode(examplerelease+examplePath+selectNode.filename+"/bin-release/web/"+selectNode.release+"/");
        checkStyle();
    }
    
    function exampleDisplay(){
        document.getElementById("playground-result").style.backgroundImage=""; 
        document.getElementById("playground-result").style.backgroundColor="";
        document.getElementById("playground-result").style.backgroundSize="";
        if(selectNode.backgroundColor==undefined || selectNode.backgroundColor===""){
            selectNode.backgroundColor="rgba(47, 79, 79, 0)";
        }else if(selectNode.backgroundColor.length<=3)
        {
            //document.getElementById("playground-result").style.backgroundImage="url("+examplePath+"bg/"+selectNode.backgroundColor+".jpg)";
            document.getElementById("popiframe").style.backgroundImage="url("+examplePath+"bg/"+selectNode.backgroundColor+".jpg)";

            //document.getElementById("popiframe").style.backgroundSize="cover";
        }else{
            document.getElementById("playground-result").style.backgroundColor=selectNode.backgroundColor;
        }
        
        document.getElementById("popiframe").src= examplePath+selectNode.filename+"/bin-release/web/"+selectNode.release+"/index.html";
    }
    /*注释掉说明
    document.getElementById("exampleDes").onclick = function(e) {
        $('#exampleDes').popover('hide');
        e.stopPropagation();
        e.stopImmediatePropagation();
        $.ajax({
            type:"get",
            url:examplePath+selectNode.filename+"/README.md",
            async:true,
            success: function(data){
                $('.modal-body').html(data);
                $('.bs-example-modal-md').modal('show');
            }
        });
    }
    */
    document.getElementById("reset").onclick = function() {
        exampleActivate();
    }
    
    document.getElementById("down").onclick = function() {
        window.open( examplePath+selectNode.filename+"/"+selectNode.zip);
    }
    
    document.getElementById("execute").onclick = function() {
        try {
            var model = lhs.editor.getModel(),
                mode = model.getMode();
                mode.getEmitOutput(model.getAssociatedResource(), 'js').then(function(output) {
                if (output && typeof output.content === "string") {
                    var call=function(data) {
                        if(selectNode.log==="true")
                            $(this.contentDocument.body).find(".egret-player").attr("data-show-log","true");
                        if(selectNode.rect==="true")
                            $(this.contentDocument.body).find(".egret-player").attr("data-show-paint-rect","true");
                        if(selectNode.fps==="true")
                            $(this.contentDocument.body).find(".egret-player").attr("data-show-fps","true");
                            
                        output.content=output.content.replace(/resource\//g, examplePath+selectNode.filename+"/resource/");
                        var script = this.contentDocument.createElement("script");
                        script.textContent = output.content;
                        this.contentDocument.body.appendChild(script);
                        if(this.contentWindow.init)
                            this.contentWindow.init();
                        
                    };
                    if($(window).width()<999){
                        mobileExecute(call);
                    }else{
                        pcExecute(call);
                    }
                    codeResultResize();
                }
            }, function(err) {
                if (err.name === 'Canceled') {
                    return;
                }
                console.error(err);
            });
        } catch (e) {
            console.log("Error from compilation: " + e + "  " + (e.stack || ""));
        }
    };
    

    $("#erweima").on("click",function(){
        if($("#qrcode").is(":hidden")){
            $("#qrcode").fadeIn("fast");    
            $("#qrcode").parent().fadeIn("fast");   
        }else{
          $("#qrcode").fadeOut("fast");
          $("#qrcode").parent().fadeOut("fast");
        }
    });
    
    function pcExecute(call){
        var inntHtml='<iframe id="popiframe" allowfullscreen="true" src=""></iframe>';
        $("#popiframe").remove();
        $(".coderesult").append(inntHtml);
        $("#popiframe").attr("src","/cn/example/page/examples/egret/index.html?v=0.1");
        $("#popiframe").load(call);

        if(selectNode.backgroundColor==undefined || selectNode.backgroundColor===""){
            selectNode.backgroundColor="rgba(47, 79, 79, 0)";
        }else if(selectNode.backgroundColor.length<=3)
        {
            document.getElementById("popiframe").style.backgroundImage="url("+examplePath+"bg/"+selectNode.backgroundColor+".jpg)";
        }else{
            document.getElementById("playground-result").style.backgroundColor=selectNode.backgroundColor;
        }
    }
    
    function mobileExecute(call){
        popWin.showWin("386", "580", selectNode.text, "/cn/example/page/examples/egret/index.html?v=0.1", call);
    }
    
    function setExampleQrcode(url){
            $("#qrcode").hide();
            $("#qrcode").parent().hide();
            document.getElementById("qrcode").innerHTML="";
            document.getElementById("qrcode").innerText="";
            var qrcode = new QRCode(document.getElementById("qrcode"), {
            width : 120,
            height : 120
            });
            qrcode.clear();
            qrcode.makeCode(url);
    }
    
    function checkStyle(){
        if($("#debugshowstyle"))
        {
            $("#debugshowstyle").remove();
        }
        var style = document.createElement("style");
        style.id="debugshowstyle";
        var openStyle = '.monaco-editor .redsquiggly {background: url("Script/vs/editor/browser/widget/media/red-squiggly.svg") repeat-x bottom left;}.decorationsOverviewRuler{display:block;}';
        var closeStyle = '.monaco-editor .redsquiggly {background: url("Script/vs/editor/browser/widget/xxx-squiggly.svg") repeat-x bottom left;}.decorationsOverviewRuler{display:none;}';
        
        if(selectNode.run=="true"){
            
            $("#execute").removeAttr("disabled");
            
            //禁用重置按钮        
            $("#reset").removeAttr("disabled");
        }else{
            
            $("#execute").attr("disabled","disabled");
            
            //禁用重置按钮        
            $("#reset").attr("disabled","disabled");
        }
        if(!selectNode.monaco_editor_debug || selectNode.monaco_editor_debug=="true"){
            style.innerHTML = openStyle; 
        }else{
            style.innerHTML = closeStyle; 
        }
        document.head.appendChild(style);
    }
    
})();