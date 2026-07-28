#!/usr/bin/env node
/**
 * Generate on-theme placeholder artwork as SVG files.
 *
 * No network and no dependencies: every placeholder is a self-contained SVG built
 * from the "Blomstring" palette (sand, poppy, ochre, sage, dusk). Output is
 * deterministic — rerunning produces byte-identical files.
 *
 * Usage: node tools/generate-placeholders.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const outputDirectory = path.join(scriptDirectory, '..', 'assets', 'img');

const PALETTES = {
  poppy: ['#F2E4CE', '#D98B3F', '#B33A2B', '#7A1F18'],
  clematis: ['#EDE6F2', '#8C6FA8', '#5B3F7A', '#2E2340'],
  sage: ['#EEEFE4', '#A8B295', '#7C8B6F', '#40492F'],
  dusk: ['#F0D9C4', '#D98B6A', '#7C5A7A', '#2C2740'],
  shadow: ['#F4EDE3', '#E7D8C3', '#CDB79B', '#8A7358'],
  coast: ['#F6E7D0', '#E8B375', '#9C7FA0', '#3A3550'],
};

/** Deterministic PRNG (mulberry32) so reruns are byte-identical. */
function createRandom(seed) {
  let state = seed >>> 0;
  return function random() {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

const between = (random, minimum, maximum) => minimum + random() * (maximum - minimum);
const round = (value) => Number(value.toFixed(1));

const hexToRgb = (colour) => [1, 3, 5].map((offset) => parseInt(colour.slice(offset, offset + 2), 16));
const rgbToHex = (channels) => '#' + channels.map((channel) => Math.round(channel).toString(16).padStart(2, '0').toUpperCase()).join('');
const mix = (first, second, amount) => {
  const a = hexToRgb(first);
  const b = hexToRgb(second);
  return rgbToHex(a.map((channel, index) => channel + (b[index] - channel) * amount));
};

function petalPath(centerX, centerY, innerRadius, outerRadius, angle, spread) {
  const left = angle - spread;
  const right = angle + spread;
  const startX = centerX + Math.cos(left) * innerRadius;
  const startY = centerY + Math.sin(left) * innerRadius;
  const tipX = centerX + Math.cos(angle) * outerRadius;
  const tipY = centerY + Math.sin(angle) * outerRadius;
  const endX = centerX + Math.cos(right) * innerRadius;
  const endY = centerY + Math.sin(right) * innerRadius;
  const controlLeftX = centerX + Math.cos(left) * outerRadius * 0.92;
  const controlLeftY = centerY + Math.sin(left) * outerRadius * 0.92;
  const controlRightX = centerX + Math.cos(right) * outerRadius * 0.92;
  const controlRightY = centerY + Math.sin(right) * outerRadius * 0.92;
  return `M${round(startX)},${round(startY)} C${round(controlLeftX)},${round(controlLeftY)} ${round(tipX)},${round(tipY)} ${round(tipX)},${round(tipY)} C${round(tipX)},${round(tipY)} ${round(controlRightX)},${round(controlRightY)} ${round(endX)},${round(endY)} Z`;
}

function leafPath(originX, originY, length, width, angle) {
  const tipX = originX + Math.cos(angle) * length;
  const tipY = originY + Math.sin(angle) * length;
  const normalX = Math.cos(angle + Math.PI / 2) * width;
  const normalY = Math.sin(angle + Math.PI / 2) * width;
  const midX = originX + Math.cos(angle) * length * 0.5;
  const midY = originY + Math.sin(angle) * length * 0.5;
  return `M${round(originX)},${round(originY)} Q${round(midX + normalX)},${round(midY + normalY)} ${round(tipX)},${round(tipY)} Q${round(midX - normalX)},${round(midY - normalY)} ${round(originX)},${round(originY)} Z`;
}

const grainAndVignette = (seed) => `
    <filter id="grain${seed}" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="${seed}" result="noise"/>
      <feColorMatrix type="saturate" values="0" in="noise" result="desaturated"/>
      <feComponentTransfer in="desaturated">
        <feFuncA type="linear" slope="0.16"/>
      </feComponentTransfer>
    </filter>
    <radialGradient id="vignette${seed}" cx="50%" cy="45%" r="75%">
      <stop offset="55%" stop-color="#000000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.28"/>
    </radialGradient>`;

const finish = (width, height, seed) => `
  <rect width="${width}" height="${height}" filter="url(#grain${seed})" opacity="0.5"/>
  <rect width="${width}" height="${height}" fill="url(#vignette${seed})"/>
</svg>
`;

const openSvg = (width, height) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Placeholder artwork">`;

/** Macro flower: petal rings around a lit centre. */
function bloomImage(width, height, paletteName, seed) {
  const random = createRandom(seed * 7919);
  const colours = PALETTES[paletteName];
  const centerX = width * between(random, 0.42, 0.58);
  const centerY = height * between(random, 0.44, 0.56);
  const maxRadius = Math.max(width, height) * 0.62;

  const parts = [openSvg(width, height), `
  <defs>
    <radialGradient id="ground${seed}" cx="${Math.round((centerX / width) * 100)}%" cy="${Math.round((centerY / height) * 100)}%" r="85%">
      <stop offset="0%" stop-color="${colours[1]}"/>
      <stop offset="60%" stop-color="${colours[2]}"/>
      <stop offset="100%" stop-color="${colours[3]}"/>
    </radialGradient>
    <radialGradient id="heart${seed}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${mix(colours[0], '#FFFFFF', 0.5)}"/>
      <stop offset="70%" stop-color="${colours[1]}"/>
      <stop offset="100%" stop-color="${colours[2]}" stop-opacity="0.2"/>
    </radialGradient>${grainAndVignette(seed)}
  </defs>
  <rect width="${width}" height="${height}" fill="url(#ground${seed})"/>`];

  [[0.95, 7, 0.3], [0.68, 6, 0.34], [0.44, 5, 0.38]].forEach(([radiusScale, petalCount, spread], ringIndex) => {
    const rotation = between(random, 0, Math.PI);
    for (let petalIndex = 0; petalIndex < petalCount; petalIndex++) {
      const angle = rotation + petalIndex * ((2 * Math.PI) / petalCount);
      const outerRadius = maxRadius * radiusScale * between(random, 0.88, 1.08);
      parts.push(`
  <path d="${petalPath(centerX, centerY, maxRadius * 0.1, outerRadius, angle, spread)}" fill="${mix(colours[2], colours[0], 0.16 + ringIndex * 0.2)}" fill-opacity="${(0.72 - ringIndex * 0.06).toFixed(2)}"/>`);
    }
  });

  const heartRadius = maxRadius * 0.17;
  parts.push(`
  <circle cx="${round(centerX)}" cy="${round(centerY)}" r="${round(heartRadius)}" fill="url(#heart${seed})"/>`);
  for (let stamen = 0; stamen < 26; stamen++) {
    const angle = stamen * ((2 * Math.PI) / 26) + between(random, -0.1, 0.1);
    const inner = heartRadius * 0.55;
    const outer = heartRadius * between(random, 1.15, 1.6);
    parts.push(`
  <line x1="${round(centerX + Math.cos(angle) * inner)}" y1="${round(centerY + Math.sin(angle) * inner)}" x2="${round(centerX + Math.cos(angle) * outer)}" y2="${round(centerY + Math.sin(angle) * outer)}" stroke="${mix(colours[0], colours[3], 0.35)}" stroke-width="${round(maxRadius * 0.008)}" stroke-linecap="round" stroke-opacity="0.55"/>`);
  }

  parts.push(finish(width, height, seed));
  return parts.join('');
}

/** Leaf shadows crossing a sunlit wall — the "Gigantically Subtle" feel. */
function shadowImage(width, height, paletteName, seed) {
  const random = createRandom(seed * 104729);
  const colours = PALETTES[paletteName];
  // Sharpness and light direction drift with the sun, so no two frames match.
  const softness = between(random, 0.005, 0.024);
  const lightAngle = Math.round(between(random, 0, 130));

  const parts = [openSvg(width, height), `
  <defs>
    <linearGradient id="wall${seed}" gradientTransform="rotate(${lightAngle} 0.5 0.5)">
      <stop offset="0%" stop-color="${mix(colours[0], '#FFFFFF', 0.35)}"/>
      <stop offset="55%" stop-color="${colours[1]}"/>
      <stop offset="100%" stop-color="${colours[2]}"/>
    </linearGradient>
    <filter id="blur${seed}" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="${round(Math.max(width, height) * softness)}"/>
    </filter>${grainAndVignette(seed)}
  </defs>
  <rect width="${width}" height="${height}" fill="url(#wall${seed})"/>
  <g filter="url(#blur${seed})" fill="${colours[3]}" fill-opacity="0.30">`];

  const stemCount = random() > 0.55 ? 2 : 1;
  for (let stem = 0; stem < stemCount; stem++) {
    const originX = width * between(random, -0.15, 0.75);
    const originY = height * between(random, 0.8, 1.12);
    const angle = between(random, -1.75, -0.45);
    const length = Math.max(width, height) * between(random, 0.7, 1.15);
    const tipX = originX + Math.cos(angle) * length;
    const tipY = originY + Math.sin(angle) * length;
    const bow = width * between(random, -0.22, 0.28);
    parts.push(`
    <path d="M${round(originX)},${round(originY)} Q${round((originX + tipX) / 2 + bow)},${round((originY + tipY) / 2)} ${round(tipX)},${round(tipY)}" stroke="${colours[3]}" stroke-opacity="${between(random, 0.18, 0.34).toFixed(2)}" stroke-width="${round(width * between(random, 0.006, 0.016))}" fill="none"/>`);

    const leafCount = Math.round(between(random, 5, 11));
    const spacing = between(random, 0.07, 0.13);
    const spread = between(random, 0.55, 1.35);
    const scale = between(random, 0.13, 0.34);
    for (let leaf = 0; leaf < leafCount; leaf++) {
      const position = 0.1 + leaf * spacing;
      const leafX = originX + (tipX - originX) * position;
      const leafY = originY + (tipY - originY) * position;
      const side = leaf % 2 === 0 ? 1 : -1;
      const leafAngle = angle + side * spread * between(random, 0.75, 1.25);
      const leafLength = Math.max(width, height) * scale * between(random, 0.75, 1.3);
      parts.push(`
    <path d="${leafPath(leafX, leafY, leafLength, leafLength * between(random, 0.22, 0.38), leafAngle)}"/>`);
    }
  }

  parts.push('\n  </g>');
  parts.push(finish(width, height, seed));
  return parts.join('');
}

/** Golden-hour water: banded sky, low sun, mirrored light on the surface. */
function horizonImage(width, height, paletteName, seed) {
  const random = createRandom(seed * 15485863);
  const colours = PALETTES[paletteName];
  const horizonY = height * between(random, 0.42, 0.68);
  const sunX = width * between(random, 0.14, 0.86);
  const sunRadius = Math.max(width, height) * between(random, 0.035, 0.11);
  const choppy = random() > 0.6;

  const parts = [openSvg(width, height), `
  <defs>
    <linearGradient id="sky${seed}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${colours[3]}"/>
      <stop offset="55%" stop-color="${colours[2]}"/>
      <stop offset="100%" stop-color="${colours[1]}"/>
    </linearGradient>
    <linearGradient id="water${seed}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${mix(colours[1], colours[0], 0.35)}"/>
      <stop offset="100%" stop-color="${colours[3]}"/>
    </linearGradient>
    <radialGradient id="sun${seed}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${mix(colours[0], '#FFFFFF', 0.65)}"/>
      <stop offset="100%" stop-color="${colours[1]}" stop-opacity="0"/>
    </radialGradient>${grainAndVignette(seed)}
  </defs>
  <rect width="${width}" height="${height}" fill="url(#sky${seed})"/>
  <circle cx="${round(sunX)}" cy="${round(horizonY - sunRadius * 0.2)}" r="${round(sunRadius * 3.2)}" fill="url(#sun${seed})" opacity="0.75"/>
  <circle cx="${round(sunX)}" cy="${round(horizonY - sunRadius * 0.2)}" r="${round(sunRadius)}" fill="${mix(colours[0], '#FFFFFF', 0.5)}" opacity="0.9"/>
  <rect y="${round(horizonY)}" width="${width}" height="${round(height - horizonY)}" fill="url(#water${seed})"/>`];

  const cloudCount = Math.round(between(random, 2, 5));
  for (let cloud = 0; cloud < cloudCount; cloud++) {
    const cloudY = horizonY * between(random, 0.12, 0.88);
    const cloudHeight = height * between(random, 0.012, 0.05);
    const cloudX = width * between(random, -0.25, 0.55);
    const cloudWidth = width * between(random, 0.35, 0.95);
    parts.push(`
  <rect x="${round(cloudX)}" y="${round(cloudY)}" width="${round(cloudWidth)}" height="${round(cloudHeight)}" rx="${round(cloudHeight / 2)}" fill="${mix(colours[0], colours[2], between(random, 0.2, 0.7))}" fill-opacity="${between(random, 0.12, 0.4).toFixed(2)}"/>`);
  }
  if (random() > 0.55) {
    const landHeight = height * between(random, 0.006, 0.018);
    parts.push(`
  <rect x="0" y="${round(horizonY - landHeight)}" width="${width}" height="${round(landHeight)}" fill="${mix(colours[3], '#000000', 0.25)}" fill-opacity="0.55"/>`);
  }

  const reflectionCount = Math.round(between(random, 14, 30));
  const taper = between(random, 1.0, 1.9);
  const spreadFactor = between(random, 0.08, 0.24);
  for (let index = 0; index < reflectionCount; index++) {
    const bandY = horizonY + (height - horizonY) * Math.pow(index / reflectionCount, taper);
    const bandHeight = Math.max(1.5, (height - horizonY) * 0.012 * (1 + index * 0.16));
    const bandWidth = sunRadius * between(random, 1.2, 3.2) * (1 + index * spreadFactor);
    const drift = choppy ? sunRadius * between(random, -1.6, 1.6) : sunRadius * between(random, -0.25, 0.25);
    parts.push(`
  <rect x="${round(sunX + drift - bandWidth / 2)}" y="${round(bandY)}" width="${round(bandWidth)}" height="${round(bandHeight)}" rx="${round(bandHeight / 2)}" fill="${mix(colours[0], '#FFFFFF', 0.4)}" fill-opacity="${Math.max(0.05, (choppy ? 0.38 : 0.55) - index * 0.018).toFixed(2)}"/>`);
  }

  parts.push(finish(width, height, seed));
  return parts.join('');
}

/** Portrait: a defocused figure turned toward the light. Abstract, no features. */
function portraitImage(width, height, paletteName, seed) {
  const random = createRandom(seed * 32452843);
  const colours = PALETTES[paletteName];
  const tilt = between(random, -16, -6);
  const headX = width * between(random, 0.44, 0.56);
  const headY = height * 0.36;
  const headWidth = Math.min(width, height) * 0.23;
  const headHeight = headWidth * 1.3;
  const shoulderTop = headY + headHeight * 1.5;
  const shoulderHalf = headWidth * 2.7;

  const figure =
    `M${round(headX - shoulderHalf)},${height} ` +
    `C${round(headX - shoulderHalf * 0.92)},${round(shoulderTop + headHeight * 0.3)} ${round(headX - headWidth * 1.15)},${round(shoulderTop - headHeight * 0.1)} ${round(headX - headWidth * 0.46)},${round(shoulderTop - headHeight * 0.55)} ` +
    `C${round(headX - headWidth * 0.5)},${round(headY + headHeight * 0.6)} ${round(headX - headWidth * 1.02)},${round(headY + headHeight * 0.55)} ${round(headX - headWidth)},${round(headY)} ` +
    `C${round(headX - headWidth)},${round(headY - headHeight * 0.95)} ${round(headX + headWidth)},${round(headY - headHeight * 0.95)} ${round(headX + headWidth)},${round(headY)} ` +
    `C${round(headX + headWidth * 1.02)},${round(headY + headHeight * 0.55)} ${round(headX + headWidth * 0.5)},${round(headY + headHeight * 0.6)} ${round(headX + headWidth * 0.46)},${round(shoulderTop - headHeight * 0.55)} ` +
    `C${round(headX + headWidth * 1.15)},${round(shoulderTop - headHeight * 0.1)} ${round(headX + shoulderHalf * 0.92)},${round(shoulderTop + headHeight * 0.3)} ${round(headX + shoulderHalf)},${height} Z`;

  const parts = [openSvg(width, height), `
  <defs>
    <linearGradient id="air${seed}" x1="10%" y1="0%" x2="90%" y2="100%">
      <stop offset="0%" stop-color="${mix(colours[1], '#FFFFFF', 0.35)}"/>
      <stop offset="50%" stop-color="${colours[2]}"/>
      <stop offset="100%" stop-color="${colours[3]}"/>
    </linearGradient>
    <linearGradient id="figure${seed}" x1="12%" y1="8%" x2="82%" y2="92%">
      <stop offset="0%" stop-color="${mix(colours[1], '#FFFFFF', 0.3)}"/>
      <stop offset="38%" stop-color="${mix(colours[2], mix(colours[1], '#FFFFFF', 0.3), 0.35)}"/>
      <stop offset="100%" stop-color="${mix(colours[3], '#1E1812', 0.35)}"/>
    </linearGradient>
    <radialGradient id="sunspot${seed}" cx="22%" cy="12%" r="62%">
      <stop offset="0%" stop-color="${mix(colours[0], '#FFFFFF', 0.75)}" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="${colours[1]}" stop-opacity="0"/>
    </radialGradient>
    <filter id="soften${seed}" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="${round(Math.max(width, height) * 0.014)}"/>
    </filter>
    <filter id="farblur${seed}" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="${round(Math.max(width, height) * 0.026)}"/>
    </filter>
    <filter id="nearblur${seed}" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="${round(Math.max(width, height) * 0.006)}"/>
    </filter>${grainAndVignette(seed)}
  </defs>
  <rect width="${width}" height="${height}" fill="url(#air${seed})"/>`];

  parts.push(`
  <g filter="url(#farblur${seed})" fill="${PALETTES.sage[3]}" fill-opacity="0.26">`);
  for (let leaf = 0; leaf < 6; leaf++) {
    const originX = width * between(random, -0.1, 1.1);
    const originY = height * between(random, -0.05, 0.75);
    const angle = between(random, -2.4, 2.4);
    const length = Math.max(width, height) * between(random, 0.22, 0.42);
    parts.push(`
    <path d="${leafPath(originX, originY, length, length * 0.3, angle)}"/>`);
  }
  parts.push('\n  </g>');

  parts.push(`
  <g filter="url(#soften${seed})" transform="rotate(${tilt.toFixed(1)} ${round(headX)} ${round(headY + headHeight)})">
    <path d="${figure}" fill="url(#figure${seed})" fill-opacity="0.95"/>
    <ellipse cx="${round(headX - headWidth * 0.34)}" cy="${round(headY - headHeight * 0.22)}" rx="${round(headWidth * 0.5)}" ry="${round(headHeight * 0.44)}" fill="${mix(colours[0], '#FFFFFF', 0.6)}" fill-opacity="0.30"/>
  </g>
  <rect width="${width}" height="${height}" fill="url(#sunspot${seed})"/>`);

  parts.push(`
  <g filter="url(#nearblur${seed})">`);
  for (let leaf = 0; leaf < 5; leaf++) {
    const fromLeft = leaf % 2 === 0;
    const originX = fromLeft ? width * between(random, -0.08, 0.04) : width * between(random, 0.96, 1.08);
    const originY = height * between(random, 0.02, 0.6);
    const angle = fromLeft ? between(random, -0.5, 0.6) : Math.PI + between(random, -0.6, 0.5);
    const length = Math.max(width, height) * between(random, 0.26, 0.46);
    parts.push(`
    <path d="${leafPath(originX, originY, length, length * 0.2, angle)}" fill="${PALETTES.sage[3]}" fill-opacity="${between(random, 0.45, 0.75).toFixed(2)}"/>`);
  }
  parts.push('\n  </g>');

  parts.push(finish(width, height, seed));
  return parts.join('');
}

const GENERATORS = { bloom: bloomImage, shadow: shadowImage, horizon: horizonImage, portrait: portraitImage };

const IMAGE_SPECS = [
  ['hero-bloom.svg', 'bloom', 'poppy', 1600, 1100],
  ['work-01-poppy.svg', 'bloom', 'poppy', 1200, 1500],
  ['work-02-clematis.svg', 'bloom', 'clematis', 1200, 1500],
  ['work-03-shadow.svg', 'shadow', 'shadow', 1200, 1500],
  ['work-04-horizon.svg', 'horizon', 'coast', 1500, 1000],
  ['work-05-portrait.svg', 'portrait', 'dusk', 1200, 1500],
  ['work-06-sage.svg', 'shadow', 'sage', 1200, 1200],
  ['work-07-dusk.svg', 'horizon', 'dusk', 1200, 1500],
  ['work-08-bloom.svg', 'bloom', 'sage', 1200, 1200],
  ['work-09-shadowwall.svg', 'shadow', 'poppy', 1500, 1000],
  ['work-10-coast.svg', 'horizon', 'coast', 1200, 1500],
  ['work-11-clematis.svg', 'bloom', 'clematis', 1200, 1200],
  ['work-12-portrait.svg', 'portrait', 'sage', 1200, 1500],
  ['exhibition-bloom.svg', 'bloom', 'poppy', 1400, 900],
  ['exhibition-subtle.svg', 'shadow', 'shadow', 1400, 900],
  ['exhibition-iseeyou.svg', 'portrait', 'clematis', 1400, 900],
  ['about-portrait.svg', 'portrait', 'sage', 1100, 1400],
  // "Gigantically Subtle" — the sequence of nine, hung as one line.
  ['subtle-01.svg', 'shadow', 'shadow', 1000, 1250],
  ['subtle-02.svg', 'shadow', 'shadow', 1000, 1250],
  ['subtle-03.svg', 'shadow', 'sage', 1000, 1250],
  ['subtle-04.svg', 'shadow', 'shadow', 1000, 1250],
  ['subtle-05.svg', 'shadow', 'poppy', 1000, 1250],
  ['subtle-06.svg', 'shadow', 'sage', 1000, 1250],
  ['subtle-07.svg', 'shadow', 'shadow', 1000, 1250],
  ['subtle-08.svg', 'shadow', 'dusk', 1000, 1250],
  ['subtle-09.svg', 'shadow', 'dusk', 1000, 1250],
  ['subtle-hero.svg', 'shadow', 'shadow', 1800, 1000],
  // "Like a flower you shall bloom".
  ['bloom-hero.svg', 'bloom', 'poppy', 1800, 1000],
  ['bloom-01.svg', 'bloom', 'poppy', 1000, 1250],
  ['bloom-02.svg', 'bloom', 'clematis', 1000, 1250],
  ['bloom-03.svg', 'bloom', 'sage', 1000, 1250],
  ['bloom-04.svg', 'bloom', 'dusk', 1000, 1250],
  ['bloom-05.svg', 'bloom', 'poppy', 1000, 1250],
  ['bloom-06.svg', 'bloom', 'clematis', 1000, 1250],
  // "Greve, at the hour of gold".
  ['coast-hero.svg', 'horizon', 'coast', 1800, 1000],
  ['coast-01.svg', 'horizon', 'coast', 1250, 1000],
  ['coast-02.svg', 'horizon', 'dusk', 1250, 1000],
  ['coast-03.svg', 'horizon', 'coast', 1250, 1000],
  ['coast-04.svg', 'horizon', 'poppy', 1250, 1000],
  ['coast-05.svg', 'horizon', 'dusk', 1250, 1000],
  ['coast-06.svg', 'horizon', 'clematis', 1250, 1000],
  ['exhibitions-hero.svg', 'bloom', 'dusk', 1800, 950],
  // "I See You" — the guided evening.
  ['iseeyou-hero.svg', 'portrait', 'dusk', 1800, 1000],
  ['iseeyou-01.svg', 'portrait', 'clematis', 1100, 1400],
  ['iseeyou-02.svg', 'portrait', 'dusk', 1100, 1400],
  ['iseeyou-03.svg', 'bloom', 'clematis', 1100, 1400],
  // Sessions.
  ['sessions-hero.svg', 'shadow', 'sage', 1800, 1000],
  ['sessions-room.svg', 'shadow', 'shadow', 1300, 950],
  // Kvindecirkel.
  ['circle-hero.svg', 'bloom', 'poppy', 1800, 1000],
  ['circle-01.svg', 'bloom', 'sage', 1100, 1100],
  ['circle-02.svg', 'bloom', 'dusk', 1100, 1100],
  ['circle-03.svg', 'horizon', 'poppy', 1100, 1100],
  ['circle-04.svg', 'shadow', 'clematis', 1100, 1100],
];

fs.mkdirSync(outputDirectory, { recursive: true });
IMAGE_SPECS.forEach(([filename, kind, palette, width, height], index) => {
  fs.writeFileSync(path.join(outputDirectory, filename), GENERATORS[kind](width, height, palette, index + 1), 'utf8');
});
console.log(`wrote ${IMAGE_SPECS.length} placeholder images`);
