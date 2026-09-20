/**
 * Public-website copy (P-01..P-13). The English is the client's own wording from petrockhotel.com
 * (docs/reference/petrockhotel-scrape/pages/home.md), tightened but never invented; the Spanish is a real
 * translation, not a placeholder. Prices never appear here - they come from the tables (R-X71).
 */
import type { StringTable } from '../../../i18n/types';

const K = 'extras-manual-website.site';

export const siteStrings: StringTable = {
  // ---- P-01 hero ----
  [`${K}.hero.eyebrow`]: { en: 'Petrock Hotel & Spa · Encino & Westwood, Los Angeles', es: 'Petrock Hotel & Spa · Encino y Westwood, Los Ángeles' },
  [`${K}.hero.subhead`]: { en: 'Hotel · Grooming & Spa · Day care · Training', es: 'Hotel · Estética y Spa · Guardería · Entrenamiento' },
  [`${K}.hero.lead`]: { en: 'Established in 2011. A boutique, all-inclusive dog hotel with music-themed penthouses and suites, room service, playtime and walks through the day — and pictures and videos of your dog every day of their stay.', es: 'Desde 2011. Un hotel canino boutique todo incluido con penthouses y suites temáticas de música, servicio a la habitación, tiempo de juego y paseos durante el día, y fotos y videos de tu perro todos los días de su estancia.' },
  [`${K}.hero.book`]: { en: 'Book now', es: 'Reservar' },
  [`${K}.hero.call`]: { en: 'Call {name}', es: 'Llamar a {name}' },
  [`${K}.hero.playVideo`]: { en: 'Play video', es: 'Reproducir video' },
  [`${K}.hero.pauseVideo`]: { en: 'Pause video', es: 'Pausar video' },

  // ---- P-01 open-now strip ----
  [`${K}.openNow.label`]: { en: 'Open right now?', es: '¿Abierto ahora?' },
  [`${K}.openNow.open`]: { en: 'Open', es: 'Abierto' },
  [`${K}.openNow.closed`]: { en: 'Closed', es: 'Cerrado' },
  [`${K}.openNow.link`]: { en: 'Hours, addresses and phones', es: 'Horarios, direcciones y teléfonos' },

  // ---- P-01 services ----
  [`${K}.services.eyebrow`]: { en: 'Services', es: 'Servicios' },
  [`${K}.services.title`]: { en: 'Hotel, Spa and Play', es: 'Hotel, Spa y Play' },
  [`${K}.services.lead`]: { en: 'Pure luxury with the most elaborate accommodations in the pet industry. Prices are live from our own price list; your exact quote appears in the app before you pay.', es: 'Puro lujo con las instalaciones más elaboradas de la industria. Los precios vienen en vivo de nuestra lista; tu cotización exacta aparece en la app antes de pagar.' },
  [`${K}.services.hotel.title`]: { en: 'Hotel', es: 'Hotel' },
  [`${K}.services.hotel.body`]: { en: 'Cozy accommodations in our luxurious music-themed penthouses and suites. All-inclusive: room service, playtime, walks through the day, one-on-one time, and videos, pictures and reports every night.', es: 'Alojamiento cómodo en nuestros lujosos penthouses y suites temáticas de música. Todo incluido: servicio a la habitación, tiempo de juego, paseos durante el día, atención uno a uno y videos, fotos y reportes cada noche.' },
  [`${K}.services.spa.title`]: { en: 'Grooming & Spa', es: 'Estética y Spa' },
  [`${K}.services.spa.body`]: { en: 'The best stylists and groomers in the industry: spa bath, blow dry, brush out, teeth brushing and a paw massage, plus deep cleaning, conditioning, purebred cuts and specialty services.', es: 'Los mejores estilistas de la industria: baño de spa, secado, cepillado, limpieza de dientes y masaje de patas, además de limpieza profunda, acondicionamiento, cortes de raza y servicios especiales.' },
  [`${K}.services.daycare.title`]: { en: 'Day care', es: 'Guardería' },
  [`${K}.services.daycare.body`]: { en: 'Play is our day care area, where dogs interact, exercise, socialize and learn good social skills with our “pack leader” attendant, on an interactive jungle gym and floors built for their joints.', es: 'Play es nuestra área de guardería, donde los perros conviven, hacen ejercicio, socializan y aprenden buenos modales con nuestro cuidador “líder de la manada”, en un gimnasio interactivo y pisos diseñados para sus articulaciones.' },
  [`${K}.services.learnMore`]: { en: 'Learn more', es: 'Saber más' },
  [`${K}.services.perNight`]: { en: '/ night', es: '/ noche' },
  [`${K}.services.perDay`]: { en: '/ day', es: '/ día' },

  // ---- P-01 training & fitness ----
  [`${K}.training.eyebrow`]: { en: 'Training & Fitness', es: 'Entrenamiento y acondicionamiento' },
  [`${K}.training.title`]: { en: 'Private training, seminars and agility', es: 'Entrenamiento privado, seminarios y agility' },
  [`${K}.training.lead`]: { en: 'Top-notch private dog training: puppy, intermediate and advanced courses, clicker work, training seminars, agility courses and a Canine Good Citizen course. Please call to set up a consultation.', es: 'Entrenamiento privado de primer nivel: cursos para cachorro, intermedio y avanzado, trabajo con clicker, seminarios, cursos de agility y el curso Canine Good Citizen. Llámanos para agendar una consulta.' },
  [`${K}.training.item1`]: { en: 'Private personal training: puppy, intermediate, advanced and clicker courses', es: 'Entrenamiento personal privado: cursos de cachorro, intermedio, avanzado y clicker' },
  [`${K}.training.item2`]: { en: 'Seminars for one issue at a time: loose-leash walking, potty training, crate training, wait and leave it', es: 'Seminarios para un solo tema: caminar con correa floja, control de esfínteres, entrenamiento en jaula, esperar y soltar' },
  [`${K}.training.item3`]: { en: 'Agility courses by the hour or as a full course', es: 'Cursos de agility por hora o como curso completo' },
  [`${K}.training.item4`]: { en: 'Puppy and adult consultations with our trainer, starter kit included', es: 'Consultas para cachorro y adulto con nuestro entrenador, con kit de inicio' },
  [`${K}.training.cta`]: { en: 'Call to set up a consultation', es: 'Llama para agendar una consulta' },
  [`${K}.training.note`]: { en: 'Training is booked by phone; ask the front desk for the current course and seminar rates.', es: 'El entrenamiento se agenda por teléfono; pregunta en recepción por las tarifas vigentes de cursos y seminarios.' },

  // ---- P-01 why Petrock ----
  [`${K}.why.eyebrow`]: { en: 'Why Petrock', es: 'Por qué Petrock' },
  [`${K}.why.title`]: { en: 'A boutique hotel that caters to your pet', es: 'Un hotel boutique que atiende a tu mascota' },
  [`${K}.why.lead`]: { en: 'Some pets want more time with people, some prefer other dogs and find their best friend for life, and some need a belly rub before dinner. Whatever your pet enjoys, we provide it — and we keep track of their health and well-being every single day.', es: 'Algunas mascotas quieren más tiempo con personas, otras prefieren otros perros y encuentran a su mejor amigo, y algunas necesitan que les sobes la panza antes de cenar. Le damos a tu mascota lo que disfruta, y cuidamos su salud y bienestar todos los días.' },
  [`${K}.why.item1`]: { en: 'Vaccine verification required for every pet', es: 'Verificación de vacunas obligatoria para toda mascota' },
  [`${K}.why.item2`]: { en: 'Room service, playtime and walks through the day', es: 'Servicio a la habitación, juego y paseos durante el día' },
  [`${K}.why.item3`]: { en: 'If they will not eat, we join them as a dinner guest and hand feed', es: 'Si no quieren comer, los acompañamos a cenar y les damos de comer a mano' },
  [`${K}.why.item4`]: { en: 'We watch skin, coat, eyes, ears and bathroom habits daily', es: 'Revisamos piel, pelaje, ojos, oídos y hábitos de baño a diario' },
  [`${K}.why.item5`]: { en: 'Senior pets, diabetic pets and pets on medication welcome', es: 'Bienvenidas las mascotas mayores, diabéticas y con medicamentos' },
  [`${K}.why.item6`]: { en: 'Pictures and videos every day of the stay', es: 'Fotos y videos todos los días de la estancia' },

  // ---- P-01 / P-13 gallery ----
  [`${K}.gallery.eyebrow`]: { en: 'Gallery', es: 'Galería' },
  [`${K}.gallery.title`]: { en: 'Our guests', es: 'Nuestros huéspedes' },
  [`${K}.gallery.lead`]: { en: 'Photos from both houses: the lobby, the rooms, the play area and a lot of very good dogs on their way home from the spa.', es: 'Fotos de nuestras dos casas: el lobby, las habitaciones, el área de juego y muchos perros muy buenos de camino a casa después del spa.' },
  [`${K}.gallery.cta`]: { en: 'See the full gallery', es: 'Ver la galería completa' },
  [`${K}.gallery.hotelTitle`]: { en: 'Hotel', es: 'Hotel' },
  [`${K}.gallery.hotelLead`]: { en: 'The building, the rooms, the play area and our guests.', es: 'El edificio, las habitaciones, el área de juego y nuestros huéspedes.' },
  [`${K}.gallery.spaTitle`]: { en: 'Spa', es: 'Spa' },
  [`${K}.gallery.spaLead`]: { en: 'Fresh out of the Gold, Platinum and Diamond packages.', es: 'Recién salidos de los paquetes Gold, Platinum y Diamond.' },
  [`${K}.gallery.open`]: { en: 'Open photo {n} of {total}', es: 'Abrir foto {n} de {total}' },
  [`${K}.gallery.prev`]: { en: 'Previous photo', es: 'Foto anterior' },
  [`${K}.gallery.next`]: { en: 'Next photo', es: 'Foto siguiente' },
  [`${K}.gallery.close`]: { en: 'Close', es: 'Cerrar' },
  [`${K}.gallery.counter`]: { en: '{n} of {total}', es: '{n} de {total}' },
  [`${K}.gallery.tour`]: { en: 'Stop by with your pets and we would be glad to give you a tour.', es: 'Visítanos con tus mascotas y con gusto te damos un recorrido.' },

  // ---- P-02 hotel ----
  [`${K}.hotel.title`]: { en: 'Penthouses and suites, not kennels', es: 'Penthouses y suites, no jaulas' },
  [`${K}.hotel.lead`]: { en: 'Both of our accommodations are all-inclusive and include day care, walks throughout the day, room service and one-on-one time — and every day we send videos, pictures and reports so you know how they are doing.', es: 'Nuestros dos tipos de alojamiento son todo incluido e incluyen guardería, paseos durante el día, servicio a la habitación y atención uno a uno, y cada día enviamos videos, fotos y reportes para que sepas cómo están.' },
  [`${K}.hotel.rooms`]: { en: '{rooms} rooms across {locations} locations.', es: '{rooms} habitaciones en {locations} ubicaciones.' },
  [`${K}.hotel.inc1`]: { en: 'Premium bed and toys during the day', es: 'Cama premium y juguetes durante el día' },
  [`${K}.hotel.inc2`]: { en: 'Room service and playtime', es: 'Servicio a la habitación y tiempo de juego' },
  [`${K}.hotel.inc3`]: { en: 'Two walks per day and potty pads', es: 'Dos paseos al día y tapetes sanitarios' },
  [`${K}.hotel.inc4`]: { en: 'Photos and videos every night of their stay', es: 'Fotos y videos cada noche de su estancia' },
  [`${K}.hotel.inc5`]: { en: 'A bedtime tuck in and a tummy rub', es: 'Arropada de buenas noches y sobadita de panza' },
  [`${K}.hotel.inc6`]: { en: 'Medication, special diets, senior and diabetic care', es: 'Medicamentos, dietas especiales, cuidado de mayores y diabéticos' },
  [`${K}.hotel.penthouseExtra`]: { en: 'Penthouses add a TV of their own.', es: 'Los penthouses suman su propia televisión.' },
  [`${K}.hotel.vaccineNote`]: { en: 'Vaccine verification is required for all pets.', es: 'Se requiere verificación de vacunas para todas las mascotas.' },
  [`${K}.hotel.largeDogNote`]: { en: 'A large-dog accommodation fee may apply if additional services are required.', es: 'Puede aplicar un cargo por alojamiento de perro grande si se requieren servicios adicionales.' },

  // ---- P-03 grooming ----
  [`${K}.grooming.title`]: { en: 'The best stylists and groomers in the industry', es: 'Los mejores estilistas de la industria' },
  [`${K}.grooming.lead`]: { en: 'Spa bath, blow dry, brush out, brush teeth and paw massage in every package, with nail trim, anal expression and ear cleaning as you go up — and a full haircut on Diamond. Specialty breed cuts and Asian fusion: please call.', es: 'Baño de spa, secado, cepillado, limpieza de dientes y masaje de patas en cada paquete, con corte de uñas, expresión de glándulas y limpieza de oídos conforme subes, y corte completo en Diamond. Cortes de raza y Asian fusion: llámanos.' },
  [`${K}.grooming.sanitationWithFee`]: { en: 'Every grooming price includes a {amount} sanitation fee, so all pet belongings and equipment are cleaned with animal-safe disinfectant.', es: 'Cada precio de estética incluye una cuota de sanitización de {amount}, para que todas las pertenencias y el equipo se limpien con desinfectante seguro para animales.' },
  [`${K}.grooming.sanitation`]: { en: 'Every grooming price includes the sanitation fee that cleans all pet belongings and equipment with animal-safe disinfectant.', es: 'Cada precio de estética incluye la cuota de sanitización que limpia todas las pertenencias y el equipo con desinfectante seguro para animales.' },
  [`${K}.grooming.estimate`]: { en: 'Grooming rates are estimates; pets are assessed in person for the actual rate, and dematting is charged according to coat condition.', es: 'Las tarifas de estética son estimadas; cada mascota se evalúa en persona para la tarifa real, y el desenredado se cobra según la condición del pelaje.' },

  // ---- P-04 day care ----
  [`${K}.daycare.title`]: { en: 'A full day of dog', es: 'Un día completo de perro' },
  [`${K}.daycare.lead`]: { en: 'Our day care area, where dogs interact, exercise and socialize. Pets enjoy our interactive jungle gym accessories, toys and activities, on floors specially designed to protect their joints and bones.', es: 'Nuestra área de guardería, donde los perros conviven, hacen ejercicio y socializan. Disfrutan de nuestro gimnasio interactivo, juguetes y actividades, sobre pisos diseñados para proteger sus articulaciones y huesos.' },

  // ---- P-12 about ----
  [`${K}.about.eyebrow`]: { en: 'About', es: 'Nosotros' },
  [`${K}.about.title`]: { en: 'Established in 2011', es: 'Fundado en 2011' },
  [`${K}.about.lead`]: { en: 'Located in the heart of Encino, we invite you to experience pure luxury at Petrock Hotel and Spa with the most elaborate accommodations in the pet industry.', es: 'En el corazón de Encino, te invitamos a vivir el puro lujo en Petrock Hotel and Spa, con las instalaciones más elaboradas de la industria.' },
  [`${K}.about.story1`]: { en: 'Our hotel provides a boutique experience and includes amenities like our Spa, which offers full-service grooming and purebred cuts; Play, our day care area, where dogs socialize under the care of an animal professional; and our signature Petrock Penthouses and Suites.', es: 'Nuestro hotel ofrece una experiencia boutique e incluye amenidades como el Spa, con estética completa y cortes de raza; Play, nuestra área de guardería, donde los perros socializan al cuidado de un profesional; y nuestros Penthouses y Suites Petrock.' },
  [`${K}.about.story2`]: { en: 'Penthouses and Suites offer room service, playtime, walks through the day and incredible one-on-one service to accommodate each pet’s individual needs, with pictures and videos sent every day of their stay. We also offer private personal training, training seminars, agility courses and a Canine Good Citizen course.', es: 'Los Penthouses y Suites ofrecen servicio a la habitación, tiempo de juego, paseos durante el día y un servicio uno a uno increíble para las necesidades de cada mascota, con fotos y videos enviados cada día de su estancia. También ofrecemos entrenamiento personal privado, seminarios, cursos de agility y el curso Canine Good Citizen.' },
  [`${K}.about.story3`]: { en: 'We also offer a variety of fun accessories for dogs of all sizes. Stop by with your pets and we would be glad to give you a tour. We recommend reservations for all grooming and boarding.', es: 'También tenemos accesorios divertidos para perros de todos los tamaños. Visítanos con tus mascotas y con gusto te damos un recorrido. Recomendamos reservar para toda estética y hospedaje.' },

  // ---- shared ----
  [`${K}.callForReservations`]: { en: 'For reservations, please call', es: 'Para reservaciones, por favor llama' },
  [`${K}.textUs`]: { en: 'Text {number}', es: 'Escribe a {number}' },
  [`${K}.emailUs`]: { en: 'Email {address}', es: 'Escribe a {address}' },
};
