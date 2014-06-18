#pragma strict
// **************************************************************************
// Copyright © Ensomniac Studios. All rights reserved. This material
// contains the confidential and proprietary information of Ensomniac Studios
// and may not be copied in whole or in part without the express written permission
// of Ensomniac Studios. This copyright notice does not imply publication.
//
// Author:  Ryan Martin ryan@ensomniac.com
//
// Description: Attach this script to any GameObject in the scene. It can be queried. 
// **************************************************************************

// Rotating the screen 90 degrees will give this rotation
private var maxTilt : float = 45.0;

// Lower damp means smoother rotation, but the roation is slower
private var rotationDamp : float = 1.75;
static var tiltAngle : float;
static var tiltNormX : float;

//static var lastZ : float = 0;

function Awake () {
}

function Update () {
    manageAccelerometer();
}

function manageAccelerometer() {
    var restricted_tilt : float = maxTilt*(1);
    
    // Rotation of the accelerometer
    
    // Tilt the screen (glint)
	var wantedRotation : float = Input.acceleration.normalized.x * restricted_tilt * -1;
	
	// Tilt back and forth
	//var wantedRotation : float = Input.acceleration.normalized.y * restricted_tilt * -1;
	
	// Tilt back and forth
	//var wantedRotation : float = Input.acceleration.normalized.y * restricted_tilt * -1;
	
	
	
	// Smooth the rotation
	tiltAngle = Mathf.LerpAngle(tiltAngle, wantedRotation, rotationDamp * Time.deltaTime);
	tiltNormX = 1-(((((maxTilt + tiltAngle)*100)/maxTilt)*0.01)*0.5);
	
}