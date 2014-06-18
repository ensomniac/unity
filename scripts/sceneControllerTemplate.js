#pragma strict

static var animationStartTime : float;
static var animationDuration : float = 0.5;
static var animationActive : boolean;
static var animationStart : float;
static var animationEnd : float;
static var animationType : int; // 0 for fade in, 1 for fade out
static var isVisible : boolean;

function Awake () {
    animationActive = false;
    isVisible = false;
}

function Update () {
    if (animationActive) {manageAnimation();}
}

static function show(){
    animationStartTime = Time.timeSinceLevelLoad;
    animationActive = true;
    animationStart = 0;
    animationEnd = 1;
    animationType = 0;
    isVisible = true;
    prepForShow();
}

static function hide(){
    print("Hide it");
    animationStartTime = Time.timeSinceLevelLoad;
    animationActive = true;
    animationStart = 1;
    animationEnd = 0;
    animationType = 1;
}

static function manageAnimation(){
	var t : float = Mathf.SmoothStep(0, 1, ((Time.timeSinceLevelLoad - animationStartTime) / animationDuration));
	var state : float = Mathf.SmoothStep(animationStart, animationEnd, ((Time.timeSinceLevelLoad - animationStartTime) / animationDuration));
    
    manageAnimationState(state);
    
    if (t >= 1) {
        // The transition is finished
        if (animationType == 0) {guiShown();}
        if (animationType == 1) {guiHidden();}
        
        animationActive = false;
    }
}

static function setup(){
    print("Setting up GUI");
}

static function prepForShow(){
    print("Prep for show");
}

static function guiShown(){
    print("Shown");
}

static function guiHidden(){
    print("Hidden");
    isVisible = false;
}

static function manageAnimationState(state:float){
    scoreboardController.setScoreTextFadeTime(1-state);
}








