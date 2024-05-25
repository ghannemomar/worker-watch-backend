export function tempCelcus() {
  const min = 36.99;
  const max = 37.99;
  const randomTemp = (Math.random() * (max - min) + min).toFixed(2);
  return parseFloat(randomTemp);
}
