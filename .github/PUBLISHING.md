# Publishing Linux container images

This fork publishes `ghcr.io/kahosan/zerobyte` for `linux/amd64` and `linux/arm64`. Docker selects the matching architecture from the same image tag.

## First-time setup

1. Enable GitHub Actions in `kahosan/zerobyte`. Repository or organization policies must allow the workflow's `packages: write` permission.
2. Merge `.github/workflows/publish-image.yml` into the default branch so **Publish Linux Image** appears with a **Run workflow** button.
3. The workflow uses the automatically provided `GITHUB_TOKEN`. No personal access token, Docker Hub credentials, or Docker Build Cloud account is required.
4. After the first successful publication, open the `zerobyte` package settings on GitHub and set its visibility to **Public** if you want unauthenticated pulls. If a package with this name already exists, give this repository Actions access to that package.

Lint, type checks, server/client tests, the application build, E2E tests, and integration tests must pass before an image is published.

## Release a version

Use the upstream version your code is based on plus a fork revision starting at 1. For example, `v0.43.0-kf.1` is the first fork release based on upstream `v0.43.0`. Further fork changes become `v0.43.0-kf.2`; after updating to upstream `v0.43.1`, start at `v0.43.1-kf.1`.

From the commit you want to publish, after committing the workflow and your changes:

```bash
git tag -a v0.43.0-kf.1 -m "Release v0.43.0-kf.1"
git push origin v0.43.0-kf.1
```

Replace the example version with your actual upstream base and next fork revision. Tags must have no leading zeros. Push individual release tags, not all upstream tags. Publish a new revision instead of moving an existing release tag.

The workflow publishes three image tags:

- `ghcr.io/kahosan/zerobyte:v0.43.0-kf.1`
- `ghcr.io/kahosan/zerobyte:sha-<full-commit-SHA>`
- `ghcr.io/kahosan/zerobyte:latest`

`latest` follows the most recently completed tag publication, including an older version if you deliberately publish one. Use a full version tag or the digest from the Actions summary when pinning a deployment:

```yaml
image: ghcr.io/kahosan/zerobyte:v0.43.0-kf.1
```

The application receives `APP_VERSION=v0.43.0+kf.1` at build time. SemVer ignores the `+kf.1` build metadata when comparing versions, so the existing upstream update check does not mistakenly suggest the base `v0.43.0` release as an update. Docker tags use `-kf.1` because they cannot contain `+`.

The sidebar version links to `https://github.com/kahosan/zerobyte/tree/v0.43.0-kf.1`. Update notifications and release notes continue to come from `nicotsx/zerobyte`; they do not track fork revisions or automatically update containers.

## Publish a manual build

Open **Actions → Publish Linux Image → Run workflow** and select the branch to build. A manual run publishes only `sha-<full-commit-SHA>` and sets the application version to that SHA tag. It never updates `latest` or a release tag, even if launched against a Git tag.

The sidebar links to the corresponding commit in `kahosan/zerobyte`. SHA builds do not receive SemVer-based update notifications. The workflow summary lists the image tags and digest.

## Syncing upstream

Keep the fork's publishing workflow when merging upstream. Desktop releases, documentation deployment, nightly publishing, and the upstream image publishing workflows have been removed from this fork; check that an upstream merge does not reintroduce them.
