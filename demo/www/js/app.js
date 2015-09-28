/*global cordova, StatusBar */
// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'ngPhoton'])

  .run(['$ionicPlatform', '$rootScope', '$ionicPopup', '$ionicLoading', 'ngPhoton',
    function ($ionicPlatform, $rootScope, $ionicPopup, $ionicLoading, ngPhoton) {
      $ionicPlatform.ready(function () {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
          cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
          StatusBar.styleDefault();
        }
        $rootScope.info = function () {
          $ionicLoading.show();
          ngPhoton.deviceInfo()
            .then(function (data) {
              console.log(data);
              $rootScope.gotInfo = true;
              $ionicLoading.hide();
            }, function (error) {
              console.log(error);
              $ionicLoading.hide();
            });
        };
        $rootScope.selectAP = function (ap) {
          $rootScope.data = {wifi: ''};
          if (ap.sec) {
            $ionicPopup.show({
              template: '<input type="text" ng-model="data.wifi">',
              title: 'Enter Wi-Fi Password',
              scope: $rootScope,
              buttons: [
                { text: 'Cancel' },
                {
                  text: '<b>Save</b>',
                  type: 'button-positive',
                  onTap: function (e) {
                    if (!$rootScope.data.wifi) {
                      //don't allow the user to close unless he enters wifi password
                      e.preventDefault();
                    } else {
                      $rootScope.selectedAP = ap;
                      return $rootScope.data.wifi;
                    }
                  }
                }
              ]
            });
          } else {
            $rootScope.selectedAP = ap;
          }
        };
        $rootScope.scan = function () {
          $ionicLoading.show();
          $rootScope.accessPoints = [];
          ngPhoton.scan()
            .then(function (data) {
              console.log(data);
              $rootScope.accessPoints = data;
              $ionicLoading.hide();
            }, function (error) {
              console.log(error);
              $ionicLoading.hide();
            });
        };
        $rootScope.connect = function (ap) {
          $ionicLoading.show();
          ngPhoton.connect({accessPoint: ap, password: $rootScope.data.wifi})
            .then(function (data) {
              console.log(data);
              $ionicLoading.hide();
            }, function (error) {
              console.log(error);
              $ionicLoading.hide();
            });
        };
      });
    }]);
