	var board_initialized = false;
	var container, glboard;

	var createBoardInfo = new BootstrapAlert("create_board_group",{
		modifiers: {
			danger: {
				hide: 15000
			},
			success: {
				hide: 5000
			}
		}
	});

	var bindFieldInfo = new BootstrapAlert("bind_fields_info", {
		modifiers: {
			danger: {
				hide: 15000
			},
			success: {
				hide: 5000
			}
		}
	})



	function start() {


		$("#configure_board_modal").modal("show")
		

		$("#configure_board_modal").on("shown.bs.modal", function() {
			if(!board_initialized) {
				board_initialized = true;

				container = document.getElementById("webgl_container");
				
				glboard = new GLBoard({
					container: container,
					fillScreen: false,
				});


				var boardGroupSelect = $("#board_group")
				var categorySelect = $("#category")
				window.boardGroupSelect = boardGroupSelect;
				
				var boardGroupPath = new GLPath(glboard);
				window.boardGroupPath = boardGroupPath;

				boardGroupPath.hide();
				function updateBoardGroups() {
					$.ajax({
						url:"/boards/getBoards",
						success:function(boardGroupJSON) {
							var boardGroups = JSON.parse(boardGroupJSON);
							window.boardGroups = boardGroups;
							function updatePath() {
								var boardGroup = boardGroups[boardGroupSelect.find(":selected").attr("value")];
								// debugger;
								console.log("boardGroup UPDATE", boardGroup);
								boardGroupPath.update(boardGroup.fields, true);
							}


							boardGroupSelect
							.off("change")
							.empty()
							.on("change", function(selected) {
								boardGroupSelect.selectpicker("refresh");
								// console.log(selected);
								// debugger;
								updatePath();

							});
							for(var key in boardGroups) {
								var boardGroup = boardGroups[key];
								boardGroupSelect.append(
									$("<option></option>")
									.attr("value", boardGroup.id)
									.text(boardGroup.name)
								)
							}
							
							boardGroupSelect.selectpicker("refresh");
							updatePath();
						},
						error:function(xhr) {
							bindFieldInfo.danger(xhr.responseText)
						}
					})
				}

				updateBoardGroups();

				function updateCategories() {
					categorySelect.selectpicker("refresh");
				}

				updateCategories();




				var selector = new GLBoardSelector(glboard)

				window.selector = selector;

				window.glboard = glboard;
			
				$('a[data-toggle="tab"].inModal').on('shown.bs.tab', function (e) {
					var target = $(e.target).attr("href") // activated tab
					
					$(".modalMenu").css("display", "none")
					$(target).css("display", "block")

					if (target === "#create_board_group") {
						selector.enable();
					} else {
						selector.disable();
					}
					if (target === "#bind_field") {
						boardGroupPath.show();
					} else {
						boardGroupPath.hide();
					}
				});


				$("#create_board_group_button").on('click', function() {
					var coordinates = selector.getArrayCoordinates();

					var name = $("#board_group_name").val();
					
					if (coordinates.length === 0) {
						createBoardInfo.danger("You have to select more than 0 fields to create a group");
						return;
					}

					if (name=="") {
						createBoardInfo.danger("please create a name");
						return;
					}
					
					$.ajax({
						url:"/boards/create",
						type: "POST",
						data: {fields: JSON.stringify(coordinates), name: name},
						success: function(data) {
							updateBoardGroups();
							selector.clear();
							$("#board_group_name").val("");
							createBoardInfo.success("Successfully Created Group");
						},
						error: function(xhr) {
							createBoardInfo.danger(xhr.responseText);
						}
					})

				})
			}

		})

			// setTimeout( () => {
				
			// }, 100)
		
	}

	

	var configureButton = document.getElementById("configure_board_button");
	configureButton.addEventListener("click", start);
	
	$('.selectpicker').selectpicker({
		// style: 'btn-info',
		size: 4,
	});