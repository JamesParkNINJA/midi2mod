/* -------- MIDI2MOD -------- */
/*  midi2mod.jamespark.ninja  */
/* ---- James Park: 2020 ---- */
  
  var playItem;
  var autoPlay = false;
  var scopeActive = true;

  document.addEventListener('DOMContentLoaded', function() {
      var playButton = document.getElementById("play");
      var progressBar = document.getElementById("progress");
      var volumeBar = document.getElementById("volume");
      var songName = document.getElementById("songname");

      // create canvas to display scope
      var scopeCanvas = document.createElement("canvas");
      var scopeWidth = scopeCanvas.width = 215;
      var scopeHeight = scopeCanvas.height = 34;
      var scope = scopeCanvas.getContext("2d");
      scopeCanvas.onclick = function(){
          scopeActive = !scopeActive;
          clearScope();
      };
      document.getElementById("scope").appendChild(scopeCanvas);

      var analyser = BassoonTracker.audio.context.createAnalyser();
      analyser.smoothingTimeConstant = 0.85;

      BassoonTracker.init(true);
      if (!BassoonTracker.audio.context){
          songName.innerHTML = "Sorry<br>Your browser does not support WebAudio.<br>Supported browsers are Chrome, Firefox, Safari, and Edge";
      }else{

          var demoMod = "../demomods/StardustMemories.mod";

          var startTime;
          var wasPlaying;
          var patternLength;
          var songLength;

          playItem = function(url){
              stopPlay();
              songName.innerHTML = "Loading ...";
              BassoonTracker.load(url,false,function(){
                  var song = BassoonTracker.getSong();
                  songName.innerHTML = song.title;

                  // We could loop over all the patterns to get the real length, but a rough estimate is good enough.
                  patternLength = song.patterns[song.patternTable[0]].length;
                  songLength = song.length*patternLength;

                  // only autostart
                  if (autoPlay) togglePlay();
              });
          };

          // setup UI

          playButton.onclick = function(){
              autoPlay = true;
              togglePlay();
          };

          // setup progress bar to seek into the song
          progressBar.oninput = function(){
              wasPlaying = wasPlaying || BassoonTracker.isPlaying();
              stopPlay();
          };
        
          progressBar.onchange = function(){
              // align to start of pattern
              var songPos = Math.floor((songLength*progressBar.value/100)/patternLength);
              BassoonTracker.setCurrentSongPosition(songPos);
              if (wasPlaying) togglePlay();
              wasPlaying = false;
          };

          // setup progress bar to seek into the song
          volumeBar.oninput = volumeBar.onchange = function(){
              BassoonTracker.audio.masterVolume.gain.cancelScheduledValues(0);
              BassoonTracker.audio.masterVolume.gain.setValueAtTime(volumeBar.value/100,0);
          };

          BassoonTracker.audio.cutOffVolume.connect(analyser);


          // setup simple timer
          // this has nothing to do with audio playback, it's only used to update the UI once in a while;
          requestAnimationFrame(function loop(){
              if (startTime){

                  if (BassoonTracker.isPlaying()){
                      var time = new Date().getTime() - startTime;
                      var state = BassoonTracker.getStateAtTime(time);
                      if (state){
                          var currentPos = state.songPos*patternLength + state.patternPos;
                          var percentage = currentPos*100/songLength;
                          progressBar.value = percentage;
                      }
                  }
                  if (scopeActive) renderScope();
              }
              requestAnimationFrame(loop)
          });

          // load first song
          //playItem(demoMod);
      }

      function togglePlay(){
          BassoonTracker.togglePlay();
          if (BassoonTracker.isPlaying()){
              startTime = new Date().getTime();
              playButton.innerHTML = "Pause";
          }else{
              playButton.innerHTML = "Play";
          }
      }

      function stopPlay(){
          BassoonTracker.stop();
          playButton.innerHTML = "Play";
      }

      // render a frequency scope
      function renderScope(){
          scope.clearRect(0,0,scopeWidth,scopeHeight);
          scope.fillStyle = '#000000';

          analyser.fftSize = 128;
          var bufferLength = analyser.frequencyBinCount;
          var dataArray = new Uint8Array(bufferLength);

          var lowTreshold = 8;
          var highTreshold = 8;
          var max = bufferLength-highTreshold;

          var visualBufferLength = bufferLength - lowTreshold - highTreshold;

          analyser.getByteFrequencyData(dataArray);

          var barWidth = (scopeWidth - visualBufferLength) / visualBufferLength;
          var barHeight;
          var wx = 0;

          // only display range

          for(var i = lowTreshold; i < max; i++) {
              barHeight = dataArray[i] * (scopeHeight + (i * 2.5)) / 750;
              scope.fillRect(wx,scopeHeight-barHeight,barWidth,barHeight);

              wx += barWidth + 1;
          }
      }

      function clearScope(){
          scope.clearRect(0,0,scopeWidth,scopeHeight);
          scope.fillStyle = '#CCCCCC';
          scope.font = "18px sans-serif";
          if (!scopeActive){
              scope.fillText("inactive",10,scopeHeight/2 + 6);
          }
      }


  });

  function play(url){
      autoPlay = true;
      if (playItem) playItem(url);
  }
  

jQuery(document).ready( function($) {
  
  $('#gb').get(0).pause();
  
  var mURL = '';
  
  async function loadModule(url, pArray, save){
    if (typeof window === 'undefined') return // make sure we are in the browser
    const response = await fetch(url)
    const data = await response.blob()
    const metadata = {
      type: 'audio/x-mod'
    }
        
    var song = {
        patterns:[],
        restartPosition: 1
    }; 

    function readBytes(input, len, position) {
		//setIndex(position);
		var u8 = new Uint8Array(len),
            buffer = new DataView(u8.buffer),
		    src = input,
            offset = 0,
            len = len + position;
       
		for (var i = position; i < len; i++) {
			buffer.setUint8(offset, src.getUint8(i));
            offset++;
        }
       
		return buffer;
	}
    
    function readString(input, len, position) {
		var src = input,
            text = '',
            offset = 0,
            len = len + position;
       
		for (var i = position; i < len; i++) {
			var c = src.getUint8(i);
			if (c == 0) break;
			text += String.fromCharCode(c);
        }
      
		return text;
    }
    
    function readWord(input, position) {
		var src = input;
       
		var w = src.getUint16(position, false);
		return w;
    }
    
    function readByte(input, position){
		var b = input.getInt8(position);
		return b;
	}
    
    function readUbyte(input, position){
		var b = input.getUint8(position);
		return b;
	}
    
    function readUint(input, position){
		var b = input.getUint32(position, false);
		return b;
	}

    function processFile(theFile){
      return function(e) { 
        var theBytes = e.target.result,
            theLength = theBytes.byteLength,
            theBuffer = new DataView(theBytes, 0, theLength);
        
        //console.log(theBytes);

        var patternLength = 64;
        var instrumentCount = 31;
        var channelCount = 4;

        song.title = readString(theBuffer, 20, 0);
        song.channels = 4;
        
        // Instrument List
        song.instruments = [];        
        var sampleDataOffset = 0, x = 30;
        for (var i = 0; i < instrumentCount; ++i) {
          
            var nameP = (x * i) + 20, nameL = 22,
                sampP = (x * i) + 42, sampL = 2,
                ftP   = (x * i) + 44, ftL   = 1,
                volP  = (x * i) + 45, volL  = 1,
                lsP   = (x * i) + 46, lsL  = 2,
                llP   = (x * i) + 48, llL  = 2;
          
            var instrumentName = readString(theBuffer, nameL, nameP);
            var sampleLength = readWord(theBuffer, sampP);
            //console.log(instrumentName);
            //console.log(sampleLength);

            var instrument = {};
                instrument.sample = {};
                instrument.sample.loop = {};
            instrument.name = instrumentName;
            instrument.sample.l = sampleLength << 1;
            instrument.i = nameP;
          
            var finetune = readUbyte(theBuffer, ftP);
            if (finetune>7) finetune -= 16;
            if (finetune>7) finetune = finetune-15;
			instrument.sample.finetune = finetune;
			instrument.sample.finetuneX = finetune << 4;
            
            //console.log(finetune);
          
            instrument.sample.volume = readUbyte(theBuffer, volP);
            instrument.sample.loop.start = readWord(theBuffer, lsP) << 1;
            instrument.sample.loop.l = readWord(theBuffer, llP) << 1;
            
            //console.log(instrument.sample.volume);
            //console.log(instrument.sample.loop.start);
            //console.log(instrument.sample.loop.l);
          
            instrument.sample.loop.enabled = instrument.sample.loop.l>2;
            instrument.sample.loop.type = 1;

            instrument.pointer = sampleDataOffset;
            sampleDataOffset += instrument.sample.l;
            song.instruments[i] = instrument;
        }
        
        song.l   = readUbyte(theBuffer, 950);
        song.end = readUbyte(theBuffer, 951);
        
        //console.log(song.end);
        
        // Pattern List
        var patternTable = [],
            highestPattern = 0,
            patteri = 953;
        
        for (var i = 0; i < 128; ++i) {
            var pos = patteri + i;
            patternTable[i] = [];
            patternTable[i]['data'] = readUbyte(theBuffer, pos);
            patternTable[i]['pos'] = pos;
            if (patternTable[i] > highestPattern) highestPattern = patternTable[i];
        }
        song.patternTable = patternTable;
        song.patternCount = highestPattern + 1;
        
        //console.log(song.patternTable);
        //console.log(song.patternCount);
        
        var signature = readString(theBuffer, 4, 1080);
        //console.log(signature);
        
        var patEnd = 1084,
            samplesPos = 0;
        for (var p = 0; p < song.patternCount; p++) {

			var patternData = [];

			for (var step = 0; step<patternLength; step++){
				var row = [];
				var channel;
				for (channel = 0; channel < channelCount; channel++){
					var note = {};
                        note.period = 0;
                        note.index = 0;
                        note.effect = 0;
                        note.instrument = 0;
                        note.param = 0;
                        note.volumeEffect = 0;
                  
					var trackStepInfo = readUint(theBuffer, patEnd);

					note.period = (trackStepInfo >> 16) & 0x0fff;
					note.effect = (trackStepInfo >>  8) & 0x0f;
					note.instrument = (trackStepInfo >> 24) & 0xf0 | (trackStepInfo >> 12) & 0x0f;
					note.param  = trackStepInfo & 0xff;

					row.push(note);
                    patEnd = patEnd + 4;
				}

				// fill with empty data for other channels
				// TODO: not needed anymore ?
				for (channel = channelCount; channel < 4; channel++){
                  var note = {};
                      note.period = 0;
                      note.index = 0;
                      note.effect = 0;
                      note.instrument = 0;
                      note.param = 0;
                      note.volumeEffect = 0;
                  
					row.push(note);
				}

				patternData.push(row);
			}
			song.patterns.push(patternData);

			//file.jump(1024);
		}
        samplesPos = 1084 + 1024;
        
        //console.log(song.patterns);
        
        // Instrument Container
        var instrumentContainer = [];
        var sampleStart = samplesPos,
            le = 0;
          
            //console.log(song.instruments);
        
        var insSize = 0;

        for (var ins = 0; ins < instrumentCount; ins++) {
          if (song.instruments[ins]){
            insSize += song.instruments[ins].sample.l;
          }
		}
        
        //if (false == true) {
        for(var i=0; i < instrumentCount; i++) {
            var instr = song.instruments[i];
          
            instr.sample.data = [];

            var sampleEnd = sampleStart + instr.sample.l;
          
            if (instr){
                //console.log("Reading sample from 0x" + instrument.i + " with length of " + instrument.sample.l + " bytes and repeat length of " + instrument.sample.loop.l);
              
                /*
                if (instr.sample.loop.l>2 && instr.sample.loop.l<1000){
					// cut off trailing bytes for short looping samples
					sampleEnd = Math.min(sampleEnd,instr.sample.loop.start + instr.sample.loop.l);
					instr.sample.l = sampleEnd;
				}
                */
              
                //le = le + instrument.sample.l;
              
                //console.log('Start Byte: '+sampleStart+ ' + '+instrument.sample.l+' = End Byte: '+sampleEnd);
                //console.log(readByte(theBuffer, sampleStart));

                for (var j = sampleStart; j<=sampleEnd-2; j++){
                    //console.log(j);
                    var b = readByte(theBuffer, j);
                    instr.sample.data.push(b);
                }
              
                sampleStart = j; 
              
                /*
                if (instr.sample.loop.l>2){

                      var loopCount = Math.ceil(40000 / instr.sample.loop.l) + 1;

                      loopCount = 0;

                      var resetLoopNumbers = false;
                      var loopLength = 0;
                      if (instr.sample.loop.l<1600){

                          loopCount = Math.floor(1000/instr.sample.loop.l);
                          resetLoopNumbers = true;
                      }

                      for (var l=0;l<loopCount;l++){
                          var start = instr.sample.loop.start;
                          var end = start + instr.sample.loop.l;
                          for (j=start; j<end; j++){
                              instr.sample.data.push(instr.sample.data[j]);
                          }
                          loopLength += instr.sample.loop.l;
                      }

                      if (resetLoopNumbers && loopLength){
                          instr.sample.loop.l += loopLength;
                          instr.sample.l += loopLength;
                      }
                  }
                */
              
                //console.log(instr.sample.data);
              
                song.instruments[i] = instr;

                instrumentContainer.push({label: i + " " + instr.name, data: i});
            }
        }
        //}
        
        //sampleStart insSize
        //console.log(theBuffer);       
        
        console.log(song.instruments);
        
        song.instrumentContent = instrumentContainer;
                
        // ------------------------------------------------------------------------- //  
        
        function writeString(output, value, position) {
          var src = output;
          var len = value.length;
          for (var i = 0; i < len; i++) src.setUint8(position + i,value.charCodeAt(i));
        }
        
        function writeStringSection(output, value, max, paddValue, position) {
          max = max || 1;
          value = value || '';
          paddValue = paddValue || 0;
          var len = value.length;
          if (len>max) value = value.substr(0,max);
          writeString(output, value, position);
          
          //output.fill(paddValue,max-len);
        }
        
        function writeWord(output, value, position) {
          output.setUint16(position,value,false);
        } 
        
        function writeUByte(output, value, position) {
          output.setUint8(position,value);
        } 
        
        function writeUint(output, value, position) {
          output.setUint32(position,value,false);
        } 
        
        function writeByte(output, value, position) {
          output.setInt8(position,value);
        } 
        
		var instruments = song.instruments;
		var trackCount = 4;
		var patternLength = 64;
		var fileSize = 20 + (31*30) + 1 + 1 + 128 + 4; // Why?,
        var patteri = 952;
        var newPatterns = pArray['patterns'];
        var newPatternTable = [];
        
        for (var i = 0; i < 128; ++i) {
            newPatternTable[i] = [];
            var pos = patteri + i;
            if (i < pArray['total']) {
              newPatternTable[i]['data'] = i;
            } else {
              newPatternTable[i]['data'] = 0;
            }
            newPatternTable[i]['pos'] = pos;
        }
        
        //console.log(newPatternTable);
        
        
        highestPattern = pArray['total'];

		fileSize += (highestPattern * (trackCount * 256));
        
        //console.log(fileSize);

        for (var ins = 0; ins < instrumentCount; ins++) {
			if (instruments[ins]){
				fileSize += instruments[ins].sample.data.length;
			}
		}
        //console.log(fileSize);
        
		var i;
		var arrayBuffer = new ArrayBuffer(fileSize);
		var file = new DataView(arrayBuffer, 0, fileSize);

		// write title
		writeStringSection(file, song.title, 20, 0, 0);

		// write instrument data
        var sampleDataOffset = 0, x = 30;
        
		for (var ins = 0; ins < instrumentCount; ins++) {
          
            var nameP = (x * ins) + 20, nameL = 22,
                sampP = (x * ins) + 42, sampL = 2,
                ftP   = (x * ins) + 44, ftL   = 1,
                volP  = (x * ins) + 45, volL  = 1,
                lsP   = (x * ins) + 46, lsL  = 2,
                llP   = (x * ins) + 48, llL  = 2;

            instruments[ins].sample.l = instruments[ins].sample.l;

            writeStringSection(file, instruments[ins].name, nameL, 0, nameP);
            writeWord(file, (instruments[ins].sample.l >> 1), sampP);
            writeUByte(file, instruments[ins].sample.finetune, ftP);
            writeUByte(file, instruments[ins].sample.volume, volP);
            writeWord(file, (instruments[ins].sample.loop.start >> 1), lsP);
            writeWord(file, (instruments[ins].sample.loop.l >> 1), llP);
		}

		writeUByte(file, highestPattern, 950);
		writeUByte(file, 127, 951);
        
		// patternPos
		for (var i = 0; i < 128; i++){
			var d = newPatternTable[i]['data'],
                p = newPatternTable[i]['pos'];
          
			writeUByte(file, d, p);
		}

		writeString(file, 'M.K.', 1080);

		// pattern Data
        
        //console.log(newPatterns);
        
        var patStart = 1084;
        //console.log(highestPattern);
        for (i=0;i<highestPattern;i++){
          for (var step=0; step<patternLength; step++){
            for (var channel = 0; channel < trackCount; channel++){
              //console.log('Pattern: '+i+', Row: '+step+', Channel: '+channel);
              if (newPatterns[i].hasOwnProperty(step)) {
                //console.log('has');
                var trackStep = newPatterns[i][step][channel];
              } else {
                //console.log('habenero');
                var trackStep = {}; 
                trackStep.instrument = 0; 
                trackStep.period = 0;
                trackStep.effect = 0;
                trackStep.parameter = 0;
                trackStep.volumeEffect = 0;
              }

              var uIndex = 0;
              var lIndex = trackStep.instrument;

              if (lIndex>15){
                uIndex = 16; // TODO: Why is this 16 and not 1 ? Nobody wanted 255 instruments instead of 31 ?
                lIndex = trackStep.instrument - 16;
              }

              var v = (uIndex << 24) + (trackStep.period << 16) + (lIndex << 12) + (trackStep.effect << 8) + trackStep.parameter;
              
              //console.log(v);
              
              writeUint(file, v, patStart);
              patStart = patStart + 4;
            }
          }
        }
        
        console.log(instruments);
        
        samplesPos = 1084 + (1024 * highestPattern);

		// sampleData;
        for (var ins = 0; ins < instrumentCount; ins++) {
			if (instruments[ins] && instruments[ins].sample.data && instruments[ins].sample.l){
				var d;
				// instrument length is in word
              
                console.log(instruments[ins].sample.data.length);
				for (i = 0; i < instruments[ins].sample.data.length; i++){
					d = instruments[ins].sample.data[i] || 0;
					writeByte(file, d, samplesPos);
                    samplesPos++;
				}
				//console.log("write instrument with " + instruments[ins].sample.l + " length");
			}else{
				// still write 4 bytes?
			}
		}
        
        function generateFile(b,filename){
            var a = document.createElement("a");
            document.body.appendChild(a);
            a.style = "display: none";
            url = window.URL.createObjectURL(new Blob([b], {type: 'audio/x-mod'}));
          
            return url;
        }
        
        function saveFile(b,filename){
            var a = document.createElement("a");
            document.body.appendChild(a);
            a.style = "display: none";
            url = window.URL.createObjectURL(new Blob([b], {type: 'audio/x-mod'}));
            a.href = url;
            a.download = filename;
            a.click();
            window.URL.revokeObjectURL(url);
        }
        
        //console.log(song);
        //console.log(file);
        
        if (save) { saveFile(file, 'test.mod'); } else {
          var URL = generateFile(file, 'test.mod');
          playItem(URL, false);
        }
        
        $('.save.disabled').removeClass('disabled');
        $('.upload.disabled').removeClass('disabled');
        $('#Player:not(.active)').addClass('active');
        
        //var pt = ProTracker();
        //song = pt.load('./default/sample.mod');
      }
    }
    
    var file = new File([data], url, metadata);
    var reader = new FileReader();
    reader.onload = processFile(file);
    reader.readAsArrayBuffer(file);    
  }
    
  var c1 = '01';
  var c2 = '03';
  var c3 = '0F';
  var shorten = true;
  var song = {};
    
  async function parseMIDI(src, save) {
    
    // load a midi file in the browser
    const midi = await Midi.fromUrl(src);
    //the file name decoded from the first track
    const name = midi.header.name;
    
    const tempos = midi.header.tempos;
    const ppq = midi.header.ppq;
    
    const tps = Math.ceil(midi.durationTicks / midi.duration);
    const tpr = tps / 4;
    const tpb = Math.ceil(midi.durationTicks / tpr);
    
    const tempo = getAverageTempo(tempos);
    const speed = bpm2fval(tempo);
    const tlist = getTempoList(tempos);
    
    const tracks = midi.tracks;
    
    var output = [];
    
    //console.log(midi);
    //console.log(tlist);
    
    function trackDetails(track) {
      //tracks have notes and controlChanges

      //notes are an array
      const notes = track.notes;
      var output = [], i = 0;
      notes.forEach(note => {
        var bps = Math.floor(speed['bpm'] / 60), // Beats Per Second
            ndur = note.duration, // Note Duration (in seconds)
            tdur = note.durationTicks, // Note Duration (in ticks)
            ticks = note.ticks, // Starting Tick (?)
            start = Math.round(note.ticks / tpr),
            nspeed = (tdur / ppq),
            bars = (Math.round(nspeed) >= 1 ? Math.round(nspeed) : 1);
        
        //console.log(note.ticks);

        output[i] = {note: note.name, bars: bars, start: start, ticks: ticks, track:i};
        i++;
      });
      
      return output;
    }
    
    function bpm2fval(tempo) {
      var bpm = []; 
      
      bpm['bpm'] = 0; bpm['fval'] = '';
      
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
    
    function getTempoList(tempos) {
      var length = tempos.length,
          list = [];
      for (var i = 0; i<length; i++) {
       if (tempos[i].hasOwnProperty("bpm")) {
         var tick = tempos[i].ticks / tpr;
         list[tick] = bpm2fval(tempos[i].bpm);
       }
      }
      return list;
    }
    
    if (tracks.length > 1) {
      //get the tracks
      tracks.forEach(track => {
        output.push(trackDetails(track));
      });
    } else {
      output.push(trackDetails(tracks[0]));
    }
    
    //console.log(output);
    
    function alterNote(note) {
      if (note.indexOf('#') == -1) {
        note = note.slice(0, 1) + "-" + note.slice(1);
      }
      
      return note;
    }
    
    function note2nibble(note) {
      
      var pitch = note.substring(0,2),
          octav = note.substring(2,3),
          C  = [856, 428, 214, 1712, 107],
          Cx = [808, 404, 202, 1616, 101],
          D  = [762, 381, 190, 1525, 95],
          Dx = [720, 360, 180, 1440, 90],
          E  = [678, 339, 170, 1357, 85],
          F  = [640, 320, 160, 1281, 80],
          Fx = [604, 302, 151, 1209, 76],
          G  = [570, 285, 143, 1141, 71],
          Gx = [538, 269, 135, 1077, 67],
          A  = [508, 254, 127, 1017, 64],
          Ax = [480, 240, 120, 961, 60],
          B  = [453, 226, 113, 907, 57],
          n = 0;
      
          pitch = (pitch[1] == '-' ? pitch[0] : pitch);
      
      if (pitch == 'C') {
        switch (octav) {
          case 3: n = C[0]; break;
          case 4: n = C[1]; break;
          case 5: n = C[2]; break;
          default: n = false;
        }
        
        if (!n) { n = (octav > C[0] ? C[0] : C[2]); }
      }
      
      if (pitch == 'C#') {
        switch (octav) {
          case 3: n = Cx[0]; break;
          case 4: n = Cx[1]; break;
          case 5: n = Cx[2]; break;
          default: n = false;
        }
        
        if (!n) { n = (octav > Cx[0] ? Cx[0] : Cx[2]); }
      }
      
      if (pitch == 'D') {
        switch (octav) {
          case 3: n = D[0]; break;
          case 4: n = D[1]; break;
          case 5: n = D[2]; break;
          default: n = false;
        }
        
        if (!n) { n = (octav > D[0] ? D[0] : D[2]); }
      }
      
      if (pitch == 'D#') {
        switch (octav) {
          case 3: n = Dx[0]; break;
          case 4: n = Dx[1]; break;
          case 5: n = Dx[2]; break;
          default: n = false;
        }
        
        if (!n) { n = (octav > Dx[0] ? Dx[0] : Dx[2]); }
      }
      
      if (pitch == 'E') {
        switch (octav) {
          case 3: n = E[0]; break;
          case 4: n = E[1]; break;
          case 5: n = E[2]; break;
          default: n = false;
        }
        
        if (!n) { n = (octav > E[0] ? E[0] : E[2]); }
      }
      
      if (pitch == 'F') {
        switch (octav) {
          case 3: n = F[0]; break;
          case 4: n = F[1]; break;
          case 5: n = F[2]; break;
          default: n = false;
        }
        
        if (!n) { n = (octav > F[0] ? F[0] : F[2]); }
      }
      
      if (pitch == 'F#') {
        switch (octav) {
          case 3: n = Fx[0]; break;
          case 4: n = Fx[1]; break;
          case 5: n = Fx[2]; break;
          default: n = false;
        }
        
        if (!n) { n = (octav > Fx[0] ? Fx[0] : Fx[2]); }
      }
      
      if (pitch == 'G') {
        switch (octav) {
          case 3: n = G[0]; break;
          case 4: n = G[1]; break;
          case 5: n = G[2]; break;
          default: n = false;
        }
        
        if (!n) { n = (octav > G[0] ? G[0] : G[2]); }
      }
      
      if (pitch == 'G#') {
        switch (octav) {
          case 3: n = Gx[0]; break;
          case 4: n = Gx[1]; break;
          case 5: n = Gx[2]; break;
          default: n = false;
        }
        
        if (!n) { n = (octav > Gx[0] ? Gx[0] : Gx[2]); }
      }
      
      if (pitch == 'A') {
        switch (octav) {
          case 3: n = A[0]; break;
          case 4: n = A[1]; break;
          case 5: n = A[2]; break;
          default: n = false;
        }
        
        if (!n) { n = (octav > A[0] ? A[0] : A[2]); }
      }
      
      if (pitch == 'A#') {
        switch (octav) {
          case 3: n = Ax[0]; break;
          case 4: n = Ax[1]; break;
          case 5: n = Ax[2]; break;
          default: n = false;
        }
        
        if (!n) { n = (octav > Ax[0] ? Ax[0] : Ax[2]); }
      }
      
      if (pitch == 'B') {
        switch (octav) {
          case 3: n = B[0]; break;
          case 4: n = B[1]; break;
          case 5: n = B[2]; break;
          default: n = false;
        }
        
        if (!n) { n = (octav > B[0] ? B[0] : B[2]); }
      }
      
      return (!n ? 0 : n);
      
    }
    
    function effect2bytes(volume, parameter) {
      volume = parseInt(volume, 16);
      parameter = (parameter == '--' ? 0 : parseInt(parameter, 16));      
      parameter = parseInt(parameter, 10);
      //console.log(parameter);
      
      var array = [];
      
      if (volume == 11 || volume == 12 || volume == 15) {
        array['effect'] = volume;
        array['parameter'] = parameter;
      } else {
        array['effect'] = 0;
        array['parameter'] = 0;
      }
      
      return array;
    }
    
    function text2array(text) {
      text = text.replace(/ModPlug Tracker MOD\n/g, '');
      text = text.replace(/ModPlug Tracker MOD\r\n/g, '');
      text = text.replace(/ModPlug Tracker MOD\r/g, '');
      
      var patterns = [],
          rows = text.split('\n'),
          p = 0,
          r = 0;
      
      patterns['patterns'] = [];
      
      for (var row = 0; row<rows.length; row++) {
        if (rows[row].includes('-')) {
          if (r == 0) {
            patterns['patterns'][p] = [];
          }
          patterns['patterns'][p][r] = [];
          var c = rows[row].substring(1, rows[row].length-2),
              channels = c.split('|');

          for (var channel = 0; channel < channels.length; channel++) {
              var x = channel;
            
              patterns['patterns'][p][r][x] = {};

              var note = channels[channel].substring(0,3),
                  inst = channels[channel].substring(3,5),
                  effe = channels[channel].substring(5,8),
                  volu = channels[channel].substring(8,11),
                  para = effect2bytes(volu[0], volu.substring(1,3));

              patterns['patterns'][p][r][x].period = (note == '---' ? 0 : note2nibble(note));
              patterns['patterns'][p][r][x].instrument = (inst == '--' ? 0 : parseInt(inst, 10));
              patterns['patterns'][p][r][x].effect = para['effect'];
              patterns['patterns'][p][r][x].parameter = para['parameter'];
              patterns['patterns'][p][r][x].index = 0;
              patterns['patterns'][p][r][x].volumeEffect = 0;
          }
          r++; if (r == 64) { r = 0; p++; }
        }
      }
      
      patterns['total'] = Math.ceil(patterns['patterns'].length);
      
      //console.log(patterns);
      
      return patterns;
    }
  
    function midi2mod(midi) {

      var output = 'ModPlug Tracker MOD\n',
          notes = midi.length,
          lines = 0,
          tick = 0,
          sim = 1,
          row = '',
          first = true,
          nl = false,
          nlc = 0;
      
      //console.log(tpb);

      for (var i=0; i<tpb; i++) {
        
          var s = '...',
              v = (shorten ? 'C00' : '...'),
              cv = (shorten ? 'C40' : '...'),
              ch1 = '|........'+v,
              ch2 = '|........'+v,
              ch3 = '|........'+v;
        
          if (i in tlist) {
            s = tlist[i]['fval'];
            
            //console.log(s);
          }

          for (var m=0; m<notes; m++) {
            if (midi[m].start == i) {
              
              nl = false; nlc = 0;

              var note = midi[m].note,
                  bars = midi[m].bars,
                  pos  = midi[m].ticks,
                  ni   = m + 1,
                  next = (midi.hasOwnProperty(ni) ? midi[ni].ticks : false);
              
              //console.log(pos+' '+tick);

              if (pos == tick && !first) {
                
                sim++;
                if (sim == 2) {
                  ch2 = ch1.replace(c1, c2);  
                  ch1 = '|' + alterNote(note) + c1+'...'+cv;  
                }
                if (sim == 3) {
                  ch3 = '|' + alterNote(note) + c3+'...'+cv;   
                }
              }

              if (first || pos > tick) {
                if (first) { 
                  first = false;
                  lines++;
                }
                tick = pos;
                ch1 = '|' + alterNote(note) + c1+'...'+cv;
              }
              
              if (next != pos || next === false) {
                sim = 1; tick = pos;
                
                if (c1 == 'na') { ch1 = '|...........'; }
                if (c2 == 'na') { ch2 = '|...........'; }
                if (c3 == 'na') { ch3 = '|...........'; }
                output = output + ch1 + ch2 + ch3 + '|........'+s+'\r\n';
                lines++;

                if ((lines % 64) == 0 && next) {
                  output = output + '\r\nModPlug Tracker MOD\r\n';
                }
                
              }

            } else {
              nl = true;
            }
          }
        
          if (nl) {
            lines++; nlc++;
            if (nlc > 1) { v = '...'; }
            output = output + '|........'+v+'|........'+v+'|........'+v+'|........'+s+'\r\n';
          }
      }
      
      //console.log(output);
      
      lines++;
      if (lines > 1) {
        var patterns = Math.ceil(lines / 64);
        $('.pattern__amount').text('Pattern Amount: '+patterns+' (0 to '+(patterns - 1)+')');
      } else {
        output = '';
      }
      
      return output;

    }
    
    function sortByTicks(a, b) {
      var aTicks = a.ticks;
      var bTicks = b.ticks;
      var aTrack = a.track;
      var bTrack = b.track;
      //console.log(aLow + " | " + bLow);

      if(aTicks == bTicks) {
        return (aTrack < bTrack) ? -1 : (aTrack > bTrack) ? 1 : 0;
      } else {
        return (aTicks < bTicks) ? -1 : 1;
      }
    }
        
    //console.log(output);
    
    var oc = output.length, stuff = '';
    /*
    for (var o = 0; o<oc; o++) {
      stuff = stuff + midi2mod(output[o]);
    }
    */
    //console.log(output[0]);
    
    //console.log(output);
    
    var oArr = output[0], next = 0;
    for (var o = 0; o<output.length; o++) {
      if (output[o].length > 0) { 
        oArr = output[o]; break; 
      }
    }
    for (var p = o; p<output.length; p++) {
      if (output[p].length > 0) { 
        next = p; break; 
      }
    }
    
    if (output[next]) {
      //console.log(output[1]);
      //oArr = oArr.concat(output[1]);
      oArr.sort(sortByTicks);
    } 
    
    //console.log(oArr);
    
    stuff = stuff + midi2mod(oArr);
    
    stuff = stuff + '|...........|...........|........B00|...........\r\n';
    
    $('[name="MOD_2"]').html(stuff);
    
    var convert = stuff.replace(/\./g, '-');
    convert = convert.replace(/ModPlug Tracker MOD\n/g, '');
    convert = convert.replace(/ModPlug Tracker MOD\r\n/g, '');
    convert = convert.replace(/ModPlug Tracker MOD\r/g, '');
    convert = convert.replace(/(.)\r/g, '$1|\r');
    
    //$('[name="CONVERT_1"]').html(convert);
    
    var pArray = text2array(convert);
  
    loadModule('./default/sample.mod', pArray, save);   
  }
  
  // Default settings 
  // (volume prioritised, GBTPlayer Compatibility, Midi File)
  var prioritiseEffects = false,
      tracker = 'GBTPlayer';
  
  
  
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
  
  function handleFile(e){
    if (e.files && e.files[0]) {
      if (!$('.gameboy-outer').hasClass('loaded')) {
        $('.gameboy-outer:not(.loaded)').addClass('loaded');
        $('#gb').get(0).play();
      }
      var reader = new FileReader();
      reader.onload = function(event){
        mURL = event.target.result;
        setTimeout(function(){
          parseMIDI(mURL, false);
        }, 500);
      }
      reader.readAsDataURL(e.files[0]); 
    }
  }
  
  $(document).on('change', '[name="c_1"]', function(e){
    c1 = $('[name="c_1"] option:selected').val();
    if (mURL != '') { parseMIDI(mURL, false); }
  });
  
  $(document).on('change', '[name="c_2"]', function(e){
    c2 = $('[name="c_2"] option:selected').val();
    if (mURL != '') { parseMIDI(mURL, false); }
  });
  
  $(document).on('change', '[name="c_3"]', function(e){
    c3 = $('[name="c_3"] option:selected').val();
    if (mURL != '') { parseMIDI(mURL, false); }
  });
  
  $(document).on('change', '[name="volume"]', function(e){
    shorten = ($('[name="volume"] option:selected').val() == 'yes' ? true : false);
    if (mURL != '') { parseMIDI(mURL, false); }
  });
  
  $(document).on('click', '.midi2mod-a-generate.upload', function(e){
    e.preventDefault();
    $('#midi_in').click();
  });
  
  $(document).on('click', '.midi2mod-a-generate.save:not(.disabled)', function(e){
    e.preventDefault();
    if (mURL != '') { parseMIDI(mURL, true); }
  });
  
  $(document).on('change', '#midi_in', function(e){
    handleFile(this);
  });
  
});