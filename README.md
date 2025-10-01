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

## 📚 API Overview

### Core Methods

- `get(t)` - Get point at position t (0-1)
- `compute(t)` - Compute point on curve
- `derivative(t)` - Get first derivative
- `normal(t)` - Get normal vector
- `length()` - Calculate curve length
- `bbox()` - Get bounding box
- `extrema()` - Find extreme points

### Geometric Operations

- `split(t1, t2)` - Split curve into segments
- `offset(distance)` - Create offset curve
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
