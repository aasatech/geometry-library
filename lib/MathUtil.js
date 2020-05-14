"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

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
var log = Math.log,
    tan = Math.tan,
    atan = Math.atan,
    exp = Math.exp,
    sin = Math.sin,
    asin = Math.asin,
    sqrt = Math.sqrt,
    cos = Math.cos;

var MathUtil =
/*#__PURE__*/
function () {
  function MathUtil() {
    _classCallCheck(this, MathUtil);
  }

  _createClass(MathUtil, null, [{
    key: "clamp",

    /**
     * Restrict x to the range [low, high].
     */
    value: function clamp(x, low, high) {
      return x < low ? low : x > high ? high : x;
    }
    /**
     * Wraps the given value into the inclusive-exclusive interval between min and max.
     * @param n   The value to wrap.
     * @param min The minimum.
     * @param max The maximum.
     */

  }, {
    key: "wrap",
    value: function wrap(n, min, max) {
      return n >= min && n < max ? n : MathUtil.mod(n - min, max - min) + min;
    }
    /**
     * Returns the non-negative remainder of x / m.
     * @param x The operand.
     * @param m The modulus.
     */

  }, {
    key: "mod",
    value: function mod(x, m) {
      return (x % m + m) % m;
    }
    /**
     * Returns mercator Y corresponding to latitude.
     * See http://en.wikipedia.org/wiki/Mercator_projection .
     */

  }, {
    key: "mercator",
    value: function mercator(lat) {
      return log(tan(lat * 0.5 + Math.PI / 4));
    }
    /**
     * Returns latitude from mercator Y.
     */

  }, {
    key: "inverseMercator",
    value: function inverseMercator(y) {
      return 2 * atan(exp(y)) - Math.PI / 2;
    }
    /**
     * Returns haversine(angle-in-radians).
     * hav(x) == (1 - cos(x)) / 2 == sin(x / 2)^2.
     */

  }, {
    key: "hav",
    value: function hav(x) {
      var sinHalf = sin(x * 0.5);
      return sinHalf * sinHalf;
    }
    /**
     * Computes inverse haversine. Has good numerical stability around 0.
     * arcHav(x) == acos(1 - 2 * x) == 2 * asin(sqrt(x)).
     * The argument must be in [0, 1], and the result is positive.
     */

  }, {
    key: "arcHav",
    value: function arcHav(x) {
      return 2 * asin(sqrt(x));
    } // Given h==hav(x), returns sin(abs(x)).

  }, {
    key: "sinFromHav",
    value: function sinFromHav(h) {
      return 2 * sqrt(h * (1 - h));
    } // Returns hav(asin(x)).

  }, {
    key: "havFromSin",
    value: function havFromSin(x) {
      var x2 = x * x;
      return x2 / (1 + sqrt(1 - x2)) * 0.5;
    } // Returns sin(arcHav(x) + arcHav(y)).

  }, {
    key: "sinSumFromHav",
    value: function sinSumFromHav(x, y) {
      var a = sqrt(x * (1 - x));
      var b = sqrt(y * (1 - y));
      return 2 * (a + b - 2 * (a * y + b * x));
    }
    /**
     * Returns hav() of distance from (lat1, lng1) to (lat2, lng2) on the unit sphere.
     */

  }, {
    key: "havDistance",
    value: function havDistance(lat1, lat2, dLng) {
      return MathUtil.hav(lat1 - lat2) + MathUtil.hav(dLng) * cos(lat1) * cos(lat2);
    }
  }, {
    key: "EARTH_RADIUS",

    /**
     * The earth's radius, in meters.
     * Mean radius as defined by IUGG.
     */
    get: function get() {
      return 6371009;
    }
  }]);

  return MathUtil;
}();

var _default = MathUtil;
exports["default"] = _default;