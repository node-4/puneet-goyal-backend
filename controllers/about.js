const aboutUs = require('../models/aboutus');




exports.AddAboutUs = async(req,res) => {
    try{
    const data = {
        about: req.body.about
    }
    await aboutUs.create(data);
    res.status(200).json({
        message: "About Us Added "
    })
    }catch(err){
        console.log(err);
        res.status(400).json({
            message: err.message
        })
    }
}


exports.GetAboutus = async(req,res) => {
    try{
      const data =   await aboutUs.find();
        res.status(200).json({
            message: data
        })
    }catch(err){
        console.log(err);
        res.status(400).json({
            message: err.message
        })
    }
}

exports.DeleteAbourUs = async(req,res) => {
    try{
    await aboutUs.deleteMany();
    res.status(200).json({
        message: "About Us Deleted "
    })
    }catch(err){
        console.log(err);
        res.status(400).json({
            message: err.message
        })
    }
}