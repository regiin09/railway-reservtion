  const express = require('express');
  const app = express();
  const path = require('path');
  const bodyParser = require('body-parser');

  app.use(bodyParser.urlencoded({ extended: true }));

  // Making connection
  var mysql = require('mysql');
  var con = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "R&sM^9h9RxXq3%",
    database: "railway_sys"
  });

  con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
  });
  app.set('view engine', 'ejs');

  // Function to generate a random number for booking_id
  function generateBookingId() {
    const min = 1000; // Minimum value for booking_id
    const max = 9999; // Maximum value for booking_id
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Serve the static HTML file
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
  });

  app.post('/search', (req, res) => {
    const { from, to } = req.body;
    const query = 'SELECT * FROM Vaigai_stops WHERE station = ? OR to_ = ?';
    const { booking_date } = req.body;

    con.query(query, [from, to], (error, results) => {
      if (error) {
        console.error('Database query error:', error);
        res.status(500).send('Server error');
      } else {
        // Redirect to the seat_availability route with the trainId
        res.redirect(`/seat_availability/${results[0].train_id}?booking_date=${booking_date}`);
      }
    });
  });



  app.get('/seat_availability/:trainId', (req, res) => {
    const trainId = req.params.trainId;
    const query = 'SELECT * FROM Seat_Availability WHERE train_id = ?';

    con.query(query, [trainId], (error, results) => { 
      if (error) {
        console.error('Database query error:', error);
        res.status(500).send('Server error');
      } else {
        res.render('seat_availability', { trainId, seats: results });
      }
    });
  });
  app.get('/book/:trainId', function(req, res) {
    const trainId = req.params.trainId;
    const booking_date = req.query.booking_date;

    res.render('booking', { trainId, booking_date });
  });

  app.post('/confirm-booking', function(req, res) {
    const { booking_class, user_name, user_contact, seat_number, trainId, booking_date } = req.body;
    const booking_id = generateBookingId();

    // Save the booking details in the Booking table of your database
    const query = 'INSERT INTO Booking (booking_id, train_id,booking_class, user_name, user_contact, seat_number, booking_date) VALUES (?, ?, ?, ?, ?, ?, ?)';
    con.query(query, [booking_id, trainId, booking_class, user_name, user_contact, seat_number, booking_date], (error, result) => {
      if (error) {
        console.error('Database query error:', error);
        res.status(500).send('Server error');
      } else {
        res.send('Booking successful!');
      }
    });
  });




  // Start the server
  app.listen(3000, () => {
    console.log('Server is running on port http://localhost:3000');
  });
