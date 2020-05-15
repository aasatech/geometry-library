"use strict";
/*
 * Copyright 2013 Google Inc.
 * https://github.com/googlemaps/android-maps-utils/blob/master/library/src/com/google/maps/android/SphericalUtil.java
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
exports.rad2deg = exports.deg2rad = void 0;
const MathUtil_1 = require("./MathUtil");
const { tan, atan2, cos, sin, asin, sqrt, abs } = Math;
function deg2rad(degrees) {
    return degrees * (Math.PI / 180);
}
exports.deg2rad = deg2rad;
function rad2deg(radians) {
    return radians * (180 / Math.PI);
}
exports.rad2deg = rad2deg;
class SphericalUtil {
    /**
     * Returns the heading from one LatLng to another LatLng. Headings are
     * expressed in degrees clockwise from North within the range [-180,180).
     * @return The heading in degrees clockwise from north.
     */
    static computeHeading(from, to) {
        // http://williams.best.vwh.net/avform.htm#Crs
        const fromLat = deg2rad(from["lat"]);
        const fromLng = deg2rad(from["lng"]);
        const toLat = deg2rad(to["lat"]);
        const toLng = deg2rad(to["lng"]);
        const dLng = toLng - fromLng;
        const heading = atan2(sin(dLng) * cos(toLat), cos(fromLat) * sin(toLat) - sin(fromLat) * cos(toLat) * cos(dLng));
        return MathUtil_1.default.wrap(rad2deg(heading), -180, 180);
    }
    /**
     * Returns the LatLng resulting from moving a distance from an origin
     * in the specified heading (expressed in degrees clockwise from north).
     * @param from     The LatLng from which to start.
     * @param distance The distance to travel.
     * @param heading  The heading in degrees clockwise from north.
     */
    static computeOffset(from, distance, heading) {
        distance /= MathUtil_1.default.EARTH_RADIUS;
        heading = deg2rad(heading);
        // http://williams.best.vwh.net/avform.htm#LL
        const fromLat = deg2rad(from["lat"]);
        const fromLng = deg2rad(from["lng"]);
        const cosDistance = cos(distance);
        const sinDistance = sin(distance);
        const sinFromLat = sin(fromLat);
        const cosFromLat = cos(fromLat);
        const sinLat = cosDistance * sinFromLat + sinDistance * cosFromLat * cos(heading);
        const dLng = atan2(sinDistance * cosFromLat * sin(heading), cosDistance - sinFromLat * sinLat);
        return { lat: rad2deg(asin(sinLat)), lng: rad2deg(fromLng + dLng) };
    }
    /**
     * Returns the location of origin when provided with a LatLng destination,
     * meters travelled and original heading. Headings are expressed in degrees
     * clockwise from North. This function returns null when no solution is
     * available.
     * @param to       The destination LatLng.
     * @param distance The distance travelled, in meters.
     * @param heading  The heading in degrees clockwise from north.
     */
    static computeOffsetOrigin(to, distance, heading) {
        heading = deg2rad(heading);
        distance /= MathUtil_1.default.EARTH_RADIUS;
        // http://lists.maptools.org/pipermail/proj/2008-October/003939.html
        const n1 = cos(distance);
        const n2 = sin(distance) * cos(heading);
        const n3 = sin(distance) * sin(heading);
        const n4 = sin(rad2deg(to["lat"]));
        // There are two solutions for b. b = n2 * n4 +/- sqrt(), one solution results
        // in the latitude outside the [-90, 90] range. We first try one solution and
        // back off to the other if we are outside that range.
        const n12 = n1 * n1;
        const discriminant = n2 * n2 * n12 + n12 * n12 - n12 * n4 * n4;
        if (discriminant < 0) {
            // No real solution which would make sense in LatLng-space.
            return null;
        }
        let b = n2 * n4 + sqrt(discriminant);
        b /= n1 * n1 + n2 * n2;
        let a = (n4 - n2 * b) / n1;
        let fromLatRadians = atan2(a, b);
        if (fromLatRadians < -Math.PI / 2 || fromLatRadians > Math.PI / 2) {
            b = n2 * n4 - sqrt(discriminant);
            b /= n1 * n1 + n2 * n2;
            fromLatRadians = atan2(a, b);
        }
        if (fromLatRadians < -Math.PI / 2 || fromLatRadians > Math.PI / 2) {
            // No solution which would make sense in LatLng-space.
            return null;
        }
        const fromLngRadians = rad2deg(to["lng"]) -
            atan2(n3, n1 * cos(fromLatRadians) - n2 * sin(fromLatRadians));
        return { lat: rad2deg(fromLatRadians), lng: rad2deg(fromLngRadians) };
    }
    /**
     * Returns the LatLng which lies the given fraction of the way between the
     * origin LatLng and the destination LatLng.
     * @param from     The LatLng from which to start.
     * @param to       The LatLng toward which to travel.
     * @param fraction A fraction of the distance to travel.
     * @return The interpolated LatLng.
     */
    static interpolate(from, to, fraction) {
        // http://en.wikipedia.org/wiki/Slerp
        const fromLat = deg2rad(from["lat"]);
        const fromLng = deg2rad(from["lng"]);
        const toLat = deg2rad(to["lat"]);
        const toLng = deg2rad(to["lng"]);
        const cosFromLat = cos(fromLat);
        const cosToLat = cos(toLat);
        // Computes Spherical interpolation coefficients.
        const angle = SphericalUtil.computeAngleBetween(from, to);
        const sinAngle = sin(angle);
        if (sinAngle < 1e-6) {
            return from;
        }
        const a = sin((1 - fraction) * angle) / sinAngle;
        const b = sin(fraction * angle) / sinAngle;
        // Converts from polar to vector and interpolate.
        const x = a * cosFromLat * cos(fromLng) + b * cosToLat * cos(toLng);
        const y = a * cosFromLat * sin(fromLng) + b * cosToLat * sin(toLng);
        const z = a * sin(fromLat) + b * sin(toLat);
        // Converts interpolated vector back to polar.
        const lat = atan2(z, sqrt(x * x + y * y));
        const lng = atan2(y, x);
        return { lat: rad2deg(lat), lng: rad2deg(lng) };
    }
    /**
     * Returns distance on the unit sphere; the arguments are in radians.
     */
    static distanceRadians(lat1, lng1, lat2, lng2) {
        return MathUtil_1.default.arcHav(MathUtil_1.default.havDistance(lat1, lat2, lng1 - lng2));
    }
    /**
     * Returns the angle between two LatLngs, in radians. This is the same as the distance
     * on the unit sphere.
     */
    static computeAngleBetween(from, to) {
        return SphericalUtil.distanceRadians(deg2rad(from["lat"]), deg2rad(from["lng"]), deg2rad(to["lat"]), deg2rad(to["lng"]));
    }
    /**
     * Returns the distance between two LatLngs, in meters.
     */
    static computeDistanceBetween(from, to) {
        return SphericalUtil.computeAngleBetween(from, to) * MathUtil_1.default.EARTH_RADIUS;
    }
    /**
     * Returns the length of the given path, in meters, on Earth.
     */
    static computeLength(path) {
        if (path.length < 2) {
            return 0;
        }
        let length = 0;
        const prev = path[0];
        let prevLat = deg2rad(prev["lat"]);
        let prevLng = deg2rad(prev["lng"]);
        path.forEach(point => {
            const lat = deg2rad(point["lat"]);
            const lng = deg2rad(point["lng"]);
            length += SphericalUtil.distanceRadians(prevLat, prevLng, lat, lng);
            prevLat = lat;
            prevLng = lng;
        });
        return length * MathUtil_1.default.EARTH_RADIUS;
    }
    /**
     * Returns the area of a closed path on Earth.
     * @param path A closed path.
     * @return The path's area in square meters.
     */
    static computeArea(path) {
        return abs(SphericalUtil.computeSignedArea(path));
    }
    /**
     * Returns the signed area of a closed path on Earth. The sign of the area may be used to
     * determine the orientation of the path.
     * "inside" is the surface that does not contain the South Pole.
     * @param path A closed path.
     * @return The loop's area in square meters.
     */
    static computeSignedArea(path) {
        return SphericalUtil.computeSignedAreaP(path, MathUtil_1.default.EARTH_RADIUS);
    }
    /**
     * Returns the signed area of a closed path on a sphere of given radius.
     * The computed area uses the same units as the radius squared.
     * Used by SphericalUtilTest.
     */
    static computeSignedAreaP(path, radius) {
        const size = path.length;
        if (size < 3) {
            return 0;
        }
        let total = 0;
        const prev = path[size - 1];
        let prevTanLat = tan((Math.PI / 2 - deg2rad(prev["lat"])) / 2);
        let prevLng = deg2rad(prev["lng"]);
        // For each edge, accumulate the signed area of the triangle formed by the North Pole
        // and that edge ("polar triangle").
        path.forEach(point => {
            const tanLat = tan((Math.PI / 2 - deg2rad(point["lat"])) / 2);
            const lng = deg2rad(point["lng"]);
            total += SphericalUtil.polarTriangleArea(tanLat, lng, prevTanLat, prevLng);
            prevTanLat = tanLat;
            prevLng = lng;
        });
        return total * (radius * radius);
    }
    /**
     * Returns the signed area of a triangle which has North Pole as a vertex.
     * Formula derived from "Area of a spherical triangle given two edges and the included angle"
     * as per "Spherical Trigonometry" by Todhunter, page 71, section 103, point 2.
     * See http://books.google.com/books?id=3uBHAAAAIAAJ&pg=PA71
     * The arguments named "tan" are tan((pi/2 - latitude)/2).
     */
    static polarTriangleArea(tan1, lng1, tan2, lng2) {
        const deltaLng = lng1 - lng2;
        const t = tan1 * tan2;
        return 2 * atan2(t * sin(deltaLng), 1 + t * cos(deltaLng));
    }
}
exports.default = SphericalUtil;
