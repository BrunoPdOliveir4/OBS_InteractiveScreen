import { v4 as uuidv4 } from 'uuid';

export const generateTempId = (): string => {
  return uuidv4();
};

export const extractUserIdFromUrl = (referer: string | undefined): string | null => {
  if (!referer) return null;
  try {
    const url = new URL(referer);
    return url.searchParams.get('user');
  } catch {
    return null;
  }
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const sanitizeString = (str: string): string => {
  return str.replace(/[<>]/g, '');
};
