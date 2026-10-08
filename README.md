# Cloth Simulation Studio

A professional-grade cloth physics playground with real-time rendering, realistic material presets, and intuitive controls.

## Features

- **Real-time Physics Engine**: Constraint-based cloth solver with Verlet integration
- **Material Presets**: Silk, Linen, Denim, Wool, and Rubber with realistic tuning
- **Interaction Modes**: Grab, Tear, Wind, and Pin interactions
- **Live Controls**: Adjust physics parameters in real-time
- **Responsive Design**: Works on desktop and mobile devices
- **Performance Monitoring**: Built-in FPS counter

## Quick Start

### Using Python
```bash
python3 -m http.server 8000
```

### Using Node.js
```bash
npx http-server
```

Then open your browser to `http://localhost:8000`

## Controls

- **Left Click + Drag**: Grab and move the cloth
- **Right Click + Drag**: Tear the cloth (Tear mode)
- **Press R**: Reset the mesh
- **UI Panel**: Adjust physics parameters and switch modes

## Physics Parameters

- **Stiffness**: How rigid the cloth constraints are (0.1-1.0)
- **Damping**: Energy loss per frame (0.95-1.0)
- **Gravity**: Downward force strength (0.0-1.5)
- **Tear Threshold**: Distance before links break (5-120)
- **Wind Strength**: Environmental force on cloth (0.0-3.5)
- **Bounce**: Elasticity on ground collision (0.0-0.8)
- **Iterations**: Constraint solver iterations (2-15)

## Cloth Parameters

- **Width**: Horizontal point count (30-120)
- **Height**: Vertical point count (20-80)
- **Spacing**: Distance between points (8-22px)

## Material Presets

### Silk
- Light, smooth fabric with high damping
- Flows gracefully with minimal drag

### Linen
- Structured, slightly stiff natural fabric
- Holds form better than silk

### Denim
- Heavy, durable fabric with low damping
- Resists tearing and bending

### Wool
- Thick, dense fabric with high friction
- Falls with weight and substance

### Rubber
- Elastic, bouncy synthetic material
- High stiffness and bounce coefficient

## Technical Details

### Architecture
- **physics.js**: Core simulation (Point, Link, ClothSimulation classes)
- **renderer.js**: Canvas rendering with color-based strain visualization
- **presets.js**: Material property configurations
- **ui.js**: Interactive controls and slider management
- **app.js**: Main application loop and event handling

### Performance
- Canvas 2D rendering for maximum compatibility
- Optimized constraint solver with configurable iterations
- Delta-time aware updates for consistent behavior
- Touch and pointer event handling

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Mobile)

## License

MIT License - Feel free to use and modify for your projects.
