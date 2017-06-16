

function GLBoardSelector(board, color, active) {
    
    this.path = new GLPath(board, color);
    this.selected = [];
    this.board = board;

    this.active = active || false;
    this.setupListener();
}

GLBoardSelector.prototype = {
    active: false,
    getSelectedDifference: function(staging) {
        // start with a copy of the selected array
        // debugger;
        difference = this.selected.slice();
        for (var i = staging.length -1; i >= 0; i--) {
            var brick = staging[i];
            
            var index = difference.indexOf(brick);
            if (index === -1) {
                // if the brick is not selected then add it
                difference.push(brick);
            } else {
                // if the brick is already selected then remove it
                difference.splice(index, 1);
            }

        }
        return difference;
    },

    clear: function() {
        this.selected = [];
        this.path.resetParticles();

    },

    enable: function() {
        this.active = true;
        this.clear();
    },
    disable: function() {
        this.active = false;
        this.clear();
    },

    /**
     * get selected coordinates in object format
     * 
     * @returns [{x:x,y:y},...] 
     */
    getCoordinates: function() {
        var coords = [];
        for (var index = 0; index < this.selected.length; index++) {
            var brick = this.selected[index];
            coords.push({
                x: brick.x,
                z: brick.z
            });
        }
        return coords;
    },


    /**
     * get selected coordiantes in array format
     * 
     * @returns [[x,z],...] 
     */
    getArrayCoordinates: function() {
        var coords = [];
        for (var index = 0; index < this.selected.length; index++) {
            var brick = this.selected[index];
            coords.push([brick.x, brick.z]);
        }
        return coords;
    },

    setupListener: function() {
        var getSelectedBricks = (startBrick, endBrick) => {
            if (startBrick === null || endBrick === null) {
                return [];
            }
            var selected = [];

            var minX = Math.min(startBrick.x, endBrick.x);
            var maxX = Math.max(startBrick.x, endBrick.x);
            var minZ = Math.min(startBrick.z, endBrick.z);
            var maxZ = Math.max(startBrick.z, endBrick.z);
            // debugger;
            for (var x = minX; x <= maxX; x++) {
                for (var z = minZ; z <= maxZ; z++) {
                    var brick = this.board.getBrick(x,z)
                    if (brick !== null) {
                        selected.push(brick);
                    }
                }
            }
            return selected;
        }

        var updateSelected = (event) => {
                endBrick = this.board.getClickedBrick(event);
                newSelected = getSelectedBricks(startBrick, endBrick);
                selectedBricks = this.getSelectedDifference(newSelected);
                 
                this.path.update(selectedBricks);
                return selectedBricks;
        }


        var startBrick = null;
        var endBrick, selectedBricks, difference;
        
        this.board.container.addEventListener("mousedown", (event) => {
            // debugger;
            if (this.active && event.buttons == 1 /*left click*/) {
                startBrick = this.board.getClickedBrick(event);
                console.log("startBrick", startBrick);

            }
            
        })

        this.board.container.addEventListener("mouseup", (event) => {
            if (event.buttons == event.buttons == 1 /*left click*/ && startBrick !== null) {
                // endBrick = this.board.getClickedBrick(event);

                this.selected = updateSelected(event);
                startBrick = null;
                endBrick = null;
            }
        })

        this.board.container.addEventListener("mousemove", (event) => {
            // console.log("mousemove");
            if (startBrick !== null) {
                updateSelected(event)
                // endBrick = this.board.getClickedBrick(event);
                // newSelected = getSelectedBricks(startBrick, endBrick);
                // selectedBricks = this.getSelectedDifference(newSelected);
                 
                // this.path.update(selectedBricks);
            }
        })
    }



}


// UMD (Universal Module Definition)
;(function (root) {

    if (typeof define === 'function' && define.amd) {

        // Asynchronous Module Definition(AMD)
        define([], function () {
            return GLBoardSelector;
        });

    } else if (typeof module !== 'undefined' && typeof exports === 'object') {
    
        // Node.js
        module.exports = GLBoardSelector;
    
    } else if (typeof root !== 'undefined') {
    
        // Global variable
        root.GLBoardSelector = GLBoardSelector;
    
    }

})(this);
