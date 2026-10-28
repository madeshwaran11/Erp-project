export function chooseAnimation(names, requested) {
  if (requested && names.includes(requested)) return requested;
  return names.find((name) => /idle|breathing|standing/i.test(name)) || null;
}
export function permittedModules(cards, navigation) {
  const allowed = new Set(navigation.map((item) => item.id));
  return cards.filter((card) => allowed.has(card.id));
}
