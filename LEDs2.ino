#include <FastLED.h>
#include <SoftwareSerial.h>

#define DATA_PIN 8
#define NUM_LEDS 12   // Number of LED in package

CRGB leds[NUM_LEDS];
int state = 2;

void(* resetFunc) (void) = 0;//declare reset function at address 0
void setup() {
  FastLED.addLeds<NEOPIXEL, DATA_PIN>(leds, NUM_LEDS);
  pinMode(8, OUTPUT);
  pinMode(7, INPUT);
  Serial.begin(9600);
//  fill_solid(leds, NUM_LEDS, CRGB::Green);
//  FastLED.show();

}

void loop() {
  if (Serial.available() > 0) {
    char receivedData = Serial.read();
    if (receivedData == 'A') {                    //Running
      fill_solid(leds, NUM_LEDS, CRGB::Blue);
      state = 1;
    }
    else if (receivedData == 'B') {               // Stop
      fill_solid(leds, NUM_LEDS, CRGB::Green);
      state = 2;
      //      FastLED.show();
    }                                           //Stand By

  }
  if (state == 2) {
    fill_solid(leds, NUM_LEDS, CRGB::Green);
  }
  if (digitalRead(7) == LOW) {
    fill_solid(leds, NUM_LEDS, CRGB::Red);
    FastLED.show();
    resetFunc();
  }
  leds[NUM_LEDS-1]=CRGB(255,255,255);
  FastLED.show();
}
