const User = require('../models/Users')
const Wallet = require('../models/Wallet')
const Coin = require('../models/Coin')
const { notifyAdmins } = require('./notificationController')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

// CUSTOMER REGISTER
// const registerCustomer = async (req, res) => {
//   try {
//     const { name, email, password, phone } = req.body

//     if (!name || !email || !password || !phone) {
//       return res.status(400).json({
//         success: false,
//         message: 'All fields are required'
//       })
//     }

//     const existingUser = await User.findOne({ email })

//     if (existingUser) {
//       return res.status(400).json({
//         success: false,
//         message: 'User already exists'
//       })
//     }

//     const hashedPassword = await bcrypt.hash(password, 10)

//     const user = await User.create({
//       name,
//       email,
//       password: hashedPassword,
//       phone,
//       role: 'customer'
//     })

//     // Generate JWT token
//     const token = jwt.sign(
//       {
//         id: user._id,
//         role: user.role,
//         email: user.email
//       },
//       process.env.JWT_SECRET,
//       {
//         expiresIn: '7d'
//       }
//     )

//     res.status(201).json({
//       success: true,
//       message: 'Customer registered successfully',

//       token,

//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         phone: user.phone,
//         role: user.role
//       }
//     })
//   } catch (error) {
//     console.error('Register Error:', error)

//     res.status(500).json({
//       success: false,
//       message: error.message
//     })
//   }
// }

const registerCustomer = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      })
    }

    const existingUser = await User.findOne({ email })

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: 'customer'
    })

    // ==========================================
    // CREATE DEFAULT WALLET
    // ==========================================

    const wallet = await Wallet.create({
      user: user._id,
      balance: 10
    })

    await notifyAdmins({
      title: 'New customer registered',

      body: `${user.name} has created a new customer account.`,

      type: 'CUSTOMER'
    })

    // ==========================================
    // CREATE DEFAULT COINS
    // ==========================================

    const coins = await Coin.create({
      user: user._id,
      balance: 10
    })

    // ==========================================
    // GENERATE TOKEN
    // ==========================================

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d'
      }
    )

    // ==========================================
    // RESPONSE
    // ==========================================

    return res.status(201).json({
      success: true,
      message: 'Customer registered successfully',

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      },

      walletBalance: wallet.balance,

      coinBalance: coins.balance
    })
  } catch (error) {
    console.error('Register Error:', error)

    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// USER LOGIN
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      })
    }

    const user = await User.findOne({ email })

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      })
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account is inactive'
      })
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password)

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      })
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d'
      }
    )

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

module.exports = {
  registerCustomer,
  loginUser
}
