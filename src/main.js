import { loadConfig } from './config.js';
import { TintTapGame } from './game.js';

async function bootstrap() {
  try {
    const config = await loadConfig();
    const game = new TintTapGame(config);
    game.init();
  } catch (error) {
    const messageEl = document.getElementById('message');
    if (messageEl) {
      messageEl.textContent = String(error);
    }
    console.error(error);
  }
}

document.addEventListener('DOMContentLoaded', bootstrap);
