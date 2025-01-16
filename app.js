const express = require('express');
const paypal = require('@paypal/paypal-server-sdk');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// PayPal Configuration
let environment = new paypal.core.SandboxEnvironment(
  'AY6KYZmxKXvVyQAX7cRxjgxNDB7eK6Na7B235NgZyzNri3n1O7WMcrLu2gaXKDLapG7rR97FTTS_aRau',
  'EEJCtrEha4AVX5oigENZBMx6Tq-yjmbmIMg_wvkymHMxSj4CyOaB6TrwCbEBPkYvZ69k3P_G0sWmuFAK'
);
let client = new paypal.core.PayPalHttpClient(environment);

app.use(bodyParser.json());

// Phone Payment Route
app.post('/pay', async (req, res) => {
  const { amount, currency, card_type, card_number, expire_month, expire_year, cvv, first_name, last_name } = req.body;

  let payment = {
    intent: 'CAPTURE',
    payer: {
      payment_method: 'credit_card',
      funding_instruments: [{
        credit_card: {
          type: card_type,        // 'visa', 'mastercard'
          number: card_number,    // Card number
          expire_month: expire_month,
          expire_year: expire_year,
          cvv2: cvv,              // CVV code
          first_name: first_name,
          last_name: last_name
        }
      }]
    },
    transactions: [{
      amount: {
        total: amount,          // Payment amount
        currency: currency      // Payment currency (e.g., USD, AED)
      },
      description: 'Payment via phone'
    }]
  };

  try {
    const order = await client.execute(new paypal.orders.OrdersCreateRequest().requestBody(payment));
    res.json({ status: 'success', orderID: order.result.id });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).send('Payment failed.');
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
