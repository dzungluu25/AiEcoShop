Title: Interactive Buttons – Implementation Notes

Design system
- Uses `Button` from UI library for consistent styling, hover, focus and disabled states
- Icon buttons use `size="icon"` and accessible `aria-label`

Accessibility
- All actionable buttons include `aria-label` where the label might be ambiguous
- Keyboard navigation supported; dropdowns and inputs respond to `Enter`, `Escape`, arrow keys

Loading/disabled
- Add to cart, review submit, OAuth, coupon apply and AI chat send use loading flags to prevent duplicate actions
- Visual Search shows “Uploading…” and disables upload during processing

Error handling
- Toast messages communicate failures (auth, coupon, image processing)
- Server coupon errors are surfaced: not found, expired, min-not-met, ineligible, unauthorized, already-used

Performance
- Debounce search input; avoid repeated API calls during typing
- Defer heavy operations (camera, image processing) and show progress states

Edge cases
- Visual Search camera permission denied → fallback to upload
- Coupon application as guest uses provided items; as user uses server cart unless items provided
- Facebook profile may not include email; fallback alias is generated

Limitations
- Frontend test coverage is minimal; consider adding component tests for interactive states
- Mobile camera capture depends on browser support

