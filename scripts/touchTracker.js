#pragma strict

// **************************************************************************
// Copyright © Ensomniac Studios. All rights reserved. This material
// contains the confidential and proprietary information of Ensomniac Studios
// and may not be copied in whole or in part without the express written permission
// of Ensomniac Studios. This copyright notice does not imply publication.
//
// Author:  Ryan Martin ryan@ensomniac.com
//
// Description: Attach this script to any GameObject in the scene. It can be queried 
// for its static parameters to see if there is an active touch. 
// Works on desktop and mobile. Note: Must be added to a GameObject
// **************************************************************************

// 0 for no touch, 1 for down, 2 for movement, 3 for up. 
static var touch_active : int;

// Either mouse input or touch input
static var input_function : Function;

// Store the last touch on every frame
static var last_recorded_touch : Touch;

// True if there's a swipe taking place
static var current_swipe : boolean;

// The threshold for whether or not to consider the movement a tap
static var tap_threshold : float = 4;

// Placeholders for input start and end
static var input_coords_start : Array;
static var input_coords_end : Array;

// 0 for not active, 1 for verticle, 2 for horizontal
static var gesture_direction : int;

// This will contain the coords for movement on every frame
static var current_gesture : Array;

// Updated on the start of each new touch
static var touch_id : int;

// TEMPORARY EMISSION VARIABLES.
static var emission_tap_active : boolean;
static var emission_tap_coords : Vector2;
static var emission_gesture_active : boolean;
static var emission_gesture_contents : Vector3;
static var emission_tap_start_cords : Vector2;

// Event registrations
static var event_names_start : String[] = [];
static var event_functions_start : Function[] = [];

static var event_names_end : String[] = [];
static var event_functions_end : Function[] = [];

//static var event_names_move : String[] = [];
//static var event_functions_move : Function[] = [];
//static var event_names_move_triggered : Array = [];


// Fake velocity
static var distanceLastSwipe : float;
static var durationLastSwipe : float;
static var lastX : float;
static var lastY : float;
static var velocity : float;

function Awake () {
	reset_touches();
    emission_tap_active = false;
    emission_tap_coords = Vector2(-1, -1);
    emission_tap_start_cords = Vector2(-1, -1);
    emission_gesture_active = false;
    emission_gesture_contents = Vector3(-1, -1, -1);
    
	if (Application.platform == RuntimePlatform.OSXEditor) {
		// Running inside Unity on OSX
	    input_function = calculate_mouse_input;
	    tap_threshold = 5;
	}
	else {
		// Running on a proper device. Probably.
		input_function = calculate_touch_input;
		tap_threshold = 20;
	}
}

//static function onTouchMove(object:GameObject, f:Function) {
//    // Use this function to hook up touch events to gameObjects. GameObjects
//    // must have a collider attached.
//           
//    var narray = new String[event_names_move.Length+1];
//    var x : int = 0;
//    for (var name : String in event_names_move) {
//        narray[x] = name;
//        x += 1;
//    }
//    narray[x] = object.name;
//    event_names_move = narray;
//    
//    // Store the new function
//    var farray = new Function[event_functions_move.Length+1]; 
//    var y : int = 0;
//    for (var func : Function in event_functions_move) {
//        farray[y] = func;
//        y += 1;
//    }
//    farray[y] = f;
//    event_functions_move = farray;
//    
//}

static function onTouchStart(object:GameObject, f:Function) {
    // Use this function to hook up touch events to gameObjects. GameObjects
    // must have a collider attached.
           
    var narray = new String[event_names_start.Length+1];
    var x : int = 0;
    for (var name : String in event_names_start) {
        narray[x] = name;
        x += 1;
    }
    narray[x] = object.name;
    event_names_start = narray;
    
    // Store the new function
    var farray = new Function[event_functions_start.Length+1]; 
    var y : int = 0;
    for (var func : Function in event_functions_start) {
        farray[y] = func;
        y += 1;
    }
    farray[y] = f;
    event_functions_start = farray;
    
}

static function onTouchEnd(object:GameObject, f:Function) {
    // Use this function to hook up touch events to gameObjects. GameObjects
    // must have a collider attached.
       
    var narray = new String[event_names_end.Length+1];
    var x : int = 0;
    for (var name : String in event_names_end) {
        narray[x] = name;
        x += 1;
    }
    narray[x] = object.name;
    event_names_end = narray;
    
    // Store the new function
    var farray = new Function[event_functions_end.Length+1]; 
    var y : int = 0;
    for (var func : Function in event_functions_end) {
        farray[y] = func;
        y += 1;
    }
    farray[y] = f;
    event_functions_end = farray;
}

static function touch_started() {
    // A touch has started
	var ray = Camera.main.ScreenPointToRay(emission_tap_start_cords);
	var hit : RaycastHit;
	if (Physics.Raycast (ray, hit, 10000)) {
	    var iter : int = 0;
	    //print(hit.collider.gameObject.name);
	    for (var name in event_names_start) {
	        if (name == hit.collider.gameObject.name) {
	            var f : Function = event_functions_start[iter];
	            f(hit.collider.gameObject);
	        }
	        iter += 1;
	    }
	}
	
	lastX = emission_tap_start_cords[0];
    lastY = emission_tap_start_cords[1];
}

static function tap_ended(){    
    var endPoints : Vector3 = Vector3(input_coords_end[0], input_coords_end[1], 0);
    
	var ray = Camera.main.ScreenPointToRay(endPoints);
	var hit : RaycastHit;
	
	if (Physics.Raycast (ray, hit, 10000)) {
	    var iter : int = 0;
	    //print(hit.collider.gameObject.name);
	    for (var name in event_names_end) {
	        if (name == hit.collider.gameObject.name) {
	            
	            var f : Function = event_functions_end[iter];
	            f(hit.collider.gameObject);
	        }
	        iter += 1;
	    }
	}
}


//static function checkForMoveHit(){
//    if (event_names_move.Length == 0) {return;} // Fast out for apps not requiring constant ray casting
//    
//    print("Checking for move hit");
//    print(event_names_move_triggered);
//    
//    var endPoints : Vector3 = Vector3(lastX, lastY, 0);
//    
//	var ray = Camera.main.ScreenPointToRay(endPoints);
//	var hit : RaycastHit;
//	
//	if (Physics.Raycast (ray, hit, 10000)) {
//	    var iter : int = 0;
//	    //print(hit.collider.gameObject.name);
//	    for (var name in event_names_move) {
//	        if (name == hit.collider.gameObject.name) {
//	            
//	            if (!alreadyTriggered) {
//		            var f : Function = event_functions_move[iter];
//		            f(hit.collider.gameObject);
//		            event_names_move_triggered.push(name);
//	            }
//	            
//	        }
//	        iter += 1;
//	    }
//	}
//}



function Update () {
    if (emission_tap_start_cords.x != -1) {
        emission_tap_start_cords = Vector2(-1, -1);
    }

    if (emission_tap_active == true) {
        // clear this here so it has a chance to populate globaly throughout the current frame
        emission_tap_active = false;
        emission_tap_coords = Vector2(-1, -1);
    }		

    if (emission_gesture_active == true) {
	    // clear this here so it has a chance to populate globaly throughout the current frame
        emission_gesture_active = false;
        emission_gesture_contents = Vector3(-1, -1, -1);
    }		

	input_function();

    if (emission_tap_start_cords[0] != -1) {
        touch_started();
    } 
}

static function check_for_tap() {
	var start_x : float = input_coords_start[0];
	var start_y : float = input_coords_start[1];
	var start_time : float = input_coords_start[2];
	
	var end_x : float = input_coords_end[0];
	var end_y : float = input_coords_end[1];
	var end_time : float = input_coords_end[2];
	
	var x_diff = start_x-end_x;
	var y_diff = start_y-end_y;
	if (x_diff < 0) {x_diff = -x_diff;}
	if (y_diff < 0) {y_diff = -y_diff;}
	
	if (x_diff <= tap_threshold && y_diff <= tap_threshold) {
		tap_ended();
		emit_tap_event(end_x, end_y);
	}
}

static function input_started(x:float, y:float) {
	touch_active = 1;
	input_coords_start = [x, y, Time.timeSinceLevelLoad];
	store_cords(x, y);
	touch_id = Random.Range(000000, 999999);
	emit_tap_start_event(x, y);
	
}

static function input_finished(x:float, y:float) {
	input_coords_end = [x, y, Time.timeSinceLevelLoad];
	store_cords(x, y);
	
	if (current_swipe == false) {
	    // A swipe wasn't registered, check to see if we can consider this a tap
	    check_for_tap();
	}
	
	reset_touches();
}

static function input_active(x:float, y:float) {
    // This function is called while input is active. Track the movement, champ. 
    store_cords(x, y);
    
    var start_x : float = input_coords_start[0];
	var start_y : float = input_coords_start[1];
    
	var diff_x = start_x - x;
	var diff_y = start_y - y;
	    
    if (gesture_direction == 0) {
        // The direction hasn't been set yet! Set it now. 
        //event_names_move_triggered = [];
        
		if (diff_x < 0) {diff_x = -diff_x;}
		if (diff_y < 0) {diff_y = -diff_y;}
		if (diff_x > tap_threshold || diff_y > tap_threshold) {
		    // The movement has traveled beyond the tap threshold. 
		    // Let's see if this is a swipe, mmmkay?
			if (diff_x > diff_y) {
				gesture_direction = 2;
			}
			else {
				gesture_direction = 1;
			}
		}
    }
    else {
        // The direction has been set. Let's calculate the velocity!
        
		var diffSinceLastFramex = lastX - x;
		var diffSinceLastFramey = lastY - y;
		var rawDistance : float;
		
		if (gesture_direction == 1) {
		    rawDistance = (100*Mathf.Abs(diffSinceLastFramey))/Screen.height;
		}
		else {
		    rawDistance = (100*Mathf.Abs(diffSinceLastFramex))/Screen.width;
		}


		if (rawDistance > 0) {
		    distanceLastSwipe = rawDistance;
		}
			    
    }
    
    if (gesture_direction > 0) {
        // Ohhh There's a gesture taking place! Track it!
        track_gesture(x, y);
    }
    
    velocity = distanceLastSwipe;
    
    lastX = x;
    lastY = y;
    
    //checkForMoveHit();
}

static function track_gesture(x:float, y:float) {
	current_swipe = true;
	emit_movement_event(x, y, gesture_direction);
};

static function store_cords(x:float, y:float) {
    // Store the coords of every movement
    current_gesture.Push([x, y]);	
};

static function reset_touches () {
    // Reset all touch related variables
    touch_active = 0;
    current_swipe = false;
    input_coords_start = [-1, -1, 0];
    input_coords_end = [-1, -1, 0];
    emit_movement_event(-1, -1, gesture_direction);
    gesture_direction = 0;
    current_gesture = [];
}

static function calculate_mouse_input () {
    if (touch_active == 0) {
        // Check for mouse down
        if (Input.GetMouseButtonDown(0) == true) {
            // Input started
			input_started(Input.mousePosition[0], Input.mousePosition[1]);
			return;
        }
    }
    
    if (touch_active == 1) {
        // Check for movement
        input_active(Input.mousePosition.x, Input.mousePosition.y);
    }
    
    if (Input.GetMouseButtonUp(0) == true) {
        // Check for finish
        input_finished(Input.mousePosition[0], Input.mousePosition[1]);
    }
}

static function calculate_touch_input () {
	// This function will determine whether or not there is an active gesture taking place
    var finger_count : int = 0;	
    for (var touch : Touch in Input.touches) {
        if (touch.phase != TouchPhase.Canceled)
            finger_count++;
            last_recorded_touch = touch;
    }
    
    if (finger_count != 1) {
	    if (touch_active > 0){
	        // there is a touch active. It's time to end it.
	        input_finished(last_recorded_touch.position.x, last_recorded_touch.position.y);
	    }
	    return;
	}
    
    if (touch_active == 0) {
        // A touch event is starting
        input_started(last_recorded_touch.position.x, last_recorded_touch.position.y);
        return;
    }
    
    if (touch_active == 1) {
        // A touch event is happening. Track it hard. 
        input_active(last_recorded_touch.position.x, last_recorded_touch.position.y);
        return;
    }
}

// REGISTER EVENTS HERE. FIGURE OUT HOW TO CALL THESE GLOBALLY

static function emit_tap_event (x:float, y:float) {
	emission_tap_active = true;
	emission_tap_coords = Vector2(x, y);
}

static function emit_movement_event(x:float, y:float, direction:int) {
	emission_gesture_active = true;
	emission_gesture_contents = Vector3(x, y, direction);
}

static function emit_tap_start_event(x:float, y:float) {
	emission_tap_start_cords = Vector2(x, y);
}

static function get_input_difference_at_depth(depth:float) {
    // This is a helper function to calculate the amount of movement at a certain
    // depth from the camera. 
    var cur_x : float = input_coords_start[0];
    var cur_y : float = input_coords_start[1];
    
    var touch_difference_x : float = cur_x - emission_gesture_contents.x;
    var touch_difference_y : float = cur_y - emission_gesture_contents.y;

    var screen_movement_per_y = (100*touch_difference_y)/Screen.height;
    var screen_movement_per_x = (100*touch_difference_x)/Screen.width;
    
    var movement_different_y : float = screen_movement_per_y*(depth*0.01);
    var movement_different_x : float = screen_movement_per_x*(depth*0.01);
    
    return Vector2(movement_different_x, movement_different_y);
    
}