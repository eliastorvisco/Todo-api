var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000; //So if it is running in Heroku it works!
var todos = [{
    id: 1,
    description: 'Meet mom for lunch',
    completed: false
}, {
    id: 2,
    description: 'Go to market',
    completed: false
}, {
    id: 3,
    description: 'Finish exams',
    completed: true
}];

app.get('/', function (request, response) {
    response.send('Todo API Root');
});

//GET /todos
app.get('/todos', function (request, response) {
    //It should be converted to json. There is a better way than JSON.stringify.
    response.json(todos);
});

//GET /todos/:id
app.get('/todos/:id', function (request, response) {
    var todoId = parseInt(request.params.id, 10); //To decimal int
    var matchedTodo;
    for (var i = 0; i < todos.length; i++) {
        if (todos[i].id === todoId) {
            matchedTodo = todos[i];
            break;
        }
    }
    //response.send('Asking for todo with id of ' + request.params.id);
    if (matchedTodo) response.json(matchedTodo);
    else response.status(404).send();

})

app.listen(PORT, function () {
    console.log('Express listening on port ' + PORT + '!');
});
