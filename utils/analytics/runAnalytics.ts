import { readingsByDifficulty } from "./readingsByDifficulty";
import { readingsPerPerson } from "./readingsPerPerson";
import { top10UsersByReadings } from "./top10Users";

export const FROM_DATE = new Date('2024-07-12T00:00:00Z'); // 12th July 2024

export function runAnalytics() {
  readingsByDifficulty()
  readingsPerPerson()
  top10UsersByReadings()
}
