import type { StringTable } from '../../i18n/types';

/** HUB-01 copy plus the shared `Placeholder` strings (D-206: every visible string, en + es, aria-labels included). */
export const strings: StringTable = {
  // Header controls
  'hub.lang.label': { en: 'Language', es: 'Idioma' },
  'hub.brand.label': { en: 'Brand theme', es: 'Tema de marca' },
  'hub.theme.toLight': { en: 'Switch to light mode', es: 'Cambiar a modo claro' },
  'hub.theme.toDark': { en: 'Switch to dark mode', es: 'Cambiar a modo oscuro' },
  'hub.devMode': { en: 'Builder tool', es: 'Herramienta de construcción' },
  'hub.version': { en: 'Version', es: 'Versión' },

  // Hero
  'hub.hero.eyebrow': { en: 'Petrock Hotel · Dog hotel & spa · Encino & Westwood, Los Angeles', es: 'Petrock Hotel · Hotel y spa para perros · Encino y Westwood, Los Ángeles' },
  'hub.title': { en: 'Petrock testing hub', es: 'Centro de pruebas Petrock' },
  'hub.subtitle': {
    en: 'One system for every seat at the hotel: pet parents, front desk, groomers, managers, the owner and the people who build it.',
    es: 'Un solo sistema para cada puesto del hotel: familias de mascotas, recepción, peluqueros, gerentes, el dueño y quienes lo construyen.',
  },

  // Session bar
  'hub.session': { en: 'Session', es: 'Sesión' },
  'hub.devHint.before': { en: 'Builder tool is on: every page shows a spec chip, and', es: 'La herramienta de construcción está activa: cada página muestra un chip de especificación y' },
  'hub.devHint.after': { en: 'opens the inspector.', es: 'abre el inspector.' },

  // Card chrome
  'hub.cta.enterAs': { en: 'Enter as {name}', es: 'Entrar como {name}' },
  'hub.cta.openAs': { en: 'Open as {name}', es: 'Abrir como {name}' },
  'hub.cta.open': { en: 'Open', es: 'Abrir' },
  'hub.status.built': { en: 'Built', es: 'Construido' },
  'hub.status.stub': { en: 'Stub', es: 'Esbozo' },
  'hub.status.planned': { en: 'Planned', es: 'Planeado' },
  'hub.here': { en: 'You are here', es: 'Estás aquí' },
  'hub.thumb.none': { en: 'No screenshot captured yet', es: 'Aún no hay captura de pantalla' },

  // Role labels (the shared ROLE_LABEL map is English only)
  'hub.role.superAdmin': { en: 'Super admin', es: 'Superadministrador' },
  'hub.role.owner': { en: 'Owner', es: 'Dueño' },
  'hub.role.manager': { en: 'Manager', es: 'Gerente' },
  'hub.role.frontDesk': { en: 'Front desk', es: 'Recepción' },
  'hub.role.groomer': { en: 'Groomer', es: 'Peluquero' },
  'hub.role.customer': { en: 'Pet parent', es: 'Familia de mascota' },
  'hub.role.public': { en: 'Visitor', es: 'Visitante' },

  // Group 1
  'hub.group.outside.eyebrow': { en: 'Outside the building', es: 'Fuera del edificio' },
  'hub.group.outside.title': { en: 'What a pet parent sees', es: 'Lo que ve una familia de mascota' },
  'hub.group.outside.body': { en: 'The website that sells the stay, the app that books it and the sign-in flow in between.', es: 'La web que vende la estancia, la app que la reserva y el inicio de sesión que las une.' },
  'hub.card.customerApp.name': { en: 'Customer app', es: 'App para clientes' },
  'hub.card.customerApp.body': {
    en: 'Pets and vaccine records, hotel stays, Grooming & Spa, daycare, payments and chat with the desk. 390 design, wrapped with Capacitor later.',
    es: 'Mascotas y vacunas, estancias de hotel, Peluquería y Spa, guardería, pagos y chat con recepción. Diseño de 390, empaquetado con Capacitor más adelante.',
  },
  'hub.card.website.name': { en: 'Public website', es: 'Sitio web público' },
  'hub.card.website.body': {
    en: 'petrockhotel.com rebuilt: hotel, Grooming & Spa, daycare, pricing, locations, reviews, policies and Book now.',
    es: 'petrockhotel.com reconstruido: hotel, Peluquería y Spa, guardería, precios, sedes, reseñas, políticas y Reservar ahora.',
  },
  'hub.card.signIn.name': { en: 'Sign in & account', es: 'Iniciar sesión y cuenta' },
  'hub.card.signIn.body': { en: 'Welcome, sign in with lockout, create account, one-time code, forgot / reset.', es: 'Bienvenida, inicio de sesión con bloqueo, crear cuenta, código de un solo uso, olvidé / restablecer.' },
  'hub.card.bookOnline.name': { en: 'Book from the website', es: 'Reservar desde la web' },
  'hub.card.bookOnline.body': { en: 'The public booking funnel that hands off to the app.', es: 'El embudo de reserva público que entrega el pase a la app.' },

  // Group 2
  'hub.group.staff.eyebrow': { en: 'Staff', es: 'Personal' },
  'hub.group.staff.title': { en: 'Every seat at the hotel', es: 'Cada puesto del hotel' },
  'hub.group.staff.body': {
    en: 'Front desk to owner: one staff shell whose menu is filtered per role, so every seat sees its own work.',
    es: 'De recepción al dueño: una sola carcasa de personal con el menú filtrado por rol, para que cada puesto vea su propio trabajo.',
  },
  'hub.card.deskEncino.name': { en: 'Front desk · Encino', es: 'Recepción · Encino' },
  'hub.card.deskEncino.body': {
    en: "Today's arrivals and departures, reservations, room timeline, vaccines, messages. Pinned to Encino.",
    es: 'Llegadas y salidas de hoy, reservas, línea de tiempo de habitaciones, vacunas, mensajes. Fijada a Encino.',
  },
  'hub.card.deskWestwood.name': { en: 'Front desk · Westwood', es: 'Recepción · Westwood' },
  'hub.card.deskWestwood.body': {
    en: "Today's arrivals and departures, reservations, room timeline, vaccines, messages. Pinned to Westwood.",
    es: 'Llegadas y salidas de hoy, reservas, línea de tiempo de habitaciones, vacunas, mensajes. Fijada a Westwood.',
  },
  'hub.card.grooming.name': { en: 'Grooming & Spa', es: 'Peluquería y Spa' },
  'hub.card.grooming.body': {
    en: "The groomer's day view, board and agenda; Gold / Platinum / Diamond by size plus add-ons.",
    es: 'La vista del día del peluquero, el tablero y la agenda; Gold / Platinum / Diamond por tamaño más extras.',
  },
  'hub.card.manager.name': { en: 'Manager', es: 'Gerente' },
  'hub.card.manager.body': {
    en: 'Reservations table and timeline, PIN approvals for status changes, refunds and discounts.',
    es: 'Tabla y línea de tiempo de reservas, aprobaciones con PIN para cambios de estado, reembolsos y descuentos.',
  },
  'hub.card.owner.name': { en: 'Owner', es: 'Dueño' },
  'hub.card.owner.body': {
    en: 'Both locations: KPIs, pricing tables, rooms, employees, reviews, feedback inbox, reports.',
    es: 'Ambas sedes: indicadores, tablas de precios, habitaciones, empleados, reseñas, bandeja de comentarios, informes.',
  },
  'hub.card.admin.name': { en: 'Admin & settings', es: 'Administración y ajustes' },
  'hub.card.admin.body': {
    en: 'General settings, Settings › Rules, roles and per-role menus, approvals and audit log.',
    es: 'Ajustes generales, Ajustes › Reglas, roles y menús por rol, aprobaciones y registro de auditoría.',
  },

  // Group 3
  'hub.group.build.eyebrow': { en: 'Build & test', es: 'Construir y probar' },
  'hub.group.build.title': { en: 'How Petrock is built', es: 'Cómo se construye Petrock' },
  'hub.group.build.body': {
    en: 'The ops manual, every document and the developer tools that keep the system honest.',
    es: 'El manual de operaciones, todos los documentos y las herramientas de desarrollo que mantienen honesto al sistema.',
  },
  'hub.card.manual.name': { en: 'Ops manual', es: 'Manual de operaciones' },
  'hub.card.manual.body': { en: 'How the hotel runs, per role, with live numbers and screenshots.', es: 'Cómo funciona el hotel, por rol, con números en vivo y capturas de pantalla.' },
  'hub.card.docs.name': { en: 'Docs & knowledge', es: 'Documentos y conocimiento' },
  'hub.card.docs.body': { en: 'Everything in docs/: brief, decisions, prompts, changelogs, page docs, screenshots.', es: 'Todo lo que hay en docs/: resumen, decisiones, prompts, registros de cambios, fichas de página, capturas.' },
  'hub.card.devtools.name': { en: 'Dev tools', es: 'Herramientas de desarrollo' },
  'hub.card.devtools.body': {
    en: 'Tokens, component library, specs, tables, rules, route manifest and the QA reports. Super admin only.',
    es: 'Tokens, biblioteca de componentes, especificaciones, tablas, reglas, manifiesto de rutas e informes de QA. Solo superadministrador.',
  },
  'hub.card.quality.name': { en: 'Quality', es: 'Calidad' },
  'hub.card.quality.body': { en: 'Responsive matrix, accessibility scan, performance budget and screenshot diff.', es: 'Matriz responsive, escaneo de accesibilidad, presupuesto de rendimiento y comparación de capturas.' },

  // Group 4: tools
  'hub.group.tools.eyebrow': { en: 'Testing hub', es: 'Centro de pruebas' },
  'hub.group.tools.title': { en: 'See the whole system at once', es: 'Ver todo el sistema de una vez' },
  'hub.group.tools.body': { en: 'The tools that show the whole system in one place.', es: 'Las herramientas que muestran todo el sistema en un solo lugar.' },
  'hub.tool.preview.name': { en: 'Responsive preview', es: 'Vista previa responsive' },
  'hub.tool.preview.desc': { en: 'Any page at any width, side by side', es: 'Cualquier página a cualquier ancho, lado a lado' },
  'hub.tool.screenshots.name': { en: 'Screenshots', es: 'Capturas de pantalla' },
  'hub.tool.screenshots.desc': { en: 'Every capture, light and dark', es: 'Todas las capturas, en claro y oscuro' },
  'hub.tool.routes.name': { en: 'Route manifest', es: 'Manifiesto de rutas' },
  'hub.tool.routes.desc': { en: 'Every route, code, surface and role', es: 'Cada ruta, código, superficie y rol' },
  'hub.tool.specs.name': { en: 'Page specs', es: 'Especificaciones de página' },
  'hub.tool.specs.desc': { en: 'What each page shows and why', es: 'Qué muestra cada página y por qué' },
  'hub.tool.components.name': { en: 'Components', es: 'Componentes' },
  'hub.tool.components.desc': { en: 'The library, with states and usages', es: 'La biblioteca, con estados y usos' },
  'hub.tool.tables.name': { en: 'Tables', es: 'Tablas' },
  'hub.tool.tables.desc': { en: 'The data model, managed in the product', es: 'El modelo de datos, gestionado en el producto' },
  'hub.tool.rules.name': { en: 'Rules', es: 'Reglas' },
  'hub.tool.rules.desc': { en: 'Every business rule and where it runs', es: 'Cada regla de negocio y dónde se aplica' },
  'hub.tool.knowledge.name': { en: 'Knowledge', es: 'Conocimiento' },
  'hub.tool.knowledge.desc': { en: 'Brief, decisions and domain notes', es: 'Resumen, decisiones y notas del dominio' },
  'hub.tool.docsSearch.name': { en: 'Docs search', es: 'Buscar en documentos' },
  'hub.tool.docsSearch.desc': { en: 'Full-text search across docs/', es: 'Búsqueda de texto completo en docs/' },
  'hub.tool.pin.name': { en: 'Staff PIN login', es: 'Acceso de personal con PIN' },
  'hub.tool.pin.desc': { en: 'The keypad staff use at the desk', es: 'El teclado que el personal usa en recepción' },
  'hub.tool.canvas.name': { en: 'Canvas', es: 'Lienzo' },
  'hub.tool.canvas.desc': { en: 'Every page laid out on one zoomable surface', es: 'Todas las páginas en una sola superficie con zoom' },
  'hub.tool.simulator.name': { en: 'Demo simulator', es: 'Simulador de demostración' },
  'hub.tool.simulator.desc': { en: 'Phone to 4K TV frames, any role, either language', es: 'Marcos desde teléfono hasta TV 4K, cualquier rol, cualquier idioma' },
  'hub.tool.plan.name': { en: 'Plan viewer', es: 'Visor del plan' },
  'hub.tool.plan.desc': { en: 'Kanban, list and timeline with dependencies', es: 'Kanban, lista y línea de tiempo con dependencias' },

  // Footer stats
  'hub.stat.routes': { en: 'Routes', es: 'Rutas' },
  'hub.stat.built': { en: 'Built', es: 'Construidas' },
  'hub.stat.tables': { en: 'Tables', es: 'Tablas' },
  'hub.stat.rules': { en: 'Rules', es: 'Reglas' },
  'hub.stat.components': { en: 'Components', es: 'Componentes' },
  'hub.stat.actions': { en: 'Actions', es: 'Acciones' },
  'hub.stat.pageDocs': { en: 'Page docs', es: 'Fichas de página' },
  'hub.stat.tasks': { en: 'Tasks done', es: 'Tareas hechas' },
  'hub.mockNote': { en: 'Mock data (localStorage). Demo people and pets are fictional.', es: 'Datos simulados (localStorage). Las personas y mascotas de demostración son ficticias.' },

  // Placeholder atom (D-201, D-202) - shared, kept here until it gets its own table
  'placeholder.notWired': { en: 'Not wired yet', es: 'Aún no está conectado' },
  'placeholder.hint': { en: '{what} is designed but not wired up yet. It is on the plan.', es: '{what} está diseñado pero aún no está conectado. Está en el plan.' },
  'placeholder.thisControl': { en: 'This control', es: 'Este control' },
};
