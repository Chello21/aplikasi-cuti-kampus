const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  submitCuti, getCuti, getCutiById,
  verifySekjur, verifyKajur, exportExcel, getCetakData
} = require('../controllers/cutiController');

// Export harus sebelum /:id supaya tidak konflik
router.get('/export/excel', authenticate, requireRole('sekjur', 'kajur', 'kaprodi'), exportExcel);

router.post('/', authenticate, requireRole('mahasiswa'),
  upload.fields([{ name: 'file_khs', maxCount: 1 }, { name: 'file_ukt', maxCount: 1 }]),
  submitCuti
);

router.get('/', authenticate, getCuti);
router.get('/:id', authenticate, getCutiById);
router.get('/:id/cetak', authenticate, getCetakData);

router.put('/:id/verify-sekjur', authenticate, requireRole('sekjur'), verifySekjur);
router.put('/:id/verify-kajur', authenticate, requireRole('kajur'), verifyKajur);

module.exports = router;
