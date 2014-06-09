(function() {
  var TextBlock, TextObject, adjustAlignment, assertArray, assertDomNode, assertFunction, assertNotNull, assertNumber, assertObject, assertString, assertType, calculateCharsPerLine, createSvgElement, getLineWidth, isArray, isDomNode, isFunction, isNumber, isObject, isString, key, measureText, measureTexts, setAttributes, splitTextIntoLines, svg, txt1, txt2, txt3, txtblock, value, _attributes, _fn;

  _attributes = {
    'fill': '#333',
    'font-size': 14,
    'letter-spacing': 'normal',
    'font-weight': 'normal',
    'text-anchor': 'start',
    'dy': '1.2em'
  };

  TextObject = (function() {
    function TextObject(text) {
      var k, v;
      this.text = text;
      assertString(this.text);
      this.textWidth = measureText(this);
      this._attributes = {};
      for (k in _attributes) {
        v = _attributes[k];
        this._attributes[k] = v;
      }
    }

    return TextObject;

  })();

  _fn = function(key) {
    return Object.defineProperty(TextObject.prototype, key, {
      get: function() {
        return this._attributes[key];
      },
      set: function(val) {
        this._attributes[key] = val;
        return this.textWidth = measureText(this);
      }
    });
  };
  for (key in _attributes) {
    value = _attributes[key];
    _fn(key);
  }

  Object.defineProperty(TextObject.prototype, 'attributes', {
    get: function() {
      return this._attributes;
    }
  });

  TextBlock = (function() {
    function TextBlock(parent, width, height, x, y, columns, gutter) {
      var num, _i, _len, _ref;
      this.parent = parent;
      this.width = width;
      this.height = height;
      this.x = x != null ? x : 0;
      this.y = y != null ? y : 0;
      this.columns = columns != null ? columns : 1;
      this.gutter = gutter != null ? gutter : 20;
      assertDomNode(this.parent);
      _ref = [this.width, this.height, this.x, this.y, this.columns];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        num = _ref[_i];
        assertNumber(num);
      }
      this._lineWidth = getLineWidth(this.width, this.columns, this.gutter);
      this.container = createSvgElement('g');
      this.textObjects = [];
      this.parent.appendChild(this.container);
    }

    TextBlock.prototype.addText = function(txtobj) {
      assertType(txtobj, TextObject);
      this.textObjects.push(txtobj);
      return this.render(this.textObjects);
    };

    TextBlock.prototype.createTextLines = function(textObjects, lineWidth) {
      var attrs, charsPerLine, lines, t, textLines, txtobj, _i, _j, _len, _len1;
      lines = [];
      for (_i = 0, _len = textObjects.length; _i < _len; _i++) {
        txtobj = textObjects[_i];
        charsPerLine = calculateCharsPerLine(txtobj.text.length, txtobj.textWidth, lineWidth);
        attrs = adjustAlignment(txtobj.attributes, lineWidth);
        textLines = splitTextIntoLines(txtobj.text, charsPerLine);
        for (_j = 0, _len1 = textLines.length; _j < _len1; _j++) {
          t = textLines[_j];
          lines.push(this.renderLine(t, attrs));
        }
      }
      return lines;
    };

    TextBlock.prototype.render = function(textObjects, lineWidth) {
      var t, tspans, _i, _len, _results;
      if (lineWidth == null) {
        lineWidth = this._lineWidth;
      }
      this.container.innerHTML = '';
      console.log(textObjects);
      tspans = this.createTextLines(textObjects, lineWidth);
      _results = [];
      for (_i = 0, _len = tspans.length; _i < _len; _i++) {
        t = tspans[_i];
        _results.push(this.container.appendChild(t));
      }
      return _results;
    };

    TextBlock.prototype.renderLine = function(text, attrs) {
      var tspan;
      tspan = createSvgElement('tspan');
      tspan.innerHTML = text;
      setAttributes(tspan, attrs);
      return tspan;
    };

    return TextBlock;

  })();

  adjustAlignment = function(attributes, lineWidth) {
    var attrs;
    attrs = _(attributes).clone();
    switch (attrs['text-anchor']) {
      case 'end':
        attrs['x'] = lineWidth;
        break;
      case 'middle':
        attrs['x'] = lineWidth / 2;
        break;
      default:
        attrs['x'] = 0;
    }
    return attrs;
  };

  getLineWidth = function(width, columns, gutter) {
    if (columns > 1) {
      return (width / columns) - (((columns - 1) * gutter) / columns);
    } else {
      return width;
    }
  };

  calculateCharsPerLine = function(textLength, textWidth, lineWidth) {
    var num, _i, _len, _ref;
    _ref = [textLength, textWidth, lineWidth];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      num = _ref[_i];
      assertNumber(num);
    }
    return Math.floor(textLength / (textWidth / lineWidth));
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

  measureText = function(text) {
    var svg, textContainer, textWidth, tspan;
    svg = createSvgElement('svg');
    textContainer = createSvgElement('text');
    tspan = createSvgElement('tspan');
    tspan.innerHTML = text.text;
    setAttributes(tspan, text.attributes);
    textContainer.appendChild(tspan);
    svg.appendChild(textContainer);
    document.body.appendChild(svg);
    textWidth = tspan.getBoundingClientRect().width;
    document.body.removeChild(svg);
    return textWidth;
  };

  measureTexts = function(textObjects) {
    var crect, measurements, svg, t, textContainer, tspan, tspans, _i, _j, _len, _len1;
    assertArray(textObjects);
    svg = createSvgElement('svg');
    textContainer = createSvgElement('text');
    measurements = [];
    tspans = [];
    for (_i = 0, _len = textObjects.length; _i < _len; _i++) {
      t = textObjects[_i];
      tspan = createSvgElement('tspan');
      tspan.innerHTML = t;
      tspans.push(tspan);
      textContainer.appendChild(tspan);
    }
    svg.appendChild(textContainer);
    document.body.appendChild(svg);
    for (_j = 0, _len1 = tspans.length; _j < _len1; _j++) {
      t = tspans[_j];
      crect = t.getBoundingClientRect();
      measurements.push(crect.textWidth);
    }
    document.body.removeChild(svg);
    return measurements;
  };

  createSvgElement = function(name) {
    var _svgNameSpace;
    _svgNameSpace = "http://www.w3.org/2000/svg";
    return document.createElementNS(_svgNameSpace, name);
  };

  setAttributes = function(el, obj) {
    var attr, _results;
    _results = [];
    for (attr in obj) {
      value = obj[attr];
      _results.push(el.setAttribute(attr, value));
    }
    return _results;
  };

  assertFunction = function(func) {
    if (!isFunction(func)) {
      throw new Error('variable must be function -> ' + func);
    }
  };

  assertString = function(obj) {
    if (!isString(obj)) {
      throw new Error('variable must be String -> ' + obj);
    }
  };

  assertDomNode = function(domNode) {
    if (!isDomNode(domNode)) {
      throw new Error('variable must be html element ->' + domNode);
    }
  };

  assertNotNull = function(args) {
    var a, _i, _len, _results;
    if (!isArray(args)) {
      args = [args];
    }
    _results = [];
    for (_i = 0, _len = args.length; _i < _len; _i++) {
      a = args[_i];
      if (a === null) {
        throw new Error('variable can not be null');
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  assertType = function(obj, classObject) {
    if (!(obj instanceof classObject)) {
      throw new Error('variable hast to be of type #{classObject}');
    }
  };

  assertArray = function(arr) {
    if (!isArray(arr)) {
      throw new Error('variable must be an array ->' + arr);
    }
  };

  assertNumber = function(num) {
    if (!isNumber(num)) {
      throw new Error('variable must be a number ->' + num);
    }
  };

  assertObject = function(obj) {
    if (!isObject(obj)) {
      throw new Error('variable must be an object ->' + obj);
    }
  };

  isObject = function(obj) {
    return !!obj && (obj.constructor === Object);
  };

  isNumber = function(obj) {
    return typeof obj === 'number' || obj instanceof Number;
  };

  isDomNode = function(domNode) {
    return domNode.hasOwnProperty('nodeType');
  };

  isString = function(obj) {
    return typeof obj === 'string' || obj instanceof String;
  };

  isArray = function(obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
  };

  isFunction = function(obj) {
    return obj instanceof Function;
  };

  svg = document.querySelector('svg');

  txtblock = new TextBlock(svg, 400, 400);

  txt1 = new TextObject("Title 1");

  txt2 = new TextObject("Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting.");

  txt3 = new TextObject("Remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.");

  txt1.fill = 'red';

  txt1['font-size'] = 23;

  txt2.fill = 'blue';

  txt3.fill = '#f00';

  txt1['font-weight'] = 'bold';

  txt3['text-anchor'] = 'end';

  txt3['font-size'] = 17;

  txtblock.addText(txt1);

  txtblock.addText(txt2);

  txtblock.addText(txt3);

  window.txt2 = txt2;

}).call(this);
