module.exports = function(mysqlPool) {
    /**
     * 
     * 
     * @param {[{x:number,z:number},...]} fields 
     * @param {{ id: number, name: string, color: HexColor}} category 
     * @param {{difficulty: number, influence: number, boardGroupName: string, id: number}} options 
     */
    function BoardBinding(fields, category, options) {
        this.fields = [];

        var defaultCategory = {
            color: "#FFFFFF",
            id: null,
            name: "",
        }
        
        var defaultOptions = {
            influence: 1,
            difficulty: 1,
            boardGroupName: "",
            id: null,
            board_width: 18,
            board_height: 18,
        }



        this.category = Object.assign(defaultCategory, category);
        this.options = Object.assign(defaultOptions, options);
        this.createLookupTable();
        this.addFields(fields);
    }

    BoardBinding.prototype = {
        createLookupTable: function() {
            this.lookupTable = {};
            for (var x = 0; x < this.options.board_width; x++) {
                // var element = this.options.board_width[x];
                this.lookupTable[x] = {};
                for (var z = 0; z < this.options.board_height; z++) {
                    this.lookupTable[x][z] = false;
                }
            }
        },

        hasField: function() {

        },
        /**
         * Add a field
         * 
         * @param {{x:number, z:number}} field 
         */
        addField: function(field) {
            this.fields.push(field);
            this.lookupTable[field.x][field.z] = true
        },

        /**
         * Add a fields
         * 
         * @param {[{x:number, z:number},...]} fields
         */
        addFields: function(fields){
            this.fields = this.fields.concat(fields);
            for (var index = 0; index < fields.length; index++) {
                var field = fields[index];
                this.lookupTable[field.x][field.z] = true;
            }
        }
    }
    return BoardBinding;
}



