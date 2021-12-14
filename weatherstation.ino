// This #include statement was automatically added by the Particle IDE.
#include <Adafruit_BME680.h>

Adafruit_BME680 bme = Adafruit_BME680();

double temperatureInC = 0;
double relativeHumidity = 0;
double pressureHpa = 0;
int writePos = 0;
const int windowLength = 20;
double averageHpa = 0;
double buffer[windowLength];
int counter = 0;
double Luftfeuchtigkeit;
int counterSerial = 0;
double FreezeAverageHpa = 0;
int FreezeCounter = 0;
int Humidity;
int intPressureHpa;
int intFreezeAverageHpa;
int humidityArray[8640];
int counterArray = 0;
int regenState = 0;
int temperaturArray[8640];
int averageTemperatur;

unsigned long startTime;
unsigned long deltaTime;

void setup() {
  if (!bme.begin()) {
    Particle.publish("Log", "Could not find the sensor!");
  } else {
    Particle.publish("Log", "Success!");
   
    bme.setTemperatureOversampling(BME680_OS_8X);
    bme.setHumidityOversampling(BME680_OS_2X);
    bme.setPressureOversampling(BME680_OS_4X);

    Particle.variable("temperature", String(temperatureInC));
    Particle.variable("humidity", String(relativeHumidity));
    Particle.variable("pressure", String(pressureHpa));
  }
}

void loop() {
  if (!bme.performReading()) {
    Particle.publish("Log", "Failed to perform reading!");
  } else {
    temperatureInC = bme.temperature;
    relativeHumidity = bme.humidity;
    pressureHpa = bme.pressure / 100.0;
    
    Particle.publish("Temperatur", String(temperatureInC));
    delay (1000);
    Particle.publish("Luftfeuchtigkeit", String(relativeHumidity));
    delay (1000);
    Particle.publish("Luftdruck", String(pressureHpa));
    delay (1000);
    //Serial.printlnf("%d,%f,%f,%f", counterSerial, temperatureInC, relativeHumidity, pressureHpa);
    //counterSerial++;
  }
    //Algorithmus für die Wetterwarnung -> Pflanzen rein bei Temp < 0 Grad -> Die als Warnung ausgeben
    if (temperatureInC <= 0){
        Particle.publish("WetterWarnung", "Achtung Temperatur <= 0!");
        delay (1000);
    }
    
    else if (temperatureInC >= 30){
        Particle.publish("WetterWarnung", "Achtung sehr Temperatur >= 30!");
        delay (1000);
    }
    
    
    else {
        Particle.publish("WetterWarnung", "Keine Warnung bezüglich Temperatur!");
        delay (1000);
        
    }
    
    // Algorithmus für Wetterveränderung
    
        buffer[writePos] = pressureHpa;
        writePos = (writePos+1)%windowLength;
        
        averageHpa = 0;
        for (int i=0; i<windowLength; i++){
            averageHpa += buffer[i];
        }
        averageHpa/= windowLength;
        
        
        // Alle 200 sec soll der Durchschnittswert als Referenzwert definiert werden:
        
        if (FreezeCounter >= 20){
            FreezeAverageHpa = averageHpa;
            FreezeCounter = 0;
        }
        
    FreezeCounter++;
        
    /* Veränderung des Wetters, Über Abweichungen vom Luftdruck. Bsp 1000*0.99995 = 999.95 -> Ein Plötzlicher Druckabfall findet statt -> exemplarisch 0.05 = Abweichung
    Wetterheuristik: Druckabfall-Geschwindigkeit : 1 hPa ~ pro 3600sec   -> /18
    0.0555 hPa ~ pro 200sec -> deshalb sind 200sec in diesem Experiment die gewählte Approximation für das Zeitfenster.
    Der laufend gemessene Druck soll mit dem Referenzwert abgeglichen werden
    erst nach 20 Durchläufen die Änderungen abgleichen, da die Windowlegth = 20
    */ 
    
    if (counter >=20){
    
        if (pressureHpa <= FreezeAverageHpa*0.99995){
        
            Particle.publish("WetterVeraenderung", "Luftdruck fällt ab!" + String(pressureHpa) + "\n average:  " + String(FreezeAverageHpa));
            delay (1000);
        }
        
        else{
            
            Particle.publish("WetterVeraenderung", "Kein hoher Druckabfall! aktuell: \n" + String(pressureHpa) + "\n average:  " + String(FreezeAverageHpa));
            delay (1000);
        }
    }
    
    counter ++;
    
    // Kissen hereinnehmen bei hoher Luftfeuchtigkeit -> Hier beispspielhaft 50% gewählt damit es vorgeführt werden kann
    
    Humidity = relativeHumidity;
    
    if (relativeHumidity >= 50){
        Particle.publish("KissenRein", "Achtung die Kissen reinehmen! \nDie Luftfeuchtigkeit beträgt: " + String(Humidity) +"%" );
        delay (1000);
    }
    
    else {
        Particle.publish("KissenRein", "Luftfeuchtigkeit in Ordnung! \nDie Luftfeuchtigkeit beträgt: " + String(Humidity) +"%" );
        delay (1000);
        
    }
    
    // Algorithmus für das Pflanzen giessen (exemplarisch)
    // falls 24h die Luftfeuchtigkeit nicht über 90% und die durchschnittliche temperatur über 20 Grad war, dann pflanzen giessen (24*60*60= 86400sec)
    
    humidityArray[counterArray] = relativeHumidity;
    temperaturArray[counterArray] = temperatureInC;
    
    for (int i = 0; i <= counterArray; i++){
        averageTemperatur += temperaturArray[i];
    }
        averageTemperatur /= (counterArray + 1);
    
    if (counterArray = 0){
        startTime = millis();
    }
    
    deltaTime = (millis() - startTime)/1000; // Sekunden daraus machen -> deltaTime in Sekunden
    
    for (int i = 0; i <= counterArray; i++){
        if(humidityArray[i] > 90) {
            regenState++;
        }
    }
    
    if(deltaTime >= 86400 && regenState == 0 && averageTemperatur >= 20) {
        Particle.publish("PflanzenGiessen", "Pflanzen giessen! es hat 24h nicht geregnet und es war heiss!");
        }
        
    if(deltaTime > 86400){
        regenState = 0;
        counterArray = 0;
        averageTemperatur = 0;
    }
    
    counterArray++;
    
  delay(10*400);
  
}
