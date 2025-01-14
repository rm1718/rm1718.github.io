# HowLongDoIWait
The main idea of HowLongDoIWait is to estimate the waited time during a trip.

## Use Case
HowLongDoIWait can be applied whenever a user wants some estimation about its waiting time during 
travelling by foot, bike, car or train. For example, the user can compare two bike routes, by using 
HowLongDoIWait to test the difference in the waiting time. It's mainly developed for travelling by bike because big enough differences between average travelling velocity and minimum velocity as well as between minimum velocity and 0 are needed, to obtain useable results.

## Features
The following features are implemented:
- Verifing that users setup works
- Defining the minimum velocity (velocities below this minimum velocity are perceived as waiting)
- Recording the waited time during a trip
- Estimating the velocity by using gelocations retrived coordinates
- Displaying all waiting locations, including the waited time at its location, on a map by 
using [Leaflet](https://leafletjs.com/index.html)
- Responsive behaviour for desktop, mobile phones and tabelts
- Deploying with domain [https://rm1718.github.io/](https://rm1718.github.io/) by using github pages

## Usage
The steps below help to have the best experience with HowLongDoIWait. This flow was successfully executed 
with an Android 11 smartphone, using google chrome and walking through the city:

1. Open [Website](https://rm1718.github.io/)
2. Check setup by pressing the button ```Can I use my setup?```
3. Confirm permission for retrieving location by selecting ```When using this website```
4. Recognize verification message
5. Press button ```Let's Go```
6. Enter ```1``` as minimum velocity
7. Read reminders
8. Press button ```Continue``` 
9. Press button ```Start travel```
10. Begin walking as soon as traffic light switches to green
11. Keep walking, stop 3 times and keep website on mobile phone open
12. Press button ```Arrived at destination```
13. Reviewed total waiting time and three stops on map

## Limitations
HowLongDoIWait is limited by its enviromental factors and highly depends on the accuracy of the retrieved location. Therefore the following
limits should be kept in mind:
1. All waiting positions with less than 6 seconds waiting time, are ignored because the 
system can not differ between the jitter/inaccuracy of the GPS and real short waiting times
2. The system works best with a big difference between minimum velocity and 0 because of the jitter of the GPS
3. Altitude changes are not recognized and therefore can lead to "waiting positions"
4. Website needs to be kept open/visible on device so it can still receive updates on positions
5. Device should use GPS for good results
6. High battery consumption because of GPS
7. Prevent using website in battery saving mode, because it can lead to poor results

## Further findings
Beyond the mentioned [features](#features) and [limitations](#limitations), more findings are worth to enumerate in the following:
- The speed attribute [Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/GeolocationCoordinates/speed) is not implemented by any big browser at the moment, in contrast to information provided by [caniuse](https://caniuse.com/?search=speed). In the first implemented approach, this property was used.
- Velocity estimation can be improved by using sensor fusion algorithms (accelerometer)