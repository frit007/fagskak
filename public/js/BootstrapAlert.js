(function(){

    // Helper functions 
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

	// This alert relies heavily on 
	// - Bootstrap
	// - Jquery

	var BootstrapAlert = function(containerId, args) {
		var _ = this;
		if (typeof args === "undefined") {
			args = {};
		}
		this.hideCheck = function(identifier) {
			// if it has an identifier and the identifier does not match the set identifier don't do anything
			if ((typeof(identifier) == "string") && identifier != _.identifier) {
				return false;
			}
			// if it has a numeric identifier, then only remove it the identifiers match 
			if (typeof(identifier) == "number" && identifier !== _.identifier) {
				return false;
			}
			return true;
		}
		this.hide = function(identifier) {
			if (_.hideCheck(identifier)) {
				_.alertContainter.style.display = 'none'
				_.identifier = null;
			}
		}

		this.modifiers = args.modifiers || {};

		// CurrentState is used to remove whatever class is on it at the moment 
		this.currentState = 'alert-danger';

		// Create the box around the message and style it
		this.alertContainter = document.createElement('div');
		// give it some classes
		$(this.alertContainter).addClass('alert alert-danger');

		// Create close button
		this.closeButton = document.createElement('a');
		// &times is a little x that looks neat
		this.closeButton.innerHTML = '&times;';
		// add bootstrap close class
		$(this.closeButton).addClass('close');
		// add href to no where in particular to give a nice hover effect
		// this.closeButton.href = '#';
		// add eventListener to hide the alert
		this.closeButton.addEventListener('click', this.hide);

		// Create span for text
		this.text = document.createElement('span');


		// find the id that points to the container
		var container = document.getElementById(containerId);

		if (container == undefined) {
			// if the given container doesn't exist then just append it to the body
			container = document.getElementsByTagName("BODY")[0];
		}

		// append our box to the container
		container.appendChild(this.alertContainter);
		// append a close button to the container
		this.alertContainter.appendChild(this.closeButton);
		// append text span to our container
		this.alertContainter.appendChild(this.text);


		// since there is nothing to say
		this.hide();

		this.identifier = null;

		var id = this.shownAt = null;
	}

	BootstrapAlert.prototype.isHidden = function() {
		var state = $(this.alertContainter).css('display');
		if (state == 'none') {
			return true;
		}
		return false;
	}

	BootstrapAlert.prototype.fadeOut = function(identifier) {
		if (this.hideCheck(identifier)) {
			$(this.alertContainter).fadeOut("fast", "linear")
			this.identifier = null;
		}	
	}

	BootstrapAlert.prototype.removeCurrentClass = function() {
		$(this.alertContainter).removeClass(this.currentState);
	}

	BootstrapAlert.prototype.addClass = function(className) {
		$(this.alertContainter).addClass(className);
		this.currentState = className;
	}
	BootstrapAlert.prototype.updateText = function(text) {
		this.text.innerHTML = text;
	}

	BootstrapAlert.prototype.show = function(className, text, identifier) {
		if (typeof(identifier) == "number") {
			if (this.identifier > identifier) {
				return;
			}
		}
		this.identifier = identifier;

		this.removeCurrentClass();

		this.addClass(className);

		this.updateText(text);

		// $(this.alertContainter).css('display', 'block');
		this.alertContainter.style.display = 'block';
		this.shownAt = new Date().getTime()+Math.random();
		return this.shownAt;
	}

	// alias to danger
	BootstrapAlert.prototype.error = function(text,identifier) {
		this.danger(text, identifier);
	}

	BootstrapAlert.prototype.danger = function(text, identifier) {
		var shownAt = this.show('alert-danger', text, identifier);
		this.applyModifiers("danger", shownAt);
	}

	BootstrapAlert.prototype.warning = function(text, identifier) {
		var shownAt = this.show('alert-warning', text, identifier);
		this.applyModifiers("warning", shownAt);
	}

	BootstrapAlert.prototype.info = function(text, identifier) {
		var shownAt = this.show('alert-info', text, identifier);
		this.applyModifiers("info", shownAt);
	}

	BootstrapAlert.prototype.success = function(text, identifier) {
		var shownAt = this.show('alert-success', text, identifier);
		this.applyModifiers("success", shownAt);
	}

	BootstrapAlert.prototype.applyModifiers = function(type, shownAt) {
		var modifier = this.modifiers[type];
		if (modifier === undefined) {
			return;
		}

		if (modifier['hide'] !== undefined) {
			setTimeout(function(shownAt){
				if (this.shownAt === shownAt) {
					// check if it is still the same alert being shown
					// if it is the same hide it
					this.fadeOut();
				}
			}.bind(this, shownAt), modifier['hide'])
		}
	}


	BootstrapAlertManager = function(userSettings) {
		var options = {
			onePerIdentifier: true,
			BootstrapAlertArgs: {

			},
			containerId: null,
		}

		$.extend(options, userSettings);

		// identifier sorted to a bootstrapAlert
		var bootstrapAlerts = {};
		window.alerts = bootstrapAlerts;
        // BAM = BootstrapAlertManager
		var BAM = this; 
		$.extend(this, {
			danger: function(text, identifier) {
				// debugger;
				BAM.show("danger", text, identifier);
			},
			info: function(text, identifier) {
				BAM.show("info", text, identifier);
			},
			success: function(text, identifier) {
				BAM.show("success", text, identifier);
			},
			warning: function(text, identifier) {
				BAM.show("warning", text, identifier);
			},
			show: function(className, text, identifier) {
				bootstrapAlert = BAM.getBootstrapAlert(identifier);
				bootstrapAlert[className](text, identifier);
			},
			hide: function(identifier) {
				if (identifier === undefined) {
					for(var key in bootstrapAlerts) {
						bootstrapAlert = bootstrapAlerts[key];
						bootstrapAlert.hide();
					}
				} else {
					BAM.getBootstrapAlert(identifier).hide();
				}
			},
			getBootstrapAlert: function(identifier) {
				bootstrapAlert = null;
				if (identifier === undefined) {
					identifier = "undefinedIdentifier";
				}
				if (bootstrapAlerts[identifier] === undefined) {
					bootstrapAlerts[identifier] = new BootstrapAlert(options.containerId, options.BootstrapAlertArgs);
				}
				return bootstrapAlerts[identifier];
			}
		})
	}

	window.BootstrapAlert = BootstrapAlert;
	window.BootstrapAlertManager = BootstrapAlertManager;
}())