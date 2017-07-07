var express = require('express'); //Allows us do GETs and POSTs
var bodyParser = require('body-parser'); //To send data with POSTs
var _ = require('underscore');
var db = require('./db.js');

var app = express(); //Used to do GETs and POSTs
var PORT = process.env.PORT || 3000; //So if it is running in Heroku it works!
var todos = [];
var todoNextId = 4;

app.use(bodyParser.json()); //middleware for everytime json request comes in
                            //express is gonna parse it and we can access it
                            //via request.body

app.get('/', function (request, response) {
    response.send('Todo API Root');
});

//GET /todos?completed=true&q=<word in the description>
app.get('/todos', function (request, response) {
    var queryParams = request.query;
    var filteredTodos = todos;

    if(queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
        filteredTodos = _.where(filteredTodos, {completed: true});
    } else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
        filteredTodos = _.where(filteredTodos, {completed: false});
    }
    if(queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
        filteredTodos = _.filter(filteredTodos, function (todo){
            return todo.description.toLowerCase().indexOf(queryParams.q.toLowerCase()) > -1;
        });
    }
    response.json(filteredTodos);
});

//GET /todos/:id
app.get('/todos/:id', function (request, response) {
    var todoId = parseInt(request.params.id, 10); //To decimal int
    var matchedTodo = _.findWhere(todos, {id: todoId});

    if (matchedTodo) response.json(matchedTodo);
    else response.status(404).send();
});

//POST  /todos
//npm install body-parser@1.13.3 --save
app.post('/todos', function (request, response) {
    // //var body = request.body;
    var body = _.pick(request.body, 'description', 'completed'); //ignore all extra data
    db.todo.create(body).then(function (todo) {
        response.json(todo.toJSON());
    }, function (error) {
        response.status(400).json(error);
    });
    //
    // if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
    //     return response.status(400).send();
    // }
    // body.description = body.description.trim(); //Delete spaces at beggining and end
    // body.id = todoNextId++;
    // todos.push(body);
    // response.json(body);
});

//DELETE /todos/:id
app.delete('/todos/:id', function (request, response) {
    var todoId = parseInt(request.params.id, 10);
    var matchedTodo = _.findWhere(todos, {id: todoId});

    if(!matchedTodo) {
        response.status(404).json({"error":"no todo found with that id"});
    } else {
        todos = _.without(todos, matchedTodo);
        response.json(matchedTodo);
    }
});

//PUT /todos/:id  - (Updates)
app.put('/todos/:id', function (request, response) {
    var todoId = parseInt(request.params.id, 10);
    var matchedTodo = _.findWhere(todos, {id: todoId});
    var body = _.pick(request.body, 'description', 'completed');
    var validAttributes = {};

    if(!matchedTodo) {
        return response.status(404).send();
    }

    if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
        validAttributes.completed = body.completed;
    } else if (body.hasOwnProperty('completed')) {
        return response.status(400).send();
    }

    if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
        validAttributes.description = body.description;
    } else if (body.hasOwnProperty('description')) {
        return response.status(400).send();
    }

    _.extend(matchedTodo, validAttributes);
    response.json(matchedTodo);
});

db.sequelize.sync().then(function () {
    app.listen(PORT, function () {
        console.log('Express listening on port ' + PORT + '!');
    });
});
