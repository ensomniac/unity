#pragma strict

// **************************************************************************
// Copyright © Ensomniac Studios. All rights reserved. This material
// contains the confidential and proprietary information of Ensomniac Studios
// and may not be copied in whole or in part without the express written permission
// of Ensomniac Studios. This copyright notice does not imply publication.
//
// Author:  Ryan Martin ryan@ensomniac.com
//
// Description: Does not need to be attached to an active object. Call like this: 
// var t : float = ensomniacUtils.lerp(v, low, high); 
// **************************************************************************

static function Lerp(low:float, high:float, v:float){
    // Like regular lerp, but without the clamp
    return v * (high - low) + low;
}

static function formatTime(t:float){
    var formattedTime = String.Format("{0:0}:{1:00}", Mathf.Floor(t/60), t % 60);
    return formattedTime;
}

static function get01(){
    // Returns a 0 or a 1 at random. Dumb, I know. 
    return Random.Range(1, 3)-1;
}
