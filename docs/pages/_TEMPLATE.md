---
title: <Page name>
code: <CODE>
route: /<path>
roles: <role, role>
status: stub | built
module: <module folder>
figma: <file names from docs/figma/exports/petrock-main, if any>
---

# <CODE> · <Page name>

## Purpose

One paragraph: who uses this page and what they achieve.

## Screenshots

| 390 | 1280 |
| --- | --- |
| ![390](../screenshots/<CODE>/390.jpg) | ![1280](../screenshots/<CODE>/1280.jpg) |

Dark: `../screenshots/<CODE>/390-dark.jpg`, `../screenshots/<CODE>/1280-dark.jpg` (key pages).

## Sections (layout order)

1. Section name - what it shows / does
2. ...

## Data

| Table | Read / write | Notes |
| --- | --- | --- |
| `table` | read | |

## Rules

- `R-xxx` - how the page implements or displays it

## Logic

- Calculations, transitions, validations in plain words.

## Components

Library components used (must exist in `/#/dev/components`).

## Real vs mock

What is real today, what is mocked (payments, uploads, notifications), what changes when Company-OS lands.

## Responsive check (D-016)

Checked at: 360, 390, 768, 1280, 1920. Notes on degradation.

## Changelog

- `docs/changelog/NNNN-...md`
