/*
petit query var0.1.3
取得は最初の1個(parent,children,prev...)
操作は全て(wrap)

*/

window.$$ = function(selector){
  'use strict';
  if(Object.prototype.toString.call(selector).match(/HTML/)) return $$.clone([selector]);
  return new petitQuery(selector);
};

$$.query = function(context, selector){
  var nodes = [];
  if(Object.prototype.toString.call(selector).match(/String/)){
    q =  context.querySelectorAll(selector);
    for(var i = 0; i < q.length; i++) nodes.push(q[i]);
    return nodes;
  }
  return [selector];
};

$$.clone = function(selector){
  var n = new petitQuery(null);
  return n.push(selector);
};

$$.checkSameSelector = function(node, selector){
  node.m = node.matches || node.webkitMatchesSelector || node.msMatchesSelector || node.oMatchesSelector;
  return node.m(selector);
};


$$.createElm = function(context){
  if(!context.match(/<(\w+)/)) return null;

  var elm = document.createElement(context.match(/<(\w+)/)[1]);
  elm.textContent = context.match(/>([^<]*)/)[1];

  var re = new RegExp('[^\\s]+\\=\\"[^\\s\\>]*\\"', 'g');
  var attrArray = context.match(re);
  if(!attrArray) return elm;
  for(var i = 0; i < attrArray.length; i++){
    elm.setAttribute(attrArray[i].match(/^([^\=]+)\=/)[1], attrArray[i].match(/([^\=\"]*)+\"$/)[1]);
  }
  return elm;
};

$$.ajax = function(o){
  o.method = o.type || o.method || 'get';
  try{
    var xhr = new XMLHttpRequest();
    xhr.open(o.method, o.url);
    xhr.send();
    xhr.onreadystatechange = function(response) {
      if(xhr.readyState === 4){
        if(xhr.status === 200 && o.success) return o.success.call(this, response.target);
        if(xhr.status !== 200 && o.error) return o.error.call(this, response.target);
        return response;
      }
    };
  }
  catch(e){
    if(xhr.status !== 200 && o.error) return o.error.call(this, response.target);
    return response;
  }
};

var petitQuery = function(selector){
  'use strict';
  if (selector) this.push($$.query(document, selector));
  return this;
};

petitQuery.prototype = {
  addClass: function(classes){
    if(!this[0]) return this;

    classes = classes.split(' ');
    for(var i=0; i<this.length; i++){
      var classesPre = $$(this[i]).attr('class');
      if(classesPre === null || classesPre === undefined) classesPre = '';
      var classesPreArray = classesPre.split(' ');

      var classesNew = classesPre;
      for(var c=0; c<classes.length; c++){
        if(classesPre.indexOf(classes[c]) == -1) classesNew += ' ' + classes[c];
      }

      $$(this[i]).attr('class', classesNew);
    }
    return this;
  },
  after: function(context){
    var arr = [];
    for(var i=0; i<this.length; i++){
      if($$.createElm(context)){
        this[i].parentNode.insertBefore($$.createElm(context), this[i].nextSibling);
        arr.push(this[i].nextSibling);
      }
    }
    return $$.clone(arr);
  },
  animate: function(style, speed){
    /*var arr = [];
    for(var i=0; i<this.length; i++){
      if(!speed) speed = {duration: 400, easing: 'ease-in-out'};
      if(typeof speed == 'number') speed = {duration: speed, easing: 'ease-in-out '};

      var _this = this[i];
      if(style instanceof Array){
        this[i].animate(style, speed);
      }
      else{
        for(var s in style){
          if(typeof style[s] != 'object'){
            style[s] = [eval('_this.style.' + s), style[s]];
          }
        }
        var animation = this[i].animate(style, speed);
        
        animation.onfinish = function(){
          for(var s in style){
            eval('_this.style.' + s + '= style[s][style[s].length - 1]');
          }
        };
      }
    }*/
    return this;
  },
  append: function(context){
    var arr = [];
    for(var i=0; i<this.length; i++){
      this[i].appendChild($$.createElm(context));
      arr.push(this[i].lastChild);
    }
    return $$.clone(arr);
  },
  attr: function(attribute, val){
    if(val === null || val === undefined){
      if(typeof attribute === 'string'){
        return this[0].getAttribute(attribute);
      }
      else{
      for(var i=0; i<this.length; i++){
          for(var a in attribute){
            this[i].setAttribute(a, attribute[a]);
          }
        }
      }
    }
    else{
      for(var i=0; i<this.length; i++){
        this[i].setAttribute(attribute, val);
      }
    }
    return this;
  },
  before: function(context){
    var arr = [];
    for(var i=0; i<this.length; i++){
      if($$.createElm(context)){
        this[i].parentNode.insertBefore($$.createElm(context), this[i]);
        arr.push(this[i].previousSibling);
      }
    }
    return $$.clone(arr);
  },
  children: function(selector){
    var nodes = [];
    var children = this[0].children;
    for(var i=0; i<children.length; i++){
      if(selector && !$$.checkSameSelector(children[i], selector)) continue;
      nodes.push(children[i]);
    }
    return $$.clone(nodes);
  },
  css: function(property, val){
    function setStyle(styleVal, property){
      var preVal = new RegExp(property + '\\s*:[^;]+');
      if(styleVal.match(preVal)){
        return styleVal.replace(preVal, property + ':' + val);
      }
      if(styleVal.match(/;$/)){
        return styleVal += property + ':' + val;
      }
      return styleVal += ';' + property + ':' + val;
    }

    if(val === null || val === undefined){
      if(typeof property === 'string'){
        return eval('this[0].style.' + property);
      }
      else{
        for(var i=0; i<this.length; i++){
          var styleVal = this[i].getAttribute('style') || '';
          for(var p in property){
            styleVal = setStyle(styleVal, p);
          }

          this[i].setAttribute('style', newStyleVal);
        }
      }
    }
    else{
      for(var i=0; i<this.length; i++){
        var styleVal = this[i].getAttribute('style') || '';
        styleVal = setStyle(styleVal, property);

        this[i].setAttribute('style', styleVal);
      }
    }
    return this;
  },
  each: function(f){
    for(var i=0; i<this.length; i++){
      f.call(this[i], i,  this[i]);
    }
    return this;
  },
  empty: function(){
    for(var i=0; i<this.length; i++){
      this[i].innerHTML = '';
    }
    return this;
  },
  eq: function(num){
    if(num >= 0) return $$(this[num]);
    return $$(this[this.length + num]);
  },
  find: function(selector){
    return $$.clone($$.query(this[0], selector));
  },
  first: function(selector){
    if(selector === null || selector === undefined || $$.checkSameSelector(this[0], selector)) return $$(this[0]);
    return null;
  },
  has: function(selector){
    var nodes = [];
    for(var i=0; i<this.length; i++){
      for(var ii=0; ii<this[i].children.length; ii++){
        if($$.checkSameSelector(this[i].children[ii], selector)){
          nodes.push(this[i]);
          break;
        }
      }
    }
    return $$.clone(nodes);
  },
  hasClass: function(cls){
    var classes = $$(this[0]).attr('class');
    var re = new RegExp('(^|\\s)' + cls + '($|\\s)');
    if(classes === null || classes === undefined) return false;
    if(classes.match(re)) return true;
    return false;
  },
  height: function(){
    if(this[0].style && this[0].style.height) return this[0].style.height;
    if(this[0].clientHeight) return this[0].clientHeight;
    if(this[0].innerHeight) return this[0].innerHeight;
    return 0;
  },
  html: function(context){
    if(!context) return this[0].innerHTML;
    for(var i=0; i<this.length; i++){
      this[i].innerHTML = context;
    }
    return this;
  },
  last: function(selector){
    if(selector === null || selector === undefined || $$.checkSameSelector(this[this.length - 1], selector)) return $$(this[this.length - 1]);
    return null;
  },
  next: function(selector){
    if(selector === null || $$.checkSameSelector(this[0].nextElementSibling, selector)) return $$(this[0].nextElementSibling);
    return null;
  },
  not: function(selector){
    var nodes = [];
    for(var i=0; i<this.length; i++){
      if(!$$.checkSameSelector(this[i], selector) ){
        nodes.push(this[i]);
      }
    }
    return $$.clone(nodes);
  },
  offset: function(){
    var rect = this[0].getBoundingClientRect();
    var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    return {'top':rect.top + scrollTop , 'left':rect.left + scrollLeft };
  },
  on: function(event, f){
    for(var i=0; i<this.length; i++){
      var eventArray = event.split(' ');
      for(var e=0; e<eventArray.length; e++){
        this[i].addEventListener(eventArray[e], f, false);
      }
    }
    return this;
  },
  parent: function(selector){
    if(!this[0]) return new petitQuery(null);
    if (selector === null || selector === undefined || (typeof selector === 'string' && $$.checkSameSelector(this[0].parentNode, selector)) ) return $$(this[0].parentNode);
    return null;
  },
  parents: function(selector){
    if(!this[0]) return new petitQuery(null);
    var p = this[0];
    while(true){
      p = p.parentNode;
      if(!p) return null;
      if($$.checkSameSelector(p, selector)) return $$(p);
    }
  },
  prepend: function(context){
    var arr = [];
    for(var i=0; i<this.length; i++){
      if($$.createElm(context)){
        this[i].insertBefore($$.createElm(context), this[i].firstChild);
        arr.push(this[i].firstChild);
      } 
    }
    return $$.clone(arr);
  },
  prev: function(selector){
    if(selector === null || selector === undefined || $$.checkSameSelector(this[0].previousElementSibling, selector)) return $$(this[0].previousElementSibling);
    return null;
  },
  prop: function(property, val){
    if(val === null || val === undefined){
      return eval('this[0].' + property);
    }
    for(var i=0; i<this.length; i++){
      var q = typeof val == 'string' ? '"' : '';
      eval('this[i].' + property + '=' + q + val + q);
    }
    return this;
  },
  push: function(elems){
    Array().push.apply(this, elems);
    return this;
  },
  ready: function(f){
    for(var i=0; i<this.length; i++){
      this[i].addEventListener('DOMContentLoaded', f);
    }
    return this;
  },
  remove: function(){
    for(var i=0; i<this.length; i++){
      this[i].outerHTML = '';
    }
    return this;
  },
  removeAttr: function(attribute){
    for(var i=0; i<this.length; i++){
      this[i].removeAttribute(attribute);
    }
    return this;
  },
  removeClass: function(classes){
    classes = classes.split(' ');
    for(var i=0; i<this.length; i++){
      var updateClasses = $$(this[i]).attr('class');
      if(!updateClasses) continue;
      for(var c in classes){
        var re = new RegExp('\\s?' + classes[c]);
        updateClasses = updateClasses.replace(re, '');
      }
      $$(this[i]).attr('class', updateClasses);
    }
    return this;
  },
  scroll: function(f){
    for(var i=0; i<this.length; i++){
      this[i].onscroll = f;
    }
    return this;
  },
  scrollLeft: function(num){
    if(!num){
      return this[0].scrollLeft;
    }
    for(var i=0; i<this.length; i++){
      this[i].scrollLeft = num;
    }
    return this;
  },
  scrollTop: function(num){
    if(!num){
      return this[0].scrollTop;
    }
    for(var i=0; i<this.length; i++){
      this[i].scrollTop = num;
    }
    return this;
  },
  text: function(context){
    if(!context) return this[0].textContent;
    for(var i=0; i<this.length; i++){
      this[i].textContent = context;
    }
    return this;
  },
  val: function(context){
    if(!context) return this[0].value;
    for(var i=0; i<this.length; i++){
      this[i].value = context;
    }
    return this;
  },
  width: function(){
    if(this[0].style && this[0].style.width) return this[0].style.width;
    if(this[0].clientWidth) return this[0].clientWidth;
    if(this[0].innerWidth) return this[0].innerWidth;
    return 0;
  },
  wrap: function(context){
    if(!$$.createElm(context)) return this;
    var arr = [];
    for(var i=0; i<this.length; i++){
      var wrap = $$.createElm(context);
      this[i].parentNode.insertBefore(wrap, this[i]);
      wrap.appendChild(this[i]);
      arr.push(wrap);
    }
    return $$.clone(arr);
  },
  wrapAll: function(context){
    if(!$$.createElm(context)) return this;
    var wrap = $$.createElm(context);
    var parent = this[0].parentNode;
    parent.insertBefore(wrap, parent.firstChild);
    for(var i=parent.childNodes.length-1; i>0; i--){
      wrap.insertBefore(parent.childNodes[i], wrap.firstChild);
    }
    return $$(wrap);
  },
};