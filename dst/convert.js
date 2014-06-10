(function() {
  var assert, createSvgElement, decorate, decorateRect, decorators, global, html2svg, isDomNode, isType, mapAttributes, setAttributes, walk,
    __slice = [].slice;

  assert = function(variable, typeName) {
    if (!isType(variable, typeName)) {
      throw new Error('Variable should be of type : ', typeName);
    }
  };

  isType = function(variable, typeName) {
    var type, typeString;
    type = Object.prototype.toString.call(variable);
    typeString = type.substr(8, type.length - 9).toLowerCase();
    if (typeName === void 0) {
      return typeString;
    } else {
      if (typeName === 'domNode') {
        return isDomNode(variable);
      } else {
        return typeString === typeName.toLowerCase();
      }
    }
  };

  isDomNode = function(domNode) {
    return domNode.hasOwnProperty('nodeType');
  };

  createSvgElement = function(name) {
    var _svgNameSpace;
    _svgNameSpace = "http://www.w3.org/2000/svg";
    return document.createElementNS(_svgNameSpace, name);
  };

  setAttributes = function(el, obj) {
    var attr, value, _results;
    _results = [];
    for (attr in obj) {
      value = obj[attr];
      _results.push(el.setAttribute(attr, value));
    }
    return _results;
  };

  decorateRect = function(svgEl, cssStyle, box) {
    var rect, svgStyle;
    rect = createSvgElement('rect');
    svgEl.appendChild(rect);
    console.log(cssStyle.borderRadius);
    svgStyle = {
      fill: cssStyle.backgroundColor,
      stroke: cssStyle.borderColor,
      strokeWidth: cssStyle.borderWidth,
      height: box.height,
      width: box.width,
      x: box.left,
      y: box.top
    };
    setAttributes(rect, svgStyle);
    return svgEl;
  };

  decorators = [decorateRect];

  html2svg = function(container) {
    var containerDimensions, svg;
    assert(container, 'domNode');
    window.el = container;
    containerDimensions = el.getBoundingClientRect();
    svg = createSvgElement('svg');
    walk(svg, container);
    return svg;
  };

  walk = function(svg, container) {
    var child, group, _i, _len, _ref, _results;
    assert(container, 'domNode');
    _ref = container.childNodes;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      child = _ref[_i];
      if (child.nodeName === '#text') {

      } else {
        group = createSvgElement('g');
        decorate(group, getComputedStyle(child), child.getBoundingClientRect());
        svg.appendChild(group);
        _results.push(walk(svg, child));
      }
    }
    return _results;
  };

  decorate = function() {
    var args, fn, _i, _len, _results;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    _results = [];
    for (_i = 0, _len = decorators.length; _i < _len; _i++) {
      fn = decorators[_i];
      _results.push(fn.apply(null, args));
    }
    return _results;
  };

  mapAttributes = function(el) {};

  global = true;

  if (global === true) {
    window.html2svg = html2svg;
    window.isType = isType;
    window.assert = assert;
  }

}).call(this);
