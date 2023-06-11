export function isValidHttpUrl(url: string): boolean {
  try {
    new URL(url);
  } catch {
    return false;  
  }
  return true;
}
