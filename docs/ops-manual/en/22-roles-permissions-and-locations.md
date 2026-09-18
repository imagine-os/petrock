---
title: Roles, permissions and locations
code: M-22
roles: owner, manager
part: V
version: 0.2.0
updated: 2026-09-18
summary: The seven roles and their homes, permissions as strings, per-role menus, view-as, pinned locations, adding a location.
rules: R-L05, R-K01, R-K02
---

# Roles, permissions and locations

Petrock knows seven roles. A role is a bundle of permissions (strings like `bookings.status`) and a side menu. Screens ask "can this user do X?", never "is this user a manager?", so the owner can move a permission between roles without code.

{{roles}}

## 1. Permissions

{{permissions:front_desk}}

{{permissions:manager}}

The owner and the super admin hold every permission; the super admin additionally sees the builder tool (the spec chip on every page). The customer holds the app permissions only.

[screenshot: A-30 — Roles and permissions]

## 2. Menus per role

The side menu is built from the pages a role may open, grouped in categories that collapse (Overview, Hotel reservations, Grooming & Spa, Daycare, People & pets, Vaccines, Payments, Messages & reviews, Reports, Settings, Extras, Ops manual). Expand all / collapse all sits at the top.

## 3. View as

The super admin can **view as** any role from the top bar to check what a role sees. It is a lens, not a login: actions still run as the super admin and are logged that way.

## 4. Locations

{{locations}}

Front desk, groomers and managers are **pinned** to their location; the owner and the super admin switch, or choose *all locations* for lists and reports. Adding a location is a settings flow (A-41): insert the row, set hours, capacities and rates; everything else is scoped by `location_id`.

[screenshot: A-41 — Add a location]

## In-person lesson

Explain to a new hire what they will and will not see and why, using the roles table above.

## Online lesson

1. From the hub, enter as each staff demo user and compare the side menus.
2. As the super admin, **view as** front desk, open Today, then switch back.
3. As the owner, switch location and then choose all locations on a report.

{{rules:people}}
