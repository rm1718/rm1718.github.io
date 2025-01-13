# HowLongDoIWait
The main idea of HowLongDoIWait is to estimate the waited time during a trip.

## Use Case
HowLongDoIWait can be applied whenever a user wants some estimation about its waiting time during 
travelling by foot, bike, car or train. I.e. for comparing two bike routes, the user can test the difference
in the waiting time by using HowLongDoIWait.

## Features
The following features are implemented:
- Verifing that users setup works
- Defining the minimum velocity (velocities below this minimum velocity are perceived as waiting)
- Recording the waited time during a trip
- Estimating the velocity by using gelocations retrived coordinates
- Displaying all waiting locations, including the waited time at its location, on a map by 
using ["Leaflet"](https://leafletjs.com/index.html)
- Responsive behaviour for desktop, mobile phones and tabelts
- Deploying [HowLongDoIWait](https://rm1718.github.io/) with github pages in a secure context

## Usage
The steps below help to have the best experience with HowLongDoIWait. This flow was successfully executed 
with an Android 11 smartphone, using google chrome and walking through the city:

Add and Record thresholds for an exercise:
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
11. Keep walking, stoped 3 times and kept website on mobile phone open
12. Press button ```Arrived at destination```
13. Reviewed total waiting time and three stops on map

## Limitations
HowLongDoIWait is limited by its enviromental factor and highly depends on the accuracy of the retrieved location. Therefore the following
limits should be kept in mind:
1. All waiting positions with less than 6 seconds of waiting time are ignored because the 
system can not differ between the jitter/inaccuracy of the GPS and real short waiting times
2. The system works best with a large difference between minimum velocity and average velocity when travelling
3. Altitude changes are not recognized and therefore can lead to "waiting positions"
4. Website needs to be kept open/visible on device so it can still receive updates on positions
5. Device should use GPS for good results
6. High battery consumption because of GPS
7. Prevent using website in battery saving mode, because it can lead to poor results

## Further findings
Beyond the mentioned [features](#features) and [limitations](#limitations), more findings are worth to enumerate in the following:
- The speed attribute [Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/GeolocationCoordinates/speed) is not implemented by any big browser at the moment, in contrast to information provided by [caniuse](https://caniuse.com/?search=speed). in the first implemented approach, this property was used.
- Velocity estimation can be improved by using sensor fusion algorithms (accelerometer)