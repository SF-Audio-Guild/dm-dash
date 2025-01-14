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
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
const pg_1 = require("pg");
var credentials = {
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DB,
    password: process.env.PG_PW,
    port: 5432,
};
exports.pool = new pg_1.Pool(credentials);
function query(queryObject, params) {
    return __awaiter(this, void 0, void 0, function* () {
        const start = Date.now();
        const res = yield exports.pool.query(queryObject, params);
        const duration = Date.now() - start;
        console.log("executed query", { queryObject, duration, rows: res.rowCount });
        return res;
    });
}
const db = {
    query,
};
exports.default = db;
