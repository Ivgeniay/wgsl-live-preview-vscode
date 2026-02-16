# Change Log

All notable changes to the "wgsl-live-preview" extension will be documented in this file.

## [0.0.3] - 2026-02-16

### Added
- TypeScript support for webview code with ES6 modules
- Bundling webview code with esbuild for better performance
- Code snippets for quick WGSL shader creation:
  - `wgsl-t` - full shader template with structs
  - `wgsl-q` - fullscreen quad shader
- "WGSL: Create New Shader" command in Explorer context menu
- Modular architecture for webview code

### Changed
- Refactored webview code from inline HTML to separate TypeScript modules
- Improved build pipeline with watch mode support
- Updated compilation process to use esbuild for webview bundling

### Technical
- Added esbuild as bundler for webview code
- Added @webgpu/types for proper WebGPU TypeScript support
- Split npm scripts for separate extension and webview compilation
- Added watch mode for development with parallel compilation

## [0.0.2] - 2026-02-09

### Added
- Support vscode from 1.85.0 version

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