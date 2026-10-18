/**
 * ElevenLabs AI Voice Studio
 * Pure HTML5, CSS3, & Vanilla JavaScript (ES6+)
 */

// Preset Prompts
const PRESET_PROMPTS = {
  story: `In the quiet heart of the ancient forest, beneath trees older than memory, a gentle whisper stirred the leaves. It wasn't the wind. It was something waiting to be found.`,
  cinematic: `In a world teetering on the edge of tomorrow, one choice will alter destiny forever. Prepare for an unforgettable journey beyond the stars.`,
  tech: `Introducing the next frontier in artificial intelligence. Designed with precision, crafted for human connection, and powered by real-time neural synthesis.`,
  multilingual: `Hello and welcome! Bonjour et bienvenue! Hola y bienvenidos! Guten Tag und herzlich willkommen! ElevenLabs brings voices to life across every language.`
};

// Curated default models if offline / fallback
const DEFAULT_MODELS = [
  { id: 'eleven_multilingual_v2', name: 'Eleven Multilingual v2', desc: 'State of the Art • 29 Languages • High emotional range' },
  { id: 'eleven_turbo_v2_5', name: 'Eleven Turbo v2.5', desc: 'Ultra-low latency • 32 Languages • Developer favorite' },
  { id: 'eleven_flash_v2_5', name: 'Eleven Flash v2.5', desc: 'Ultra-fast inference • 32 Languages • Ideal for conversations' },
  { id: 'eleven_turbo_v2', name: 'Eleven Turbo v2', desc: 'English High Speed • Optimized prosody' },
  { id: 'eleven_monolingual_v1', name: 'Eleven Monolingual v1', desc: 'Classic English v1' }
];

// Curated default voices if offline / fallback
const DEFAULT_VOICES = [
  { voice_id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', labels: { accent: 'american', gender: 'female', descriptive: 'calm' }, preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/21m00Tcm4TlvDq8ikWAM/df6788f9-1ec9-4702-b258-011e40ebba79.mp3' },
  { voice_id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', labels: { accent: 'american', gender: 'male', descriptive: 'deep, firm' }, preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/pNInz6obpgDQGcFmaJgB/d6905d7a-dd26-4187-bfff-1bd3a5ea7cac.mp3' },
  { voice_id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', labels: { accent: 'american', gender: 'male', descriptive: 'narration' }, preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/ErXwobaYiN019PkySvjV/38d8f8f0-0b62-49cf-81ff-a32414704047.mp3' },
  { voice_id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', labels: { accent: 'american', gender: 'female', descriptive: 'soft, pleasant' }, preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/EXAVITQu4vr4xnSDxMaL/09893902-6028-48b4-8451-aa3da30a66ab.mp3' },
  { voice_id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', labels: { accent: 'american', gender: 'male', descriptive: 'casual, deep' }, preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/TxGEqnHWrfWFTfGW9XjX/3a23253b-5e6c-48c8-9a84-0ff4b7e8d641.mp3' },
  { voice_id: 'yoZ06aMxZJJ28mfd3POQ', name: 'Sam', labels: { accent: 'american', gender: 'male', descriptive: 'dynamic' }, preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/yoZ06aMxZJJ28mfd3POQ/b1029c62-8e1d-4009-8472-ee652750e82c.mp3' },
  { voice_id: 'piTKgcLEGmPE4e6mEKli', name: 'Nicole', labels: { accent: 'american', gender: 'female', descriptive: 'audiobook, smooth' }, preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/piTKgcLEGmPE4e6mEKli/a42b1029-4d6d-495d-b8d2-45e38600c05d.mp3' }
];

const DEFAULT_KEY = 'sk_0e234f41715c900e35761d6fadf2c782d71e0601ccf387ae';

class ElevenStudioApp {
  constructor() {
    this.apiKey = localStorage.getItem('elevenlabs_api_key') || DEFAULT_KEY;
    this.voices = [];
    this.models = [];
    this.history = JSON.parse(localStorage.getItem('elevenlabs_history') || '[]');
    this.currentAudioUrl = null;
    this.isGenerating = false;
    this.previewAudio = new Audio();
    this.isPreviewPlaying = false;

    // Web Audio Visualizer components
    this.audioCtx = null;
    this.analyser = null;
    this.audioSourceNode = null;
    this.isAudioSourceConnected = false;
    this.animationFrameId = null;

    this.cacheDom();
    this.bindEvents();
    this.initVisualizer();
    this.initApp();
  }

  cacheDom() {
    // Header & API
    this.accountChip = document.getElementById('accountChip');
    this.apiStatusDot = document.getElementById('apiStatusDot');
    this.accountName = document.getElementById('accountName');
    this.quotaPill = document.getElementById('quotaPill');
    this.btnSettingsToggle = document.getElementById('btnSettingsToggle');
    this.apiSettingsDrawer = document.getElementById('apiSettingsDrawer');
    this.btnCloseSettings = document.getElementById('btnCloseSettings');
    this.apiKeyInput = document.getElementById('apiKeyInput');
    this.btnToggleKeyVisibility = document.getElementById('btnToggleKeyVisibility');
    this.btnSaveKey = document.getElementById('btnSaveKey');
    this.btnResetDefaultKey = document.getElementById('btnResetDefaultKey');
    this.apiStatusMessage = document.getElementById('apiStatusMessage');

    // Selectors
    this.modelSelect = document.getElementById('modelSelect');
    this.modelDescription = document.getElementById('modelDescription');
    this.voiceSelect = document.getElementById('voiceSelect');
    this.voiceDescription = document.getElementById('voiceDescription');
    this.btnPreviewVoice = document.getElementById('btnPreviewVoice');

    // Text & Samples
    this.textInput = document.getElementById('textInput');
    this.charCount = document.getElementById('charCount');
    this.charCounter = document.getElementById('charCounter');
    this.btnClearText = document.getElementById('btnClearText');
    this.sampleButtons = document.querySelectorAll('.sample-tag[data-sample]');

    // Accordion & Sliders
    this.accordionItem = document.getElementById('voiceSettingsAccordion');
    this.btnToggleSettings = document.getElementById('btnToggleSettings');
    this.stabilitySlider = document.getElementById('stabilitySlider');
    this.claritySlider = document.getElementById('claritySlider');
    this.styleSlider = document.getElementById('styleSlider');
    this.speakerBoostToggle = document.getElementById('speakerBoostToggle');
    this.valStability = document.getElementById('valStability');
    this.valClarity = document.getElementById('valClarity');
    this.valStyle = document.getElementById('valStyle');

    // Narration Controls
    this.btnPlayNarration = document.getElementById('btnPlayNarration');
    this.btnPlayText = document.getElementById('btnPlayText');
    this.iconPlay = document.querySelector('.icon-play');
    this.iconPause = document.querySelector('.icon-pause');
    this.narrationSpinner = document.getElementById('narrationSpinner');
    this.btnStopNarration = document.getElementById('btnStopNarration');

    // Visualizer Canvas
    this.visualizerWrapper = document.getElementById('visualizerWrapper');
    this.waveformCanvas = document.getElementById('waveformCanvas');
    this.visualizerStatus = document.getElementById('visualizerStatus');

    // Audio Element & Player Controls
    this.audioElement = document.getElementById('audioElement');
    this.btnMiniPlay = document.getElementById('btnMiniPlay');
    this.miniPlayIcon = document.getElementById('miniPlayIcon');
    this.currentTimeLabel = document.getElementById('currentTime');
    this.totalDurationLabel = document.getElementById('totalDuration');
    this.progressFill = document.getElementById('progressFill');
    this.progressBuffered = document.getElementById('progressBuffered');
    this.progressSeek = document.getElementById('progressSeek');
    this.playbackSpeedSelect = document.getElementById('playbackSpeedSelect');
    this.btnMute = document.getElementById('btnMute');
    this.volumeSlider = document.getElementById('volumeSlider');
    this.btnDownloadAudio = document.getElementById('btnDownloadAudio');

    // History
    this.historyList = document.getElementById('historyList');
    this.historyEmpty = document.getElementById('historyEmpty');
    this.btnClearHistory = document.getElementById('btnClearHistory');
    this.toastContainer = document.getElementById('toastContainer');
  }

  bindEvents() {
    // API Drawer toggles
    this.btnSettingsToggle.addEventListener('click', () => this.toggleSettingsDrawer());
    this.accountChip.addEventListener('click', () => this.toggleSettingsDrawer());
    this.btnCloseSettings.addEventListener('click', () => this.closeSettingsDrawer());
    this.btnToggleKeyVisibility.addEventListener('click', () => this.toggleKeyVisibility());
    this.btnSaveKey.addEventListener('click', () => this.handleSaveApiKey());
    this.btnResetDefaultKey.addEventListener('click', () => this.handleResetDefaultKey());

    // Presets & Text input
    this.sampleButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const key = e.target.getAttribute('data-sample');
        if (PRESET_PROMPTS[key]) {
          this.textInput.value = PRESET_PROMPTS[key];
          this.updateCharCount();
          this.showToast(`Loaded ${key} sample`, 'info');
        }
      });
    });

    this.btnClearText.addEventListener('click', () => {
      this.textInput.value = '';
      this.textInput.focus();
      this.updateCharCount();
    });

    this.textInput.addEventListener('input', () => this.updateCharCount());

    // Selectors
    this.modelSelect.addEventListener('change', () => this.onModelChanged());
    this.voiceSelect.addEventListener('change', () => this.onVoiceChanged());
    this.btnPreviewVoice.addEventListener('click', () => this.toggleVoicePreview());

    // Sliders
    this.stabilitySlider.addEventListener('input', (e) => this.valStability.textContent = parseFloat(e.target.value).toFixed(2));
    this.claritySlider.addEventListener('input', (e) => this.valClarity.textContent = parseFloat(e.target.value).toFixed(2));
    this.styleSlider.addEventListener('input', (e) => this.valStyle.textContent = parseFloat(e.target.value).toFixed(2));

    // Accordion
    this.btnToggleSettings.addEventListener('click', () => {
      const isOpen = this.accordionItem.classList.toggle('open');
      this.btnToggleSettings.setAttribute('aria-expanded', isOpen);
    });

    // Primary Play Button
    this.btnPlayNarration.addEventListener('click', () => this.handlePrimaryPlayClick());
    this.btnStopNarration.addEventListener('click', () => this.stopAudio());

    // Audio Player Bar
    this.btnMiniPlay.addEventListener('click', () => this.toggleAudioPlayback());
    this.audioElement.addEventListener('play', () => this.onAudioPlay());
    this.audioElement.addEventListener('pause', () => this.onAudioPause());
    this.audioElement.addEventListener('ended', () => this.onAudioEnded());
    this.audioElement.addEventListener('timeupdate', () => this.onAudioTimeUpdate());
    this.audioElement.addEventListener('loadedmetadata', () => this.onAudioMetadataLoaded());
    this.audioElement.addEventListener('progress', () => this.onAudioProgress());

    this.progressSeek.addEventListener('input', (e) => {
      if (this.audioElement.duration) {
        const seekTime = (e.target.value / 100) * this.audioElement.duration;
        this.audioElement.currentTime = seekTime;
        this.progressFill.style.width = `${e.target.value}%`;
      }
    });

    this.playbackSpeedSelect.addEventListener('change', (e) => {
      this.audioElement.playbackRate = parseFloat(e.target.value);
    });

    this.volumeSlider.addEventListener('input', (e) => {
      this.audioElement.volume = parseFloat(e.target.value);
      this.updateVolumeIcon();
    });

    this.btnMute.addEventListener('click', () => {
      this.audioElement.muted = !this.audioElement.muted;
      this.updateVolumeIcon();
    });

    // History
    this.btnClearHistory.addEventListener('click', () => this.clearHistory());

    // Preview audio events
    this.previewAudio.addEventListener('ended', () => {
      this.isPreviewPlaying = false;
      this.btnPreviewVoice.classList.remove('playing');
      this.btnPreviewVoice.querySelector('span').textContent = 'Preview';
    });
  }

  async initApp() {
    this.apiKeyInput.value = this.apiKey;
    this.updateCharCount();
    this.renderHistory();

    // Verify key and fetch account info, models, voices
    await this.refreshAccountAndData();
  }

  async refreshAccountAndData() {
    this.setApiStatus('checking', 'Verifying API connection...');
    try {
      const userRes = await fetch('https://api.elevenlabs.io/v1/user', {
        headers: { 'xi-api-key': this.apiKey }
      });

      if (!userRes.ok) {
        throw new Error(`Invalid API key (Status: ${userRes.status})`);
      }

      const userData = await userRes.json();
      const userName = userData.first_name || 'ElevenLabs User';
      const tier = userData.subscription ? userData.subscription.tier : 'Free';
      const charCount = userData.subscription ? userData.subscription.character_count : 0;
      const charLimit = userData.subscription ? userData.subscription.character_limit : 10000;

      this.accountName.textContent = `${userName} (${tier})`;
      this.quotaPill.textContent = `${(charLimit - charCount).toLocaleString()} chars left`;
      this.setApiStatus('connected', `Connected as ${userName} (${(charLimit - charCount).toLocaleString()} chars remaining)`);

      // Fetch dynamic models and voices
      await Promise.all([
        this.loadModels(),
        this.loadVoices()
      ]);

    } catch (err) {
      console.warn('API Error or Offline:', err);
      this.accountName.textContent = 'API Key Issue';
      this.quotaPill.textContent = 'Check Key';
      this.setApiStatus('error', err.message || 'Failed to authenticate');
      // Load fallback voices and models
      this.populateModels(DEFAULT_MODELS);
      this.populateVoices(DEFAULT_VOICES);
    }
  }

  async loadModels() {
    try {
      const res = await fetch('https://api.elevenlabs.io/v1/models', {
        headers: { 'xi-api-key': this.apiKey }
      });
      if (res.ok) {
        const data = await res.json();
        // Filter to text to speech capable models
        const ttsModels = data.filter(m => m.can_do_text_to_speech);
        if (ttsModels.length > 0) {
          this.models = ttsModels;
          this.populateModels(ttsModels);
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to load remote models, using defaults', e);
    }
    this.populateModels(DEFAULT_MODELS);
  }

  populateModels(modelsList) {
    this.modelSelect.innerHTML = '';
    modelsList.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.model_id || m.id;
      const descSnippet = m.description ? ` (${m.description.slice(0, 50)}...)` : '';
      opt.textContent = `${m.name || m.model_id}${descSnippet}`;
      if (opt.value === 'eleven_multilingual_v2') opt.selected = true;
      this.modelSelect.appendChild(opt);
    });
    this.onModelChanged();
  }

  async loadVoices() {
    try {
      const res = await fetch('https://api.elevenlabs.io/v1/voices', {
        headers: { 'xi-api-key': this.apiKey }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.voices && data.voices.length > 0) {
          this.voices = data.voices;
          this.populateVoices(data.voices);
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to load remote voices, using defaults', e);
    }
    this.populateVoices(DEFAULT_VOICES);
  }

  populateVoices(voiceList) {
    this.voices = voiceList;
    this.voiceSelect.innerHTML = '';

    // Group by category (Premade vs Cloned / Generated)
    const premadeGroup = document.createElement('optgroup');
    premadeGroup.label = 'Premade Professional Voices';

    const customGroup = document.createElement('optgroup');
    customGroup.label = 'Custom / Cloned Voices';

    voiceList.forEach(v => {
      const opt = document.createElement('option');
      opt.value = v.voice_id;

      let labelText = v.name;
      const details = [];
      if (v.labels) {
        if (v.labels.accent) details.push(v.labels.accent);
        if (v.labels.gender) details.push(v.labels.gender);
        if (v.labels.descriptive) details.push(v.labels.descriptive);
      }
      if (details.length > 0) {
        labelText += ` (${details.slice(0, 2).join(', ')})`;
      }
      opt.textContent = labelText;

      if (v.category === 'premade') {
        premadeGroup.appendChild(opt);
      } else {
        customGroup.appendChild(opt);
      }
    });

    if (premadeGroup.children.length > 0) this.voiceSelect.appendChild(premadeGroup);
    if (customGroup.children.length > 0) this.voiceSelect.appendChild(customGroup);

    // Default to Rachel if exists
    const rachel = voiceList.find(v => v.name.toLowerCase().includes('rachel'));
    if (rachel) {
      this.voiceSelect.value = rachel.voice_id;
    }

    this.onVoiceChanged();
  }

  onModelChanged() {
    const selectedId = this.modelSelect.value;
    const model = (this.models.length ? this.models : DEFAULT_MODELS).find(m => (m.model_id || m.id) === selectedId);
    if (model && model.description) {
      this.modelDescription.textContent = model.description;
    } else {
      this.modelDescription.textContent = 'Neural TTS narration model';
    }

    // Style slider is best suited for Multilingual v2
    if (selectedId === 'eleven_multilingual_v2') {
      this.styleSlider.disabled = false;
      this.styleSlider.parentElement.style.opacity = '1';
    } else {
      this.styleSlider.disabled = true;
      this.styleSlider.parentElement.style.opacity = '0.5';
    }
  }

  onVoiceChanged() {
    const voiceId = this.voiceSelect.value;
    const voice = this.voices.find(v => v.voice_id === voiceId);
    if (voice) {
      const labels = voice.labels ? Object.values(voice.labels).join(' • ') : 'Standard voice';
      this.voiceDescription.textContent = voice.description ? voice.description : labels;

      // Enable/disable preview button
      if (voice.preview_url) {
        this.btnPreviewVoice.style.display = 'inline-flex';
      } else {
        this.btnPreviewVoice.style.display = 'none';
      }
    }
  }

  toggleVoicePreview() {
    const voiceId = this.voiceSelect.value;
    const voice = this.voices.find(v => v.voice_id === voiceId);

    if (!voice || !voice.preview_url) {
      this.showToast('No audio sample available for this voice', 'info');
      return;
    }

    if (this.isPreviewPlaying) {
      this.previewAudio.pause();
      this.isPreviewPlaying = false;
      this.btnPreviewVoice.classList.remove('playing');
      this.btnPreviewVoice.querySelector('span').textContent = 'Preview';
    } else {
      this.previewAudio.src = voice.preview_url;
      this.previewAudio.play().then(() => {
        this.isPreviewPlaying = true;
        this.btnPreviewVoice.classList.add('playing');
        this.btnPreviewVoice.querySelector('span').textContent = 'Playing';
      }).catch(err => {
        console.error('Preview error:', err);
        this.showToast('Could not play voice preview', 'error');
      });
    }
  }

  updateCharCount() {
    const count = this.textInput.value.length;
    this.charCount.textContent = count.toLocaleString();

    if (count > 2500) {
      this.charCounter.className = 'char-counter danger';
    } else if (count > 1000) {
      this.charCounter.className = 'char-counter warning';
    } else {
      this.charCounter.className = 'char-counter';
    }
  }

  // ===================================================================
  // Narration Generation & Playback
  // ===================================================================

  async handlePrimaryPlayClick() {
    // If audio is already loaded and just paused, clicking play resumes playback
    if (this.currentAudioUrl && this.audioElement.paused && !this.isGenerating && this.hasTextNotChanged()) {
      this.audioElement.play();
      return;
    }

    // If currently playing, pause it
    if (this.currentAudioUrl && !this.audioElement.paused) {
      this.audioElement.pause();
      return;
    }

    // Otherwise, generate new narration
    await this.generateNarration();
  }

  hasTextNotChanged() {
    return this.lastGeneratedText === this.textInput.value.trim();
  }

  async generateNarration() {
    const text = this.textInput.value.trim();
    if (!text) {
      this.showToast('Please enter or paste text to narrate', 'error');
      this.textInput.focus();
      return;
    }

    if (this.isGenerating) return;

    const voiceId = this.voiceSelect.value;
    const modelId = this.modelSelect.value;
    const stability = parseFloat(this.stabilitySlider.value);
    const similarityBoost = parseFloat(this.claritySlider.value);
    const style = parseFloat(this.styleSlider.value);
    const useSpeakerBoost = this.speakerBoostToggle.checked;

    this.setGeneratingState(true);
    this.visualizerStatus.textContent = 'Synthesizing voice with ElevenLabs...';
    this.visualizerWrapper.classList.add('active');

    try {
      // Direct POST to ElevenLabs TTS endpoint
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?optimize_streaming_latency=1`, {
        method: 'POST',
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg'
        },
        body: JSON.stringify({
          text: text,
          model_id: modelId,
          voice_settings: {
            stability: stability,
            similarity_boost: similarityBoost,
            style: style,
            use_speaker_boost: useSpeakerBoost
          }
        })
      });

      if (!response.ok) {
        let errMessage = `Error ${response.status}`;
        try {
          const errJson = await response.json();
          if (errJson.detail) {
            errMessage = typeof errJson.detail === 'string' ? errJson.detail : (errJson.detail.message || JSON.stringify(errJson.detail));
          }
        } catch (e) {
          // fallback text
        }
        throw new Error(errMessage);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      this.currentAudioUrl = audioUrl;
      this.lastGeneratedText = text;
      this.audioElement.src = audioUrl;

      // Update download button
      const voiceName = this.voiceSelect.options[this.voiceSelect.selectedIndex].text.split('(')[0].trim();
      const fileName = `ElevenLabs_${voiceName}_${Date.now()}.mp3`;
      this.btnDownloadAudio.href = audioUrl;
      this.btnDownloadAudio.download = fileName;
      this.btnDownloadAudio.classList.remove('disabled');

      // Initialize Web Audio Context on user action
      this.ensureAudioContextConnected();

      // Start Playback
      await this.audioElement.play();

      this.showToast('Narration generated successfully!', 'success');
      this.btnStopNarration.disabled = false;

      // Add to history
      this.addToHistory({
        id: Date.now(),
        text: text,
        voiceName: voiceName,
        modelId: modelId,
        audioBlobUrl: audioUrl,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });

      // Refresh account quota in background
      this.refreshAccountAndData();

    } catch (err) {
      console.error('Narration Generation Error:', err);
      this.showToast(`Generation failed: ${err.message}`, 'error');
      this.visualizerStatus.textContent = 'Generation failed. Check API key.';
      this.visualizerWrapper.classList.remove('active');
    } finally {
      this.setGeneratingState(false);
    }
  }

  setGeneratingState(generating) {
    this.isGenerating = generating;
    if (generating) {
      this.btnPlayNarration.classList.add('is-generating');
      this.iconPlay.style.display = 'none';
      this.iconPause.style.display = 'none';
      this.narrationSpinner.style.display = 'inline-block';
      this.btnPlayText.textContent = 'Synthesizing Audio...';
      this.btnPlayNarration.disabled = true;
    } else {
      this.btnPlayNarration.classList.remove('is-generating');
      this.narrationSpinner.style.display = 'none';
      this.btnPlayNarration.disabled = false;
      this.updatePlayButtonState();
    }
  }

  updatePlayButtonState() {
    if (this.isGenerating) return;

    if (!this.audioElement.paused && !this.audioElement.ended && this.audioElement.currentTime > 0) {
      this.iconPlay.style.display = 'none';
      this.iconPause.style.display = 'block';
      this.btnPlayText.textContent = 'Pause Narration';
      this.miniPlayIcon.innerHTML = '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>';
      this.btnStopNarration.disabled = false;
    } else {
      this.iconPlay.style.display = 'block';
      this.iconPause.style.display = 'none';
      this.btnPlayText.textContent = this.currentAudioUrl ? 'Resume / Play Narration' : 'Generate & Play Narration';
      this.miniPlayIcon.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"/>';
    }
  }

  toggleAudioPlayback() {
    if (!this.currentAudioUrl) {
      this.generateNarration();
      return;
    }
    if (this.audioElement.paused) {
      this.audioElement.play();
    } else {
      this.audioElement.pause();
    }
  }

  stopAudio() {
    this.audioElement.pause();
    this.audioElement.currentTime = 0;
    this.btnStopNarration.disabled = true;
    this.updatePlayButtonState();
    this.visualizerStatus.textContent = 'Playback stopped';
    this.visualizerWrapper.classList.remove('active');
  }

  onAudioPlay() {
    this.updatePlayButtonState();
    this.visualizerWrapper.classList.add('active');
    this.visualizerStatus.textContent = 'Playing narration';
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  onAudioPause() {
    this.updatePlayButtonState();
    this.visualizerStatus.textContent = 'Paused';
  }

  onAudioEnded() {
    this.updatePlayButtonState();
    this.btnStopNarration.disabled = true;
    this.visualizerWrapper.classList.remove('active');
    this.visualizerStatus.textContent = 'Finished playing';
    this.progressFill.style.width = '0%';
    this.progressSeek.value = 0;
  }

  onAudioTimeUpdate() {
    const cur = this.audioElement.currentTime;
    const dur = this.audioElement.duration || 0;
    this.currentTimeLabel.textContent = this.formatTime(cur);

    if (dur > 0) {
      const pct = (cur / dur) * 100;
      this.progressFill.style.width = `${pct}%`;
      this.progressSeek.value = pct;
    }
  }

  onAudioMetadataLoaded() {
    this.totalDurationLabel.textContent = this.formatTime(this.audioElement.duration || 0);
  }

  onAudioProgress() {
    if (this.audioElement.buffered.length > 0 && this.audioElement.duration) {
      const bufferedEnd = this.audioElement.buffered.end(this.audioElement.buffered.length - 1);
      const pct = (bufferedEnd / this.audioElement.duration) * 100;
      this.progressBuffered.style.width = `${pct}%`;
    }
  }

  updateVolumeIcon() {
    const vol = this.audioElement.volume;
    const muted = this.audioElement.muted;
    const volumeIcon = document.getElementById('volumeIcon');

    if (muted || vol === 0) {
      volumeIcon.innerHTML = '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>';
    } else if (vol < 0.5) {
      volumeIcon.innerHTML = '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>';
    } else {
      volumeIcon.innerHTML = '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>';
    }
  }

  formatTime(secs) {
    if (isNaN(secs)) return '00:00';
    const mins = Math.floor(secs / 60);
    const remSecs = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, '0')}:${remSecs.toString().padStart(2, '0')}`;
  }

  // ===================================================================
  // Dynamic Web Audio Waveform Visualizer
  // ===================================================================

  ensureAudioContextConnected() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!this.audioCtx) {
        this.audioCtx = new AudioContext();
        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.fftSize = 128;
      }
      if (!this.isAudioSourceConnected) {
        this.audioSourceNode = this.audioCtx.createMediaElementSource(this.audioElement);
        this.audioSourceNode.connect(this.analyser);
        this.analyser.connect(this.audioCtx.destination);
        this.isAudioSourceConnected = true;
      }
    } catch (e) {
      console.warn('Web Audio initialisation note:', e);
    }
  }

  initVisualizer() {
    const canvas = this.waveformCanvas;
    const ctx = canvas.getContext('2d');

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement.clientWidth * window.devicePixelRatio;
      canvas.height = canvas.parentElement.clientHeight * window.devicePixelRatio;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    let idlePhase = 0;

    const render = () => {
      this.animationFrameId = requestAnimationFrame(render);
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const isPlaying = !this.audioElement.paused && !this.audioElement.ended && this.audioElement.currentTime > 0;

      if (isPlaying && this.analyser) {
        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        this.analyser.getByteFrequencyData(dataArray);

        const barCount = 48;
        const barWidth = (width / barCount) * 0.65;
        const gap = (width / barCount) * 0.35;
        let x = gap / 2;

        const gradient = ctx.createLinearGradient(0, height, 0, 0);
        gradient.addColorStop(0, '#6366f1');
        gradient.addColorStop(0.5, '#8b5cf6');
        gradient.addColorStop(1, '#ec4899');

        for (let i = 0; i < barCount; i++) {
          const dataIndex = Math.floor((i / barCount) * bufferLength);
          const value = dataArray[dataIndex] || 0;
          const barHeight = Math.max(4, (value / 255) * (height * 0.85));

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.roundRect(x, (height - barHeight) / 2, barWidth, barHeight, 4);
          ctx.fill();

          x += barWidth + gap;
        }
      } else {
        // Idle ambient subtle waveform animation
        idlePhase += 0.04;
        const barCount = 48;
        const barWidth = (width / barCount) * 0.65;
        const gap = (width / barCount) * 0.35;
        let x = gap / 2;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        for (let i = 0; i < barCount; i++) {
          const wave = Math.sin(idlePhase + (i * 0.25)) * 0.5 + 0.5;
          const barHeight = 4 + wave * 10;

          ctx.beginPath();
          ctx.roundRect(x, (height - barHeight) / 2, barWidth, barHeight, 3);
          ctx.fill();

          x += barWidth + gap;
        }
      }
    };

    render();
  }

  // ===================================================================
  // History Log Management
  // ===================================================================

  addToHistory(item) {
    this.history.unshift(item);
    if (this.history.length > 20) this.history.pop();
    this.saveHistory();
    this.renderHistory();
  }

  saveHistory() {
    // Only store serializable info
    const serializable = this.history.map(h => ({
      id: h.id,
      text: h.text,
      voiceName: h.voiceName,
      modelId: h.modelId,
      timestamp: h.timestamp
    }));
    localStorage.setItem('elevenlabs_history', JSON.stringify(serializable));
  }

  renderHistory() {
    this.historyList.innerHTML = '';
    if (this.history.length === 0) {
      this.historyList.appendChild(this.historyEmpty);
      this.historyEmpty.style.display = 'block';
      return;
    }
    this.historyEmpty.style.display = 'none';

    this.history.forEach(item => {
      const el = document.createElement('div');
      el.className = 'history-item';
      el.innerHTML = `
        <div class="history-info">
          <div class="history-text" title="${this.escapeHtml(item.text)}">${this.escapeHtml(item.text)}</div>
          <div class="history-meta">
            <span class="history-meta-pill">${this.escapeHtml(item.voiceName)}</span>
            <span>${this.escapeHtml(item.modelId.replace('eleven_', ''))}</span>
            <span>• ${item.timestamp}</span>
          </div>
        </div>
        <div class="history-actions">
          <button class="history-btn btn-reuse" title="Load text into editor" data-id="${item.id}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
            </svg>
          </button>
        </div>
      `;

      el.querySelector('.btn-reuse').addEventListener('click', () => {
        this.textInput.value = item.text;
        this.updateCharCount();
        this.textInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        this.showToast('Prompt loaded from history', 'info');
      });

      this.historyList.appendChild(el);
    });
  }

  clearHistory() {
    this.history = [];
    localStorage.removeItem('elevenlabs_history');
    this.renderHistory();
    this.showToast('History cleared', 'info');
  }

  // ===================================================================
  // Settings & API Drawer
  // ===================================================================

  toggleSettingsDrawer() {
    const isOpen = this.apiSettingsDrawer.classList.toggle('open');
    this.apiSettingsDrawer.setAttribute('aria-hidden', !isOpen);
  }

  closeSettingsDrawer() {
    this.apiSettingsDrawer.classList.remove('open');
    this.apiSettingsDrawer.setAttribute('aria-hidden', 'true');
  }

  toggleKeyVisibility() {
    const isPass = this.apiKeyInput.type === 'password';
    this.apiKeyInput.type = isPass ? 'text' : 'password';
    document.getElementById('eyeIcon').innerHTML = isPass 
      ? '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>'
      : '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
  }

  async handleSaveApiKey() {
    const key = this.apiKeyInput.value.trim();
    if (!key) {
      this.showToast('Please enter an API Key', 'error');
      return;
    }
    this.apiKey = key;
    localStorage.setItem('elevenlabs_api_key', key);
    this.showToast('API Key saved. Reconnecting...', 'info');
    await this.refreshAccountAndData();
    if (this.apiStatusDot.classList.contains('dot-connected')) {
      setTimeout(() => this.closeSettingsDrawer(), 1000);
    }
  }

  async handleResetDefaultKey() {
    this.apiKey = DEFAULT_KEY;
    this.apiKeyInput.value = DEFAULT_KEY;
    localStorage.setItem('elevenlabs_api_key', DEFAULT_KEY);
    this.showToast('Reset to provided API Key', 'info');
    await this.refreshAccountAndData();
  }

  setApiStatus(type, msg) {
    this.apiStatusDot.className = 'status-dot';
    this.apiStatusMessage.className = 'api-status-msg';

    if (type === 'connected') {
      this.apiStatusDot.classList.add('dot-connected');
      this.apiStatusMessage.classList.add('success');
      this.apiStatusMessage.textContent = `✓ ${msg}`;
    } else if (type === 'error') {
      this.apiStatusDot.classList.add('dot-error');
      this.apiStatusMessage.classList.add('error');
      this.apiStatusMessage.textContent = `✗ ${msg}`;
    } else {
      this.apiStatusDot.classList.add('dot-idle');
      this.apiStatusMessage.classList.add('loading');
      this.apiStatusMessage.textContent = `● ${msg}`;
    }
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✓';
    if (type === 'error') icon = '✕';

    toast.innerHTML = `<span>${icon}</span><span>${this.escapeHtml(message)}</span>`;
    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-out');
      setTimeout(() => toast.remove(), 300);
    }, 3800);
  }

  escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

// Instantiate on DOM load
document.addEventListener('DOMContentLoaded', () => {
  window.app = new ElevenStudioApp();
});
