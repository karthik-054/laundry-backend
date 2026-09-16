const Coin = require("../models/Coin");
const CoinTransaction = require("../models/CoinTransaction");

// =====================================================
// GET COIN TRANSACTIONS
// GET /api/coin-transactions
// =====================================================
exports.getCoinTransactions = async (req, res) => {
  try {
    const userId = req.user.id;

    const transactions = await CoinTransaction.find({
      user: userId,
    }).sort({
      createdAt: -1,
    });

    const data = transactions.map((transaction) => ({
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
    }));

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error(
      "Get Coin Transactions Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// =====================================================
// EARN COINS
// POST /api/coin-transactions/earn
// =====================================================
exports.earnCoins = async (req, res) => {
  try {
    const userId = req.user.id;

    const coins = Number(req.body.coins);

    if (!Number.isFinite(coins) || coins <= 0) {
      return res.status(400).json({
        success: false,
        message: "Coins must be greater than 0",
      });
    }

    let coin = await Coin.findOne({
      user: userId,
    });

    // Create coin account if missing
    if (!coin) {
      coin = await Coin.create({
        user: userId,
        balance: 0,
      });
    }

    const balanceBefore = Number(
      coin.balance || 0
    );

    coin.balance = balanceBefore + coins;

    await coin.save();

    const transaction =
      await CoinTransaction.create({
        user: userId,
        coin: coin._id,
        type: "EARN",
        coins,
        description:
          req.body.description ||
          "Coins earned",
      });

    return res.status(200).json({
      success: true,

      message: "Coins earned successfully",

      balance: coin.balance,

      transaction: {
        id: transaction._id.toString(),
        amount: coins,
        type: "EARN",
        reason: transaction.description,
        createdAt: transaction.createdAt,
      },
    });
  } catch (error) {
    console.error("Earn Coins Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// =====================================================
// REDEEM COINS
// POST /api/coin-transactions/redeem
// =====================================================
exports.redeemCoins = async (req, res) => {
  try {
    const userId = req.user.id;

    const coins = Number(req.body.coins);

    if (!Number.isFinite(coins) || coins <= 0) {
      return res.status(400).json({
        success: false,
        message: "Coins must be greater than 0",
      });
    }

    const coin = await Coin.findOne({
      user: userId,
    });

    if (!coin) {
      return res.status(404).json({
        success: false,
        message: "Coin account not found",
      });
    }

    const currentBalance = Number(
      coin.balance || 0
    );

    if (currentBalance < coins) {
      return res.status(400).json({
        success: false,
        message: "Insufficient coin balance",
      });
    }

    const balanceBefore = currentBalance;

    coin.balance = currentBalance - coins;

    await coin.save();

    const transaction =
      await CoinTransaction.create({
        user: userId,
        coin: coin._id,
        type: "REDEEM",
        coins,
        description:
          req.body.description ||
          "Coins redeemed",
      });

    return res.status(200).json({
      success: true,

      message: "Coins redeemed successfully",

      balance: coin.balance,

      transaction: {
        id: transaction._id.toString(),
        amount: -coins,
        type: "REDEEM",
        reason: transaction.description,
        createdAt: transaction.createdAt,
      },
    });
  } catch (error) {
    console.error(
      "Redeem Coins Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};