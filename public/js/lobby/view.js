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
    // request the lobby settings(this will get ignored if you are not the lobby owner.)
    socket.emit("getLobbySettings",{});
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

socket.on("lobbySettings", function(settings) {
    $("#game_menu").removeClass("hidden")

    $("#lobby_name")
    .off("change")
    .val(settings.name)
    .on("change", function() {
        socket.emit('updateLobby', {
            name: $("#lobby_name").val()
        })
    })

    $("#lobby_password")
    .off("change keyup copy paste cut")
    .val(settings.password)
    .on("change keyup copy paste cut", function() {
        socket.emit('updateLobby', {
            password: $("#lobby_password").val()
        })
    })

    

})


socket.on("teamOptions", function(teamOptions){
    console.log("teamOptions, ", teamOptions);
    if (teamOptions.playable) {
        $("#spectator_menu").addClass("hidden");
        $("#team_menu").removeClass("hidden").tab("show");


        $("#team_name")
        .off("change")
        .val(teamOptions.name)
        .on("change", function(){
            socket.emit("teamUpdate", {
                name: $("#team_name").val()
            })
        });


        $("#team_color")
        .off("change")
        .val(teamOptions.color)
        .on("change", function() {
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
        $("#spectator_menu").removeClass("hidden").tab("show");
        $("#team_menu").addClass("hidden");
        
        
    }
})

socket.on("redirect", function(newlocation) {
    window.location = newlocation;
})

$("#new_team").on('click', function() {
    socket.emit("createTeam", {});
})

$("#start_game").on('click', function() {
    if (typeof overview === "undefined") {
        info.danger("Please configure the board before starting the game");
        return;
    }
    $.ajax({
        url: "fagskak/store",
        type: "POST",
        data: {
            fields: JSON.stringify(overview.getMinimum().fields),
            movement_limit: $("#movement_limit").val(),
            time_limit_in_minutes: $("#time_limit_in_minutes").val(),
        },
        success: function(msg) {
            // window.location = "/fagskak";
        },
        error: function(xhr) {
            info.danger(xhr.responseText);
        },
    });
})

// var spectator = new TeamTable({
//     location: locked_segment,
//     name: 'Spectators <i class="fa fa-eye" aria-hidden="true"></i>',
//     color: "#CCC"
// });