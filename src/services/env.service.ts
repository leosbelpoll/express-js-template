import { injectable } from "tsyringe";

@injectable()
export class EnvService {
    getEnv<T = string>(name: string): T {
        const value = process.env[name];

        if (!value) {
            throw new Error(`Environment variable ${name} not found`);
        }

        if (["true", "false"].includes(value)) {
            return new Boolean(value) as T;
        }

        if (!isNaN(Number(value))) {
            return new Number(value) as T;
        }

        return value as T;
    }
}
