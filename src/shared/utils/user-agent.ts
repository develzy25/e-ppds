export interface UserAgentMetadata {
  browser: string;
  os: string;
  device: 'Desktop' | 'Mobile' | 'Tablet';
}

export function parseUserAgent(userAgentStr: string | null): UserAgentMetadata {
  let browser = 'Unknown Browser';
  let os = 'Unknown OS';
  let device: 'Desktop' | 'Mobile' | 'Tablet' = 'Desktop';

  if (!userAgentStr) {
    return { browser, os, device };
  }

  const ua = userAgentStr.toLowerCase();

  // Parse Browser
  if (ua.includes('firefox') && !ua.includes('seamonkey')) {
    browser = 'Firefox';
  } else if (ua.includes('chrome') && !ua.includes('chromium')) {
    browser = 'Chrome';
  } else if (ua.includes('safari') && !ua.includes('chrome') && !ua.includes('chromium')) {
    browser = 'Safari';
  } else if (ua.includes('edge') || ua.includes('edg/')) {
    browser = 'Edge';
  } else if (ua.includes('opera') || ua.includes('opr/')) {
    browser = 'Opera';
  } else if (ua.includes('msie') || ua.includes('trident/')) {
    browser = 'Internet Explorer';
  }

  // Parse OS
  if (ua.includes('windows nt')) {
    os = 'Windows';
  } else if (ua.includes('macintosh') || ua.includes('mac os x')) {
    os = 'macOS';
  } else if (ua.includes('linux') && !ua.includes('android')) {
    os = 'Linux';
  } else if (ua.includes('android')) {
    os = 'Android';
  } else if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) {
    os = 'iOS';
  }

  // Parse Device
  if (ua.includes('mobi') || ua.includes('android') || ua.includes('iphone') || ua.includes('ipod')) {
    device = 'Mobile';
  } else if (ua.includes('tablet') || ua.includes('ipad') || (ua.includes('android') && !ua.includes('mobi'))) {
    device = 'Tablet';
  }

  return { browser, os, device };
}
