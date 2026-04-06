const express = require('express');
const {
  getAddresses,
  getAddress,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} = require('../controllers/addressController');
const { verifyToken } = require('../middlewares/auth');

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// CRUD Address
router.get('/', getAddresses);
router.get('/:id', getAddress);
router.post('/', createAddress);
router.put('/:id', updateAddress);
router.delete('/:id', deleteAddress);
router.put('/:id/default', setDefaultAddress);

module.exports = router;
