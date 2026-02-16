# WGSL Live Preview

Live preview for WGSL (WebGPU Shading Language) shaders with real-time compilation and rendering.

## Features

- **Live Preview** - See your shader rendered in real-time as you type
- **Instant Feedback** - Shader updates automatically on save (500ms debounce)
- **Error Display** - Clear compilation error messages with line numbers
- **Built-in Uniforms** - Time, resolution, mouse position automatically available
- **Clean Interface** - Focused rendering view with minimal distractions
- **Code Snippets** - Quick shader templates for rapid prototyping
- **Quick File Creation** - Create new WGSL shaders from Explorer context menu

## Usage

1. Open a `.wgsl` file
2. Press `Ctrl+Shift+W` (or `Cmd+Shift+W` on Mac)
3. Preview window opens beside your editor
4. Edit your shader and see changes in real-time

Alternatively, use Command Palette (`Ctrl+Shift+P`) and run **"WGSL: Show Live Preview"**.

### Creating New Shaders

**Method 1: Explorer Context Menu**
1. Right-click in Explorer (on a folder or empty space)
2. Select **"WGSL: Create New Shader"**
3. Enter a filename (e.g., `shader.wgsl`)
4. A new file with a basic shader template will be created and opened

**Method 2: Code Snippets**
1. Create or open a `.wgsl` file
2. Type one of the snippet triggers:
   - `wgsl-t` - Full shader template with vertex/fragment stages and structs
   - `wgsl-q` - Simple fullscreen quad shader using `wgsl_globals`
3. Press `Tab` or `Enter` to insert the template

## Available Globals

Your shader automatically has access to a uniform buffer with useful data:
```wgsl
struct WGSLGlobals {
    time: f32,           // Time in seconds since preview opened
    time_delta: f32,     // Time between frames (for physics/animation)
    frame: u32,          // Frame number since preview opened
    _padding1: u32,
    
    resolution: vec2f,   // Canvas resolution in pixels
    mouse: vec2f,        // Mouse position normalized [0-1]
    
    mouse_click: vec2f,  // Last click position normalized [0-1]
    mouse_buttons: u32,  // Mouse button state (left=1, right=2, middle=4)
    _padding2: u32,
}

@group(3) @binding(0) var<uniform> wgsl_globals: WGSLGlobals;
```

**Note:** The extension automatically injects this struct before your shader code. You can use `wgsl_globals` directly without declaring it.

## Example Shaders

### Animated Color
```wgsl
@vertex
fn vs_main(@location(0) position: vec2f) -> @builtin(position) vec4f {
    return vec4f(position, 0.0, 1.0);
}

@fragment
fn fs_main(@builtin(position) pos: vec4f) -> @location(0) vec4f {
    return vec4f(sin(wgsl_globals.time), cos(wgsl_globals.time), 0.5, 1.0);
}
```

### Mouse-Interactive Gradient
```wgsl
@vertex
fn vs_main(@location(0) position: vec2f) -> @builtin(position) vec4f {
    return vec4f(position, 0.0, 1.0);
}

@fragment
fn fs_main(@builtin(position) pos: vec4f) -> @location(0) vec4f {
    let uv = pos.xy / wgsl_globals.resolution;
    let mouse_dist = length(uv - wgsl_globals.mouse);
    return vec4f(uv, mouse_dist, 1.0);
}
```

### Pulsating Circle
```wgsl
@vertex
fn vs_main(@location(0) position: vec2f) -> @builtin(position) vec4f {
    return vec4f(position, 0.0, 1.0);
}

@fragment
fn fs_main(@builtin(position) pos: vec4f) -> @location(0) vec4f {
    let uv = (pos.xy / wgsl_globals.resolution) * 2.0 - 1.0;
    let aspect = wgsl_globals.resolution.x / wgsl_globals.resolution.y;
    let uv_corrected = vec2f(uv.x * aspect, uv.y);
    
    let dist = length(uv_corrected);
    let radius = 0.5 + 0.2 * sin(wgsl_globals.time * 2.0);
    let circle = smoothstep(radius + 0.01, radius, dist);
    
    return vec4f(vec3f(circle), 1.0);
}
```

## Requirements

- Visual Studio Code 1.85.0 or higher
- WebGPU support in your system (Windows 10/11, macOS, or Linux with compatible GPU)

## Known Limitations

- WebGPU support on Linux may require additional GPU drivers
- Compute shaders are not currently supported (vertex + fragment only)

## Contributing

Found a bug or have a feature request? Please open an issue on GitHub.

## License

MIT License - see LICENSE file for details

## Release Notes

### 0.0.1

- Initial release
- Live preview for WGSL shaders
- Automatic uniform injection (time, resolution, mouse)
- Real-time error reporting
- Keyboard shortcut (Ctrl+Shift+W)