'use strict';

const moment = require('moment');

class Evento {
    constructor(id, titolo, descrizione, data_inizio, data_fine, luogo, tipo_evento, squadra_id, campo_id, max_partecipanti, pubblicato,created_at,updated_at, immagini_id) {
        this.id = id;
        this.titolo = titolo;
        this.descrizione = descrizione;
        this.data_inizio = data_inizio ? Evento.parseDate(data_inizio) : null;
        this.data_fine = data_fine ? Evento.parseDate(data_fine) : null;
        this.luogo = luogo;
        this.tipo_evento = tipo_evento;
        this.squadra_id = squadra_id;
        this.campo_id = campo_id;
        this.max_partecipanti = max_partecipanti;
        this.pubblicato = pubblicato;
        this.created_at = created_at ? Evento.parseDate(created_at) : null;
        this.updated_at = updated_at ? Evento.parseDate(updated_at) : null;
        this.immagini_id = immagini_id;
    }

    static parseDate(dateStr) {
        // Se già ISO, usa direttamente, altrimenti prova a normalizzare
        if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
            return moment(dateStr).format('YYYY-MM-DD HH:mm:ss');
        }
        // Se formato tipo MM/DD/YYYY o DD/MM/YYYY, prova a convertire
        // Sostituisci / con - e prova a costruire una data
        let d = dateStr.replace(/\//g, '-');
        // Se formato MM-DD-YYYY
        if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(d)) {
            // MM-DD-YYYY
            const [mm, dd, yyyy] = d.split('-');
            return moment(`${yyyy}-${mm.padStart(2,'0')}-${dd.padStart(2,'0')}`).format('YYYY-MM-DD HH:mm:ss');
        }
        // Se formato DD-MM-YYYY
        if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(d)) {
            const [dd, mm, yyyy] = d.split('-');
            return moment(`${yyyy}-${mm.padStart(2,'0')}-${dd.padStart(2,'0')}`).format('YYYY-MM-DD HH:mm:ss');
        }
        // Fallback: usa moment direttamente
        return moment(dateStr).format('YYYY-MM-DD HH:mm:ss');
    }

    static from(json){
        if (!json) {
            return null;
        }
        const evento = Object.assign(new Eventi(), json);
        return evento;
    }

    static to(evento){
        if (!evento) {
            return null;
        }
        const json = Object.assign({}, evento);
        return json;
    }
}

module.exports = Evento;