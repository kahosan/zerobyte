export const APP_VERSION = import.meta.env.VITE_APP_VERSION || "dev";
export const RESTIC_VERSION = import.meta.env.VITE_RESTIC_VERSION || "unknown";
export const RCLONE_VERSION = import.meta.env.VITE_RCLONE_VERSION || "unknown";
export const SHOUTRRR_VERSION = import.meta.env.VITE_SHOUTRRR_VERSION || "unknown";

const REPOSITORY_URL = "https://github.com/kahosan/zerobyte";

export const getVersionUrl = (version: string) => {
	if (version === "dev") {
		return REPOSITORY_URL;
	}

	if (version.startsWith("sha-")) {
		return `${REPOSITORY_URL}/commit/${encodeURIComponent(version.slice(4))}`;
	}

	const tag = version.replace(/\+kf\.(\d+)$/, "-kf.$1");
	return `${REPOSITORY_URL}/tree/${encodeURIComponent(tag.startsWith("v") ? tag : `v${tag}`)}`;
};
