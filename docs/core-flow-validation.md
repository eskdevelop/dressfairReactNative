# Core Flow Validation

## Commerce Flow

1. Launch app and open `HomeWeb`.
2. Navigate to category and product pages.
3. Add a product to cart on web.
4. Continue to checkout.
5. Validate successful order redirection path.

## Auth and Session

1. Authenticate through web flow.
2. Reopen app and confirm session continuity.
3. Perform logout and verify token and web session are cleared.

## Deep Link and Push

1. Open `dressfair://web?path=/p/<slug>`.
2. Confirm target product loads in WebView.
3. Simulate push payload with `type=web_route`.
4. Confirm `NotificationRouter` opens target path.
