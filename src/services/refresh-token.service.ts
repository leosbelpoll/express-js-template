import { container, injectable } from "tsyringe";
import { RefreshTokenRepository } from "../repositories/refresh-token.repository";
import { RefreshToken } from "../entities/refresh-token.entity";
import { Duplicated, NotFound } from "../utils/errors.utils";

@injectable()
export class RefreshTokenService {
    private refreshTokenRepository: RefreshTokenRepository;

    constructor() {
        this.refreshTokenRepository = container.resolve(RefreshTokenRepository);
    }

    async createRefreshToken(
        input: Omit<RefreshToken, "id" | "createdAt">
    ): Promise<RefreshToken> {
        const { token } = input;

        const existingRefreshToken =
            await this.refreshTokenRepository.findOneBy({ token });

        if (existingRefreshToken) {
            throw new Duplicated("RefreshToken already exists", {
                resource: "RefreshToken",
                id: existingRefreshToken.id,
            });
        }

        const refreshTokenCreation = this.refreshTokenRepository.create(input);

        const refreshtoken =
            await this.refreshTokenRepository.save(refreshTokenCreation);

        return refreshtoken;
    }

    async removeUserRefreshTokens(userId: string): Promise<void> {
        await this.refreshTokenRepository.softRemove({ user: { id: userId } });
    }

    async getRefreshTokenByToken(token: string): Promise<RefreshToken> {
        const refreshToken = await this.refreshTokenRepository.findOneBy({
            token,
        });

        if (!refreshToken) {
            throw new NotFound("RefreshToken not found", {
                resource: "RefreshToken",
                identifierAttribute: "token",
                identifierValue: token,
            });
        }

        return refreshToken;
    }
}
