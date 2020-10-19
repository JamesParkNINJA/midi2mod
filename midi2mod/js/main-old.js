/* -------- FT2MOD -------- */
/*  midi2mod.jamespark.ninja  */
/* --- James Park: 2020 --- */

jQuery(document).ready( function($) {
    
  async function parseMIDI() {
    
    // load a midi file in the browser
    const midi = await Midi.fromUrl('./default/default.mid');
    //the file name decoded from the first track
    const name = midi.header.name;
    
    const tempos = midi.header.tempos;
    
    const tempo = getAverageTempo(tempos);
    const speed = bpm2fval(tempo);
    
    const tracks = midi.tracks;
    
    var output = [];
    
    console.log(tempo);
    console.log(speed);
    console.log(midi);
    
    function trackDetails(track) {
      //tracks have notes and controlChanges

      //notes are an array
      const notes = track.notes;
      var output = [], i = 0;
      notes.forEach(note => {
        var bps = speed['bpm'] / 60,
            bpr = bps / 4,
            nspeed = note.duration / bpr,
            bars = (Math.round(nspeed) >= 1 ? Math.round(nspeed) : 1);
        
        console.log('bps: '+bps+', bpr: '+bpr+', nspeed: '+nspeed+', bars:'+bars);

        output[i] = {note: note.name, bars: bars};
        i++;
      });
      
      return output;
    }
    
    function bpm2fval(tempo) {
      var bpm = []; bpm['bpm'] = 0; bpm['fval'] = '';
      
      if (tempo < 83)  { bpm['bpm'] = 82;  bpm['fval'] = 'F0A'; } 
      if (tempo > 82)  { bpm['bpm'] = 90;  bpm['fval'] = 'F09'; } 
      if (tempo > 90)  { bpm['bpm'] = 100; bpm['fval'] = 'F08'; }
      if (tempo > 100) { bpm['bpm'] = 113; bpm['fval'] = 'F07'; }
      if (tempo > 113) { bpm['bpm'] = 129; bpm['fval'] = 'F06'; }
      if (tempo > 129) { bpm['bpm'] = 150; bpm['fval'] = 'F05'; }
      if (tempo > 150) { bpm['bpm'] = 225; bpm['fval'] = 'F04'; }
      if (tempo > 225) { bpm['bpm'] = 300; bpm['fval'] = 'F03'; }
      if (tempo > 300) { bpm['bpm'] = 450; bpm['fval'] = 'F02'; }
      if (tempo > 450) { bpm['bpm'] = 900; bpm['fval'] = 'F01'; }
      
      return bpm;
    }
    
    function getAverageTempo(tempos) {
      var count = 0, sumHeight = 0, length = tempos.length;
      for (var i = 0; i<length; i++) {
       if (tempos[i].hasOwnProperty("bpm")) {
         sumHeight += tempos[i].bpm;
         count += 1;
       }
      }
      return Math.round(sumHeight/count);
    }
    
    if (tracks.length > 1) {
      //get the tracks
      tracks.forEach(track => {
        output.push(trackDetails(track));
      });
    } else {
      output.push(trackDetails(tracks[0]));
    }
    
    function alterNote(note) {
      if (note.indexOf('#') == -1) {
        note = note.slice(0, 1) + "-" + note.slice(1);
      }
      
      return note;
    }
  
    function midi2mod(midi) {

      var output = 'ModPlug Tracker MOD\n',
          notes = midi[0].length,
          lines = 0;

      for (var i=0; i<midi[0].length; i++) {
        var row = '',
            note = midi[0][i].note,
            bars = midi[0][i].bars,
            s = (i == 0 ? speed['fval'] : '...');
        
        lines++;
        
        row = row + '|' + alterNote(note) + '01......|' + alterNote(note) + '02......|........'+s+'|...........\r\n';
        
        output = output + row;
        
        if ((lines % 64) == 0) {
          output = output + '\r\nModPlug Tracker MOD\r\n';
        }
        
        if (bars > 1) {
          for (var b=0; b < bars; b++) {
            lines++;
            output = output + '|...........|...........|...........|...........\r\n';
        
            if ((lines % 64) == 0) {
              output = output + '\r\n';
            }
          }
        }
        
      }
      
      lines++;
      var patterns = Math.ceil(lines / 64);
      output = output + '|...........|...........|........B00|...........\r\n'
      $('.pattern__amount').text('Pattern Amount: '+patterns+' (0 to '+(patterns - 1)+')');
      return output;

    }
        
        console.log(output);

    var stuff = midi2mod(output);
    
    $('[name="MOD_2"]').html(stuff);
  }
  
  // Default settings 
  // (volume prioritised, GBTPlayer Compatibility, Midi File)
  var prioritiseEffects = false,
      tracker = 'GBTPlayer',
      midi = parseMIDI();
  
  
  
  // Function check a string and loop through which compatible effect it is
  // If the first character of the effect matches an incompatible effect, it returns false
  function checkEffect(effect) {
    var check = false,
        mod   = effect[0];
    
    switch (mod) {
      case '0': check = effect; break;
      case '1': check = (tracker == 'GBTPlayer' ? false : effect); break;
      case '2': check = (tracker == 'GBTPlayer' ? false : effect); break;
      case '3': check = (tracker == 'GBTPlayer' ? false : effect); break;
      case '4': check = effect; break;
      case '7': check = (tracker == 'GBTPlayer' ? false : effect); break;
      case 'A': check = effect; break;
      case 'B': check = effect; break;
      case 'C': check = false; break;
      case 'D': check = effect; break;
      case 'E': check = false; break;
      case 'F': check = effect; break;
      case 'G': check = (tracker == 'GBTPlayer' ? false : false); break; // Update Later
      case 'H': check = false; break;
      case 'I': check = false; break;
      case 'J': check = false; break;
      case 'P': check = (tracker == 'GBTPlayer' ? false : false); break; // Update Later
      case 'Q': check = (tracker == 'GBTPlayer' ? false : effect); break;
      case 'R': check = (tracker == 'GBTPlayer' ? false : effect); break;
      case 'S': check = 'EC'+effect[2]; break;
      case 'V': check = false; break;
      case 'W': check = false; break;
      case 'X': check = false; break;
      case 'Y': check = false; break;
      case 'Z': check = false; break;
      default: check = false;
    }
    
    console.log(check);
    
    return check;
  }
  
  // Converts a given value for Famitracker volume into a mod readable format
  function convertVolume(input) {
    var output = '...';
    switch (input) {
      case '0': output = 'C00'; break;
      case '1': output = 'C04'; break;
      case '2': output = 'C08'; break;
      case '3': output = 'C0C'; break;
      case '4': output = 'C10'; break;
      case '5': output = 'C14'; break;
      case '6': output = 'C18'; break;
      case '7': output = 'C1C'; break;
      case '8': output = 'C20'; break;
      case '9': output = 'C24'; break;
      case 'A': output = 'C28'; break;
      case 'B': output = 'C2C'; break;
      case 'C': output = 'C30'; break;
      case 'D': output = 'C34'; break;
      case 'E': output = 'C38'; break;
      case 'F': output = 'C3C'; break;
      default: output = input;
    }
    
    // Redundant
    /*
    if (output.length < 3) {
      var l = output.length;
      for (var i = 0; i<l; i++) {
        output = '.'+output;
      }
    }
    */
    
    return output;
  }
  
  // Toggles between the effects/volume priority
  $(document).on('change', '[name="midi2mod-a-effects-are-priority"]', function(e){
    if ($(this).is(':checked')) {
      prioritiseEffects = true;
    } else {
      prioritiseEffects = false;
    }
  });
  
  // Switches active tracker compatibility based on dropdown selection
  $(document).on('change', '.midi2mod-a-tracker-select', function(e){
    tracker = $('.midi2mod-a-tracker-select option:selected').val();
  });
  
  // The main action to activate conversion
  $(document).on('click', '.midi2mod-a-convert', function(e){
    e.preventDefault();
    
    var input  = $('textarea[name="FT_2"]').val(),
        exit = $('textarea[name="MOD_2"]'),
        input = input.replace(/PATTERN.+?\n/g, '*'), // Replaces all instances of PATTERN XX with a separator
        head   = input.split('*'),
        update = Array();
    
    // Removes all the text before the first pattern
    for(var h = 0; h<head.length; h++) {
      if (h>0) {
        update.push(head[h]);
      }
    }
    
    // Rejoins the patterns as a text string, and removes the # End of export text
    var body = update.join('ModPlug Tracker MOD\n').replace('# End of export', ''),
        output = Array();
    
    // Loops through each new line as a row
    var rows = body.split("\n"),
        amount = rows.length;
    for(var i=0; i<amount; i++) {
      
      var newTabs = Array();
      
      // If the row doen't include the ModPlug Tracker MOD text then
      // it applies further conversion, else just outputs the text
      if (rows[i].indexOf('ModPlug Tracker MOD') === -1) {
      
        rows[i] = rows[i].replace(/ : /g, ':');
        rows[i] = rows[i].replace(/ROW.+?:/g, ''); // Remove all instances of ROW XX
        rows[i] = rows[i].replace(/:/g, '|'); // Switches colons to pipes (haha)
        var tabs = rows[i].split('|');
    
        // Splits a row into the channels ("tabs")
        for(var x=0; x<tabs.length; x++) {
          
          // Makes sure it only exports 4 channels ("tabs")
          if (tabs[0] != '' && x < 4) {
            
            // Splits the channels into note data ("cells")
            var cells = tabs[x].split(' ');
            
            // If a FamiTracker volume exists
            // convert it to .mod volume
            // Else make it a .mod compatible blank
            if (cells[2] != '.') { 
              cells[2] = convertVolume(cells[2]);
            } else {
              cells[2] = '...';
            }
            
            // If a effects are a priority
            if (!prioritiseEffects) {
              // If not, check for a volume and apply it
              // If no volume, then check for effect and convert it
              if (cells[2] != '...') {
                cells[3] = cells[2];
              } else {
                cells[3] = (checkEffect(cells[3]) ? checkEffect(cells[3]) : '...');
              }
            } else {
              // If effects ARE a priority, check for effects and apply them 
              // (or wipe them if not compatible)
              if (cells[3] != '...') {
                if (checkEffect(cells[3]) != false) {
                  cells[3] = checkEffect(cells[3]);
                } else {
                  cells[3] = '...';
                }
              } else {
                // Otherwise apply the volume instead
                if (cells[2] != '...') {
                  cells[3] = cells[2];
                }
              }
            }
            
            // sets the 2nd "cell" as blank default for OpenMTP and GBTPlayer
            cells[2] = '...';            
            cells[0] = '|'+cells[0];
            
            // ...unless it's for MilkyTracker, in which case it
            // will remove that blank unused section
            if (tracker == 'MilkyTracker') {
              var newCells = Array();
              for(var c = 0; c<cells.length; c++) {
                if (c != 2) {
                  newCells.push(cells[c]);
                }
              }
              
              cells = newCells;
            }
            
            // rejoins the "cells" into a string
            var join = cells.join('');
            newTabs.push(join);
          }
        }
        
      } else {
        newTabs.push('\nModPlug Tracker MOD\n');
      }
      
      output.push(newTabs);
    }   
    
    // rejoins all data into a full string with new lines applied
    var html = output.join('\n');
    html = html.replace(/(^[ \t]*\n)/gm, '');
    html = html.replace(/,/g, '');
    
    exit.val('ModPlug Tracker MOD\n'+html);
    
  });
});