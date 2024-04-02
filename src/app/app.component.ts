import { Component, NgZone  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AudioConfig, CancellationReason, ResultReason, SpeechSynthesizer, SpeechTranslationConfig, TranslationRecognizer, VoiceInfo } from 'microsoft-cognitiveservices-speech-sdk';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Speech Translator';
  
  speechTranslationConfig!: SpeechTranslationConfig;
  translationRecognizer! : TranslationRecognizer;
  audioConfig! : AudioConfig;
  originalText: string = '';
  speechSynthesizer!: SpeechSynthesizer;
  voices: any = [
    { code: "it-IT-ElsaNeural", name: "Italian (Italy) - Female" },
    { code: "it-IT-DiegoNeural", name: "Italian (Italy) - Male" },
    { code: "en-US-AriaNeural", name: "English (United States) - Female" },
    { code: "en-US-GuyNeural", name: "English (United States) - Male" },
    { code: "nl-NL-FennaNeural", name: "Dutch (Netherlands) - Female" },
    { code: "nl-NL-MaartenNeural", name: "Dutch (Netherlands) - Male" },
    { code: "hi-IN-SwaraNeural", name: "Hindi (India) - Female" },
    { code: "hi-IN-MadhurNeural", name: "Hindi (India) - Male" },
    { code: "es-ES-ElviraNeural", name: "Spanish (Spain) - Female" },
    { code: "es-ES-AlvaroNeural", name: "Spanish (Spain) - Male" },
    { code: "zh-CN-XiaoxiaoNeural", name: "Chinese (Mandarin, Simplified) - Female" },
    { code: "zh-CN-YunxiNeural", name: "Chinese (Mandarin, Simplified) - Male" },
    { code: "ar-AE-FatimaNeural", name: "Arabic (Saudi Arabia) - Female" },
    { code: "ar-AE-HamdanNeural", name: "Arabic (Saudi Arabia) - Male" },
    { code: "fr-FR-DeniseNeural", name: "French (France) - Female" },
    { code: "fr-FR-HenriNeural", name: "French (France) - Male" },
    { code: "ru-RU-SvetlanaNeural", name: "Russian (Russia) - Female" },
    { code: "ru-RU-DmitryNeural", name: "Russian (Russia) - Male" },
    { code: "pt-PT-RaquelNeural", name: "Portuguese (Brazil) - Female" },
    { code: "pt-PT-DuarteNeural", name: "Portuguese (Brazil) - Male" },
    { code: "bn-IN-TanishaaNeural", name: "Bengali (India) - Female" },
    { code: "bn-IN-BashkarNeural", name: "Bengali (India) - Male" },
    { code: "de-DE-KatjaNeural", name: "German (Germany) - Female" },
    { code: "de-DE-ConradNeural", name: "German (Germany) - Male" }
  ];
  targetlanguages : any = [
    { code: "it", name: "Italy" },
    { code: "en", name: "English" },
    { code: "nl", name: "Dutch" },
    { code: "hi", name: "Hindi" },
    { code: "es", name: "Spanish" },
    { code: "zh", name: "Chinese(Mandarin)" },
    { code: "ar", name: "Arabic" },
    { code: "fr", name: "French" },
    { code: "ru", name: "Russian" },
    { code: "pt", name: "Portugese" },
    { code: "bn", name: "Bengali" },
    { code: "de", name: "German" }
  ];
  speechRecognitonLanguages : any = 
  [
    { code: "it-IT", name: "Italian" },
    { code: "en-IN", name: "English" },
    { code: "nl-NL", name: "Dutch" },
    { code: "hi-IN", name: "Hindi" },
    { code: "es-ES", name: "Spanish" },
    { code: "zh-CN", name: "Chinese (Mandarin)" },
    { code: "ar-EG", name: "Arabic" },
    { code: "fr-FR", name: "French" },
    { code: "ru-RU", name: "Russian" },
    { code: "pt-PT", name: "Portuguese" },
    { code: "bn-IN", name: "Bengali" },
    { code: "de-DE", name: "German" }
  ];

  previousText : string = '';
  currentText : string = '';
  translatedText: string = '';
  currentTranslatedText: string = '';
  originalTranslatedText: string = '';
  previousTranslatedText: string = '';
  targetLanguage: string = 'select lang';
  speechRecognitionLanguage: string = "select lang";
  selectedVoice: string = 'select voice';
  isRecognitionRunning: boolean = false;

  constructor(private zone : NgZone,){}

  onTargetLanguageSelect(targetevent: any) {
    this.targetLanguage = targetevent.target.value;
  }
  onSpeakerLanguageSelect(speakerevent: any) {
    this.speechRecognitionLanguage = speakerevent.target.value;
  }

  onVoiceSelected(voiceevent : any){
    this.selectedVoice = voiceevent.target.value;
  }

  subtractStrings(fullString: string, subtractString: string): string {
    const fullWords = fullString.split(' ');
    const subtractWords = subtractString.split(' ');

    let result = '';

    for (let i = 0; i < fullWords.length; i++) {
      if (subtractWords.length > i && subtractWords[i] === fullWords[i]) {
        continue;
      }
      result += fullWords[i] + ' ';
    }
    return result.trim();
  }

  startRecognition() {
    if(this.isRecognitionRunning){
      return;
    }
    this.isRecognitionRunning = true;
    
    const subscriptionKey = "Subscription_key";
    const region = "Subscription_region";

    this.speechTranslationConfig = SpeechTranslationConfig.fromSubscription(subscriptionKey, region);
    this.speechSynthesizer = new SpeechSynthesizer(this.speechTranslationConfig);

    this.speechSynthesizer.synthesizing;
    this.audioConfig = AudioConfig.fromDefaultMicrophoneInput();
    
    this.speechTranslationConfig.speechRecognitionLanguage = this.speechRecognitionLanguage;
    this.speechTranslationConfig.voiceName = this.selectedVoice;
    this.speechTranslationConfig.addTargetLanguage(this.targetLanguage);
    
    this.translationRecognizer = new TranslationRecognizer(this.speechTranslationConfig, this.audioConfig); 

    debugger
    // Check if translationRecognizer is initialized before starting recognition
    if (this.translationRecognizer) {
      console.log("Translation recognizer is intialized successfully.");
      
      this.translationRecognizer.recognizing = (s, e) => {
        this.zone.run(() => {
          this.currentText = e.result.text;
          this.currentTranslatedText = e.result.translations.get(this.targetLanguage);
          this.originalText = this.subtractStrings(this.currentText, this.previousText);
          this.originalTranslatedText = this.subtractStrings(this.currentTranslatedText, this.previousTranslatedText);
  
          //console.log(this.originalText);
          console.log(this.originalTranslatedText);
        });
        this.previousText = e.result.text;
        this.previousTranslatedText = e.result.translations.get(this.targetLanguage);

      };  
    
      this.translationRecognizer.recognized = (s, e) => {
        this.zone.run(() => {
          if (e.result.reason == ResultReason.TranslatedSpeech) {
            //console.log("Translated into [" + targetLanguage + "]: " + e.result.translations.get(targetLanguage));
            this.originalText = e.result.text;
            console.log(this.originalText);           
            this.originalTranslatedText = e.result.translations.get(this.targetLanguage);
            console.log(this.originalTranslatedText);
            
          } else if (e.result.reason == ResultReason.NoMatch) {
            console.log("NOMATCH: Speech could not be translated.");
          }
        });
      };

      this.translationRecognizer.synthesizing = (s, e) => {
        this.zone.run(() => {
          if (e.result.reason == ResultReason.SynthesizingAudio) {
            const audioData = e.result.audio;
            console.log("Audio synthesized");
          
            if (audioData.byteLength > 0) {
              const audioBlob = new Blob([audioData], { type: 'audio/wav' });
              const audioUrl = URL.createObjectURL(audioBlob);
              const audio = new Audio(audioUrl);
              audio.play().catch(error => console.error('Error playing audio:', error));
            }
          }
        });
      };
      
     
      this.translationRecognizer.canceled = (s, e) => {
        this.zone.run(() => {
          console.log(`CANCELED: Reason=${e.reason}`);
          if (e.reason == CancellationReason.Error) {
            console.log(`"CANCELED: ErrorCode=${e.errorCode}`);
            console.log(`"CANCELED: ErrorDetails=${e.errorDetails}`);
            console.log("CANCELED: Did you set the speech resource key and region values?");
          }
          this.translationRecognizer.stopContinuousRecognitionAsync();
        });
      };
    
      this.translationRecognizer.sessionStopped = (s, e) => {
        this.zone.run(() => {
          console.log("\n    Session stopped event.");
          this.translationRecognizer.stopContinuousRecognitionAsync();
        });
      };
      console.log('Starting recognition...');
    this.translationRecognizer.startContinuousRecognitionAsync();
  
    } else {
      console.error('Translation recognizer is not properly initialized.');
    }
  }
 
  stopRecognition() {
    // Check if translationRecognizer is initialized before stopping recognition
    if (this.translationRecognizer) {
      console.log('Stopping recognition...');
      this.translationRecognizer.stopContinuousRecognitionAsync();
      this.isRecognitionRunning = false;
    } else {
      console.error('Translation recognizer is not properly initialized.');
    }
  }

}
