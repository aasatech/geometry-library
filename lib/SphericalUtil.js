"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.deg2rad = deg2rad;
exports.rad2deg = rad2deg;
exports["default"] = void 0;

var _MathUtil = _interopRequireDefault(require("./MathUtil"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var log = Math.log,
    atan = Math.atan,
    atan2 = Math.atan2,
    cos = Math.cos,
    sin = Math.sin,
    asin = Math.asin,
    sqrt = Math.sqrt,
    abs = Math.abs;

function deg2rad(degrees) {
  return degrees * (Math.PI / 180);
}

function rad2deg(radians) {
  return radians * (180 / Math.PI);
}

var SphericalUtil =
/*#__PURE__*/
function () {
  function SphericalUtil() {
    _classCallCheck(this, SphericalUtil);
  }

  _createClass(SphericalUtil, null, [{
    key: "computeHeading",

    /**
     * Returns the heading from one LatLng to another LatLng. Headings are
     * expressed in degrees clockwise from North within the range [-180,180).
     * @return The heading in degrees clockwise from north.
     */
    value: function computeHeading(from, to) {
      // http://williams.best.vwh.net/avform.htm#Crs
      var fromLat = deg2rad(from["lat"]);
      var fromLng = deg2rad(from["lng"]);
      var toLat = deg2rad(to["lat"]);
      var toLng = deg2rad(to["lng"]);
      var dLng = toLng - fromLng;
      var heading = atan2(sin(dLng) * cos(toLat), cos(fromLat) * sin(toLat) - sin(fromLat) * cos(toLat) * cos(dLng));
      return _MathUtil["default"].wrap(rad2deg(heading), -180, 180);
    }
    /**
     * Returns the LatLng resulting from moving a distance from an origin
     * in the specified heading (expressed in degrees clockwise from north).
     * @param from     The LatLng from which to start.
     * @param distance The distance to travel.
     * @param heading  The heading in degrees clockwise from north.
     */

  }, {
    key: "computeOffset",
    value: function computeOffset(from, distance, heading) {
      distance /= _MathUtil["default"].EARTH_RADIUS;
      heading = deg2rad(heading); // http://williams.best.vwh.net/avform.htm#LL

      var fromLat = deg2rad(from["lat"]);
      var fromLng = deg2rad(from["lng"]);
      var cosDistance = cos(distance);
      var sinDistance = sin(distance);
      var sinFromLat = sin(fromLat);
      var cosFromLat = cos(fromLat);
      var sinLat = cosDistance * sinFromLat + sinDistance * cosFromLat * cos(heading);
      var dLng = atan2(sinDistance * cosFromLat * sin(heading), cosDistance - sinFromLat * sinLat);
      return {
        lat: rad2deg(asin(sinLat)),
        lng: rad2deg(fromLng + dLng)
      };
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

  }, {
    key: "computeOffsetOrigin",
    value: function computeOffsetOrigin(to, distance, heading) {
      heading = deg2rad(heading);
      distance /= _MathUtil["default"].EARTH_RADIUS; // http://lists.maptools.org/pipermail/proj/2008-October/003939.html

      var n1 = cos(distance);
      var n2 = sin(distance) * cos(heading);
      var n3 = sin(distance) * sin(heading);
      var n4 = sin(rad2deg(to["lat"])); // There are two solutions for b. b = n2 * n4 +/- sqrt(), one solution results
      // in the latitude outside the [-90, 90] range. We first try one solution and
      // back off to the other if we are outside that range.

      var n12 = n1 * n1;
      var discriminant = n2 * n2 * n12 + n12 * n12 - n12 * n4 * n4;

      if (discriminant < 0) {
        // No real solution which would make sense in LatLng-space.
        return null;
      }

      var b = n2 * n4 + sqrt(discriminant);
      b /= n1 * n1 + n2 * n2;
      var a = (n4 - n2 * b) / n1;
      var fromLatRadians = atan2(a, b);

      if (fromLatRadians < -Math.PI / 2 || fromLatRadians > Math.PI / 2) {
        b = n2 * n4 - sqrt(discriminant);
        b /= n1 * n1 + n2 * n2;
        fromLatRadians = atan2(a, b);
      }

      if (fromLatRadians < -Math.PI / 2 || fromLatRadians > Math.PI / 2) {
        // No solution which would make sense in LatLng-space.
        return null;
      }

      var fromLngRadians = rad2deg(to["lng"]) - atan2(n3, n1 * cos(fromLatRadians) - n2 * sin(fromLatRadians));
      return {
        lat: rad2deg(fromLatRadians),
        lng: rad2deg(fromLngRadians)
      };
    }
    /**
     * Returns the LatLng which lies the given fraction of the way between the
     * origin LatLng and the destination LatLng.
     * @param from     The LatLng from which to start.
     * @param to       The LatLng toward which to travel.
     * @param fraction A fraction of the distance to travel.
     * @return The interpolated LatLng.
     */

  }, {
    key: "interpolate",
    value: function interpolate(from, to, fraction) {
      // http://en.wikipedia.org/wiki/Slerp
      var fromLat = deg2rad(from["lat"]);
      var fromLng = deg2rad(from["lng"]);
      var toLat = deg2rad(to["lat"]);
      var toLng = deg2rad(to["lng"]);
      var cosFromLat = cos(fromLat);
      var cosToLat = cos(toLat); // Computes Spherical interpolation coefficients.

      var angle = SphericalUtil.computeAngleBetween(from, to);
      var sinAngle = sin(angle);

      if (sinAngle < 1e-6) {
        return from;
      }

      var a = sin((1 - fraction) * angle) / sinAngle;
      var b = sin(fraction * angle) / sinAngle; // Converts from polar to vector and interpolate.

      var x = a * cosFromLat * cos(fromLng) + b * cosToLat * cos(toLng);
      var y = a * cosFromLat * sin(fromLng) + b * cosToLat * sin(toLng);
      var z = a * sin(fromLat) + b * sin(toLat); // Converts interpolated vector back to polar.

      var lat = atan2(z, sqrt(x * x + y * y));
      var lng = atan2(y, x);
      return {
        lat: rad2deg(lat),
        lng: rad2deg(lng)
      };
    }
    /**
     * Returns distance on the unit sphere; the arguments are in radians.
     */

  }, {
    key: "distanceRadians",
    value: function distanceRadians(lat1, lng1, lat2, lng2) {
      return _MathUtil["default"].arcHav(_MathUtil["default"].havDistance(lat1, lat2, lng1 - lng2));
    }
    /**
     * Returns the angle between two LatLngs, in radians. This is the same as the distance
     * on the unit sphere.
     */

  }, {
    key: "computeAngleBetween",
    value: function computeAngleBetween(from, to) {
      return SphericalUtil.distanceRadians(deg2rad(from["lat"]), deg2rad(from["lng"]), deg2rad(to["lat"]), deg2rad(to["lng"]));
    }
    /**
     * Returns the distance between two LatLngs, in meters.
     */

  }, {
    key: "computeDistanceBetween",
    value: function computeDistanceBetween(from, to) {
      return SphericalUtil.computeAngleBetween(from, to) * _MathUtil["default"].EARTH_RADIUS;
    }
    /**
     * Returns the length of the given path, in meters, on Earth.
     */

  }, {
    key: "computeLength",
    value: function computeLength(path) {
      if (path.length < 2) {
        return 0;
      }

      var length = 0;
      var prev = path[0];
      var prevLat = deg2rad(prev["lat"]);
      var prevLng = deg2rad(prev["lng"]);
      path.forEach(function (point) {
        var lat = deg2rad(point["lat"]);
        var lng = deg2rad(point["lng"]);
        length += SphericalUtil.distanceRadians(prevLat, prevLng, lat, lng);
        prevLat = lat;
        prevLng = lng;
      });
      return length * _MathUtil["default"].EARTH_RADIUS;
    }
    /**
     * Returns the area of a closed path on Earth.
     * @param path A closed path.
     * @return The path's area in square meters.
     */

  }, {
    key: "computeArea",
    value: function computeArea(path) {
      return abs(SphericalUtil.computeSignedArea(path));
    }
    /**
     * Returns the signed area of a closed path on Earth. The sign of the area may be used to
     * determine the orientation of the path.
     * "inside" is the surface that does not contain the South Pole.
     * @param path A closed path.
     * @return The loop's area in square meters.
     */

  }, {
    key: "computeSignedArea",
    value: function computeSignedArea(path) {
      return SphericalUtil.computeSignedAreaP(path, _MathUtil["default"].EARTH_RADIUS);
    }
    /**
     * Returns the signed area of a closed path on a sphere of given radius.
     * The computed area uses the same units as the radius squared.
     * Used by SphericalUtilTest.
     */

  }, {
    key: "computeSignedAreaP",
    value: function computeSignedAreaP(path, radius) {
      var size = path.length;

      if (size < 3) {
        return 0;
      }

      var total = 0;
      var prev = path[size - 1];
      var prevTanLat = tan((Math.PI / 2 - deg2rad(prev["lat"])) / 2);
      var prevLng = deg2rad(prev["lng"]); // For each edge, accumulate the signed area of the triangle formed by the North Pole
      // and that edge ("polar triangle").

      path.forEach(function (point) {
        var tanLat = tan((Math.PI / 2 - deg2rad(point["lat"])) / 2);
        var lng = deg2rad(point["lng"]);
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

  }, {
    key: "polarTriangleArea",
    value: function polarTriangleArea(tan1, lng1, tan2, lng2) {
      var deltaLng = lng1 - lng2;
      var t = tan1 * tan2;
      return 2 * atan2(t * sin(deltaLng), 1 + t * cos(deltaLng));
    }
  }]);

  return SphericalUtil;
}();

var _default = SphericalUtil;
exports["default"] = _default;