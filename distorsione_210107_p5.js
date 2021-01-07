
/* 
 da Audio Effects Theory, Implementation and Application.pdf
 pag. 183
 */
// How many audio samples to process
var numSamples;
// Array of samples, length numSamples
var channelData;
// Input gain (linear), pre-distortion
var inputGain;
// Gain in dB, set by user
var inputGainDecibels_;
// Index of the type of distortion
var distortionType_;

var out;
var input;

// Knobs variables
var knob1;  // Declare objects
var knob2;
var r = 40; // raggio del Knob

function setup() {
  
    distortionType_ = 1;
     // kTypeHardClipping
    // distortionType_ = 2; // kTypeSoftClipping
    // distortionType_ = 3; // kTypeSoftClippingExponential
    // distortionType_ = 4; // kTypeFullWaveRectifier
    // distortionType_ = 5; // kTypeHalfWaveRectifier

    inputGain = 0;
    inputGainDecibels_ = 0;
    out = 0;
    input = 0;
    
    createCanvas(640, 360);
    numSamples = width;
    channelData = new Array(width);

  // Create Knob object
  knob1 = new Knob(50, 50, false, false, 0);
  knob2 = new Knob(150, 50, false, false, 0);
  
}

function draw() {
    background(255);
    
    // Knob stuff
  knob1.isdrag();
  knob1.display();
  knob2.isdrag();
  knob2.display();
  
  // genera sinusoide
    for (var i = 0; i < width; ++i) {
        var value = sin(radians(i));
        channelData[i] = value;
        // channelData[i] = random(0,1);
        // input
        stroke(255, 0, 0);
        // strokeWeight(5);
        point(i, (height / 2) + value * 100);
    }
    
    //inputGainDecibels_ = mouseY / 10;
    inputGainDecibels_ = knob1.angle*2;
    
    // Calculate input gain once to save calculations
    inputGain = pow(10.0, inputGainDecibels_ / 20.0);
    for (var i = 0; i < numSamples; ++i) {
        print("inputGain: " + inputGain);
        input = channelData[i] * inputGain;
        // Apply distortion based on type
        if (distortionType_ == 1) {
            // Simple hard clipping
            //var threshold = 1.0;
            var threshold = abs(knob2.angle);
            if (input > threshold)
                out = threshold;
            else if (input < -threshold)
                out = -threshold;
            else
                out = input;
        } else if (distortionType_ == 2) {
            // Soft clipping based on quadratic function
            var threshold1 = 1.0 / 3.0;
            var threshold2 = 2.0 / 3.0;
            if (input > threshold2)
                out = 1.0;
            else if (input > threshold1)
                out = (3.0 - (2.0 - 3.0 * input) * (2.0 - 3.0 * input)) / 3.0;
            else if (input < -threshold2)
                out = -1.0;
            else if (input < -threshold1)
                out = -(3.0 - (2.0 + 3.0 * input) * (2.0 + 3.0 * input)) / 3.0;
            else
                out = 2.0 * input;
        } else if (distortionType_ == 3) {
            // Soft clipping based on exponential function
            if (input > 0)
                out = 1.0 - exp(-input);
            else
                out = -1.0 + exp(input);
        } else if (distortionType_ == 4) {
            // Full-wave rectifier (absolute value)
            out = abs(input);
        } else if (distortionType_ == 5) {
            // Half-wave rectifier
            if (input > 0)
                out = input;
            else
                out = 0;
        }
        // Put output back in buffer
        // channelData[i] = out;
        stroke(0, 0, 255);
        point(i, (height / 2) + out * 100);
        print("out: " + out);
    }
    
    noStroke();
}

// Knob class
function Knob(ix, iy, idragging, irollover, iangle, ioffsetAngle) {
  this.x = ix; // X position
  this.y = iy; // Y position
  this.dragging = idragging;
  this.rollover = irollover;
  this.angle = iangle;
  this.offsetAngle = ioffsetAngle;
  var calcAngle = 0; 

  this.isdrag = function() {
    // Is it being dragged?
    if (this.dragging) {
      var dx = mouseX - this.x;
      var dy = mouseY - this.y;
      var mouseAngle = atan2(dy, dx);
      this.angle = mouseAngle - this.offsetAngle;
      print("this.angle. " + this.angle);
    }

    if (this.dragging) {
      fill (175);
    } else {
      fill(255);
    }

    // Map is an amazing function that will map one range to another!
    // Here we take the slider's range and map it to a value between 0 and 255
    // Our angle is either between
    if (this.angle < 0) {
      calcAngle = map(this.angle, -PI, 0, PI, 0);
    } else if (this.angle > 0) {
      calcAngle = map(this.angle, 0, PI, TWO_PI, PI);
    }
  }

  this.display = function() {
    // Draw ellipse for knob
   stroke(0, 0, 0);
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    ellipse(0, 0, r*2, r*2);
    line(0, 0, r, 0);
    pop();
    fill(0);
    noStroke();
    textAlign(CENTER);
    text(int(degrees(calcAngle)), this.x, this.y+r+20);
  }
}

function mousePressed() {

  // Did I click on Knob1?
  if (dist(mouseX, mouseY, knob1.x, knob1.y) < r) {
    knob1.dragging = true;
    // If so, keep track of relative location of click to corner of rectangle
    var dx = mouseX - knob1.x;
    var dy = mouseY - knob1.y;
    knob1.offsetAngle = atan2(dy, dx) - knob1.angle;
    print("offsetAngle Knob1: " + knob1.offsetAngle);
  } else if (dist(mouseX, mouseY, knob2.x, knob2.y) < r) {
    knob2.dragging = true;
    // If so, keep track of relative location of click to corner of rectangle
    var dx = mouseX - knob2.x;
    var dy = mouseY - knob2.y;
    knob2.offsetAngle = atan2(dy, dx) - knob2.angle;
    print("offsetAngle Knob2: " + knob2.offsetAngle);
  }
}

function mouseReleased() {
  // Stop dragging
  knob1.dragging = false;
  knob2.dragging = false;
}
