# @opencampus/ochub-utils

Open Campus Hub utilities library providing analytics and account management modules.

## Installation

```bash
npm install @opencampus/ochub-utils
```

## Usage

### Analytics Module

```typescript
import { OCAnalytics } from "@opencampus/ochub-utils";

// Initialize with app name and GTM container ID (no secrets exposed!)
OCAnalytics.initialize("my-app", {
  containerId: "GTM-XXXXXXXXX",
});

// Get the instance and track events
const analytics = OCAnalytics.getInstance();

// Track a custom event
// Pushes: { event: 'app_event', app_name, event_name, event_payload: {...} }
analytics.trackEvent("user_signup", {
  signup_method: "email",
  user_age: 25,
});

// Set user ID for tracking
analytics.setUserId("user123");
```

**Note:** GTM is the recommended approach for frontend tracking as it doesn't require exposing API secrets or measurement IDs directly in code. All events are pushed to the GTM data layer, which can be configured securely in the GTM console.

### Account Module

```typescript
import { getInstance } from "@opencampus/ochub-utils";

// Get the module-level singleton instance (instantiates only once)
const account = getInstance({
  sandboxMode: false, // Set to true for sandbox/test mode
  opts: {
    // OCID Connect options here
  },
});

// Subsequent calls return the same instance, config is ignored
const accountAgain = getInstance(); // Returns same instance

// Subscribe to authentication state changes
const unsubscribe = account.subscribe((authState) => {
  console.log("Auth state updated:", authState);
});

// Access authentication state
if (account.isAuthenticated()) {
  const ocId = account.getOCId();
  const ethAddress = account.getEthAddress();
  const authState = account.getAuthState();

  // Access JWT tokens
  const idToken = account.getIdToken();
  const accessToken = account.getAccessToken();
}

// Check SDK initialization status
if (account.isSDKInitialized()) {
  console.log("OCID SDK is ready");
}

// Unsubscribe when done
unsubscribe();
```

**Note:**

- `getInstance()` is a module-level singleton function - instantiates only once
- Configuration is only used on first instantiation
- It's read-only for accessing authentication state
- Connection management is handled by the OCID Connect component in your application

## Modules

- **analytics** - Google Tag Manager integration for frontend tracking
  - `OCAnalytics` - Singleton class for tracking custom events
  - Secure frontend tracking without exposing API secrets
  - App name set once at initialization, included in all events
  - Supports custom event parameters
  - Automatic GTM script injection and data layer management
- **account** - Account and user management utilities
  - `OCAccount` - Singleton class for OCID Connect SDK management
  - Authentication state management with subscription support
  - Support for sandbox and live modes
  - Access to OCId, Ethereum address, and JWT tokens (idToken, accessToken)

## License

MIT
