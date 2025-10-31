const devicePxPerCm = (): number => {
  const CSS_PX_PER_INCH = 96;
  const CSS_PX_PER_CM = CSS_PX_PER_INCH / 2.54;
  const dpr = window.devicePixelRatio || 1;
  return CSS_PX_PER_CM * dpr;
};

export default devicePxPerCm;
