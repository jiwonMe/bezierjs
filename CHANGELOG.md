# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2025-10-01

### ✨ Added

#### New Methods (100% Backward Compatible)
- **`offsetPoint(t, distance)`** - Get offset point with metadata (clearer than `offset()`)
- **`offsetCurve(distance)`** - Create offset curve (clearer than `offset()`)
- **`findParameter(point, options)`** - Find parameter with detailed result (better than `on()`)
- **`sample(count)`** - Sample n points evenly along the curve
- **`closestPoint(point)`** - Find closest point on curve with distance
- **`getInfo()`** - Get comprehensive curve metadata
- **`contains(point, options)`** - Check if point is on curve

#### Error Handling
- **`KirbError`** class for better error messages
- **`ErrorCodes`** enum for error identification
- Detailed error context in `details` property
- Parameter validation with helpful suggestions

#### Documentation
- Added JSDoc type hints to all methods
- Comprehensive API documentation
- Usage examples for new methods
- Error handling examples

### 🔧 Improved

#### API Consistency
- All methods now use default parameters (no more `||` operators)
- Consistent parameter naming across methods
- Clearer method names for overloaded functions

#### Code Quality
- Better error messages with context
- Improved type hints for better IDE support
- More descriptive function signatures

### 🔄 Deprecated (Still Works)

- `offset(t, d?)` - Use `offsetPoint()` or `offsetCurve()` instead
- `on(point, error)` - Use `findParameter()` instead

### 📊 Stats

- Bundle size: 21KB → 22.2KB (+1.2KB for better features)
- All 33 tests passing ✅
- 100% backward compatible ✅
- New utility methods: 6
- Improved methods: 8

### 🚀 Migration Guide

#### Old API (Still Works)
```javascript
const point = curve.offset(0.5, 10);
const t = curve.on(point, 5);
```

#### New API (Recommended)
```javascript
const result = curve.offsetPoint(0.5, 10);
console.log(result.point, result.normal);

const param = curve.findParameter(point, { tolerance: 5 });
if (param) console.log(param.t);
```

---

## [1.0.0] - 2025-10-01

### 🎉 Initial Release

- Modern modular Bezier curve library
- 2D and 3D curve support
- Comprehensive geometric operations
- Clean, maintainable codebase (14 modules, all < 300 LOC)
- Full test coverage (33 tests)
- ESM + CommonJS support

