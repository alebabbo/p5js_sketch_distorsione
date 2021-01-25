// https://github.com/Tonejs/Tone.js/wiki
// GUARDA https://tone-demos.glitch.me/
// distorsione: https://stackoverflow.com/questions/22312841/waveshaper-node-in-webaudio-how-to-emulate-distortion/22313408#22313408

// The setup() function is async
// So it might take a little while to load
let ready = false;
let comincia = false;
let pushdabutton = false;
let distRealtime = false;
let colorBackground;

const MP3 = "https://cdn.glitch.com/2929cbe3-bafa-4b5f-833f-7debb607569b%2F1-02%20Blue%20Jeans%20(Gesaffelstein%20Remix).mp3?v=1569254348843";

let osc;
let makeDistorsion;
let analyser;
var distAmount = 20;

// Global volume in decibels
const volume = -15;

var knob1;  // Declare objects
var knob2;
var r = 40; // raggio del Knob

// Create a new canvas to the browser size
async function setup () {
  createCanvas(windowWidth, windowHeight);

  // Clear with black on setup
  background(0);

  // Make the volume quieter
  Tone.Master.volume.value = volume;

  // We can use 'player' to 
  player = new Tone.Player();
  player.loop = true;
  player.autostart = false;
  player.loopStart = 1.0;
  player.connect(Tone.Master);

  // Load and "await" the MP3 file
  await player.load(MP3);

  // make and start a 440hz sine tone
  osc = new Tone.Oscillator(0, "sine");

  //makeDistorsion = new Tone.WaveShaper((val) => val * 5, 2048);
  makeDistorsion = new Tone.WaveShaper();
  makeDistorsion.curve = makeDistortionCurve(distAmount);

  // Create an analyser node that makes a waveform
  analyser = new Tone.Analyser('waveform', 128);

  // Now lets wire up our stack like so:
  osc.connect(Tone.Master);  
  player.connect(Tone.Master);  
  osc.connect(analyser);  
  player.connect(analyser);
  makeDistorsion.disconnect();

  // Create knob object
  //Knob(ix, iy, idragging, irollover, iangle, ioffsetAngle)
  knob1 = new Knob(width/2 - 50, 150, false, false, 0, 0);
  knob2 = new Knob(width/2 + 50, 150, false, false, 0, 0);

  colorBackground = color(50, 50, 50, 20);
  ready = true;
}

// On window resize, update the canvas size
function windowResized () {
  resizeCanvas(windowWidth, windowHeight);
  knob1.x = width/2 - 50;
  knob2.x = width/2 + 50;
  // Clear to black on resize
  background(0);
}

// Render loop that draws shapes with p5
function draw() {
  // Make sure async setup() is done before we draw
  if (!ready) return;
  // For consistent sizing regardless of portrait/landscape
  const dim = Math.min(width, height);

  // Black background
  background(colorBackground);

  textAlign(CENTER);
  fill(255);
  noStroke();
  textSize(20);
  text('click per avviare', width/2, 30);
  text('premi un tasto qualunque per attivare / disattivare distorsione', width/2, 50);
  text('il knob a sinistra regola la quantità di distorsione (da 0 a 180)', width/2, 70);


  stroke(0);

  knob1.isdrag();
  knob1.display();
  knob2.isdrag();
  knob2.display();

  if (distRealtime == true) {
    distAmount = abs(degrees(knob1.angle));
    makeDistorsion.curve = makeDistortionCurve(distAmount);
    print("distortion: " + distAmount);
  }

  // Draw waveform if playing  
  noFill();
  stroke(255);
  const values = analyser.getValue();
  beginShape();
  for (let i = 0; i < values.length; i++) {
    const amplitude = values[i];
    const x = map(i, 0, values.length - 1, 0, width);
    const y = height / 2 + amplitude * height/4;
    // Place vertex
    vertex(x, y);
  }
  endShape();

  /*
  // Draw a 'play' button
   noStroke();
   fill(255);
   polygon(width / 2, height / 2, dim * 0.1, 3);
   */
}


// disattiva distortion --------------------------------------------------------
function keyPressed () {
  print(pushdabutton);
  if (pushdabutton == false) {
    pushdabutton = true;
    player.connect(makeDistorsion);  
    osc.connect(makeDistorsion);
    makeDistorsion.connect(analyser);
    makeDistorsion.connect(Tone.Master);
    colorBackground = color(50, 100, 50, 20);
  } else {
    pushdabutton = false;
    osc.connect(Tone.Master);  
    player.connect(Tone.Master);  
    osc.connect(analyser);  
    player.connect(analyser);
    makeDistorsion.disconnect();
    colorBackground = color(50, 50, 50, 20);
  }
}

// Update the FX and trigger synth ON
function mousePressed () {
  // Did I click on Knob1?
  if (dist(mouseX, mouseY, knob1.x, knob1.y) < r) {
    knob1.dragging = true;
    // If so, keep track of relative location of click to corner of rectangle
    var dx1 = mouseX - knob1.x;
    var dy1 = mouseY - knob1.y;
    knob1.offsetAngle = atan2(dy1, dx1) - knob1.angle;
    print("offsetAngle Knob1: " + knob1.offsetAngle);
  } else if (dist(mouseX, mouseY, knob2.x, knob2.y) < r) {
    knob2.dragging = true;
    // If so, keep track of relative location of click to corner of rectangle
    var dx2 = mouseX - knob2.x;
    var dy2 = mouseY - knob2.y;
    knob2.offsetAngle = atan2(dy2, dx2) - knob2.angle;
    print("offsetAngle Knob2: " + knob2.offsetAngle);
  }

  distRealtime = true;
}

// Trigger synth OFF
function mouseReleased () {
  // Stop dragging
  knob1.dragging = false;
  knob2.dragging = false;
  distRealtime = false;

  if (comincia == false) {
    player.start();
    osc.start();
    comincia = true;
  }
}

// genera la curva per waveshaper -----------------------------------------------------------------
function makeDistortionCurve(amount) {
  let n_samples = 256, curve = new Float32Array(n_samples);
  for (let i = 0; i < n_samples; ++i ) {
    let x = i * 2 / n_samples - 1;
    curve[i] = (Math.PI + amount) * x / (Math.PI + amount * Math.abs(x));
  }
  return curve;
}

// Knob class --------------------------------------------------------------------------------------
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
      //print("offsetAngle: " + degrees(this.offsetAngle));
      //print("this.angle. " + this.angle);
      //if (this.offsetAngle > 0 && this.angle >= PI) {
      //  this.angle = PI;
      //}
      // assegna valore per inizio e fine corsa
      this.angle = constrain(this.angle, 0, PI);
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
      calcAngle = map(this.angle, 0, PI, 0, PI);
    }
  }

  this.display = function() {
    // Draw ellipse for knob
    push();
    translate(this.x, this.y);
    // occhio assegna valore per inizio e fine corsa <<<<<<<<<<<<<
    rotate(this.angle);
    ellipse(0, 0, r*2, r*2);
    line(0, 0, r, 0);
    pop();
    fill(0);
    textAlign(CENTER);
    text(int(degrees(calcAngle)), this.x, this.y+r+20);
  }
}

// Draw a basic polygon, handles triangles, squares, pentagons, etc --------------------------------
function polygon(x, y, radius, sides = 3, angle = 0) {
  beginShape();
  for (let i = 0; i < sides; i++) {
    const a = angle + TWO_PI * (i / sides);
    let sx = x + cos(a) * radius;
    let sy = y + sin(a) * radius;
    vertex(sx, sy);
  }
  endShape(CLOSE);
}
