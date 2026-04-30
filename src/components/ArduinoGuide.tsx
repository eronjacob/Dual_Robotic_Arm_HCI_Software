import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, Code } from 'lucide-react';

const arduinoCode = `#include <WiFiS3.h>
#include <WebSocketsServer.h>
#include <Wire.h>
#include <Adafruit_PWMServoDriver.h>
#include <Arduino_JSON.h>

// WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

Adafruit_PWMServoDriver pwm = Adafruit_PWMServoDriver();
WebSocketsServer webSocket = WebSocketsServer(81);

// Servo pulse range (adjust for your servos)
#define SERVOMIN 102  // ~0.5ms pulse
#define SERVOMAX 512  // ~2.5ms pulse

void setServoAngle(uint8_t channel, int angle) {
  int pulse = map(angle, 0, 180, SERVOMIN, SERVOMAX);
  pwm.setPWM(channel, 0, pulse);
}

void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
  if (type == WStype_TEXT) {
    JSONVar cmd = JSON.parse((char*)payload);
    if (JSON.typeof(cmd) == "object") {
      int pin = (int)cmd["pin"];
      int angle = (int)cmd["angle"];
      if (pin >= 0 && pin <= 15 && angle >= 0 && angle <= 180) {
        setServoAngle(pin, angle);
        Serial.printf("Pin %d -> %d°\\n", pin, angle);
      }
    }
  }
}

void setup() {
  Serial.begin(115200);
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\\nWiFi connected!");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
  
  // Init PCA9685
  pwm.begin();
  pwm.setPWMFreq(50); // 50Hz for servos
  
  // Set all servos to home
  int homeAngles[] = {90,80,80,90,90,80, 0,0,0,0,0,0, 0,0,0,0};
  // Pins 0-5 (left arm) and 10-15 (right arm)
  int pins[] = {0,1,2,3,4,5,10,11,12,13,14,15};
  int homes[] = {90,80,80,90,90,80,90,80,80,90,90,80};
  for (int i = 0; i < 12; i++) {
    setServoAngle(pins[i], homes[i]);
    delay(200); // Sequential startup
  }
  
  // Start WebSocket server
  webSocket.begin();
  webSocket.onEvent(webSocketEvent);
  Serial.println("WebSocket server started on port 81");
}

void loop() {
  webSocket.loop();
}`;

export const ArduinoGuide = () => {
  return (
    <Card>
      <Collapsible>
        <CardHeader className="pb-3">
          <CollapsibleTrigger className="flex w-full items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Code className="h-5 w-5" /> Arduino Firmware Guide
            </CardTitle>
            <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 [&[data-state=open]]:rotate-180" />
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><strong className="text-foreground">Required Libraries</strong> (install via Arduino IDE Library Manager):</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><code>WiFiS3</code> — built-in for UNO R4 WiFi</li>
                <li><code>WebSockets</code> by Markus Sattler</li>
                <li><code>Adafruit PWM Servo Driver Library</code></li>
                <li><code>Arduino_JSON</code></li>
              </ul>
              <p><strong className="text-foreground">Steps:</strong></p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Install libraries above in Arduino IDE</li>
                <li>Copy the code below into a new sketch</li>
                <li>Update WiFi SSID and password</li>
                <li>Upload to Arduino UNO R4 WiFi</li>
                <li>Open Serial Monitor to find the IP address</li>
                <li>Enter that IP in the connection bar above</li>
              </ol>
            </div>
            <pre className="max-h-96 overflow-auto rounded-md bg-secondary p-4 text-xs font-mono leading-relaxed">
              {arduinoCode}
            </pre>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
