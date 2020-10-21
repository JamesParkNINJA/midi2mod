<!doctype>
<html>
  
<?php $d = strtotime(date('m/d/Y h:i:s a')); ?>

<head>
  <link href="https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@300;500;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="./css/triangle.css">
  <link rel="stylesheet" href="./css/main.css?v=<?php echo $d; ?>">
  
  <title>MIDI2MOD | JamesPark.ninja</title>  
  <meta name="description" content= "Convert .mid to OpenMPT import code!" />
  <meta name="robots" content= "index, follow">
  

  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
  <link rel="manifest" href="/site.webmanifest">
  <script src="https://code.jquery.com/jquery-1.12.4.min.js" integrity="sha256-ZosEbRLbNQzLpnKIkEdrPv7lOy9C27hHQ+Xp8a4MxAQ=" crossorigin="anonymous"></script>
  <script src="https://unpkg.com/@tonejs/midi"></script>
  
  <script type="text/javascript" src="./js/main.js?v=<?php echo $d; ?>"></script>
  <!--<script type="text/javascript" src="./js/pt.js"></script>-->
  <script type="text/javascript" src="./js/basoon.js"></script>
  
  <!-- Place this tag in your head or just before your close body tag. -->
  <script async defer src="https://buttons.github.io/buttons.js"></script>
</head>

<body>
  <div class="tri fullwidth">
      <div class="tri">
        <div class="ang le-full">
          <h1>MIDI<span>2</span>MOD</h1> <img src="./images/gb.png" class="gb_img" /> <script type='text/javascript' src='https://ko-fi.com/widgets/widget_2.js'></script><script type='text/javascript'>kofiwidget2.init('Help me make more tools!', '#29abe0', 'A217453J');kofiwidget2.draw();</script> </div>
        <div class="ang le-full md-half">
          <div class="midi2mod-c-options-panel">
            <div class="tri">
              <div class="ang le-full">

                <p class="text_small">Convert <span style="color:red; font-weight:bold;">MIDI</span> files to .mod compatible tracker output you can copy and paste!</p>
                <p class="text_small">For songs with more than one pattern, you'll need to: 1) turn on Paste Overflow (see gif), 2) add the required amount of blank patterns before pasting.</p>

              </div>
              <div class="ang le-full">
                
                <img src="images/overflow.gif" style="width:100%; max-width:100%; margin-bottom:1em;" />
                
              </div>
              <div class="ang le-full">
                
                <!-- Place this tag where you want the button to render. --><a class="github-button" href="https://github.com/JamesParkNINJA/midi2mod/issues" data-show-count="true" aria-label="Issue JamesParkNINJA/midi2mod on GitHub">Issue</a>

              </div>
            </div>
          </div>
        </div>
        
        <div class="ang le-full lg-half" style="padding:.5em;">
          
          
          <div class="gameboy-outer">
            
            <div class="gameboy-cart-box">
              <div class="gameboy-cart">
                
                <a href="#" class="midi2mod-a-generate upload">Upload Midi</a>
                <input type="file" name="midi_in" id="midi_in" />
                
              </div>
            </div>
            
            <div class="gameboy-base">
              <div class="gameboy-padding">
                <div class="gameboy-lines"></div>
              </div>
              
              <div class="gameboy-screen">
                <div class="gameboy-screen-inner">
                  <div class="song-settings">
                    <div class="settings__area tri">
                      <div class="ang le-full">
                        <label for="c_1">Instr. 1</label>
                        <select name="c_1">
                          <option value="na">Hide Channel</option>
                          <option selected value="01">25% Pulse</option>
                          <option value="02">50% Pulse</option>
                          <option value="03">75% Pulse</option>
                          <option value="04">12.5% Pulse</option>
                        </select>
                      </div>
                      <div class="ang le-full">
                        <label for="c_2">Instr. 2</label>
                        <select name="c_2">
                          <option value="na">Hide Channel</option>
                          <option value="01">25% Pulse</option>
                          <option value="02">50% Pulse</option>
                          <option selected value="03">75% Pulse</option>
                          <option value="04">12.5% Pulse</option>
                        </select>
                      </div>
                      <div class="ang le-full">
                        <label for="c_3">Instr. 3</label>
                        <select name="c_3">
                          <option value="na">Hide Channel</option>
                          <option value="08">Random Wave</option>
                          <option value="09">Ringy Wave</option>
                          <option value="0A">Sync Saw Wave</option>
                          <option value="0B">Ring Saw Wave</option>
                          <option value="0C">Pulse+Tri Wave</option>
                          <option value="0D">Sawtooth Wave</option>
                          <option value="0E">Square Wave</option>
                          <option selected value="0F">Sine Wave</option>
                        </select>
                      </div>
                      <div class="ang le-full">
                        <label for="volume">Shorten Notes?</label>
                        <select name="volume">
                          <option value="no">No</option>
                          <option selected value="yes">Yes</option>
                        </select>
                      </div>
                    </div>

                    <div id="player">
                      <div id="songname">stardust memories</div>
                      <div id="play">Play</div>
                      <div id="scope"><canvas width="215" height="34"></canvas></div>
                      <div class="range vol_range">
                          Volume:
                          <input id="volume" type="range" min="0" max="100" value="70">
                      </div>
                      <div class="range wide">
                          <input id="progress" type="range" min="0" max="100" value="0">
                      </div>
                    </div>
                    
                  </div>
                </div>
              </div>
              
              <div class="gameboy-options">
                <a href="#" class="midi2mod-a-generate save disabled">Save Mod</a>
                
                <a href="#" class="midi2mod-a-generate upload disabled">New Midi</a>
              </div>           
            </div>
            
            <div class="gameboy-printout">
              <div class="gameboy-printout-inner">
                <span class="pattern__amount text_small"></span><br>
                <textarea name="MOD_2" disabled placeholder="MOD COMPATIBLE TEXT WILL APPEAR HERE"></textarea>
              </div>
            </div>
            
          </div>
          
          
        </div>
      </div>
  </div>  
  
  <audio preload="auto" autobuffer id="gb"> 
    <source src="./default/gb.mp3" />
  </audio>
  
  
</body>

</html>
