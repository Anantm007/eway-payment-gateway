const express = require('express');
const app = express();

const fetch = require('node-fetch');
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
app.use(bodyParser.urlencoded({
    extended: true
  }));

// Render the payment page
app.get('/', async(req, res) => {
    return res.render('payment', {
        // 'accessCode' : accessCode,
        // 'formUrl' : formUrl
    });

})


// Process payment by sending in to eway servers
app.post('/pay', async(req, res) => {
    var client = rapid.createClient(process.env.apiKey, process.env.password, process.env.rapidEndpoint);
    console.log(req.body)
    const {EWAY_CARDNAME, EWAY_CARDNUMBER, EWAY_CARDCVN, EWAY_CARDEXPIRYMONTH, EWAY_CARDEXPIRYYEAR} = req.body
client.createTransaction('Direct', {
    "Customer": {
       "CardDetails": {
         "Name": EWAY_CARDNAME,
         "Number": EWAY_CARDNUMBER,
         "ExpiryMonth": EWAY_CARDEXPIRYMONTH,
         "ExpiryYear": EWAY_CARDEXPIRYYEAR,
         "CVN": EWAY_CARDCVN
       }
    },
    "Payment": {
       "TotalAmount": 7800
    },
    "TransactionType": "Purchase"
}).then(function (response) {
    console.log(response)
    if (response.get('TransactionStatus')) {
        console.log('Payment successful! ID: ' + response.get('TransactionID'));
        return res.json({
            success: true,
            paymentId: response.get('TransactionID')
        })
    } else {
        var errorCodes = response.get('ResponseMessage').split(', ');
        errorCodes.forEach(function(errorCode) {
            console.log("Response Message: " + rapid.getMessage(errorCode, "en"));
        });
        return res.json({
            success: false,
            message: rapid.getMessage(errorCode, "en")
        })
    }
    })
    .catch(function(reason) {
        return res.json({
            success: false,
            message: reason
        })    
    });

}) 



// Listen to the port
app.listen(3000, () => {
    console.log('Server running on port 3000')
})