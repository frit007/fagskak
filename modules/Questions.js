

module.exports = function(mysqlPool) {
    
    return {
        create: function(title, categoryId, userId, difficulty, filepath, answers, callback) {
            mysqlPool.getConnection(function(err, connection) {
                connection.beginTransaction((err) => {
                    connection.query('INSERT INTO questions(name, question_category_id, created_by, difficulty) VALUES(?,?,?,?)',
                    [title, categoryId, userId, difficulty], function(err, result) {
                        if (err) {
                            connection.rollback(() => {
								connection.release();
							});
                            callback(err);
                            return; 
                        }   
                        var questionId = result.insertId;

                        connection.query('INSERT INTO question_views(image_url, question_id) VALUES(?,?)', 
                        [filepath, questionId], function(err, result){
                            if (err) {
                                connection.rollback(() => {
                                    connection.release();
                                });
                                callback(err);
                                return; 
                            }
                            var formattedQuestionAnswer = [];
                            for (var i = 0; i < answers.length; i++) {
                                var answer = answers[i];
                                formattedQuestionAnswer.push([
                                    answer.text,
                                    answer.is_correct,
                                    questionId
                                ])
                            }

                            connection.query('INSERT INTO question_answers(text, is_correct, question_id) VALUES ?',
                            [formattedQuestionAnswer], function(err, result) {
                                if (err) {
                                    connection.rollback(() => {
                                        connection.release();
                                    });
                                    callback(err);
                                    return; 
                                }

                                connection.commit((err) => {
                                    if(err) {
                                        connection.rollback(() => {
                                            connection.release();
                                        })
                                        callback(err);
                                    } else {
                                        callback(null, questionId);
                                    }
                                })
                            })
                        });
                    });
                });
            });
        },
    };
};