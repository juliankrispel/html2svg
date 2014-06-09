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



#What now?
Let's start this naively. I assume that we'll need to walk through all the dom nodes first.

    html2svg = (container) ->
        assert(container, 'domNode')
        window.el = container

        containerDimensions = el.getBoundingClientRect()

        svg = createSvgElement('svg')

        walk(svg, container)

        return svg


    walk = (svg, container) ->
        for child in container.children
            svgEl = createSvgElement('rect')
            setAttributes(svgEl, mapAttributes(child))
            svg.appendChild(svgEl)
            walk(svg, child)
        

    mapAttributes = (el) ->
        assert(el, 'domNode')
        box = el.getBoundingClientRect()
        style = getComputedStyle(el)
        console.log style
        {
            stroke: style.borderColor
            strokeWidth: style.borderWidth
            fill: style.backgroundColor || '#ccc'
            height: box.height
            width: box.width
            x: box.left
            y: box.top
        }

    global = true

    if global == true
        window.html2svg = html2svg
        window.isType = isType
        window.assert = assert
