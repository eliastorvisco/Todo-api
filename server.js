var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000; //So if it is running in Heroku it works!

app.get('/', function (request, response) {
    response.send('Todo API Root');
});
app.listen(PORT, function () {
    console.log('Express listening on port ' + PORT + '!');
});
