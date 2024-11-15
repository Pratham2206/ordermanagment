require('dotenv').config();
// require('dotenv').config({ path: './backend/.env' });
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sequelize = require('./config/sequelize');
const Contact = require('../backend/models/contact');
const CareerApplication = require('../backend/models/careerApplication');
const User = require('../backend/models/user');
const Employee = require('../backend/models/employee');
const Order = require('../backend/models/order');
const DeliveryBoy = require('../backend/models/deliveryBoy');
const AssignedOrder = require('../backend/models/assignedOrder');
const Token = require('../backend/models/token');
const Customer = require('../backend/models/customer');
const Pricing = require('../backend/models/pricing');
const app = express();


// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Import route modules
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const dataRoutes = require('./routes/data');
const dataOrders = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const webauthRoutes = require('./routes/webauthRoutes');
const webuserRoutes = require('./routes/webuserRoutes');

// Client URLs based on environment
const CLIENT_URL_LOCAL = process.env.CLIENT_URL_LOCAL;
const CLIENT_URL_PROD = process.env.CLIENT_URL_PROD;

// Automatically set the client URL based on NODE_ENV (handled by Docker/Heroku)
const clientURL = process.env.NODE_ENV === 'production' ? CLIENT_URL_PROD : CLIENT_URL_LOCAL;
console.log(`Client URL set to: ${clientURL}`); // Debugging output

// CORS configuration (allow requests from client URL)
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [CLIENT_URL_LOCAL, CLIENT_URL_PROD];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200,
};

// Apply CORS middleware with specific options
app.use(cors(corsOptions));

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/orders', dataOrders);
app.use('/api/admin', adminRoutes);
app.use('/api/auth/web', webauthRoutes);
app.use('/api/user/web', webuserRoutes);

// Function to start the server and sync the database
const start = async () => {
  try {
    // Sync all models
    await sequelize.sync({ alter: false ,force: false });
    await CareerApplication.sync();
    await Contact.sync();
    await User.sync();
    await Employee.sync();
    await Order.sync();
    await DeliveryBoy.sync();
    await AssignedOrder.sync();
    await Token.sync();
    await Customer.sync();
    await Pricing.sync();
    console.log('Database synced successfully');

    const PORT = process.env.PORT || 5000; // Default to 5000 if PORT not set
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error syncing database:', error);
  }
};

// Call the start function
start();

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
