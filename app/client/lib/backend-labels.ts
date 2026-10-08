import type { BackendType } from "@zerobyte/contracts/volumes";
import type { RepositoryBackend } from "@zerobyte/core/restic";

export const backendLabels: Record<BackendType | RepositoryBackend, string> = {
	directory: "Directory",
	local: "Local",
	nfs: "NFS",
	smb: "SMB",
	webdav: "WebDAV",
	sftp: "SFTP",
	rclone: "Rclone",
	s3: "S3",
	r2: "Cloudflare R2",
	gcs: "Google Cloud Storage",
	azure: "Azure Blob Storage",
	rest: "REST Server",
};
