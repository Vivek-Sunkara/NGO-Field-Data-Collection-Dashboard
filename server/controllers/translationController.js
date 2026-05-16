import Form from '../models/Form.js';
import TranslationService, { SUPPORTED_LANGUAGES } from '../services/translationService.js';

export const getSupportedLanguages = (req, res) => {
  res.json({
    success: true,
    languages: Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => ({ code, name })),
  });
};

export const translateFormUI = async (req, res) => {
  try {
    const { formType, formId, targetLanguage } = req.body;

    if (!targetLanguage || !SUPPORTED_LANGUAGES[targetLanguage]) {
      return res.status(400).json({
        success: false,
        message: 'targetLanguage must be one of: en, te, hi',
      });
    }

    if (formType === 'legacy') {
      const ui = await TranslationService.translateLegacyFormUI(targetLanguage);
      return res.json({ success: true, formType: 'legacy', language: targetLanguage, ui });
    }

    if (formType === 'dynamic') {
      if (!formId) {
        return res.status(400).json({ success: false, message: 'formId is required for dynamic forms' });
      }

      const form = await Form.findById(formId);
      if (!form) {
        return res.status(404).json({ success: false, message: 'Form not found' });
      }

      const translated = await TranslationService.translateDynamicForm(form.toObject(), targetLanguage);
      return res.json({
        success: true,
        formType: 'dynamic',
        language: targetLanguage,
        form: translated,
      });
    }

    return res.status(400).json({
      success: false,
      message: 'formType must be "dynamic" or "legacy"',
    });
  } catch (error) {
    console.error('[Translation UI Error]', error);
    res.status(500).json({
      success: false,
      message: 'Translation failed',
      error: error.message,
    });
  }
};
