"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
const MathUtil_1 = require("./MathUtil");
const SphericalUtil_1 = require("./SphericalUtil");
const { max, min, tan, cos, sin, sqrt } = Math;
const DEFAULT_TOLERANCE = 0.1; // meters.
function py2_round(value) {
    // Google's polyline algorithm uses the same rounding strategy as Python 2, which is different from JS for negative values
    return Math.floor(Math.abs(value) + 0.5) * (value >= 0 ? 1 : -1);
}
function encode(current, previous, factor) {
    current = py2_round(current * factor);
    previous = py2_round(previous * factor);
    let coordinate = current - previous;
    coordinate <<= 1;
    if (current - previous < 0) {
        coordinate = ~coordinate;
    }
    let output = '';
    while (coordinate >= 0x20) {
        output += String.fromCharCode((0x20 | (coordinate & 0x1f)) + 63);
        coordinate >>= 5;
    }
    output += String.fromCharCode(coordinate + 63);
    return output;
}
class PolyUtil {
    static get DEFAULT_TOLERANCE() {
        return DEFAULT_TOLERANCE;
    }
    /**
     * Returns tan(latitude-at-lng3) on the great circle (lat1, lng1) to (lat2, lng2). lng1==0.
     * See http://williams.best.vwh.net/avform.htm .
     */
    static tanLatGC(lat1, lat2, lng2, lng3) {
        return (tan(lat1) * sin(lng2 - lng3) + tan(lat2) * sin(lng3)) / sin(lng2);
    }
    /**
     * Returns mercator(latitude-at-lng3) on the Rhumb line (lat1, lng1) to (lat2, lng2). lng1==0.
     */
    static mercatorLatRhumb(lat1, lat2, lng2, lng3) {
        return ((MathUtil_1.default.mercator(lat1) * (lng2 - lng3) +
            MathUtil_1.default.mercator(lat2) * lng3) /
            lng2);
    }
    /**
     * Computes whether the vertical segment (lat3, lng3) to South Pole intersects the segment
     * (lat1, lng1) to (lat2, lng2).
     * Longitudes are offset by -lng1; the implicit lng1 becomes 0.
     */
    static intersects(lat1, lat2, lng2, lat3, lng3, geodesic) {
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
        const linearLat = (lat1 * (lng2 - lng3) + lat2 * lng3) / lng2;
        // Northern hemisphere and point under lat-lng line.
        if (lat1 >= 0 && lat2 >= 0 && lat3 < linearLat) {
            return false;
        }
        // Southern hemisphere and point above lat-lng line.
        if (lat1 <= 0 && lat2 <= 0 && lat3 >= linearLat) {
            return true;
        }
        // North Pole.
        if (lat3 >= Math.PI / 2) {
            return true;
        }
        // Compare lat3 with latitude on the GC/Rhumb segment corresponding to lng3.
        // Compare through a strictly-increasing function (tan() or mercator()) as convenient.
        return geodesic
            ? tan(lat3) >= PolyUtil.tanLatGC(lat1, lat2, lng2, lng3)
            : MathUtil_1.default.mercator(lat3) >=
                PolyUtil.mercatorLatRhumb(lat1, lat2, lng2, lng3);
    }
    /**
     * Computes whether the given point lies inside the specified polygon.
     * The polygon is always cosidered closed, regardless of whether the last point equals
     * the first or not.
     * Inside is defined as not containing the South Pole -- the South Pole is always outside.
     * The polygon is formed of great circle segments if geodesic is true, and of rhumb
     * (loxodromic) segments otherwise.
     */
    static containsLocation(point, polygon, geodesic = false) {
        const size = polygon.length;
        if (size == 0) {
            return false;
        }
        let lat3 = SphericalUtil_1.deg2rad(point["lat"]);
        let lng3 = SphericalUtil_1.deg2rad(point["lng"]);
        let prev = polygon[size - 1];
        let lat1 = SphericalUtil_1.deg2rad(prev["lat"]);
        let lng1 = SphericalUtil_1.deg2rad(prev["lng"]);
        let nIntersect = 0;
        // @ts-ignore
        for (let index in polygon) {
            const val = polygon[index];
            let dLng3 = MathUtil_1.default.wrap(lng3 - lng1, -Math.PI, Math.PI);
            // Special case: point equal to vertex is inside.
            if (lat3 == lat1 && dLng3 == 0) {
                return true;
            }
            let lat2 = SphericalUtil_1.deg2rad(val["lat"]);
            let lng2 = SphericalUtil_1.deg2rad(val["lng"]);
            // Offset longitudes by -lng1.
            if (PolyUtil.intersects(lat1, lat2, MathUtil_1.default.wrap(lng2 - lng1, -Math.PI, Math.PI), lat3, dLng3, geodesic)) {
                ++nIntersect;
            }
            lat1 = lat2;
            lng1 = lng2;
        }
        return (nIntersect & 1) != 0;
    }
    /**
     * Computes whether the given point lies on or near the edge of a polygon, within a specified
     * tolerance in meters. The polygon edge is composed of great circle segments if geodesic
     * is true, and of Rhumb segments otherwise. The polygon edge is implicitly closed -- the
     * closing segment between the first point and the last point is included.
     */
    static isLocationOnEdge(point, polygon, tolerance = DEFAULT_TOLERANCE, geodesic = true) {
        return PolyUtil.isLocationOnEdgeOrPath(point, polygon, true, geodesic, tolerance);
    }
    /**
     * Computes whether the given point lies on or near a polyline, within a specified
     * tolerance in meters. The polyline is composed of great circle segments if geodesic
     * is true, and of Rhumb segments otherwise. The polyline is not closed -- the closing
     * segment between the first point and the last point is not included.
     */
    static isLocationOnPath(point, polyline, tolerance = DEFAULT_TOLERANCE, geodesic = true) {
        return PolyUtil.isLocationOnEdgeOrPath(point, polyline, false, geodesic, tolerance);
    }
    static isLocationOnEdgeOrPath(point, poly, closed, geodesic, toleranceEarth) {
        const size = poly.length;
        if (size == 0) {
            return false;
        }
        let tolerance = toleranceEarth / MathUtil_1.default.EARTH_RADIUS;
        let havTolerance = MathUtil_1.default.hav(tolerance);
        let lat3 = SphericalUtil_1.deg2rad(point["lat"]);
        let lng3 = SphericalUtil_1.deg2rad(point["lng"]);
        let prev = closed ? poly[size - 1] : 0;
        // @ts-ignore
        let lat1 = SphericalUtil_1.deg2rad(prev ? prev['lat'] : 0);
        // @ts-ignore
        let lng1 = SphericalUtil_1.deg2rad(prev ? prev['lng'] : 0);
        if (geodesic) {
            for (let i in poly) {
                const val = poly[i];
                let lat2 = SphericalUtil_1.deg2rad(val["lat"]);
                let lng2 = SphericalUtil_1.deg2rad(val["lng"]);
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
            let minAcceptable = lat3 - tolerance;
            let maxAcceptable = lat3 + tolerance;
            let y1 = MathUtil_1.default.mercator(lat1);
            let y3 = MathUtil_1.default.mercator(lat3);
            let xTry = [];
            for (let i in poly) {
                let val = poly[i];
                let lat2 = SphericalUtil_1.deg2rad(val["lat"]);
                let y2 = MathUtil_1.default.mercator(lat2);
                let lng2 = SphericalUtil_1.deg2rad(val["lng"]);
                if (max(lat1, lat2) >= minAcceptable &&
                    min(lat1, lat2) <= maxAcceptable) {
                    // We offset longitudes by -lng1; the implicit x1 is 0.
                    let x2 = MathUtil_1.default.wrap(lng2 - lng1, -Math.PI, Math.PI);
                    let x3Base = MathUtil_1.default.wrap(lng3 - lng1, -Math.PI, Math.PI);
                    xTry[0] = x3Base;
                    // Also explore wrapping of x3Base around the world in both directions.
                    xTry[1] = x3Base + 2 * Math.PI;
                    xTry[2] = x3Base - 2 * Math.PI;
                    for (let i in xTry) {
                        let x3 = xTry[i];
                        let dy = y2 - y1;
                        let len2 = x2 * x2 + dy * dy;
                        let t = len2 <= 0
                            ? 0
                            : MathUtil_1.default.clamp((x3 * x2 + (y3 - y1) * dy) / len2, 0, 1);
                        let xClosest = t * x2;
                        let yClosest = y1 + t * dy;
                        let latClosest = MathUtil_1.default.inverseMercator(yClosest);
                        let havDist = MathUtil_1.default.havDistance(lat3, latClosest, x3 - xClosest);
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
    }
    /**
     * Returns sin(initial bearing from (lat1,lng1) to (lat3,lng3) minus initial bearing
     * from (lat1, lng1) to (lat2,lng2)).
     */
    static sinDeltaBearing(lat1, lng1, lat2, lng2, lat3, lng3) {
        const sinLat1 = sin(lat1);
        const cosLat2 = cos(lat2);
        const cosLat3 = cos(lat3);
        const lat31 = lat3 - lat1;
        const lng31 = lng3 - lng1;
        const lat21 = lat2 - lat1;
        const lng21 = lng2 - lng1;
        const a = sin(lng31) * cosLat3;
        const c = sin(lng21) * cosLat2;
        const b = sin(lat31) + 2 * sinLat1 * cosLat3 * MathUtil_1.default.hav(lng31);
        const d = sin(lat21) + 2 * sinLat1 * cosLat2 * MathUtil_1.default.hav(lng21);
        const denom = (a * a + b * b) * (c * c + d * d);
        return denom <= 0 ? 1 : (a * d - b * c) / sqrt(denom);
    }
    static isOnSegmentGC(lat1, lng1, lat2, lng2, lat3, lng3, havTolerance) {
        const havDist13 = MathUtil_1.default.havDistance(lat1, lat3, lng1 - lng3);
        if (havDist13 <= havTolerance) {
            return true;
        }
        const havDist23 = MathUtil_1.default.havDistance(lat2, lat3, lng2 - lng3);
        if (havDist23 <= havTolerance) {
            return true;
        }
        const sinBearing = PolyUtil.sinDeltaBearing(lat1, lng1, lat2, lng2, lat3, lng3);
        const sinDist13 = MathUtil_1.default.sinFromHav(havDist13);
        const havCrossTrack = MathUtil_1.default.havFromSin(sinDist13 * sinBearing);
        if (havCrossTrack > havTolerance) {
            return false;
        }
        const havDist12 = MathUtil_1.default.havDistance(lat1, lat2, lng1 - lng2);
        const term = havDist12 + havCrossTrack * (1 - 2 * havDist12);
        if (havDist13 > term || havDist23 > term) {
            return false;
        }
        if (havDist12 < 0.74) {
            return true;
        }
        const cosCrossTrack = 1 - 2 * havCrossTrack;
        const havAlongTrack13 = (havDist13 - havCrossTrack) / cosCrossTrack;
        const havAlongTrack23 = (havDist23 - havCrossTrack) / cosCrossTrack;
        const sinSumAlongTrack = MathUtil_1.default.sinSumFromHav(havAlongTrack13, havAlongTrack23);
        return sinSumAlongTrack > 0; // Compare with half-circle == PI using sign of sin().
    }
    /**
     * Computes the distance on the sphere between the point p and the line segment start to end.
     *
     * @param p the point to be measured
     * @param start the beginning of the line segment
     * @param end the end of the line segment
     * @return the distance in meters (assuming spherical earth)
     */
    static distanceToLine(p, start, end) {
        if (start == end) {
            return SphericalUtil_1.default.computeDistanceBetween(end, p);
        }
        const s0lat = SphericalUtil_1.deg2rad(p["lat"]);
        const s0lng = SphericalUtil_1.deg2rad(p["lng"]);
        const s1lat = SphericalUtil_1.deg2rad(start["lat"]);
        const s1lng = SphericalUtil_1.deg2rad(start["lng"]);
        const s2lat = SphericalUtil_1.deg2rad(end["lat"]);
        const s2lng = SphericalUtil_1.deg2rad(end["lng"]);
        const s2s1lat = s2lat - s1lat;
        const s2s1lng = s2lng - s1lng;
        const u = ((s0lat - s1lat) * s2s1lat + (s0lng - s1lng) * s2s1lng) /
            (s2s1lat * s2s1lat + s2s1lng * s2s1lng);
        if (u <= 0) {
            return SphericalUtil_1.default.computeDistanceBetween(p, start);
        }
        if (u >= 1) {
            return SphericalUtil_1.default.computeDistanceBetween(p, end);
        }
        const su = { 'lat': start['lat'] + u * (end['lat'] - start['lat']), 'lng': start['lng'] + u * (end['lng'] - start['lng']) };
        return SphericalUtil_1.default.computeDistanceBetween(p, su);
    }
    /**
     * Decodes an encoded path string into a sequence of LatLngs.
     */
    static decode(encodedPath, precision = 5) {
        var index = 0, lat = 0, lng = 0, coordinates = [], shift = 0, result = 0, byte = null, latitude_change, longitude_change, factor = Math.pow(10, Number.isInteger(precision) ? precision : 5);
        // Coordinates have variable length when encoded, so just keep
        // track of whether we've hit the end of the string. In each
        // loop iteration, a single coordinate is decoded.
        while (index < encodedPath.length) {
            // Reset shift, result, and byte
            byte = null;
            shift = 0;
            result = 0;
            do {
                byte = encodedPath.charCodeAt(index++) - 63;
                result |= (byte & 0x1f) << shift;
                shift += 5;
            } while (byte >= 0x20);
            latitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));
            shift = result = 0;
            do {
                byte = encodedPath.charCodeAt(index++) - 63;
                result |= (byte & 0x1f) << shift;
                shift += 5;
            } while (byte >= 0x20);
            longitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));
            lat += latitude_change;
            lng += longitude_change;
            coordinates.push({ lat: lat / factor, lng: lng / factor });
        }
        return coordinates;
    }
    /**
     * Encodes a sequence of LatLngs into an encoded path string.
     */
    static encode(path, precision = 5) {
        var factor = Math.pow(10, Number.isInteger(precision) ? precision : 5), output = encode(path[0].lat, 0, factor) + encode(path[0].lng, 0, factor);
        for (var i = 1; i < path.length; i++) {
            var a = path[i], b = path[i - 1];
            output += encode(a.lat, b.lat, factor);
            output += encode(a.lng, b.lng, factor);
        }
        return output;
    }
}
exports.default = PolyUtil;
