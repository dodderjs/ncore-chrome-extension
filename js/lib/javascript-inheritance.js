/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
(function(){var a=!1,b=/xyz/.test(function(){xyz})?/\b_super\b/:/.*/;this.Class=function(){},Class.extend=function(c){function g(){!a&&this.init&&this.init.apply(this,arguments)}var d=this.prototype;a=!0;var e=new this;a=!1;for(var f in c)e[f]=typeof c[f]=="function"&&typeof d[f]=="function"&&b.test(c[f])?function(a,b){return function(){var c=this._super;this._super=d[a];var e=b.apply(this,arguments);this._super=c;return e}}(f,c[f]):c[f];g.prototype=e,g.constructor=g,g.extend=arguments.callee;return g}})();