var bcrypt = require('bcrypt');
var _ = require('underscore');

module.exports = function (sequelize, DataTypes) {
        var user =  sequelize.define('user', {
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true, //cannot sign up with an email that already logged in
                validate: {
                    isEmail: true
                }
            },
            salt: { //added to password so two accounts with same hash can't
                    //assume they have the same password.
                type: DataTypes.STRING
            },
            password_hash: {
                type: DataTypes.STRING
            },
            password: {
                type:DataTypes.VIRTUAL, //never stores in the database
                allowNull: false,
                validate: {
                    len: [7, 100]
                },
                set: function (value) { //value = password
                    var salt = bcrypt.genSaltSync(10); //num of chars
                    var hashedPassword = bcrypt.hashSync(value, salt);

                    this.setDataValue('password', value);
                    this.setDataValue('salt', salt);
                    this.setDataValue('password_hash', hashedPassword);
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
            },
            classMethods: {
                authenticate: function (body) {
                    return new Promise(function (resolve, reject) {
                        if (typeof body.email !== 'string' || typeof body.password !== 'string') {
                            return reject();
                        }
                        user.findOne({
                            where: {
                                email: body.email
                            }
                        }).then(function (user) {
                            if (!user || !bcrypt.compareSync(body.password, user.get('password_hash'))) {
                                return reject();
                            }
                            return resolve(user);
                        }, function (error) {
                            return reject();
                        });
                    });
                }
            },
            instanceMethods: {
                toPublicJSON: function () {
                    var json = this.toJSON();
                    return _.pick(json, 'id', 'email', 'createdAt', 'updatedAt');
                }

            }
    });

    return user;
}
