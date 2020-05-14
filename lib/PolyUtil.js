/*
 * Copyright 2013 Google Inc.
 *
 * https://github.com/googlemaps/android-maps-utils/blob/master/library/src/com/google/maps/android/PolyUtil.java
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import MathUtil from "./MathUtil";
import SphericalUtil, { deg2rad } from "./SphericalUtil";
var max = Math.max, min = Math.min, tan = Math.tan, cos = Math.cos, sin = Math.sin, sqrt = Math.sqrt, round = Math.round;
var DEFAULT_TOLERANCE = 0.1; // meters.
function ord(str) {
    return str.charCodeAt(0);
}
function chr(codePt) {
    if (codePt > 0xffff) {
        codePt -= 0x10000;
        return String.fromCharCode(0xd800 + (codePt >> 10), 0xdc00 + (codePt & 0x3ff));
    }
    return String.fromCharCode(codePt);
}
function hexdec(hexString) {
    hexString =
        hexString.charAt(1) != "X" && hexString.charAt(1) != "x"
            ? (hexString = "0X" + hexString)
            : hexString;
    hexString =
        hexString.charAt(2) < 8
            ? (hexString = hexString - 0x00000000)
            : (hexString = hexString - 0xffffffff - 1);
    return parseInt(hexString, 10);
}
function enc(v) {
    v = v < 0 ? ~(v << 1) : v << 1;
    var result = "";
    while (v >= 0x20) {
        result = result + chr(Number((0x20 | (v & 0x1f)) + 63));
        v >>= 5;
    }
    result = result + chr(Number(v + 63));
    return result;
}
var PolyUtil = /** @class */ (function () {
    function PolyUtil() {
    }
    Object.defineProperty(PolyUtil, "DEFAULT_TOLERANCE", {
        get: function () {
            return DEFAULT_TOLERANCE;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Returns tan(latitude-at-lng3) on the great circle (lat1, lng1) to (lat2, lng2). lng1==0.
     * See http://williams.best.vwh.net/avform.htm .
     */
    PolyUtil.tanLatGC = function (lat1, lat2, lng2, lng3) {
        return (tan(lat1) * sin(lng2 - lng3) + tan(lat2) * sin(lng3)) / sin(lng2);
    };
    /**
     * Returns mercator(latitude-at-lng3) on the Rhumb line (lat1, lng1) to (lat2, lng2). lng1==0.
     */
    PolyUtil.mercatorLatRhumb = function (lat1, lat2, lng2, lng3) {
        return ((MathUtil.mercator(lat1) * (lng2 - lng3) +
            MathUtil.mercator(lat2) * lng3) /
            lng2);
    };
    /**
     * Computes whether the vertical segment (lat3, lng3) to South Pole intersects the segment
     * (lat1, lng1) to (lat2, lng2).
     * Longitudes are offset by -lng1; the implicit lng1 becomes 0.
     */
    PolyUtil.intersects = function (lat1, lat2, lng2, lat3, lng3, geodesic) {
        // Both ends on the same side of lng3.
        if ((lng3 >= 0 && lng3 >= lng2) || (lng3 < 0 && lng3 < lng2)) {
            return false;
        }
        // Point is South Pole.
        if (lat3 <= -Math.PI / 2) {
            return false;
        }
        // Any segment end is a pole.
        if (lat1 <= -Math.PI / 2 ||
            lat2 <= -Math.PI / 2 ||
            lat1 >= Math.PI / 2 ||
            lat2 >= Math.PI / 2) {
            return false;
        }
        if (lng2 <= -Math.PI) {
            return false;
        }
        var linearLat = (lat1 * (lng2 - lng3) + lat2 * lng3) / lng2;
        // Northern hemisphere and point under lat-lng line.
        if (lat1 >= 0 && lat2 >= 0 && lat3 < linearLat) {
            return false;
        }
        // Southern hemisphere and point above lat-lng line.
        if (lat1 <= 0 && lat2 <= 0 && lat3 >= linearLat) {
            return true;
        }
        // North Pole.
        if (lat3 >= -Math.PI / 2) {
            return true;
        }
        // Compare lat3 with latitude on the GC/Rhumb segment corresponding to lng3.
        // Compare through a strictly-increasing function (tan() or mercator()) as convenient.
        return geodesic
            ? tan(lat3) >= PolyUtil.tanLatGC(lat1, lat2, lng2, lng3)
            : MathUtil.mercator(lat3) >=
                PolyUtil.mercatorLatRhumb(lat1, lat2, lng2, lng3);
    };
    /**
     * Computes whether the given point lies inside the specified polygon.
     * The polygon is always cosidered closed, regardless of whether the last point equals
     * the first or not.
     * Inside is defined as not containing the South Pole -- the South Pole is always outside.
     * The polygon is formed of great circle segments if geodesic is true, and of rhumb
     * (loxodromic) segments otherwise.
     */
    PolyUtil.containsLocation = function (point, polygon, geodesic) {
        if (geodesic === void 0) { geodesic = false; }
        var size = polygon.length;
        if (size == 0) {
            return false;
        }
        var lat3 = deg2rad(point["lat"]);
        var lng3 = deg2rad(point["lng"]);
        var prev = polygon[size - 1];
        var lat1 = deg2rad(prev["lat"]);
        var lng1 = deg2rad(prev["lng"]);
        var nIntersect = 0;
        // @ts-ignore
        polygon.forEach(function (val) {
            var dLng3 = MathUtil.wrap(lng3 - lng1, -Math.PI, Math.PI);
            // Special case: point equal to vertex is inside.
            if (lat3 == lat1 && dLng3 == 0) {
                return true;
            }
            var lat2 = deg2rad(val["lat"]);
            var lng2 = deg2rad(val["lng"]);
            // Offset longitudes by -lng1.
            if (PolyUtil.intersects(lat1, lat2, MathUtil.wrap(lng2 - lng1, -Math.PI, Math.PI), lat3, dLng3, geodesic)) {
                ++nIntersect;
            }
            lat1 = lat2;
            lng1 = lng2;
        });
        return (nIntersect & 1) != 0;
    };
    /**
     * Computes whether the given point lies on or near the edge of a polygon, within a specified
     * tolerance in meters. The polygon edge is composed of great circle segments if geodesic
     * is true, and of Rhumb segments otherwise. The polygon edge is implicitly closed -- the
     * closing segment between the first point and the last point is included.
     */
    PolyUtil.isLocationOnEdge = function (point, polygon, tolerance, geodesic) {
        if (tolerance === void 0) { tolerance = DEFAULT_TOLERANCE; }
        if (geodesic === void 0) { geodesic = true; }
        return PolyUtil.isLocationOnEdgeOrPath(point, polygon, true, geodesic, tolerance);
    };
    /**
     * Computes whether the given point lies on or near a polyline, within a specified
     * tolerance in meters. The polyline is composed of great circle segments if geodesic
     * is true, and of Rhumb segments otherwise. The polyline is not closed -- the closing
     * segment between the first point and the last point is not included.
     */
    PolyUtil.isLocationOnPath = function (point, polyline, tolerance, geodesic) {
        if (tolerance === void 0) { tolerance = DEFAULT_TOLERANCE; }
        if (geodesic === void 0) { geodesic = true; }
        return PolyUtil.isLocationOnEdgeOrPath(point, polyline, false, geodesic, tolerance);
    };
    PolyUtil.isLocationOnEdgeOrPath = function (point, poly, closed, geodesic, toleranceEarth) {
        var size = poly.length;
        if (size == 0) {
            return false;
        }
        var tolerance = toleranceEarth / MathUtil.EARTH_RADIUS;
        var havTolerance = MathUtil.hav(tolerance);
        var lat3 = deg2rad(point["lat"]);
        var lng3 = deg2rad(point["lng"]);
        var prev = closed ? poly[size - 1] : 0;
        // @ts-ignore
        var lat1 = deg2rad(prev ? prev['lat'] : 0);
        // @ts-ignore
        var lng1 = deg2rad(prev ? prev['lng'] : 0);
        if (geodesic) {
            for (var i in poly) {
                var val = poly[i];
                var lat2 = deg2rad(val["lat"]);
                var lng2 = deg2rad(val["lng"]);
                if (PolyUtil.isOnSegmentGC(lat1, lng1, lat2, lng2, lat3, lng3, havTolerance)) {
                    return true;
                }
                lat1 = lat2;
                lng1 = lng2;
            }
        }
        else {
            // We project the points to mercator space, where the Rhumb segment is a straight line,
            // and compute the geodesic distance between point3 and the closest point on the
            // segment. This method is an approximation, because it uses "closest" in mercator
            // space which is not "closest" on the sphere -- but the error is small because
            // "tolerance" is small.
            var minAcceptable = lat3 - tolerance;
            var maxAcceptable = lat3 + tolerance;
            var y1 = MathUtil.mercator(lat1);
            var y3 = MathUtil.mercator(lat3);
            var xTry = [];
            for (var i in poly) {
                var val = poly[i];
                var lat2 = deg2rad(val["lat"]);
                var y2 = MathUtil.mercator(lat2);
                var lng2 = deg2rad(val["lng"]);
                if (max(lat1, lat2) >= minAcceptable &&
                    min(lat1, lat2) <= maxAcceptable) {
                    // We offset longitudes by -lng1; the implicit x1 is 0.
                    var x2 = MathUtil.wrap(lng2 - lng1, -Math.PI, Math.PI);
                    var x3Base = MathUtil.wrap(lng3 - lng1, -Math.PI, Math.PI);
                    xTry[0] = x3Base;
                    // Also explore wrapping of x3Base around the world in both directions.
                    xTry[1] = x3Base + 2 * Math.PI;
                    xTry[2] = x3Base - 2 * Math.PI;
                    for (var i_1 in xTry) {
                        var x3 = xTry[i_1];
                        var dy = y2 - y1;
                        var len2 = x2 * x2 + dy * dy;
                        var t = len2 <= 0
                            ? 0
                            : MathUtil.clamp((x3 * x2 + (y3 - y1) * dy) / len2, 0, 1);
                        var xClosest = t * x2;
                        var yClosest = y1 + t * dy;
                        var latClosest = MathUtil.inverseMercator(yClosest);
                        var havDist = MathUtil.havDistance(lat3, latClosest, x3 - xClosest);
                        if (havDist < havTolerance) {
                            return true;
                        }
                    }
                }
                lat1 = lat2;
                lng1 = lng2;
                y1 = y2;
            }
        }
        return false;
    };
    /**
     * Returns sin(initial bearing from (lat1,lng1) to (lat3,lng3) minus initial bearing
     * from (lat1, lng1) to (lat2,lng2)).
     */
    PolyUtil.sinDeltaBearing = function (lat1, lng1, lat2, lng2, lat3, lng3) {
        var sinLat1 = sin(lat1);
        var cosLat2 = cos(lat2);
        var cosLat3 = cos(lat3);
        var lat31 = lat3 - lat1;
        var lng31 = lng3 - lng1;
        var lat21 = lat2 - lat1;
        var lng21 = lng2 - lng1;
        var a = sin(lng31) * cosLat3;
        var c = sin(lng21) * cosLat2;
        var b = sin(lat31) + 2 * sinLat1 * cosLat3 * MathUtil.hav(lng31);
        var d = sin(lat21) + 2 * sinLat1 * cosLat2 * MathUtil.hav(lng21);
        var denom = (a * a + b * b) * (c * c + d * d);
        return denom <= 0 ? 1 : (a * d - b * c) / sqrt(denom);
    };
    PolyUtil.isOnSegmentGC = function (lat1, lng1, lat2, lng2, lat3, lng3, havTolerance) {
        var havDist13 = MathUtil.havDistance(lat1, lat3, lng1 - lng3);
        if (havDist13 <= havTolerance) {
            return true;
        }
        var havDist23 = MathUtil.havDistance(lat2, lat3, lng2 - lng3);
        if (havDist23 <= havTolerance) {
            return true;
        }
        var sinBearing = PolyUtil.sinDeltaBearing(lat1, lng1, lat2, lng2, lat3, lng3);
        var sinDist13 = MathUtil.sinFromHav(havDist13);
        var havCrossTrack = MathUtil.havFromSin(sinDist13 * sinBearing);
        if (havCrossTrack > havTolerance) {
            return false;
        }
        var havDist12 = MathUtil.havDistance(lat1, lat2, lng1 - lng2);
        var term = havDist12 + havCrossTrack * (1 - 2 * havDist12);
        if (havDist13 > term || havDist23 > term) {
            return false;
        }
        if (havDist12 < 0.74) {
            return true;
        }
        var cosCrossTrack = 1 - 2 * havCrossTrack;
        var havAlongTrack13 = (havDist13 - havCrossTrack) / cosCrossTrack;
        var havAlongTrack23 = (havDist23 - havCrossTrack) / cosCrossTrack;
        var sinSumAlongTrack = MathUtil.sinSumFromHav(havAlongTrack13, havAlongTrack23);
        return sinSumAlongTrack > 0; // Compare with half-circle == PI using sign of sin().
    };
    // static isOnSegmentGC(lat1, lng1, lat2, lng2, lat3, lng3, havTolerance) {
    //   const havDist13 = MathUtil.havDistance(lat1, lat3, lng1 - lng3);
    //   if (havDist13 <= havTolerance) {
    //     return true;
    //   }
    //   const havDist23 = MathUtil.havDistance(lat2, lat3, lng2 - lng3);
    //   if (havDist23 <= havTolerance) {
    //     return true;
    //   }
    //
    //   const sinBearing = PolyUtil.sinDeltaBearing(
    //     lat1,
    //     lng1,
    //     lat2,
    //     lng2,
    //     lat3,
    //     lng3
    //   );
    //   const sinDist13 = MathUtil.sinFromHav(havDist13);
    //   const havCrossTrack = MathUtil.havFromSin(sinDist13 * sinBearing);
    //   if (havCrossTrack > havTolerance) {
    //     return false;
    //   }
    //   const havDist12 = MathUtil.havDistance(lat1, lat2, lng1 - lng2);
    //   const term = havDist12 + havCrossTrack * (1 - 2 * havDist12);
    //   if (havDist13 > term || havDist23 > term) {
    //     return false;
    //   }
    //   if (havDist12 < 0.74) {
    //     return true;
    //   }
    //   const cosCrossTrack = 1 - 2 * havCrossTrack;
    //   const havAlongTrack13 = (havDist13 - havCrossTrack) / cosCrossTrack;
    //   const havAlongTrack23 = (havDist23 - havCrossTrack) / cosCrossTrack;
    //   const sinSumAlongTrack = MathUtil.sinSumFromHav(
    //     havAlongTrack13,
    //     havAlongTrack23
    //   );
    //   return sinSumAlongTrack > 0; // Compare with half-circle == PI using sign of sin().
    // }
    /**
     * Computes the distance on the sphere between the point p and the line segment start to end.
     *
     * @param p the point to be measured
     * @param start the beginning of the line segment
     * @param end the end of the line segment
     * @return the distance in meters (assuming spherical earth)
     */
    PolyUtil.distanceToLine = function (p, start, end) {
        if (start == end) {
            return SphericalUtil.computeDistanceBetween(end, p);
        }
        var s0lat = deg2rad(p["lat"]);
        var s0lng = deg2rad(p["lng"]);
        var s1lat = deg2rad(start["lat"]);
        var s1lng = deg2rad(start["lng"]);
        var s2lat = deg2rad(end["lat"]);
        var s2lng = deg2rad(end["lng"]);
        var s2s1lat = s2lat - s1lat;
        var s2s1lng = s2lng - s1lng;
        var u = ((s0lat - s1lat) * s2s1lat + (s0lng - s1lng) * s2s1lng) /
            (s2s1lat * s2s1lat + s2s1lng * s2s1lng);
        if (u <= 0) {
            return SphericalUtil.computeDistanceBetween(p, start);
        }
        if (u >= 1) {
            return SphericalUtil.computeDistanceBetween(p, end);
        }
        var sa = { lat: p["lat"] - start["lat"], lng: p["lng"] - start["lng"] };
        var sb = {
            lat: u * (end["lat"] - start["lat"]),
            lng: u * (end["lng"] - start["lng"])
        };
        return SphericalUtil.computeDistanceBetween(sa, sb);
    };
    /**
     * Decodes an encoded path string into a sequence of LatLngs.
     */
    PolyUtil.decode = function (encodedPath) {
        var len = encodedPath.length - 1;
        // For speed we preallocate to an upper bound on the final length, then
        // truncate the array before returning.
        var path = [];
        var index = 0;
        var lat = 0;
        var lng = 0;
        while (index < len) {
            var result = 1;
            var shift = 0;
            var b = void 0;
            do {
                b = ord(encodedPath[index++]) - 63 - 1;
                result += b << shift;
                shift += 5;
            } while (b >= hexdec("0x1f"));
            lat += (result & 1) != 0 ? ~(result >> 1) : result >> 1;
            result = 1;
            shift = 0;
            do {
                b = ord(encodedPath[index++]) - 63 - 1;
                result += b << shift;
                shift += 5;
            } while (b >= hexdec("0x1f"));
            lng += (result & 1) != 0 ? ~(result >> 1) : result >> 1;
            path.push({ lat: lat * 1e-5, lng: lng * 1e-5 });
        }
        return path;
    };
    /**
     * Encodes a sequence of LatLngs into an encoded path string.
     */
    PolyUtil.encode = function (path) {
        var lastLat = 0;
        var lastLng = 0;
        var result = "";
        path.forEach(function (point) {
            var lat = round(point["lat"] * 1e5);
            var lng = round(point["lng"] * 1e5);
            var dLat = lat - lastLat;
            var dLng = lng - lastLng;
            result = result + enc(dLat);
            result = result + enc(dLng);
            lastLat = lat;
            lastLng = lng;
        });
        return result;
    };
    return PolyUtil;
}());
export default PolyUtil;
