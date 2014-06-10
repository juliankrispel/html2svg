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
        _svgNameSpace = "http://www.w3.org/2000/svg"
        document.createElementNS(_svgNameSpace, name)

    setAttributes = (el, obj) ->
        for attr, value of obj
            el.setAttribute(attr, value)

##Html-SVG attribute map
SVG isn't as flexible as HTML is. Unlike HTML, not every CSS or style attribute
applies to every element. For example, an SVG text element can't have border
or background, whereas a rect element can.

To work around that make those conversions with a set of functions, that are
executed for each visitation to a node in the object tree

    decorateRect = (svgEl, cssStyle, box)->
        rect = createSvgElement('rect')
        svgEl.appendChild(rect)
        console.log cssStyle.borderRadius
        svgStyle = {
            fill: cssStyle.backgroundColor
            stroke: cssStyle.borderColor
            strokeWidth: cssStyle.borderWidth
            height: box.height
            width: box.width
            x: box.left
            y: box.top
        }

        setAttributes(rect, svgStyle)

        svgEl

    decorators = [decorateRect]

One annoyance with SVG is that elements aren't as flexible as in Html.
For example, a html element can contain both text and have a background
and a border. Svg Text Elements can't have that so we need to split 
functionality into different elements. A rectangle could inherit the stroke
and background color, where an Svg Text Element could contain the text.

So I'd say we have another map that tells our program how to group these 
attributes.

    #processAttributes = {
    #    'stroke': 
    #}

##What now?
Let's start this naively. I assume that we'll need to walk through all the dom nodes first.

    html2svg = (container) ->
        assert(container, 'domNode')
        window.el = container

        containerDimensions = el.getBoundingClientRect()

        svg = createSvgElement('svg')

        walk(svg, container)

        return svg


    walk = (svg, container) ->
        assert(container, 'domNode')
        for child in container.childNodes
            if child.nodeName == '#text'
                #console.log 'TODO: Render text nodes'
            else
                group = createSvgElement('g')
                decorate(group, getComputedStyle(child), child.getBoundingClientRect())
                svg.appendChild(group)
                walk(svg, child)

    decorate = (args...) ->
        fn(args...) for fn in decorators

    mapAttributes = (el) ->

    global = true

    if global == true
        window.html2svg = html2svg
        window.isType = isType
        window.assert = assert
