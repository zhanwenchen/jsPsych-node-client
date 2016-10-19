jsPsych.plugins['waiting-room'] = (function(){

  var plugin = {};

  plugin.trial = function(display_element, trial){

    trial.title = typeof trial.title == 'undefined' ? 'Welcome' : trial.title;
    trial.text = typeof trial.text == 'undefined' ? 'The experiment will begin as soon as enough people have joined.' : trial.text;

    var session_id;
    var player_id;

    // add the waiting room box to the page.
    var html = "<div class='mdl-card mdl-shadow--2dp'>"+
      "<div class='mdl-card__title'>"+
      "<h2 class='mdl-card__title-text'>"+trial.title+"</h2>"+
      "</div>"+
      "<div class='mdl-card__supporting-text'>"+trial.text+"</div>"+
      "<div class='mdl-card__supporting-text' id='room-updates'></div>"+
      "<div class='mdl-card__actions mdl-card--border'>"+
      "<div class='mdl-progress mdl-js-progress mdl-progress__indeterminate'></div>"+
      "</div>"+
      "</div>";
    display_element.html(html);

    // subscribe to the server for updates about the game room
    jsPsych.node.socket.on('room-update', function(message){
      // TODO: Display information, via html
      console.log(new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') + ' client heard room-update');
      var n = message.participants;
      var new_div = document.createElement('div');
      new_div.className = 'mdl-card__supporting-text';
      new_div.innerHTML = new Date().toLocaleTimeString() + ' There are ' + n + ' participants';
      document.getElementById('room-updates').appendChild(new_div);
    });

    jsPsych.node.socket.once('join-reply', function(message){
      console.log(new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') + ' client heard join-reply');
      session_id = message.session_id;
    });

    jsPsych.node.socket.emit('join', {
      experiment: trial.experiment,
      participants: trial.participants
    });

    jsPsych.node.socket.on('ready', function(message) {
      // TODO: check if client is ready to proceed, via html
      // if ready, emit 'ready-reply'
      console.log(new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') + ' client heard ready');

      var button = document.createElement("INPUT");
      button.type = "button";
      button.value = "I'm ready";
      document.body.appendChild(button);
      button.onclick = (function() {
        jsPsych.node.socket.emit('ready-reply', message);
        console.log(new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') + ' client emmitted ready-reply');
      })();
    });

    // when the server starts, do something...
    jsPsych.node.socket.once('start', function(message){
      console.log(new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') + ' client heard start');
      player_id = message.player_id;
      end_trial();
    });

    function end_trial(){
      jsPsych.finishTrial({
        player_id: player_id,
        session_id: session_id
      });
    }

    jsPsych.finishTrial();
  }

  return plugin;

})();
