Title: Voice Assistant – Implementation & QA

Browser detection
- Voice input uses `SpeechRecognition` (Chrome: `webkitSpeechRecognition`)
- Playback uses `SpeechSynthesis`; voices vary per device
- Fallback to typed input when APIs are unsupported

Controls
- Mic button starts recording; interim text appears in input
- Speaker toggles TTS; language, voice, rate, pitch configurable

Compatibility
- Chrome: voice input & TTS supported
- Edge (Chromium): similar to Chrome
- Safari: TTS supported; SpeechRecognition limited (fallback to typing)
- Firefox: SpeechRecognition not available (fallback)
- Mobile: Support varies by platform/browser; fallback applied when needed

Known limitations
- Voice list availability depends on device; `voiceschanged` event timing varies
- Accuracy influenced by ambient noise and accent

QA & metrics
- Latency measured from voice start to recognition end and sent as `voice_latency`
- Error events logged as `voice_error`
- Test with multiple accents and environments; verify rate/pitch changes

