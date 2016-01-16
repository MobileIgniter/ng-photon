(function () {
  'use strict';
  var ngPhotonDec = [
    '$q',
    '$http',
    function ($q, $http) {
      var ngPhoton = {},
        baseURL = "http://192.168.0.1/",
        networkList, public_key, deviceId,
        rsa = new RSAKey(); /// requires rsa.min.js

      ngPhoton.deviceInfo = function () {
        var d = $q.defer();
        return ngPhoton.publicKey()
          .then(function () {
            $http.get(baseURL + 'device-id')
              .then(function (resp) {
                if (!resp.data || !resp.data.id) {
                  return d.reject(resp);
                }
                deviceId = resp.data.id;
                return d.resolve(deviceId);
              }, function (err) {
                return d.reject(err);
              });
          }, function (err) {
            return d.reject(err);
          });
        return d.promise;
      };

      ngPhoton.publicKey = function () {
        var d = $q.defer();
        // SAP.publicKey(function (error, data) {
        return $http.get(baseURL + 'public-key')
          .then(function (resp) {
            if (!resp.data || !resp.data.b) {
              return d.reject(resp);
            }
            public_key = resp.data.b;
            // Pull N and E out of device key and use to set public key
            rsa.setPublic(public_key.substring(58,58+256), public_key.substring(318,318+6));
            return d.resolve(resp);
          }, function (err) {
            return d.reject(err);
          });
        return d.promise;
      };

      ngPhoton.scan = function () {
        var d = $q.defer();
        $http.get(baseURL + 'scan-ap')
          .then(function (resp) {
            if (!resp.data || !resp.data.scans) {
              return d.reject(resp);
            }
            networkList = resp.data.scans
            angular.forEach(networkList, function (ap) {
              ap.signalStrength = Math.min(Math.max(2 * (ap.rssi + 100), 0), 100);
            });
            networkList.sort(function (a, b) {
              if (a.signalStrength > b.signalStrength) {
                return -1;
              } else {
                return 1;
              }
            });
            return d.resolve(networkList);
          }, function (err) {
            return d.reject(err);
          });
        return d.promise;
        // SAP.scan(function (error, data) {
        //   if (error || !data.scans) {
        //     return d.reject(error);
        //   }
        //   angular.forEach(data.scans, function (ap) {
        //     ap.signalStrength = Math.min(Math.max(2 * (ap.rssi + 100), 0), 100);
        //   });
        //   // accessPoints = data.scans;
        //   return d.resolve(data.scans);
        // });
        // return d.promise;
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
