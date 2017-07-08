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
        }, {
            hooks: {
                beforeValidate: function (user, options) {
                    //So heLLo@gmail.com = Hello@gmail.com
                    if (typeof user.email === 'string') {
                        user.email = user.email.toLowerCase();
                    }
                }
            }
    });
}
