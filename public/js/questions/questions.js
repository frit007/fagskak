	function difficultyPicker(difficulty)
	{
		var i;
		for (i=1;i<=10;i++){
			difficulty.options[i] = new Option(i,i);
		}
		if(selectedDifficulty) {
			$(difficulty).val(selectedDifficulty)
		}
	}
	//usage:
	difficultyPicker(document.getElementById("Difficulty"));

    function addAnswer(name, checked)
    {
        if ($("#answerInsert").children().length < 8) {
            var row = $('#template')
			.clone()
			.appendTo('#answerInsert')
			.removeClass('template')
			.removeAttr('id');
            row.find(".remove").on("click", function() {
                row.remove();
            })

			row.find('.answer').val(name);
			if (checked) {
				row.find(".is_correct")[0].checked = true
			}
        }
        
    }

    $('form').submit(function(eventObj){
		// alert("Submitted");
		// debugger;
        var answers = []

		var children = $('#answerInsert').children();

		for(var i = 0; i < children.length; i++) {
			var child = children[i];
			answers.push({
				text: $(child).find(".answer").val(),
				is_correct: $(child).find(".is_correct")[0].checked
			});
		}
		// $.each($('#answerInsert').children(), function(index, row) {
		// 	answers.push({
		// 		text: row.find(".answer").val(),
		// 		is_correct: row.find(".is_correct").val()
		// 	});
		// });
		console.log(answers)
        $(this).append('<input type="hidden" name="Answers" value=\'' + JSON.stringify(answers) + '\'></input>');
        // debugger;
		return true;
    });