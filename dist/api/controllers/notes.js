"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _a = require("../queries/notes.js"), addNoteQuery = _a.addNoteQuery, getNotesQuery = _a.getNotesQuery, getNoteQuery = _a.getNoteQuery, getNotesByLocationQuery = _a.getNotesByLocationQuery, getNotesByCharacterQuery = _a.getNotesByCharacterQuery, getNotesByItemQuery = _a.getNotesByItemQuery, removeNoteQuery = _a.removeNoteQuery, editNoteQuery = _a.editNoteQuery, getNotesByLoreQuery = _a.getNotesByLoreQuery;
var getItemQuery = require("../queries/items.js").getItemQuery;
var getCharacterQuery = require("../queries/characters.js").getCharacterQuery;
var getLocationQuery = require("../queries/locations.js").getLocationQuery;
var getProjectQuery = require("../queries/projects.js").getProjectQuery;
var getProjectUserByUserAndProjectQuery = require("../queries/projectUsers.js").getProjectUserByUserAndProjectQuery;
var getLoreQuery = require("../queries/lores.js").getLoreQuery;
function addNote(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var projectData, project, projectUser, data, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    if (!req.user)
                        throw { status: 401, message: "Missing Credentials" };
                    req.body.user_id = req.user.id;
                    return [4, getProjectQuery(req.body.project_id)];
                case 1:
                    projectData = _a.sent();
                    project = projectData.rows[0];
                    if (!(project.user_id !== req.user.id)) return [3, 3];
                    return [4, getProjectUserByUserAndProjectQuery(req.user.id, project.id)];
                case 2:
                    projectUser = _a.sent();
                    if (!projectUser)
                        throw { status: 403, message: "Forbidden" };
                    _a.label = 3;
                case 3: return [4, addNoteQuery(req.body)];
                case 4:
                    data = _a.sent();
                    res.status(201).json(data.rows[0]);
                    return [3, 6];
                case 5:
                    err_1 = _a.sent();
                    next(err_1);
                    return [3, 6];
                case 6: return [2];
            }
        });
    });
}
function getNotes(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var projectData, project, projectUser, data, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    if (!req.user)
                        throw { status: 401, message: "Missing Credentials" };
                    return [4, getProjectQuery(req.params.project_id)];
                case 1:
                    projectData = _a.sent();
                    project = projectData.rows[0];
                    if (!(project.user_id !== req.user.id)) return [3, 3];
                    return [4, getProjectUserByUserAndProjectQuery(req.user.id, project.id)];
                case 2:
                    projectUser = _a.sent();
                    if (!projectUser)
                        throw { status: 403, message: "Forbidden" };
                    _a.label = 3;
                case 3: return [4, getNotesQuery(req.user.id, req.params.project_id, req.params.limit, req.params.offset, req.params.keyword)];
                case 4:
                    data = _a.sent();
                    res.send(data.rows);
                    return [3, 6];
                case 5:
                    err_2 = _a.sent();
                    next(err_2);
                    return [3, 6];
                case 6: return [2];
            }
        });
    });
}
function getNotesByLocation(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var locationData, location_1, projectData, project, projectUser, data, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    if (!req.user)
                        throw { status: 401, message: "Missing Credentials" };
                    return [4, getLocationQuery(req.params.location_id)];
                case 1:
                    locationData = _a.sent();
                    location_1 = locationData.rows[0];
                    return [4, getProjectQuery(location_1.project_id)];
                case 2:
                    projectData = _a.sent();
                    project = projectData.rows[0];
                    if (!(project.user_id !== req.user.id)) return [3, 4];
                    return [4, getProjectUserByUserAndProjectQuery(req.user.id, project.id)];
                case 3:
                    projectUser = _a.sent();
                    if (!projectUser)
                        throw { status: 403, message: "Forbidden" };
                    _a.label = 4;
                case 4: return [4, getNotesByLocationQuery(req.user.id, req.params.location_id)];
                case 5:
                    data = _a.sent();
                    res.send(data.rows);
                    return [3, 7];
                case 6:
                    err_3 = _a.sent();
                    next(err_3);
                    return [3, 7];
                case 7: return [2];
            }
        });
    });
}
function getNotesByCharacter(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var characterData, character, projectData, project, projectUser, data, err_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    if (!req.user)
                        throw { status: 401, message: "Missing Credentials" };
                    return [4, getCharacterQuery(req.params.character_id)];
                case 1:
                    characterData = _a.sent();
                    character = characterData.rows[0];
                    return [4, getProjectQuery(character.project_id)];
                case 2:
                    projectData = _a.sent();
                    project = projectData.rows[0];
                    if (!(project.user_id !== req.user.id)) return [3, 4];
                    return [4, getProjectUserByUserAndProjectQuery(req.user.id, project.id)];
                case 3:
                    projectUser = _a.sent();
                    if (!projectUser)
                        throw { status: 403, message: "Forbidden" };
                    _a.label = 4;
                case 4: return [4, getNotesByCharacterQuery(req.user.id, req.params.character_id)];
                case 5:
                    data = _a.sent();
                    res.send(data.rows);
                    return [3, 7];
                case 6:
                    err_4 = _a.sent();
                    next(err_4);
                    return [3, 7];
                case 7: return [2];
            }
        });
    });
}
function getNotesByItem(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var itemData, item, projectData, project, projectUser, data, err_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    if (!req.user)
                        throw { status: 401, message: "Missing Credentials" };
                    return [4, getItemQuery(req.params.item_id)];
                case 1:
                    itemData = _a.sent();
                    item = itemData.rows[0];
                    return [4, getProjectQuery(item.project_id)];
                case 2:
                    projectData = _a.sent();
                    project = projectData.rows[0];
                    if (!(project.user_id !== req.user.id)) return [3, 4];
                    return [4, getProjectUserByUserAndProjectQuery(req.user.id, project.id)];
                case 3:
                    projectUser = _a.sent();
                    if (!projectUser)
                        throw { status: 403, message: "Forbidden" };
                    _a.label = 4;
                case 4: return [4, getNotesByItemQuery(req.user.id, req.params.item_id)];
                case 5:
                    data = _a.sent();
                    res.send(data.rows);
                    return [3, 7];
                case 6:
                    err_5 = _a.sent();
                    next(err_5);
                    return [3, 7];
                case 7: return [2];
            }
        });
    });
}
function getNotesByLore(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var loreData, lore, projectData, project, projectUser, data, err_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    if (!req.user)
                        throw { status: 401, message: "Missing Credentials" };
                    return [4, getLoreQuery(req.params.lore_id)];
                case 1:
                    loreData = _a.sent();
                    lore = loreData.rows[0];
                    return [4, getProjectQuery(lore.project_id)];
                case 2:
                    projectData = _a.sent();
                    project = projectData.rows[0];
                    if (!(project.user_id !== req.user.id)) return [3, 4];
                    return [4, getProjectUserByUserAndProjectQuery(req.user.id, project.id)];
                case 3:
                    projectUser = _a.sent();
                    if (!projectUser)
                        throw { status: 403, message: "Forbidden" };
                    _a.label = 4;
                case 4: return [4, getNotesByLoreQuery(req.user.id, req.params.lore_id)];
                case 5:
                    data = _a.sent();
                    res.send(data.rows);
                    return [3, 7];
                case 6:
                    err_6 = _a.sent();
                    next(err_6);
                    return [3, 7];
                case 7: return [2];
            }
        });
    });
}
function removeNote(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var noteData, note, projectData, project, projectUser, err_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    if (!req.user)
                        throw { status: 401, message: "Missing Credentials" };
                    return [4, getNoteQuery(req.params.id)];
                case 1:
                    noteData = _a.sent();
                    note = noteData.rows[0];
                    return [4, getProjectQuery(note.project_id)];
                case 2:
                    projectData = _a.sent();
                    project = projectData.rows[0];
                    if (!(project.user_id !== req.user.id)) return [3, 4];
                    return [4, getProjectUserByUserAndProjectQuery(req.user.id, project.id)];
                case 3:
                    projectUser = _a.sent();
                    if (!projectUser)
                        throw { status: 403, message: "Forbidden" };
                    _a.label = 4;
                case 4: return [4, removeNoteQuery(req.params.id)];
                case 5:
                    _a.sent();
                    res.status(204).send();
                    return [3, 7];
                case 6:
                    err_7 = _a.sent();
                    next(err_7);
                    return [3, 7];
                case 7: return [2];
            }
        });
    });
}
function editNote(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var noteData, note, projectData, project, projectUser, data, err_8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    if (!req.user)
                        throw { status: 401, message: "Missing Credentials" };
                    return [4, getNoteQuery(req.params.id)];
                case 1:
                    noteData = _a.sent();
                    note = noteData.rows[0];
                    return [4, getProjectQuery(note.project_id)];
                case 2:
                    projectData = _a.sent();
                    project = projectData.rows[0];
                    if (!(project.user_id !== req.user.id)) return [3, 4];
                    return [4, getProjectUserByUserAndProjectQuery(req.user.id, project.id)];
                case 3:
                    projectUser = _a.sent();
                    if (!projectUser)
                        throw { status: 403, message: "Forbidden" };
                    _a.label = 4;
                case 4: return [4, editNoteQuery(req.params.id, req.body)];
                case 5:
                    data = _a.sent();
                    res.status(200).send(data.rows[0]);
                    return [3, 7];
                case 6:
                    err_8 = _a.sent();
                    next(err_8);
                    return [3, 7];
                case 7: return [2];
            }
        });
    });
}
module.exports = {
    getNotes: getNotes,
    getNotesByLocation: getNotesByLocation,
    addNote: addNote,
    removeNote: removeNote,
    editNote: editNote,
    getNotesByCharacter: getNotesByCharacter,
    getNotesByItem: getNotesByItem,
    getNotesByLore: getNotesByLore
};
