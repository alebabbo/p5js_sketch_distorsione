
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

function setup() {
    // distortionType_ = 2; // kTypeSoftClipping
    // distortionType_ = 3; // kTypeSoftClippingExponential
    // distortionType_ = 4; // kTypeFullWaveRectifier
    // distortionType_ = 5; // kTypeHalfWaveRectifier
    initializeFields();
    createCanvas(640, 360);
    numSamples = width;
    channelData = new Array(width);
    // kTypeHardClipping
    distortionType_ = 1;
}

function draw() {
    background(255);
    for (var i = 0; i < width; ++i) {
        var value = sin(radians(i));
        channelData[i] = value;
        // channelData[i] = random(0,1);
        // input
        stroke(255, 0, 0);
        // strokeWeight(5);
        point(i, (height / 2) + value * 100);
    }
    inputGainDecibels_ = mouseY / 10;
    // inputGainDecibels_ = 1;
    // Calculate input gain once to save calculations
    inputGain = pow(10.0, inputGainDecibels_ / 20.0);
    for (var i = 0; i < numSamples; ++i) {
        print("inputGain: " + inputGain);
        input = channelData[i] * inputGain;
        // Apply distortion based on type
        if (distortionType_ == 1) {
            // Simple hard clipping
            var threshold = 1.0;
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
}

function initializeFields() {
    numSamples = 0;
    channelData = null;
    inputGain = 0;
    inputGainDecibels_ = 0;
    distortionType_ = 0;
    out = 0;
    input = 0;
}
