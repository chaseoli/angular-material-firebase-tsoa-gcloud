import { credential } from 'firebase-admin';
import { Environment } from './env';
import * as cors from 'cors';
import * as express from 'express';
import * as admin from 'firebase-admin';
import * as helmet from 'helmet';

export class Config {

    app: express.Application;
    private allowedOrigins: string[];

    db: admin.database.Database;

    env: Environment

    constructor() {

        this.env = process.env as any;

        // init express app
        this.app = express();

        // set origins and firebase db
        this.setEnv();

        // set cors for specified origins
        this.app.use(this.setCorsConfig());

        // start test endpoints
        this.test();

        // create firebase real-time database ref
        const db = admin.database();
        this.db = db;

    }

    start() {

        // google cloud listen
        const PORT = process.env.PORT || 8080;
        this.app.listen(PORT, () => {
            console.log(`App listening on port ${PORT}`);
        });

    }

    private test() {

        // IMPORTANT: Only expose test endpoints in dev so as not 
        // increase the public *attack* surface
        if (this.env.build === 'dev') {

            this.app.get('/test', (req: any, res: any) => {
                console.info('Test Log from calling /test');
                res.send('Fired /test successfully. Please check log for test log output.');
            });

            this.app.get('/', (req: any, res: any) => {
                res
                    .status(200)
                    .send('API running...')
                    .end();
            });

        }

    }

    private setEnv() {

        // setup configs based on build target
        if (this.env.build === 'dev') {
            // Development configurations
            this.devConfig();
        } else {
            // production configurations
            this.prodConfig();
        }

         // initialize firebase app:
         admin.initializeApp({
            credential: credential.cert({
                projectId: this.env.firebaseProjectId,
                privateKey: this.env.firebasePrivateKey,
                clientEmail: this.env.firebaseClientEmail
            }),
            databaseURL: this.env.firebaseDbUrl 
        });

    }

    private prodConfig() {

        // set basic security related middleware
        // https://expressjs.com/en/advanced/best-practice-security.html
        this.app.use(helmet());

        // view logs to ensure proper deployment
        console.info('===> Running PRODUCTION Configuration <===');

        // cors domains to allow
        this.allowedOrigins = [
            this.env.portalUrl,
            this.env.portalUrl + '/'
        ];

        this.app.use((req, res, next) => {
            const allowedOrigins = this.allowedOrigins;
            const origin = req.headers.origin as string;
            if (allowedOrigins.indexOf(origin) > -1) {
                res.setHeader('Access-Control-Allow-Origin', origin);
            }
            res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, OPTIONS, DELETE');
            res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            res.header('Access-Control-Allow-Credentials', 'true');
            return next();
        });

       

    }

    private devConfig() {

        this.app.use(helmet({
            hsts: false
        }));

        // view logs to ensure proper deployment
        console.info('===> Running DEVELOPMENT Configuration <===');

        // not a production build, so add testing domains to cors
        this.allowedOrigins = [

            // angular app request
            'http://localhost:4200',
            'http://localhost:4200/',

            // firebase serve
            'http://localhost:5000',
            'http://localhost:5000/',

            // express app
            'http://localhost:3000',
            'http://localhost:3000/',

            // google cloud function emulator
            'http://localhost:8010',
            'http://localhost:8010/',
        ];

        this.app.use((req, res, next) => {
            const allowedOrigins = this.allowedOrigins;
            const origin = req.headers.origin as string;
            if (allowedOrigins.indexOf(origin) > -1) {
                res.setHeader('Access-Control-Allow-Origin', origin);
            }
            res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, OPTIONS, DELETE');
            res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            res.header('Access-Control-Allow-Credentials', 'true');
            return next();
        });

    }

    private setCorsConfig(): express.RequestHandler {

        // https://github.com/expressjs/cors

        // set cors configuration for all routes
        return cors({
            origin: (origin, callback) => {
                // allow requests with no origin
                // (like mobile apps or curl requests)
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