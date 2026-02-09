struct WGSLGlobals {
    time: f32,
    time_delta: f32,
    frame: u32,
    _padding1: u32,
    
    resolution: vec2f,
    mouse: vec2f,
    
    mouse_click: vec2f,
    mouse_buttons: u32,
    _padding2: u32,
}

@group(3) @binding(0) var<uniform> wgsl_globals: WGSLGlobals;