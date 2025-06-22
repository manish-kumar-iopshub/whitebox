import { format } from 'date-fns';

// Convert UTC time to Asia/Kolkata timezone
export const convertToKolkataTime = (date) => {
  if (!date) return date;
  
  // If it's already a Date object, convert it
  const utcDate = date instanceof Date ? date : new Date(date);
  
  // Convert to Asia/Kolkata timezone
  return new Date(utcDate.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
};

// Format date in Asia/Kolkata timezone
export const formatDate = (date) => {
  if (!date) return 'N/A';
  
  const kolkataDate = convertToKolkataTime(date);
  return format(kolkataDate, 'MMM dd, yyyy HH:mm:ss');
};

// Format date for datetime-local input (Asia/Kolkata timezone)
export const formatDateForInput = (date) => {
  if (!date) return '';
  
  const kolkataDate = convertToKolkataTime(date);
  return format(kolkataDate, "yyyy-MM-dd'T'HH:mm");
};

// Parse datetime-local input to UTC Date
export const parseDateFromInput = (dateString) => {
  if (!dateString) return new Date();
  
  // Create date in local timezone (Asia/Kolkata)
  const localDate = new Date(dateString);
  
  // Convert to UTC for API calls
  const utcDate = new Date(localDate.getTime() - (localDate.getTimezoneOffset() * 60000));
  return utcDate;
};

// Format duration with timezone awareness
export const formatDuration = (ms) => {
  if (!ms || ms < 0) return '0s';
  
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
};

// Calculate group uptime from individual uptimes
export const calculateGroupUptime = (uptimes) => {
  if (!uptimes || uptimes.length === 0) return 0;
  
  const validUptimes = uptimes.filter(uptime => uptime !== null && uptime !== undefined);
  if (validUptimes.length === 0) return 0;
  
  const sum = validUptimes.reduce((acc, uptime) => acc + uptime, 0);
  return sum / validUptimes.length;
};

// Extract primary domain from a full domain (remove paths, queries, slashes)
export const getPrimaryDomain = (domain) => {
  if (!domain) return '';
  
  // Remove protocol if present
  let cleanDomain = domain.replace(/^https?:\/\//, '');
  
  // Remove paths, queries, and everything after the first slash
  cleanDomain = cleanDomain.split('/')[0];
  
  // Remove port if present
  cleanDomain = cleanDomain.split(':')[0];
  
  // Remove query parameters
  cleanDomain = cleanDomain.split('?')[0];
  
  // Remove hash fragments
  cleanDomain = cleanDomain.split('#')[0];
  
  return cleanDomain;
};

// Extract root domain from a full domain
export const getRootDomain = (domain) => {
  const primaryDomain = getPrimaryDomain(domain);
  if (!primaryDomain) return '';
  
  const parts = primaryDomain.split('.');
  if (parts.length <= 2) return primaryDomain;
  
  return parts.slice(-2).join('.');
};

// Group domains by root domain
export const groupDomainsByRoot = (domains) => {
  const groups = {};
  
  domains.forEach(domain => {
    const rootDomain = getRootDomain(domain);
    if (!groups[rootDomain]) {
      groups[rootDomain] = [];
    }
    // Only add if not already present (avoid duplicates)
    if (!groups[rootDomain].includes(domain)) {
      groups[rootDomain].push(domain);
    }
  });
  
  return groups;
};

// Create custom domain groups
export const createCustomGroups = (domains, customGroups) => {
  const result = {};
  
  // Add custom groups
  customGroups.forEach(group => {
    result[group.name] = group.domains;
  });
  
  // Add remaining domains to their root groups
  const groupedDomains = groupDomainsByRoot(domains);
  const usedDomains = new Set();
  
  customGroups.forEach(group => {
    group.domains.forEach(domain => usedDomains.add(domain));
  });
  
  Object.entries(groupedDomains).forEach(([rootDomain, domainList]) => {
    const unusedDomains = domainList.filter(domain => !usedDomains.has(domain));
    if (unusedDomains.length > 0) {
      result[rootDomain] = unusedDomains;
    }
  });
  
  return result;
};

// Save custom groups to localStorage
export const saveCustomGroups = (customGroups) => {
  try {
    localStorage.setItem('blackbox_custom_groups', JSON.stringify(customGroups));
  } catch (error) {
    console.error('Error saving custom groups:', error);
  }
};

// Load custom groups from localStorage
export const loadCustomGroups = () => {
  try {
    const saved = localStorage.getItem('blackbox_custom_groups');
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Error loading custom groups:', error);
    return [];
  }
};

// Validate domain format
export const isValidDomain = (domain) => {
  const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return domainRegex.test(domain);
};

// Time range presets
export const TIME_RANGE_PRESETS = [
  { label: 'Last 1 Hour', value: '1h', hours: 1 },
  { label: 'Last 6 Hours', value: '6h', hours: 6 },
  { label: 'Last 12 Hours', value: '12h', hours: 12 },
  { label: 'Last 2 Days', value: '2d', hours: 48 },
  { label: 'Last 7 Days', value: '7d', hours: 168 },
  { label: 'Last 4 Weeks', value: '4w', hours: 672 },
  { label: 'Last 3 Months', value: '3m', hours: 2160 }
];

// Get time range from preset
export const getTimeRangeFromPreset = (preset) => {
  const now = new Date();
  const start = new Date(now.getTime() - (preset.hours * 60 * 60 * 1000));
  return { start, end: now };
};

// Find which group a target belongs to
export const findTargetGroup = (target, domainGroups) => {
  if (!domainGroups || !target) return null;
  
  for (const [groupName, domains] of Object.entries(domainGroups)) {
    if (domains.includes(target)) {
      return groupName;
    }
  }
  
  return null;
}; 