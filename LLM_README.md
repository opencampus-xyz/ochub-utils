# @opencampus/ochub-utils

Package: @opencampus/ochub-utils v0.1.0
Language: TypeScript | Output: CommonJS + ESM + .d.ts | License: MIT

## EXPORTS

```typescript
// Main: @opencampus/ochub-utils
export { OCAnalytics } from "./analytics";
export {
  getInstance,
  OCAccount,
  type AuthState,
  type AccountConfig,
  type AuthStateSubscriber,
} from "./account";
```

---

## ACCOUNT MODULE

File: src/account/index.ts
Dependency: @opencampus/ocid-connect-js ^1.0.0

### Types

```typescript
interface AccountConfig {
  opts?: Record<string, any>;
  sandboxMode?: boolean;
}
interface AuthState {
  OCId?: string;
  ethAddress?: string;
  [key: string]: any;
}
type AuthStateSubscriber = (authState: AuthState) => void;
```

### getInstance(config?: AccountConfig): OCAccount

Singleton factory. First call creates instance with config; subsequent calls return same instance (config ignored).

### OCAccount Methods

| Method           | Signature                 | Returns             | Description                                  |
| ---------------- | ------------------------- | ------------------- | -------------------------------------------- |
| getAuthState     | ()                        | AuthState           | Current auth state copy                      |
| getOCId          | ()                        | string \| undefined | User's Open Campus ID                        |
| getEthAddress    | ()                        | string \| undefined | User's Ethereum address                      |
| isAuthenticated  | ()                        | boolean             | true if OCId exists                          |
| isSDKInitialized | ()                        | boolean             | SDK init status                              |
| subscribe        | (cb: AuthStateSubscriber) | () => void          | Subscribe to changes; returns unsubscribe fn |
| getSDKInstance   | ()                        | any                 | Raw SDK instance (advanced)                  |

### Usage

```typescript
import { getInstance } from "@opencampus/ochub-utils";
const account = getInstance({ sandboxMode: false });
if (account.isAuthenticated()) console.log(account.getOCId());
const unsub = account.subscribe((state) => console.log(state));
unsub(); // cleanup
```

---

## ANALYTICS MODULE

File: src/analytics/index.ts
No dependencies (GTM loaded from CDN)

### Types

```typescript
interface GTMConfig {
  containerId: string;
}
interface TrackingParams {
  [key: string]: any;
}
```

### OCAnalytics Static Methods

| Method      | Signature                                           | Description                                       |
| ----------- | --------------------------------------------------- | ------------------------------------------------- |
| initialize  | (appName: string, config: GTMConfig) => OCAnalytics | Create singleton, load GTM script                 |
| getInstance | () => OCAnalytics                                   | Get existing instance (throws if not initialized) |

### OCAnalytics Instance Methods

| Method     | Signature                                           | Description                |
| ---------- | --------------------------------------------------- | -------------------------- |
| trackEvent | (eventName: string, params: TrackingParams) => void | Push event to dataLayer    |
| setUserId  | (userId: string) => void                            | Push user_identified event |

### dataLayer Format

```typescript
// trackEvent pushes:
{ event: 'app_event', app_name: appName, event_name: eventName, event_payload: params }

// setUserId pushes:
{ event: 'user_identified', user_id: userId, timestamp: ISOString }
```

### Usage

```typescript
import { OCAnalytics } from "@opencampus/ochub-utils";
OCAnalytics.initialize("my-app", { containerId: "GTM-XXXXXXX" });
const analytics = OCAnalytics.getInstance();
analytics.trackEvent("signup", { method: "email" });
analytics.setUserId("user123");
```

---

## INTEGRATION PATTERN

```typescript
import { getInstance, OCAnalytics } from "@opencampus/ochub-utils";

const account = getInstance({ sandboxMode: false });
OCAnalytics.initialize("my-app", { containerId: "GTM-XXX" });
const analytics = OCAnalytics.getInstance();

account.subscribe((state) => {
  if (state.OCId) {
    analytics.setUserId(state.OCId);
    analytics.trackEvent("user_authenticated", { ocid: state.OCId });
  }
});
```

---

## ENVIRONMENT

- Browser-only: Both modules check `typeof window === 'undefined'` and warn/skip if SSR
- Singletons: One instance per module per app
- Errors: Logged to console, no exceptions thrown from public methods (except getInstance before initialize)

## BUILD

```
dist/
├── index.{js,d.ts}
├── account/index.{js,d.ts}
└── analytics/index.{js,d.ts}
```

Scripts: `npm run build` (tsc) | `npm run dev` (watch) | `npm run typecheck`
