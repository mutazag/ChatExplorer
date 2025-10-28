# Quickstart: Image pop-out (local testing)

## Setup

1. Open `index.html` in a modern browser (Chrome recommended for development).
2. Load sample conversations that include images via the existing `data/` folder or open a dataset export.

## How to test the feature

1. Locate a conversation containing an inline image in the conversation browser.
2. Click the image (or focus it and press Enter) to open the pop-out/lightbox.
3. Verify the image fits the viewport initially.
4. Use the on-screen zoom controls, mouse wheel (with Ctrl on some platforms), or pinch gestures to zoom.
5. When zoomed, drag to pan the image and verify the image moves smoothly.
6. Click outside the image (on the overlay) or press ESC to close the pop-out and ensure focus is restored.

### Video and audio pop-out

1. For inline videos, click the video (or focus + Enter) to open the pop-out with a proportional player. The player uses native controls and does not auto-play. Press ESC or click the overlay to close and restore focus.
2. For inline audio, click the audio (or focus + Enter) to open the pop-out with a centered audio control sized to clamp(320px, 60vw, 640px). Use native controls to play/pause.
3. Keyboard: ESC to close; Tab cycles within the pop-out; for images only, use + / - to zoom, and 0 to reset.

## Running tests

- Unit tests: run Mocha in-browser tests by opening the test harness at `tests/index.html` (feature tests to be added under `tests/unit/`).
- Integration/manual tests: follow the steps above on desktop and mobile browsers.

## Troubleshooting

- If images do not open, check console for errors and verify resolved `src` URLs conform to allowed schemes (http(s), relative, data:image/*).
- For gesture testing, use a device or browser emulator that supports touch events.
