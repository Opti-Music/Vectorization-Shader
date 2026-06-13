local shaderName = "hdvector"
local isShaderSupported = false

function onCreatePost()
    if shadersSupported then
        isShaderSupported = true
        initLuaShader(shaderName)
        
        runHaxeCode([[
            var shader = game.createRuntimeShader(']] .. shaderName .. [[');
            // Apply filtering exclusively to the game world layer
            game.camGame.setFilters([new openfl.filters.ShaderFilter(shader)]);
            
            // Push game window dimensions down to the GLSL rendering loop
            shader.setFloatArray('iResolution', [1280.0, 720.0, 0.0]);
        ]])
    end
end

-- Screen resize handling check to update internal resolution uniform arrays
function onUpdate(elapsed)
    if isShaderSupported and ikr_screenWidth ~= nil then
        runHaxeCode([[
            var filter = game.camGame.getFilters()[0];
            if (filter != null && filter.shader != null) {
                filter.shader.setFloatArray('iResolution', [FlxG.width, FlxG.height, 0.0]);
            }
        ]])
    end
end
