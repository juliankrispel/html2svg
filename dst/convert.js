(function() {
  var assert, createSvgElement, global, html2svg, isDomNode, isType, mapAttributes, setAttributes, walk;

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
    var child, svgEl, _i, _len, _ref, _results;
    _ref = container.children;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      child = _ref[_i];
      svgEl = createSvgElement('rect');
      setAttributes(svgEl, mapAttributes(child));
      svg.appendChild(svgEl);
      _results.push(walk(svg, child));
    }
    return _results;
  };

  mapAttributes = function(el) {
    var box, style;
    assert(el, 'domNode');
    box = el.getBoundingClientRect();
    style = getComputedStyle(el);
    console.log(style);
    return {
      stroke: style.borderColor,
      strokeWidth: style.borderWidth,
      fill: style.backgroundColor || '#ccc',
      height: box.height,
      width: box.width,
      x: box.left,
      y: box.top
    };
  };

  global = true;

  if (global === true) {
    window.html2svg = html2svg;
    window.isType = isType;
    window.assert = assert;
  }

}).call(this);
