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

function hexToRgb(color) {
  return [1, 3, 5].map((offset) => parseInt(color.slice(offset, offset + 2), 16));
}

function rgbToHex(channels) {
  return '#' + channels.map((channel) => Math.round(channel).toString(16).padStart(2, '0').toUpperCase()).join('');
}

function mix(firstColor, secondColor, amount) {
  const first = hexToRgb(firstColor);
  const second = hexToRgb(secondColor);
  return rgbToHex(first.map((channel, index) => channel + (second[index] - channel) * amount));
}

const round = (value) => Number(value.toFixed(1));

function petalPath(centerX, centerY, innerRadius, outerRadius, angle, spread) {
  const leftAngle = angle - spread;
  const rightAngle = angle + spread;
  const startX = centerX + Math.cos(leftAngle) * innerRadius;
  const startY = centerY + Math.sin(leftAngle) * innerRadius;
  const tipX = centerX + Math.cos(angle) * outerRadius;
  const tipY = centerY + Math.sin(angle) * outerRadius;
  const endX = centerX + Math.cos(rightAngle) * innerRadius;
  const endY = centerY + Math.sin(rightAngle) * innerRadius;
  const controlLeftX = centerX + Math.cos(leftAngle) * outerRadius * 0.92;
  const controlLeftY = centerY + Math.sin(leftAngle) * outerRadius * 0.92;
  const controlRightX = centerX + Math.cos(rightAngle) * outerRadius * 0.92;
  const controlRightY = centerY + Math.sin(rightAngle) * outerRadius * 0.92;
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

function grainAndVignette(seed) {
  return `
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
}

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
  const colors = PALETTES[paletteName];
  const centerX = width * between(random, 0.42, 0.58);
  const centerY = height * between(random, 0.44, 0.56);
  const maxRadius = Math.max(width, height) * 0.62;

  const parts = [
    openSvg(width, height),
    `
  <defs>
    <radialGradient id="ground${seed}" cx="${Math.round((centerX / width) * 100)}%" cy="${Math.round((centerY / height) * 100)}%" r="85%">
      <stop offset="0%" stop-color="${colors[1]}"/>
      <stop offset="60%" stop-color="${colors[2]}"/>
      <stop offset="100%" stop-color="${colors[3]}"/>
    </radialGradient>
    <radialGradient id="heart${seed}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${mix(colors[0], '#FFFFFF', 0.5)}"/>
      <stop offset="70%" stop-color="${colors[1]}"/>
      <stop offset="100%" stop-color="${colors[2]}" stop-opacity="0.2"/>
    </radialGradient>${grainAndVignette(seed)}
  </defs>
  <rect width="${width}" height="${height}" fill="url(#ground${seed})"/>`,
  ];

  const rings = [
    [0.95, 7, 0.3],
    [0.68, 6, 0.34],
    [0.44, 5, 0.38],
  ];
  rings.forEach(([radiusScale, petalCount, spread], ringIndex) => {
    const rotation = between(random, 0, Math.PI);
    for (let petalIndex = 0; petalIndex < petalCount; petalIndex++) {
      const angle = rotation + petalIndex * ((2 * Math.PI) / petalCount);
      const outerRadius = maxRadius * radiusScale * between(random, 0.88, 1.08);
      const fill = mix(colors[2], colors[0], 0.16 + ringIndex * 0.2);
      const opacity = (0.72 - ringIndex * 0.06).toFixed(2);
      parts.push(`
  <path d="${petalPath(centerX, centerY, maxRadius * 0.1, outerRadius, angle, spread)}" fill="${fill}" fill-opacity="${opacity}"/>`);
    }
  });

  const heartRadius = maxRadius * 0.17;
  parts.push(`
  <circle cx="${round(centerX)}" cy="${round(centerY)}" r="${round(heartRadius)}" fill="url(#heart${seed})"/>`);
  for (let stamenIndex = 0; stamenIndex < 26; stamenIndex++) {
    const angle = stamenIndex * ((2 * Math.PI) / 26) + between(random, -0.1, 0.1);
    const inner = heartRadius * 0.55;
    const outer = heartRadius * between(random, 1.15, 1.6);
    parts.push(`
  <line x1="${round(centerX + Math.cos(angle) * inner)}" y1="${round(centerY + Math.sin(angle) * inner)}" x2="${round(centerX + Math.cos(angle) * outer)}" y2="${round(centerY + Math.sin(angle) * outer)}" stroke="${mix(colors[0], colors[3], 0.35)}" stroke-width="${round(maxRadius * 0.008)}" stroke-linecap="round" stroke-opacity="0.55"/>`);
  }

  parts.push(finish(width, height, seed));
  return parts.join('');
}

/** Leaf shadows falling across a sunlit wall — the "Gigantically Subtle" feel. */
function shadowImage(width, height, paletteName, seed) {
  const random = createRandom(seed * 104729);
  const colors = PALETTES[paletteName];
  // Sharpness and light direction drift with the sun.
  const shadowSoftness = between(random, 0.005, 0.024);
  const lightAngle = Math.round(between(random, 0, 130));
  const parts = [
    openSvg(width, height),
    `
  <defs>
    <linearGradient id="wall${seed}" gradientTransform="rotate(${lightAngle} 0.5 0.5)">
      <stop offset="0%" stop-color="${mix(colors[0], '#FFFFFF', 0.35)}"/>
      <stop offset="55%" stop-color="${colors[1]}"/>
      <stop offset="100%" stop-color="${colors[2]}"/>
    </linearGradient>
    <filter id="blur${seed}" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="${round(Math.max(width, height) * shadowSoftness)}"/>
    </filter>${grainAndVignette(seed)}
  </defs>
  <rect width="${width}" height="${height}" fill="url(#wall${seed})"/>
  <g filter="url(#blur${seed})" fill="${colors[3]}" fill-opacity="0.30">`,
  ];

  // One or two stems, each with its own lean, curvature and leaf rhythm — a
  // shadow at 14:30 should not look like the same shadow at 17:40.
  const stemCount = random() > 0.55 ? 2 : 1;
  for (let stemIndex = 0; stemIndex < stemCount; stemIndex++) {
    const stemOriginX = width * between(random, -0.15, 0.75);
    const stemOriginY = height * between(random, 0.8, 1.12);
    const stemAngle = between(random, -1.75, -0.45);
    const stemLength = Math.max(width, height) * between(random, 0.7, 1.15);
    const stemTipX = stemOriginX + Math.cos(stemAngle) * stemLength;
    const stemTipY = stemOriginY + Math.sin(stemAngle) * stemLength;
    const bow = width * between(random, -0.22, 0.28);
    const stemOpacity = between(random, 0.18, 0.34).toFixed(2);
    parts.push(`
    <path d="M${round(stemOriginX)},${round(stemOriginY)} Q${round((stemOriginX + stemTipX) / 2 + bow)},${round((stemOriginY + stemTipY) / 2)} ${round(stemTipX)},${round(stemTipY)}" stroke="${colors[3]}" stroke-opacity="${stemOpacity}" stroke-width="${round(width * between(random, 0.006, 0.016))}" fill="none"/>`);

    const leafCount = Math.round(between(random, 5, 11));
    const spacing = between(random, 0.07, 0.13);
    const leafSpread = between(random, 0.55, 1.35);
    const leafScale = between(random, 0.13, 0.34);
    for (let leafIndex = 0; leafIndex < leafCount; leafIndex++) {
      const position = 0.1 + leafIndex * spacing;
      const originX = stemOriginX + (stemTipX - stemOriginX) * position;
      const originY = stemOriginY + (stemTipY - stemOriginY) * position;
      const side = leafIndex % 2 === 0 ? 1 : -1;
      const angle = stemAngle + side * leafSpread * between(random, 0.75, 1.25);
      const length = Math.max(width, height) * leafScale * between(random, 0.75, 1.3);
      parts.push(`
    <path d="${leafPath(originX, originY, length, length * between(random, 0.22, 0.38), angle)}"/>`);
    }
  }

  parts.push('\n  </g>');
  parts.push(finish(width, height, seed));
  return parts.join('');
}

/** Golden-hour water: banded sky, low sun, mirrored light on the surface. */
function horizonImage(width, height, paletteName, seed) {
  const random = createRandom(seed * 15485863);
  const colors = PALETTES[paletteName];
  const horizonY = height * between(random, 0.42, 0.68);
  const sunX = width * between(random, 0.14, 0.86);
  const sunRadius = Math.max(width, height) * between(random, 0.035, 0.11);
  const choppy = random() > 0.6;

  const parts = [
    openSvg(width, height),
    `
  <defs>
    <linearGradient id="sky${seed}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${colors[3]}"/>
      <stop offset="55%" stop-color="${colors[2]}"/>
      <stop offset="100%" stop-color="${colors[1]}"/>
    </linearGradient>
    <linearGradient id="water${seed}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${mix(colors[1], colors[0], 0.35)}"/>
      <stop offset="100%" stop-color="${colors[3]}"/>
    </linearGradient>
    <radialGradient id="sun${seed}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${mix(colors[0], '#FFFFFF', 0.65)}"/>
      <stop offset="100%" stop-color="${colors[1]}" stop-opacity="0"/>
    </radialGradient>${grainAndVignette(seed)}
  </defs>
  <rect width="${width}" height="${height}" fill="url(#sky${seed})"/>
  <circle cx="${round(sunX)}" cy="${round(horizonY - sunRadius * 0.2)}" r="${round(sunRadius * 3.2)}" fill="url(#sun${seed})" opacity="0.75"/>
  <circle cx="${round(sunX)}" cy="${round(horizonY - sunRadius * 0.2)}" r="${round(sunRadius)}" fill="${mix(colors[0], '#FFFFFF', 0.5)}" opacity="0.9"/>
  <rect y="${round(horizonY)}" width="${width}" height="${round(height - horizonY)}" fill="url(#water${seed})"/>`,
  ];

  // Soft cloud strata, and sometimes a low land strip on the far shore.
  const cloudCount = Math.round(between(random, 2, 5));
  for (let cloudIndex = 0; cloudIndex < cloudCount; cloudIndex++) {
    const cloudY = horizonY * between(random, 0.12, 0.88);
    const cloudHeight = height * between(random, 0.012, 0.05);
    const cloudX = width * between(random, -0.25, 0.55);
    const cloudWidth = width * between(random, 0.35, 0.95);
    parts.push(`
  <rect x="${round(cloudX)}" y="${round(cloudY)}" width="${round(cloudWidth)}" height="${round(cloudHeight)}" rx="${round(cloudHeight / 2)}" fill="${mix(colors[0], colors[2], between(random, 0.2, 0.7))}" fill-opacity="${between(random, 0.12, 0.4).toFixed(2)}"/>`);
  }
  if (random() > 0.55) {
    const landHeight = height * between(random, 0.006, 0.018);
    parts.push(`
  <rect x="0" y="${round(horizonY - landHeight)}" width="${width}" height="${round(landHeight)}" fill="${mix(colors[3], '#000000', 0.25)}" fill-opacity="0.55"/>`);
  }

  // Calm evenings give a clean sun path; choppy ones scatter the light sideways.
  const reflectionCount = Math.round(between(random, 14, 30));
  const taper = between(random, 1.0, 1.9);
  const spreadFactor = between(random, 0.08, 0.24);
  for (let reflectionIndex = 0; reflectionIndex < reflectionCount; reflectionIndex++) {
    const progress = reflectionIndex / reflectionCount;
    const bandY = horizonY + (height - horizonY) * Math.pow(progress, taper);
    const bandHeight = Math.max(1.5, (height - horizonY) * 0.012 * (1 + reflectionIndex * 0.16));
    const bandWidth = sunRadius * between(random, 1.2, 3.2) * (1 + reflectionIndex * spreadFactor);
    const drift = choppy ? sunRadius * between(random, -1.6, 1.6) : sunRadius * between(random, -0.25, 0.25);
    const opacity = Math.max(0.05, (choppy ? 0.38 : 0.55) - reflectionIndex * 0.018).toFixed(2);
    parts.push(`
  <rect x="${round(sunX + drift - bandWidth / 2)}" y="${round(bandY)}" width="${round(bandWidth)}" height="${round(bandHeight)}" rx="${round(bandHeight / 2)}" fill="${mix(colors[0], '#FFFFFF', 0.4)}" fill-opacity="${opacity}"/>`);
  }

  parts.push(finish(width, height, seed));
  return parts.join('');
}

/** Portrait: a defocused figure turned toward the light. Abstract — no facial features. */
function portraitImage(width, height, paletteName, seed) {
  const random = createRandom(seed * 32452843);
  const colors = PALETTES[paletteName];
  const tilt = between(random, -16, -6);
  const headCenterX = width * between(random, 0.44, 0.56);
  const headCenterY = height * 0.36;
  const headWidth = Math.min(width, height) * 0.23;
  const headHeight = headWidth * 1.3;
  const shoulderTop = headCenterY + headHeight * 1.5;
  const shoulderHalf = headWidth * 2.7;
  const figureDark = mix(colors[3], '#1E1812', 0.35);
  const figureLit = mix(colors[1], '#FFFFFF', 0.3);

  const figurePath =
    `M${round(headCenterX - shoulderHalf)},${height} ` +
    `C${round(headCenterX - shoulderHalf * 0.92)},${round(shoulderTop + headHeight * 0.3)} ` +
    `${round(headCenterX - headWidth * 1.15)},${round(shoulderTop - headHeight * 0.1)} ` +
    `${round(headCenterX - headWidth * 0.46)},${round(shoulderTop - headHeight * 0.55)} ` +
    `C${round(headCenterX - headWidth * 0.5)},${round(headCenterY + headHeight * 0.6)} ` +
    `${round(headCenterX - headWidth * 1.02)},${round(headCenterY + headHeight * 0.55)} ` +
    `${round(headCenterX - headWidth * 1.0)},${round(headCenterY)} ` +
    `C${round(headCenterX - headWidth * 1.0)},${round(headCenterY - headHeight * 0.95)} ` +
    `${round(headCenterX + headWidth * 1.0)},${round(headCenterY - headHeight * 0.95)} ` +
    `${round(headCenterX + headWidth * 1.0)},${round(headCenterY)} ` +
    `C${round(headCenterX + headWidth * 1.02)},${round(headCenterY + headHeight * 0.55)} ` +
    `${round(headCenterX + headWidth * 0.5)},${round(headCenterY + headHeight * 0.6)} ` +
    `${round(headCenterX + headWidth * 0.46)},${round(shoulderTop - headHeight * 0.55)} ` +
    `C${round(headCenterX + headWidth * 1.15)},${round(shoulderTop - headHeight * 0.1)} ` +
    `${round(headCenterX + shoulderHalf * 0.92)},${round(shoulderTop + headHeight * 0.3)} ` +
    `${round(headCenterX + shoulderHalf)},${height} Z`;

  const parts = [
    openSvg(width, height),
    `
  <defs>
    <linearGradient id="air${seed}" x1="10%" y1="0%" x2="90%" y2="100%">
      <stop offset="0%" stop-color="${mix(colors[1], '#FFFFFF', 0.35)}"/>
      <stop offset="50%" stop-color="${colors[2]}"/>
      <stop offset="100%" stop-color="${colors[3]}"/>
    </linearGradient>
    <linearGradient id="figure${seed}" x1="12%" y1="8%" x2="82%" y2="92%">
      <stop offset="0%" stop-color="${figureLit}"/>
      <stop offset="38%" stop-color="${mix(colors[2], figureLit, 0.35)}"/>
      <stop offset="100%" stop-color="${figureDark}"/>
    </linearGradient>
    <radialGradient id="sunspot${seed}" cx="22%" cy="12%" r="62%">
      <stop offset="0%" stop-color="${mix(colors[0], '#FFFFFF', 0.75)}" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="${colors[1]}" stop-opacity="0"/>
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
  <rect width="${width}" height="${height}" fill="url(#air${seed})"/>`,
  ];

  // Out-of-focus foliage well behind the figure.
  parts.push(`
  <g filter="url(#farblur${seed})" fill="${PALETTES.sage[3]}" fill-opacity="0.26">`);
  for (let backgroundLeaf = 0; backgroundLeaf < 6; backgroundLeaf++) {
    const originX = width * between(random, -0.1, 1.1);
    const originY = height * between(random, -0.05, 0.75);
    const angle = between(random, -2.4, 2.4);
    const length = Math.max(width, height) * between(random, 0.22, 0.42);
    parts.push(`
    <path d="${leafPath(originX, originY, length, length * 0.3, angle)}"/>`);
  }
  parts.push('\n  </g>');

  // The figure: one soft silhouette, rim-lit, no features.
  parts.push(`
  <g filter="url(#soften${seed})" transform="rotate(${tilt.toFixed(1)} ${round(headCenterX)} ${round(headCenterY + headHeight)})">
    <path d="${figurePath}" fill="url(#figure${seed})" fill-opacity="0.95"/>
    <ellipse cx="${round(headCenterX - headWidth * 0.34)}" cy="${round(headCenterY - headHeight * 0.22)}" rx="${round(headWidth * 0.5)}" ry="${round(headHeight * 0.44)}" fill="${mix(colors[0], '#FFFFFF', 0.6)}" fill-opacity="0.30"/>
    <path d="M${round(headCenterX + headWidth * 0.55)},${round(headCenterY - headHeight * 0.6)} C${round(headCenterX + headWidth * 1.15)},${round(headCenterY - headHeight * 0.1)} ${round(headCenterX + headWidth * 1.0)},${round(headCenterY + headHeight * 0.7)} ${round(headCenterX + headWidth * 0.5)},${round(shoulderTop)}" stroke="${mix(colors[0], '#FFFFFF', 0.7)}" stroke-opacity="0.35" stroke-width="${round(headWidth * 0.09)}" fill="none" stroke-linecap="round"/>
  </g>
  <rect width="${width}" height="${height}" fill="url(#sunspot${seed})"/>`);

  // Foreground leaves crossing the frame, only slightly soft.
  parts.push(`
  <g filter="url(#nearblur${seed})">`);
  for (let leafIndex = 0; leafIndex < 5; leafIndex++) {
    const fromLeft = leafIndex % 2 === 0;
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

const GENERATORS = {
  bloom: bloomImage,
  shadow: shadowImage,
  horizon: horizonImage,
  portrait: portraitImage,
};

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
  // "Like a flower you shall bloom" — series page imagery.
  ['bloom-hero.svg', 'bloom', 'poppy', 1800, 1000],
  ['bloom-01.svg', 'bloom', 'poppy', 1000, 1250],
  ['bloom-02.svg', 'bloom', 'clematis', 1000, 1250],
  ['bloom-03.svg', 'bloom', 'sage', 1000, 1250],
  ['bloom-04.svg', 'bloom', 'dusk', 1000, 1250],
  ['bloom-05.svg', 'bloom', 'poppy', 1000, 1250],
  ['bloom-06.svg', 'bloom', 'clematis', 1000, 1250],
  // "Greve, at the hour of gold" — the coast series.
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
  // Sessions — the therapy practice.
  ['sessions-hero.svg', 'shadow', 'sage', 1800, 1000],
  ['sessions-room.svg', 'shadow', 'shadow', 1300, 950],
  // Kvindecirkel — the seasonal women's circle.
  ['circle-hero.svg', 'bloom', 'poppy', 1800, 1000],
  ['circle-01.svg', 'bloom', 'sage', 1100, 1100],
  ['circle-02.svg', 'bloom', 'dusk', 1100, 1100],
  ['circle-03.svg', 'horizon', 'poppy', 1100, 1100],
  ['circle-04.svg', 'shadow', 'clematis', 1100, 1100],
];

fs.mkdirSync(outputDirectory, { recursive: true });
IMAGE_SPECS.forEach(([filename, kind, palette, width, height], index) => {
  const markup = GENERATORS[kind](width, height, palette, index + 1);
  fs.writeFileSync(path.join(outputDirectory, filename), markup, 'utf8');
  console.log(`wrote ${filename} (${kind}/${palette}, ${width}x${height})`);
});
