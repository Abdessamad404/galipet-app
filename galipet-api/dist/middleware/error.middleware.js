"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.notFound = void 0;
// Middleware pour gérer les routes non trouvées
const notFound = (req, res, next) => {
    const error = new Error(`Route non trouvée - ${req.originalUrl}`);
    res.status(404);
    next(error);
};
exports.notFound = notFound;
// Middleware de gestion globale des erreurs
const errorHandler = (err, req, res, next) => {
    // Log l'erreur pour le debugging
    console.error("[Error]", {
        message: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
    });
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        success: false,
        error: err.message || "Erreur serveur",
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
};
exports.errorHandler = errorHandler;
