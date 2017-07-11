var express = require('express'); //Allows us do GETs and POSTs
var bodyParser = require('body-parser'); //To send data with POSTs
var _ = require('underscore');
var db = require('./db.js');
var bcrypt = require('bcrypt');
var middleware = require('./middleware.js')(db);

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
app.get('/todos', middleware.requireAuthentication, function (request, response) {
    var query = request.query;
    var where = {};

    if(query.hasOwnProperty('completed') && query.completed === 'true') {
        where.completed = true;
    } else if (query.hasOwnProperty('completed') && query.completed === 'false') {
        where.completed = false;
    }

    if (query.hasOwnProperty('q') && query.q.length > 0) {
        where.description = {
            $like: '%' + query.q + '%'
        }
    }

    db.todo.findAll({where: where}).then(function (todos) {
        response.json(todos);
    }).catch(function (error) {
        response.status(500).send();
    });
});

//GET /todos/:id
app.get('/todos/:id', middleware.requireAuthentication, function (request, response) {
    var todoId = parseInt(request.params.id, 10); //To decimal int
    db.todo.findById(todoId).then(function (todo) {
        if(!!todo) {
            response.json(todo.toJSON());
        } else {
            response.status(404).send('Todo not found.');
        }
    }).catch( function (error) {
        response.status(500).send(); //something went wrong in the servers
    });
});

//POST  /todos
//npm install body-parser@1.13.3 --save
app.post('/todos', middleware.requireAuthentication, function (request, response) {
    // //var body = request.body;
    var body = _.pick(request.body, 'description', 'completed'); //ignore all extra data
    db.todo.create(body).then(function (todo) {
        response.json(todo.toJSON());
    }, function (error) {
        response.status(400).json(error);
    });
});

//DELETE /todos/:id
app.delete('/todos/:id', middleware.requireAuthentication, function (request, response) {
    var todoId = parseInt(request.params.id, 10);
    db.todo.destroy({
        where: {
            id: todoId
        }
    }).then(function (rowsDeleted) {
        if (rowsDeleted === 0) {
            response.status(404).json({
                error: 'No todo with id ' + todoId
            });
        } else {
            response.status(204).send(); //204: everything went well, nothing to send back.
        }
    }, function () {
        response.status(500).send();
    });
});

//PUT /todos/:id  - (Updates)
app.put('/todos/:id', middleware.requireAuthentication, function (request, response) {
    var todoId = parseInt(request.params.id, 10);
    var body = _.pick(request.body, 'description', 'completed');
    var attributes = {};

    if (body.hasOwnProperty('completed')) {
        attributes.completed = body.completed;
    }

    if (body.hasOwnProperty('description')) {
        attributes.description = body.description;
    }

    db.todo.findById(todoId).then(function (todo) {
        if (todo) {
            todo.update(attributes).then(function (todo) {
                response.json(todo.toJSON());
            }, function (error) {
                response.status(400).json(error);
            });
        } else {
            response.status(404).send();
        }
    }, function () {
        response.status(500).send();
    });
});
//////////Users
app.post('/users', function(request, response) {
    var body = _.pick(request.body, 'email', 'password'); //ignore all extra data
    db.user.create(body).then(function (user) {
        response.json(user.toPublicJSON());
    }, function (error) {
        response.status(400).json(error);
    });
});

//POST /users/login
app.post('/users/login', function (request, response) {
    var body = _.pick(request.body, 'email', 'password');
    db.user.authenticate(body).then(function (user) {
        var token = user.generateToken('authentication');
        if (token) {
            response.header('Auth', token).json(user.toPublicJSON());
        } else {
            response.status(401).send();
        }
    }, function () {
        response.status(401).send();
    });

});

db.sequelize.sync({force: true}).then(function () {
    app.listen(PORT, function () {
        console.log('Express listening on port ' + PORT + '!');
    });
});
