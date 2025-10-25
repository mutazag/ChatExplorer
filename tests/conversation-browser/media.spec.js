import { test, assert } from '../lib/harness.js';
import { classifyMediaByExtOrMime, isSafeSrc } from '../../src/utils/media.js';
import { renderDetail } from '../../src/ui/detailView.js';

test('media utils: classify by mime and extension', () => {
  assert(classifyMediaByExtOrMime('x.png') === 'image', 'png -> image');
  assert(classifyMediaByExtOrMime('x.JPG') === 'image', 'jpg ext case-insensitive');
  assert(classifyMediaByExtOrMime('track.mp3') === 'audio', 'mp3 -> audio');
  assert(classifyMediaByExtOrMime('clip.webm') === 'video', 'webm -> video');
  assert(classifyMediaByExtOrMime('file.bin', 'audio/wav') === 'audio', 'mime wins over ext');
  assert(classifyMediaByExtOrMime('file.unknown') === 'other', 'unknown -> other');
});

test('media utils: safe src filtering', () => {
  assert(isSafeSrc('https://example.com/a.png') === true, 'https allowed');
  assert(isSafeSrc('/assets/img.png') === true, 'relative allowed');
  assert(isSafeSrc('data:image/png;base64,AAAA') === true, 'data:image allowed');
  assert(isSafeSrc('data:text/html;base64,AAAA') === false, 'data:text not allowed');
  assert(isSafeSrc('javascript:alert(1)') === false, 'javascript: blocked');
  assert(isSafeSrc('blob:abc') === false, 'blob: blocked');
});

test('detailView: renders inline media elements', () => {
  const host = document.createElement('div');
  const convo = {
    id: 'c-media',
    messages: [
      {
        role: 'assistant',
        create_time: 1000,
        text: 'Here is an image and audio',
        media: [
          { kind: 'image', src: 'data:image/gif;base64,R0lGODdhAQABAIAAAAUEBA==', alt: 'pixel' },
          { kind: 'audio', src: 'https://example.com/test.mp3', mime: 'audio/mpeg' },
        ],
      },
      {
        role: 'assistant',
        create_time: 2000,
        text: 'And a video',
        media: [ { kind: 'video', src: 'https://example.com/clip.webm', mime: 'video/webm' } ],
      }
    ]
  };
  renderDetail(host, convo);
  const mediaBlocks = host.querySelectorAll('.msg-media');
  assert(mediaBlocks.length === 2, 'two media blocks rendered');
  const img = host.querySelector('.msg-media img');
  assert(img && img.getAttribute('alt') === 'pixel', 'image with alt');
  const audio = host.querySelector('.msg-media audio');
  assert(audio && audio.controls === true, 'audio with controls');
  const video = host.querySelector('.msg-media video');
  assert(video && video.controls === true, 'video with controls');
});
