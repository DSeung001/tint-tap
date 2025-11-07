function randomChannel() {
  return Math.floor(Math.random() * 256);
}

function luminance({ r, g, b }) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function randomBaseColor(colorConfig) {
  const [minLuma, maxLuma] = colorConfig.baseLumaClamp;
  let candidate = { r: randomChannel(), g: randomChannel(), b: randomChannel() };
  for (let i = 0; i < 40; i += 1) {
    candidate = { r: randomChannel(), g: randomChannel(), b: randomChannel() };
    const luma = luminance(candidate);
    if (luma >= minLuma && luma <= maxLuma) {
      break;
    }
    if (i === 39) {
      const factor = clamp((minLuma + maxLuma) / 2 / 128, 0.5, 1.5);
      candidate = {
        r: clamp(candidate.r * factor, 0, 255),
        g: clamp(candidate.g * factor, 0, 255),
        b: clamp(candidate.b * factor, 0, 255)
      };
    }
  }
  return candidate;
}

export function oddColorFrom(baseColor, delta, colorConfig) {
  const channels = ['r', 'g', 'b'];
  let chosenChannels = channels;
  if (Array.isArray(colorConfig.channelsToVary)) {
    chosenChannels = colorConfig.channelsToVary;
  }

  // 채널을 랜덤하게 섞기
  const shuffledChannels = [...chosenChannels].sort(() => Math.random() - 0.5);
  
  // 70:20:10 비율로 delta 분배
  const ratios = [0.7, 0.2, 0.1];
  const result = { ...baseColor };
  
  for (let i = 0; i < Math.min(shuffledChannels.length, 3); i++) {
    const channelKey = shuffledChannels[i];
    const channelDelta = delta * ratios[i];
    
    // 각 채널의 방향을 랜덤하게 결정
    const direction = Math.random() < 0.5 ? 1 : -1;
    let value = baseColor[channelKey] + direction * channelDelta;
    
    // 범위를 벗어나면 반대 방향으로 시도
    if (value < 0 || value > 255) {
      value = baseColor[channelKey] - direction * channelDelta;
    }
    
    result[channelKey] = clamp(value, 0, 255);
  }
  
  return result;
}

export function toCssColor({ r, g, b }) {
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}
