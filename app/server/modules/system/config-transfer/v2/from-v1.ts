import type { ConfigTransferModelV1 } from "../v1/model";
import type { ConfigTransferModelV2 } from "./model";

export const migrateConfigTransferV1ToV2 = (payload: ConfigTransferModelV1): ConfigTransferModelV2 => ({
	...payload,
	repositories: payload.repositories.map((repository) => {
		if (repository.config.isExistingRepository) return repository;

		// V1 stored this field even when it was ignored at runtime.
		const { customPassword: _ignoredPassword, ...config } = repository.config;
		return { ...repository, config };
	}),
});
