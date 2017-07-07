module.exports = function (sequelize, DataTypes) { //DataTypes = Sequelize
    return sequelize.define('todo', {
        description: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1, 250] //only take strings with 1 <= length <= 250
            }

        },
        completed: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    });
}
