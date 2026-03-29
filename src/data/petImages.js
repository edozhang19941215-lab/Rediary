/**
 * Returns the public URL for a pet image given petId and state.
 * Images live in:  public/pets/{petId}/{state}.png
 *
 * Valid states: 'welcome' | 'typing' | 'talking' | 'happy' | 'goodbye' | 'playing'
 */
const VALID_STATES = ['welcome', 'typing', 'talking', 'happy', 'goodbye', 'playing'];

export function getPetImage(petId, state) {
  const s = VALID_STATES.includes(state) ? state : 'talking';
  return `/pets/${petId}/${s}.png`;
}
