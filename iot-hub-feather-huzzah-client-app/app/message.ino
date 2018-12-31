#include <Adafruit_Sensor.h>
#include <ArduinoJson.h>
#include <ESP8266HTTPClient.h>
#include <DHT.h>
#include <String>

#if SIMULATED_DATA


void initSensor()
{
    // use SIMULATED_DATA, no sensor need to be inited
}

float readTemperature()
{
    return random(20, 30);
}

float readHumidity()
{
    return random(30, 40);
}

#else

static DHT dht(DHT_PIN, DHT_TYPE);
void initSensor()
{
    dht.begin();
}

//float readTemperature()
//{
//    return dht.readTemperature();
//}

float readHumidity()
{
    return dht.readHumidity();
}

float readMoisture()
{
  float moisture = analogRead(MOIST_PIN);
  return moisture*100/1024;
}

float temp1=0, temp2=0, temp3=0, temp4=0, temp5=0;

void readTemperature()
{
  HTTPClient http;  //Declare an object of class HTTPClient
  http.begin("http://api.openweathermap.org/data/2.5/forecast?zip=92697,us&APPID=cb272ab1b6a62b99fcd4f8f801e10d28");  //Specify request destination
  int httpCode = http.GET();                                                                  //Send the request

  if (httpCode > 0) { //Check the returning code
    //Serial.println("Connected..");
    String payload = http.getString();   //Get the request response payload
    trimString(payload);
  }
  else{Serial.println("Error");
    Serial.println(httpCode);
  }

  http.end();   //Close connection
  //return arr;
}

#endif

void trimString(String s)
{
  int i, j = 0;
  float ttemp = 0;
  for(i = 0; i < s.length(); i++)
  {
    if(s[i] == '{' && s.substring(i+2,i+6) == "temp")
    {
      //Serial.println(j);
      String st = s.substring(i+8,i+13);
      ttemp += atof(st.c_str()) - 273.15;
      j++;
      
      if(j % 8 == 0)
      {
        if(temp1 == 0) temp1 = ttemp/8;
        else if(temp2 == 0) temp2 = ttemp/8;
        else if(temp3 == 0) temp3 = ttemp/8;
        else if(temp4 == 0) temp4 = ttemp/8;
        else if(temp5 == 0) temp5 = ttemp/8;
        //arr[j/8] = ttemp/8;
        //Serial.println(arr[j/8]);
        ttemp = 0;
      }
    }
  }
  if (ttemp != 0)
  {
    temp5 = ttemp/(j%8);
    //Serial.println(arr[4]);
  }
  
  //return arr;
}


bool readMessage(int messageId, char *payload)
{
    float *temperatures;
    readTemperature();
    float humidity = 0;//readHumidity();
    delay(2000);
    float moisture = readMoisture();
    delay(2000);
    StaticJsonBuffer<MESSAGE_MAX_LEN> jsonBuffer;
    JsonObject &root = jsonBuffer.createObject();
    root["deviceId"] = DEVICE_ID;
    root["messageId"] = messageId;
    bool temperatureAlert = false;

    // NAN is not the valid json, change it to NULL
    if (std::isnan(temp1))
    {
        root["temperature1"] = NULL;
        root["temperature2"] = NULL;
        root["temperature3"] = NULL;
        root["temperature4"] = NULL;
        root["temperature5"] = NULL;
    }
    else
    {
        root["temperature1"] = temp1;
        root["temperature2"] = temp2;
        root["temperature3"] = temp3;
        root["temperature4"] = temp4;
        root["temperature5"] = temp5;
//        if (temperature > TEMPERATURE_ALERT)
//        {
//            temperatureAlert = true;
//        }
    }

//    if (std::isnan(humidity))
//    {
//        root["humidity"] = NULL;
//    }
//    else
//    {
//        root["humidity"] = humidity;
//    }
    
    if (std::isnan(moisture))
    {
        root["moisture"] = NULL;
    }
    else
    {
        root["moisture"] = moisture;
        if (moisture < MOISTURE_ALERT)
        {
            temperatureAlert = true;
        }
    }
    root.printTo(payload, MESSAGE_MAX_LEN);
    return temperatureAlert;
}

void parseTwinMessage(char *message)
{
    StaticJsonBuffer<MESSAGE_MAX_LEN> jsonBuffer;
    JsonObject &root = jsonBuffer.parseObject(message);
    if (!root.success())
    {
        Serial.printf("Parse %s failed.\r\n", message);
        return;
    }

    if (root["desired"]["interval"].success())
    {
        interval = root["desired"]["interval"];
    }
    else if (root.containsKey("interval"))
    {
        interval = root["interval"];
    }
}
