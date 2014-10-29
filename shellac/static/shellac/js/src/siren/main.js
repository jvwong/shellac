/**
 * main.js
 * Created by jvwong on 29/10/14.
 */

var play1_html = '<a class="siren-btn" href="#play">Play1</a>',
    play2_html = '<a class="siren-btn" href="#play">Play2</a>',
    context,
    handleAudioData, onError,
    urls = ["http://freshly-ground.com/data/audio/sm2/SonReal%20-%20Let%20Me%20%28Prod%202oolman%29.mp3",
        "http://freshly-ground.com/data/audio/sm2/SonReal%20-%20LA%20%28Prod%20Chin%20Injetti%29.mp3"];

window.addEventListener('load', init, false);

function init() {
    try
    {
        // Fix up for prefixing
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        context = new AudioContext();
        loadSounds(urls, context);
    }
    catch(e)
    {
        alert('Web Audio API is not supported in this browser');
    }

}

onError = function(e){
    console.warn(e);
};


function loadSounds(urls, context) {

    bufferLoader = new BufferLoader(
        context, urls, handleAudioData
    );

    bufferLoader.load();
}

function finishedLoading(bufferList, track) {
    var _track = track || 1;

    // Create two sources and play them both together.
    var source1 = context.createBufferSource();
    var source2 = context.createBufferSource();
    source1.buffer = bufferList[0];
    source2.buffer = bufferList[1];

    source1.connect(context.destination);
    source2.connect(context.destination);

    if(_track === 1)
    {
        source1.start(0);
    }
    else if(_track === 2)
    {
        source2.start(0);
    }
}


handleAudioData = function(buffer){
    //data comes in as binary
    var dogBarkingBuffer = buffer;

    //add a play button
    var wrapper, play1_button, play2_button;

    wrapper = document.querySelector('.siren-btn-wrapper');
    wrapper.innerHTML = play1_html + '<br/>' + play2_html;

    console.log(wrapper.childNodes);
    play1_button = wrapper.childNodes[0];
    play2_button = wrapper.childNodes[2];

    play1_button.addEventListener("click", function(e){
        e.preventDefault();
        finishedLoading(dogBarkingBuffer, 1);
    }, false);

    play2_button.addEventListener("click", function(e){
        e.preventDefault();
        finishedLoading(dogBarkingBuffer, 2);
    }, false);
};

