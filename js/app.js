var app = angular.module('myApp', []);

app.constant('URL', 'data/');

app.factory('DataService', function ($http, URL) {
    var getData = function () {
        return $http.get(URL + 'content.json');
    };

    return {
        getData: getData
    };
});

app.factory('TemplateService', function ($http, URL) {
    /*get data*/
    var getDataTemplate = function (sLinkGetData) {
        return $http.get(sLinkGetData);
    };
    return {
        getDataTemplate: getDataTemplate
    };
});

app.controller('ContentCtrl', function ($scope, DataService, $window, $timeout, $rootScope) {
    // var ctrl = this;
    window.scope = $scope;
    $scope.content = [];

    $scope.fetchContent = function () {
        DataService.getData().then(function (result) {
            $scope.content = result.data;
        });
    };
    $scope.fetchContent();
    
    var increamented = 0;
    $rootScope.limit = 1;
    $rootScope.is_busy = false;
    $rootScope.stoped = false;

    $scope.loadMore = function() {
        $timeout(function() {
            // Nếu đang gửi request thì ngưng
            if ($rootScope.is_busy == true){
                return false;
            }
             
            // Nếu hết dữ liệu thì ngưng
            if ($rootScope.stopped == true){
                return false;
            }
             
            // Thiết lập đang gửi request
            $rootScope.is_busy = true;

            increamented = $rootScope.limit + 1;
            $rootScope.limit = increamented > $scope.content.length ? $scope.content.length : increamented;
        }, 0);
    };

    angular.element($window).bind("scroll", function () {
        if($(window).scrollTop() + $(window).height() >= angular.element('#container').height()) {
            $scope.loadMore();
        }
    });
});

app.directive('contentItem', function ($compile, $http, TemplateService, $templateCache, $rootScope) {
    var linker = function (scope, element, attrs) {

        function getSrcTemplate(sNameTemplate) {
            var srcTemplate = "",
                subPath = "/data/templates/";
            srcTemplate = subPath + sNameTemplate;
            return srcTemplate;
        }
        /*call factory get data*/
        TemplateService.getDataTemplate(scope.section.link_api).then(function (result) {
            scope.dataTemplate = result.data;
            var link_template = getSrcTemplate(scope.section.link_template);
            
            $http.get(link_template).success(function(response) {
                $rootScope.is_busy = false;
                if($rootScope.limit >= scope.lengthSection){
                    $rootScope.stopped == true
                }
                element.html(response);
                $compile(element.contents())(scope);
            });
        });
    };

    return {
        restrict: 'A',
        link: linker,
        scope: {
            section: '=section',
            lengthSection: '=lengthSection'
        }
    };
});