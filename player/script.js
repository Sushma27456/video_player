document.addEventListener('DOMContentLoaded', () => {
    const videoPlayer = document.getElementById('video-player');
    const videoSource = document.getElementById('video-source');
    const playBtn = document.getElementById('play-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const stopBtn = document.getElementById('stop-btn');
    const fileInput = document.getElementById('file-input');
    const customFileButton = document.getElementById('custom-file-button');
    const subtitleInput = document.getElementById('subtitle-input');
    const customSubtitleButton = document.getElementById('custom-subtitle-button');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const subtitleSelect = document.getElementById('subtitle-select');
    const subtitleDelayInput = document.getElementById('subtitle-delay');
    const body = document.body;

    let subtitleDelay = 0;

    playBtn.addEventListener('click', () => {
        videoPlayer.play();
    });

    pauseBtn.addEventListener('click', () => {
        videoPlayer.pause();
    });

    stopBtn.addEventListener('click', () => {
        videoPlayer.pause();
        videoPlayer.currentTime = 0;
    });

    customFileButton.addEventListener('click', () => {
        fileInput.click();
    });

    customSubtitleButton.addEventListener('click', () => {
        subtitleInput.click();
    });

    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const fileURL = URL.createObjectURL(file);
            videoSource.src = fileURL;
            videoSource.type = file.type;
            videoPlayer.load();
            videoPlayer.play();
        }
    });

    subtitleInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const contents = e.target.result;
                const converted = convertSrtToVtt(contents);
                const blob = new Blob([converted], { type: 'text/vtt' });
                const url = URL.createObjectURL(blob);

                const track = document.createElement('track');
                track.src = url;
                track.kind = 'subtitles';
                track.label = file.name;
                track.srclang = 'en';
                track.default = true;
                videoPlayer.appendChild(track);
                updateSubtitleOptions();
            };
            reader.readAsText(file);
        }
    });

    darkModeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
    });

    videoPlayer.addEventListener('loadedmetadata', () => {
        updateSubtitleOptions();
    });

    subtitleSelect.addEventListener('change', (event) => {
        const selectedIndex = event.target.value;
        const textTracks = videoPlayer.textTracks;
        for (let i = 0; i < textTracks.length; i++) {
            textTracks[i].mode = i == selectedIndex ? 'showing' : 'hidden';
        }
    });

    subtitleDelayInput.addEventListener('input', (event) => {
        subtitleDelay = parseInt(event.target.value, 10) || 0;
        updateSubtitleTiming();
    });

    function updateSubtitleOptions() {
        const textTracks = videoPlayer.textTracks;
        subtitleSelect.innerHTML = '<option value="none">No Subtitles</option>';
        for (let i = 0; i < textTracks.length; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = textTracks[i].label || `Track ${i + 1}`;
            subtitleSelect.appendChild(option);
        }
        adjustDropdownWidth();
    }

    function adjustDropdownWidth() {
        subtitleSelect.style.width = 'auto';
        subtitleSelect.style.width = subtitleSelect.scrollWidth + 'px';
    }

    function updateSubtitleTiming() {
        const textTracks = videoPlayer.textTracks;
        for (let i = 0; i < textTracks.length; i++) {
            const track = textTracks[i];
            for (let j = 0; j < track.cues.length; j++) {
                const cue = track.cues[j];
                cue.startTime += subtitleDelay / 1000;
                cue.endTime += subtitleDelay / 1000;
            }
        }
    }

    function convertSrtToVtt(data) {
        // Replace the SRT time format with the VTT time format
        let vttData = data.replace(/(\d{2}):(\d{2}):(\d{2}),(\d{3})/g, '$1:$2:$3.$4');
        vttData = "WEBVTT\n\n" + vttData;
        return vttData;
    }
});
