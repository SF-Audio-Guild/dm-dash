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
var _a = require("../queries/images.js"), getImageQuery = _a.getImageQuery, removeImageQuery = _a.removeImageQuery;
var _b = require("../queries/locations.js"), addLocationQuery = _b.addLocationQuery, getLocationsQuery = _b.getLocationsQuery, getLocationsWithKeywordAndFilterQuery = _b.getLocationsWithKeywordAndFilterQuery, getLocationsWithKeywordQuery = _b.getLocationsWithKeywordQuery, getLocationsWithFilterQuery = _b.getLocationsWithFilterQuery, getLocationQuery = _b.getLocationQuery, getSubLocationsQuery = _b.getSubLocationsQuery, removeLocationQuery = _b.removeLocationQuery, editLocationQuery = _b.editLocationQuery;
var _c = require("../queries/projects.js"), getProjectQuery = _c.getProjectQuery, editProjectQuery = _c.editProjectQuery;
var removeFile = require("./s3.js").removeFile;
function addLocation(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var data, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4, addLocationQuery(req.body)];
                case 1:
                    data = _a.sent();
                    res.status(201).json(data.rows[0]);
                    return [3, 3];
                case 2:
                    err_1 = _a.sent();
                    next(err_1);
                    return [3, 3];
                case 3: return [2];
            }
        });
    });
}
function getLocation(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var locationData, location_1, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4, getLocationQuery(req.params.id)];
                case 1:
                    locationData = _a.sent();
                    location_1 = locationData.rows[0];
                    res.send(location_1);
                    return [3, 3];
                case 2:
                    err_2 = _a.sent();
                    next(err_2);
                    return [3, 3];
                case 3: return [2];
            }
        });
    });
}
function getLocations(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var data, err_3, data, err_4, data, err_5, data, err_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(req.params.keyword && req.params.filter)) return [3, 5];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4, getLocationsWithKeywordAndFilterQuery({
                            projectId: req.params.project_id,
                            limit: req.params.limit,
                            offset: req.params.offset,
                            keyword: req.params.keyword,
                            filter: req.params.filter
                        })];
                case 2:
                    data = _a.sent();
                    res.send(data.rows);
                    return [3, 4];
                case 3:
                    err_3 = _a.sent();
                    next(err_3);
                    return [3, 4];
                case 4: return [3, 18];
                case 5:
                    if (!(req.params.keyword && !req.params.filter)) return [3, 10];
                    _a.label = 6;
                case 6:
                    _a.trys.push([6, 8, , 9]);
                    return [4, getLocationsWithKeywordQuery({
                            projectId: req.params.project_id,
                            limit: req.params.limit,
                            offset: req.params.offset,
                            keyword: req.params.keyword
                        })];
                case 7:
                    data = _a.sent();
                    res.send(data.rows);
                    return [3, 9];
                case 8:
                    err_4 = _a.sent();
                    next(err_4);
                    return [3, 9];
                case 9: return [3, 18];
                case 10:
                    if (!(req.params.filter && !req.params.keyword)) return [3, 15];
                    _a.label = 11;
                case 11:
                    _a.trys.push([11, 13, , 14]);
                    return [4, getLocationsWithFilterQuery({
                            projectId: req.params.project_id,
                            limit: req.params.limit,
                            offset: req.params.offset,
                            filter: req.params.filter
                        })];
                case 12:
                    data = _a.sent();
                    res.send(data.rows);
                    return [3, 14];
                case 13:
                    err_5 = _a.sent();
                    next(err_5);
                    return [3, 14];
                case 14: return [3, 18];
                case 15:
                    _a.trys.push([15, 17, , 18]);
                    return [4, getLocationsQuery({
                            projectId: req.params.project_id,
                            limit: req.params.limit,
                            offset: req.params.offset
                        })];
                case 16:
                    data = _a.sent();
                    res.send(data.rows);
                    return [3, 18];
                case 17:
                    err_6 = _a.sent();
                    next(err_6);
                    return [3, 18];
                case 18: return [2];
            }
        });
    });
}
function getSubLocations(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var data, err_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4, getSubLocationsQuery(req.params.parent_location_id)];
                case 1:
                    data = _a.sent();
                    res.send(data.rows);
                    return [3, 3];
                case 2:
                    err_7 = _a.sent();
                    next(err_7);
                    return [3, 3];
                case 3: return [2];
            }
        });
    });
}
function removeLocation(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var locationData, location_2, projectData, project, subLocations, imageData, image, newCalculatedData, err_8;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 10, , 11]);
                    return [4, getLocationQuery(req.params.id)];
                case 1:
                    locationData = _a.sent();
                    location_2 = locationData.rows[0];
                    return [4, getProjectQuery(location_2.project_id)];
                case 2:
                    projectData = _a.sent();
                    project = projectData.rows[0];
                    return [4, getSubLocationsQuery(req.params.id)];
                case 3:
                    subLocations = _a.sent();
                    subLocations.rows.forEach(function (location) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, editLocationQuery(location.id, {
                                        parent_location_id: null,
                                        is_sub: false
                                    })];
                                case 1:
                                    _a.sent();
                                    return [2];
                            }
                        });
                    }); });
                    return [4, removeLocationQuery(req.params.id)];
                case 4:
                    _a.sent();
                    res.status(204).send();
                    if (!location_2.image_id) return [3, 9];
                    return [4, getImageQuery(location_2.image_id)];
                case 5:
                    imageData = _a.sent();
                    image = imageData.rows[0];
                    return [4, removeFile("wyrld/images", image)];
                case 6:
                    _a.sent();
                    return [4, removeImageQuery(image.id)];
                case 7:
                    _a.sent();
                    newCalculatedData = project.used_data_in_bytes - image.size;
                    return [4, editProjectQuery(project.id, {
                            used_data_in_bytes: newCalculatedData
                        })];
                case 8:
                    _a.sent();
                    _a.label = 9;
                case 9: return [3, 11];
                case 10:
                    err_8 = _a.sent();
                    next(err_8);
                    return [3, 11];
                case 11: return [2];
            }
        });
    });
}
function editLocation(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var data, err_9;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4, editLocationQuery(req.params.id, req.body)];
                case 1:
                    data = _a.sent();
                    res.status(200).send(data.rows[0]);
                    return [3, 3];
                case 2:
                    err_9 = _a.sent();
                    next(err_9);
                    return [3, 3];
                case 3: return [2];
            }
        });
    });
}
module.exports = {
    getLocation: getLocation,
    getLocations: getLocations,
    getSubLocations: getSubLocations,
    addLocation: addLocation,
    removeLocation: removeLocation,
    editLocation: editLocation
};