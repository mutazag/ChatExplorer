// Explicit initialization order for side-effect modules.
// Importing this ensures all global utilities are ready before any UI code runs.
// After full H2 migration is complete and window.* references are removed,
// this file can be replaced by direct imports in each consuming module.
import './utils/a11y.js';
import './utils/mediaResolver.js';
import './modules/imageLightboxState.js';
import './modules/imagePanZoom.js';
import './ui/imageLightbox.js';
