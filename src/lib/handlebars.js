const moment = require('moment/min/moment-with-locales');

// Configura el idioma globalmente para todos los usos de moment()
moment.locale('es'); 

// Si aún usas timeago.js (aparte de moment.js's fromNow)
const { format: formatTimeago } = require('timeago.js'); 

const helpers = {

     ifEquals: function(arg1, arg2, options) {
        if (arg1 === arg2) { // Usamos '===' para una comparación estricta
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    },
    // Helper para "hace X tiempo" (usando timeago.js si lo quieres, si no, usa momentFromNow)
    timeago: (timestamp) => {
        if (!timestamp) {
            console.warn("[timeago Helper] Timestamp is null or undefined.");
            return '';
        }
        try {
            const date = new Date(timestamp);
            if (isNaN(date.getTime())) {
                console.warn(`[timeago Helper] Invalid date object created from timestamp: ${timestamp}`);
                return '';
            }
            return formatTimeago(date.toISOString()); 
        } catch (e) {
            console.error(`[timeago Helper] Error formatting timestamp ${timestamp}:`, e);
            return '';
        }
    },

    // Helper para "hace X tiempo" usando moment.js (es mejor si no tienes otra razón para timeago.js)
    momentFromNow: (timestamp) => {
        if (!timestamp) return '';
        // moment.locale('es'); // Ya no es necesario aquí si se configuró globalmente arriba
        return moment(timestamp).fromNow();
    },

    // Helper para formatear fechas con Moment.js (ej: 2025-05-25)
    formatDate: (timestamp, formatString = 'YYYY-MM-DD') => {
        const date = moment(timestamp);
        if (!date.isValid()) {
            console.warn(`[Handlebars Helper] Invalid date provided to formatDate: ${timestamp}`);
            return '';
        }
        return date.format(formatString);
    },

    // Helper para formatear fechas de forma más amigable (ej: 25 de Mayo de 2025)
    formatDateFriendly: (timestamp) => {
        const date = moment(timestamp);
        if (!date.isValid()) {
            console.warn(`[Handlebars Helper] Invalid date provided to formatDateFriendly: ${timestamp}`);
            return '';
        }
        // moment.locale('es'); // Ya no es necesario aquí si se configuró globalmente arriba
        return date.format('D [de] MMMM [de] YYYY'); // Asegúrate de que el comodín sea YYYY
    }
};

module.exports = helpers;