"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const path = require("path");
const fs = require("fs");
var router = (0, express_1.Router)();
router.get("/5e/srd/contents", (req, res, next) => {
    try {
        res.render("dnd/5e/srd/contents", {
            auth: req.session.user,
        });
    }
    catch (err) {
        next(err);
    }
});
router.get("/5e/srd/ability-scores", (req, res, next) => {
    try {
        const data = fs.readFileSync(path.join(__dirname, "../../public/lib/data/5e-srd-ability-scores.json"), "utf8");
        res.render("dnd/5e/srd/abilityscores", {
            auth: req.session.user,
            data: JSON.parse(data),
        });
    }
    catch (err) {
        next(err);
    }
});
router.get("/5e/srd/alignments", (req, res, next) => {
    try {
        const data = fs.readFileSync(path.join(__dirname, "../../public/lib/data/5e-srd-alignments.json"), "utf8");
        res.render("dnd/5e/srd/alignments", {
            auth: req.session.user,
            data: JSON.parse(data),
        });
    }
    catch (err) {
        next(err);
    }
});
router.get("/5e/srd/backgrounds", (req, res, next) => {
    try {
        const data = fs.readFileSync(path.join(__dirname, "../../public/lib/data/5e-srd-backgrounds.json"), "utf8");
        res.render("dnd/5e/srd/backgrounds", {
            auth: req.session.user,
            data: JSON.parse(data),
        });
    }
    catch (err) {
        next(err);
    }
});
router.get("/5e/srd/equipment", (req, res, next) => {
    try {
        const categoryData = fs.readFileSync(path.join(__dirname, "../../public/lib/data/5e-srd-equipment-categories.json"), "utf8");
        const equipmentData = fs.readFileSync(path.join(__dirname, "../../public/lib/data/5e-srd-equipment.json"), "utf8");
        const magicItemsData = fs.readFileSync(path.join(__dirname, "../../public/lib/data/5e-srd-magic-items.json"), "utf8");
        res.render("dnd/5e/srd/equipment", {
            auth: req.session.user,
            categoryData: JSON.parse(categoryData),
            equipmentData: JSON.parse(equipmentData),
            magicItemsData: JSON.parse(magicItemsData),
        });
    }
    catch (err) {
        next(err);
    }
});
router.get("/5e/srd/damage-types", (req, res, next) => {
    try {
        const data = fs.readFileSync(path.join(__dirname, "../../public/lib/data/5e-srd-damage-types.json"), "utf8");
        res.render("dnd/5e/srd/damagetypes", {
            auth: req.session.user,
            data: JSON.parse(data),
        });
    }
    catch (err) {
        next(err);
    }
});
router.get("/5e/srd/classes", (req, res, next) => {
    try {
        res.render("dnd/5e/srd/classes", {
            auth: req.session.user,
        });
    }
    catch (err) {
        next(err);
    }
});
router.get("/5e/srd/conditions", (req, res, next) => {
    try {
        const data = fs.readFileSync(path.join(__dirname, "../../public/lib/data/5e-srd-conditions.json"), "utf8");
        res.render("dnd/5e/srd/conditions", {
            auth: req.session.user,
            data: JSON.parse(data),
        });
    }
    catch (err) {
        next(err);
    }
});
router.get("/5e/srd/feats", (req, res, next) => {
    try {
        const data = fs.readFileSync(path.join(__dirname, "../../public/lib/data/5e-srd-feats.json"), "utf8");
        res.render("dnd/5e/srd/feats", {
            auth: req.session.user,
            data: JSON.parse(data),
        });
    }
    catch (err) {
        next(err);
    }
});
router.get("/5e/srd/features", (req, res, next) => {
    try {
        const data = fs.readFileSync(path.join(__dirname, "../../public/lib/data/5e-srd-features.json"), "utf8");
        res.render("dnd/5e/srd/features", {
            auth: req.session.user,
            data: JSON.parse(data),
        });
    }
    catch (err) {
        next(err);
    }
});
router.get("/5e/srd/languages", (req, res, next) => {
    try {
        const data = fs.readFileSync(path.join(__dirname, "../../public/lib/data/5e-srd-languages.json"), "utf8");
        res.render("dnd/5e/srd/languages", {
            auth: req.session.user,
            data: JSON.parse(data),
        });
    }
    catch (err) {
        next(err);
    }
});
router.get("/5e/srd/races", (req, res, next) => {
    try {
        res.render("dnd/5e/srd/races", {
            auth: req.session.user,
        });
    }
    catch (err) {
        next(err);
    }
});
router.get("/5e/srd/spells", (req, res, next) => {
    try {
        const spellsData = fs.readFileSync(path.join(__dirname, "../../public/lib/data/5e-srd-spells.json"), "utf8");
        const schoolsData = fs.readFileSync(path.join(__dirname, "../../public/lib/data/5e-srd-magic-schools.json"), "utf8");
        res.render("dnd/5e/srd/spells", {
            auth: req.session.user,
            spellsData: JSON.parse(spellsData),
            schoolsData: JSON.parse(schoolsData),
        });
    }
    catch (err) {
        next(err);
    }
});
router.get("/5e/srd/skills", (req, res, next) => {
    try {
        const data = fs.readFileSync(path.join(__dirname, "../../public/lib/data/5e-srd-skills.json"), "utf8");
        res.render("dnd/5e/srd/skills", {
            auth: req.session.user,
            data: JSON.parse(data),
        });
    }
    catch (err) {
        next(err);
    }
});
router.get("/5e/srd/weapon-properties", (req, res, next) => {
    try {
        const data = fs.readFileSync(path.join(__dirname, "../../public/lib/data/5e-srd-weapon-properties.json"), "utf8");
        res.render("dnd/5e/srd/weaponproperties", {
            auth: req.session.user,
            data: JSON.parse(data),
        });
    }
    catch (err) {
        next(err);
    }
});
module.exports = router;
