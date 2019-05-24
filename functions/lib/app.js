"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const routes_1 = require("./routes");
const config_1 = require("./config");
require("./controller/test.controller");
class Main {
    constructor() {
        this.config = new config_1.Config();
        routes_1.RegisterRoutes(this.config.app);
    }
}
new Main().config.start();
//# sourceMappingURL=app.js.map