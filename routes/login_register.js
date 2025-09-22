

const express = require('express');
const router = express.Router();
const userDao = require('../dao/dao-user');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configurazione multer per upload immagini profilo
const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            const uploadPath = path.join(__dirname, '../public/uploads');
            if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
            cb(null, uploadPath);
        },
        filename: function (req, file, cb) {
            // Salva come userID-timestamp.ext
            const ext = path.extname(file.originalname);
            cb(null, `user_${req.user.id}_${Date.now()}${ext}`);
        }
    }),
    fileFilter: function (req, file, cb) {
        if (!file.mimetype.startsWith('image/')) return cb(new Error('Solo immagini!'));
        cb(null, true);
    }
});

router.post('/registrazione', async (req, res) => {
    try {
        await userDao.createUser(req.body);
        res.status(201).json({ message: 'Registrazione avvenuta con successo' });
    } catch (err) {
        console.error('Errore durante la registrazione:', err); 
        res.status(400).json({ error: err.error || err.message || 'Errore durante la registrazione' });
    }
});

router.get('/Me', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/Login');
    }
    try {
        const user = await userDao.getUserById(req.user.id);
        const imageUrl = await userDao.getImmagineProfiloByUserId(user.id);
        res.render('profilo', {
            user,
            imageUrl,
            isLogged: true
        });
    } catch (err) {
        res.status(500).render('error', { error: { message: 'Errore nel caricamento del profilo' } });
    }
});

router.get('/Logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error('Errore durante il logout:', err);
            return res.status(500).json({ error: 'Errore durante il logout' });
        }
        req.session.destroy((err) => {
            if (err) {
                console.error('Errore nella distruzione della sessione:', err);
                return res.status(500).json({ error: 'Errore durante il logout' });
            }
            res.redirect('/Homepage');
        });
    });
});

// Nuova route per recuperare solo la foto profilo
router.get('/api/user/profile-pic', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Non autenticato' });
    }
    try {
        const user = await userDao.getUserById(req.user.id);
        const profilePic = await userDao.getImmagineProfiloByUserId(user.id);
        res.json({ profilePic });
    } catch (err) {
        res.status(500).json({ error: 'Errore nel recupero della foto profilo' });
    }
});
// Route per aggiornare il profilo utente
router.put('/update', upload.single('profilePic'), async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, error: 'Non autenticato' });
    }
    try {
        // Aggiorna solo i dati profilo
        let updateFields = {};
        if (req.body.nome && req.body.nome.trim() !== '') updateFields.nome = req.body.nome;
        if (req.body.cognome && req.body.cognome.trim() !== '') updateFields.cognome = req.body.cognome;
        if (req.body.email && req.body.email.trim() !== '') updateFields.email = req.body.email;
        if (req.body.telefono && req.body.telefono.trim() !== '') updateFields.telefono = req.body.telefono;
        if (Object.keys(updateFields).length > 0) {
            await userDao.updateUser(req.user.id, updateFields);
        }
        res.json({ success: true });
    } catch (err) {
        console.error('Errore aggiornamento profilo:', err);
        res.status(500).json({ success: false, error: err.message || err });
    }
});

// Route dedicata solo alla modifica della foto profilo
router.put('/update-profile-pic', upload.single('profilePic'), async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, error: 'Non autenticato' });
    }
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'Nessun file inviato' });
        }
        // Ottieni la vecchia immagine dal DB
        const oldImageUrl = await userDao.getImmagineProfiloByUserId(req.user.id);
        if (oldImageUrl) {
            const oldImagePath = path.join(__dirname, '../public', oldImageUrl.replace('/uploads/', 'uploads/'));
            if (fs.existsSync(oldImagePath)) {
                try { fs.unlinkSync(oldImagePath); } catch (e) { console.error('Errore eliminazione vecchia immagine:', e); }
            }
        }
        const imageUrl = '/uploads/' + req.file.filename;
        await userDao.updateProfilePicture(req.user.id, imageUrl);
        res.json({ success: true, imageUrl });
    } catch (err) {
        console.error('Errore aggiornamento foto profilo:', err);
        res.status(500).json({ success: false, error: err.message || err });
    }
});
module.exports = router;