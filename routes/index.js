var express = require('express');
var router = express.Router();
var db = require('../queries');


router.get('/api/puppies', db.getAllPuppies);
router.get('/api/puppies/:id', db.getSinglePuppy);
router.post('/api/puppies', db.createPuppy);
router.put('/api/puppies/:id', db.updatePuppy);
router.delete('/api/puppies/:id', db.removePuppy);

router.get('/api/restaurants', db.getAllRestaurants);
router.get('/api/restaurants/:id', db.getSingleRestaurant);
router.post('/api/restaurants', db.createRestaurant);
router.put('/api/restaurants/:id', db.updateRestaurant);
router.delete('/api/restaurants/:id', db.removeRestaurant);



router.get('/api/booking', db.getAllBookings);
router.get('/api/booking/:id', db.getSingleBooking);
router.post('/api/booking', db.createBooking);
router.put('/api/booking/:id', db.updateBooking);
router.delete('/api/booking/:id', db.removeBooking);

router.get('/api/command', db.getAllCommands);
router.get('/api/command/:id', db.getSingleCommand);
router.post('/api/command', db.createCommand);
router.put('/api/command/:id', db.updateCommand);
router.delete('/api/command/:id', db.removeCommand);

router.get('/api/meal', db.getAllMeals);
router.get('/api/meal/:id', db.getSingleMeal);
router.post('/api/meal', db.createMeal);
router.put('/api/meal/:id', db.updateMeal);
router.delete('/api/meal/:id', db.removeMeal);

router.get('/api/payment', db.getAllPayments);
router.get('/api/payment/:id', db.getSinglePayment);
router.post('/api/payment', db.createPayment);
router.put('/api/payment/:id', db.updatePayment);
router.delete('/api/payment/:id', db.removePayment);

// application -------------------------------------------------------------
router.get('/', function (req, res) {

    res.render('index', {title: 'node-postgres-promises'}); // load the single view file (angular will handle the page changes on the front-end)
});

module.exports = router;
