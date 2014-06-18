#pragma strict
// **************************************************************************
// Copyright © Ensomniac Studios. All rights reserved. This material
// contains the confidential and proprietary information of Ensomniac Studios
// and may not be copied in whole or in part without the express written permission
// of Ensomniac Studios. This copyright notice does not imply publication.
//
// Author:  Ryan Martin ryan@ensomniac.com
//
// Description: Attach this script to your camera
// Call setup() from outside of this script. 
// *************************************************************************

// How far to build the gui from the camera lens
var gui_depth : float;
var vingette_opacity : float = 0.5;
var corner_size : float = 0.5;

static var global_gui_depth : float;
static var global_vingette_opacity : float;
static var global_corner_size : float;

var vignette_texture : Texture;
var corner_texture : Texture;
var error_texture : Texture;

static var global_vignette_texture : Texture;
static var global_corner_texture : Texture;
static var global_error_texture : Texture;

// Outter vignette
static var vignette : GameObject;

// Corner pieces
static var corner_topleft : GameObject;
static var corner_topright : GameObject;
static var corner_bottomleft : GameObject;
static var corner_bottomright : GameObject;

static var frustrum_width : float;
static var frustrum_height : float;

var UnlitAlphaWithFade : Shader;
static var globalUnlitAlphaWithFade : Shader;

static var hit_alpha : float;
static var hit_feedback : GameObject;
static var hit_feedback_decay_rate : float = 0.4; // lower number means slower decay

static var parentObject : GameObject;
static var cornerParent : GameObject;

function Awake () {

	frustrum_height = 2.0 * gui_depth * Mathf.Tan(Camera.main.fieldOfView * 0.5 * Mathf.Deg2Rad);    	    	    	    	
	frustrum_width = frustrum_height * Camera.main.aspect;

	global_vignette_texture = vignette_texture;
	global_corner_texture = corner_texture;
	global_error_texture = error_texture;
	hit_alpha = 0;
	
	globalUnlitAlphaWithFade = UnlitAlphaWithFade;
	
	global_gui_depth = gui_depth;
	global_vingette_opacity = vingette_opacity;
	global_corner_size = corner_size;
	
	parentObject = new GameObject("VignetteComponents");
	cornerParent = new GameObject("corners");
	
	parentObject.transform.parent = this.transform;
	cornerParent.transform.parent = parentObject.transform;
	
	parentObject.transform.localPosition = Vector3(0, 0, 0);
	cornerParent.transform.localPosition = Vector3(0, 0, 0);


}

static function setup(){
    setup_vignette();
    setup_corners();
    setup_hit_feedback();
}

function Update () {
    if (hit_alpha != 0) {
        manage_hit_alpha();
    }
}

function manage_hit_alpha () {
    hit_alpha = Mathf.Clamp(hit_alpha-(Time.deltaTime*hit_feedback_decay_rate), 0, 1);
    
    if (hit_alpha != 0 && hit_feedback.activeInHierarchy == false) {
        hit_feedback.SetActive(true);
    }
    
    hit_feedback.renderer.material.color.a = hit_alpha;
    
    if (hit_alpha == 0 && hit_feedback.activeInHierarchy) {
        hit_feedback.SetActive(false);
    }
}

static function set_hit_feedback(level:float) {
    // level: 0 to 1
    hit_alpha = Mathf.Clamp(hit_alpha + level, 0, 1);
}

static function setup_hit_feedback () {
    // Set up the dark vignette around the screen
 	hit_feedback = get_plane(frustrum_width, frustrum_height, 'hit_feedback');
    hit_feedback.renderer.material.SetTexture('_MainTex', global_error_texture);
    hit_feedback.renderer.material.shader = globalUnlitAlphaWithFade;
    hit_feedback.renderer.material.color.a = hit_alpha;
    hit_feedback.transform.parent = parentObject.transform;
    
 	hit_feedback.transform.localPosition = Vector3(0, 0, global_gui_depth-0.01);
 	hit_feedback.transform.localScale = Vector3(0.5, 0.5, 0.5);
 	hit_feedback.transform.localRotation.eulerAngles.y = 180;
    
    hit_feedback.SetActive(false);
}

static function setup_vignette () {
    // Set up the dark vignette around the screen
 	var vignette_backing : GameObject = get_plane(frustrum_width, frustrum_height, 'vignette_plane');
    vignette_backing.renderer.material.SetTexture('_MainTex', global_vignette_texture);
    vignette_backing.renderer.material.shader = globalUnlitAlphaWithFade;
    vignette_backing.renderer.material.color.a = global_vingette_opacity;
    vignette_backing.transform.parent = parentObject.transform;
    
 	vignette_backing.transform.localRotation.eulerAngles.y = 180;
 	vignette_backing.transform.localPosition = Vector3(0, 0, global_gui_depth);
 	vignette_backing.transform.localScale = Vector3(0.5, 0.5, 0.5);
    
    
}

static function setup_corners () {
    // set up the round corners
    var corner_size = (frustrum_width)*global_corner_size;
    
    corner_topleft = get_plane(corner_size, corner_size, 'corner_topleft');
    corner_topright = get_plane(corner_size, corner_size, 'corner_topright');
    corner_bottomright = get_plane(corner_size, corner_size, 'corner_bottomright');
    corner_bottomleft = get_plane(corner_size, corner_size, 'corner_bottomleft');
    
    var corners : Array = [corner_topleft, corner_topright, corner_bottomright, corner_bottomleft];
    for (var corner : GameObject in corners) {
	    corner.renderer.material.SetTexture('_MainTex', global_corner_texture);
	    corner.renderer.material.shader = globalUnlitAlphaWithFade;
	    corner.renderer.material.color.a = 255;
	    corner.transform.parent = cornerParent.transform;
	    
		corner.transform.localPosition = Vector3(0, 0, global_gui_depth);
	 	corner.transform.localScale = Vector3(0.5, 0.5, 0.5);
	 	corner.transform.localRotation.eulerAngles.y = 180;
    }
    
    corner_topleft.transform.localPosition.x = -(frustrum_width*0.5)+(corner_size*0.5);
    corner_topleft.transform.localPosition.y = (frustrum_height*0.5)-(corner_size*0.5);
    
    corner_topright.transform.rotation.eulerAngles.z = 90;
    corner_topright.transform.localPosition.x = (frustrum_width*0.5)-(corner_size*0.5);
    corner_topright.transform.localPosition.y = (frustrum_height*0.5)-(corner_size*0.5);
   
    corner_bottomright.transform.rotation.eulerAngles.z = 180;
    corner_bottomright.transform.localPosition.x = (frustrum_width*0.5)-(corner_size*0.5);
    corner_bottomright.transform.localPosition.y = -(frustrum_height*0.5)+(corner_size*0.5);
    
    corner_bottomleft.transform.rotation.eulerAngles.z = 270;
    corner_bottomleft.transform.localPosition.x = -(frustrum_width*0.5)+(corner_size*0.5);
    corner_bottomleft.transform.localPosition.y = -(frustrum_height*0.5)+(corner_size*0.5);
    
}

static function get_plane(width:float, height:float, name:String) {
	var m : Mesh = new Mesh();
	m.name = name + "_mesh";
	m.vertices = [Vector3(-width, -height, 0.01), Vector3(width, -height, 0.01), Vector3(width, height, 0.01), Vector3(-width, height, 0.01) ];
	m.uv = [Vector2 (1, 0), Vector2 (0, 0), Vector2 (0, 1), Vector2(1, 1)];
	m.triangles = [0, 1, 2, 0, 2, 3];
	m.RecalculateNormals();
	var obj : GameObject = new GameObject(name, MeshRenderer, MeshFilter, MeshCollider);
	obj.GetComponent(MeshFilter).mesh = m;
	return obj;
}