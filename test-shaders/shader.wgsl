struct VertexInput {
    @location(0) pos: vec2f,
}

struct VertexOutput {
    @builtin(position) pos: vec4f,
}

struct FragmentOutput {
    @location(0) color: vec4f,
}

@vertex
fn vs_main(input: VertexInput) -> VertexOutput {
    var output = VertexOutput(
        vec4f(input.pos, 0.0, 1.0)
    );

    return output;
}

@fragment
fn fs_main(input: VertexOutput) -> FragmentOutput {
    let x = wgsl_globals.mouse.x;
    let y = wgsl_globals.mouse.y;

    var output = FragmentOutput(
        vec4f(x, y, 1.0, 1.0)
    );

    return output;
}
