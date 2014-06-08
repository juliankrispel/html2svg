#Svg Layout Engine
Let's build something that converts html to svg

So where do we start off?

Well, I guess first we need to iterate through all 


We need an efficient way to layout text with svg.

A class of TextBlock has following capabilites/responsibilites:
- It can line-wrap text
- It arrange columns
- The supplied text can be an array of text objects
- It can adjust column gap via a gutter
- It rerenders when it's configuration changes

Story (How I imagine the implementation)

#TextObject
I start out with a bunch of TextBlocks. The TextBlock can hold
a bunch of Text as well as a set of attributes for svg elements.

Maybe extend EventStream for this?

    #Function::property = (prop, desc) ->
    #    Object.defineProperty @prototype, prop, desc

    _attributes = 
        'fill': '#333'
        'font-size': 14
        'letter-spacing': 'normal'
        'font-weight': 'normal'
        'text-anchor': 'start'
        'dy': '1.2em'


    class TextObject
        constructor: (@text) ->
            assertString @text
            @textWidth = measureText(@)
            @_attributes = {}
            for k, v of _attributes
                @_attributes[k] = v 

    for key, value of _attributes
        do(key) ->
            Object.defineProperty TextObject.prototype, key,
                get: ->
                    @_attributes[key]
                set: (val)->
                    @_attributes[key] = val
                    @textWidth = measureText(@)

    Object.defineProperty TextObject.prototype, 'attributes',
        get: ->
            @_attributes

    class TextBlock
        constructor: (@parent, @width, @height, @x = 0, @y = 0, @columns = 1, @gutter = 20)->
            assertDomNode(@parent)
            assertNumber num for num in [@width, @height, @x, @y, @columns]

            @_lineWidth = getLineWidth(@width, @columns, @gutter)

            @container = createSvgElement('g')

            #Instantiate private properties
            @textObjects = []
            @parent.appendChild(@container)

        addText: (txtobj) ->
            assertType(txtobj, TextObject) 
            @textObjects.push(txtobj)
            @render(@textObjects)

        createTextLines: (textObjects, lineWidth) ->
            lines = []
            for txtobj in textObjects
                charsPerLine = calculateCharsPerLine(txtobj.text.length, txtobj.textWidth, lineWidth)
                attrs = adjustAlignment(txtobj.attributes, lineWidth)
                textLines = splitTextIntoLines(txtobj.text, charsPerLine)
                lines.push @renderLine t, attrs for t in textLines
            lines

        render: (textObjects, lineWidth = @_lineWidth) ->
            @container.innerHTML = ''
            console.log textObjects
            tspans = @createTextLines(textObjects, lineWidth)
            for t in tspans
                @container.appendChild t

        renderLine: (text, attrs)->
            tspan = createSvgElement('tspan')
            tspan.innerHTML = text
            setAttributes(tspan, attrs)
            tspan

    adjustAlignment = (attributes, lineWidth) ->
        attrs = _(attributes).clone()
        switch attrs['text-anchor']
            when 'end' then attrs['x'] = lineWidth 
            when 'middle' then attrs['x'] = lineWidth/2 
            else attrs['x'] = 0
        attrs

    getLineWidth = (width, columns, gutter) ->
        if columns > 1
            return (width / columns) - (((columns - 1) * gutter) / columns)
        else
            return width

## splitTextObject function takes a TextObject and splits it up into an array of lines
We take a TextObject, and by using its width want to determine how many words 
fit on each line. We do this recursively

    calculateCharsPerLine = (textLength, textWidth, lineWidth) ->
        assertNumber num for num in [textLength, textWidth, lineWidth]
        Math.floor(textLength / (textWidth / lineWidth))

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

## measureText Gets the total pixel count for each Text object
measureText creates an svg text element that is used just for measuring the 
pixel width of the text nodes. This can then be used as information for 
line and column wrapping

    measureText = (text) ->
        svg = createSvgElement('svg')
        textContainer = createSvgElement('text')
        tspan = createSvgElement('tspan')
        tspan.innerHTML = text.text
        setAttributes(tspan, text.attributes)
        


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

    measureTexts = (textObjects) ->
        assertArray(textObjects)

        svg = createSvgElement('svg')
        textContainer = createSvgElement('text')
        measurements = []

        tspans = []

        for t in textObjects
            tspan = createSvgElement('tspan')
            tspan.innerHTML = t
            tspans.push tspan
            textContainer.appendChild(tspan)
        
        # Append all nodes in one go to minimize dom use
        svg.appendChild(textContainer)
        document.body.appendChild(svg)

        # Then iterate over tspans to get pixel length of each text object
        for t in tspans
            crect = t.getBoundingClientRect()
            measurements.push(crect.textWidth)

        document.body.removeChild(svg)
        measurements

## Helper functions for creating svg elements and setting attributes on dom nodes

    createSvgElement = (name) ->
        _svgNameSpace = "http://www.w3.org/2000/svg"
        document.createElementNS(_svgNameSpace, name)

    setAttributes = (el, obj) ->
        for attr, value of obj
            el.setAttribute(attr, value)


## Assertion functions that help making methods safer

    assertFunction = (func) ->
        throw new Error 'variable must be function -> ' + func unless isFunction(func)

    assertString = (obj) ->
        throw new Error 'variable must be String -> ' + obj unless isString(obj)

    assertDomNode = (domNode) ->
        throw new Error 'variable must be html element ->' + domNode unless isDomNode(domNode)

    assertNotNull = (args) ->
        args = [args] unless isArray(args)
        for a in args
            throw new Error 'variable can not be null' if a == null

    assertType = (obj, classObject) ->
        throw new Error 'variable hast to be of type #{classObject}' unless obj instanceof classObject

    assertArray = (arr) ->
        throw new Error 'variable must be an array ->' + arr unless isArray(arr)

    assertNumber = (num) ->
        throw new Error 'variable must be a number ->' + num unless isNumber(num)

    assertObject = (obj) ->
        throw new Error 'variable must be an object ->' + obj unless isObject(obj)

    isObject = (obj) ->
        !!obj && (obj.constructor == Object)

    isNumber = (obj) ->
        typeof obj == 'number' || obj instanceof Number

    isDomNode = (domNode) ->
        domNode.hasOwnProperty('nodeType')

    isString = (obj) ->
        typeof obj == 'string' || obj instanceof String

    isArray = (obj) ->
        Object.prototype.toString.call( obj ) == '[object Array]'

    isFunction = (obj) ->
        obj instanceof Function

## Initiate script

    svg = document.querySelector('svg')
    txtblock = new TextBlock(svg, 400, 400)
    txt1 = new TextObject "Title 1"
    txt2 = new TextObject "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting."
    txt3 = new TextObject "Remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
    txt1.fill = 'red'
    txt1['font-size'] = 23
    txt2.fill = 'blue'
    txt3.fill = '#f00'
    txt1['font-weight'] = 'bold'
    txt3['text-anchor'] = 'end'
    txt3['font-size'] = 17
    txtblock.addText(txt1)
    txtblock.addText(txt2)
    txtblock.addText(txt3)
    window.txt2 = txt2
