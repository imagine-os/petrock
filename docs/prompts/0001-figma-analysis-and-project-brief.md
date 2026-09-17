# 0001 - Figma analysis and project brief

- Source: Slack #petrock-hotel thread https://playsetllc.slack.com/archives/C0C2PP1NRPE/p1789669007022039
- Date: 2026-09-17
- Requester: Justin Massion (owner)
- Changelog: `docs/changelog/0001-repo-bootstrap-and-figma-analysis.md`

## Prompt (verbatim)

### Message 1

petrock is a repo now in github.

confirm you have figma access through the key i provided. i dont know if you need it or not though.  https://www.figma.com/design/3UXEOzU9ORGm5mInQqhiUW/Petrock-Main?node-id=404-14656

The Petrock App Designs are here in Figma on the new(justin = Mark) page only.  There's a lot of frames and flows on the page, and im not sure if you can understand it all out the box or if you need me to help you identify each flow, group by group.

1st analyze and let me know.

We are going to build them a super amazing software for their company with ios and android apps for customers, and great front desk web experience and admin experience for admins and stuff. It would be everything they need all in one.

Including Stripe integration. Other integrations may eventually include push notifications and automated emails. it also needs all the standard required things from the app stores built into the settings or whatever. Later we will connect to supabase. but not yet.

As you build, you need to  keep a builder tool on all pages that super admins can see and toggle open, it will have all key info related to the page sch as what tables it connects to , what roles have access, what the components on the page are and their layout, any calcualations and rules that the page utilizes, any integrations, etc.

you can look at the hoy repo for some reference to how we built a really strong hub with user manual, front end website, customer/staff experiences, etc. so we can test logging in as diffferent types of users and stuff.  there's also some cool tricks we did and things we setup in the dashboard for dev to be better,

we have documentation of all changelogs and revision history, and more. Also a business operations manual with lots of screenshots which teaches both the inperson and online lessons every staff member needs per their role.

the customer experience, which is the mobile app has a pretty locked in design system. However, the Desktop experience for front desk and admin can be made to look better as needed. for instance the timeline and kanban views for calendar can be built more properly with your design abilities.

This is a dog hotel and spa petrockhotel.com is their website which we can rebuild later as well if appropraite. its currently built in squarespace.

they have 2 locations and we always need to know what location they're in. of course front desk users on location wont be able to see both stores dashboards, but owners will be able to. Later they may open more locations, so adding locations should be a nice easy flow later.

The Pin system is really smart for staff members to get approvals from managers. it speeds up logging in and makes it so managers can approve things by typing in a pin on popup.

Consider including a nice easy way for the staff to leaave feedback directly on the system.

Also consider that the components need to be standardized so as we upgrade components, it can upgrade across any page their on. So we'll have a components library, and a design system.  AND imporatntly, we need a library for organizing all the tables, so that we know very clearly that the table system is perfect and everything looks good.

Role management is another key thing and assigning what each role can see and if they can edit in relation to their individualized side menus is important too.

Thankfully we did some very very deep work in figma. So, as long as we have alll those features and pages, the rest is us adding bonus features and polish.

Let me know if you need my help with identifying the figma flows proper, and being clear which items on the board are not needed

### Message 2

in playset llc org in github under Company-OS repo, you will see the database system that our dev is coding seperate. Right now we're fully focused on developing reguardless of that, and the developer will connect everything or rebuild everything super clean later. https://github.com/Playset-LLC/Company-OS

So consider that later we will use the compnay os system for the database which will be connected to supabase.  Its possible that we will simply api between the front end and using the companyos seperate. im not sure. But just having it should give you general insight.

Also, as a note, you can look at the spec builder and some smart things we did in santa maria dashboard. Which we may not yet have implemented into hoy and vice versa. Dont worry about the content of santa maria or hoy, what i want you to notice is more things i did to make development and documentation way better/smarter/stronger

https://github.com/Santa-Maria-Tenis-Club/os

## Response

Figma access works, and the petrock repo is attached (it was empty; this commit creates main).

What I could read on my own: the new(justin + Mark) page holds 253 frames across 25 sections. Two products, each drawn two or three times over as the design evolved:
- Customer mobile app (390 wide): the newest set is Section 22, 48 screens in 9 flows: Onboarding/Password, Home + Add pet, Boarding, Credit card, Chat/Notifications, Grooming, Spa, Settings & Profile, Daycare.
- Front desk web (1440 wide): the newest set is Section 14: Boarding table view, Timeline view, Groom, Grooming agenda list, Message, the four Add forms (groom booking, board booking, pet, customer), and Control Panel draft screens 1-15.
- Admin/owner: thin. Two "Management" dashboards plus the Control Panel draft. The UX-plan sitemap lists Control Panel (Content/Style/Pricing/Backups/Staff Settings), People & Pets (Pets/Customers/Staff/Vets) and Pin Code Auth, mostly without screens yet.
- Not needed as far as I can tell: Section 5 "Before" (legacy screenshots), the older duplicate rows, stray dashboard widget groups, and the grey planning rectangles.

Design system: nothing is published to a Figma team library; the page uses 45 local components in 10 sets and 23 fill / 10 text styles with inconsistent names. Plan: consolidate into the code design system and treat Figma as visual truth for the mobile app.

Questions for Justin:
1. Are Section 22 + Section 14 the approved scope, with everything else superseded?
2. Control Panel screens 1-15: which are in scope, and are they front desk or owner-only?
3. Flows missing from Section 22 (In Home, Hotel Reservation/Hotel Flow, Choose Vaccine, Day care "coming soon"): dropped or pending?
4. Spa vs Grooming: one flow with conditions, or two flows?
5. Old single-screen rows (report, education, reviews, employees, walking, Management): in scope?
6. Business rules ("55lb+ must be Suite", daycare duration vs spa, pricing rules): documented anywhere else?
7. The "Re-build with new design system" note: is that done, and which page holds the new system?
8. Timeline view: boarding, grooming, or both?

Reference repos: hoy is cloned and digested (testing hub, per-page spec inspector, same-turn docs conventions, schema-to-SQL generator, GitHub Pages deploy). Company-OS and Santa-Maria-Tenis-Club/os cannot be attached to this session because it already holds imagine-os repos; a separate read-only session is digesting Company-OS. Santa Maria os is not visible to the workspace's GitHub connection at all and needs an org owner to grant access.
