/**
 * Validation utilities for form submissions
 */

export const validateSubmission = (data) => {
  const errors = {};

  // SECTION 1: Activity Details
  if (!data.activityType || !['Training', 'Awareness Program', 'Food Distribution', 'Health Camp', 'Survey', 'Meeting'].includes(data.activityType)) {
    errors.activityType = 'Invalid activity type';
  }

  if (!data.activityTitle || data.activityTitle.trim().length === 0) {
    errors.activityTitle = 'Activity title is required';
  }

  if (!data.activityDate) {
    errors.activityDate = 'Activity date is required';
  } else {
    const activityDate = new Date(data.activityDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (activityDate < new Date('2000-01-01')) {
      errors.activityDate = 'Invalid activity date';
    }
  }

  if (!data.region || data.region.trim().length === 0) {
    errors.region = 'Region is required';
  }

  // SECTION 2: Participation Details
  const totalParticipants = parseInt(data.totalParticipants);
  if (!Number.isInteger(totalParticipants) || totalParticipants < 1) {
    errors.totalParticipants = 'Total participants must be at least 1';
  }

  const maleCount = parseInt(data.maleCount);
  if (!Number.isInteger(maleCount) || maleCount < 0) {
    errors.maleCount = 'Male count must be a non-negative number';
  }

  const femaleCount = parseInt(data.femaleCount);
  if (!Number.isInteger(femaleCount) || femaleCount < 0) {
    errors.femaleCount = 'Female count must be a non-negative number';
  }

  if (maleCount + femaleCount > totalParticipants) {
    errors.participantMismatch = 'Male + Female count cannot exceed total participants';
  }

  if (!data.beneficiaryCategory || !['Farmers', 'Students', 'Women', 'Children', 'Senior Citizens', 'General Public'].includes(data.beneficiaryCategory)) {
    errors.beneficiaryCategory = 'Invalid beneficiary category';
  }

  // SECTION 3: Issues (optional)
  if (data.issuesTags && Array.isArray(data.issuesTags)) {
    const validIssues = ['Water Shortage', 'Low Attendance', 'Rain / Weather', 'Resource Shortage', 'Transport Issues', 'Technical Issues'];
    const invalidIssues = data.issuesTags.filter(issue => !validIssues.includes(issue));
    if (invalidIssues.length > 0) {
      errors.issuesTags = `Invalid issue tags: ${invalidIssues.join(', ')}`;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateDraft = (data) => {
  const errors = {};

  // Validate only fields that are provided (partial validation for drafts)
  if (data.activityType && !['Training', 'Awareness Program', 'Food Distribution', 'Health Camp', 'Survey', 'Meeting'].includes(data.activityType)) {
    errors.activityType = 'Invalid activity type';
  }

  if (data.totalParticipants !== undefined) {
    const total = parseInt(data.totalParticipants);
    if (!Number.isInteger(total) || total < 0) {
      errors.totalParticipants = 'Total participants must be a non-negative number';
    }
  }

  if (data.maleCount !== undefined) {
    const male = parseInt(data.maleCount);
    if (!Number.isInteger(male) || male < 0) {
      errors.maleCount = 'Male count must be a non-negative number';
    }
  }

  if (data.femaleCount !== undefined) {
    const female = parseInt(data.femaleCount);
    if (!Number.isInteger(female) || female < 0) {
      errors.femaleCount = 'Female count must be a non-negative number';
    }
  }

  if (data.beneficiaryCategory && !['Farmers', 'Students', 'Women', 'Children', 'Senior Citizens', 'General Public'].includes(data.beneficiaryCategory)) {
    errors.beneficiaryCategory = 'Invalid beneficiary category';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const calculateDraftCompletion = (draft) => {
  const sections = [
    { name: 'Activity Details', fields: ['activityType', 'activityTitle', 'activityDate', 'region'] },
    { name: 'Participation', fields: ['totalParticipants', 'maleCount', 'femaleCount', 'beneficiaryCategory'] },
    { name: 'Issues', fields: [] }, // Optional section
    { name: 'Evidence', fields: ['evidenceImages'] }, // Optional section
  ];

  let completedSections = 0;

  sections.forEach((section, index) => {
    const allFieldsFilled = section.fields.every(field => draft[field] !== undefined && draft[field] !== null && draft[field] !== '');
    if (allFieldsFilled || index > 1) {
      // First 2 sections required, rest optional
      completedSections++;
    }
  });

  return Math.round((completedSections / sections.length) * 100);
};
