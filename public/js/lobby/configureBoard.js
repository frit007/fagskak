(function(){
    var started = false;
    var container, glboard;

    function start() {
        $("#configure_board_modal").modal("show")
        if(!started) {
            started = true;
            setTimeout( () => {
                container = document.getElementById("webgl_container");
                console.log("CONTAINER", container);
                glboard = new GLBoard({
                    container: container,
                    fillScreen: false,
                });

                var path = new GLPath([],glboard.glScene)
                path.update();
                window.path = path;

                window.glboard = glboard;
            }, 300)
        }
    }

    var configureButton = document.getElementById("configure_board_button");
    configureButton.addEventListener("click", start);
    
    $('.selectpicker').selectpicker({
        style: 'btn-info',
        size: 4
    });


}())


