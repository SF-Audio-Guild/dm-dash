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
exports.editPlayerUser = exports.removePlayerUsersByPlayer = exports.removePlayerUserByUserAndPlayer = exports.removePlayerUser = exports.getPlayerUsersByPlayer = exports.getPlayerUserByUserAndPlayer = exports.addPlayerUser = void 0;
var _5eCharGeneral_js_1 = require("../queries/5eCharGeneral.js");
var playerUsers_js_1 = require("../queries/playerUsers.js");
var users_js_1 = require("../queries/users.js");
function addPlayerUser(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var charData, data, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    if (!req.session.user)
                        throw new Error("User is not logged in");
                    req.body.user_id = req.session.user;
                    return [4, (0, _5eCharGeneral_js_1.get5eCharGeneralQuery)(req.body.player_id)];
                case 1:
                    charData = _a.sent();
                    if (charData.rows[0].user_id == req.session.user) {
                        throw { message: "User is owner" };
                    }
                    return [4, (0, playerUsers_js_1.addPlayerUserQuery)(req.body)];
                case 2:
                    data = _a.sent();
                    res.status(201).json(data.rows[0]);
                    return [3, 4];
                case 3:
                    err_1 = _a.sent();
                    next(err_1);
                    return [3, 4];
                case 4: return [2];
            }
        });
    });
}
exports.addPlayerUser = addPlayerUser;
function getPlayerUserByUserAndPlayer(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var data, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    if (!req.session.user)
                        throw new Error("User is not logged in");
                    return [4, (0, playerUsers_js_1.getPlayerUserByUserAndPlayerQuery)(req.session.user, req.params.player_id)];
                case 1:
                    data = _a.sent();
                    res.status(200).json(data.rows[0]);
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
exports.getPlayerUserByUserAndPlayer = getPlayerUserByUserAndPlayer;
function getPlayerUsersByPlayer(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var PlayerUsersData, usersList, _i, _a, PlayerUser, userData, user, err_3;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 6, , 7]);
                    return [4, (0, playerUsers_js_1.getPlayerUsersByPlayerQuery)(req.params.player_id)];
                case 1:
                    PlayerUsersData = _b.sent();
                    usersList = [];
                    _i = 0, _a = PlayerUsersData.rows;
                    _b.label = 2;
                case 2:
                    if (!(_i < _a.length)) return [3, 5];
                    PlayerUser = _a[_i];
                    return [4, (0, users_js_1.getUserByIdQuery)(PlayerUser.user_id)];
                case 3:
                    userData = _b.sent();
                    user = userData.rows[0];
                    user.player_user_id =
                        PlayerUser.id;
                    user.is_editor =
                        PlayerUser.is_editor;
                    usersList.push(user);
                    _b.label = 4;
                case 4:
                    _i++;
                    return [3, 2];
                case 5:
                    res.status(200).json(usersList);
                    return [3, 7];
                case 6:
                    err_3 = _b.sent();
                    next(err_3);
                    return [3, 7];
                case 7: return [2];
            }
        });
    });
}
exports.getPlayerUsersByPlayer = getPlayerUsersByPlayer;
function removePlayerUser(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var err_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4, (0, playerUsers_js_1.removePlayerUserQuery)(req.params.id)];
                case 1:
                    _a.sent();
                    res.status(204).send();
                    return [3, 3];
                case 2:
                    err_4 = _a.sent();
                    next(err_4);
                    return [3, 3];
                case 3: return [2];
            }
        });
    });
}
exports.removePlayerUser = removePlayerUser;
function removePlayerUserByUserAndPlayer(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var playerUserData, err_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    if (!req.session.user)
                        throw new Error("User is not logged in");
                    return [4, (0, playerUsers_js_1.getPlayerUserByUserAndPlayerQuery)(req.session.user, req.params.player_id)];
                case 1:
                    playerUserData = _a.sent();
                    return [4, (0, playerUsers_js_1.removePlayerUserQuery)(playerUserData.rows[0].id)];
                case 2:
                    _a.sent();
                    res.status(204).send();
                    return [3, 4];
                case 3:
                    err_5 = _a.sent();
                    next(err_5);
                    return [3, 4];
                case 4: return [2];
            }
        });
    });
}
exports.removePlayerUserByUserAndPlayer = removePlayerUserByUserAndPlayer;
function removePlayerUsersByPlayer(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var err_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    if (!req.session.user)
                        throw new Error("User is not logged in");
                    return [4, (0, playerUsers_js_1.removePlayerUsersByPlayerQuery)(req.params.player_id)];
                case 1:
                    _a.sent();
                    res.status(204).send();
                    return [3, 3];
                case 2:
                    err_6 = _a.sent();
                    next(err_6);
                    return [3, 3];
                case 3: return [2];
            }
        });
    });
}
exports.removePlayerUsersByPlayer = removePlayerUsersByPlayer;
function editPlayerUser(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var data, err_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4, (0, playerUsers_js_1.editPlayerUserQuery)(req.params.id, req.body)];
                case 1:
                    data = _a.sent();
                    res.status(200).send(data.rows[0]);
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
exports.editPlayerUser = editPlayerUser;
