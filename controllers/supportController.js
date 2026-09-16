const SupportTicket = require('../models/SupportTicket');

// ========================================
// GET MY SUPPORT TICKETS
// ========================================
exports.getMyTickets = async (req, res) => {
  try {
    console.log('SUPPORT req.user:', req.user);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User authentication information not found',
      });
    }

    // Your protect middleware puts the decoded JWT into req.user
    const userId =
      req.user.id ||
      req.user.userId ||
      req.user._id;

    if (!userId) {
      console.error('JWT does not contain user ID:', req.user);

      return res.status(401).json({
        success: false,
        message: 'User ID not found in authentication token',
      });
    }

    const tickets = await SupportTicket.find({
      user: userId,
    }).sort({
      createdAt: -1,
    });

    const data = tickets.map(ticket => ({
      id: ticket._id.toString(),
      category: ticket.category,
      subject: ticket.subject,
      message: ticket.message,
      status: ticket.status,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
    }));

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error('GET SUPPORT TICKETS ERROR:', error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ========================================
// CREATE SUPPORT TICKET
// ========================================
exports.createTicket = async (req, res) => {
  try {
    console.log('CREATE SUPPORT req.user:', req.user);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User authentication information not found',
      });
    }

    const userId =
      req.user.id ||
      req.user.userId ||
      req.user._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID not found in authentication token',
      });
    }

    const {
      category = 'general',
      subject,
      message,
    } = req.body;

    if (!subject || !subject.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Subject is required',
      });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
      });
    }

    const ticket = await SupportTicket.create({
      user: userId,
      category,
      subject: subject.trim(),
      message: message.trim(),
    });

    const data = {
      id: ticket._id.toString(),
      category: ticket.category,
      subject: ticket.subject,
      message: ticket.message,
      status: ticket.status,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
    };

    return res.status(201).json({
      success: true,
      message: 'Support ticket created successfully',
      data,
    });
  } catch (error) {
    console.error('CREATE SUPPORT TICKET ERROR:', error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};