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
  db.any('select * from booking')
  .then(function (data) {
    res.status(200)
    .json({
      status: 'success',
      data: data,
      message: 'Retrieved ALL bookings'
    });
  })
  .catch(function (err) {
    return next(err);
  });
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

  db.none('insert into booking(master_user_id, restaurant_id, nb_users, schedule, created_date, updated_date)' +
  'values(${master_user_id}, ${restaurant_id}, ${nb_users}, ${schedule}, ${created_date}, ${updated_date})',
  req.body)
  .then(function () {
    res.status(200)
    .json({
      status: 'success',
      message: 'Inserted one booking'
    });
  })
  .catch(function (err) {
    return next(err);
  });
}

function updateBooking(req, res, next) {
  db.none('update booking set master_user_id=$1, restaurantID=$2, nb_users=$3, schedule=$4, created_date=$5, updated_date=$6 where id=$7',
  [req.body.master_user_id, req.body.restaurantID, req.body.nb_users, req.body.schedule, req.body.created_date, req.body.updated_date,req.params.id])
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

  db.none('insert into command(user_id, booking_id, meal_id, payment_id, created_date, updated_date)' +
  'values(${user_id}, ${booking_id}, ${meal_id}, ${payment_id}, ${created_date}, ${updated_date})',
  req.body)
  .then(function () {
    res.status(200)
    .json({
      status: 'success',
      message: 'Inserted one command'
    });
  })
  .catch(function (err) {
    console.log("Err on create command --> "+err);
    return next(err);
  });
}

function updateCommand(req, res, next) {
  db.none('update command set user_id=$1, booking_id=$2, meal_id=$3, payment_id=$4, created_date=$5, updated_date=$6 where id=$7',
  [req.body.user_id, req.body.booking_id, req.body.meal_id, req.body.payment_id, req.body.created_date, req.body.updated_date,req.params.id])
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
  db.any('select * from meals')
  .then(function (data) {
    res.status(200)
    .json({
      status: 'success',
      data: data,
      message: 'Retrieved ALL meals'
    });
  })
  .catch(function (err) {
    return next(err);
  });
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

  db.none('insert into meals(restaurant_id, name, description, price, created_date, updated_date)' +
  'values(${restaurant_id}, ${name}, ${description}, ${price}, ${created_date}, ${updated_date})',
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
  db.none('update meals set restaurant_id=$1, name=$2, description=$3, price=$4, created_date=$5, updated_date=$6 where id=$7',
  [req.body.restaurant_id, req.body.name, req.body.description, req.body.price, req.body.created_date, req.body.updated_date,req.params.id])
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
  [req.body.amount, req.body.command_id, req.body.status, req.body.user_id, req.body.created_date, req.body.updated_date, req.body.stripe_id,req.params.id])
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

    console.log("req --> "+req.query);

  if(req.query.lat==null) {
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
  else
  {

    // exemple request localhost:5000/api/restaurants?lat=44.864689&lon=-0.533843&meter=1024

    var lat=req.query.lat;
    var long=req.query.lon;
    var meter=req.query.meter;


    console.log("lat "+lat+" long "+long+"  meter "+meter);

      db.any('SELECT * FROM restaurants WHERE ST_DWithin(Geography(geom),Geography(ST_MakePoint($1, $2)), $3);',[long,lat,meter])
          .then(function (data) {
              res.status(200)
                  .json({
                      status: 'success',
                      data: data,
                      message: 'Retrieved ALL restaurants'
                  });
          })
          .catch(function (err) {
            console.log("Err in return restaurants in distance --> "+err);
              return next(err);
          });
  }

}

function getSingleRestaurant(req, res, next) {
    const restaurantID = parseInt(req.params.id);
    db.one('select * from restaurants where id = $1', restaurantID)
  .then(function (data) {
    res.status(200)
    .json({
      status: 'success',
      data: data,
      message: 'Retrieved ONE restaurant'
    });
  })
  .catch(function (err) {
    return next(err);
  });
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
    console.log("Err create Restaurant --> "+err);
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
    console.log("ERR update restaurant --> "+err);
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

  };
