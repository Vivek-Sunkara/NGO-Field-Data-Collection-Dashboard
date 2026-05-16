import TranslationService from '../services/translationService.js';

export async function normalizeDynamicSubmission(body, formFields) {
  const sourceLanguage = body.sourceLanguage || 'en';
  let responses = body.responses || {};
  let location = body.location;

  if (sourceLanguage !== 'en') {
    try {
      responses = await TranslationService.translateDynamicResponsesToEnglish(
        responses,
        formFields,
        sourceLanguage
      );
    } catch (err) {
      console.error(
        '[normalizeDynamicSubmission] Response translation failed; storing answers as submitted',
        err.message
      );
    }

    if (location) {
      try {
        location = await TranslationService.translateLocationToEnglish(location, sourceLanguage);
      } catch (err) {
        console.error(
          '[normalizeDynamicSubmission] Location translation failed; keeping original location',
          err.message
        );
      }
    }
  }

  return { responses, location, sourceLanguage: 'en' };
}

export async function normalizeLegacySubmission(body) {
  const sourceLanguage = body.sourceLanguage || 'en';
  const { sourceLanguage: _lang, ...data } = body;

  if (sourceLanguage === 'en') {
    return data;
  }

  try {
    return await TranslationService.translateLegacyPayloadToEnglish(data, sourceLanguage);
  } catch (err) {
    console.error('[normalizeLegacySubmission] Translation to English failed; storing payload as submitted', err.message);
    return data;
  }
}
