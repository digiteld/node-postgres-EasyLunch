var promise = require('bluebird');


var options = {
    // Initialization Options
    promiseLib: promise
};

var pgp = require('pg-promise')(options);
//var connectionString = 'postgres://localhost:5432/puppies';
var connectionString = 'postgres://rdythibocmspfq:28d97c027abdd748c1b93c11b7063de6ff4106acd6fa3d6df24559913283f536@ec2-54-247-101-191.eu-west-1.compute.amazonaws.com:5432/d8qspi9bf1ncj3';
var db = pgp(connectionString);
pgp.pg.defaults.ssl = true;


// BOOKING

function getAllBookings(req, res, next) {

    console.log("JE PASSE BIEN LA")

    let date = new Date
    let date2 = new Date
    date.setHours(1)
    date2.setHours(23)
    date.setMinutes(0)
    date2.setMinutes(0)


    var command = false
    var plat = false
    var menu = false
    var _dataCommand
    var _dataMeal
    var _dataMenu

    db.any('\n' +
        'SELECT command.meal_id,command.menu, booking.id, booking.nb_users, booking.schedule,code.name \n' +
        'FROM command \n' +
        'JOIN booking \n' +
        'ON booking_id=booking.id \n' +
        'JOIN code \n'+
        'ON booking.code=code.id \n'+
        'WHERE booking.restaurant_id=1 AND booking.created_date>$1 AND booking.created_date<$2', [date, date2]
    )
        .then(function (dataCommand) {
            console.log("JSON COMMAND --> " + JSON.stringify(dataCommand))
            command = true
            _dataCommand = dataCommand
            returnReponse()
        })

        .catch(function (err) {
            console.error("ERR 1 --> "+err)
        });



    db.any('select name,plat,id,price from meals WHERE restaurant_id=1')
        .then(function (dataMeal) {
            _dataMeal = dataMeal
            plat = true
            returnReponse()
        })
        .catch(function (err) {
            console.error(err)
        });

    db.any('select * from menu').then(dataMenu => {
        menu = true;
        _dataMenu = dataMenu
        returnReponse()
    }).catch(function (err) {
        console.error(err)
    });

    function returnReponse() {
        if (plat && menu && command) {
            let bookingID = []
            let booking = []

            _dataCommand.map(command => {


                if (bookingID.indexOf(command.id) === -1) {

                    let mealId = []
                    let menu = []
                    let nbUsers
                    let schedule



                    bookingID.push(command.id)
                    if (command.meal_id != null)
                        for (let i = 0; i < command.meal_id.length; i++) {
                            mealId.push(command.meal_id[i])
                        }

                    if (command.menu != null)
                        menu.push(command.menu)


                    nbUsers = command.nb_users
                    schedule = command.schedule
                    nbJoiner=1
                    _dataCommand.map(c => {

                        if (command !== c && command.id === c.id) {
                            nbJoiner+=1
                            if (c.meal_id != null) {
                                for (let i = 0; i < c.meal_id.length; i++) {
                                    mealId.push(c.meal_id[i])
                                }
                            }
                            if (c.menu != null) {
                                menu.push(c.menu)
                            }
                        }
                    })

                    let json = {
                        id: command.id,
                        nb_users: nbUsers,
                        schedule: schedule,
                        meal_id: mealId,
                        menu: menu,
                        participant:nbJoiner,
                        code:command.name
                    }
                    booking.push(json)
                }
            })
            res.status(200)
            res.json({
                booking: booking,
                meal: _dataMeal,
                menu: _dataMenu
            })
            res.end()
        }
    }
}

function getSingleBooking(req, res, next) {
    const bookingID = parseInt(req.params.id);
    db.one('select * from booking where id = $1', bookingID)
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    data: data,
                    message: 'Retrieved ONE booking'
                });
        })
        .catch(function (err) {
            return next(err);
        });
}

function createBooking(req, res, next) {


    console.log("PRICE --> " + req.body.total)
    console.log("MENU --> " + req.body.menu)


    db.one('select * from code WHERE free=true limit 1').then(result => {

        console.log(result)
        res.status(200)

            .json({
                status: 'success',
                data: result.name,
                message: 'Inserted one booking'
            });

        insertBookingWithCode(result.id)


        db.none('UPDATE code SET free=false WHERE id=$1;', result.id)

    }).catch(function (err) {
        console.error("ERROR IN SELECT CODE " + err)
    });

    console.log("MEAL ID -->" + req.body.meal_id)


    function insertBookingWithCode(idCode) {
        db.one('insert into booking(master_user_id, restaurant_id, nb_users, schedule, created_date, updated_date, code)' +
            'values($1, $2, $3, $4, $5, $6,$7) RETURNING booking.id ',
            [req.body.master_user_id, req.body.restaurant_id, req.body.nb_users, req.body.schedule, req.body.date, req.body.update_date, idCode])
            .then(function (result) {
                db.none('insert into command(user_id, booking_id, meal_id, payment_id, created_date, updated_date,price, menu)' +
                    'values($1,$2,$3,$4,$5,$6,$7,$8)', [req.body.master_user_id, result.id, req.body.meal_id, 2, req.body.date, null, req.body.total, req.body.menu]
                ).then(() => {
                    console.log("Normalement tout est good")
                })

                    .catch(function (err) {
                        console.log("Err on create command --> " + err);

                    });
            }).catch(function (err) {
            console.error("ERROR IN CREATE BOOKING" + err)
        });
    }


}

function updateBooking(req, res, next) {
    db.none('update booking set master_user_id=$1, restaurantID=$2, nb_users=$3, schedule=$4, created_date=$5, updated_date=$6 where id=$7',
        [req.body.master_user_id, req.body.restaurantID, req.body.nb_users, req.body.schedule, req.body.created_date, req.body.updated_date, req.params.id])
        .then(function () {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Updated booking'
                });
        })
        .catch(function (err) {
            return next(err);
        });
}

function removeBooking(req, res, next) {
    const commandID = parseInt(req.params.id);
    db.result('delete from booking where id = $1', commandID)
        .then(function (result) {
            /* jshint ignore:start */
            res.status(200)
                .json({
                    status: 'success',
                    message: `Removed ${result.rowCount} booking`
                });
            /* jshint ignore:end */
        })
        .catch(function (err) {
            return next(err);
        });
}


// COMMAND

function getAllCommands(req, res, next) {


    if (req.query.iduser) {


        let restaurantID = []

        db.any('SELECT command.price,command.id,command.meal_id,command.menu, booking.created_date, booking.id AS bookingid,booking.restaurant_id,booking.nb_users,booking.schedule, booking.created_date\n' +
            'FROM command\n' +
            'INNER JOIN booking \n' +
            'ON command.booking_id = booking.id\n' +
            'WHERE command.user_id=$1 ORDER BY command.id DESC', req.query.iduser)

            .then(function (data) {

                console.log("LA DATE IS HERE " + JSON.stringify(data))


                data.map(command => {

                    if (restaurantID.indexOf(command.restaurant_id) === -1)
                        restaurantID.push(command.restaurant_id)


                })

                db.any('SELECT restaurants.id,restaurants.name, restaurants.description, restaurants.address,restaurants.picture\n' +
                    'FROM restaurants\n' +

                    'WHERE restaurants.id=ANY(\'{$1}\') ', parseInt(req.query.iduser))

                    .then(function (data2) {


                        res.status(200)
                            .json({
                                status: 'success',
                                data: {
                                    booking: data,
                                    infoResto: data2
                                },
                                message: 'Retrieved ALL Commands for specific user'
                            });

                    }).catch(function (err) {


                    console.log("ERR SQL IN GET ALL COMMAND wWITH PaRAM --> " + err);

                });

            })
            .catch(function (err) {

                console.log("ERR SQL IN GET ALL COMMAND wWITH PaRAM --> " + err);
            });
    }

    else {
        db.any('select * from command')
            .then(function (data) {
                res.status(200)
                    .json({
                        status: 'success',
                        data: data,
                        message: 'Retrieved ALL Commands'
                    });
            })
            .catch(function (err) {
                return next(err);
            });
    }
}

function getSingleCommand(req, res, next) {
    const commandID = parseInt(req.params.id);
    db.one('select * from command where id = $1', commandID)
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    data: data,
                    message: 'Retrieved ONE command'
                });
        })
        .catch(function (err) {
            return next(err);
        });
}

function createCommand(req, res, next) {
    console.log(req.body)
    console.log(req.body.booking_id)
    console.log("JE dois créer la commmand")

    db.none('insert into command(user_id, booking_id, meal_id, payment_id, created_date, updated_date,price,menu)' +
        'values(${user_id}, ${booking_id}, ${meal_id}, ${payment_id}, ${date}, null,${total},${menu})',
        req.body)
        .then(function () {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Inserted one command'
                });
        })
        .catch(function (err) {
            console.log("Err on create command --> " + err);
            return next(err);
        });
}

function updateCommand(req, res, next) {
    db.none('update command set user_id=$1, booking_id=$2, meal_id=$3, payment_id=$4, created_date=$5, updated_date=$6 where id=$7',
        [req.body.user_id, req.body.booking_id, req.body.meal_id, req.body.payment_id, req.body.created_date, req.body.updated_date, req.params.id])
        .then(function () {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Updated command'
                });
        })
        .catch(function (err) {
            return next(err);
        });
}

function removeCommand(req, res, next) {
    const commandID = parseInt(req.params.id);
    db.result('delete from command where id = $1', commandID)
        .then(function (result) {
            /* jshint ignore:start */
            res.status(200)
                .json({
                    status: 'success',
                    message: `Removed ${result.rowCount} command`
                });
            /* jshint ignore:end */
        })
        .catch(function (err) {
            return next(err);
        });
}


// MEALS

function getAllMeals(req, res, next) {

    let meals = [];
    let menus = [];


    db.any('select ' +
        'meals.id,meals.name,meals.description,meals.price,meals.plat' +
        ' from meals where meals.restaurant_id=$1 ORDER BY meals.id ASC', req.query.id)
        .then(function (data) {

            meals = data
            if (menus.length > 0)
                sendResponse()


        })
        .catch(function (err) {
            return next(err);
        });

    db.any('select *' +
        ' from menu where id_restaurant=$1 ', req.query.id)
        .then(function (data) {
            menus = data
            if (meals.length > 0)
                sendResponse()

        })
        .catch(function (err) {
            return next(err);
        });

    function sendResponse() {


        res.status(200)
            .json({
                status: 'success',
                data: [{menu: menus, meal: meals}],
                message: 'Retrieved ALL meals'
            });
    }

}

function getSingleMeal(req, res, next) {
    const mealID = parseInt(req.params.id);
    db.one('select * from meals where id = $1', mealID)
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    data: data,
                    message: 'Retrieved ONE meal'
                });
        })
        .catch(function (err) {
            return next(err);
        });
}

function createMeal(req, res, next) {

    db.none('insert into meals(restaurant_id, name, description, price, created_date, updated_date, plat)' +
        'values(${restaurant_id}, ${name}, ${description}, ${price}, ${created_date}, ${updated_date}, $(plat))',
        req.body)
        .then(function () {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Inserted one meal'
                });
        })
        .catch(function (err) {
            return next(err);
        });
}

function updateMeal(req, res, next) {
    db.none('update meals set restaurant_id=$1, name=$2, description=$3, price=$4, created_date=$5, updated_date=$6, plat=$8 where id=$7',
        [req.body.restaurant_id, req.body.name, req.body.description, req.body.price, req.body.created_date, req.body.updated_date, req.params.id, req.body.plat])
        .then(function () {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Updated meal'
                });
        })
        .catch(function (err) {
            return next(err);
        });
}

function removeMeal(req, res, next) {
    const mealID = parseInt(req.params.id);
    db.result('delete from meals where id = $1', mealID)
        .then(function (result) {
            /* jshint ignore:start */
            res.status(200)
                .json({
                    status: 'success',
                    message: `Removed ${result.rowCount} meal`
                });
            /* jshint ignore:end */
        })
        .catch(function (err) {
            return next(err);
        });
}

// PAYMENT

function getAllPayments(req, res, next) {
    db.any('select * from payment')
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    data: data,
                    message: 'Retrieved ALL payments'
                });
        })
        .catch(function (err) {
            return next(err);
        });
}

function getSinglePayment(req, res, next) {
    const paymentID = parseInt(req.params.id);
    db.one('select * from payment where id = $1', paymentID)
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    data: data,
                    message: 'Retrieved ONE payment'
                });
        })
        .catch(function (err) {
            return next(err);
        });
}

function createPayment(req, res, next) {

    db.none('insert into payment(amount, command_id, status, user_id, created_date, updated_date, stripe_id)' +
        'values(${amount}, ${command_id}, ${status}, ${user_id}, ${created_date}, ${updated_date}, ${stripe_id})',
        req.body)
        .then(function () {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Inserted one payment'
                });
        })
        .catch(function (err) {
            return next(err);
        });
}

function updatePayment(req, res, next) {
    db.none('update payment set amount=$1, command_id=$2, status=$3, user_id=$4, created_date=$5, updated_date=$6, stripe_id=$7 where id=$8',
        [req.body.amount, req.body.command_id, req.body.status, req.body.user_id, req.body.created_date, req.body.updated_date, req.body.stripe_id, req.params.id])
        .then(function () {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Updated payment'
                });
        })
        .catch(function (err) {
            return next(err);
        });
}

function removePayment(req, res, next) {
    const paymentID = parseInt(req.params.id);
    db.result('delete from payment where id = $1', paymentID)
        .then(function (result) {
            /* jshint ignore:start */
            res.status(200)
                .json({
                    status: 'success',
                    message: `Removed ${result.rowCount} payment`
                });
            /* jshint ignore:end */
        })
        .catch(function (err) {
            return next(err);
        });
}

// RESTAURANTS

function getAllRestaurants(req, res, next) {

    console.log("req --> " + req.query);

    if (req.query.lat == null) {
        db.any('select * from restaurants')
            .then(function (data) {
                res.status(200)
                    .json({
                        status: 'success',
                        data: data,
                        message: 'Retrieved ALL restaurants'
                    });
            })
            .catch(function (err) {
                return next(err);
            });
    }
    else {

        // exemple request localhost:5000/api/restaurants?lat=44.864689&lon=-0.533843&meter=1024

        var lat = req.query.lat;
        var long = req.query.lon;
        var meter = req.query.meter;


        console.log("lat " + lat + " long " + long + "  meter " + meter);

        db.any('SELECT * FROM restaurants WHERE ST_DWithin(Geography(geom),Geography(ST_MakePoint($1, $2)), $3) ORDER BY ST_Distance(Geography(geom),Geography(ST_MakePoint($1, $2))) ;', [long, lat, meter])
            .then(function (data) {
                res.status(200)
                    .json({
                        status: 'success',
                        data: data,
                        message: 'Retrieved ALL restaurants'
                    });
            })
            .catch(function (err) {
                console.log("Err in return restaurants in distance --> " + err);
                return next(err);
            });
    }

}

function getSingleRestaurant(req, res, next) {


    if (!isNaN(parseInt(req.params.id))) {

        console.log("JE SUIS UN NOMBRE")
        const restaurantID = parseInt(req.params.id);

        db.one('select * from restaurants where id = $1', restaurantID)
            .then(function (data) {
                res.status(200)
                    .json({
                        status: 'success',
                        data: data,
                        message: 'Retrieved ONE restaurant'
                    });
                console.log("JE retourne bien le bon bail")
            })
            .catch(function (err) {
                console.log("ERROR iN GET SiGLE RESTO --> " + err)
            });
    }

    else {

        db.one('SELECT booking.id,restaurant_id,booking.schedule,booking.nb_users \n' +
            'FROM booking \n' +
            'INNER JOIN code ON booking.code=code.id\n' +
            'WHERE code.free=false AND code.name=$1 ORDER BY booking.id DESC LIMIT 1', req.params.id)
            .then(function (data) {
                res.status(200)
                    .json({
                        status: 'success',
                        data: data,

                    });
            })
            .catch(function (err) {
                console.log("ERR --> " + err.received)
                res.status(200)
                    .json({
                        status: 'success',
                        data: null,

                    });
            });
    }
}

function createRestaurant(req, res, next) {

    db.none('insert into restaurants(name, description, lat, lon, address, schedule, person_capacity, created_date, location, picture, geom)' +
        'values(${name}, ${description}, ${lat}, ${lon}, ${address}, ${schedule}, ${person_capacity}, ${created_date}, ${location}, ${picture},ST_SetSRID(ST_MakePoint(${lon},${lat}),4326))',
        req.body)
        .then(function () {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Inserted one restaurant'
                });
        })
        .catch(function (err) {
            console.log("Err create Restaurant --> " + err);
            return next(err);
        });
}

function updateRestaurant(req, res, next) {
    db.none('update restaurants set name=$1, description=$2, lat=$3, lon=$4, address=$5, schedule=$6, person_capacity=$7, created_date=$8, location=$9, picture=$10, geom=ST_SetSRID(ST_MakePoint($4,$3),4326))where id=$11',
        [req.body.name, req.body.description, req.body.lat, req.body.lon, req.body.address, req.body.schedule, req.body.person_capacity, req.body.created_date, req.body.location, req.body.picture, req.params.id])
        .then(function () {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Updated restaurant'
                });
        })
        .catch(function (err) {
            console.log("ERR update restaurant --> " + err);
            return next(err);
        });
}

function removeRestaurant(req, res, next) {
    const restaurantID = parseInt(req.params.id);
    db.result('delete from restaurants where id = $1', restaurantID)
        .then(function (result) {
            /* jshint ignore:start */
            res.status(200)
                .json({
                    status: 'success',
                    message: `Removed ${result.rowCount} restaurant`
                });
            /* jshint ignore:end */
        })
        .catch(function (err) {
            return next(err);
        });
}

function getSingleCode(req, res, next) {
    console.log(req.params.id)
    console.log(req.query.booking)

    //FIND CODE STRING WITH ID BOOKiNG

    if (req.params.id && req.query.booking) {
        db.one('SELECT code.name ' +
            'FROM CODE ' +
            'INNER JOIN booking ' +
            'ON code.id=booking.code  ' +
            'WHERE booking.id=$1', req.params.id)
            .then(function (data) {
                res.status(200)
                    .json({
                        status: 'success',
                        data: data,

                    });
            })
            .catch(function (err) {
                console.log("ERR --> " + err.received)
                res.status(200)
                    .json({
                        status: 'success',
                        data: null,

                    });
            });
    }


}


module.exports = {

    getAllBookings: getAllBookings,
    getSingleBooking: getSingleBooking,
    createBooking: createBooking,
    updateBooking: updateBooking,
    removeBooking: removeBooking,

    getAllCommands: getAllCommands,
    getSingleCommand: getSingleCommand,
    createCommand: createCommand,
    updateCommand: updateCommand,
    removeCommand: removeCommand,

    getAllMeals: getAllMeals,
    getSingleMeal: getSingleMeal,
    createMeal: createMeal,
    updateMeal: updateMeal,
    removeMeal: removeMeal,

    getAllRestaurants: getAllRestaurants,
    getSingleRestaurant: getSingleRestaurant,
    createRestaurant: createRestaurant,
    updateRestaurant: updateRestaurant,
    removeRestaurant: removeRestaurant,

    getAllPayments: getAllPayments,
    getSinglePayment: getSinglePayment,
    createPayment: createPayment,
    updatePayment: updatePayment,
    removePayment: removePayment,
    getSingleCode: getSingleCode,

};
