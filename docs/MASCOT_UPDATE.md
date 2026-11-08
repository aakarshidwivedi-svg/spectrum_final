# Mascot update: official tail

- `src/assets/spectrum-character.png` is the new 1024x1024 transparent texture with the official tail. It keeps the same
  pixel layout as the old file, so the tail/crest/wing/head/eye regions in `Hero3D.jsx` still line up.
  It is used by the hero 2D fallback, the hero WebGL image-mesh, the floating assistant (3D + no-WebGL fallback).
- `src/assets/mascot-badge.png` (176px, 4x for the 44px badge) is the full-body mascot for the nav badge.
  `src/assets/logo.jpeg` is no longer imported; to revert the badge, change one import in `Navbar.jsx`.
- `public/favicon.png` is a face crop of the new mascot, linked in `index.html`.
- 3D: the hero is a deformed image mesh (no GLB), so the tail is not remodelled. The new tail is on the texture and
  is driven by the existing `tailW` region in the vertex shader (idle sway, body-turn lag, pointer response).
  Dropping `public/models/spectrum.glb` still switches to a real model automatically.
