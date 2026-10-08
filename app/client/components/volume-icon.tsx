import { backendLabels } from "~/client/lib/backend-labels";
import { Cloud, Folder, Server } from "lucide-react";
import type { BackendType } from "@zerobyte/contracts/volumes";

type VolumeIconProps = {
	backend: BackendType;
};

const getIconAndLabel = (backend: BackendType) => {
	switch (backend) {
		case "directory":
			return {
				icon: Folder,
				label: backendLabels.directory,
			};
		case "nfs":
			return {
				icon: Server,
				label: backendLabels.nfs,
			};
		case "smb":
			return {
				icon: Server,
				label: backendLabels.smb,
			};
		case "webdav":
			return {
				icon: Server,
				label: backendLabels.webdav,
			};
		case "rclone":
			return {
				icon: Cloud,
				label: backendLabels.rclone,
			};
		case "sftp":
			return {
				icon: Server,
				label: backendLabels.sftp,
			};
		default:
			return {
				icon: Folder,
				label: "Unknown",
			};
	}
};

export const VolumeIcon = ({ backend }: VolumeIconProps) => {
	const { icon: Icon, label } = getIconAndLabel(backend);

	return (
		<span className={`flex items-center gap-2 rounded-md py-1`}>
			<Icon className="h-4 w-4" />
			{label}
		</span>
	);
};
