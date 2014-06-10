(function() {
  var assert, calculateCharsPerLine, convertText, createShape, createSvgElement, createText, global, html2svg, isDomNode, isType, measureText, setAttributes, splitTextIntoLines, walkDom;

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

  createShape = function(svgEl, cssStyle, box) {
    var rect, svgStyle;
    rect = createSvgElement('rect');
    svgEl.appendChild(rect);
    console.log(cssStyle.lineHeight);
    svgStyle = {
      fill: cssStyle.backgroundColor,
      stroke: cssStyle.borderColor,
      'stroke-width': cssStyle.borderWidth,
      height: box.height,
      width: box.width,
      x: box.left,
      y: box.top
    };
    setAttributes(rect, svgStyle);
    return svgEl;
  };

  createText = function(svgEl, cssStyle, box, textNode) {
    var attributes, l, left, lines, paddingTop, text, top, totalTextWidth, tspan, tspanAttributes, _i, _len, _results;
    text = createSvgElement('text');
    svgEl.appendChild(text);
    paddingTop = parseInt(cssStyle.paddingTop) + (parseFloat(cssStyle.lineHeight) / 2);
    top = parseInt(box.top);
    left = parseInt(box.left) + parseInt(cssStyle.paddingLeft);
    attributes = {
      width: box.width,
      x: left,
      y: top,
      dy: paddingTop
    };
    tspanAttributes = {
      'font-size': parseInt(cssStyle.fontSize),
      'fill': cssStyle.color,
      'dy': parseInt(cssStyle.lineHeight),
      x: left
    };
    setAttributes(text, attributes);
    totalTextWidth = measureText(textNode.wholeText);
    lines = convertText(textNode.wholeText, totalTextWidth, box.width);
    _results = [];
    for (_i = 0, _len = lines.length; _i < _len; _i++) {
      l = lines[_i];
      tspan = createSvgElement('tspan');
      tspan.textContent = l;
      setAttributes(tspan, tspanAttributes);
      _results.push(text.appendChild(tspan));
    }
    return _results;
  };

  html2svg = function(container) {
    var containerDimensions, svg;
    assert(container, 'domNode');
    window.el = container;
    containerDimensions = el.getBoundingClientRect();
    svg = createSvgElement('svg');
    walkDom(svg, container);
    return svg;
  };

  walkDom = function(svg, container) {
    var box, child, group, style, _i, _len, _ref, _results;
    assert(container, 'domNode');
    box = container.getBoundingClientRect();
    style = getComputedStyle(container);
    group = createSvgElement('g');
    createShape(group, style, box);
    svg.appendChild(group);
    _ref = container.childNodes;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      child = _ref[_i];
      if (child.nodeName === '#text') {
        _results.push(createText(group, style, box, child));
      } else {
        _results.push(walkDom(svg, child));
      }
    }
    return _results;
  };

  convertText = function(text, textWidth, lineWidth) {
    var charsPerLine, lines;
    lines = [];
    charsPerLine = calculateCharsPerLine(text.length, textWidth, lineWidth);
    return splitTextIntoLines(text, charsPerLine);
  };

  calculateCharsPerLine = function(textLength, textWidth, lineWidth) {
    var num, _i, _len, _ref;
    _ref = [textLength, textWidth, lineWidth];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      num = _ref[_i];
      assert(num, 'number');
    }
    return Math.floor(textLength / (textWidth / lineWidth));
  };

  measureText = function(text, attributes) {
    var svg, textContainer, textWidth, tspan;
    svg = createSvgElement('svg');
    textContainer = createSvgElement('text');
    tspan = createSvgElement('tspan');
    tspan.innerHTML = text;
    setAttributes(tspan, attributes);
    textContainer.appendChild(tspan);
    svg.appendChild(textContainer);
    document.body.appendChild(svg);
    textWidth = tspan.getBoundingClientRect().width;
    document.body.removeChild(svg);
    return textWidth;
  };

  splitTextIntoLines = function(text, charsPerLine, lines) {
    var currentLine, remainingText;
    if (lines == null) {
      lines = [];
    }
    if (text.length > charsPerLine) {
      currentLine = text.substr(0, charsPerLine).split(/\s/);
      currentLine.pop();
      currentLine = currentLine.join(' ');
      remainingText = text.substr(currentLine.length).trim();
      lines.push(currentLine);
      return splitTextIntoLines(remainingText, charsPerLine, lines);
    } else {
      if (text.length > 1) {
        lines.push(text);
      }
      return lines;
    }
  };

  global = true;

  if (global === true) {
    window.html2svg = html2svg;
    window.isType = isType;
    window.assert = assert;
  }

}).call(this);
