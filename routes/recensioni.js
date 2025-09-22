'use strict';

const express = require('express');
const router = express.Router();
const dao = require('../dao/dao-recensioni');
const isLoggedIn = require('../middleware/auth');

router.get('/recensioni', async (req, res) => {
    try {
        const recensioni = await dao.getRecensioni();
        res.json(recensioni);
    } catch (error) {
        console.error('Errore nel recupero delle recensioni:', error);
        res.status(500).json({ error: 'Errore nel caricamento delle recensioni' });
    }
});

router.get('/recensioni/all', async (req, res) => {
    try {
        const recensioni = await dao.getRecensioni();

        // Calcola le statistiche dalle recensioni
        const totaleRecensioni = recensioni.length;
        const mediaValutazioni = await dao.getValutaMediaRecensioni();
        const conteggioValutazioni = {
            1: 0, 2: 0, 3: 0, 4: 0, 5: 0
        };
        recensioni.forEach(rec => {
            conteggioValutazioni[rec.valutazione]++;
        });
        res.render('reviews', {
            reviews: recensioni,
            averageRating: mediaValutazioni,
            ratingCounts: conteggioValutazioni,
            totalReviews: totaleRecensioni,
            isLogged: req.isAuthenticated ? req.isAuthenticated() : false,
            imageUrl: req.user?.imageUrl || null,
            error: null
        });
    } catch (error) {
        console.error('Errore nel recupero delle recensioni:', error);
        res.render('reviews', { 
            error: 'Errore nel recupero delle recensioni. Riprova più tardi.',
            isLogged: req.isAuthenticated ? req.isAuthenticated() : false,
            imageUrl: req.user?.imageUrl || null,
            reviews: [],
            averageRating: 0,
            ratingCounts: {},
            totalReviews: 0
        });
    }
});

// Salva una nuova recensione
router.post('/recensione', isLoggedIn, async (req, res) => {
    try {
        const { valutazione, titolo, contenuto, entita_tipo, entita_id } = req.body;
        console.log('DEBUG RECENSIONE POST: req.user =', req.user);
        const utente_id = req.user?.id;
        if (!valutazione || !titolo || !contenuto || !entita_tipo || !entita_id || !utente_id) {
            console.log('DEBUG RECENSIONE POST: dati mancanti', { valutazione, titolo, contenuto, entita_tipo, entita_id, utente_id });
            return res.json({ success: false, error: 'Dati mancanti' });
        }
        // Salva la recensione tramite DAO
        const result = await dao.inserisciRecensione({ valutazione, titolo, contenuto, entita_tipo, entita_id, utente_id });
        if (result && result.success) {
            res.json({ success: true });
        } else {
            console.log('DEBUG RECENSIONE POST: errore DAO', result);
            res.json({ success: false, error: 'Errore salvataggio recensione' });
        }
    } catch (error) {
        console.error('Errore salvataggio recensione:', error);
        res.json({ success: false, error: 'Errore server' });
    }
});


module.exports = router;