/**
 * Test de Normalisation des Pays
 * Vérifies que frontend et backend traitent les pays de la même manière
 */

import { normalizeCountryIsoForHr } from "./utils/country";

const testCases = [
  // Codes ISO2 valides
  { input: "TN", expected: "TN", description: "Code ISO2: Tunisie" },
  { input: "FR", expected: "FR", description: "Code ISO2: France" },
  { input: "MA", expected: "MA", description: "Code ISO2: Maroc" },

  // Casse mixte
  { input: "tn", expected: "TN", description: "Tunisie minuscule" },
  { input: "fr", expected: "FR", description: "France minuscule" },
  { input: "ma", expected: "MA", description: "Maroc minuscule" },
  { input: "Tn", expected: "TN", description: "Tunisie casse mixte" },

  // Noms complets
  { input: "Tunisie", expected: "TN", description: "Tunisie en français" },
  { input: "TUNISIA", expected: "TN", description: "Tunisia en anglais" },
  { input: "Tunisia", expected: "TN", description: "Tunisia casse mixte" },

  { input: "France", expected: "FR", description: "France en français" },
  { input: "FRANCE", expected: "FR", description: "France majuscule" },
  {
    input: "Français",
    expected: "FR",
    description: "Français (contient FRANC)",
  },

  { input: "Maroc", expected: "MA", description: "Maroc en français" },
  { input: "MAROC", expected: "MA", description: "Maroc majuscule" },
  { input: "Morocco", expected: "MA", description: "Morocco en anglais" },
  { input: "MOROCCO", expected: "MA", description: "MOROCCO majuscule" },

  // Variantes avec espaces
  { input: "  TN  ", expected: "TN", description: "TN avec espaces" },
  { input: "  France  ", expected: "FR", description: "France avec espaces" },
  { input: " Maroc ", expected: "MA", description: "Maroc avec espaces" },

  // Outre-mer français
  { input: "GP", expected: "FR", description: "Guadeloupe → France" },
  { input: "MQ", expected: "FR", description: "Martinique → France" },
  { input: "GF", expected: "FR", description: "Guyane → France" },
  { input: "RE", expected: "FR", description: "Réunion → France" },
  { input: "YT", expected: "FR", description: "Mayotte → France" },
  {
    input: "PM",
    expected: "FR",
    description: "Saint-Pierre-et-Miquelon → France",
  },
  { input: "BL", expected: "FR", description: "Saint-Barthélemy → France" },
  { input: "MF", expected: "FR", description: "Saint-Martin → France" },
  { input: "WF", expected: "FR", description: "Wallis-et-Futuna → France" },
  { input: "PF", expected: "FR", description: "Polynésie française → France" },
  { input: "NC", expected: "FR", description: "Nouvelle-Calédonie → France" },
  {
    input: "TF",
    expected: "FR",
    description: "Terres australes françaises → France",
  },

  // Vides/Nulls → Défaut TN
  { input: "", expected: "TN", description: "Chaîne vide → Défaut TN" },
  {
    input: "   ",
    expected: "TN",
    description: "Espaces seulement → Défaut TN",
  },
  { input: null, expected: "TN", description: "Null → Défaut TN" },
  { input: undefined, expected: "TN", description: "Undefined → Défaut TN" },

  // Codes inconnus → Défaut TN
  { input: "UK", expected: "TN", description: "Royaume-Uni → Défaut TN" },
  { input: "US", expected: "TN", description: "USA → Défaut TN" },
  { input: "DE", expected: "TN", description: "Allemagne → Défaut TN" },
  { input: "ES", expected: "TN", description: "Espagne → Défaut TN" },
  { input: "belgique", expected: "TN", description: "Belgique → Défaut TN" },

  // Cas limites avec FRANC/TUNIS/MAROC
  {
    input: "FRANCAIS",
    expected: "FR",
    description: "Francais → FR (contient FRANC)",
  },
  { input: "FRANCAIS", expected: "FR", description: "FRANCAIS → FR" },
  {
    input: "tunisia123",
    expected: "TN",
    description: "tunisia123 → TN (contient TUNIS)",
  },
  {
    input: "MAROC_OLD",
    expected: "MA",
    description: "MAROC_OLD → MA (contient MAROC)",
  },
];

export function runCountryNormalizationTests() {
  console.group("🧪 Country Normalization Tests");

  let passed = 0;
  let failed = 0;

  testCases.forEach(({ input, expected, description }) => {
    const result = normalizeCountryIsoForHr(input);
    const success = result === expected;

    if (success) {
      passed++;
      console.log(`✅ ${description}`);
      console.log(`   Input: ${JSON.stringify(input)} → Output: "${result}"`);
    } else {
      failed++;
      console.error(`❌ ${description}`);
      console.error(
        `   Input: ${JSON.stringify(input)} → Expected: "${expected}", Got: "${result}"`,
      );
    }
  });

  console.groupEnd();

  const total = testCases.length;
  const percentage = Math.round((passed / total) * 100);
  console.log(
    `\n📊 Résultats: ${passed}/${total} tests réussis (${percentage}%)`,
  );

  if (failed > 0) {
    console.warn(`⚠️  ${failed} test(s) échoué(s)`);
  } else {
    console.log("🎉 Tous les tests sont passés!");
  }

  return { passed, failed, total };
}

// Export pour utilisation en module de test
export { testCases };
