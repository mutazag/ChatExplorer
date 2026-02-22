// Single source of truth for CSS class names referenced in JavaScript.
// Rename a class here and the change propagates to all JS consumers automatically.
export const CSS = {
  // Message rows
  MSG: 'msg',
  MSG_USER: 'msg--user',
  MSG_ASSISTANT: 'msg--assistant',
  MSG_HEADER: 'msg-header',
  IS_TAPPED: 'is-tapped',

  // Bubbles
  BUBBLE: 'bubble',
  BUBBLE_MEDIA_ONLY: 'bubble--media-only',

  // Timestamps
  TIMESTAMP: 'timestamp',

  // Media
  MSG_MEDIA: 'msg-media',
  MEDIA_WITH_EXPAND: 'media-with-expand',
  MEDIA_EXPAND_BTN: 'media-expand-btn',
  MEDIA_FALLBACK: 'media-fallback',

  // Lightbox
  LIGHTBOX_OVERLAY: 'image-lightbox',
  LIGHTBOX_IMG: 'image-lightbox__img',
  LIGHTBOX_VIDEO_WRAP: 'image-lightbox__videoWrap',
  LIGHTBOX_VIDEO: 'image-lightbox__video',
  LIGHTBOX_AUDIO_WRAP: 'image-lightbox__audioWrap',
  LIGHTBOX_AUDIO: 'image-lightbox__audio',
  LIGHTBOX_CONTROLS: 'image-lightbox__controls',

  // Mobile
  MOBILE_LIST: 'mobile-list',
  SHOW_LEFT: 'show-left',

  // Layout
  IS_PANE_HIDDEN: 'is-pane-hidden',
  IS_ACTIVE: 'is-active',
  IS_RTL: 'is-rtl',

  // List/Dataset
  LIST_ITEM: 'list-item',
  DATASET_LIST: 'dataset-list',
  DATASET_ITEM: 'dataset-item',
};
