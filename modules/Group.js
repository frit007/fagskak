var Group = Group || (function() {
    Group = function() {
        // create a new array so it is not shared among instances
        this.users = [];
	    this.boundFunctions = {};
    }

    Group.prototype = {
        users: [],

        
        /**
         * Add user to the group, and add any socket bindings for the group
         * 
         * @param {User} user 
         */
        addUser: function(user) {
            if(this.users.indexOf(user) === -1) {
                this.users.push(user);
                // create a two way relationship to the user
                user.addToGroup(this);
            }

            if (user.socket !== null) {
                for	(var key in this.boundFunctions) {
                    var boundFunction = this.boundFunctions[key];
                    user.socket.on(key, boundFunction.bind(user));
                }
            }
        },

        /**
         * Remove user from the group and optionally remove socket bindings
         * 
         * @param {User} user 
         * @param {Boolean} keepBindings 
         */
        removeUser: function(user, keepBindings) {
            var index = this.users.indexOf(user);
            if(index != -1) {
                this.users.splice(index, 1);
                // end the two way relationship to the user
                user.removeFromGroup(this);
            }

            if (keepBindings !== true && typeof user.socket === "object") {
                // if removeBindings is true remove all socket bindings
                for (var event in this.boundFunctions) {
                    var boundFunction = this.boundFunctions[event];
                    if (typeof user.socket === "object" && typeof user.socket.removeListener !== "undefined") {
                        user.socket.removeListener(event, boundFunction);   
                    }
                }
            }
        },


        /**
         * check if this has a user
         * 
         * @param {User} user
         * @return {boolean}
         */
        containsUser: function(user) {
            return this.users.indexOf(user) !== -1;
        },


        /**
         * bind callback to socket event
         * "this" is bound to the person sending the event 
         * 
         * @param {string} event 
         * @param {callback} response 
         */
        on: function(event, response) {
            
            this.boundFunctions[event] = response;
            // bind the event on every user socket
            for (var key in this.users ) {
                var user = this.users[key];
                if (user.socket) {
                    user.socket.on(event, response.bind(user));
                }
            }
        },

        /**
         * Unbind specific event
         * 
         * @param {string} event 
         */
        off: function(event) {
            var boundFunction = this.boundFunctions[event]

            this.users.forEach(function(user){
                user.socket.removeListener(event, boundFunction);
            }, this)
        },

        /**
         * emit event to every user in group
         * 
         * @param {string} event 
         * @param {any} data 
         */
        emit: function(event, data) {
            this.users.forEach(function(user) {
                user.emit(event, data);
            }, this);
        },

        /**
         * Transfers all members from this group to another
         * 
         * @param {any} otherGroup 
         */
        transferToGroup: function(otherGroup) {
            this.users.forEach(function(user) {
                user.removeFromGroup(this);
                user.addToGroup(otherGroup);
            },this)
        },

        /**
         * Disband the group, remove all users from the group
         * 
         */
        disband: function() {
            this.users.forEach(function(user) {
                user.removeFromGroup(this);
            },this)
        }
    };

    return Group;
}())


// UMD (Universal Module Definition)
;(function (root) {
    if (typeof define === 'function' && define.amd) {

        // AMD
        define([], function () {
            return Group;
        });

    } else if (typeof module !== 'undefined' && typeof exports === 'object') {

        // Node.js
        module.exports = Group;

    } else if (typeof root !== 'undefined') {

        // Global variable
        root.Group = Group;

    }
})(this);