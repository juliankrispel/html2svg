(function() {
  var assert, calculateCharsPerLine, convertText, createShape, createSvgElement, createText, getSizeAndPosition, global, html2svg, isDomNode, isType, measureText, setAttributes, splitTextIntoLines, visitDomNodes;

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
    return document.createElementNS("http://www.w3.org/2000/svg", name);
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
    svgStyle = _.extend(box, {
      fill: cssStyle.backgroundColor,
      stroke: cssStyle.borderColor,
      'stroke-width': cssStyle.borderWidth
    });
    setAttributes(rect, svgStyle);
    return svgEl;
  };

  createText = function(svgEl, cssStyle, box, textNode) {
    var attributes, halfFontSize, halfLineHeight, i, l, left, lines, paddingTop, text, top, totalTextWidth, tspan, tspanAttributes, _i, _len, _results;
    text = createSvgElement('text');
    svgEl.appendChild(text);
    halfFontSize = parseFloat(cssStyle.fontSize) / 2;
    halfLineHeight = parseFloat(cssStyle.lineHeight) / 2;
    paddingTop = parseInt(parseFloat(cssStyle.paddingTop) + halfLineHeight + (halfLineHeight - halfFontSize));
    top = parseInt(box.y);
    left = parseInt(box.x) + parseInt(cssStyle.paddingLeft);
    console.log('text', cssStyle.fontSize, cssStyle.lineHeight);
    attributes = {
      width: box.width,
      x: left,
      y: top + paddingTop
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
    for (i = _i = 0, _len = lines.length; _i < _len; i = ++_i) {
      l = lines[i];
      tspan = createSvgElement('tspan');
      tspan.textContent = l;
      if (i === 0) {
        setAttributes(tspan, _.omit(tspanAttributes, 'dy'));
      } else {
        setAttributes(tspan, tspanAttributes);
      }
      _results.push(text.appendChild(tspan));
    }
    return _results;
  };

  html2svg = function(container) {
    var box, svg;
    assert(container, 'domNode');
    window.el = container;
    box = el.getBoundingClientRect();
    svg = createSvgElement('svg');
    setAttributes(svg, {
      height: box.height,
      width: box.width
    });
    svg.containerOffset = [box.left, box.top];
    visitDomNodes(svg, container, true);
    return svg;
  };

  visitDomNodes = function(svg, container, isFirst) {
    var box, child, group, style, _i, _len, _ref, _results;
    assert(container, 'domNode');
    box = getSizeAndPosition(container, svg.containerOffset);
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
        _results.push(visitDomNodes(svg, child));
      }
    }
    return _results;
  };

  getSizeAndPosition = function(el, containerOffset) {
    var box;
    box = el.getBoundingClientRect();
    return {
      x: box.left - containerOffset[0],
      y: box.top - containerOffset[1],
      width: box.width,
      height: box.height
    };
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
