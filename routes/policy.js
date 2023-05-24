const express = require('express'); 
const policyControllers = require('../controllers/privacy');
const aboutUs = require('../controllers/about')
const router = express();



router.post('/',[  policyControllers.addPrivacy]);
router.get('/',[  policyControllers.getPrivacy]);
router.put('/:id',[ policyControllers.updatePolicy]);
router.delete('/:id',[ policyControllers.DeletePolicy])



// About Us 

router.post('/about', aboutUs.AddAboutUs);
router.get('/about', aboutUs.GetAboutus);
router.delete('/about', aboutUs.DeleteAbourUs)




module.exports = router;