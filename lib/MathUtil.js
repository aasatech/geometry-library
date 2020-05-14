/*
 * Copyright 2013 Google Inc.
 * https://github.com/googlemaps/android-maps-utils/blob/master/library/src/com/google/maps/android/MathUtil.java
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
var log = Math.log, tan = Math.tan, atan = Math.atan, exp = Math.exp, sin = Math.sin, asin = Math.asin, sqrt = Math.sqrt, cos = Math.cos, PI = Math.PI;
var MathUtil = /** @class */ (function () {
    function MathUtil() {
    }
    Object.defineProperty(MathUtil, "EARTH_RADIUS", {
        /**
         * The earth's radius, in meters.
         * Mean radius as defined by IUGG.
         */
        get: function () {
            return 6371009;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Restrict x to the range [low, high].
     */
    MathUtil.clamp = function (x, low, high) {
        return x < low ? low : x > high ? high : x;
    };
    /**
     * Wraps the given value into the inclusive-exclusive interval between min and max.
     * @param n   The value to wrap.
     * @param min The minimum.
     * @param max The maximum.
     */
    MathUtil.wrap = function (n, min, max) {
        return n >= min && n < max ? n : MathUtil.mod(n - min, max - min) + min;
    };
    /**
     * Returns the non-negative remainder of x / m.
     * @param x The operand.
     * @param m The modulus.
     */
    MathUtil.mod = function (x, m) {
        return ((x % m) + m) % m;
    };
    /**
     * Returns mercator Y corresponding to latitude.
     * See http://en.wikipedia.org/wiki/Mercator_projection .
     */
    MathUtil.mercator = function (lat) {
        return log(tan(lat * 0.5 + PI / 4));
    };
    /**
     * Returns latitude from mercator Y.
     */
    MathUtil.inverseMercator = function (y) {
        return 2 * atan(exp(y)) - PI / 2;
    };
    /**
     * Returns haversine(angle-in-radians).
     * hav(x) == (1 - cos(x)) / 2 == sin(x / 2)^2.
     */
    MathUtil.hav = function (x) {
        var sinHalf = sin(x * 0.5);
        return sinHalf * sinHalf;
    };
    /**
     * Computes inverse haversine. Has good numerical stability around 0.
     * arcHav(x) == acos(1 - 2 * x) == 2 * asin(sqrt(x)).
     * The argument must be in [0, 1], and the result is positive.
     */
    MathUtil.arcHav = function (x) {
        return 2 * asin(sqrt(x));
    };
    // Given h==hav(x), returns sin(abs(x)).
    MathUtil.sinFromHav = function (h) {
        return 2 * sqrt(h * (1 - h));
    };
    // Returns hav(asin(x)).
    MathUtil.havFromSin = function (x) {
        var x2 = x * x;
        return (x2 / (1 + sqrt(1 - x2))) * 0.5;
    };
    // Returns sin(arcHav(x) + arcHav(y)).
    MathUtil.sinSumFromHav = function (x, y) {
        var a = sqrt(x * (1 - x));
        var b = sqrt(y * (1 - y));
        return 2 * (a + b - 2 * (a * y + b * x));
    };
    /**
     * Returns hav() of distance from (lat1, lng1) to (lat2, lng2) on the unit sphere.
     */
    MathUtil.havDistance = function (lat1, lat2, dLng) {
        return (MathUtil.hav(lat1 - lat2) + MathUtil.hav(dLng) * cos(lat1) * cos(lat2));
    };
    return MathUtil;
}());
export default MathUtil;
