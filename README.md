📦 Order Management API – Jitterbit Challenge

This project is a complete implementation of the Jitterbit backend challenge.
It provides a fully functional Order Management REST API built with Node.js, Express, and PostgreSQL, including full CRUD operations, payload mapping, authentication, and full Swagger documentation.

The solution not only meets all the mandatory requirements from the assignment, but also implements all optional features, following best practices for clean architecture, error handling, and API design.

🚀 Features
✅ Mandatory Requirements Implemented

POST /order endpoint to create a new order

Automatic field mapping from the received JSON payload to the database model

Storage of orders and items in PostgreSQL using the exact structure defined in the challenge

GET /order/:orderId to retrieve a specific order

Validation of incoming data

Date and numeric conversions following ISO and type-safety guidelines

Proper error messages returned to the client

🌟 Optional Requirements Implemented

List all orders → GET /order/list

Update an order → PUT /order/:orderId

Delete an order → DELETE /order/:orderId

All operations include:

404 handling

Input validation

Conflict detection

🔐 JWT Authentication (Optional Requirement Fully Implemented)

The API includes a secure JWT-based authentication layer, including:

Login endpoint that issues a JWT token

Middleware to protect sensitive routes

Validation of Bearer tokens

Custom expiration time via environment variables

Protected routes:

GET /order/:orderId

GET /order/list

PUT /order/:orderId

DELETE /order/:orderId

📄 Swagger Documentation (Optional Requirement Fully Implemented)

The API provides complete OpenAPI 3.0 documentation, accessible at:

👉 [http://localhost:3000/docs](http://localhost:3000/api-docs/#/)

The documentation includes:

Full description of every endpoint

Example requests and responses

HTTP error codes

Route authentication requirements

JSON schemas for orders and items

“Try it out” interactive testing

🗂️ Clean Architecture

The project was developed with a professional-grade structure:

src/
│── app.js                → Express config, Swagger, middlewares
│── index.js              → Server startup
│── db.js                 → Knex database connection
│
├── controllers/          → Input handling & responses
│     └── order.controller.js
│
├── services/             → Business logic & DB operations
│     └── order.service.js
│
├── routes/               → API routes
│     └── order.routes.js
│
├── middlewares/
│     ├── auth.middleware.js      → JWT validation
│     └── error.middleware.js     → Central error handler
│
└── swagger.js            → OpenAPI configuration



This ensures:

Clear separation of concerns

Maintainability

Reusable business logic

Scalable code structure

🗃️ Database Structure (PostgreSQL)

orders table

Column	Type
orderId	string (PK)
value	decimal
creationDate	timestamp

items table

Column	Type
id	integer (PK)
orderId	string (FK → orders.orderId)
productId	integer
quantity	integer
price	decimal

All database schemas were created using Knex migrations, and example data can be loaded via Knex seeds.

📥 Installation & Setup
1️⃣ Clone the repository
git clone https://github.com/<your-username>/order-api.git
cd order-api

2️⃣ Install dependencies
npm install

3️⃣ Configure environment variables

Create a .env file based on .env.example

PORT=3000
DATABASE_URL=postgresql://postgres:password@localhost:5432/orders_db
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1h

4️⃣ Run database migrations
npx knex migrate:latest

(Optional) 5️⃣ Seed the database
npx knex seed:run

6️⃣ Start the server
npm run dev   # development mode
# or
npm start

📚 API Endpoints
🔓 Public Routes
Method	Endpoint	Description
POST	/order	Create a new order
POST	/order/login	Generate JWT token
🔐 Protected Routes (JWT Required)
Method	Endpoint	Description
GET	/order/:orderId	Retrieve an order by ID
GET	/order/list	List all orders
PUT	/order/:orderId	Update an order
DELETE	/order/:orderId	Delete an order
🔄 Request Payload Mapping

The API receives:

{
  "numeroPedido": "v10089015vdb-01",
  "valorTotal": 10000,
  "dataCriacao": "2023-07-19T12:24:11.5299601+00:00",
  "items": [
    {
      "idItem": "2434",
      "quantidadeItem": 1,
      "valorItem": 1000
    }
  ]
}


And automatically maps it to:

{
  "orderId": "v10089015vdb",
  "value": 10000,
  "creationDate": "2023-07-19T12:24:11.529Z",
  "items": [
    {
      "productId": 2434,
      "quantity": 1,
      "price": 1000
    }
  ]
}


As required by the Jitterbit challenge.

⚠️ Error Handling

The API returns structured error responses:

Code	Description
400	Invalid data
401	Unauthorized (missing/invalid token)
404	Order not found
409	Order already exists
500	Internal server error
🧪 Testing the API
Generate a token
POST /order/login
{
  "username": "admin",
  "password": "admin123"
}

Use the token to access protected routes
Authorization: Bearer <token>

🧰 Technologies Used

Node.js

Express

PostgreSQL

Knex.js (migrations & queries)

JWT Authentication

Swagger (OpenAPI 3.0)

Nodemon

Express Validator

Clean Architecture

REST best practices

🎯 Final Notes

This project fully satisfies all mandatory and all optional requirements from the challenge.
The API is production-ready, modular, secure, documented, and follows modern backend development standards.

Feel free to clone, test, and extend it!
