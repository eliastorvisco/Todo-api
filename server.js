var express = require('express'); //Allows us do GETs and POSTs
var bodyParser = require('body-parser'); //To send data with POSTs
var _ = require('underscore');

var app = express(); //Used to do GETs and POSTs
var PORT = process.env.PORT || 3000; //So if it is running in Heroku it works!
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json()); //middleware for everytime json request comes in
                            //express is gonna parse it and we can access it
                            //via request.body

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
    var matchedTodo = _.omit(_.findWhere(todos, {id: todoId}), 'id');

    if (matchedTodo) response.json(matchedTodo);
    else response.status(404).send();
});

//POST  /todos
//npm install body-parser@1.13.3 --save
app.post('/todos', function (request, response) {
    //var body = request.body;
    var body = _.pick(request.body, 'description', 'completed'); //ignore all extra data

    if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
        return response.status(400).send();
    }

    body.id = todoNextId++;
    todos.push(body);
    response.json(body);
});

app.listen(PORT, function () {
    console.log('Express listening on port ' + PORT + '!');
});
