export function isValidSkillChoice(skill) {
    return !!skill && typeof skill === 'object' && typeof skill.id === 'string' && skill.id.length > 0;
}

export function getValidSkillChoices(choices) {
    if (!Array.isArray(choices)) return [];
    return choices.filter(isValidSkillChoice);
}

export function applySkillChoice(state, skill) {
    if (!isValidSkillChoice(skill)) return false;

    if (!state.party) state.party = { activeSkills: [] };
    if (!Array.isArray(state.party.activeSkills)) state.party.activeSkills = [];

    if (typeof skill.effect === 'function') skill.effect(state);
    state.party.activeSkills.push(skill);
    state.pendingSkillChoice = false;
    state.skillChoices = [];
    return true;
}

export function autoPickRandomSkill(state, choices = state.skillChoices) {
    const validChoices = getValidSkillChoices(choices);
    if (validChoices.length === 0) {
        state.pendingSkillChoice = false;
        state.skillChoices = [];
        return false;
    }

    const randomSkill = validChoices[Math.floor(Math.random() * validChoices.length)];
    return applySkillChoice(state, randomSkill);
}
