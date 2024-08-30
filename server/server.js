const express = require("express");
const app = express();
const { resolve } = require("path");
const dotenv = require("dotenv");

// Load environment variables from the .env file
dotenv.config({ path: "./.env" });

// Initialize Stripe with the secret key and API version
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-08-01",
});

// Serve static files from the directory specified in STATIC_DIR
app.use(express.static(process.env.STATIC_DIR));

// Serve the index.html file when accessing the root URL
app.get("/", (req, res) => {
  const indexPath = resolve(process.env.STATIC_DIR, "index.html");
  res.sendFile(indexPath);
});

// Provide Stripe publishable key to the client
app.get("/config", (req, res) => {
  res.send({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
});

// Create a PaymentIntent and send its client secret to the client
app.post("/create-payment-intent", async (req, res) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      currency: "EUR",
      amount: 1999, // Amount in the smallest currency unit (e.g., cents)
      automatic_payment_methods: { enabled: true }, // Enable automatic payment methods
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(400).send({
      error: {
        message: error.message,
      },
    });
  }
});

// Start the server and listen on port 5252
app.listen(5252, () =>
  console.log(`Node server listening at http://localhost:5252`)
);
