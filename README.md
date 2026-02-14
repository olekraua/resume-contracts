# resume-contracts

Contract-first repository for cross-service and frontend/backend integration contracts.

## Modules
- `messaging`: REST + realtime contracts for messaging API/events.

## Build
`./mvnw -DskipTests install`

## Schema Versioning Policy
- Every `openapi.yaml` and `asyncapi.yaml` must contain `info.version` in semver format (`MAJOR.MINOR.PATCH`).
- Any schema content change requires version bump.
- Backward-compatible changes: increment `MINOR` or `PATCH`.
- Breaking or unclassified diff changes: increment `MAJOR`.
- New schema files must start with `1.0.0`.

## Backward Compatibility Check (CI)
- CI compares contract schemas with the base revision and runs:
  - OpenAPI check with `openapi-diff`
  - AsyncAPI check with `@asyncapi/diff`
- The check fails if:
  - schema changed but version did not increase,
  - potentially breaking changes were made without `MAJOR` bump,
  - `info.version` is missing/invalid.

Run locally:
`npm install && npm run contracts:check`

## Contracts
- REST OpenAPI: `messaging/src/main/resources/contracts/messaging/openapi.yaml`
- Realtime AsyncAPI: `messaging/src/main/resources/contracts/messaging/asyncapi.yaml`

## Consumer usage
Maven dependency:

```xml
<dependency>
  <groupId>net.devstudy</groupId>
  <artifactId>resume-messaging-contracts</artifactId>
  <version>0.0.1-SNAPSHOT</version>
</dependency>
```
