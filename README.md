# resume-contracts

Contract-first repository for public API and event contracts across resume platform microservices.

## Modules
- `auth` (`resume-auth-contracts`): auth REST + OIDC OpenAPI, auth events AsyncAPI.
- `profile` (`resume-profile-contracts`): profile public/internal REST OpenAPI, profile events AsyncAPI.
- `search` (`resume-search-contracts`): search query REST OpenAPI, indexing-consumer AsyncAPI.
- `staticdata` (`resume-staticdata-contracts`): static-data REST OpenAPI.
- `messaging` (`resume-messaging-contracts`): messaging REST/realtime OpenAPI+AsyncAPI and async backbone contract.
- `file` (`resume-file-contracts`): file-platform REST OpenAPI and file pipeline AsyncAPI.
- `notification` (`resume-notification-contracts`): notification consumer AsyncAPI.
- `outbox-relay` (`resume-outbox-relay-contracts`): outbox relay Kafka publish AsyncAPI.

## Build
`./mvnw -DskipTests install`

## Schema Versioning Policy
- Every `openapi.yaml` and `asyncapi.yaml` must contain `info.version` in semver format (`MAJOR.MINOR.PATCH`).
- Any schema content change requires version bump.
- Backward-compatible changes: increment `MINOR` or `PATCH`.
- Breaking or unclassified diff changes: increment `MAJOR`.
- New schema files must start with `1.0.0`.

## Compatibility Gate (CI)
`.github/workflows/ci.yml` runs a compatibility gate for all tracked contract schemas:
- baseline resolution:
  - `push`: previous push SHA (`github.event.before`)
  - `pull_request`: merge-base with target branch (`origin/<base>`)
- checks:
  - OpenAPI diff via `openapi-diff`
  - AsyncAPI diff via `@asyncapi/diff`
  - version increment policy validation
- gate fails when:
  - schema changed but `info.version` did not increase,
  - potentially breaking/unclassified changes were made without a major bump,
  - `info.version` is missing or invalid.

Run locally:
`npm install && npm run contracts:check`

## Contract Files
- `auth/src/main/resources/contracts/auth/openapi.yaml`
- `auth/src/main/resources/contracts/auth/asyncapi.yaml`
- `profile/src/main/resources/contracts/profile/openapi.yaml`
- `profile/src/main/resources/contracts/profile/asyncapi.yaml`
- `search/src/main/resources/contracts/search/openapi.yaml`
- `search/src/main/resources/contracts/search/asyncapi.yaml`
- `staticdata/src/main/resources/contracts/staticdata/openapi.yaml`
- `messaging/src/main/resources/contracts/messaging/openapi.yaml`
- `messaging/src/main/resources/contracts/messaging/asyncapi.yaml`
- `messaging/src/main/resources/contracts/backbone/asyncapi.yaml`
- `file/src/main/resources/contracts/file/openapi.yaml`
- `file/src/main/resources/contracts/file/asyncapi.yaml`
- `notification/src/main/resources/contracts/notification/asyncapi.yaml`
- `outbox-relay/src/main/resources/contracts/outbox-relay/asyncapi.yaml`

## Consumer Usage
Use module-specific Maven artifacts from this repository, for example:

```xml
<dependency>
  <groupId>net.devstudy</groupId>
  <artifactId>resume-profile-contracts</artifactId>
  <version>0.0.1-SNAPSHOT</version>
</dependency>
```
