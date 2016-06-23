//@ngInject
var _ = require('underscore');
module.exports = ['$scope', '$window','socket', function($scope, $window, socket) {

  var cards = [0, 0.5, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 34, 55, 89, 144];
  $scope.cardoptions = cards;
  $scope.fibonacci = '0, 0.5, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144';
  $scope.cardchoices = [];
  $scope.currentUsers = [];
  $scope.params = {
    toggleStart: true,
    scaleChoice: false,
    leader: false,
    leaderChosen: false,
    cardAvg: 0.0,
    sliderKey: 0,
    currentTask: 'None',
    scaleSelection: 'default',
    currentLeader: ''
  };
  $scope.plays = {
    link: 'http://peteplays.com/',
    logoSrc: 'images/playslogo.png',
    logoAlt: 'PetePlays'
  };

  var screenWidth = function (sw) {
    if ( sw > 992 ){
      return 'max';
    } else if ( sw <= 993 && sw > 768 ) {
      return 'lg';
    } else if ( sw <= 768 && sw > 573 ) {
      return 'md';
    } else if ( sw <= 573 && sw > 352 ) {
      return 'sm';
    } else if ( sw <= 352 ) {
      return 'min';
    }
  }

  var showScale = function (sw) {
    if ( ( $scope.params.scaleSelection != 'fibonacci' && sw == 'max' ) ||
         ( $scope.params.scaleSelection == 'fibonacci' && (sw == 'max' || sw == 'lg' || sw == 'md') ) ) {
      $scope.scaleOption = {
        tile: true,
        slider: false,
        input: false
      }
    } else if ( ( $scope.params.scaleSelection != 'fibonacci' && sw != 'max' ) ||
                ( $scope.params.scaleSelection == 'fibonacci' && (sw == 'sm' || sw == 'min') ) ) {
      $scope.params.sliderKey = 0;
      $scope.scaleOption = {
        tile: false,
        slider: true,
        input: true
      }
    }
  }

  var setWindowWidth = function () {
    showScale(screenWidth(document.body.offsetWidth));
  }

  //-- incoming
  socket.on('onCardCreated', function (data) {
    $scope.cardchoices.push(data);
  });

  socket.on('onCardsDeleted', function () {
    $scope.cardchoices = [];
    $scope.params.cardAvg = 0.0;
    $scope.showMessage = false;
  });

  socket.on('onToggle', function (val) {
    $scope.params.toggleStart = val;

    if (!val) {
      $scope.params.cardAvg = $scope.calcAvg();
    }
  });

  socket.on('onTaskChanged', function (val) {
    $scope.params.currentTask = val;
  });

  socket.on('onCardsChanged', function (data) {
    $scope.cardoptions = $scope.parseCards(data);
  });

  socket.on('onLeaderSet', function (data) {
    $scope.params.leaderChosen = true;
    $scope.params.currentLeader = data;
  });

  socket.on('onLeaderReset', function () {
    $scope.params.leaderChosen = false;
    $scope.params.currentLeader = null;
  });

  socket.on('onUserAdded', function (data) {
    if (!_.contains($scope.currentUsers, data)) {
      $scope.currentUsers.push(data);
    }
  });

  //-- outgoing
  $scope.createCard = function (data) {
    $scope.cardchoices.push(data);
    $scope.showMessage = true;
    socket.emit('createCard', data);
  };

  $scope.createCardOnlyVote = function (data, val) {
    _.extend(data, { card: val });
    $scope.createCard(data);
  };

  $scope.deleteCards = function () {
    $scope.cardchoices = [];
    $scope.params.cardAvg = 0.0;
    $scope.showMessage = false;
    socket.emit('deleteCards');
  };

  $scope.toggle = function (val) {
    $scope.params.toggleStart = val;

    if (!val) {
      $scope.params.cardAvg = $scope.calcAvg();
    }

    socket.emit('onToggle', val);
  };

  $scope.changeTask = function (data) {
    $scope.params.currentTask = data;
    socket.emit('onTaskChanged', data);
  };

  $scope.changeCards = function (data) {
    $scope.cardoptions = $scope.parseCards(data);
    socket.emit('onCardsChanged', data);
  };

  $scope.setLeader = function (data) {
    $scope.params.leader = true;
    $scope.params.leaderChosen = true;
    socket.emit('setLeader', data);
  };

  $scope.resetLeader = function () {
    $scope.params.leader = false;
    $scope.params.leaderChosen = false;
    socket.emit('resetLeader');
  };

  $scope.addUser = function (data) {
    if (!_.contains($scope.currentUsers, data)) {
      $scope.currentUsers.push(data);
    }
    socket.emit('addUser', data);
  };

  $scope.calcAvg = function (data) {
    var count = 0,
        total = 0;

    _.each($scope.cardchoices, function(choice) {
      if (_.isNumber(choice.card)) {
        count += 1;
        total += choice.card;
      }
    });

    return (total / count);
  };

  $scope.parseCards = function (data) {
    var cardarray = [],
        re = /\s*,\s*/;

    if (!_.isUndefined(data) && _.isString(data)) {
      values = data.toLowerCase().split(re);
      _.each(values, function (val) {
        if (parseInt(val)) {
          cardarray.push(parseInt(val));
        } else {
          cardarray.push(val);
        }
      });
      $scope.scaleMessage = 'Scale Changed Successfully';
      return cardarray;
    } else if (!_.isUndefined(data) && data === cards) {
      $scope.scaleMessage = 'Using Default Scale';
      return cards;
    } else {
      $scope.scaleMessage = 'Invalid Entry';
      return cards;
    }
  };

  $scope.showCustomScaleInput = function (val) {
    $scope.params.scaleChoice = val;
    setWindowWidth();
  };

  $scope.inputClickScale = function (action) {
    if( action == 'add' ) { $scope.params.sliderKey++; } else { $scope.params.sliderKey--; }
  };

  $window.onresize = function () { setWindowWidth(); $scope.$apply(); };

  setWindowWidth();

}];