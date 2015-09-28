/*global SoftAPSetup*/
(function () {
  'use strict';
  var ngPhotonDec = ['$q', function ($q) {
    var ngPhoton = {},
      SAP = window.SoftAPSetup ? new SoftAPSetup() : {}; //,
      // accessPoints = [];

    ngPhoton.deviceInfo = function () {
      var d = $q.defer();
      SAP.deviceInfo(function (error, data) {
        if (error || !data.id) {
          return d.reject(error);
        }
        return d.resolve(data);
      });
      return d.promise;
    };

    ngPhoton.publicKey = function () {
      var d = $q.defer();
      SAP.publicKey(function (error, data) {
        if (error) {
          return d.reject(error);
        }
        return d.resolve(data);
      });
      return d.promise;
    };

    ngPhoton.scan = function () {
      var d = $q.defer();
      SAP.scan(function (error, data) {
        if (error || !data.scans) {
          return d.reject(error);
        }
        angular.forEach(data.scans, function (ap) {
          ap.signalStrength = Math.min(Math.max(2 * (ap.rssi + 100), 0), 100);
        });
        // accessPoints = data.scans;
        return d.resolve(data.scans);
      });
      return d.promise;
    };

    ngPhoton.configure = function (obj) { ///obj.accessPoint, obj.password)
      var d = $q.defer(),
        config = {};
      if (!obj || !obj.accessPoint) {
        return d.reject("Invalid access point");
      }
      config = {
        ssid: obj.accessPoint.ssid,
        channel: obj.accessPoint.channel,
        security: SAP.securityLookup(obj.accessPoint.sec),
        password: obj.password
      };
      SAP.configure(config, function (error, data) {
        if (error) {
          return d.reject(error);
        }
        return d.resolve(data);
      });
      return d.promise;
    };

    ngPhoton.connect = function (obj) {
      var d = $q.defer();
      return ngPhoton.publicKey()
        .then(function () {
          return ngPhoton.configure(obj).then(function () { ///data) {
            SAP.connect(function (error, data) {
              if (error) {
                return d.reject(error);
              }
              return d.resolve(data);
            });
            return d.promise;
          }, function (err) {
            d.reject(err);
          });
        }, function (err) {
          d.reject(err);
        });
    };

    return ngPhoton;
  }];
  angular.module('ngPhoton', [])
    .service('ngPhoton', ngPhotonDec);
}());
