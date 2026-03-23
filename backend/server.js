/* 
   To run this: 
   1. Install Node.js
   2. Run: npm init -y
   3. Run: npm install express mysql2 cors axios body-parser
   4. Run: node server.js
*/

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const axios = require('axios'); // For calling M-Pesa API
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Paystack Configuration
const PAYSTACK_SECRET_KEY = "sk_test_YOUR_PAYSTACK_SECRET_KEY"; // Replace with your actual key

// 1. Database Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // XAMPP default password is usually empty
    database: 'ecommerce_db'
});

// API Route: Get All Products
app.get('/api/products', (req, res) => {
    const sql = "SELECT * FROM products";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Database query error:", err);
            return res.status(500).json({ error: "Failed to fetch products" });
        }
        res.json(results);
    });
});

// 4. API Route: Process Order & Trigger Payment
app.post('/api/process-order', async (req, res) => {
    const { name, phone, email, amount, product, address, quantity } = req.body;

    // A. Save Order to Database (Status: Pending)
    const sql = "INSERT INTO orders (customer_name, phone_number, email, product_name, total_amount, quantity, status, shipping_address) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)";
    
    db.query(sql, [name, phone, email, product, amount, quantity, address], async (err, result) => {
        if (err) return res.status(500).json({ error: "Database error" });
        
        const orderId = result.insertId;

        // B. Initialize Paystack Transaction
        try {
            const paystackResponse = await axios.post(
                'https://api.paystack.co/transaction/initialize',
                {
                    email: email, // Required by Paystack
                    amount: amount * 100, // Paystack amount is in cents (kobo). KES 100 = 10000
                    currency: "KES",
                    callback_url: "http://localhost:3000/api/callback/paystack", // Redirect after payment
                    metadata: {
                        order_id: orderId,
                        customer_name: name,
                        phone_number: phone,
                        product_name: product
                    },
                    channels: ['card', 'mobile_money'] // Enables Card, M-Pesa, Airtel
                },
                {
                    headers: {
                        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Return the Authorization URL to the frontend
            res.json({ 
                success: true, 
                authorization_url: paystackResponse.data.data.authorization_url,
                reference: paystackResponse.data.data.reference 
            });

        } catch (apiError) {
            console.error("Paystack Error:", apiError.response ? apiError.response.data : apiError.message);
            res.status(500).json({ success: false, message: "Payment Initialization Error" });
        }
    });
});

// 5. Paystack Callback / Webhook
app.get('/api/callback/paystack', (req, res) => {
    // This is where Paystack redirects the user after payment
    const reference = req.query.reference;
    
    // Ideally, verify the transaction here using `https://api.paystack.co/transaction/verify/:reference`
    
    console.log(`Payment successful for reference: ${reference}`);
    
    // Redirect user to a Thank You page on your frontend
    res.send("Payment Successful! You can close this window."); 
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
