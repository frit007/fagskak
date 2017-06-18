/**
 * requires GLPath
 */

function FieldOverview(board, fieldBindings) {
    this.board = board;
    this.fieldBindings = fieldBindings || [];
}

FieldOverview.prototype = {
    
    show: function() {
        this.foreachFieldBinding((fieldBinding) => {
            fieldBinding.path.show();
        });
    },
    
    hide: function() {
        this.foreachFieldBinding((fieldBinding) => {
            fieldBinding.path.hide();
        })
    },
    
    foreachFieldBinding: function(func){
        for (var key in this.fieldBindings) {
            var fieldBinding = this.fieldBinding[key];
            func(fieldBinding);
        }
    },
    
    add: function(category, difficulty, path) {
        thid.addFieldBinding(new FieldBinding(category, difficulty, path));
    },
    
    addFieldBinding: function(fieldBinding) {
        this.fieldBindings.push(fieldBinding);
    },
    
    showLabels: function() {
        
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

}