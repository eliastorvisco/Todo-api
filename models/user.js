module.exports = function (sequelize, DataTypes) {
        return sequelize.define('user', {
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true, //cannot sign up with an email that already logged in
                validate: {
                    isEmail: true
                }
            },
            password: {
                type:DataTypes.STRING,
                allowNull: false,
                validate: {
                    len: [7, 100]
                }
            }
        });
}
