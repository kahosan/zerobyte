import type { RepositoryConfig } from "../schemas";
import type { ResticDeps } from "../types";

export const resolveRepositoryPassword = async (
	config: RepositoryConfig,
	organizationId: string,
	deps: ResticDeps,
): Promise<string> => {
	const secret = config.customPassword || (await deps.getOrganizationResticPassword(organizationId));
	return deps.resolveSecret(secret);
};
