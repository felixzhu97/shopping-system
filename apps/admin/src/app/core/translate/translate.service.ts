import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, of } from 'rxjs';

export const TRANSLATE_LANGUAGES: { code: string; name: string }[] = [
  { code: 'es', name: 'Spanish' },
  { code: 'zh', name: 'Chinese' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
];

const MYMEMORY_BASE = 'https://api.mymemory.translated.net/get';

@Injectable({ providedIn: 'root' })
export class TranslateService {
  constructor(private readonly http: HttpClient) {}

  translate(text: string, targetLang: string): Observable<string> {
    const trimmed = text?.trim();
    if (!trimmed || !targetLang) return of(trimmed ?? '');
    const url = `${MYMEMORY_BASE}?q=${encodeURIComponent(trimmed)}&langpair=en|${encodeURIComponent(targetLang)}`;
    return this.http
      .get<{ responseData?: { translatedText?: string } }>(url)
      .pipe(map((res) => res?.responseData?.translatedText ?? trimmed));
  }
}
