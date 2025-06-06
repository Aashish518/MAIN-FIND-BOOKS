const express = require("express");
const app = express();

const dotenv = require("dotenv");
dotenv.config();

const connectToMongo = require("./Database/db")
connectToMongo();

const cors = require("cors");
const PORT = 2606;
const cookieparser = require('cookie-parser');



app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieparser());



app.use("/api", require("./Routes/Auth"));
app.use("/api", require("./Routes/BookForm"));
app.use("/api", require("./Routes/Addcat-subCat"));
app.use("/api", require("./Routes/ResellerPaymentForm"));
app.use("/api", require("./Routes/AddToCart"));
app.use("/api", require("./Routes/Checkout"));
app.use("/api", require("./Routes/Profile"));
app.use("/api", require("./Routes/AddRatings"));
app.use("/api", require("./Routes/SellOrders"));
app.use("/api", require("./Routes/Payment"));
app.use("/api", require("./Routes/return_payment"));
app.use("/api", require("./Routes/return_order"));
app.use('/api/report', require('./Routes/Report'));



app.listen(PORT,'0.0.0.0',() => {
    console.log(`your application run at http://localhost:${PORT}`);
})
