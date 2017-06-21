// Ragamuffin(ラガマフィン)
(function(){
  'use strict';
//==============================================================================
// ネコネコード共通ライブラリマッピング
//==============================================================================
var nnc = NekoNecode;

//==============================================================================
// ライブラリ内グローバル
//==============================================================================
var g = {};

//==============================================================================
// 静的クラス
//==============================================================================
// プリミティブ
var Prim = {
  rect(){ // rectプリミティブを生成する
    return cPrim.create("rect");
  },
  text(){ // textプリミティブを生成する
    return cPrim.create("text");
  },
  elps(){ // 楕円プリミティブを生成する
    return cPrim.create("ellipse");
  },
  path(){ // パスプリミティブを生成する
    return cPrim.create("path");
  }
};

// ジオメトリ
var Geom = {
  type:{
    BOX    : 0,
    CIRCLE : 1,
    TEXT   : 2,
    STAR   : 3,
    PATH   : 4,
  },
  create(type, attr){
    switch(type){
      case this.type.BOX    : return this.box(attr);
      case this.type.CIRCLE : return this.circle(attr);
      case this.type.TEXT   : return this.text(attr);
      case this.type.STAR   : return this.star(attr);
      case this.type.PATH   : return this.path(attr);
    }
  },
  box(attr){ // 図形：ボックスを生成する
    return cGeom.create(attr).add({
      main:[Prim.rect(), "applyRect"],
      text:[Prim.text(), "applyText"]
    });
  },
  circle(attr){ // 図形：円を生成する
    return cGeom.create(attr).add({
      main:[Prim.elps(), "applyCircle"],
      text:[Prim.text(), "applyText"]
    });
  },
  text(attr){ // 図形：テキストを生成する
    return cGeom.create(attr).add({
      main:[Prim.text(), "applyText"]
    });
  },
  star(attr){ // 図形：星を生成する
    return cGeom.create(attr).add({
      main:[Prim.path(), "applyPath"],
      text:[Prim.text(), "applyText"]
    });
  },
  path(attr){ // 図形：パスを生成する
    return cGeom.create(attr).add({
      main:[Prim.path(), "applyPath"],
    });
  },
};

// ユニット
var Unit = {
  type:{
    BOX     : 0,
    CIRCLE  : 1,
    TEXT    : 2,
    STAR    : 3,
    LINE    : 4,
    CLINE   : 5,
    ARK     : 6,
    GRID    : 7,
  },
  create(id, type, attr={}){
    switch(type){
      case this.type.BOX     : return cUnit.create().init(id, type, attr, {main:Geom.type.BOX});
      case this.type.CIRCLE  : return cUnit.create().init(id, type, attr, {main:Geom.type.CIRCLE});
      case this.type.TEXT    : return cUnit.create().init(id, type, attr, {main:Geom.type.TEXT});
      case this.type.STAR    : return cUnit.create().init(id, type, attr, {main:Geom.type.STAR});
      case this.type.LINE    : return cUnit.create().init(id, type, attr, {main:Geom.type.PATH});
      case this.type.CLINE   : return cUnit.create().init(id, type, attr, {main:Geom.type.PATH});
      case this.type.ARK     : return cUnit.create().init(id, type, attr, {main:Geom.type.PATH});
      case this.type.GRID    : return cUnit.create().init(id, type, attr, {main:Geom.type.PATH});
    }
    nnc.Log.error("定義されていないUnitが指定された。");
  },
};

// パラメーター、ユニットのタイプで何が作られるかが決まる。
var Param = {
  create(type, attr){ // ユニットのタイプに対応したパラメーターを生成
    switch(type){
      case Unit.type.BOX     : return cParamRect.create().init(attr);
      case Unit.type.CIRCLE  : return cParamCircle.create().init(attr);
      case Unit.type.TEXT    : return cParamText.create().init(attr);
      case Unit.type.STAR    : return cParamStar.create().init(attr);
      case Unit.type.LINE    : return cParamLine.create().init(attr);
      case Unit.type.CLINE   : return cParamCline.create().init(attr);
      case Unit.type.FIXLINE : return cParamFixedLine.create().init(attr);
      case Unit.type.ARK     : return cParamArk.create().init(attr);
      case Unit.type.GRID    : return cParamGrid.create().init(attr);
      default      : return cParam.create().init(attr);
    }
    // ここに到達したらエラー
    nnc.Log.error("存在しないパラメータタイプが指定された。");
  },
};

// イージング
var Fn = {
  ease(method, a, b, t){
    return nnc.Easing.ease(method, a, b, t);
  }
};

//==============================================================================
// リスト管理
//==============================================================================
// 複数のプリミティブをまとめて管理するクラス
var cPrims = {
  create(){
    var obj = Object.create(cPrims.prototype);
    obj.prims = {};
    obj.attrFuncNames = {};
    return obj;
  },
  prototype:{
    // 引数はプリミティブオブジェクトと属性適用時に使用するメソッド名を渡す。
    // prims = {
    //   id1:[primitive object, attribute apply method name]
    //   id2:[primitive object, attribute apply method name]
    //   ....
    // }
    add(prims){
      for(var id in prims){
        this.prims[id]         = prims[id][0]; // プリミティブオブジェクト
        this.attrFuncNames[id] = prims[id][1]; // 属性適用時に使用する関数名
      }
    },
    apply(attr){
      for(var id in this.prims){
        var func = this.attrFuncNames[id];
        // var a = attr[func]();
        // this.prims[id].attr(a);
        attr[func](this.prims[id]); // visiterパターンに変更
      }
    },
    map(f){
      for(var id in this.prims){
        f(id, this.prims[id]);
      }
    },
  },
};

// 複数のジオメトリをまとめて管理するクラス
var cGeometories = {
  create(){
    var obj = Object.create(cGeometories.prototype);
    obj.childs = {};
    obj.attr   = null;
    obj.group  = g.rag.view.group();
    return obj;
  },
  prototype:{
    init(attr){
      this.attr = attr;
      return this;
    },
    add(id, geom){
      this.childs[id] = geom;
      geom.prims.map(function(id, prim){
          this.group.add(prim.node);
      }.bind(this));
      return this;
    },
    apply(){
      this.map(function(geom){ geom.apply(); })

    },
    applyAfter(){
      this.attr.transform(this.group);
      this.group.attr(this.attr.toAttrGroup());
      this.attr.applyAfter();
    },
    map(f){
      for(var k in this.childs){
        f(this.childs[k]);
      }
    },
    remove(){
      this.group.remove();
    },
    append(){
      this.group.appendTo(g.sRender.getTargetView());
    },
  },
};

//==============================================================================
// 形状クラス
//==============================================================================
// プリミティブクラス
// 矩形、円、テキスト、星など単一で形状を成すものをプリミティブと定義する
var cPrim = { // プリミティブの基底
  // プリミティブを生成する、実際にsvgの子要素が生成される。
  // type:rect,circle,text,pathといったsvgの要素を指定
  // attr:svg要素の属性オブジェクトを指定
  create(type, attr={}){
    var obj = Object.create(cPrim.prototype);
    obj.attributes = null;
    obj.type       = type;
    obj.node       = g.rag.view[type](attr);
    return obj;
  },
  prototype:{
    attr(a) {
      this.attributes = a;
      // Object.assign(this.attributes, a);
      return this.apply();
    },
    apply() { // svg elementの属性値に適用する
      this.node.attr(this.attributes);
      return this;
    },
    remove(){
      this.node.remove();
    },
  }
};

// ジオメトリクラス
// 複数のプリミティブから構成される図形
var cGeom = {
  create(attr){
    var obj = Object.create(cGeom.prototype);
    obj.attr  = attr;
    obj.prims = cPrims.create();
    return obj;
  },
  prototype:{
    add(prims){
      this.prims.add(prims);
      return this;
    },
    apply(){ // プリミティブに属性の内容を適用する
      this.prims.apply(this.attr);
      return this;
    },
  }
};

// ユニットクラス
// １つ、または１つ以上のジオメトリから構成される、主たるクラス。
var cUnit = { // Unitの基底
  create(){
    var obj = Object.create(cUnit.prototype);
    obj.id     = null;
    obj.type   = null;
    obj.attr   = null;
    obj.isDraw = true;
    obj.geoms  = cGeometories.create();

    return obj;
  },
  prototype:{
    //==========================================================================
    // 初期化関連

    // ユニットを初期化する
    // id    :ユニットを識別するための一意の値
    // type  :このタイプから生成する属性やユニットの種別を判断する。
    // attr  :最終的にプリミティブの属性に指定される
    // geoms :ユニットを構成する図形を生成するためのデータ
    init(id, type, attr, geoms){
      this.setId(id).setType(type).createAttr(attr).createGeoms(geoms);

      return this;
    },
    createAttr(attr){ // 属性クラスのインスタンスを生成
      this.attr = Param.create(this.type, attr);
      return this;
    },
    createGeoms(geoms){ // ユニットを構成する図形を生成。
      this.geoms.init(this.attr);
      for(var id in geoms){
        var type = geoms[id];
        this.geoms.add(id, Geom.create(type, this.attr));
      }
    },

    //==========================================================================
    // アクセッサ
    setId(id){
      this.id = id;
      return this;
    },
    setType(type){
      this.type = type;
      return this;
    },
    setDraw(isDraw){
      if(this.isDraw == isDraw) return;
      this.isDraw = isDraw;
      (isDraw)? this.geoms.append() : this.geoms.remove();
    },

    //==========================================================================
    // 主要メソッド
    update(from, to, t){ // 属性の内容を補間する。
      this.attr.lerp(from, to, t);
    },
    apply(){ // 属性値を見た目に適用する
      this.geoms.apply();
    },
    applyAfter(){ // 属性値が適用され描画された後に呼ばれる。
      this.geoms.applyAfter();
    },
    remove(){ // 要素をViewから切り離す、実際に削除はされないので注意
      this.geoms.remove();
    },
  },
};

//==============================================================================
// 特徴毎に属性をまとめたもの
//==============================================================================
var cAttr = {
  create(){
    var obj = Object.create(cAttr.prototype);
    return obj;
  },
  prototype:{
    // 安全な値を選ぶ
    pick(list, safe) {
      var undef = nnc.Fn.undef;
      for(var val of list){
        if(!undef(val)) return val;
      }
      return safe;
    },
    // 固定的なパラメータの選出
    // 補間できないようなパラメーターは原則fromを使用するが
    // ページの終わりにいる場合はtoを採用する。
    pickFixed(from, to){
      return (g.sNote.isEndPage)? to : from;
    }
  }
}; // 属性基底

var cAttrCommon = { // 共通属性
  create(){
    var obj = Object.create(cAttrCommon.prototype);
    // プロパティおよび初期値を定義
    obj.opacity = 1; // 透過度
    obj.angle   = 0; // 回転角度
    obj.acx     = 0; // 回転軸座標X
    obj.acy     = 0; // 回転軸座標Y

    // 補間タイプ
    obj.easeOpacity = "linear";
    obj.easeAngle   = "linear";
    return obj;
  },
  prototype:{
    init(a){
      // 未定義ならなにもしない
      if(nnc.Fn.undef(a)) return this;

      // 透過度
      this.opacity = this.pick([a.opacity], this.opacity);

      // 回転
      this.angle = a.angle || this.angle;
      this.acx   = a.acx   || this.acx;
      this.acy   = a.acy   || this.acy;

      // イージング
      this.easeOpacity = a.easeOpacity || this.easeOpacity;
      this.easeAngle   = a.easeAngle   || this.easeAngle;

      return this;
    },
    lerp(from, to, t){
      // イージング
      this.easeOpacity = from.easeOpacity;
      this.easeAngle   = from.easeAngle;
      // 補間
      this.opacity = Fn.ease(this.easeOpacity, from.opacity, to.opacity, t);
      this.angle   = Fn.ease(this.easeAngle, from.angle, to.angle, t);
      this.acx     = Fn.ease("linear", from.acx, to.acx, t);
      this.acy     = Fn.ease("linear", from.acy, to.acy, t);
    },
  },
};
Object.setPrototypeOf(cAttrCommon.prototype, cAttr.prototype);

var cAttrRect = { // 矩形属性
  create(){
    var obj = Object.create(cAttrRect.prototype);
    obj.x  = 0;
    obj.y  = 0;
    obj.w  = 0;
    obj.h  = 0;
    obj.rx = 0;
    obj.ry = 0;
    obj.easeXY = "linear";
    obj.easeWH = "linear";
    obj.easeR  = "linear";
    return obj;
  },
  prototype:{
    init(a){
      if(nnc.Fn.undef(a)) return this;
      this.x      = a.x || this.x;
      this.y      = a.y || this.y;
      this.w      = a.w || this.w;
      this.h      = a.h || this.h;
      this.rx     = a.rx || a.r || this.rx;
      this.ry     = a.ry || a.r || this.ry;
      this.easeXY = a.easeXY || this.easeXY;
      this.easeWH = a.easeWH || this.easeWH;
      this.easeR  = a.easeR  || this.easeR;
      return this;
    },
    lerp(from, to, t){
      // イージング
      this.easeXY = from.easeXY;
      this.easeWH = from.easeWH;
      this.easeR  = from.easeR;

      // 補間
      this.x  = Fn.ease(this.easeXY, from.x, to.x, t);
      this.y  = Fn.ease(this.easeXY, from.y, to.y, t);
      this.w  = Fn.ease(this.easeWH, from.w, to.w, t);
      this.h  = Fn.ease(this.easeWH, from.h, to.h, t);
      this.rx = Fn.ease(this.easeR,  from.rx, to.rx, t);
      this.ry = Fn.ease(this.easeR,  from.ry, to.ry, t);
    },
    toAttr(){
      return {
        x:this.x, y:this.y,
        width:Math.abs(this.w), height:Math.abs(this.h),
        rx:Math.abs(this.rx), ry:Math.abs(this.ry)
      };
    },
  },
};
Object.setPrototypeOf(cAttrRect.prototype, cAttr.prototype);

var cAttrCircle = { // 円属性
  create(){
    var obj = Object.create(cAttrCircle.prototype);
    obj.cx     = 0;
    obj.cy     = 0;
    obj.rx     = 0;
    obj.ry     = 0;
    obj.start  = 0;
    obj.end    = 0;
    obj.easeXY = "linear";
    obj.easeR  = "linear";
    obj.easeSE = "linear";
    return obj;
  },
  prototype:{
    init(a){
      if(nnc.Fn.undef(a)) return this;
      this.cx     = a.cx || this.cx;
      this.cy     = a.cy || this.cy;
      this.rx     = this.pick([a.rx, a.r], this.rx);
      this.ry     = this.pick([a.ry, a.r], this.ry);
      this.start  = a.start || this.start;
      this.end    = a.end || this.end;
      this.easeXY = a.easeXY || this.easeXY;
      this.easeR  = a.easeR  || this.easeR;
      this.easeSE = a.easeSE || this.easeSE;
      return this;
    },
    lerp(from, to, t){
      // イージング
      this.easeXY = from.easeXY;
      this.easeR  = from.easeR;
      this.easeSE = from.easeSE;

      // 補間
      this.cx  = Fn.ease(this.easeXY, from.cx, to.cx, t);
      this.cy  = Fn.ease(this.easeXY, from.cy, to.cy, t);
      this.rx  = Fn.ease(this.easeR, from.rx, to.rx, t);
      this.ry  = Fn.ease(this.easeR, from.ry, to.ry, t);
      this.start = Fn.ease(this.easeSE, from.start, to.start, t);
      this.end   = Fn.ease(this.easeSE, from.end, to.end, t);
    },
    toAttr(){
      return {
        cx:this.cx, cy:this.cy, rx:Math.abs(this.rx), ry:Math.abs(this.ry)
      };
    },
    toArkPath(){ // 円弧線のパス
      var d = this.getArkData();

      var p = [
        ["M", d.x + d.sx, d.y + d.sy],
        ["a", d.rx, d.ry, 0, d.large, d.sweep, d.ex - d.sx , d.ey - d.sy]
      ];

      return {path:p};
    },
    toFanPath(){ // 扇形用のパス

      var d = this.getArkData();

      var p = [
        ["M", d.x, d.y],
        ["L", d.x + d.sx, d.y + d.sy],
        ["a", d.rx, d.ry, 0, d.large, d.sweep, d.ex - d.sx , d.ey - d.sy],
        ["z"]
      ];

      return {path:p};
    },
    getArkData(){ // 円弧パス用の汎用パラメーターを計算
      var d = {};
      d.x  = this.cx ,
      d.y  = this.cy,
      d.rx = this.rx,
      d.ry = this.ry,
      d.rad = Math.PI / 180,
      d.s  = this.start % 360,
      d.e  = this.end % 360,
      d.sx = d.rx *  Math.cos(d.rad * d.s),
      d.sy = d.ry * -Math.sin(d.rad * d.s),
      d.ex = d.rx *  Math.cos(d.rad * d.e),
      d.ey = d.ry * -Math.sin(d.rad * d.e);
      d.sub   = d.e - d.s;
      d.large = Math.abs(d.sub) < 180? 0:1;
      d.sweep = (d.sub < 0)? 1 : 0;
      return d;
    },
  },
};
Object.setPrototypeOf(cAttrCircle.prototype, cAttr.prototype);

var cAttrStyle = { // スタイル
  create(){
    var obj = Object.create(cAttrStyle.prototype);
    obj.fill       = nnc.Color.create("#fff");
    obj.stroke     = nnc.Color.create("#000");
    obj.width      = 1;
    obj.dasharray  = 0;
    obj.dashoffset = 0;
    obj.cap        = "";
    obj.join       = "";
    return obj;
  },
  prototype:{
    init(a){
      if(nnc.Fn.undef(a)) return this;

      // 色は指定されていた場合のみ設定する
      if(a.fill) this.fill.set(a.fill);
      if(a.stroke) this.stroke.set(a.stroke);

      this.width      = this.pick([a.width], this.width);
      this.dasharray  = a.dasharray  || this.dasharray;
      this.dashoffset = a.dashoffset || this.dashoffset;
      this.cap        = a.cap        || this.cap;
      this.join       = a.join       || this.join;
      return this;
    },
    lerp(from, to, t){
      var lerp = nnc.Math.lerp;
      this.fill.lerp(from.fill, to.fill, t);
      this.stroke.lerp(from.stroke, to.stroke, t);
      this.width      = Fn.ease("linear", from.width, to.width, t);
      this.dashoffset = Fn.ease("linear", from.dashoffset, to.dashoffset, t);
      this.cap        = this.pickFixed(from.cap, to.cap);
      this.join       = this.pickFixed(from.join, to.join);
      this.lerpDasharray(from.dasharray, to.dasharray, t);
    },
    // 破線のプロパティを補間する
    // 破線を表すdasharrayは配列や数値を指定できるため、単純な補間はできない。
    lerpDasharray(from, to, t){
      // ２つが配列、かつ要素数が同じなら要素単位で補間する。
      if(Array.isArray(from) && Array.isArray(to) && (from.length == to.length)){
        this.dasharray = nnc.Array.lerp(from, to, t);
        return;
      }
      // ２つが数値なら単純に補間する
      var isNumFrom = typeof(from) == "number",
          isNumTo   = typeof(to) == "number";

      if(isNumFrom && isNumTo){
        this.dasharray = nnc.Math.lerp(from, to, t);
        return;
      }
      // 配列と数値の場合、要素数が同じ配列を用意して補間する。
      if(Array.isArray(from) && isNumTo){
        var arr = [];
        for(var i = 0; i < from.length; ++i) arr[i] = to;
        this.dasharray = nnc.Array.lerp(from, arr, t);
        return;
      }
      if(isNumFrom && Array.isArray(to)){
        var arr = [];
        for(var i = 0; i < to.length; ++i) arr[i] = from;
        this.dasharray = nnc.Array.lerp(arr, to, t);
        return;
      }
      // その他は補間なし
      this.dasharray = this.pickFixed(from, to);
    },
    toAttr(){
      var attr = {};

      // 必要に応じぜ属性パラメータを登録
      attr.fill   = (this.fill.isEnable)?   this.fill.rgba   : "none";
      attr.stroke = (this.stroke.isEnable)? this.stroke.rgba : "none";

      if(attr.stroke != "none" && 0 < this.width){
        Object.assign(attr, {
          strokeWidth      : this.width,
          strokeDasharray  : this.dasharray,
          strokeDashoffset : this.dashoffset,
          strokeLinecap    : this.cap,
          strokeLinejoin   : this.join,
        });
      }
      return attr;
    },
    toStringFill(){
      return (this.fill.isEnable)?   this.fill.rgba   : "none";
    },
    toStringStroke(){
      return (this.stroke.isEnable)? this.stroke.rgba : "none";
    },
    // 色はObjectで持っているのでrgbaに変換する。
    toJSON(){
      var json    = Object.assign({}, this);
      json.fill   = this.toStringFill();
      json.stroke = this.toStringStroke();
      return json;
    },
  }
};
Object.setPrototypeOf(cAttrStyle.prototype, cAttr.prototype);

var cAttrText = { // テキスト属性
  create(){
    var obj = Object.create(cAttrText.prototype);
    obj.text     = "";
    obj.anchor   = "middle";
    obj.baseline = "middle";
    obj.align    = "center";
    obj.valign   = "middle";
    obj.size     = 30;
    obj.family   = "";
    obj.type     = "string"; //string, int, floatに対応
    obj.radix    = 10; // textTypeがint:n進数、floatの場合は少数桁
    obj.offsetX  = 0;
    obj.offsetY  = 0;
    obj.style    = cAttrStyle.create().init({fill:"#000", stroke:"none"});
    return obj;
  },
  prototype:{
    init(a){
      if(nnc.Fn.undef(a)) return this;

      this.text     = this.pick([a.text], this.text);
      this.anchor   = a.anchor   || this.anchor;
      this.baseline = a.baseline || this.baseline;
      this.align    = a.align    || this.align;
      this.valign   = a.valign   || this.valign;
      this.offsetX  = a.offsetX  || this.offsetX;
      this.offsetY  = a.offsetY  || this.offsetY;
      this.family   = a.family   || this.family;
      this.size     = this.pick([a.size], this.size);
      this.radix    = this.pick([a.radix], this.radix);
      this.type     = a.type || this.type;
      this.style.init(a.style);
      return this;
    },
    // テキスト属性を補間
    lerp(from, to, t){
      this.lerpText(from.text, to.text, t);

      // 表示する文字がないなら以下の補間は意味がない
      if(this.isEmptyText()) return;

      this.anchor   = this.pickFixed(from.anchor, to.anchor);
      this.baseline = this.pickFixed(from.baseline, to.anchor);
      this.align    = this.pickFixed(from.align, to.align);
      this.valign   = this.pickFixed(from.valign, to.valign);
      this.offsetX  = Fn.ease("linear", from.offsetX, to.offsetX, t);
      this.offsetY  = Fn.ease("linear", from.offsetY, to.offsetY, t);
      this.size     = Fn.ease("linear", from.size, to.size, t);
      this.radix    = this.pickFixed(from.radix, to.radix);
      this.family   = this.pickFixed(from.family, to.family);
      this.type     = this.pickFixed(from.type, to.type);
      this.style.lerp(from.style, to.style, t);
    },
    // テキストの補間、intやfloatは数値として補間する。
    lerpText(from, to, t){
      if(this.type != "string" && typeof(from) == "number" && typeof(to) == "number"){
        this.text = nnc.Math.lerp(from, to, t);
      } else {
        this.text = this.pickFixed(from, to);
      }
    },
    // intは表示する進数、floatは少数の桁数を調整する
    getText(){
      var type = typeof this.text;

      // 数値の場合は、いい感じに文字列にして返す
      if(type == "number" && this.type != "string") {
        if(this.type == "float") {
          return parseFloat(this.text).toFixed(this.radix);
        } else {
          return Math.round(this.text).toString(this.radix).toUpperCase();
        }
      }

      // その他の場合は文字列化して返す。
      return this.text.toString();
    },
    // 矩形内のXY座標を算出する
    calcRectInPos(rect){
      var x = 0, y = 0;
      switch(this.align){
        case "right" : x = rect.x + rect.w; break;
        case "left"  : x = rect.x; break;
        default      : x = rect.x + rect.w/2; break;
      }
      switch(this.valign){
        case "top"    : y = rect.y; break;
        case "bottom" : y = rect.y + rect.h; break;
        default       : y = rect.y + rect.h/2; break;
      }
      return {x: x + this.offsetX, y: y + this.offsetY}
    },
    // 円内のXY座標を算出する
    calcCircleInPos(circle){
      var x = 0, y = 0;
      switch(this.align){
        case "right" : x = circle.cx + circle.rx; break;
        case "left"  : x = circle.cx - circle.rx; break;
        default      : x = circle.cx; break;
      }
      switch(this.valign){
        case "top"    : y = circle.cy - circle.ry; break;
        case "bottom" : y = circle.cy + circle.ry; break;
        default       : y = circle.cy; break;
      }
      return {x: x + this.offsetX, y: y + this.offsetY}
    },
    // 渡された矩形内のテキスト位置を計算した属性値を返す。
    toAttrOfRectIn(rect){
      var attr = this.toAttr();
      // 表示する文字がないならそれ以上の属性は返さない
      if(this.isEmptyText()) return attr;
      return Object.assign(this.calcRectInPos(rect), attr);
    },
    // 渡された円形内のテキスト位置を計算した属性を返す(楕円にも対応)
    toAttrOfCircleIn(circle){
      var attr = this.toAttr();
      // 表示する文字がないならそれ以上の属性は返さない
      if(this.isEmptyText()) return attr;
      return Object.assign(this.calcCircleInPos(circle), attr);
    },
    // テキストに関する属性値を返す
    toAttr(includeText=true){
      var attr = {};

      // 属性値にtextを含めるフラグがたっていたら含める
      if(includeText) {
        attr.text =  this.getText()
      }

      // 表示する文字がないならtextの情報だけ返す
      if(this.isEmptyText()) return attr;

      // 文字があるならその他の情報も必要に応じて追加
      Object.assign(attr, {
        fontFamily      :this.family,
        fontSize        :this.size,
        textAnchor      :this.anchor,
        dominantBaseline:this.baseline
      });

      return Object.assign(attr, this.style.toAttr());
    },
    // テキストが空かどうか
    isEmptyText(){
      return (this.text === "" || nnc.Fn.undef(this.text));
    },
  }
};
Object.setPrototypeOf(cAttrText.prototype, cAttr.prototype);

var cAttrPath = { // パス属性
  create(){
    var obj = Object.create(cAttrPath.prototype);
    obj.path       = "M0,0 L0,0";
    obj.start      = 0;
    obj.mid        = 0;
    obj.end        = 1;
    obj.easePath   = "linear";
    return obj;
  },
  prototype:{
    init(a){
      if(nnc.Fn.undef(a)) return this;
      this.path  = a.path  || this.path;
      this.start = a.start || this.start;
      this.mid   = a.mid   || this.mid;
      this.end   = this.pick([a.end], this.end);
      this.easePath = a.easePath || this.easePath;
      return this;
    },
    lerp(from, to, t){
      this.start = Fn.ease("linear", from.start, to.start, t);
      this.mid   = Fn.ease("linear", from.mid, to.mid, t);
      this.end   = Fn.ease("linear", from.end, to.end, t);

      this.easePath = from.easePath;
      this.path  = this.lerpPath(from.path, to.path, t);

      var path   = this.path,
          maxlen = Snap.path.getTotalLength(path),
          midlen = maxlen * this.mid,
          remlen = maxlen - midlen,
          start  = maxlen * this.start + 0.001,
          end    = (midlen + remlen * this.end) - 0.001;

      this.path = Snap.path.getSubpath(path, start, end);

    },
    lerpPath(from, to, t){
      var segf = Snap.parsePathString(from);
      var segt = Snap.parsePathString(to);

      if(segf.length != segt.length) return from;

      for(var i = 0; i < segf.length; ++i){
        var sf = segf[i], st = segt[i];

        for(var j = 0; j < sf.length; ++j){

          if(!sf[j] || !st[j]) continue;

          if(Snap.is(sf[j], "number") && Snap.is(st[j], "number")){
            segf[i][j] = Fn.ease(this.easePath, sf[j], st[j], t);
          }
        }
      }
      return segf.toString();
    },
    // パスに変換
    toPath(){
      return { path:this.path };
    },
    // テキストパスに変換
    toTextPath(){
      return { textpath:this.path };
    }
  }
};
Object.setPrototypeOf(cAttrPath.prototype, cAttr.prototype);

var cAttrMarker = { // マーカー
  create(){
    var obj = Object.create(cAttrMarker.prototype);
    obj.marker   = null;
    obj.shape    = null;
    obj.fill     = nnc.Color.create("#fff");
    obj.stroke   = nnc.Color.create("#000");
    obj.size     = 10;
    obj.easeSize = "linear";
    return obj;
  },
  prototype:{
    init(a){
      if(nnc.Fn.undef(a)) return;

      // 補間を考慮してmarkerの有無にかかわらず値を保持する。
      if(a.fill) this.fill.set(a.fill);
      if(a.stroke) this.stroke.set(a.stroke);
      this.size = this.pick([a.size], this.size);
      this.easeSize = a.easeSize || this.easeSize;
      // マーカーを作る。
      if(a.marker){
        var m = g.sResource.makeMarker(
          a.marker, this.fill.rgba, this.stroke.rgba, this.size,
        );
        this.marker = m.marker;
        this.shape  = m.shape;
      }
    },
    lerp(from, to, t){
      this.easeSize = from.easeSize;
      this.fill.lerp(from.fill, to.fill, t);
      this.stroke.lerp(from.stroke, to.stroke, t);
      this.marker = this.pickFixed(from.marker, to.marker);
      this.shape  = this.pickFixed(from.shape, to.shape);
      this.size   = Fn.ease(this.easeSize, from.size, to.size, t);
    },
    getMarker(){
      var attr = {};
      if(this.marker){
        this.shape.attr({fill:this.fill.rgba, stroke:this.stroke.rgba});
        this.marker.attr({markerWidth:this.size, markerHeight:this.size});
      }
      return this.marker;
    },
  }
};
Object.setPrototypeOf(cAttrMarker.prototype, cAttr.prototype);
//==============================================================================
// パラメータークラス
// 実質このパラメータクラスがこのプログラムの主たる存在。
//==============================================================================
var cParam = {
  create(){
    var obj = Object.create(cParam.prototype);
    obj.common = cAttrCommon.create();
    obj.style  = cAttrStyle.create();
    return obj;
  },
  prototype:{
    // 共通パラメータを準備する
    init(a){
      this.common.init(a.common);
      this.style.init(a.style);
      return this;
    },

    // Unit全体を包括するgroup要素に対してtransform属性を設定する。
    transform(group){
      // リセットしておかないと半端になる
      var m = Snap.matrix();
      group.transform(m);

      // 高速化対応
      var attr = this.common;

      // 回転する必要がなければ何もしない
      if(attr.angle == 0) return null;

      // バウンディングボックスの中心からの相対座標が回転軸になるように
      var b = group.getBBox();
      m.rotate(attr.angle, b.cx + attr.acx, b.cy + attr.acy);
      group.transform(m);
    },

    // Unit全体を包括するgroup要素に対して属性を設定する。
    toAttrGroup(){
      return { opacity:this.common.opacity };
    },
    // applyが適用され、attachされた後にcallされる。必要に応じてオーバーライド
    applyAfter(){},

    // 補間
    lerp(from, to, t){
      this.common.lerp(from.common, to.common, t);
      this.style.lerp(from.style, to.style, t);
    }
  }
};

var cParamRect = { // 矩形系のパラメーター
  create(){
    var obj = Object.create(cParamRect.prototype);
    obj.rect = cAttrRect.create();
    obj.text = cAttrText.create();
    return Object.assign(obj, cParam.create());
  },
  prototype:{
    init(a){
      super.init(a);
      this.rect.init(a.rect);
      this.text.init(a.text);
      return this;
    },
    applyRect(prim){
      prim.attr(this.toRect());
    },
    applyText(prim){
      prim.attr(this.toText());
    },
    toRect(){
      return Object.assign(
        this.rect.toAttr(),
        this.style.toAttr(),
      );
    },
    toText(){
      return this.text.toAttrOfRectIn(this.rect);
    },
    lerp(from, to, t){
      super.lerp(from, to, t);
      this.rect.lerp(from.rect, to.rect, t);
      this.text.lerp(from.text, to.text, t);
    },
  }
};
Object.setPrototypeOf(cParamRect.prototype, cParam.prototype);

var cParamCircle = { // 矩形系のパラメーター
  create(){
    var obj = Object.create(cParamCircle.prototype);
    obj.circle = cAttrCircle.create();
    obj.text   = cAttrText.create();
    return Object.assign(obj, cParam.create());
  },
  prototype:{
    init(a){
      super.init(a);
      this.circle.init(a.circle);
      this.text.init(a.text);
      return this;
    },
    applyCircle(prim){
      prim.attr(this.toCircle());
    },
    applyText(prim){
      prim.attr(this.toText());
    },
    toCircle(){
      return Object.assign(
        this.circle.toAttr(),
        this.style.toAttr(),
      );
    },
    toText(){
      return this.text.toAttrOfCircleIn(this.circle);
    },
    lerp(from, to, t){
      super.lerp(from, to, t);
      this.circle.lerp(from.circle, to.circle, t);
      this.text.lerp(from.text, to.text, t);
    },
  }
};
Object.setPrototypeOf(cParamCircle.prototype, cParam.prototype);

var cParamText = { // テキストのパラメーター
  create(){
    var obj = Object.create(cParamText.prototype);
    obj.self = {type:"point", x:0, y:0, easeXY:"linear"};
    obj.text = cAttrText.create().init({anchor:"start", baseline:"hanging"});
    obj.path = cAttrPath.create();
    return Object.assign(obj, cParam.create());
  },
  prototype:{
    init(a){
      if(nnc.Fn.undef(a)) return;

      super.init(a);
      this.initSelf(a.self);
      this.path.init(a.path);
      this.text.init(a.text);
      return this;
    },
    initSelf(a){
      if(nnc.Fn.undef(a)) return;
      var self = this.self;
      self.x      = a.x || self.x;
      self.y      = a.y || self.y;
      self.type   = a.type || self.type;
      self.easeXY = a.easeXY || self.easeXY;
    },
    lerp(from, to, t){
      super.lerp(from, to, t);
      this.lerpSelf(from.self, to.self, t);
      this.text.lerp(from.text, to.text, t);
      this.path.lerp(from.path, to.path, t);

    },
    lerpSelf(from, to, t){
      this.self.easeXY = from.easeXY;
      this.self.type = from.type;
      this.self.x = Fn.ease(this.self.easeXY, from.x, to.x, t);
      this.self.y = Fn.ease(this.self.easeXY, from.y, to.y, t);
    },
    applyText(prim){
      var attr = Object.assign(this.getTextPath(), this.text.toAttr(false));
      prim.attr(attr);
      this.setText(prim, this.text.getText());
    },
    // typeがpathの場合はパス属性から、それ以外は自身のx,y基準からパスを生成
    getTextPath(){
      if(this.self.type == "path"){
        return this.path.toTextPath();
      } else {
        return {textpath:`M${this.self.x} ${this.self.y} L10000 ${this.self.y}`};
      }
    },
    // textpathを使う場合、attrでtextをセットするといろいろぶっ壊れる。
    // そのためtextは直接textpathのinnerHTMLを操作する。
    setText(prim, text){
      prim.node.textPath.node.innerHTML = text;
    }
  }
};
Object.setPrototypeOf(cParamText.prototype, cParam.prototype);

var cParamStar = { // 星形用の属性
  create(){
    var obj = Object.create(cParamStar.prototype);
    Object.assign(obj, cParamRect.create());
    obj.self = {v : 5}; // 星の頂点数
    obj.rect.init({rx:20, ry:20,w:100,h:100});
    return obj;
  },
  prototype:{
    init(a){
      super.init(a);
      return this.initSelf(a.self);
    },
    initSelf(a){
      if(nnc.Fn.undef(a)) return this;
      this.self.v = Math.max(a.v || this.self.v, 3);
      return this;
    },
    lerp(from, to, t){
      super.lerp(from, to, t);
      this.v = nnc.Math.lerp(from.v, to.v, t);
      this.v = parseInt(this.v);
    },
    applyPath(prim){
      var attr = Object.assign(
        this.style.toAttr(),
        {path:this.toSeg()}
      );
      prim.attr(attr);
    },
    toSeg(){ // 属性値からセグメントを生成して取得する
      var rect   = this.rect,
          vertex = this.self.v;
      var x = rect.x || 0,   // 基準となるX座標
          y = rect.y || 0,   // 基準となるY座標
          w = rect.w / 2,    // 幅
          h = rect.h / 2,    // 高さ
          v = vertex * 2,    // 頂点数
          a = 360 / v,       // 一角あたりの角度
          rx = rect.rx,      // 半径x
          ry = rect.ry,      // 半径y
          rad = Math.PI/180; // 1度あたりのラジアン

      var seg = [];

      for(var i = 0; i < v; ++i){
        var sin = Math.sin(rad * a * i);
        var cos = Math.cos(rad * a * i);
        var com = (i == 0)? "M" : "L",
        x1 = (i%2==0)? w:rx,
        y1 = (i%2==0)? h:ry;

        seg.push([com, x + x1*sin, y + y1*-cos]);
      }
      seg.push(["z"]);
      return seg;
    },
  }
};
Object.setPrototypeOf(cParamStar.prototype, cParamRect.prototype);

var cParamLine = { // 線の属性
  create(){
    var obj = Object.create(cParamLine.prototype);
    Object.assign(obj, cParam.create());
    obj.path        = cAttrPath.create();
    obj.markerStart = cAttrMarker.create();
    obj.markerMid   = cAttrMarker.create();
    obj.markerEnd   = cAttrMarker.create();
    obj.style.init({fill:"none"});
    return obj;
  },
  prototype:{
    init(a){
      super.init(a);
      this.path.init(a.path);
      this.markerStart.init(a.markerStart);
      this.markerMid.init(a.markerMid);
      this.markerEnd.init(a.markerEnd);
      return this;
    },
    lerp(from, to, t){
      super.lerp(from, to, t);
      this.path.lerp(from.path, to.path, t);
      this.markerStart.lerp(from.markerStart, to.markerStart, t);
      this.markerMid.lerp(from.markerMid, to.markerMid, t);
      this.markerEnd.lerp(from.markerEnd, to.markerEnd, t);
    },
    applyPath(prim){
      var ret = Object.assign(
        this.style.toAttr(),
        this.path.toPath(),
        this.toMarker(),
      );
      prim.attr(ret);
    },
    toMarker(){
      return {
        markerStart: this.markerStart.getMarker(),
        markerMid  : this.markerMid.getMarker(),
        markerEnd  : this.markerEnd.getMarker()
      }
    },
  }
};
Object.setPrototypeOf(cParamLine.prototype, cParam.prototype);

// 円弧線
var cParamCline = {
  create(){
    var obj = Object.create(cParamCline.prototype);
    Object.assign(obj, cParam.create());
    obj.circle      = cAttrCircle.create();
    obj.markerStart = cAttrMarker.create();
    obj.markerMid   = cAttrMarker.create();
    obj.markerEnd   = cAttrMarker.create();
    obj.style.init({fill:"none"});
    return obj;
  },
  prototype:{
    init(a){
      super.init(a);
      this.circle.init(a.circle);
      this.markerStart.init(a.markerStart);
      this.markerMid.init(a.markerMid);
      this.markerEnd.init(a.markerEnd);
      return this;
    },
    lerp(from, to, t){
      super.lerp(from, to, t);
      this.circle.lerp(from.circle, to.circle, t);
      this.markerStart.lerp(from.markerStart, to.markerStart, t);
      this.markerMid.lerp(from.markerMid, to.markerMid, t);
      this.markerEnd.lerp(from.markerEnd, to.markerEnd, t);
    },
    applyPath(prim){
      var attr = Object.assign(
        this.style.toAttr(),
        this.toMarker(),
        this.circle.toArkPath(),
      );
      prim.attr(attr);
    },
    toMarker(){
      return {
        markerStart: this.markerStart.getMarker(),
        markerMid  : this.markerMid.getMarker(),
        markerEnd  : this.markerEnd.getMarker()
      }
    },
  },
};
Object.setPrototypeOf(cParamCline.prototype, cParam.prototype);

// 円弧
var cParamArk = {
  create(){
    var obj = Object.create(cParamArk.prototype);
    Object.assign(obj, cParam.create());
    obj.circle = cAttrCircle.create();
    return obj;
  },
  prototype:{
    init(a){
      super.init(a);
      this.circle.init(a.circle);
      return this;
    },
    lerp(from, to, t){
      super.lerp(from, to, t);
      this.circle.lerp(from.circle, to.circle, t);
    },
    applyPath(prim){
      var attr = Object.assign(
        this.style.toAttr(),
        this.circle.toFanPath()
      );
      prim.attr(attr);
    }
  }
};
Object.setPrototypeOf(cParamArk.prototype, cParam.prototype);

// グリッド
var cParamGrid = {
  create(){
    var obj = Object.create(cParamGrid.prototype);
    obj.rect = cAttrRect.create();
    return Object.assign(obj, cParam.create());
  },
  prototype:{
    init(a){
      super.init(a);
      this.rect.init(a.rect);
      return this;
    },
    applyPath(prim){

      var p = [];

      var spanw = this.rect.w / this.rect.rx;
      var spanh = this.rect.h / this.rect.rx;

      for(var i = 0; i <= this.rect.rx; ++i){
        p.push(["M", this.rect.x, this.rect.y + i * spanw]);
        p.push(["h", this.rect.h]);
        p.push(["M", this.rect.x + i * spanh, this.rect.y]);
        p.push(["v", this.rect.w]);
      }


      var attr = Object.assign(this.style.toAttr(),{
        // path:"M250,250, a25 25 0 0 1 0, 50"
        path:p,
        fill:"red",
      });
      prim.attr(attr);
    },
    lerp(from, to, t){
      super.lerp(from, to, t);
      this.rect.lerp(from.rect, to.rect, t);
    }
  }
};
Object.setPrototypeOf(cParamGrid.prototype, cParam.prototype);

//==============================================================================
// ユニット管理システム
//==============================================================================
var sUnit = {
  create(){
    var obj = Object.create(sUnit.prototype);
    obj.childs = {}; // 表示するユニットを入れておくところ
    g.sUnit = obj;
    return obj;
  },
  prototype:{
    addGeom(geom) {
      var unit = cUnit.create();
      unit.geom = geom;
      this.add(unit);
    },
    add(unit){
      this.childs[unit.id] = unit;
    },

    map(f){
      for(var k in this.childs) {
        f(this.childs[k]);
      }
    },
    update(){
      var cs   = g.sNote.currSection,   // 現在のセクションデータ
          ns   = g.sNote.nextSection,   // 次のセクションデータ
          prog = g.sNote.progOfSection; // セクションの進捗率

      // 全てのユニットを更新
      this.map(function(u){
        var from = cs[u.id], to = ns[u.id];

        // 補間先がない場合は、ページの最後以外はfromに合わせる
        if(!to && !g.sNote.isEndPage){
          to = from;
        }

        // fromがない場合、ページの最後だけtoに合わせるが基本は表示しない
        if(!from){
          if(g.sNote.isEndPage)
            from = to;
          else
            to = undefined;
        }

        if(!from || !to){
          if(u.isDraw){
            u.setDraw(false);
          }
          return;
        }

        // ここまできたら描画する
        if(!u.isDraw) {
          u.setDraw(true);
        }

        // Unitを更新
        u.update(from, to, prog);
      });
    },
    apply(){
      g.rag.detach();
      this.map(function(u){
        // 描画しないならapplyもしない。
        if(!u.isDraw) return;
        u.apply();
      });
      g.rag.attach();
      this.map(function(u){ u.applyAfter(); });
    },
    clear() {
      this.map(function(u){ u.remove(); });
      this.childs = {};
    },
    load(data) {
      for(var id in data){
        var unit = Unit.create(id, data[id].type);
        this.add(unit);
      }
    },
    getTypeById(id){ // IDに該当するユニットのタイプを取得する。
      return this.childs[id].type;
    },
  }
};

//==============================================================================
// cPage
// ページデータを管理するクラス
// ページ番号や進捗率から現在再生すべきセクション番号を取得するなど。
//==============================================================================
var cPage = {
  create(){
    var obj = Object.create(cPage.prototype);
    this.pages = [];
    this._no         = 0; // ページ番号
    this._prog       = 0; // 進捗率
    this._sectionIdx = 0; // ページ番号と進捗率から計算するので直接操作禁止
    return obj;
  },
  prototype:{
    init(data){ // 初期化
      return this.setPage(data); // ページデータを設定
    },
    setPage(data){
      if(Array.isArray(data)) {
        this.pages = data;
        this.setupTotals().setNo(0).setProg(0);
      } else {
        nnc.Log.error("ページデータは配列でないとダメ");
      }
      return this;
    },
    setupTotals (){ // 各セクションの比率合計データを生成する
      var d = this.pages;
      for(var i = 0; i < d.length; ++i){
        var total = 0;
        this.pages[i].totals = [];
        for(var j = 0; j < d[i].rates.length; ++j){
          total += d[i].rates[j];
          this.pages[i].totals.push(total);
        }
      }
      return this;
    },
    get currRates () { // 現在ページに含まれる比率情報を取得
      return this.currPage.rates;
    },
    get currSections () { // 現在ページに含まれるセクション情報を取得
      return this.currPage.sections;
    },
    get currTotals () { // 現在ページに含まれる比率合計情報を取得
      return this.currPage.totals;
    },
    //==========================================================================
    // 進捗率
    //==========================================================================
    setProg(p) { // メソッドチェイン用
      this.prog = p;
      return this;
    },
    get prog() { // アクセスはプロパティが楽なので
      return this._prog;
    },
    set prog(p) { // 入れるだけならプロパティ
      // Chromeだとpが小さすぎるた時に強制再描画が入っていかれるので対策
      this._prog = (p < 0.0001)? 0 : p;
      this.sectionIdx = this.calcSectionIdx(p);
      return this;
    },
    get progOfSection () { // セクションにおける進捗率
      // 例外処理、Rates要素が0のデータはおかしいが、もしそういったデータがあった場合は
      // 分母を1として処理する。
      if(this.currRates.length == 0) {
        nnc.Log.info("currRatesの要素が0になっています");
        return this.prog / 1;
      };
      var deno = this.currRates[this.sectionIdx]; // 分母
      var nume = this.prog;                       // 分子

      // 直前のセクションの比率を進捗から引く事で今のセクションに対する進捗率を出す。
      if(0 < this.sectionIdx)
        nume -= this.currTotals[this.sectionIdx - 1];

      return nume/deno;
    },

    //==========================================================================
    // セクション
    // SectionNoは実際のセクションの番号
    // SectionIdxはセクション番号が入っている配列のIndex
    //==========================================================================
    get sectionIdx () {
      return this._sectionIdx;
    },
    set sectionIdx (v) {
      this._sectionIdx = v;
    },
    get maxSectionIdx () { // 現在ページの最大セクションIndex
      return this.currSections.length - 1;
    },
    get firstSectionNo (){ // 現在ページの最初のセクション番号
      return this.currSections[0];
    },
    get endSectionNo() { // 現在ページの最後のセクション番号
      return this.currSections[this.maxSectionIdx];
    },
    get currSectionNo () { // 現在ページの進捗に合わせたセクション番号
      return this.currSections[this.sectionIdx];
    },
    get nextSectionNo () {
      var idx = nnc.Math.within(this.sectionIdx + 1, 0, this.maxSectionIdx);
      return this.currPage.sections[idx];
    },
    get prevSectionNo () {
      var idx = nnc.Math.within(this.sectionIdx - 1, 0, this.maxSectionIdx);
      return this.currPage.sections[idx];
    },
    calcSectionIdx(prog){ // 進捗率からSectionIdxを算出する
      // sectionが2個以下なら先頭要素を指すIndex
      if(this.currSections.length <= 2)
        return 0;

      // sectionが3個以上ならsectionのrateと進捗率から現在のindexを算出する
      for(var i = 0; i < this.currRates.length; ++i){
        // 進捗率から前Sectionの比率を引く事で処理を簡単にする
        var p = prog - ((0 < i)? this.currTotals[i-1] : 0);

        // 現進捗が、Sectionの率を超えていない場合は現セクションを返す
        if(p <= this.currRates[i])
          return i;
      }

      // ここまで来たらsectionsの最後から２番目のIndex(最後のfrom要素)を返す
      return this.currSections.length - 2;
    },
    //==========================================================================
    // 判定系
    //==========================================================================
    get hasData() { // ページデータが存在するかどうか
      // 配列データのみ有効
      if(!Array.isArray(this.pages)) return false;

      // １つ以上データがあればデータがあるという扱い
      return (0 < this.pages.length);
    },

    get hasNext(){ // 次のページがあるかどうか、次のページ番号が大きければある
      return (this.no < this.nextNo);
    },
    get hasPrev(){ // 前のページがあるかどうか、ページ番号が0より大きければある
      return (0 < this.no);
    },
    get isEnd(){ // 現在ページの最後かどうか
      return (1 <= this.prog);
    },

    //==========================================================================
    // ページ関連
    //==========================================================================
    get currPage() { // 現在のページ
      return this.pages[this.no];
    },
    get prevPage() { // 前のページ
      return this.pages[this.prevNo];
    },
    get nextPage(){ // 次のページ
      return this.pages[this.nextNo];
    },

    //==========================================================================
    // ページ番号関連
    //==========================================================================
    setNo(no){ // メソッドチェインしたい場合用に定義
      this.no = no;
      return this;
    },
    set no (v) { // ページ番号をセット
      this._no = nnc.Math.within(v, 0, this.maxNo);
      this.setProg(0);
      return this;
    },
    get no () { // ページ番号を取得
       return this._no;
    },
    next() { // 次ページへ
      this.no = this.nextNo;
      return this;
    },
    prev() { // 前のページへ
      this.no = this.prevNo;
      return this;
    },
    get maxNo() { // 最大ページ番号、データがない場合を考慮しない
      return this.pages.length - 1;
    },
    get nextNo() { // 次のページ番号
      return nnc.Math.within(this.no + 1, 0, this.maxNo);
    },
    get prevNo() { // 前のページ番号
      return nnc.Math.within(this.no - 1, 0, this.maxNo);
    }
  }
};

//==============================================================================
// sNote
// ページとセクションの実データを管理するクラス
//==============================================================================
var sNote = {
  create(){
    var obj = Object.create(sNote.prototype);
    obj.sections = [];
    obj.page = cPage.create();
    g.sNote = obj;
    return obj;
  },
  prototype:{
    load(data){ // ノートの情報を設定する
      this.initSection(data.section).page.init(data.page);
    },

    //==========================================================================
    // 進捗率
    //==========================================================================
    setProg(p){ // 進捗率を設定
      this.prog = p;
      return this;
    },
    set prog (p){
      this.page.prog = p;
    },
    get prog(){
      return this.page.prog;
    },
    get progOfSection(){ // セクション的な進捗率を出す
      return this.page.progOfSection;
    },

    //==========================================================================
    // ページ
    //==========================================================================
    get duration(){
      var d = this.page.currPage.duration || 1000;
      return Math.abs(d);
    },
    //==========================================================================
    // セクション
    //==========================================================================
    initSection(sections){ // セクションの情報は属性なので、対応するクラスとして保存する
      for(var i = 0, len = sections.length; i < len; ++i){
        var tmp = {};
        for(var id in sections[i]){
          var p = Param.create(g.sUnit.getTypeById(id), sections[i][id]);
          p.sectionNo = i;
          p.unitId = id;
          tmp[id] = p;
        }
        this.sections.push(tmp);
      }
      return this;
    },
    get currSection() {
      return this.sections[this.page.currSectionNo];
    },
    get prevSection() {
      return this.sections[this.page.prevSectionNo];
    },
    get nextSection() {
      return this.sections[this.page.nextSectionNo];
    },

    next() { // 次ページへ
      this.page.next();
    },
    prev() { // 前のページへ
      this.page.prev();
    },
    get currPageNo(){
      return this.page.no;
    },
    get maxPageNo(){
      return this.page.maxNo;
    },
    get hasNextPage(){
      return this.page.hasNext;
    },
    get hasPrevPage(){
      return this.page.hasPrev;
    },
    get isEnd(){ // ノートの最後、次ページがなく最後まで再生されている。
      return (!this.hasNextPage && this.page.isEnd);
    },
    get isEndPage(){ // ページの最後かどうか、次ページがあるかどうかは関係ない
      return this.page.isEnd;
    },
  }
};

//==============================================================================
// GUIシステム
//==============================================================================
var sGUI = {
  create(){
    var obj = Object.create(sGUI.prototype);
    obj.D = {
      root:null, prog:null, play:null, prev:null, next:null, page:null
    };
    obj.tid = null;
    obj.elapsedTime = 0;
    obj.config = null;
    g.sGUI = obj;
    return obj;
  },
  prototype:{
    // GUIを構成するDOMの生成とイベントの設定
    init(config){
      // 設定を保存
      this.config = config;

      // DOMの準備
      this.D.root = this.createRoot(config.root);
      this.D.prog = this.createProg(config.prog).on("input", this.inputOfProg.bind(this)).appendTo(this.D.root);
      this.D.back = this.createBack(config.back).click(this.clickOfBack.bind(this)).appendTo(this.D.root);
      this.D.next = this.createNext(config.next).click(this.clickOfNext.bind(this)).appendTo(this.D.root);
      this.D.play = this.createPlay(config.play).click(this.clickOfPlay.bind(this)).appendTo(this.D.root);
      this.D.page = this.createPage(config.page).appendTo(this.D.root);
      this.D.root.appendTo(document.body);
      this.adjust();
    },

    //==========================================================================
    // DOM生成関連
    //==========================================================================
    createRoot(config){
      return (config)? $("#" + config.id) : $("<div>");
    },
    createProg(config){
      return ((config)? $("#" + config.id) : $("<input>"))
        .attr({type:"range", value:0, min:0, max:1, step:this.getConfigStep()})
        .css({width:500});
    },
    createPage(config){
      return ((config)? $("#" + config.id) : $("<span />"));
    },
    createBack(config) {
      return ((config)? $("#" + config.id) : $("<button>戻る</button>"));
    },
    createNext(config) {
      return ((config)? $("#" + config.id) : $("<button>次へ</button>"));
    },
    createPlay(config) {
      return ((config)? $("#" + config.id) : $("<button>再生</button>"));
    },
    // GUIの見た目を現在の状態に合わせるよう調整する。
    adjust(){
      this.D.prog.val(g.sNote.prog);
      this.D.page.text(g.sNote.currPageNo + 1 + "/" + (g.sNote.maxPageNo + 1));

      this.D.back.prop("disabled", !g.sNote.hasPrevPage);
      this.D.next.prop("disabled", !g.sNote.hasNextPage);
      this.D.play.prop("disabled", g.sNote.isEnd || g.sNote.isEndPage);

      if(g.sNote.isEnd){
        this.D.play.text("終わり");
      } else {
        this.D.play.text((this.isPlaying)? "停止" : "再生");
      }
    },

    //==========================================================================
    // イベント処理関連
    //==========================================================================
    // 進捗バーが操作されたとき、その時の値に応じた状態を描画
    inputOfProg(e) {
      this.stop();
      g.rag.draw(e.target.value);
      this.adjust();
    },
    // 戻るがクリックされたとき、１つ前のページの最初の状態を描画
    clickOfBack(e){
      g.sNote.prev();
      g.rag.draw(0);
      this.adjust();
    },
    // 次へがクリックされたとき、１つ次のページの最初の状態を描画
    clickOfNext(e){
      g.sNote.next();
      g.rag.draw(0);
      this.adjust();
    },
    // 再生がクリックされたとき、再生中なら停止、停止中なら再生する。
    clickOfPlay(e){
      if(this.isPlaying){
        this.stop();
        this.adjust();
      } else {
        this.elapsedTime = this.calsElapsedTime(this.D.prog.val());
        this.play();
      }
    },

    //==========================================================================
    // パラメーター系
    //==========================================================================
    // 再生中かどうか
    get isPlaying() {
      return (this.tid != null);
    },

    // 進捗率から経過時間を算出
    calsElapsedTime(p){
      return g.sNote.duration * p;
    },

    // 再生時、1フレームあたりに進める時間を取得
    getElapsedStep(){
      // stepが小さすぎると処理速度が間に合わないので最速でも60FPSあたりで調整
      var step = g.sNote.duration * this.config.prog.step;
      return Math.max(16, step);
    },

    getConfigStep(){
      return (this.config.step || 0.001);
    },

    //==========================================================================
    // アクション系
    //==========================================================================
    // ページを再生する
    play(){
      var step    = this.getElapsedStep(),
          prog    = Math.min(1.0, this.elapsedTime/g.sNote.duration);

      g.rag.draw(prog);
      this.adjust();

      if(g.sNote.isEndPage){
        this.stop();
      } else {
        this.tid = setTimeout(this.play.bind(this), step);
        this.elapsedTime += step;
      }
    },
    // ページを停止する
    stop(){
      if(this.tid == null) return;
      clearTimeout(this.tid);
      this.tid = null;
    },

    // GUIを表示する
    show(){
      this.D.root.show();
      return this;
    },

    // GUIを非表示にする
    hide(){
      this.D.root.hide();
      return this;
    },
  },
};

//==============================================================================
// sRender
// 描画先の管理
//==============================================================================
var sRender = {
  create(){
    var obj = Object.create(sRender.prototype);
    obj.view = null;
    obj.stack = [];
    g.sRender = obj; // グローバル空間に登録
    return obj;
  },
  prototype:{
    load(config){
      this.view = Snap(config.size.w, config.size.h).attr({viewBox:config.vbox});
      this.save();
    },
    save(){
      this.stack.push({view:this.view});
    },
    restore(){
      if(this.stack.length == 1){
        nnc.Log.info("saveの回数を超えてrestoreがcallされています。");
        return ;
      }

      this.view = this.stack.pop().view;
    },
    detach(){
      this.view.remove();
    },
    attach(target){
      this.view.appendTo(target);
    },
    getTargetView(){
      return this.view;
    },
  }
};

//==============================================================================
// sResource
// リソースの管理、sRenderより後
//==============================================================================
var sResource = {
  create(){
    var obj = Object.create(sResource.prototype);
    obj.marker = {}; // マーカーリソース
    g.sResource = obj;
    return obj;
  },
  prototype:{
    // Markerで使用するリソースを定義
    load(){
      var markerShape = {
        "normal"  : "M0,0 L10,5 L0,10z",
        "cross"   : "M0,0 L10,10 M0,10 L10,0",
        "arrow"   : "M0,0 L10,5,0,10,3,5z",
        "caret"   : "M0,0 L10,5 L0,10",
        "square"  : "M5,0 L10,5,5,10,0,5z",
        "dot"     : "M5,5 O4,4"
      };
      for(var key in markerShape){
        this.marker[key] = g.rag.view.path(markerShape[key]).toDefs();
      }
    },
    makeMarker(type, fill, stroke, size){
      var shape = this.marker[type].clone().attr({fill:fill, stroke:stroke});
      var marker = null;
      switch(type){
        case "caret"  : marker = shape.marker(0,0,10,10,8,5); break;
        default       : marker = shape.marker(0,0,10,10,5,5); break;
      }
      if(marker){
        marker.attr({
          markerUnits:"userSpaceOnUse", markerWidth:size, markerHeight:size
        });
      }
      return {shape:shape, marker:marker};
    },
  }
};

//==============================================================================
// ライブラリ本体
//==============================================================================
var Ragamuffin = {
  create() {
    var obj = Object.create(Ragamuffin.prototype);
    g.rag = obj; // グローバル空間へ登録

    obj.D = {
      root:null,
    };
    obj.S = {
      render:sRender.create(),
      unit:sUnit.create(),
      note:sNote.create(),
      gui :sGUI.create(),
      resource:sResource.create(),
    };
    return obj;
  },

  prototype :{

    load(data) { // Viewerを構成する要素の生成

      this.setupRoot(data.id);
      this.sRender.load(data.food.view);
      this.sResource.load();
      this.sUnit.load(data.food.unit);
      this.sNote.load(data.food.note);
      this.sGUI.init(data.gui);
      this.sGUI.show();
      this.draw(0);
      this.sGUI.adjust();


      // D&Dでデータをロードする処理
      // console.log(data);
      // this.view.dragover(function(e, x, y){
      //   e.stopPropagation();
      //   e.preventDefault();
      //   e.dataTransfer.dropEffect = "copy";
      // });
      // this.view.drop(function(e, x, y){
      //   e.stopPropagation();
      //   e.preventDefault();
      //
      //   var fr = new FileReader();
      //
      //   fr.onload = (function(e){
      //     this.sUnit.clear();
      //     this.sUnit.load(JSON.parse(e.target.result));
      //   }.bind(this));
      //
      //   fr.readAsText(e.dataTransfer.files[0]);
      // }.bind(this));

      // システムを生成
      // this.S.unit = sUnit.create();
      // this.S.page = sPage.create();
      // this.S.gui  = sGUI.create();
      //this.root.attr("draggable", true);
      //this.view.node.style.backgroundColor = "gray";
      return this;
    },

    detach() { // VIEWを切り離す。
      this.sRender.detach();
    },
    attach() { // ビューをアタッチする
      this.sRender.attach(this.root.get(0));
    },

    //==========================================================================
    // DOM関連
    //==========================================================================
    // ROOT DOM
    setupRoot(id) { // ROOTノードを取得する
      this.D.root = $("#"+id);
    },
    get root () { // ROOTノードへのアクセッサ
      return this.D.root;
    },
    get view () { // ターゲットビューへのアクセッサ
      return this.sRender.view;
    },

    //==========================================================================
    // システム関連
    //==========================================================================
    get sUnit() { // ユニットシステムへのアクセッサ
      return this.S.unit;
    },
    get sNote() { // ノートシステムへのアクセッサ
      return this.S.note;
    },
    get sGUI(){   // GUIシステムへのアクセッサ
      return this.S.gui;
    },
    get sRender(){ // 描画システムへのアクセッサ
      return this.S.render;
    },
    get sResource(){ // リソースシステムへのアクセッサ
      return this.S.resource;
    },

    //==========================================================================
    // ユーティリティ
    //==========================================================================
    draw(prog){
      this.sNote.setProg(prog);
      this.sUnit.update();
      this.sUnit.apply();
    },
  }
};

window.NekoNecode.Cats.set("Ragamuffin", Ragamuffin);
console.info("setup NekoNecode.Ragamuffin");
})();
