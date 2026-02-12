# resume-contracts

Contract-first repository for cross-service and frontend/backend integration contracts.

## Modules
- `messaging`: REST + realtime contracts for messaging API/events.

## Build
`./mvnw -DskipTests install`

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
