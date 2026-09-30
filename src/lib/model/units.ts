export const KG_PER_LB = 0.45359237
export const LBS_PER_US_GALLON_WATER = 8.34
export const LITRES_PER_US_GALLON = 3.785411784

export const lbsToKg = (lbs: number): number => lbs * KG_PER_LB
export const kgToLbs = (kg: number): number => kg / KG_PER_LB

export const gallonsToLbs = (gal: number): number => gal * LBS_PER_US_GALLON_WATER
export const lbsToGallons = (lbs: number): number => lbs / LBS_PER_US_GALLON_WATER

/** Water is 1 kg per litre. */
export const litresToLbs = (litres: number): number => kgToLbs(litres)
export const lbsToLitres = (lbs: number): number => lbsToKg(lbs)

/** Round for display only. Never feed the result back into the model. */
export const roundForDisplay = (value: number): number => Math.round(value)
