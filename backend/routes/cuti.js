const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  submitCuti, getCuti, getCutiById,
  verifySekjur, verifyKajur, verifyAkademik, verifyWadir, exportExcel, getCetakData
} = require('../controllers/cutiController');

// Export harus sebelum /:id supaya tidak konflik
router.get('/export/excel', authenticate, requireRole('sekjur', 'kajur', 'kaprodi', 'akademik', 'wadir'), exportExcel);

router.post('/', authenticate, requireRole('mahasiswa'),
  upload.fields([{ name: 'file_khs', maxCount: 1 }, { name: 'file_ukt', maxCount: 1 }]),
  submitCuti
);

router.get('/', authenticate, getCuti);
router.get('/:id', authenticate, getCutiById);
router.get('/:id/cetak', authenticate, getCetakData);

router.put('/:id/verify-sekjur', authenticate, requireRole('sekjur'), verifySekjur);
router.put('/:id/verify-kajur', authenticate, requireRole('kajur'), verifyKajur);
router.put('/:id/verify-akademik', authenticate, requireRole('akademik'), verifyAkademik);
router.put('/:id/verify-wadir', authenticate, requireRole('wadir'), verifyWadir);

module.exports = router;
