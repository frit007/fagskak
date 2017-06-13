// function SocketGroup () {
// 	this.sockets = [];
// 	this.boundFunctions = {}
// }

// SocketGroup.prototype = {
// 	/**
// 	 * Add client to socketGroup, adds all the existing listeners to client.
// 	 * 
// 	 * @param {User} user 
// 	 * @param {Socket} client 
// 	 */
// 	addClient: function(user, client) {
// 		if(this.sockets.indexOf(client) == -1) {
// 			sockets.push(client);
// 		}

// 		for	(var key in this.boundFunctions) {
// 			var boundFunction = this.boundFunctions[key];
// 			client.on(key, boundFunction);
// 		}
// 	},

// 	/**
// 	 * remove client from socket group, and if remove binding is on then removes all bindings from the socket
// 	 * 
// 	 * @param {Socket} client 
// 	 * @param {boolean} removeBindings  
// 	 */
// 	removeClient: function(client, removeBindings) {
// 		var index = this.sockets.indexOf(client);
// 		if(index > -1) {
// 			this.sockets.splice(index, 1);
// 		}

// 		if (removeBindings === true) {
// 			// if removeBindings is true remove all socket bindings
// 			this.sockets.forEach(function(socket) {
// 				for (var event in this.boundFunctions) {
// 					var boundFunction = this.boundFunctions[event];
// 					socket.off(event, boundFunction);					
// 				}
// 			}, this);
// 		}
// 	},

// 	/**
// 	 * Broadcast a message to all sockets in this socket group
// 	 * 
// 	 * @param {String} messageKey 
// 	 * @param {any} message 
// 	 */
// 	emit: function(messageKey, message) {

// 		this.sockets.forEach(function(sockets) {
// 			socket.emit(messageKey, message);
// 		}, this);
// 	},


//     /**
// 	 * bind callback to socket event
// 	 * 
// 	 * @param {string} event 
// 	 * @param {callback} response 
// 	 */
// 	on: function(event, response) {
		
//         this.boundFunctions[event] = response;
//         for (var key in this.sockets ) {
// 			this.sockets[key].on(event, response);
			
// 		}
		
// 		socket.on(event, response);
//     },

// 	/**
// 	 * Unbind specific event
// 	 * 
// 	 * @param {string} event 
// 	 */
// 	off: function(event) {
// 		var boundFunction = this.boundFunctions[event]
// 		if (typeof boundFunction !== "undefined") {
// 			socket.off(event, boundFunction)
// 		}
//     }

// }


// module.export = SocketGroup;