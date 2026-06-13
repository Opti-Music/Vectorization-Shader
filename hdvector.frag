#pragma header

uniform vec3 iResolution;

// Threshold parameter: higher values smooth more aggressive angles
const float THRESHOLD = 0.15;

// Helper function to calculate pixel color distance (luminance weight)
float dist(vec3 c1, vec3 c2) {
    vec3 dt = c1 - c2;
    return sqrt(dot(dt, dt));
}

void main() {
    vec2 uv = openfl_TextureCoordv;
    vec2 texelSize = 1.0 / iResolution.xy;

    // Sample a 3x3 pixel matrix around the current fragment coordinate
    vec4 src_C = flixel_texture2D(bitmap, uv);
    vec3 C = src_C.rgb;
    
    vec3 A = flixel_texture2D(bitmap, uv + vec2(-texelSize.x, -texelSize.y)).rgb;
    vec3 B = flixel_texture2D(bitmap, uv + vec2(0.0,          -texelSize.y)).rgb;
    vec3 D = flixel_texture2D(bitmap, uv + vec2(-texelSize.x, 0.0         )).rgb;
    vec3 F = flixel_texture2D(bitmap, uv + vec2(texelSize.x,  0.0         )).rgb;
    vec3 H = flixel_texture2D(bitmap, uv + vec2(0.0,           texelSize.y)).rgb;
    vec3 I = flixel_texture2D(bitmap, uv + vec2(texelSize.x,   texelSize.y)).rgb;

    // Evaluate structural weight matrices (Horizontal vs Vertical edge detection)
    float edge_v = dist(A, D) + dist(D, H) + dist(B, C) + dist(C, F);
    float edge_h = dist(A, B) + dist(B, F) + dist(D, C) + dist(C, H);

    vec3 finalColor = C;

    // Vector curve smoothing interpolation rule
    if (edge_v < edge_h && dist(C, I) < THRESHOLD) {
        // Smooth pixel diagonals to simulate a high-resolution vector trace line
        vec2 fp = fract(uv * iResolution.xy);
        if (fp.x + fp.y > 1.0) {
            finalColor = mix(C, I, 0.5);
        }
    } else if (edge_h < edge_v && dist(C, A) < THRESHOLD) {
        vec2 fp = fract(uv * iResolution.xy);
        if (fp.x + fp.y < 1.0) {
            finalColor = mix(C, A, 0.5);
        }
    }

    // Preserve the engine's original texture transparency layout
    gl_FragColor = vec4(finalColor, src_C.a);
}
