//// Xx.
!function (ROOT) {

const
    d = document
  , $ = (s) => d.querySelector.call(d, s)

let $out, $canvas, canvasCtx, audioCtx, monty1MathSeqin

ROOT.usage = {

    //// Initialises the app.
    init: () => {

        //// Create the <canvas> element.
        $out = $('#usage')
        $canvas = document.createElement('canvas')
        $canvas.width = 1000
        $canvas.height = 100
        $out.appendChild($canvas)
        canvasCtx = $canvas.getContext('2d')

        //// Set up audio.
        audioCtx = new AudioContext()
        monty1MathSeqin = new SEQIN.Monty1MathSeqin({
            audioContext: audioCtx
          , sharedCache: {}
          , samplesPerBuffer: 10000
          , sampleRate: 44100
          , channelCount: 1
        })
    }


    //// A button generates and plays a note, and draws its waveform.
  , addButton: (config) => {

        //// Create the button.
        const $button = d.createElement('button')
        $button.innerHTML = config.text
        $button.style.color = `rgb(${config.red||0},${config.green||0},${config.blue||0})`
        $out.appendChild($button)

		let zoom = 0.05;
		let buffers;

		window.addEventListener("keydown", event => {
			console.log(event);

			if(event.key == "-" && zoom > 0.05) {
				zoom -= 0.05;
				draw();
			}

			if(event.key == "=" && zoom < 1) {
				zoom += 0.05;
				draw();
			}
		});

		function draw() {
			canvasCtx.clearRect(0, 0, $canvas.width, $canvas.height);

			//// Draw the note’s waveform.
			const dot = canvasCtx.createImageData(1,1)
			dot.data[0] = config.red || 0 // red
			dot.data[1] = config.green || 0 // green
			dot.data[2] = config.blue || 0 // blue
			dot.data[3] = 255 // 100% opacity
			const channelBuffer = buffers[0].data.getChannelData(0)
			for (let x=0; x < 10000; x++) {
				canvasCtx.putImageData(
					dot
				  , (x / 10) / zoom
				  , channelBuffer[x] * -50 + 50 // y position
				)
			}
		}

        //// Deal with a click.
        $button.onclick = () => {

            //// Generate the note.
            buffers = monty1MathSeqin.getBuffers({
                bufferCount: 1
              , cyclesPerBuffer: config.cyclesPerBuffer
			  , noise: config.noise
              , isLooping: false
              , events: [
                    { at:0, down:config.velocity }
                  , { at: 900, up: 1 }
				  , { at: 5100, down: 1 }
                ]
            })

			draw();

            //// Play the note.
            const src = audioCtx.createBufferSource()
            src.buffer = buffers[0].data
            src.connect(audioCtx.destination)
            src.start(0)
        }
    }

}


}( 'object' === typeof window ? window : global )
