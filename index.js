import express from "express";
import pkg from "pg";
import { Parser } from "json2csv"; 
import path from "path";
import fs from "fs"; 
import { fileURLToPath } from "url"; 
import nodemailer from "nodemailer"; 
const app = express();
import dotenv from 'dotenv';
dotenv.config();
const port = 8001;
const email = process.env.USER_EMAIL;
const password = process.env.password;
const receiptEmail = process.env.recipient_email;

const { Pool } = pkg;

// Setup the database connection
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "ezymetrics",
  password: "akshita@123",
  port: 5432,
});


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: email,
    pass: password,  
  },
});


const sendEmailAlert = async (leadCount) => {
  const mailOptions = {
    from: email,
    to: receiptEmail, 
    subject: 'Lead Threshold Exceeded',
    text: `The number of leads has exceeded the threshold. Current number of leads: ${leadCount}.`,
  };

  console.log('Preparing to send an email alert...');

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};


async function extractAndStoreData() {
  try {
    const response = await fetch("https://dummyjson.com/products");
    const dummyCRMData = await response.json();

    const products = dummyCRMData.products;

    for (let product of products) {
      const { id, title, description, price, brand } = product;
      await pool.query("TRUNCATE TABLE products");

      await pool.query(
        "INSERT INTO products (id, title, description, price, brand) VALUES ($1, $2, $3, $4, $5)",
        [id, title, description, price, brand]
      );
    }

    console.log("Data has been successfully inserted into the database.");

    const result = await pool.query("SELECT COUNT(*) FROM products");
    const leadCount = parseInt(result.rows[0].count, 10);
    
   
    const leadThreshold = 100;

    
    if (leadCount > leadThreshold) {
      await sendEmailAlert(leadCount);
    }

  } catch (error) {
    console.error("Error fetching or inserting data:", error);
  }
}


app.get("/crm/leads", async (req, res) => {
  try {
    await extractAndStoreData();
    res.json({ status: "Data inserted successfully" });
  } catch (error) {
    res.status(500).json({ status: "Failed to insert data", error: error.message });
  }
});


app.get("/crm/reports/csv", async (req, res) => {
  try {
    
    const result = await pool.query("SELECT * FROM products");

    const products = result.rows;

   
    const fields = ["id", "title", "description", "price", "brand"];
    const json2csvParser = new Parser({ fields });


    const csv = json2csvParser.parse(products);

    const filePath = path.join(__dirname, "products_report.csv");


    fs.writeFileSync(filePath, csv);

    console.log("CSV report generated successfully!");


    res.download(filePath, "products_report.csv", (err) => {
      if (err) {
        console.error("Error downloading the CSV file:", err);
        res.status(500).json({ status: "Failed to download CSV report" });
      }
 
      fs.unlinkSync(filePath);
    });
  } catch (error) {
    console.error("Error generating CSV report:", error);
    res.status(500).json({ status: "Failed to generate CSV report", error: error.message });
  }
});



app.listen(port, () => {
  console.log(`Server is running at port ${port}`);
});
