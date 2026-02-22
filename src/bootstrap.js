// Explicit initialization order for side-effect modules.
// Importing this ensures all global utilities are ready before any UI code runs.
// - a11y, mediaResolver, imagePanZoom: register backward-compatible window.* globals
// - imageLightbox: registers document-level event listeners for [data-lightbox]
// After full migration to ES modules is complete and window.* references are removed,
// this file can be replaced by direct imports in each consuming module.
import './utils/a11y.js';
import './utils/mediaResolver.js';
import './modules/imageLightboxState.js';
import './modules/imagePanZoom.js';
import './ui/imageLightbox.js';
