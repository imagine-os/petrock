import { useCallback, useEffect, useState } from 'react';
import { useT } from '../../../i18n/I18nProvider';
import { SiteLayout } from '../../../components/template/SiteLayout/SiteLayout';
import { SiteHero } from '../../../components/molecule/SiteHero/SiteHero';
import { Modal } from '../../../components/organism/Modal/Modal';
import { IconButton } from '../../../components/atom/IconButton/IconButton';
import { SectionHead, CtaBand } from './siteBits';
import { HOTEL_GALLERY, SPA_GALLERY, SitePhoto, photoAltKey, type PhotoSlug } from './siteImages';

const K = 'extras-manual-website.site';
const SECTIONS: { key: 'hotel' | 'spa'; slugs: PhotoSlug[]; offset: number }[] = [{ key: 'hotel', slugs: HOTEL_GALLERY, offset: 0 }, { key: 'spa', slugs: SPA_GALLERY, offset: HOTEL_GALLERY.length }];
const ALL: PhotoSlug[] = [...HOTEL_GALLERY, ...SPA_GALLERY];

/** P-13 Gallery: the client's two photo galleries (petrock-gallery and spa-gallery) with a keyboard-driven lightbox. */
export function SiteGallery() {
  const t = useT();
  const [at, setAt] = useState<number | null>(null);
  const step = useCallback((d: number) => setAt((i) => (i == null ? null : (i + d + ALL.length) % ALL.length)), []);
  useEffect(() => {
    if (at == null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [at, step]);
  const current = at == null ? null : ALL[at];
  return (
    <SiteLayout>
      <SiteHero tone="soft" compact eyebrow={t(`${K}.gallery.eyebrow`)} title={t(`${K}.gallery.title`)} lead={t(`${K}.gallery.lead`)} />
      <div className="container ps">
        {SECTIONS.map((s) => (
          <section key={s.key} className="ps-section" id={s.key}>
            <SectionHead title={t(`${K}.gallery.${s.key}Title`)} lead={t(`${K}.gallery.${s.key}Lead`)} />
            <div className="ps-gal">
              {s.slugs.map((slug, i) => {
                const index = s.offset + i;
                return (
                  <button key={slug} type="button" className="ps-gal-item" onClick={() => setAt(index)} aria-label={t(`${K}.gallery.open`, { n: index + 1, total: ALL.length })}>
                    <SitePhoto slug={slug} ratio="1 / 1" className="is-zoom" sizes="(max-width: 560px) 45vw, (max-width: 1280px) 30vw, 300px" />
                  </button>
                );
              })}
            </div>
          </section>
        ))}
        <p className="ps-inline-note">{t(`${K}.gallery.tour`)}</p>
        <CtaBand />
      </div>
      <Modal open={current != null} onClose={() => setAt(null)} size="lg" title={current ? t(photoAltKey(current)) : undefined}>
        {current && (
          <div className="ps-lightbox">
            <SitePhoto slug={current} sizes="(max-width: 900px) 92vw, 900px" />
            <div className="ps-lightbox-bar">
              <IconButton icon="arrow-left" label={t(`${K}.gallery.prev`)} variant="outline" onClick={() => step(-1)} />
              <span className="ps-lightbox-cap">{t(`${K}.gallery.counter`, { n: (at ?? 0) + 1, total: ALL.length })}</span>
              <IconButton icon="arrow-right" label={t(`${K}.gallery.next`)} variant="outline" onClick={() => step(1)} />
            </div>
          </div>
        )}
      </Modal>
    </SiteLayout>
  );
}
