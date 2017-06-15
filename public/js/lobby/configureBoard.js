(function(){
    var started = false;
    var container, glboard;

    function start() {


        $("#configure_board_modal").modal("show")
        if(!started) {
            started = true;


            $("#configure_board_modal").on("shown.bs.modal", function() {


                container = document.getElementById("webgl_container");
                
                glboard = new GLBoard({
                    container: container,
                    fillScreen: false,
                });

                var selector = new GLBoardSelector(glboard)
                window.selector = selector;


                window.glboard = glboard;
           
                $('a[data-toggle="tab"].inModal').on('shown.bs.tab', function (e) {
                    var target = $(e.target).attr("href") // activated tab
                    if (target === "#create_board_group") {
                        selector.enable();
                    } else {
                        selector.disable();
                    }
                });

            })

            // setTimeout( () => {
                
            // }, 100)
        }
        
    }

    var configureButton = document.getElementById("configure_board_button");
    configureButton.addEventListener("click", start);
    
    $('.selectpicker').selectpicker({
        style: 'btn-info',
        size: 4
    });


}())


