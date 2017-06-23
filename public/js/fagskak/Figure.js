
var Figure = Figure || function() {
    var Figure = function(x, y, z, board) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.board = board;

    }

    Figure.prototype = {

        // define so it can be overwritten
        moveAnimation: undefined,

        goto: function(x, y, z, callback) {
            callback = callback || function(){};
            // unbind brick so it no longer will be pushed up automatically if the brick moves
            var brick = this.board.getBrick(this.x,this.z);
            brick.unBindFigure(this);
            
            var relativeX = x + this.x;
            var relativeY = y + this.y;
            var relativeZ = z + this.z;
            
            if (relativeY > 17) {
                return callback("Sorry you are not allowed to go high than 18!");
            }

            var brick = this.board.getBrick(relativeX,relativeZ);
            
            
            if (!brick) {
                return callback("Out of bounds!");
            }


            if (brick.height >= relativeY) {
                return callback("Cannot stand inside another brick!")
            }


            brick.increaseHeight(relativeY-1);
            

            this.x=relativeX;
            this.y=relativeY;
            this.z=relativeZ;

            if (this.board.useAnimations && this.moveAnimation) {
                this.moveAnimation(relativeX, relativeY, relativeZ, brick, callback);
            } else {
                // the brick should be bound at the end of the animation, but if there is no animation then just set it now.
                brick.bindFigure(this);
                callback();
            }
        },

        getCoord: function() {
            return {
                x: this.x,
                y: this.y,
                z: this.z,
            }
        },

    }
    return Figure;
}();

// UMD (Universal Module Definition)
;(function (root) {

    if (typeof define === 'function' && define.amd) {

        // AMD
        define([], function () {
            return Figure;
        });

    } else if (typeof module !== 'undefined' && typeof exports === 'object') {
    
        // Node.js
        module.exports = Figure;
    
    } else if (typeof root !== 'undefined') {
    
        // Global variable
        root.Figure = Figure;
    
    }

})(this);