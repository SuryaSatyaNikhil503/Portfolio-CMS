export interface UA { device: "mobile" | "tablet" | "desktop"; os: string; browser: string }

export function parseUA(ua: string): UA {
  const device = /iPad|Tablet/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua)) ? "tablet" : /Mobi|iPhone|iPod|Android/i.test(ua) ? "mobile" : "desktop";
  const os = /iPhone|iPad|iPod/i.test(ua) ? "iOS" : /Android/i.test(ua) ? "Android" : /Windows/i.test(ua) ? "Windows" : /CrOS/i.test(ua) ? "ChromeOS" : /Mac OS X|Macintosh/i.test(ua) ? "macOS" : /Linux|X11/i.test(ua) ? "Linux" : "Other";
  const browser = /Edg\//i.test(ua) ? "Edge" : /OPR\/|Opera/i.test(ua) ? "Opera" : /Firefox\/|FxiOS/i.test(ua) ? "Firefox" : /Chrome\/|CriOS/i.test(ua) ? "Chrome" : /Safari\//i.test(ua) ? "Safari" : "Other";
  return { device, os, browser };
}
