const express = require('express');
const app = express();

// Middleware utilities
const bodyParser = require("body-parser");

// Config variables
require('dotenv').config({path: '.env'});
var rapid = require('eway-rapid');

// Setting express engine
app.set('view engine', 'ejs');
app.use(express.static("public"));

// Getting data in json format
app.use(bodyParser.json())


// Get access code
app.get('/getCode', async(req, res) => {
    var client = rapid.createClient(process.env.apiKey, process.env.password, process.env.rapidEndpoint); // rapidEndpoint can be written as "Sandbox"

    client.createTransaction('TransparentRedirect', {
        "Payment": {
        "TotalAmount": 100, // Means AUD $1.00 as we have to write in smallest denomination possible
        "CurrencyCode": "AUD"
        },
        "RedirectUrl": "http://www.eway.com.au",
        "TransactionType": "Purchase"
    }).then(async (response) => {
        if (response.getErrors().length == 0) {
            
            var accessCode = response.get('AccessCode');
            var formUrl = response.get('FormActionURL');
   
            return res.json({
                success: true,
                accessCode,
                formUrl
            })
        } else {
            response.getErrors().forEach(function(error) {
                return res.json({
                    success: false,
                    message: rapid.getMessage(error, "en")
                })
            });
        }
    })
})

// Render the payment page
app.get('/', async(req, res) => {

    return res.render('payment', {
        // 'accessCode' : accessCode,
        // 'formUrl' : formUrl
    });

})

// check status of the transaction
app.get('/status/:id', async(req, res) => {
    var client = rapid.createClient(process.env.apiKey, process.env.password, process.env.rapidEndpoint);   // rapidEndpoint can be written as "Sandbox"

    client.queryTransaction(req.params.id)
    .then(function (response) {
        return res.json({
            response
        })
    });
})


// Listen to the port
app.listen(3000, () => {
    console.log('Server running on port 3000')
})