/*global angular, RSAKey */
(function () {
  'use strict';
  var ngPhotonDec = [
    '$q',
    '$http',
    function ($q, $http) {
      var ngPhoton = {},
        baseURL = "http://192.168.0.1/",
        networkList = [],
        public_key = '',
        deviceId = '',
        POSToptions = {withCredentials: false, headers: {'Content-Type': 'multipart/form-data', 'Accept': '*/*'}}, /// required to make the Photon behave
        rsa = new RSAKey(); /// requires rsa.min.js

      ngPhoton.deviceInfo = function () {
        var d = $q.defer();
        ngPhoton.publicKey()
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
        $http.get(baseURL + 'public-key')
          .then(function (resp) {
            if (!resp.data || !resp.data.b) {
              return d.reject(resp);
            }
            public_key = resp.data.b;
            // Pull N and E out of device key and use to set public key
            rsa.setPublic(public_key.substring(58, 58 + 256), public_key.substring(318, 318 + 6));
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
            networkList = resp.data.scans;
            angular.forEach(networkList, function (ap) {
              ap.signalStrength = Math.min(Math.max(2 * (ap.rssi + 100), 0), 100);
            });
            networkList.sort(function (a, b) {
              if (a.signalStrength > b.signalStrength) {
                return -1;
              }
              return 1;
            });
            return d.resolve(networkList);
          }, function (err) {
            return d.reject(err);
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
          ch: obj.accessPoint.ch,
          sec: obj.accessPoint.sec,
          idx: 0,
          pwd: rsa.encrypt(obj.password)
        };
        $http.post(baseURL + 'configure-ap', config, POSToptions)
          .then(function (resp) {
            console.log(resp);
            return d.resolve(config);
          }, function (err) {
            return d.reject(err);
          });
        return d.promise;
      };

      ngPhoton.connect = function (obj) {
        var d = $q.defer();
        return ngPhoton.configure(obj)
          .then(function (resp) { ///data) {
            console.log(resp);
            $http.post(baseURL + 'connect-ap', {}, POSToptions)
              .then(function (resp) {
                return d.resolve(resp);
              }, function (err) {
                return d.reject(err);
              });
            return d.promise;
          }, function (err) {
            d.reject(err);
          });
      };

      return ngPhoton;
    }];
  angular.module('ngPhoton', [])
    .service('ngPhoton', ngPhotonDec);
}());
