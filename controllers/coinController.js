const Coin = require("../models/Coin");
const CoinTransaction = require("../models/CoinTransaction");
const  { createNotification } = require('./notificationController')

// =====================================================
// GET MY COINS
// GET /api/coins
// =====================================================
exports.getMyCoins = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find user's coin account
    let coin = await Coin.findOne({
      user: userId,
    });

    // Create coin account automatically
    if (!coin) {
      coin = await Coin.create({
        user: userId,
        balance: 0,
      });
    }

    // Get transactions
    const transactions = await CoinTransaction.find({
      user: userId,
    }).sort({
      createdAt: -1,
    });

    let earned = 0;
    let redeemed = 0;

    transactions.forEach((transaction) => {
      if (transaction.type === "EARN") {
        earned += Number(transaction.coins || 0);
      }

      if (transaction.type === "REDEEM") {
        redeemed += Number(transaction.coins || 0);
      }
    });

    const formattedTransactions = transactions.map(
      (transaction) => ({
        id: transaction._id.toString(),

        amount:
          transaction.type === "REDEEM"
            ? -Math.abs(Number(transaction.coins || 0))
            : Math.abs(Number(transaction.coins || 0)),

        type: transaction.type,

        reason:
          transaction.description ||
          (transaction.type === "EARN"
            ? "Coins earned"
            : "Coins redeemed"),

        createdAt: transaction.createdAt,
      })
    );

    return res.status(200).json({
      success: true,

      balance: Number(coin.balance || 0),

      earned,

      redeemed,

      transactions: formattedTransactions,
    });
  } catch (error) {
    console.error("Get My Coins Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};