/**
 * customer-home-pets seed: breed and colour lookups, emergency contacts for the demo pet parent, and a few more
 * customer notifications so the notification list (C-80, customer-settings-chat) shows every kind. Runs after core (order 10).
 */
import type { SeedCtx } from './index';
import { addDays, at } from './rng';

export const order = 10;

const BREEDS = ['Australian Shepherd', 'Beagle', 'Bernese Mountain Dog', 'Border Collie', 'Boxer', 'Bulldog', 'Cavapoo', 'Chihuahua', 'Cockapoo', 'Corgi', 'Dachshund', 'Doberman', 'French Bulldog', 'German Shepherd', 'Golden Retriever', 'Goldendoodle', 'Great Dane', 'Havanese', 'Husky', 'Labradoodle', 'Labrador Retriever', 'Maltese', 'Mixed breed', 'Pomeranian', 'Poodle', 'Pug', 'Rottweiler', 'Shiba Inu', 'Shih Tzu', 'Yorkshire Terrier'];
const COLORS = ['Black', 'Black and tan', 'Brindle', 'Brown', 'Cream', 'Fawn', 'Golden', 'Grey', 'Merle', 'Red', 'Tri-colour', 'White'];

export function seed(ctx: SeedCtx) {
  const { add, now } = ctx;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const D = (n: number) => addDays(today, n);

  BREEDS.forEach((value, i) => add('pet_lookups', { id: `plk_breed_${i + 1}`, kind: 'breed', value, sort_order: i, active: true, added_by: null }));
  COLORS.forEach((value, i) => add('pet_lookups', { id: `plk_color_${i + 1}`, kind: 'color', value, sort_order: i, active: true, added_by: null }));

  // Emergency contacts: one per household for the first three customers, one pinned to a pet (fictional people).
  add('emergency_contacts', { id: 'ec_1', customer_id: 'cus_1', pet_id: null, name: 'Jamie Thompson', phone: '+1 (818) 555-0188', relationship: 'Partner', note: null });
  add('emergency_contacts', { id: 'ec_2', customer_id: 'cus_1', pet_id: 'pet_2', name: 'Rosa Delgado', phone: '+1 (818) 555-0191', relationship: 'Dog walker', note: 'Walks Mochi on weekdays' });
  add('emergency_contacts', { id: 'ec_3', customer_id: 'cus_2', pet_id: null, name: 'Tunde Okafor', phone: '+1 (818) 555-0164', relationship: 'Brother', note: null });
  add('emergency_contacts', { id: 'ec_4', customer_id: 'cus_3', pet_id: null, name: 'Camila Fernandez', phone: '+1 (310) 555-0137', relationship: 'Sister', note: null });

  // Extra customer notifications (kinds the customer app renders: pet_approved, vaccine_verified, appointment_reminder, message).
  add('notifications', { id: 'ntf_chp_1', user_id: 'usr_customer', kind: 'vaccine_verified', title: 'Vaccines verified for Biscuit', body: 'Rabies, DHPP and Bordetella are verified. Biscuit is approved for stays.', link: '/app/pets/pet_1/vaccines', read: false, sent_at: at(D(0), 7, 40) });
  add('notifications', { id: 'ntf_chp_2', user_id: 'usr_customer', kind: 'appointment_reminder', title: 'Grooming tomorrow', body: 'Mochi has a Gold Groom at Encino tomorrow at 10:30 AM.', link: '/app/grooming', read: false, sent_at: at(D(-1), 18, 5) });
  add('notifications', { id: 'ntf_chp_3', user_id: 'usr_customer', kind: 'pet_approved', title: 'Mochi is approved', body: 'The front desk verified Mochi\'s records. You can book any service.', link: '/app/pets/pet_2', read: true, sent_at: at(D(-5), 12, 20) });
  add('notifications', { id: 'ntf_chp_4', user_id: 'usr_customer', kind: 'message', title: 'New message from the front desk', body: 'Encino: "Of course, happy to help. What would you like to know?"', link: '/app/chat', read: true, sent_at: at(D(-6), 15, 45) });
}
