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

var socket = io("localhost:3100/lobby");
socket.on('connection', function() {
    console.log("On connection!!");
    socket.emit("getTeams", {})
})

    socket.emit("getTeams", {})
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
        teams[team.id] = new TeamTable(team);
    }

}

socket.on('teams', function(teams) {
    console.log("teams, ",teams);
    drawTeams(teams);
})

socket.on('team', function(updatedTeam) {
    console.log("team, ", team);
    var team = teams[updatedTeam.id];
    if (team) {
        team.update(updatedTeam);    
    } else {
        
    }
})

socket.on("removeTeam", function(teamid) {
    console.log("remove team", teamid)
    var team = teams[teamid];
    team.remove();
    delete teams[teamid]
})


$("#new_team").on('click', function() {
    socket.emit("createTeam", {});
})


// var spectator = new TeamTable({
//     location: locked_segment,
//     name: 'Spectators <i class="fa fa-eye" aria-hidden="true"></i>',
//     color: "#CCC"
// });