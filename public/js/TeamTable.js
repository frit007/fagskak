/**
 * create a table for a team
 * 
 * @param {Objct} options 
 * @param {Socket} socket 
 * @param {BootsTrapAlert} info 
 */
function TeamTable(options, socket, info){
    var defaultOptions = {
        location: window.document,
        color: "#FFF",
        name: "New Team"
    }
    this.socket = socket;
    this.info = info;
    this.options = Object.assign(defaultOptions, options);
    this.createTable(this.options.location);
    this.update(this.options);
}

TeamTable.prototype = {
    createTable: function(location){
        this.wrapper = createElement("div", location, {class:"panel"});
        
        this.teamHeader = createElement("div", this.wrapper, {class: "panel-heading", style: "background-color: "+ this.options.color});
        this.teamNameWrapper = createElement("span", this.teamHeader, {class: "roundCorners"})
        this.teamName = createElement("label", this.teamNameWrapper,{class: "panel-title",},this.options.name)
        this.join = createElement("button", this.teamHeader,{style: "float:right",class: "btn btn-sm"},"Join")
        this.join.addEventListener('click', () => {
            this.socket.emit("joinTeam", {id: this.options.id}, function(status) {
                if (status.error) {
                    info.danger(status.error)
                }
            });
            this.options.id
        })


        // this.body = createElement("div", this.wrapper, {class: "panel-body"})
        this.table = createElement("table", this.wrapper, {class: "table"});
        this.tableBody = createElement("tbody", this.table)
    },
    update: function(options) {
        Object.assign(this.options, options);

        this.teamName.innerHTML = options.name;

        this.teamHeader.style.backgroundColor = options.color;

        // clear all entries in the table
        this.tableBody.innerHTML = "";

        for (var index = 0; index < this.options.users.length; index++) {
            var user = this.options.users[index];
            var tr = createElement("tr", this.tableBody);
            var td = createElement("td", tr, {}, user.display_name);
        }
    },
    remove: function() {
        if (this.wrapper.parentElement) {
            this.wrapper.parentElement.removeChild(this.wrapper);
        }
    }
}