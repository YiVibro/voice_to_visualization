const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const { exec } = require("child_process");
const fs = require("fs").promises;  // Use promise-based fs
require('dotenv').config();
const { HfInference } = require('@huggingface/inference');
const mysql=require('mysql2');
const bcrypt=require('bcryptjs');
const jwt = require("jsonwebtoken")

const app = express();
const PORT = 5000;
const hf=new HfInference(process.env.HF_ACCESS_TOKEN);

// const SYSTEM_PROMPT = `
// You are an expert in creating sql queries from normal textual language.When user gives command in normal english convert that into appropriate sq query.For example if give me all the transactions between january and march it must return "select * from transactions where date is between "january" and "march" "
// `;
const SYSTEM_PROMPT=`You are an AI assistant that generates SQL queries based on user input. Below is the database schema:
Database: 'sales_db'

1. 'customers' (Stores customer details)
   - 'customer_id' (INT, PRIMARY KEY)
   - 'first_name' (VARCHAR)
   - 'last_name' (VARCHAR)
   - 'email' (VARCHAR)
   - 'phone' (VARCHAR)
   - 'address' (VARCHAR)
   - 'city' (VARCHAR)
   - 'state' (VARCHAR)
   - 'zip_code' (VARCHAR)
   - 'country' (VARCHAR)
   - 'registration_date' (DATE)

2. 'products' (Stores product information)
   - 'product_id' (INT, PRIMARY KEY)
   - 'product_name' (VARCHAR)
   - 'category' (VARCHAR)
   - 'subcategory' (VARCHAR)
   - 'unit_price' (DECIMAL(10,2))
   - 'cost' (DECIMAL(10,2))
   - 'weight' (DECIMAL(10,2))
   - 'supplier_id' (INT)
   - 'stock_quantity' (INT)
   - 'discontinued' (BOOLEAN)

3. 'employees' (Stores employee details)
   - 'employee_id' (INT, PRIMARY KEY)
   - 'first_name' (VARCHAR)
   - 'last_name' (VARCHAR)
   - 'email' (VARCHAR)
   - 'phone' (VARCHAR)
   - 'hire_date' (DATE)
   - 'position' (VARCHAR)
   - 'department' (VARCHAR)
   - 'salary' (DECIMAL(12,2))

4. 'sales' (Stores sales transactions)
   - 'sale_id' (INT, PRIMARY KEY)
   - 'customer_id' (INT, FOREIGN KEY → 'customers(customer_id)')
   - 'employee_id' (INT, FOREIGN KEY → 'employees(employee_id)')
   - 'sale_date' (DATETIME)
   - 'total_amount' (DECIMAL(12,2))
   - 'discount' (DECIMAL(10,2))
   - 'tax_amount' (DECIMAL(10,2))
   - 'payment_method' (VARCHAR)
   - 'shipping_address' (VARCHAR)
   - 'shipping_city' (VARCHAR)
   - 'shipping_state' (VARCHAR)
   - 'shipping_zip_code' (VARCHAR)
   - 'shipping_country' (VARCHAR)

5. 'sale_details' (Stores line items for each sale)
   - 'sale_detail_id' (INT, PRIMARY KEY)
   - 'sale_id' (INT, FOREIGN KEY → 'sales(sale_id)')
   - 'product_id' (INT, FOREIGN KEY → 'products(product_id)')
   - 'quantity' (INT)
   - 'unit_price' (DECIMAL(10,2))
   - 'discount' (DECIMAL(5,2))
   - 'line_total' (DECIMAL(12,2))
Based on this schema, generate optimized and secure SQL queries as per user requests. Ensure queries are structured properly, use parameterized inputs, and avoid SQL injection risks.
`
const db=mysql.createConnection({
  // host: process.env.DB_HOST,
  // user:process.env.DB_USER,
  // password:process.env.DB_PASSWORD,
  // database:process.env.DB_NAME,
  host:'localhost',
  user:'root',
  password:'yishith@2005born',
  database:'business'
});

db.connect((err)=>{
  if(err)throw err;
  console.log("Connected to MySQL database");
})

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("uploads"));

//dummy get
app.get("/",(req,res)=>{
  db.query("select * from memberinfo",(err,result)=>{
    if(err)return res.json({error:err});
    res.json(result);
   })
});

// **User Registration Route**
app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  db.query(
    "INSERT INTO users (email, password_hash) VALUES (?, ?)",
    [email, hashedPassword],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: "User registered successfully!" });
    }
  );
});

// **Login Route**
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(400).json({ message: "User not found!" });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) return res.status(400).json({ message: "Invalid credentials!" });

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, email: user.email }, "SECRET_KEY", { expiresIn: "1h" });

    // Store token in HttpOnly cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      sameSite: "Strict",
    });

    res.status(200).json({ message: "Login successful!" });
  });
});

// **Logout Route**
app.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out successfully!" });
});

// **Middleware to Verify JWT**
const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Unauthorized!" });

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid token!" });

    req.user = decoded;
    next();
  });
};  

app.get("/get-data",(req,res)=>{
  res.json(
    { "id": 1, "name": "John", "email": "john@example.com" },
    { "id": 2, "name": "Alice", "email": "alice@example.com" }
  )
})

// Configure Multer for Audio Uploads
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, "audio_" + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Function to execute a shell command and return a promise
const runCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error("❌ Whisper Execution Error:", error.message);
        reject(error);
      } else {
        console.log("✅ Whisper Execution Output:", stdout);
        if (stderr) console.error("⚠️ Whisper Execution Warning:", stderr);
        resolve(stdout);
      }
    });
  });
};

// Function to wait for file creation
const waitForFile = async (filePath, maxWait = 10000) => {
  const interval = 500; // Check every 500ms
  let waited = 0;
  
  while (waited < maxWait) {
    try {
      await fs.access(filePath);
      return true; // File exists
    } catch (err) {
      await new Promise((res) => setTimeout(res, interval));
      waited += interval;
    }
  }
  
  return false; // File not found within maxWait time
};

app.post("/repeat",(req,res)=>{
  console.log((req))
  res.json({hello:"hhh"});
})
app.get("/sales",(req,res)=>{
  console.log("Requestcame");
  db.query("select * from sales",(err,result)=>{
    if(err)return res.json({err:"Error occured"});
    res.json(result);
  })
})


// Audio Upload Route
app.post("/upload-audio", upload.single("audio"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    // Whisper command execution
    const audioPath = path.join(__dirname, "uploads", req.file.filename);
    const jsonFilename = req.file.filename.split(".")[0]; // Extract filename without extension
    const outputDir = path.join(__dirname, "transcriptions");
    const modelDir = "C:\\path\\to\\whisper_models";

    const whisperCommand = `whisper "${audioPath}" --model base --output_format json --output_dir "${outputDir}" --model_dir "${modelDir}"`;
    
    console.log("🚀 Running Whisper...");
    await runCommand(whisperCommand);
    console.log("✅ Whisper processing completed.");

    // Construct the JSON file path
    const jsonPath = path.join(outputDir, `${jsonFilename}.json`);
    console.log(`📂 Checking JSON file at: ${jsonPath}`);

    // Wait for JSON file to be created (max 10 seconds)
    const fileExists = await waitForFile(jsonPath);
    if (!fileExists) {
      console.error("❌ JSON file was not created in time.");
      return res.status(500).json({ message: "Transcription file not found", filePath: jsonPath });
    }

    // Read and parse the JSON file
    const jsonString = await fs.readFile(jsonPath, "utf8");  // ✅ Fixed Syntax
    const jsonData = JSON.parse(jsonString);

    console.log("📝 Transcribed Text:", jsonData.text);

    //AI API
    const response = await hf.chatCompletion({
      model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
      messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `I have "${jsonData.text}" is my textual command.Give me sql query for this in normal text form` },
      ],
      max_tokens: 1024,
  });

  const redmeMD=response.choices[0].message.content;
  const code = redmeMD.match(/```([\s\S]*?)```/g);
  const query = code ? code.map(block => block.replace(/```/g, '').trim()) : [];
   console.log("result=",query[0]);
  //console.log("SQL query:",query[0].split("\n")[1]);
  let quer=query[0].split("\n")[1];
  db.query(quer,(err,result)=>{
    if(err) {console.log(err);return res.status(500).json("Error on sql query")};
    console.log(result);
    res.json(result);
  })
 
    console.log("Task completed! Now deleting file...");
    await fs.unlink(audioPath);
    await fs.unlink(jsonPath);
   
    // res.json({
    //   message: "Audio uploaded and processed successfully",
    //   text: jsonData.text,
    //   filePath: `/uploads/${req.file.filename}`,
    // });

  } catch (err) {
    console.error("❌ Error:", err.message);
    res.status(500).json({ message: "Error processing audio", error: err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🌍 Server running on http://localhost:${PORT}`);
});

