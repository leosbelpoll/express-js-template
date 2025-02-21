import "reflect-metadata";
import { createExpressServer } from "routing-controllers";
import { UserController } from "./controllers/user.controller";
import { AppDataSource } from "./typeorm.config";
import { AuthController } from "./controllers/auth.controller";

import "./di.config";

const PORT = process.env.PORT || 3000;

AppDataSource.initialize().then(() => {
    const app = createExpressServer({
        controllers: [UserController, AuthController],
    });

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});
