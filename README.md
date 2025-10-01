# kirb 🎨

> Modern modular Bezier curve library for 2D and 3D geometric operations

[![npm version](https://img.shields.io/npm/v/kirb.svg)](https://www.npmjs.com/package/kirb)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- 🎯 **2D & 3D Support** - Full support for 2D and 3D Bezier curves
- 📦 **Modular Architecture** - 14 focused modules, all under 300 lines
- 🚀 **Modern ESM** - ES Module first with CommonJS support
- 🔧 **Comprehensive API** - Everything you need for Bezier curve operations
- 📐 **Geometric Operations** - Normals, curvatures, intersections, projections
- 🎨 **Offset & Outline** - Generate parallel curves and outlines
- ⚡ **Fast & Lightweight** - Only 21KB minified

## 📦 Installation

```bash
npm install kirb
```

```bash
pnpm add kirb
```

```bash
yarn add kirb
```

## 🚀 Quick Start

```javascript
import { Bezier } from 'kirb';

// Create a cubic Bezier curve
const curve = new Bezier(0, 0, 100, 25, 200, 75, 300, 100);

// Get a point at t=0.5
const point = curve.get(0.5);

// Get curve length
const length = curve.length();

// Split curve at t=0.5
const { left, right } = curve.split(0.5);

// Get curve normal at t=0.5
const normal = curve.normal(0.5);

// Find extrema
const extrema = curve.extrema();

// Get bounding box
const bbox = curve.bbox();
```

### 🆕 New API Examples

```javascript
// Clearer offset API
const offsetPt = curve.offsetPoint(0.5, 10);
console.log(offsetPt.point);    // { x, y }
console.log(offsetPt.normal);   // Normal vector
console.log(offsetPt.t);        // 0.5

const offsetCurves = curve.offsetCurve(10);  // Array of curves

// Better search
const result = curve.findParameter(point, { tolerance: 5 });
if (result) {
  console.log(result.t);        // Parameter value
  console.log(result.hits);     // Matching points
}

// Utility methods
const points = curve.sample(20);              // 20 evenly spaced points
const closest = curve.closestPoint(point);    // Closest point on curve
const info = curve.getInfo();                 // Curve metadata

// Check if point is on curve
if (curve.contains(point, { tolerance: 1 })) {
  console.log('Point is on curve!');
}
```

## 📚 API Overview

### Core Methods

- `get(t)` - Get point at position t (0-1)
- `compute(t)` - Compute point on curve
- `derivative(t)` - Get first derivative
- `normal(t)` - Get normal vector
- `length()` - Calculate curve length
- `bbox()` - Get bounding box
- `extrema()` - Find extreme points

### 🆕 New & Improved Methods

#### Offset Operations (Clearer API)
- `offsetPoint(t, distance)` - Get offset point at t ✨
- `offsetCurve(distance)` - Create offset curve ✨
- `offset(t, d?)` - Legacy method (still works)

#### Search & Analysis
- `findParameter(point, options)` - Find parameter for point ✨
- `closestPoint(point)` - Find closest point on curve ✨
- `contains(point, options)` - Check if point is on curve ✨
- `on(point, error)` - Legacy method (still works)

#### Utility Methods
- `sample(count)` - Sample n points evenly ✨
- `getInfo()` - Get curve metadata ✨

### Geometric Operations

- `split(t1, t2)` - Split curve into segments
- `outline(d1, d2)` - Generate curve outline
- `project(point)` - Project point onto curve
- `intersects(curve)` - Find intersections

### Curve Fitting

- `quadraticFromPoints(p1, p2, p3, t)` - Fit quadratic curve
- `cubicFromPoints(S, B, E, t)` - Fit cubic curve

### Analysis

- `curvature(t)` - Get curvature at t
- `inflections()` - Find inflection points
- `arcs(threshold)` - Approximate with circular arcs
- `reduce()` - Reduce to simple segments

### Error Handling

```javascript
import { Bezier, KirbError, ErrorCodes } from 'kirb';

try {
  curve.offsetPoint(2, 10);  // Out of range!
} catch (e) {
  if (e instanceof KirbError) {
    console.log(e.code);      // 'OUT_OF_RANGE'
    console.log(e.details);   // { t: 2, validRange: [0, 1] }
  }
}
```

## 🏗️ Project Structure

```
src/
├── bezier.js              # Main export
├── utils.js               # Utility functions
├── bezier/
│   ├── core.js           # Core Bezier class
│   ├── poly-bezier.js    # Multiple curves
│   ├── lookup.js         # LUT and search
│   ├── geometry.js       # Geometric operations
│   ├── offset.js         # Offset & scaling
│   ├── intersection.js   # Intersection detection
│   └── arcs.js          # Arc approximation
└── utils/
    ├── constants.js      # Mathematical constants
    ├── compute.js        # Curve computation
    ├── geometry.js       # Geometric utilities
    ├── roots.js          # Root finding
    ├── intersection.js   # Intersection helpers
    └── shape.js         # Shape utilities
```

## 🎯 Use Cases

- **Graphics & Animation** - SVG paths, canvas drawing, animations
- **Game Development** - Smooth trajectories, camera paths
- **UI/UX** - Custom easing, path morphing
- **CAD/CAM** - Technical drawing, manufacturing
- **Data Visualization** - Smooth curve interpolation

## 📖 Documentation

For detailed documentation, visit the [API Reference](https://github.com/jiwonMe/kirb).

Based on the comprehensive [Bezier Curve Primer](https://pomax.github.io/bezierinfo).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT © jiwonMe

---

**Credits:** Built on the foundations of [bezier-js](https://github.com/Pomax/bezierjs) by Pomax, modernized with a modular architecture.
