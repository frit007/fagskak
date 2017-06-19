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

function GLHUD(board) {
    this.board = board;
    
    $(board.container).css("position", "relative");

    this.overlay = createElement("div", this.board.container, {'style' : 'position: absolute; width:100%; height: 100%; top:0px; left:0px; pointer-events: none'});
}

GLHUD.prototype = {
    show: function() {
        $(this.overlay).show();
    },
    hide: function() {
        $(this.overlay).hide();
    }
}