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

				// initialize overview variables
				var overview = new FieldOverview(glboard, {allowRemove: true});
				
				// initialize bindField variables
				var boardGroupSelect = $("#board_group");
				var categorySelect = $("#category");
				var boardGroupPath = new GLPath(glboard);
				var categories = {};
				var boardGroups = {};
				// convenient getters
				function getSelectedBoardGroup(){
					return boardGroups[boardGroupSelect.find(":selected").attr("value")];
				}
				function getSelectedCategory(){
					return categories[categorySelect.find(":selected").attr("value")];
				}

				// initialize create board variables
				var selector = new GLBoardSelector(glboard);
				


				// share variables with the window object for debugging purposes
				window.selector = selector;
				window.glboard = glboard;
				window.boardGroupSelect = boardGroupSelect;
				window.boardGroupPath = boardGroupPath;
				// export overview, since it is actually needed 
				window.overview = overview;

				boardGroupPath.hide();

				$("#bind_group_button").on('click', function() {
					var boardGroup = getSelectedBoardGroup();
					var category = getSelectedCategory();
					var difficulty = $("#difficulty").val();
					if (!boardGroup) {
						bindFieldInfo.danger("Please select a valid board group. Or create the board group you need in the 'Create board group' tab");
						return;
					}
					if (!category) {
						bindFieldInfo.danger("Please select a valid category")
						return;
					}
					if (!difficulty) {
						bindFieldInfo.danger("Please select a valid difficulty")
					}

					var selectedPath = new GLPath(glboard, {fields: boardGroup.fields, id: boardGroup.id});

					overview.add(category, difficulty, selectedPath);
					bindFieldInfo.success("Added group");

					selectedPath.hide();

				});

				// update the board gropus select
				function updateBoardGroups() {
					$.ajax({
						url:"/boards/get",
						success:function(boardGroupJSON) {
							boardGroups = JSON.parse(boardGroupJSON);
							window.boardGroups = boardGroups;
							function updatePath() {
								var boardGroup = getSelectedBoardGroup();
								if (boardGroup) {
									boardGroupPath.update(boardGroup.fields, true);								
								}
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

				// update the categories select
				function updateCategories() {
					$.ajax({
						url:"/categories/get",
						success:function(categoriesJSON) {
							categories = JSON.parse(categoriesJSON);
							function updateColor() {
								var category = getSelectedCategory();
								if (category) {
									boardGroupPath.setColor(category.color);
								}
							}


							categorySelect
							.off("change")
							.empty()
							.on("change", function() {
								updateColor();
								categorySelect.selectpicker("refresh");
							});

							for (var key in categories) {
								var category = categories[key];
								categorySelect.append(
									$("<option></option>")
									.attr("value", category.id)
									.text(category.name)
								);
							}
							categorySelect.selectpicker("refresh");
							updateColor();

						},
						error:function(xhr) {
							bindFieldInfo.danger(xhr.responseText)
						}
					})
				}
				updateCategories();
				


				// create a board group when the create button is clicked
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
				
				// listen to tab changes and show the right content on the board
				$('a[data-toggle="tab"].inModal').on('shown.bs.tab', function (e) {
					var target = $(e.target).attr("href") // activated tab
					
					$(".modalMenu").css("display", "none")
					$(target).css("display", "block")

					// show the overview group while the overview tab is active
					if (target == "#overview_menu") {
						overview.show();
					} else {
						overview.hide();
					}
					
					// show the selector when on the create group tab.
					if (target === "#create_board_group") {
						selector.enable();
					} else {
						selector.disable();
					}

					// show the path selected on bind field when the tab is active
					if (target === "#bind_field") {
						boardGroupPath.show();
					} else {
						boardGroupPath.hide();
					}


				});
			}

		})

		
	}

	

	var configureButton = document.getElementById("configure_board_button");
	configureButton.addEventListener("click", start);
	
	$('.selectpicker').selectpicker({
		// style: 'btn-info',
		size: 4,
	});