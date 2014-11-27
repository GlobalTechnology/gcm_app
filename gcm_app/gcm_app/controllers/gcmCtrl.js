﻿app.controller("gcmCtrl", function ($scope, $http, $timeout,$filter, token, ministry_service, assignment_service, church_service) {
    $scope.is_loaded = false;
    $scope.has_assignment = true;
    var orderBy = $filter('orderBy');
  
    var onGetSession = function (data) {
        console.log(data);
      //  if(data.status==='denied')
      //      window.location = window.location.pathname;

        $scope.user.session_ticket = data.session_ticket;
        $scope.user.person = data.user;
        $scope.assignments = orderBy(data.assignments, 'name', false);
       
        ministry_service.getMinistries($scope.user.session_ticket).then(onGetMinistries, $scope.onError);

        if ($scope.assignments) $scope.loadAssignment($scope.assignments[0]);
        else {
            $('#newAssignment').modal('show');
            $scope.is_loaded = false;
            $scope.has_assignment = false;
        }


       // assignment_service.getAssignments($scope.user.session_ticket).then(onGetAssignments, $scope.onError);
        //   $location.search('ticket', null);
    };

    $scope.onError = function (response, code) {
        console.log(response);
       // if (code == 401)
       //     window.location= window.location.pathname;
        $scope.error = response.reason;
    };

 
    
    var onGetMinistries = function (response) {

        //if (response.length > 0) { $scope.new_assignment_nat_min = response[0].ministry_id };
        $scope.ministries = response;
        console.log('got ministries');

    };
    
    $scope.onGetMinistry = function (response) {
        //check assignment_id has not changed
        console.log(response);
        if(response.ministry_id=== $scope.assignment.ministry_id)
        {
            $scope.assignment.team_members = response.team_members;
            $scope.assignment.churches = response.churches;
        }

    };


    $scope.user = {};
    $scope.periods = [];
    var dt = new Date();

    for (var i = 0; i < 12; i++) {

        $scope.periods.push($filter('date')(new Date(dt), 'yyyy-MM'));

        dt = new Date(dt).setMonth(new Date(dt).getMonth() - 1);

    }
    $scope.current_period = $scope.periods[0];
    $scope.nextPeriod = function () {
        for (var i = 0 ; i < $scope.periods.length; i++) {
            if ($scope.periods[i] === $scope.current_period && i > 0) {
                $scope.current_period = $scope.periods[i - 1];
                break;
            }
        }

    };

    $scope.prevPeriod = function () {
        for (var i = 0 ; i < $scope.periods.length; i++) {
            if ($scope.periods[i] === $scope.current_period && i < $scope.periods.length - 1) {
                $scope.current_period = $scope.periods[i + 1];
                break;
            }
        }

    };
    $scope.$watch('current_mcc', function () {
        if ($scope.assignment) {
            angular.forEach($scope.assignment.mccs, function (name, mcc) {
                if (name === $scope.current_mcc) $scope.assignment.mcc = mcc;

            });
        }
    });
    $scope.loadAssignment = function (assignment) {
       // assignment_service.getAssignment($scope.user.session_ticket, assignment.id)
        $scope.assignment = assignment;
        $scope.has_assignment = true;
        $scope.assignment.mccs = {};
        if (assignment.has_slm) $scope.assignment.mccs.slm = 'Student Led';
        if (assignment.has_gcm) $scope.assignment.mccs.gcm='Global Church Movements';
        if (assignment.has_llm) $scope.assignment.mccs.llm='Leader Led';
        if (assignment.has_ds) $scope.assignment.mccs.ds = 'Digital Strategies';

        if (Object.keys($scope.assignment.mccs).length>1) $scope.assignment.mccs.all = 'All';
        $scope.current_mcc = $scope.assignment.mccs[Object.keys($scope.assignment.mccs)[0]];

        //refresh to get extra info
        //if (assignment.team_role === 'leader' || assignment.team_role === 'inherited_leader')
            ministry_service.getMinistry($scope.user.session_ticket, assignment.ministry_id).then($scope.onGetMinistry, $scope.onError);
      


        //
        console.log('changed assignment to ' + assignment.name);    
       // $scope.map.center = JSON.parse(JSON.stringify(assignment.location));
       // $scope.map.zoom = parseInt(assignment.location_zoom);


    };
    
    token.getSession()
            .then(onGetSession, $scope.onError);

   

    $scope.church_lines = [];
    $scope.churches = [];
    $scope.onAddTeamMember = function (response) {
        ministry_service.getMinistry($scope.user.session_ticket, $scope.assignment.ministry_id).then($scope.onGetMinistry, $scope.onError);

        console.log('saved');

    };
    $scope.newAssignment = function () {
        $scope.new_assignment.username = $scope.user.person.cas_username;
        angular.forEach($scope.ministries, function (m) {
            if (m.name === $scope.new_assignment.min_name)
            {
                $scope.new_assignment.ministry_id = m.ministry_id;

            }
        });
        if ((typeof $scope.new_assignment.ministry_id) !== 'undefined') {
            $scope.new_assignment.team_role = "self_assigned";
            assignment_service.addTeamMember($scope.user.session_ticket, $scope.new_assignment).then($scope.onAddTeamMember, $scope.onError);


        }


      
    };

    

    
});

