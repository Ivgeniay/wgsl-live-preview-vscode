# Change Log

All notable changes to the "wgsl-live-preview" extension will be documented in this file.

## [0.0.1] - 2026-02-09

### Added
- Initial release
- Live preview for WGSL shaders with real-time rendering
- Automatic shader recompilation on file changes (500ms debounce)
- Built-in uniform buffer with useful globals:
  - `time` - elapsed time since preview opened
  - `time_delta` - frame delta time
  - `frame` - frame counter
  - `resolution` - canvas size
  - `mouse` - mouse position (normalized)
  - `mouse_click` - last click position
  - `mouse_buttons` - button state
- Clear error messages with line numbers for shader compilation errors
- Keyboard shortcut: `Ctrl+Shift+W` to open preview
- Command: "WGSL: Show Live Preview"
- WebGPU-based rendering
- Automatic globals injection at `@group(3) @binding(0)`

### Known Issues
- WebGPU support on Linux may be limited depending on drivers
- Compute shaders not yet supported