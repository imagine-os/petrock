import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { SitePhoto } from './SitePhoto';

const lobby = { webp: './site/img/dsc06310-{w}.webp', jpg: './site/img/dsc06310-1600.jpg', widths: [480, 960, 1600], w: 2500, h: 1667 };
const play = { webp: './site/img/dsc06450-{w}.webp', jpg: './site/img/dsc06450-1600.jpg', widths: [480, 960, 1600], w: 2500, h: 1667 };

export default defineMeta({
  tier: 'molecule', name: 'SitePhoto',
  description: 'Responsive photo for the public website: <picture> with a webp srcset, a jpg fallback, intrinsic width / height so nothing shifts, and lazy loading unless it is the hero. Takes plain paths (built by npm run site:images), so no page manifest leaks into the library.',
  props: [
    { name: 'sources', type: 'SitePhotoSources', required: true, description: '{ webp (path with {w}), jpg, widths, w, h }' },
    { name: 'alt', type: 'string', required: true, description: 'What the photo shows; empty only when purely decorative' },
    { name: 'sizes', type: 'string', default: '100vw', description: 'srcset sizes hint' },
    { name: 'priority', type: 'boolean', description: 'Eager + sync decode (hero poster)' },
    { name: 'ratio', type: 'string', description: 'Crop to this aspect ratio, e.g. "4 / 3"' },
    { name: 'className', type: 'string', description: 'is-flush (no radius), is-zoom (hover / focus zoom)' },
  ],
  states: ['natural shape', 'cropped to a ratio', 'priority (hero)', 'lazy'],
  usages: [
    { title: 'Natural shape', render: () => h(SitePhoto, { sources: lobby, alt: 'The Petrock Encino lobby', sizes: '(max-width: 700px) 100vw, 480px' }) },
    { title: 'Cropped 4 / 3', render: () => h(SitePhoto, { sources: play, alt: 'The day care play area', ratio: '4 / 3', sizes: '480px' }) },
  ],
  a11y: ['alt is required and describes the scene; decorative uses pass an empty string.', 'width / height reserve the box, so focus order and scroll position do not jump while photos load.'],
  usedBy: ['P-01', 'P-02', 'P-03', 'P-04', 'P-12', 'P-13'],
});
