export const CATEGORY_STORAGE_KEY = 'tender_categories';
export const CATEGORY_UPDATED_EVENT = 'tender-categories-updated';

export const normalizeCategory = (value = '') => {
  return value
    .toString()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\s*\/\s*/g, '/')
    .replace(/\s*,\s*/g, ',');
};

export const getCategoryOptions = (categories = []) => {
  const normalizedCategories = categories
    .map((category) => normalizeCategory(category))
    .filter(Boolean);

  return [...new Set(normalizedCategories)].sort((a, b) => a.localeCompare(b));
};

export const mergeCategories = (existingCategories = [], incomingCategories = []) => {
  return getCategoryOptions([...existingCategories, ...incomingCategories]);
};

export const loadStoredCategories = () => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const storedValue = window.localStorage.getItem(CATEGORY_STORAGE_KEY);
    if (!storedValue) {
      return [];
    }

    const parsedValue = JSON.parse(storedValue);
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch (error) {
    console.error('Unable to load saved categories:', error);
    return [];
  }
};

export const persistCategories = (categories = []) => {
  const nextCategories = getCategoryOptions(categories);

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(nextCategories));
    window.dispatchEvent(new CustomEvent(CATEGORY_UPDATED_EVENT, { detail: nextCategories }));
  }

  return nextCategories;
};
