const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { v4: uuidv4 } = require('uuid');
//const WebSocket = require('ws'); 
const express = require('express');
const app = express();
const http = require('http');
//const server = http.createServer(app);
//const wss = new WebSocket.Server({ port: 4100 });
let statusOrder = null;

exports.processPayment = catchAsyncErrors(async (req, res, next) => {
  const myPayment = await stripe.paymentIntents.create({
    amount: req.body.amount,
    currency: "br",
    metadata: {
      company: "Ecommerce",
    },
  });

  res
    .status(200)
    .json({ success: true, client_secret: myPayment.client_secret });
});

exports.sendStripeApiKey = catchAsyncErrors(async (req, res, next) => {
  res.status(200).json({ stripeApiKey: process.env.STRIPE_API_KEY });
});

let sessionId = null;
exports.processPaymentTest = async (req, res, next) => {
  try {
    const { products } = req.body;
     sessionId = uuidv4();
    const lineItems = products.map(product => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: product.name,
          images: [product.image],
        },
        unit_amount: Math.round(product.price * 100),
      },
      quantity: product.quantity,
    }));
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.API_URL}/success?session_id=${sessionId}`,
      cancel_url: `${process.env.API_URL}/cancel`,
    });

    res.json({ id: session.id });
  } catch (error) {
    // Handle the error accordingly
    res.status(500).json({ message: error.message });
  }
};

exports.webHook = async (req, res, next) => {
  const payload = req.body
  const sig = req.headers['stripe-signature']
  const payloadString = JSON.stringify(payload, null, 2);
  const secret = 'whsec_b71f3dbea5bd3f214ce7cedde6211ac9881fded03af9c70e6e3bc1dd7812478c';
  const header = stripe.webhooks.generateTestHeaderString({
          payload: payloadString,
          secret,
  });
   let event;
   try {
    event = stripe.webhooks.constructEvent(payloadString, header, secret);
    if (event.type === "payment_intent.succeeded") {
      const checkoutSucceeded = event.data.object?.status;
      const id = event.data.object?.id;
    
      statusOrder = {
        type: 'PAYMENT_SUCCESS',
        message: 'Payment Succeeded',
        status: checkoutSucceeded,
        id: id,
    };

   
    } else if (event.type === "payment_intent.payment_failed") {
      return res.status(400).send("Payment Failed");
    }
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
res.status(200).end();
}

exports.confirmPayment = async (req, res, next) => {
  const reqSession = req.params.sessionId; // Acessando o sessionId
  try {
  if(reqSession == sessionId){
      res.json(statusOrder);

    } else {
      res.status(404).send('SessionId incorreto.');
    } 
  } catch (error) {
    console.error("Erro ao confirmar o pagamento:", error);
    res.status(500).send("Erro interno do servidor");
  }
}
