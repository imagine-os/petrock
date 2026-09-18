/**
 * Resolves the customer account behind the signed-in user. A super admin (or any staff) previewing the customer app
 * falls back to the demo customer so every screen has data; `previewing` lets pages show a small hint.
 */
import { useMemo } from 'react';
import { useSession } from '../../auth/SessionProvider';
import { useTable } from '../../data/DataContext';
import { useI18n } from '../../i18n/I18nProvider';
import type { AccountCustomerRow, AccountUserRow } from '../../data/schema/customer-settings-chat';

export interface CustomerAccount {
  /** Effective account user id (notifications, prefs, conversations resolve against it). */
  accountUserId: string;
  userRow: AccountUserRow | null;
  customer: AccountCustomerRow | null;
  previewing: boolean;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  lang: 'en' | 'es';
  t: (key: string, vars?: Record<string, string | number>) => string;
}

export function useCustomerAccount(): CustomerAccount {
  const { user, role } = useSession();
  const { lang, t } = useI18n();
  const { rows: customers } = useTable<AccountCustomerRow>('customers');
  const { rows: users } = useTable<AccountUserRow>('users');
  return useMemo(() => {
    const own = customers.find((c) => c.user_id === user.id) ?? null;
    const fallback = role !== 'customer' || !own ? customers.find((c) => c.user_id === 'usr_customer') ?? customers.find((c) => c.user_id) ?? null : null;
    const customer = own ?? fallback;
    const previewing = !own && !!customer;
    const accountUserId = customer?.user_id ?? user.id;
    const userRow = users.find((u) => u.id === accountUserId) ?? null;
    const displayName = customer ? `${customer.first_name} ${customer.last_name}`.trim() : userRow?.name ?? user.name;
    const email = customer?.email ?? userRow?.email ?? user.email;
    return { accountUserId, userRow, customer, previewing, displayName, email, avatarUrl: userRow?.avatar_url ?? null, lang, t };
  }, [customers, users, user, role, lang, t]);
}

const T = (en: string, es: string) => ({ en, es });
const P = 'customer-settings-chat.';
/** Module strings (English primary, Spanish proves the language toggle). Keys are `customer-settings-chat.<key>`. */
export const strings = {
  [P + 'nav.chat']: T('Chat', 'Chat'), [P + 'nav.settings']: T('Settings', 'Ajustes'),
  [P + 'profile.title']: T('Settings', 'Ajustes'), [P + 'profile.previewing']: T('Previewing as {name}', 'Vista previa como {name}'),
  [P + 'profile.edit']: T('Edit Profile', 'Editar perfil'), [P + 'profile.edit.desc']: T('Name, phone, address', 'Nombre, teléfono, dirección'),
  [P + 'profile.pets']: T('My Pets', 'Mis mascotas'), [P + 'profile.addPet']: T('Add Pets', 'Añadir mascotas'), [P + 'profile.address']: T('Address', 'Dirección'), [P + 'profile.payments']: T('Payment methods', 'Métodos de pago'), [P + 'profile.notifications']: T('Notifications', 'Notificaciones'),
  [P + 'profile.chat']: T('Front Desk Chat', 'Chat con recepción'), [P + 'profile.settings']: T('Setting', 'Ajustes'), [P + 'profile.settings.desc']: T('Language, dark mode, password', 'Idioma, modo oscuro, contraseña'),
  [P + 'profile.help']: T('Help', 'Ayuda'), [P + 'profile.rate']: T('Rate App', 'Valorar la app'), [P + 'profile.about']: T('About App', 'Acerca de la app'), [P + 'profile.logout']: T('Logout', 'Cerrar sesión'),
  [P + 'profile.account']: T('Account', 'Cuenta'), [P + 'profile.more']: T('More', 'Más'),
  [P + 'edit.title']: T('Edit profile', 'Editar perfil'), [P + 'edit.contact']: T('Contact', 'Contacto'), [P + 'edit.address']: T('Address', 'Dirección'), [P + 'edit.security']: T('Sign-in', 'Acceso'),
  [P + 'edit.first']: T('First name', 'Nombre'), [P + 'edit.last']: T('Last name', 'Apellido'), [P + 'edit.phone']: T('Mobile phone', 'Móvil'), [P + 'edit.alt']: T('Alternate phone', 'Teléfono alternativo'),
  [P + 'edit.email']: T('Email', 'Correo'), [P + 'edit.changeEmail']: T('Change email', 'Cambiar correo'), [P + 'edit.password']: T('Password', 'Contraseña'), [P + 'edit.changePassword']: T('Change password', 'Cambiar contraseña'),
  [P + 'edit.street']: T('Street address', 'Calle y número'), [P + 'edit.apt']: T('Apt / suite', 'Piso / puerta'), [P + 'edit.city']: T('City', 'Ciudad'), [P + 'edit.state']: T('State', 'Estado'), [P + 'edit.zip']: T('ZIP', 'Código postal'),
  [P + 'edit.save']: T('Save changes', 'Guardar cambios'), [P + 'edit.saved']: T('Profile updated', 'Perfil actualizado'), [P + 'edit.cancel']: T('Cancel', 'Cancelar'),
  [P + 'settings.title']: T('Settings', 'Ajustes'), [P + 'settings.appearance']: T('Appearance', 'Apariencia'), [P + 'settings.language']: T('Language', 'Idioma'), [P + 'settings.dark']: T('Dark mode', 'Modo oscuro'), [P + 'settings.password']: T('Change password', 'Cambiar contraseña'),
  [P + 'settings.brand']: T('Colour theme', 'Tema de color'), [P + 'settings.account']: T('Account', 'Cuenta'), [P + 'settings.delete']: T('Delete account', 'Eliminar cuenta'), [P + 'settings.delete.desc']: T('30-day grace period', 'Periodo de gracia de 30 días'),
  [P + 'settings.version']: T('Version', 'Versión'),
  [P + 'lang.title']: T('Language', 'Idioma'), [P + 'lang.choose']: T('Choose your preferred language', 'Elige tu idioma preferido'), [P + 'lang.save']: T('Save', 'Guardar'), [P + 'lang.saved']: T('Language saved', 'Idioma guardado'),
  [P + 'lang.more']: T('More languages will follow once confirmed.', 'Más idiomas llegarán cuando se confirmen.'),
  [P + 'pay.title']: T('Payment methods', 'Métodos de pago'), [P + 'pay.add']: T('Add card', 'Añadir tarjeta'), [P + 'pay.empty']: T('No saved cards', 'Sin tarjetas guardadas'),
  [P + 'pay.empty.body']: T('Save a card to pay deposits faster. You can always pay cash at the location.', 'Guarda una tarjeta para pagar depósitos más rápido. Siempre puedes pagar en efectivo en el hotel.'),
  [P + 'pay.default']: T('Make default', 'Predeterminada'), [P + 'pay.remove']: T('Remove', 'Quitar'), [P + 'pay.cash']: T('Cash at the location is always available at check-in.', 'Pagar en efectivo en el hotel siempre está disponible.'),
  [P + 'notif.title']: T('Notification', 'Notificaciones'), [P + 'notif.inbox']: T('Front Desk Chat', 'Chat con recepción'), [P + 'notif.all']: T('All', 'Todas'), [P + 'notif.unread']: T('Unread', 'Sin leer'), [P + 'notif.markAll']: T('Mark all read', 'Marcar todo leído'),
  [P + 'notif.empty']: T("You're all caught up", 'Estás al día'), [P + 'notif.empty.body']: T('Booking updates, photos and messages land here.', 'Aquí llegan avisos de reservas, fotos y mensajes.'),
  [P + 'prefs.title']: T('Notification preferences', 'Preferencias de avisos'), [P + 'prefs.push']: T('Push', 'Push'), [P + 'prefs.email']: T('Email', 'Correo'), [P + 'prefs.sms']: T('SMS', 'SMS'),
  [P + 'prefs.note']: T('Receipts, legal notices and account deletion emails are always sent.', 'Recibos, avisos legales y correos de eliminación se envían siempre.'),
  [P + 'inbox.title']: T('Front Desk', 'Recepción'), [P + 'inbox.subtitle']: T('One thread per location', 'Un hilo por ubicación'), [P + 'inbox.start']: T('Message {location}', 'Escribir a {location}'), [P + 'inbox.you']: T('You: ', 'Tú: '),
  [P + 'chat.session']: T('Session start', 'Inicio de sesión'), [P + 'chat.placeholder']: T('Write a message…', 'Escribe un mensaje…'), [P + 'chat.seen']: T('Seen', 'Visto'), [P + 'chat.delivered']: T('Delivered', 'Entregado'), [P + 'chat.sending']: T('Sending', 'Enviando'),
  [P + 'chat.hours']: T('{location} replies {open} – {close}', '{location} responde {open} – {close}'), [P + 'chat.tooLarge']: T('Photos must be under 2 MB', 'Las fotos deben pesar menos de 2 MB'),
  [P + 'help.title']: T('Help & support', 'Ayuda y soporte'), [P + 'help.contact']: T('Contact us', 'Contáctanos'), [P + 'help.faq']: T('Frequently asked', 'Preguntas frecuentes'), [P + 'help.form']: T('Send us a message', 'Envíanos un mensaje'),
  [P + 'help.topic']: T('Topic', 'Tema'), [P + 'help.message']: T('How can we help?', '¿Cómo podemos ayudarte?'), [P + 'help.send']: T('Send request', 'Enviar solicitud'), [P + 'help.sent']: T('Request sent. We reply within one business day.', 'Solicitud enviada. Respondemos en un día laborable.'),
  [P + 'help.chatNow']: T('Chat with the Front Desk', 'Chatear con recepción'), [P + 'help.call']: T('Call {location}', 'Llamar a {location}'), [P + 'help.history']: T('Your requests', 'Tus solicitudes'),
  [P + 'about.title']: T('About & legal', 'Acerca de y legal'), [P + 'about.privacy']: T('Privacy policy', 'Política de privacidad'), [P + 'about.terms']: T('Terms of service', 'Términos del servicio'), [P + 'about.licenses']: T('Open-source licences', 'Licencias de código abierto'),
  [P + 'about.locations']: T('Our locations', 'Nuestras ubicaciones'), [P + 'about.version']: T('Version {v}', 'Versión {v}'),
  [P + 'rate.title']: T('Rate the app', 'Valorar la app'), [P + 'rate.question']: T('How was your Petrock experience?', '¿Cómo fue tu experiencia con Petrock?'), [P + 'rate.tags']: T('What stood out?', '¿Qué destacarías?'),
  [P + 'rate.comment']: T('Tell us more (optional)', 'Cuéntanos más (opcional)'), [P + 'rate.submit']: T('Send review', 'Enviar valoración'), [P + 'rate.thanks']: T('Thank you!', '¡Gracias!'),
  [P + 'rate.thanks.body']: T('Your review is with our team. Published reviews appear on our website.', 'Tu valoración está con nuestro equipo. Las publicadas aparecen en la web.'),
  [P + 'delete.title']: T('Delete account', 'Eliminar cuenta'), [P + 'delete.reason']: T('Why are you leaving?', '¿Por qué te vas?'), [P + 'delete.confirm']: T('Delete my account', 'Eliminar mi cuenta'),
  [P + 'delete.type']: T('Type DELETE to confirm', 'Escribe DELETE para confirmar'), [P + 'delete.blocked']: T('You have active bookings. Cancel or complete them before deleting your account.', 'Tienes reservas activas. Cancélalas o complétalas antes de eliminar tu cuenta.'),
  [P + 'pw.title']: T('Change password', 'Cambiar contraseña'), [P + 'pw.current']: T('Current password', 'Contraseña actual'), [P + 'pw.new']: T('New password', 'Nueva contraseña'), [P + 'pw.repeat']: T('Repeat new password', 'Repite la nueva contraseña'),
  [P + 'pw.save']: T('Update password', 'Actualizar contraseña'), [P + 'pw.saved']: T('Password updated', 'Contraseña actualizada'),
  [P + 'common.back']: T('Back', 'Atrás'), [P + 'common.saved']: T('Saved', 'Guardado'),
};
export const k = (key: string) => P + key;
