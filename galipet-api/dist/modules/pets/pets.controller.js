"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadPhoto = exports.remove = exports.update = exports.getOne = exports.getMine = exports.create = void 0;
const pets_service_1 = require("./pets.service");
const response_1 = require("../../utils/response");
const create = async (req, res) => {
    try {
        if (!req.user) {
            return (0, response_1.error)(res, "Non autorisé", 401);
        }
        const { name, species, breed, age_months, notes } = req.body;
        if (!name || !species) {
            return (0, response_1.error)(res, "Nom et espèce requis", 400);
        }
        const pet = await (0, pets_service_1.createPet)(req.user.id, {
            name,
            species,
            breed,
            age_months,
            notes,
        });
        return (0, response_1.success)(res, pet, 201);
    }
    catch (err) {
        return (0, response_1.error)(res, err.message);
    }
};
exports.create = create;
const getMine = async (req, res) => {
    try {
        if (!req.user) {
            return (0, response_1.error)(res, "Non autorisé", 401);
        }
        const pets = await (0, pets_service_1.getMyPets)(req.user.id);
        return (0, response_1.success)(res, pets);
    }
    catch (err) {
        return (0, response_1.error)(res, err.message);
    }
};
exports.getMine = getMine;
const getOne = async (req, res) => {
    try {
        if (!req.user) {
            return (0, response_1.error)(res, "Non autorisé", 401);
        }
        const id = req.params.id;
        const pet = await (0, pets_service_1.getPetById)(id, req.user.id);
        return (0, response_1.success)(res, pet);
    }
    catch (err) {
        return (0, response_1.error)(res, err.message, 404);
    }
};
exports.getOne = getOne;
const update = async (req, res) => {
    try {
        if (!req.user) {
            return (0, response_1.error)(res, "Non autorisé", 401);
        }
        const id = req.params.id;
        const updates = req.body;
        const pet = await (0, pets_service_1.updatePet)(id, req.user.id, updates);
        return (0, response_1.success)(res, pet);
    }
    catch (err) {
        return (0, response_1.error)(res, err.message);
    }
};
exports.update = update;
const remove = async (req, res) => {
    try {
        if (!req.user) {
            return (0, response_1.error)(res, "Non autorisé", 401);
        }
        const id = req.params.id;
        const result = await (0, pets_service_1.deletePet)(id, req.user.id);
        return (0, response_1.success)(res, result);
    }
    catch (err) {
        return (0, response_1.error)(res, err.message);
    }
};
exports.remove = remove;
const uploadPhoto = async (req, res) => {
    try {
        if (!req.user) {
            return (0, response_1.error)(res, "Non autorisé", 401);
        }
        if (!req.file) {
            return (0, response_1.error)(res, "Aucun fichier fourni", 400);
        }
        const id = req.params.id;
        const pet = await (0, pets_service_1.uploadPetPhoto)(id, req.user.id, req.file.buffer);
        return (0, response_1.success)(res, pet);
    }
    catch (err) {
        return (0, response_1.error)(res, err.message);
    }
};
exports.uploadPhoto = uploadPhoto;
