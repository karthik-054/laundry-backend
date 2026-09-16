const Wallet = require("../models/Wallet");
const WalletTransaction = require("../models/WalletTransaction");

// =====================================================
// GET MY WALLET
// GET /api/wallet
// =====================================================
exports.getMyWallet = async (req, res) => {
  try {
    const userId = req.user.id;

    let wallet = await Wallet.findOne({
      user: userId,
    });

    // Create wallet automatically
    if (!wallet) {
      wallet = await Wallet.create({
        user: userId,
        balance: 0,
      });
    }

    const transactions = await WalletTransaction.find({
      user: userId,
    }).sort({
      createdAt: -1,
    });

    const formattedTransactions = transactions.map((transaction) => ({
      id: transaction._id.toString(),

      amount:
        transaction.type === "debit"
          ? -Math.abs(Number(transaction.amount))
          : Math.abs(Number(transaction.amount)),

      type:
        transaction.type === "debit"
          ? "DEBIT"
          : "CREDIT",

      reason:
        transaction.description ||
        (transaction.type === "credit"
          ? "Wallet credited"
          : "Wallet debited"),

      createdAt: transaction.createdAt,
    }));

    return res.status(200).json({
      success: true,
      balance: Number(wallet.balance || 0),
      transactions: formattedTransactions,
    });
  } catch (error) {
    console.error("Get My Wallet Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// =====================================================
// ADD MONEY
// POST /api/wallet/add
// =====================================================
exports.addMoney = async (req, res) => {
  try {
    const userId = req.user.id;
    const amount = Number(req.body.amount);

    // Validate amount
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than 0",
      });
    }

    let wallet = await Wallet.findOne({
      user: userId,
    });

    // Create wallet if not available
    if (!wallet) {
      wallet = await Wallet.create({
        user: userId,
        balance: 0,
      });
    }

    const balanceBefore = Number(wallet.balance || 0);

    wallet.balance = balanceBefore + amount;

    await wallet.save();

    // Create transaction
    const transaction = await WalletTransaction.create({
      user: userId,
      wallet: wallet._id,
      type: "credit",
      amount,
      balanceBefore,
      balanceAfter: wallet.balance,
      description: "Wallet recharge",
      status: "success",
    });

    return res.status(200).json({
      success: true,
      message: "Wallet credited successfully",

      wallet: {
        id: wallet._id.toString(),
        balance: wallet.balance,
      },

      transaction: {
        id: transaction._id.toString(),
        amount: transaction.amount,
        type: "CREDIT",
        reason: transaction.description,
        createdAt: transaction.createdAt,
      },
    });
  } catch (error) {
    console.error("Add Wallet Money Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// =====================================================
// DEBIT MONEY
// POST /api/wallet/debit
// =====================================================
exports.debitMoney = async (req, res) => {
  try {
    const userId = req.user.id;
    const amount = Number(req.body.amount);

    // Validate amount
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than 0",
      });
    }

    const wallet = await Wallet.findOne({
      user: userId,
    });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: "Wallet not found",
      });
    }

    const currentBalance = Number(wallet.balance || 0);

    // Check balance
    if (currentBalance < amount) {
      return res.status(400).json({
        success: false,
        message: "Insufficient wallet balance",
      });
    }

    const balanceBefore = currentBalance;

    wallet.balance = currentBalance - amount;

    await wallet.save();

    // Create transaction
    const transaction = await WalletTransaction.create({
      user: userId,
      wallet: wallet._id,
      type: "debit",
      amount,
      balanceBefore,
      balanceAfter: wallet.balance,
      description: "Wallet payment",
      status: "success",
    });

    return res.status(200).json({
      success: true,
      message: "Wallet debited successfully",

      wallet: {
        id: wallet._id.toString(),
        balance: wallet.balance,
      },

      transaction: {
        id: transaction._id.toString(),
        amount: -Math.abs(transaction.amount),
        type: "DEBIT",
        reason: transaction.description,
        createdAt: transaction.createdAt,
      },
    });
  } catch (error) {
    console.error("Debit Wallet Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};