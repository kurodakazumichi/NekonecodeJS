// Ragamuffin(ラガマフィン)
(function(){
  'use strict';
//==============================================================================
// ネコネコード共通ライブラリマッピング
//==============================================================================
var nnc = NekoNecode;

var cMonitor = {
  create(title, target){
    var obj = Object.create(cMonitor.prototype);
    obj.title  = title;
    obj.target = target;
    obj.D      = {};
    return obj.init();
  },
  prototype:{
    init(){
      this.D.root = $("<div></div>");
      this.D.title = $("<div>"+this.title+"</div>");
      this.D.title.appendTo(this.D.root);
      this.D.view  = $("<div>view</div>");
      this.D.view.appendTo(this.D.root);

      this.D.root.dblclick(function(e){
        this.hide();
      }.bind(this));

      this.D.root.css({border:"1px solid #000", width:200, position:"absolute", backgroundColor:"#fff"});
      this.D.title.css({backgroundColor:"#abcdef", padding:4, fontWeight:"bold"});
      this.D.view.css({padding:"5px"});

      this.update();
      this.D.root.appendTo(document.body);
      this.D.root.draggable();
      this.hide();

      return this;
    },
    update(){
      var tex = "";
      this.D.view.empty();

      for(var k in this.target){

        var t = typeof this.target[k];

        if(t == "function")
          continue;

        if(t == "object" && Array.isArray(this.target[k])){
          var p = $("<p>").add("<span>"+k+":Array</span>");

          var p = $("<p><span>"+k+":</span><a>Array...</a></p>").appendTo(this.D.view);
          p.find("a").css({color:"blue", cursor:"pointer"}).attr("key", k).click(this.clickProp.bind(this));
          p.appendTo(this.D.view);
        }

        else if(t == "object") {
          var p = $("<p><span>"+k+":</span><a>"+this.target[k]+"</a></p>").appendTo(this.D.view);
          p.find("a").css({color:"blue", cursor:"pointer"}).attr("key", k).click(this.clickProp.bind(this));
          p.appendTo(this.D.view);

        }

        else {
          $("<p>").html(`${k}=` + this.target[k]).appendTo(this.D.view);
        }


      }
      this.D.view.find("p").css({margin:0});
    },
    clickProp(e){
      DevonRex.add(this.title+"_"+$(e.target).attr("key"), this.target[$(e.target).attr("key")]).show().css({left:e.pageX, top:e.pageY});
    },
    show(){
      this.D.root.show();
      return this.D.root;
    },
    hide(){
      this.D.root.hide();
      return this.D.root;
    },
  }
};
var DevonRex = {
  D:{},
  monitors:{}, // 監視対象
  tid:null, // タイマー
  create(){
    this.D.wrap = $("<div>");
    this.D.head = $("<div>DevonRex</div>").appendTo(this.D.wrap);
    this.D.list = $("<div>").appendTo(this.D.wrap);

    this.D.button = $("<button>Capture</button>").click(function(e){

      if(this.tid) {
        this.stop();
        this.D.button.text("Capture");
      }

      else {
        this.update();
        this.D.button.text("Stop");
      }

    }.bind(this)).appendTo(this.D.head);
    this.D.wrap.css({position:"absolute", left:10, top:10});

    this.D.wrap.css({
      backgroundColor:"#fff",
      border:"1px solid #000",
    });
    this.D.head.css({
      backgroundColor:"#f00",
      padding:10,
      fontSize:20,
      lineHeight:"20px",
      color:"#fff",
      fontWeight:"bold",
    });
    this.D.list.css({
      padding:5,
      fontSize:14,
      cursor:"pointer",
      textDecoration:"underline",
    });
    this.D.button.css({
      marginLeft:"20px",
      fontSize:20,
    });
    this.D.wrap.draggable();
    this.D.wrap.appendTo(document.body);

    return this;
  },
  add(title, target){
    if(nnc.Fn.undef(this.monitors[title])){
      this.monitors[title] = cMonitor.create(title, target);
      this.updateList();
    }
    return this.monitors[title];
  },
  updateList(){
    this.D.list.empty();
    for(var k in this.monitors){
      var a = $("<a>" + k + "</a><br>").attr("key", k).appendTo(this.D.list);
      a.click(this.clickList.bind(this));
    }
  },
  clickList(e){
    this.monitors[$(e.target).attr("key")].show().css({left:e.pageX, top:e.pageY});
  },

  update(){
    console.log("hoge");
    for(var k in this.monitors){
      this.monitors[k].update();
    }
    this.tid = setTimeout(this.update.bind(this), 1000);
  },
  stop(){
    clearTimeout(this.tid);
  },


};

window.NekoNecode.Cats.set("DevonRex", DevonRex);
console.info("setup NekoNecode.DevonRex");
})();
