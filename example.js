const SphericalUtil = require('./lib/SphericalUtil').default
const PolyUtil = require('./lib/PolyUtil').default

const example1 = SphericalUtil.computeHeading(
  {lat: 25.775, lng: -80.19}, // from array [lat, lng]
  {lat: 21.774, lng: -80.19} // to array [lat, lng]
);
console.log(`Example1 = ${example1}`); // -180

const example2 = SphericalUtil.computeDistanceBetween(
  {lat: 25.775, lng: -80.19}, //from array [lat, lng]
  {lat: 21.774, lng: -80.19} // to array [lat, lng]
);

console.log(`Example2 = ${example2}`); // 444891.52998049

const example3 = PolyUtil.isLocationOnEdge(
  {lat: 25.774, lng: -80.19}, // point array [lat, lng]
  [
    // poligon arrays of [lat, lng]
    {lat: 25.774, lng: -80.19},
    {lat: 18.466, lng: -66.118},
    {lat: 32.321, lng: -64.757}
  ]
);

console.log(`Example3 = ${example3}`); // true >?>>>>

const example4 = PolyUtil.isLocationOnPath(
  {lat: 25.771, lng: -80.19}, // point array [lat, lng]
  [
    // poligon arrays of [lat, lng]
    {lat: 25.774, lng: -80.19},
    {lat: 18.466, lng: -66.118},
    {lat: 32.321, lng: -64.757}
  ]
);

console.log(`Example4 = ${example4}`); // false

const example5 = PolyUtil.containsLocation(
  {lat: 23.886, lng: -65.269}, // point array [lat, lng]
  [
    // poligon arrays of [lat, lng]
    {lat: 25.774, lng: -80.19},
    {lat: 18.466, lng: -66.118},
    {lat: 32.321, lng: -64.757}
  ]
);

console.log(`Example5 = ${example5}`); // false

const example6 = PolyUtil.distanceToLine(
  {lat: 61.387002, lng: 23.890636}, // point array [lat, lng]
  {lat: 61.487002, lng: 23.790636}, // line startpoint array [lat, lng]
  {lat: 60.48047, lng: 22.052754} // line endpoint array [lat, lng]
);

console.log(`Example6 = ${example6}`); // 12325.124046196 in meters

const example7 = PolyUtil.encode([
  {lat: 38.5, lng: -120.2},
  {lat: 40.7, lng: -120.95},
  {lat: 43.252, lng: -126.453}
]);

console.log(`Example7 = ${example7}`); // '_p~iF~ps|U_ulLnnqC_mqNvxq`@'

const example8 = PolyUtil.decode("_p~iF~ps|U_ulLnnqC_mqNvxq`@");
console.log(`Example8 = ${JSON.stringify(example8)}`);
/**
[ { lat: 38.5, lng: -120.2 },
  { lat: 40.7, lng: -120.95 },
  { lat: 43.252, lng: -126.453 }
]

*/
