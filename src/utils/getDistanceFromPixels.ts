import devicePxPerCm from "./devicePxPerCm";

export const getLengthFromPixels = (pixelLength: number, scale: number) => {
  const cmLength = (pixelLength / devicePxPerCm()) * scale;
  if (cmLength < 100) {
    return `${cmLength.toLocaleString("pt-BR", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })} cm`;
  } else {
    return `${(cmLength / 100).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} m`;
  }
};

export const getAreaFromPixels = (pixelArea: number, scale: number) => {
  const pxPerCm = devicePxPerCm();
  const pxPerCmSquared = Math.pow(pxPerCm, 2);
  const cmArea = (pixelArea / pxPerCmSquared) * Math.pow(scale, 2);
  if (cmArea < 10000) {
    return `${cmArea.toLocaleString("pt-BR", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })} cm²`;
  } else {
    const meterArea = cmArea / 10000;
    return `${meterArea.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} m²`;
  }
};
