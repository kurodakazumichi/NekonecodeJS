// NekoNecode
// NekoNecode系列の各種ライブラリの親的な存在。
// NekoNecodeライブラリをは全てこのNekoNecode.jsを事前に読み込む事を前提としている。
// jQueryを使用する。
(function(){
'use strict';

var NekoNecode = {
  //============================================================================
  // 猫たち
  //============================================================================
  Cats : {
    _cats : {},

    set(name, cat) {
      this._cats[name] = cat;
    },
    get(name) {
      return this._cats[name];
    },
  },

  //============================================================================
  // ログ
  //============================================================================
  Log:{
    info(v){
      console.log(v);
    },
    error(v){
      console.error(v);
    },
  },

  //============================================================================
  // 汎用メソッド
  //============================================================================
  Fn:{
    undef(a) { // 初期化されてない変数が渡されたらtrue
      return (a === void 0);
    },
  },

  //============================================================================
  // イージング
  //============================================================================
  Easing:{
    ease(method, a, b, t){
      return this[method](a, b, t);
    },
    direct(a, b, t){
      return (t == 0)? a : b;
    },
    linear(a, b, t) { // 線形補間
      return a + (b - a) * t;
    },
    inQuad(a, b, t){ // 二次関数補間
      return a + (b - a) * (t*t);
    },
    inCubic(a, b, t){ // ３次関数補間
      return a + (b - a) * (t*t*t);
    },
    inBackCubic(a, b, t){
      return a + ((b-a) * ((t*t*t) - t * -1.5 *Math.sin(t * Math.PI)));
    },
    outBackCubic(a, b, t){
      return a + ((b-a) * ((t*t*t) - t * 1.5 *Math.sin(t * Math.PI)));
    },

  },
  //============================================================================
  // 数学クラス
  //============================================================================
  Math:{
    // 数値の線形補間
    lerp(a, b, t) {
      return a + (b - a) * t;
    },
    // 数値の球面線形補間
    slerp(a, b, t) {
      return a + (b - a) * Math.sin(Math.PI / 2 * t);
    },
    // 範囲内の数値に丸める
    within(a, min, max){
      a = Math.min(max, a);
      a = Math.max(min, a);
      return a;
    }
  },

  //============================================================================
  // 配列クラス
  //============================================================================
  Array:{
    // 配列の補間
    lerp(a, b, t){
      var arr = [];
      for(var i = 0, len = Math.max(a.length, b.length); i < len; ++i){
          arr[i] = NekoNecode.Math.lerp(a[i] || 0, b[i] || 0, t);
      }
      return arr;
    },
  },

  //============================================================================
  // 独自の色系ライブラリ
  //============================================================================
  Color : {
    create(c) {
      var o = Object.create(this.prototype);
      // RGBAを配列で管理
      o._rgba = [0, 0, 0, 0];
      o.set(c);
      return o;
    },
    prototype:{
      get r ()  { return this._rgba[0]; },
      set r (v) { this._rgba[0] = v; },
      get g ()  { return this._rgba[1]; },
      set g (v) { this._rgba[1] = v; },
      get b ()  { return this._rgba[2]; },
      set b (v) { this._rgba[2] = v; },
      get a ()  { return this._rgba[3]; },
      set a (v) { this._rgba[3] = NekoNecode.Math.within(v, 0, 1); },
      get hex (){
        var hex = "#";
        for(var i = 0; i < 3; ++i) {
          hex += ("0" + this._rgba[i].toString(16)).slice(-2);
        }
        return hex;
      },
      get rgb (){
        this.round();
        return `rgb(${this.r}, ${this.g}, ${this.b})`;
      },
      get rgba(){
        this.round();
        return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
      },
      // アルファがマイナスの場合は色として無効
      isEnable() { return (0 < this.a); },

      round() {
        for(var i = 0; i < 3; ++i){
          this._rgba[i] = Math.round(this._rgba[i]);
        }
      },

      // 線形補間
      lerp(from, to, t) {
        var lerp   = NekoNecode.Math.lerp;
        this.r = lerp(from.r, to.r, t);
        this.g = lerp(from.g, to.g, t);
        this.b = lerp(from.b, to.b, t);
        this.a = lerp(from.a, to.a, t);
      },

      // カラーコードやカラーオブジェクトを元に色をセットする
      set (c) {
        switch(NekoNecode.Color.getType(c)) {
          case "color" : this.setFromColor(c); break;
          case "hex3"  : this.setFromHex3(c); break;
          case "hex6"  : this.setFromHex6(c); break;
          case "rgb"   : this.setFromRGB(c); break;
          case "rgba"  : this.setFromRGBA(c); break;
          default      : this.setInvalid(); break;
        }
      },
      setInvalid(){
        this.r = this.g = this.b = 0;
        this.a = -1;
      },
      setFromColor(c) {
        Object.assign(this, c);
      },
      setFromHex3(hex3) {
        hex3 = hex3.replace("#", "");
        for(var i = 0; i < 3; ++i) {
          var h = hex3.substring(i, i + 1);
          this._rgba[i] = parseInt(h + h, 16);
        }
        this.a = 1;
      },
      setFromHex6(hex6) {
        hex6 = hex6.replace("#", "");
        for(var i = 0; i < 3; ++i) {
          this._rgba[i] = parseInt(hex6.substring(i * 2, i * 2 + 2), 16);
        }
        this.a = 1;
      },
      setFromRGB(rgb) {
        rgb.replace(/(rgb|\s|\(|\))/g, "").split(",").map(function(v, i){
          this._rgba[i] = parseInt(v);
        }.bind(this));
        this.a = 1;
      },
      setFromRGBA(rgba) {
        rgba.replace(/(rgba|\s|\(|\))/g, "").split(",").map(function(v, i){
          this._rgba[i] = parseFloat(v);
        }.bind(this));
      },
    },
    // hex3, hex6, rgb, rgba, cColor, undefinedのいずれかを返す
    getType(c) {
      if(c == null) return "undefined";
      var type = typeof c;

      if(type == "string") {
        if(/^#([\da-fA-F]{3})$/.test(c))
          return "hex3";
        if(/^#([\da-fA-F]{6})$/.test(c))
          return "hex6";
        if(/^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)/.test(c))
          return "rgb";
        if(/^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3}),\s*([0-9]+\.?[0-9]+)\s*\)/.test(c))
          return "rgba";
      }

      // cColorオブジェクトだったらtypeをcolorにする
      if(type == "object" && NekoNecode.Color.prototype.isPrototypeOf(c)) {
          return "color";
      }
      return "undefined";
    },


    toRGB(hex) {
      if(hex == null) return null;
      var c = [];
      var add = 0;
      if(hex.length == 4) add = 1;
      if(hex.length == 7) add = 2;

      // カラーコードとして識別できないならnull
      if(add == 0) return null;

      // 文字列を切り出してRGBを数値化(0～255)
      for(var i = 0; i < 3; ++i) {
        var s = 1 + (i*add);
        var e = s + add;
        var h = hex.substring(s, e);

        if(h.length == 1) {
          h += h;
        }
        c[i] = parseInt(h, 16);

      }
      return c;
    },
    toHex(rgb) {
      if(rgb == null) return null;
      var hex = "#";
      for(var i = 0; i < rgb.length; ++i) {
        var c = Math.round(rgb[i]);
        hex += ("0" + c.toString(16)).slice(-2);
      }
      return hex;
    },
    lerpRGB(from, to, t) {
      if(from == null && to == null) return null;
      if(from == null) return to;
      if(to   == null) return from;
    },
    lerp(from, to, t) {
      if(from == to) return from;
      var c0 = cColor.toRGB(from);
      var c1 = cColor.toRGB(to);

      var c = [];
      for(var i = 0; i < 3; ++i) {
        c[i] = NekoNecode.Math.lerp(c0[i], c1[i], t);
      }

      return cColor.toHex(c);
    }
  },
};

  // グローバル空間にNekoNecode用の空間を作成
  window.NekoNecode = NekoNecode;
  console.log("initialized NekoNecode");
})();
