## Geometry Library Google Maps API V3
Node JS/ Javascript Geometry Library provides utility functions for the computation of geometric data on the surface of the Earth. Code ported from Google [Maps Android API](https://github.com/googlemaps/android-maps-utils/).


Features
------------
* [Spherical](https://developers.google.com/maps/documentation/javascript/reference#spherical) contains spherical geometry utilities allowing you to compute angles, distances and areas from latitudes and longitudes.
* [Poly](https://developers.google.com/maps/documentation/javascript/reference#poly) utility functions for computations involving polygons and polylines.
* [Encoding](https://developers.google.com/maps/documentation/javascript/reference#encoding) utilities for polyline encoding and decoding.

Installation
------------

Issue following command:

```
yarn add BunHouth/geometry-library
```

Usage
------------

Here is an example of using GeometryLibrary:
```
import {SphericalUtil, PolyUtil} from "geometry-library";

let response = SphericalUtil.computeHeading(
  {lat: 25.775, lng: -80.19}, // from array [lat, lng]
  {lat: 21.774, lng: -80.19} // to array [lat, lng]
);
console.log(response) // -180

let response = SphericalUtil.computeDistanceBetween(
  {lat: 25.775, lng: -80.19}, //from array [lat, lng]
  {lat: 21.774, lng: -80.19} // to array [lat, lng]
);

console.log(response) // 444891.52998049


let response =  PolyUtil.isLocationOnEdge(
  {lat: 25.774, lng: -80.19}, // point array [lat, lng]
  [
    // poligon arrays of [lat, lng]
    {lat: 25.774, lng: -80.19},
    {lat: 18.466, lng: -66.118},
    {lat: 32.321, lng: -64.757}
  ]
);

console.log(response)  // true



let response =   PolyUtil.isLocationOnPath(
  {lat: 25.771, lng: -80.19}, // point array [lat, lng]
  [
    // poligon arrays of [lat, lng]
    {lat: 25.774, lng: -80.19},
    {lat: 18.466, lng: -66.118},
    {lat: 32.321, lng: -64.757}
  ]
);

console.log(response) // false  

let response =  PolyUtil.containsLocation(
  {lat: 23.886, lng: -65.269}, // point array [lat, lng]
  [
    // poligon arrays of [lat, lng]
    {lat: 25.774, lng: -80.19},
    {lat: 18.466, lng: -66.118},
    {lat: 32.321, lng: -64.757}
  ]
);

console.log(response) // false    

let response = PolyUtil.distanceToLine(
  {lat: 61.387002, lng: 23.890636}, // point array [lat, lng]
  {lat: 61.487002, lng: 23.790636}, // line startpoint array [lat, lng]
  {lat: 60.48047, lng: 22.052754} // line endpoint array [lat, lng]
);
console.log(response) // 12325.124046196 in meters

let response =  PolyUtil.encode([
  {lat: 38.5, lng: -120.2},
  {lat: 40.7, lng: -120.95},
  {lat: 43.252, lng: -126.453}
]);

console.log(response) // '_p~iF~ps|U_ulLnnqC_mqNvxq`@'


let response =  PolyUtil.decode('_p~iF~ps|U_ulLnnqC_mqNvxq`@');  

console.log(response) /**
  [ { lat: 38.5, lng: -120.2 },
    { lat: 40.7, lng: -120.95 },
    { lat: 43.252, lng: -126.45300000000002 }
  ]

  */
