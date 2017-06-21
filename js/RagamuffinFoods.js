// RagamuffinFoods(ラガマフィンフード)
(function(){
'use strict';

//==============================================================================
// グローバル
//==============================================================================
var gRag  = null; // Ragamuffinインスタンス
var gFod = null; // RagamuffinFoodsインスタンス

var uGuiHierarchy = {
  create(){
    var obj = Object.create(uGuiHierarchy.prototype);
    return obj;
  },
  prototype:{}
};
//==============================================================================
// ライブラリ本体
//==============================================================================
var RagamuffinFoods = {

  // RagamuffinFoodsオブジェクトを生成する、最初に呼ぶメソッド
  create(ragamuffin){
    var obj = Object.create(RagamuffinFoods.prototype);

    // グローバル空間に登録
    gRag = ragamuffin;
    gFod = obj;
    console.log(gRag);
    uGuiHierarchy.create();
    // 初期化
    obj.init();

    // キー入力によるウィンドウopenのサンプル
    // $(window).keydown(function(e){
    //
    //   if(e.ctrlKey && e.key == "q"){
    //     e.preventDefault();
    //     var i = this.instance;
    //     (i.isShow)? i.hide() : i.show();
    //   }
    // }.bind(this));
    return obj;
  },

  prototype:{
    // 初期化
    init() {
      this.gui = {}; // GUI格納用
      // ローカルストレージに保存する方法
      // console.log(JSON.parse(localStorage.getItem("RagamuffinFoods")));
      // localStorage.setItem("RagamuffinFoods", JSON.stringify(this.toJSON()));
      // メインのSVGにエディター機能を実装する
      // this.setupSvgEditor(gRag.view);
      //
      // $("<button>S</button>").click(function(e){
      //   this.download(JSON.stringify(this.toJSON()));
      //
      // }.bind(this)).appendTo(document.body);
      //
      // // 新規ユニット追加GUIを作成
      // this.gui.unitBuilder = uGUIUnitBuilder.create();
      // this.gui.unitBuilder.show();
    },

    // SVG要素にエディター機能を設定する。
    setupSvgEditor(svg) {
    },
    toJSON(){

      var json = {};

      // 現在のすべてのユニットの情報をJSON化する
      // g.rag.sUnit.map(function(unit){
      //   json[unit.id] = unit;
      // }.bind(this));
      //return json;

      return g.rag.sUnit.childs;
    },
    unit2jsonString(unit) {
      return JSON.stringify(unit);
    },
    download(text){
      var blob = new Blob([text], {type:"text/plain"});
      var uri = URL.createObjectURL(blob);

      var a = $("<a>download</a>").attr({
        href:uri,
        download:"save.txt"
      });
      a.appendTo(document.body);
      a.get(0).click();
      a.remove();
    }

  }
};


window.NekoNecode.Cats.set("RagamuffinFoods", RagamuffinFoods);
console.info("setup NekoNecode.RagamuffinFoods");
})();
