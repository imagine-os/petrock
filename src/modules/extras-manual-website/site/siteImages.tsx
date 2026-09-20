/**
 * The curated photo set of the public website: the client's own photography, scraped from petrockhotel.com
 * (docs/reference/petrockhotel-scrape) and turned into responsive derivatives by `npm run site:images`.
 *
 * This file is the only place that knows which slug means what. It adapts the generated manifest to the library
 * component's plain `sources` prop, carries the alt text (English and Spanish, exported as module strings under
 * `extras-manual-website.photo.<slug>` so D-206 holds for alt text too) and lists which photo is used where.
 */
import { SitePhoto as SitePhotoBase } from '../../../components/molecule/SitePhoto/SitePhoto';
import type { SitePhotoSources } from '../../../components/molecule/SitePhoto/SitePhoto';
import type { StringTable } from '../../../i18n/types';
import { useT } from '../../../i18n/I18nProvider';
import { SITE_IMAGES, SITE_IMG_BASE, SITE_LOGO } from './siteImages.generated';

export { SITE_LOGO };

/** The background video on the client's hero (sqs-video-background, https://youtu.be/htG1NJsfp24). */
export const HERO_VIDEO_ID = 'htG1NJsfp24';

/** Alt text written from the scrape's page / section context (`all_images.json`), never from the file name. */
export const PHOTO_ALT = {
  // --- Lobby, rooms and the building (home, hotel, about) ---
  'dsc06310': { en: 'The Petrock lobby: marble floor, a black road-case reception desk and a purple-lit ceiling', es: 'El lobby de Petrock: piso de mármol, recepción de cajas de gira negras y techo iluminado en morado' },
  'dsc06426': { en: 'A guest corridor painted as a mural, with a raised dog bed and food bowls', es: 'Un pasillo de habitaciones pintado como mural, con una cama elevada y platos de comida' },
  'dsc06464': { en: 'Glass-fronted guest rooms looking onto a hand-painted garden wall', es: 'Habitaciones con frente de cristal frente a un muro de jardín pintado a mano' },
  'penthouse-photo-layout': { en: 'A wall of Petrock penthouses, each with its own bed and television', es: 'Una pared de penthouses Petrock, cada uno con su cama y televisión' },
  'dsc06358': { en: 'The boutique wall in the lobby with collars, leashes and treats', es: 'La pared de la boutique en el lobby con collares, correas y premios' },
  'dsc06642': { en: 'The Petrock lobby in the evening under its chandelier', es: 'El lobby de Petrock por la tarde bajo su candelabro' },
  // --- Spa ---
  'grooming': { en: 'The grooming station: a stainless bath, folded towels and the shampoo shelf', es: 'La estación de estética: tina de acero inoxidable, toallas dobladas y el estante de shampoos' },
  'dsc06483': { en: 'A spa room with a round bed and a television under the Petrock Hotel & Spa sign', es: 'Una sala de spa con cama redonda y televisión bajo el letrero de Petrock Hotel & Spa' },
  'dsc06592': { en: 'A terrier being washed in the stainless spa bath', es: 'Un terrier siendo bañado en la tina de spa de acero inoxidable' },
  'dsc06504': { en: 'A groomer holding a freshly bathed pit bull', es: 'Una estilista sosteniendo a un pit bull recién bañado' },
  // --- Play / day care ---
  'dsc06450': { en: 'The day care play area with its jungle-gym ramps and painted pool mural', es: 'El área de juego de day care con sus rampas de gimnasio y el mural de la alberca' },
  'dsc06434': { en: 'Dogs playing on the green and pink jungle gym in the day care area', es: 'Perros jugando en el gimnasio verde y rosa del área de day care' },
  // --- Training & fitness ---
  'dsc06382': { en: 'A Doberman waiting on the training platform in front of the music-themed wall', es: 'Un dóberman esperando en la plataforma de entrenamiento frente al muro temático musical' },
  // --- Hotel gallery (petrockhotel.com/petrock-gallery) ---
  'img-8944': { en: 'An English bulldog stretched out on the grass', es: 'Un bulldog inglés estirado en el pasto' },
  'img-1861': { en: 'A big fluffy guest on the lead in the lobby', es: 'Un huésped grande y peludo con correa en el lobby' },
  'img-1901': { en: 'Two Akitas in matching bandanas waiting together', es: 'Dos akitas con bandanas a juego esperando juntos' },
  'img-2234': { en: 'A puppy with a bow sitting politely on the tiles', es: 'Un cachorro con moño sentado educadamente sobre el piso' },
  'img-2291': { en: 'A guest posing in front of the flowering bushes outside', es: 'Un huésped posando frente a los arbustos en flor de afuera' },
  'img-2341': { en: 'A white Samoyed smiling in the garden', es: 'Un samoyedo blanco sonriendo en el jardín' },
  'img-2349': { en: 'An apricot doodle on a walk on its red lead', es: 'Un doodle albaricoque de paseo con su correa roja' },
  'img-2490': { en: 'A white Pomeranian in a checked bandana on a blanket', es: 'Un pomerania blanco con bandana de cuadros sobre una manta' },
  'img-2600': { en: 'A German shepherd sitting in front of the Petrock storefront', es: 'Un pastor alemán sentado frente a la fachada de Petrock' },
  'img-2611': { en: 'Three dogs outside the Petrock storefront in the evening', es: 'Tres perros afuera de la fachada de Petrock por la tarde' },
  'img-2677': { en: 'A German shepherd beside the pink holiday tree in the lobby', es: 'Un pastor alemán junto al árbol navideño rosa del lobby' },
  'img-3323': { en: 'A tabby cat having a bath at the spa (we groom cats too)', es: 'Un gato atigrado en su baño en el spa (también atendemos gatos)' },
  'img-4363': { en: 'A small dog on the pavement under the Petrock sign', es: 'Un perro pequeño en la banqueta bajo el letrero de Petrock' },
  'img-4475': { en: 'Two shelties waiting together outside the front door', es: 'Dos shelties esperando juntos afuera de la puerta principal' },
  'img-4643': { en: 'A doodle curled up on the black lobby sofa', es: 'Un doodle acurrucado en el sofá negro del lobby' },
  'img-4949': { en: 'An apricot doodle standing on the pink play mat', es: 'Un doodle albaricoque de pie sobre el tapete rosa de juego' },
  'img-2145': { en: 'A chocolate Doberman resting on the cool lobby floor', es: 'Un dóberman chocolate descansando en el piso fresco del lobby' },
  'img-2146': { en: 'A husky, a French bulldog and friends in the play area', es: 'Un husky, un bulldog francés y sus amigos en el área de juego' },
  'img-2147': { en: 'A white Pomeranian in the mural suite', es: 'Un pomerania blanco en la suite del mural' },
  'img-2148': { en: 'An Irish setter up on the play-area gym', es: 'Un setter irlandés sobre el gimnasio del área de juego' },
  'img-2149': { en: 'A Pomeranian in a harness among the autumn decorations', es: 'Un pomerania con arnés entre las decoraciones de otoño' },
  'img-2150': { en: 'A bulldog posing with the Halloween decorations', es: 'Un bulldog posando con las decoraciones de Halloween' },
  // --- Spa gallery (petrockhotel.com/spa-gallery) ---
  'img-3110': { en: 'A large doodle standing on the grooming table after a full groom', es: 'Un doodle grande de pie sobre la mesa de estética tras un corte completo' },
  'img-3109': { en: 'A doodle in a bandana just out of the salon', es: 'Un doodle con bandana recién salido del salón' },
  'img-1714': { en: 'A schnauzer freshly clipped in front of the holiday backdrop', es: 'Un schnauzer recién rasurado frente al fondo navideño' },
  'img-3111': { en: 'An apricot poodle with a round face trim and a bandana', es: 'Un poodle albaricoque con la cara redondeada y bandana' },
  'fullsizerender': { en: 'An apricot poodle in a bow tie after a Diamond groom', es: 'Un poodle albaricoque con corbatín después de un corte Diamond' },
  'img-8163': { en: 'A small dog looking up from the salon floor', es: 'Un perro pequeño mirando hacia arriba desde el piso del salón' },
  'img-3114': { en: 'An apricot poodle photographed outside after its groom', es: 'Un poodle albaricoque fotografiado afuera después de su estética' },
  'img-3113': { en: 'A white Maltese with a round puppy cut', es: 'Un maltés blanco con corte de cachorro redondeado' },
  'img-1713': { en: 'A schnauzer in a bandana against the blue holiday backdrop', es: 'Un schnauzer con bandana ante el fondo navideño azul' },
  'img-8675': { en: 'A red toy poodle in a bandana after a Platinum groom', es: 'Un poodle toy rojizo con bandana después de un corte Platinum' },
  'img-1712': { en: 'A schnauzer standing on the tiled salon floor after a trim', es: 'Un schnauzer de pie en el piso del salón después de su corte' },
  'img-0063': { en: 'A dog with purple creative colour on the grooming table', es: 'Un perro con color morado creativo en la mesa de estética' },
} as const satisfies Record<string, { en: string; es: string }>;

export type PhotoSlug = keyof typeof PHOTO_ALT;

/** Where each photo is used, so a future pass can see what would break before it swaps one out. */
export const PHOTO_USE: Record<string, PhotoSlug[]> = {
  'P-01 hero (poster under the video)': ['dsc06310'],
  'P-01 service tiles': ['dsc06426', 'grooming', 'dsc06450'],
  'P-01 training & fitness': ['dsc06382'],
  'P-01 why Petrock': ['dsc06464'],
  'P-01 photo strip': ['img-2611', 'img-2146', 'img-2341', 'img-3110', 'dsc06434', 'img-2148', 'img-8944', 'img-2150'],
  'P-02 hotel rooms': ['penthouse-photo-layout', 'dsc06426', 'dsc06464'],
  'P-03 grooming': ['grooming', 'dsc06592', 'img-3110'],
  'P-04 daycare': ['dsc06450', 'dsc06434'],
  'P-12 about': ['dsc06358', 'dsc06642'],
  'P-13 gallery': ['dsc06483', 'dsc06504'],
};

/** The string key that holds a photo's alt text; pages use it for captions too. */
export const photoAltKey = (slug: PhotoSlug) => `extras-manual-website.photo.${slug}`;

/** Alt text as module strings, so every photo's accessible name goes through useT() like any other string (D-206). */
export const photoStrings: StringTable = Object.fromEntries(Object.entries(PHOTO_ALT).map(([slug, v]) => [photoAltKey(slug as PhotoSlug), v]));

/** Manifest entry -> the library component's plain `sources` prop. */
export function photoSources(slug: PhotoSlug): SitePhotoSources | null {
  const m = SITE_IMAGES[slug];
  return m ? { webp: `${SITE_IMG_BASE}${slug}-{w}.webp`, jpg: m.jpg, widths: m.widths, w: m.w, h: m.h } : null;
}

export interface SitePhotoProps {
  slug: PhotoSlug;
  /** Overrides the curated alt text (already translated); pass '' for a purely decorative use. */
  alt?: string;
  sizes?: string;
  priority?: boolean;
  ratio?: string;
  className?: string;
}

/** The website's photo: looks the slug up in the generated manifest and the alt text in the string table. */
export function SitePhoto({ slug, alt, sizes, priority, ratio, className }: SitePhotoProps) {
  const t = useT();
  const sources = photoSources(slug);
  if (!sources) return null;
  return <SitePhotoBase sources={sources} alt={alt ?? t(photoAltKey(slug))} sizes={sizes} priority={priority} ratio={ratio} className={className} />;
}

/** The two galleries of petrockhotel.com, in the order the client shows them (P-13). */
export const HOTEL_GALLERY: PhotoSlug[] = ['img-8944', 'img-1861', 'img-1901', 'img-2234', 'img-2291', 'img-2341', 'img-2349', 'img-2490', 'img-2600', 'img-2611', 'img-2677', 'img-3323', 'img-4363', 'img-4475', 'img-4643', 'img-4949', 'dsc06358', 'dsc06504', 'dsc06483', 'dsc06382', 'dsc06592', 'dsc06642', 'img-2150', 'img-2149', 'img-2148', 'img-2147', 'img-2146', 'img-2145'];
export const SPA_GALLERY: PhotoSlug[] = ['img-3110', 'img-3109', 'img-1714', 'img-3111', 'fullsizerender', 'img-8163', 'img-3114', 'img-3113', 'img-1713', 'img-8675', 'img-1712', 'img-0063'];
/** The strip on the home page that links into P-13. */
export const HOME_STRIP: PhotoSlug[] = ['img-2611', 'img-2146', 'img-2341', 'img-3110', 'dsc06434', 'img-2148', 'img-8944', 'img-2150'];
