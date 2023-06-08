const express = require('express');
const notify = require('../controllers/notification');



const router = express();

router.post('/', notify.AddNotification);
router.get('/', notify.GetAllNotification);
router.get('/get/:id', notify.GetBYNotifyID);
router.delete('/delete/:id', notify.deleteNotification);
router.get('/user/all/:userId', notify.GetAllNotificationforuser);
module.exports = router;