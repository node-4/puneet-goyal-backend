const notify = require('../models/notification_model');


exports.AddNotification = async (req, res) => {
    try {

        const data = {
            message: req.body.message,
            user: req.body.user,
        }
        const Data = await notify.create(data)
        res.status(200).json({
            message: Data
        })
    } catch (err) {
        res.status(400).json({
            message: err.message
        })
    }
}


exports.GetAllNotification = async (req, res) => {
    try {
        const data = await notify.find();
        res.status(200).json({
            message: data
        })
    } catch (err) {
        res.status(400).json({
            message: err.message
        })
    }
}
exports.GetAllNotificationforuser = async (req, res) => {
    try {
        const data = await notify.find({ user: req.params.userId });
        res.status(200).json({message: data})
    } catch (err) {
        res.status(400).json({
            message: err.message
        })
    }
}
exports.GetBYNotifyID = async (req, res) => {
    try {
        const data = await notify.findById({ _id: req.params.id })
        res.status(200).json({
            message: data
        })
    } catch (err) {
        res.status(400).json({
            message: err.message
        })
    }
}

exports.deleteNotification = async (req, res) => {
    try {
        await notify.findByIdAndDelete({ _id: req.params.id });
        res.status(200).json({
            message: "Notification Deleted "
        })
    } catch (err) {
        res.status(400).json({
            message: err.message
        })
    }
}

