let cachedConfig = null;

export async function loadConfig() {
  if (cachedConfig) {
    return cachedConfig;
  }

  const response = await fetch('./config.json');
  if (!response.ok) {
    throw new Error('설정 파일(config.json)을 불러오지 못했습니다.');
  }
  cachedConfig = await response.json();
  return cachedConfig;
}

export function linearInterpolate(start, end, t) {
  return start + (end - start) * t;
}
