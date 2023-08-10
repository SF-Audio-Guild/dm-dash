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
exports.__esModule = true;
exports.editTableImageQuery = exports.removeTableImageQuery = exports.getTableImageQuery = exports.getTableImagesByFolderQuery = exports.getTableImagesByUserQuery = exports.getTableImagesByProjectQuery = exports.addTableImageByUserQuery = exports.addTableImageByProjectQuery = void 0;
var dbconfig_1 = require("../dbconfig");
function addTableImageByProjectQuery(data) {
    return __awaiter(this, void 0, void 0, function () {
        var query;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    query = {
                        text: "insert into public.\"TableImage\" (project_id, image_id, folder_id) values($1,$2,$3) returning *",
                        values: [
                            data.project_id,
                            data.image_id,
                            data.folder_id
                        ]
                    };
                    return [4, dbconfig_1["default"].query(query)];
                case 1: return [2, _a.sent()];
            }
        });
    });
}
exports.addTableImageByProjectQuery = addTableImageByProjectQuery;
function addTableImageByUserQuery(data) {
    return __awaiter(this, void 0, void 0, function () {
        var query;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    query = {
                        text: "insert into public.\"TableImage\" (user_id, image_id, folder_id) values($1,$2,$3) returning *",
                        values: [
                            data.user_id,
                            data.image_id,
                            data.folder_id
                        ]
                    };
                    return [4, dbconfig_1["default"].query(query)];
                case 1: return [2, _a.sent()];
            }
        });
    });
}
exports.addTableImageByUserQuery = addTableImageByUserQuery;
function getTableImageQuery(id) {
    return __awaiter(this, void 0, void 0, function () {
        var query;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    query = {
                        text: "select * from public.\"TableImage\" where id = $1",
                        values: [id]
                    };
                    return [4, dbconfig_1["default"].query(query)];
                case 1: return [2, _a.sent()];
            }
        });
    });
}
exports.getTableImageQuery = getTableImageQuery;
function getTableImagesByFolderQuery(folder_id) {
    return __awaiter(this, void 0, void 0, function () {
        var query;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    query = {
                        text: "select * from public.\"TableImage\" where folder_id = $1",
                        values: [folder_id]
                    };
                    return [4, dbconfig_1["default"].query(query)];
                case 1: return [2, _a.sent()];
            }
        });
    });
}
exports.getTableImagesByFolderQuery = getTableImagesByFolderQuery;
function getTableImagesByProjectQuery(project_id) {
    return __awaiter(this, void 0, void 0, function () {
        var query;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    query = {
                        text: "select * from public.\"TableImage\" where project_id = $1",
                        values: [project_id]
                    };
                    return [4, dbconfig_1["default"].query(query)];
                case 1: return [2, _a.sent()];
            }
        });
    });
}
exports.getTableImagesByProjectQuery = getTableImagesByProjectQuery;
function getTableImagesByUserQuery(user_id) {
    return __awaiter(this, void 0, void 0, function () {
        var query;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    query = {
                        text: "select * from public.\"TableImage\" where user_id = $1",
                        values: [user_id]
                    };
                    return [4, dbconfig_1["default"].query(query)];
                case 1: return [2, _a.sent()];
            }
        });
    });
}
exports.getTableImagesByUserQuery = getTableImagesByUserQuery;
function removeTableImageQuery(id) {
    return __awaiter(this, void 0, void 0, function () {
        var query;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    query = {
                        text: "delete from public.\"TableImage\" where id = $1",
                        values: [id]
                    };
                    return [4, dbconfig_1["default"].query(query)];
                case 1: return [2, _a.sent()];
            }
        });
    });
}
exports.removeTableImageQuery = removeTableImageQuery;
function editTableImageQuery(id, data) {
    return __awaiter(this, void 0, void 0, function () {
        var edits, values, iterator, _i, _a, _b, key, value, query;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    edits = "";
                    values = [];
                    iterator = 1;
                    for (_i = 0, _a = Object.entries(data); _i < _a.length; _i++) {
                        _b = _a[_i], key = _b[0], value = _b[1];
                        edits += "".concat(key, " = $").concat(iterator, ", ");
                        values.push(value);
                        iterator++;
                    }
                    edits = edits.slice(0, -2);
                    values.push(id);
                    query = {
                        text: "update public.\"TableImage\" set ".concat(edits, " where id = $").concat(iterator, " returning *"),
                        values: values
                    };
                    return [4, dbconfig_1["default"].query(query)];
                case 1: return [2, _c.sent()];
            }
        });
    });
}
exports.editTableImageQuery = editTableImageQuery;
