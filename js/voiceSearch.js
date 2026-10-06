/**
 * RASOI 3D — Voice Search Assistant
 * Integrates Web Speech Recognition API for hands-free kitchen recipe search
 */

class VoiceSearchEngine {
  constructor(options = {}) {
    this.searchInput = options.searchInput || document.getElementById('recipe-search-input');
    this.voiceBtn = options.voiceBtn || document.getElementById('voice-search-btn');
    this.voiceFeedback = options.voiceFeedback || document.getElementById('voice-feedback');
    this.voiceStatusText = options.voiceStatusText || document.getElementById('voice-status-text');
    this.onResult = options.onResult || null;

    this.recognition = null;
    this.isListening = false;

    this.init();
  }

  init() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      if (this.voiceBtn) {
        this.voiceBtn.title = "Voice search is not supported in this browser";
      }
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = 'hi-IN'; // Optimized for Hindi / Indian accent

    this.recognition.onstart = () => {
      this.isListening = true;
      if (this.voiceBtn) this.voiceBtn.classList.add('listening');
      if (this.voiceFeedback) this.voiceFeedback.classList.add('active');
      if (this.voiceStatusText) this.voiceStatusText.textContent = 'सुन रहे हैं... बोलिए कौन सी रेसिपी चाहिए! (e.g. Biryani, Paneer)';
      if (window.SoundEngine) window.SoundEngine.playPop();
    };

    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.trim();
      if (this.searchInput) {
        // Clean trailing punctuation
        const cleanQuery = transcript.replace(/[.,?!]/g, '');
        this.searchInput.value = cleanQuery;
        if (this.voiceStatusText) {
          this.voiceStatusText.textContent = `खोज रहे हैं: "${cleanQuery}"...`;
        }
      }

      if (window.SoundEngine) window.SoundEngine.playChime();

      if (typeof this.onResult === 'function') {
        this.onResult(transcript);
      }
    };

    this.recognition.onerror = (event) => {
      console.warn('Voice recognition error:', event.error);
      this.stop();
      if (this.voiceStatusText) {
        this.voiceStatusText.textContent = 'Awaaz samajh nahi aayi, kripya dobara try karein.';
      }
      setTimeout(() => {
        if (this.voiceFeedback) this.voiceFeedback.classList.remove('active');
      }, 2500);
    };

    this.recognition.onend = () => {
      this.stop();
    };

    if (this.voiceBtn) {
      this.voiceBtn.addEventListener('click', () => this.toggle());
    }
  }

  start() {
    if (!this.recognition) {
      if (window.showToast) {
        window.showToast('Voice Search is not supported in your browser. Please type to search.');
      }
      return;
    }
    try {
      this.recognition.start();
    } catch (e) {
      this.recognition.stop();
    }
  }

  stop() {
    this.isListening = false;
    if (this.voiceBtn) this.voiceBtn.classList.remove('listening');
    setTimeout(() => {
      if (!this.isListening && this.voiceFeedback) {
        this.voiceFeedback.classList.remove('active');
      }
    }, 1800);
  }

  toggle() {
    if (this.isListening) {
      this.recognition.stop();
      this.stop();
    } else {
      this.start();
    }
  }
}

window.VoiceSearchEngine = VoiceSearchEngine;
