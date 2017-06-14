// create a new Bootstrap alert, which can be used to display any error messages
var info = new BootstrapAlert("info", {
    modifiers: {
        danger: {
            hide: 15000
        },
        success: {
            hide: 5000
        }
    }
});

socket.on('connection', function() {
    console.log("On connection!!");
    socket.emit("getTeams", {})
})

    socket.emit("getTeams", {})
    socket.emit("getTeamOptions",{});
// $(document).ready(function() {
//     $('#users').DataTable({
//         "paging":   false,
//         "ordering": false,
//         "info":     false,
//         "searching": false
//     });
// } );



var users_segment = document.getElementById("users");

var locked_segment = document.getElementById("locked");

var teams = {};

function drawTeams(newTeams) {
    // remove and clean up teams
    for (var key in teams) {
        teams[key].remove();
    }

    teams = {};

    for(var key in newTeams) {
        var team = newTeams[key];
        team.location = team.playable ?users_segment : locked_segment;
        console.log(team)
        teams[team.id] = new TeamTable(team, socket, info);
    }

}

socket.on('teams', function(teams) {
    console.log("teams, ",teams);
    drawTeams(teams);
})

socket.on('team', function(updatedTeam) {
    console.log("team, ", updatedTeam);
    var team = teams[updatedTeam.id];
    if (team) {
        team.update(updatedTeam);
    } else {
        updatedTeam.location = updatedTeam.playable ?users_segment : locked_segment;
        teams[updatedTeam.id] = new TeamTable(updatedTeam, socket, info);
    }
})

socket.on("removeTeam", function(teamid) {
    console.log("remove team", teamid)
    var team = teams[teamid];
    team.remove();
    delete teams[teamid]
})

socket.on("teamOptions", function(teamOptions){
    console.log("teamOptions, ", teamOptions);
    if (teamOptions.playable) {
        $("#spectator_menu").addClass("hidden");
        $("#team_menu").removeClass("hidden").click();


        $("#team_name").val(teamOptions.name).off("change").on("change", function(){
            socket.emit("teamUpdate", {
                name: $("#team_name").val()
            }
            )
        });
        $("#team_color").val(teamOptions.color).off("change").on("change", function() {
            socket.emit("teamUpdate", {
                color: $("#team_color").val()
            })
        });


        // $("#team_update").off('click').on('click', function() {
        //     socket.emit("teamUpdate", {
        //         name: $("#team_name").val(),
        //         color: $("#team_color").val(),
        //     })
        // })

    } else {
        $("#spectator_menu").removeClass("hidden").click();
        $("#team_menu").addClass("hidden");
        
        
    }
})

$("#new_team").on('click', function() {
    socket.emit("createTeam", {});
})

// var spectator = new TeamTable({
//     location: locked_segment,
//     name: 'Spectators <i class="fa fa-eye" aria-hidden="true"></i>',
//     color: "#CCC"
// });