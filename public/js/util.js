    /**
     * Create element
     * 
     * @param {String} type 
     * @param {HTMLElement} appendTo 
     * @param {Object} attributes 
     * @param {String} text 
     * @returns 
     */
    function createElement(type, appendTo, attributes, text) {
        var ele = document.createElement(type);
        // ele.className = className;
        for(var attributeName in attributes) {
            var attributeValue = attributes[attributeName];
            ele.setAttribute(attributeName, attributeValue);
        }
        appendTo.appendChild(ele);

        if (text) {
            ele.innerHTML = text;
        }
        return ele;
    };