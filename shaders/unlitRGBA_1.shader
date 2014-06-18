Shader "Mobile/[Ensomniac] UnlitRGBA - [D1]"
{
    Properties
    {
        _Color ("Color Tint", Color) = (1,1,1,1)   
        _MainTex ("Base (RGB) Alpha (A)", 2D) = "white"
    }
 
    Category
    {
        Lighting Off
        ZWrite On
                //ZWrite On  // uncomment if you have problems like the sprite disappear in some rotations.
        Cull back
        Blend SrcAlpha OneMinusSrcAlpha
                //AlphaTest Greater 0.001  // uncomment if you have problems like the sprites or 3d text have white quads instead of alpha pixels.
        Tags {"Queue"="Overlay+1" "RenderType"="Overlay"}
 
        SubShader
        {
 
             Pass
             {
                        SetTexture [_MainTex]
                        {
                    ConstantColor [_Color]
                   Combine Texture * constant
                }
            }
        }
    }
    FallBack "Unlit"
}