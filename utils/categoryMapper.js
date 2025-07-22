// Mappa delle sottocategorie alle macro-categorie
const categoryMapping = {
  // Artisti e Performer
  'DJ': 'Artisti e Performer',
  'Cantante': 'Artisti e Performer', 
  'Musicista': 'Artisti e Performer',
  'Attore': 'Artisti e Performer',
  'Danzatore': 'Artisti e Performer',
  'Comico': 'Artisti e Performer',
  'Mago': 'Artisti e Performer',
  
  // Ballo e Spettacolo
  'Ballerino': 'Ballo e Spettacolo',
  'Coreografo': 'Ballo e Spettacolo',
  'Acrobata': 'Ballo e Spettacolo',
  
  // Hospitality e Beverage
  'Barman': 'Hospitality e Beverage',
  'Cameriere': 'Hospitality e Beverage',
  'Hostess': 'Hospitality e Beverage',
  
  // Ristorazione
  'Chef': 'Ristorazione',
  'Pizzaiolo': 'Ristorazione',
  'Pasticcere': 'Ristorazione',
  
  // Tecnicə e Supporto Artistico
  'Tecnico Audio': 'Tecnicə e Supporto Artistico',
  'Tecnico Luci': 'Tecnicə e Supporto Artistico',
  'Fotografo': 'Tecnicə e Supporto Artistico',
  'Videomaker': 'Tecnicə e Supporto Artistico',
  
  // Sicurezza e Logistica
  'Guardia': 'Sicurezza e Logistica',
  'Steward': 'Sicurezza e Logistica',
  'Logistica': 'Sicurezza e Logistica',
  
  // Organizzatorə e Figure Creative
  'Event Planner': 'Organizzatorə e Figure Creative',
  'Decoratore': 'Organizzatorə e Figure Creative',
  'Makeup Artist': 'Organizzatorə e Figure Creative'
};

// Funzione per ottenere le macro-categorie associate a una sottocategoria
function getMacroCategories(subCategoryName) {
  const macroCategory = categoryMapping[subCategoryName];
  return macroCategory ? [subCategoryName, macroCategory] : [subCategoryName];
}

// Funzione per ottenere tutte le sottocategorie di una macro-categoria
function getSubCategories(macroCategoryName) {
  return Object.keys(categoryMapping).filter(key => categoryMapping[key] === macroCategoryName);
}

module.exports = {
  categoryMapping,
  getMacroCategories,
  getSubCategories
}; 