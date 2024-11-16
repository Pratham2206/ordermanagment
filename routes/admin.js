// const express = require('express');
// const router = express.Router();
// const User = require('./../models/user');
// const Order = require('../models/order');
// const DeliveryBoy = require('../models/deliveryBoy');
// const AssignedOrder = require('../models/assignedOrder');
// const { sendEmail } = require('../services/emailConformations');
// const sequelize = require('../config/sequelize');
// const { Op } = require('sequelize');



// router.get('/nonapproval', async (req, res) => {
//     try {
//         const unapprovedUsers = await User.findAll({ where: { isApproved: false } });
//         res.json(unapprovedUsers);
//     } catch (err) {
//         console.error('Error fetching data:', err);
//         res.status(500).json({ error: 'Error fetching data' });
//     }
//   });
  
//   // Route to accept a user
//   router.post('/accept/:id', async (req, res) => {
//     const { id } = req.params;
//     try {
//         const user = await User.findByPk(id);
//         if (!user) {
//             return res.status(404).json({ error: 'User not found' });
//         }
//         if (user.role === 'delivery boy') {
//             try {

//               await DeliveryBoy.create({
//                 name: user.name,
//                 email: user.email,
//                 password: user.password,
//                 phonenumber: user.phonenumber,
//                 role: user.role,
//                 created_at: new Date(),
//                 user_id: user.id,
//               });
//               console.log('Delivery boy data moved successfully');
//             } catch (insertError) {
//               console.error('Error moving data to delivery_boys table:', insertError);
//               return res.status(500).json({ error: 'Failed to move data to delivery_boys table' });
//             }
//           }
//         user.isApproved = true;
//         await user.save(); // Save the updated user
  
//         res.status(200).json({ message: 'Request accepted' });
  
//         // Send approval email
//         const ApprovedMessage = `
//         Dear ${user.name},
        
//         We’re excited to let you know that your account has been approved by our admin! You can now Login to your Account.
        
//         Welcome to the Turtu family!
        
//         Best regards,
//         The Turtu Team
//         `;
        
//         await sendEmail(user.email, 'Your Account Has Been Approved', ApprovedMessage);
//     } catch (err) {
//         console.error('Error updating request:', err);
//         res.status(500).json({ error: 'Error updating request' });
//     }
//   });
  
//   // Route to reject a user
//   router.delete('/reject/:id', async (req, res) => {
//     const { id } = req.params;
//     try {
//         const user = await User.findByPk(id);
//         if (!user) {
//             return res.status(404).json({ error: 'User not found' });
//         }
  
//         await User.destroy({ where: { id } });
//         res.status(200).json({ message: 'Request rejected' });
  
//         // Send rejection email
//         const RejectMessage = `
//         Dear ${user.name},
        
//         We regret to inform you that your account application has not been approved at this time. We appreciate your interest in joining Turtu and encourage you to reapply in the future.
        
//         If you have any questions or need further assistance, please feel free to reach out.
        
//         Thank you for your understanding.
        
//         Best regards,
//         The Turtu Team
//         `;
        
//         await sendEmail(user.email, 'Your Account Application Status', RejectMessage);
//     } catch (err) {
//         console.error('Error deleting request:', err);
//         res.status(500).json({ error: 'Error deleting request' });
//     }
//   });
  
// // Fetch orders for admin
// router.get('/admin/orders', async (req, res) => {
//     try {
//       const orders = await Order.findAll({ where: { status: ['active', 'picked'] } });
//       res.json(orders);
//     } catch (err) {
//       console.error('Error fetching assigned orders:', err);
//       res.status(500).json({ error: 'Error fetching assigned orders' });
//     }
//   });
  
//   router.get('/bar', async (req, res) => {
//       const view = req.query.view || 'weekly';
//       let query;
    
//       if (view === 'monthly') {
//         query = `
//             SELECT DATE_FORMAT(createdAt, '%Y-%m') as date, COUNT(*) as count
//             FROM orderManage.orders
//             WHERE createdAt >= NOW() - INTERVAL 12 MONTH
//             GROUP BY DATE_FORMAT(createdAt, '%Y-%m')
//             ORDER BY DATE_FORMAT(createdAt, '%Y-%m') DESC;
    
//         `;
//       } else if (view === 'yearly') {
//         query = `
//             SELECT YEAR(createdAt) as date, COUNT(*) as count
//             FROM orderManage.orders
//             WHERE createdAt >= NOW() - INTERVAL 5 YEAR
//             GROUP BY YEAR(createdAt)
//             ORDER BY YEAR(createdAt) DESC;
    
//         `;
//       } else {
//         query = `
//           SELECT DATE(createdAt) as date, COUNT(*) as count
//           FROM orderManage.orders
//           WHERE createdAt >= NOW() - INTERVAL 6 DAY
//           GROUP BY DATE(createdAt)
//           ORDER BY DATE(createdAt) DESC;
//         `;
//       }
//       try {
//         const [results] = await sequelize.query(query);  // Use 'sequelize.query' instead of 'Sequelize.query'
//         res.json(results);
//       } catch (err) {
//         console.error(err); 
//         res.status(500).json({ error: 'An error occurred while fetching data' });
//       }
//     });

// // Fetch order history with counts and details
// router.get('/orderHistory', async (req, res) => {
//   try {
//     // Count the number of orders with specified statuses from the Order model
//     const orderCount = await Order.count({
//       where: { status: ['active', 'picked', 'pending', 'delivered'] }
//     });

//     // Fetch the actual orders with details from the AssignedOrder model
//     const orders = await AssignedOrder.findAll({
//       where: { status: ['delivered'] } // Only fetching delivered orders
//     });

//     // Respond with both the order count and the orders
//     res.json({ orderCount, orders });
//   } catch (err) {
//     console.error('Error fetching assigned orders:', err);
//     res.status(500).json({ error: 'Error fetching assigned orders' });
//   }
// });

// router.get('/:orderId', async (req, res) => {
//   const { orderId } = req.params;
//   console.log(orderId);
//   try {
//     const order = await AssignedOrder.findOne({
//       where: { order_id: orderId },
//     });
//     if (!order) {
//       return res.status(404).json({ message: 'Order not found' });
//     }
//     res.json(order);
//   } catch (error) {
//     console.error('Error fetching assigned orders:', error);
//     res.status(500).json({ message: 'Error fetching assigned orders' });
//   }
// });

// router.get('/orders/filter', async (req, res) => {
//   const { startDate, endDate } = req.query;

//   const filter = {};

//   try {
//       // Parse and validate the dates
//       const start = new Date(startDate);
//       const end = new Date(endDate);

//       // Validate date formats
//       if (isNaN(start.getTime()) || isNaN(end.getTime())) {
//           return res.status(400).json({ error: 'Invalid date format' });
//       }

//       // Validate start and end dates
//       if (start > end) {
//           return res.status(400).json({ error: 'End date must be greater than start date' });
//       }

//       // Set up filter for createdAt
//       filter.createdAt = {
//           [Op.between]: [start, end]
//       };

//       // Log the filter for debugging
//       console.log('Filter being applied:', filter);

//       // Fetch orders based on filters
//       const orders = await AssignedOrder.findAll({
//           where: filter
//       });

//       // Return empty array if no orders found
//       res.json(orders);
//   } catch (err) {
//       console.error('Error fetching filtered orders:', err);
//       res.status(500).json({ error: 'Error fetching filtered orders' });
//   }
// });

// // Fetch registered users and their count
// router.get('/reg/users', async (req, res) => {
//   try {
//     // Count the total number of users
//     const userCount = await User.count();

//     // Fetch all users
//     const users = await User.findAll();

//     // Respond with both the user count and the users
//     res.json({ userCount, users });
//   } catch (err) {
//     console.error('Error fetching users:', err);
//     res.status(500).json({ error: 'Error fetching users' });
//   }
// });


//   module.exports = router;
  

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');


// Route to fetch unapproved users
router.get('/nonapproval', adminController.getUnapprovedUsers);

// Route to accept a user
router.post('/accept/:id', adminController.acceptUser);

// Route to reject a user
router.delete('/reject/:id', adminController.rejectUser);

// Route to fetch orders for admin
router.get('/admin/orders', adminController.getAdminOrders);

// Route to get bar data (weekly, monthly, yearly)
router.get('/bar', adminController.getBarData);

// Route to fetch order history with counts and details
router.get('/orderHistory', adminController.getOrderHistory);

// Route to fetch a specific order by ID
router.get('/:orderId', adminController.getOrderById);

// Route to filter orders by date range
router.get('/orders/filter', adminController.filterOrdersByDate);

// Route to fetch registered users and their count
router.get('/reg/users', adminController.getRegisteredUsers);

module.exports = router;
