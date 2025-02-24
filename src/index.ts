import "reflect-metadata";
import { createExpressServer } from "routing-controllers";

import "./di.config";

import { UserController } from "./controllers/user.controller";
import { AppDataSource } from "./typeorm.config";
import { AuthController } from "./controllers/auth.controller";
import { PermissionController } from "./controllers/permission.controller";
import { RoleController } from "./controllers/role.controller";

const PORT = process.env.PORT || 4000;

AppDataSource.initialize().then(() => {
    const app = createExpressServer({
        controllers: [
            UserController,
            AuthController,
            PermissionController,
            RoleController,
        ],
        cors: {
            origin: ["http://localhost:3000"],
            methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
            allowedHeaders: ["Content-Type", "Authorization"],
            credentials: true,
        },
    });

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});
