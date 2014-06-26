(function() {
  var assert, calculateCharsPerLine, convertText, createShape, createSvgElement, createText, getSizeAndPosition, getStyles, global, html2svg, isDomNode, isType, measureText, setAttributes, splitTextIntoLines, visitDomNodes;

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
      fill: cssStyle['background-color'],
      stroke: cssStyle['border-top-color'],
      'stroke-width': cssStyle['border-top-width']
    });
    setAttributes(rect, svgStyle);
    return svgEl;
  };

  getStyles = function(el) {
    var css, prop, styles, val, _i, _len;
    css = getComputedStyle(el, '');
    styles = {};
    for (_i = 0, _len = css.length; _i < _len; _i++) {
      prop = css[_i];
      val = css.getPropertyValue(prop);
      if (val) {
        styles[prop] = val;
      }
    }
    return styles;
  };

  createText = function(svgEl, cssStyle, box, textNode) {
    var attributes, fontSize, i, l, left, lineHeight, lines, paddingTop, text, top, totalTextWidth, tspan, tspanAttributes, tspanAttributesCloned, _i, _len, _results;
    text = createSvgElement('text');
    svgEl.appendChild(text);
    fontSize = parseFloat(cssStyle['font-size']);
    lineHeight = parseFloat(cssStyle['line-height']);
    if (cssStyle['display'] === 'inline') {
      lineHeight = fontSize;
    }
    paddingTop = parseFloat(cssStyle['padding-top']);
    top = parseInt(box.y);
    left = parseInt(box.x) + parseInt(cssStyle['padding-left']);
    console.log('\ntext > ', textNode.wholeText, '\ny', box.y, '\nlineHeight > ', lineHeight, '\nfontSize > ', fontSize, '\npaddingTop > ', paddingTop);
    attributes = {
      width: box.width,
      x: left,
      y: top + paddingTop
    };
    tspanAttributes = {
      'font-size': parseInt(cssStyle['font-size']),
      'font-weight': cssStyle['font-weight'],
      'alignment-baseline': 'central',
      'fill': cssStyle.color,
      'dy': lineHeight,
      x: left
    };
    setAttributes(text, attributes);
    totalTextWidth = measureText(textNode.wholeText, tspanAttributes);
    lines = convertText(textNode.wholeText, totalTextWidth, box.width);
    _results = [];
    for (i = _i = 0, _len = lines.length; _i < _len; i = ++_i) {
      l = lines[i];
      tspan = createSvgElement('tspan');
      tspan.textContent = l;
      tspanAttributesCloned = _.clone(tspanAttributes);
      if (i === 0) {
        tspanAttributesCloned.dy = lineHeight / 2;
      }
      setAttributes(tspan, tspanAttributesCloned);
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
    style = getStyles(container);
    group = createSvgElement('g');
    createShape(group, style, box);
    svg.appendChild(group);
    _ref = container.childNodes;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      child = _ref[_i];
      if (child.nodeName === '#text') {
        _results.push(createText(group, style, box, child));
      } else if (child.nodeName === '#comment') {

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
    return Math.ceil(textLength / (textWidth / lineWidth));
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
