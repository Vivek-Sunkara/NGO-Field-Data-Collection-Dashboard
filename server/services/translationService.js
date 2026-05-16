import GeminiService from './geminiService.js';
import { LEGACY_FORM_UI, LEGACY_TEXT_FIELDS, LEGACY_CHOICE_FIELDS } from '../constants/legacyFormSchema.js';

export const SUPPORTED_LANGUAGES = {
  en: 'English',
  te: 'Telugu',
  hi: 'Hindi',
};

const SKIP_FIELD_TYPES = new Set(['image', 'date', 'number']);

function parseJsonResponse(text) {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced ? fenced[1].trim() : trimmed;
  return JSON.parse(raw);
}

function getOptionDisplay(field, index) {
  if (Array.isArray(field.displayOptions) && field.displayOptions[index] != null) {
    return field.displayOptions[index];
  }
  return field.options?.[index] ?? '';
}

export class TranslationService {
  static async callGeminiJson(prompt) {
    const text = await GeminiService.callGeminiAPI(
      `${prompt}\n\nReturn ONLY valid JSON. No markdown fences or commentary.`,
      { temperature: 0.2, maxOutputTokens: 8192 }
    );
    return parseJsonResponse(text);
  }

  static async translateDynamicForm(form, targetLanguage) {
    if (!form || targetLanguage === 'en') {
      return form;
    }

    const langName = SUPPORTED_LANGUAGES[targetLanguage] || targetLanguage;
    const payload = {
      title: form.title,
      fields: form.fields.map((f) => ({
        id: f.id,
        label: f.label,
        description: f.description || '',
        placeholder: f.placeholder || '',
        options: f.options || [],
      })),
      steps: ['Form Details', 'Questions', 'Review & Submit'],
      locationLabels: {
        state: 'State',
        city: 'City / District',
        village: 'Village / Area (optional)',
        activityDate: 'Activity Date',
      },
      buttons: {
        saveDraft: 'Save Draft',
        submit: 'Submit',
        next: 'Next',
        previous: 'Previous',
        translate: 'Translate',
      },
    };

    const translated = await this.callGeminiJson(`
Translate the following form UI strings to ${langName}.
Keep the same JSON structure and field ids. Translate every string value including options arrays (same length as input).
Do not translate ids.

Input:
${JSON.stringify(payload)}
`);

    const fieldMap = new Map((translated.fields || []).map((f) => [f.id, f]));

    return {
      ...form,
      title: translated.title || form.title,
      fields: form.fields.map((field) => {
        const t = fieldMap.get(field.id);
        if (!t) return field;
        return {
          ...field,
          label: t.label || field.label,
          description: t.description ?? field.description,
          placeholder: t.placeholder ?? field.placeholder,
          displayOptions:
            Array.isArray(t.options) && field.options?.length === t.options.length
              ? t.options
              : undefined,
        };
      }),
      uiMeta: {
        steps: translated.steps,
        locationLabels: translated.locationLabels,
        buttons: translated.buttons,
      },
    };
  }

  static async translateLegacyFormUI(targetLanguage) {
    if (targetLanguage === 'en') {
      return { ...LEGACY_FORM_UI, language: 'en' };
    }

    const langName = SUPPORTED_LANGUAGES[targetLanguage] || targetLanguage;

    const translated = await this.callGeminiJson(`
Translate this legacy NGO field form UI schema to ${langName}.
Keep arrays the same length as English. Return JSON with keys:
title, steps (array of {id, title}), activityTypes, regions, beneficiaryCategories, issueOptions,
labels (object), placeholders (object), helpers (object).

English schema:
${JSON.stringify(LEGACY_FORM_UI)}
`);

    return {
      ...LEGACY_FORM_UI,
      ...translated,
      language: targetLanguage,
      // Preserve English values for submission mapping on client
      englishValues: {
        activityTypes: LEGACY_FORM_UI.activityTypes,
        regions: LEGACY_FORM_UI.regions,
        beneficiaryCategories: LEGACY_FORM_UI.beneficiaryCategories,
        issueOptions: LEGACY_FORM_UI.issueOptions,
      },
    };
  }

  static async translateDynamicResponsesToEnglish(responses, fields, sourceLanguage) {
    if (!responses || sourceLanguage === 'en' || !sourceLanguage) {
      return responses;
    }

    const fieldById = new Map(fields.map((f) => [f.id, f]));
    const toTranslate = {};

    for (const [fieldId, value] of Object.entries(responses)) {
      const field = fieldById.get(fieldId);
      if (!field || value === undefined || value === null || value === '') {
        continue;
      }
      if (SKIP_FIELD_TYPES.has(field.type)) {
        continue;
      }
      if (field.type === 'checkbox' && Array.isArray(value)) {
        toTranslate[fieldId] = { type: 'checkbox', values: value, englishOptions: field.options || [] };
      } else if (['dropdown', 'radio'].includes(field.type)) {
        toTranslate[fieldId] = { type: 'choice', value, englishOptions: field.options || [] };
      } else {
        toTranslate[fieldId] = { type: 'text', value: String(value) };
      }
    }

    if (Object.keys(toTranslate).length === 0) {
      return responses;
    }

    const langName = SUPPORTED_LANGUAGES[sourceLanguage] || sourceLanguage;

    try {
      const result = await this.callGeminiJson(`
The worker filled a form in ${langName}. Convert each answer to English for database storage.
For choice fields, map to the exact string from englishOptions (case-sensitive match to English canonical value).
For checkbox, return an array of English option strings from englishOptions.
For text fields, translate the text to English.
Return JSON: { "responses": { "fieldId": englishValue, ... } }

Fields to normalize:
${JSON.stringify(toTranslate)}
`);

      const normalized = { ...responses };
      const out = result.responses || {};
      for (const fieldId of Object.keys(toTranslate)) {
        if (out[fieldId] !== undefined && out[fieldId] !== null) {
          normalized[fieldId] = out[fieldId];
        }
      }
      return normalized;
    } catch (err) {
      console.error('[translateDynamicResponsesToEnglish]', err.message);
      return responses;
    }
  }

  static async translateLegacyPayloadToEnglish(data, sourceLanguage) {
    if (!data || sourceLanguage === 'en' || !sourceLanguage) {
      return data;
    }

    const langName = SUPPORTED_LANGUAGES[sourceLanguage] || sourceLanguage;
    const payload = {};

    for (const key of LEGACY_TEXT_FIELDS) {
      if (data[key]) payload[key] = data[key];
    }

    for (const [key, options] of Object.entries(LEGACY_CHOICE_FIELDS)) {
      if (key === 'issuesTags' && Array.isArray(data.issuesTags) && data.issuesTags.length) {
        payload.issuesTags = { values: data.issuesTags, englishOptions: options };
      } else if (data[key]) {
        payload[key] = { value: data[key], englishOptions: options };
      }
    }

    if (Object.keys(payload).length === 0) {
      return data;
    }

    const result = await this.callGeminiJson(`
Worker submitted a legacy field form in ${langName}. Convert values to English.
Use exact strings from englishOptions for choice fields.
Return JSON with the same keys, normalized to English.

Data:
${JSON.stringify(payload)}

Canonical English options reference:
${JSON.stringify(LEGACY_CHOICE_FIELDS)}
`);

    const normalized = { ...data };
    for (const key of LEGACY_TEXT_FIELDS) {
      if (result[key] != null) normalized[key] = result[key];
    }
    if (result.activityType) normalized.activityType = result.activityType;
    if (result.region) normalized.region = result.region;
    if (result.beneficiaryCategory) normalized.beneficiaryCategory = result.beneficiaryCategory;
    if (result.issuesTags) normalized.issuesTags = result.issuesTags;

    return normalized;
  }

  static async translateLocationToEnglish(location, sourceLanguage) {
    if (!location || sourceLanguage === 'en' || !sourceLanguage) {
      return location;
    }
    if (!location.village?.trim()) {
      return location;
    }

    const langName = SUPPORTED_LANGUAGES[sourceLanguage] || sourceLanguage;
    const result = await this.callGeminiJson(`
Translate only the village/area name to English. Keep state and city unchanged.
Input: ${JSON.stringify(location)}
Return JSON: { "state", "city", "village" }
Language: ${langName}
`);

    return {
      ...location,
      village: result.village ?? location.village,
    };
  }

  /** Apply displayOptions to fields for worker UI (mutates copy) */
  static applyDisplayOptionsToForm(form) {
    return form;
  }
}

export function mergeTranslatedField(field, translatedField) {
  if (!translatedField) return field;
  return {
    ...field,
    label: translatedField.label ?? field.label,
    description: translatedField.description ?? field.description,
    placeholder: translatedField.placeholder ?? field.placeholder,
    displayOptions:
      translatedField.options?.length === field.options?.length
        ? translatedField.options
        : field.displayOptions,
  };
}

export function getDisplayLabelForOption(field, option, index) {
  return getOptionDisplay(field, index) || option;
}

export default TranslationService;
