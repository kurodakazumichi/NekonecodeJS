// RagamuffinFoods(ラガマフィンフード)
(function(){
'use strict';

//==============================================================================
// ライブラリ内グローバル
//==============================================================================
var g = {
  rag :null, // Ragamuffinインスタンス
  food:null, // RagamuffinFoodsインスタンス
};

//==============================================================================
// 各種スタイルの情報をまとめたオブジェクト(定数扱い)
//==============================================================================
var STYLE = {};
STYLE.SVG = { // SVGの基本設定
  w:50,
  h:50,
  get vb() {return [0, 0, 150, 150]}
};
STYLE.UNIT_BUILDER = { // 新規ユニット追加GUIのスタイル
  ROOT:{               // 全体
    border:"1px solid #444",
    width:360,
    position:"absolute",
    // top:0,
    backgroundColor:"#fff"
  },
  HEADER:{             // ヘッダー部分
    backgroundColor:"#abcdef",
    borderBottom:"1px solid #000",
    padding:5,
    cursor:"move",
  },
  CONTAINER:{          // コンテナ部分
    width:"100%"
  },
  BUILD_BUTTON:{       // 作成ボタン
    border:"1px solid #bbb",
    display:"inline-block",
    borderRadius:5,
    margin:4,
    width :STYLE.SVG.w,
    height:STYLE.SVG.h,
    backgroundColor:"#fff",
    cursor:"pointer"
  },
  BUILD_BUTTON_HOVER:{ // 作成ボタン(hover時)
    border:"1px dashed #333",
    backgroundColor:"#aabbcc",
  },
};

//==============================================================================
// SVG要素を生成するビルダー
//==============================================================================
var sSvgBuilder = {
  CATALOG: [ // サポートしている図形の一覧を定義する事
    "circle", "box"
  ],
  snap(){      // 共通のsvg要素を生成する
    return Snap(STYLE.SVG.w, STYLE.SVG.h)
      .attr({viewBox:STYLE.SVG.vb});
  },
  circle(){    // circleのsvg要素を生成する。
    var s = this.snap();
    var c = s.circle(50, 50, 45).attr({fill:"white", stroke:"black"});
    return this.wrap(s, s.g(c));
  },
  box(){       // boxのsvg要素を生成する
    var s = this.snap();
    var r = s.rect(5, 5, 40, 40).attr({fill:"white", stroke:"black"});
    return this.wrap(s, s.g(r));
  },
  wrap(s, g) { // 最終的な成果物を生成する
    return {root:s, g0:g};
  }
};

//==============================================================================
// ライブラリ本体
//==============================================================================
var RagamuffinFoods = {

  // RagamuffinFoodsオブジェクトを生成する、最初に呼ぶメソッド
  create(ragamuffin){
    var obj = Object.create(RagamuffinFoods.prototype);

    // グローバル空間に登録
    g.rag  = ragamuffin;
    g.food = obj;

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
      this.setupSvgEditor(g.rag.view);

      $("<button>S</button>").click(function(e){
        this.download(JSON.stringify(this.toJSON()));

      }.bind(this)).appendTo(document.body);

      // 新規ユニット追加GUIを作成
      this.gui.unitBuilder = uGUIUnitBuilder.create();
      this.gui.unitBuilder.show();
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

//==============================================================================
// 新しいユニットを追加するGUIユニット
//==============================================================================
var uGUIUnitBuilder = {
  create(){
    // 既に作られていたらそのインスタンスを返却
    if(this.instance)
      return this.instance;

    // 新規ユニット追加GUIを生成
    this._instance = Object.create(uGUIUnitBuilder.prototype);
    this.instance.init();
    return this.instance;
  },

  // シングルトンとしてふるまわせたいのでClassにinstanceを保持。
  _instance:null,
  get instance () { return this._instance; },

  prototype:{
    init(){                 // GUI内部の要素を生成する。
      // メンバの初期化
      this.D = {};
      this.D.buildButtons = {};

      // ツールウィンドウを生成する
      this.initRootNode()
        .initHeaderNode("Units")
        .initContainerNode();

      // body要素へ登録
      this.D.root.appendTo(document.body);
    },
    initRootNode(){         // ROOTノードを作成
      this.D.root = $("<div>").css(STYLE.UNIT_BUILDER.ROOT);
      return this;
    },
    initHeaderNode(title) { // ROOT > HEADERノードを作成
      this.D.header = $("<div>"+title+"</div>")
        .appendTo(this.D.root)
        .css(STYLE.UNIT_BUILDER.HEADER);

      return this;
    },
    initContainerNode() {   // ROOT > CONTAINERノードを作成
      this.D.container = $("<div>")
        .appendTo(this.D.root)
        .css(STYLE.UNIT_BUILDER.CONTAINER);

      return this.initBuildButtons();
    },
    initBuildButtons() {    // ROOT > CONTAINER > BUILD BUTTONノードを作成
      for(var type of sSvgBuilder.CATALOG){
        this.D.buildButtons[type] = uGUIUnitBuilder.uBuildButton.create(type);
        this.D.buildButtons[type].root.appendTo(this.D.container);
      };
      return this;
    },
    show(){ // 表示する
      this.D.root.css("display", "block");
    },
    hide(){ // 非表示にする
      this.D.root.css("display", "none");
    },
    get isShow(){ // 表示されているかどうか
      return (this.D.root.css("display") == "block");
    }
  },

  //----------------------------------------------------------------------------
  // ユニットを生成するボタン
  // DOM構成：<a><svg>...<svg></a>
  // D.root ：<a>
  // D.svg  ：<svg>
  //----------------------------------------------------------------------------
  uBuildButton:{
    create(type){
      var b = Object.create(uGUIUnitBuilder.uBuildButton.prototype);
      b.init(type);
      return b;
    },
    prototype:{
      init(type){ // ボタンの要素生成や、イベントの設定を行う
        this.D = {}; // DOM格納用

        // rootのaタグ生成
        this.D.root = $("<a title='"+type+"'></a>").css(STYLE.UNIT_BUILDER.BUILD_BUTTON);

        // a > svgタグを生成
        this.D.svg = sSvgBuilder[type]();
        this.D.svg.root.appendTo(this.D.root.get(0));

        // イベントの設定
        this.initHoverFunc().initClickFunc();
      },
      initClickFunc(){ // Viewerに図形を挿入する
        this.root.click(function(e){
          var geom = this.geom.clone();
          geom.drag();

          console.log(geom);
          g.rag.sUnit.addGeom(geom);
          g.rag.sUnit.apply();
        }.bind(this));
        return this;
      },
      initHoverFunc(){ // ホバー時にボタンのスタイルを変更する
        this.root.hover(
          function(e){
            $(this).css(STYLE.UNIT_BUILDER.BUILD_BUTTON_HOVER);
          },
          function(e){
            $(this).css(STYLE.UNIT_BUILDER.BUILD_BUTTON);
          }
        );
        return this;
      },
      get root(){ // ROOTノードへのアクセッサ
        return this.D.root;
      },
      get geom() { // メインの図形ノードへのアクセッサ
        return this.D.svg.g0;
      }
    }
  },

  // GUIウィンドウを閉じるボタン
  uCloseButton:{
    create(){
      var b = Object.create(uGUIUnitBuilder.uCloseButton.prototype);
      return b;
    },
    prototype :{

    }
  },

};

window.NekoNecode.Cats.set("RagamuffinFoods", RagamuffinFoods);
console.info("setup NekoNecode.RagamuffinFoods");
})();
