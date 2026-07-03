import { state } from './gameState.js';
import { getDisplayedGold, formatGold } from './utils.js';

let uiLayer;

export function initUI() {
    uiLayer = document.getElementById('ui-layer');
    if (!uiLayer) return;
    
    // Bind buttons
    document.getElementById('btn-enter-battle').addEventListener('click', () => { window.dispatchEvent(new CustomEvent('ui-action', { detail: 'enter-battle' })); });
    document.getElementById('btn-upgrades').addEventListener('click', () => { window.dispatchEvent(new CustomEvent('ui-action', { detail: 'hero-upgrades' })); });
    document.getElementById('btn-gear').addEventListener('click', () => { window.dispatchEvent(new CustomEvent('ui-action', { detail: 'gear' })); });
    document.getElementById('btn-shop').addEventListener('click', () => { window.dispatchEvent(new CustomEvent('ui-action', { detail: 'shop' })); });
    document.getElementById('btn-achievements').addEventListener('click', () => { window.dispatchEvent(new CustomEvent('ui-action', { detail: 'achievements' })); });
    document.getElementById('btn-retreat').addEventListener('click', () => { window.dispatchEvent(new CustomEvent('ui-action', { detail: 'retreat' })); });
    document.getElementById('auto-skills-btn').addEventListener('click', () => { window.dispatchEvent(new CustomEvent('ui-action', { detail: 'auto-skills' })); });
    

    // Initialize snow particles
    const snowContainer = document.getElementById('snow-container');
    if (snowContainer) {
        for (let i = 0; i < 40; i++) {
            const particle = document.createElement('div');
            particle.className = 'snow-particle';
            const size = Math.random() * 4 + 1;
            const left = Math.random() * 100;
            const duration = Math.random() * 5 + 5;
            const delay = Math.random() * 5;
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            particle.style.left = left + '%';
            particle.style.animationDuration = duration + 's';
            particle.style.animationDelay = -delay + 's';
            particle.style.opacity = Math.random() * 0.5 + 0.2;
            snowContainer.appendChild(particle);
        }
    }
}

function formatStatNumber(value, decimals = 1) {
    if (!Number.isFinite(value)) return '0';
    if (Math.abs(value) >= 100) return Math.round(value).toString();
    return value.toFixed(decimals).replace(/\.0$/, '');
}

function getPartyDps(state) {
    return (state.heroes || []).reduce((total, hero) => {
        if (!hero || hero.dead) return total;
        return total + (hero.atk || 0) * (hero.atkSpeed || 0);
    }, 0);
}
function getGoldPerMinute(state) {
    if (!state.runStartedAt) return 0;
    const elapsedMinutes = Math.max((Date.now() - state.runStartedAt) / 60000, 1 / 60);
    return (state.sessionGold || 0) / elapsedMinutes;
}

function setSafeText(id, text) {
    const el = document.getElementById(id);
    if (el && el.textContent !== String(text)) el.textContent = text;
}

export function updateDOMUI() {
    if (!uiLayer) return;
    
    const mainMenu = document.getElementById('main-menu-section');
    const battleScreen = document.getElementById('battle-screen-section');
    
    const isModalOpen = state.shopOpen || state.heroUpgradeOpen || state.gearOpen || state.achievementsOpen || state.screen === 'levelSelect';
    
    if (state.screen === 'title') {
        const titleDisp = isModalOpen ? 'none' : 'flex';
        if (mainMenu.style.display !== titleDisp) mainMenu.style.display = titleDisp;
        if (battleScreen.style.display !== 'none') battleScreen.style.display = 'none';
        
        setSafeText('mm-gold', formatGold(getDisplayedGold(state)));
    } else if (state.screen === 'combat') {
        if (mainMenu.style.display !== 'none') mainMenu.style.display = 'none';
        if (battleScreen.style.display !== 'block') battleScreen.style.display = 'block';
        
        setSafeText('bs-wave', Math.min((state.currentWave || 0) + 1, 20));
        setSafeText('bs-party-level', state.party ? state.party.level : 1);
        setSafeText('bs-gold', formatGold(getDisplayedGold(state)));
        
        setSafeText('stat-dps', formatStatNumber(getPartyDps(state)));
        setSafeText('stat-gold-earned', formatGold(state.sessionGold || 0));
        setSafeText('stat-gold-min', formatStatNumber(getGoldPerMinute(state)) + '/M');
        setSafeText('stat-progress', 'LV ' + ((state.currentLevel || 0) + 1) + ' • WAVE ' + Math.min((state.currentWave || 0) + 1, 20) + '/20');
        
        setSafeText('auto-skills-btn', state.autoSkills ? 'AUTO SKILLS: ON' : 'AUTO SKILLS: OFF');
    } else {
        if (mainMenu.style.display !== 'none') mainMenu.style.display = 'none';
        if (battleScreen.style.display !== 'none') battleScreen.style.display = 'none';
    }
}
