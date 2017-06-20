/*
 * requires GLPath
 * requires GLHUD
 * requires GLBoard
 */


/**
 * 
 * 
 * @param {GLBoard} board 
 * @param {{fieldBindings: [FieldBindings,...], allowRemove: bool}} options
 */
function FieldOverview(board, options) {
    this.board = board;
    this.fieldBindings = [];

    options = options || {};
    
    this.allowRemove = options.allowRemove || false;


    if (options.fieldBindings) {
        for (var index = 0; index < options.fieldBindings.length; index++) {
            var fieldBinding = options.fieldBindings[index];
            this.addFieldBinding(fieldBinding);
        }        
    }


    this.hud = new GLHUD(board);
    this.right = createElement("div", this.hud.overlay, {"style": "float: right"});
}

FieldOverview.prototype = {
    
    show: function() {
        this.foreachFieldBinding((fieldBinding) => {
            fieldBinding.path.show();
        });
        this.hud.show();
    },
    
    hide: function() {
        this.hud.hide();
        this.foreachFieldBinding((fieldBinding) => {
            fieldBinding.path.hide();
        })
    },
    
    foreachFieldBinding: function(func){
        for (var key in this.fieldBindings) {
            var fieldBinding = this.fieldBindings[key];
            func(fieldBinding);
        }
    },
    
    add: function(category, difficulty, path) {
        this.addFieldBinding(new FieldBinding(category, difficulty, path));
    },

    removeFieldBinding: function(fieldBinding) {
        fieldBinding.removeHTML();
        fieldBinding.path.hide();
        var index = this.fieldBindings.indexOf(fieldBinding);
        if (index != -1) {
            this.fieldBindings.splice(index, 1);
        }
        this.show();
    },
    
    addFieldBinding: function(fieldBinding) {
        this.fieldBindings.push(fieldBinding);


        fieldBinding.createHTML(this.right, this.allowRemove);


        if (this.allowRemove) {
            fieldBinding.button.addEventListener("click", () => {
                this.removeFieldBinding(fieldBinding);
            });            
        }


        fieldBinding.container.addEventListener("mouseenter", () => {
            this.foreachFieldBinding((otherBinding) => {
                if (otherBinding !== fieldBinding) {             
                    otherBinding.path.hide();   
                }
            }) 
        });
        fieldBinding.container.addEventListener("mouseleave", () =>{
            this.foreachFieldBinding((otherBinding) => {
                if (otherBinding !== fieldBinding) {
                    otherBinding.path.show();   
                }
            }) 
        })
    },

    getInfo: function() {
        return {
            fields: this.getFieldInfo()
        }
    },

    getFieldInfo: function() {
        var info = [];
        for(var i = 0; i < this.fieldBindings.length; i++) {
            var fieldBinding = this.fieldBindings[i];
            info.push(fieldBinding.getInfo());
        }
        return info;
    }
}



/**
 * 
 * 
 * @param {Object}{color, name, id} category 
 * @param {Number} difficulty 
 * @param {GLPath} path 
 */
function FieldBinding(category, difficulty, path) {
    this.category = category;
    this.difficulty = difficulty;
    this.path = path;
    this.path.setColor(category.color);
}

FieldBinding.prototype = {
    createHTML: function(parent, allowRemove) {
        this.container = createElement("div", parent, {style: "margin:2px", style:"pointer-events: all"});
        if (allowRemove) {
            this.button = createElement("i", this.container, {class:"fa fa-window-close fa-2x", "aria-hidden": "true", style:"margin: 3px; cursor: pointer"});        
        }
        this.label = createElement("span", this.container, {style: "font-size: 22px; color: " + this.category.color+ "; cursor: help;"}, this.category.name + "(" + this.difficulty + ")");
        
    },
    removeHTML: function() {
        if (this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);        
        }
    },
    getInfo() {
        return {
            category: this.category,
            difficulty: this.difficulty,
            fields: this.path.getArrayCoordinates()
        }
    }
}