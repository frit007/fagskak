function TeamTable(options){
    var defaultOptions = {
        location: window.document,
        color: "#FFF",
        name: "New Team"
    }
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

        // this.body = createElement("div", this.wrapper, {class: "panel-body"})
        this.table = createElement("table", this.wrapper, {class: "table"});
        this.tableBody = createElement("tbody", this.table)
    },
    update: function(options) {
        Object.assign(this.options, options);

        // clear all entries in the table
        this.tableBody.innerHTML = "";

        for (var index = 0; index < this.options.users.length; index++) {
            var user = this.options.users[index];
            var tr = createElement("tr", this.tableBody);
            var td = createElement("td", tr, {}, user.display_name); 
        }
    },
    remove: function() {
        this.wrapper.parent.innerHTML = "";
    }
}