const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const path = require("path");
const errorMiddleware = require("./middleware/error");
var cors = require('cors');

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());

app.use(cors({credentials: true, origin: '*'}));

// Route Imports
const product = require("./routes/productRoute");
const user = require("./routes/userRoute");
const order = require("./routes/orderRoute");
const paymenttest = require("./routes/paymentRoute");
const webHook= require("./routes/paymentRoute");
const confirmPayment = require("./routes/paymentRoute");
const checkAuthStatus = require("./routes/userRoute");

app.use("/api/v1", product);
app.use("/api/v1", user);
app.use("/api/v1", order);
app.use("/api/v1", paymenttest);
app.use("/api/v1", webHook);
app.use("/api/v1", confirmPayment);
app.use("/api/v1", checkAuthStatus);

app.use(express.static(path.join(__dirname, "../frontend/build")));

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../frontend/build/index.html"));
})

app.use(errorMiddleware);


module.exports = app;