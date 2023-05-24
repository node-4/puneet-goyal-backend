const Wallet = require('../models/wallet');



exports.addMoney = async (req, res) => {
  if(!req.user._id){
    return res.status(500).json({
      message: "Provide Token "
    })
  }
    const wallet = await Wallet.findOne({ user: req.user._id});
    console.log(wallet);
    console.log(req.body.balance)

    if(wallet == null){
      res.status(400).json({
        message: "Wallet is Not Created "
      })
    //   wallet.balance =  req.body.balance;
    //   const w = await wallet.save();
    // res.status(200).json({
    //   status: "success",
    //  data: w,
    // });
    }else{
    wallet.balance = parseInt(wallet.balance) + parseInt(req.body.balance);
    console.log(wallet.balance)
     const w = await wallet.save();
  
    res.status(200).json({
      status: "success",
     data: w,
    });
  }
  }


  
exports.removeMoney = async (req, res) => {
    if(!req.user._id){
      return res.status(500).json({
        message: "Provide Token "
      })
    }
    const wallet = await Wallet.findOne({ user: req.user._id });
    console.log(wallet);
  
    wallet.balance = parseInt(wallet.balance) - parseInt(req.body.balance);
    const w = await wallet.save();
    console.log(w);
  
    res.status(200).json({
      status: "success",
      data: w,
    });
  };


  exports.getWallet = async (req, res) => {
    try{
    if(!req.user._id){
      return res.status(500).json({
        message: "Provide Token "
      })
    }
    const wall = await Wallet.findOne({ user: req.user._id })
    console.log(wall)
    res.status(200).json({
      status: "success",
      data: wall,
    });
  }catch(err){
    res.status(400).json({
      message: err.message
    })
  }
  };
  