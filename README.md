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
yarn add node-geometry-library
```

```
npm i node-geometry-library
```

Usage
------------

Here is an example of using GeometryLibrary:
```
import {SphericalUtil, PolyUtil} from "node-geometry-library";

let response = SphericalUtil.computeHeading(
  {lat: 25.775, lng: -80.19}, // from object {lat, lng}
  {lat: 21.774, lng: -80.19} // to object {lat, lng}
);
console.log(response) // -180

let response = SphericalUtil.computeDistanceBetween(
  {lat: 25.775, lng: -80.19}, //from object {lat, lng}
  {lat: 21.774, lng: -80.19} // to object {lat, lng}
);

console.log(response) // 444891.52998049


let response =  PolyUtil.isLocationOnEdge(
  {lat: 25.774, lng: -80.19}, // point object {lat, lng}
  [
    // poligon arrays of object {lat, lng}
    {lat: 25.774, lng: -80.19},
    {lat: 18.466, lng: -66.118},
    {lat: 32.321, lng: -64.757}
  ]
);

console.log(response)  // true



let response =   PolyUtil.isLocationOnPath(
  {lat: 25.771, lng: -80.19}, // point object {lat, lng}
  [
    // poligon arrays of object {lat, lng}
    {lat: 25.774, lng: -80.19},
    {lat: 18.466, lng: -66.118},
    {lat: 32.321, lng: -64.757}
  ]
);

console.log(response) // true  

let response =  PolyUtil.containsLocation(
  {lat: 23.886, lng: -65.269}, // point object {lat, lng}
  [
    // poligon arrays of object {lat, lng}
    {lat: 25.774, lng: -80.19},
    {lat: 18.466, lng: -66.118},
    {lat: 32.321, lng: -64.757}
  ]
);

console.log(response) // false    

let response = PolyUtil.distanceToLine(
  {lat: 61.387002, lng: 23.890636}, // point object {lat, lng}
  {lat: 61.487002, lng: 23.790636}, // line startpoint object {lat, lng}
  {lat: 60.48047, lng: 22.052754} // line endpoint object {lat, lng}
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
    { lat: 43.252, lng: -126.453 }
  ]

  */

```
Available methods
------------
## PolyUtil class
* [`containsLocation(point, polygon, geodesic = false)`](#containsLocation)
* [`isLocationOnEdge(point, polygon, tolerance = PolyUtil.DEFAULT_TOLERANCE, geodesic = true)`](#isLocationOnEdge)
* [`isLocationOnPath(point, polyline, tolerance = PolyUtil.DEFAULT_TOLERANCE, geodesic = true)`](#isLocationOnPath)
* [`distanceToLine(p, start, end)`](#distanceToLine)
* [`decode(encodedPath)`](#decode)
* [`encode(path)`](#encode)

## SphericalUtil class
* [`computeHeading(from, to)`](#computeHeading)
* [`computeOffset(from, distance, heading)`](#computeOffset)
* [`computeOffsetOrigin(to, distance,  heading)`](#computeOffsetOrigin)
* [`interpolate(from, to, fraction)`](#interpolate)
* [`computeDistanceBetween( from, to)`](#computeDistanceBetween)
* [`computeLength(path)`](#computeLength)
* [`computeArea(path)`](#computeArea)
* [`computeSignedArea(path)`](#computeSignedArea)


---

<a name="containsLocation"></a>
**`containsLocation( point, polygon, geodesic = false )`** - To find whether a given point falls within a polygon

* `point` -  {'lat': 38.5, 'lng': -120.2}
* `polygon` - [ {'lat': 38.5, 'lng': -120.2}, {'lat': 40.7, 'lng': -120.95 }, {'lat': 43.252, 'lng': -126.453} ]
* `geodesic` - boolean


Returns boolean

```php

const response =  PolyUtil.containsLocation(
              {'lat': 23.886, 'lng': -65.269}, // point object of {lat, lng}
             [ // poligon arrays of object {lat, lng}
                {'lat': 25.774, 'lng': -80.190},
                {'lat': 18.466, 'lng': -66.118},
                {'lat': 32.321, 'lng': -64.757}
             ]);  

console.log(response) // false

```


---


<a name="isLocationOnEdge"></a>
**`isLocationOnEdge( point, polygon, tolerance = PolyUtil.DEFAULT_TOLERANCE, geodesic = true )`** - To determine whether a point falls on or near a polyline, or on or near the edge of a polygon, within a specified tolerance in meters.

* `point` -  {'lat': 25.774, 'lng': -80.190}
* `polygon` -  [{'lat': 38.5, 'lng': -120.2}, {'lat': 40.7, 'lng': -120.95}, {'lat': 43.252, 'lng': -126.453}]
* `tolerance` -  tolerance value in degrees
* `geodesic` - boolean

Returns boolean

```php

const response =  PolyUtil.isLocationOnEdge(
              {'lat': 25.774, 'lng': -80.190}, // point object {lat, lng}
              [ // poligon arrays of object {lat, lng}
                {'lat': 25.774, 'lng': -80.190},
                {'lat': 18.466, 'lng': -66.118},
                {'lat': 32.321, 'lng': -64.757}
              ])  ;

console.log(response) // true

```
---

<a name="isLocationOnPath"></a>
**`isLocationOnPath( point, polygon, tolerance = PolyUtil.DEFAULT_TOLERANCE, geodesic = true )`** - To determine whether a point falls on or near a polyline, within a specified tolerance in meters

* `point` -  {'lat': 25.774, 'lng': -80.190}
* `polygon` -  [{'lat': 38.5, 'lng': -120.2}, {'lat': 40.7, 'lng': -120.95}, {'lat': 43.252, 'lng': -126.453}]
* `tolerance` -  tolerance value in degrees
* `geodesic` - boolean

Returns boolean

```php

response = PolyUtil.isLocationOnPath(
              {'lat': 25.774, 'lng': -80.190}, // point object if {lat, lng}
              [ // poligon arrays of object {lat, lng}
                {'lat': 25.774, 'lng': -80.190},
                {'lat': 18.466, 'lng': -66.118},
                {'lat': 32.321, 'lng': -64.757}
              ])  ;

console.log(response) // true

```
---

<a name="distanceToLine"></a>
**`distanceToLine( p, start, end )`** - To calculate distance from a point to line start->end on sphere.

* `p` -  {'lat': 61.387002, 'lng': 23.890636}
* `start` -  {'lat': 61.487002, 'lng': 23.790636}
* `end` -  {'lat': 60.48047, 'lng': 22.052754}

Returns distance from a point to line

```php

const response = PolyUtil.distanceToLine(
              {'lat': 61.387002, 'lng': 23.890636}, // point object {lat, lng}
              {'lat': 61.487002, 'lng': 23.790636}, // line start point object {lat, lng}
              {'lat': 60.48047, 'lng': 22.052754}// line endpoint object {lat, lng}
             );  

console.log(response) // 12325.124046196 in meters

```
---
<a name="decode"></a>

**`decode( encodedPath )`** - Decodes an encoded path string into a sequence of LatLngs.

* `encodedPath` - string '_p~iF~ps|U_ulLnnqC_mqNvxq`@'

Returns array

```php

const response = PolyUtil.decode('_p~iF~ps|U_ulLnnqC_mqNvxq`@');  

console.log(response);
/*
  [ { lat: 38.5, lng: -120.2 },
    { lat: 40.7, lng: -120.95 },
    { lat: 43.252, lng: -126.453 }
  ]

*/

```
---


<a name="encode"></a>
**`encode( path )`** - Encodes a sequence of LatLngs into an encoded path string.

* `path` -  [ {'lat': 38.5, 'lng': -120.2}, {'lat': 40.7, 'lng': -120.95}, {'lat': 43.252, 'lng': -126.453} ]

Returns string

```php

response =  PolyUtil.encode(
              [
                {'lat': 38.5, 'lng': -120.2},
                {'lat': 40.7, 'lng': -120.95},
                {'lat': 43.252, 'lng': -126.453}
              ]);

console.log(response); // '_p~iF~ps|U_ulLnnqC_mqNvxq`@'

```
---

<a name="computeHeading"></a>
**`computeHeading( from, to )`** - Returns the heading from one LatLng to another LatLng.

* `from` -  {'lat': 38.5, 'lng': -120.2}
* `to` -  {'lat': 40.7, 'lng': -120.95}

Returns int

```php

response =  SphericalUtil.computeHeading(
              {'lat': 25.775, 'lng': -80.190},
              {'lat': 21.774, 'lng': -80.190}));

console.log(response); // -180

```
---

<a name="computeOffset"></a>
**`computeOffset( from, distance, heading )`** - Returns the LatLng resulting from moving a distance from an origin in the specified heading.

* `from` -  {'lat': 38.5, 'lng': -120.2}
* `distance` - number, the distance to travel
* `heading` - number, the heading in degrees clockwise from north

Returns array

```php

response =  SphericalUtil.computeOffset({'lat': 25.775, 'lng': -80.190}, 152, 120);

console.log(response);

/*
  {
    'lat': 25.774316510639,
    'lng': -80.188685385944
  }
*/

```
---

<a name="computeOffsetOrigin"></a>
**`computeOffsetOrigin( from, distance, heading )`** - Returns the location of origin when provided with a LatLng destination, meters travelled and original heading. Headings are expressed in degrees clockwise from North.

* `from` -  {'lat': 38.5, 'lng': -120.2}
* `distance` - number, the distance to travel
* `heading` - number, the heading in degrees clockwise from north

Returns array

```php

response =  SphericalUtil.computeOffsetOrigin({'lat': 25.775, 'lng': -80.190}, 152, 120);

console.log(response);
/*
  {
    'lat': 14.33435503928,
    'lng': -263248.24242931
  }
*/

```
---

<a name="interpolate"></a>
**`interpolate( from, to, fraction )`** - Returns the LatLng which lies the given fraction of the way between the origin LatLng and the destination LatLng.

* `from` -  {'lat': 38.5, 'lng': -120.2}
* `to` -  {'lat': 38.5, 'lng': -120.2}
* `fraction` - number, a fraction of the distance to travel

Returns array

```php

response =  SphericalUtil.interpolate({'lat': 25.775, 'lng': -80.190}, {'lat':26.215, 'lng': -81.218}, 2);

console.log(response);
/*
    {
      'lat': 26.647635362403,
      'lng': -82.253737943391
    }
*/

```
---

<a name="computeDistanceBetween"></a>
**`computeDistanceBetween( from, to )`** - Returns the distance, in meters, between two LatLngs. You can optionally specify a custom radius. The radius defaults to the radius of the Earth.

* `from` - {'lat': 38.5, 'lng': -120.2}
* `to` - {'lat': 38.5, 'lng': -120.2}

Returns float

```php

response =  SphericalUtil.computeDistanceBetween({'lat': 25.775, 'lng': -80.190}, {'lat': 26.215, 'lng': -81.218});

console.log(response); //float 113797.92421349

```
---

<a name="computeLength"></a>
**`computeLength( path )`** - Returns the length of the given path, in meters, on Earth.

* `path` - [ {'lat': 38.5, 'lng': -120.2}, {'lat': 40.7, 'lng': -120.95}, {'lat': 43.252, 'lng': -126.453} ]

Returns float

```php

const response =  SphericalUtil.computeLength([
                {'lat': 38.5, 'lng': -120.2},
                {'lat': 40.7, 'lng': -120.95},
                {'lat': 43.252, 'lng': -126.453}
              ]);

console.log(response); //float 788906.98459431

```
---

<a name="computeArea"></a>
**`computeArea( path )`** - Returns the area of a closed path.

* `path` - [ {'lat': 38.5, 'lng': -120.2}, {'lat': 40.7, 'lng': -120.95}, {'lat': 43.252, 'lng': -126.453} ]

Returns float

```php

response =  SphericalUtil.computeArea([
                {'lat': 38.5, 'lng': -120.2},
                {'lat': 40.7, 'lng': -120.95},
                {'lat': 43.252, 'lng': -126.453}
              ]);

console.log(response); //float 44766785529.143

```
---

<a name="computeSignedArea"></a>
**`computeSignedArea( path )`** - Returns the signed area of a closed path.

* `path` - [ {'lat': 38.5, 'lng': -120.2}, {'lat': 40.7, 'lng': -120.95}, {'lat': 43.252, 'lng': -126.453} ]

Returns float

```php

response =  SphericalUtil.computeSignedArea([
                {'lat': 38.5, 'lng': -120.2},
                {'lat': 40.7, 'lng': -120.95},
                {'lat': 43.252, 'lng': -126.453}
              ]);

console.log(response); //float 44766785529.143

```
---

Credits
-------
[alexpechkarev](https://github.com/alexpechkarev/geometry-library)


Support
-------

[Please open an issue on GitHub](https://github.com/BunHouth/geometry-library/issues)


License
-------

Geometry Library Google Maps API V3 is released under the MIT License. See the bundled
[LICENSE](https://github.com/BunHouth/geometry-library./blob/master/LICENSE)
file for details.
