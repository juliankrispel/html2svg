#Html to Svg conversion
The goal of this project is fairly simple:
Reproduce a html document as an svg document.

##What's the point?
SVG is great for pdfs and printing, but for HTML you need a browser...

##First things first?
First of all, here are some utility functions that I'll use throughout.

A simple assert function

    assert = (variable, typeName) ->
        if !isType(variable, typeName)
            throw new Error('Variable should be of type : ', typeName)

And a simple type-checking function

    isType = (variable, typeName) ->
        type = Object.prototype.toString.call( variable )
        typeString = type.substr(8, type.length-9).toLowerCase()
        if(typeName == undefined)
            return typeString
        else
            if typeName == 'domNode'
                return isDomNode(variable)
            else
                return typeString == typeName.toLowerCase()


    isDomNode = (domNode) ->
        domNode.hasOwnProperty('nodeType')

    createSvgElement = (name) ->
        document.createElementNS("http://www.w3.org/2000/svg", name)

    setAttributes = (el, obj) ->
        for attr, value of obj
            el.setAttribute(attr, value)

##Html-SVG attribute map
SVG isn't as flexible as HTML is. Unlike HTML, not every CSS or style attribute
applies to every element. For example, an SVG text element can't have border
or background, whereas a rect element can.

To work around that make those conversions with a set of functions, that are
executed for each visitation to a node in the object tree

    createShape = (svgEl, cssStyle, box)->
        rect = createSvgElement('rect')
        svgEl.appendChild(rect)
        svgStyle = _.extend(box, {
            fill: cssStyle.backgroundColor
            stroke: cssStyle.borderColor
            'stroke-width': cssStyle.borderWidth
        })

        setAttributes(rect, svgStyle)
        svgEl

    createText = (svgEl, cssStyle, box, textNode) ->
        text = createSvgElement('text')
        svgEl.appendChild(text)

        halfFontSize = parseFloat(cssStyle.fontSize) / 2
        halfLineHeight = parseFloat(cssStyle.lineHeight) / 2
        paddingTop = parseInt(parseFloat(cssStyle.paddingTop) + halfLineHeight + (halfLineHeight - halfFontSize))
        top = parseInt(box.y)
        left = parseInt(box.x) + parseInt(cssStyle.paddingLeft)

        console.log('text', cssStyle.fontSize, cssStyle.lineHeight)
        attributes = {
            width: box.width
            x: left
            y: top + paddingTop
        }

        tspanAttributes = {
            'font-size': parseInt(cssStyle.fontSize)
            'fill': cssStyle.color
            'dy': parseInt(cssStyle.lineHeight)
            x: left
        }
        
        setAttributes(text, attributes)
        totalTextWidth = measureText(textNode.wholeText)
        lines = convertText(textNode.wholeText, totalTextWidth, box.width)

        for l,i in lines
            tspan = createSvgElement('tspan')
            tspan.textContent = l
            if(i == 0)
                setAttributes(tspan, _.omit(tspanAttributes, 'dy'))
            else
                setAttributes(tspan, tspanAttributes)
            text.appendChild(tspan)

        #text.textContent = textNode.wholeText


One annoyance with SVG is that elements aren't as flexible as in Html.
For example, a html element can contain both text and have a background
and a border. Svg Text Elements can't have that so we need to split 
functionality into different elements. A rectangle could inherit the stroke
and background color, where an Svg Text Element could contain the text.

##What now?
I assume that we'll need to walk through all the dom nodes first.

    html2svg = (container) ->
        assert(container, 'domNode')
        window.el = container

        box = el.getBoundingClientRect()

        svg = createSvgElement('svg')

        setAttributes(svg, {
            height: box.height
            width: box.width
        })

        svg.containerOffset = [box.left, box.top]

        visitDomNodes(svg, container, true)

        return svg


    visitDomNodes = (svg, container, isFirst) ->
        assert(container, 'domNode')

        box = getSizeAndPosition(container, svg.containerOffset)

        style = getComputedStyle(container)
        group = createSvgElement('g')
        createShape(group, style, box)
        svg.appendChild(group)

        for child in container.childNodes
            if child.nodeName == '#text'
                createText(group, style, box, child)
                #console.log 'TODO: Render text nodes'
            else
                visitDomNodes(svg, child)

    getSizeAndPosition = (el, containerOffset) ->
        box = el.getBoundingClientRect()
        {
            x: box.left - containerOffset[0]
            y: box.top - containerOffset[1]
            width: box.width
            height: box.height

        }

    convertText = (text, textWidth, lineWidth) ->
        lines = []
        charsPerLine = calculateCharsPerLine(text.length, textWidth, lineWidth)
        splitTextIntoLines(text, charsPerLine)

    calculateCharsPerLine = (textLength, textWidth, lineWidth) ->
        assert(num, 'number') for num in [textLength, textWidth, lineWidth]
        Math.floor(textLength / (textWidth / lineWidth))

    # To measure text we actually need to append text to the dom
    measureText = (text, attributes) ->
        svg = createSvgElement('svg')
        textContainer = createSvgElement('text')
        tspan = createSvgElement('tspan')
        tspan.innerHTML = text
        setAttributes(tspan, attributes)
        
        # Append svg to dom
        textContainer.appendChild(tspan)
        svg.appendChild(textContainer)
        document.body.appendChild(svg)

        # capture width of text
        textWidth = tspan.getBoundingClientRect().width

        # Remove SVG after operating on it.
        document.body.removeChild(svg)

        # Return width of text
        textWidth

    splitTextIntoLines = (text, charsPerLine, lines = []) ->
        if(text.length > charsPerLine)
            currentLine = text.substr(0, charsPerLine).split(/\s/)
            currentLine.pop()
            currentLine = currentLine.join(' ')

            remainingText = text.substr(currentLine.length).trim()

            lines.push(currentLine)
            splitTextIntoLines(remainingText, charsPerLine, lines)
        else
            if(text.length > 1)
                lines.push(text)
            lines

    global = true

    if global == true
        window.html2svg = html2svg
        window.isType = isType
        window.assert = assert
