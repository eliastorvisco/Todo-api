var Sequelize = require('sequelize');
var env = process.env.NODE_ENV || 'development';
var sequelize;

if (env = 'production') { //When in Heroku
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres'
    });
} else { //When not in Heroku
    sequelize = new Sequelize(undefined, undefined, undefined, {
        'dialect': 'sqlite',
        'storage': __dirname + '/data/dev-todo-api.sqlite'
    });
}



var db = {};

db.todo = sequelize.import(__dirname + '/models/todo.js'); //lets load in sequelize moduls from seperate files
    //sequelize.import de manera oculta envia dos parametros: sequelize, Sequelize
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
