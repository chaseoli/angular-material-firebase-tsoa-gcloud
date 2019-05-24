"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_admin_1 = require("firebase-admin");
const cors = require("cors");
const express = require("express");
const admin = require("firebase-admin");
const helmet = require("helmet");
class Config {
    constructor() {
        this.env = process.env;
        this.app = express();
        this.setEnv();
        this.app.use(this.setCorsConfig());
        this.test();
        const db = admin.database();
        this.db = db;
    }
    start() {
        const PORT = process.env.PORT || 8080;
        this.app.listen(PORT, () => {
            console.log(`App listening on port ${PORT}`);
        });
    }
    test() {
        if (this.env.build === 'dev') {
            this.app.get('/test', (req, res) => {
                console.info('Test Log from calling /test');
                res.send('Fired /test successfully. Please check log for test log output.');
            });
            this.app.get('/', (req, res) => {
                res
                    .status(200)
                    .send('API running...')
                    .end();
            });
        }
    }
    setEnv() {
        if (this.env.build === 'dev') {
            this.devConfig();
        }
        else {
            this.prodConfig();
        }
        admin.initializeApp({
            credential: firebase_admin_1.credential.cert({
                projectId: this.env.firebaseProjectId,
                privateKey: this.env.firebasePrivateKey,
                clientEmail: this.env.firebaseClientEmail
            }),
            databaseURL: this.env.firebaseDbUrl
        });
    }
    prodConfig() {
        this.app.use(helmet());
        console.info('===> Running PRODUCTION Configuration <===');
        this.allowedOrigins = [
            this.env.portalUrl,
            this.env.portalUrl + '/'
        ];
        this.app.use((req, res, next) => {
            const allowedOrigins = this.allowedOrigins;
            const origin = req.headers.origin;
            if (allowedOrigins.indexOf(origin) > -1) {
                res.setHeader('Access-Control-Allow-Origin', origin);
            }
            res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, OPTIONS, DELETE');
            res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            res.header('Access-Control-Allow-Credentials', 'true');
            return next();
        });
    }
    devConfig() {
        this.app.use(helmet({
            hsts: false
        }));
        console.info('===> Running DEVELOPMENT Configuration <===');
        this.allowedOrigins = [
            'http://localhost:4200',
            'http://localhost:4200/',
            'http://localhost:5000',
            'http://localhost:5000/',
            'http://localhost:3000',
            'http://localhost:3000/',
            'http://localhost:8010',
            'http://localhost:8010/',
        ];
        this.app.use((req, res, next) => {
            const allowedOrigins = this.allowedOrigins;
            const origin = req.headers.origin;
            if (allowedOrigins.indexOf(origin) > -1) {
                res.setHeader('Access-Control-Allow-Origin', origin);
            }
            res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, OPTIONS, DELETE');
            res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            res.header('Access-Control-Allow-Credentials', 'true');
            return next();
        });
    }
    setCorsConfig() {
        return cors({
            origin: (origin, callback) => {
                if (!origin) {
                    return callback(null, true);
                }
                if (this.allowedOrigins.indexOf(origin) === -1) {
                    const msg = 'The CORS policy for this site does not ' +
                        'allow access from the specified Origin.';
                    return callback(new Error(msg), false);
                }
                return callback(null, true);
            }
        });
    }
}
exports.Config = Config;
//# sourceMappingURL=config.js.map